import { ApolloError, ForbiddenError } from 'apollo-server-lambda';
import applyConnectionArgs from '~/utils/applyConnectionArgs';
import { Op } from 'sequelize';

export default {
  Post: {
    user: async (node, _, { loaders }) => loaders.users.load(node.userId),
  },
  Query: {
    post: async (_, { id }, { models, user }) => {
      const post = await models.Post.findByPk(id);

      if (!post)
        throw new ApolloError('Post not found');

      if (!user || !await user.isPermitToReadUser(post.userId))
        throw new ForbiddenError('Permission denied');

      return post;
    },
    posts: async (_, { connectionArgs, userId, keyword }, { models, user }) => {
      if (!user || !await user.isPermitToReadUser(userId))
        throw new ForbiddenError('Permission denied');

      return applyConnectionArgs(connectionArgs, models.Post, {
        where: {
          ...userId && { userId },
          ...keyword && { 'title': { [Op.iLike]: `%${keyword}%` } }
        },
      }, 'id', 'DESC');
    },
  },
  Mutation: {
    createPost: async (_, { input }, { models, user }) => {
      if (!user || !await user.isPermitToWriteUser(input.userId))
        throw new ForbiddenError('Permission denied');
      return models.Post.create(input);
    },
    updatePost: async (_, { input: { id, ...updateField } }, { models, user }) => {
      const post = await models.Post.findByPk(id);

      if (!post)
        throw new ApolloError('Post not found');

      if (!user || !await user.isPermitToWriteUser(post.userId))
        throw new ForbiddenError('Permission denied');

      return post.set(updateField).save();
    },
    deletePost: async (_, { input: { id } }, { models, user }) => {
      const post = await models.Post.findByPk(id);

      if (!post)
        throw new ApolloError('Post not found');

      if (!user || !await user.isPermitToWriteUser(post.userId))
        throw new ForbiddenError('Permission denied');

      return post.destroy();
    },
  }
};
