import { AuthenticationError, ForbiddenError, ApolloError } from 'apollo-server-lambda';
import applyConnectionArgs from '~/utils/applyConnectionArgs';
import sendMail from '~/utils/sendMail';
import { resolvers as postResolvers } from '~/modules/post';
import { Op } from 'sequelize';

export default {
  User: {
    name: (node) => `${node.firstName} ${node.lastName}`,
    posts: async (node, { connectionArgs }, context) => {
      return postResolvers.Query.posts(node, { userId: node.id, connectionArgs }, context);
    },
  },
  Query: {
    me: (_, __, { user }) => user,
    users: async (_, { connectionArgs, keyword }, { models, user }) => {
      if (!user || !user.isAdmin()) throw new ForbiddenError('Permission denied');
      return applyConnectionArgs(connectionArgs, models.User, {
        where: {
          type: ['CLIENT'],
          ...keyword && {
            [Op.or]: {
              'firstName': { [Op.iLike]: `%${keyword}%` },
              'lastName': { [Op.iLike]: `%${keyword}%` },
              'email': { [Op.iLike]: `%${keyword}%` },
            }
          }
        },
      }, 'id', 'ASC');
    },
    user: async (_, { id }, { models, user }) => {
      if (!user || !await user.isPermitReadUser(id)) throw new ForbiddenError('Permission denied');
      return models.User.findByPk(id);
    },
  },
  Mutation: {
    signin: async (_, { input }, { models }) => {
      const user = await models.User.login(input);
      if (!user) throw new AuthenticationError('Incorrect email or password');
      const token = await models.Session.createToken(user.id);
      return { user, token };
    },
    signup: async (_, { input }, { models }) => {
      const user = await models.User.create(input);
      const token = await models.Session.createToken(user.id);
      return { user, token };
    },
    forgotPassword: async (_, { input }, { models }) => {
      const user = await models.User.findOne({ where: { email: input.email } });
      if (!user) throw new ApolloError('The email does not registered');
      const token = await user.createResetToken();
      await sendMail({
        to: user.email, // list of receivers
        subject: 'Reset password request', // Subject line
        html: `Here’s your password reset code: ${token}`, // html body
      });
      return true;
    },
    resetPassword: async (_, { input }, { models }) => {
      const user = await models.User.findOne({ where: { email: input.email, resetToken: input.token, resetExpiredAt: { $gte: new Date()}} });
      if (!user) throw new ApolloError('Token invalid');
      await user.resetPassword(input.password);
      const token = await models.Session.createToken(user.id);

      return { user, token };
    },
    updateUser: async (_, { input: { id, password, oldPassword, ...input } }, { user, models }) => {
      if (!user || !await user.isPermitToWriteUser(id)) throw new ForbiddenError('Permission denied');

      const record = await models.User.findByPk(id);
      if (!record) throw new ApolloError('User not found');
      await record.set(input).save();
      if (password) {
        if (!oldPassword) throw new ApolloError('Old password required');
        if (!record.validPassword(oldPassword)) throw new ApolloError('Old Password not match');
        await record.resetPassword(password);
      }
      return record;
    },

  }
};
