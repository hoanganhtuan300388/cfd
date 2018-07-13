(function(global){
	"use strict";

	var loadModule = function(xUtils) {
		"use strict";

		/**
		 *
		 */
		var _getTagetChildDOMElementById = function(jqTarget, id) {
			var jqElem = jqTarget.find('#' + id);
			var domElem = $(jqElem).get(0);

			return (domElem);
		};

		/**
		 *
		 */
		var _getIndexFromElementId = function(prefix, strId) {
			var __prefixLen = prefix.length;
			var __nLSIdx = strId.substring(__prefixLen, __prefixLen + 2);

			return(__nLSIdx);
		};

		/**
		 *
		 */
		var _getCodeFromElementIdByLength = function(prefix, strId, length) {
			length = length || 4;
			var prefixLen = prefix.length;
			var code = strId.substring(prefixLen, prefixLen + length);

			return(code);
		};

		var _screenIndicator = function() {
			var _self = this;

	        this.m_domElem = null;
	        this.m_jqElem$ = null;

	        this.m_chartWrap = null;

			this.m_elementIdPrefix = "idIndicatorList";

			/**
	         *
	         */
			var _didSetEventHandler = function() {
				//
				var __divParentObj = _self.m_domElem;

				//
				if(__divParentObj === undefined || __divParentObj == null) {
					return;
				}
				//

				var __nCount = xUtils.constants.indicators.length;
				for (var __ii = 0; __ii < __nCount; __ii++) {
					var __domElem = document.createElement('li');
					var __domElemSub = document.createElement('a');
					__domElemSub.setAttributeNS(null, "id", _self.m_elementIdPrefix + __ii);
					__domElemSub.innerHTML = xUtils.constants.indicators[__ii].display;
					__domElemSub.onclick = _self.OnClick_AddIndicator;
					__domElem.appendChild(__domElemSub);

					__divParentObj.appendChild(__domElem);
				}
			};

			/**
	         *
	         */
			var _didSetEventHandlerByGroup = function() {
				//
				var __divParentObj = _self.m_domElem;

				//
				if(__divParentObj === undefined || __divParentObj == null) {
					return;
				}
				//

				var addDivider = function(domElemParent) {
					if(domElemParent === undefined || domElemParent == null) {
						return;
					}
					var domElem;
					var domElemSub;
					domElem = document.createElement('li');
					domElem.className = "divider dropdown-divider";
					domElemParent.appendChild(domElem);
				};

				//
				// Trend group
				//
				(function(){
					var domElem;
					var domElemSub;
					var indicatorGroup = xUtils.constants.indicatorGroups.trend;
					domElem = document.createElement('li');
					domElemSub = document.createElement('a');
					domElemSub.innerHTML = "<i class='material-icons'>show_chart</i>" + indicatorGroup.display;
					domElem.appendChild(domElemSub);
					__divParentObj.appendChild(domElem);

					addDivider(__divParentObj);

					var __nCount = indicatorGroup.indicators.length;
					for (var ii = 0; ii < __nCount; ii++) {
						var indicatorCode = indicatorGroup.indicators[ii];
						var indicatorInfo = xUtils.indicator.didGetDefaultInfo(indicatorCode);
						if(indicatorInfo === undefined || indicatorInfo == null) {
							continue;
						}

						var __domElem = document.createElement('li');
						var __domElemSub = document.createElement('a');
						__domElemSub.setAttributeNS(null, "id", _self.m_elementIdPrefix + indicatorCode);
						__domElemSub.innerHTML = indicatorInfo.display;
						__domElemSub.onclick = _self.OnClick_AddIndicatorByCode;
						__domElem.appendChild(__domElemSub);

						__divParentObj.appendChild(__domElem);
					}
				})();

				addDivider(__divParentObj);

				//
				// Trend group
				//
				(function(){
					var domElem;
					var domElemSub;
					var indicatorGroup = xUtils.constants.indicatorGroups.oscillator;
					domElem = document.createElement('li');
					domElemSub = document.createElement('a');
					domElemSub.innerHTML = "<i class='material-icons'>show_chart</i>" + indicatorGroup.display;
					domElem.appendChild(domElemSub);
					__divParentObj.appendChild(domElem);

					addDivider(__divParentObj);

					var __nCount = indicatorGroup.indicators.length;
					for (var ii = 0; ii < __nCount; ii++) {
						var indicatorCode = indicatorGroup.indicators[ii];
						var indicatorInfo = xUtils.indicator.didGetDefaultInfo(indicatorCode);
						if(indicatorInfo === undefined || indicatorInfo == null) {
							continue;
						}

						var __domElem = document.createElement('li');
						var __domElemSub = document.createElement('a');
						__domElemSub.setAttributeNS(null, "id", _self.m_elementIdPrefix + indicatorCode);
						__domElemSub.innerHTML = indicatorInfo.display;
						__domElemSub.onclick = _self.OnClick_AddIndicatorByCode;
						__domElem.appendChild(__domElemSub);

						__divParentObj.appendChild(__domElem);
					}
				})();
			};

	        this.didInitialize = function(jqElem, argChartWrap) {
	            _self.m_jqElem$ = jqElem;
	            _self.m_domElem = _self.m_jqElem$.get(0);
	            _self.m_chartWrap = argChartWrap;

	            //_didSetEventHandler();
	            _didSetEventHandlerByGroup();
	        };

			/**
			 *
			 */
			this.OnClick_AddIndicatorByCode = function(event) {
				var __event = event || window.event;

				if(_self.m_chartWrap === undefined || _self.m_chartWrap == null) {
					return;
				}

				var indicatorCode = _getCodeFromElementIdByLength(_self.m_elementIdPrefix, String(__event.currentTarget.id), 4);
				var indicatorInfo = xUtils.indicator.didGetDefaultInfo(indicatorCode);
				if(indicatorInfo === undefined || indicatorInfo == null) {
					return;
				}

				//
				// TODO: [DEBUG]
				if(indicatorInfo.enable !== true || indicatorInfo.valid !== true) {
					return;
				}

				var __indiCode = indicatorInfo.code;
				var __indiName = indicatorInfo.display;

				// xUtils.debug.log('OnClick_AddIndicator => ' + __indiCode + ', ' + __indiName);

				_self.m_chartWrap.didAddIndicator(__indiCode);
			};

			/**
			 *
			 */
			this.OnClick_AddIndicator = function(event) {
				var __event = event || window.event;

				if(_self.m_chartWrap === undefined || _self.m_chartWrap == null) {
					return;
				}

				var __nSelectedIdx = _getIndexFromElementId(_self.m_elementIdPrefix, String(__event.currentTarget.id));
				var __nCount = xUtils.constants.indicators.length;
				if(__nCount < 1 || __nSelectedIdx < 0 || __nSelectedIdx >= __nCount) {
					return;
				}

				var __indiCode = xUtils.constants.indicators[__nSelectedIdx].code;
				var __indiName = xUtils.constants.indicators[__nSelectedIdx].display;

				// xUtils.debug.log('OnClick_AddIndicator => ' + __indiCode + ', __indiName');

				_self.m_chartWrap.didAddIndicator(__indiCode);
			};
		};

		var _screenChartType = function() {
			var _self = this;

	        this.m_domElem = null;
	        this.m_jqElem$ = null;

	        this.m_chartWrap = null;

			/**
	         *
	         */
			var _didSetEventHandler = function() {
				//
				var __divParentObj = _self.m_domElem;

				//
				if(__divParentObj === undefined || __divParentObj == null) {
					return;
				}
				//

				var __nCount = xUtils.constants.chartType.length;
				for (var __ii = 0; __ii < __nCount; __ii++) {
					var __domElem = document.createElement('li');
					var __domElemSub = document.createElement('a');
					__domElemSub.setAttributeNS(null, "id", "idChartTypeList" + __ii);
					__domElemSub.innerHTML = xUtils.constants.chartType[__ii].display;
					__domElemSub.onclick = _self.OnClick_ChangeChartType;
					__domElem.appendChild(__domElemSub);

					__divParentObj.appendChild(__domElem);
				}
			};

	        this.didInitialize = function(jqElem, argChartWrap) {
	            _self.m_jqElem$ = jqElem;
	            _self.m_domElem = _self.m_jqElem$.get(0);
	            _self.m_chartWrap = argChartWrap;

	            _didSetEventHandler();
	        };

			/**
			 *
			 */
			this.OnClick_ChangeChartType = function(event) {
				//
				if(_self.m_chartWrap === undefined || _self.m_chartWrap == null) {
					return;
				}

				var __strItem;
				var __nSelectedIdx = String(event.currentTarget.id).substring(15,17);

				var __nCount = xUtils.constants.chartType.length;
				if(__nCount < 1 || __nSelectedIdx < 0 || __nSelectedIdx >= __nCount) {
					return;
				}

				__strItem = xUtils.constants.chartType[__nSelectedIdx].code;

				//console.debug('OnClick_ChangeChartType => ' + __strItem);

				_self.m_chartWrap.didChangeBasicChartType(__strItem);
			};
		};

		/**
		 * line study(trend line) controller
		 */
		var _screenLineStudy = function() {
			var _self = this;

	        this.m_domElem = null;
	        this.m_jqElem$ = null;

	        this.m_nSelectedLSIndex = -1;
	        this.m_bTrendButtonClick = false;
	        this.m_chartWrap = null;

			this.m_elementIdPrefix = "idTLine";

			/**
	         *
	         */
			var _didSetEventHandler = function() {
				//
				var __divParentObj = _self.m_domElem;

				//
				if(__divParentObj === undefined || __divParentObj == null) {
					return;
				}
				//

				var __nCount = xUtils.constants.trendLines.length;
				for (var __ii = 0; __ii < __nCount; __ii++) {
					var __divObj = document.createElement('div');
					__divObj.setAttributeNS(null, 'id', _self.m_elementIdPrefix + __ii);
					__divObj.title = xUtils.constants.trendLines[__ii].display;
					__divObj.onclick = _self.OnTrendButtonClick;

					if(__ii === 0) {
						$(__divObj).addClass('active');
					}

					__divParentObj.appendChild(__divObj);
				}
			};

			/**
			 * de-active all trendline buttons
			 */
			var _didClearTrendLineButton = function() {
				var __nCount = xUtils.constants.trendLines.length;
				for (var __ii = 0; __ii < __nCount; __ii++) {
					var __divObj = _getTagetChildDOMElementById(_self.m_jqElem$, _self.m_elementIdPrefix + __ii);
					$(__divObj).removeClass('active');
				}
			};

			var _didActivateTrendLineButton = function(argIndex) {
				var __nCount = xUtils.constants.trendLines.length;
				if(__nCount < 1 || argIndex < 0 || argIndex >= __nCount) {
					return;
				}

				var __divObj = _getTagetChildDOMElementById(_self.m_jqElem$, _self.m_elementIdPrefix + argIndex);
				$(__divObj).addClass('active');
			};

			this.didDoneWithTrendline = function() {
				_didClearTrendLineButton();
				_didActivateTrendLineButton(0);

			};

			/**
			 * initialize
			 * @param[in] jqElem		container jquery element
			 * @param[in] argChartWrap	chart wrapper
			 */
	        this.didInitialize = function(jqElem, argChartWrap) {
	            _self.m_jqElem$ = jqElem;
	            _self.m_domElem = _self.m_jqElem$.get(0);
	            _self.m_chartWrap = argChartWrap;

				if(xUtils.constants.chartConfigConstants.UseTrendlineEndCallback === true) {
	            	_self.m_chartWrap.m_callbackTrendline = _self.didDoneWithTrendline;
				}

	            _didSetEventHandler();
	        };

			/**
			 * event clicking handler for trend line
			 * @param[in] event	event
			 */
			this.OnTrendButtonClick = function(event) {
				var __event = event || window.event;

				if(_self.m_chartWrap === undefined || _self.m_chartWrap == null) {
					return;
				}

				_self.m_bTrendButtonClick = true;

				_didClearTrendLineButton();

				var __nLSIdx = _getIndexFromElementId(_self.m_elementIdPrefix, String(__event.currentTarget.id));

				var __nCount = xUtils.constants.trendLines.length;
				if(__nCount < 1 || __nLSIdx < 0 || __nLSIdx >= __nCount) {
					return;
				}

				var __strTrendLine = xUtils.constants.trendLines[__nLSIdx].code;
				var __isDrawable = xUtils.trendLine.isDrawableTrendline(__strTrendLine);
				if(__isDrawable === true) {
					$(event.currentTarget).addClass('active');

					_self.m_chartWrap.didAddLineStudy(__strTrendLine);
					_self.m_nSelectedLSIndex = __nLSIdx;
				}
				else {
					_self.m_chartWrap.didAddLineStudy(__strTrendLine);
					_didActivateTrendLineButton(0);
				}
			};
		};

		//
		// exports
		//
		var exports = {};

		exports.getScreenForIndicator = function() {
			return(new _screenIndicator());
		};

		exports.getScreenForChartType = function() {
			return(new _screenChartType());
		};

		exports.getScreenForLineStudy = function() {
			return(new _screenLineStudy());
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => screenTools");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["screenTools"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"]
			);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
			loadModule(
				require("./chartUtil")
			);
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/screenTools", ['ngc/chartUtil'],
			function(xUtils) {
				return loadModule(xUtils);
			});
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["screenTools"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"]
			);
    }

	//console.debug("[MODUEL] Loaded => screenTools");
 })(this);
