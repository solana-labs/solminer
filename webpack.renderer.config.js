const path = require('path');
const rules = require('./webpack.rules');

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
      styles: path.resolve(__dirname, './src/styles'),
    },
  },
  module: {
    rules,
  },
};
