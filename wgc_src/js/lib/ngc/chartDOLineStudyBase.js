(function(global){
	"use strict";

	var loadModule = function(gxDc, xUtils) {
	    "use strict";

		/**
		 * @class CChartTrendlineObj
		 *
		 */
		var _exports = function() {
			//
			//
			//
			var _self = this;

			this.m_doParent = undefined;
			this.m_chartFrame = {};
			this.m_strTrendlineName = "";
			this.m_chartdraw = {};

			this.m_arrData = [];
			this.m_posSelectVal = {};

			this.m_xData1 = {
				curPos: {
					x: 0,
					y: 0
				},
				prePos: {
					x: 0,
					y: 0
				},
				curValue: {
					x: 0,
					t: 0,
					y: 0
				}
			};

			this.m_xData2 = {
				curPos: {
					x: 0,
					y: 0
				},
				prePos: {
					x: 0,
					y: 0
				},
				curValue: {
					x: 0,
					t: 0,
					y: 0
				}
			};

			this.m_xData3 = {
				curPos: {
					x: 0,
					y: 0
				},
				prePos: {
					x: 0,
					y: 0
				},
				curValue: {
					x: 0,
					t: 0,
					y: 0
				}
			};

			this.m_iSelectGubun = 0;

			this.m_iBaseWidth = 0;
			this.m_iBaseHeight = 0;
			this.m_iBaseOriginY = 0;

			this.m_canvas = {};
			this.m_context = {};

			this.m_memcanvas = {};
			this.m_memcontext = {};

			this.m_bSelect = false;

			// Drawing Area
			this.WIDTH = 0;
			this.HEIGHT = 0;

			// Style
			this.m_nLineStyle	= xUtils.constants.trendLineDefault.lineStyle;	/// SOLID
			this.m_nLineWeight	= xUtils.constants.trendLineDefault.lineWeight;
			this.m_clrLineColor = xUtils.constants.trendLineDefault.lineColor;
			this.m_clrFillColor = xUtils.constants.trendLineDefault.fillColor;
			this.m_clrFontColor = xUtils.constants.trendLineDefault.lineColor;

			this.m_clrHitTestColor = xUtils.hitTest.config.color;

			//
			this.m_bCreating = true;

			//
			this.m_bExtraPoint= false;

			//
			this.m_drawWrapper = null;
			//

			this.uniqueKey = null;

			// #1558
			this.m_nRemainCount = 0;
			this.didInitRemainCount = function() {
				_self.m_nRemainCount = 2;
			};
			this.didProcForRemainCount = function(isSet) {
				if(isSet === true) {
					_self.m_nRemainCount--;

					if(_self.m_nRemainCount < 0) {
						_self.m_nRemainCount = 0;
					}
				}
			};
			this.didInitExtraPoint = function() {
				_self.m_bExtraPoint = false;
			};
			//

			// #1516
			this.m_bHide = false;
			this.m_bNonTouch = false;
			this.didSetState = function(state) {

			};
			//

			/**
			 * init object
			 * @param  {object} chartFrame		panel
			 * @param  {string} strTrendline	trendline type name
			 * @param  {object} posval			position value
			 * @param  {number} iMaxPrice		max
			 * @param  {number} iMinPrice		min
			 * @param  {object} drawWrapper		layout
			 * @param  {object} doParent		parent
			 * @param  {object} argLoadInfo		load information
			 * @return {boolean}
			 */
			this.didInitObject = function(chartFrame, strTrendline, posval, iMaxPrice, iMinPrice, drawWrapper, doParent, argLoadInfo) {
				_self.uniqueKey = xUtils.createGuid();

				//
				_self.m_drawWrapper = drawWrapper;
				_self.m_doParent = doParent;

				//
				_self.ReSetFrame(chartFrame);

				_self.m_strTrendlineName = strTrendline;

				_self.didInitRemainCount();
				_self.didInitExtraPoint();
				// if(strTrendline === xUtils.constants.trendLineCodes.triangle) {
				// 	_self.m_bExtraPoint = true;
				// }

				_self.ReceiveData();
				_self.SetBaseSize();

				// #717
				if(argLoadInfo) {
					if(argLoadInfo.isAdd === true) {
						_self.didSetLoadInfo(argLoadInfo);
					}
					else {
						if(_self.didSetLoadInfo(argLoadInfo) !== true) {
							return(false);
						}

						return(true);
					}
				}

				_self.SetStartPoint(posval, true);
				_self.SetLastPoint(posval, true);

				return(true);
			};

			/**
			 * call when you delete this object
			 */
			this.didDestroy = function() {
				_self.m_doParent = {};
				_self.m_chartFrame = {};
				_self.m_chartdraw = {};

				_self.m_arrData = [];
				_self.m_posSelectVal = {};

				_self.m_canvas = {};
				_self.m_context = {};

				_self.m_memcanvas = {};
				_self.m_memcontext = {};

				//
				_self.m_drawWrapper = null;
			};

			this.didGetEnvInfo = function() {
				return(_self.m_doParent.didGetEnvInfo());
			};

			/**
			 *
			 */
			this.ReSetFrame = function(chartFrame) {
				_self.m_chartFrame = chartFrame;

				_self.m_canvas = chartFrame.m_canvas;

				_self.HEIGHT = chartFrame.m_canvas.height;
				_self.WIDTH = chartFrame.m_canvas.width;
				_self.m_context = chartFrame.m_context;

				_self.m_memcanvas = chartFrame.m_memcanvas;
				_self.m_memcontext = chartFrame.m_memcontext;
			};

	        /**
	         * [_didHitTest description]
	         * @param  {object} posval {XPos, YPos}
	         * @return {object} object or undefined
	         */
	        var _didHitTest = function(posval) {
				var imageData;
				var xPosMargined = _self.m_chartFrame.GetRelativePostionX(posval.XPos);
	            //
				var yPosMargined = _self.m_chartFrame.GetRelativePostionY(posval.YPos, posval.YPosAdjusted);
				for (var i = -2; i <= 2; i++) {
					for (var j = -3; j <= 2; j++) {
						imageData = _self.m_memcontext.getImageData(
							xPosMargined + i, yPosMargined + j, 1, 1
							);

						if (imageData.data[3] > 0) {
							if (((xPosMargined) > (_self.m_xData1.curPos.x - 3)) && ((xPosMargined) < (_self.m_xData1.curPos.x + 3)) && ((yPosMargined) > (_self.m_xData1.curPos.y - 3)) && ((yPosMargined) < (_self.m_xData1.curPos.y + 3))) {
								_self.m_iSelectGubun = 1;
	                        }
							else if (((xPosMargined) > (_self.m_xData2.curPos.x - 3)) && ((xPosMargined) < (_self.m_xData2.curPos.x + 3)) && ((yPosMargined) > (_self.m_xData2.curPos.y - 3)) && ((yPosMargined) < (_self.m_xData2.curPos.y + 3))) {
								_self.m_iSelectGubun = 2;
	                        }
							else if (_self.m_bExtraPoint && ((xPosMargined) > (_self.m_xData3.curPos.x - 3)) && ((xPosMargined) < (_self.m_xData3.curPos.x + 3)) && ((yPosMargined) > (_self.m_xData3.curPos.y - 3)) && ((yPosMargined) < (_self.m_xData3.curPos.y + 3))) {
								_self.m_iSelectGubun = 3;
	                        }
							else {
								_self.m_iSelectGubun = 0;
	                        }

							_self.m_posSelectVal = posval;
							_self.m_xData1.prePos.x = _self.m_xData1.curPos.x;
							_self.m_xData1.prePos.y = _self.m_xData1.curPos.y;
							_self.m_xData2.prePos.x = _self.m_xData2.curPos.x
							_self.m_xData2.prePos.y = _self.m_xData2.curPos.y;

							//
							_self.m_xData3.prePos.x = _self.m_xData3.curPos.x;
							_self.m_xData3.prePos.y = _self.m_xData3.curPos.y;
							//

							// #1927
							if(posval.__onmove__ !== true) {
								_self.m_bSelect = true;
							}
							//

							return(_self);
						}
					}
				}
	        };

	        /**
	         * [didDrawObj description]
	         * @param  {[type]} posval [description]
	         * @return {[type]}        [description]
	         */
	        this.didDrawObj = function(posval, extraDrawParam) {
				var bHitTest = false;
				if(posval !== undefined && posval != null) {
					bHitTest = true;
				}

				// #1516
				if(_self.m_bHide !== true) {
            		_self.didDrawSelf(bHitTest, extraDrawParam);
				}
				//

	            if(bHitTest === true) {
					// #1516
					if(_self.m_bNonTouch) {
						return;
					}
					//

	                return(_didHitTest(posval, extraDrawParam));
	            }
	        };

			var _didCheckVertexPoint = function(posval, posvalAdjusted) {
				// #2305
				var hitBoxSize = 3;
				try {
					hitBoxSize = Math.max(hitBoxSize, xUtils.hitTest.config.size);
				}
				catch(e) {
					console.warn(e);
				}
				//

				var xPosMargined = posvalAdjusted.XPos;
				var yPosMargined = posvalAdjusted.YPos;

				// #2305
				if (((xPosMargined) > (_self.m_xData1.curPos.x - hitBoxSize)) && ((xPosMargined) < (_self.m_xData1.curPos.x + hitBoxSize)) && ((yPosMargined) > (_self.m_xData1.curPos.y - hitBoxSize)) && ((yPosMargined) < (_self.m_xData1.curPos.y + hitBoxSize))) {
					_self.m_iSelectGubun = 1;
				}
				else if (((xPosMargined) > (_self.m_xData2.curPos.x - hitBoxSize)) && ((xPosMargined) < (_self.m_xData2.curPos.x + hitBoxSize)) && ((yPosMargined) > (_self.m_xData2.curPos.y - hitBoxSize)) && ((yPosMargined) < (_self.m_xData2.curPos.y + hitBoxSize))) {
					_self.m_iSelectGubun = 2;
				}
				else if (_self.m_bExtraPoint && ((xPosMargined) > (_self.m_xData3.curPos.x - hitBoxSize)) && ((xPosMargined) < (_self.m_xData3.curPos.x + hitBoxSize)) && ((yPosMargined) > (_self.m_xData3.curPos.y - hitBoxSize)) && ((yPosMargined) < (_self.m_xData3.curPos.y + hitBoxSize))) {
					_self.m_iSelectGubun = 3;
				}
				else {
					_self.m_iSelectGubun = 0;
				}
				//

				_self.m_posSelectVal    = posval;
				_self.m_xData1.prePos.x = _self.m_xData1.curPos.x;
				_self.m_xData1.prePos.y = _self.m_xData1.curPos.y;
				_self.m_xData2.prePos.x = _self.m_xData2.curPos.x
				_self.m_xData2.prePos.y = _self.m_xData2.curPos.y;

				//
				_self.m_xData3.prePos.x = _self.m_xData3.curPos.x;
				_self.m_xData3.prePos.y = _self.m_xData3.curPos.y;
				//
			};

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @param  {[type]} hitTestTool
			 * @return {[type]}
			 */
			this.didHitTest = function(posval, hitTestTool, extraDrawParam) {
				//
				hitTestTool.willBeHitTest();

				_self.didDrawSelf(true, extraDrawParam);

				var isHit = hitTestTool.didHitTest();
				var result;
				if(isHit === true) {
					_didCheckVertexPoint(posval, hitTestTool.m_posvalHit);

					// #1927
					if(posval.__onmove__ !== true) {
						_self.m_bSelect = true;
					}
					//

					result = _self;
				}

				hitTestTool.closeHitTest();

				return(result);
			};

			/**
			 *
			 *
			 * @param {any} bHitTest
			 */
			this.didDrawSelectedMark = function(bHitTest, onepointInfo) {
				if(bHitTest !== true) {
					var pts = [];

					if(onepointInfo === undefined || onepointInfo == null) {
						pts.push({x:_self.m_xData1.curPos.x, y:_self.m_xData1.curPos.y});
						pts.push({x:_self.m_xData2.curPos.x, y:_self.m_xData2.curPos.y});
					}
					else {
						if(onepointInfo.targets) {
							var nCount = onepointInfo.targets.length;
							for(var ii = 0; ii < nCount; ii++) {
								pts.push(xUtils.didClone(onepointInfo.targets[ii]));
							}
						}
						else {
							if(onepointInfo.isVert === true) {
								pts.push({x:_self.m_xData1.curPos.x, y:_self.didGetPanelHalfHeight()});
							}
							else if(onepointInfo.isHorz === true) {
								pts.push({x:_self.didGetPanelHalfWidth(), y:_self.m_xData1.curPos.y});
							}
							else if(onepointInfo.isVertex === true) {
								pts.push({x:_self.m_xData1.curPos.x, y:_self.m_xData1.curPos.y});
							}
							else {
								pts.push({x:_self.didGetPanelHalfWidth(), y:_self.didGetPanelHalfHeight()});
							}
						}
					}

					if(_self.m_bExtraPoint === true) {
						pts.push({x:_self.m_xData3.curPos.x, y:_self.m_xData3.curPos.y});
					}

					// draw selection mark
					_self.DrawSelectionMark(pts);
				}
			};

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {

	        };

			/**
				hit test for the all line-study object
				@param[in]	posval 	useless
				@return	object to be hit
				*/
			this.DrawSelectObj = function(posval) {
				return(_self.didDrawObj(posval));
			};


			/**
			 *
			 *
			 * @param {any} iMaxPrice
			 * @param {any} iMinPrice
			 * @param {any} posval
			 */
			this.DrawObj = function(iMaxPrice, iMinPrice, posval) {
				var bHitTest = false;
				if(posval !== undefined && posval != null) {
					bHitTest = true;
				}

				_self.SetBaseSize();

	            _self.didDrawObj(posval);

			}; // end draw

			this.ReceiveData = function() {
				// do nothing
			};

			this.SetBaseSize = function() {
				return true;
			};

			/**
			 * get local position x from screen index
			 * @param[in] iIndex	screen index
			 * @return local position
			 */
			this.GetXPos = function(iIndex) {
				var __nScrXPos = _self.m_drawWrapper.GetXPos(iIndex);

				return(__nScrXPos);
			};

			/**
			 * convert price to pixel position
			 */
			this.GetYPos = function(strPrice) {
				//
				// use parent's method as Y Axis
				//
				var __nScrYPos = _self.m_doParent.GetYPos(strPrice);

				return(__nScrYPos);
			};

			/**
			 *
			 */
			this.GetXValToPos = function(strXVal, tickNo) {
				var __scrIdx = _self.m_drawWrapper.didGetIndexOfTime(strXVal, tickNo, true, true);
				return _self.GetXPos(__scrIdx);
			};

			/**
			 * convert value
			 */
			this.GetXPosToVal = function(argLocalXPos) {
				var __dateTime = _self.m_drawWrapper.didGetTimedataAtPos(argLocalXPos, true, true);

				// console.debug("[WGC] :" + 'LS:GetXPosToVal => ' + argLocalXPos + ', ' + __dateTime);

				return(__dateTime);
				/*
				var __stPrice = _self.m_drawWrapper.GetBaseDataAtPos(iXPos, true);

				var strXVal = '';
				if(__stPrice !== undefined && __stPrice != null) {
					strXVal = String(__stPrice.ymd) + String(__stPrice.hms);
				}

				return strXVal;
				*/
			};

			/**
			 *
			 */
			this.GetYValToPos = function(iPrice) {
				var __nPos = _self.GetYPos(iPrice);
				return __nPos;
			};

			/**
			 *
			 */
			this.GetYPosToVal = function(iYPos, notUseRaw) {
				var __nPrice = _self.m_doParent.GetYPosToVal(iYPos);

				// for #1094
				if(notUseRaw === true) {
					__nPrice =  xUtils.axis.didAdjustZFValue(__nPrice, true);
				}

				return(__nPrice);
			};

			/**
				@param[in]	pts 	points({x:value, y:value}[])
				@return	void
				*/
			this.DrawSelectionMark = function(pts) {
				//
				// draw only in status selected
				//
				if (_self.m_bSelect) {
					// #1518
					var xEnv = _self.didGetEnvInfo();

					var __radius = _self.m_chartFrame.didGetSelectionMarkRadius();
					var __drawCircleParam = {
						context : _self.m_context,
						pt : {
							x : 0,
							y : 0
						},
						radius : __radius,
						lineWeight : 1,
						lineColor : xEnv.System.SelectedMark.lineColor,
						fillColor : xEnv.System.SelectedMark.fillColor
					};

					var ii = 0;
					for(ii in pts) {
						var pt = pts[ii];
						__drawCircleParam.pt.x = pt.x;
						__drawCircleParam.pt.y = pt.y;

						gxDc.Circle(__drawCircleParam);
					}
					// [end] #1518
				}
			};

			/**
			 *
			 */
			this.SetStartPoint = function(posval, isSet) {
				var __posInPanel = _self.m_chartFrame.GetRelativePositionInPanel(posval.XPos, posval.YPos);

				_self.m_xData1.curPos.x = __posInPanel.x.pos;
				_self.m_xData1.curPos.y = __posInPanel.y;

				var xTimeData;
				xTimeData = _self.GetXPosToVal(_self.m_xData1.curPos.x);
				if(xTimeData !== undefined && xTimeData != null) {
					_self.m_xData1.curValue.x = xTimeData.dateTime;
					_self.m_xData1.curValue.t = xTimeData.tickNo;
				}
				_self.m_xData1.curValue.y = _self.GetYPosToVal(_self.m_xData1.curPos.y);

				// #1558
				_self.didProcForRemainCount();
			};

			/**
			 * set last point
			 * @param[in] posval	{x, y}
			 */
			this.SetLastPoint = function(posval, isSet) {
				// get local position
				var __posInPanel = _self.m_chartFrame.GetRelativePositionInPanel(posval.XPos, posval.YPos);

				// set adjusted position
				_self.m_xData2.curPos.x = _self.m_chartFrame.SetXPosition(__posInPanel.x);
				_self.m_xData2.curPos.y = __posInPanel.y;

				//console.debug("SetLastPoint3(" + _self.m_xData2.curPos.x + ", " + _self.m_xData2.curPos.y + ")");

				var xTimeData;

				xTimeData = _self.GetXPosToVal(_self.m_xData2.curPos.x);
				if(xTimeData !== undefined && xTimeData != null) {
					_self.m_xData2.curValue.x = xTimeData.dateTime;
					_self.m_xData2.curValue.t = xTimeData.tickNo;
				}

				_self.m_xData2.curValue.y = _self.GetYPosToVal(_self.m_xData2.curPos.y);

				// #1558
				_self.didProcForRemainCount();
			};

			/**
			 * @param[in]	posval 	new point({XPos:value, YPos:value})
			 * */
			this.SetMovePoint = function(posval) {
				//
				var xPosNew = _self.m_chartFrame.GetRelativePostionX(posval.XPos);
				var xPosOld = _self.m_chartFrame.GetRelativePostionX(_self.m_posSelectVal.XPos);

				var xIdx = _self.GetXIndex(xPosNew) - _self.GetXIndex(xPosOld);

				var yIdx = (posval.YPos - _self.m_posSelectVal.YPos);

				var iSIdx = _self.GetXIndex(_self.m_xData1.prePos.x) + xIdx;
				var iEIdx = _self.GetXIndex(_self.m_xData2.prePos.x) + xIdx;

				var indexes = [iSIdx, iEIdx];
				var iExtraIdx = 0;
				if(_self.m_bExtraPoint) {
					iExtraIdx = _self.GetXIndex(_self.m_xData3.prePos.x) + xIdx;
					indexes.push(iExtraIdx);
				}

				var xTimeData;

				if(!_self.m_drawWrapper.IsOuterIndexes(indexes)) {
					// 1
					_self.m_xData1.curPos.x   = _self.m_drawWrapper.GetXPosAtDataIndex(iSIdx);

					xTimeData = _self.GetXPosToVal(_self.m_xData1.curPos.x);
					if(xTimeData !== undefined && xTimeData != null) {
						_self.m_xData1.curValue.x = xTimeData.dateTime;
						_self.m_xData1.curValue.t = xTimeData.tickNo;
					}

					// 2
					_self.m_xData2.curPos.x   = _self.m_drawWrapper.GetXPosAtDataIndex(iEIdx);

					xTimeData = _self.GetXPosToVal(_self.m_xData2.curPos.x);
					if(xTimeData !== undefined && xTimeData != null) {
						_self.m_xData2.curValue.x = xTimeData.dateTime;
						_self.m_xData2.curValue.t = xTimeData.tickNo;
					}

					// 3
					if(_self.m_bExtraPoint) {
						_self.m_xData3.curPos.x   = _self.m_drawWrapper.GetXPosAtDataIndex(iExtraIdx);

						xTimeData = _self.GetXPosToVal(_self.m_xData3.curPos.x);
						if(xTimeData !== undefined && xTimeData != null) {
							_self.m_xData3.curValue.x = xTimeData.dateTime;
							_self.m_xData3.curValue.t = xTimeData.tickNo;
						}
					}

					// console.debug("[WGC] :" + _self.m_xData1.curValue);
					// console.debug("[WGC] :" + _self.m_xData2.curValue);
				}
				else {
					// 1
					_self.m_xData1.curPos.x   = _self.m_drawWrapper.GetXPosAtDataIndex(iSIdx);

					xTimeData = _self.GetXPosToVal(_self.m_xData1.curPos.x);
					if(xTimeData !== undefined && xTimeData != null) {
						_self.m_xData1.curValue.x = xTimeData.dateTime;
						_self.m_xData1.curValue.t = xTimeData.tickNo;
					}

					// 2
					_self.m_xData2.curPos.x   = _self.m_drawWrapper.GetXPosAtDataIndex(iEIdx);

					xTimeData = _self.GetXPosToVal(_self.m_xData2.curPos.x);
					if(xTimeData !== undefined && xTimeData != null) {
						_self.m_xData2.curValue.x = xTimeData.dateTime;
						_self.m_xData2.curValue.t = xTimeData.tickNo;
					}

					// 3
					if(_self.m_bExtraPoint) {
						_self.m_xData3.curPos.x   = _self.m_drawWrapper.GetXPosAtDataIndex(iExtraIdx);

						xTimeData = _self.GetXPosToVal(_self.m_xData3.curPos.x);
						if(xTimeData !== undefined && xTimeData != null) {
							_self.m_xData3.curValue.x = xTimeData.dateTime;
							_self.m_xData3.curValue.t = xTimeData.tickNo;
						}
					}

					// console.debug("[WGC] :" + _self.m_xData1.curValue);
					// console.debug("[WGC] :" + _self.m_xData2.curValue);
				}

				var __frameArea = _self.m_chartFrame.didGetPanelRect();

				_self.m_xData1.curPos.y = _self.m_xData1.prePos.y + yIdx - __frameArea.top;
				_self.m_xData1.curValue.y = _self.GetYPosToVal(_self.m_xData1.curPos.y);
				_self.m_xData2.curPos.y = _self.m_xData2.prePos.y + yIdx - __frameArea.top;
				_self.m_xData2.curValue.y = _self.GetYPosToVal(_self.m_xData2.curPos.y);

				if(_self.m_bExtraPoint) {
					_self.m_xData3.curPos.y = _self.m_xData3.prePos.y + yIdx - __frameArea.top;
					_self.m_xData3.curValue.y = _self.GetYPosToVal(_self.m_xData3.curPos.y);
				}
			};

			/**
			 * set extra point(for 3points object)
			 * @param[in] posval	{XPos:, YPos:}
			 */
			this.SetExtraPoint = function(posval, isSet) {
				//
				// #476
				//
				if(posval !== undefined && posval != null) {
					//
					var __posInPanel = _self.m_chartFrame.GetRelativePositionInPanel(posval.XPos, posval.YPos);
					_self.m_xData3.curPos.x = _self.m_chartFrame.SetXPosition(__posInPanel.x);
					_self.m_xData3.curPos.y = __posInPanel.y;

					var xTimeData;

					xTimeData = _self.GetXPosToVal(_self.m_xData3.curPos.x);
					if(xTimeData !== undefined && xTimeData != null) {
						_self.m_xData3.curValue.x = xTimeData.dateTime;
						_self.m_xData3.curValue.t = xTimeData.tickNo;
					}

					_self.m_xData3.curValue.y = _self.GetYPosToVal(_self.m_xData3.curPos.y);

					// #1558
					_self.didProcForRemainCount();
				}
				else {
					_self.m_xData3.curPos.x = _self.m_xData2.curPos.x;
					_self.m_xData3.curPos.y = _self.m_xData1.curPos.y;

					_self.m_xData3.curValue.x = _self.m_xData2.curValue.x;
					_self.m_xData3.curValue.y = _self.m_xData1.curValue.y;
				}
			};

			this.DrawSelectTrendLine = function(posval) {
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:_self.m_xData2.curPos.x, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#303030'});
			};

			this.DrawSelectHorizontalLine = function(posval) {
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = 0;
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);
				_self.m_xData2.curPos.x   = __xPanelRect.width;
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:_self.m_xData2.curPos.x, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});
			};

			this.DrawSelectVerticalLine = function(posval) {
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData1.curPos.y = 0;
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = __xPanelRect.height;

				_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:_self.m_xData2.curPos.x, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});
			};

			this.DrawSelectCrossLine = function() {
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData1.curPos.y = 0;
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				_self.DrawLine({context:_self.m_memcontext, startX:0, startY:_self.m_xData2.curPos.y, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});
				_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:0, endX:_self.m_xData2.curPos.x, endY:__xPanelRect.height, lineWidth:1, lineColor:'#599cbf'});
			};

			this.DrawSelectTrendRectangle = function()
			{
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				_self.DrawRectangle({context:_self.m_memcontext, rectX:_self.m_xData1.curPos.x, rectY:_self.m_xData1.curPos.y, rectW:_self.m_xData2.curPos.x-_self.m_xData1.curPos.x, rectH:_self.m_xData2.curPos.y-_self.m_xData1.curPos.y, lineWidth:1, lineColor:'#599cbf', fillColor:'#ffffff'});
			};

			this.DrawSelectTrendCircle = function() {
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				_self.DrawCircle({context:_self.m_memcontext, rectX:_self.m_xData1.curPos.x, rectY:_self.m_xData1.curPos.y, rectW:_self.m_xData2.curPos.x-_self.m_xData1.curPos.x, rectH:_self.m_xData2.curPos.y-_self.m_xData1.curPos.y, lineWidth:1, lineColor:'#599cbf', fillColor:'#ffffff'});
			};

			this.DrawSelectTrendAngle = function()
			{
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:_self.m_xData2.curPos.x, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});
				var iLen = Math.sqrt((Math.pow(_self.m_xData2.curPos.x - _self.m_xData1.curPos.x, 2) + Math.pow(_self.m_xData1.curPos.y - _self.m_xData2.curPos.y, 2)));
				_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:_self.m_xData1.curPos.x + iLen, endY:_self.m_xData1.curPos.y, lineWidth:1, lineColor:'#599cbf'});

				var iRad, iAngle, iXVal, iYVal;
				var bDirection;
				if (_self.m_xData1.curPos.x <= _self.m_xData2.curPos.x)
				{
					if (_self.m_xData1.curPos.y >= _self.m_xData2.curPos.y)
					{
						iRad = Math.atan2(_self.m_xData1.curPos.y - _self.m_xData2.curPos.y, _self.m_xData2.curPos.x - _self.m_xData1.curPos.x);
						iAngle = -((iRad * 180)/Math.PI);
						bDirection = true;
					}
					else if (_self.m_xData1.curPos.y < _self.m_xData2.curPos.y)
					{
						iRad = Math.atan2(_self.m_xData2.curPos.y - _self.m_xData1.curPos.y, _self.m_xData2.curPos.x - _self.m_xData1.curPos.x);
						iAngle = (iRad * 180)/Math.PI;
						bDirection = false;
					}
				}
				else
				{
					if (_self.m_xData1.curPos.y >= _self.m_xData2.curPos.y)
					{
						iRad = Math.atan2(_self.m_xData1.curPos.y - _self.m_xData2.curPos.y, _self.m_xData1.curPos.x - _self.m_xData2.curPos.x);
						iAngle = -(180 - (iRad * 180)/Math.PI);
						bDirection = true;
					}
					else if (_self.m_xData1.curPos.y < _self.m_xData2.curPos.y)
					{
						iRad = Math.atan2(_self.m_xData2.curPos.y - _self.m_xData1.curPos.y, _self.m_xData1.curPos.x - _self.m_xData2.curPos.x);
						iAngle = 180 - (iRad * 180)/Math.PI;
						bDirection = false;
					}
				}
				var iRad = iLen / 3;
				_self.DrawArc({context:_self.m_memcontext, iLeft:_self.m_xData1.curPos.x, iTop:_self.m_xData1.curPos.y, iDegrees:iAngle, iRadius:iRad, bDir:bDirection, lineWidth:1, lineColor:'#599cbf', fillColor:'#ffff96'});
			};

			this.DrawSelectFibRetracement = function() {
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				var iHeight = Math.abs(_self.m_xData2.curPos.y - _self.m_xData1.curPos.y);
				var i618 = (iHeight * 61.8) / 100;
				var i500 = (iHeight * 50.0) / 100;
				var i382 = (iHeight * 38.2) / 100;
				var i236 = (iHeight * 23.6) / 100;

				_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:_self.m_xData2.curPos.x, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});

				if ((_self.m_xData1.curPos.x <= _self.m_xData2.curPos.x) && (_self.m_xData1.curPos.y <= _self.m_xData2.curPos.y))
				{
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData2.curPos.y - i618, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y - i618, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData2.curPos.y - i500, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y - i500, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData2.curPos.y - i382, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y - i382, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData2.curPos.y - i236, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y - i236, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData2.curPos.y, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});
				}
				else if ((_self.m_xData1.curPos.x >= _self.m_xData2.curPos.x) && (_self.m_xData1.curPos.y >= _self.m_xData2.curPos.y))
				{
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData2.curPos.y, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData1.curPos.y - i618, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y - i618, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData1.curPos.y - i500, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y - i500, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData1.curPos.y - i382, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y - i382, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData1.curPos.y - i236, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y - i236, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData1.curPos.y, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y, lineWidth:1, lineColor:'#599cbf'});
				}
				else if ((_self.m_xData1.curPos.x <= _self.m_xData2.curPos.x) && (_self.m_xData1.curPos.y >= _self.m_xData2.curPos.y))
				{
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData2.curPos.y, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData2.curPos.y - i618, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y - i618, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData2.curPos.y - i500, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y - i500, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData2.curPos.y - i382, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y - i382, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData2.curPos.y - i236, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y - i236, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y, lineWidth:1, lineColor:'#599cbf'});
				}
				else if ((_self.m_xData1.curPos.x >= _self.m_xData2.curPos.x) && (_self.m_xData1.curPos.y <= _self.m_xData2.curPos.y))
				{
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData1.curPos.y, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData1.curPos.y - i618, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y - i618, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData1.curPos.y - i500, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y - i500, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData1.curPos.y - i382, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y - i382, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData1.curPos.y - i236, endX:__xPanelRect.width, endY:_self.m_xData1.curPos.y - i236, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData2.curPos.y, endX:__xPanelRect.width, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});
				}
			};

			this.DrawSelectFibTimeZone = function() {
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData1.curPos.y = 0;//_self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				var iXStartIdx, iXIdx, iXPos;
				var arrFiboTime = [1, 2, 3, 5, 8, 13, 21, 34, 58, 89, 144, 233, 377, 610, 987];
				iXStartIdx = _self.GetXIndex(_self.m_xData2.curPos.x);// + _self.m_drawWrapper.m_iStartX;

				var iTotCount = _self.m_drawWrapper.GetBaseDataCount();

				for(var idx = 0; idx < arrFiboTime.length; idx++)
				{
					iXIdx = iXStartIdx + (arrFiboTime[idx] - 1);
					if (iXIdx > (iTotCount - 1))
						break;
					iXPos = _self.m_drawWrapper.GetXPosAtDataIndex(iXIdx);
					_self.DrawLine({context:_self.m_memcontext, startX:iXPos, startY:0, endX:iXPos, endY:__xPanelRect.height, lineWidth:1, lineColor:'#599cbf'});

				}
			};

			this.DrawSelectFibFan = function() {
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:_self.m_xData2.curPos.x, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});

				var iYLeft, iYCenter, iYRight;
				if (_self.m_xData1.curPos.x < _self.m_xData2.curPos.x)
				{
					if (_self.m_xData1.curPos.y >= _self.m_xData2.curPos.y)
					{
						iYLeft = _self.m_xData2.curPos.y + (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) * 0.382;
						iYLeft = _self.m_xData1.curPos.y - (__xPanelRect.width - _self.m_xData1.curPos.x) / (_self.m_xData2.curPos.x - _self.m_xData1.curPos.x) * (_self.m_xData1.curPos.y - iYLeft);
						iYCenter = _self.m_xData2.curPos.y + (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) * 0.5;
						iYCenter = _self.m_xData1.curPos.y - (__xPanelRect.width - _self.m_xData1.curPos.x) / (_self.m_xData2.curPos.x - _self.m_xData1.curPos.x) * (_self.m_xData1.curPos.y - iYCenter);
						iYRight = _self.m_xData2.curPos.y + (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) * 0.618;
						iYRight = _self.m_xData1.curPos.y - (__xPanelRect.width - _self.m_xData1.curPos.x) / (_self.m_xData2.curPos.x - _self.m_xData1.curPos.x) * (_self.m_xData1.curPos.y - iYRight);
					}
					else if (_self.m_xData1.curPos.y < _self.m_xData2.curPos.y)
					{
						iYLeft = _self.m_xData2.curPos.y + (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) * 0.382;
						iYLeft = _self.m_xData1.curPos.y - (__xPanelRect.width - _self.m_xData1.curPos.x) / (_self.m_xData2.curPos.x - _self.m_xData1.curPos.x) * (iYLeft - _self.m_xData1.curPos.y);
						iYCenter = _self.m_xData2.curPos.y + (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) * 0.5;
						iYCenter = _self.m_xData1.curPos.y - (__xPanelRect.width - _self.m_xData1.curPos.x) / (_self.m_xData2.curPos.x - _self.m_xData1.curPos.x) * (iYCenter - _self.m_xData1.curPos.y);
						iYRight = _self.m_xData2.curPos.y + (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) * 0.618;
						iYRight = _self.m_xData1.curPos.y - (__xPanelRect.width - _self.m_xData1.curPos.x) / (_self.m_xData2.curPos.x - _self.m_xData1.curPos.x) * (iYRight - _self.m_xData1.curPos.y);
					}
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:__xPanelRect.width, endY:iYLeft, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:__xPanelRect.width, endY:iYCenter, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:__xPanelRect.width, endY:iYRight, lineWidth:1, lineColor:'#599cbf'});
				}
				else if (_self.m_xData1.curPos.x > _self.m_xData2.curPos.x)
				{
					if (_self.m_xData1.curPos.y >= _self.m_xData2.curPos.y)
					{
						iYLeft = _self.m_xData1.curPos.y + (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) * 0.382;
						iYLeft = _self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) / (_self.m_xData1.curPos.x - _self.m_xData2.curPos.x) * (iYLeft - _self.m_xData2.curPos.y);
						iYCenter = _self.m_xData1.curPos.y + (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) * 0.5;
						iYCenter = _self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) / (_self.m_xData1.curPos.x - _self.m_xData2.curPos.x) * (iYCenter - _self.m_xData2.curPos.y);
						iYRight = _self.m_xData1.curPos.y + (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) * 0.618;
						iYRight = _self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) / (_self.m_xData1.curPos.x - _self.m_xData2.curPos.x) * (iYRight - _self.m_xData2.curPos.y);
					}
					else if (_self.m_xData1.curPos.y < _self.m_xData2.curPos.y)
					{
						iYLeft = _self.m_xData1.curPos.y + (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) * 0.382;
						iYLeft = _self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) / (_self.m_xData1.curPos.x - _self.m_xData2.curPos.x) * (_self.m_xData2.curPos.y - iYLeft);
						iYCenter = _self.m_xData1.curPos.y + (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) * 0.5;
						iYCenter = _self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) / (_self.m_xData1.curPos.x - _self.m_xData2.curPos.x) * (_self.m_xData2.curPos.y - iYCenter);
						iYRight = _self.m_xData1.curPos.y + (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) * 0.618;
						iYRight = _self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) / (_self.m_xData1.curPos.x - _self.m_xData2.curPos.x) * (_self.m_xData2.curPos.y - iYRight);
					}
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData2.curPos.y, endX:__xPanelRect.width, endY:iYLeft, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData2.curPos.y, endX:__xPanelRect.width, endY:iYCenter, lineWidth:1, lineColor:'#599cbf'});
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData2.curPos.y, endX:__xPanelRect.width, endY:iYRight, lineWidth:1, lineColor:'#599cbf'});
				}
			};

			this.DrawSelectFibArc = function()
			{
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:_self.m_xData2.curPos.x, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:'#599cbf'});

				var iXCenter, iYCenter, iLenCenter, iLenLeft, iLenRight;
				var iLeft, iRight;
				if (_self.m_xData1.curPos.y >= _self.m_xData2.curPos.y)
				{
					if (_self.m_xData1.curPos.x < _self.m_xData2.curPos.x)
					{
						iXCenter = _self.m_xData1.curPos.x + (_self.m_xData2.curPos.x - _self.m_xData1.curPos.x) / 2.0;
						iYCenter = _self.m_xData2.curPos.y + (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) / 2.0;
						iLenCenter = Math.sqrt(Math.pow(_self.m_xData2.curPos.x - iXCenter, 2) + Math.pow(iYCenter - _self.m_xData2.curPos.y, 2));
						iLenLeft = iLenCenter * 2 * 0.382;
						iLenRight = iLenCenter * 2 * 0.618;
					}
					else if (_self.m_xData1.curPos.x > _self.m_xData2.curPos.x)
					{
						iXCenter = _self.m_xData2.curPos.x + (_self.m_xData1.curPos.x - _self.m_xData2.curPos.x) / 2.0;
						iYCenter = _self.m_xData1.curPos.y + (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) / 2.0;
						iLenCenter = Math.sqrt(Math.pow(_self.m_xData1.curPos.x - iXCenter, 2) + Math.pow(iYCenter - _self.m_xData1.curPos.y, 2));
						iLenLeft = iLenCenter * 2 * 0.382;
						iLenRight = iLenCenter * 2 * 0.618;
					}
					else if (_self.m_xData1.curPos.x == _self.m_xData2.curPos.x)
					{
						iLenCenter = (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) / 2.0;
						iLenLeft = (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) * 0.382;
						iLenRight = (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) * 0.618;
					}

					iLeft = _self.m_xData2.curPos.x - iLenLeft;
					iRight = _self.m_xData2.curPos.x + iLenLeft;
					var iRad = xUtils.didCalcCenterPos(iLeft, iRight);
					_self.DrawArc({context:_self.m_memcontext, iLeft:_self.m_xData1.curPos.x, iTop:_self.m_xData1.curPos.y, iRadius:iRad, bDir:true, lineWidth:1, lineColor:'#599cbf', fillColor:'#ffff96'});

					iLeft = _self.m_xData2.curPos.x - iLenCenter;
					iRight = _self.m_xData2.curPos.x + iLenCenter;
					var iRad = xUtils.didCalcCenterPos(iLeft, iRight);
					_self.DrawArc({context:_self.m_memcontext, iLeft:_self.m_xData1.curPos.x, iTop:_self.m_xData1.curPos.y, iRadius:iRad, bDir:true, lineWidth:1, lineColor:'#599cbf', fillColor:'#ffff96'});

					iLeft = _self.m_xData2.curPos.x - iLenRight;
					iRight = _self.m_xData2.curPos.x + iLenRight;
					var iRad = xUtils.didCalcCenterPos(iLeft, iRight);
					_self.DrawArc({context:_self.m_memcontext, iLeft:_self.m_xData1.curPos.x, iTop:_self.m_xData1.curPos.y, iRadius:iRad, bDir:true, lineWidth:1, lineColor:'#599cbf', fillColor:'#ffff96'});
				}
				else
				{
					if (_self.m_xData1.curPos.x < _self.m_xData2.curPos.x)
					{
						iXCenter = _self.m_xData1.curPos.x + (_self.m_xData2.curPos.x - _self.m_xData1.curPos.x) / 2.0;
						iYCenter = _self.m_xData2.curPos.y + (_self.m_xData1.curPos.y - _self.m_xData2.curPos.y) / 2.0;
						iLenCenter = Math.sqrt(Math.pow(_self.m_xData2.curPos.x - iXCenter, 2) + Math.pow(iYCenter - _self.m_xData2.curPos.y, 2));
						iLenLeft = iLenCenter * 2 * 0.382;
						iLenRight = iLenCenter * 2 * 0.618;
					}
					else if (_self.m_xData1.curPos.x > _self.m_xData2.curPos.x)
					{
						iXCenter = _self.m_xData2.curPos.x + (_self.m_xData1.curPos.x - _self.m_xData2.curPos.x) / 2.0;
						iYCenter = _self.m_xData1.curPos.y + (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) / 2.0;
						iLenCenter = Math.sqrt(Math.pow(_self.m_xData1.curPos.x - iXCenter, 2) + Math.pow(iYCenter - _self.m_xData1.curPos.y, 2));
						iLenLeft = iLenCenter * 2 * 0.382;
						iLenRight = iLenCenter * 2 * 0.618;
					}
					else if (_self.m_xData1.curPos.x == _self.m_xData2.curPos.x)
					{
						iLenCenter = (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) / 2.0;
						iLenLeft = (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) * 0.382;
						iLenRight = (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y) * 0.618;
					}

					iLeft = _self.m_xData2.curPos.x - iLenLeft;
					iRight = _self.m_xData2.curPos.x + iLenLeft;
					var iRad = xUtils.didCalcCenterPos(iLeft, iRight);
					_self.DrawArc({context:_self.m_memcontext, iLeft:_self.m_xData1.curPos.x, iTop:_self.m_xData1.curPos.y, iRadius:iRad, bDir:false, lineWidth:1, lineColor:'#599cbf', fillColor:'#ffff96'});

					iLeft = _self.m_xData2.curPos.x - iLenCenter;
					iRight = _self.m_xData2.curPos.x + iLenCenter;
					var iRad = xUtils.didCalcCenterPos(iLeft, iRight);
					_self.DrawArc({context:_self.m_memcontext, iLeft:_self.m_xData1.curPos.x, iTop:_self.m_xData1.curPos.y, iRadius:iRad, bDir:false, lineWidth:1, lineColor:'#599cbf', fillColor:'#ffff96'});

					iLeft = _self.m_xData2.curPos.x - iLenRight;
					iRight = _self.m_xData2.curPos.x + iLenRight;
					var iRad = xUtils.didCalcCenterPos(iLeft, iRight);
					_self.DrawArc({context:_self.m_memcontext, iLeft:_self.m_xData1.curPos.x, iTop:_self.m_xData1.curPos.y, iRadius:iRad, bDir:false, lineWidth:1, lineColor:'#599cbf', fillColor:'#ffff96'});
				}
			};

			this.DrawSelectGanFanUp = function() {
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData1.curPos.y = 0;
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				var arrGannFan = [];
				arrGannFan.push(_self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1)));
				arrGannFan.push(_self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/2.0)));
				arrGannFan.push(_self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/3.0)));
				arrGannFan.push(_self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/4.0)));
				arrGannFan.push(_self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/8.0)));
				arrGannFan.push(_self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(2)));
				arrGannFan.push(_self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(3)));
				arrGannFan.push(_self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(4)));
				arrGannFan.push(_self.m_xData2.curPos.y - (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(8)));

				for (var idx = 0; idx < arrGannFan.length; idx++)
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData2.curPos.y, endX:__xPanelRect.width, endY:parseInt(arrGannFan[idx]), lineWidth:1, lineColor:'#599cbf'});

			};

			this.DrawSelectGanFanDown = function() {
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData1.curPos.y = 0;
				_self.m_xData2.curPos.x   = _self.GetXValToPos(_self.m_xData2.curValue.x);
				_self.m_xData2.curPos.y   = _self.GetYValToPos(_self.m_xData2.curValue.y);

				var arrGannFan = [];
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/2.0)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/3.0)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/4.0)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/8.0)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(2)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(3)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(4)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(8)));

				for (var idx = 0; idx < arrGannFan.length; idx++)
					_self.DrawLine({context:_self.m_memcontext, startX:_self.m_xData2.curPos.x, startY:_self.m_xData2.curPos.y, endX:__xPanelRect.width, endY:parseInt(arrGannFan[idx]), lineWidth:1, lineColor:'#599cbf'});

			};

			this.DrawLine = function(stStyle)
			{
				stStyle.context.beginPath();
				stStyle.context.moveTo(stStyle.startX, stStyle.startY);
				stStyle.context.lineTo(stStyle.endX, stStyle.endY);
				stStyle.context.lineWidth = stStyle.lineWidth;
				//m_context.globalAlpha=1.0;
				stStyle.context.strokeStyle = stStyle.lineColor;
				stStyle.context.stroke();
			};

			this.DrawRectangle = function(stStyle)
			{
				stStyle.context.save();
				stStyle.context.beginPath();
				stStyle.context.rect(stStyle.rectX, stStyle.rectY, stStyle.rectW, stStyle.rectH);
				stStyle.context.lineWidth = stStyle.lineWidth;
				stStyle.context.strokeStyle = stStyle.lineColor;
				stStyle.context.stroke();
				if(stStyle.fillAlpha != undefined)
					stStyle.context.globalAlpha = stStyle.fillAlpha;
				stStyle.context.fillStyle = stStyle.fillColor;
				stStyle.context.fill();
				//stStyle.context.globalAlpha=1.0;
				stStyle.context.restore();
			};

			this.DrawTriangle = function(stStyle)
			{
				stStyle.context.save();
				stStyle.context.beginPath();
				stStyle.context.moveTo(stStyle.pt1.x, stStyle.pt1.y);
				stStyle.context.lineTo(stStyle.pt2.x, stStyle.pt2.y);
				stStyle.context.lineTo(stStyle.pt3.x, stStyle.pt3.y);
				stStyle.context.closePath();
				stStyle.context.lineWidth = stStyle.lineWidth;
				stStyle.context.strokeStyle = stStyle.lineColor;
				stStyle.context.stroke();
				if(stStyle.fillAlpha != undefined)
					stStyle.context.globalAlpha = stStyle.fillAlpha;
				stStyle.context.fillStyle = stStyle.fillColor;
				stStyle.context.fill();
				//stStyle.context.globalAlpha=1.0;
				stStyle.context.restore();
			};

			this.DrawCircle = function(stStyle)
			{
				stStyle.context.beginPath();
				stStyle.context.arc(stStyle.iLeft, stStyle.iTop, stStyle.iRadius, 0, 2 * Math.PI, true);
				stStyle.context.lineWidth = stStyle.lineWidth;
				stStyle.context.strokeStyle = stStyle.lineColor;
				stStyle.context.stroke();
				stStyle.context.globalAlpha=0.0;
				stStyle.context.fillStyle = stStyle.fillColor;
				stStyle.context.fill();
				stStyle.context.globalAlpha=1.0;
			};

			this.DrawArc = function(stStyle)
			{
				stStyle.context.beginPath();
				stStyle.context.arc(stStyle.iLeft, stStyle.iTop, stStyle.iRadius, 0, (Math.PI/180)*stStyle.iDegrees, stStyle.bDir);
				stStyle.context.lineWidth = stStyle.lineWidth;
				stStyle.context.strokeStyle = stStyle.lineColor;
				stStyle.context.stroke();
				stStyle.context.globalAlpha=0.0;
				stStyle.context.fillStyle = stStyle.fillColor;
				stStyle.context.fill();
				stStyle.context.globalAlpha=1.0;
			};

			this.DrawCircle2 = function(stStyle)
			{
				var kappa = .5522848;
				ox = (stStyle.rectW / 2) * kappa, // control point offset horizontal
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
				//stStyle.context.closePath();
				stStyle.context.stroke();
			};

			this.DrawSelectCircle = function(stStyle)
			{
				stStyle.context.beginPath();
				//stStyle.context.globalAlpha=0.5;
				stStyle.context.arc(stStyle.iLeft, stStyle.iTop, stStyle.iRadius, 0, 2 * Math.PI, true);
				stStyle.context.fillStyle = stStyle.fillColor;
				stStyle.context.fill();
				stStyle.context.lineWidth = stStyle.lineWidth;
				stStyle.context.strokeStyle = stStyle.lineColor;
				stStyle.context.stroke();
			};

			/**
			 * draw text
			 * @param[in] stStyle	{context:, text:, left:, top:}
			 */
			this.DrawText = function(stStyle) {
				stStyle.context.fillText(stStyle.text, stStyle.left, stStyle.top);
			};

			/**
			 * get x index from pixel position
			 * @param[in]	iXPos	pixel position
			 * @return index
			 * */
			this.GetXIndex = function(iXPos)
			{
				var __nIndex = _self.m_drawWrapper.GetXIndex(iXPos);
				return(__nIndex);
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

	        this.didGetStyleInfo = function() {

	        };

			// #717

			/**
			 * ラインツールの情報を設定する。
			 * @param  {[type]} argLoadInfo
			 * @return {[type]}
			 */
			this.didSetLoadInfo = function(argLoadInfo) {
				if(argLoadInfo === undefined || argLoadInfo == null) {
					return(false);
				}

				/*
				if(argLoadInfo.code !== _self.m_strTrendlineName) {
					return(false);
				}
				*/
				try {

					var nLimit = 2;
					if(_self.m_bExtraPoint === true) {
						nLimit = 3;
					}

					// data part
					if(typeof argLoadInfo.datas === "object" && argLoadInfo.datas.length !== undefined && argLoadInfo.datas.length != null && argLoadInfo.datas.length >= nLimit) {
						// data part
						_self.m_xData1.curValue.x = argLoadInfo.datas[0].x;
						_self.m_xData1.curValue.y = argLoadInfo.datas[0].y;
						_self.m_xData1.curValue.t = argLoadInfo.datas[0].t;
						if(_self.m_xData1.curValue.t === undefined || _self.m_xData1.curValue.t == null) {
							_self.m_xData1.curValue.t = 0;
						}

						_self.m_xData2.curValue.x = argLoadInfo.datas[1].x;
						_self.m_xData2.curValue.y = argLoadInfo.datas[1].y;
						_self.m_xData2.curValue.y = argLoadInfo.datas[1].y;
						if(_self.m_xData2.curValue.t === undefined || _self.m_xData2.curValue.t == null) {
							_self.m_xData2.curValue.t = 0;
						}

						if(argLoadInfo.datas.length > 2) {
							_self.m_xData3.curValue.x = argLoadInfo.datas[2].x;
							_self.m_xData3.curValue.y = argLoadInfo.datas[2].y;
							_self.m_xData3.curValue.t = argLoadInfo.datas[2].t;
							if(_self.m_xData3.curValue.t === undefined || _self.m_xData3.curValue.t == null) {
								_self.m_xData3.curValue.t = 0;
							}
						}
					}
					else if(typeof argLoadInfo.ds === "object" && argLoadInfo.ds.length !== undefined && argLoadInfo.ds.length != null && argLoadInfo.ds.length >= nLimit) {
						// data part
						_self.m_xData1.curValue.x = argLoadInfo.ds[0].x;
						_self.m_xData1.curValue.y = argLoadInfo.ds[0].y;
						_self.m_xData1.curValue.t = argLoadInfo.ds[0].t;
						if(_self.m_xData1.curValue.t === undefined || _self.m_xData1.curValue.t == null) {
							_self.m_xData1.curValue.t = 0;
						}

						_self.m_xData2.curValue.x = argLoadInfo.ds[1].x;
						_self.m_xData2.curValue.y = argLoadInfo.ds[1].y;
						_self.m_xData2.curValue.t = argLoadInfo.ds[1].t;
						if(_self.m_xData2.curValue.t === undefined || _self.m_xData2.curValue.t == null) {
							_self.m_xData2.curValue.t = 0;
						}

						if(argLoadInfo.ds.length > 2) {
							_self.m_xData3.curValue.x = argLoadInfo.ds[2].x;
							_self.m_xData3.curValue.y = argLoadInfo.ds[2].y;
							_self.m_xData3.curValue.t = argLoadInfo.ds[2].t;
							if(_self.m_xData3.curValue.t === undefined || _self.m_xData3.curValue.t == null) {
								_self.m_xData3.curValue.t = 0;
							}
						}
					}

					// style
					if(argLoadInfo.style) {
						_self.m_clrLineColor = argLoadInfo.style.lineColor;
						_self.m_clrFillColor = argLoadInfo.style.fillColor;
					}
					// styles
					else if(argLoadInfo.styles) {
						_self.m_clrLineColor = argLoadInfo.styles.lineColor;
						_self.m_clrFillColor = argLoadInfo.styles.fillColor;
					}
					else if(argLoadInfo.s) {
						_self.m_clrLineColor = argLoadInfo.s.lc;
						_self.m_clrFillColor = argLoadInfo.s.fc;
					}

					// rest
					_self.didSetLoadInfoRest(argLoadInfo);
				}
				catch(e) {
					console.error(e);

					return(false);
				}

				//
				return(true);
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didGetObjectSaveInfo = function() {
				var xResult = {
					is: true,
					c : _self.m_strTrendlineName,
					ds : [
						{x:_self.m_xData1.curValue.x, y:_self.m_xData1.curValue.y, t:_self.m_xData1.curValue.t},
						{x:_self.m_xData2.curValue.x, y:_self.m_xData2.curValue.y, t:_self.m_xData2.curValue.t}
					],
					s : {
						lc : _self.m_clrLineColor,
						fc : _self.m_clrFillColor
					}
				};

				// triangle
				if(_self.m_bExtraPoint === true) {
					xResult.ds.push({x:_self.m_xData3.curValue.x, y:_self.m_xData3.curValue.y, t:_self.m_xData3.curValue.t});
				}

				// rest
				_self.didAppendRestObjectSaveInfo(xResult);

				//
				return(xResult);
			};

			/**
			 * 描画ツール特有の設定をロードする。
			 * @param  {[type]} argLoadInfo
			 * @return {[type]}
			 */
			this.didSetLoadInfoRest = function(argLoadInfo) {
				return(true);
			};

			/**
			 * 描画ツールの特有の情報を入れておく。
			 * @param  {[type]} argSaveInfo
			 * @return {[type]}
			 */
			this.didAppendRestObjectSaveInfo = function(argSaveInfo) {
				return(true);
			}

			this.didApplySimpleAttribute = function(color, text) {
				_self.m_clrLineColor = color;
				_self.m_clrFillColor = color;

				return(true);
			};

			//

			this.didGetLineColor = function(xEnv) {
				if(xEnv && xEnv.System.UseGlobalTrendlineColor) {
					return(xEnv.TrendlineColor);
				}

				return(_self.m_clrLineColor);
			};

			this.didGetFillColor = function(xEnv) {
				// if(xEnv && xEnv.System.UseGlobalTrendlineColor) {
				// 	return(xEnv.TrendlineColor);
				// }

				return(_self.m_clrFillColor);
			};

			this.didGetFontColor = function(xEnv) {
				if(xEnv && xEnv.System.UseGlobalTrendlineColor) {
					return(xEnv.TrendlineColor);
				}

				return(_self.m_clrFontColor);
			};

			this.didGetText = function() {
			};

			this.didGetSimpleAttribute = function() {
				var xResult = {
					color : _self.didGetLineColor(),
					text  : _self.didGetText()
				};

				return(xResult);
			};

			this.didGetSelectedColor = function(isSelect, color, systemColor) {
				return(color);
			};

			//
			this.isAutoDeleteObject = function() {
				return(false);
			};

			this.didGetPointValue = function() {
				if(_self.m_doParent) {
					return(_self.m_doParent.didGetPointValue());
				}

				return;
			};

			this.didGetPointFactor = function() {
				if(_self.m_doParent) {
					return(_self.m_doParent.didGetPointFactor());
				}

				return;
			};

			// #1516
			this.didSetDatas = function(argDataInfo) {
				if(argDataInfo === undefined || argDataInfo == null) {
					return(false);
				}

				try {
					// data part
					if(typeof argDataInfo.datas === "object") {
						// data part
						var data;

						data = argDataInfo.datas["0"];
						if(data) {
							_self.m_xData1.curValue.x = data.x;
							_self.m_xData1.curValue.y = data.y;
							_self.m_xData1.curValue.t = data.t;
							if(_self.m_xData1.curValue.t === undefined || _self.m_xData1.curValue.t == null) {
								_self.m_xData1.curValue.t = 0;
							}
						}

						data = argDataInfo.datas["1"];
						if(data) {
							_self.m_xData2.curValue.x = data.x;
							_self.m_xData2.curValue.y = data.y;
							_self.m_xData2.curValue.y = data.y;
							if(_self.m_xData2.curValue.t === undefined || _self.m_xData2.curValue.t == null) {
								_self.m_xData2.curValue.t = 0;
							}
						}

						if(_self.m_bExtraPoint === true) {
							data = argDataInfo.datas["2"];
							if(data) {
								_self.m_xData3.curValue.x = data.x;
								_self.m_xData3.curValue.y = data.y;
								_self.m_xData3.curValue.t = data.t;
								if(_self.m_xData3.curValue.t === undefined || _self.m_xData3.curValue.t == null) {
									_self.m_xData3.curValue.t = 0;
								}
							}
						}
					}
				}
				catch(e) {
					console.error(e);

					return(false);
				}

				//
				return(true);
			};

			//

			//
			// Debug
			//

			this.debug = {};

			this.debug.toString = function() {
				var __data1 = 'xData1 = > ' + JSON.stringify(_self.m_xData1);
				var __data2 = 'xData2 = > ' + JSON.stringify(_self.m_xData2);
				var __data3 = 'xData3 = > ' + JSON.stringify(_self.m_xData3);


				return(__data1 + '\n' + __data2 + '\n' + __data3 + '\n');
			}
		};

		return(_exports);
	};

	//console.debug("[MODUEL] Loading => chartDOLineStudyBase");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOLineStudyBase"] =
            loadModule(
                global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartUtil"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./canvas2DUtil"),
				require("./chartUtil")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDOLineStudyBase",
            ['ngc/canvas2DUtil', 'ngc/chartUtil'],
                function(gxDc, xUtils) {
                    return loadModule(gxDc, xUtils);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOLineStudyBase"] =
            loadModule(
                global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartUtil"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOLineStudyBase");
})(this);
