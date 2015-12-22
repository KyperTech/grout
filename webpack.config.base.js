'use strict'
var fs = require('fs');
var path = require('path');
var webpack = require('webpack');

module.exports = {
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel-loader'], exclude: [/node_modules/] },
      { test: /aws-sdk/, loaders: ["transform?brfs"], exclude:[]},
      { test: /\.json$/, loaders: ['json'], exclude:[]},
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
