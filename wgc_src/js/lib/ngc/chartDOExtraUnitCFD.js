(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc, doBaseClassFactory) {
	    "use strict";

		//
		// class _DOPlot
		//
		var _doOPUnitBase = doBaseClassFactory.didGetBaseExtraUnitClass();

		// Base
		var _doOpeaUnitBaseCFD = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doOPUnitBase();
			_doOPUnitBase.apply(this, arguments);

			this.didDrawLastValue = function(argDrawParam, dataIndex) {
				// 2437
				if(_self.m_bDummyObject) {
					if(argDrawParam === undefined || argDrawParam == null) {
						return;
					}

					// #1811
					var xEnv = _self.didGetEnvInfo();
					// if(_self.m_bDummyObject === true) {
					// 	return;
					// }
					//

					argDrawParam.price = {};
					argDrawParam.price.verpos = _self.didGetPointValue();
					argDrawParam.price.value = _self.m_xData1.curValue.y;

					var xStyleInfo = _self.didGetStyleInfo();
					if(xStyleInfo !== undefined && xStyleInfo != null) {
						if(_self.m_bSelect && xEnv.UseOepSelectedColor == true) { // #2059
							argDrawParam.price.color = xEnv.System.SelectedFill.lineColor;
						}
						else {
							if(_self.m_xObjectInfo.ask === true) {
								// #3047
								if(xStyleInfo.ask.cloneColor === undefined || xStyleInfo.ask.cloneColor == null) {
									argDrawParam.price.color = xStyleInfo.ask.strokeColor;
								}
								else {
									argDrawParam.price.color = xStyleInfo.ask.cloneColor;
								}
								//
							}
							else if(_self.m_xObjectInfo.ask === false) {
								// #3047
								if(xStyleInfo.bid.cloneColor === undefined || xStyleInfo.bid.cloneColor == null) {
									argDrawParam.price.color = xStyleInfo.bid.strokeColor;
								}
								else {
									argDrawParam.price.color = xStyleInfo.bid.cloneColor;
								}
								//
							}
							else {
								argDrawParam.price.color = xStyleInfo.default.strokeColor;
							}
						}
					}

					xUtils.axis.didDrawLastValueOnYAxis(argDrawParam);
				}
			};
			//
		};

		// Line style
		var _doOpeaLineUnitBaseCFD = function() {
			//
			//
			//
			var _self = this;

	        this.prototype = new _doOpeaUnitBaseCFD();
			_doOpeaUnitBaseCFD.apply(this, arguments);

			/**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
				// check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;

				var __xPanelRect = _self.didGetPanelRect();

				//
				// calculate pixel position to draw
				//
				_self.m_xData1.curPos.x = 0;
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = __xPanelRect.width;
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);

				if(_self.m_bDummyObject === true) {
					// console.debug(_self.m_xObjectInfo);
				}

	            if(_self.m_xData1.curPos.y < 0 || _self.m_xData1.curPos.y > __xPanelRect.height) {
	                return;
	            }

				// set to draw parameter
				var context   = _self.m_context;
	            var font      = _self.m_drawWrapper.m_stEnv.Font;
				var lineColor = _self.m_clrLineColor;
				var lineWidth = _self.m_nLineWeight;
	            var lineStyle = _self.m_nLineStyle;
	            var xStyleInfo = _self.didGetStyleInfo();
	            if(xStyleInfo !== undefined && xStyleInfo != null) {
					if(_self.m_bDummyObject === true) {
						// #1811
						lineColor = xStyleInfo.dummy.strokeColor;
						lineWidth = xStyleInfo.dummy.strokeWeight;
						lineStyle = xStyleInfo.dummy.strokeStyle;

						if(_self.m_xObjectInfo.ask === true) {
							// #3047
							if(xStyleInfo.ask.cloneColor === undefined || xStyleInfo.ask.cloneColor == null) {
								lineColor = xStyleInfo.ask.strokeColor;
							}
							else {
								lineColor = xStyleInfo.ask.cloneColor;
							}
							//
						}
						else if(_self.m_xObjectInfo.ask === false) {
							// #3047
							if(xStyleInfo.bid.cloneColor === undefined || xStyleInfo.bid.cloneColor == null) {
								lineColor = xStyleInfo.bid.strokeColor;
							}
							else {
								lineColor = xStyleInfo.bid.cloneColor;
							}
							//
						}
						//
					}
					else {
						if(_self.m_xObjectInfo.ask === true) {
							lineColor = xStyleInfo.ask.strokeColor;
			                lineWidth = xStyleInfo.ask.strokeWeight;
			                lineStyle = xStyleInfo.ask.strokeStyle;
						}
						else if(_self.m_xObjectInfo.ask === false) {
							lineColor = xStyleInfo.bid.strokeColor;
			                lineWidth = xStyleInfo.bid.strokeWeight;
			                lineStyle = xStyleInfo.bid.strokeStyle;
						}
						else {
							lineColor = xStyleInfo.default.strokeColor;
			                lineWidth = xStyleInfo.default.strokeWeight;
			                lineStyle = xStyleInfo.default.strokeStyle;
						}
					}
	            }

				var xEnv    = _self.didGetEnvInfo();
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					if(_self.m_bSelect && xEnv.UseOepSelectedColor == true) { // #2059, #2440
						lineColor = xEnv.System.SelectedFill.lineColor;
					}
				}

	            var fontColor = lineColor;
				var drawLineParam = {
					context:context,
					pt1 : {
	                    x : _self.m_xData1.curPos.x,
	    				y :_self.m_xData1.curPos.y
	                },
	                pt2 : {
	    				x :_self.m_xData2.curPos.x,
	    				y :_self.m_xData2.curPos.y
	                },
					lineWidth:lineWidth,
					lineColor:lineColor,
	                lineStyle:lineStyle
				};

				// #2009: trail
				var ptMark = {x:0, y:_self.m_xData2.curPos.y}; // #2009
				if(_self.m_xObjectInfo.extraPrice && _self.m_bDummyObject != true) { // #2009
					ptMark.y = // #2009
					drawLineParam.pt2.y =
					drawLineParam.pt1.y = _self.GetYValToPos(_self.m_xObjectInfo.extraPrice);
				}

				gxDc.Line(drawLineParam);
				//

				if(isHitTest !== true) {
					var iXPos = _self.didGetPanelHalfWidth();
					var pts = [
						{x:iXPos, y:ptMark.y} // #2009
					];

					// draw selection mark
					_self.DrawSelectionMark(pts);
				}
			};
		};

		// Mark(Triangle) style
		var _doOpeaMarkUnitBaseCFD = function() {
			//
			//
			//
			var _self = this;

	        this.prototype = new _doOpeaUnitBaseCFD();
			_doOpeaUnitBaseCFD.apply(this, arguments);

			/**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
				// check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;

				var __xPanelRect = _self.didGetPanelRect();

				//
				// calculate pixel position to draw
				//
				_self.m_xData1.curPos.x = 0;
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = __xPanelRect.width;
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);

				if(_self.m_bDummyObject === true) {
					// console.debug("[WGC] :" + _self.m_xData1);
				}

	            if(_self.m_xData1.curPos.y < 0 || _self.m_xData1.curPos.y > __xPanelRect.height) {
	                return;
	            }

				var pt1 = {
					x:_self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t),
					y:_self.GetYValToPos(_self.m_xData1.curValue.y)
				};

				// set to draw parameter
				var context   = _self.m_context;
	            var font      = _self.m_drawWrapper.m_stEnv.Font;
				var lineColor = _self.m_clrLineColor;
				var lineWidth = _self.m_nLineWeight;
	            var lineStyle = _self.m_nLineStyle;
	            var xStyleInfo = _self.didGetStyleInfo();
				var	bFill	  = true;
	            if(xStyleInfo !== undefined && xStyleInfo != null) {
					if(_self.m_bDummyObject === true) {
						// #1811
						lineColor = xStyleInfo.dummy.strokeColor;
						lineWidth = xStyleInfo.dummy.strokeWeight;
						lineStyle = xStyleInfo.dummy.strokeStyle;

						if(_self.m_xObjectInfo.ask === true) {
							lineColor = xStyleInfo.ask.strokeColor;
						}
						else if(_self.m_xObjectInfo.ask === false) {
							lineColor = xStyleInfo.bid.strokeColor;
						}
						//
					}
					else {
						if(_self.m_xObjectInfo.ask === true) {
							lineColor = xStyleInfo.ask.strokeColor;
			                lineWidth = xStyleInfo.ask.strokeWeight;
			                lineStyle = xStyleInfo.ask.strokeStyle;
						}
						else if(_self.m_xObjectInfo.ask === false) {
							lineColor = xStyleInfo.bid.strokeColor;
			                lineWidth = xStyleInfo.bid.strokeWeight;
			                lineStyle = xStyleInfo.bid.strokeStyle;
						}
						else {
							lineColor = xStyleInfo.default.strokeColor;
			                lineWidth = xStyleInfo.default.strokeWeight;
			                lineStyle = xStyleInfo.default.strokeStyle;
						}
					}

					if(xStyleInfo.noFill === true) {
						bFill = false;
					}
	            }

				var xEnv    = _self.didGetEnvInfo();
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					if(_self.m_bSelect && xEnv.UseOepSelectedColor == true) { // #2059, #2440
						lineColor = xEnv.System.SelectedFill.lineColor;
					}
				}

	            var fontColor = lineColor;
				var fillColor = bFill == true ? lineColor : undefined;
				var drawParam = {
					context:context,
					pt1:pt1,
					pt2:{x:0, y:0},
					pt3:{x:0, y:0},
					lineWidth:lineWidth,
					lineColor:lineColor,
					fillColor:fillColor
				};

				if(_self.m_xObjectInfo.ask != true) { // #2443
					drawParam.pt2.x = pt1.x - 5;
					drawParam.pt2.y = pt1.y + 5;
					drawParam.pt3.x = pt1.x + 5;
					drawParam.pt3.y = pt1.y + 5;
				}
				else {
					drawParam.pt2.x = pt1.x - 5;
					drawParam.pt2.y = pt1.y - 5;
					drawParam.pt3.x = pt1.x + 5;
					drawParam.pt3.y = pt1.y - 5;
				}

				gxDc.Triangle(drawParam);

				if(isHitTest !== true) {
					var iXPos = _self.didGetPanelHalfWidth();
					var pts = [
						{x:pt1.x, y:pt1.y}
					];

					// draw selection mark
					// _self.DrawSelectionMark(pts);
				}
			};
		};

		//
		var _doOrderUnitCFD = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doOpeaLineUnitBaseCFD();
			_doOpeaLineUnitBaseCFD.apply(this, arguments);

	        this.m_bOrder = true;

	        this.didGetStyleInfo = function() {
	            return(_self.m_drawWrapper.m_stEnv.OrderStyleConfig);
	        };
	    };

	    var _doPositUnitCFD = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doOpeaMarkUnitBaseCFD();
			_doOpeaMarkUnitBaseCFD.apply(this, arguments);

	        this.m_bOrder = false;

	        this.didGetStyleInfo = function() {
	            return(_self.m_drawWrapper.m_stEnv.PositStyleConfig);
	        };

			/**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest, extraDrawParam) {
				// check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;

				var __xPanelRect = _self.didGetPanelRect();

				//
				// calculate pixel position to draw
				//
				_self.m_xData1.curPos.x = 0;
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = __xPanelRect.width;
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);

				if(_self.m_bDummyObject === true) {
					// console.debug("[WGC] :" + _self.m_xData1);
				}

	            if(_self.m_xData1.curPos.y < 0 || _self.m_xData1.curPos.y > __xPanelRect.height) {
	                return;
	            }

				var pt1 = {
					x:_self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t),
					y:_self.GetYValToPos(_self.m_xData1.curValue.y)
				};

				// set to draw parameter
				var bSelect	  = _self.m_bSelect;
				if(extraDrawParam && extraDrawParam.offSelect == true) {
					bSelect = false;
				}

				var context   = _self.m_context;
	            var font      = _self.m_drawWrapper.m_stEnv.Font;
				var lineColor = _self.m_clrLineColor;
				var lineWidth = _self.m_nLineWeight;
	            var lineStyle = _self.m_nLineStyle;
				var fillColor = lineColor; // #3148
	            var xStyleInfo = _self.didGetStyleInfo();
				var	bFill	  = true;
				var lineColor2= _self.m_clrLineColor; // #3148
	            if(xStyleInfo !== undefined && xStyleInfo != null) {
					if(_self.m_bDummyObject === true) {
						// #1811
						lineColor = xStyleInfo.dummy.strokeColor;
						lineWidth = xStyleInfo.dummy.strokeWeight;
						lineStyle = xStyleInfo.dummy.strokeStyle;
						lineColor2= lineColor; // #3148

						if(_self.m_xObjectInfo.ask === true) {
							lineColor = xStyleInfo.ask.strokeColor;
							lineColor2= xStyleInfo.ask.strokeColor2; // #3148
						}
						else if(_self.m_xObjectInfo.ask === false) {
							lineColor = xStyleInfo.bid.strokeColor;
							lineColor2= xStyleInfo.bid.strokeColor2; // #3148
						}
						//
					}
					else {
						if(_self.m_xObjectInfo.ask === true) {
							lineColor = xStyleInfo.ask.strokeColor;
			                lineWidth = xStyleInfo.ask.strokeWeight;
			                lineStyle = xStyleInfo.ask.strokeStyle;
							lineColor2= xStyleInfo.ask.strokeColor2; // #3148
						}
						else if(_self.m_xObjectInfo.ask === false) {
							lineColor = xStyleInfo.bid.strokeColor;
			                lineWidth = xStyleInfo.bid.strokeWeight;
			                lineStyle = xStyleInfo.bid.strokeStyle;
							lineColor2= xStyleInfo.bid.strokeColor2; // #3148
						}
						else {
							lineColor = xStyleInfo.default.strokeColor;
			                lineWidth = xStyleInfo.default.strokeWeight;
			                lineStyle = xStyleInfo.default.strokeStyle;
							lineColor2= lineColor; // #3148
						}
					}

					if(xStyleInfo.noFill === true) {
						bFill = false;
					}
	            }

				var xEnv    = _self.didGetEnvInfo();
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
					lineColor2= lineColor; // #3148
				}
				else {
					context   = _self.m_context;
					if(bSelect && xEnv.UseOepSelectedColor == true) { // #2059, #2440
						lineColor = xEnv.System.SelectedFill.lineColor;
						lineColor2= lineColor; // #3148
					}
				}

				if(extraDrawParam) {
					if(isHitTest) {
						context = extraDrawParam.memcontext;
					}
					else {
						context = extraDrawParam.context;
					}

					pt1.x = extraDrawParam.pt.x;
				}

				var fontColor = lineColor;
				var fillColor = bFill == true ? lineColor : undefined;
				var fillColor2= bFill == true ? lineColor2 : undefined; // #3148
				var drawParam = {
					context:context,
					pt1:pt1,
					pt2:{x:0, y:0},
					pt3:{x:0, y:0},
					lineWidth:lineWidth,
					lineColor:lineColor,
					fillColor:fillColor
				};

				// #3148
				var triHalfWidth = 7 ;
				var triHeight    = 12;
				if(_self.m_xObjectInfo.ask != true) { // #2443
					drawParam.pt2.x = pt1.x - triHalfWidth;
					drawParam.pt2.y = pt1.y + triHeight;
					drawParam.pt3.x = pt1.x + triHalfWidth;
					drawParam.pt3.y = pt1.y + triHeight;
				}
				else {
					drawParam.pt2.x = pt1.x - triHalfWidth;
					drawParam.pt2.y = pt1.y - triHeight;
					drawParam.pt3.x = pt1.x + triHalfWidth;
					drawParam.pt3.y = pt1.y - triHeight;
				}

				gxDc.Triangle(drawParam);

				// #3148
				triHalfWidth    -= lineWidth;
				triHeight       -= lineWidth * 2;
				if(_self.m_xObjectInfo.ask != true) { // #2443
					pt1.y          += (lineWidth + 1);
					drawParam.pt1.y	= pt1.y
					drawParam.pt2.x = pt1.x - triHalfWidth;
					drawParam.pt2.y = pt1.y + triHeight;
					drawParam.pt3.x = pt1.x + triHalfWidth;
					drawParam.pt3.y = pt1.y + triHeight;
				}
				else {
					pt1.y          -= (lineWidth + 1);
					drawParam.pt1.y	= pt1.y
					drawParam.pt2.x = pt1.x - triHalfWidth;
					drawParam.pt2.y = pt1.y - triHeight;
					drawParam.pt3.x = pt1.x + triHalfWidth;
					drawParam.pt3.y = pt1.y - triHeight;
				}
				drawParam.lineColor = lineColor2;
				drawParam.fillColor = fillColor2;
				gxDc.Triangle(drawParam);
				// [end] #3148

				if(isHitTest !== true) {
					var iXPos = _self.didGetPanelHalfWidth();
					var pts = [
						{x:pt1.x, y:pt1.y}
					];

					// draw selection mark
					// _self.DrawSelectionMark(pts);
				}
			};
	    };

		// Alert
		var _doAlertUnitCFD = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doOpeaLineUnitBaseCFD();
			_doOpeaLineUnitBaseCFD.apply(this, arguments);

	        this.m_bOrder = false;
			this.m_bAlert = true;

	        this.didGetStyleInfo = function() {
				var xEnv = _self.didGetEnvInfo();
	            return(xEnv.AlertStyleConfig);
	        };

			this.didGetOepObjectInfo = function() {
				if(!_self.m_doParent) {
					return;
				}

				var result = {
					origin		: xUtils.didClone(_self.m_xObjectInfo),
					symbol		: _self.m_doParent.m_symbolInfo,
					symbolCode	: _self.m_doParent.m_symbolInfo.strCode,
					price 		: _self.m_xData2.curValue.y,
					isAlert		: true,
				};

				return(result);
			};
	    };

		// Execution
		var _doExecutionUnitCFD = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doOpeaMarkUnitBaseCFD();
			_doOpeaMarkUnitBaseCFD.apply(this, arguments);

	        this.m_bOrder = false;
			this.m_bExecution = true;

	        this.didGetStyleInfo = function() {
				var xEnv = _self.didGetEnvInfo();
	            return(xEnv.ExecutionStyleConfig);
	        };

			this.didGetOepObjectInfo = function() {
				if(!_self.m_doParent) {
					return;
				}

				var result = {
					origin		: xUtils.didClone(_self.m_xObjectInfo),
					symbol		: _self.m_doParent.m_symbolInfo,
					symbolCode	: _self.m_doParent.m_symbolInfo.strCode,
					price 		: _self.m_xData2.curValue.y,
					isExecution	: true,
				};

				return(result);
			};

			/**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest, extraDrawParam) {
				// check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;

				var __xPanelRect = _self.didGetPanelRect();

				//
				// calculate pixel position to draw
				//
				_self.m_xData1.curPos.x = 0;
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x   = __xPanelRect.width;
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);

				if(_self.m_bDummyObject === true) {
					// console.debug("[WGC] :" + _self.m_xData1);
				}

	            if(_self.m_xData1.curPos.y < 0 || _self.m_xData1.curPos.y > __xPanelRect.height) {
	                return;
	            }

				var pt1 = {
					x:_self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t),
					y:_self.GetYValToPos(_self.m_xData1.curValue.y)
				};

				// set to draw parameter
				var bSelect	  = _self.m_bSelect;
				if(extraDrawParam && extraDrawParam.offSelect == true) {
					bSelect = false;
				}

				var context   = _self.m_context;
	            var font      = _self.m_drawWrapper.m_stEnv.Font;
				var lineColor = _self.m_clrLineColor;
				var lineWidth = _self.m_nLineWeight;
	            var lineStyle = _self.m_nLineStyle;
	            var xStyleInfo = _self.didGetStyleInfo();
				var	bFill	  = true;
				var lineColor2= _self.m_clrLineColor; // #3148
	            if(xStyleInfo !== undefined && xStyleInfo != null) {
					if(_self.m_bDummyObject === true) {
						// #1811
						lineColor = xStyleInfo.dummy.strokeColor;
						lineWidth = xStyleInfo.dummy.strokeWeight;
						lineStyle = xStyleInfo.dummy.strokeStyle;
						lineColor2= lineColor; // #3148

						if(_self.m_xObjectInfo.ask === true) {
							lineColor = xStyleInfo.ask.strokeColor;
							lineColor2= xStyleInfo.ask.strokeColor2; // #3148
						}
						else if(_self.m_xObjectInfo.ask === false) {
							lineColor = xStyleInfo.bid.strokeColor;
							lineColor2= xStyleInfo.bid.strokeColor2; // #3148
						}
						//
					}
					else {
						if(_self.m_xObjectInfo.ask === true) {
							lineColor = xStyleInfo.ask.strokeColor;
			                lineWidth = xStyleInfo.ask.strokeWeight;
			                lineStyle = xStyleInfo.ask.strokeStyle;
							lineColor2= xStyleInfo.ask.strokeColor2; // #3148
						}
						else if(_self.m_xObjectInfo.ask === false) {
							lineColor = xStyleInfo.bid.strokeColor;
			                lineWidth = xStyleInfo.bid.strokeWeight;
			                lineStyle = xStyleInfo.bid.strokeStyle;
							lineColor2= xStyleInfo.bid.strokeColor2; // #3148
						}
						else {
							lineColor = xStyleInfo.default.strokeColor;
			                lineWidth = xStyleInfo.default.strokeWeight;
			                lineStyle = xStyleInfo.default.strokeStyle;
							lineColor2= lineColor; // #3148
						}
					}

					if(xStyleInfo.noFill === true) {
						bFill = false;
					}
	            }

				var xEnv    = _self.didGetEnvInfo();
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
					lineColor2= lineColor; // #3148
				}
				else {
					context   = _self.m_context;
					if(bSelect && xEnv.UseOepSelectedColor == true) { // #2059, #2440
						lineColor = xEnv.System.SelectedFill.lineColor;
						lineColor2= lineColor; // #3148
					}
				}

				if(extraDrawParam) {
					if(isHitTest) {
						context = extraDrawParam.memcontext;
					}
					else {
						context = extraDrawParam.context;
					}

					pt1.x = extraDrawParam.pt.x;
				}

	            var fontColor = lineColor;
				var fillColor = bFill == true ? lineColor : undefined;
				var fillColor2= bFill == true ? lineColor2 : undefined; // #3148
				var drawParam = {
					context:context,
					pt1:pt1,
					pt2:{x:0, y:0},
					pt3:{x:0, y:0},
					lineWidth:lineWidth,
					lineColor:lineColor,
					fillColor:fillColor
				};

				// #3148
				var triHalfWidth = 7 ;
				var triHeight    = 12;
				if(_self.m_xObjectInfo.ask != true) { // #2443
					drawParam.pt2.x = pt1.x - triHalfWidth;
					drawParam.pt2.y = pt1.y + triHeight;
					drawParam.pt3.x = pt1.x + triHalfWidth;
					drawParam.pt3.y = pt1.y + triHeight;
				}
				else {
					drawParam.pt2.x = pt1.x - triHalfWidth;
					drawParam.pt2.y = pt1.y - triHeight;
					drawParam.pt3.x = pt1.x + triHalfWidth;
					drawParam.pt3.y = pt1.y - triHeight;
				}

				gxDc.Triangle(drawParam);

				// #3148
				triHalfWidth    -= lineWidth;
				triHeight       -= lineWidth * 2;
				if(_self.m_xObjectInfo.ask != true) {
					pt1.y          += (lineWidth + 1);
					drawParam.pt1.y	= pt1.y
					drawParam.pt2.x = pt1.x - triHalfWidth;
					drawParam.pt2.y = pt1.y + triHeight;
					drawParam.pt3.x = pt1.x + triHalfWidth;
					drawParam.pt3.y = pt1.y + triHeight;
				}
				else {
					pt1.y          -= (lineWidth + 1);
					drawParam.pt1.y	= pt1.y
					drawParam.pt2.x = pt1.x - triHalfWidth;
					drawParam.pt2.y = pt1.y - triHeight;
					drawParam.pt3.x = pt1.x + triHalfWidth;
					drawParam.pt3.y = pt1.y - triHeight;
				}
				drawParam.lineColor = lineColor2;
				drawParam.fillColor	= fillColor2;
				gxDc.Triangle(drawParam);
				// [end] #3148

				if(isHitTest !== true) {
					var iXPos = _self.didGetPanelHalfWidth();
					var pts = [
						{x:pt1.x, y:pt1.y}
					];

					// draw selection mark
					// _self.DrawSelectionMark(pts);
				}
			};
	    };

		var _exports = {};

	    /**
	     * [didCreateOrderPositUnit description]
	     * @param  {[type]} bOrderOrPosit
	     * @param  {[type]} chartFrame
	     * @param  {[type]} drawWrapper
	     * @param  {[type]} doParent
	     * @param  {[type]} doContainer
	     * @param  {[type]} argUnitInfo
	     * @return {[type]}
	     */
		_exports.didCreateOrderPositUnit = function(bOrderOrPosit, chartFrame, drawWrapper, doParent, doContainer, argUnitInfo) {
			//
			//
			//
			var doLocal = null;

			if(bOrderOrPosit === true) {
				doLocal = new _doOrderUnitCFD();
			}
			else {
				doLocal = new _doPositUnitCFD();
			}

	        if(doLocal.didInitObject !== undefined) {
	            doLocal.didInitObject(chartFrame, drawWrapper, doParent, doContainer, argUnitInfo);
	        }

			return(doLocal);
		};

	    /**
	     * [didCreateAlertUnit description]
	     * @param  {[type]} chartFrame
	     * @param  {[type]} drawWrapper
	     * @param  {[type]} doParent
	     * @param  {[type]} doContainer
	     * @param  {[type]} argUnitInfo
	     * @return {[type]}
	     */
		_exports.didCreateAlertUnit = function(chartFrame, drawWrapper, doParent, doContainer, argUnitInfo) {
			//
			//
			//
			var doLocal = null;

			doLocal = new _doAlertUnitCFD();

	        if(doLocal.didInitObject !== undefined) {
	            doLocal.didInitObject(chartFrame, drawWrapper, doParent, doContainer, argUnitInfo);
	        }

			return(doLocal);
		};

		/**
	     * [didCreateExecutionUnit description]
	     * @param  {[type]} chartFrame
	     * @param  {[type]} drawWrapper
	     * @param  {[type]} doParent
	     * @param  {[type]} doContainer
	     * @param  {[type]} argUnitInfo
	     * @return {[type]}
	     */
		_exports.didCreateExecutionUnit = function(chartFrame, drawWrapper, doParent, doContainer, argUnitInfo) {
			//
			//
			//
			var doLocal = null;

			doLocal = new _doExecutionUnitCFD();

	        if(doLocal.didInitObject !== undefined) {
	            doLocal.didInitObject(chartFrame, drawWrapper, doParent, doContainer, argUnitInfo);
	        }

			return(doLocal);
		};

		return(_exports);
	};

	//console.debug("[MODUEL] Loading => chartDOExtraUnitCFD");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOExtraUnitCFD"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOOrderPositUnit"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./canvas2DUtil"),
				require("./chartDOOrderPositUnit")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDOExtraUnitCFD",
            ['ngc/chartUtil', 'ngc/canvas2DUtil', 'ngc/chartDOOrderPositUnit'],
                function(xUtils, gxDc, doBaseClassFactory) {
                    return loadModule(xUtils, gxDc, doBaseClassFactory);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOExtraUnitCFD"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOOrderPositUnit"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOExtraUnitCFD");
})(this);
