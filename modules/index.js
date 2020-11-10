import { merge } from 'lodash';
import { makeExecutableSchema } from 'apollo-server-lambda';
import * as base from './base';
import * as user from './user';
import * as post from './post';

const modules = [
  base,
  user,
  post,
];

export default makeExecutableSchema({
  typeDefs: modules.map(module => module.typeDefs),
  resolvers: merge(...modules.map(module => module.resolvers)),
})
