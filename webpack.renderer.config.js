const rules = require('./webpack.rules');

module.exports = {
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      'react-dom': '@hot-loader/react-dom',
    },
  },
  module: {
    rules,
  },
};
