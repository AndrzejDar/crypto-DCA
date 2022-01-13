
const path = require("path");
const entryPath = "./";


module.exports = {
  entry: `./${entryPath}/dist/src/index.js`,
  output: {
    filename: "js/main.js",
    path: path.resolve(__dirname, `${entryPath}/build`),
    publicPath:'/assets/'
  },
  devServer: {
    contentBase: path.join(__dirname, `${entryPath}/dist`),
    publicPath: "/assets/",
    compress: true,
    port: 3001,
    hot: true,
    watchContentBase: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "babel-loader"
      }
    ]
  },  
};