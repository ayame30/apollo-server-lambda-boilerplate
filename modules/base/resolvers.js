import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date';
import { ApolloError, ForbiddenError } from 'apollo-server-lambda';
import { v4 as uuidv4 } from 'uuid';
import mime from 'mime-types';
import s3 from '~/services/s3';
import * as Sentry from '@sentry/node';
import _ from 'lodash';

export default {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,

  Node: {
    __resolveType() {
      return null;
    }
  },
  Deletable: {
    __resolveType() {
      return null;
    }
  },
  NodeEdge: {
    __resolveType() {
      return null;
    }
  },
  Mutation: {
    requestPresignedUploadUrl: async (_, { input: { filename, isPrivate } }, { user }) => {
      if (!user) throw new ForbiddenError('Permission denied');
      const filetype = mime.lookup(filename);
      const key = !isPrivate ? `uploads/${uuidv4()}-${filename}` : `private_uploads/${uuidv4()}-${filename}`;
      const preSignedUrl = await s3.getPresignedUrl({
        Key: key,
        ContentType: filetype,
        Expires: 100,
      });
      return {
        url: preSignedUrl,
        path: key,
        filetype,
        destination: preSignedUrl.split('?').shift(),
      };
    },
    singleUpload: async (_, { file }, { user }) => {
      if (!user) throw new ForbiddenError('Permission denied');
      try {
        const { filename, mimetype, createReadStream } = await file;

        const data = await s3.upload({
          Key: `uploads/${(new Date).getTime()}-${filename}`,
          Body: createReadStream(),
          ContentType: mimetype,
          CacheControl: "max-age=86400"
        });

        return { url: data.Location };
      } catch (ex) {
        Sentry.captureException(ex);
        throw new ApolloError('Upload file error', ex.message);
      }
    }
  }
};
