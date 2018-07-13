/**
 * @file 	ngcModule.js
 * @brief	ngc module root
 * @author	choi sunwoo
 * @date 	2017.02.10
 * */
(function ($, global) {
    $.ngcModule = {
        testObjects : {

        },

		createChartComponent : function(id) {
			var __factory;

			if(!__factory) {
				if($.__wgcFactory__) {
					__factory = $.__wgcFactory__;
				}
				else if (typeof define !== 'undefined' && define["amd"]) {
					__factory = require('lib/ngcFactory');
				}
			}

			if(__factory) {
				return(__factory.createScreenChartWithRegister(id));
			}

			throw new Error('createChartComponent => Need lib/ngcFactory module');
        },

		removeChartComponent : function(key) {
			var __factory;

			if(!__factory) {
				if($.__wgcFactory__) {
					__factory = $.__wgcFactory__;
				}
				else if (typeof define !== 'undefined' && define["amd"]) {
					__factory = require('lib/ngcFactory');
				}
			}

			if(__factory) {
				return(__factory.removeChartComponent(id));
			}

			throw new Error('removeChartComponent => Need lib/ngcFactory module');
		},

        getNGCFactory : function() {
			var __factory;

			if(!__factory) {
				if($.__wgcFactory__) {
					__factory = $.__wgcFactory__;
				}
				else if (typeof define !== 'undefined' && define["amd"]) {
					__factory = require('lib/ngcFactory');
				}
			}

			return(__factory);
        },
        getNGCUtils : function() {
			var xUtils;

			if(!xUtils) {
				if($.__wgcUtils__) {
					xUtils = $.__wgcUtils__;
				}
				else if (typeof define !== 'undefined' && define["amd"]) {
					xUtils = require('ngc/chartUtil');
				}
			}

			return(xUtils);
        },
		didGetZsScrollScreen : function(id) {
			var zsScrollScreen;

			if(!zsScrollScreen) {
				if($.__wgcUtils__) {
					zsScrollScreen = $.__zsScrollScreen__;
				}
				else if (typeof define !== 'undefined' && define["amd"]) {
					zsScrollScreen = require('ngu/zsScrollScreen');
				}
			}

			if(zsScrollScreen) {
				return(new zsScrollScreen(id));
			}

			return;
		},
        testUnitsChart : {
            getOrderPositSimulator : function() {
				var testChart;

				if(!testChart) {
					if($.__wgcTestChart__) {
						testChart = $.__wgcTestChart__;
					}
					else if (typeof define !== 'undefined' && define["amd"]) {
						testChart = require('testUnits/testChart');
					}
				}

				if(testChart) {
					var simulator = testChart.orderPositSimulator;
	                return(simulator);
				}

			    throw new Error('getOrderPositSimulator => Need testUnits/testChart module');
            },
            getDataSimulator : function() {
				var testChart;

				if(!testChart) {
					if($.__wgcTestChart__) {
						testChart = $.__wgcTestChart__;
					}
					else if (typeof define !== 'undefined' && define["amd"]) {
						testChart = require('testUnits/testChart');
					}
				}

				if(testChart) {
					var simulator = testChart.dataSimulator;
	                return(simulator);
				}

			    throw new Error('getDataSimulator => Need testUnits/testChart module');
            },
            getSymbolCodes : function() {
				var testChart;

				if(!testChart) {
					if($.__wgcTestChart__) {
						testChart = $.__wgcTestChart__;
					}
					else if (typeof define !== 'undefined' && define["amd"]) {
						testChart = require('testUnits/testChart');
					}
				}

				if(testChart) {
					var symbolCodes = testChart.testDatas.getSymbolCodes();
	                return(symbolCodes);
				}

			    throw new Error('getSymbolCodes => Need testUnits/testChart module');
            },
            getTimeZoneInfo : function(argSymbolCode) {
				var testChart;

				if(!testChart) {
					if($.__wgcTestChart__) {
						testChart = $.__wgcTestChart__;
					}
					else if (typeof define !== 'undefined' && define["amd"]) {
						testChart = require('testUnits/testChart');
					}
				}

				if(testChart) {
					var timeZoneInfo = testChart.testDatas.getTimeZoneInfo(argSymbolCode);
	                return(timeZoneInfo);
				}

			    throw new Error('getTimeZoneInfo => Need testUnits/testChart module');
            },
            getTestCases : function() {
				var testChart;

				if(!testChart) {
					if($.__wgcTestChart__) {
						testChart = $.__wgcTestChart__;
					}
					else if (typeof define !== 'undefined' && define["amd"]) {
						testChart = require('testUnits/testChart');
					}
				}

				if(testChart) {
	                return(testDatas.testCases);
				}

			    throw new Error('getTestCases => Need testUnits/testChart module');
            }
        }
    };

    $.event.special.destroyed = {
        remove: function(o) {
          if (o.handler) {
            o.handler()
          }
        }
    };

    console.log('ngcModule');
})(jQuery, this);
