'use strict';
const bcrypt = require('bcryptjs');
const faker = require('faker');

const passwordHash = (str) => bcrypt.hashSync(str, bcrypt.genSaltSync(8));

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('users', [
      {
        firstName: 'Admin',
        lastName: faker.name.lastName(),
        tel: faker.phone.phoneNumber(),
        email: 'admin@example.com',
        password: passwordHash('admin'),
        type: 'ADMIN',
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      },
      ...new Array(15).fill().map(() => ({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        tel: faker.phone.phoneNumber(),
        email: faker.internet.email(),
        password: passwordHash('client'),
        type: 'CLIENT',
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      })),
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('sessions', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
