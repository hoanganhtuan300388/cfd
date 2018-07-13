(function(global){
	"use strict";

	var loadModule = function(parentPanel, doFactory, gxDc, xUtils) {
	    "use strict";

	    /*
		 *
		 */
	    var exports = {};

		exports.panelNormal = function(chartWrapper, drawWrapper) {
			//
			// private
			//
			var _self          = this;
			var _doFactory     = doFactory;
			var _chartWrapper  = chartWrapper;
			var _drawWrapper   = drawWrapper;
			//var __self = this;

			this.prototype	   = new parentPanel.panelBase(chartWrapper, drawWrapper);
			parentPanel.panelBase.apply(this, arguments);

			//
			this.OBJECT_NAME = "NORMAL_FRAME";

			this.isNontime = false; // #2037

			/**
			 * トレンドラインオブジェクトを生成する。
			 * @param  {string} strTrendLine	トレンドライン名
			 * @param  {object} posval			位置
			 * @return {object}
			 */
			this.CreateTrendlineObj = function(strTrendLine, posval, trendLineInfo, skipStore) {
				var __xDo = _self.didGetPriceBar();
				if(__xDo === undefined || __xDo == null) {
					//console.debug('CreateTrendlineObj => Fail to create line study because there is no parent object. (2) LS(' + strTrendLine + ')');
					return;
				}

				_self.m_currTrendlineObj = __xDo.CreateTrendlineObj(strTrendLine, posval, trendLineInfo, skipStore);

				return(_self.m_currTrendlineObj);
			};

			/**
	         * convert local index to data index
			 * @param[in] argLocalIdx	local index
			 * @return index
			 */
			this.didConvertLocalIndexToDataIndex = function(argLocalIdx) {
				return(this.m_drawWrapper.didConvertLocalIndexToDataIndex(argLocalIdx));
			};

			/**
	         * convert local index to data index
			 * @param[in] argLocalIdx	local index
			 * @return index
			 */
			this.didConvertDataIndexToLocalIndex = function(argDataIdx) {
				return(this.m_drawWrapper.didConvertDataIndexToLocalIndex(argDataIdx));
			};

			/**
			 * get time data at index
			 *
			 * @param[in] at at
			 * @param[in] bScreen screen index or data index
			 * @param[in] ignoreLimit	ignore limit or not
			 * @return time string(YYYYMMDDHHMMSS)
			 */
			this.didGetTimedataAt = function(at, bScreen, ignoreLimit) {
				return(this.m_drawWrapper.didGetTimedataAt(at, bScreen, ignoreLimit));
			};

			/**
			 * 特定指標（キー）の設定を修正する。
			 * @param  {string} argKey		key
			 * @param  {string} argSettings	JSON string
			 * @return {boolean}
			 */
			this.didChangeIndicatorSettingByKey = function(argKey, argSettings, outputChanged) {
				var xDo = _self.didFindObjectByKey(argKey);
				if(xDo === undefined || xDo == null) {
					return;
				}

				if(xDo.didApplySetting) {
					return(xDo.didApplySetting(argSettings, outputChanged));
				}
			};

			/**
			 * [description]
			 * @param  {[type]} argTypeId
			 * @return {[type]}
			 */
			this.didDeleteIndicator = function(argTypeId) {
				var nIndex = -1;
				var xDo;
				var xTargetInfo;
				var xResult = {
					typeId : argTypeId,
					isDeleted : false
				};
				if(argTypeId === undefined || argTypeId == null) {
					// 選択されたものに対して削除処理
					xTargetInfo = _self.didFindSelectedObject();
				}
				else {
					//
					xTargetInfo = _self.didFindFirstIndicatorObjectByTypeId(argTypeId);
				}

				if(xTargetInfo !== undefined && xTargetInfo != null && xTargetInfo.indicator !== undefined && xTargetInfo.indicator !== null) {
					xResult.typeId = xTargetInfo.indicator.m_strIndicator;
					if(_self.didClearDrawObjectAt(xTargetInfo.index) === true) {
						xResult.isDeleted = true;

						return(xResult);
					}
				}

				return;
			};

			/**
			 * 特定指標（タイプID）の設定を修正する。
			 * @param  {string} argTypeId	type id
			 * @param  {string} argSettings	JSON string
			 * @return {boolean}
			 */
			this.didChangeIndicatorSettingByTypeId = function(argTypeId, argSettings, outputChanged) {
				var arrResult = _self.didFindIndicatorObjectsByTypeId(argTypeId);
				if(arrResult === undefined || arrResult == null || arrResult.length === undefined || arrResult.length == null || arrResult.length < 1) {
					return(false);
				}

				var bResult = false;
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.MultipleSeries === true) {
					var nCount = arrResult.length;

					for(var ii = 0; ii < nCount; ii++) {
						var xResult = arrResult[ii];
						if(xResult === undefined || xResult == null) {
							continue;
						}
						var xDo = xResult.indicator;
						if(xDo && xDo.didApplySetting) {
							bResult |= xDo.didApplySetting(argSettings, outputChanged);
						}
					}
				}
				else {
					var xResult = arrResult[0];
					if(xResult !== undefined && xResult != null) {
						var xDo = xResult.indicator;
						if(xDo && xDo.didApplySetting) {
							bResult = xDo.didApplySetting(argSettings, outputChanged);
						}
					}
				}

				return(bResult);
			};

			/**
			 * チャート上の指標リスト情報を取得する。
			 * added by choi sunwoo at 2017.05.08 for #708
			 * @param  {Boolean} isReferenced	参照またはバリュー
			 * @param  {Boolean} isPriceType	価格系
			 * @return {object}
			 */
			this.didGetCurrentLiveIndicatorInformationAll = function(isReferenced, isPriceType) {
				//
				// #708
				//
				var arrOutput = [];

				var __nObjectCount = _self.m_arrChartObjlist.length;
				for(var ii = 0; ii < __nObjectCount; ii++) {
					var xDo = _self.m_arrChartObjlist[ii];
					if(xDo && xDo.m_xSeriesInfo) {
						if(isPriceType === true && xDo.m_xSeriesInfo.priceType === true) {
							arrOutput.push({key:xDo.uniqueKey, info:xDo.m_xSeriesInfo});
							/*
							if(isReferenced === true) {
								arrOutput.push(JSON.stringify({key:xDo.uniqueKey, info:xDo.m_xSeriesInfo}));
							}
							else {
								arrOutput.push(JSON.stringify({key:xDo.uniqueKey, info:xUtils.didClone(xDo.m_xSeriesInfo)}));
							}
							*/
						}
						else if(isPriceType !== true && xDo.m_xSeriesInfo.priceType !== true) {
							arrOutput.push({key:xDo.uniqueKey, info:xDo.m_xSeriesInfo});
							/*
							if(isReferenced === true) {
								arrOutput.push(JSON.stringify({key:xDo.uniqueKey, info:xDo.m_xSeriesInfo}));
							}
							else {
								arrOutput.push(JSON.stringify({key:xDo.uniqueKey, info:xUtils.didClone(xDo.m_xSeriesInfo)}));
							}
							*/
						}
					}
				}

				return(arrOutput);
			};

			// #1779
			this.DrawTitleLabel = function() {
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseForMiniChart !== true && xEnv.ShowTitleLabel === true && _self.m_initParam.showLegend === true) {
					var __nObjectCount = _self.m_arrChartObjlist.length;
					if(__nObjectCount > 0) {
						var lineSpace = xEnv.System.LineSpace;
						var textSpace = xEnv.System.TextSpace;
						var context   = _self.m_context;
						var font      = xEnv.Font;
						var fontColor = xEnv.FontColor;
						var textSpace = xEnv.System.TextSpace;

						var drawParam = {
							context : _self.m_context,
							ptBase : {
								x : xEnv.TitleLeft || 60,
								y : xEnv.TitleTop  || 20
							},
							frameWidth : _self.didGetDrawingWidth(true), // #3284
							font : font,
							fillStyle : fontColor,
							lineSpace : lineSpace,
							textSpace : textSpace,
							lineNo    : 0,
							pt : {
								x : 0,
								y : 0
							}
						};

						drawParam.pt.x = drawParam.ptBase.x;
						drawParam.pt.y = drawParam.ptBase.y;

						for (var idx = __nObjectCount - 1; idx >= 0; idx--) {
							var doChartObj = _self.m_arrChartObjlist[idx];
							if(doChartObj && doChartObj.didDrawTitleLabel) {
								doChartObj.didDrawTitleLabel(drawParam);
							}
						}
					}
				}
			};
			//
		};

	    exports.createPanel = function(chartWrapper, drawWrapper) {
	        return(new this.panelNormal(chartWrapper, drawWrapper));
	    };

	    return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDrawFrameNormal");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDrawFrameNormal"] =
            loadModule(
                global["WGC_CHART"]["chartDrawFrameBase"],
				global["WGC_CHART"]["chartDOFactory"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartUtil"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartDrawFrameBase"),
				require("./chartDOFactory"),
				require("./canvas2DUtil"),
				require("./chartUtil")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDrawFrameNormal",
            ['ngc/chartDrawFrameBase', 'ngc/chartDOFactory', 'ngc/canvas2DUtil', 'ngc/chartUtil'],
                function(parentPanel, doFactory, gxDc, xUtils) {
                    return loadModule(parentPanel, doFactory, gxDc, xUtils);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDrawFrameNormal"] =
            loadModule(
                global["WGC_CHART"]["chartDrawFrameBase"],
				global["WGC_CHART"]["chartDOFactory"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartUtil"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDrawFrameNormal");
})(this);
