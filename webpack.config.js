const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const WasmPackPlugin = require("@wasm-tool/wasm-pack-plugin");

module.exports = (_, argv) => {
    console.log('Building in %s mode', argv.mode);
    config = {
        entry: './index.js',
        output: {
            path: path.resolve(__dirname, 'dist'),
            filename: 'index.js',
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: 'index.html'
            }),
            new WasmPackPlugin({
                // See https://github.com/GoogleChromeLabs/wasm-bindgen-rayon/#readme
                // Other compilation flags provided in npm scripts, see `package.json`
                extraArgs: "--target web -- -Z build-std=panic_abort,std",
                crateDirectory: path.resolve(__dirname, ".")
            })
        ],
        experiments: {
            asyncWebAssembly: true
        },
        devServer: {
            // Required in order to use SharedArrayBuffer
            // See https://web.dev/coop-coep/
            headers: {
                'Cross-Origin-Embedder-Policy': 'require-corp',
                'Cross-Origin-Opener-Policy': 'same-origin',
            }
        }
    };
    return config;
}