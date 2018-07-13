const path = require('path');

var plugins = [
];

var exclude = [
  /node_modules/
];

module.exports = {
  entry:{
    "main": "./app/app.entry.ts"
  },
  target: "electron-main",
  output: {
    path: __dirname + '/dist/app',
    filename: '[name].js',
    libraryTarget:"commonjs"
  },
  resolve: {
    extensions: ['.ts','.js','html'],
  },
  module: {
    loaders: [
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        exclude: exclude
      }
    ]
  },
  node: {
    __dirname: false,
    __filename: false
  },
  plugins: plugins,
  devtool: 'inline-source-map'
};