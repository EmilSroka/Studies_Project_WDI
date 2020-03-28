const HtmlWebpackPlugin = require('html-webpack-plugin');
const WebpackMerge = require('webpack-merge');

const getConfigByMode = (mode) => require(`./webpack/config.${mode}.js`);

module.exports = ({ mode = 'prod' } = {}) => {
    return WebpackMerge(
        {
            entry: './src/main.ts',
            output: {
                filename: 'game.js',
                path: `${__dirname}/dist`,
            },
            resolve: {
                extensions: ['.ts', '.js'],
            },
            module: {
                rules: [
                    {
                        test: /\.(png|jpe?g)$/i,
                        use: ['file-loader'],
                    },
                ],
            },
            plugins: [
                new HtmlWebpackPlugin({
                    template: './src/assets/index.html',
                }),
            ],
        },
        getConfigByMode(mode)
    );
};
