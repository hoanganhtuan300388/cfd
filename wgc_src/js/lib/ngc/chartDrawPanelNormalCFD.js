(function(global){
	"use strict";

	var loadModule = function(xUtils, layoutBaseClass) {
		"use strict";

		var exports = function(chartWrapper, ctrlLayout) {
			//
			// private
			//
			var _self = this;
			var _chartWrapper = chartWrapper;
			var _ctrlLayout = ctrlLayout;

			this.prototype = new layoutBaseClass(chartWrapper, ctrlLayout);
		    layoutBaseClass.apply(this, arguments);

			this.OBJECT_NAME = "CFD_NORMAL_LAYOUT";

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @param  {[type]} contextMenu
			 * @return {[type]}
			 */
			this.OnContextMenu = function(posval, contextMenu, isAxisArea, actionArea) {
				// #1927
				_self.didClearTooltipEventer();
				_self.didShowTooltip(false);
				//

				if(isAxisArea == true) {
					return;
				}

				if(actionArea && (actionArea.isDetail == true || actionArea.isLegend == true)) {
					return;
				}

				// not trendline
				var isCrossHairMode = xUtils.trendLine.isCrossHairMode(_self.m_strTrendLine); // #2566
				if(_self.m_bTrendLine && isCrossHairMode != true) {
					return;
				}

				// not resize
				if(_self.m_bMouseRowResize) {
					return;
				}

				// get panel postion
				var xResult = _self.didGetPanelInfoAtPos(posval);
				if(!xResult) {
					return;
				}

				if(typeof contextMenu != "object") {
					return;
				}

				var xDoPrice = _self.didGetReferencedPriceObject();
				contextMenu.symbolCode = xDoPrice.m_symbolInfo.strCode;
				contextMenu.symbol = xUtils.didClone(xDoPrice.m_symbolInfo);

				// just only valid in main panel
				if(xResult.isMain !== true) {
					contextMenu.isMain = false;

					_chartWrapper.didReflectCallForContextMenu(contextMenu);
					return;
				}

				var xPanel = xResult.panel;
				var hitPosVal = xUtils.didClone(posval);
				var xTestPanel = xPanel;
				var xDoSelected;
				var objectInfo;
				// #1298
				if(actionArea && actionArea.isExtraArea == true && _self.m_xExtraPanel) {
					xTestPanel = _self.m_xExtraPanel;
				}

				//
				if(xTestPanel.OnSelectChartObj(hitPosVal) >= 0) {
					xDoSelected = xTestPanel.m_xSelectedOepObject || xTestPanel.m_xDoExtraSelected;
					if(xDoSelected) {
						objectInfo = xDoSelected.didGetOepObjectInfo();
					}
				}

				contextMenu.isMain = true;
				contextMenu.price  = xPanel.GetYPosToVal(posval.YPos);
				contextMenu.verpos = xDoPrice.didGetPointValue();
				contextMenu.objectInfo = objectInfo;

				// #1966
				// 1: price >= ask, ask > price > bid, -1: bid >= price
				contextMenu.pricePos = 0;
				if(xDoPrice.didCheckPricePos) {
					contextMenu.pricePos = xDoPrice.didCheckPricePos(contextMenu.price);
				}
				//

				if(actionArea && actionArea.isExtraArea) {
					contextMenu.isMain = false;
				}

				_chartWrapper.didReflectCallForContextMenu(contextMenu);
			};

			// #2007
			this.didUpdateAskBidData = function(hide, ask, bid, validFlag) {
				try {
					var xDoPrice = _self.didGetReferencedPriceObject();
					if(xDoPrice && xDoPrice.didUpdateAskBidData) {
						return(xDoPrice.didUpdateAskBidData(hide, ask, bid, validFlag));
					}

				}
				catch(e) {
					console.error(e);
				}
			};
			//

			// #2361
			this.didHitTestForOnMoveInMain = function(posval) {
				if(!posval) {
					return;
				}

				var isObjectMovableMode = xUtils.trendLine.isObjectMovableMode(_self.m_strTrendLine); // #2566
				if(isObjectMovableMode != true) {
					return;
				}

				var hitPosVal = xUtils.didClone(posval);
				hitPosVal.__onmove__ = true;

				var xDoSelected;
				var localDrawFrame = _self.m_arrChartDrawFramelist[_self.m_iCanvasMouseMoveIndex];
				if(localDrawFrame && localDrawFrame.m_bMainFrame) {
					if(localDrawFrame.OnSelectChartObj(hitPosVal, true) >= 0) { // #2521
						xDoSelected = localDrawFrame.m_xSelectedOepObject;
						if(xDoSelected && xDoSelected.m_bOrder == true) {
							return(xDoSelected);
						}

						xDoSelected = localDrawFrame.m_selectTrendlineObj;
						if(xDoSelected) {
							var trendLineInfo = xUtils.trendLine.didGetDefaultTrendlineInfoAt(xDoSelected.m_strTrendlineName);
							if(trendLineInfo && trendLineInfo.isHoverObject == true) {
								return(xDoSelected);
							}
						}
					}
				}
			};

			this.didProcForMouseHoverOnObject = function(posval, actionArea) {
				try {
					if(!posval) {
						return;
					}

					if(actionArea) {
						return;
					}

					var xEnv = _self.didGetEnvInfo();
					var cursor;
					if(!xEnv.System.CursorConfig || !(cursor = xEnv.System.CursorConfig['hover-object'])) {
						return;
					}

					// #2566
					var isAvailableToSelectObject = xUtils.isAvailableToSelectObject(xEnv);
					if(isAvailableToSelectObject != true) {
						return;
					}
					//

					var xDoSelected = _self.didHitTestForOnMoveInMain(posval);
					if(xDoSelected) {
						_self.SetMouseCursor(cursor, true);
					}
					else {
						_self.SetMouseCursor('', true);
					}
				}
				catch(e) {
					console.error(e);
				}
			};
			//

			// #2566
			this.OnTrendLineAdd = function(strTrendLine) {
				// #2384
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.CursorConfig) {
					try {
						var trendLineInfo = xUtils.trendLine.didGetDefaultTrendlineInfoAt(strTrendLine);
						var cursor = "";
						if(trendLineInfo && trendLineInfo.cursor) {
							cursor = trendLineInfo.cursor;
						}
						_self.SetMouseCursor(cursor, true);
					}
					catch(e) {
						console.error(e);
					}
				}
				//

				_self.m_bTrendLine = xUtils.trendLine.isDrawableTrendline(strTrendLine);
				if (!_self.m_bTrendLine) {
					var idx = 0;
					if (strTrendLine === xUtils.constants.trendLineCodes.deleteOne) {
						(function(argPanel){
							if(argPanel !== undefined && argPanel != null && argPanel.didRemoveSelectedLineTool !== undefined) {
								argPanel.didRemoveSelectedLineTool();
								_self.DrawingChartDrawFrame(true);
							}
						})(_self.GetDrawPanelAt(_self.m_iCanvasMouseDownIndex));
					}
					else if (strTrendLine === xUtils.constants.trendLineCodes.deleteAll) {
						_self.didRemoveAllLineTools(true);
						_self.DrawingChartDrawFrame(true);
					}

					// #1558
					_self.m_strTrendLine = strTrendLine;
					//
				}
				else {
					_self.m_strTrendLine = strTrendLine;
				}

				if(xUtils.didStateChangeOnTrendline(xEnv, _self.m_strTrendLine) == true) {
					_self.DrawingChartDrawFrame(false);
				}
			};
			// [end] #2566

			// #2585
			this.didProcessForDeleteKeyEvent = function(keyValue) {
			};
			//

			// #2360
			this.didProcForCursorForTrendline = function(strTrendLine, cursor) {
				// #2384
				_self.UnsetMouseCursor(); // #2384

				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.CursorConfig) {
					try {
						var trendLineInfo = xUtils.trendLine.didGetDefaultTrendlineInfoAt(strTrendLine);
						if(trendLineInfo && trendLineInfo.cursor) {
							cursor = trendLineInfo.cursor;
						}
						_self.SetMouseCursor(cursor, true);
					}
					catch(e) {
						console.error(e);
					}
				}
				else {
					_self.SetMouseCursor(cursor);
				}
				//
			};
			//

			// #2566
			this.didCheckOepPosInAxisArea = function(posval) {
			};
			// [end] #2566
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDrawPanelNormalCFD");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDrawPanelNormal"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDrawPanelNormal"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./chartDrawPanelNormal")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDrawPanelNormalCFD",
            ['ngc/chartUtil', 'ngc/chartDrawPanelNormal'],
                function(xUtils, layoutBaseClass) {
                    return loadModule(xUtils, layoutBaseClass);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDrawPanelNormal"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDrawPanelNormal"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDrawPanelNormalCFD");
})(this);
