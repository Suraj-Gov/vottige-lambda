import * as AWS from "aws-sdk";
import { __connsTable, __db_l_stage, __isProd, __stage } from "src/constants";
// import { localConfig } from "src/constants";

// AWS.config.update(localConfig);
const db = new AWS.DynamoDB.DocumentClient();

interface sendMessageParamsI {
  connectionId: string;
  body: string;
}

export const sendMessage = async (
  { connectionId, body }: sendMessageParamsI,
  endpoint: string
) => {
  try {
    const apig = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint,
    });
    await apig
      .postToConnection({
        ConnectionId: connectionId,
        Data: JSON.stringify(body),
      })
      .promise();
  } catch (err) {
    if (err.message === "410") {
      // stale connection, remove from db
      await db
        .delete({ TableName: __connsTable, Key: { connectionId } })
        .promise();
      return;
    }
    console.error("ERROR");
    console.error(err.message);
  }
};

export const getAllConnections = async () => {
  const { Items, LastEvaluatedKey } = await db
    .scan({
      TableName: __connsTable,
      AttributesToGet: ["connectionId"],
    })
    .promise();

  const connections = Items.map(({ connectionId }) => connectionId);
  // dynamodb has a limit of 1mb in retrived docs,
  // if there is any value for LastEvaluatedKey,
  // then it means there are remaining docs to retreive
  if (LastEvaluatedKey) {
    connections.push(...(await getAllConnections()));
  }

  return connections;
};
