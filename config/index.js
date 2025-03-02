const dotEnv = require("dotenv")
const { EVENT_TYPES, RPC_TYPES } = require("./types")

dotEnv.config()

module.exports = {
  PORT: process.env.PORT || 8000,
  APP_SECRET: process.env.APP_SECRET,

  POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  DATABASE_URL:
    process.env.DATABASE_URL ||
    `postgresql://${process.env.POSTGRES_USERNAME}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}`,
  DATABASE_NAME: process.env.DATABASE_NAME || process.env.USER_SERVICE_DB,
  MY_APP_FRONTEND_URL:process.env.MY_APP_FRONTEND_URL,
  RABBITMQ_USERNAME: process.env.RABBITMQ_USERNAME,
  RABBITMQ_PASSWORD: process.env.RABBITMQ_PASSWORD,
  RABBITMQ_HOST: process.env.RABBITMQ_HOST,
  RABBITMQ_PORT: process.env.RABBITMQ_PORT,
  RABBITMQ_URL:
    process.env.RABBITMQ_URL ||
    `amqp://${process.env.RABBITMQ_USERNAME}:${process.env.RABBITMQ_PASSWORD}@${process.env.RABBITMQ_HOST}:${process.env.RABBITMQ_PORT}`,

  EXCHANGE_NAME: process.env.EXCHANGE_NAME,
  SERVICE_NAME: process.env.SERVICE_NAME || "USER_SERVICE",
  SERVICE_QUEUE: process.env.SERVICE_QUEUE || process.env.USER_QUEUE,
  RPC_QUEUE: process.env.RPC_QUEUE || process.env.USER_RPC,

  INTERVIEW_QUEUE: process.env.INTERVIEW_QUEUE,
  INTERVIEW_RPC: process.env.INTERVIEW_RPC,

  PAYMENT_QUEUE: process.env.PAYMENT_QUEUE,
  PAYMENT_RPC: process.env.PAYMENT_RPC,
  EVENT_TYPES,
  RPC_TYPES,
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,

  AWS_ACCESS_KEY_ID:
    process.env.AWS_ACCESS_KEY_ID || process.env.USER_SERVICE_AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY:
    process.env.AWS_SECRET_ACCESS_KEY ||
    process.env.USER_SERVICE_AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || process.env.USER_SERVICE_AWS_REGION,
  AWS_S3_BUCKET_NAME:
    process.env.AWS_S3_BUCKET_NAME ||
    process.env.USER_SERVICE_AWS_S3_BUCKET_NAME,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  SIGNED_URL_EXPIRATION: process.env.SIGNED_URL_EXPIRATION,
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: process.env.SMTP_PORT,
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASSWORD: process.env.SMTP_PASSWORD,
  STUDENT_COUPON_CODE: process.env.STUDENT_COUPON_CODE,
  RECRUITER_COUPON_CODE: process.env.RECRUITER_COUPON_CODE,
}
