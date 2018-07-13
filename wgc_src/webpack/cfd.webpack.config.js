const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: "./webpack/cfd.webpack.entry.js",
	// to build with only comments off, use like this
	plugins : [
		new UglifyJsPlugin({
			beautify: true,
        	mangle: false
		})
	],
	//
    output: {
      	filename: "./build/wgc_cfd_module.js"
	},
	module: {
	  loaders: [
		{ test: /\.scss$/, loader: 'style-loader!css-loader' }
	  ]
	}
};
