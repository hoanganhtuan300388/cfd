(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc, doBaseClass) {
	    "use strict";

	    var exports = function() {
	        //
	        // private
	        //
	        var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

	        //
	        // properties
	        //
			this.m_symbolInfo = {};		/// symbol information

			this.m_arrData 		= [];	// base datas
			this.m_arrTimeData	= [];	// base time datas
			this.m_arrTickNo	= [];	// tick no. datas

			this.m_bPrice = true;	// #1671

			//
			//
			//

			/**
			 * initialize parameters
			 */
			this.didInitParams = function() {

			};

	        this.didInitVariables = function(strChartName) {
	            _self.m_bMainChart = true;
				_self.m_bPriceType = true;

				_self.m_strChartName = "";
	        };

			this.didClearSelfDatas = function() {
	            //
	    		// clear base information
	    		//
	    		_self.m_symbolInfo = {};

				// #1002
				_self.m_strChartName = "";

	    		// price data
	    		_self.m_arrTimeData = [];	// base time datas
	    		_self.m_arrData 	= [];	// base datas
				_self.m_arrTickNo 	= [];	// base tick no

				// #1181, #1516
				_self.didClearSubObjectDatas();
	        };

	        this.didClearOrderPositObjects = function(isOrder, isPosit) {
				return(false);
	        };

			this.didClearExecutionObjects = function() {
				return(false);
	        };

			this.didClearAlertObjects = function() {
				return(false);
	        };

			// #1454: restore to before #1181
			this.didClearSubObjects = function() {

			};

			// #1181, #1516
			this.didClearSubObjectDatas = function() {
				// #1454: move to compare object
			};

	        /**
			 * call when you delete this object
			 */
			this.didDestroy = function() {
				_self.didClearLineStudyObject();
				_self.didClearOrderPositObjects(true, true);
				_self.didClearExecutionObjects();
				_self.didClearAlertObjects();
				_self.didClearSubObjects();
				_self.didClearSubObjectDatas(); // #1454, #1516
			};

			/**
			 * draw trend lines
			 */
			this.didDrawTrendLines = function() {
			};

			/**
			 * draw order and position objects
			 */
			this.didDrawOrderPosit = function() {
			};

			/**
			 * draw self
			 */
			this.didDrawSelf = function(posval) {
			};

	        /**
			 *
			 */
			this.didReceiveDataExt = function() {
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedData = function(symbolInfo, receivedDatas) {
				// TODO: check if code is changed

				return(true);
			};

			/*
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas	data[][price type]
			 */
			this.didReceiveData = function(symbolInfo, receivedDatas) {
				return(true);
			};

			/**
			 *
			 */
			this.didCalculateData = function() {
				return(true);
			};

			/**
			 *
			 */
			this.didCalculateRealData = function(nStart, nDSize, nSSize) {
				return(true);
			};

	        /**
			 * @param[in] lsName	name
		     * @param[in] posval	{XPos:0, YPos:0}
		     * @return object
			 */
			this.CreateTrendlineObj = function(lsName, posval) {
				return(null);
			};

			/**
			 * calculate min and max
			 * @param[in] argScrSIdx	current scroll position
			 * @param[in] argScrSize	screen size
			 * @param[in] argFlag		full flag
			 */
			this.didCalcMinMax = function(argScrSIdx, argScrSize, argFlag) {
				var xEnv   = _self.didGetEnvInfo();
				var xScaleUnit = _self.m_xScaleInfo.current;

				xUtils.scale.didResetScaleUnit(xScaleUnit);

				// for screen
				for(var __nLocalIdx = 0; __nLocalIdx < argScrSize; __nLocalIdx++) {
					var __dataIndex = _self.m_drawWrapper.didConvertLocalIndexToDataIndex(__nLocalIdx);
					var __stPrice   = _self.didGetDataAt(__dataIndex, false);

					if (__stPrice === undefined || __stPrice === null || parseInt(__stPrice.close) === 0) {
						continue;
					}

					var __close = xUtils.didConvertToPrice(__stPrice.close);
					var __open  = xUtils.didConvertToPrice(__stPrice.open);
					if(xEnv.ChartType === xUtils.constants.chartTypeCode.averageCandle) {
						if(!__stPrice.avgClose || !__stPrice.avgOpen) {
							continue;
						}

						__close = xUtils.didConvertToPrice(__stPrice.avgClose);
						__open  = xUtils.didConvertToPrice(__stPrice.avgOpen );
					}

					var __high  = xUtils.didConvertToPrice(__stPrice.high);
					var __low   = xUtils.didConvertToPrice(__stPrice.low);

					if ((_self.m_drawWrapper.m_stEnv.ChartType == xUtils.constants.chartTypeCode.line)) {
						if(__close > xScaleUnit.minMaxScreen.maxValue) {
							xScaleUnit.minMaxScreen.maxValue = __close;
							xScaleUnit.minMaxScreen.maxIndex = __dataIndex;
						}

						if(__close < xScaleUnit.minMaxScreen.minValue) {
							xScaleUnit.minMaxScreen.minValue = __close;
							xScaleUnit.minMaxScreen.minIndex = __dataIndex;
						}
					}
					else if (_self.m_drawWrapper.isNontimeChartType()) {
						if(__close > __open) {
							if(__close > xScaleUnit.minMaxScreen.maxValue) {
								xScaleUnit.minMaxScreen.maxValue = __close;
								xScaleUnit.minMaxScreen.maxIndex = __dataIndex;
							}

							if(__open < xScaleUnit.minMaxScreen.minValue) {
								xScaleUnit.minMaxScreen.minValue = __open;
								xScaleUnit.minMaxScreen.minIndex = __dataIndex;
							}
						}
						else {
							if(__open > xScaleUnit.minMaxScreen.maxValue) {
								xScaleUnit.minMaxScreen.maxValue = __open;
								xScaleUnit.minMaxScreen.maxIndex = __dataIndex;
							}

							if(__close < xScaleUnit.minMaxScreen.minValue) {
								xScaleUnit.minMaxScreen.minValue = __close;
								xScaleUnit.minMaxScreen.minIndex = __dataIndex;
							}
						}
					}
					else {
						if(__high > xScaleUnit.minMaxScreen.maxValue) {
							xScaleUnit.minMaxScreen.maxValue = __high;
							xScaleUnit.minMaxScreen.maxIndex = __dataIndex;
						}

						if(__low < xScaleUnit.minMaxScreen.minValue) {
							xScaleUnit.minMaxScreen.minValue = __low;
							xScaleUnit.minMaxScreen.minIndex = __dataIndex;
						}
					}
				}

				xScaleUnit.minMaxScreen.diff = xUtils.scale.didCalcDiff(xScaleUnit.minMaxScreen.maxValue, xScaleUnit.minMaxScreen.minValue);

				// #1379
				// _self.didAdjustReverseMinMax(xScaleUnit);
				//

				//
				xUtils.scale.didBackupScaleInfo(_self.m_xScaleInfo);

				// #1516
				_self.didProcForAfterCalculatingMinMax();
				//
				//
			};

			// #1516
			this.didProcForAfterCalculatingMinMax = function() {
			};
			//

			// #1379, #1516
			this.didAdjustReverseMinMax = function(xScaleUnit) {
				// #1379
				// if(xScaleUnit) {
				// 	try {
				// 		if(xScaleUnit.minMaxScreen.diff < 0 && _self.didGetDataSize() < 1) {
				// 			xUtils.scale.didAdjustReverseMinMax(xScaleUnit);
				// 		}
				// 	}
				// 	catch(e) {
				//
				// 	}
				// }
			};
			//

	        /*
			 *
			 */
			this.SetBackgroundCodeName = function(strCodeName) {
				return;
				/*
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_context.font = "100pt Arial";
				_self.m_context.fillStyle = "#f2f2f2";
				var iLeft = Math.round((__xPanelRect.width - _self.m_context.measureText(strCodeName).width) / 2);
				var iTop = Math.round((__xPanelRect.height + 100) / 2);
				_self.DrawText({context:_self.m_context, text:strCodeName, left:iLeft, top:iTop});
				*/
			};

			//
			// MARK: Drawing
			//

			/**
			 * draw candle bar chart
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.DrawCompareChart = function(posval) {
				_self.DrawCandleChart(posval);
			};

			/**
			 * draw candle bar chart
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.DrawCandleChart = function(posval) {
				_self.SetBackgroundCodeName("");

				var __nLocalXPos, __nLocalYPos;
				var stPrice;
				var colorVal;

				var __nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var __nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				var __nLoopStart = 0;
				var __nLoopEnd =__nScrSize;
				var __bHitTest = false;
				var lineColorVal;
				var fillColorVal;
				var __context = _self.m_context;
				if(posval !== undefined) {
					var __dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false) - 3;
					__nLoopStart = _self.m_drawWrapper.didConvertDataIndexToLocalIndex(__dataIndexAtPos);
					__nLoopEnd = __nLoopStart + xUtils.hitTest.config.size;

					__bHitTest = true;
					lineColorVal = xUtils.hitTest.config.color;
					fillColorVal = xUtils.hitTest.config.color;

					__context = _self.m_memcontext;
				}

				var __drawLineParam = {
		    		context : __context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Candle.strokeWeight,
		    		lineColor : ''
		    	};

				var __drawRectParam = {
		    		context : __context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Candle.strokeWeight,
		    		lineColor : '',
		    		fillColor : ''
		    	};

				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();
				var xEnv   = _self.didGetEnvInfo();

				for(var __nLocalIdx = __nLoopStart; __nLocalIdx < __nLoopEnd; __nLocalIdx++) {
					var __dataIndex = xAxisX.didConvertLocalIndexToDataIndex(__nLocalIdx);
					var __stPrice = _self.didGetDataAt(__dataIndex, false);

					if(xUtils.validator.isValidPrice(__stPrice) !== true) {
						continue;
					}

					// #1271
					if(xUtils.validator.isFixedPrice(__stPrice, xEnv) === true) {
						continue;
					}
					//

					var xBarInfos= {};
					__nLocalXPos = xAxisX.GetIndex2Pixel(__dataIndex, xBarInfos);//_self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);
					//__nLocalXPos = _self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);

					var iYPosOpen  = xAxisY.GetYPos(__stPrice.open);
					var iYPosHigh  = xAxisY.GetYPos(__stPrice.high);
					var iYPosLow   = xAxisY.GetYPos(__stPrice.low);
					var iYPosClose = xAxisY.GetYPos(__stPrice.close);

					if(__bHitTest !== true) {
						// #676
						if(_self.m_bSelect === true) {
							lineColorVal = xEnv.System.SelectedFill.lineColor;
							fillColorVal = xEnv.System.SelectedFill.fillColor;
						}
						else {
							lineColorVal = xEnv.PriceStyleConfig.Candle.strokeDnColor;
							fillColorVal = xEnv.PriceStyleConfig.Candle.fillDnColor;
							if(xUtils.dataConverter.isMinusCandleForPriceData(__stPrice) !== true) {
								lineColorVal = xEnv.PriceStyleConfig.Candle.strokeUpColor;
								fillColorVal = xEnv.PriceStyleConfig.Candle.fillUpColor;
							}
						}
					}

					// center line
					__drawLineParam.pt1.x = __nLocalXPos;
					__drawLineParam.pt1.y = iYPosHigh;
					__drawLineParam.pt2.x = __nLocalXPos;
					__drawLineParam.pt2.y = iYPosLow;
					__drawLineParam.lineColor = lineColorVal;
					gxDc.Line(__drawLineParam);

					//if ((iYPosOpen - iYPosClose) === 0)
					//	iYPosClose = iYPosClose + 1;

					var rcX, rcY, rcW, rcH;
					//var xBarInfos = _self.m_drawWrapper.didGetAdjustedBarInfo(__nLocalXPos);

					rcX = xBarInfos.pos;
					rcW = xBarInfos.width;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					/*
					rcX = xBarInfos.barInfo.left;
					rcW = xBarInfos.barInfo.right - xBarInfos.barInfo.left;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					*/

					if (parseInt(__stPrice.open) == parseInt(__stPrice.close)) {
						__drawLineParam.pt1.x = rcX;
						__drawLineParam.pt1.y = rcY;
						__drawLineParam.pt2.x = rcX+rcW;
						__drawLineParam.pt2.y = rcY;
						__drawLineParam.lineColor = lineColorVal;
						gxDc.Line(__drawLineParam);
					}
					else {
						__drawRectParam.rect.x = rcX;
						__drawRectParam.rect.y = rcY;
						__drawRectParam.rect.width = rcW;
						__drawRectParam.rect.height = rcH;
						__drawRectParam.lineColor = lineColorVal;
						__drawRectParam.fillColor = fillColorVal;
						gxDc.Rectangle(__drawRectParam);
					}

					/*
					// console.debug("[WGC] :" + __xBarInfo);
					// console.debug("[WGC] :" + xBarInfos);
					// console.debug("[WGC] :" + __drawRectParam);
					*/
				}
			};

			/**
			 * draw average candle bar chart
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.DrawAverageCandleChart = function(posval) {
				_self.SetBackgroundCodeName("");

				var __nLocalXPos, __nLocalYPos;
				var stPrice;
				var colorVal;

				var __nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var __nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				var __nLoopStart = 0;
				var __nLoopEnd =__nScrSize;
				var __bHitTest = false;
				var lineColorVal;
				var fillColorVal;
				var __context = _self.m_context;
				if(posval !== undefined) {
					var __dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false) - 3;
					__nLoopStart = _self.m_drawWrapper.didConvertDataIndexToLocalIndex(__dataIndexAtPos);
					__nLoopEnd = __nLoopStart + xUtils.hitTest.config.size;

					__bHitTest = true;
					lineColorVal = xUtils.hitTest.config.color;
					fillColorVal = xUtils.hitTest.config.color;

					__context = _self.m_memcontext;
				}

				var __drawLineParam = {
		    		context : __context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Candle.strokeWeight,
		    		lineColor : ''
		    	};

				var __drawRectParam = {
		    		context : __context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Candle.strokeWeight,
		    		lineColor : '',
		    		fillColor : ''
		    	};

				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();
				var xEnv   = _self.didGetEnvInfo();

				for(var __nLocalIdx = __nLoopStart; __nLocalIdx < __nLoopEnd; __nLocalIdx++) {
					var __dataIndex = xAxisX.didConvertLocalIndexToDataIndex(__nLocalIdx);
					var __stPrice = _self.didGetDataAt(__dataIndex, false);

					if(xUtils.validator.isValidPrice(__stPrice, true) !== true) {
						continue;
					}

					// #1271
					if(xUtils.validator.isFixedPrice(__stPrice, xEnv) === true) {
						continue;
					}
					//

					var xBarInfos= {};
					__nLocalXPos = xAxisX.GetIndex2Pixel(__dataIndex, xBarInfos);//_self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);
					//__nLocalXPos = _self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);

					var __close    = __stPrice.avgClose;
					var __open     = __stPrice.avgOpen;

					var iYPosOpen  = xAxisY.GetYPos(__close);
					var iYPosHigh  = xAxisY.GetYPos(__stPrice.high);
					var iYPosLow   = xAxisY.GetYPos(__stPrice.low);
					var iYPosClose = xAxisY.GetYPos(__open);

					if(__bHitTest !== true) {
						// #676
						if(_self.m_bSelect === true) {
							lineColorVal = xEnv.System.SelectedFill.lineColor;
							fillColorVal = xEnv.System.SelectedFill.fillColor;
						}
						else {
							lineColorVal = xEnv.PriceStyleConfig.Candle.strokeDnColor;
							fillColorVal = xEnv.PriceStyleConfig.Candle.fillDnColor;
							if(xUtils.dataConverter.isMinusCandleForPriceData(__stPrice, true) !== true) {
								lineColorVal = xEnv.PriceStyleConfig.Candle.strokeUpColor;
								fillColorVal = xEnv.PriceStyleConfig.Candle.fillUpColor;
							}
						}
					}

					// center line
					__drawLineParam.pt1.x = __nLocalXPos;
					__drawLineParam.pt1.y = iYPosHigh;
					__drawLineParam.pt2.x = __nLocalXPos;
					__drawLineParam.pt2.y = iYPosLow;
					__drawLineParam.lineColor = lineColorVal;
					gxDc.Line(__drawLineParam);

					//if ((iYPosOpen - iYPosClose) === 0)
					//	iYPosClose = iYPosClose + 1;

					var rcX, rcY, rcW, rcH;
					//var xBarInfos = _self.m_drawWrapper.didGetAdjustedBarInfo(__nLocalXPos);

					rcX = xBarInfos.pos;
					rcW = xBarInfos.width;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					/*
					rcX = xBarInfos.barInfo.left;
					rcW = xBarInfos.barInfo.right - xBarInfos.barInfo.left;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					*/

					if (parseInt(__open) == parseInt(__close)) {
						__drawLineParam.pt1.x = rcX;
						__drawLineParam.pt1.y = rcY;
						__drawLineParam.pt2.x = rcX+rcW;
						__drawLineParam.pt2.y = rcY;
						__drawLineParam.lineColor = lineColorVal;
						gxDc.Line(__drawLineParam);
					}
					else {
						__drawRectParam.rect.x = rcX;
						__drawRectParam.rect.y = rcY;
						__drawRectParam.rect.width = rcW;
						__drawRectParam.rect.height = rcH;
						__drawRectParam.lineColor = lineColorVal;
						__drawRectParam.fillColor = fillColorVal;
						gxDc.Rectangle(__drawRectParam);
					}

					/*
					// console.debug("[WGC] :" + __xBarInfo);
					// console.debug("[WGC] :" + xBarInfos);
					// console.debug("[WGC] :" + __drawRectParam);
					*/
				}
			};

			/**
			 * draw candle bar chart
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.DrawTransCandleChart = function(posval) {
				_self.SetBackgroundCodeName("");

				var __nLocalXPos, __nLocalYPos;
				var stPrice;
				var colorVal;

				var __nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var __nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				var __nLoopStart = 0;
				var __nLoopEnd =__nScrSize;
				var __bHitTest = false;
				var lineColorVal;
				var fillColorVal;
				var __context = _self.m_context;
				if(posval !== undefined) {
					var __dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false) - 3;
					__nLoopStart = _self.m_drawWrapper.didConvertDataIndexToLocalIndex(__dataIndexAtPos);
					__nLoopEnd = __nLoopStart + xUtils.hitTest.config.size;

					__bHitTest = true;
					lineColorVal = xUtils.hitTest.config.color;
					fillColorVal = xUtils.hitTest.config.color;

					__context = _self.m_memcontext;
				}

				var __drawLineParam = {
		    		context : __context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Candle.strokeWeight,
		    		lineColor : ''
		    	};

				var __drawRectParam = {
		    		context : __context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Candle.strokeWeight,
		    		lineColor : '',
		    		fillColor : ''
		    	};

				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();
				var xEnv   = _self.didGetEnvInfo();

				for(var __nLocalIdx = __nLoopStart; __nLocalIdx < __nLoopEnd; __nLocalIdx++) {
					var __dataIndex = xAxisX.didConvertLocalIndexToDataIndex(__nLocalIdx);
					var __stPrice = _self.didGetDataAt(__dataIndex, false);

					if(xUtils.validator.isValidPrice(__stPrice) !== true) {
						continue;
					}

					// #1271
					if(xUtils.validator.isFixedPrice(__stPrice, xEnv) === true) {
						continue;
					}
					//

					var xBarInfos= {};
					__nLocalXPos = xAxisX.GetIndex2Pixel(__dataIndex, xBarInfos);//_self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);
					//__nLocalXPos = _self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);

					var iYPosOpen  = xAxisY.GetYPos(__stPrice.open);
					var iYPosHigh  = xAxisY.GetYPos(__stPrice.high);
					var iYPosLow   = xAxisY.GetYPos(__stPrice.low);
					var iYPosClose = xAxisY.GetYPos(__stPrice.close);

					if(__bHitTest !== true) {
						// #676
						if(_self.m_bSelect === true) {
							lineColorVal = xEnv.System.SelectedFill.lineColor;
							fillColorVal = xEnv.System.SelectedFill.fillColor;
						}
						else {
							lineColorVal = xEnv.PriceStyleConfig.Candle.strokeDnColor;
							fillColorVal = xEnv.PriceStyleConfig.Candle.fillDnColor;
							if(xUtils.dataConverter.isMinusCandleForPriceData(__stPrice) !== true) {
								lineColorVal = xEnv.PriceStyleConfig.Candle.strokeUpColor;
								fillColorVal = xEnv.PriceStyleConfig.Candle.fillUpColor;
							}

							/*
							ローソク足との違いは、（前日終値<当日終値<当日始値）ならば、本来陰線であるべき当日のローソク足が、陽線と同じ色に変化することです。
							また、（当日始値<当日終値<前日終値）ならば、本来陽線であるべき当日のローソク足は、陰線と同じ色に変化します。
							 */
							var __stPricePre = _self.didGetDataAt(__dataIndex - 1, false);
							if(__stPricePre !== undefined && __stPricePre != null) {
								if(__stPricePre.close < __stPrice.close) {
									lineColorVal = xEnv.PriceStyleConfig.Candle.strokeUpColor;
									fillColorVal = xEnv.PriceStyleConfig.Candle.fillUpColor;
								}
								else if(__stPricePre.close > __stPrice.close) {
									lineColorVal = xEnv.PriceStyleConfig.Candle.strokeDnColor;
									fillColorVal = xEnv.PriceStyleConfig.Candle.fillDnColor;
								}
							}
						}
					}

					// center line
					__drawLineParam.pt1.x = __nLocalXPos;
					__drawLineParam.pt1.y = iYPosHigh;
					__drawLineParam.pt2.x = __nLocalXPos;
					__drawLineParam.pt2.y = iYPosLow;
					__drawLineParam.lineColor = lineColorVal;
					gxDc.Line(__drawLineParam);

					//if ((iYPosOpen - iYPosClose) === 0)
					//	iYPosClose = iYPosClose + 1;

					var rcX, rcY, rcW, rcH;
					//var xBarInfos = _self.m_drawWrapper.didGetAdjustedBarInfo(__nLocalXPos);

					rcX = xBarInfos.pos;
					rcW = xBarInfos.width;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					/*
					rcX = xBarInfos.barInfo.left;
					rcW = xBarInfos.barInfo.right - xBarInfos.barInfo.left;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					*/

					if (parseInt(__stPrice.open) === parseInt(__stPrice.close)) {
						__drawLineParam.pt1.x = rcX;
						__drawLineParam.pt1.y = rcY;
						__drawLineParam.pt2.x = rcX+rcW;
						__drawLineParam.pt2.y = rcY;
						__drawLineParam.lineColor = lineColorVal;
						gxDc.Line(__drawLineParam);
					}
					else {
						__drawRectParam.rect.x = rcX;
						__drawRectParam.rect.y = rcY;
						__drawRectParam.rect.width = rcW;
						__drawRectParam.rect.height = rcH;
						__drawRectParam.lineColor = lineColorVal;
						__drawRectParam.fillColor = fillColorVal;
						gxDc.Rectangle(__drawRectParam);
					}

					/*
					// console.debug("[WGC] :" + __xBarInfo);
					// console.debug("[WGC] :" + xBarInfos);
					// console.debug("[WGC] :" + __drawRectParam);
					*/
				}
			};

	        /**
			 * draw bar chart(ohlc)
			 */
			this.DrawBarOHLCChart = function(posval) {
				_self.SetBackgroundCodeName("");

				var __nLocalXPos, __nLocalYPos;

				var __nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var __nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				var __nLoopStart = 0;
				var __nLoopEnd =__nScrSize;
				var __bHitTest = false;
				var __context = _self.m_context;
				var lineColorVal;
				if(posval !== undefined) {
					var __dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false) - 3;
					__nLoopStart = _self.m_drawWrapper.didConvertDataIndexToLocalIndex(__dataIndexAtPos);
					__nLoopEnd = __nLoopStart + xUtils.hitTest.config.size;

					__bHitTest = true;
					lineColorVal = xUtils.hitTest.config.color;

					__context = _self.m_memcontext;
				}

				var __drawLineParam = {
		    		context : __context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Line.strokeWeight,
		    		lineColor : ''
		    	};

				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();
				var xEnv   = _self.didGetEnvInfo();

				for(var __nLocalIdx = __nLoopStart; __nLocalIdx < __nLoopEnd; __nLocalIdx++) {
					var __dataIndex = xAxisX.didConvertLocalIndexToDataIndex(__nLocalIdx);
					var __stPrice = _self.didGetDataAt(__dataIndex, false);

					if(xUtils.validator.isValidPrice(__stPrice) !== true) {
						continue;
					}

					// #1271
					if(xUtils.validator.isFixedPrice(__stPrice, xEnv) === true) {
						continue;
					}
					//

					var xBarInfos= {};
					__nLocalXPos = xAxisX.GetIndex2Pixel(__dataIndex, xBarInfos);//_self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);
					//__nLocalXPos = _self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);

					var iYPosOpen  = xAxisY.GetYPos(__stPrice.open);
					var iYPosHigh  = xAxisY.GetYPos(__stPrice.high);
					var iYPosLow   = xAxisY.GetYPos(__stPrice.low);
					var iYPosClose = xAxisY.GetYPos(__stPrice.close);

					if(__bHitTest !== true) {
						// #676
						if(_self.m_bSelect === true) {
							lineColorVal = _self.m_drawWrapper.m_stEnv.System.SelectedFill.lineColor;
						}
						else {
							lineColorVal = _self.m_drawWrapper.m_stEnv.PriceStyleConfig.OHLC.strokeDnColor;
							if (parseInt(__stPrice.open) <= parseInt(__stPrice.close)) {
								lineColorVal = _self.m_drawWrapper.m_stEnv.PriceStyleConfig.OHLC.strokeUpColor;
							}
						}
					}

					// center line
					__drawLineParam.pt1.x = __nLocalXPos;
					__drawLineParam.pt1.y = iYPosHigh;
					__drawLineParam.pt2.x = __nLocalXPos;
					__drawLineParam.pt2.y = iYPosLow;
					__drawLineParam.lineColor = lineColorVal;
					gxDc.Line(__drawLineParam);

					var rcX, rcY, rcW, rcH;
					//var xBarInfos = _self.m_drawWrapper.didGetAdjustedBarInfo(__nLocalXPos);

					rcX = xBarInfos.pos;
					rcW = xBarInfos.width;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					/*
					rcX = xBarInfos.barInfo.left;
					rcW = xBarInfos.barInfo.right - xBarInfos.barInfo.left;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					*/

					var iLeftX = rcX, iRightX = rcX + rcW;

					// left line
					__drawLineParam.pt1.x = iLeftX;
					__drawLineParam.pt1.y = iYPosOpen;
					__drawLineParam.pt2.x = __nLocalXPos;
					__drawLineParam.pt2.y = iYPosOpen;
					gxDc.Line(__drawLineParam);

					// right line
					__drawLineParam.pt1.x = iRightX;
					__drawLineParam.pt1.y = iYPosClose;
					__drawLineParam.pt2.x = __nLocalXPos;
					__drawLineParam.pt2.y = iYPosClose;
					gxDc.Line(__drawLineParam);
				}
			};

			/**
			 * draw bar chart(ohlc)
			 */
			this.DrawBarHLCChart = function(posval) {
				_self.SetBackgroundCodeName("");

				var __nLocalXPos, __nLocalYPos;

				var __nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var __nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				var __nLoopStart = 0;
				var __nLoopEnd =__nScrSize;
				var __bHitTest = false;
				var __context = _self.m_context;
				var lineColorVal;
				if(posval !== undefined) {
					var __dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false) - 3;
					__nLoopStart = _self.m_drawWrapper.didConvertDataIndexToLocalIndex(__dataIndexAtPos);
					__nLoopEnd = __nLoopStart + xUtils.hitTest.config.size;

					__bHitTest = true;
					lineColorVal = xUtils.hitTest.config.color;

					__context = _self.m_memcontext;
				}

				var __drawLineParam = {
		    		context : __context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Line.strokeWeight,
		    		lineColor : ''
		    	};

				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();
				var xEnv   = _self.didGetEnvInfo();

				for(var __nLocalIdx = __nLoopStart; __nLocalIdx < __nLoopEnd; __nLocalIdx++) {
					var __dataIndex = xAxisX.didConvertLocalIndexToDataIndex(__nLocalIdx);
					var __stPrice = _self.didGetDataAt(__dataIndex, false);

					if(xUtils.validator.isValidPrice(__stPrice) !== true) {
						continue;
					}

					// #1271
					if(xUtils.validator.isFixedPrice(__stPrice, xEnv) === true) {
						continue;
					}
					//

					var xBarInfos= {};
					__nLocalXPos = xAxisX.GetIndex2Pixel(__dataIndex, xBarInfos);//_self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);
					//__nLocalXPos = _self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);

					var iYPosOpen  = xAxisY.GetYPos(__stPrice.open);
					var iYPosHigh  = xAxisY.GetYPos(__stPrice.high);
					var iYPosLow   = xAxisY.GetYPos(__stPrice.low);
					var iYPosClose = xAxisY.GetYPos(__stPrice.close);

					if(__bHitTest !== true) {
						// #676
						if(_self.m_bSelect === true) {
							lineColorVal = _self.m_drawWrapper.m_stEnv.System.SelectedFill.lineColor;
						}
						else {
							lineColorVal = _self.m_drawWrapper.m_stEnv.PriceStyleConfig.OHLC.strokeDnColor;
							if (parseInt(__stPrice.open) <= parseInt(__stPrice.close)) {
								lineColorVal = _self.m_drawWrapper.m_stEnv.PriceStyleConfig.OHLC.strokeUpColor;
							}
						}
					}

					// center line
					__drawLineParam.pt1.x = __nLocalXPos;
					__drawLineParam.pt1.y = iYPosHigh;
					__drawLineParam.pt2.x = __nLocalXPos;
					__drawLineParam.pt2.y = iYPosLow;
					__drawLineParam.lineColor = lineColorVal;
					gxDc.Line(__drawLineParam);

					var rcX, rcY, rcW, rcH;
					//var xBarInfos = _self.m_drawWrapper.didGetAdjustedBarInfo(__nLocalXPos);

					rcX = xBarInfos.pos;
					rcW = xBarInfos.width;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					/*
					rcX = xBarInfos.barInfo.left;
					rcW = xBarInfos.barInfo.right - xBarInfos.barInfo.left;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					*/

					var iLeftX = rcX, iRightX = rcX + rcW;

					// right line
					__drawLineParam.pt1.x = iRightX;
					__drawLineParam.pt1.y = iYPosClose;
					__drawLineParam.pt2.x = __nLocalXPos;
					__drawLineParam.pt2.y = iYPosClose;
					gxDc.Line(__drawLineParam);
				}
			};

	        /**
			 * draw line chart
			 */
			this.DrawLineChart = function(posval) {
				_self.SetBackgroundCodeName("");
				var __nLocalXPos1, __nLocalXPos2, __nLocalYPos1, __nLocalYPos2;
				var __stPrice1, stPrice2;

				//
				// #505
				//
				var stPrice;

				var __nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var __nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				//
				// #505
				//
				var __nLoopStart = 0;
				var __nLoopEnd =__nScrSize;
				var __bHitTest = false;
				var lineColorVal = _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Line.strokeColor;
				var __context = _self.m_context;
				if(posval !== undefined) {
					var __dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false) - 3;
					__nLoopStart = _self.m_drawWrapper.didConvertDataIndexToLocalIndex(__dataIndexAtPos);
					__nLoopEnd = __nLoopStart + xUtils.hitTest.config.size;

					__bHitTest = true;
					lineColorVal = xUtils.hitTest.config.color;

					__context = _self.m_memcontext;
				}

				var __drawLineParam = {
		    		context : __context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Line.strokeWeight,
		    		lineColor : lineColorVal
		    	};

				for(var __nLocalIdx = __nLoopStart; __nLocalIdx < __nLoopEnd; __nLocalIdx++) {
					var __dataIndex = _self.m_drawWrapper.didConvertLocalIndexToDataIndex(__nLocalIdx);
					var __stPrice1 = _self.didGetDataAt(__dataIndex, false);
					var __stPrice2 = _self.didGetDataAt(__dataIndex + 1, false);

					if(xUtils.validator.isValidPrice(__stPrice1) !== true || xUtils.validator.isValidPrice(__stPrice2) !== true) {
						continue;
					}

					__nLocalXPos1 = _self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);
					__nLocalXPos2 = _self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex + 1);
					__nLocalYPos1 = _self.GetYPos(__stPrice1.close);
					__nLocalYPos2 = _self.GetYPos(__stPrice2.close);

					if(__bHitTest !== true) {
						// #676
						if(_self.m_bSelect === true) {
							lineColorVal = _self.m_drawWrapper.m_stEnv.System.SelectedFill.lineColor;
						}
						else {
							lineColorVal = _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Line.strokeColor;
						}
					}

					// set drawing param
					__drawLineParam.pt1.x = __nLocalXPos1;
					__drawLineParam.pt1.y = __nLocalYPos1;
					__drawLineParam.pt2.x = __nLocalXPos2;
					__drawLineParam.pt2.y = __nLocalYPos2;
					gxDc.Line(__drawLineParam);
				}
			};

			/**
			 * draw equivolume chart
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.DrawEquiVolumeChart = function(posval) {
				_self.SetBackgroundCodeName("");

				var __nLocalXPos, __nLocalYPos;
				var stPrice;
				var colorVal;

				var __nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var __nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				var __nLoopStart = 0;
				var __nLoopEnd =__nScrSize;
				var __bHitTest = false;
				var lineColorVal;
				var fillColorVal;
				var __context = _self.m_context;
				if(posval !== undefined) {
					var __dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false) - 3;
					__nLoopStart = _self.m_drawWrapper.didConvertDataIndexToLocalIndex(__dataIndexAtPos);
					__nLoopEnd = __nLoopStart + xUtils.hitTest.config.size;

					__bHitTest = true;
					lineColorVal = xUtils.hitTest.config.color;
					fillColorVal = xUtils.hitTest.config.color;

					__context = _self.m_memcontext;
				}

				var __drawLineParam = {
		    		context : __context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Candle.strokeWeight,
		    		lineColor : ''
		    	};

				var __drawRectParam = {
		    		context : __context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Candle.strokeWeight,
		    		lineColor : '',
		    		fillColor : ''
		    	};

				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();
				var xEnv   = _self.didGetEnvInfo();

				for(var __nLocalIdx = __nLoopStart; __nLocalIdx < __nLoopEnd; __nLocalIdx++) {
					var __dataIndex = xAxisX.didConvertLocalIndexToDataIndex(__nLocalIdx);
					var __stPrice = _self.didGetDataAt(__dataIndex, false);

					if(xUtils.validator.isValidPrice(__stPrice) !== true) {
						continue;
					}

					// #1271
					if(xUtils.validator.isFixedPrice(__stPrice, xEnv) === true) {
						continue;
					}
					//

					var xBarInfos= {};
					__nLocalXPos = xAxisX.GetIndex2Pixel(__dataIndex, xBarInfos);//_self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);
					//__nLocalXPos = _self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);

					var iYPosOpen  = xAxisY.GetYPos(__stPrice.open);
					var iYPosHigh  = xAxisY.GetYPos(__stPrice.high);
					var iYPosLow   = xAxisY.GetYPos(__stPrice.low);
					var iYPosClose = xAxisY.GetYPos(__stPrice.close);

					if(__bHitTest !== true) {
						// #676
						if(_self.m_bSelect === true) {
							lineColorVal = xEnv.System.SelectedFill.lineColor;
							fillColorVal = xEnv.System.SelectedFill.fillColor;
						}
						else {
							lineColorVal = xEnv.PriceStyleConfig.Candle.strokeDnColor;
							fillColorVal = xEnv.PriceStyleConfig.Candle.fillDnColor;
							if (parseInt(__stPrice.open) <= parseInt(__stPrice.close)) {
								lineColorVal = xEnv.PriceStyleConfig.Candle.strokeUpColor;
								fillColorVal = xEnv.PriceStyleConfig.Candle.fillUpColor;
							}
						}
					}

					var rcX, rcY, rcW, rcH;
					//var __xBarInfo = _self.m_drawWrapper.didGetAdjustedBarInfo(__nLocalXPos);

					rcX = xBarInfos.pos;
					rcW = xBarInfos.width;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					/*
					rcX = xBarInfos.barInfo.left;
					rcW = xBarInfos.barInfo.right - xBarInfos.barInfo.left;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					*/

					if (parseInt(__stPrice.open) == parseInt(__stPrice.close)) {
						__drawLineParam.pt1.x = rcX;
						__drawLineParam.pt1.y = rcY;
						__drawLineParam.pt2.x = rcX+rcW;
						__drawLineParam.pt2.y = rcY;
						__drawLineParam.lineColor = lineColorVal;
						gxDc.Line(__drawLineParam);
					}
					else {
						__drawRectParam.rect.x = rcX;
						__drawRectParam.rect.y = rcY;
						__drawRectParam.rect.width = rcW;
						__drawRectParam.rect.height = rcH;
						__drawRectParam.lineColor = lineColorVal;
						__drawRectParam.fillColor = fillColorVal;
						gxDc.Rectangle(__drawRectParam);
					}

					/*
					// console.debug("[WGC] :" + __xBarInfo);
					// console.debug("[WGC] :" + xBarInfos);
					// console.debug("[WGC] :" + __drawRectParam);
					*/
				}
			};

			/**
			 * draw long volume chart
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.DrawLongVolumeChart = function(posval) {
				_self.SetBackgroundCodeName("");

				var __nLocalXPos, __nLocalYPos;
				var stPrice;
				var colorVal;

				var __nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var __nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				var __nLoopStart = 0;
				var __nLoopEnd =__nScrSize;
				var __bHitTest = false;
				var lineColorVal;
				var fillColorVal;
				var __context = _self.m_context;
				if(posval !== undefined) {
					var __dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false) - 3;
					__nLoopStart = _self.m_drawWrapper.didConvertDataIndexToLocalIndex(__dataIndexAtPos);
					__nLoopEnd = __nLoopStart + xUtils.hitTest.config.size;

					__bHitTest = true;
					lineColorVal = xUtils.hitTest.config.color;
					fillColorVal = xUtils.hitTest.config.color;

					__context = _self.m_memcontext;
				}

				var __drawLineParam = {
		    		context : __context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Candle.strokeWeight,
		    		lineColor : ''
		    	};

				var __drawRectParam = {
		    		context : __context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Candle.strokeWeight,
		    		lineColor : '',
		    		fillColor : ''
		    	};

				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();
				var xEnv   = _self.didGetEnvInfo();

				for(var __nLocalIdx = __nLoopStart; __nLocalIdx < __nLoopEnd; __nLocalIdx++) {
					var __dataIndex = xAxisX.didConvertLocalIndexToDataIndex(__nLocalIdx);
					var __stPrice = _self.didGetDataAt(__dataIndex, false);

					if(xUtils.validator.isValidPrice(__stPrice) !== true) {
						continue;
					}

					// #1271
					if(xUtils.validator.isFixedPrice(__stPrice, xEnv) === true) {
						continue;
					}
					//

					var xBarInfos= {};
					__nLocalXPos = xAxisX.GetIndex2Pixel(__dataIndex, xBarInfos);//_self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);
					//__nLocalXPos = _self.m_drawWrapper.GetXPosAtDataIndex(__dataIndex);

					var iYPosOpen  = xAxisY.GetYPos(__stPrice.open);
					var iYPosHigh  = xAxisY.GetYPos(__stPrice.high);
					var iYPosLow   = xAxisY.GetYPos(__stPrice.low);
					var iYPosClose = xAxisY.GetYPos(__stPrice.close);

					if(__bHitTest !== true) {
						// #676
						if(_self.m_bSelect === true) {
							lineColorVal = xEnv.System.SelectedFill.lineColor;
							fillColorVal = xEnv.System.SelectedFill.fillColor;
						}
						else {
							lineColorVal = xEnv.PriceStyleConfig.Candle.strokeDnColor;
							fillColorVal = xEnv.PriceStyleConfig.Candle.fillDnColor;
							if (parseInt(__stPrice.open) <= parseInt(__stPrice.close)) {
								lineColorVal = xEnv.PriceStyleConfig.Candle.strokeUpColor;
								fillColorVal = xEnv.PriceStyleConfig.Candle.fillUpColor;
							}
						}
					}

					// center line
					__drawLineParam.pt1.x = __nLocalXPos;
					__drawLineParam.pt1.y = iYPosHigh;
					__drawLineParam.pt2.x = __nLocalXPos;
					__drawLineParam.pt2.y = iYPosLow;
					__drawLineParam.lineColor = lineColorVal;
					gxDc.Line(__drawLineParam);

					//if ((iYPosOpen - iYPosClose) === 0)
					//	iYPosClose = iYPosClose + 1;

					var rcX, rcY, rcW, rcH;
					//var __xBarInfo = _self.m_drawWrapper.didGetAdjustedBarInfo(__nLocalXPos);

					rcX = xBarInfos.pos;
					rcW = xBarInfos.width;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					/*
					rcX = xBarInfos.barInfo.left;
					rcW = xBarInfos.barInfo.right - xBarInfos.barInfo.left;
					rcY = iYPosOpen;
					rcH = iYPosClose - rcY;
					*/

					if (parseInt(__stPrice.open) == parseInt(__stPrice.close)) {
						__drawLineParam.pt1.x = rcX;
						__drawLineParam.pt1.y = rcY;
						__drawLineParam.pt2.x = rcX+rcW;
						__drawLineParam.pt2.y = rcY;
						__drawLineParam.lineColor = lineColorVal;
						gxDc.Line(__drawLineParam);
					}
					else {
						__drawRectParam.rect.x = rcX;
						__drawRectParam.rect.y = rcY;
						__drawRectParam.rect.width = rcW;
						__drawRectParam.rect.height = rcH;
						__drawRectParam.lineColor = lineColorVal;
						__drawRectParam.fillColor = fillColorVal;
						gxDc.Rectangle(__drawRectParam);
					}

					/*
					// console.debug("[WGC] :" + __xBarInfo);
					// console.debug("[WGC] :" + xBarInfos);
					// console.debug("[WGC] :" + __drawRectParam);
					*/
				}
			};

	        /**
			 *
			 */
			this.DrawThreeBreakLineChart = function() {
			};

	        /*
			 *
			 */
			this.DrawPointFigureChart = function() {
			};

			/**
			 *
			 */
			this.didGetSymbolInfo = function() {
				return(_self.m_symbolInfo);
			};

			/**
			 * get price data array
			 * @return array
			 */
			this.didGetPriceDatas = function(id) {
				var __datas;

				__datas = _self.m_arrData;

				return(__datas);
			};

			/**
			 * get price data array
			 * @return array
			 */
			this.didGetTimeDatas = function(id) {
				var __datas;

				__datas = _self.m_arrTimeData;

				return(__datas);
			};

			this.didGetTickNos = function(id) {
				var __datas;

				__datas = _self.m_arrTickNo;

				return(__datas);
			};

			this.didCalcVolumeAtRange = function(argRange) {
				var result = {
					rangeVolume : 0,
					fullVolume : 0
				};

				if(argRange === undefined || argRange == null) {
					return(result);
				}

				var nCount = _self.m_arrData.length;
				for(var ii = 0; ii < nCount; ii++) {
					var stPrice = _self.m_arrData[ii];

					result.fullVolume += xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.volume);
				}

				var nLoopEnd = Math.min(nCount, argRange.position + argRange.length);
				for(var ii = argRange.position; ii < nLoopEnd; ii++) {
					var stPrice = _self.m_arrData[ii];
					result.rangeVolume += xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.volume);
				}

				return(result);
			};

			/**
			 * @param[in] strTime
			 * @return time index
			 */
			this.didGetDataIndexOfTime = function(strTime, tickNo) {
				var __timeIndex = undefined;
				__timeIndex = _self.m_arrTimeData.indexOf(strTime);

				var nTemp = parseInt(tickNo);
				if(isNaN(nTemp) !== true) {
					__timeIndex += nTemp;
				}

				return(__timeIndex);
			};

			/**
			 * get data at
			 *
			 * @param[in] at at
			 * @param[in] bScreen screen index or data index
			 * @return price data
			 */
			this.didGetDataAt = function(at, bScreen) {
				var __nDataCount = 0;
				var __xDatas = _self.m_arrData;
				if(__xDatas !== undefined && __xDatas != null) {
					__nDataCount = __xDatas.length;
				}

				// data index
				var __dataIndex = (bScreen === true) ? _self.didConvertLocalIndexToDataIndex(at) : at;

				if(__nDataCount < 1 || __dataIndex < 0 || __dataIndex >= __nDataCount) {
					return(null);
				}

				var __result = __xDatas[__dataIndex];

				return(__result);
			};

			/**
			 *
			 */
			this.SetThreeBreakLine = function(iIndex, stPrice) {
				return;
			};

			/**
			 *
			 */
			this.SetPointFigure = function(iIndex, stPrice) {
				return;
			};

			/**
				Get Last Valid Index of Non-Hosino
				@param[in,out]	pnIdx	data index
				@param[in]		nResv	reserved
				@return			BOOL
			*/
			this.GetLastDataIndex = function(nIdx) {
				/*
					int	nCnt	= GetDataSize( );

					int	ii		= 0;

					for(ii = nCnt - 1; ii >= 0; ii--)
					{
						PST_DODPB pstPB = GetPriceData( ecnDefaultType, ii );
						if(pstPB
							&& !__DF_CHECK_HOSINO(pstPB->nFlag))
						{
							*pnIdx = ii;

							return(true);
						}
					}

					return( false );
				*/
				return(nIdx);
			}

			//
			// NOTE: Axis
			//

			this.didGetAxisX = function() {
				return(_self.m_drawWrapper.didGetAxisX());
			};

			this.didGetAxisY = function() {
				// TODO: fix
				return(_self);
			};
	    };

	    return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDOPriceBase");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOPriceBase"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOContainerBase"]
			);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./canvas2DUtil"),
				require("./chartDOContainerBase")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDOPriceBase",
            ['ngc/chartUtil', 'ngc/canvas2DUtil', 'ngc/chartDOContainerBase'],
                function(xUtils, gxDc, doBaseClass) {
                    return loadModule(xUtils, gxDc, doBaseClass);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOPriceBase"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOContainerBase"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOPriceBase");
})(this);
