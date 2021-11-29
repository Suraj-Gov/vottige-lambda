import type { AWS } from "@serverless/typescript";
import policy from "./policy/v1.json";

import dynamodbTables from "@resources/dynamodb-tables";
import { hello, wsHandler } from "@functions/index";

const serverlessConfiguration: AWS = {
  service: "lambda",
  frameworkVersion: "2",
  resources: {
    Resources: dynamodbTables,
  },
  custom: {
    region: "${opt:region, self:provider.region}",
    stage: "${opt:stage, self:provider.stage}",
    connections_table:
      "${self:service}-connections-table-${opt:stage, self:provider.stage}",
    table_throughputs: {
      prod: 5,
      default: 1,
    },
    table_throughput:
      "${self:custom.TABLE_THROUGHPUTS.${self:custom.stage}, self:custom.table_throughputs.default}",
    dynamodb: {
      stages: ["dev"],
      start: {
        port: 8008,
        inMemory: false,
        heapInitial: "200m",
        heapMax: "1g",
        migrate: true,
        seed: true,
        convertEmptyValues: true,
        // Comment only if you already have a DynamoDB running locally
        // noStart: true,
      },
    },
    ["serverless-offline"]: {
      httpPort: 3000,
      babelOptions: {
        presets: ["env"],
      },
    },
    esbuild: {
      bundle: true,
      minify: false,
      sourcemap: true,
      exclude: ["aws-sdk"],
      target: "node14",
      define: { "require.resolve": undefined },
      platform: "node",
    },
  },
  plugins: [
    "serverless-esbuild",
    "serverless-offline",
    "serverless-dotenv-plugin",
    "serverless-dynamodb-local",
  ],
  package: {
    individually: true,
  },
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "dev",
    region: "ap-south-1",
    iamRoleStatements: policy.Statement,
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
      REGION: "${self:custom.region}",
      STAGE: "${self:custom.stage}",
      CONNECTIONS_TABLE: "${self:custom.connections_table}",
    },
    lambdaHashingVersion: "20201221",
  },
  // import the function via paths
  functions: { hello, wsHandler },
};

module.exports = serverlessConfiguration;
