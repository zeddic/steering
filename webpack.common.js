const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: ["./src/index.ts"],
  output: {
    path: path.resolve(__dirname, "./dist"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].chunk.js"
  },
  resolve: {
    extensions: [".ts",  ".js"]
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        include: path.join(__dirname, "/src"),
        loader: "ts-loader"
      }
    ]
  },
  optimization: {
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: 'all',
        }
      }
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: "src/index.html"
    }),
    new CopyWebpackPlugin([
      { from: 'src/assets', to: 'assets' },
      { from: 'src/app.css', to: './app.css' },
    ])
  ]
};
