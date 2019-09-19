const path = require('path');
const rules = require('./webpack.rules');

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
      styles: path.resolve(__dirname, './src/styles'),
      components: path.resolve(__dirname, './src/components'),
      store: path.resolve(__dirname, './src/store'),
    },
  },
  module: {
    rules,
  },
};
