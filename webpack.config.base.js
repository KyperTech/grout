'use strict'

var webpack = require('webpack')

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
}

module.exports = {
  externals: {
    'aws-sdk': awsExternal,
    'kyper-matter': matterExternal
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ }
    ]
  },
  output: {
    library: 'Grout',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js']
  }
}
