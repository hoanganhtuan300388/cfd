(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc) {
		"use strict";

		var exports = function(chartWrapper, drawWrapper) {
			//
			// private
			//
			var _self = this;
			var _chartWrapper = chartWrapper;
			var _drawWrapper = drawWrapper;

			//
			this.OBJECT_NAME = "EXTRA_LAYOUT";

			this.m_chartWrapper = _chartWrapper;
			this.m_drawWrapper  = _drawWrapper;

			this.m_domElemRoot	= null;
			this.m_canvas   	= null;
			this.m_context		= null;
			this.m_memcanvas	= null;

			this.m_rectInfo = {
				x: 0, y: 0, width: 0, height: 0, lw: 0, rw: 0
			};

			_self.m_xDoExtraSelected = null;

			/**
			 * @param[in] initParam		initParam = {root : null, onMouseDown: null, onMouseMove: null, onClose: null}
			 */
			this.didInitElements = function(domElemRoot) {
				if(!domElemRoot) {
					return;
				}

				var xEnv = _self.didGetEnvInfo();

				_self.m_domElemRoot = domElemRoot;

				var __deParent = _self.m_domElemRoot;

				// draw area(canvas)
				_self.m_canvas   = document.createElement("canvas");
				_self.m_canvas.setAttributeNS( null, "id", "eidExtraPanelItem");
				_self.m_canvas.className = "classExtraPanelItem";
				_self.m_canvas.style.backgroundColor = xEnv.ExtraPanelBackground;
				_self.m_canvas.style.visibility = xUtils.didGetAxisPanelVisibility(xEnv); // #2247

				//
				_self.m_domElemRoot.appendChild(_self.m_canvas);

				//
				//
				//
				_self.didInitContext();
			};

			/**
			 * init context
			 */
			this.didInitContext = function() {
				//
				_self.m_context = _self.m_canvas.getContext('2d');

				//
				_self.m_memcanvas = document.createElement('canvas');
				_self.m_memcanvas.width = _self.m_canvas.width;
				_self.m_memcanvas.height = _self.m_canvas.height;
				_self.m_memcontext = _self.m_memcanvas.getContext('2d');
			};

			/**
			 * init panel
			 *
			 * @param[in] bMainFrame	is mainframe or not
			 * @param[in] initParam		initParam = {root : null, onMouseDown: null, onMouseMove: null, onClose: null}
			 */
			this.didInitPanel = function(domElemRoot) {
				//
				_self.didInitElements(domElemRoot);
			};

			/**
			 *
			 */
			this.didDraw = function() {
				var xEnv = _self.didGetEnvInfo();

				_self.m_canvas.style.backgroundColor = xEnv.BackgroundColor;

				if (_self.m_context === _self.mctx) {
					_self.m_context.fillStyle = 'black';
				} else {
					_self.m_context.fillStyle = _self.fill;
				}

				if (_self.m_rectInfo.width < 0 || _self.m_rectInfo.height < 0) {
					return;
				}

				// #2285
				_self.m_context.clearRect(0, 0, _self.m_canvas.width, 1);
				_self.m_context.clearRect(0, 0, _self.m_canvas.width, _self.m_canvas.height);
				_self.m_context.translate(0.5, 0.5);
				//

				_self.m_context.font = xEnv.ConfigAxis.Font;
				_self.m_context.fillStyle = xEnv.ConfigAxis.FontColor;

				_self.didDrawPanelBorder();

				_self.didDrawObjects();

				_self.m_context.translate(-0.5, -0.5);

			}; // end draw

			this.didDrawPanelBorder = function() {
				var __xEnv = _self.didGetEnvInfo();
				var __lineColor = __xEnv.BorderColor;
				var __drawLineParam = {
					context : _self.m_context,
					pt1 : {
						x : 0,
						y : 0
					},
					pt2 : {
						x : 0,
						y : 0
					},
					lineWidth : 1,
					lineColor : __lineColor
				};

				var __drawRectParam = {
		    		context : _self.m_context,
		    		rect : {
			    		x : 0,
			    		y : 0,
			    		width : 0,
			    		height : 0
		    		},
		    		lineWidth : 1,
		    		lineColor : __lineColor
		    	};

				// #1518
				var __panelWidth  = _self.m_rectInfo.width;
				var __panelHeight = _self.m_rectInfo.height;
				//

				__drawRectParam.rect.width  = __panelWidth  - 2;	// #1753
				__drawRectParam.rect.height = __panelHeight - 2;	// #1753
				gxDc.Rectangle(__drawRectParam);
	        };

			var _didGetDoExecutions = function() {
				try {
					var xDoPrice = _self.m_drawWrapper.didGetReferencedPriceObject();
					if(xDoPrice && xDoPrice.didGetDoExecutions) {
						return(xDoPrice.didGetDoExecutions(true));
					}
				}
				catch(e) {
					console.error(e);
				}
			};

			var _didGetDoPositions = function() {
				try {
					var xDoPrice = _self.m_drawWrapper.didGetReferencedPriceObject();
					if(xDoPrice && xDoPrice.didGetDoPositions) {
						return(xDoPrice.didGetDoPositions(true));
					}
				}
				catch(e) {
					console.error(e);
				}
			};

			var _didDrawDoExtras = function(extraDatas, posval) {
				if(extraDatas === undefined || extraDatas == null) {
					return;
				}

				var extraDrawParam = {
					context    : _self.m_context,
					memcontext : _self.m_memcontext,
					rect       : xUtils.didClone(_self.m_rectInfo),
					pt         : {
						x : parseInt(_self.m_rectInfo.width / 2)
					},
					offSelect  : true,
					caller     : _self
				};

				var nObjectCount = extraDatas.length;
				for(var ii = 0; ii < nObjectCount; ii++) {
					var doExtra = extraDatas[ii];
					if(doExtra && doExtra.DrawObjAtFixedPosX) {
						doExtra.DrawObjAtFixedPosX(posval, extraDrawParam);
					}
				}
			};

			var _didDrawDoExecutions = function(posval) {
				var doExecutions = _didGetDoExecutions();
				_didDrawDoExtras(doExecutions);
			};

			var _didDrawDoPositions = function(posval) {
				var doPositions = _didGetDoPositions();
				_didDrawDoExtras(doPositions);
			};

			this.didDrawObjects = function() {
				_didDrawDoExecutions();
				_didDrawDoPositions();
			};

			var _didHitTestObject = function(extraDatas, posval) {
				if(extraDatas === undefined || extraDatas == null) {
					return;
				}

				// Y位置をRelative位置へ変換する。
				// Canvas上の位置
				posval.YPos = posval.YPos - _self.m_domElemRoot.offsetTop;
				// 修正したとマーキングする。
				posval.YPosAdjusted = true;

				//
				var hitPoint = {
					XPos : _self.m_drawWrapper.GetPosXMargined(posval.XPos, true),
					YPos : _self.m_drawWrapper.GetPosYMargined(posval.YPos)
				};

				var rect = {
					x : 0,
					y : 0,
					width : _self.m_canvas.width,
					height: _self.m_canvas.height
				};

				var hitTestTool = xUtils.hitTest.prepareTools(rect, hitPoint, _self.m_memcanvas, _self.m_memcontext);
				hitTestTool.willBeHitTest(true);

				//
				var iSelectIndex = -1;

				_self.m_xDoExtraSelected = null;

				var xEnv = _self.didGetEnvInfo();

				var extraDrawParam = {
					context    : _self.m_context,
					memcontext : _self.m_memcontext,
					rect       : xUtils.didClone(_self.m_rectInfo),
					pt         : {
						x : parseInt(_self.m_rectInfo.width / 2)
					},
					offSelect  : true,
					caller     : _self
				};

				var nObjectCount = extraDatas.length;
				for(var ii = 0; ii < nObjectCount; ii++) {
					var doExtra = extraDatas[ii];
					if(doExtra && doExtra.didHitTest) {
						_self.m_xDoExtraSelected = doExtra.didHitTest(posval, hitTestTool, extraDrawParam);
						if(_self.m_xDoExtraSelected) {
							iSelectIndex = xUtils.constants.default.DEFAULT_WRONG_VALUE;
							break;
						}
					}
				}

				// クローズ
				hitTestTool.closeHitTest(true);
				hitTestTool = {};

				//
				return iSelectIndex;// (iSelectIndex != -1);
			};

			/**
			 * チャートオブジェクトが選択されたかを判断する。
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.OnSelectChartObj = function(posval) {
				var doPositions  = _didGetDoPositions();
				var selectedIndex= _didHitTestObject(doPositions, posval);
				if(selectedIndex >= 0 && _self.m_xDoExtraSelected) {
					return(selectedIndex);
				}

				var doExecutions = _didGetDoExecutions();
				return(_didHitTestObject(doExecutions, posval));
			};

			/**
			 * resize panel
			 * @param[in] resizeParam	param
			 */
			this.didResizePanel = function(resizeParam) {
				if(resizeParam === undefined || resizeParam == null) {
					// xUtils.debug.log('[HOSINO] fail to resize => param:' + resizeParam);
					return;
				}

				_self.m_rectInfo.x 				= resizeParam.left;
				_self.m_rectInfo.y 				= resizeParam.top;
				_self.m_rectInfo.width 			= resizeParam.width;
				_self.m_rectInfo.height 		= resizeParam.height;
				_self.m_rectInfo.lw 			= resizeParam.leftY;
				_self.m_rectInfo.rw 			= resizeParam.rightY;

				var devicePixelRatio = window.devicePixelRatio || 1;
				var ratio = devicePixelRatio;

				_self.m_canvas.width			= ratio * resizeParam.width;
				_self.m_canvas.height			= ratio * resizeParam.height;

				_self.m_canvas.style.width		= resizeParam.width  + "px";
				_self.m_canvas.style.height		= resizeParam.height + "px";
			};

			this.didGetEnvInfo = function() {
				return(_self.m_drawWrapper.didGetEnvInfo());
			};

			this.didDestroy = function() {
				if(_self.m_domElemRoot) {
					_self.m_domElemRoot.removeChild(_self.m_canvas);
				}

				_self.m_domElemRoot = null;
				_self.m_canvas = null;
				_self.m_context = null;
				_self.m_memcanvas = null;

				_self.m_chartWraper = null;
				_self.m_ctrlLayout = null;
			};
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDrawPanelExtra");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDrawPanelExtra"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./canvas2DUtil")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDrawPanelExtra",
            ['ngc/chartUtil', 'ngc/canvas2DUtil'],
                function(xUtils, gxDc) {
                    return loadModule(xUtils, gxDc);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDrawPanelExtra"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDrawPanelExtra");
})(this);
