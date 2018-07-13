(function(global){
	"use strict";

	var loadModule = function(xUtils, layoutPanelNormalClass) {
		"use strict";

		var exports = function(chartWrapper) {
			//
			// private
			//
			var _self = this;
			var _chartWrapper = chartWrapper;
			var _layoutPanelNormalClass = layoutPanelNormalClass;

			var _combineKey = null;

			//
			this.m_xDoBasePrice = null;
			this.m_xNormalLayout = null;
			this.m_xNontimeLayout = null;
			this.m_xCurrentLayout = null;

			this.m_classNormalLayout = layoutPanelNormalClass;

			//
			this.m_stEnv = xUtils.constants.didGetClonedDefaultChartConfig();


			//
			// #708
			this.m_xSeriesInfos = xUtils.indicator.didGetDefaultSeriesInfos();

			//
			this.m_xTrendlineInfos = xUtils.trendLine.didGetDefaultTrendlineInfos();

			//
			// private methods
			//

			//
			// public methods
			//
			//
			this.didGetEnvInfo = function() {
				return(_self.m_stEnv);
			};

			//
			//
			//
			this.didSetFocusingFlag = function(argFocusing, argRefresh) {
				_self.m_stEnv.Focusing = argFocusing;
				if(argRefresh === true) {
					_self.DrawingChartDrawFrame(false);
				}
			};
			//

			/**
			 *
			 */
			this.DrawingChartDrawFrame = function(bResize) {
				_self.m_xCurrentLayout.DrawingChartDrawFrame(bResize);
			};

			this.hasExtraLayout = function() {
				return(false);
			};

			/**
			 *
			 */
			this.ResizeChart = function(bResize) {
				_self.m_xNormalLayout.ResizeChart(bResize);
				if(_self.hasExtraLayout() === true) {
					_self.m_xNontimeLayout.ResizeChart(bResize);
				}
			};

			/**
			 *
			 */
			this.didSetDefaultEnv = function(argSettings) {
				var xEnv = _self.didGetEnvInfo();
				//_self.m_stEnv.GoToEndPos = false;

				//
				if(argSettings !== undefined && argSettings != null) {
					if(typeof argSettings === "string") {
						try {
							argSettings = JSON.parse(argSettings);
						}
						catch(e) {
							console.error(e);
							argSettings = undefined;
						}
					}

					if(typeof argSettings === "object") {
						if(argSettings.System && typeof argSettings.System === "object") {
							var xSysSrc = argSettings.System;
							var xSysDst = xEnv.System;
							if(xSysSrc.UseContextMenu !== undefined && xSysSrc.UseContextMenu != null) {
								xSysDst.UseContextMenu = xSysSrc.UseContextMenu;
							}

							if(xSysSrc.UseScrollAction !== undefined && xSysSrc.UseScrollAction != null) {
								xSysDst.UseScrollAction = xSysSrc.UseScrollAction;
							}

							if(xSysSrc.ContextMenuOrderAll !== undefined && xSysSrc.ContextMenuOrderAll != null) {
								xSysDst.ContextMenuOrderAll = xSysSrc.ContextMenuOrderAll;
							}

							if(xSysSrc.UseRequestPreviousNext !== undefined && xSysSrc.UseRequestPreviousNext != null) {
								xSysDst.UseRequestPreviousNext = xSysSrc.UseRequestPreviousNext;
							}

							if(xSysSrc.UseOneClickOepMode !== undefined && xSysSrc.UseOneClickOepMode != null) {
								xSysDst.UseOneClickOepMode = xSysSrc.UseOneClickOepMode;
							}

							if(xSysSrc.DefaultPriceBar !== undefined && xSysSrc.DefaultPriceBar != null) {
								xSysDst.DefaultPriceBar = xSysSrc.DefaultPriceBar;
							}

							// #1290
							if(xSysSrc.UseObjectCrossline !== undefined && xSysSrc.UseObjectCrossline != null) {
								xSysDst.UseObjectCrossline = xSysSrc.UseObjectCrossline;
							}

							// #1457
							if(xSysSrc.Scroll !== undefined && xSysSrc.Scroll != null) {
								if(xSysSrc.Scroll.zoom !== undefined && xSysSrc.Scroll.zoom != null) {
									try {
										// #1297
										if(xSysDst.Scroll.screenSize.max !== undefined && xSysDst.Scroll.screenSize.max != null) {
											if(xSysDst.Scroll.screenSize.min <= xSysSrc.Scroll.zoom && xSysSrc.Scroll.zoom <= xSysDst.Scroll.screenSize.max) {
												xSysDst.Scroll.zoom = xSysSrc.Scroll.zoom;
											}
										}
										else {
											if(xSysDst.Scroll.screenSize.min <= xSysSrc.Scroll.zoom) {
												xSysDst.Scroll.zoom = xSysSrc.Scroll.zoom;
											}
										}
										//
									}
									catch(e) {
										console.error(e);
									}
								}
							}
							//

							// #1495
							if(xSysSrc.UseMouseWheel !== undefined && xSysSrc.UseMouseWheel != null) {
								xSysDst.UseMouseWheel = xSysSrc.UseMouseWheel;
							}
							// [end] #1495

							// #1524
							if(xSysSrc.OepMouseCursor !== undefined && xSysSrc.OepMouseCursor != null) {
								xSysDst.OepMouseCursor = xSysSrc.OepMouseCursor;
							}
							// [end] #1524

							// #1557
							if(xSysSrc.AllowSmoothScroll !== undefined && xSysSrc.AllowSmoothScroll != null) {
								xSysDst.AllowSmoothScroll = xSysSrc.AllowSmoothScroll;
							}
							// [end] #1557
							// #1671
							if(xSysSrc.ContainerSelect !== undefined && xSysSrc.ContainerSelect != null) {
								xSysDst.ContainerSelect = xSysSrc.ContainerSelect;
							}
							if(xSysSrc.IndicatorSelect !== undefined && xSysSrc.IndicatorSelect != null) {
								xSysDst.IndicatorSelect = xSysSrc.IndicatorSelect;
							}
							// [end] #1671

							// #2061
							if(xSysSrc.UseDoubleClick !== undefined && xSysSrc.UseDoubleClick != null) {
								xSysDst.UseDoubleClick = xSysSrc.UseDoubleClick;
							}
							// [end] #2061

							// #2247
							if(xSysSrc.UseForMiniChart !== undefined && xSysSrc.UseForMiniChart != null) {
								xSysDst.UseForMiniChart = xSysSrc.UseForMiniChart;

								if(xSysDst.UseForMiniChart === true) {
									var xEnvDst = xEnv;
									xSysDst.YAxisRight = 0;
									xSysDst.Scroll.zoom = 10;

									xEnvDst.ChartType = "Line";

									xEnvDst.MarginRight = "0";
									xEnvDst.MarginTopBottom = "10";

									xEnvDst.ExtraPanelWidth = 0;
									xEnvDst.ConfigAxis.ShowRight = false;
									xEnvDst.CrossLine.hide = true;
									xEnvDst.MinMaxTooltipShow = false;
									xEnvDst.HideAskBid = true;

									xEnvDst.ConfigAxis.GridShow = false;

									xEnvDst.BorderColor     =
									xEnvDst.BackgroundColor = "rgba(255, 255, 255, 0)";

									xEnvDst.MiniChartConfig = {
										LineColor: "#00e6e6",
										BgColor1 : "#0088cc",
										BgColor2 : "rgba(0, 77, 153, 0.6)",
									};

									xSysDst.DefaultTrendline = xUtils.constants.trendLineCodes.pointer; // #2566
								}
							}
							// [end] #2247
						}
					}
				}

				// //
				// // site default
				// //
				// if(xEnv.System.DefaultPriceBar === "cfd") {
				// 	xEnv.System.UseContextMenu = true;
				// 	xEnv.System.UseMouseWheel = false;
				// 	xEnv.System.AllowSmoothScroll = false;
				// 	xEnv.System.DontMoveOnTrendlineSelectMode = true;
				// }
				// else if(xEnv.System.DefaultPriceBar === "compare") {
				// 	xEnv.System.UseObjectCrossline = true;
				// }
			};

			/**
			 * [description]
			 * @param  {[type]} argPlotStyleInfos
			 * @return {[type]}
			 */
			this.didApplyPlotStyleInfos = function(argPlotStyleInfos) {
				if(argPlotStyleInfos === undefined || argPlotStyleInfos == null) {
					return(false);
				}

				var xPsis;

				if(typeof argPlotStyleInfos === "string") {
					xPsis = JSON.parse(argPlotStyleInfos);
				}
				else {
					xPsis = argPlotStyleInfos;
				}

				if(xPsis.length === undefined || xPsis.length == null || xPsis.length < 1) {
					return(false);
				}

				var nCount = xPsis.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPsi = xPsis[ii];
					if(xPsi) {
						_didApplySeriesInfo(xPsi.code, xPsi.info);
					}
				}

				return(true);
			};

			this.didRemoveNontimeLayout = function() {
				if(_self.hasExtraLayout() === true) {
					_self.m_xCurrentLayout = _self.m_xNormalLayout;

					_self.m_xNontimeLayout.OnDestroy();
					delete _self.m_xNontimeLayout;

					_self.m_xNontimeLayout = null;
				}
			};

			/**
			 *
			 */
			this.didCreateLayout = function(isNontime) {
				/*
				if(_self.hasExtraLayout() === true) {

				}
				else {
					//
					_self.m_xNormalLayout = new _layoutPanelNormalClass(_chartWrapper, _self);
					_self.m_xCurrentLayout = _self.m_xNormalLayout;
				}
				*/
				_self.didRemoveNontimeLayout();

				var __xDoBasePrice = null;

				//
				_self.m_xNormalLayout = new _layoutPanelNormalClass(_chartWrapper, _self);
				_self.m_xCurrentLayout = _self.m_xNormalLayout;

				//
				_self.m_xCurrentLayout.didInitDrawPanelLayout(__xDoBasePrice);
			};

			/**
			 * Init
			 */
			this.didInitCtrlLayout = function(argSettings, argPlotStyleInfos) {
				// set default env.
				_self.didSetDefaultEnv(argSettings);

				//
				_self.didApplyPlotStyleInfos(argPlotStyleInfos);

				//
				_self.didCreateLayout(false);
			};

			/**
			 *
			 */
			this.GetCurrentSymbolPointValue = function() {
				var __symbolInfo = _self.m_xDoBasePrice.m_symbolInfo;

				if(__symbolInfo === undefined || __symbolInfo === null) {
					return(3);
				}

				if(__symbolInfo.verpos === undefined || __symbolInfo.verpos === null) {
					return(3);
				}

				return(__symbolInfo.verpos);
			};

			/**
			 *
			 */
			this.didShowAllNormalFrame = function(bShow) {
				if(_self.m_xNormalLayout.m_domElemChartDraw !== undefined) {
					if(bShow === true) {
						_self.m_xNormalLayout.m_domElemChartDraw.style.visibility = "visible";
					}
					else {
						_self.m_xNormalLayout.m_domElemChartDraw.style.visibility = "hidden";
					}
				}
			};

			/**
			 * change chart type origin is OnMenuBasicChartClick
			 *
			 * @param[in] strBasicChart chart type
			 */
			this.didChangeBasicChartType = function(strBasicChart) {
				var xEnv = _self.didGetEnvInfo();
				if(xUtils.isAvailableToUseChartType(xEnv, strBasicChart) !== true) {
					return;
				}

				// #2583
				if(strBasicChart != xUtils.constants.chartTypeCode.candle && strBasicChart != xUtils.constants.chartTypeCode.line) {
					strBasicChart = xUtils.constants.chartTypeCode.candle;
				}

				_self.m_stEnv.ChartType = strBasicChart;

				var __bRecalc = false;

				//
				_self.m_xCurrentLayout.didChangeBasicChartType(strBasicChart, __bRecalc);
				// [end] #2583

				//
				_self.RecalcProc(xUtils.constants.ngcl.enum.EUS_CHANGE_LAYOUT);

				//
				_self.ResizeChart(true);

				return(true);
			};

	        /**
	         * clear data
	         *
	         * just clear datas
	         */
	        this.didClearDatas = function() {
	        	_self.m_xNormalLayout.didClearDatas();
				if(_self.hasExtraLayout() === true) {
					_self.m_xNormalLayout.didClearDatas();
				}
	        };

			//
			this.didClearOrderPositObjects = function(isOrder, isPosit) {
				_self.m_xNormalLayout.didClearOrderPositObjects(isOrder, isPosit);
			};

			// #2032
			this.didClearExecutionObjects = function() {
				_self.m_xNormalLayout.didClearExecutionObjects();
			};
			this.didClearAlertObjects = function() {
				_self.m_xNormalLayout.didClearAlertObjects();
			};
			//

	        /**
	         * if return value is true, you need to refresh screen
	         * @param[in] bFlag	true or false
	         * @return true or false
	         */
	        this.didRemoveAllLineTools = function(bFlag) {
	        	_self.m_xNormalLayout.didRemoveAllLineTools(bFlag);
				if(_self.hasExtraLayout() === true) {
					_self.m_xNormalLayout.didRemoveAllLineTools(bFlag);
				}
	        };

			// #1878
			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedAlertExecutionData = function(isAlertOrExecution, receivedDatas) {
				_self.m_xNormalLayout.willBeReceivedAlertExecutionData(isAlertOrExecution, receivedDatas);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveAlertExecutionData = function(isAlertOrExecution, receivedDatas) {
				_self.m_xNormalLayout.didReceiveAlertExecutionData(isAlertOrExecution, receivedDatas);
			};
			// [end] #1878

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedOrderPositData = function(isOrderOrPosit, receivedDatas) {
				_self.m_xNormalLayout.willBeReceivedOrderPositData(isOrderOrPosit, receivedDatas);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveOrderPositData = function(isOrderOrPosit, receivedDatas) {
				_self.m_xNormalLayout.didReceiveOrderPositData(isOrderOrPosit, receivedDatas);
			};

			/**
			 * 1. clear request information
	         * 2. clear base price data
	         * 3. clear extra price data
	         * 4. clear indicator data
	         * 5. clear drawing factors
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedData = function(symbolInfo, receivedDatas, nextCount, multiTargetId) {
				_self.m_xNormalLayout.willBeReceivedData(symbolInfo, receivedDatas, nextCount, multiTargetId);
				if(_self.hasExtraLayout() === true) {
					_self.m_xNontimeLayout.willBeReceivedData(symbolInfo, receivedDatas, nextCount, multiTargetId);
				}
			};

			/**
			 * 1. set request information
			 * 2. set received data
			 * 3. set extra price data
			 *
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveData = function(symbolInfo, receivedDatas, nextCount, multiTargetId) {
				_self.m_xNormalLayout.didReceiveData(symbolInfo, receivedDatas, nextCount, multiTargetId);
				if(_self.hasExtraLayout() === true) {
					_self.m_xNontimeLayout.didReceiveData(symbolInfo, receivedDatas, nextCount, multiTargetId);
				}
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedRealData = function(receivedData, multiTargetId) {
				_self.m_xNormalLayout.willBeReceivedRealData(receivedData, multiTargetId);
				if(_self.hasExtraLayout() === true) {
					_self.m_xNontimeLayout.willBeReceivedRealData(receivedData, multiTargetId);
				}
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveRealData = function(receivedData, multiTargetId) {
				_self.m_xNormalLayout.didReceiveRealData(receivedData, multiTargetId);
				if(_self.hasExtraLayout() === true) {
					_self.m_xNontimeLayout.didReceiveRealData(receivedData, multiTargetId);
				}
			};

			/**
			 * scroll
			 *
			 * @param[in] nDelta delta
			 */
			this.didScrollScreen = function(nDelta, bDraw) {
				_self.m_xCurrentLayout.didScrollScreen(nDelta, bDraw);
			};

			/**
			 *
			 */
			this.didZoomScreen = function(nDelta, bDraw) {
				_self.m_xCurrentLayout.didZoomScreen(nDelta, bDraw);
			};

			/**
			 * [didGetBasePriceDataInfo description]
			 * @return {[type]}
			 */
			this.didGetBasePriceDataInfo = function(id) {
				var datas = _self.m_xNormalLayout.didGetReferencedPriceDatas(id);
				var times = _self.m_xNormalLayout.didGetTimeDatas(id);

				var result = {
					datas : datas,
					times : times
				};

				return(result);
			};

			/**
			 * チャート上の指標リスト情報を取得する。
			 * added by choi sunwoo at 2017.05.08 for #708
			 * @return {object}
			 */
			this.didGetCurrentIndicatorInformationAll = function(isSave, all) {
				var xEnv = _self.didGetEnvInfo();

				//return(xUtils.didClone(_self.m_xSeriesInfos));
				var count;
				var indicators;
				var xResult = {
					trend : [],
					oscillator : []
				};

				// トレンド系
				indicators = _self.m_xSeriesInfos.trend;
				count = indicators.length;
				for(var ii = 0; ii < count; ii++) {
					var xSeriesInfo = indicators[ii];
					if(isSave === true && all !== true && xSeriesInfo.show !== true) {
						continue;
					}

					var xInfo = xUtils.indicator.didConvertToShortSeriesInformation(xSeriesInfo.info, isSave);
					if(xInfo) {
						var xItem;
						if(isSave) {
							 xItem = {
								c : xSeriesInfo.code,
								s : xSeriesInfo.show,
								i : xInfo
							};
						}
						else {
							xItem = {
								code : xSeriesInfo.code,
								show : xSeriesInfo.show,
								info : xInfo
							};
						}
						xResult.trend.push(xItem);
					}
				}

				var ocillators = [];

				// オシレーター系
				indicators = _self.m_xSeriesInfos.oscillator;
				count = indicators.length;
				for(var ii = 0; ii < count; ii++) {
					var xSeriesInfo = indicators[ii];
					if(isSave === true && all !== true && xSeriesInfo.show !== true) {
						continue;
					}

					var xInfo = xUtils.indicator.didConvertToShortSeriesInformation(xSeriesInfo.info, isSave);
					if(xInfo) {
						var xItem;
						if(isSave) {
							 xItem = {
								c : xSeriesInfo.code,
								s : xSeriesInfo.show,
								i : xInfo
							};
						}
						else {
							xItem = {
								code : xSeriesInfo.code,
								show : xSeriesInfo.show,
								info : xInfo
							};
						}

						if(xSeriesInfo.show === true) {
							ocillators.push(xSeriesInfo.code);
						}

						xResult.oscillator.push(xItem);
					}
				}

				//
				// #836
				xResult.disableSetting = _self.hasExtraLayout();
				//

				//
				// #921
				xResult.chartType = xEnv.ChartType;

				//
				//
				//
				xResult.osl = _self.didGetOrderingInfoForIndicators(ocillators);

				//
				xResult.isSave = isSave;

				//
				if(isSave === true && all === true) {
					xResult.isAll = true;
				}

				//
				return(xResult);
			};

			/**
			 * チャート上の指標リスト情報を取得する。
			 * added by choi sunwoo at 2017.05.08 for #708
			 * @return {object}
			 */
			this.didSetCurrentIndicatorInformationAll = function(argInfo) {
				if(argInfo === undefined || argInfo == null) {
					return(false);
				}

				// remove all indicators
				_self.didDeleteAllIndicators();

				//
				if(typeof argInfo === "string") {
					argInfo = JSON.parse(argInfo);
				}

				try {
					var isAll  = argInfo.isAll;

					var isSave = argInfo.isSave;

					var xEnv = _self.didGetEnvInfo();

					//return(xUtils.didClone(_self.m_xSeriesInfos));
					var count;
					var indicators;
					var xResult = {
						trend : [],
						oscillator : [],
						osl : argInfo.osl
					};

					if(isSave === true) {
						// トレンド系
						indicators = argInfo.trend;
						count = indicators.length;
						for(var ii = 0; ii < count; ii++) {
							var xSsi = indicators[ii];
							if(isAll !== true && xSsi.s !== true) {
								continue;
							}
							var xSeriesInfo = _self.didGetRestoreIndicatorInformationByTypeId(xSsi.c);	// #1793
							var xInfo = xUtils.indicator.didDecodeSeriesInformation(xSeriesInfo, xSsi);
							if(xInfo) {
								var xItem;
								xItem = {
									code : xSsi.c,
									show : xSsi.s,
									info : xInfo
								};

								xResult.trend.push(xItem);
							}
						}

						// オシレーター系
						indicators = argInfo.oscillator;
						count = indicators.length;
						for(var ii = 0; ii < count; ii++) {
							var xSsi = indicators[ii];
							if(isAll !== true && xSsi.s !== true) {
								continue;
							}
							var xSeriesInfo = _self.didGetRestoreIndicatorInformationByTypeId(xSsi.c);	// #1793
							var xInfo = xUtils.indicator.didDecodeSeriesInformation(xSeriesInfo, xSsi);
							if(xInfo) {
								var xItem;
								xItem = {
									code : xSsi.c,
									show : xSsi.s,
									info : xInfo
								};

								xResult.oscillator.push(xItem);
							}
						}
					}
					else {
						xResult.trend = argInfo.trend;
						xResult.oscillator = argInfo.oscillator;
					}
				}
				catch(e) {
					console.error(e);
				}

				try {
					// trend
					if(xResult.trend) {
						var nCount = xResult.trend.length;
						for(var ii = 0; ii < nCount; ii++) {
							var xSi = xResult.trend[ii];
							if(xSi) {
								if(xSi.show === true) {
									var code = xSi.code;
									_self.didAddIndicator(code, xSi.info);	// #1793
								}
								else if(isAll === true) {
									var code = xSi.code;
									_didApplySeriesInfo(code, xSi.info);
								}
							}
						}
					}

					// oscillator
					if(xResult.osl) {
						var nCount = xResult.osl.length;
						for(var ii = 0; ii < nCount; ii++) {
							var list = xResult.osl[ii];
							var nSCount = list.length;
							for(var jj = 0; jj < nSCount; jj++) {
								var code = list[jj];
								var xSi = xUtils.indicator.didFindSeriesInfoWithTypeId(code, xResult, false);
								if(xSi) {
									if(xSi.show === true) {
										var code = xSi.code;
										_self.didAddIndicator(code, xSi.info);	// #1793
									}
									else if(isAll === true) {
										var code = xSi.code;
										_didApplySeriesInfo(code, xSi.info);
									}
								}
							}

						}
					}
				}
				catch(e) {
					console.error(e);
				}

				//
				return(xResult);
			};

			var _didGetAllIndicatorListIsShown = function() {
				try {
					var xEnv = _self.didGetEnvInfo();

					//return(xUtils.didClone(_self.m_xSeriesInfos));
					var count;
					var indicators;
					var arrList = [];

					// トレンド系
					indicators = _self.m_xSeriesInfos.trend;
					count = indicators.length;
					for(var ii = 0; ii < count; ii++) {
						var xSeriesInfo = indicators[ii];
						if(xSeriesInfo.show === true) {
							arrList.push(xSeriesInfo.code);
						}
					}

					// オシレーター系
					indicators = _self.m_xSeriesInfos.oscillator;
					count = indicators.length;
					for(var ii = 0; ii < count; ii++) {
						var xSeriesInfo = indicators[ii];
						if(xSeriesInfo.show === true) {
							arrList.push(xSeriesInfo.code);
						}
					}

					//
					return(arrList);
				}
				catch(e) {
					// // console.debug("[WGC] :" + error);
				}
				return;
			};

			this.didDeleteAllIndicators = function() {
				var list = _didGetAllIndicatorListIsShown();
				if(list) {
					var nCount = list.length;
					for(var ii = 0; ii < nCount; ii++) {
						var code = list[ii];
						_self.didDeleteIndicatorByTypeId(code);
					}
				}

				return(true);
			};

			this.didGetOrderingInfoForIndicators = function(argList) {
				if(_self.m_xNormalLayout && _self.m_xNormalLayout.didGetOrderingInfoForIndicators) {
					return(_self.m_xNormalLayout.didGetOrderingInfoForIndicators(argList));
				}
			};

			/**
			 * チャート上の特定（タイプID）指標情報を取得する。
			 * added by choi sunwoo at 2017.05.10 for #708
			 * @return {string}
			 */
			this.didGetCurrentIndicatorInformationByTypeId = function(argTypeId, isSave) {
				var xSeriesInfo = _didFindSeriesInfo(argTypeId);
				if(xSeriesInfo === undefined || xSeriesInfo == null) {// || xSeriesInfo.show !== true) {
					return;
				}

				var xInfo = xUtils.indicator.didConvertToShortSeriesInformation(xSeriesInfo.info, isSave);
				if(xInfo) {
					var xResult = {
						code : xSeriesInfo.code,
						show : xSeriesInfo.show,
						info : xInfo
					};

					return(xResult);
				}
			};

			/**
			 * 特定指標（キー）を削除する。
			 * @param  {string} argTypeId		type id
			 * @return {boolean}
			 */
			this.didDeleteIndicatorByTypeId = function(argTypeId) {
				var xSeriesInfo = _didFindSeriesInfo(argTypeId);
				if(xSeriesInfo === undefined || xSeriesInfo == null || xSeriesInfo.show !== true) {
					return(false);
				}

				//
				// #833
				var xDeletedResult = _self.m_xNormalLayout.didDeleteIndicatorByTypeId(argTypeId);
				if(xDeletedResult.isDeleted === true) {
					xSeriesInfo.show = false;
				}

				return(xDeletedResult);
				//
			};

			var _didUpdateForDeletingIndicator = function(argTargetInfo) {
				if(argTargetInfo !== undefined && argTargetInfo != null) {
					var xSeriesInfo = _didFindSeriesInfo(argTargetInfo.typeId);
					if(xSeriesInfo === undefined || xSeriesInfo == null || xSeriesInfo.show !== true || !xSeriesInfo.info) {
						return;
					}

					if(argTargetInfo.isDeleted === true) {
						xSeriesInfo.show = false;
					}

					// #995
					var xResult = {
						typeId : argTargetInfo.typeId,
						isDeleted : argTargetInfo.isDeleted,
						trend : xSeriesInfo.info.priceType === true ? true : false
					};

					return(xResult);
				}
			};

			this.didNotifyForDeletingIndicator = function(argTargetInfo) {
				var xResult = _didUpdateForDeletingIndicator(argTargetInfo);

				if(xResult !== undefined && xResult != null) {
					return(_chartWrapper.didReflectCallForIndicatorIsDeleted(xResult));
				}
			};

			this.didNotifyForError = function(argErrorCode) {
				return(_chartWrapper.didReflectCallForError(argErrorCode));
			};

			this.didNotifyForTrendline = function(argInfo) {
				return(_chartWrapper.didReflectCallForTrendline(argInfo));
			};

			// #2061
			this.didNotifyForDoubleClick = function(argInfo) {
				return(_chartWrapper.didReflectCallForDoubleClick(argInfo));
			};
			//

			/**
			 * 選択された指標を削除する。
			 * @return {boolean}
			 */
			this.didDeleteSelectedIndicator = function() {
				var xResult = _self.m_xNormalLayout.didDeleteSelectedIndicator();

				return(_didUpdateForDeletingIndicator(xResult));
			};

			/**
			 * 特定指標（キー）の設定を修正する。
			 * @param  {string} argKey		key
			 * @param  {string} argSettings	JSON string
			 * @return {boolean}
			 */
			this.didChangeIndicatorSettingByKey = function(argKey, argSettings) {
				if(_self.m_xNormalLayout && _self.m_xNormalLayout.didChangeIndicatorSettingByKey) {
					return(_self.m_xNormalLayout.didChangeIndicatorSettingByKey(argKey, argSettings));
				}
			};

			/**
			 * 特定指標（タイプID）の設定を修正する。
			 * @param  {string} argTypeId	type id
			 * @param  {string} argSettings	JSON string
			 * @return {boolean}
			 */
			this.didChangeIndicatorSettingByTypeId = function(argTypeId, argSettings, argIsApplyInfo) {
				var typeId;
				var settings;

				if(argIsApplyInfo === true) {
					var xResult  = _didApplySeriesInfo(argTypeId, argSettings);

					typeId   = xResult.typeId;
					settings = xResult.settings;

					// リスト上にあるかをチェックする。
					var xSeriesInfo = xResult.seriesInfo;
					if(xSeriesInfo === undefined || xSeriesInfo == null) {
						return(false);
					}
				}
				else {
					typeId = argTypeId;
					settings = argSettings;
				}

				if(_self.m_xNormalLayout && _self.m_xNormalLayout.didChangeIndicatorSettingByTypeId) {
					return(_self.m_xNormalLayout.didChangeIndicatorSettingByTypeId(typeId, settings));
				}
			};

			//
			// On_ handler
			//

			/**
			 * onmousedown handler
			 *
			 * @param[in] posval {XPos:0, YPos:0}
			 *
			 */
			this.OnMouseDown = function(posval, argEvent, isAxisArea, actionArea) {
				return(_self.m_xCurrentLayout.OnMouseDown(posval, argEvent, isAxisArea, actionArea));
			};

			/**
			 * onmouseup handler
			 *
			 * @param[in] posval {XPos:0, YPos:0}
			 */
			this.OnMouseUp = function(posval, argEvent, isAxisArea) {
				_self.m_xCurrentLayout.OnMouseUp(posval, argEvent, isAxisArea);
			};

			/**
			 * onmousemove handler
			 *
			 * @param[in] posval {PosX:0, PosY:0}
			 */
			this.OnMouseMove = function(posval, isAxisArea, actionArea) {
				// #1524
				_self.m_xCurrentLayout.OnMouseMove(posval, isAxisArea, actionArea);
				//

				var arrInfos = [];
				_self.m_xCurrentLayout.didSetDataViewInfo(arrInfos);

				if(_chartWrapper.didReflectCallForDataViewInfo) {
					_chartWrapper.didReflectCallForDataViewInfo({datas: arrInfos});
				}
			};

			/**
			 * drawover handler
			 *
			 * @param[in] posval {XPos:0, YPos:0}
			 */
			this.OnDragOver = function(posval) {
				_self.m_xCurrentLayout.OnDragOver(posval);
			};

			/**
			 * mousewheel event handler
			 * @param[in] posval	{Delta}
			 */
			this.OnMouseWheel = function(posval) {
				// #1495
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseMouseWheel !== true) {
					return;
				}
				// [end] #1495

				_self.m_xCurrentLayout.OnMouseWheel(posval);
			};

			/**
			 * keydown handler
			 *
			 * @param[in] posval {XPos:0, YPos:0}
			 */
			this.OnKeyDown = function(keyValue) {
				var isCombineKey = xUtils.constants.keyEvent.isCombineKey(keyValue);
				if(isCombineKey === true) {
					_combineKey = keyValue;

					return;
				}

				_self.m_xCurrentLayout.OnKeyDown(keyValue, _combineKey);

				_combineKey = null;
			};

			/**
			 * ondoubleclick handler
			 */
			this.OnDoubleClick = function(posval, argEvent, isAxisArea) { // #2061
				_self.m_xCurrentLayout.OnDoubleClick(posval, argEvent, isAxisArea); // #2061
			};

			/**
			 * @param[in] event			event
			 */
			this.OnSwipe = function(event) {
				_self.m_xCurrentLayout.OnSwipe(event);
			};

			/**
			 *
			 */
			this.OnDestroy = function() {
				_self.m_xCurrentLayout = null;

				_self.m_xNormalLayout.OnDestroy();
				if(_self.hasExtraLayout() === true) {
					_self.m_xNontimeLayout.OnDestroy();
				}

				delete _self.m_xNormalLayout;
				_self.m_xNormalLayout = null;

				if(_self.hasExtraLayout() === true) {
					delete _self.m_xNontimeLayout;
					_self.m_xNontimeLayout = null;
				}
			};

			this.OnContextMenu = function(posval, contextMenu, isAxisArea, actionArea) {
				// #1147
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseContextMenu !== true) {
					return;
				}

				if(_self.hasExtraLayout() === true) {
					return;
				}

				_self.m_xNormalLayout.OnContextMenu(posval, contextMenu, isAxisArea, actionArea);
			};

			//
			// TODO: config
			//

			//
			// external call
			//

			/**
			 * change chart setting
			 *
			 * @param[in] argConfig environment
			 */
			this.didSetChartConfig = function(argConfig) {
				if(argConfig === undefined || argConfig == null) {
					return(false);
				}

				if(typeof argConfig === "string") {
					argConfig = JSON.parse(argConfig);
				}

				var	xEnv = _self.didGetEnvInfo();

				if(argConfig.priceColorUp !== undefined && argConfig.priceColorUp != null) {
					xEnv.PriceStyleConfig.OHLC.strokeUpColor 	=
					xEnv.PriceStyleConfig.HLC.strokeUpColor 	=
					xEnv.PriceStyleConfig.TLB.strokeUpColor 	=
					xEnv.PriceStyleConfig.KAGI.strokeUpColor 	=
					xEnv.PriceStyleConfig.RENKO.strokeUpColor 	=
					xEnv.PriceStyleConfig.PNF.strokeUpColor 	=
					xEnv.PriceStyleConfig.RCL.strokeUpColor 	=
					xEnv.PriceStyleConfig.Candle.strokeUpColor 	=
					xEnv.PriceStyleConfig.Candle.fillUpColor   	= argConfig.priceColorUp;
				}

				if(argConfig.priceColorDn !== undefined && argConfig.priceColorDn != null) {
					xEnv.PriceStyleConfig.OHLC.strokeDnColor 	=
					xEnv.PriceStyleConfig.HLC.strokeDnColor 	=
					xEnv.PriceStyleConfig.TLB.strokeDnColor 	=
					xEnv.PriceStyleConfig.KAGI.strokeDnColor 	=
					xEnv.PriceStyleConfig.RENKO.strokeDnColor 	=
					xEnv.PriceStyleConfig.PNF.strokeDnColor 	=
					xEnv.PriceStyleConfig.RCL.strokeDnColor 	=
					xEnv.PriceStyleConfig.Candle.strokeDnColor 	=
					xEnv.PriceStyleConfig.Candle.fillDnColor   	= argConfig.priceColorDn;
				}

				if(argConfig.priceColorLine !== undefined && argConfig.priceColorLine != null) {
					xEnv.PriceStyleConfig.RCL.strokeColor 		=
					xEnv.PriceStyleConfig.Line.strokeColor 		=
					xEnv.PriceStyleConfig.Candle.strokeColor 	= argConfig.priceColorLine;
				}

				if(argConfig.gridVert !== undefined && argConfig.gridVert != null) {
					xEnv.ConfigAxis.GridVertColor 	= argConfig.gridVert;
				}

				if(argConfig.gridHorz !== undefined && argConfig.gridHorz != null) {
					xEnv.ConfigAxis.GridHorzColor 	= argConfig.gridHorz;
				}

				if(argConfig.trendLine !== undefined && argConfig.trendLine != null) {
					xEnv.TrendlineColor =
					xEnv.CrossLine.lineStyle.strokeColor = argConfig.trendLine;
				}

				if(argConfig.leftAxis !== undefined && argConfig.leftAxis != null) {
					if(argConfig.leftAxis === true) {
						xEnv.System.YAxisLeft = xEnv.System.YAxisWidth;
					}
					else {
						xEnv.System.YAxisLeft = 0;
					}
				}

				if(argConfig.rightAxis !== undefined && argConfig.rightAxis != null) {
					if(argConfig.rightAxis === true) {
						xEnv.System.YAxisRight = xEnv.System.YAxisWidth;
					}
					else {
						xEnv.System.YAxisRight = 0;
					}
				}

				var bExtraRecalc = false;
				if(argConfig.nt_tlb !== undefined || argConfig.nt_tlb != null) {
					xEnv.PriceStyleConfig.TLB.params[0].value = argConfig.nt_tlb;

					bExtraRecalc = true;
				}

				if(argConfig.nt_rcl !== undefined || argConfig.nt_rcl != null) {
					xEnv.PriceStyleConfig.RCL.params[0].value = argConfig.nt_rcl;

					bExtraRecalc = true;
				}

				if(argConfig.nt_pnf !== undefined || argConfig.nt_pnf != null) {
					xEnv.PriceStyleConfig.PNF.params[0].value = argConfig.nt_pnf;

					bExtraRecalc = true;
				}

				if(argConfig.nt_kagi !== undefined || argConfig.nt_kagi != null) {
					xEnv.PriceStyleConfig.KAGI.params[0].value = argConfig.nt_kagi;

					bExtraRecalc = true;
				}

				if(argConfig.nt_renko !== undefined || argConfig.nt_renko != null) {
					xEnv.PriceStyleConfig.RENKO.params[0].value = argConfig.nt_renko;

					bExtraRecalc = true;
				}

				if(bExtraRecalc === true) {
					if(_self.hasExtraLayout() === true) {
						//_self.m_xNontimeLayout.didClearData();
						_self.m_xNontimeLayout.didReceiveDataExt();
					}
				}

				// #2216
				if(argConfig.GridShow !== undefined && argConfig.GridShow != null) {
					xEnv.ConfigAxis.GridShow = argConfig.GridShow;
				}

				if(argConfig.GridVertHide !== undefined && argConfig.GridVertHide != null) {
					xEnv.ConfigAxis.GridVertHide = argConfig.GridVertHide;
				}

				if(argConfig.GridHorzHide !== undefined && argConfig.GridHorzHide != null) {
					xEnv.ConfigAxis.GridHorzHide = argConfig.GridHorzHide;
				}

				if(argConfig.ShowCurrentPrice !== undefined && argConfig.ShowCurrentPrice != null) {
					xEnv.HideAskBid = argConfig.ShowCurrentPrice == true ? false : true;
				}

				if(argConfig.ShowHighLowPrice !== undefined && argConfig.ShowHighLowPrice != null) {
					xEnv.MinMaxTooltipShow = argConfig.ShowHighLowPrice;
				}
				//

				_self.ResizeChart(true);

				return(true);
			};

			/**
			 * change indicator setting
			 *
			 * @param[in] stIndeEnv
			 */
			this.OnIndiSettingEnv = function(stIndiEnv) {
				// TODO: setting indicator env.
				_self.m_xNormalLayout.OnIndiSettingEnv(stEnv);
				if(_self.hasExtraLayout() === true) {
					_self.m_xNontimeLayout.OnIndiSettingEnv(stEnv);
				}
			};


			var _didFindSeriesInfo = function(code) {
				if(code === undefined || code == null) {
					return;
				}

				var count;
				var indicators;

				// トレンド系
				indicators = _self.m_xSeriesInfos.trend;
				count = indicators.length;
				for(var ii = 0; ii < count; ii++) {
					var xSeriesInfo = indicators[ii];
					if(xSeriesInfo && code === xSeriesInfo.code) {
						return(xSeriesInfo);
					}
				}

				// オシレーター系
				indicators = _self.m_xSeriesInfos.oscillator;
				count = indicators.length;
				for(var ii = 0; ii < count; ii++) {
					var xSeriesInfo = indicators[ii];
					if(xSeriesInfo && code === xSeriesInfo.code) {
						return(xSeriesInfo);
					}
				}
			};

			var _didApplySeriesInfo = function(argTypeId, argSettings) {
				var xResult = {
					typeId : argTypeId,
					settings : argSettings,
					seriesInfo : null
				};

				// リスト上にあるかをチェックする。
				var xSeriesInfo = _didFindSeriesInfo(argTypeId);
				if(xSeriesInfo === undefined || xSeriesInfo == null) {
					return(xResult);
				}

				xResult.seriesInfo = xSeriesInfo;

				var xInfo;
				if(argSettings && typeof argSettings === "string") {
					xInfo = JSON.parse(argSettings);
				}
				else {
					xInfo = argSettings;
				}

				if(xInfo) {
					// 入力情報があればその情報に変更する。
					xUtils.indicator.didApplySeriesInfos(xSeriesInfo.info, xInfo);
				}

				xResult.settings = xSeriesInfo.info;

				return(xResult);
			};

			/**
			 * 指標を追加する。
			 * @param  {string} code
			 * @param  {string} info
			 * @return {boolean}
			 */
			this.didAddIndicator = function(code, info, isAdd) {
				// #940
				var xShowLists = _didGetAllIndicatorListIsShown();
				if(xShowLists !== undefined && xShowLists != null && xShowLists.length !== undefined && xShowLists.length != null) {
					if(xShowLists.length >= 10) {
						return(false);
					}
				}

				//
				// #836
				if(_self.hasExtraLayout() === true) {
					return(false);
				}
				//

				var xResult  = _didApplySeriesInfo(code, info);
				var typeId   = xResult.typeId;
				var settings = xResult.settings;

				// 追加式の場合はこのようにする。
				if(isAdd === true) {
					_self.m_xCurrentLayout.didAddIndicator(typeId, settings);

					return(true);
				}

				// ON/OFF 式

				// リスト上にあるかをチェックする。
				var xSeriesInfo = xResult.seriesInfo;
				if(xSeriesInfo === undefined || xSeriesInfo == null) {
					return(false);
				}

				// 現在、表示されている場合
				if(xSeriesInfo.show) {
					// 設定情報があれば設定適用する。
					if(settings) {
						return(_self.didChangeIndicatorSettingByTypeId(xSeriesInfo.code, xSeriesInfo.info));
					}

					return(true);
				}

				// 現在、表示されていない場合
				var bResult = _self.m_xCurrentLayout.didAddIndicator(xSeriesInfo.code, xSeriesInfo.info);
				if(bResult === true) {
					xSeriesInfo.show = true;
				}

				return(bResult);
			};

			this.didFindTrendlineInfoAt = function(trendLineCode) {
				if(trendLineCode === undefined || trendLineCode == null) {
					return;
				}

				var trendLineInfo;
				try {
					trendLineInfo = _self.m_xTrendlineInfos[trendLineCode];
				}
				catch(e) {
					trendLineInfo = undefined;
				}

				return(trendLineInfo);
			};

			this.didApplyTrendlineInfoAt = function(trendLineCode, color, text) {
				var trendLineInfo = _self.didFindTrendlineInfoAt(trendLineCode);
				if(trendLineInfo) {
					try {
						if(color !== undefined && color != null) {
							trendLineInfo.styles.lineColor = color;
						}
						if(text !== undefined && text != null && trendLineInfo.code === xUtils.constants.trendLineCodes.text) {
							if(trendLineInfo.textInfo === undefined || trendLineInfo.textInfo == null) {
								trendLineInfo.textInfo = {};
								trendLineInfo.textInfo.text = text;
							}
							trendLineInfo.textInfo.text = text; // #1796.97
						}

						return(trendLineInfo);
					}
					catch(e) {

					}
				}

				return;
			};

			/**
			 * [description]
			 * @param  {[type]} trendLineCode
			 * @return {[type]}
			 */
			this.didApplyTrendline = function(trendLineCode, isSelect, color, text) {
				if(isSelect !== true && xUtils.trendLine.isDrawableTrendline(trendLineCode) !== true) {
					_self.m_xCurrentLayout.OnTrendLineAdd(trendLineCode);
					return;
				}

				//
				if(isSelect === true) {
					// 選択されたオブジェクトを検索する。
					var selectedTrendline = _self.m_xCurrentLayout.didGetSelectedTrendlineInfo();
					if(selectedTrendline === undefined || selectedTrendline == null || selectedTrendline.ls === undefined || selectedTrendline.ls == null) {
						return;
					}

					try {
						if(selectedTrendline.ls.didApplySimpleAttribute(color, text) === true) {
							_self.DrawingChartDrawFrame(false);

							return(true);
						}
					}
					catch(e) {
						// TODO: log?!
					}

					return;
				}

				// 選択されたオブジェクトを検索する。
				try {
					var selectedTrendline = _self.m_xCurrentLayout.didGetSelectedTrendlineInfo();

					if(selectedTrendline && selectedTrendline.ls) {
						selectedTrendline.ls.m_bSelect = false;

						_self.DrawingChartDrawFrame(false);
					}
				}
				catch(e) {
					console.error(e);
				}

				var trendLineInfo = _self.didApplyTrendlineInfoAt(trendLineCode, color, text);

				//
				//_self.m_xCurrentLayout.OnTrendLineAdd(trendLineCode);
				// #1131
				_self.m_xNormalLayout.OnTrendLineAdd(trendLineCode);
			};

			/**
			 * do for action button
			 */
			this.didClick_ActionButton = function(strId) {
				_self.m_xCurrentLayout.didClick_ActionButton(strId);
			};

			//
			//
			//
			this.RecalcProc = function(nState, bFull) {
				//=========================================================================
			    // Recalculate screen's data size and start offset of the screen's data.
			    //=========================================================================
				var	nStart	= 0 ,	// Data Start Offset
					nSize	= 0 ;	// Screen Data Size

				var	nDSize	= _self.m_xCurrentLayout.GetDataSize();

				var bExtraLO= _self.hasExtraLayout();
				var xResult;

				switch (nState) {
					case xUtils.constants.ngcl.enum.EUS_UPDATE_IQ:
					case xUtils.constants.ngcl.enum.EUS_YDIR_MOVE:
						if(bExtraLO === true) {
							xResult = _self.m_xNontimeLayout.CalcForDraw(nStart, nSize, nState);
							nStart = xResult.screenStartIndex;
							nSize  = xResult.screenSize;
						}

						xResult = _self.m_xNormalLayout.CalcForDraw(nStart, nSize, nState);
						nStart = xResult.screenStartIndex;
						nSize  = xResult.screenSize;
						break;
					case	xUtils.constants.ngcl.enum.EUS_ADD_SERIES:
					case	xUtils.constants.ngcl.enum.EUS_UPDATE_RT:
					case	xUtils.constants.ngcl.enum.EUS_ZOOM:
					case	xUtils.constants.ngcl.enum.EUS_RESIZE:
					case	xUtils.constants.ngcl.enum.EUS_OBJECT_MOVE:
					case	xUtils.constants.ngcl.enum.EUS_CHANGE_LAYOUT:
						if(bExtraLO === true) {
							xResult = _self.m_xNontimeLayout.CalcForDraw(nStart, nSize, nState);
							nStart = xResult.screenStartIndex;
							nSize  = xResult.screenSize;
						}

						xResult = _self.m_xNormalLayout.CalcForDraw(nStart, nSize, nState);
						nStart = xResult.screenStartIndex;
						nSize  = xResult.screenSize;
						break;
					case	xUtils.constants.ngcl.enum.EUS_SCROLL:
						xResult = _self.m_xCurrentLayout.CalcForDraw(nStart, nSize, nState);
						nStart = xResult.screenStartIndex;
						nSize  = xResult.screenSize;
						break;
					default:
						break;
				}

				// need screen position...
				// Accumulate volume
				// m_pDE->Run
				_self.m_xNormalLayout.didCalculateDataForExtraObject();
				if(_self.hasExtraLayout() === true) {
					_self.m_xNontimeLayout.didCalculateDataForExtraObject();
				}
			};

			//
			// #717
			//

			/**
			 * [description]
			 * @param  {[type]} argLoadInfo
			 * @return {[type]}
			 */
			this.didSetLoadInfoForTheLineTools = function(argLoadInfos) {
				if(_self.m_xNormalLayout.m_xDoBasePrice && _self.m_xNormalLayout.m_xDoBasePrice.didSetLoadInfoForTheLineTools) {
					if(_self.m_xNormalLayout.m_xDoBasePrice.didSetLoadInfoForTheLineTools(argLoadInfos) === true) {
						_self.DrawingChartDrawFrame(false);

						return(true);
					}
				}

				return(false);
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didGetSaveInfoOfTheLineTools = function() {
				if(_self.m_xNormalLayout.m_xDoBasePrice && _self.m_xNormalLayout.m_xDoBasePrice.didGetSaveInfoOfTheLineTools) {
					return(_self.m_xNormalLayout.m_xDoBasePrice.didGetSaveInfoOfTheLineTools());
				}
			};
			//

			/**
			 * @return {boolean}
			 */
			this.didGetSaveInfo = function() {
				var xResult = {
					seriesInfos: []
				};

				try {
					_self.m_xNormalLayout.didGetSaveInfo();
				}
				catch(e) {
					console.error(e);
				}

				//
				return(xResult);
			};

			//
			// #895
			//

			/**
			 * 拡大・縮小
			 * @param  {Boolean} isIn
			 * @param  {number}  step
			 * @return {[type]}
			 */
			this.didApplyZoomInOut = function(isIn, step) {
				var nDelta = 1;

				if(isIn !== true) {
					nDelta = (-1) * nDelta;
				}

				_self.didZoomScreen(nDelta, true);
			};

			/**
			 * 最新位置への移動
			 * @param  {[type]} bEndPos
			 * @return {[type]}
			 */
			this.didApplyGoToEndPos = function(bEndPos, isNotFix) {
				_self.m_xNormalLayout.didScrollToEndPos(bEndPos, isNotFix, true);
				if(_self.hasExtraLayout() === true) {
					_self.m_xNontimeLayout.didScrollToEndPos(bEndPos, isNotFix, true);
				}
			};

			// #935
			this.didApplyLocalSetting = function(key, isOn) {
				var xEnv = _self.didGetEnvInfo();
				var bRefresh = false;
				if(key === "crossLine") {
					if(isOn === true) {
						xEnv.CrossLine.hide = false;
					}
					else {
						xEnv.CrossLine.hide = true;
					}

					bRefresh = true;
				}
				else if(key === "smoothScroll") {
					if(isOn === true) {
						xEnv.UseSmoothScroll = true;
					}
					else {
						xEnv.UseSmoothScroll = false;
					}
				}
				else if(key === "newOrderLine") {
					if(isOn === true) {
						xEnv.UseNewOrderLine = true;
					}
					else {
						xEnv.UseNewOrderLine = false;
					}
				}
				// #1558
				else if(key === "trendLineSelect") {
					if(isOn === true) {
						xEnv.DontTouchTrendline = false;
					}
					else {
						xEnv.DontTouchTrendline = true;
					}
				}
				//

				if(bRefresh === true) {
					_self.DrawingChartDrawFrame(false);
				}

				return(true);
			};

			// #959
			this.didApplyChartSetting = function(argSettings) {
				var xChartConfig = argSettings;

				if(xChartConfig === undefined || xChartConfig == null) {
					return(false);
				}

				var xEnv = _self.didGetEnvInfo();
				if(xChartConfig.UseSmoothScroll !== undefined && xChartConfig.UseSmoothScroll !== null) {
					xEnv.UseSmoothScroll = xChartConfig.UseSmoothScroll;
				}

				if(xChartConfig.GridVertColor !== undefined && xChartConfig.GridVertColor !== null) {
					xEnv.ConfigAxis.GridVertColor = xChartConfig.GridVertColor;
				}

				if(xChartConfig.GridHorzColor !== undefined && xChartConfig.GridHorzColor !== null) {
					xEnv.ConfigAxis.GridHorzColor = xChartConfig.GridHorzColor;
				}

				if(xChartConfig.OrderBidColor !== undefined && xChartConfig.OrderBidColor !== null) {
					xEnv.OrderStyleConfig.bid.strokeColor = xChartConfig.OrderBidColor;
				}

				if(xChartConfig.OrderAskColor !== undefined && xChartConfig.OrderAskColor !== null) {
					xEnv.OrderStyleConfig.ask.strokeColor = xChartConfig.OrderAskColor;
				}

				if(xChartConfig.OrderLineStyle !== undefined && xChartConfig.OrderLineStyle !== null) {
					xEnv.OrderStyleConfig.bid.strokeStyle =
					xEnv.OrderStyleConfig.ask.strokeStyle = xChartConfig.OrderLineStyle;
				}

				if(xChartConfig.PositBidColor !== undefined && xChartConfig.PositBidColor !== null) {
					xEnv.PositStyleConfig.bid.strokeColor = xChartConfig.PositBidColor;
				}

				if(xChartConfig.PositAskColor !== undefined && xChartConfig.PositAskColor !== null) {
					xEnv.PositStyleConfig.ask.strokeColor = xChartConfig.PositAskColor;
				}

				if(xChartConfig.PositLineStyle !== undefined && xChartConfig.PositLineStyle !== null) {
					xEnv.PositStyleConfig.bid.strokeStyle =
					xEnv.PositStyleConfig.ask.strokeStyle = xChartConfig.PositLineStyle;
				}


				if(xChartConfig.CandleUpColor !== undefined && xChartConfig.CandleUpColor !== null) {
					xEnv.PriceStyleConfig.Candle.fillUpColor	=
					xEnv.PriceStyleConfig.Candle.strokeUpColor	=	// #1716
					xEnv.PriceStyleConfig.OHLC.strokeUpColor	=
					xEnv.PriceStyleConfig.HLC.strokeUpColor		=
					xEnv.PriceStyleConfig.TLB.fillUpColor		=
					xEnv.PriceStyleConfig.TLB.strokeUpColor		=
					xEnv.PriceStyleConfig.KAGI.strokeUpColor	=
					xEnv.PriceStyleConfig.RENKO.strokeUpColor	=
					xEnv.PriceStyleConfig.PNF.strokeUpColor		= xChartConfig.CandleUpColor;
				}

				if(xChartConfig.CandleDnColor !== undefined && xChartConfig.CandleDnColor !== null) {
					xEnv.PriceStyleConfig.Candle.fillDnColor	=
					xEnv.PriceStyleConfig.Candle.strokeDnColor	=	// #1716
					xEnv.PriceStyleConfig.OHLC.strokeDnColor	=
					xEnv.PriceStyleConfig.HLC.strokeDnColor		=
					xEnv.PriceStyleConfig.TLB.fillDnColor		=
					xEnv.PriceStyleConfig.TLB.strokeDnColor		=
					xEnv.PriceStyleConfig.KAGI.strokeDnColor	=
					xEnv.PriceStyleConfig.RENKO.strokeDnColor	=
					xEnv.PriceStyleConfig.PNF.strokeDnColor		= xChartConfig.CandleDnColor;
				}

				if(xChartConfig.CandleLineColor !== undefined && xChartConfig.CandleLineColor !== null) {
					xEnv.PriceStyleConfig.Candle.strokeColor	=
					// #1716
					// xEnv.PriceStyleConfig.Candle.strokeUpColor	=
					// xEnv.PriceStyleConfig.Candle.strokeDnColor	=
					//
					xEnv.PriceStyleConfig.Line.strokeColor		=
					xEnv.PriceStyleConfig.RCL.strokeColor 		= xChartConfig.CandleLineColor;
				}

				// #2216, #2312
				if(xChartConfig.GridShow !== undefined && xChartConfig.GridShow != null) {
					xEnv.ConfigAxis.GridShow = xChartConfig.GridShow;
				}

				if(xChartConfig.GridVertHide !== undefined && xChartConfig.GridVertHide != null) {
					xEnv.ConfigAxis.GridVertHide = xChartConfig.GridVertHide;
				}

				if(xChartConfig.GridHorzHide !== undefined && xChartConfig.GridHorzHide != null) {
					xEnv.ConfigAxis.GridHorzHide = xChartConfig.GridHorzHide;
				}

				if(xChartConfig.ShowCurrentPrice !== undefined && xChartConfig.ShowCurrentPrice != null) {
					xEnv.HideAskBid = xChartConfig.ShowCurrentPrice == true ? false : true;
				}

				if(xChartConfig.ShowHighLowPrice !== undefined && xChartConfig.ShowHighLowPrice != null) {
					xEnv.MinMaxTooltipShow = xChartConfig.ShowHighLowPrice;
				}
				//

				// #2308
				if(xChartConfig.DetailViewStatusIsShown !== undefined && xChartConfig.DetailViewStatusIsShown != null) {
					xEnv.DetailViewStatusIsShown = xChartConfig.DetailViewStatusIsShown;
				}
				//

				_self.DrawingChartDrawFrame(false);

				return(true);
			};

			var _didApplySeriesPlotColorInfo = function(argTypeId, plotColorInfos) {
				var xResult = {
					typeId : argTypeId,
					settings : null,
					seriesInfo : null
				};

				// リスト上にあるかをチェックする。
				var xSeriesInfo = _didFindSeriesInfo(argTypeId);
				if(xSeriesInfo === undefined || xSeriesInfo == null) {
					return(false);
				}

				xResult.seriesInfo = xSeriesInfo;

				var xInfo = plotColorInfos;

				if(!xInfo) {
					return(false);
				}
				// 入力情報があればその情報に変更する。
				if(xUtils.indicator.didApplySeriesPlotColorInfos(xSeriesInfo.info, xInfo) !== true) {
					return(false);
				}

				xResult.settings = xSeriesInfo.info;

				try {
					var typeId   = xResult.typeId;
					var settings = xResult.settings;

					// リスト上にあるかをチェックする。
					var xSeriesInfo = xResult.seriesInfo;
					if(xSeriesInfo === undefined || xSeriesInfo == null) {
						return(false);
					}

					if(_self.m_xNormalLayout && _self.m_xNormalLayout.didChangeIndicatorSettingByTypeId) {
						return(_self.m_xNormalLayout.didChangeIndicatorSettingByTypeId(typeId, settings));
					}
				}
				catch(e) {
					// // console.debug("[WGC] :" + e);
				}

				return(false);
			};

			// #959
			this.didApplyChartIndicatorPlotColorSetting = function(argSettings) {
				if(argSettings === undefined || argSettings == null) {
					return(false);
				}

				var xSetting;
				var nCount = 0;
				if(argSettings.length === undefined || argSettings.length == null) {
					xSetting = argSettings;
				}
				else {
					nCount = argSettings.length;
					if(nCount > 0) {
						xSetting = argSettings[0];
					}
				}

				if(!xSetting || !xSetting.code || !xSetting.plot) {
					return(false);
				}

				_didApplySeriesPlotColorInfo(xSetting.code, xSetting.plot);

				//
				if(nCount > 1) {

					//
					for(var ii = 1; ii < nCount; ii++) {
						xSetting = argSettings[ii];
						if(!xSetting || !xSetting.code || !xSetting.plot) {
							continue;
						}

						_didApplySeriesPlotColorInfo(xSetting.code, xSetting.plot);
					}
				}

				_self.DrawingChartDrawFrame(false);

				return(true);
			};

			//
			// MARK:debug(#1105)
			//
			this.didSetPointValueForCurrentSymbol = function(argPoint) {
				_self.m_xNormalLayout.m_xDoBasePrice.m_point = argPoint;

				//
				_self.RecalcProc(xUtils.constants.ngcl.enum.EUS_CHANGE_LAYOUT);

				//
				_self.ResizeChart(true);
			};

			//
			// MARK:debug(#1105)
			//
			this.GetCurrentSymbolInfo = function() {
				var __symbolInfo = _self.m_xNormalLayout.m_xDoBasePrice.m_symbolInfo;

				return(__symbolInfo);
			};

			//
			// #1441
			//

			this.didGetSBHandle = function() {
				return(_self.m_zsbHandle);
			};

			this.didSetZSBHandle = function(zsbHandle) {
				try {
					var xEnv = _self.didGetEnvInfo(); // #1824

					_self.m_zsbHandle = zsbHandle;
					_self.m_zsbHandle.didSetDelegate(_self);
					if(_self.m_zsbHandle && _self.m_zsbHandle.SetZSBInit) {
						var xScrollInfo = _self.m_xCurrentLayout.didGetScrollInfo();
						 // #1824
						_self.m_zsbHandle.SetZSBInit(xScrollInfo.screenSize, xScrollInfo.range.length, xEnv.System.Scroll.screenSize.min, xEnv.System.Scroll.screenSize.max);
					}
				}
				catch(e) {
					console.error(e);
				}
			};

			this.DidScrollToPos = function(caller, nPos, nShows) {
				// console.debug("Delegate => DidScrollToPos(" + nPos + ", " + nShows + ")");
				_self.m_xCurrentLayout.DidScrollToPos(nPos, nShows);
			};

			this.WillBeDrawnBackground = function(caller, notifyData) {
				// console.debug("Delegate => WillBeDrawnBackground(" + JSON.stringify(notifyData) + ")");
				_self.m_xCurrentLayout.WillBeDrawnBackground(notifyData);

				return(false);
			};

			// [end] #1441
			// #1793
			this.didGetRestoreIndicatorInformationByTypeId = function(argTypeId, isSave) {
				var xSeriesInfo = _didFindSeriesInfo(argTypeId);
				if(xSeriesInfo === undefined || xSeriesInfo == null) {// || xSeriesInfo.show !== true) {
					return;
				}

				var xInfo = xUtils.indicator.didConvertToRestoreSeriesInformation(xSeriesInfo.info, isSave);
				if(xInfo) {
					var xResult = {
						code : xSeriesInfo.code,
						show : xSeriesInfo.show,
						info : xInfo
					};

					return(xResult);
				}
			};
			//

			// #1796
			this.didUpdateTrendlinesStyle = function(color, text) {
				try {
					if(_self.m_xTrendlineInfos) {
						var xtlKeys = Object.keys(_self.m_xTrendlineInfos);
						if(xtlKeys && xtlKeys.length && xtlKeys.length > 0) {
							var nCount = xtlKeys.length;
							for(var ii = 0; ii < nCount; ii++) {
								var trendLineCode = xtlKeys[ii];
								if(trendLineCode.substring(0, 2) != "TL") {
									continue;
								}

								if(xUtils.trendLine.isDrawableTrendline(trendLineCode) !== true) {
									continue;
								}

								_self.didApplyTrendlineInfoAt(trendLineCode, color, text);
							}
						}
					}
				}
				catch(e) {
					console.error(e);
				}

				return(true);
			};
			//

			// #2007
			this.didUpdateAskBidData = function(hide, ask, bid, validFlag) {
				try {
					if(_self.m_xNormalLayout.didUpdateAskBidData) {
						if(_self.m_xNormalLayout.didUpdateAskBidData(hide, ask, bid, validFlag)) {
							_self.DrawingChartDrawFrame(false);
						}
					}
				}
				catch(e) {
					console.error(e);
				}
			};
			//
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDrawWrap");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDrawWrap"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDrawPanelNormalCFD"]
			);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
			loadModule(
				require("./chartUtil"),
				require("./chartDrawPanelNormalCFD")
			);
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDrawWrap",
			['ngc/chartUtil', 'ngc/chartDrawPanelNormalCFD'],
				function(xUtils, layoutPanelNormalClass) {
					return loadModule(
						xUtils,
						layoutPanelNormalClass
					);
				});
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDrawWrap"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDrawPanelNormalCFD"]
			);
    }

	//console.debug("[MODUEL] Loaded => chartDrawWrap");
})(this);
