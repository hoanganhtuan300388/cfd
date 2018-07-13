(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc, doBaseClass) {
		"use strict";

		var _DOPlot = function() {
			var _self = this;

			this.m_xDoParent = null;
			this.m_strName = 'plot';
			this.m_strDisp = 'plot';
			this.m_point = 2;
			this.m_arrDatas = [];
			this.m_arrValid = [];
			this.m_arrState = [];	///
			this.m_nMoveShift = 0;
			this.m_bSelect = false;

			this.m_nMoveShiftParamLink = undefined;

			this.m_xPlotInfo = {
				name : 'plot',
				alias : 'plot',
				plotType : xUtils.indicator.plotType.ESDG_PLOTLINE,
				plotStyle : xUtils.indicator.plotStyle.ESSS_PL_LINE,
				color : '#ff0000',
				lineWeight : 1,
				lineStyle : gxDc.penstyle.solid,
				ignore : false,
				extraDiff : null,
				targetPrice : 0
			};

			/**
			 * deselect all object
			 */
			this.DeselectAllObject = function() {
				_self.m_bSelect = false;
			};

			this.didGetEnvInfo = function() {
				return(_self.m_xDoParent.didGetEnvInfo());
			};

			this.didClearDatas = function() {
				_self.m_arrDatas = [];
				_self.m_arrValid = [];
				_self.m_arrState = [];
			};

			this.didGetReferencedBaseDataAt = function(dataIndex, bScreen) {
				return(_self.m_xDoParent.didGetReferencedBaseDataAt(dataIndex, bScreen));
			};

			this.didSetSize = function(argSize, bFlag) {
				var nDataCount = _self.m_arrDatas.length;
				var nDiff = argSize - nDataCount;
				if(nDiff > 0) {
					var bValid = bFlag === false ? false : true;
					var dValue = bFlag === true ? xUtils.constants.default.DEFAULT_WRONG_VALUE : 0;
					for(var ii = 0; ii < nDiff; ii++) {
						_self.didAddData(bValid, dValue);
					}
				}
			};

			this.didAddData = function(isValid, data, state) {
				_self.m_arrValid.push(isValid);
				_self.m_arrDatas.push(data);
				_self.m_arrState.push(state);

				return(_self.m_arrDatas.length - 1);
			};

			this.didRemoveDataAt = function(argIndex) {
				var nDataCount = _self.m_arrDatas.length;
				if(nDataCount < 1 && argIndex < 0 || argIndex >= nDataCount) {
					return(false);
				}

				_self.m_arrValid.splice(argIndex, 1);
				_self.m_arrDatas.splice(argIndex, 1);
				_self.m_arrState.splice(argIndex, 1);
			};

			this.didSetInvalidData = function(argIndex) {
				return(_self.didSetData(argIndex, false, xUtils.constants.default.DEFAULT_WRONG_VALUE));
			};

			this.didSetData = function(argIndex, isValid, data, state) {
				var nDataCount = _self.m_arrDatas.length;
				if(nDataCount < 1 && argIndex < 0 || argIndex >= nDataCount) {
					return;
				}

				_self.m_arrValid[argIndex] = isValid;
				_self.m_arrDatas[argIndex] = data;
				_self.m_arrState[argIndex] = state;

				return(argIndex);
			};

			/**
			 * calculate min and max
			 * @param[in] argScrSIdx	current scroll position
			 * @param[in] argScrSize	screen size
			 * @param[in] argFlag		full flag
			 */
			this.didCalcMinMax = function(argDataSIdx, argScrSize, argFlag) {
				if(_self.hasIgnore() === true || _self.hasHide() === true) {
					return;
				}

				var nPlotDataCount = _self.didGetDataSize();
				if(nPlotDataCount < 1) {
					return;
				}

				var result = {
					nMaxIndex : -1,
					nMaxPrice : -xUtils.constants.default.DEFAULT_WRONG_VALUE,
					nMinIndex : -1,
					nMinPrice : xUtils.constants.default.DEFAULT_WRONG_VALUE,
				};

				for(var ii = 0; ii < argScrSize; ii++) {
					var dataIndex = argDataSIdx + ii;
					var shiftedIndex = _self.didGetShiftedDataIndex(dataIndex, false);
					var dataValue = _self.m_arrDatas[shiftedIndex];

					if ((dataValue === undefined) || (dataValue === xUtils.constants.default.DEFAULT_WRONG_VALUE) || (_self.m_bPriceType && (dataValue === 0))) {
						continue;
					}

					if(dataValue > result.nMaxPrice) {
						result.nMaxPrice = dataValue;
						result.nMaxIndex = shiftedIndex;
					}

					if(dataValue < result.nMinPrice) {
						result.nMinPrice = dataValue;
						result.nMinIndex = shiftedIndex;
					}
				}

				// #785
				if(_self.m_xPlotInfo.plotStyle === xUtils.indicator.plotStyle.ESSS_PL_STICK) {
					var nBaseValue = 0;
					var baseValue  = _self.m_xPlotInfo.baseValue;
					if(baseValue !== undefined && baseValue != null) {
						if(typeof baseValue === "number") {
							nBaseValue = baseValue;
						}
						else {
							nBaseValue = parseInt(baseValue);
						}
					}

					if(nBaseValue > result.nMaxPrice) {
						result.nMaxPrice = nBaseValue;
					}

					if(nBaseValue < result.nMinPrice) {
						result.nMinPrice = nBaseValue;
					}
				}

				return(result);
			};

			this.hasIgnore = function() {
				if(_self.m_xPlotInfo.ignore === true) {
					return(true);
				}

				return(false);
			};

			this.hasHide = function() {
				if(_self.m_xPlotInfo.hide === true) {
					return(true);
				}

				return(false);
			}

			this.isValidAt = function(dataIdx) {
				return(_self.m_arrValid[dataIdx]);
			};

			this.didGetDataSize = function() {
				return(_self.m_arrDatas.length);
			};

			this.didGetDataAt = function(dataIdx) {
				return(_self.m_arrDatas[dataIdx]);
			};

			this.didGetStateAt = function(dataIdx) {
				return(_self.m_arrState[dataIdx]);
			};

			this.didGetStateColorAt = function(dataIdx) {
				// #2046
				var xEnv	  = _self.didGetEnvInfo();
				var plotStyle = _self.m_xPlotInfo.plotStyle;

				if(plotStyle === xUtils.indicator.plotStyle.ESSS_PL_STICK) {
					if(_self.m_xPlotInfo.usePriceUpDn === true) {
						var stPrice = _self.didGetReferencedBaseDataAt(dataIdx, false);
						if(xUtils.dataConverter.isMinusCandleForPriceData(stPrice) === true) {
							return(xEnv.PriceStyleConfig.Candle.fillDnColor);
						}
						else {
							return(xEnv.PriceStyleConfig.Candle.fillUpColor);
						}
					}
					// #2039
					else if(_self.m_xPlotInfo.useBarUpDn === true) {
						var stPrice = _self.didGetReferencedBaseDataAt(dataIdx, false);
						if(xUtils.dataConverter.isMinusCandleForPriceData(stPrice) === true) {
							if(_self.m_xPlotInfo.colorDn !== undefined && _self.m_xPlotInfo.colorDn != null) {
								return(_self.m_xPlotInfo.colorDn);
							}
						}
						else {
							if(_self.m_xPlotInfo.colorUp !== undefined && _self.m_xPlotInfo.colorUp != null) {
								return(_self.m_xPlotInfo.colorUp);
							}
						}
					}
					//
				}
				else if(plotStyle === xUtils.indicator.plotStyle.ESSS_PL_POINT) {
					var plotState = _self.didGetStateAt(dataIdx);
					if(plotState === xUtils.indicator.plotState.stateUp) {
						if(_self.m_xPlotInfo.colorUp !== undefined && _self.m_xPlotInfo.colorUp != null) {
							return(_self.m_xPlotInfo.colorUp);
						}
					}

					if(plotState === xUtils.indicator.plotState.stateDn) {
						if(_self.m_xPlotInfo.colorDn !== undefined && _self.m_xPlotInfo.colorDn != null) {
							return(_self.m_xPlotInfo.colorDn);
						}
					}
				}
				//

				return(_self.m_xPlotInfo.color);
			};

			this.didGetPointedDataAt = function(argIndex) {
				 return(Math.round(_self.didGetDataAt(argIndex)));
			};

			this.didGetDebugPointedDataAt = function(argIndex, pointValue) {
				var plotData = _self.didGetDataAt(argIndex);
				var pointedValue = xUtils.number.didGetPointedValue(plotData, pointValue);

				return(pointedValue);
				//return(Math.round(pointedValue));
			};

			/**
			 *
			 */
			this.didGetShiftValue = function(onlySelf) {
				var nShiftValue = 0;
				if(onlySelf !== true) {
					nShiftValue = _self.m_xDoParent.didGetShiftValue();
				}

				if(_self.m_nMoveShiftParamLink !== undefined && _self.m_nMoveShiftParamLink != null) {
					nShiftValue += _self.m_xDoParent.didGetPlotShiftValueAt(_self.m_nMoveShiftParamLink);
				}
				else {
					nShiftValue += _self.m_nMoveShift;
				}

				return(nShiftValue);
			};

			/**
			 * get span(left shift)
			 * @return number
			 */
			this.didGetShifLeftCount = function() {
				return(xUtils.didGetShifLeftCount(_self.m_nMoveShift));
			};

			/**
			 * get span(right shift)
			 * @return number
			 */
			this.didGetShifRightCount = function() {
				return(xUtils.didGetShifRightCount(_self.m_nMoveShift));
			};

			/**
			 * [description]
			 * @param  {[type]} argInfo
			 * @return {[type]}
			 */
			this.didSetShiftInfo = function(argInfo) {
				if(argInfo.moveShiftParamLink !== undefined && argInfo.moveShiftParamLink != null) {
					_self.m_nMoveShiftParamLink = argInfo.moveShiftParamLink;
				}

				_self.m_nMoveShift = xUtils.didCalculateShiftInfo(argInfo, xUtils.constants.default.SHIFT_IS_ST);
			};

			/**
			    Find Valid Index for Data
				@param[in]     nSIdx	start index
				@param[in]     bNext	next flag
			    @return        BOOL
			*/
			this.FindValidIdx = function(nSIdx, bNext) {
				var	nDCnt	= _self.didGetDataSize();
				if( nDCnt < 1 || nSIdx < 0 || nSIdx >= nDCnt ) {
					return ;
				}

				var	reg_i	= 0 ;
				if( bNext ) {
					for ( reg_i = nSIdx + 1 ; reg_i < nDCnt ; reg_i++ ) {
						var isValid = _self.isValidAt(reg_i);

						if( isValid === true ) {
							return( reg_i ) ;
						}
					}
				}
				else {
					for ( reg_i = nSIdx - 1 ; reg_i >= 0 ; reg_i-- ) {
						var isValid = _self.isValidAt(reg_i);

						if( isValid === true ) {
							return( reg_i ) ;
						}
					}
				}

				return ;
			};

			/**
			 * set plot info.
			 * @param[in] argInfo information
			 */
			this.didSetPlotInfo = function(argInfo, isChanged) {
				if(argInfo === undefined || argInfo == null) {
					return(false);
				}

				if(isChanged === true) {
					/*
					_self.m_xPlotInfo.alias      = argInfo.alias      || _self.m_xPlotInfo.alias;
					_self.m_xPlotInfo.plotStyle  = argInfo.plotStyle  || _self.m_xPlotInfo.plotStyle;
					_self.m_xPlotInfo.color      = argInfo.color      || _self.m_xPlotInfo.color;
					_self.m_xPlotInfo.lineWeight = argInfo.lineWeight || _self.m_xPlotInfo.lineWeight;
					_self.m_xPlotInfo.lineStyle  = argInfo.lineStyle  || _self.m_xPlotInfo.lineStyle;

					_self.m_xPlotInfo.hide       = argInfo.hide       || _self.m_xPlotInfo.hide;
					*/
					_self.m_xPlotInfo.alias      = argInfo.alias      ;
					_self.m_xPlotInfo.plotStyle  = argInfo.plotStyle  ;
					_self.m_xPlotInfo.color      = argInfo.color      ;
					_self.m_xPlotInfo.lineWeight = argInfo.lineWeight ;
					_self.m_xPlotInfo.lineStyle  = argInfo.lineStyle  ;

					_self.m_xPlotInfo.colorUp	 = argInfo.colorUp	  ; // #2056
					_self.m_xPlotInfo.colorDn	 = argInfo.colorDn	  ; // #2056

					_self.m_xPlotInfo.hide       = argInfo.hide       ;
				}
				else {
					_self.m_xPlotInfo = argInfo;
					_self.m_strName   = _self.m_xPlotInfo.name;
				}

				_self.m_strDisp = _self.m_xPlotInfo.alias;

				_self.didSetShiftInfo(argInfo);

				return(true);
			};

			/**
			 * @param[in] argLocalPosX    position x
			 * @param[in] argLocalPosY    position y
			 */
			this.didDrawSelectedMark = function(argLocalPosX, argLocalPosY) {
				_self.m_xDoParent.didDrawSelectedMark(argLocalPosX, argLocalPosY);
			};

			/**
			 * get real data index by shifted
			 * @param[in] argIndex		data index or shifted index
			 * @param[in] argPlotNo		plot number
			 * @return shifted index
			 */
			this.didGetShiftedDataIndex = function(argIndex, onlySelf, toDataIndex) {
				var nShiftValue = _self.didGetShiftValue(onlySelf);
				var convertedIndex = xUtils.didConvertShiftedIndex(argIndex, nShiftValue, toDataIndex);

				return(convertedIndex);
			};

			/**
			 * get axis x
			 * @return {[type]}
			 */
			this.didGetAxisX = function() {
				var drawWrapper = _self.m_xDoParent.m_drawWrapper;
				var xAxisX = drawWrapper;

				return(xAxisX);
			};

			/**
			 * get axis y
			 * @return {[type]}
			 */
			this.didGetAxisY = function() {
				var xAxisY = _self.m_xDoParent;

				return(xAxisY);
			};

			/**
			 * get context
			 * @return {[type]}
			 */
			this.didGetContext = function(bHitTest) {
				var context;

				if(bHitTest === true) {
					context = _self.m_xDoParent.m_memcontext;
				}
				else {
					context = _self.m_xDoParent.m_context
				}

				return(context);
			};

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @param  {[type]} hitTestTool
			 * @return {[type]}
			 */
			this.didHitTest = function(hitTestTool, dataIndexAtPos) {
				if(_self.hasIgnore() === true || _self.hasHide() === true) {
					return(false);
				}

				if(hitTestTool === undefined || hitTestTool == null) {
					return(false);
				}

				// prepare
				hitTestTool.willBeHitTest();

				//
				_self.didDrawObj(true);

				//
				var result = hitTestTool.didHitTest();

				// close
				hitTestTool.closeHitTest();

				//
				return(result);
			};

			/**
			 * [description]
			 * @param  {Boolean} isHitTest
			 * @return {[type]}
			 */
			this.didDrawObj = function(isHitTest) {
				//
				//
				//
				var drawWrapper = _self.m_xDoParent.m_drawWrapper;
				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();
				var context = _self.didGetContext();

				var nScrSIdx = drawWrapper.m_xScrollInfo.pos;
				var nScrSize = drawWrapper.m_xScrollInfo.screenSize;

	            var nLoopStart = 0;
				var nLoopEnd = nScrSize;
				var bHitTest	 = false;
				var	bSelected	 = false;
				var	baseValue	 = _self.m_xPlotInfo.baseValue;
				var plotStyle	 = _self.m_xPlotInfo.plotStyle;
				var lineStyle    = _self.m_xPlotInfo.lineStyle;
				var lineWeight   = _self.m_xPlotInfo.lineWeight;
				var lineColorVal = _self.m_xPlotInfo.color;
				var fillColorVal = _self.m_xPlotInfo.color;
				var	colorUp		 = _self.m_xPlotInfo.colorUp;
				var	colorDn		 = _self.m_xPlotInfo.colorDn;

				if(isHitTest === true) {
					bHitTest     = true;
					lineColorVal = xUtils.hitTest.config.color;
					fillColorVal = xUtils.hitTest.config.color;
					colorUp		 = xUtils.hitTest.config.color;
					colorDn		 = xUtils.hitTest.config.color;

					context = _self.didGetContext(true);
				}
				// #676
				else {
					var xEnv = _self.didGetEnvInfo();
					if(xEnv !== undefined && xEnv != null && (_self.m_xDoParent.m_bSelect === true || _self.m_bSelect === true)) {
						bSelected    = true;
						lineColorVal = xEnv.System.SelectedFill.lineColor;
						fillColorVal = xEnv.System.SelectedFill.lineColor;
						colorUp		 = xEnv.System.SelectedFill.lineColor;
						colorDn		 = xEnv.System.SelectedFill.lineColor;
					}
				}
				//

				var drawLineParam = {
		    		context : context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
					lineStyle : lineStyle,
		    		lineWidth : lineWeight,
		    		lineColor : lineColorVal
		    	};

				var drawRectParam = {
		    		context : context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : lineWeight,
		    		lineColor : lineColorVal,
		    		fillColor : fillColorVal
		    	};

				var drawCircleParam = {
		    		context : context,
		    		pt : {
			    		x : 0,
			    		y : 0
					},
					radius : 0,
		    		lineWidth : lineWeight,
		    		lineColor : lineColorVal,
		    		fillColor : fillColorVal
		    	};

				//
				// #785
				// ESSS_PL_STICK
				if(plotStyle === xUtils.indicator.plotStyle.ESSS_PL_STICK) {
					for(var nDataIdx = 0; nDataIdx < nScrSize; nDataIdx++) {
						var dataIndex = xAxisX.didConvertLocalIndexToDataIndex(nDataIdx);
						var shiftedIndex = _self.didGetShiftedDataIndex(dataIndex);

						var dataValue = _self.m_arrDatas[shiftedIndex];

						if (xUtils.dataValidator.isValidData(dataValue) !== true) {
							continue;
						}

						if(_self.m_xPlotInfo.usePriceUpDn === true) {
							if(bHitTest !== true && bSelected !== true) {
								var stPrice = _self.didGetReferencedBaseDataAt(dataIndex, false);
								if(xUtils.dataConverter.isMinusCandleForPriceData(stPrice) === true) {
									lineColorVal =
									fillColorVal = xEnv.PriceStyleConfig.Candle.fillDnColor;
								}
								else {
									lineColorVal =
									fillColorVal = xEnv.PriceStyleConfig.Candle.fillUpColor;
								}
							}
						}
						// #2039
						else if(_self.m_xPlotInfo.useBarUpDn === true) {
							if(bHitTest !== true && bSelected !== true) {
								var stPrice = _self.didGetReferencedBaseDataAt(dataIndex, false);
								if(xUtils.dataConverter.isMinusCandleForPriceData(stPrice) === true) {
									lineColorVal =
									fillColorVal = colorDn;
								}
								else {
									lineColorVal =
									fillColorVal = colorUp;
								}
							}
						}
						//

						var xBarInfos= {};
						var nLocalXPos  = xAxisX.GetIndex2Pixel(dataIndex, xBarInfos);
						var nLocalYPos1 = xAxisY.GetYPos(dataValue);
						var nBaseValue = 0;
						if(baseValue !== undefined && baseValue != null) {
							if(typeof baseValue === "number") {
								nBaseValue = baseValue;
							}
							else {
								nBaseValue = parseInt(baseValue);
							}
						}
						var nLocalYPos2 = xAxisY.GetYPos(nBaseValue);

						var rcX, rcY, rcW, rcH;
						rcX = xBarInfos.pos;
						rcW = xBarInfos.width;

						if (nLocalYPos1 === nLocalYPos2) {
							rcY = nLocalYPos1;
							rcH = 1;

							drawLineParam.pt1.x = rcX;
							drawLineParam.pt1.y = rcY;
							drawLineParam.pt2.x = rcX+rcW;
							drawLineParam.pt2.y = rcY;
							drawLineParam.lineColor = lineColorVal;
							gxDc.Line(drawLineParam);
						}
						else {
							rcY = nLocalYPos1 > nLocalYPos2 ? nLocalYPos2 : nLocalYPos1;
							rcH = Math.abs(nLocalYPos2 - nLocalYPos1);

							drawRectParam.rect.x = rcX;
							drawRectParam.rect.y = rcY;
							drawRectParam.rect.width = rcW;
							drawRectParam.rect.height = rcH;
							drawRectParam.lineColor = lineColorVal;
							drawRectParam.fillColor = fillColorVal;
							gxDc.Rectangle(drawRectParam);
						}
					}
				}
				//
				// #809
				// ESSS_PL_POINT
				else if(plotStyle === xUtils.indicator.plotStyle.ESSS_PL_POINT) {
					for(var nDataIdx = 0; nDataIdx < nScrSize; nDataIdx++) {
						var dataIndex = xAxisX.didConvertLocalIndexToDataIndex(nDataIdx);
						var shiftedIndex = _self.didGetShiftedDataIndex(dataIndex);

						var dataValue = _self.m_arrDatas[shiftedIndex];

						if (xUtils.dataValidator.isValidData(dataValue) !== true) {
							continue;
						}

						var	plotState = _self.didGetStateAt(shiftedIndex);
						if(plotState === xUtils.indicator.plotState.stateUp) {
							lineColorVal =
							fillColorVal = colorUp;
						}
						else if(plotState === xUtils.indicator.plotState.stateDn) {
							lineColorVal =
							fillColorVal = colorDn;
						}

						var xBarInfos= {};
						var nLocalXPos = xAxisX.GetIndex2Pixel(dataIndex, xBarInfos);
						var nLocalYPos = xAxisY.GetYPos(dataValue);

						var rcX, rcY, rcW, rcH;
						rcX = xBarInfos.pos;
						rcW = xBarInfos.width;

						var radius = parseInt(xBarInfos.width / 2);
						if(radius < 1) {
							radius = 1;
						}

						drawCircleParam.pt.x = nLocalXPos;
						drawCircleParam.pt.y = nLocalYPos;
						drawCircleParam.radius = radius;
						drawCircleParam.lineColor = lineColorVal;
						drawCircleParam.fillColor = fillColorVal;
						gxDc.Circle(drawCircleParam);
					}
				}
				else {// if(plotStyle === xUtils.indicator.plotStyle.ESSS_PL_LINE) {
					for(var nDataIdx = 0; nDataIdx < nScrSize; nDataIdx++) {
						var dataIndex1 = xAxisX.didConvertLocalIndexToDataIndex(nDataIdx);
						var shiftedIndex1 = _self.didGetShiftedDataIndex(dataIndex1);
						var dataIndex2 = dataIndex1 + 1;
						var shiftedIndex2 = shiftedIndex1 + 1;

						var dataValue1 = _self.m_arrDatas[shiftedIndex1];
						var dataValue2 = _self.m_arrDatas[shiftedIndex2];

						if (xUtils.dataValidator.isValidData(dataValue1) !== true || xUtils.dataValidator.isValidData(dataValue2) !== true) {
							continue;
						}

						var nLocalXPos1 = xAxisX.GetXPosAtDataIndex(dataIndex1);
						var nLocalXPos2 = xAxisX.GetXPosAtDataIndex(dataIndex2);

						var nLocalYPos1 = xAxisY.GetYPos(dataValue1);
						var nLocalYPos2 = xAxisY.GetYPos(dataValue2);

						drawLineParam.pt1.x = nLocalXPos1;
						drawLineParam.pt1.y = nLocalYPos1;
						drawLineParam.pt2.x = nLocalXPos2;
						drawLineParam.pt2.y = nLocalYPos2;
						drawLineParam.lineColor = lineColorVal;

						gxDc.Line(drawLineParam);
					}
				}
			};

			/**
			 * draw data in position of the crossline
			 * @param[in] pt			{x, y}
			 * @param[in] argDataIndex	data index
			 */
			this.didDrawDataView = function(argPtDraw, argDataIndex) {
				if(_self.hasIgnore() === true || _self.hasHide() === true) {
					return(argPtDraw);
				}

				var drawTextParam = argPtDraw;

				//
				var shiftedIndex  = _self.didGetShiftedDataIndex(argDataIndex);

				var plotData      = _self.didGetPointedDataAt(shiftedIndex);
				var plotDataValid = _self.isValidAt(shiftedIndex);
				var	plotState	  = _self.didGetStateAt(shiftedIndex);

				var drawWrapper = _self.m_xDoParent.m_drawWrapper;
				var xAxisX      = _self.m_xDoParent;
				var xAxisY      = _self.m_xDoParent;
				var textSpace   = drawTextParam.textSpace;
				var pointValue  = _self.m_xDoParent.didGetPointValue();

				drawTextParam.fillStyle = _self.m_xPlotInfo.color;

				var strData = xUtils.constants.text.dataView.invalid;
				if(plotDataValid === true) {
					strData = xUtils.number.didGetPointedValue(plotData, pointValue);
				}

				var strDisplay = _self.m_strDisp + "(" + strData + ")";
				drawTextParam.text = strDisplay;
				var textLen = gxDc.TextOut(drawTextParam, true);

				drawTextParam.pt.x = drawTextParam.pt.x + textLen + textSpace;

				return(drawTextParam);
			};

			this.DrawLastValue = function(argDrawParam, dataIndex) {
				try {
					if(argDrawParam === undefined || argDrawParam == null) {
						return;
					}

					// #2046
					var xEnv = _self.didGetEnvInfo();
					var colorUp = _self.m_xPlotInfo.colorUp;
					var colorDn = _self.m_xPlotInfo.colorDn;
					//

					var shiftedIndex = _self.didGetShiftedDataIndex(dataIndex);

					var dataValue = _self.m_arrDatas[shiftedIndex];

					if (xUtils.dataValidator.isValidData(dataValue) !== true) {
						return;
					}

					argDrawParam.price.value = dataValue;
					argDrawParam.price.color = _self.m_xPlotInfo.color;

					var plotStyle	 = _self.m_xPlotInfo.plotStyle;

					if(plotStyle === xUtils.indicator.plotStyle.ESSS_PL_STICK) {
						if(_self.m_xPlotInfo.usePriceUpDn === true) {
							var stPrice = _self.didGetReferencedBaseDataAt(dataIndex, false);
							if(xUtils.dataConverter.isMinusCandleForPriceData(stPrice) === true) {
								argDrawParam.price.color = xEnv.PriceStyleConfig.Candle.fillDnColor;
							}
							else {
								argDrawParam.price.color = xEnv.PriceStyleConfig.Candle.fillUpColor;
							}
						}
						// #2039
						if(_self.m_xPlotInfo.useBarUpDn === true) {
							var stPrice = _self.didGetReferencedBaseDataAt(dataIndex, false);
							if(xUtils.dataConverter.isMinusCandleForPriceData(stPrice) === true) {
								argDrawParam.price.color = colorDn;
							}
							else {
								argDrawParam.price.color = colorUp;
							}
						}
						//
					}
					else if(plotStyle === xUtils.indicator.plotStyle.ESSS_PL_POINT) {
						var	plotState = _self.didGetStateAt(shiftedIndex);
						if(plotState === xUtils.indicator.plotState.stateUp) {
							argDrawParam.price.color = colorUp;
						}
						else if(plotState === xUtils.indicator.plotState.stateDn) {
							argDrawParam.price.color = colorDn;
						}
					}

					xUtils.axis.didDrawLastValueOnYAxis(argDrawParam);
				}
				catch(e) {
					console.error(e);

				}
			};

			/**
			 * draw data in position of the crossline
			 * @param[in] pt			{x, y}
			 * @param[in] argDataIndex	data index
			 */
			this.didGetDataViewDataAt = function(argDataIndex) {
				if(_self.hasIgnore() === true || _self.hasHide() === true) {
					return;
				}

				//
				var shiftedIndex  = _self.didGetShiftedDataIndex(argDataIndex);

				var plotData      = _self.didGetPointedDataAt(shiftedIndex);
				var plotDataValid = _self.isValidAt(shiftedIndex);
				var	plotState	  = _self.didGetStateAt(shiftedIndex);

				var pointValue  = _self.m_xDoParent.didGetPointValue();

				var strData = xUtils.constants.text.dataView.invalid;
				if(plotDataValid === true) {
					strData = xUtils.number.didGetPointedValue(plotData, pointValue);
				}

				var color = _self.didGetStateColorAt(shiftedIndex);

				var xViewData = {
					display : _self.m_strDisp,
					value   : strData,
					color   : color
				};

				return(xViewData);
			};

			this.didPrintDebugData = function() {
				/*
				_self.didGetShifLeftCount() + _self.didGetShifRightCount();

				var nLeftShift  = _self.didGetShifLeftCount();
				var nRightShift = _self.didGetShifLeftCount();
				var nShiftAll   = nLeftShift + nRightShift;
				*/
				var pointValue = _self.m_xDoParent.didGetPointValue();
				// xUtils.debug.log("Plot => " + _self.m_strName);
				var nDataCount = _self.m_arrDatas.length;
				for(var ii = 0; ii < nDataCount; ii++) {
					if(_self.m_arrValid[ii] !== true) {
						// xUtils.debug.log(xUtils.number.formatAsfillSize(ii, " ", 5) + ":	NAN");
					}
					else {
						var plotData	= _self.didGetPointedDataAt(ii);
						var strData		= xUtils.number.didGetPointedValue(plotData, pointValue);
						var	plotState	= _self.didGetStateAt(shiftedIndex);
						var strDivide	= ":	";
						if(plotState === xUtils.indicator.plotState.stateUp) {
							strDivide = "[U]" + strDivide;
						}
						else if(plotState === xUtils.indicator.plotState.stateDn) {
							strDivide = "[D]" + strDivide;
						}

						// xUtils.debug.log(xUtils.number.formatAsfillSize(ii, " ", 5) + strDivide + strData);
					}
				}
			};
		};

		//
		// class _DOPlotSidebar(for Accumulate Volume)
		//
		var _DOPlotSidebar = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _DOPlot();
			_DOPlot.apply(this, arguments);

			/**
			 * draw data in position of the crossline
			 * @param[in] pt			{x, y}
			 * @param[in] argDataIndex	data index
			 */
			this.didDrawDataView = function(argPtDraw, argDataIndex) {
				if(_self.hasIgnore() === true || _self.hasHide() === true) {
					return(argPtDraw);
				}

				var drawTextParam = argPtDraw;

				var plotData      = _self.didGetPointedDataAt(argDataIndex);
				var plotDataValid = _self.isValidAt(argDataIndex);

				var drawWrapper = _self.m_xDoParent.m_drawWrapper;
				var xAxisX      = _self.m_xDoParent;
				var xAxisY      = _self.m_xDoParent;
				var textSpace   = drawTextParam.textSpace;
				var pointValue  = _self.m_xDoParent.didGetPointValue();

				drawTextParam.fillStyle = _self.m_xPlotInfo.color;

				var strData = xUtils.constants.text.dataView.invalid;
				if(plotDataValid === true) {
					strData = xUtils.number.didGetPointedValue(plotData, pointValue);
				}

				var strDisplay = _self.m_strDisp + "(" + strData + ")";
				drawTextParam.text = strDisplay;
				var textLen = gxDc.TextOut(drawTextParam, true);

				drawTextParam.pt.x = drawTextParam.pt.x + textLen + textSpace;

				return(drawTextParam);
			};

			/**
			 * draw data in position of the crossline
			 * @param[in] pt			{x, y}
			 * @param[in] argDataIndex	data index
			 */
			this.didGetDataViewDataAt = function(argDataIndex) {
				if(_self.hasIgnore() === true || _self.hasHide() === true) {
					return;
				}

				//
				var shiftedIndex  = _self.didGetShiftedDataIndex(argDataIndex);

				var plotData      = _self.didGetPointedDataAt(shiftedIndex);
				var plotDataValid = _self.isValidAt(shiftedIndex);

				var pointValue  = _self.m_xDoParent.didGetPointValue();

				var strData = xUtils.constants.text.dataView.invalid;
				if(plotDataValid === true) {
					strData = xUtils.number.didGetPointedValue(plotData, pointValue);
				}

				var xViewData = {
					display : _self.m_strDisp,
					value   : strData,
					color   : _self.m_xPlotInfo.color
				};

				return(xViewData);
			};

			/**
			 * get axis x
			 * @return {[type]}
			 */
			this.didGetAxisX = function() {
				var xAxisX = _self.m_xDoParent.didGetAxisX();

				return(xAxisX);
			};

			/**
			 * calculate min and max
			 * @param[in] argScrSIdx	current scroll position
			 * @param[in] argScrSize	screen size
			 * @param[in] argFlag		full flag
			 */
			this.didCalcMinMax = function(argDataSIdx, argScrSize, argFlag) {
				if(_self.hasIgnore() === true || _self.hasHide() === true) {
					return;
				}

				var nPlotDataCount = _self.didGetDataSize();
				if(nPlotDataCount < 1) {
					return;
				}

				var result = {
					nMaxIndex : -1,
					nMaxPrice : -xUtils.constants.default.DEFAULT_WRONG_VALUE,
					nMinIndex : -1,
					nMinPrice : xUtils.constants.default.DEFAULT_WRONG_VALUE,

					nMaxVolIdx: -1,
					nMaxVolume: -xUtils.constants.default.DEFAULT_WRONG_VALUE,
					nMinVolIdx: -1,
					nMinVolume: xUtils.constants.default.DEFAULT_WRONG_VALUE,
				};

				var nTDSize = _self.m_arrDatas.length;

				for(var ii = 0; ii < nTDSize; ii++) {
					var dataIndex = ii;
					var dataValue = _self.m_arrDatas[dataIndex].dValue;
					var dHVal = _self.m_arrDatas[dataIndex].dHVal;
					var dLVal = _self.m_arrDatas[dataIndex].dLVal;

					if(dataValue > result.nMaxVolume) {
						result.nMaxVolume = dataValue;
						result.nMaxVolIdx = dataIndex;
					}

					if(dataValue < result.nMinVolume) {
						result.nMinVolume = dataValue;
						result.nMinVolIdx = dataIndex;
					}

					if(dHVal > result.nMaxPrice) {
						result.nMaxPrice = dHVal;
						result.nMaxIndex = dataIndex;
					}

					if(dLVal < result.nMinPrice) {
						result.nMinPrice = dLVal;
						result.nMinIndex = dataIndex;
					}
				}

				return(result);
			};

			this.didSetInvalidData = function(argIndex) {
				return(_self.didSetData(argIndex, false, 0));
			};

			this.didSetSize = function(argSize, bFlag) {
				var nDataCount = _self.m_arrDatas.length;
				var nDiff = argSize - nDataCount;
				if(nDiff > 0) {
					for(var ii = 0; ii < nDiff; ii++) {
						var bValid = bFlag === false ? false : true;
						var xDatas = {
							dValue : 0,
							dLVal  : 0,
							dHVal  : 0
						};
						_self.didAddData(bValid, xDatas);
					}
				}
			};

			this.didSetData = function(argIndex, isValid, data, lval, hval) {
				var nDataCount = _self.m_arrDatas.length;
				if(nDataCount < 1 && argIndex < 0 || argIndex >= nDataCount) {
					return;
				}

				_self.m_arrValid[argIndex] = isValid;
				_self.m_arrDatas[argIndex] = {
					dValue : data,
					dLVal  : (lval === undefined || lval == null) ? data : lval,
					dHVal  : (hval === undefined || hval == null) ? (-1 * data) : hval,
				};

				return(argIndex);
			};

			/**
			 * [description]
			 * @param  {Boolean} isHitTest
			 * @return {[type]}
			 */
			this.didDrawObj = function(isHitTest) {
				var drawWrapper = _self.m_xDoParent.m_drawWrapper;
				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();
				var context = _self.didGetContext();

				var nScrSIdx = drawWrapper.m_xScrollInfo.pos;
				var nScrSize = drawWrapper.m_xScrollInfo.screenSize;

	            var nLoopStart   = 0;
				var nLoopEnd     = _self.m_arrDatas.length;
				var bHitTest     = false;
				var lineWeight   = _self.m_xPlotInfo.lineWeight;
				var lineColorVal = _self.m_xPlotInfo.color;
				var fillColorVal = _self.m_xPlotInfo.color;

				if(isHitTest === true) {
					bHitTest = true;
					lineColorVal = xUtils.hitTest.config.color;
					fillColorVal = xUtils.hitTest.config.color;

					context = _self.didGetContext(true);
				}
				// #676
				else {
					var xEnv = _self.didGetEnvInfo();
					if(xEnv !== undefined && xEnv != null && (_self.m_xDoParent.m_bSelect === true || _self.m_bSelect === true)) {
						lineColorVal = xEnv.System.SelectedFill.lineColor;
						fillColorVal = xEnv.System.SelectedFill.lineColor;
					}
				}
				//

				var drawLineParam = {
		    		context : context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
		    		lineWidth : lineWeight,
		    		lineColor : lineColorVal
		    	};

				var drawRectParam = {
		    		context : context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : lineWeight,
		    		lineColor : lineColorVal,
		    		fillColor : fillColorVal,
					fillAlpha : 0.5
		    	};

				//
				// Accumulate volumeは全てのデータを表示する。
				//
				var nDataCount = _self.didGetDataSize();

				for(var nDataIdx = 0; nDataIdx < nDataCount; nDataIdx++) {
					var xAv = _self.m_arrDatas[nDataIdx];

					var nLocalXPos1 = xAxisX.GetXData2Pixel(xAv.dValue);
					var nLocalXPos2 = xAxisX.GetXData2Pixel();

					var nLocalYPos1 = xAxisY.GetYPos(xAv.dHVal);
					var nLocalYPos2 = xAxisY.GetYPos(xAv.dLVal);
					var nLocalYCPos = (nLocalYPos1 + nLocalYPos2) / 2;
					var nBar        = Math.abs((nLocalYPos1 - nLocalYPos2) * 0.8 / 2);

					drawRectParam.rect.x     = nLocalXPos1;
					drawRectParam.rect.width = nLocalXPos2 - nLocalXPos1 + 1;
					drawRectParam.rect.y     = nLocalYCPos - nBar;
					drawRectParam.rect.height= 2 * nBar + 1;
					/*

					drawLineParam.pt1.x = nLocalXPos1;
					drawLineParam.pt1.y = nLocalYCPos;
					drawLineParam.pt2.x = nLocalXPos2;
					drawLineParam.pt2.y = nLocalYCPos;
					drawLineParam.lineColor = lineColorVal;
					// console.debug("[WGC] :" + drawLineParam);
					*/

					gxDc.Rectangle(drawRectParam);
				}
			};
		};

		//
		// #1594
		// class _DOPlotCandlebar
		//
		var _DOPlotCandlebar = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _DOPlot();
			_DOPlot.apply(this, arguments);

			/**
			 * draw data in position of the crossline
			 * @param[in] pt			{x, y}
			 * @param[in] argDataIndex	data index
			 */
			this.didDrawDataView = function(argPtDraw, argDataIndex) {
				if(_self.hasIgnore() === true || _self.hasHide() === true) {
					return(argPtDraw);
				}

				var drawTextParam = argPtDraw;

				var plotData      = _self.didGetPointedDataAt(argDataIndex);
				var plotDataValid = _self.isValidAt(argDataIndex);

				var drawWrapper = _self.m_xDoParent.m_drawWrapper;
				var xAxisX      = _self.m_xDoParent;
				var xAxisY      = _self.m_xDoParent;
				var textSpace   = drawTextParam.textSpace;
				var pointValue  = _self.m_xDoParent.didGetPointValue();

				drawTextParam.fillStyle = _self.m_xPlotInfo.color;

				var strData = xUtils.constants.text.dataView.invalid;
				if(plotDataValid === true) {
					strData = xUtils.number.didGetPointedValue(plotData, pointValue);
				}

				var strDisplay = _self.m_strDisp + "(" + strData + ")";
				drawTextParam.text = strDisplay;
				var textLen = gxDc.TextOut(drawTextParam, true);

				drawTextParam.pt.x = drawTextParam.pt.x + textLen + textSpace;

				return(drawTextParam);
			};

			/**
			 * draw data in position of the crossline
			 * @param[in] pt			{x, y}
			 * @param[in] argDataIndex	data index
			 */
			this.didGetDataViewDataAt = function(argDataIndex) {
				if(_self.hasIgnore() === true || _self.hasHide() === true) {
					return;
				}

				//
				var shiftedIndex  = _self.didGetShiftedDataIndex(argDataIndex);

				// #2294
				var plotData 	  = _self.m_arrDatas[shiftedIndex];
				var plotDataValid = xUtils.validator.isValidPrice(plotData);
				//

				var pointValue  = _self.m_xDoParent.didGetPointValue();

				// #2294
				var xViewDatas = [];
				var xData;
				var xViewItem = {
					display : "",
					value : xUtils.constants.text.dataView.invalid
				};
				var target;

				if(plotDataValid === true) {
					xData = xUtils.didClone(xViewItem);

					target = 'open';
					xData = xUtils.didClone(xViewItem);
					xData.display = xUtils.didGetDataViewItemTitle(target);
					xData.value   = xUtils.didGetPriceDisplay(target , plotData, pointValue, true);
					xViewDatas.push(xData);

					target = 'high';
					xData = xUtils.didClone(xViewItem);
					xData.display = xUtils.didGetDataViewItemTitle(target);
					xData.value   = xUtils.didGetPriceDisplay(target , plotData, pointValue, true);
					xViewDatas.push(xData);

					target = 'low';
					xData = xUtils.didClone(xViewItem);
					xData.display = xUtils.didGetDataViewItemTitle(target);
					xData.value   = xUtils.didGetPriceDisplay(target , plotData, pointValue, true);
					xViewDatas.push(xData);

					target = 'close';
					xData = xUtils.didClone(xViewItem);
					xData.display = xUtils.didGetDataViewItemTitle(target);
					xData.value   = xUtils.didGetPriceDisplay(target , plotData, pointValue, true);
					xViewDatas.push(xData);
				}
				else {
					target = 'open';
					xData = xUtils.didClone(xViewItem);
					xData.display = xUtils.didGetDataViewItemTitle(target);
					xViewDatas.push(xData);

					target = 'high';
					xData = xUtils.didClone(xViewItem);
					xData.display = xUtils.didGetDataViewItemTitle(target);
					xViewDatas.push(xData);

					target = 'low';
					xData = xUtils.didClone(xViewItem);
					xData.display = xUtils.didGetDataViewItemTitle(target);
					xViewDatas.push(xData);

					target = 'close';
					xData = xUtils.didClone(xViewItem);
					xData.display = xUtils.didGetDataViewItemTitle(target);
					xViewDatas.push(xData);
				}
				//

				return(xViewDatas);
			};

			// #2294
			this.DrawLastValue = function(argDrawParam, dataIndex) {
				try {
					if(argDrawParam === undefined || argDrawParam == null) {
						return;
					}

					// #2046
					var xEnv = _self.didGetEnvInfo();
					var colorUp = _self.m_xPlotInfo.colorUp;
					var colorDn = _self.m_xPlotInfo.colorDn;
					//

					var shiftedIndex = _self.didGetShiftedDataIndex(dataIndex);

					var plotData 	  = _self.m_arrDatas[shiftedIndex];
					var plotDataValid = xUtils.validator.isValidPrice(plotData);

					if (plotDataValid !== true) {
						return;
					}

					argDrawParam.price.value = plotData.close;

					var color = xEnv.PriceStyleConfig.Candle.fillDnColor;
					if(xUtils.dataConverter.isMinusCandleForPriceData(plotData) !== true) {
						color = xEnv.PriceStyleConfig.Candle.fillUpColor;
					}

					argDrawParam.price.color = color;

					xUtils.axis.didDrawLastValueOnYAxis(argDrawParam);
				}
				catch(e) {
					console.error(e);

				}
			};
			//

			/**
			 * get axis x
			 * @return {[type]}
			 */
			this.didGetAxisX = function() {
				var xAxisX = _self.m_xDoParent.didGetAxisX();

				return(xAxisX);
			};

			/**
			 * calculate min and max
			 * @param[in] argScrSIdx	current scroll position
			 * @param[in] argScrSize	screen size
			 * @param[in] argFlag		full flag
			 */
			this.didCalcMinMax = function(argDataSIdx, argScrSize, argFlag) {
				if(_self.hasIgnore() === true || _self.hasHide() === true) {
					return;
				}

				var nPlotDataCount = _self.didGetDataSize();
				if(nPlotDataCount < 1) {
					return;
				}

				var result = {
					nMaxIndex : -1,
					nMaxPrice : -xUtils.constants.default.DEFAULT_WRONG_VALUE,
					nMinIndex : -1,
					nMinPrice : xUtils.constants.default.DEFAULT_WRONG_VALUE,

					nMaxVolIdx: -1,
					nMaxVolume: -xUtils.constants.default.DEFAULT_WRONG_VALUE,
					nMinVolIdx: -1,
					nMinVolume: xUtils.constants.default.DEFAULT_WRONG_VALUE,
				};

				for(var ii = 0; ii < argScrSize; ii++) {
					var dataIndex = argDataSIdx + ii;
					var shiftedIndex = _self.didGetShiftedDataIndex(dataIndex, false);
					var stCandle = _self.m_arrDatas[shiftedIndex];
					if(xUtils.validator.isValidPrice(stCandle) !== true) {
						continue;
					}

					var dHVal = stCandle.high;
					var dLVal = stCandle.low;

					if(dHVal > result.nMaxPrice) {
						result.nMaxPrice = dHVal;
						result.nMaxIndex = dataIndex;
					}

					if(dLVal < result.nMinPrice) {
						result.nMinPrice = dLVal;
						result.nMinIndex = dataIndex;
					}
				}

				return(result);
			};

			this.didSetInvalidData = function(argIndex) {
				return(_self.didSetData(argIndex, false, undefined));
			};

			this.didSetSize = function(argSize, bFlag) {
				var nDataCount = _self.m_arrDatas.length;
				var nDiff = argSize - nDataCount;
				if(nDiff > 0) {
					for(var ii = 0; ii < nDiff; ii++) {
						var bValid = bFlag === false ? false : true;
						var xDatas = {
							open : 0,
							high : 0,
							low  : 0,
							close: 0
						};
						_self.didAddData(bValid, xDatas);
					}
				}
			};

			this.didSetData = function(argIndex, isValid, stPrice) {
				var nDataCount = _self.m_arrDatas.length;
				if(nDataCount < 1 && argIndex < 0 || argIndex >= nDataCount || !stPrice) {
					return;
				}

				_self.m_arrValid[argIndex] = isValid;
				_self.m_arrDatas[argIndex] = xUtils.didClone(stPrice);

				return(argIndex);
			};

			/**
			 * [description]
			 * @param  {Boolean} isHitTest
			 * @return {[type]}
			 */
			this.didDrawObj = function(isHitTest) {
				var drawWrapper = _self.m_xDoParent.m_drawWrapper;
				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();
				var context = _self.didGetContext();

				var nScrSIdx = drawWrapper.m_xScrollInfo.pos;
				var nScrSize = drawWrapper.m_xScrollInfo.screenSize;

	            var nLoopStart   = 0;
				var nLoopEnd     = _self.m_arrDatas.length;
				var bHitTest     = false;
				var lineWeight   = _self.m_xPlotInfo.lineWeight;
				var lineColorVal = _self.m_xPlotInfo.color;
				var fillColorVal = _self.m_xPlotInfo.color;

				if(isHitTest === true) {
					bHitTest = true;
					lineColorVal = xUtils.hitTest.config.color;
					fillColorVal = xUtils.hitTest.config.color;

					context = _self.didGetContext(true);
				}
				// #676
				else {
					var xEnv = _self.didGetEnvInfo();
					if(xEnv !== undefined && xEnv != null && (_self.m_xDoParent.m_bSelect === true || _self.m_bSelect === true)) {
						lineColorVal = xEnv.System.SelectedFill.lineColor;
						fillColorVal = xEnv.System.SelectedFill.lineColor;
					}
				}
				//

				var drawLineParam = {
		    		context : context,
		    		pt1 : {
		    			x : 0,
		    			y : 0
		    		},
		    		pt2 : {
		    			x : 0,
		    			y : 0
		    		},
		    		lineWidth : lineWeight,
		    		lineColor : lineColorVal
		    	};

				var drawRectParam = {
		    		context : context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : lineWeight,
		    		lineColor : lineColorVal,
		    		fillColor : fillColorVal
		    	};

				//
				// Accumulate volumeは全てのデータを表示する。
				//
				var nDataCount = _self.didGetDataSize();

				for(var nDataIdx = 0; nDataIdx < nDataCount; nDataIdx++) {
					var dataIndex = xAxisX.didConvertLocalIndexToDataIndex(nDataIdx);
					var shiftedIndex = _self.didGetShiftedDataIndex(dataIndex);

					var __stCandle = _self.m_arrDatas[shiftedIndex];
					if(xUtils.validator.isValidPrice(__stCandle) !== true) {
						continue;
					}

					var xBarInfos= {};
					var nLocalXPos  = xAxisX.GetIndex2Pixel(dataIndex, xBarInfos);

					var iYPosOpen  = xAxisY.GetYPos(__stCandle.open);
					var iYPosHigh  = xAxisY.GetYPos(__stCandle.high);
					var iYPosLow   = xAxisY.GetYPos(__stCandle.low);
					var iYPosClose = xAxisY.GetYPos(__stCandle.close);

					if(bHitTest !== true) {
						// #676
						if(_self.m_bSelect === true) {
							lineColorVal = xEnv.System.SelectedFill.lineColor;
							fillColorVal = xEnv.System.SelectedFill.fillColor;
						}
						else {
							lineColorVal = xEnv.PriceStyleConfig.Candle.strokeDnColor;
							fillColorVal = xEnv.PriceStyleConfig.Candle.fillDnColor;
							if(xUtils.dataConverter.isMinusCandleForPriceData(__stCandle) !== true) {
								lineColorVal = xEnv.PriceStyleConfig.Candle.strokeUpColor;
								fillColorVal = xEnv.PriceStyleConfig.Candle.fillUpColor;
							}
						}
					}

					// center line
					drawLineParam.pt1.x = nLocalXPos;
					drawLineParam.pt1.y = iYPosHigh;
					drawLineParam.pt2.x = nLocalXPos;
					drawLineParam.pt2.y = iYPosLow;
					drawLineParam.lineColor = lineColorVal;
					gxDc.Line(drawLineParam);

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

					if (parseInt(__stCandle.open) == parseInt(__stCandle.close)) {
						drawLineParam.pt1.x = rcX;
						drawLineParam.pt1.y = rcY;
						drawLineParam.pt2.x = rcX+rcW;
						drawLineParam.pt2.y = rcY;
						drawLineParam.lineColor = lineColorVal;
						gxDc.Line(drawLineParam);
					}
					else {
						drawRectParam.rect.x = rcX;
						drawRectParam.rect.y = rcY;
						drawRectParam.rect.width = rcW;
						drawRectParam.rect.height = rcH;
						drawRectParam.lineColor = lineColorVal;
						drawRectParam.fillColor = fillColorVal;
						gxDc.Rectangle(drawRectParam);
					}
				}
			};

			this.didGetDebugPointedDataAt = function(argIndex, pointValue) {
				var plotData = _self.didGetDataAt(argIndex);
				var o = xUtils.number.didGetPointedValue(Math.round(plotData.open ), pointValue);
				var h = xUtils.number.didGetPointedValue(Math.round(plotData.high ), pointValue);
				var l = xUtils.number.didGetPointedValue(Math.round(plotData.low  ), pointValue);
				var c = xUtils.number.didGetPointedValue(Math.round(plotData.close), pointValue);
				var ret = "(o:" + o + "), (h:" + h + "), (l:" + l + "), (c:" + c + ")";

				return(ret);
			};
		};

		//
		// class _DOSIndicator
		//
		var _DOSIndicator = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

			var _self = this;

			this.m_strChartName = "";
			this.m_bMainChart = false;
			this.m_bPriceType = false;
			this.m_point = 2;

			this.m_strIndicator = "";
			this.m_xSeriesInfo = null;
			this.m_arrPlots = [];
			this.m_nRefSkip = 0;
			this.m_nLastIdx = -1;
			this.m_nPlotLimit = 1;

			this.m_nPrice = xUtils.constants.keywords.price.close;
			this.m_nPeriod = 5;


			// TODO: Remove
			this.m_arrCount = [];
			this.m_arrSum = [];
			this.m_arrColor = [];

			this.m_arrPeriod = [];

			this.m_bNewData = true;

			this.m_arrData = [];
			this.m_arrIndicatorData = [];

			this.m_bYAxisTypeAdd = true;

			this.m_arrPlotName = [];

			/**
			 * [description]
			 * @param  {[type]} argType
			 * @return {[type]}
			 */
			this.didCreatePlotByType = function(argType) {
				var xPlot;
				if(xUtils.indicator.plotType.ESDG_SIDEBAR === argType) {
					xPlot = new _DOPlotSidebar();
				}
				// #1594
				else if(xUtils.indicator.plotType.ESDG_CANDLEBAR === argType) {
					xPlot = new _DOPlotCandlebar();
				}
				// [end] #1594

				return(xPlot);
			};

			/**
			 *
			 */
			this.didCreatePlot = function(parent, plotInfo) {
				if(plotInfo === undefined || plotInfo == null) {
					return;
				}

				var xPlot = _self.didCreatePlotByType(plotInfo.type);
				if(xPlot === undefined || xPlot == null) {
					xPlot = new _DOPlot();
				}

				xPlot.m_xDoParent = parent;

				xPlot.didSetPlotInfo(plotInfo);

				return(xPlot);
			};

			var _didFindParamInfoByName = function(argName) {
				if(argName === undefined || argName == null || _self.m_xSeriesInfo === undefined || _self.m_xSeriesInfo == null || _self.m_xSeriesInfo.params === undefined || _self.m_xSeriesInfo.params == null) {
					return;
				}

				var nCount = _self.m_xSeriesInfo.params.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xParam = _self.m_xSeriesInfo.params[ii];
					if(xParam && argName === xParam.name) {
						return(xParam);
					}
				}
			};

			/**
			 *
			 */
			var _didSetParamInfos = function(argParamInfos) {
				if(argParamInfos === undefined || argParamInfos == null) {
					return;
				}

				var bCalc = false;
				var nCount = argParamInfos.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xParam = argParamInfos[ii];
					if(xParam) {
						var xParamFind = _didFindParamInfoByName(xParam.name);
						if(xParamFind) {
							xParamFind.value = xParam.value;
							bCalc = true;
						}
					}
				}

				return(bCalc);
			};

			var _didFindPlotByName = function(argName) {
				if(argName === undefined || argName == null) {
					return;
				}

				var nCount = _self.m_arrPlots.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPlot = _self.m_arrPlots[ii];
					if(xPlot && argName === xPlot.m_strName) {
						return(xPlot);
					}
				}
			};

			/**
			 * [description]
			 * @param  {[type]} argName
			 * @return {[type]}
			 */
			var _didFindLineInfoByName = function(argName) {
				if(argName === undefined || argName == null) {
					return;
				}

				if(_self.m_xSeriesInfo.lines === undefined || _self.m_xSeriesInfo.lines == null) {
					return;
				}

				var xObject = _self.m_xSeriesInfo.lines;
				var nCount = xObject.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xLineInfo = xObject[ii];
					if(xLineInfo && argName === xLineInfo.name) {
						return(xLineInfo);
					}
				}
			};

			var _didSetPlotInfos = function(argPlotInfos) {
				if(argPlotInfos === undefined || argPlotInfos == null) {
					return;
				}

				var bCalc = false;
				var nCount = argPlotInfos.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPlotInfo = argPlotInfos[ii];
					if(xPlotInfo) {
						var xPlotFind = _didFindPlotByName(xPlotInfo.name);
						if(xPlotFind && xPlotFind.didSetPlotInfo) {
							xPlotFind.didSetPlotInfo(xPlotInfo, true);
						}
					}
				}

				return(true);
			};

			/**
			 * [description]
			 * @param  {[type]} argExtraDiff
			 * @return {[type]}
			 */
			var _didSetShiftInfo = function(argExtraDiff) {
				if(argExtraDiff === undefined || argExtraDiff == null) {
					return(false);
				}

				var bChanged = false;
				var nMoveShift = xUtils.didCalculateShiftValueWithExtraDiff(argExtraDiff, xUtils.constants.default.SHIFT_IS_ST);
				if(nMoveShift === undefined || nMoveShift == null) {
					nMoveShift = 0;
				}

				if(nMoveShift !== _self.m_nMoveShift) {
					_self.m_nMoveShift = nMoveShift;
					bChanged = true;
				}

				return(bChanged);
			};

			var _didSetLineInfos = function(argLineInfos) {
				if(argLineInfos === undefined || argLineInfos == null) {
					return;
				}

				var bCalc = false;
				var nCount = argLineInfos.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xLineInfo = argLineInfos[ii];
					if(xLineInfo) {
						var xLineFind = _didFindLineInfoByName(xLineInfo.name);
						if(xLineFind) {
							/*
							if(xLineInfo.hide !== undefined && xLineInfo.hide != null) {
								xLineFind.hide = xLineInfo.hide;
							}
							*/

							if(xLineInfo.value !== undefined && xLineInfo.value != null) {
								xLineFind.value = xLineInfo.value;
							}
						}
					}
				}

				return(true);
			};

			/**
			 * [description]
			 * @param  {[type]} argSettings
			 * @param  {[type]} outputChanged
			 * @return {[type]}
			 */
			this.didApplySetting = function(argSettings, outputChanged) {
				if(argSettings === undefined || argSettings == null) {
					return;
				}

				var xObjectInfo;

				if(typeof argSettings === "string") {
					xObjectInfo = JSON.parse(argSettings);
				}
				else {
					xObjectInfo = argSettings;
				}

				var hasOutput = false;
				var isMulti = false;
				if(outputChanged !== undefined && outputChanged != null && typeof outputChanged === "object") {
					isMulti = outputChanged.isMulti;
					if(isMulti === true) {
						if(outputChanged.param) {
							outputChanged.param |= false;
						}
						else {
							outputChanged.param = false;
						}

						if(outputChanged.plot) {
							outputChanged.plot |= false;
						}
						else {
							outputChanged.plot = false;
						}

						if(outputChanged.shift) {
							outputChanged.shift |= false;
						}
						else {
							outputChanged.shift = false;
						}

						if(outputChanged.line) {
							outputChanged.line |= false;
						}
						else {
							outputChanged.line = false;
						}
					}
					else {
						outputChanged.param = false;
						outputChanged.plot  = false;
						outputChanged.shift = false;
						outputChanged.line  = false;
					}


					hasOutput = true;
				}

				// TODO: #710
				var bParam = _didSetParamInfos(xObjectInfo.params);

				var bPlot  = _didSetPlotInfos(xObjectInfo.plots);

				// #710
				var bShift = _didSetShiftInfo(xObjectInfo.extraDiff);
				//

				// #776
				var bLine  = _didSetLineInfos(xObjectInfo.lines);
				//

				if(bParam) {
					_self.didCalculateData();
				}

				if(hasOutput === true) {
					if(isMulti === true) {
						outputChanged.param |= bParam;
						outputChanged.plot  |= bPlot;
						outputChanged.shift |= bShift;
						outputChanged.line  |= bLine;
					}
					else {
						outputChanged.param = bParam;
						outputChanged.plot  = bPlot;
						outputChanged.shift = bShift;
						outputChanged.line  = bLine;
					}

				}

				return(true);
			};

			/**
			 *
			 */
			this.didPreparePlots = function(argPlotInfo) {
				_self.didClearPlots();

				//
				for(var ii in argPlotInfo) {
					var plotInfo = argPlotInfo[ii];
					var xPlot = _self.didCreatePlot(_self, plotInfo);

					_self.m_arrPlots.push(xPlot);
				}
			};

			/**
			 * [description]
			 * @param  {[type]} argSeriesInfo
			 * @return {[type]}
			 */
			this.didSetShiftInfo = function(argSeriesInfo) {
				_self.m_nMoveShift = xUtils.didCalculateShiftInfo(argSeriesInfo, xUtils.constants.default.SHIFT_IS_ST);
			};

			/**
			 * [description]
			 * @param  {string} argCode
			 * @param  {object} argObjectInfo
			 * @return {boolean}
			 */
			this.didPrepareObject = function(argCode, argObjectInfo) {
				var xInfo;
				if(argObjectInfo === undefined || argObjectInfo == null) {
					xInfo = xUtils.indicator.didGetDefaultInfo(argCode);
				}
				else {
					xInfo = xUtils.didClone(argObjectInfo);
				}

				if(xInfo === undefined || xInfo == null) {
					return(false);
				}

				// SEE
				// xInfo => { code, name, display, splitFlag, usedFlag, enable }

				_self.m_xSeriesInfo = xInfo;
				_self.m_strChartName = _self.m_xSeriesInfo.display;
				_self.m_strIndicator = _self.m_xSeriesInfo.code;
				_self.m_bPriceType	 = (_self.m_xSeriesInfo.priceType === true) ? true : false;
				_self.m_point		 = (_self.m_xSeriesInfo.pointValue !== undefined) ? _self.m_xSeriesInfo.pointValue : _self.m_point;

				_self.didSetShiftInfo(xInfo);

				_self.didPreparePlots(_self.m_xSeriesInfo.plots);

				// TODO: don't call this method. useless
				//_self.ChartIndicatorType(_self.m_strIndicator);

				return(true);
			};

			/**
			 * [didInitVariables description]
			 * @param  {[type]} strChartName [description]
			 * @return {[type]}              [description]
			 */
			this.didInitVariables = function(strChartName) {
				// do nothings
				/*
	            _self.m_bMainChart = false;
				_self.m_bPriceType = false;

				_self.m_strChartName = strChartName;
				*/

				_self.didInitCommonVariables();
				_self.didInitSelfVariables();
	        };

			this.didInitCommonVariables = function() {

			};

			this.didInitSelfVariables = function() {

			};

			this.didDestroyRest = function() {

			};

			/**
			 * call when you delete this object
			 */
			this.didDestroy = function() {
				_self.didClearPlots();
				_self.didClearLineStudyObject();
				_self.didDestroyRest();
			};

			/**
			 * clear plots
			 */
			this.didClearPlots = function() {
				for(var ii = 0; ii < _self.m_arrPlots.length; ii++) {
					delete _self.m_arrPlots[ii];
				}

				_self.m_arrPlots = [];
			};

			/**
			 * get param value
			 * @param[in] argNo	param no.
			 * @return value
			 */
			this.didGetParamValue = function(argNo) {
				var nParamCount = _self.m_xSeriesInfo.params.length;
				if(nParamCount < 1 || 0 > argNo || argNo >= nParamCount) {
					return;
				}

				return(_self.m_xSeriesInfo.params[argNo].value);
			};

			/**
			 * get param
			 * @param[in] argNo	param no.
			 * @return value
			 */
			this.didGetParamValueByKey = function(argKey) {
				if(argKey === undefined || argKey == null) {
					return("");
				}

				for(var ii in _self.m_xSeriesInfo.params) {
					var param = _self.m_xSeriesInfo.params[ii];
					if(param.name === argKey) {
						return(param.value);
					}
				}

				return("");
			};

			/**
			 * get period
			 * @param[in] argTarget	param no.
			 * @return number
			 */
			this.didGetPeriod = function(argTarget) {
				var param;
				if(typeof argTarget === "string") {
					param = _self.didGetParamValueByKey(argTarget);
				}
				else {
					param = _self.didGetParamValue(argTarget);
				}

				if(param !== undefined && param != null) {
					return(parseInt(param));
				}

				var nCount = _self.m_arrPeriod.length;
				if(nCount < 1 || 0 > argTarget || argTarget >= nCount) {
					return(0);
				}

				return(parseInt(_self.m_arrPeriod[argTarget]));
			};

			/**
			 * get span(right shift)
			 * @return number
			 */
			this.didGetShifRightCount = function() {
				var nShiftCount = 0;

				/*
				if(_self.m_strIndicator === xUtils.constants.indicatorCodes.ICHIMOKU) {
					return((nShiftCount = _self.didGetPeriod(3)));
				}
				else */{
					if(_self.m_nMoveShift > 0) {
						nShiftCount = Math.abs(_self.m_nMoveShift);
					}

					var nPlotShiftCount = 0;

					var nCount = _self.m_arrPlots.length;
					for(var ii = 0; ii < nCount; ii++) {
						var xPlot = _self.m_arrPlots[ii];
						var nShiftRightCount = xPlot.didGetShifRightCount();

						nPlotShiftCount = Math.max(nPlotShiftCount, nShiftRightCount);
					}

					nShiftCount += nPlotShiftCount;
				}

				return(nShiftCount);
			};

			/**
			 * get span(left shift)
			 * @return number
			 */
			this.didGetShifLeftCount = function() {
				var nShiftCount = 0;

				/*
				if(_self.m_strIndicator === xUtils.constants.indicatorCodes.ICHIMOKU) {
					return((nShiftCount = 0));
				}
				else */{
					if(_self.m_nMoveShift < 0) {
						nShiftCount = Math.abs(_self.m_nMoveShift);
					}

					var nPlotShiftCount = 0;

					var nCount = _self.m_arrPlots.length;
					for(var ii = 0; ii < nCount; ii++) {
						var xPlot = _self.m_arrPlots[ii];
						var nShiftRightCount = xPlot.didGetShifLeftCount();

						nPlotShiftCount = Math.max(nPlotShiftCount, nShiftRightCount);
					}

					nShiftCount += nPlotShiftCount;
				}

				return(nShiftCount);
			};

			/**
			 *
			 */
			this.didGetShiftValue = function(argNo) {
				return(_self.m_nMoveShift);
			};

			/**
			 *
			 */
			this.didGetPlotShiftValueAt = function(argNo) {
				if(argNo === 3) {
					return(-1 * _self.didGetPeriod(argNo));
				}
				else {
					return(0);
				}
			};

			/**
			 * get point value
			 * @return point value
			 */
			this.didGetPointValue = function() {
				if(_self.m_bPriceType === true) {
					var xDoBasePrice = _self.m_drawWrapper.didGetReferencedPriceObject();
					var nBasePricePoint = xDoBasePrice.didGetPointValue();

					return(nBasePricePoint);
				}

				return(_self.m_point);
			};


			/**
			 *
			 */
			this.ChartIndicatorType = function(argCode) {
				return;
			};

			/**
			 *
			 */
			this.ReSetFrame = function(chartFrame) {
				_self.m_chartFrame = chartFrame;

				_self.m_bNewData = true;

				_self.m_canvas    = chartFrame.m_canvas;// document.getElementById("idCanvas"+iIndex);
				_self.m_canvasLY  = chartFrame.m_canvasLY;// document.getElementById("idCanvasLY"+iIndex);
				_self.m_canvasRY  = chartFrame.m_canvasRY;// document.getElementById("idCanvasRY"+iIndex);

				_self.HEIGHT      = chartFrame.m_canvas.height;
				_self.WIDTH       = chartFrame.m_canvas.width;
				_self.m_context   = chartFrame.m_context;// _self.m_canvas.getContext('2d');
				_self.m_contextLY = chartFrame.m_contextLY;// _self.m_canvasLY.getContext('2d');
				_self.m_contextRY = chartFrame.m_contextRY;// _self.m_canvasRY.getContext('2d');

				_self.m_memcanvas = chartFrame.m_memcanvas;
				_self.m_memcontext= chartFrame.m_memcontext;

				_self.didResetMinMax();

				for(var ii = 0; ii < _self.m_arrTrendlineObjlist.length; ii++) {
					_self.m_arrTrendlineObjlist[ii].ReSetFrame(chartFrame); //
				}
			};

			/**
			 * clear plots
			 */
			this.didClearPlots = function() {
				//
				for(var ii = 0; ii < _self.m_arrPlots.length; ii++) {
					_self.m_arrPlots[ii].didClearDatas();
				}
			};

			/**
			 * clear extra datas
			 */
			this.didClearExtraData = function() {

			};

			/**
			 * @param[in] argType	type
			 * @param[in] argName	indicator name
			 */
			this.didClearDatas = function(argType, argName) {
				_self.m_nRefSkip = 0;
				_self.m_nLastIdx = -1;

				//
				_self.ClearIndicatorType(argType, argName);

				//
				_self.didResetParam(argType);
				_self.didResetMinMax();

				//
				_self.didClearPlots();

				//
				_self.didClearExtraData();
			};

			/**
			 * @param[in] argType	type
			 */
			this.didResetParam = function(argType) {
				if (argType === 0) {
					_self.m_arrColor = [];
					_self.m_arrPeriod = [];
				}
			};

			/**
			 *
			 */
			this.ClearIndicatorType = function(argType, strIndicator) {
				_self.m_arrCount = [0];
				_self.m_arrSum = [[]];
				_self.m_arrData = [[]];
				_self.m_arrIndicatorData = [[]];
			};

			/**
			 * get axis x
			 * @return {[type]}
			 */
			this.didGetAxisX = function() {
				var drawWrapper = _self.m_drawWrapper;
				var xAxisX = drawWrapper;

				return(xAxisX);
			};

			/**
			 * get axis y
			 * @return {[type]}
			 */
			this.didGetAxisY = function() {
				var xAxisY = _self;

				return(xAxisY);
			};

			/**
			 * get context
			 * @return {[type]}
			 */
			this.didGetContext = function(bHitTest) {
				var context;

				if(bHitTest === true) {
					context = _self.m_memcontext;
				}
				else {
					context = _self.m_context
				}

				return(context);
			};

			/**
			 * draw self
			 */
			this.didDrawSelf = function(posval) {
				_self.DrawIndicatorChart(posval);
			};

			/**
			 * draw trend lines
			 */
			this.didDrawTrendLines = function() {
				var xScaleUnit = _self.m_xScaleInfo.current;

				var nLSCount = _self.m_arrTrendlineObjlist.length;
				for (var ii = 0; ii < nLSCount; ii++) {
					var xDoLs = _self.m_arrTrendlineObjlist[ii];
					xDoLs.DrawObj(xScaleUnit.minMaxScreen.maxValue, xScaleUnit.minMaxScreen.minValue);
				}
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas	data[][price type]
			 */
			this.didReceiveData = function(symbolInfo, receivedDatas) {
				_self.ReceiveData();

				return;
			};

			this.didCalculateRealData = function(nStart, nDSize, nSSize) {
				return(_self.runProcRTEx(nStart, nDSize, nSSize));
			};

			/**
			 *
			 */
			this.didCalculateData = function() {
				_self.runProcHD();
			};

			/**
			 *
			 */
			this.didCalculateDataEx = function(nStart, nDSize, nSSize) {
				_self.runProcHDEx(nStart, nDSize, nSSize);
			};

			this.ReceiveBlankData = function(iMarginGap) {
				if (iMarginGap > 0)
				{
					for(var ii = 0; ii < iMarginGap; ii++)
					{
						for (idxData = 0; idxData < _self.m_arrIndicatorData.length; idxData++)
							_self.m_arrIndicatorData[idxData].push(xUtils.constants.default.DEFAULT_WRONG_VALUE);
					}
				}
				else if (iMarginGap < 0)
				{
					for(var ii = 0; ii < Math.abs(iMarginGap); ii++)
					{
						for (var idxData = 0; idxData < _self.m_arrIndicatorData.length; idxData++)
							_self.m_arrIndicatorData[idxData].splice(_self.m_arrIndicatorData[idxData].length-1, 1);
					}
				}
			};

			/**
			 * create line-study
			 * @param[in] lsName	name
			 * @param[in] posval	{XPos:0, YPos:0}
			 * @return object
			 */
			this.CreateTrendlineObj = function(lsName, posval) {
			};

			/**
			 * get real data index by shifted
			 * @param[in] argDataIndex	data index
			 * @param[in] argPlotNo		plot number
			 * @return shifted index
			 */
			this.didGetShiftedDataIndexOfPlotAt = function(argDataIndex, argPlotNo) {
				{
					// 指標のシフト値を取得する。（基本値）
					var nShiftValue = _self.didGetShiftValue();

					var xPlot = _self.didGetPlotAt(argPlotNo);
					if(xPlot !== undefined && xPlot != null && xPlot.hasIgnore() !== true && xPlot.hasHide() !== true) {
						// #672
						// 指標のものは上で取得するからPlotは自分のみのものを取得するといい。
						nShiftValue += xPlot.didGetShiftValue(true);
					}

					var shiftedIndex = xUtils.didConvertShiftedIndex(argDataIndex, nShiftValue);

					return(shiftedIndex);
				}
			};

			/**
			 * calculate min and max
			 * @param[in] argScrSIdx	current scroll position
			 * @param[in] argScrSize	screen size
			 * @param[in] argFlag		full flag
			 */
			this.didCalcMinMax = function(argScrSIdx, argScrSize, argFlag) {
				var xScaleUnit = _self.m_xScaleInfo.current;

				xUtils.scale.didResetScaleUnit(xScaleUnit);

				var xMMScreen  = xScaleUnit.minMaxScreen;

				var nPlotCount =  _self.m_arrPlots.length;
				var nDataStartIndex = _self.m_drawWrapper.didConvertLocalIndexToDataIndex(0);

				for(var nPlotNo = 0; nPlotNo < nPlotCount; nPlotNo++) {
					var xPlot = _self.didGetPlotAt(nPlotNo);

					var xMinMax = xPlot.didCalcMinMax(nDataStartIndex, argScrSize, argFlag);
					if(xMinMax === undefined || xMinMax == null) {
						continue;
					}

					if(xMinMax.nMaxPrice > xMMScreen.maxValue) {
						xMMScreen.maxValue = xMinMax.nMaxPrice;
						xMMScreen.maxIndex = xMinMax.nMaxIndex;
					}

					if(xMinMax.nMinPrice < xMMScreen.minValue) {
						xMMScreen.minValue = xMinMax.nMinPrice;
						xMMScreen.minIndex = xMinMax.nMinIndex;
					}
				}

				// #2038
				_self.didCalcMinMaxForBaselines(xMMScreen);
				//

				xUtils.scale.didCalcScaleUnit(xScaleUnit);
			};

			// #2038
			this.didCalcMinMaxForBaselines = function(argMMScreen) {
				var xEnv = _self.didGetEnvInfo();
				try {
					if(!argMMScreen) {
						return;
					}

					if(xEnv.System.UseBaselineToScale !== true) {
						return;
					}

					//
					// lines
					//
					if(_self.m_xSeriesInfo.lines === undefined || _self.m_xSeriesInfo.lines == null) {
						return;
					}
					var nCount = _self.m_xSeriesInfo.lines.length;
					if(nCount < 1) {
						return;
					}

					var xObject = _self.m_xSeriesInfo.lines;
					for (var ii = 0; ii < nCount; ii++) {
						var xBi = xObject[ii];

						if(!xBi || xBi.hide === true) {
							continue;
						}

						//
						// calculate pixel position to draw
						//
						var dLineValue	 = _self.didCalcBaselineValue(xBi);
						if(dLineValue === undefined || dLineValue == null) {
							continue;
						}

						if(dLineValue > argMMScreen.maxValue) {
							argMMScreen.maxValue = dLineValue;

						}

						if(dLineValue < argMMScreen.minValue) {
							argMMScreen.minValue = dLineValue;
						}
					}
				}
				catch(e) {
					console.error(e);
				}
			};
			//

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didDrawFillPlots = function(isHitTest) {
			};

			this.didDrawFillPlotItem = function(argFillItem, isHitTest) {
				if(argFillItem === undefined || argFillItem == null) {
					return;
				}

				var xPlot1		 = _self.didGetPlotAt(argFillItem.plot1);
				var xPlot2		 = _self.didGetPlotAt(argFillItem.plot2);
				if(xPlot1 === undefined || xPlot1 == null || xPlot2 === undefined || xPlot2 == null) {
					return;
				}

				if(xPlot1.hasIgnore() === true || xPlot1.hasHide() === true || xPlot2.hasIgnore() === true || xPlot2.hasHide() === true) {
					return;
				}

				var drawWrapper  = _self.m_drawWrapper;
				var xAxisX       = _self.didGetAxisX();
				var xAxisY       = _self.didGetAxisY();
				var context      = _self.didGetContext();

				var nScrSIdx     = drawWrapper.m_xScrollInfo.pos;
				var nScrSize     = drawWrapper.m_xScrollInfo.screenSize;

	            var nLoopStart   = 0;
				var nLoopEnd     = nScrSize;
				var bHitTest     = false;
				var fillColorUp	 = argFillItem.colorUp;
				var fillColorDn	 = argFillItem.colorDn;
				var fillColorVal = fillColorUp;

				if(isHitTest === true) {
					bHitTest = true;
					fillColorUp = xUtils.hitTest.config.color;
					fillColorDn = xUtils.hitTest.config.color;
					context = _self.didGetContext(true);
				}
				// #676
				else {
					var xEnv = _self.didGetEnvInfo();
					if(xEnv !== undefined && xEnv != null && (_self.m_bSelect === true || xPlot1.m_bSelect === true || xPlot2.m_bSelect === true)) {
						fillColorUp = xEnv.System.SelectedFill.lineColor;
						fillColorDn = xEnv.System.SelectedFill.lineColor;
					}
				}
				fillColorVal = fillColorUp;
				//

				var drawPolygonParam = {
		    		context : context,
		    		pt1s : [],
					pt2s : [],
		    		fillColor : fillColorUp,
					fillAlpha : argFillItem.alpha
		    	};

				var bFirst = true;
				var bUp	   = true;
				var pt     = {x:0, y:0};
				var pt1Pre = {x:0, y:0};
				var pt2Pre = {x:0, y:0};
				var pt1Cur = {x:0, y:0};
				var pt2Cur = {x:0, y:0};
				var arrPt1 = [];
				var arrPt2 = [];

				//
				// 画面の左側
				//
				var nDataIdx	  = -1;
				var dataIndex	  = xAxisX.didConvertLocalIndexToDataIndex(nDataIdx);
				var shiftedIndex1 = xPlot1.didGetShiftedDataIndex(dataIndex);
				var shiftedIndex2 = xPlot2.didGetShiftedDataIndex(dataIndex);

				var dataValue1 = xPlot1.didGetDataAt(shiftedIndex1);
				var dataValue2 = xPlot2.didGetDataAt(shiftedIndex2);

				if (xUtils.dataValidator.isValidData(dataValue1) === true && xUtils.dataValidator.isValidData(dataValue2) === true) {
					var nLocalXPos  = xAxisX.GetXPosAtDataIndex(dataIndex);

					var nLocalYPos1 = xAxisY.GetYPos(dataValue1);
					var nLocalYPos2 = xAxisY.GetYPos(dataValue2);

					pt1Cur = xUtils.didClone(pt);
					pt1Cur.x = nLocalXPos;
					pt1Cur.y = nLocalYPos1;

					pt2Cur = xUtils.didClone(pt);
					pt2Cur.x = nLocalXPos;
					pt2Cur.y = nLocalYPos2;

					bFirst = false;

					if(dataValue1 > dataValue2) {
						fillColorVal = fillColorUp;
						bUp = true;
					}
					else {
						fillColorVal = fillColorDn;
						bUp = false;
					}

					arrPt1.push(pt1Cur);
					arrPt2.push(pt2Cur);

					pt1Pre = xUtils.didClone(pt1Cur);
					pt2Pre = xUtils.didClone(pt2Cur);
				}

				//
				//
				//
				for(nDataIdx = 0; nDataIdx < nScrSize; nDataIdx++) {
					dataIndex     = xAxisX.didConvertLocalIndexToDataIndex(nDataIdx);

					shiftedIndex1 = xPlot1.didGetShiftedDataIndex(dataIndex);
					shiftedIndex2 = xPlot2.didGetShiftedDataIndex(dataIndex);

					dataValue1 = xPlot1.didGetDataAt(shiftedIndex1);
					dataValue2 = xPlot2.didGetDataAt(shiftedIndex2);

					if (xUtils.dataValidator.isValidData(dataValue1) !== true || xUtils.dataValidator.isValidData(dataValue2) !== true) {
						if(arrPt1.length > 0 && arrPt2.length > 0) {
							drawPolygonParam.pt1s = arrPt1;
							drawPolygonParam.pt2s = arrPt2;
							drawPolygonParam.fillColor = fillColorVal;

							gxDc.Polygon(drawPolygonParam);

							arrPt1 = [];
							arrPt2 = [];
						}

						continue;
					}

					var nLocalXPos  = xAxisX.GetXPosAtDataIndex(dataIndex);

					var nLocalYPos1 = xAxisY.GetYPos(dataValue1);
					var nLocalYPos2 = xAxisY.GetYPos(dataValue2);

					pt1Cur = xUtils.didClone(pt);
					pt1Cur.x = nLocalXPos;
					pt1Cur.y = nLocalYPos1;

					pt2Cur = xUtils.didClone(pt);
					pt2Cur.x = nLocalXPos;
					pt2Cur.y = nLocalYPos2;

					if(bFirst !== true) {
						if(bUp === true && dataValue1 <= dataValue2) {
							var ptCross = xUtils.didGetCrossPoint(pt1Pre, pt1Cur, pt2Pre, pt2Cur);
							arrPt1.push(xUtils.didClone(ptCross));
							arrPt2.push(xUtils.didClone(ptCross));

							drawPolygonParam.pt1s = arrPt1;
							drawPolygonParam.pt2s = arrPt2;
							drawPolygonParam.fillColor = fillColorVal;

							gxDc.Polygon(drawPolygonParam);

							arrPt1 = [];
							arrPt2 = [];

							arrPt1.push(xUtils.didClone(ptCross));
							arrPt1.push(pt1Cur);

							arrPt2.push(xUtils.didClone(ptCross));
							arrPt2.push(pt2Cur);

							bUp = false;
							fillColorVal = fillColorDn;

							pt1Pre = xUtils.didClone(pt1Cur);
							pt2Pre = xUtils.didClone(pt2Cur);
						}
						else if(bUp !== true && dataValue1 > dataValue2) {
							var ptCross = xUtils.didGetCrossPoint(pt1Pre, pt1Cur, pt2Pre, pt2Cur);
							arrPt1.push(xUtils.didClone(ptCross));
							arrPt2.push(xUtils.didClone(ptCross));

							drawPolygonParam.pt1s = arrPt1;
							drawPolygonParam.pt2s = arrPt2;
							drawPolygonParam.fillColor = fillColorVal;

							gxDc.Polygon(drawPolygonParam);

							arrPt1 = [];
							arrPt2 = [];

							arrPt1.push(xUtils.didClone(ptCross));
							arrPt1.push(pt1Cur);

							arrPt2.push(xUtils.didClone(ptCross));
							arrPt2.push(pt2Cur);

							bUp = true;
							fillColorVal = fillColorUp;

							pt1Pre = xUtils.didClone(pt1Cur);
							pt2Pre = xUtils.didClone(pt2Cur);
						}
						else {
							arrPt1.push(pt1Cur);
							arrPt2.push(pt2Cur);

							pt1Pre = xUtils.didClone(pt1Cur);
							pt2Pre = xUtils.didClone(pt2Cur);
						}
					}
					else {
						bFirst = false;

						if(dataValue1 > dataValue2) {
							fillColorVal = fillColorUp;
							bUp = true;
						}
						else {
							fillColorVal = fillColorDn;
							bUp = false;
						}

						arrPt1.push(pt1Cur);
						arrPt2.push(pt2Cur);

						pt1Pre = xUtils.didClone(pt1Cur);
						pt2Pre = xUtils.didClone(pt2Cur);
					}
				}

				dataIndex	  = xAxisX.didConvertLocalIndexToDataIndex(nDataIdx);
				shiftedIndex1 = xPlot1.didGetShiftedDataIndex(dataIndex);
				shiftedIndex2 = xPlot2.didGetShiftedDataIndex(dataIndex);

				dataValue1 = xPlot1.didGetDataAt(shiftedIndex1);
				dataValue2 = xPlot2.didGetDataAt(shiftedIndex2);

				if (xUtils.dataValidator.isValidData(dataValue1) === true && xUtils.dataValidator.isValidData(dataValue2) === true) {
					var nLocalXPos  = xAxisX.GetXPosAtDataIndex(dataIndex);

					var nLocalYPos1 = xAxisY.GetYPos(dataValue1);
					var nLocalYPos2 = xAxisY.GetYPos(dataValue2);

					pt1Cur = xUtils.didClone(pt);
					pt1Cur.x = nLocalXPos;
					pt1Cur.y = nLocalYPos1;

					pt2Cur = xUtils.didClone(pt);
					pt2Cur.x = nLocalXPos;
					pt2Cur.y = nLocalYPos2;

					if(bFirst !== true) {
						if(bUp === true && dataValue1 <= dataValue2) {
							var ptCross = xUtils.didGetCrossPoint(pt1Pre, pt1Cur, pt2Pre, pt2Cur);
							arrPt1.push(xUtils.didClone(ptCross));
							arrPt2.push(xUtils.didClone(ptCross));

							drawPolygonParam.pt1s = arrPt1;
							drawPolygonParam.pt2s = arrPt2;
							drawPolygonParam.fillColor = fillColorVal;

							gxDc.Polygon(drawPolygonParam);

							arrPt1 = [];
							arrPt2 = [];

							arrPt1.push(xUtils.didClone(ptCross));
							arrPt1.push(pt1Cur);

							arrPt2.push(xUtils.didClone(ptCross));
							arrPt2.push(pt2Cur);

							bUp = false;
							fillColorVal = fillColorDn;

							pt1Pre = xUtils.didClone(pt1Cur);
							pt2Pre = xUtils.didClone(pt2Cur);
						}
						else if(bUp !== true && dataValue1 > dataValue2) {
							var ptCross = xUtils.didGetCrossPoint(pt1Pre, pt1Cur, pt2Pre, pt2Cur);
							arrPt1.push(xUtils.didClone(ptCross));
							arrPt2.push(xUtils.didClone(ptCross));

							drawPolygonParam.pt1s = arrPt1;
							drawPolygonParam.pt2s = arrPt2;
							drawPolygonParam.fillColor = fillColorVal;

							gxDc.Polygon(drawPolygonParam);

							arrPt1 = [];
							arrPt2 = [];

							arrPt1.push(xUtils.didClone(ptCross));
							arrPt1.push(pt1Cur);

							arrPt2.push(xUtils.didClone(ptCross));
							arrPt2.push(pt2Cur);

							bUp = true;
							fillColorVal = fillColorUp;

							pt1Pre = xUtils.didClone(pt1Cur);
							pt2Pre = xUtils.didClone(pt2Cur);
						}
						else {
							arrPt1.push(pt1Cur);
							arrPt2.push(pt2Cur);

							pt1Pre = xUtils.didClone(pt1Cur);
							pt2Pre = xUtils.didClone(pt2Cur);
						}
					}
					else {
						bFirst = false;

						if(dataValue1 > dataValue2) {
							fillColorVal = fillColorUp;
						}
						else {
							fillColorVal = fillColorDn;
						}

						arrPt1.push(pt1Cur);
						arrPt2.push(pt2Cur);

						pt1Pre = xUtils.didClone(pt1Cur);
						pt2Pre = xUtils.didClone(pt2Cur);
					}
				}

				drawPolygonParam.pt1s = arrPt1;
				drawPolygonParam.pt2s = arrPt2;
				drawPolygonParam.fillColor = fillColorVal;

				gxDc.Polygon(drawPolygonParam);
			};

			//
			//
			//
			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didDrawBaselines = function(isHitTest) {
				//
				// lines
				//
				if(_self.m_xSeriesInfo.lines === undefined || _self.m_xSeriesInfo.lines == null) {
					return;
				}
				var nCount = _self.m_xSeriesInfo.lines.length;
				if(nCount < 1) {
					return;
				}

				var xObject = _self.m_xSeriesInfo.lines;
				for (var ii = 0; ii < nCount; ii++) {
					var xBi = xObject[ii];
					_self.didDrawBaselineItem(xBi, isHitTest);
				}
			};

			this.didDrawBaselineItem = function(argBaselineItem, isHitTest) {
				if(argBaselineItem === undefined || argBaselineItem == null) {
					return;
				}

				if(argBaselineItem.hide === true) {
					return;
				}

				//
				// calculate pixel position to draw
				//
				var dLineValue	 = _self.didCalcBaselineValue(argBaselineItem);
				if(dLineValue === undefined || dLineValue == null) {
					return;
				}

				var nPointVal	 = _self.didGetPointValue();
				var dLineDispVal = argBaselineItem.value;
				var	showLabel	 = argBaselineItem.showLabel;

				var drawWrapper  = _self.m_drawWrapper;
				var xAxisX       = _self.didGetAxisX();
				var xAxisY       = _self.didGetAxisY();
				var context      = _self.didGetContext();
				var __xPanelRect = _self.didGetPanelRect();

				var nYPos		 = xAxisY.GetYValToPos(dLineValue);

				// set to draw parameter
				var lineColor = xUtils.constants.indicatorColors.baseline;//argBaselineItem.lineColor;
				var lineWidth = 1;//argBaselineItem.lineWeight;
				var lineStyle = 1;
				var context   = _self.m_context;
				var xEnv      = _self.didGetEnvInfo();
				var font      = xEnv.Font;
				if(isHitTest === true) {
					context = _self.didGetContext(true);
					lineColor = _self.m_clrHitTestColor;
				}
				// #676
				else {
					var xEnv = _self.didGetEnvInfo();
					if(xEnv !== undefined && xEnv != null && (_self.m_bSelect === true)) {
						lineColor = xEnv.System.SelectedFill.lineColor;
					}
				}

				var fontColor  = lineColor;

				var drawLineParam = {
					context:context,
					pt1: {
						x:0,
						y:nYPos
					},
					pt2 : {
						x:__xPanelRect.width,
						y:nYPos
					},
					lineWidth:lineWidth,
					lineColor:lineColor,
					lineStyle:lineStyle
				};

				gxDc.Line(drawLineParam);

				if(showLabel !== true) {
					return;
				}

				// Text
				var strAlias = argBaselineItem.alias;
				if(strAlias === undefined || strAlias == null) {
					return;
				}

				var strDisp = strAlias.trim();
				if(strDisp === "") {
					return;
				}

				var drawTextParam = {
					context : context,
					pt : {
						x : 0,
						y : 0
					},
					text : '',
					font : font,
					fillStyle : fontColor
				};

	            var drawRectParam = {
		    		context : context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : 1,
		    		lineColor : lineColor,
		    		fillColor : "#ffffff"
		    	};

	            var textRect = gxDc.CalcRect2(strDisp, font);
	            drawRectParam.rect.width = textRect.width + 5;
	            drawRectParam.rect.height= textRect.height;
	            drawRectParam.rect.x = 5;
	            drawRectParam.rect.y = nYPos - parseInt(textRect.height / 2);
	            gxDc.Rectangle(drawRectParam);

	            drawTextParam.text = strDisp;
	            drawTextParam.pt.x = 5 + 2;
	            drawTextParam.pt.y = nYPos;
	            gxDc.TextOut(drawTextParam);
			};
			//

			/**
			 *
			 */
			this.DrawIndicatorChart = function(posval) {
				// #776
				_self.didDrawBaselines();

				//

				// #734
				_self.didDrawFillPlots();

				//
				var nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				var nPlotCount = _self.m_arrPlots.length;
				for (var nPlotNo = 0; nPlotNo < nPlotCount; nPlotNo++) {
					var xPlot = _self.m_arrPlots[nPlotNo];
					if(xPlot === undefined || xPlot == null || xPlot.hasIgnore() === true || xPlot.hasHide() === true) {
						continue;
					}

					xPlot.didDrawObj();
				}
			};

			/*
				* draw indicator on the memory context to test hit or not
				* @param[in] posval hit position
				*/
			this.DrawSelectChart = function(posval) {
				var iXPosFrom, iXPosTo, iYPosFrom, iYPosTo;
				var iPriceFrom, iPriceTo;
				var colorVal;
				var dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false);

				//
				var nPlotCount = _self.m_arrPlots.length;
				for (var nPlotNo = 0; nPlotNo < nPlotCount; nPlotNo++) {
					var xPlot = _self.m_arrPlots[nPlotNo];
					var nPlotDataCount = xPlot.m_arrDatas.length;
					if(nPlotDataCount < 1) {
						continue;
					}

					for(var ii = (dataIndexAtPos - 3); ii <= (dataIndexAtPos + 3); ii++) {
						var dataIndex1 = ii;
						var dataIndex2 = ii + 1;
						var shiftedIndex1 = _self.didGetShiftedDataIndexOfPlotAt(dataIndex1, nPlotNo);
						var shiftedIndex2 = shiftedIndex1 + 1;

						var dataValue1 = xPlot.m_arrDatas[shiftedIndex1];
						var dataValue2 = xPlot.m_arrDatas[shiftedIndex2];

						//
						if (xUtils.dataValidator.isValidData(dataValue1) !== true || xUtils.dataValidator.isValidData(dataValue2) !== true) {
							continue;
						}

						var nLocalXPos1 = _self.m_drawWrapper.GetXPosAtDataIndex(dataIndex1);
						var nLocalXPos2 = _self.m_drawWrapper.GetXPosAtDataIndex(dataIndex2);

						var nLocalYPos1 = _self.GetYPos(dataValue1);
						var nLocalYPos2 = _self.GetYPos(dataValue2);

						//
						var lineColorVal = '#ff0000';

						_self.DrawLine({context:_self.m_memcontext, startX:nLocalXPos1, startY:nLocalYPos1, endX:nLocalXPos2, endY:nLocalYPos2, lineWidth:1, lineColor:lineColorVal});
					}
				}
			};

			/**
			 * draw for hit testing
			 * @param[in] posval	{XPos, YPos}
			 * @return true or false
			 */
			this.DrawSelectObj = function(posval, hitTestTool) {
				if(hitTestTool !== undefined && hitTestTool != null) {

					hitTestTool.willBeHitTest();

					_self.DrawSelectChart(posval);

					var result = hitTestTool.didHitTest();

					hitTestTool.closeHitTest();

					if(result === true) {
						_self.m_bSelect = true;
						//
						return(true);
					}
				}
				else {
					_self.DrawSelectChart(posval);

					if(_self.m_drawWrapper.didHitTest(_self.m_memcontext, posval) === true) {
						_self.m_bSelect = true;
						return(true);
					}
				}


				return(false);
			};

			var _DeselectAllPlots = function() {
				var nPlotCount = _self.m_arrPlots.length;
				for (var nPlotNo = 0; nPlotNo < nPlotCount; nPlotNo++) {
					var xPlot = _self.m_arrPlots[nPlotNo];

					if(xPlot.DeselectAllObject) {
						xPlot.DeselectAllObject();
					}
				}
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.DeslectAllRest = function() {
				_DeselectAllPlots();
			}

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @param  {[type]} hitTestTool
			 * @return {[type]}
			 */
			this.didHitTest = function(posval, hitTestTool) {
				var dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false);

				var nPlotCount = _self.m_arrPlots.length;
				for (var nPlotNo = 0; nPlotNo < nPlotCount; nPlotNo++) {
					var xPlot = _self.m_arrPlots[nPlotNo];
					if(xPlot === undefined || xPlot == null || xPlot.didHitTest === undefined || xPlot.didHitTest == null) {
						continue;
					}

					var result = xPlot.didHitTest(hitTestTool, dataIndexAtPos);

					if(result === true) {
						// #1927
						if(posval.__onmove__ !== true) {
							// plot
							xPlot.m_bSelect = true;

							// self
							_self.m_bSelect = true;
						}
						//

						//
						return(true);
					}
				}

				//
				//
				//
				if(_self.didHitTestForFillPlots(posval, hitTestTool) === true) {
					_self.m_bSelect = true;

					return(true);
				}

				//

				// #777
				if(_self.didHitTestForBaselines(posval, hitTestTool) === true) {
					_self.m_bSelect = true;

					return(true);
				}

				//

				return(false);
			};

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @param  {[type]} hitTestTool
			 * @return {[type]}
			 */
			this.didHitTestForFillPlots = function(posval, hitTestTool) {
				if(hitTestTool === undefined || hitTestTool == null) {
					return(false);
				}

				// prepare
				hitTestTool.willBeHitTest();

				//
				_self.didDrawFillPlots(true);

				//
				var result = hitTestTool.didHitTest();

				// close
				hitTestTool.closeHitTest();

				//
				return(result);
			};

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @param  {[type]} hitTestTool
			 * @return {[type]}
			 */
			this.didHitTestForBaselines = function(posval, hitTestTool) {
				if(hitTestTool === undefined || hitTestTool == null) {
					return(false);
				}

				// prepare
				hitTestTool.willBeHitTest();

				//
				_self.didDrawBaselines(true);

				//
				var result = hitTestTool.didHitTest();

				// close
				hitTestTool.closeHitTest();

				//
				return(result);
			};

			this.didDrawDataView = function(argDtp, argDataIndex) {
				var drawTextParam  = argDtp;

	            var title     	   = _self.didGetDisplayTitle();// _self.m_strChartName;

				var textSpace      = drawTextParam.textSpace;

	            // draw title
	            drawTextParam.text = title;
	            var titleLen = gxDc.TextOut(drawTextParam, true);

				drawTextParam.pt.x = drawTextParam.pt.x + textSpace * 2 + titleLen;

				return(drawTextParam);
			};

			this.didDrawDataViewForSubItems = function(argDtp, argDataIndex) {
				var nPlotCount = _self.m_arrPlots.length;
				for (var ii = 0; ii < nPlotCount; ii++) {
					var xPlot = _self.m_arrPlots[ii];
					if(xPlot === undefined || xPlot == null) {
						break;
					}

					xPlot.didDrawDataView(argDtp, argDataIndex);
				}

				return(argDtp);
			};

			// #758

			this.didGetDisplayTitle = function(isSimple) {
				var strParamInfo = "";
				if(isSimple !== true) {
					var nParamCount = _self.m_xSeriesInfo.params.length;
					if(nParamCount > 0) {
						strParamInfo = "(";
						for(var ii = 0; ii < nParamCount; ii++) {
							var xParam = _self.m_xSeriesInfo.params[ii];
							strParamInfo += xUtils.indicator.didGetParamValueForDisplay(xParam);
							if(ii < nParamCount - 1) {
								strParamInfo += ",";
							}
						}
						strParamInfo += ")";
					}
				}

				return(_self.m_strChartName + strParamInfo);
			};

			/**
			 * draw data in position of the crossline
			 * @param[in] pt			{x, y}
			 * @param[in] argDataIndex	data index
			 */
			this.didGetDataViewDataAtPos = function(argLocalXPos) {
				var dataIndex = _self.GetXIndex(argLocalXPos);

				var xViewData = {
					isPrice : false,
					display : _self.didGetDisplayTitle(),
					datas : []
				};

				var nPlotCount = _self.m_arrPlots.length;
				for (var ii = 0; ii < nPlotCount; ii++) {
					var xPlot = _self.m_arrPlots[ii];
					if(xPlot === undefined || xPlot == null) {
						break;
					}

					var xData = xPlot.didGetDataViewDataAt(dataIndex);
					if(xData !== undefined && xData != null) {
						// #2294
						if(xData.length !== undefined && xData.length != null) {
							for(var ii = 0; ii < xData.length; ii++) {
								xViewData.datas.push(xData[ii]);
							}
						}
						else {
							xViewData.datas.push(xData);
						}
						//
					}
				}

				return(xViewData);
			};

			//
			// TODO: [MARK] NGE
			//

			/**
			 * get data size
			 * @returns number
			 */
			this.didGetDataSize = function() {
				var nPlotCount = _self.m_arrPlots.length;
				if(nPlotCount < 1) {
					return(0);
				}

				return(_self.m_arrPlots[0].didGetDataSize());
			};

			this.ProcStart = function() {
				var xDoBasePrice = _self.m_drawWrapper.didGetReferencedPriceObject();
				var nBaseDataCount = _self.m_drawWrapper.GetBaseDataCount();

				_self.m_nLastIdx = nBaseDataCount - 1;
				var result = xDoBasePrice.GetLastDataIndex(_self.m_nLastIdx);
				if(result !== undefined && result != null) {
					_self.m_nLastIdx = result;
					nBaseDataCount = _self.m_nLastIdx + 1;
				}

				_self.InnerProc(-1, 0, nBaseDataCount, true);
			};

			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {

			};

			this.ParamSet = function() {

			};

			this.didDefaultParamSet = function() {
				var strTemp = _self.didGetParamValueByKey(xUtils.constants.keywords.defaults.price);
				if(strTemp !== "") {
					// 価格パラメーターはキーワードから検索し、値があるのみ適用する。
					var strKey = strTemp.toLowerCase();
					var strCvtValue = xUtils.constants.keywords.price[strKey];
					if(strCvtValue !== undefined) {
						_self.m_nPrice = strCvtValue;
					}
				}

				strTemp = _self.didGetParamValueByKey(xUtils.constants.keywords.defaults.period);
				if(strTemp !== "") {
					_self.m_nPeriod = parseInt(strTemp);
				}
			};

			this.SetRefSkip = function(bReset) {

			};

			this.GetPlotLimit = function() {
				return(_self.m_nPlotLimit);
			};

			this.SetSize = function(argSize) {
				var	nPlotCount	= _self.m_arrPlots.length ;
				for(var ii = 0; ii < nPlotCount; ii++) {
					var xPlot = _self.m_arrPlots[ii];
					if(xPlot !== undefined && xPlot != null) {
						xPlot.didSetSize(argSize);
					}
				}
			};

			this.didClearIndicatorDatas = function() {
				_self.Clean();
			};

			this.didCleanRest = function() {

			};

			this.Clean = function() {
				_self.didClearDatas();
				_self.didCleanRest();
			};

			/**
			 *
			 *
			 * @param {any} nStart
			 * @param {any} nDSize
			 * @param {any} nSSize
			 * @returns true or false
			 */
			this.runProcRTEx = function(nStart, nDSize, nSSize) {
				// xUtils.debug.formattedLog('debug', '{0} : nStart({1}), nDSize({2}), nSSize({3})', "DOSeries => runProcRTEx", nStart, nDSize, nSSize);

				var	nPCnt	= _self.m_arrPlots.length ;
				if( nPCnt < _self.GetPlotLimit()) {
					return(false);
				}

				var xPlotBase = _self.m_arrPlots[0];
				var xDoBasePrice = _self.m_drawWrapper.didGetReferencedPriceObject();

				var	nPLCnt	= _self.didGetDataSize();
				var	nDiff	= nDSize - nPLCnt ;
				if( nDiff > 0 ) {
					_self.SetSize ( nDSize ) ;

					// xUtils.debug.formattedLog('debug', '{0} : {1}', "DOSeries => runProcRTEx", "SetSize");
				}

				//===========================================================================
				// if no index difference , real-time start position is last index...
				// if index difference , real-time start position is last count pos...
				//===========================================================================
				var	nNewLastIdx	= nDSize - 1;
				nNewLastIdx = xDoBasePrice.GetLastDataIndex(nNewLastIdx);
				nDiff	= nNewLastIdx - _self.m_nLastIdx;

				var	nRTStart	= 0 ;
				if( nDiff == 0 ) {
					_self.procRTSame ( _self.m_nLastIdx + 1 ) ;
					nRTStart	= ( _self.m_nLastIdx < 0 ) ? 0 : _self.m_nLastIdx;
				}
				else if( nDiff > 0 ) {
					nRTStart	= ( _self.m_nLastIdx < 0 ) ? 1 : ( _self.m_nLastIdx + 1 ) ;
				}
				else {
					return(false);
				}

				// xUtils.debug.formattedLog('debug', '{0} : {1}({2}, {3}, {4}, {5})', "DOSeries => runProcRTEx", "InnerProc", -1, nRTStart, nNewLastIdx + 1, false);

				_self.InnerProc(-1, nRTStart, nNewLastIdx + 1, false) ;

				_self.m_nLastIdx = nNewLastIdx;

				// xUtils.debug.formattedLog('debug', "Last index is {0}.", _self.m_nLastIdx);

				return(true);
			};

			this.willBeRunProcHD = function(isNontime) {
				// Clean
				_self.Clean();

				// Check plot count
				var	nPCnt = _self.__GETPLOTSIZE () ;
				if(nPCnt < _self.GetPlotLimit()) {
					return(false);
				}

				if(isNontime !== true) {
					// TODO: set size
					var nBaseDataCount = _self.didGetReferencedBaseDataCount();

					_self.SetSize(nBaseDataCount);
				}

				//
				return(true);
			};

			this.runProcHDEx = function(nStart, nDSize, nSSize) {
				return(_self.runProcHD());
			};

			this.runProcHD = function() {
				if(_self.willBeRunProcHD() !== true) {
					return(false);
				}

				//
				_self.didDefaultParamSet();

				//
				_self.ParamSet();
				_self.ProcStart();

				// TODO: [DEBUG:LOG]
				//_self.didPrintDebugData();

				//
				return(true);
			};

			this.procRTSame = function(nDSize) {

			};

			this.didGetPlotAt = function(plotNo) {
				var nCount = _self.m_arrPlots.length;
				var nPlotNo;
				if(plotNo === undefined || plotNo == null || typeof plotNo === "object") {
					nPlotNo = 0;
				}
				else if(typeof plotNo === "string") {
					nPlotNo = parseInt(plotNo);
				}
				else {
					nPlotNo = plotNo;
				}

				if(nCount < 1 || nPlotNo < 0 || nPlotNo >= nCount) {
					return;
				}

				return(_self.m_arrPlots[plotNo]);
			};

			this.didPrintDebugData = function() {
				var nPlotCount =  _self.m_arrPlots.length;
				if(nPlotCount < 1) {
					xUtils.debug.log("Print debug data: there is no data.");
					return;
				}

				_self.didGetShifLeftCount() + _self.didGetShifRightCount();

				var nLeftShift  = _self.didGetShifLeftCount();
				var nRightShift = _self.didGetShifLeftCount();
				var nShiftAll   = nLeftShift + nRightShift;

				var pointValue = _self.didGetPointValue();
				var powValue = Math.pow(pointValue);
				var nPlotDataCount = _self.m_arrPlots[0].m_arrDatas.length + nShiftAll;
				var strDivider = "	";
				xUtils.debug.log("Print debug data: " + _self.m_strChartName);
				for(var ii = 0; ii < nPlotDataCount; ii++) {
					var localDataIndex = ii + (-1 * nLeftShift);

					var strPrint = xUtils.number.formatAsfillSize(localDataIndex, " ", 5) + ":	";
					for(var nPlotNo = 0; nPlotNo < nPlotCount; nPlotNo++) {
						var xPlot = _self.didGetPlotAt(nPlotNo);
						if(xPlot.hasIgnore() === true || xPlot.hasHide() === true) {
							continue;
						}

						var shiftedIndex  = xPlot.didGetShiftedDataIndex(localDataIndex);

						if(xPlot.isValidAt(shiftedIndex) === true) {
							var plotData = xPlot.didGetDebugPointedDataAt(shiftedIndex, pointValue);
							strPrint += plotData + strDivider;
						}
						else {
							strPrint += xUtils.constants.text.dataView.invalid + strDivider;
						}
					}

					xUtils.debug.log(strPrint);
				}

				xUtils.debug.log("Print debug data: LastIndex => " + _self.m_nLastIdx);
			};

			this.didGetReferencedBaseDataCount = function() {
				return(_self.m_drawWrapper.GetBaseDataCount());
			};

			this.didGetReferencedPriceObject = function() {
				return(_self.m_drawWrapper.didGetReferencedPriceObject());
			};

			this.didGetReferencedBaseDataAt = function(dataIndex, bScreen) {
				return(_self.m_drawWrapper.GetBaseDataAt(dataIndex, bScreen));
			};

			this.didGetReferencedBaseDatas = function(to, count) {
				return(_self.m_drawWrapper.GetBaseDatas(to, count));
			};

			this.didGetPriceFactor = function() {
				var xDoBasePrice = _self.m_drawWrapper.didGetReferencedPriceObject();
				var nBasePricePoint = xDoBasePrice.didGetPointValue();
				var nPointValue = _self.didGetPointValue();
				var dFactor = Math.pow(0.1, nBasePricePoint - nPointValue);

				return(dFactor);
			};

			/**
			 * 平均などを計算する時、表示値を合わせるためのファクターを取得する。
			 *
			 * @return {[type]}
			 */
			this.didGetPointFactor = function() {
				var nPointValue = _self.didGetPointValue();
				var dFactor = Math.pow(10, nPointValue);

				return(dFactor);
			};

			/**
			 * 平均などを計算する時、表示値を合わせるためのファクターを取得する。
			 *
			 * @return {[type]}
			 */
			this.didCalcBaselineValue = function(argLineInfo) {
				if(argLineInfo === undefined || argLineInfo == null || argLineInfo.value === undefined || argLineInfo.value == null) {
					return;
				}

				var dPointFactor = 1;
				if(argLineInfo.raw !== true) {
					dPointFactor = _self.didGetPointFactor();
				}

				var dCalcedValue = argLineInfo.value * dPointFactor;

				return(dCalcedValue);
			};

			//
			//
			//

			this.didGetPlotDatasAt = function(argPlotNo) {
				if(argPlotNo === undefined || argPlotNo == 0 || argPlotNo < 0) {
					argPlotNo = 0;
				}

				var xPlot = _self.didGetPlotAt(argPlotNo);
				if(xPlot === undefined || xPlot == null) {
					return;
				}

				return(xPlot.m_arrDatas);
			};

			//
			//
			//

			// #2169
			this.didDrawLastDataForBaselines = function(argDrawParam) {
				//
				// lines
				//
				if(_self.m_xSeriesInfo.lines === undefined || _self.m_xSeriesInfo.lines == null) {
					return;
				}
				var nCount = _self.m_xSeriesInfo.lines.length;
				if(nCount < 1) {
					return;
				}

				argDrawParam.price = {};
				argDrawParam.price.verpos = _self.didGetPointValue();
				argDrawParam.price.value = null;
				argDrawParam.price.color = null;

				argDrawParam.axis = _self.didGetAxisY();

				var xObject = _self.m_xSeriesInfo.lines;
				for (var ii = 0; ii < nCount; ii++) {
					var xBi = xObject[ii];
					_self.didDrawLastDataForBaselineItem(xBi, argDrawParam);
				}
			};

			this.didDrawLastDataForBaselineItem = function(argBaselineItem, argDrawParam) {
				try {
					if(argBaselineItem === undefined || argBaselineItem == null) {
						return;
					}

					if(argDrawParam === undefined || argDrawParam == null) {
						return;
					}

					if(argBaselineItem.hide === true) {
						return;
					}

					//
					// calculate pixel position to draw
					//
					var dLineValue	 = _self.didCalcBaselineValue(argBaselineItem);
					if(dLineValue === undefined || dLineValue == null) {
						return;
					}

					argDrawParam.price.value = dLineValue;
					argDrawParam.price.color = xUtils.constants.indicatorColors.baseline;

					xUtils.axis.didDrawLastValueOnYAxis(argDrawParam);
				}
				catch(e) {
					console.error(e);
				}
			};
			// [end] #2169

			this.DrawLastValue = function(argDrawParam, dataIndex) {
				try {
					if(argDrawParam === undefined || argDrawParam == null) {
						return;
					}

					// #2169
					_self.didDrawLastDataForBaselines(argDrawParam);
					//

					argDrawParam.price = {};
					argDrawParam.price.verpos = _self.didGetPointValue();
					argDrawParam.price.value = null;
					argDrawParam.price.color = null;

					argDrawParam.axis = _self.didGetAxisY();

					var nCount = _self.m_arrPlots.length;
					for(var ii = 0; ii < nCount; ii++) {
						var xPlot = _self.m_arrPlots[ii];

						if(xPlot === undefined || xPlot == null || xPlot.hasIgnore() === true || xPlot.hasHide() === true) {
							continue;
						}

						xPlot.DrawLastValue(argDrawParam, dataIndex);
					}
				}
				catch(e) {

				}
			};

			/**
			    if no data , scale reset
			    @param[in]     nSize	data size
				@param[in]     bFull	full flag
				@return        BOOL
			*/
			this.NoDataScale = function(nSize , bFull) {
				var bRet = false ;

				if( nSize < 1 ) {
					if( bFull ) {
						xUtils.scale.didBackupScaleInfo(_self.m_xScaleInfo);
					}

					bRet = true ;
				}

				return bRet ;
			};

			this.__GETPLOTSIZE = function() {
				return(_self.m_arrPlots.length);
			};

			//
			// Basic plot calculation methods
			//

			this.ProcPlotSimpleLine = function(argPlotNo, nStart, nDSize, nCheck) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot   = _self.didGetPlotAt(argPlotNo);

				var	nLimit	= nCheck;
				var	nOffset	= nStart ;

				if(xPlot === undefined || xPlot == null) {
					return(nLimit);
				}

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var reg_i = 0;
				var	dData = 0;

				//
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var stPrice;
						stPrice = _self.didGetReferencedBaseDataAt(reg_i, false);
						dData   = xUtils.didGetPriceValue(stPrice, _self.m_nPrice, dFactor);
						xPlot.didSetData(reg_i, true, dData);
					}
				}

				return(nLimit);
			};

			/**
			 * simple
			 * @param {*} nStart
			 * @param {*} nDSize
			 * @param {*} nCheck
			 */
			this.ProcPlotS = function(argPlotNo, nStart, nDSize, nPeriod) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(argPlotNo);

				var			nLimit	= nPeriod - 1 + _self.m_nRefSkip;
				var			nOffset	= nStart ;

				if(xPlot === undefined || xPlot == null) {
					return(nLimit);
				}

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var		bFirst	= true ;
				var		bFast	= true ;
				var		dSumL	= 0 ;
				var		dPreL	= 0 ;
				var		dData	= 0 ;
				var		arrData	= [];

				var		reg_j	= 0 ;
				var		reg_i	= 0 ;
				var		vInput;
				//
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var stPrice;

						if( bFirst || ! bFast ) {
							arrData	= [];

							var		nGo		= reg_i - ( nPeriod - 1 ) ;
							var		nStop	= nGo + nPeriod ;
							for(reg_j = nGo; reg_j < nStop; reg_j++) {
								stPrice = _self.didGetReferencedBaseDataAt(reg_j, false);
								dData   = xUtils.didGetPriceValue(stPrice, _self.m_nPrice, dFactor);

								arrData.push(dData);
							}

							vInput = arrData ;
						}
						else {
							stPrice = _self.didGetReferencedBaseDataAt(reg_i, false);
							dData   = xUtils.didGetPriceValue(stPrice, _self.m_nPrice, dFactor);
							dSumL	+= 	dData ;
							stPrice = _self.didGetReferencedBaseDataAt((reg_i - (nPeriod - 1)), false);
							dData   = xUtils.didGetPriceValue(stPrice, _self.m_nPrice, dFactor);
							dPreL	= dData ;

							vInput	= dPreL;
						}

						var xMAEx = xUtils.math.CalcMAEx(vInput, dSumL, nPeriod, xUtils.math.constants.methods.simple, bFirst, bFast);
						dData = xMAEx.ma;
						dSumL = xMAEx.sum;

						//
						xPlot.didSetData(reg_i, true, dData);

						//
						bFirst	= false;
					}
				}

				return(nLimit);
			};

			/**
			 * exponential
			 * @param {*} nStart
			 * @param {*} nDSize
			 * @param {*} nCheck
			 */
			this.ProcPlotE = function(argPlotNo, nStart, nDSize, nPeriod) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(argPlotNo);

				var			nLimit	= nPeriod /*- 1 + 1*/ + _self.m_nRefSkip;
				var			nOffset	= nStart ;

				if(xPlot === undefined || xPlot == null) {
					return(nLimit);
				}

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var		bFirst	= true ;
				var		bFast	= true ;
				var		dSumL	= 0 ;
				var		dPreL	= 0 ;
				var		dData	= 0 ;
				var		arrData	= [];
				var		dEMA_1	= 0	;
				var		nIdx	= 0	;

				var		reg_j	= 0 ;
				var		reg_i	= 0 ;
				var		vInput;
				//
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var stPrice;
						nIdx	= reg_i - 1;
						if( reg_i === nLimit ) {
							arrData	= [];

							var		nGo		= nIdx - ( nPeriod - 1 ) ;
							var		nStop	= nGo + nPeriod ;
							for(reg_j = nGo; reg_j < nStop; reg_j++) {
								stPrice = _self.didGetReferencedBaseDataAt(reg_j, false);
								dData   = xUtils.didGetPriceValue(stPrice, _self.m_nPrice, dFactor);
								arrData.push(dData);
							}

							var xMAEx = xUtils.math.CalcMAEx(arrData, dSumL, nPeriod, xUtils.math.constants.methods.simple, true, true);
							dEMA_1 = xMAEx.ma;
							dSumL = xMAEx.sum;
						}
						else {
							dEMA_1	= xPlot.didGetDataAt(nIdx);
						}

						//===================================================================
						// first EMA ( n - 1 ) , second Close ( n )
						//===================================================================
						arrData = [];
						arrData.push(dEMA_1) ;
						stPrice = _self.didGetReferencedBaseDataAt(reg_i, false);
						dData   = xUtils.didGetPriceValue(stPrice, _self.m_nPrice, dFactor);
						arrData.push(dData);

						dData   = xUtils.math.CalcMA(arrData, nPeriod, xUtils.math.constants.methods.exponential);

						// middle
						xPlot.didSetData(reg_i, true, dData);
					}
				}

				return(nLimit);
			};

			/**
			 * weight
			 * @param {*} nStart
			 * @param {*} nDSize
			 * @param {*} nCheck
			 */
			this.ProcPlotW = function(argPlotNo, nStart, nDSize, nPeriod) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(argPlotNo);

				var			nLimit	= nPeriod - 1 + _self.m_nRefSkip;
				var			nOffset	= nStart ;

				if(xPlot === undefined || xPlot == null) {
					return(nLimit);
				}

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var		bFirst	= true ;
				var		bFast	= true ;
				var		dSumL	= 0 ;
				var		dPreL	= 0 ;
				var		dData	= 0 ;
				var		arrData	= [];

				var		reg_j	= 0 ;
				var		reg_i	= 0 ;
				var		vInput;
				//
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var stPrice;

						arrData	= [];

						var		nGo		= reg_i - ( nPeriod - 1 ) ;
						var		nStop	= nGo + nPeriod ;
						for(reg_j = nGo; reg_j < nStop; reg_j++) {
							stPrice = _self.didGetReferencedBaseDataAt(reg_j, false);
							dData   = xUtils.didGetPriceValue(stPrice, _self.m_nPrice, dFactor);

							arrData.push(dData);
						}

						vInput = arrData ;

						dData = xUtils.math.CalcMA(arrData, nPeriod, xUtils.math.constants.methods.weight);

						//
						xPlot.didSetData(reg_i, true, dData);

						//
						bFirst	= false;
					}
				}

				return(nLimit);
			};

		};

		var exports = {};

		exports.didGetBaseSeriesClass = function() {
			return(_DOSIndicator);
		};

		exports.didGetBasePlotClass = function() {
			return(_DOPlot);
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDOSeriesBase");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOSeriesBase"] =
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
        define("ngc/chartDOSeriesBase",
            ['ngc/chartUtil', 'ngc/canvas2DUtil', 'ngc/chartDOContainerBase'],
                function(xUtils, gxDc, doBaseClass) {
                    return loadModule(xUtils, gxDc, doBaseClass);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOSeriesBase"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOContainerBase"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOSeriesBase");
})(this);
