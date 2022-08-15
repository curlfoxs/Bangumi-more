var path = require('path');

module.exports = {
    // Change to your "entry-point".
    entry: './src/index.ts', // The entry field tells Webpack where to start looking for modules to bundle
    watch: true,
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bangumi-bbcode-preview.bundle.user.js'
    },
    resolve: { // The resolve.extensions field tells Webpack what file types to look for in which order during module resolution.
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: { // The module field tells Webpack how different modules will be treated.
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
        }],
    },
    // The output field tells Webpack where to bundle our code. In our project, this is the file called bundle.js in the dist folder.
    devServer: { // The devServer field configures the Webpack development server.
        // We are telling it that the root of the web server is the dist folder, and to serve files on port 4000.
        static: path.join(__dirname, "dist"),
        compress: true,
        port: 4000,
        devMiddleware: {
            index: true,
            mimeTypes: { phtml: 'text/html' },
            // publicPath: '/publicPathForDevServe',
            serverSideRender: true,
            writeToDisk: true,
        },
    },
};
