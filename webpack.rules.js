module.exports = [
  {
    test: /\.node$/,
    use: 'node-loader',
  },
  {
    test: /\.(m?js|node)$/,
    exclude: /(.webpack|node_modules)/,
    parser: {amd: false},
    use: {
      loader: '@marshallofsound/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.(j|t)sx?$/,
    exclude: /(node_modules|.webpack)/,
    loaders: [
      {
        loader: 'babel-loader',
      },
    ],
  },
  {
    test: /\.(sc|c)ss$/,
    exclude: /\.module\.(sc|c)ss$/i,
    use: ['style-loader', 'css-loader', 'sass-loader'],
  },
  {
    test: /\.module\.(sc|c)ss$/i,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          importLoaders: 1,
          modules: {
            localIdentName: '[local]___[hash:base64:5]',
          },
        },
      },
    ],
  },
  {
    test: /\.svg$/,
    use: ['@svgr/webpack'],
  },
  {
    test: /\.(png|jpg|gif)$/,
    use: ['file-loader'],
  },
];
