(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc, doLsFactory, axisUnitFactory) {
	    "use strict";

	    var _exports = function() {
	        //
	        // private
	        //
	        var _self = this;

	        //
	        // properties
	        //
			this.m_chartFrame = {};
			this.m_strChartName = "";
			this.m_chartdraw = {};
			this.m_arrTrendlineObjlist = [];

			this.m_bMainChart = false;
			this.m_bPriceType = false;

			this.m_iBaseWidth = 0;
			this.m_iBaseHeight = 0;
			this.m_iBaseOriginY = 0;
			this.m_iGridWidth = 0;
			this.m_iGridHeight = 0;
			this.m_point = 2;

			this.m_canvas = {};
			this.m_canvasLY = {};
			this.m_canvasRY = {};
			this.m_context = {};
			this.m_contextLY = {};
			this.m_contextRY = {};

			this.m_memcanvas = {};
			this.m_memcontext = {};

			this.m_bSelect = false;

			this.m_drawWrapper = {};

			this.uniqueKey = null;

			this.m_nShift = 0;

			this.WIDTH = 0;
			this.HEIGHT = 0;

			// #492
			this.m_nMaxPriceSave = xUtils.constants.default.DEFAULT_WRONG_VALUE;
			this.m_nMinPriceSave = xUtils.constants.default.DEFAULT_WRONG_VALUE;
			this.m_nPriceSize = 0;

			// #687
			this.m_xScaleInfo = xUtils.scale.didCreateScaleInfo();

			//
			this.m_xAxisY = null;

	        /**
			 * initialize parameters
			 */
			this.didInitParams = function() {

			};

			this.didInitSubObjects = function(chartFrame, drawWrapper) {

			};

			this.didInitAxis = function() {
				_self.m_xAxisY = axisUnitFactory.didCreateAxisUnit(axisUnitFactory.constants.AXISY_NORMAL);
				_self.m_xAxisY.AddDO(_self);
			};

	        this.didInitVariables = function(strChartName) {
	            _self.m_bMainChart = true;
				_self.m_bPriceType = true;

				_self.m_strChartName = strChartName;
	        };

	        /*
			 *
			 */
			this.Init = function(chartFrame, strChartName, drawWrapper) {
				_self.uniqueKey = xUtils.createGuid();

				_self.m_drawWrapper = drawWrapper;
				_self.m_arrTrendlineObjlist = [];

				_self.didInitSubObjects(chartFrame, drawWrapper);

				_self.didInitAxis();

	            _self.didInitVariables(strChartName);

				_self.ReSetFrame(chartFrame);

				_self.didInitParams();
			};

			this.didGetEnvInfo = function() {
				return(_self.m_drawWrapper.m_stEnv);
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.DeslectAllTrendlines = function() {
				var nCount = _self.m_arrTrendlineObjlist.length;
				for (var ii = 0; ii < nCount; ii++) {
					_self.m_arrTrendlineObjlist[ii].m_bSelect = false;
				}
			}

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.DeslectAllRest = function() {
			}

			/**
			 * deselect all object
			 */
			this.DeselectAllObject = function() {
				_self.m_bSelect = false;

				_self.DeslectAllTrendlines();
				_self.DeslectAllRest();
			};

			/**
			 *
			 */
			this.ReSetFrame = function(chartFrame) {
				_self.m_chartFrame	= chartFrame;

				_self.m_canvas 		= chartFrame.m_canvas;
				_self.m_canvasLY 	= chartFrame.m_canvasLY;
				_self.m_canvasRY 	= chartFrame.m_canvasRY;

				_self.HEIGHT 		= chartFrame.m_canvas.height;
				_self.WIDTH 		= chartFrame.m_canvas.width;
				_self.m_context 	= chartFrame.m_context;
				_self.m_contextLY 	= chartFrame.m_contextLY;
				_self.m_contextRY 	= chartFrame.m_contextRY;

				_self.m_memcanvas 	= chartFrame.m_memcanvas;
				_self.m_memcontext 	= chartFrame.m_memcontext;

				_self.didResetMinMax();

				for(var __ii = 0; __ii < _self.m_arrTrendlineObjlist.length; __ii++) {
					_self.m_arrTrendlineObjlist[__ii].ReSetFrame(chartFrame); //
				}
			};

	        this.didClearSelfDatas = function() {
	        };

			this.didGetScaleUnit = function(isCopy) {
				if(isCopy === true) {
					return(xUtils.didClone(_self.m_xScaleInfo.current));
				}

				return(_self.m_xScaleInfo.current);
			};

			/**
			 * [description]
			 * @param  {[type]} argScaleUnit	output
			 * @return {[type]}
			 */
			this.GetScaleInfo = function(argScaleUnit) {
				if(argScaleUnit === undefined || argScaleUnit == null) {
					return;
				}

				var xScaleUnit = _self.didGetScaleUnit(true);

				argScaleUnit.minMaxScreen = xUtils.didClone(xScaleUnit.minMaxScreen);
				argScaleUnit.minMaxTotal  = xUtils.didClone(xScaleUnit.minMaxTotal );
			}

			this.didApplyScaleUnit = function(argScaleUnit) {
				if(argScaleUnit === undefined || argScaleUnit == null) {
					return;
				}

				_self.m_xScaleInfo.current.minMaxScreen.maxValue = argScaleUnit.minMaxScreen.maxValue;
				_self.m_xScaleInfo.current.minMaxScreen.minValue = argScaleUnit.minMaxScreen.minValue;
			};

	        /**
	         * clear data
	         *
	         * just clear data
	         */
	        this.didClearDatas = function() {
	            //
	    		_self.didClearSelfDatas();

				//
				_self.didResetMinMax();
	    	};

	        /**
			 * reset min and max
			 */
			this.didResetMinMax = function() {
				xUtils.scale.didResetScaleUnit(_self.m_xScaleInfo.current);
			};

	        /**
			 * if return value is true, you need to refresh screen
			 * @param[in] bFlag	true or false
			 * @return true or false
			 */
			this.didRemoveAllLineTools = function() {
				_self.didClearLineStudyObject();
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didFindSelectedLineTool = function() {
				var nObjectCount = _self.m_arrTrendlineObjlist.length;
				for(var ii = 0; ii < nObjectCount; ii++) {
					var xDoLs = _self.m_arrTrendlineObjlist[ii];
					if(xDoLs !== undefined && xDoLs != null && xDoLs.m_bSelect === true) {
						return({index:ii, ls:xDoLs});
					}
				}

				return;
			};

			this.didGetCountForAllTrenslines = function() {
				var nObjectCount = _self.m_arrTrendlineObjlist.length;
				return(nObjectCount);
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
	        this.didRemoveTargetLineTool = function(argDoLs) {
				var nObjectCount = _self.m_arrTrendlineObjlist.length;
				for(var ii = 0; ii < nObjectCount; ii++) {
					if((function(argObj){
						if(argObj !== undefined && argObj != null && argDoLs === argObj) {
							argObj.didDestroy();
							return(true);
						}

						return(false);
					})(_self.m_arrTrendlineObjlist[ii]) === true) {
						delete _self.m_arrTrendlineObjlist[ii];
						_self.m_arrTrendlineObjlist.splice(ii, 1);

						return(true);
					}
				}

				return(false);
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
	        this.didRemoveSelectedLineTool = function() {
				var nObjectCount = _self.m_arrTrendlineObjlist.length;
				for(var ii = 0; ii < nObjectCount; ii++) {
					if((function(argObj){
						if(argObj !== undefined && argObj != null && argObj.m_bSelect === true) {
							argObj.didDestroy();
							return(true);
						}

						return(false);
					})(_self.m_arrTrendlineObjlist[ii]) === true) {
						delete _self.m_arrTrendlineObjlist[ii];
						_self.m_arrTrendlineObjlist.splice(ii, 1);

						return(true);
					}
				}

				return(false);
			};

	        /**
			 * clear line study objects
			 */
			this.didClearLineStudyObject = function() {
				var nObjectCount = _self.m_arrTrendlineObjlist.length;
				for(var ii = 0; ii < nObjectCount; ii++) {
					(function(argObj){
						if(argObj !== undefined && argObj != null) {
							argObj.didDestroy();
						}
					})(_self.m_arrTrendlineObjlist[ii]);
					delete _self.m_arrTrendlineObjlist[ii];
				}

				_self.m_arrTrendlineObjlist = [];
			};

			this.didClearSubObjects = function() {

			};

	        /**
			 * call when you delete this object
			 */
			this.didDestroy = function() {
				_self.didClearLineStudyObject();
				_self.didClearSubObjects();
			};

	        /**
			 * @param[in] argLocalPosX    position x
			 * @param[in] argLocalPosY    position y
			 */
			this.didDrawSelectedMark = function(argLocalPosX, argLocalPosY) {
				var __radius = _self.m_chartFrame.didGetSelectionMarkRadius();
				var __drawCircleParam = {
					context : _self.m_context,
					pt : {
						x : argLocalPosX,
						y : argLocalPosY
					},
					radius : __radius,
					lineWeight : 1,
					lineColor : _self.m_drawWrapper.m_stEnv.System.SelectedMark.lineColor,
					fillColor : _self.m_drawWrapper.m_stEnv.System.SelectedMark.fillColor
				};

	            gxDc.Circle(__drawCircleParam);
			};

	        /**
			 * get span(right shift)
			 * @return number
			 */
			this.didGetShifRightCount = function() {
				return(0);
			};

			/**
			 * get span(left shift)
			 * @return number
			 */
			this.didGetShifLeftCount = function() {
				return(0);
			};

			/**
			 *
			 */
			this.didGetShiftValue = function() {
				return(_self.m_nShift);
			};

			/**
			 *
			 */
			this.didGetPlotShiftValueAt = function(argNo) {
				return(0);
			};

	        this.didGetPointValue = function() {
				return(this.m_point);
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

			this.didDrawDataView = function(argDtp, argDataIndex) {
				return(argDtp);
			};

			this.didDrawDataViewForSubItems = function(argDtp, argDataIndex) {
				return(argDtp);
			};


	        /**
			 * @param[in] iSeq			display line sequence
			 * @param[in] argScrPosX	local screen position x
			 */
			this.DrawDataView = function(argLineSeq, argLocalXPos) {
				// get data index
				var lineSpace = _self.m_drawWrapper.m_stEnv.System.LineSpace;
				var textSpace = _self.m_drawWrapper.m_stEnv.System.TextSpace;
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

				//_self.didDrawDataViewForSubItems(drawTextParam, dataIndex);
			};

	        /**
	         * [didDrawExtraObjects description]
	         * @return {[type]} [description]
	         */
	        this.didDrawExtraObjects = function() {
			    _self.didDrawTrendLines();
	        };

	        /**
			 * draw trend lines
			 */
			this.didDrawTrendLines = function() {
			};

			/**
			 * draw self
			 */
			this.didDrawSelf = function(posval) {
			};

	        /*
			 *
			 */
			this.DrawObj = function(bResize, bFirst, bLast, posval) {
				// self
				_self.didDrawSelf(posval);

				// trend lines
			    _self.didDrawExtraObjects();
		    }; // end draw

	        /**
	         * draw select object
			 * @param[in] posval	{XPos, YPos}
			 * @return true or false
			 */
			this.DrawSelectObj = function(posval) {
				// self
				_self.didDrawSelf(posval);

				var result = _self.m_drawWrapper.didHitTest(_self.m_memcontext, posval);

				// console.debug("[WGC] DrawSelectObj => " + result);

				//
				if(result === true) {
					_self.m_bSelect = true;
					return(true);
				}

				return(false);
			};

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @param  {[type]} hitTestTool
			 * @return {[type]}
			 */
			this.didHitTest = function(posval, hitTestTool) {
				if(hitTestTool === undefined || hitTestTool == null) {
					return(_self.DrawSelectObj(posval));
				}

				//
				hitTestTool.willBeHitTest();

				_self.didDrawSelf(posval);

				var result = hitTestTool.didHitTest();

				// TODO: [DEBUG][LOG]
				// console.debug("[WGC] didHitTest => " + result);

				hitTestTool.closeHitTest();

				if(result === true) {
					// #1927
					if(posval.__onmove__ !== true) {
						_self.m_bSelect = true;
					}
					//

					return(true);
				}

				return(false);
			};

	        /*
			 *
			 */
			this.ReceiveData = function() {
			};

	        /*
			 *
			 */
			this.ReceiveBlankData = function(iMarginGap) {
			};

	        /*
			 *
			 */
			this.ReceiveDataExt = function() {
				// TODO: remove
			};

			this.didReceiveDataExt = function() {
			};

	        /**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedRealData = function(receivedData) {

			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveRealData = function(receivedData) {
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
				return;
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
			 * Accumulate volumeのように特殊なオブジェクトに関して再計算を行う。
			 * @param  {[type]} nStart
			 * @param  {[type]} nDSize
			 * @param  {[type]} nSSize
			 * @return {[type]}
			 */
			this.didCalculateDataForExtraObject = function(nStart, nDSize, nSSize) {
				return(true);
			};

			this.didReceiveDataExt = function() {
			};

	        /**
			 * calculate min and max
			 * @param[in] argScrSIdx	current scroll position
			 * @param[in] argScrSize	screen size
			 * @param[in] argFlag		full flag
			 */
			this.didCalcMinMax = function(argScrSIdx, argScrSize, argFlag) {
			};

			/**
			 *
			 */
			this.didCalcRatioFactor = function() {
				if(_self.m_xAxisY !== undefined && _self.m_xAxisY != null) {
					_self.m_xAxisY.SetMinMax(_self);

					var base = _self.m_chartFrame.didGetBaseCoordinate();
					var xEnv = _self.didGetEnvInfo();

					_self.m_xAxisY.CalcDrawInfo(base, xEnv);
				}

				var xScaleUnit = _self.m_xScaleInfo.current;

				xUtils.scale.didCalcScaleUnit(xScaleUnit);

				if(xScaleUnit.minMaxScreen.diff <= 0)
					return false;

				var __base = _self.m_chartFrame.didGetBaseCoordinate();

				_self.m_iGridHeight = (__base.height / xScaleUnit.minMaxScreen.diff);

				// TODO: [DEBUG][LOG]
				// console.debug("[WGC] :" + _self.m_iGridHeight);

				return true;
			};

			/**
			 * get base coordinate information
			 * @return {y:, width:, height:, rh:, rv:}
			 */
			this.didGetBaseCoordinate = function() {
				var __result = this.m_chartFrame.didGetBaseCoordinate();

				__result.rv = this.m_iGridHeight;

				return(__result);
			};

	        /**
			 * get local position x from screen start index
			 * @param[in] argLocalIdx	local index
			 * @return local position
			 */
			this.GetXPos = function(argLocalIdx) {
				var __nScrXPos = _self.m_chartFrame.GetXPos(argLocalIdx);
				return(__nScrXPos);
			};

			/**
			 * get local position x from data index
			 *
			 * @param[in] dataIndex data index
			 * @return local position
			 */
	        this.GetXPosAtDataIndex = function(dataIndex) {
				return(_self.m_drawWrapper.GetXPosAtDataIndex(dataIndex));
	        };

			/**
			 * convert price to pixel position
			 * @param[in] strPrice	price
			 * @return position
			 */
			this.GetYValToPos = function(strPrice) {
				var __nPos = _self.GetYPos(strPrice);
				return __nPos;
			};

	        /**
			 * convert price to pixel position
			 * @param[in] strPrice	price
			 * @return position
			 */
			this.GetYPos = function(strPrice) {
				var xScaleUnit = _self.m_xScaleInfo.current;

				// removed by choi sunwoo at 2017.02.22 for #492
				var __base = _self.didGetBaseCoordinate();
				var __nPriceDiff = xUtils.didConvertToPrice(strPrice) - xScaleUnit.minMaxScreen.minValue;

				var __nLocalYPos = xUtils.axis.didGetLocalYPos(__base, __nPriceDiff);

				return(__nLocalYPos);
			};

			/**
			 * convert local position y to price
			 * @param[in] argLocalPosY local position
			 * @return price
			 */
	        this.GetYPosToVal = function(argLocalPosY) {
	        	var __xVci = _self.didGetVerticalConvertInfo(argLocalPosY);

				// #1105
				var __nPrice = xUtils.didRoundPrice(__xVci.min + __xVci.offset * __xVci.ratioPv);
				//var __nPrice = Math.round/*parseInt*/(__xVci.min + __xVci.offset * __xVci.ratioPv);

	            return(__nPrice);
	        };

			// #2038
			this.GetYPixelToVal = function(argOffset) {
	        	var __xVci = _self.didGetVerticalConvertInfo(0);
				var __nPrice = xUtils.didRoundPrice(argOffset * __xVci.ratioPv);

	            return(__nPrice);
	        };

	        /**
			 * @param[in] iXPos	screen position
			 */
			this.GetXIndex = function(iXPos) {
				var __nIndex = _self.m_drawWrapper.GetXIndex(iXPos);
				return(__nIndex);
			};

	        /**
			 * get vertical converting informatioin
			 * @return {min, max, size, ratioVp, ratioPv}
			 */
			this.didGetVerticalConvertInfo = function(argLocalPosY) {
				var xScaleUnit = _self.m_xScaleInfo.current;

				var __result = {
					min : xScaleUnit.minMaxScreen.minValue,
					max : xScaleUnit.minMaxScreen.maxValue,
					size : xUtils.scale.didCalcDiff(xScaleUnit.minMaxScreen.maxValue, xScaleUnit.minMaxScreen.minValue),
					offset : 0,
					ratioPv : 0,
					ratioVp : 0
				};

				var __base = _self.m_chartFrame.didGetBaseCoordinate();

				if(argLocalPosY !== undefined) {
					__result.offset = __base.height + __base.y - argLocalPosY;
				}

				__result.ratioPv = __base.height !== 0 ? __result.size / __base.height : 0;
				__result.ratioVp = __result.size !== 0 ? __base.height / __result.size : 0;

				return(__result);
			};

	        /**
			 *
			 */
			this.didGetPanelWidth = function() {
				return(_self.m_chartFrame.didGetPanelRect().width);
			};

			/**
			 *
			 */
			this.didGetPanelHeight = function() {
				return(_self.m_chartFrame.didGetPanelRect().height);
			};

			/**
			 *
			 */
			this.didGetPanelHalfWidth = function() {
				return(Math.round(_self.m_chartFrame.didGetPanelRect().width / 2));
			};

			/**
			 *
			 */
			this.didGetPanelHalfHeight = function() {
				return(Math.round(_self.m_chartFrame.didGetPanelRect().height / 2));
			};

			/**
			 *
			 */
			this.didGetPanelRect = function() {
				return(_self.m_chartFrame.didGetPanelRect());
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
			 * [description]
			 * @param  {[type]} lsName		name
			 * @param  {[type]} posval		{XPos:0, YPos:0}
			 * @param  {[type]} argLoadINfo	load information
			 * @return {[type]}
			 */
			this.didCreateTrendlineObj = function(lsName, posval, argLoadINfo, skipStore) { // #1516
				if(_self.m_drawWrapper.hasTimeDatas() !== true) {
					return;
				}

	            var __doLs = doLsFactory.didCreateLineStudyInstance(lsName, argLoadINfo);
	            if(__doLs === undefined || __doLs == null) {


	                return;
	            }

				var xScaleUnit = _self.m_xScaleInfo.current;

				//
				// #717
				// add argLoadInfo
				if(__doLs.didInitObject(_self.m_chartFrame, lsName, posval, xScaleUnit.minMaxScreen.maxValue, xScaleUnit.minMaxScreen.minValue, _self.m_drawWrapper, _self, argLoadINfo) !== true) {
					__doLs.didDestroy();
					__doLs = null;

					return;
				}

				// #1516
				if(skipStore !== true) {
					_self.m_arrTrendlineObjlist.push(__doLs);
				}

				return(__doLs);
			};

	        /**
			 * get data size
			 * @returns number
			 */
			this.didGetDataSize = function() {
	            return(0);
	        };

			this.didGetMinMaxAtRange = function(range) {

			};

			/**
			 * get price data
			 * @return array
			 */
			this.didGetReferencedPriceObject = function() {
				return(_self.m_drawWrapper.didGetReferencedPriceObject());
			};

	        //
	        //
	        //

	        /*
			 *
			 */
			this.DrawLine = function(stStyle) {
				stStyle.context.beginPath();
				stStyle.context.moveTo(stStyle.startX, stStyle.startY);
				stStyle.context.lineTo(stStyle.endX, stStyle.endY);
				stStyle.context.lineWidth = stStyle.lineWidth;
				// m_context.globalAlpha=1.0;
				stStyle.context.strokeStyle = stStyle.lineColor;
				stStyle.context.stroke();
			};

	        /*
			 *
			 */
			this.DrawRectangle = function(stStyle) {
				stStyle.context.beginPath();
				stStyle.context.rect(stStyle.rectX, stStyle.rectY, stStyle.rectW, stStyle.rectH);
				// m_context.globalAlpha=1.0;
				stStyle.context.fillStyle = stStyle.fillColor;
				stStyle.context.fill();
				stStyle.context.lineWidth = stStyle.lineWidth;
				stStyle.context.strokeStyle = stStyle.lineColor;
				stStyle.context.stroke();
			};

	        /*
			 *
			 */
			this.DrawCurveCircle = function(stStyle) {
				var kappa = 0.5522848,
				ox = (stStyle.rectW / 2) * kappa, // control point offset
													// horizontal
				oy = (stStyle.rectH / 2) * kappa, // control point offset vertical
				xe = stStyle.rectX + stStyle.rectW,           // x-end
				ye = stStyle.rectY + stStyle.rectH,           // y-end
				xm = stStyle.rectX + stStyle.rectW / 2,       // x-middle
				ym = stStyle.rectY + stStyle.rectH / 2;       // y-middle
				stStyle.context.beginPath();
				stStyle.context.moveTo(stStyle.rectX, ym);
				stStyle.context.bezierCurveTo(stStyle.rectX, ym - oy, xm - ox, stStyle.rectY, xm, stStyle.rectY);
				stStyle.context.bezierCurveTo(xm + ox, stStyle.rectY, xe, ym - oy, xe, ym);
				stStyle.context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
				stStyle.context.bezierCurveTo(xm - ox, ye, stStyle.rectX, ym + oy, stStyle.rectX, ym);
				stStyle.context.lineWidth = stStyle.lineWidth;
				stStyle.context.strokeStyle = stStyle.lineColor;
				// stStyle.context.closePath();
				stStyle.context.stroke();
			};

	        /*
			 *
			 */
			this.DrawSelectCircle = function(stStyle) {
				stStyle.context.beginPath();
				// stStyle.context.globalAlpha=0.5;
				stStyle.context.arc(stStyle.iLeft, stStyle.iTop, stStyle.iRadius, 0, 2 * Math.PI, true);
				stStyle.context.fillStyle = stStyle.fillColor;
				stStyle.context.fill();
				stStyle.context.lineWidth = stStyle.lineWidth;
				stStyle.context.strokeStyle = stStyle.lineColor;
				stStyle.context.stroke();
			};

	        /*
			 *
			 */
			this.DrawText = function(stStyle) {
				stStyle.context.save();
				if(stStyle.fillColor !== undefined && stStyle.fillColor != null) {
					stStyle.context.fillStyle = stStyle.fillColor;
				}
				stStyle.context.fillText(stStyle.text, stStyle.left, stStyle.top);
				stStyle.context.restore();
			};

	        this.DrawPolyGon = function(stStyle) {
					stStyle.context.beginPath();
					stStyle.context.globalAlpha = 0.5;
				stStyle.context.moveTo(stStyle.iXPos0, stStyle.iYPos0);
				stStyle.context.lineTo(stStyle.iXPos1, stStyle.iYPos1);
				stStyle.context.lineTo(stStyle.iXPos2, stStyle.iYPos2);
				stStyle.context.lineTo(stStyle.iXPos3, stStyle.iYPos3);
				// stStyle.context.closePath();
				stStyle.context.fillStyle = stStyle.fillColor;
				stStyle.context.fill();
				stStyle.context.strokeStyle = stStyle.lineColor;
				stStyle.context.stroke();
				stStyle.context.globalAlpha = 1.0;
			};


			//
			//
			//
			this.didGetPropMinMaxVal = function() {

			};

			/**
			 * [description]
			 * @param  {[type]} argSettings
			 * @return {[type]}
			 */
			this.didApplySetting = function(argSettings) {
			};

			// #717

			/**
			 * [description]
			 * @param  {[type]} argLoadInfo
			 * @return {[type]}
			 */
			this.didSetLoadInfoForTheLineTools = function(argLoadInfo) {
				return(false);
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didGetSaveInfoOfTheLineTools = function() {

			};
			//

			// #758

			/**
			 * [description]
			 * @param  {Boolean} isSimple
			 * @return {[type]}
			 */
			this.didGetDisplayTitle = function(isSimple) {
				var strTitle = _self.m_strChartName;

				return(strTitle);
			};

			/**
			 * draw data in position of the crossline
			 * @param[in] pt			{x, y}
			 * @param[in] argDataIndex	data index
			 */
			this.didGetDataViewDataAtPos = function(argLocalXPos) {
			};

			//
			//
			//
			this.GetAxisInfo = function() {
				return;
			};
	    };

	    return(_exports);
	};

	//console.debug("[MODUEL] Loading => chartDOContainerBase");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOContainerBase"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOLineStudies"],
				global["WGC_CHART"]["chartAxisUnit"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./canvas2DUtil"),
				require("./chartDOLineStudies"),
				require("./chartAxisUnit")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDOContainerBase",
            ['ngc/chartUtil', 'ngc/canvas2DUtil', 'ngc/chartDOLineStudies', 'ngc/chartAxisUnit'],
                function(xUtils, gxDc, doLsFactory, axisUnitFactory) {
                    return loadModule(xUtils, gxDc, doLsFactory, axisUnitFactory);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOContainerBase"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOLineStudies"],
				global["WGC_CHART"]["chartAxisUnit"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOContainerBase");
})(this);
