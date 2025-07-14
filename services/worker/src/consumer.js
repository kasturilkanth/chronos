const { createConsumer } = require('@shared/kafka/src/consumer');
const kafkaConstants = require('@shared/kafka/src/constants');

const consumer = createConsumer(kafkaConstants.groups.worker);

module.exports = consumer;