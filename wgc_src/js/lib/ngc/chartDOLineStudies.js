(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc, doBaseClass) {
	    "use strict";

		/**
		 * @class CChartTrendlineObj
		 *
		 */
		var _doLsTrendline = function() {
			//
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

	         /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;

				//
				// calculate pixel position to draw
				//
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				// console.debug("[WGC] LS:DrawTrendLine => " + _self.debug.toString());

				// set to draw parameter
				var xEnv	  = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context   = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1 : {
	                    x : _self.m_xData1.curPos.x,
	    				y : _self.m_xData1.curPos.y
	                },
	                pt2 : {
	    				x : _self.m_xData2.curPos.x,
	    				y : _self.m_xData2.curPos.y
	                },
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				gxDc.Line(drawLineParam);

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest);
	        };
	    };

	    var _doLsHorizontalLine = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

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
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);
				_self.m_xData2.curPos.x = __xPanelRect.width;
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				// set to draw parameter
				var xEnv    	= _self.didGetEnvInfo();
				var lineColor	= _self.didGetLineColor(xEnv);
				var lineWidth	= _self.m_nLineWeight;
				var context		= _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1 : {
	                    x : _self.m_xData1.curPos.x,
	    				y : _self.m_xData1.curPos.y
	                },
	                pt2 : {
	    				x : _self.m_xData2.curPos.x,
	    				y : _self.m_xData2.curPos.y
	                },
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				gxDc.Line(drawLineParam);

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest, {isHorz:true});
			};
	    };

	    var _doLsVerticalLine = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

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
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData1.curPos.y = 0;
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y   = __xPanelRect.height;

				// set to draw parameter
				var xEnv      = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context   = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1 : {
	                    x : _self.m_xData1.curPos.x,
	    				y : _self.m_xData1.curPos.y
	                },
	                pt2 : {
	    				x : _self.m_xData2.curPos.x,
	    				y : _self.m_xData2.curPos.y
	                },
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				gxDc.Line(drawLineParam);

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest, {isVert:true});
			};
	    };

	    var _doLsCrossLine = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

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
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData1.curPos.y = 0;
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				// set to draw parameter
				var xEnv      = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context	  = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1 : {
	                    x : _self.m_xData1.curPos.x,
	    				y : _self.m_xData1.curPos.y
	                },
	                pt2 : {
	    				x : _self.m_xData2.curPos.x,
	    				y : _self.m_xData2.curPos.y
	                },
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				// horizontal
				drawLineParam.pt1.x = 0;
				drawLineParam.pt1.y = _self.m_xData2.curPos.y;
				drawLineParam.pt2.x = __xPanelRect.width;
				drawLineParam.pt2.y = _self.m_xData2.curPos.y;
				gxDc.Line(drawLineParam);

				// vertical
				drawLineParam.pt1.x = _self.m_xData2.curPos.x
				drawLineParam.pt1.y = 0;
				drawLineParam.pt2.x = _self.m_xData2.curPos.x
				drawLineParam.pt2.y = __xPanelRect.height;
				gxDc.Line(drawLineParam);

				var ptCenter = {
					x:_self.m_xData2.curPos.x,
					y:_self.m_xData2.curPos.y
				};

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest, {targets:[ptCenter]});
			};
	    };

	    var _doLsRectangle = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

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
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				// set to draw parameter
				var xEnv      = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var fillColor = _self.didGetFillColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context	  = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
					fillColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					fillColor =
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawRectParam = {
		    		context : context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : lineWidth,
		    		lineColor : lineColor,
					fillColor : fillColor,
					fillAlpha : xEnv.TrendlineFillAlpha
		    	};

				drawRectParam.rect.x 		= _self.m_xData1.curPos.x;
	            drawRectParam.rect.y 		= _self.m_xData1.curPos.y;
				drawRectParam.rect.width 	= _self.m_xData2.curPos.x - _self.m_xData1.curPos.x;
	            drawRectParam.rect.height	= _self.m_xData2.curPos.y - _self.m_xData1.curPos.y;


				gxDc.Rectangle(drawRectParam);

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest);
			};
	    };

	    var _doLsTriangle = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

			// #1558
			this.didInitRemainCount = function() {
				_self.m_nRemainCount = 3;
			};
			this.didInitExtraPoint = function() {
				_self.m_bExtraPoint = true;
			};
			//

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
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				//
				if(_self.m_bCreating) {
					_self.m_xData3.curPos.x = _self.m_xData2.curPos.x
					_self.m_xData3.curPos.y = _self.m_xData1.curPos.y;
				}
				else {
					_self.m_xData3.curPos.x = _self.GetXValToPos(_self.m_xData3.curValue.x, _self.m_xData3.curValue.t);

					//
					// #476
					_self.m_xData3.curPos.y = _self.GetYValToPos(_self.m_xData3.curValue.y);
				}

				var pt3 = {x: _self.m_xData3.curPos.x, y: _self.m_xData3.curPos.y};

				// set to draw parameter
				var xEnv      = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var fillColor = _self.didGetFillColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context	  = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
					fillColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					fillColor =
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawParam = {
					context:context,
					pt1:{x:_self.m_xData1.curPos.x, y:_self.m_xData1.curPos.y},
					pt2:{x:_self.m_xData2.curPos.x, y:_self.m_xData2.curPos.y},
					pt3:pt3,
					lineWidth:lineWidth,
					lineColor:lineColor,
					fillColor:fillColor,
					fillAlpha:xEnv.TrendlineFillAlpha
				};

				gxDc.Triangle(drawParam);

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest);
			};
	    };

	    var _doLsCircle = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

	            // set to draw parameter
				var xEnv      = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var fillColor = _self.didGetFillColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context	  = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
					fillColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					fillColor =
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var __size   = {
					cx : _self.m_xData1.curPos.x - _self.m_xData1.curPos.x,
					cy : _self.m_xData1.curPos.y - _self.m_xData1.curPos.y
				};

				var __radius = Math.round(Math.sqrt(Math.pow(__size.cx, 2) + Math.pow(__size.cy, 2)));
				var __drawCircleParam = {
					context : context,
					pt : {
						x : _self.m_xData1.curPos.x,
						y : _self.m_xData1.curPos.y
					},
					radius : __radius,
					lineWeight : lineWidth,
					lineColor : lineColorr,
					fillColor : fillColor,
					fillAlpha:xEnv.TrendlineFillAlpha
				};

				gxDc.Circle(__drawCircleParam);

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest);
			};
		};

		/**
		 * fibonacci retracement
		 */
		var _doLsFibRetracement = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				var iHeight = Math.abs(_self.m_xData2.curPos.y - _self.m_xData1.curPos.y);
				var ratios = [0.618, 0.5, 0.382, 0.236, 0];
				var adjustHeights = [];
				for(var ii = 0; ii < ratios.length; ii++) {
					adjustHeights.push(Math.round(iHeight * ratios[ii]));
				}

				var xEnv      = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context	  = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				if(isHitTest) {
					context = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1 : {
	                    x : 0,
	    				y : 0
	                },
	                pt2 : {
	    				x : 0,
	    				y : 0
	                },
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				//
				drawLineParam.pt1.x = _self.m_xData1.curPos.x;
				drawLineParam.pt1.y = _self.m_xData1.curPos.y;
				drawLineParam.pt2.x = _self.m_xData2.curPos.x;
				drawLineParam.pt2.y = _self.m_xData2.curPos.y;
				gxDc.Line(drawLineParam);

				//_self.DrawLine({context:context, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:_self.m_xData2.curPos.x, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:lineColor});

				var nPosXLeft   = 0;
				var nPosXRight  = 0;
				var nPosYTop    = 0;
				var nPosYBottom	= 0;

				if(_self.m_xData1.curPos.x < _self.m_xData2.curPos.x) {
					nPosXLeft  = _self.m_xData1.curPos.x;
					nPosXRight = _self.m_xData2.curPos.x;
				}
				else {
					nPosXLeft  = _self.m_xData2.curPos.x;
					nPosXRight = _self.m_xData1.curPos.x;
				}

				if(_self.m_xData1.curPos.y < _self.m_xData2.curPos.y) {
					nPosYTop    = _self.m_xData1.curPos.y;
					nPosYBottom = _self.m_xData2.curPos.y;
				}
				else {
					nPosYTop    = _self.m_xData2.curPos.y;
					nPosYBottom = _self.m_xData1.curPos.y;
				}

				drawLineParam.pt1.x = nPosXLeft;
				drawLineParam.pt2.x = __xPanelRect.width;

				//
				drawLineParam.pt1.y =
				drawLineParam.pt2.y = nPosYTop;
				gxDc.Line(drawLineParam);

				for(var ii = 0; ii < adjustHeights.length; ii++) {
					drawLineParam.pt1.y =
					drawLineParam.pt2.y = nPosYBottom - adjustHeights[ii];
					gxDc.Line(drawLineParam);
				}

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest);
			};
		};

		/**
		 * fibonacci timezone
		 */
		var _doLsFibTimezone = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData1.curPos.y = 0;//_self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				var iXStartIdx, iXIdx, iXPos;
				var arrFiboTime = [1, 2, 3, 5, 8, 13, 21, 34, 58, 89, 144, 233, 377, 610, 987];
				iXStartIdx = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(_self.m_xData2.curPos.x, true);

				var iTotCount = _self.m_drawWrapper.GetBaseDataCount();

				var xEnv      = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context	  = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1 : {
	                    x : 0,
	    				y : 0
	                },
	                pt2 : {
	    				x : 0,
	    				y : __xPanelRect.height
	                },
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				for(var ii = 0; ii < arrFiboTime.length; ii++) {
					iXIdx = iXStartIdx + (arrFiboTime[ii] - 1);
					if (iXIdx > (iTotCount - 1))
						break;

					iXPos = _self.m_drawWrapper.GetXPosAtDataIndex(iXIdx);

					var __testIXPos = _self.m_drawWrapper.GetXPosAtDataIndex(iXIdx);

					drawLineParam.pt1.x =
					drawLineParam.pt2.x = iXPos;

					gxDc.Line(drawLineParam);

				}

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest, {isVert:true});
			};
		};

		/**
		 * fibonacci fan
		 */
		var _doLsFibFan = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				var ratios = [0.618, 0.5, 0.382, 0.236];

				var xEnv      = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context	  = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1 : {
	                    x : 0,
	    				y : 0
	                },
	                pt2 : {
	    				x : 0,
	    				y : __xPanelRect.height
	                },
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				//
				drawLineParam.pt1.x = _self.m_xData1.curPos.x;
				drawLineParam.pt1.y = _self.m_xData1.curPos.y;
				drawLineParam.pt2.x = _self.m_xData2.curPos.x;
				drawLineParam.pt2.y = _self.m_xData2.curPos.y;
				gxDc.Line(drawLineParam);

				//_self.DrawLine({context:context, startX:_self.m_xData1.curPos.x, startY:_self.m_xData1.curPos.y, endX:_self.m_xData2.curPos.x, endY:_self.m_xData2.curPos.y, lineWidth:1, lineColor:lineColor});

				var nPosXLeft   = 0;
				var nPosXRight  = 0;
				var nPosYTop    = 0;
				var nPosYBottom	= 0;

				if(_self.m_xData1.curPos.x < _self.m_xData2.curPos.x) {
					nPosXLeft  = _self.m_xData1.curPos.x;
					nPosXRight = _self.m_xData2.curPos.x;
				}
				else {
					nPosXLeft  = _self.m_xData2.curPos.x;
					nPosXRight = _self.m_xData1.curPos.x;
				}

				if(_self.m_xData1.curPos.y < _self.m_xData2.curPos.y) {
					nPosYTop    = _self.m_xData1.curPos.y;
					nPosYBottom = _self.m_xData2.curPos.y;
				}
				else {
					nPosYTop    = _self.m_xData2.curPos.y;
					nPosYBottom = _self.m_xData1.curPos.y;
				}

				var nYDiff = (_self.m_xData2.curPos.y  - _self.m_xData1.curPos.y);
				var nXDiff = Math.abs(_self.m_xData2.curPos.x  - _self.m_xData1.curPos.x);
				if(nXDiff != 0) {
					if(_self.m_xData1.curPos.x < _self.m_xData2.curPos.x) {
						drawLineParam.pt2.x = __xPanelRect.width;
						var nXDiff1 = Math.abs(_self.m_xData1.curPos.x - drawLineParam.pt2.x);
						for(var ii = 0; ii < ratios.length; ii++) {
							var temp1 = _self.m_xData1.curPos.y + nXDiff1 * nYDiff * ratios[ii] / nXDiff;

							drawLineParam.pt2.y = Math.round(temp1);
							gxDc.Line(drawLineParam);
						}
					}
					else {
						drawLineParam.pt2.x = 0;
						var nXDiff1 = Math.abs(_self.m_xData1.curPos.x - drawLineParam.pt2.x);
						for(var ii = 0; ii < ratios.length; ii++) {
							var temp1 = _self.m_xData1.curPos.y + nXDiff1 * nYDiff * ratios[ii] / nXDiff;

							drawLineParam.pt2.y = Math.round(temp1);
							gxDc.Line(drawLineParam);
						}
					}
				}

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest);
			};
		};

		/**
		 * fibonacci arc
		 */
		var _doLsFibArc = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				var xEnv	  = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var fillColor = _self.didGetFillColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context   = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
					fillColor = _self.m_clrHitTestColor;;
				}
				else {
					context   = _self.m_context;
					fillColor =
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1: {
						x:_self.m_xData1.curPos.x,
						y:_self.m_xData1.curPos.y
					},
					pt2: {
						x:_self.m_xData2.curPos.x,
						y:_self.m_xData2.curPos.y
					},
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				var drawArcParam = {
					context:context,
					pt : {
						x : _self.m_xData1.curPos.x,
						y : _self.m_xData1.curPos.y
					},
					radius : 0,
					anticlockwise : true,
					degree : {
						from : 0,
						to : 0
					},
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				var ratios = [0.618, 0.5, 0.382, 0.236];

				//
				drawLineParam.pt1.x = _self.m_xData1.curPos.x;
				drawLineParam.pt1.y = _self.m_xData1.curPos.y;
				drawLineParam.pt2.x = _self.m_xData2.curPos.x;
				drawLineParam.pt2.y = _self.m_xData2.curPos.y;
				gxDc.Line(drawLineParam);

				var nPosXLeft   = 0;
				var nPosXRight  = 0;
				var nPosYTop    = 0;
				var nPosYBottom	= 0;

				if(_self.m_xData1.curPos.x < _self.m_xData2.curPos.x) {
					nPosXLeft  = _self.m_xData1.curPos.x;
					nPosXRight = _self.m_xData2.curPos.x;
				}
				else {
					nPosXLeft  = _self.m_xData2.curPos.x;
					nPosXRight = _self.m_xData1.curPos.x;
				}

				if(_self.m_xData1.curPos.y < _self.m_xData2.curPos.y) {
					nPosYTop    = _self.m_xData1.curPos.y;
					nPosYBottom = _self.m_xData2.curPos.y;
				}
				else {
					nPosYTop    = _self.m_xData2.curPos.y;
					nPosYBottom = _self.m_xData1.curPos.y;
				}

				var nYDiff = (_self.m_xData2.curPos.y  - _self.m_xData1.curPos.y);
				var nXDiff = (_self.m_xData2.curPos.x  - _self.m_xData1.curPos.x);
				var nRadius= Math.round(Math.sqrt(Math.pow(nXDiff, 2) + Math.pow(nYDiff, 2)));

				drawArcParam.radius = nRadius;
				drawArcParam.degree.from = 0;
				drawArcParam.degree.to = 180;
				if(nXDiff != 0) {
					if(_self.m_xData1.curPos.y < _self.m_xData2.curPos.y) {
						drawArcParam.anticlockwise = false;
						for(var ii = 0; ii < ratios.length; ii++) {
							drawArcParam.radius = Math.round(nRadius * ratios[ii]);
							gxDc.Arc(drawArcParam);
						}
					}
					else {
						drawArcParam.anticlockwise = true;
						for(var ii = 0; ii < ratios.length; ii++) {
							drawArcParam.radius = Math.round(nRadius * ratios[ii]);
							gxDc.Arc(drawArcParam);
						}
					}
				}

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest);
			};
		};

		/**
		 * trend line by angle
		 */
		var _doLsTrenlineByAngle = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				var xEnv	  = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var fillColor = _self.didGetFillColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context   = _self.m_context;
				var font 	  = xEnv.Font;
				var fontColor = xEnv.FontColor;
				var radius    = 30;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
					fillColor = _self.m_clrHitTestColor;;
				}
				else {
					context   = _self.m_context;
					fillColor =
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawParam = {
					context:context,
					pt1: {
						x:_self.m_xData1.curPos.x,
						y:_self.m_xData1.curPos.y
					},
					pt2: {
						x:_self.m_xData2.curPos.x,
						y:_self.m_xData2.curPos.y
					},
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				var drawArcParam = {
					context:context,
					pt : {
						x : _self.m_xData1.curPos.x,
						y : _self.m_xData1.curPos.y
					},
					radius : 0,
					anticlockwise : true,
					degree : {
						from : 0,
						to : 0
					},
					lineWidth:lineWidth,
					lineColor:lineColor
				};

	            var drawTextParam = {
					context : context,
					pt : {
						x : 0,
						y : 0
					},
					text : '',
					font : font,
					fillStyle : lineColor
				};

				// main line
				gxDc.Line(drawParam);

				// 0 base line
				// calculate length
				var nLineLength = Math.sqrt((Math.pow(_self.m_xData2.curPos.x - _self.m_xData1.curPos.x, 2) + Math.pow(_self.m_xData1.curPos.y - _self.m_xData2.curPos.y, 2)));
				drawParam.pt2.x = _self.m_xData1.curPos.x + nLineLength;
				drawParam.pt2.y = _self.m_xData1.curPos.y;
				drawParam.lineStyle = gxDc.penstyle.dash;
				gxDc.Line(drawParam);

				var iRad, iAngle, iXVal, iYVal;
				var anticlockwise = true;	// 時計反対方向の角度を使用
				//
				// ARCはanticlockwiseに関係なく次のように角度（DEGREE）を使用する。
				// 　　　　　｜２７０
				// 　　　　　｜
				// １８０　　｜　　　　０
				// ーーーーー✛ーーーーー
				// 　　　　　｜
				// 　　　　　｜
				// 　　　　　｜９０
				// そのため、表示角度ど使用角度を別にする必要がある。
				//
				var degreeDisplay;
				var displayUpside = true;

				// 270 - 0 - 90
				if (_self.m_xData1.curPos.x <= _self.m_xData2.curPos.x) {
					// 1st quadrant
					if (_self.m_xData1.curPos.y >= _self.m_xData2.curPos.y) {
						iRad = Math.atan2(_self.m_xData1.curPos.y - _self.m_xData2.curPos.y, _self.m_xData2.curPos.x - _self.m_xData1.curPos.x);
						iAngle = -((iRad * 180)/Math.PI);
						degreeDisplay = -1 * iAngle;
						anticlockwise = true;
						drawArcParam.degree.from = 0;
						drawArcParam.degree.to = iAngle;

						displayUpside = true;
					}
					// 4th quadrant(270 - 360)
					else if (_self.m_xData1.curPos.y < _self.m_xData2.curPos.y) {
						iRad = Math.atan2(_self.m_xData2.curPos.y - _self.m_xData1.curPos.y, _self.m_xData2.curPos.x - _self.m_xData1.curPos.x);
						iAngle = (iRad * 180)/Math.PI;
						degreeDisplay = iAngle;
						anticlockwise = false;
						drawArcParam.degree.from = 0;
						drawArcParam.degree.to = iAngle;

						displayUpside = false;
					}
				}
				// 90 - 180 - 270
				else {
					// 2nd quadrant
					if (_self.m_xData1.curPos.y >= _self.m_xData2.curPos.y) {
						iRad = Math.atan2(_self.m_xData1.curPos.y - _self.m_xData2.curPos.y, _self.m_xData1.curPos.x - _self.m_xData2.curPos.x);
						iAngle = -(180 - (iRad * 180)/Math.PI);
						degreeDisplay = -1 * iAngle;
						anticlockwise = true;
						drawArcParam.degree.from = 0;
						drawArcParam.degree.to = iAngle;

						displayUpside = true;
					}
					// 3rd quadrant
					else if (_self.m_xData1.curPos.y < _self.m_xData2.curPos.y) {
						iRad = Math.atan2(_self.m_xData2.curPos.y - _self.m_xData1.curPos.y, _self.m_xData1.curPos.x - _self.m_xData2.curPos.x);
						iAngle = 180 - (iRad * 180)/Math.PI;
						degreeDisplay = iAngle;
						anticlockwise = false;
						drawArcParam.degree.from = 0;
						drawArcParam.degree.to = iAngle;

						displayUpside = false;
					}
				}

				// console.debug("[WGC] Angle : " + iAngle);

				var radiusRatio = 0.37;
				radius = Math.min(nLineLength * radiusRatio, radius);
				if(radius >= 3) {
					drawArcParam.radius = radius;
					drawArcParam.anticlockwise = anticlockwise;
					gxDc.Arc(drawArcParam);
				}

				// draw title
				var title = degreeDisplay.toFixed(2).toString();
	            var titleLen = context.measureText(title).width;
				var drawTextPoint;

	            drawTextParam.text = title;
	            drawTextParam.pt.x = _self.m_xData1.curPos.x + nLineLength - titleLen * 1.5;
				if(displayUpside === true) {
	            	drawTextParam.pt.y = _self.m_xData1.curPos.y - 10;
				}
				else {
					drawTextParam.pt.y = _self.m_xData1.curPos.y + 10;
				}
	            gxDc.TextOut(drawTextParam);

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest);
			};
		};

		/**
		 * gan fan up
		 */
		var _doLsGanFanUp = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData1.curPos.y = 0;
				_self.m_xData2.curPos.x = _self.m_xData1.curPos.x;
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);
				// console.debug("[WGC] :" + _self.m_xData1.curPos.x);
				var arrGannFan = [];
				var gannFans = [
					1,
					1.0/2.0,
					1.0/3.0,
					1.0/4.0,
					1.0/8.0,
					2,
					3,
					4,
					8
				];

				var nCount = gannFans.length;
				var nBase  = __xPanelRect.width - _self.m_xData1.curPos.x;

				//
				for(var ii = 0; ii < nCount; ii++) {
					var nHeight = _self.m_xData2.curPos.y - (nBase * gannFans[ii]);

					arrGannFan.push(nHeight);
				}

				var xEnv	  = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context   = _self.m_context;

				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1 : {
						x:_self.m_xData2.curPos.x,
						y:_self.m_xData2.curPos.y
					},
					pt2 : {
						x:__xPanelRect.width,
						y:0
					},
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				for(var ii = 0; ii < arrGannFan.length; ii++) {
					drawLineParam.pt2.y = parseInt(arrGannFan[ii]);
					gxDc.Line(drawLineParam);
				}

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest, {isVertex:true});
			};
		};

		/**
		 * gan fan down
		 */
		var _doLsGanFanDown = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData1.curPos.y = 0;
				_self.m_xData2.curPos.x = _self.m_xData1.curPos.x;
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);
				// console.debug("[WGC] :" + _self.m_xData1.curPos.x);
				var arrGannFan = [];
				var gannFans = [
					1,
					1.0/2.0,
					1.0/3.0,
					1.0/4.0,
					1.0/8.0,
					2,
					3,
					4,
					8
				];

				var nCount = gannFans.length;
				var nBase  = __xPanelRect.width - _self.m_xData1.curPos.x;

				for(var ii = 0; ii < nCount; ii++) {
					var nHeight = _self.m_xData2.curPos.y + (nBase * gannFans[ii]);

					arrGannFan.push(nHeight);
				}

				/*
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/2.0)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/3.0)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/4.0)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(1.0/8.0)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(2)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(3)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(4)));
				arrGannFan.push(_self.m_xData2.curPos.y + (__xPanelRect.width - _self.m_xData2.curPos.x) * Math.tan(Math.atan(8)));
				*/
				var xEnv	  = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context   = _self.m_context;

				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1 : {
						x:_self.m_xData2.curPos.x,
						y:_self.m_xData2.curPos.y
					},
					pt2 : {
						x:__xPanelRect.width,
						y:0
					},
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				for(var ii = 0; ii < arrGannFan.length; ii++) {
					drawLineParam.pt2.y = parseInt(arrGannFan[ii]);
					gxDc.Line(drawLineParam);
				}

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest, {isVertex:true});
			};
		};

		/**
		 * text
		 * added by choi sunwoo at 2017.05.17 for #722
		 */
		var _doLsText = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

			// #717

			//
			this.m_strText = xUtils.constants.trendLineDefault.text;

			/**
			 * 描画ツール特有の設定をロードする。
			 * @param  {[type]} argLoadInfo
			 * @return {[type]}
			 */
			this.didSetLoadInfoRest = function(argLoadInfo) {
				if(argLoadInfo === undefined || argLoadInfo == null) {
					return(false);
				}

				if(argLoadInfo.textInfo !== undefined && argLoadInfo.textInfo != null) {
					if(argLoadInfo.textInfo.text) {
						_self.m_strText = argLoadInfo.textInfo.text;
					}

					return(true);
				}
				else if(argLoadInfo.t !== undefined && argLoadInfo.t != null) {
					_self.m_strText = argLoadInfo.t;

					return(true);
				}

				return(false);
			};

			/**
			 * 描画ツールの特有の情報を入れておく。
			 * @param  {[type]} argSaveInfo
			 * @param  {[type]} isKv
			 * @return {[type]}
			 */
			this.didAppendRestObjectSaveInfo = function(argSaveInfo, isKv) {
				if(argSaveInfo === undefined || argSaveInfo == null) {
					return(false);
				}

				argSaveInfo.t = _self.m_strText;

				return(true);
			}

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);
				_self.m_xData2.curPos.x = _self.m_xData1.curPos.x;
				_self.m_xData2.curPos.y = _self.m_xData1.curPos.y;

				var xEnv	  = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context   = _self.m_context;
				var font 	  = xEnv.Font;
				var fontColor = _self.didGetFontColor(xEnv);
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
					fontColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					fontColor =
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				fontColor = lineColor;

				var drawParam = {
					context:context,
					pt1 : {
						x:_self.m_xData1.curPos.x,
						y:_self.m_xData1.curPos.y
					},
					pt2 : {
						x:__xPanelRect.width,
						y:0
					},
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				var drawRectParam = {
		    		context : context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : lineWidth,
		    		lineColor : lineColor
		    	};

				var drawTextParam = {
					context : context,
					pt : {
						x : 0,
						y : 0
					},
					text : _self.m_strText,
					font : font,
					fillStyle : lineColor,
					useMultiline : true,
					// useBox : true
				};

				var x1CharInfo = gxDc.MeasureDefaultText(context);
				var n1CharWidth = x1CharInfo.width;
				var nLineHeight = x1CharInfo.height;

				drawTextParam.pt.x = _self.m_xData1.curPos.x;
				drawTextParam.pt.y = _self.m_xData1.curPos.y;

				var outRect = {

				};
				gxDc.TextOut(drawTextParam, false, outRect);

				// #1802
				drawRectParam.rect.x = outRect.x;
				drawRectParam.rect.y = outRect.y;
				drawRectParam.rect.width = outRect.width;
				drawRectParam.rect.height = outRect.height;
				gxDc.Rectangle(drawRectParam);
				//

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest, {targets:[{x:outRect.x, y:outRect.y}]});
			};

			//
			this.didApplySimpleAttribute = function(color, text) {
				_self.m_clrLineColor = color;
				_self.m_clrFillColor = color;

				_self.m_strText		 = text;

				return(true);
			};

			this.didGetText = function() {
				return(_self.m_strText);
			};
		};

		/**
		 * tooltip text
		 * #1516
		 */
		var _doLsTooltipText = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doLsText();
			_doLsText.apply(this, arguments);

			this.m_bUp = true;

			this.didSetState = function(state) {
				if(state) {
					if(state.nonTouch !== undefined && state.nonTouch != null) {
						_self.m_bNonTouch = state.nonTouch;
					}

					if(state.hide !== undefined && state.hide != null) {
						_self.hide = state.hide;
					}
				}
			};

			// #3285
			this.didGetFontColor = function(xEnv) {
				return(_self.m_clrFontColor);
			};
			//

			/**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {
	            // check to hittest or draw
				var isHitTest = (bHitTest !== undefined && bHitTest) ? true : false;
				var __xPanelRect = _self.didGetPanelRect();

				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);
				_self.m_xData2.curPos.x = _self.m_xData1.curPos.x;
				_self.m_xData2.curPos.y = _self.m_xData1.curPos.y;

				var xEnv	  = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context   = _self.m_context;
				var font 	  = xEnv.Font;
				var fontColor = _self.didGetFontColor(xEnv);
				var	fillColor = _self.didGetFillColor(xEnv);
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
					fontColor = _self.m_clrHitTestColor;
					fillColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					fillColor = _self.didGetSelectedColor(_self.m_bSelect, fillColor, xEnv.System.SelectedFill.fillColor);
					fontColor = _self.didGetSelectedColor(_self.m_bSelect, fontColor, xEnv.System.SelectedFill.lineColor); // #3285
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawTextParam = {
					context : context,
					pt : {
						x : 0,
						y : 0
					},
					text : _self.m_strText,
					font : font,
					fillStyle : fontColor,
					useMultiline : true,
					useBox : false
				};

				var drawPolygonParam = {
					context:context,
					pt1s:[],
					pt2s:[],
					lineWidth:lineWidth,
					lineColor:lineColor,
					fillColor:fillColor,
				};

				drawTextParam.pt.x = _self.m_xData1.curPos.x;
				drawTextParam.pt.y = _self.m_xData1.curPos.y;

				var outRect = {

				};

				var textRect = {};
				gxDc.DrawText(drawTextParam, true, textRect);

				// var textRect = gxDc.CalcRect2(_self.m_strText, font);
				textRect.x = _self.m_xData1.curPos.x - parseInt(textRect.width / 2);

				if(_self.m_bUp) {
					textRect.y = _self.m_xData1.curPos.y - 10 - textRect.height;
				}
				else {
					textRect.y = _self.m_xData1.curPos.y + 10;
				}

				var pt = {x:0, y:0};

				pt.x = textRect.x;
				pt.y = textRect.y;

				if(_self.m_bUp) {
					drawPolygonParam.pt1s.push({x:textRect.x, y:textRect.y});
					drawPolygonParam.pt1s.push({x:textRect.x + textRect.width, y:textRect.y});
					drawPolygonParam.pt1s.push({x:textRect.x + textRect.width, y:textRect.y + textRect.height});
					drawPolygonParam.pt1s.push({x:_self.m_xData1.curPos.x + 5, y:textRect.y + textRect.height});
					drawPolygonParam.pt1s.push({x:_self.m_xData1.curPos.x,  y:textRect.y + textRect.height + 5});
					drawPolygonParam.pt1s.push({x:_self.m_xData1.curPos.x - 5, y:textRect.y + textRect.height});
					drawPolygonParam.pt1s.push({x:textRect.x, y:textRect.y + textRect.height});
					drawPolygonParam.pt1s.push({x:textRect.x, y:textRect.y});
				}
				else {
					drawPolygonParam.pt1s.push({x:textRect.x, y:textRect.y});
					drawPolygonParam.pt1s.push({x:_self.m_xData1.curPos.x - 5, y:textRect.y});
					drawPolygonParam.pt1s.push({x:_self.m_xData1.curPos.x, y:_self.m_xData1.curPos.y});
					drawPolygonParam.pt1s.push({x:_self.m_xData1.curPos.x + 5, y:textRect.y});
					drawPolygonParam.pt1s.push({x:textRect.x + textRect.width, y:textRect.y});
					drawPolygonParam.pt1s.push({x:textRect.x + textRect.width, y:textRect.y + textRect.height});
					drawPolygonParam.pt1s.push({x:textRect.x, y:textRect.y + textRect.height});
					drawPolygonParam.pt1s.push({x:textRect.x, y:textRect.y});
				}

				drawTextParam.rect = textRect;

				// #3285
				gxDc.Polygon(drawPolygonParam);
				gxDc.DrawText(drawTextParam, false, outRect);
				// [end] #3285
			};

			//
			this.didApplySimpleAttribute = function(color, text, bUp, fillColor, lineColor, fontColor) {
				if(color !== undefined && color != null) {
					_self.m_clrLineColor = color;
					_self.m_clrFillColor = color;
				}

				if(fillColor !== undefined && fillColor != null) {
					_self.m_clrFillColor = fillColor;
				}

				if(lineColor !== undefined && lineColor != null) {
					_self.m_clrLineColor = lineColor;
				}

				if(fontColor !== undefined && fontColor != null) {
					_self.m_clrFontColor = fontColor;
				}

				if(text !== undefined && text != null) {
					_self.m_strText = text;
				}

				if(bUp !== undefined && bUp != null) {
					_self.m_bUp = bUp;
				}

				return(true);
			};
		};

		var _doLsOrderLine = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

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
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);
				_self.m_xData2.curPos.x = __xPanelRect.width;
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				// set to draw parameter
				var xEnv    	= _self.didGetEnvInfo();
				var font        = xEnv.Font;
				var lineColor	= _self.didGetLineColor(xEnv);
				var lineWidth	= _self.m_nLineWeight;
				var context		= _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
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
					lineColor:lineColor
				};

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

				// hittest
				gxDc.Line(drawLineParam);

				var strDisp = "新規注文";

	            var textRect = gxDc.CalcRect2(strDisp, font);
	            drawRectParam.rect.width = textRect.width + 5;
	            drawRectParam.rect.height= textRect.height;
	            drawRectParam.rect.x = 5;
	            drawRectParam.rect.y = _self.m_xData2.curPos.y - parseInt(textRect.height / 2);
	            gxDc.Rectangle(drawRectParam);

	            drawTextParam.text = strDisp;
	            drawTextParam.pt.x = 5 + 2;
	            drawTextParam.pt.y = _self.m_xData2.curPos.y;
	            gxDc.TextOut(drawTextParam);

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest, {isHorz:true});
			};

			//
			this.isAutoDeleteObject = function() {
				return(true);
			};

			this.didGetNewOrderValue = function() {
				if(!_self.m_doParent) {
					return;
				}

				var result = {
					symbol		: _self.m_doParent.m_symbolInfo,
					symbolCode	: _self.m_doParent.m_symbolInfo.strCode,
					price 		: _self.m_xData2.curValue.y
				};

				return(result);
			};
	    };

		// #1558
		var _doLsDoubleTrendline = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

			// #1558
			this.didInitRemainCount = function() {
				_self.m_nRemainCount = 3;
			};
			this.didInitExtraPoint = function() {
				_self.m_bExtraPoint = true;
			};
			//

			/**
			 * set extra point(for 3points object)
			 * @param[in] posval	{XPos:, YPos:}
			 */
			this.SetExtraPoint = function(posval, isSet) {
				if(posval !== undefined && posval != null) {
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
					//
					_self.m_xData3.curPos.x = _self.m_xData2.curPos.x;
					_self.m_xData3.curPos.y = _self.m_xData2.curPos.y + 30;

					_self.m_xData3.curValue.x = _self.m_xData2.curValue.x;
					_self.m_xData3.curValue.y = _self.GetYPosToVal(_self.m_xData3.curPos.y);
				}
			};

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
				_self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x, _self.m_xData1.curValue.t);
				_self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);
				_self.m_xData2.curPos.x = _self.GetXValToPos(_self.m_xData2.curValue.x, _self.m_xData2.curValue.t);
				_self.m_xData2.curPos.y = _self.GetYValToPos(_self.m_xData2.curValue.y);

				//
				if(_self.m_bCreating) {
					//
					_self.m_xData3.curPos.x = _self.m_xData2.curPos.x;
					_self.m_xData3.curPos.y = _self.m_xData2.curPos.y + 30;
				}
				else {
					_self.m_xData3.curPos.x = _self.GetXValToPos(_self.m_xData3.curValue.x, _self.m_xData3.curValue.t);

					//
					// #476
					_self.m_xData3.curPos.y = _self.GetYValToPos(_self.m_xData3.curValue.y);
				}

				var pt3 = {x: _self.m_xData3.curPos.x, y: _self.m_xData3.curPos.y};

				// set to draw parameter
				var xEnv      = _self.didGetEnvInfo();
				var lineColor = _self.didGetLineColor(xEnv);
				var fillColor = _self.didGetFillColor(xEnv);
				var lineWidth = _self.m_nLineWeight;
				var context	  = _self.m_context;
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
					fillColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					fillColor =
					lineColor = _self.didGetSelectedColor(_self.m_bSelect, lineColor, xEnv.System.SelectedFill.lineColor);
				}

				var drawLineParam = {
					context:context,
					pt1 : {
	                    x : _self.m_xData1.curPos.x,
	    				y : _self.m_xData1.curPos.y
	                },
	                pt2 : {
	    				x : _self.m_xData2.curPos.x,
	    				y : _self.m_xData2.curPos.y
	                },
					lineWidth:lineWidth,
					lineColor:lineColor
				};

				gxDc.Line(drawLineParam);

				// calc extra line
				drawLineParam.pt1.x = _self.m_xData3.curPos.x - (_self.m_xData2.curPos.x - _self.m_xData1.curPos.x);
				drawLineParam.pt1.y = _self.m_xData3.curPos.y - (_self.m_xData2.curPos.y - _self.m_xData1.curPos.y);
				drawLineParam.pt2.x = _self.m_xData3.curPos.x;
				drawLineParam.pt2.y = _self.m_xData3.curPos.y;

				gxDc.Line(drawLineParam);

				if(_self.m_bCreating == true || _self.m_bSelect === true) {
					drawLineParam.pt1.x = _self.m_xData2.curPos.x;
					drawLineParam.pt1.y = _self.m_xData2.curPos.y;
					drawLineParam.pt2.x = _self.m_xData3.curPos.x;
					drawLineParam.pt2.y = _self.m_xData3.curPos.y;

					drawLineParam.lineColor = xEnv.System.SelectedFill.lineColor;
					drawLineParam.lineStyle	= gxDc.penstyle.dash;
					drawLineParam.lineWeight= 1;

					gxDc.Line(drawLineParam);
				}

				// draw selected mark
				_self.didDrawSelectedMark(isHitTest);
			};
	    };
		// [end] #1558

		var _exports = {};

		_exports.didCreateLineStudyInstance = function(argCode, argObjectInfo) {
			//
			//
			//
			var doLsLocal = null;

			if(argCode === xUtils.constants.trendLineCodes.trendLine) {
				doLsLocal = new _doLsTrendline();
			}
			else if(argCode === xUtils.constants.trendLineCodes.horzLine) {
				doLsLocal = new _doLsHorizontalLine();
			}
			else if(argCode === xUtils.constants.trendLineCodes.vertLine) {
				doLsLocal = new _doLsVerticalLine();
			}
			else if(argCode === xUtils.constants.trendLineCodes.crossLine) {
				doLsLocal = new _doLsCrossLine();
			}
			else if(argCode === xUtils.constants.trendLineCodes.rectangle) {
				doLsLocal = new _doLsRectangle();
			}
			else if(argCode === xUtils.constants.trendLineCodes.triangle) {
				doLsLocal = new _doLsTriangle();
			}
			else if(argCode === xUtils.constants.trendLineCodes.circle) {
				doLsLocal = new _doLsCircle();
			}
			else if(argCode === xUtils.constants.trendLineCodes.trendLineByAngle) {
				doLsLocal = new _doLsTrenlineByAngle();
			}
			else if(argCode === xUtils.constants.trendLineCodes.fiboArc) {
				doLsLocal = new _doLsFibArc();
			}
			else if(argCode === xUtils.constants.trendLineCodes.fiboFan) {
				doLsLocal = new _doLsFibFan();
			}
			else if(argCode === xUtils.constants.trendLineCodes.fiboRetracement) {
				doLsLocal = new _doLsFibRetracement();
			}
			else if(argCode === xUtils.constants.trendLineCodes.fiboTimezone) {
				doLsLocal = new _doLsFibTimezone();
			}
			else if(argCode === xUtils.constants.trendLineCodes.ganFanUp) {
				doLsLocal = new _doLsGanFanUp();
			}
			else if(argCode === xUtils.constants.trendLineCodes.ganFanDown) {
				doLsLocal = new _doLsGanFanDown();
			}
			else if(argCode === xUtils.constants.trendLineCodes.text) {
				doLsLocal = new _doLsText();
			}
			else if(argCode === xUtils.constants.trendLineCodes.orderLine) {
				doLsLocal = new _doLsOrderLine();
			}
			else if(argCode === xUtils.constants.trendLineCodes.tooltipText) {
				doLsLocal = new _doLsTooltipText();
			}
			// #1558
			else if(argCode === xUtils.constants.trendLineCodes.doubleTrendline) {
				doLsLocal = new _doLsDoubleTrendline();
			}
			//

			return(doLsLocal);
		};


		return(_exports);
	};

	//console.debug("[MODUEL] Loading => chartDOLineStudies");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOLineStudies"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOLineStudyBase"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./canvas2DUtil"),
				require("./chartDOLineStudyBase")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDOLineStudies",
            ['ngc/chartUtil', 'ngc/canvas2DUtil', 'ngc/chartDOLineStudyBase'],
                function(xUtils, gxDc, doBaseClass) {
                    return loadModule(xUtils, gxDc, doBaseClass);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOLineStudies"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOLineStudyBase"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOLineStudies");
})(this);
