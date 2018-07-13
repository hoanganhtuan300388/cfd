(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc, doDosBase) {
		"use strict";

		//
		// class _DOPlot
		//
		var _DOPlot = doDosBase.didGetBasePlotClass();

		//
		// class _DOSIndicator
		//
		var _DOSIndicator = doDosBase.didGetBaseSeriesClass();

		//
		// class _DOSCFDBase
		//
		var _DOSCFDBase = function() {
			var _self = this;

			this.prototype = new _DOSIndicator();
			_DOSIndicator.apply(this, arguments);

			// #2508
			this.hasObjectToShow = function() {
				var nResult = 0;
				var nPlotCount = _self.m_arrPlots.length;
				for (var nPlotNo = 0; nPlotNo < nPlotCount; nPlotNo++) {
					var xPlot = _self.m_arrPlots[nPlotNo];
					if(xPlot === undefined || xPlot == null || xPlot.hasIgnore() === true || xPlot.hasHide() === true) {
						continue;
					}

					return(true);
				}

				return(false);
			};
			//

			this.DrawLastValue = function(argDrawParam, dataIndex) {
			};

			// #1779
			this.didDrawTitleLabel = function(drawParam) {
				if(!drawParam) {
					return;
				}

				var xEnv = _self.didGetEnvInfo();
				var font = drawParam.font;
				var ptCur = drawParam.pt;

				var drawTextParam = {
					context : drawParam.context,
					pt : {
						x : 0,
						y : 0
					},
					text : '',
					font : drawParam.font,
					fillStyle : drawParam.fillStyle
				};

				var drawRectParam = {
		    		context : drawParam.context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : 0,
					fillColor : ''
		    	};

				var boxSize   = xEnv.LabelMarkBoxSize || 12;
				var halfBoxSize = parseInt(boxSize / 2);
				var labelGap  = xEnv.LabelMarkGap  || 5;

				if(_self.m_xSeriesInfo.titles) {
					var nCount =_self.m_xSeriesInfo.titles.length;
					if(nCount > 0) {
						for(var ii = 0; ii < nCount; ii++) {
							var xTitle = _self.m_xSeriesInfo.titles[ii];
							if(!xTitle || xTitle.plotNo === undefined || xTitle.plotNo == null) {
								continue;
							}

							var xPlotInfo = _self.m_xSeriesInfo.plots[xTitle.plotNo];
							if(!xPlotInfo || xPlotInfo.ignore === true) {
								continue;
							}

							// #1779:check hide
							if(xPlotInfo.hide == true) {
								continue;
							}
							//

							var xPlot = _self.didGetPlotAt(xTitle.plotNo);

							var strDisp = "";
							var strParamInfo = "";

							// TODO: use plot hide?
							// if(xPlot.hide === true) {
							// 	continue;
							// }
							var boxColor = xPlot.m_xPlotInfo.color;
							strDisp = xTitle.display || xPlot.m_xPlotInfo.alias;

							try {
								if(xTitle.params) {
									var nLinkNoCount = xTitle.params.length;
									if(nLinkNoCount > 0) {
										strParamInfo = "(";
										var __paramVals = "";
										for(var ll = 0; ll < nLinkNoCount; ll++) {
											var xParamValue = _self.didGetParamValue(xTitle.params[ll]);
											if(xParamValue) {
												__paramVals += xParamValue;
												__paramVals += ",";
											}
										}
										__paramVals = __paramVals.substring(0, __paramVals.length - 1);
										strParamInfo = "(";
										strParamInfo += __paramVals;
										strParamInfo += ")";
									}
								}
							}
							catch(e) {
								console.warn(e);
							}

							strDisp += strParamInfo;

							var textRect = gxDc.CalcRect2(strDisp, font);
							var nextPos  = ptCur.x + boxSize + textRect.width + 2 * labelGap;
							if(nextPos > drawParam.frameWidth) {
								drawParam.lineNo++;
								ptCur.x = drawParam.ptBase.x;
								ptCur.y = drawParam.ptBase.y + drawParam.lineNo * drawParam.lineSpace;
							}

							drawRectParam.rect.x = ptCur.x;
							drawRectParam.rect.y = ptCur.y - halfBoxSize;
							drawRectParam.rect.width = boxSize;
							drawRectParam.rect.height= boxSize;
							drawRectParam.lineColor  = // #3016
							drawRectParam.fillColor  = boxColor;
							gxDc.Rectangle(drawRectParam);

							ptCur.x = ptCur.x + labelGap + boxSize;

							drawTextParam.pt.x = ptCur.x;
							drawTextParam.pt.y = ptCur.y;
							drawTextParam.text = strDisp;
				            var titleLen = gxDc.TextOut(drawTextParam, true);

							ptCur.x = ptCur.x + labelGap + titleLen;
						}
					}
				}
				else {
					var nCount = _self.m_xSeriesInfo.plots.length;
					if(nCount > 0) {
						for(var ii = 0; ii < nCount; ii++) {
							var xPlotInfo = _self.m_xSeriesInfo.plots[ii];
							if(!xPlotInfo || xPlotInfo.ignore === true) {
								continue;
							}

							// #1779:check hide
							if(xPlotInfo.hide == true) {
								continue;
							}
							//

							var strDisp = "";
							var strParamInfo = "";

							// TODO: use plot hide?
							// if(xPlotInfo.hide === true) {
							// 	continue;
							// }
							var boxColor = xPlotInfo.color;
							strDisp = xPlotInfo.alias;

							var xParam;

							try {
								if(xPlotInfo.paramLinkNos) {
									var nLinkNoCount = xPlotInfo.paramLinkNos.length;
									if(nLinkNoCount > 0) {
										strParamInfo = "(";
										var __paramVals = "";
										for(var ll = 0; ll < nLinkNoCount; ll++) {
											var xParamValue = _self.didGetParamValue(xPlotInfo.paramLinkNos[ll]);
											if(xParamValue) {
												__paramVals += xParamValue;
												__paramVals += ",";
											}
										}
										__paramVals = __paramVals.substring(0, __paramVals.length - 1);
										strParamInfo = "(";
										strParamInfo += __paramVals;
										strParamInfo += ")";
									}
								}
								else {
									xParam = _self.m_xSeriesInfo.params[ii];
									if(xParam) {
										strParamInfo = "(";
										strParamInfo += xUtils.indicator.didGetParamValueForDisplay(xParam);
										strParamInfo += ")";
									}
								}
							}
							catch(e) {
								xParam = null;
							}

							strDisp += strParamInfo;

							var textRect = gxDc.CalcRect2(strDisp, font);
							var nextPos  = ptCur.x + boxSize + textRect.width + 2 * labelGap;
							if(nextPos > drawParam.frameWidth) {
								drawParam.lineNo++;
								ptCur.x = drawParam.ptBase.x;
								ptCur.y = drawParam.ptBase.y + drawParam.lineNo * drawParam.lineSpace;
							}

							drawRectParam.rect.x = ptCur.x;
							drawRectParam.rect.y = ptCur.y - halfBoxSize;
							drawRectParam.rect.width = boxSize;
							drawRectParam.rect.height= boxSize;
							drawRectParam.lineColor  = // #3016
							drawRectParam.fillColor  = boxColor;
							gxDc.Rectangle(drawRectParam);

							ptCur.x = ptCur.x + labelGap + boxSize;

							drawTextParam.pt.x = ptCur.x;
							drawTextParam.pt.y = ptCur.y;
							drawTextParam.text = strDisp;
				            var titleLen = gxDc.TextOut(drawTextParam, true);

							ptCur.x = ptCur.x + labelGap + titleLen;
						}
					}
				}

				return(drawParam);
			};
			//

			/**
			 * @param[in] iSeq			display line sequence
			 * @param[in] argScrPosX	local screen position x
			 */
			this.DrawDataView = function(argLineSeq, argLocalXPos) {
				// get data index
				var xEnv = _self.didGetEnvInfo();
				var lineSpace = xEnv.System.LineSpace;
				var textSpace = xEnv.System.TextSpace;
				var dataIndex = _self.GetXIndex(argLocalXPos);
				var context = _self.m_context;
	            var startXPos = textSpace;
				var ptDraw = {
					x : startXPos,
					y : (argLineSeq + 1) * lineSpace
				};

				var font      = _self.m_drawWrapper.m_stEnv.Font;
				var fontColor = _self.m_drawWrapper.m_stEnv.FontColor;
				var textSpace = _self.m_drawWrapper.m_stEnv.System.TextSpace;

				var drawTextParam = {
					context : context,
					pt : {
						x : ptDraw.x,
						y : ptDraw.y
					},
					text : '',
					font : font,
					fillStyle : fontColor,
					textSpace : textSpace
				};

				_self.didDrawDataView(drawTextParam, dataIndex);
			};

			//
			this.didDrawDataView = function(argDtp, argDataIndex) {
				var drawTextParam  = argDtp;
				var drawRectParam = {
		    		context : drawTextParam.context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : 0,
					fillColor : ''
		    	};
				var xEnv = _self.didGetEnvInfo();
				var lineSpace = xEnv.System.LineSpace;
				var textSpace = xEnv.System.TextSpace;
				var boxSize   = xEnv.LabelMarkBoxSize || 12;
				var halfBoxSize = parseInt(boxSize / 2);
				var labelGap  = xEnv.LabelMarkGap  || 5;

				var nCount = _self.m_xSeriesInfo.plots.length;
				if(nCount > 0) {
					for(var ii = 0; ii < nCount; ii++) {
						var xPlot = _self.m_xSeriesInfo.plots[ii];
						if(!xPlot || xPlot.ignore === true) {
							continue;
						}

						var strDisp = "";
						var strParamInfo = "";

						// TODO: use plot hide?
						// if(xPlot.hide === true) {
						// 	continue;
						// }
						var boxColor = xPlot.color;
						strDisp = xPlot.alias;

						var xParam;

						try {
							xParam = _self.m_xSeriesInfo.params[ii];
						}
						catch(e) {
							xParam = null;
						}

						if(xParam) {
							strParamInfo = "(";
							strParamInfo += xUtils.indicator.didGetParamValueForDisplay(xParam);
							strParamInfo += ")";
						}

						strDisp += strParamInfo;

						drawRectParam.rect.x = drawTextParam.pt.x;
						drawRectParam.rect.y = drawTextParam.pt.y - halfBoxSize;
						drawRectParam.rect.width = boxSize;
						drawRectParam.rect.height= boxSize;
						drawRectParam.fillColor  = boxColor;
						gxDc.Rectangle(drawRectParam);

						drawTextParam.pt.x = drawTextParam.pt.x + labelGap + boxSize;

						drawTextParam.text = strDisp;
			            var titleLen = gxDc.TextOut(drawTextParam, true);

						drawTextParam.pt.x = drawTextParam.pt.x + labelGap + titleLen;
					}
				}

				return(drawTextParam);
			};

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
		};

		//
		// class _DOSEMATriple
		//

		var _DOSEMATriple = function() {
			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			var _EMA_PLOTS	= 0;
			var _EMA_PLOTM	= 1;
			var _EMA_PLOTL	= 2;
			var _EMA_PLOT_LIMIT	= 3;

			var _nSPeriod	= 5;
			var _nMPeriod	= 10;
			var _nLPeriod	= 20;

			this.m_nPlotLimit = _EMA_PLOT_LIMIT;

			/**
			 * simple
			 * @param {*} nStart
			 * @param {*} nDSize
			 * @param {*} nCheck
			 */
			var _ProcPlot = function(argPlotNo, nStart, nDSize, nPeriod) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(argPlotNo);

				var			nLimit	= nPeriod - 1 + _self.m_nRefSkip;
				var			nOffset	= nStart ;

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
				var		nIdxP	= 0	;

				var		reg_j	= 0 ;
				var		reg_i	= 0 ;
				var		vInput;
				//
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var stPrice;
						nIdx	= reg_i;
						nIdxP	= nIdx - 1;
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

							dData = dEMA_1;
						}
						else {
							dEMA_1	= xPlot.didGetDataAt(nIdxP);

							//===================================================================
							// first EMA ( n - 1 ) , second Close ( n )
							//===================================================================
							arrData = [];
							arrData.push(dEMA_1) ;
							stPrice = _self.didGetReferencedBaseDataAt(reg_i, false);
							dData   = xUtils.didGetPriceValue(stPrice, _self.m_nPrice, dFactor);
							arrData.push(dData);

							dData   = xUtils.math.CalcMA(arrData, nPeriod, xUtils.math.constants.methods.exponential);
						}

						xPlot.didSetData(reg_i, true, dData);
					}
				}

				return(nLimit);
			};

			/*
				* handler when chart received datas(history or real)
				*/
			this.didCalculateData = function() {
				_self.runProcHD();
			};

			this.ParamSet = function() {
				_nSPeriod = _self.didGetPeriod(0);
				_nMPeriod = _self.didGetPeriod(1);
				_nLPeriod = _self.didGetPeriod(2);
			};

			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				//
				_ProcPlot(_EMA_PLOTS, nStart, nDSize, _nSPeriod);
				_ProcPlot(_EMA_PLOTM, nStart, nDSize, _nMPeriod);
				_ProcPlot(_EMA_PLOTL, nStart, nDSize, _nLPeriod);
			};
		};

		//
		// class _DOSBollingerBandsTriple
		//

		var _DOSBollingerBandsTriple = function() {
			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			var _PVOL_MULTI		= 2;
			var	_PVOL_PERIOD	= 20;
			var	_PVOL_MIDDLE	= 0;
			var	_PVOL_UPPER1	= 1;
			var	_PVOL_LOWER1	= 2;
			var	_PVOL_UPPER2	= 3;
			var	_PVOL_LOWER2	= 4;
			var	_PVOL_UPPER3	= 5;
			var	_PVOL_LOWER3	= 6;
			var	_PVOL_LIMIT		= 7;

			this.m_nPlotLimit = _PVOL_LIMIT;
			this.m_nPeriod = _PVOL_PERIOD;

			/**
			 * simple
			 * @param {*} nStart
			 * @param {*} nDSize
			 * @param {*} nCheck
			 */
			var _ProcPlotS = function(nStart, nDSize, nCheck) {
				var dFactor = _self.didGetPriceFactor();
				var xPlotM	= _self.didGetPlotAt(_PVOL_MIDDLE);
				var xPlotU1	= _self.didGetPlotAt(_PVOL_UPPER1);
				var xPlotL1	= _self.didGetPlotAt(_PVOL_LOWER1);
				var xPlotU2	= _self.didGetPlotAt(_PVOL_UPPER2);
				var xPlotL2	= _self.didGetPlotAt(_PVOL_LOWER2);
				var xPlotU3	= _self.didGetPlotAt(_PVOL_UPPER3);
				var xPlotL3	= _self.didGetPlotAt(_PVOL_LOWER3);

				var			nLimit	= _self.m_nPeriod - 1 + nCheck + _self.m_nRefSkip;
				var			nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlotM.didSetInvalidData(nOffset);
					xPlotU1.didSetInvalidData(nOffset);
					xPlotL1.didSetInvalidData(nOffset);
					xPlotU2.didSetInvalidData(nOffset);
					xPlotL2.didSetInvalidData(nOffset);
					xPlotU3.didSetInvalidData(nOffset);
					xPlotL3.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var	d1SD		= 0 ;	// 1 Standard Deviation
				var	dVar		= 0 ;	// Variation
				var	dAvg		= 0 ;	// Average
				var	dSum		= 0 ;	// Sum
				var	dSum2		= 0	;	// Sum ( x ^ x )
				var	dSumL		= 0 ;	// Sum Last
				var	dSumL2		= 0	;	// Sum Last ( pow ( 2 ) )
				var	dTemp		= 0 ;	//
				var	dTempP		= 0 ;	//
				var	dSumDiff	= 0 ;	//
				var	dData		= 0 ;
				var	reg_i		= 0 ;
				var reg_j		= 0 ;
				var nMulti 		= 1;

				/*
					fixed by HIMS at 2015.09.17
					this problem is occured period - 1 == datasize

					because don't check over limit of the indicator array

					just this indicator have this style.

					another indicator is loop style
					*/
				if(nOffset >= nLimit && nOffset < nDSize) {
					//
					var		nGo		= nOffset - ( _self.m_nPeriod - 1 ) ;
					var		nStop	= Math.min ( nDSize , nGo + _self.m_nPeriod ) ;

					d1SD		= 0 ;	// 1 Standard Deviation
					dVar		= 0 ;	// Variation
					dAvg		= 0 ;	// Average
					dSum		= 0 ;	// Sum
					dSum2		= 0	;	// Sum ( x ^ x )
					dTemp		= 0 ;
					dTempP		= 0 ;

					for(reg_j = nGo; reg_j < nStop; reg_j++) {
						var stPrice = _self.didGetReferencedBaseDataAt(reg_j, false);

						dTemp	= xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.close, dFactor);
						dSum	+= dTemp ;
						dSum2	+= ( dTemp * dTemp ) ;
					}

					dSumL	= dSum  ;
					dSumL2	= dSum2 ;
					dVar	= ( ( dSum2 - ( dSum * dSum ) / _self.m_nPeriod ) / _self.m_nPeriod ) ;
					if( dVar < 0 ) {
						dVar = 0;
					}

					d1SD	= Math.sqrt(dVar);

					dData	= dSum / _self.m_nPeriod;

					// 1. First

					// middle
					xPlotM.didSetData(nOffset, true, dData);

					// 1st
					nMulti	= 1;
					// upper1
					xPlotU1.didSetData(nOffset, true, dData + (d1SD * nMulti));
					// lower1
					xPlotL1.didSetData(nOffset, true, dData - (d1SD * nMulti));

					// 2nd
					nMulti	= 2;
					// upper2
					xPlotU2.didSetData(nOffset, true, dData + (d1SD * nMulti));
					// lower2
					xPlotL2.didSetData(nOffset, true, dData - (d1SD * nMulti));

					// 3rd
					nMulti	= 3;
					// upper3
					xPlotU3.didSetData(nOffset, true, dData + (d1SD * nMulti));
					// lower3
					xPlotL3.didSetData(nOffset, true, dData - (d1SD * nMulti));

					// 2. Next
					nGo		= nOffset + 1 ;
					nStop	= nDSize ;
					for ( reg_i = nGo ; reg_i < nStop ; reg_i++ ) {
						d1SD		= 0 ;	// 1 Standard Deviation
						dVar		= 0 ;	// Variation
						dAvg		= 0 ;	// Average
						dSum		= 0 ;	// Sum
						dSum2		= 0	;	// Sum ( x ^ x )
						dTemp		= 0 ;

						var stPriceP = _self.didGetReferencedBaseDataAt(reg_i - _self.m_nPeriod, false);
						var stPriceL = _self.didGetReferencedBaseDataAt(reg_i, false);

						dTempP		= xUtils.didGetPriceValue(stPriceP, xUtils.constants.keywords.price.close, dFactor);
						dTemp		= xUtils.didGetPriceValue(stPriceL, xUtils.constants.keywords.price.close, dFactor);

						dSum	= dSumL - dTempP + dTemp ;
						dSum2	= dSumL2 - ( dTempP * dTempP ) + ( dTemp * dTemp ) ;
						dSumL	= dSum	;
						dSumL2	= dSum2 ;

						dVar	= ( dSum2 - ( dSum * dSum ) / _self.m_nPeriod ) / _self.m_nPeriod ;
						if( dVar < 0) {
							dVar	= 0;
						}

						d1SD	= Math.sqrt(dVar);

						//
						dData	= dSum / _self.m_nPeriod;

						// middle
						xPlotM.didSetData(reg_i, true, dData);

						// 1st
						nMulti	= 1;
						// upper1
						xPlotU1.didSetData(reg_i, true, dData + (d1SD * nMulti));
						// lower1
						xPlotL1.didSetData(reg_i, true, dData - (d1SD * nMulti));

						// 2nd
						nMulti	= 2;
						// upper2
						xPlotU2.didSetData(reg_i, true, dData + (d1SD * nMulti));
						// lower2
						xPlotL2.didSetData(reg_i, true, dData - (d1SD * nMulti));

						// 3rd
						nMulti	= 3;
						// upper3
						xPlotU3.didSetData(reg_i, true, dData + (d1SD * nMulti));
						// lower3
						xPlotL3.didSetData(reg_i, true, dData - (d1SD * nMulti));
					}
				}

				return(nLimit);
			};

			/*
				* handler when chart received datas(history or real)
				*/
			this.didCalculateData = function() {
				_self.runProcHD();
			};

			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				_ProcPlotS(nStart, nDSize, 0);
			};

			/*
				* @param[in] symbolInfo
				* @param[in] receivedDatas	data[][price type]
				*/
			this.didReceiveData = function(symbolInfo, receivedDatas) {
				_self.ReceiveData();
			};
		};

		//
		// class _DOSIchimokuKinkouhyou_CFD
		//

		var _DOSIchimokuKinkouhyou_CFD = function() {
			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			var _ILMOK_PLOTT			= 0 ;	// PLOT
			var _ILMOK_PLOTB			= 1	;
			var _ILMOK_PLOTBG			= 4	;	// #2830
			var _ILMOK_PLOTPG1			= 2	;	// #2830
			var _ILMOK_PLOTPG2			= 3	;	// #2830
			var _ILMOK_PLOTTMP			= 5	;
			var _ILMOK_LIMIT			= 6	;

			var _ILMOK_PLOTCLOUD		= 0	;	// SIMPLE BAR

			var _ILMOK_PERIOD1			= 9;
			var _ILMOK_PERIOD2			= 26;
			var _ILMOK_PERIOD3			= 26;
			var _ILMOK_PERIOD4			= 52;
			var _ILMOK_PERIOD5			= 26;

			var _ILMOK_PARAM_NO_TENKAN	= 0;
			var _ILMOK_PARAM_NO_KIZUN	= 1;
			var _ILMOK_PARAM_NO_SENKOU1	= 2;
			var _ILMOK_PARAM_NO_SENKOU2	= 3;
			var _ILMOK_PARAM_NO_CHIKOU	= 4;

			var	_ILMOK_SHIFT			= 26;

			this.m_nPlotLimit 			= _ILMOK_LIMIT;

			var _nPeriod1				= _ILMOK_PERIOD1;
			var _nPeriod2				= _ILMOK_PERIOD2;
			var _nPeriod3				= _ILMOK_PERIOD3;
			var _nPeriod4				= _ILMOK_PERIOD4;
			var _nPeriod5				= _ILMOK_PERIOD5;

			// #1604
			this.ParamSet = function() {
				_nPeriod1 = _self.didGetPeriod(0);
				_nPeriod2 = _self.didGetPeriod(1);
				_nPeriod3 = _self.didGetPeriod(2);
				_nPeriod4 = _self.didGetPeriod(3);
				_nPeriod5 = _self.didGetPeriod(4);
			};
			//

			/**
			 * process for Backward Span
			 * @param  {[type]} nStart	data start index
			 * @param  {[type]} nDSize	full data size
			 * @param  {[type]} nCheck	extra offset
			 * @return {[type]}	this function's limit value
			 */
			var _ProcPlotBGSpan = function(nStart, nDSize, nCheck) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(_ILMOK_PLOTBG);

				var			nLimit	= _self.m_nRefSkip;
				var			nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var reg_i = 0;
				var reg_j = 0;

				var dData = 0;
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var stPrice;

						stPrice = _self.didGetReferencedBaseDataAt(reg_i, false);
						dData	= xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.close, dFactor);

						xPlot.didSetData(reg_i, true, dData);
					}
				}

				return nLimit ;
			};

			/**
				<pre>
			    process for Period Center Line ( High & Low )
				Plot = ( Highest( H, Period ) + Lowest( L, Period ) ) / 2
				</pre>
				@param[in]     nPPos		plot position
				@param[in]     nPeriod		period
			    @param[in]     nStart		data start index
				@param[in]     nDSize		full data size
				@param[in]     nCheck		extra offset
			    @return        int ( this function's limit value )
			*/
			var _ProcPlotPCL = function(nPPos, nPeriod, nStart, nDSize, nCheck) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(nPPos);

			    //===========================================================================
			    // Limit Check
			    //===========================================================================
				var nLimit	= nPeriod - 1 + nCheck + _self.m_nRefSkip ;
				var nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var		nf_cnt	= 0 ,
						ns_cnt	= 0 ;

				var		dHigh	= 0 ,
						dLow	= 0 ;

				var		nHIdx	= 0 ,
						nLIdx	= 0 ;

				var		nSIdx	= 0 ;

				var		dData	= 0 ;

				if(nOffset >= nLimit) {
					var	xDoPb	= _self.didGetReferencedPriceObject();
					for ( nf_cnt = nOffset ; nf_cnt < nDSize ; nf_cnt++ ) {
						var stPrice;

						dHigh	= -1 * xUtils.constants.default.DEFAULT_WRONG_VALUE ,
						dLow	=  1 * xUtils.constants.default.DEFAULT_WRONG_VALUE ;

						nSIdx	= nf_cnt - ( nPeriod - 1 ) ;

						var xMinMax = xDoPb.didGetMinMaxAtRange({location:nSIdx, length:nPeriod});
						if(xMinMax !== undefined && xMinMax != null) {
							dHigh = xMinMax.dHigh;
							dLow  = xMinMax.dLow;
						}

						dData	= ( dHigh + dLow ) / 2 ;

						xPlot.didSetData(nf_cnt, true, dData);
					}
				}

				return nLimit ;
			};

			/**
			    process for Forward Span 1
			    @param[in]     nStart		data start index
				@param[in]     nDSize		full data size
				@param[in]     nCheck		extra offset
			    @return        int ( this function's limit value )
			*/
			var _ProcPlotPGSpan1 = function(nStart, nDSize, nCheck) {
				var dFactor  = _self.didGetPriceFactor();
				var xPlot    = _self.didGetPlotAt(_ILMOK_PLOTPG1);
				var xPlotRefT= _self.didGetPlotAt(_ILMOK_PLOTT);
				var xPlotRefB= _self.didGetPlotAt(_ILMOK_PLOTB);

			    //===========================================================================
			    // Limit Check
			    //===========================================================================
				var		nLimit	= nCheck ; //+ m_nPeriod2 - 1 ;
				var		nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var		np_pos	= 0 ,
						nr_pos	= 0 ;

				var		dTData	= 0 ,
						dBData	= 0 ,
						dData	= 0 ;

				if(nOffset >= nLimit) {
					for ( np_pos = nOffset ; np_pos < nDSize ; np_pos++ ) {
						var isValidT	= xPlotRefT.isValidAt(np_pos);
						var isValidB	= xPlotRefB.isValidAt(np_pos);

						if( isValidT === true && isValidB === true ) {
							dTData		= xPlotRefT.didGetDataAt(np_pos) ;
							dBData		= xPlotRefB.didGetDataAt(np_pos) ;

							dData			= ( dTData + dBData ) / 2 ;

							xPlot.didSetData(np_pos, true, dData);
						}
						else {
							xPlot.didSetInvalidData(np_pos);
						}
					}
				}

				return nLimit ;
			}

			/**
			    process for Forward Span 2
			    @param[in]     nStart		data start index
				@param[in]     nDSize		full data size
				@param[in]     nCheck		extra offset
			    @return        int ( this function's limit value )
			*/
			var _ProcPlotPGSpan2 = function(nStart, nDSize, nCheck) {
				var dFactor  = _self.didGetPriceFactor();
				var xPlot    = _self.didGetPlotAt(_ILMOK_PLOTPG2);
				var xPlotRef = _self.didGetPlotAt(_ILMOK_PLOTTMP);

			    //===========================================================================
			    // Limit Check
			    //===========================================================================
				var		nLimit	= nCheck ;//+ ( m_nPeriod2 - 1 ) ;
				var		nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var		np_pos	= 0 ,
						nr_pos	= 0 ;

				var		dTData	= 0 ,
						dBData	= 0 ,
						dData	= 0 ;

				if(nOffset >= nLimit) {
					for ( np_pos = nOffset ; np_pos < nDSize ; np_pos++ ) {
						var isValid = xPlotRef.isValidAt(np_pos);

						if(isValid === true) {
							dData = xPlotRef.didGetDataAt(np_pos);
							xPlot.didSetData(np_pos, true, dData);
						}
						else {
							xPlot.didSetInvalidData(np_pos);
						}
					}
				}

				return nLimit ;
			}


			/*
				* @param[in] symbolInfo
				* @param[in] receivedDatas	data[][price type]
				*/
			this.didReceiveData = function(symbolInfo, receivedDatas) {
				_self.ReceiveData();
			};


			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				var		nCheck	= 0 ;
				var		nCPG1	= 0 ;
				var		nCPG2	= 0 ;

				_ProcPlotBGSpan	( nStart , nDSize , nCheck ) ;

				var		nMCheck	= _ProcPlotPCL		( _ILMOK_PLOTTMP , _nPeriod4 , nStart , nDSize , nCheck ) ;
				var		nTCheck	= _ProcPlotPCL		( _ILMOK_PLOTT   , _nPeriod1 , nStart , nDSize , nCheck ) ;
				var		nBCheck	= _ProcPlotPCL		( _ILMOK_PLOTB   , _nPeriod2 , nStart , nDSize , nCheck ) ;
				nCheck			= Math.max ( nTCheck , nBCheck ) ;

				nCPG2	= _ProcPlotPGSpan2	( nStart , nDSize , nMCheck ) ;
			    nCPG1	= _ProcPlotPGSpan1	( nStart , nDSize , nCheck ) ;

				nCheck	= Math.max ( nCPG1 , nCPG2 ) ;

				//_ProcCloud		( nStart , nDSize , nCheck ) ;
			};

			/**
			 * get span(right shift)
			 * @return number
			 */
			this.didGetShifRightCount = function() {
				var nShiftCount = 0;

				if(_self.m_nMoveShift > 0) {
					nShiftCount = Math.abs(_self.m_nMoveShift);
				}

				var nPlotShiftCount = 0;

				var nCount = _self.m_arrPlots.length;
				for(var ii = 0; ii < nCount; ii++) {
					var nMoveShift = _self.didGetPlotShiftValueAt(ii);
					var nShiftRightCount = xUtils.didGetShifRightCount(nMoveShift);

					nPlotShiftCount = Math.max(nPlotShiftCount, nShiftRightCount);
				}

				nShiftCount += nPlotShiftCount;

				return(nShiftCount);
			};

			/**
			 * get span(left shift)
			 * @return number
			 */
			this.didGetShifLeftCount = function() {
				var nShiftCount = 0;

				if(_self.m_nMoveShift < 0) {
					nShiftCount = Math.abs(_self.m_nMoveShift);
				}

				var nPlotShiftCount = 0;

				var nCount = _self.m_arrPlots.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPlot = _self.m_arrPlots[ii];
					var nMoveShift = _self.didGetPlotShiftValueAt(ii);
					var nShiftLeftCount = xUtils.didGetShifLeftCount(nMoveShift);	// #1604

					nPlotShiftCount = Math.max(nPlotShiftCount, nShiftLeftCount);
				}

				nShiftCount += nPlotShiftCount;

				return(nShiftCount);
			};

			/**
			 *
			 */
			this.didGetPlotShiftValueAt = function(argNo) {
				var isIncludeToday = true;
				var nShiftOffset = 0;
				if(isIncludeToday === true) {
					nShiftOffset = 1;
				}

				if(argNo === _ILMOK_PLOTBG) {
					return(-1 * (_nPeriod5 - nShiftOffset));
				}
				else if(argNo === _ILMOK_PLOTPG1 || argNo === _ILMOK_PLOTPG2) {
					return(1 * (_nPeriod3 - nShiftOffset));
				}
				else {
					return(0);
				}
			};

			/**
			 * get real data index by shifted
			 * @param[in] argDataIndex	data index
			 * @param[in] argPlotNo		plot number
			 * @return shifted index
			 */
			this.didGetShiftedDataIndexOfPlotAt = function(argDataIndex, argPlotNo) {
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
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didDrawFillPlots = function(isHitTest) {
				// #2830
				_self.didDrawFillPlotItem({plot1: _ILMOK_PLOTPG1, plot2: _ILMOK_PLOTPG2, colorUp: "#8515C7", colorDn: "#EE687B", alpha: 0.6}, isHitTest);
			};
		};

		//
		// class _DOSMACD
		//

		var _DOSMACD = function() {
			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			// private
			var _nLPeriod		= 26;
			var _nSPeriod		= 12;
			var _nSigPeriod		= 9;
			var _MACD_PLOTS		= 0;
			var _MACD_PLOTL		= 1;
			var _MACD_PLOTM		= 2;
			var _MACD_PLOTSIG	= 3;
			var _MACD_PLOTO		= 4;

			var _MACD_LIMIT		= 5;

			this.m_nPeriodLimit	= _MACD_LIMIT;

			//
			/**
			 process for Just Minus ( MACD & Oscillator : A - B )
				@param[in]     nLPos		plot index A
				@param[in]     nLCheck		plot index A's extra offset
				@param[in]     nRPos		plot index B
				@param[in]     nRCheck		plot index B's extra offset
				@param[in]     nDPos		plot index of the target
				@param[in]     nStart		data start index
				@param[in]     nDSize		full data size
				@return        int ( this function's limit value )
			*/
			var	_ProcJust = function(nLPos, nLCheck, nRPos, nRCheck, nDPos, nStart, nDSize) {
				var xPlotL = _self.didGetPlotAt(nLPos);
				var xPlotR = _self.didGetPlotAt(nRPos);
				var xPlotD = _self.didGetPlotAt(nDPos);

				//===========================================================================
				// Limit Calc.
				//===========================================================================
				var			nLimit	= Math.max(nLCheck, nRCheck);
				var			nOffset	= nStart ;
				//===========================================================================
				// Invalid Field set
				//===========================================================================
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlotD.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				//===========================================================================
				// Need Variable
				//===========================================================================
				var		dLData	= 0 ,	// op's left
						dRData	= 0 ;	// op's right

				var		reg_j	= 0 ,
						reg_i	= 0 ;
				if( nOffset >= nLimit ) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var calcedValue = xUtils.constants.default.DEFAULT_WRONG_VALUE;
						var bValid = false;

						if(xPlotL.isValidAt(reg_i) !== true || xPlotR.isValidAt(reg_i) !== true) {
							xPlotD.didSetInvalidData(reg_i);
							continue;
						}

						dLData	= xPlotL.didGetDataAt(reg_i) ;
						dRData	= xPlotR.didGetDataAt(reg_i) ;

						bValid = true;
						calcedValue = dLData - dRData;
						xPlotD.didSetData(reg_i, true, calcedValue);
					}
				}

				return nLimit ;
			};

			/**
				process for Signal
				@param[in]     nStart		data start index
				@param[in]     nDSize		full data size
				@param[in]     nCheck		extra offset
				@return        int ( this function's limit value )
			*/
			var _ProcSig_EMA = function(nStart, nDSize, nCheck) {
				var xPlotRef = _self.didGetPlotAt(_MACD_PLOTM);
				var xPlotSig = _self.didGetPlotAt(_MACD_PLOTSIG);

				//===========================================================================
				// Limit Calc.
				//===========================================================================
				var			nLimit	= _nSigPeriod - 1 + nCheck ;	// Exponential
				var			nOffset	= nStart ;
				//===========================================================================
				// Invalid Field set
				//===========================================================================
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlotSig.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				//===========================================================================
				// Need Variable
				//===========================================================================
				var		arrData	= [];
				var		reg_i	= 0 ,
						reg_j	= 0 ;
				var		nIdx	= 0 ;	// Exp
				var		nIdxP	= 0 ;	// Exp
				var		dSumL	= 0 ;
				var		dLast	= 0 ;
				var		dData	= 0 ;
				var		dEMA_1	= 0 ;
				if( nOffset >= nLimit ) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var calcedValue = xUtils.constants.default.DEFAULT_WRONG_VALUE;
						var bValid = false;
						nIdx	= reg_i;	// Exp
						nIdxP	= nIdx - 1 ;	// Exp
						//===================================================================
						// at first EMA-1 is Simple MA ( for classic Method )
						//===================================================================
						if( reg_i === nLimit ) {
							arrData = [];
							var		nGo		= nIdx	- ( _nSigPeriod - 1 ) ;
							var		nStop	= nGo	+ _nSigPeriod ;
							for ( reg_j = nGo ; reg_j < nStop ; reg_j++ ) {
								dData		= xPlotRef.didGetDataAt(reg_j);
								arrData.push(dData);
							}

							var xMAEx = xUtils.math.CalcMAEx(arrData, dSumL, _nSigPeriod, xUtils.math.constants.methods.simple, true, true);
							dEMA_1 = xMAEx.ma;
							dSumL = xMAEx.sum;

							bValid = true;
							calcedValue = (dEMA_1);
						}
						else {
							dEMA_1	= xPlotSig.didGetDataAt(nIdxP);

							//===================================================================
							// first EMA ( n - 1 ) , second Close ( n )
							//===================================================================
							arrData = [];
							arrData.push(dEMA_1) ;
							dData	= xPlotRef.didGetDataAt(reg_i);
							arrData.push(dData);

							dData = xUtils.math.CalcMA(arrData, _nSigPeriod, xUtils.math.constants.methods.exponential);

							bValid = true;
							calcedValue = (dData);
						}

						xPlotSig.didSetData(reg_i, true, calcedValue);
					}
				}

				return(nLimit);
			};

			/**
				process for Signal
				@param[in]     nStart		data start index
				@param[in]     nDSize		full data size
				@param[in]     nCheck		extra offset
				@return        int ( this function's limit value )
			*/
			var _ProcSig_SMA = function(nStart, nDSize, nCheck) {
				var xPlotRef = _self.didGetPlotAt(_MACD_PLOTM);
				var xPlotSig = _self.didGetPlotAt(_MACD_PLOTSIG);

				//===========================================================================
				// Limit Calc.
				//===========================================================================
				var			nPeriod	= _nSigPeriod;
				var			nLimit	= nPeriod - 1 + nCheck ;	// Exponential
				var			nOffset	= nStart ;
				//===========================================================================
				// Invalid Field set
				//===========================================================================
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlotSig.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				//===========================================================================
				// Need Variable
				//===========================================================================
				var	bFirst	= true ;
				var	bFast	= true ;
				var	arrData	= [];
				var	reg_i	= 0 ,
					reg_j	= 0 ;
				var	nIdx	= 0 ;	// Exp
				var	dSumL	= 0 ;
				var	dPreL	= 0 ;
				var	dLast	= 0 ;
				var	dData	= 0 ;
				var	vInput;
				if( nOffset >= nLimit ) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var calcedValue = xUtils.constants.default.DEFAULT_WRONG_VALUE;
						var bValid = false;

						if( bFirst || ! bFast ) {
							arrData	= [];

							var		nGo		= reg_i - ( nPeriod - 1 ) ;
							var		nStop	= nGo + nPeriod ;
							for(reg_j = nGo; reg_j < nStop; reg_j++) {
								dData   = xPlotRef.didGetDataAt(reg_j);

								arrData.push(dData);
							}

							vInput = arrData ;
						}
						else {
							dData   = xPlotRef.didGetDataAt(reg_i);
							dSumL	+= 	dData ;
							dData   = xPlotRef.didGetDataAt(reg_i - (nPeriod - 1));
							dPreL	= dData ;

							vInput	= dPreL;
						}

						var xMAEx = xUtils.math.CalcMAEx(vInput, dSumL, nPeriod, xUtils.math.constants.methods.simple, bFirst, bFast);
						dData = xMAEx.ma;
						dSumL = xMAEx.sum;

						//
						xPlotSig.didSetData(reg_i, true, dData);

						//
						bFirst = false;
					}
				}

				return(nLimit);
			};

			var _ProcRefP = function(argPlotNo, nStart, nDSize, nPeriod) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(argPlotNo);

				var			nLimit	= nPeriod - 1 + _self.m_nRefSkip;
				var			nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				//
				if(nOffset >= nLimit) {
					var arrData = [];
					var reg_i	= 0 ;
					var reg_j	= 0 ;
					var dSumL	= 0 ;
					var	dLast	= 0 ;
					var	dData	= 0 ;
					var	dEMA_1  = 0 ;
					var	nIdx	= 0;
					var	nIdxP	= 0;
					for( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var calcedValue = xUtils.constants.default.DEFAULT_WRONG_VALUE;
						var bValid = false;
						var stPrice;
						nIdx  = reg_i;
						nIdxP = nIdx - 1;
						if(reg_i === nLimit) {
							// reset
							arrData = [];

							var nGo = nIdx - (nPeriod - 1);
							var nStop = nGo + nPeriod;

							for ( reg_j = nGo ; reg_j < nStop ; reg_j++ ) {
								stPrice = _self.didGetReferencedBaseDataAt(reg_j, false);
								dData	= xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.close, dFactor);
								arrData.push(dData);
							}

							var xMAEx = xUtils.math.CalcMAEx(arrData, dSumL, nPeriod, xUtils.math.constants.methods.simple, true, true);
							dEMA_1 = xMAEx.ma;
							dSumL = xMAEx.sum;

							bValid = true;
							calcedValue = (dEMA_1);
						}
						else {
							dEMA_1	= xPlot.didGetDataAt(nIdxP);

							arrData = [];
							arrData.push(dEMA_1);

							stPrice = _self.didGetReferencedBaseDataAt(reg_i, false);
							dData	= xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.close, dFactor);
							arrData.push(dData);

							dData = xUtils.math.CalcMA(arrData, nPeriod, xUtils.math.constants.methods.exponential);

							bValid = true;
							calcedValue = (dData);
						}

						xPlot.didSetData(reg_i, true, calcedValue);
					}
				}

				return(nLimit);
			};

			this.ParamSet = function() {
				_nSPeriod = _self.didGetPeriod(0);
				_nLPeriod = _self.didGetPeriod(1);
				_nSigPeriod = _self.didGetPeriod(2);
			};

			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				var	nSCheck	= 0 ;
				var nLCheck	= 0 ;

				var	nSig	= 0 ;
				var	nMACD	= 0 ;
				nSCheck		= _ProcRefP(_MACD_PLOTS, nStart, nDSize, _nSPeriod);
				nLCheck		= _ProcRefP(_MACD_PLOTL, nStart, nDSize, _nLPeriod);
				nMACD		= _ProcJust(_MACD_PLOTS, nSCheck, _MACD_PLOTL, nLCheck, _MACD_PLOTM, nStart, nDSize);
				nSig		= _ProcSig_SMA(nStart, nDSize, nMACD);
				var nTemp   = _ProcJust(_MACD_PLOTM, nMACD, _MACD_PLOTSIG, nSig, _MACD_PLOTO, nStart, nDSize);
			};

			/**
			 * clear extra datas
			 */
			this.didClearExtraData = function() {

			};
		};

		//
		// class _DOSRCI
		//

		var _DOSRCI = function() {
			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			var	_PRCI_PERIOD		= 5;
			var	_PRCI_PLOT_S		= 0;
			var	_PRCI_PLOT_M		= 1;
			var	_PRCI_PLOT_L		= 2;

			var	_PRCI_LIMIT			= 3;

			var _nSPeriod			= 5;
			var _nMPeriod			= 20;
			var _nLPeriod			= 60;

			this.m_nPlotLimit		= _PRCI_LIMIT;

			this.ParamSet = function() {
				_nSPeriod = _self.didGetPeriod(0);
				_nMPeriod = _self.didGetPeriod(1);
				_nLPeriod = _self.didGetPeriod(2);
			};

			/**
				Get Summation of the Rank
				@param[in]     arrOrg		original data
				@return        double
			*/
			var _CalcRankSum = function(arrOrg) {
				var		nOSize		= arrOrg.length;
				if( nOSize < 2 ) {
					return 0 ;
				}

				var	arrDRank	= [];		// result for day rank
				var	arrPRank1	= [];		// result for price rank same 1 or index
				var	arrPRank2	= [];		// result for price rank same 2
				var	arrData		= [];		// FOR P-RANK CALC.
				var	arrPRankA	= [];		// result for price rank same average

				var			ii		= 0 ,
							jj		= 0 ,
							nRank	= 0 ;

				// Set rank of Day
				for(ii = 0; ii < nOSize; ii++) {
					arrData.push(arrOrg[ii]);
					arrDRank.push(nOSize - ii);
				}

				var		pdLVal,
						pdRVal,
						dSwap	= 0 ;

				var		pnLVal,
						pnRVal,
						nSwap	= 0 ;

				var		dLVal	= 0,
						dRVal	= 0;

				// re-ordering for price rank
				for ( ii = 0 ; ii < nOSize - 1 ; ii++ ) {
					for ( jj = ii + 1 ; jj < nOSize ; jj++ ) {
						dLVal = arrData [ ii ] ;
						dRVal = arrData [ jj ] ;

						if( arrData [ ii ] < arrData [ jj ] ) {
							dSwap			= arrData [ ii ]	;
							arrData [ ii ]	= arrData [ jj ]	;
							arrData [ jj ]	= dSwap		;

							nSwap			= arrDRank [ ii ]	;
							arrDRank [ ii ]	= arrDRank [ jj ]	;
							arrDRank [ jj ]	= nSwap		;
						}
					}
				}

				// temp variable
				var		dPreData= 0 ,	// pre-data
						dCurData= 0	;	// cur-data
				var		nDRank	= 0 ;	// rank of day
				var		nPRank	= 0	;	// rank of price
				var		nPRank2	= 0	;	// rank of price( 2 )
				var		dPRank	= 0 ;
				var		dDPRank	= 0 ;	//
				var		dSum	= 0 ;
				var		nSameCnt= 1	;	// same count
				var		nPRIdx	= 0 ;
				var		dTemp	= 0 ;

				// reset array
				arrPRankA = [];
				arrPRank2 = [];
				arrPRank1 = [];

				// set price rank
				for( ii = 0; ii < nOSize; ii++ ) {
					// get current data
					dCurData	= arrData[ ii ];

					// at first
					if( ii == 0 ) {
						nPRIdx		= 0;
						nPRank		= 1;
						nPRank2		= ii + 1;
					}
					else {
						arrPRank1.push	( nPRIdx );
						// check same or greater
						if( dPreData > dCurData ) {
							if( nSameCnt > 1 ) {
								dTemp = nPRank / nSameCnt;
							}
							else {
								dTemp = nPRank2;
							}
							arrPRankA.push( dTemp );

							// set rank
							nPRank		= ii + 1;
							// reset same count
							nSameCnt	= 1;
							// increase rank index
							nPRIdx++;

							// set rank 2
							nPRank2		= ii + 1;
						}
						else {
							// summation of rank
							nPRank		= nPRank + ( ii + 1 );

							// increase same count
							nSameCnt++;
						}

						if( ii >= nOSize - 1 ) {
							arrPRank1.push	( nPRIdx );

							if( nSameCnt > 1 ) {
								dTemp = nPRank / nSameCnt;
							}
							else {
								dTemp = nPRank2;
							}
							arrPRankA.push( dTemp );
						}
					}

					arrPRank2.push( nPRank2 );

					dPreData	= dCurData;
				}

				// calc. rank sum
				nDRank		= 0 ;	// rank of day
				nPRank		= 0	;	// rank of price
				dDPRank		= 0 ;	//
				dSum		= 0 ;
				nPRIdx		= 0 ;

				// Average method
				for( ii = 0; ii < nOSize; ii++ ) {
					nDRank	= arrDRank [ ii ] ;
					nPRIdx	= arrPRank1[ ii ] ;
					dPRank	= arrPRankA[ nPRIdx ] ;
					dDPRank	= ( nDRank - dPRank ) ;
					dSum	+= ( dDPRank ) * ( dDPRank ) ;
				}

				return( dSum );
			};

			/**
			 * [description]
			 * @param  {[type]} argPlotNo
			 * @param  {[type]} nPeriod
			 * @param  {[type]} nStart
			 * @param  {[type]} nDSize
			 * @param  {[type]} nCheck
			 * @return {[type]}
			 */
			var _ProcPlotRCI = function(argPlotNo, nPeriod, nStart, nDSize, nCheck) {
				var dPointFactor = _self.didGetPointFactor();
				var dFactor = _self.didGetPriceFactor();
				var xPlot   = _self.didGetPlotAt(argPlotNo);

				var	nLimit	= nPeriod - 1 + nCheck;
				var	nOffset	= nStart ;

				if(xPlot === undefined || xPlot == null) {
					return(nLimit);
				}

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var	nGo		= 0 ;
				var	nStop	= 0 ;
				var	dData	= 0 ;
				var	arrData	= [];
				var	dRCI	= 0 ;

				var	reg_j	= 0 ;
				var	reg_i	= 0 ;
				var	vInput;

				//
				var	nDiv	= nPeriod * ( nPeriod * nPeriod - 1 ) ;
				//
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var stPrice;

						arrData	= [];

						nGo		= reg_i - ( nPeriod - 1 ) ;
						var		nStop	= nGo + nPeriod ;
						for(reg_j = nGo; reg_j < nStop; reg_j++) {
							stPrice = _self.didGetReferencedBaseDataAt(reg_j, false);
							dData   = xUtils.didGetPriceValue(stPrice, _self.m_nPrice, dFactor);

							arrData.push(dData);
						}

						dData	= _CalcRankSum(arrData);

						dRCI	= dPointFactor * ( 1 - ( 6 * dData ) / nDiv ) * 100 ;

						//
						xPlot.didSetData(reg_i, true, dRCI);
					}
				}

				return(nLimit);
			};

			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				var nCheck = _self.m_nRefSkip;

				_ProcPlotRCI(_PRCI_PLOT_S, _nSPeriod, nStart, nDSize, nCheck);
				_ProcPlotRCI(_PRCI_PLOT_M, _nMPeriod, nStart, nDSize, nCheck);
				_ProcPlotRCI(_PRCI_PLOT_L, _nLPeriod, nStart, nDSize, nCheck);
			};
		};

		// #1594

		//
		// class _DOSShiftBase
		//
		var _DOSShiftBase = function() {

			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			/**
			 * get span(right shift)
			 * @return number
			 */
			this.didGetShifRightCount = function() {
				var nShiftCount = 0;

				if(_self.m_nMoveShift > 0) {
					nShiftCount = Math.abs(_self.m_nMoveShift);
				}

				var nPlotShiftCount = 0;

				var nCount = _self.m_arrPlots.length;
				for(var ii = 0; ii < nCount; ii++) {
					var nMoveShift = _self.didGetPlotShiftValueAt(ii);
					var nShiftRightCount = xUtils.didGetShifRightCount(nMoveShift);

					nPlotShiftCount = Math.max(nPlotShiftCount, nShiftRightCount);
				}

				nShiftCount += nPlotShiftCount;

				return(nShiftCount);
			};

			/**
			 * get span(left shift)
			 * @return number
			 */
			this.didGetShifLeftCount = function() {
				var nShiftCount = 0;

				if(_self.m_nMoveShift < 0) {
					nShiftCount = Math.abs(_self.m_nMoveShift);
				}

				var nPlotShiftCount = 0;

				var nCount = _self.m_arrPlots.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPlot = _self.m_arrPlots[ii];
					var nMoveShift = _self.didGetPlotShiftValueAt(ii);
					var nShiftLeftCount = xUtils.didGetShifLeftCount(nMoveShift);	// #1604

					nPlotShiftCount = Math.max(nPlotShiftCount, nShiftLeftCount);
				}

				nShiftCount += nPlotShiftCount;

				return(nShiftCount);
			};
		};

		//
		// class _DOSBollingerBandsTriple_Super
		//

		var _DOSBollingerBandsTriple_Super = function() {
			var _self = this;

			this.prototype = new _DOSShiftBase();
			_DOSShiftBase.apply(this, arguments);

			var _SPVOL_MULTI1	= 1;
			var _SPVOL_MULTI2	= 2;
			var _SPVOL_MULTI3	= 3;
			var	_SPVOL_PERIOD	= 21;
			var	_SPVOL_BGSPAN	= 21;
			var	_SPVOL_PLOT_MIDDLE	= 0;
			var	_SPVOL_PLOT_BGSPAN	= 1;
			var	_SPVOL_PLOT_UPPER1	= 2;
			var	_SPVOL_PLOT_LOWER1	= 3;
			var	_SPVOL_PLOT_UPPER2	= 4;
			var	_SPVOL_PLOT_LOWER2	= 5;
			var	_SPVOL_PLOT_UPPER3	= 6;
			var	_SPVOL_PLOT_LOWER3	= 7;
			var	_SPVOL_PLOT_LIMIT	= 8;

			this.m_nPlotLimit = _SPVOL_PLOT_LIMIT;
			this.m_nPeriod = _SPVOL_PERIOD;

			var _nBGSpan = _SPVOL_BGSPAN;
			var _nMulti1 = _SPVOL_MULTI1;
			var _nMulti2 = _SPVOL_MULTI2;
			var _nMulti3 = _SPVOL_MULTI3;

			this.ParamSet = function() {
				_self.m_nPeriod = _self.didGetPeriod(0);
				_nBGSpan = _self.didGetPeriod(1);
				_nMulti1 = _self.didGetPeriod(2);
				_nMulti2 = _self.didGetPeriod(3);
				_nMulti3 = _self.didGetPeriod(4);
			};

			/**
			 * process for Backward Span
			 * @param  {[type]} nStart	data start index
			 * @param  {[type]} nDSize	full data size
			 * @param  {[type]} nCheck	extra offset
			 * @return {[type]}	this function's limit value
			 */
			var _ProcPlotBGSpan = function(nStart, nDSize, nCheck) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(_SPVOL_PLOT_BGSPAN);

				var			nLimit	= _self.m_nRefSkip;
				var			nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var reg_i = 0;
				var reg_j = 0;

				var dData = 0;
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var stPrice;

						stPrice = _self.didGetReferencedBaseDataAt(reg_i, false);
						dData	= xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.close, dFactor);

						xPlot.didSetData(reg_i, true, dData);
					}
				}

				return nLimit ;
			};

			/**
			 * simple
			 * @param {*} nStart
			 * @param {*} nDSize
			 * @param {*} nCheck
			 */
			var _ProcPlotS = function(nStart, nDSize, nCheck) {
				var dFactor = _self.didGetPriceFactor();
				var xPlotM	= _self.didGetPlotAt(_SPVOL_PLOT_MIDDLE);
				var xPlotU1	= _self.didGetPlotAt(_SPVOL_PLOT_UPPER1);
				var xPlotL1	= _self.didGetPlotAt(_SPVOL_PLOT_LOWER1);
				var xPlotU2	= _self.didGetPlotAt(_SPVOL_PLOT_UPPER2);
				var xPlotL2	= _self.didGetPlotAt(_SPVOL_PLOT_LOWER2);
				var xPlotU3	= _self.didGetPlotAt(_SPVOL_PLOT_UPPER3);
				var xPlotL3	= _self.didGetPlotAt(_SPVOL_PLOT_LOWER3);

				var			nLimit	= _self.m_nPeriod - 1 + nCheck + _self.m_nRefSkip;
				var			nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlotM.didSetInvalidData(nOffset);
					xPlotU1.didSetInvalidData(nOffset);
					xPlotL1.didSetInvalidData(nOffset);
					xPlotU2.didSetInvalidData(nOffset);
					xPlotL2.didSetInvalidData(nOffset);
					xPlotU3.didSetInvalidData(nOffset);
					xPlotL3.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var	d1SD		= 0 ;	// 1 Standard Deviation
				var	dVar		= 0 ;	// Variation
				var	dAvg		= 0 ;	// Average
				var	dSum		= 0 ;	// Sum
				var	dSum2		= 0	;	// Sum ( x ^ x )
				var	dSumL		= 0 ;	// Sum Last
				var	dSumL2		= 0	;	// Sum Last ( pow ( 2 ) )
				var	dTemp		= 0 ;	//
				var	dTempP		= 0 ;	//
				var	dSumDiff	= 0 ;	//
				var	dData		= 0 ;
				var	reg_i		= 0 ;
				var reg_j		= 0 ;
				var nMulti 		= 1;

				/*
					fixed by HIMS at 2015.09.17
					this problem is occured period - 1 == datasize

					because don't check over limit of the indicator array

					just this indicator have this style.

					another indicator is loop style
					*/
				if(nOffset >= nLimit && nOffset < nDSize) {
					//
					var		nGo		= nOffset - ( _self.m_nPeriod - 1 ) ;
					var		nStop	= Math.min ( nDSize , nGo + _self.m_nPeriod ) ;

					d1SD		= 0 ;	// 1 Standard Deviation
					dVar		= 0 ;	// Variation
					dAvg		= 0 ;	// Average
					dSum		= 0 ;	// Sum
					dSum2		= 0	;	// Sum ( x ^ x )
					dTemp		= 0 ;
					dTempP		= 0 ;

					for(reg_j = nGo; reg_j < nStop; reg_j++) {
						var stPrice = _self.didGetReferencedBaseDataAt(reg_j, false);

						dTemp	= xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.close, dFactor);
						dSum	+= dTemp ;
						dSum2	+= ( dTemp * dTemp ) ;
					}

					dSumL	= dSum  ;
					dSumL2	= dSum2 ;
					dVar	= ( ( dSum2 - ( dSum * dSum ) / _self.m_nPeriod ) / _self.m_nPeriod ) ;
					if( dVar < 0 ) {
						dVar = 0;
					}

					d1SD	= Math.sqrt(dVar);

					dData	= dSum / _self.m_nPeriod;

					// 1. First

					// middle
					xPlotM.didSetData(nOffset, true, dData);

					// 1st
					nMulti	= _nMulti1;
					// upper1
					xPlotU1.didSetData(nOffset, true, dData + (d1SD * nMulti));
					// lower1
					xPlotL1.didSetData(nOffset, true, dData - (d1SD * nMulti));

					// 2nd
					nMulti	= _nMulti2;
					// upper2
					xPlotU2.didSetData(nOffset, true, dData + (d1SD * nMulti));
					// lower2
					xPlotL2.didSetData(nOffset, true, dData - (d1SD * nMulti));

					// 3rd
					nMulti	= _nMulti3;
					// upper3
					xPlotU3.didSetData(nOffset, true, dData + (d1SD * nMulti));
					// lower3
					xPlotL3.didSetData(nOffset, true, dData - (d1SD * nMulti));

					// 2. Next
					nGo		= nOffset + 1 ;
					nStop	= nDSize ;
					for ( reg_i = nGo ; reg_i < nStop ; reg_i++ ) {
						d1SD		= 0 ;	// 1 Standard Deviation
						dVar		= 0 ;	// Variation
						dAvg		= 0 ;	// Average
						dSum		= 0 ;	// Sum
						dSum2		= 0	;	// Sum ( x ^ x )
						dTemp		= 0 ;

						var stPriceP = _self.didGetReferencedBaseDataAt(reg_i - _self.m_nPeriod, false);
						var stPriceL = _self.didGetReferencedBaseDataAt(reg_i, false);

						dTempP		= xUtils.didGetPriceValue(stPriceP, xUtils.constants.keywords.price.close, dFactor);
						dTemp		= xUtils.didGetPriceValue(stPriceL, xUtils.constants.keywords.price.close, dFactor);

						dSum	= dSumL - dTempP + dTemp ;
						dSum2	= dSumL2 - ( dTempP * dTempP ) + ( dTemp * dTemp ) ;
						dSumL	= dSum	;
						dSumL2	= dSum2 ;

						dVar	= ( dSum2 - ( dSum * dSum ) / _self.m_nPeriod ) / _self.m_nPeriod ;
						if( dVar < 0) {
							dVar	= 0;
						}

						d1SD	= Math.sqrt(dVar);

						//
						dData	= dSum / _self.m_nPeriod;

						// middle
						xPlotM.didSetData(reg_i, true, dData);

						// 1st
						nMulti	= _nMulti1;
						// upper1
						xPlotU1.didSetData(reg_i, true, dData + (d1SD * nMulti));
						// lower1
						xPlotL1.didSetData(reg_i, true, dData - (d1SD * nMulti));

						// 2nd
						nMulti	= _nMulti2;
						// upper2
						xPlotU2.didSetData(reg_i, true, dData + (d1SD * nMulti));
						// lower2
						xPlotL2.didSetData(reg_i, true, dData - (d1SD * nMulti));

						// 3rd
						nMulti	= _nMulti3;
						// upper3
						xPlotU3.didSetData(reg_i, true, dData + (d1SD * nMulti));
						// lower3
						xPlotL3.didSetData(reg_i, true, dData - (d1SD * nMulti));
					}
				}

				return(nLimit);
			};

			/*
				* handler when chart received datas(history or real)
				*/
			this.didCalculateData = function() {
				_self.runProcHD();
			};

			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				_ProcPlotS(nStart, nDSize, 0);
				_ProcPlotBGSpan(nStart, nDSize, 0);
			};

			/*
				* @param[in] symbolInfo
				* @param[in] receivedDatas	data[][price type]
				*/
			this.didReceiveData = function(symbolInfo, receivedDatas) {
				_self.ReceiveData();
			};

			/**
			 *
			 */
			this.didGetPlotShiftValueAt = function(argNo) {
				//
				// #734
				// fix shift
				//
				var isIncludeToday = true;
				var nShiftOffset = 0;
				if(isIncludeToday === true) {
					nShiftOffset = 1;
				}

				if(argNo === _SPVOL_PLOT_BGSPAN) {
					return(-1 * (_nBGSpan - nShiftOffset));
				}
				else {
					return(0);
				}
			};
		};

		//
		// class _DOSSMATriple
		//

		var _DOSSMATriple = function() {
			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			var _MA_PLOTS	= 0;
			var _MA_PLOTM	= 1;
			var _MA_PLOTL	= 2;
			var _MA_PLOT_LIMIT	= 3;

			var _nSPeriod	= 5;
			var _nMPeriod	= 25;
			var _nLPeriod	= 75;

			this.m_nPlotLimit = _MA_PLOT_LIMIT;

			this.ParamSet = function() {
				_nSPeriod = _self.didGetPeriod(0);
				_nMPeriod = _self.didGetPeriod(1);
				_nLPeriod = _self.didGetPeriod(2);
			};

			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				//
				_self.ProcPlotS(_MA_PLOTS, nStart, nDSize, _nSPeriod);
				_self.ProcPlotS(_MA_PLOTM, nStart, nDSize, _nMPeriod);
				_self.ProcPlotS(_MA_PLOTL, nStart, nDSize, _nLPeriod);
			};
		};

		//
		// class _DOSSpanModel
		//

		var _DOSSpanModel = function() {
			var _self = this;

			// #2519
			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			var _SPANMODEL_PLOTT			= 0 ;	// PLOT
			var _SPANMODEL_PLOTB			= 1	;
			var _SPANMODEL_PLOTBG			= 2	;
			var _SPANMODEL_LIMIT			= 3	;

			var _SPANMODEL_PERIOD1			= 9;
			var _SPANMODEL_PERIOD2			= 26;
			var _SPANMODEL_PERIOD3			= 26;

			var _SPANMODEL_PARAM_NO_TENKAN	= 0;
			var _SPANMODEL_PARAM_NO_KIZUN	= 1;
			var _SPANMODEL_PARAM_NO_CHIKOU	= 2;

			var	_SPANMODEL_SHIFT			= 26;

			this.m_nPlotLimit 			= _SPANMODEL_LIMIT;

			var _nPeriod1				= _SPANMODEL_PERIOD1; // Tenkan
			var _nPeriod2				= _SPANMODEL_PERIOD2; // Kizun
			var _nPeriod3				= _SPANMODEL_PERIOD3; // Chikou

			this.ParamSet = function() {
				_nPeriod1 = _self.didGetPeriod(0);
				_nPeriod2 = _self.didGetPeriod(1);
				_nPeriod3 = _self.didGetPeriod(2);
			};

			var _ProcPlotBGSpan = function(nStart, nDSize, nCheck) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(_SPANMODEL_PLOTBG);

				var			nLimit	= _self.m_nRefSkip;
				var			nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var reg_i = 0;
				var reg_j = 0;

				var dData = 0;
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var stPrice;

						stPrice = _self.didGetReferencedBaseDataAt(reg_i, false);
						dData	= xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.close, dFactor);

						xPlot.didSetData(reg_i, true, dData);
					}
				}

				return nLimit ;
			};

			/**
				<pre>
			    process for Period Center Line ( High & Low )
				Plot = ( Highest( H, Period ) + Lowest( L, Period ) ) / 2
				</pre>
				@param[in]     nPPos		plot position
				@param[in]     nPeriod		period
			    @param[in]     nStart		data start index
				@param[in]     nDSize		full data size
				@param[in]     nCheck		extra offset
			    @return        int ( this function's limit value )
			*/
			var _ProcPlotPCL = function(nPPos, nPeriod, nStart, nDSize, nCheck) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(nPPos);

			    //===========================================================================
			    // Limit Check
			    //===========================================================================
				var nLimit	= nPeriod - 1 + nCheck + _self.m_nRefSkip ;
				var nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var		nf_cnt	= 0 ,
						ns_cnt	= 0 ;

				var		dHigh	= 0 ,
						dLow	= 0 ;

				var		nHIdx	= 0 ,
						nLIdx	= 0 ;

				var		nSIdx	= 0 ;

				var		dData	= 0 ;

				if(nOffset >= nLimit) {
					var	xDoPb	= _self.didGetReferencedPriceObject();
					for ( nf_cnt = nOffset ; nf_cnt < nDSize ; nf_cnt++ ) {
						var stPrice;

						dHigh	= -1 * xUtils.constants.default.DEFAULT_WRONG_VALUE ,
						dLow	=  1 * xUtils.constants.default.DEFAULT_WRONG_VALUE ;

						nSIdx	= nf_cnt - ( nPeriod - 1 ) ;

						var xMinMax = xDoPb.didGetMinMaxAtRange({location:nSIdx, length:nPeriod});
						if(xMinMax !== undefined && xMinMax != null) {
							dHigh = xMinMax.dHigh;
							dLow  = xMinMax.dLow;
						}

						dData	= ( dHigh + dLow ) / 2 ;

						xPlot.didSetData(nf_cnt, true, dData);
					}
				}

				return nLimit ;
			};

			this.didReceiveData = function(symbolInfo, receivedDatas) {
				_self.ReceiveData();
			};


			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				var nCheck	= 0 ;

				_ProcPlotPCL( _SPANMODEL_PLOTT   , _nPeriod1 , nStart , nDSize , nCheck ) ;
				_ProcPlotPCL( _SPANMODEL_PLOTB   , _nPeriod2 , nStart , nDSize , nCheck ) ;
				_ProcPlotBGSpan( nStart , nDSize , nCheck ) ;
			};

			/**
			 * get span(right shift)
			 * @return number
			 */
			this.didGetShifRightCount = function() {
				var nShiftCount = 0;

				if(_self.m_nMoveShift > 0) {
					nShiftCount = Math.abs(_self.m_nMoveShift);
				}

				var nPlotShiftCount = 0;

				var nCount = _self.m_arrPlots.length;
				for(var ii = 0; ii < nCount; ii++) {
					var nMoveShift = _self.didGetPlotShiftValueAt(ii);
					var nShiftRightCount = xUtils.didGetShifRightCount(nMoveShift);

					nPlotShiftCount = Math.max(nPlotShiftCount, nShiftRightCount);
				}

				nShiftCount += nPlotShiftCount;

				return(nShiftCount);
			};

			/**
			 * get span(left shift)
			 * @return number
			 */
			this.didGetShifLeftCount = function() {
				var nShiftCount = 0;

				if(_self.m_nMoveShift < 0) {
					nShiftCount = Math.abs(_self.m_nMoveShift);
				}

				var nPlotShiftCount = 0;

				var nCount = _self.m_arrPlots.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPlot = _self.m_arrPlots[ii];
					var nMoveShift = _self.didGetPlotShiftValueAt(ii);
					var nShiftLeftCount = xUtils.didGetShifLeftCount(nMoveShift);	// #1604

					nPlotShiftCount = Math.max(nPlotShiftCount, nShiftLeftCount);
				}

				nShiftCount += nPlotShiftCount;

				return(nShiftCount);
			};

			/**
			 *
			 */
			this.didGetPlotShiftValueAt = function(argNo) {
				var isIncludeToday = true;
				var nShiftOffset = 0;
				if(isIncludeToday === true) {
					nShiftOffset = 1;
				}

				if(argNo === _SPANMODEL_PLOTBG) {
					return(-1 * (_nPeriod3 - nShiftOffset));
				}
				else {
					return(0);
				}
			};

			/**
			 * get real data index by shifted
			 * @param[in] argDataIndex	data index
			 * @param[in] argPlotNo		plot number
			 * @return shifted index
			 */
			this.didGetShiftedDataIndexOfPlotAt = function(argDataIndex, argPlotNo) {
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
			};
			// [end] #2519
		};

		//
		// class _DOSHeikinAshi
		//

		var _DOSHeikinAshi = function() {
			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			var _HA_PLOT		= 0;
			var _HA_PLOT_LIMIT	= 1;

			this.m_nPlotLimit = _HA_PLOT_LIMIT;

			var _ProcPlot = function(nStart, nDSize, nCheck) {
				var dFactor = _self.didGetPriceFactor();
				var xPlot = _self.didGetPlotAt(_HA_PLOT);

				var	nPeriod	= _self.m_nPeriod;
				var	nLimit	= 1 + nCheck + _self.m_nRefSkip; // #2826
				var	nOffset	= nStart ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlot.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				var	reg_i	= 0 ;

				var	open;
				var	high;
				var	low;
				var	close;

				var	candle;

				var	nIdxC	= 0;
				var	nIdxP	= 0;

				var	kFactor	= 2 / (nPeriod + 1); // #2826
				//
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var stPriceCur;
						var stPricePre;
						nIdxC	= reg_i;
						nIdxP	= nIdxC - 1;
						if( nIdxC === nLimit ) {
							stPriceCur = _self.didGetReferencedBaseDataAt(nIdxC, false);
							stPricePre = _self.didGetReferencedBaseDataAt(nIdxP, false);

							open  = (stPricePre.open + stPricePre.high + stPricePre.low + stPricePre.close) / 4;
							high  = stPriceCur.high;
							low   = stPriceCur.low;
							close = (stPriceCur.open + stPriceCur.high + stPriceCur.low + stPriceCur.close) / 4;

							candle = {
								open : open,
								high : high,
								low  : low,
								close: close,
							};
						}
						else {
							var candlePre = xPlot.didGetDataAt(nIdxP);

							stPriceCur = _self.didGetReferencedBaseDataAt(nIdxC, false);
							stPricePre = _self.didGetReferencedBaseDataAt(nIdxP, false);

							open  = candlePre.open + kFactor *(candlePre.close - candlePre.open);
							high  = stPriceCur.high;
							low   = stPriceCur.low;
							close = (stPriceCur.open + stPriceCur.high + stPriceCur.low + stPriceCur.close) / 4;

							candle = {
								open : open,
								high : high,
								low  : low,
								close: close,
							};
						}

						//
						xPlot.didSetData(reg_i, true, candle);
					}
				}

				return(nLimit);
			};

			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				//
				_ProcPlot(nStart, nDSize, 0);
			};

			/**
			 * get point value
			 * @return point value
			 */
			this.didGetPointValue = function() {
				var xDoBasePrice = _self.m_drawWrapper.didGetReferencedPriceObject();
				var nBasePricePoint = xDoBasePrice.didGetPointValue();

				return(nBasePricePoint);
			};
		};

		//
		// class _DOSRSI_TRIPLE
		//

		var _DOSRSI_TRIPLE = function() {
			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			var	_RSI_PLOTRSI_S	= 0 ;
			var	_RSI_PLOTRSI_M	= 1 ;
			var	_RSI_PLOTRSI_L	= 2 ;

			var _RSI_PLOTG		= 3;
			var _RSI_PLOTL		= 4;

			var	_RSI_LIMIT		= 5;

			var	_RSI_PERIOD_S	= 7;
			var	_RSI_PERIOD_M	= 14;
			var	_RSI_PERIOD_L	= 42;

			this.m_nPlotLimit	= _RSI_LIMIT;
			this.m_nPrice		= xUtils.constants.keywords.price.close;

			var _nPeriodS		= _RSI_PERIOD_S;
			var _nPeriodM		= _RSI_PERIOD_M;
			var _nPeriodL		= _RSI_PERIOD_L;

			// #3069
			this.ParamSet = function() {
				_nPeriodS  = parseInt(_self.didGetParamValue(0));
				_nPeriodM  = parseInt(_self.didGetParamValue(1));
				_nPeriodL  = parseInt(_self.didGetParamValue(2));
			};
			//

			/**
			    process for Gain & Loss
			    @param[in]     nStart		data start index
				@param[in]     nDSize		full data size
				@param[in]     nCheck		extra offset
			    @return        int ( this function's limit value )
			*/
			var _ProcGL = function(nStart, nDSize, nCheck) {
				var dPointFactor = _self.didGetPointFactor();
				var dFactor = _self.didGetPriceFactor();
				var xPlotG  = _self.didGetPlotAt(_RSI_PLOTG);
				var xPlotL	= _self.didGetPlotAt(_RSI_PLOTL);

			    //===========================================================================
			    // need variable
			    //===========================================================================
			    var	nLimit	= 1 + nCheck;
				var	nOffset	= nStart ;

				var	reg_i	= 0 ;
				var	dData	= 0 ,
					dDataP	= 0 ;

				var	dGain	= 0 ;
				var	dLoss	= 0 ;

				// set invalid data
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlotG.didSetInvalidData(nOffset);
					xPlotL.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {
						var	nIdx = reg_i;
						var	nIdxP= reg_i - 1;

						var stPrice = _self.didGetReferencedBaseDataAt(nIdx , false);
						var stPriceP= _self.didGetReferencedBaseDataAt(nIdxP, false);

						dDataP = xUtils.didGetPriceValue(stPriceP, _self.m_nPrice, dFactor);
						dData  = xUtils.didGetPriceValue(stPrice , _self.m_nPrice, dFactor);
						if( dDataP < dData ) {
							dGain = dData - dDataP ;
							dLoss = 0 ;
						}
						else if( dDataP > dData ) {
							dGain = 0 ;
							dLoss = dDataP - dData ;
						}
						else {
							dGain = 0 ;
							dLoss = 0 ;
						}

						xPlotG.didSetData(reg_i, true, dGain);
						xPlotL.didSetData(reg_i, true, dLoss);
					}
				}

				return nLimit ;
			};

			// #2824
			var _ProcRSI = function(plotNoRsi, nStart, nDSize, nCheck, nPeriod) {
				var dPointFactor = _self.didGetPointFactor();
				var dFactor = _self.didGetPriceFactor();
				var xPlotG  = _self.didGetPlotAt(_RSI_PLOTG);
				var xPlotL	= _self.didGetPlotAt(_RSI_PLOTL);
				var xPlotRSI= _self.didGetPlotAt(plotNoRsi);

				//===========================================================================
			    // Limit Calc.
			    //===========================================================================
				var	nLimit	= nPeriod - 1 + nCheck;
				var	nOffset	= nStart ;

			    //===========================================================================
			    // Invalid Field set
			    //===========================================================================
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlotRSI.didSetInvalidData(nOffset);

					nOffset++ ;
				}

			    //===========================================================================
			    // need variable
			    //===========================================================================
				var	reg_i	= 0 ,
					reg_j	= 0 ;

				var	bFirst	= true ;
				var	bFast	= true ;
				var	dSumG	= 0 ,
					dSumL	= 0 ;
				var	dPreG	= 0 ,
					dPreL	= 0 ;
				var	dMAG	= 0 ,
					dMAL	= 0 ;
				var	dRS		= 0 ,
					dRSI	= 0 ;

				var	dGain	= 0 ,
					dLoss	= 0 ;

				var	dDiv	= 0 ,
					dDive	= 0 ;

				var	arrDataG= [];
				var	arrDataL= [];
				var	vInputG	;
				var	vInputL	;

				if(nOffset >= nLimit) {
					for ( reg_j = nOffset ; reg_j < nDSize ; reg_j++ ) {
						var	isValid	= true;
						dSumG		= 0;
						dSumL		= 0;

			            var	nGo		= reg_j - ( nPeriod - 1 ) ;
						var	nStop	= nGo + nPeriod ;
						for ( reg_i = nGo ; reg_i < nStop ; reg_i++ ) {
							dSumG += xPlotG.didGetDataAt(reg_i);
							dSumL += xPlotL.didGetDataAt(reg_i);
						}

						dDiv  = dSumG + dSumL;
						dDive = dSumG;

						if( 0 === dDiv ) {
							isValid	= false;
							dRSI = 0;
						}
						else {
							isValid	= true;
							dRSI = 100 * (dDive / dDiv) * dPointFactor;
						}

						//
						xPlotRSI.didSetData(reg_j, isValid, dRSI);
					}
				}

				return nLimit ;
			};
			//

			/*
				* @param[in] symbolInfo
				* @param[in] receivedDatas	data[][price type]
				*/
			this.didReceiveData = function(symbolInfo, receivedDatas) {
				_self.ReceiveData();
			};

			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				var	nCheck	= _self.m_nRefSkip ;
				nCheck		= _ProcGL	( nStart , nDSize , nCheck ) ;

				_ProcRSI( _RSI_PLOTRSI_S, nStart , nDSize , nCheck , _nPeriodS ) ;
				_ProcRSI( _RSI_PLOTRSI_M, nStart , nDSize , nCheck , _nPeriodM ) ;
				_ProcRSI( _RSI_PLOTRSI_L, nStart , nDSize , nCheck , _nPeriodL ) ;
			};
		};

		//
		// class _DOSStochastics_CFD
		//

		var _DOSStochastics_CFD = function() {
			var _self = this;

			this.prototype = new _DOSCFDBase();
			_DOSCFDBase.apply(this, arguments);

			var	_STOCH_PLOT_K			= 0	;	// %K
			var _STOCH_PLOT_D			= 1 ;	// %D
			var _STOCH_PLOT_S			= 2	;	// Slow%D
			var _STOCH_PLOT_CALC_M		= 3	;	//
			var _STOCH_PLOT_CALC_N		= 4	;	//

			var _STOCH_LIMIT			= 5 ;

			var	_STOCH_K				= 9;
			var	_STOCH_D				= 3;
			var	_STOCH_S				= 3;

			this.m_nPlotLimit			= _STOCH_LIMIT;

			var	_nKPeriod				= _STOCH_K;
			var	_nDPeriod				= _STOCH_D;
			var	_nSPeriod				= _STOCH_S;

			var	_nSlowing				= _nSPeriod;

			this.ParamSet = function() {
				_nKPeriod  = parseInt(_self.didGetParamValue(0));
				_nDPeriod  = parseInt(_self.didGetParamValue(1));
				_nSPeriod  = parseInt(_self.didGetParamValue(2));

				_nSPeriod  = Math.max(1, _nSPeriod);
				_nSlowing  = _nSPeriod;

			};

			/**
			    process for %K(Fast %K)
			    @param[in]     nStart		data start index
				@param[in]     nDSize		full data size
				@param[in]     nCheck		extra offset ( default : 0 )
			    @return        int ( this function's limit value )
			*/
			var _ProcK = function(nStart, nDSize, nCheck) {
				var dPointFactor = _self.didGetPointFactor();
				var dFactor = _self.didGetPriceFactor();
				var xPlotK  = _self.didGetPlotAt(_STOCH_PLOT_K);
				var xPlotM  = _self.didGetPlotAt(_STOCH_PLOT_CALC_M);
				var xPlotN  = _self.didGetPlotAt(_STOCH_PLOT_CALC_N);

				//===========================================================================
			    // Limit Calc.
			    //===========================================================================
			    var	nPeriod	= _nKPeriod;
				var	nLimit	= nPeriod - 1 + nCheck;
				var	nOffset	= nStart ;

				var	dHigh	= -1 * xUtils.constants.default.DEFAULT_WRONG_VALUE ,
					dLow	=  1 * xUtils.constants.default.DEFAULT_WRONG_VALUE ;

				var	dDiv	= 0 ,
					dDive	= 0 ;

				var	dClose	= 0 ;

				var	nf_cnt	= 0 ,
					ns_cnt	= 0 ;

				var	dFastK	= 0 ;

			    //===========================================================================
			    // Invalid Field set
			    //===========================================================================
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlotK.didSetInvalidData(nOffset);
					xPlotM.didSetInvalidData(nOffset);
					xPlotN.didSetInvalidData(nOffset);

					nOffset++ ;
				}

				if(nOffset >= nLimit) {
					for ( nf_cnt = nOffset ; nf_cnt < nDSize ; nf_cnt++ ) {
						var	stPrice;
						stPrice 	= _self.didGetReferencedBaseDataAt(nf_cnt, false);
						dClose		= xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.close, dFactor);

						dHigh		= -1 * xUtils.constants.default.DEFAULT_WRONG_VALUE ,
						dLow		=  1 * xUtils.constants.default.DEFAULT_WRONG_VALUE  ;

			            var	nGo		= nf_cnt - ( nPeriod - 1 ) ;
						var	nStop	= nGo	+ nPeriod ;

						for ( ns_cnt = nGo ; ns_cnt < nStop ; ns_cnt++ ) {
							stPrice = _self.didGetReferencedBaseDataAt(ns_cnt, false);
							var tempHigh = xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.high, dFactor);
							var tempLow  = xUtils.didGetPriceValue(stPrice, xUtils.constants.keywords.price.low , dFactor);
							dHigh	= Math.max ( dHigh , tempHigh ) ;
							dLow	= Math.min ( dLow  , tempLow  ) ;
						}

						dDiv	= dHigh - dLow ;
						dDive	= dClose - dLow ;

						xPlotM.didSetData(nf_cnt, true, dDiv);
						xPlotN.didSetData(nf_cnt, true, dDive);


						var isValidK = true;

						if( dDiv > 0 ) {
							isValidK = true;
							dFastK = dPointFactor * ( dDive / dDiv ) * 100 ;
						}
						else {
							isValidK = false;
							dFastK	= 0 ;
						}

						xPlotK.didSetData(nf_cnt, isValidK, dFastK);

						// console.debug("[WGC] :" + nf_cnt + " => Highest(" + dHigh + "), Lowest(" + dLow + "), Close(" + dClose + "), dDiv(" + dDiv + "), dDive(" + dDive + "), FastK(" + dFastK + ")");
					}
				}

				return nLimit ;
			};

			var _ProcD = function(nStart, nDSize, nCheck) {
				var dPointFactor = _self.didGetPointFactor();
				var dFactor = _self.didGetPriceFactor();
				var xPlotD  = _self.didGetPlotAt(_STOCH_PLOT_D);
				var xPlotM  = _self.didGetPlotAt(_STOCH_PLOT_CALC_M);
				var xPlotN  = _self.didGetPlotAt(_STOCH_PLOT_CALC_N);

				//===========================================================================
			    // Limit Calc.
			    //===========================================================================
				var	nPeriod	= _nDPeriod;
				var	nLimit	= nPeriod - 1 + nCheck ;
				var	nOffset	= nStart ;

				//===========================================================================
			    // Invalid Field set
			    //===========================================================================
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlotD.didSetInvalidData(nOffset);

					nOffset++ ;
				}

			    //===========================================================================
			    // need variable
			    //===========================================================================
				var		nf_cnt	= 0 ,
						ns_cnt	= 0 ;

				var		bFirst	= true ;
				var		bFast	= true ;
				var		dSumM	= 0 ;
				var		dSumN	= 0 ;
				var		dPreM	= 0 ;
				var		dPreN	= 0 ;
				var		dData	= 0 ;

				var		dDataM	= 0;
				var		dDataN	= 0;

				var		dMAM	= 0;
				var		dMAN	= 0;

				var		arrDataM= [];
				var		arrDataN= [];

				var		reg_j	= 0 ;
				var		reg_i	= 0 ;
				var		vInputM;
				var		vInputN;
				//
				if(nOffset >= nLimit) {
					for ( reg_i = nOffset ; reg_i < nDSize ; reg_i++ ) {

						if( bFirst || ! bFast ) {
							arrDataM = [];
							arrDataN = [];

							var		nGo		= reg_i - ( nPeriod - 1 ) ;
							var		nStop	= nGo + nPeriod ;
							for(reg_j = nGo; reg_j < nStop; reg_j++) {
								dDataM   = xPlotM.didGetDataAt(reg_j);
								dDataN   = xPlotN.didGetDataAt(reg_j);

								arrDataM.push(dDataM);
								arrDataN.push(dDataN);
							}

							vInputM = arrDataM ;
							vInputN = arrDataN ;
						}
						else {
							dDataM  = xPlotM.didGetDataAt(reg_i);
							dSumM	+= dDataM ;
							dDataM  = xPlotM.didGetDataAt(reg_i - (nPeriod - 1));
							dPreM	= dDataM ;

							dDataN  = xPlotN.didGetDataAt(reg_i);
							dSumN	+= dDataN ;
							dDataN  = xPlotN.didGetDataAt(reg_i - (nPeriod - 1));
							dPreN	= dDataN ;

							vInputM	= dPreM;
							vInputN	= dPreN;
						}

						var xSumM = xUtils.math.CalcSum(vInputM, dSumM, bFirst);
						dMAM   = xSumM.ret;
						dSumM  = xSumM.sum;

						var xSumN = xUtils.math.CalcSum(vInputN, dSumN, bFirst);
						dMAN   = xSumN.ret;
						dSumN  = xSumN.sum;

						var isValid = false;
						var	dFastD  = 0;
						if( xUtils.MCR_ISZERO( dMAM ) ) {
							if( xUtils.MCR_ISZERO( dMAN ) ) {
								isValid = true;
							}
							else {
								isValid = false;
							}

							dFastD	= 0 ;
						}
						else {
							isValid = true;

							dFastD	= dPointFactor * ( dMAN / dMAM ) * 100 ;
						}

						//
						xPlotD.didSetData(reg_i, isValid, dFastD);

						//
						bFirst	= false;
					}
				}

				return nLimit ;
			};

			var _ProcSlowD = function(nStart, nDSize, nCheck) {
				var dPointFactor = _self.didGetPointFactor();
				var dFactor = _self.didGetPriceFactor();
				var xPlotS  = _self.didGetPlotAt(_STOCH_PLOT_S);
				var xPlotD  = _self.didGetPlotAt(_STOCH_PLOT_D);

				//===========================================================================
			    // Limit Calc.
			    //===========================================================================
				var	nPeriod	= _nSPeriod;
				var	nLimit	= nPeriod - 1 + nCheck ;
				var	nOffset	= nStart ;

				//===========================================================================
			    // Invalid Field set
			    //===========================================================================
				while(nOffset < nLimit && nOffset < nDSize) {
					xPlotS.didSetInvalidData(nOffset);

					nOffset++ ;
				}

			    //===========================================================================
			    // need variable
			    //===========================================================================
				var		nf_cnt	= 0 ,
						ns_cnt	= 0 ;

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

						if( bFirst || ! bFast ) {
							arrData	= [];

							var		nGo		= reg_i - ( nPeriod - 1 ) ;
							var		nStop	= nGo + nPeriod ;
							for(reg_j = nGo; reg_j < nStop; reg_j++) {
								dData   = xPlotD.didGetDataAt(reg_j);

								arrData.push(dData);
							}

							vInput = arrData ;
						}
						else {
							dData   = xPlotD.didGetDataAt(reg_i);
							dSumL	+= 	dData ;
							dData   = xPlotD.didGetDataAt(reg_i - (nPeriod - 1));
							dPreL	= dData ;

							vInput	= dPreL;
						}

						var xMAEx = xUtils.math.CalcMAEx(vInput, dSumL, nPeriod, xUtils.math.constants.methods.simple, bFirst, bFast);
						dData = xMAEx.ma;
						dSumL = xMAEx.sum;

						//
						xPlotS.didSetData(reg_i, true, dData);

						//
						bFirst	= false;
					}
				}

				return nLimit ;
			};

			/*
				* @param[in] symbolInfo
				* @param[in] receivedDatas	data[][price type]
				*/
			this.didReceiveData = function(symbolInfo, receivedDatas) {
				_self.ReceiveData();
			};

			this.InnerProc = function(nIdx, nStart, nDSize, bReset) {
				_self.SetRefSkip(bReset);

				var	nCheck	= _self.m_nRefSkip ;
				nCheck = _ProcK( nStart , nDSize , nCheck ) ;
				nCheck = _ProcD( nStart , nDSize , nCheck ) ;
				nCheck = _ProcSlowD( nStart , nDSize , nCheck ) ;
			};
		};
		// _DOSStochastics_CFD

		//

		//
		// module
		//

		var exports = {};

		exports.didCreateSeriesInstance = function(argCode, argObjectInfo) {
			//
			//
			//
			var _dosLocal = null;

			if(argCode === xUtils.constants.indicatorCodes.BOLLINGER_BANDS_TRIPLE) {
				_dosLocal = new _DOSBollingerBandsTriple();
			}
			else if(argCode === xUtils.constants.indicatorCodes.MACD) {
				_dosLocal = new _DOSMACD();
			}
			else if(argCode === xUtils.constants.indicatorCodes.EMA_TRIPLE) {
				_dosLocal = new _DOSEMATriple();
			}
			else if(argCode === xUtils.constants.indicatorCodes.RCI) {
				_dosLocal = new _DOSRCI();
			}
			else if(argCode === xUtils.constants.indicatorCodes.ICHIMOKU_CFD) {
				_dosLocal = new _DOSIchimokuKinkouhyou_CFD();
			}
			// #1594
			else if(argCode === xUtils.constants.indicatorCodes.SMA_TRIPLE) {
				_dosLocal = new _DOSSMATriple();
			}
			else if(argCode === xUtils.constants.indicatorCodes.SPANMODEL) {
				_dosLocal = new _DOSSpanModel();
			}
			else if(argCode === xUtils.constants.indicatorCodes.BOLLINGER_BANDS_TRIPLE_SUPER) {
				_dosLocal = new _DOSBollingerBandsTriple_Super();
			}
			else if(argCode === xUtils.constants.indicatorCodes.HEIKINASHI) {
				_dosLocal = new _DOSHeikinAshi();
			}
			else if(argCode === xUtils.constants.indicatorCodes.RSI_TRIPLE) {
				_dosLocal = new _DOSRSI_TRIPLE();
			}
			else if(argCode === xUtils.constants.indicatorCodes.STOCHASTIC_CFD) {
				_dosLocal = new _DOSStochastics_CFD();
			}

			if(_dosLocal.didPrepareObject(argCode, argObjectInfo) !== true) {
				_dosLocal.didDestroy();
				//delete _dosLocal;
				_dosLocal = null;
			}

			return(_dosLocal);
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDOSeriesCFD");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOSeriesCFD"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOSeriesBase"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./canvas2DUtil"),
				require("./chartDOSeriesBase")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDOSeriesCFD",
            ['ngc/chartUtil', 'ngc/canvas2DUtil', 'ngc/chartDOSeriesBase'],
                function(xUtils, gxDc, doDosBase) {
                    return loadModule(xUtils, gxDc, doDosBase);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOSeriesCFD"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOSeriesBase"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOSeriesCFD");
})(this);
