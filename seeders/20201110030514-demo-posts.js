'use strict';
const faker = require('faker');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const [ users ] = await queryInterface.sequelize.query('SELECT * FROM "users"');

    await queryInterface.bulkInsert('posts', [
      ...new Array(100).fill().map(() => ({
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(),
        userId: users[Math.floor(Math.random() * users.length)].id,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      })),
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('posts', null, {});
  }
};
