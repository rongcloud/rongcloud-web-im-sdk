var path=require('path');
module.exports = {
    // The entry point for the bundle.
    entry: "./src/IMClient/entry.js",// 改变key 'js/index' 输出指定目录
    output: {
        path: path.join(__dirname, '/dest'),
        filename: 'RongIMClient.js',
        sourceMapFilename: '[file].map'
    },
    module: {
        loaders: [
            //{test: require.resolve('./src/core/bridge.js'), loader: 'expose?RongIMClient'} //暴露到全局中
        ]
    },
    // 声明该包为外部的.
    //externals: {
    //    jQuery: true
    //},
    resolve: {
        extensions: ['', '.js', '.json', '.coffee'],
        root: [process.cwd() + '/src', process.cwd() + '/node_modules'] //本文件中的require从哪里找
    }
};