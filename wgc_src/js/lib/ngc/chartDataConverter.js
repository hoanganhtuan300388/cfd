(function(global){
	"use strict";

	var loadModule = function(xUtils, dataHandlerFactory) {
		"use strict";

		/**
		 * [description]
		 * @return [type]
		 */
		var exports = function() {
			var _self = this;

			this.m_domElem = null;
	        this.m_jqElem$ = null;

	        this.m_chartWrap = null;

			this.m_xDataHanler = null;
			this.m_xDataHanlers = [];

			this.didGetLastData = function(id) {
				var xPriceDataInfo = _self.m_chartWrap.didGetBasePriceDataInfo(id);
				if(xPriceDataInfo === undefined || xPriceDataInfo == null || xPriceDataInfo.datas === undefined || xPriceDataInfo.datas == null) {
					return;
				}

				var nDataCount = xPriceDataInfo.datas.length;
				if(nDataCount < 1) {
					return;
				}

				return(xPriceDataInfo.datas[nDataCount - 1]);
			};

			this.didGetLastDatetimeUnit = function(id) {
				var stLastData = _self.didGetLastData(id);
				if(stLastData === undefined || stLastData == null) {
					return;
				}

				var lastDatetimeUnit = xUtils.timeZone.convertDatetimeToTimeunit(stLastData.ymd, stLastData.hms);

				return(lastDatetimeUnit);
			};

			var _didInitDefaultDataHandler = function() {
				_self.m_xDataHanler = dataHandlerFactory.didGetDataHandlerEx(_self);
			};

	        /**
			 * initialize
			 *
			 * @param {any} jqElem
			 * @param {any} argChartWrap
			 */
			this.didInitialize = function(jqElem, argChartWrap) {
	            _self.m_jqElem$ = jqElem;
	            _self.m_domElem = _self.m_jqElem$.get(0);
	            _self.m_chartWrap = argChartWrap;

				// #1435
				_self.didInitForDemo();
				//

				_didInitDefaultDataHandler();
	        };

			this.didDestroy = function() {
				delete _self.m_xDataHanler;

				_self.m_xDataHanler = null;
			};

			//
			// OnXxx handler
			//

			this.OnReceiveData = function(receiveRawDatas, requestInfo, timeZoneInfo, multiTargetId) {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceiveData(receiveRawDatas, requestInfo, timeZoneInfo, multiTargetId));
			};

			this.OnReceiveNextData = function(receiveRawDatas) {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceiveNextData(receiveRawDatas));
			};

			// #1878
			this.OnReceiveAlertData = function(receiveDatas) {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceiveAlertData(receiveDatas));
			};

			this.OnReceiveExecutionData = function(receiveDatas) {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceiveExecutionData(receiveDatas));
			};
			// #1878

			this.OnReceiveOrderData = function(receiveDatas) {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceiveOrderData(receiveDatas));
			};

			this.OnReceivePositData = function(receiveDatas) {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceivePositData(receiveDatas));
			};

			this.OnReceiveRealData = function(receiveData, multiTargetId) {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceiveRealData(receiveData, multiTargetId));
			};

			this.OnReceiveRealDatas = function(receiveDatas, multiTargetId) {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceiveRealDatas(receiveDatas, multiTargetId));
			};

			this.OnReceiveRealDataAsCandleStick= function(receiveRawData) {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceiveRealDataAsCandleStick(receiveRawData));
			};

			this.OnReceiveRealDataAsTick= function(receiveRawData) {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceiveRealDataAsTick(receiveRawData));
			};

			// #1252
			this.OnReceiveBusinessDate = function(businessDate, bDraw, timeZoneInfo) { // #3414
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.OnReceiveBusinessDate(businessDate, bDraw, timeZoneInfo)); // #3414
			}

			//
			this.didClearDatas = function() {
				if(_self.m_xDataHanler === undefined || _self.m_xDataHanler == null) {
					return;
				}

				return(_self.m_xDataHanler.didClearDatas());
			};

			//
			// #1435
			//
			this.didInitForDemo = function() {
			};
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDataConverter");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDataConverter"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDataHandler"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./chartDataHandler")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDataConverter",
            ['ngc/chartUtil', 'ngc/chartDataHandler'],
                function(xUtils, dataHandlerFactory) {
                    return loadModule(xUtils, dataHandlerFactory);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDataConverter"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDataHandler"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDataConverter");
})(this);
