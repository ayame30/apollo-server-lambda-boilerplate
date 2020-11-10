const { join } = require('path');
const path = require('path');

const npmDir = join(__dirname, 'node_modules');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');


module.exports = {
  entry: { graphql: './graphql.js'},
  target: 'node',
  mode: 'development',
  externals: [nodeExternals()],
  module: {
    rules: [
      { test: /\.(graphql|gql)$/, exclude: npmDir, loader: `graphql-tag/loader` } // in case you're using .gql files
    ]
  },
  plugins: [
    new webpack.IgnorePlugin(/^pg-native$/),
  ],
  resolve: {
    alias: {
      '~': path.resolve(__dirname, '.'),
    }
  },
  node: {
    __dirname: false
  }
}
