import * as AWS from "aws-sdk";
import {
  __apig_endpoint,
  __connsTable,
  __db_l_stage,
  __isProd,
  __stage,
} from "src/constants";
// import { localConfig } from "src/constants";

// AWS.config.update(localConfig);
const db = new AWS.DynamoDB.DocumentClient();

export const sendMessage = async (connectionId: string, body: string) => {
  try {
    const apig = new AWS.ApiGatewayManagementApi({
      apiVersion: "2018-11-29",
      endpoint: __apig_endpoint,
    });
    await apig.postToConnection({
      ConnectionId: connectionId,
      Data: JSON.stringify(body),
    });
  } catch (err) {
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
