(function(global){
	"use strict";

	var loadModule = function(sf, chartWrap, ev_crt) {
		"use strict";

		//
		// global function
		//

		//
		//
		//
		var scrMan = [];
		var screenFactory = sf;

		var exports = {};

		exports.getScreenFactory = function() {
			return(screenFactory);
		};

		exports.getChartWrap = function(scrObj) {
			return(new chartWrap(scrObj));
		};

		// exports.getScreenForLineStudy = function() {
		// 	return(scrTools.getScreenForLineStudy());
		// };
		//
		// exports.getScreenForIndicator = function() {
		// 	return(scrTools.getScreenForIndicator());
		// };
		//
		// exports.getScreenForChartType = function() {
		// 	return(scrTools.getScreenForChartType());
		// };

		exports.getChartDataConverter = function() {
			return(new ev_crt());
		};

		// exports.didLinkElementToChart = function(screenChart, $elemRoot) {
		// 	try {
		// 		var __getJqTagetChildDOMElementById = function($jqRoot, id) {
		// 			var $jqElem = $jqRoot.find(id);
		// 			var domElem = $jqElem.get(0);
		//
		// 			return(domElem);
		// 		}
		//
		// 		var __scrLs = exports.getScreenForLineStudy();
		// 		var __domElemLs = __getJqTagetChildDOMElementById($elemRoot, '#eidTLineBoundary');
		// 		__scrLs.didInitialize($(__domElemLs), screenChart.method.m_chartWrap);
		// 		screenChart.method.m_chartWrapTrendline = __scrLs;
		//
		// 		var __scrIndicator = exports.getScreenForIndicator();
		// 		var __domElemIndicator = __getJqTagetChildDOMElementById($elemRoot, '#eidIndicatorMenu');
		// 		__scrIndicator.didInitialize($(__domElemIndicator), screenChart.method.m_chartWrap);
		// 		screenChart.method.m_chartWrapIndicator = __scrIndicator;
		//
		// 		var __scrChartType = exports.getScreenForChartType();
		// 		var __domElemChartType = __getJqTagetChildDOMElementById($elemRoot, '#eidChartTypeMenu');
		// 		__scrChartType.didInitialize($(__domElemChartType), screenChart.method.m_chartWrap);
		// 		screenChart.method.m_chartWrapChartType = __scrChartType;
		// 	}
		// 	catch(e) {
		// 		console.error(e);
		// 	}
		// };

		return(exports);
	};

	//console.debug("[MODUEL] Loading => lib/ngcFactory");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["lib/ngcFactory"] =
            loadModule(
                global["WGC_CHART"]["screenFactory"],
				global["WGC_CHART"]["chartWrap"],
				global["WGC_CHART"]["chartDataConverter"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./ngc/screenFactory"),
				require("./ngc/chartWrap"),
				require("./ngc/chartDataConverter")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("lib/ngcFactory",
            ['ngc/screenFactory', 'ngc/chartWrap', 'ngc/chartDataConverter'],
                function(sf, chartWrap, ev_crt) {
                    return loadModule(sf, chartWrap, ev_crt);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["lib/ngcFactory"] =
            loadModule(
                global["WGC_CHART"]["screenFactory"],
				global["WGC_CHART"]["chartWrap"],
				global["WGC_CHART"]["chartDataConverter"]
            );
    }

	//console.debug("[MODUEL] Loaded => lib/ngcFactory");
})(this);
