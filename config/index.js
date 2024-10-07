const dotEnv = require("dotenv");
const { EVENT_TYPES, RPC_TYPES } = require("./types");

if (process.env.NODE_ENV !== "production") {
  const configFile = `./.env.${process.env.NODE_ENV}`;
  dotEnv.config({ path: configFile });
} else {
  dotEnv.config();
}

module.exports = {
  PORT: process.env.PORT || 8000,
  APP_SECRET: process.env.APP_SECRET,
  PGUSER: process.env.PGUSER,
  PGPASSWORD: process.env.PGPASSWORD,
  PGHOST: process.env.PGHOST,
  PGPORT: process.env.PGPORT,
  PGDATABASE: process.env.PGDATABASE,
  RABBITMQ_URL: process.env.RABBITMQ_URL,
  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  SERVICE_NAME: process.env.SERVICE_NAME,
  SERVICE_QUEUE: process.env.SERVICE_QUEUE,
  RPC_QUEUE: process.env.RPC_QUEUE,
  TEST_QUEUE: process.env.TEST_QUEUE,
  TEST_RPC: process.env.TEST_RPC,
  EVENT_TYPES,
  RPC_TYPES,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,


  AWS_ACCESS_KEY_ID:process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY:process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION:process.env.AWS_REGION,
  AWS_S3_BUCKET_NAME:process.env.AWS_S3_BUCKET_NAME,
  GOOGLE_CLIENT_ID:process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET:process.env.GOOGLE_CLIENT_SECRET,
  SIGNED_URL_EXPIRATION:process.env.SIGNED_URL_EXPIRATION

};
