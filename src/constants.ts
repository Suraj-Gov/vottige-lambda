import initConfig from "./config";
export const __isProd = process.env.NODE_ENV === "production";
export const __stage = process.env.STAGE;
export const __db_l_stage = process.env.DYNAMODB_STAGE;
export const __db_l_access_key = process.env.DYNAMODB_ACCESS_KEY_ID;
export const __db_l_secret_access_key = process.env.DYNAMODB_SECRET_ACCESS_KEY;
export const __db_l_endpoint = process.env.DYNAMODB_ENDPOINT;
export const __connsTable = process.env.CONNECTIONS_TABLE;

export const localConfig = {
  ...initConfig,
  accessKeyId: __db_l_access_key,
  secretAccessKey: __db_l_secret_access_key,
  // endpoint: __db_l_endpoint,
};
