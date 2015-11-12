'use strict'

var webpack = require('webpack')
var fs = require('fs');
var path = require('path');
var ContextReplacementPlugin = require("webpack/lib/ContextReplacementPlugin");
var awsExternal = {
  root: 'AWS',
  commonjs2: 'aws-sdk',
  commonjs: 'aws-sdk',
  amd: 'aws-sdk'
};
var matterExternal = {
  root: 'Matter',
  commonjs2: 'kyper-matter',
  commonjs: 'kyper-matter',
  amd: 'kyper-matter'
};

module.exports = {
  entry:'./src/index.js',
  externals: [
    awsExternal
  ],
  node: {
    fs: "empty",
    __dirname: true,
    path: true,
    stream: true,
    global: "empty",
  },
  module: {
    exprContextRegExp: /$^/,
    exprContextCritical: true,
    loaders: [
      {
        test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
      {
        test: /aws-sdk/,
        loader: "transform?brfs"
      }
    ]
  },
  resolve: {
    alias: {
      'aws-sdk': path.resolve(__dirname, 'node_modules/aws-sdk/index.js')
    },
    extensions: ['', '.js', '.json']
  },
  plugins: [

  ],
  output: {
    library: 'Grout',
    libraryTarget: 'umd'
  }
}
