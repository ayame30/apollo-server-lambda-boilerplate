import { ApolloServer, ApolloError } from 'apollo-server-lambda';
import schema from './modules';
import models from './models';
import createLoaders from './loaders';
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  release: process.env.VERSION ? `apollo-server-lambda-boilerplate@${process.env.VERSION}` : undefined,
  tracesSampleRate: 1.0,
});

const sentryLogger = {
  requestDidStart(requestContext) {
    if (!process.env.SENTRY_DSN) return; // Disable context logging
    return {
      didEncounterErrors(ctx) {
        requestContext.logger.log('Did Encounter Error')
        if (!ctx.operation) {
          return;
        }
        for (const err of ctx.errors) {
          if (err instanceof ApolloError) {
            continue;
          }
          Sentry.withScope(scope => {
            scope.setTag("kind", ctx.operation.operation);
            scope.setExtra("query", ctx.request.query);
            scope.setExtra("variables", ctx.request.variables);
            if (err.path) {
              scope.addBreadcrumb({
                category: "query-path",
                message: err.path.join(" > "),
                level: Sentry.Severity.Debug
              });
            }
            Sentry.captureException(err);
          });
        }
      }
    }
  }
}

const server = new ApolloServer({
  schema,
  context: async ({ event, context }) => {
    let user;
    Sentry.configureScope(scope => scope.clear());
    const auth = event.headers.Authorization || event.headers.authorization;
    if(auth){
      const token =  auth.replace(/^Bearer\s/, '');
      user = await models.Session.getUser(token);
      Sentry.setUser(user);
      if (!user) {
        Sentry.captureException(new ApolloError('Token expired'));
        throw new ApolloError('Token expired');
      }
    }
    return {
      headers: event.headers,
      functionName: context.functionName,
      event,
      context,
      models,
      loaders: createLoaders(models),
      user,
    };
  },
  plugins: [sentryLogger],
  playground: {
    tabs: [
      {
        endpoint: '/dev/graphql',
      },
    ],
  },
});

export const graphqlHandler = server.createHandler({
  cors: {
    origin: '*',
    credentials: true
  }
});
