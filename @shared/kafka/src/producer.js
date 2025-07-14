const kafka = require('./client');
const producer = kafka.producer();

const connectProducer = async () => {
  await producer.connect();
};

const sendMessage = async ({ topic, messages }) => {
  await producer.send({ topic, messages });
};

module.exports = {
  connectProducer,
  sendMessage,
};