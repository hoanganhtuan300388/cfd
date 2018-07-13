(function(global){
	"use strict";

	var loadModule = function(xUtils, axisBaseClass) {
	    "use strict";

	    var exports = function (chartWrapper, drawWrapper) {
	        //
	        // private
	        //

	        var _self = this;
	        var _chartWrapper = chartWrapper;
	        var _drawWrapper = drawWrapper;

			this.prototype = new axisBaseClass(chartWrapper, drawWrapper);
			axisBaseClass.apply(this, arguments);

			this.OBJECT_NAME = "NORMAL_AXIS";

			this.isNontime = false; // #2037
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartXAxisPanelNormal");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartXAxisPanelNormal"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartXAxisPanelBase"]
			);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
			loadModule(
				require("./chartUtil"),
				require("./chartXAxisPanelBase")
			);
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartXAxisPanelNormal",
			['ngc/chartUtil', 'ngc/chartXAxisPanelBase'],
				function(xUtils, axisBaseClass) {
					return loadModule(xUtils, axisBaseClass);
				});
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartXAxisPanelNormal"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartXAxisPanelBase"]
			);
    }

	//console.debug("[MODUEL] Loaded => chartXAxisPanelNormal");
})(this);
