const amqplib = require("amqplib");
const { RABBITMQ_URL, EXCHANGE_NAME } = require("../../config");

class Broker {
  static #channel;
  static #exchange;

  /**
   * Connect to RabbitMQ
   * @returns {Promise} - A promise that resolves to a RabbitMQ channel
   * @throws {Error} - If RabbitMQ connection fails
   */
  static async connect() {
    try {
      if (this.#channel) return this.#channel;
      const connection = await amqplib.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
      this.#channel = channel;
      console.log("Connected to RabbitMQ");
      return channel;
    } catch (err) {
      console.log("Failed to connect to RabbitMQ");
    }
  }

  /**
   * Create a RabbitMQ exchange and channel
   * @returns {Promise} - A promise that resolves to a RabbitMQ exchange
   * @throws {Error} - If RabbitMQ queue creation fails
   */
  static async channel() {
    try {
      if (this.#exchange) return this.#exchange;
      const channel = await this.connect();
      await channel.assertExchange(EXCHANGE_NAME, "direct", { durable: true });
      this.#exchange = channel;
      console.log("Created RabbitMQ exchange");
      return channel;
    } catch (err) {
      console.log("Failed to create RabbitMQ channel");
    }
  }
}

module.exports = Broker;
