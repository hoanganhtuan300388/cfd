(function(global){
	"use strict";

	// #2583
	var loadModule = function(xUtils, doPriceBar, doSeriesFactory) {
		"use strict";

		var exports = {};

		exports.createDrawObject = function(objectName, isprice, objectInfo) {
			if(objectName === undefined || objectName == null) {
				isprice = true;
			}

			if(isprice === true) {
				return(new doPriceBar());
			}
			else {
				return(doSeriesFactory.didCreateSeriesInstance(objectName, objectInfo));
			}
		};

		return (exports);
	};

	//console.debug("[MODUEL] Loading => chartDOFactory");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOFactory"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDOPriceBarCFD"],
				global["WGC_CHART"]["chartDOSeriesCFD"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./chartDOPriceBarCFD"),
				require("./chartDOSeriesCFD")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDOFactory",
            ['ngc/chartUtil', 'ngc/chartDOPriceBarCFD', 'ngc/chartDOSeriesCFD'],
                function(xUtils, doPriceBar, doSeriesFactory) {
                    return loadModule(xUtils, doPriceBar, doSeriesFactory);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOFactory"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDOPriceBarCFD"],
				global["WGC_CHART"]["chartDOSeriesCFD"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOFactory");
})(this);
