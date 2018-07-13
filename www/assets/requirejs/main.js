requirejs.config({
	baseUrl: "assets",
	paths: {
		'global'		: './layouter/lib/cui/js/global',
		'layout'		: './layouter/lib/cui/js/layout',
		'border'		: './layouter/lib/cui/js/border',
		'borderWing': './layouter/lib/cui/js/borderWing',
		'panel'			: './layouter/lib/cui/js/panel',
		'templates'	: './layouter/lib/cui/js/templates',
		'modal'			: './layouter/lib/cui/js/modal',
		'widget'		: './layouter/lib/cui/js/widget',
		'widgetList': './layouter/lib/cui/js/modalContents/widgetList',
		'restore'		: './layouter/lib/cui/js/restore',
		'debug'			: './layouter/lib/cui/js/debug',
		'thtml'	: 'layouter/lib/cui/templates',

		"lib" 			: "./wgc/js/lib",
    	"ngc"			: "./wgc/js/lib/ngc",
		"testUnits" 	: "./wgc/js/lib/testUnits"
	},
	shim: {
		'layout': {
			deps: ['global', 'templates', 'border', 'borderWing', 'panel', 'modal', 'widgetList', 'widget', 'restore', 'debug'],
			exports: '_'
		}
	}
});

requirejs(['layout', 'lib/ngcFactory', 'ngc/chartUtil', 'testUnits/testChart'], function(layout) {
	console.log("layout");
	console.log('>>>>>>>>>>>>>>>>>> ----');
	//var layout = new Layout(document.getElementById('wrapper'));
});