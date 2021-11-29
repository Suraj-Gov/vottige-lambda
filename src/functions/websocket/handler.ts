import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import * as AWS from "aws-sdk";
import { getAllConnections, sendMessage } from "./broadcast";
import { __connsTable, __isProd } from "src/constants";
import schema from "./schema";

// AWS.config.update(localConfig);
const db = new AWS.DynamoDB.DocumentClient();

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  const {
    body,
    requestContext: { connectionId, routeKey, domainName, stage },
  } = event;
  console.log({ body, connectionId, routeKey });
  const apiGEndpoint = domainName + "/" + stage;

  switch (routeKey) {
    case "$connect":
      await db
        .put({
          TableName: __connsTable,
          Item: {
            connectionId,
            ttl: Date.now() / 1000 + 3600, // expire in 1hour
          },
        })
        .promise();
      return formatJSONResponse({ statusCode: 200 });

    case "$disconnect":
      await db
        .delete({
          TableName: __connsTable,
          Key: { connectionId },
        })
        .promise();
      break;

    case "$default":
      const connections = await getAllConnections();
      const senderConnectionIdIdx = connections.indexOf(connectionId);
      const emitToIds = (() => {
        const temp = [...connections];
        temp.splice(senderConnectionIdIdx, 1);
        return temp;
      })();
      await Promise.allSettled(
        emitToIds.map((connectionId) =>
          sendMessage({ body, connectionId }, apiGEndpoint)
        )
      );
      break;
  }

  return formatJSONResponse({ statusCode: 200 });
};

export const wsHandler = middyfy(handler);
