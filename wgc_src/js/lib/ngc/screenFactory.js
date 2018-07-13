(function(global){
	"use strict";

	var loadModule = function(sm, Chart) {
		"use strict";

		var screenManager = sm;
		var chartClass = Chart;

		//
		//
		//
		var exports = {};

		var _chartSilo = {

			items : []
		};

		var _didFindChartInSiloByKey = function(argKey) {
			if(argKey === undefined || argKey == null) {
				return;
			}

			var nCount = _chartSilo.items.length;
			for(var ii = 0; ii < nCount; ii++) {
				var xItem = _chartSilo.items[ii];
				if(xItem && argKey === xItem.key) {
					return({index:ii, item:xItem});
				}
			}
		};

		var _didRegisterChartInSiloByKey = function(argKey, argChart) {
			if(argKey === undefined || argKey == null || argChart === undefined || argChart == null) {
				return(false);
			}

			_chartSilo.items.push({key:argKey, item:argChart});

			return(true);
		};

		var _didUnegisterChartInSiloByKey = function(argKey) {
			var xFind = _didFindChartInSiloByKey(argKey);
			if(xFind === undefined || xFind == null) {
				return(false);
			}

			_chartSilo.items.splice(xFind.ii, 1);

			return(true);
		};

		exports.getScreenPanel = function(id) {
			return(new ScreenPanel(id));
		};

		exports.removeChartComponent = function(argKey) {
			return(_didUnegisterChartInSiloByKey(argKey));
		};

		exports.createScreenChartWithRegister = function(id) {
			var xChart = new chartClass(id);
			var uniqueId = xChart.didGetUniqueId();
			/*
			var xResult  = _didFindChartInSiloByKey(uniqueId);
			if(xResult && xResult.item) {

			}
			*/

			_didRegisterChartInSiloByKey(uniqueId, xChart);

			return(xChart);
		};

		exports.getScreenChart = function(id) {
			return(new chartClass(id));
		};

		exports.getScreenManager = function() {
			return(screenManager);
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => screenFactory");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["screenFactory"] =
			loadModule(
				global["WGC_CHART"]["screenManager"],
				global["WGC_CHART"]["screenChart"]
			);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
			loadModule(
				require("./screenManager"),
				require("./screenChart")
			);
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/screenFactory",
		 	['ngc/screenManager', 'ngc/screenChart'],
				function(sm, Chart) {
					return loadModule(sm, Chart);
				});
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["screenFactory"] =
			loadModule(
				global["WGC_CHART"]["screenManager"],
				global["WGC_CHART"]["screenChart"]
			);
    }

	//console.debug("[MODUEL] Loaded => screenFactory");
})(this);
