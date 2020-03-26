const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssExtractPlugin.loader, 'css-loader'],
            },
            {
                test: /\.ts$/i,
                use: ['babel-loader', 'ts-loader'],
            },
        ],
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new CopyPlugin([
            {
                from: 'src/assets/**/*',
                to: '',
                ignore: ['*.css', '*.html'],
                transformPath(targetPath) {
                    return targetPath.slice(4); // Does it works on other operating systems ?
                },
            },
        ]),
    ],
};
