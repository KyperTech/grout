'use strict'

var webpack = require('webpack')
var baseConfig = require('./webpack.config.base')

var config = Object.create(baseConfig)
config.plugins = config.plugins.concat([]);

module.exports = config
