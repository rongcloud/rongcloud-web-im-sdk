var path = require('path');
module.exports = {
    devtool: '#source-map',
    entry: "./src/IMClient/entry.js",
    output: {
        path: path.join(__dirname, '/dest'),
        filename: 'RongIMClient.js',
        sourceMapFilename: '[file].map',
        libraryTarget: 'umd',
        library: 'RongIMClient',
        pathinfo: true
    },
    resolve: {
        extensions: ['', '.js', '.json', '.coffee'],
        root: [process.cwd() + '/src', process.cwd() + '/node_modules'] //本文件中的require从哪里找
    }
};