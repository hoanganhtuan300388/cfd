(function(global){
	"use strict";

	var loadModule = function (xUtils) {
		var _exports = function (chartWrapper, ctrlLayout, drawWrapper) {
   		 	//
    		// private
    		//
    		var _self = this;
    		var _chartWrapper = chartWrapper;
    		var _ctrlLayout   = ctrlLayout;
    		var _drawWrapper  = drawWrapper;

	   		this.m_arrDoPrice  = [];
	   		this.m_arrDoSeries = [];
   	 	};
   	 	return(_exports);
	};

	//console.debug("[MODUEL] Loading => chartDrawBuffer");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDrawBuffer"] = loadModule(global["WGC_CHART"]["chartUtil"]);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] = loadModule(require("./chartUtil"));
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDrawBuffer", ['ngc/chartUtil'], function(xUtils) { return loadModule(xUtils); });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDrawBuffer"] = loadModule(global["WGC_CHART"]["chartUtil"]);
    }

	//console.debug("[MODUEL] Loaded => chartDrawBuffer");
 })(this);
