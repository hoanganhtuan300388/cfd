//CommonJS style

(function(global) {
	var xUtils = require('../js/lib/ngc/chartUtil');
	var ngcFactory = require('../js/lib/ngcFactory');
	var zsScrollScreen = require('../js/lib/ngu/zsScrollScreen');

	//
	// #1594
	//
	try {
		var siteCfd = require('../js/lib/site/siteCfd');
		var cfd = new siteCfd();
		cfd.didInitSite();
	}
	catch(e) {
		console.error(e);
	}
	//

	// #2460
	var siteTools = require('../js/lib/site/siteTools');
	//

	if($) {
		$.__wgcFactory__ 	= ngcFactory;
		$.__wgcUtils__   	= xUtils;
		$.__zsScrollScreen__ = zsScrollScreen;

		$.__siteTools__ = siteTools; // #2460
	}
	else if(global) {
		global.__wgcFactory__ 	= ngcFactory;
		global.__wgcUtils__   	= xUtils;
		global.__zsScrollScreen__  = zsScrollScreen;

		global.__siteTools__ = siteTools; // #2460
	}
})(this);
