requirejs.config({
	baseUrl: "assets/layouter/js",
	paths: {
		'global': '../lib/cui/js/global',
		'layout': '../lib/cui/js/layout',
		'border': '../lib/cui/js/border',
		'borderWing': '../lib/cui/js/borderWing',
		'panel': '../lib/cui/js/panel',
		'templates': '../lib/cui/js/templates',
		'modal': '../lib/cui/js/modal',
		'widget': '../lib/cui/js/widget',
		'widgetList': '../lib/cui/js/modalContents/widgetList',
		'restore': '../lib/cui/js/restore',
		'debug': '../lib/cui/js/debug'
	},
	waitSeconds: 7,
	shim: {
		'layout': {
			deps: ['global', 'templates', 'border', 'borderWing', 'panel', 'modal', 'widgetList', 'widget', 'restore', 'debug'],
			exports: '_'
		}
	}
});

requirejs(['layout'], function(layout) {
	console.log("layout");

	//var layout = new Layout(document.getElementById('wrapper'));
});