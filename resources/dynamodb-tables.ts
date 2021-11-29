export default {
  ConnectionsTable: {
    Type: "AWS::DynamoDB::Table",
    Properties: {
      TableName: "${self:provider.environment.CONNECTIONS_TABLE}",
      AttributeDefinitions: [
        { AttributeName: "connectionId", AttributeType: "S" },
      ],
      KeySchema: [{ AttributeName: "connectionId", KeyType: "HASH" }],
      ProvisionedThroughput: {
        ReadCapacityUnits: "${self:custom.table_throughput}",
        WriteCapacityUnits: "${self:custom.table_throughput}",
      },
      SSESpecification: {
        SSEEnabled: true,
      },
      TimeToLiveSpecification: {
        AttributeName: "ttl",
        Enabled: true,
      },
    },
  },
};
