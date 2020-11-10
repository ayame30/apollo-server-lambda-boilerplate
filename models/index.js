import pg from 'pg';
import Sequelize from 'sequelize';
import _ from 'lodash';
import configFile from '../config/config.json';

import User from './user';
import Post from './post';
import Session from './session';

const env = process.env.NODE_ENV || 'development';
const config = configFile[env];
if (config.dialect === 'postgres') {
  config.dialectModule = pg;
}

let sequelize;

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], {
    ...config,
    operatorsAliases: _.fromPairs(Object.entries(Sequelize.Op).map(([key, value]) => [`$${key}`, value])),
  });
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const models = {
  User: User(sequelize, Sequelize.DataTypes),
  Post: Post(sequelize, Sequelize.DataTypes),
  Session: Session(sequelize, Sequelize.DataTypes),
};

Object.keys(models).forEach(key => {
  if ('associate' in models[key]) {
    models[key].associate(models);
  }
});


export { sequelize };

export default models;
