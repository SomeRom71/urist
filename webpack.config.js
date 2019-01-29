const webpack = require('webpack');
const config = require('./config.json');

const webpackConfig = {
    entry: "./src/js/page.js",

    output: {
        path: __dirname,
        filename: "bundle.js",
        publicPath: "/assets/js/"
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /(node_modules|bower_components)/,
                options: { presets: ["es2015"] }
            }
        ]
    },

    resolve: {
        modules: ['./src/js', './node_modules']
    },

    devtool: "eval",
};

if (!global.isDev) {
    webpackConfig.devtool = config.prodmaps ? "source-map" : false;
    webpackConfig.plugins = [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: config.prodmaps,
            compress: {
                warnings: false,
                drop_console: false,
                unsafe: true
            }
        })
    ];
}

module.exports = webpackConfig;