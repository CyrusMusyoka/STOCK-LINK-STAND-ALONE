const path = require('path');

module.exports = {
  mode: 'production', // Always use production for builds
  entry: './main.js',
  target: 'electron-main',
  devtool: 'source-map',
  output: {
    filename: 'main.bundle.js',
    path: path.resolve(__dirname, 'out')
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: { 
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  node: {
    __dirname: false,
    __filename: false
  },
  externals: {
    // Add any native modules here
  }
};