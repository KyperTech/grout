'use strict'

var webpack = require('webpack')

var awsExternal = {
  root: 'AWS',
  commonjs2: 'aws-sdk',
  commonjs: 'aws-sdk',
  amd: 'aws-sdk'
}

module.exports = {
  externals: {
    'aws-sdk': awsExternal
  },
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: /node_modules/ }
    ]
  },
  output: {
    library: 'Matter',
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['', '.js']
  }
}
