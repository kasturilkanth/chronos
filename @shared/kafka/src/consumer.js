const kafka = require('./client');

const createConsumer = (groupId) => {
  return kafka.consumer({ groupId });
};

module.exports = {
  createConsumer,
};