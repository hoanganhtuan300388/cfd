(function(global){
	"use strict";

	var loadModule = function(gxDc, xUtils, doFactory) {
	    "use strict";

	    /*
		 *
		 */
	    var exports = {};

	    exports.m_idChartDraw = "idChartDrawAPIPanel";

		exports.panelBase = function(chartWrapper, drawWrapper) {
			//
			// private
			//
			var _self = this;
			var _doFactory = doFactory;
			var _chartWrapper = chartWrapper;
			var _drawWrapper = drawWrapper;

			//
			// public
			//
			this.OBJECT_NAME = "BASE_FRAME";

			this.m_doFactory = doFactory;
			this.m_chartWraper = chartWrapper;
			this.m_drawWrapper = drawWrapper;

			this.m_arrChartObjlist = [];
			this.m_idChartDraw = "";
			this.m_iFrameIndex = 0;

			this.m_initParam = null;

			this.m_rectInfo = {
				x: 0, y: 0, width: 0, height: 0, lw: 0, rw: 0
			};

			this.m_canvas = null;
			this.m_canvasLY = null;
			this.m_canvasRY = null;
			this.m_btnClose = null;

			this.m_context = null;
			this.m_contextLY = null;
			this.m_contextRY = null;
			this.m_memcanvas = null;
			this.m_memcontext = null;
			this.m_bMainFrame = false;

			this.m_currTrendlineObj = null;
			this.m_selectTrendlineObj = null;
			this.m_objCrosslineY  = null;

			this.m_iBaseWidth = 0;		//
			this.m_iBaseHeight = 0;		// remove top-bottom margin area
			this.m_iBaseOriginY = 0;	// top margin position
			this.m_iGridWidth = 0;
			this.m_iGridHeight = 0;

			//
			// #687
			// use SCALE
			//
			this.m_xScaleInfo = xUtils.scale.didCreateScaleInfo();
			//

			this.m_iLastMaxPrice = 0;
			this.m_iLastMinPrice = 0;

			this.m_xSelectedOepObject = null;

			this.isNontime = false; // #2037

			//
			//
			//

			this.didGetEnvInfo = function() {
				return(_self.m_drawWrapper.didGetEnvInfo());
			};

			/**
			 * init context
			 */
			this.didInitContext = function() {
				//
				_self.m_context = _self.m_canvas.getContext('2d');
				_self.m_contextLY = _self.m_canvasLY.getContext('2d');
				_self.m_contextRY = _self.m_canvasRY.getContext('2d');

				//
				_self.m_memcanvas = document.createElement('canvas');
				_self.m_memcanvas.width = _self.m_canvas.width;
				_self.m_memcanvas.height = _self.m_canvas.height;
				_self.m_memcontext = _self.m_memcanvas.getContext('2d');
			};

	        /**
	         * [description]
	         * @param  {[type]} domElem
	         * @return {[type]}
	         */
	        var _didInitCrosslineLabelElement = function(domElem) {
	            if(domElem === undefined || domElem == null) {
	                return;
	            }

	            domElem.className = "classCrosslineLabel";

				// #3016
				domElem.style.position   = "absolute";
	            domElem.style.left       = "0px";
				domElem.style.top        = "0px";
				domElem.style.visibility = "hidden";
				//
	        };

			// #1779
			this.didClickLegendButton = function(targetId) {
				if(!targetId) {
					return(false);
				}

				try {
					var temps = targetId.split("_");
					var __tempNo = temps[1];
					var __no = _self.m_initParam.no;
					if(__tempNo !== undefined && __tempNo != null && __no === parseInt(__tempNo)) {
						var isOn = !_self.m_initParam.showLegend;
						_self.didUpdateLegendOnOff(isOn);

						_self.DrawFrame(false);

						return(true);
					}
				}
				catch(e) {
					console.error(e);
				}

				return(false);
			};

			this.didUpdateLegendOnOff = function(isOn) {
				try {
					_self.m_initParam.showLegend = isOn;

					var className = "classLegendInfoButtonImageOn"; // #2904
					if(_self.m_initParam.showLegend === true) {
						className = "classLegendInfoButtonImageOff"; // #2904
					}

					_self.m_initParam.imgLegendInfo.className = className;
				}
				catch(e) {
					console.error(e);
				}
			};

			this.didSetMainFrame = function(mainFrame, noSet) {
				if(noSet !== true) {
					_self.m_bMainFrame = mainFrame;
				}

				if(_self.m_initParam.btnDetailInfo) {
					if(_self.m_bMainFrame == true) {
						_self.m_initParam.btnDetailInfo.style.visibility = "visible";
					}
					else {
						_self.m_initParam.btnDetailInfo.style.visibility = "hidden";
					}
				}
			};

			this.didInitActionElements = function(initParam) {
				try {
					var __deParent = _self.m_initParam.drawPanel;
					var __no = _self.m_initParam.no;

					// detail info
					_self.m_btnDetailInfo = document.createElement('button');
					_self.m_btnDetailInfo.setAttributeNS( null, "id", "eidDetailInfoButton" + "_" + __no);
					_self.m_btnDetailInfo.className = 'classDetailInfoButton';

					// _self.m_imgDetailInfo = document.createElement('image');
					// _self.m_imgDetailInfo.setAttributeNS( null, "id", "eidDetailInfoButtonImage" + "_" + __no);
					// _self.m_imgDetailInfo.className = 'classDetailInfoButtonImage';
					//
					// _self.m_btnDetailInfo.appendChild(_self.m_imgDetailInfo);

					_self.m_initParam.btnDetailInfo = _self.m_btnDetailInfo;
					// _self.m_initParam.imgDetailInfo = _self.m_imgDetailInfo;

					// legend info
					_self.m_btnLegendInfo = document.createElement('div');
					_self.m_btnLegendInfo.setAttributeNS( null, "id", "eidLegendInfoButton" + "_" + __no);
					_self.m_btnLegendInfo.className = 'classLegendInfoButton';

					_self.m_imgLegendInfo = document.createElement('image');
					_self.m_imgLegendInfo.setAttributeNS( null, "id", "eidLegendInfoButtonImage" + "_" + __no);
					//_self.m_imgLegendInfo.className = 'classLegendInfoButtonImageOn';

					_self.m_btnLegendInfo.appendChild(_self.m_imgLegendInfo);

					_self.m_initParam.btnLegendInfo = _self.m_btnLegendInfo;
					_self.m_initParam.imgLegendInfo = _self.m_imgLegendInfo;

					_self.didSetMainFrame(_self.m_bMainFrame, true);
					_self.didUpdateLegendOnOff(true);

					//
					__deParent.appendChild(_self.m_btnDetailInfo);
					__deParent.appendChild(_self.m_btnLegendInfo);
				}
				catch(e) {
					console.error(e);
				}
			};
			//

			// #2931
			this.didGetBackgroundColor = function(useOpacity) { // #3140, #3147
				// #3140, #3147
				if(useOpacity != true) {
					return("transparent");
				}
				//

				var xEnv = _self.didGetEnvInfo();
				if(_self.m_bMainFrame) {
					return(xEnv.BackgroundColor);
				}

				if(xEnv.SubBackgroundColor === undefined || xEnv.SubBackgroundColor == null) {
					return(xEnv.BackgroundColor);
				}

				return(xEnv.SubBackgroundColor);
			};
			//

			/**
			 * @param[in] initParam		initParam = {root : null, onMouseDown: null, onMouseMove: null, onClose: null}
			 */
			this.didInitElements = function(initParam) {
				_self.m_initParam = initParam;

				var __deParent = _self.m_initParam.parent;
				var __no = _self.m_initParam.no;

				// panel
				_self.m_chartdraw = document.createElement("div");
				_self.m_chartdraw.setAttributeNS( null, "id", "idChartDraw" + __no);
				_self.m_chartdraw.className = "classChartItem";
				_self.m_initParam.drawPanel = _self.m_chartdraw;

				// draw area(canvas)
				_self.m_canvas   = document.createElement("canvas");
				_self.m_canvasLY = document.createElement("canvas");
				_self.m_canvasRY = document.createElement("canvas");

				_self.m_initParam.drawCanvas   = _self.m_canvas;
				_self.m_initParam.drawCanvasLY = _self.m_canvasLY;
				_self.m_initParam.drawCanvasRY = _self.m_canvasRY;

				// #2931
				var backgroundColor = _self.didGetBackgroundColor();
				//
				_self.m_canvas.className = "classChartItem";
				_self.m_canvas.style.backgroundColor = backgroundColor; // #2931
				_self.m_canvas.onmousedown = _self.m_initParam.onMouseDown;
				_self.m_canvas.onmousemove = _self.m_initParam.onMouseMove;

				_self.m_canvasLY.className = "classChartItem";
				_self.m_canvasLY.style.backgroundColor = backgroundColor; // #2931

				_self.m_canvasRY.className = "classChartItem";
				_self.m_canvasRY.style.backgroundColor = backgroundColor; // #2931

				//
				// removed by choi sunwoo at 2017.05.22 for #747
				//
				// close button
				_self.m_btnClose = document.createElement('div');
				_self.m_btnClose.className = 'panelCloseButton';
				_self.m_initParam.drawClose = _self.m_btnClose;

				_self.m_btnClose.style.position = "absolute";
				_self.m_btnClose.style.width = "10px";
				_self.m_btnClose.style.height = "10px";
				_self.m_btnClose.style.visibility = "hidden";
				_self.m_btnClose.onclick = _self.m_initParam.onClose;

				//
				// cross line
				//

				// cross line label - left
				_self.m_objCrosslineLY = document.createElement("div");
	            _self.m_initParam.drawCrossLY = _self.m_objCrosslineLY;

	            // #506
	            _didInitCrosslineLabelElement(_self.m_objCrosslineLY);
	            //

				// cross line label - right
				_self.m_objCrosslineRY = document.createElement("div");
				_self.m_initParam.drawCrossRY = _self.m_objCrosslineRY;

	            // #506
	            _didInitCrosslineLabelElement(_self.m_objCrosslineRY);
	            //

				//
				//
				_self.m_chartdraw.appendChild(_self.m_canvasLY);
				_self.m_chartdraw.appendChild(_self.m_canvas);
				_self.m_chartdraw.appendChild(_self.m_canvasRY);
				_self.m_chartdraw.appendChild(_self.m_objCrosslineLY);
				_self.m_chartdraw.appendChild(_self.m_objCrosslineRY);
				_self.m_chartdraw.appendChild(_self.m_btnClose);

				__deParent.appendChild(_self.m_chartdraw);

				//
				//
				//
				_self.didInitContext();

				//
				_self.didResetPanelNo(__no);
			};

			//
			//
			//

			/**
			 * create default object
			 * @param[in] bMainFrame	main frame
			 * @param[in] initParam		initial param
			 * @return object
			 */
			this.didCreateDefaultObject = function(bMainFrame, initParam) {
				// #1181
				var xEnv = _self.didGetEnvInfo();

				//

				if(bMainFrame === true) {
					return (function(argPanel){
						var __chartObj = argPanel.m_doFactory.createDrawObject(xUtils.constants.keywords.defaults.price, true);
						var __strChartName = _self.m_drawWrapper.m_stEnv.ChartType;// "Candle";

						__chartObj.Init(argPanel, __strChartName, _self.m_drawWrapper);
						argPanel.m_arrChartObjlist.push(__chartObj);

						return(__chartObj);
					})(_self);
				}
			};

			/**
			 * init panel
			 *
			 * @param[in] bMainFrame	is mainframe or not
			 * @param[in] initParam		initParam = {root : null, onMouseDown: null, onMouseMove: null, onClose: null}
			 */
			this.didInitDrawFrame = function(bMainFrame, initParam) {
				//
				var xEnv = _self.didGetEnvInfo(); // #2247

				//
				_self.m_arrChartObjlist = [];
				// _self.m_arrTrendlineObjlist = [];

				_self.m_bMainFrame = bMainFrame;

				//
				_self.didInitElements(initParam);
				if(xEnv.System.UseForMiniChart != true) {
					_self.didInitActionElements(initParam);
				}

				//
				return(_self.didCreateDefaultObject(bMainFrame, initParam));
			};

			/**
			 * get shift information
			 * @return {all, left, right}
			 */
			this.didGetShiftInfo = function() {
				return(_self.m_drawWrapper.didGetShiftInfo());
			};

			/**
			 * get shift information
			 * @return {all, left, right}
			 */
			this.didCalcShiftInfo = function() {
				var __nObjectCount = _self.m_arrChartObjlist.length;
				var __result = {
					all: 0,
					left: 0,
					right: 0
				};

				for(var __ii = 0; __ii < __nObjectCount; __ii++) {
					var __xDo = _self.m_arrChartObjlist[__ii];
					if(__xDo !== undefined && __xDo != null && __xDo.didGetShifRightCount !== undefined) {
						__result.left = Math.max(__xDo.didGetShifLeftCount(), __result.left);
						__result.right = Math.max(__xDo.didGetShifRightCount(), __result.right);
					}
				}

				__result.all = __result.left + __result.right;

				return(__result);
			};

			/**
			 * @param[in] argNo	number
			 */
			this.didResetPanelNo = function(argNo) {
				_self.m_iFrameIndex = argNo;
				_self.m_idChartDraw = "idChartDraw" + argNo;
				if(_self.m_initParam !== undefined && _self.m_initParam != null) {
					var __dePanel = _self.m_initParam.drawPanel;
					var __deCanvas = _self.m_initParam.drawCanvas;
					var __deCanvasLY = _self.m_initParam.drawCanvasLY;
					var __deCanvasRY = _self.m_initParam.drawCanvasRY;
					var __deBtnClose = _self.m_initParam.drawClose;
					var __deCrossLY = _self.m_initParam.drawCrossLY;
					var __deCrossRY = _self.m_initParam.drawCrossRY;

					// close link
					__dePanel.setAttributeNS( null, "id", "idChartDraw" + argNo);
					__deCanvas.setAttributeNS( null, "id", "idCanvas" + argNo);
					__deCanvasLY.setAttributeNS( null, "id", "idCanvasLY" + argNo);
					__deCanvasRY.setAttributeNS( null, "id", "idCanvasRY" + argNo);
					__deBtnClose.setAttributeNS( null, "id", "idCloseBtn" + argNo);
					__deCrossLY.setAttributeNS( null, "id", "idCrosslineLY" + argNo);
					__deCrossRY.setAttributeNS( null, "id", "idCrosslineRY" + argNo);
				}
			};

			/**
			 * check if this panel is empty or not
			 * @param[in] bRemoveLink	remove link or not
			 * @return true or false
			 */
			this.didCheckEmptyPanel = function(bRemoveLink) {
				var __nObjCount = _self.m_arrChartObjlist.length;
				if(__nObjCount < 1) {
					if(bRemoveLink === true) {
						_self.didRemoveLinkElements();

						return(true);
					}
				}

				return(false);
			};

			/**
			 * remove elements link
			 */
			this.didRemoveLinkElements = function() {
				if(_self.m_initParam !== undefined && _self.m_initParam != null) {
					var __deParent = _self.m_initParam.parent;

					var __dePanel = _self.m_initParam.drawPanel;
					var __deCanvas = _self.m_initParam.drawCanvas;
					var __deCanvasLY = _self.m_initParam.drawCanvasLY;
					var __deCanvasRY = _self.m_initParam.drawCanvasRY;
					var __deBtnClose = _self.m_initParam.drawClose;

					// close link
					__dePanel.removeChild(__deCanvas);
					__dePanel.removeChild(__deCanvasLY);
					__dePanel.removeChild(__deCanvasRY);
					__dePanel.removeChild(__deBtnClose);
					__dePanel.removeChild(_self.m_initParam.drawCrossLY);
					__dePanel.removeChild(_self.m_initParam.drawCrossRY);

					// #1779
					__dePanel.removeChild(_self.m_initParam.btnDetailInfo);
					__dePanel.removeChild(_self.m_initParam.btnLegendInfo);
					//

					__deParent.removeChild(__dePanel);

				}
			};

			/**
			 * get rect information
			 * @return {left:0, top:0, width:0, height:0}
			 */
			this.didGetPanelRect = function() {
				var __rect = {left:0, top:0, width:0, height:0};

				if(_self.m_chartdraw !== undefined && _self.m_chartdraw != null) {
					__rect.left = _self.m_chartdraw.offsetLeft;
					__rect.top = _self.m_chartdraw.offsetTop;
					__rect.width = _self.m_chartdraw.offsetWidth;
					__rect.height = _self.m_chartdraw.offsetHeight;
				}

				return(__rect);
			};

			/**
			 * @param[in] resizeParam	var __resizeParam = {left: 0, top: 0, width: 0, height: 0, leftY: 0, rightY: 0};
			 */
			this.didResizePanel = function(resizeParam) {
				if(resizeParam === undefined || resizeParam == null) {
					return;
				}

				var __xEnv = _self.didGetEnvInfo();

				var __chartWidth = resizeParam.width - (resizeParam.leftY + resizeParam.rightY);
				var __chartHeight = resizeParam.height;

				//
				_self.m_rectInfo.x 			= resizeParam.left;
				_self.m_rectInfo.y 			= resizeParam.top;
				_self.m_rectInfo.width 		= resizeParam.width;
				_self.m_rectInfo.height 	= __chartHeight;
				_self.m_rectInfo.lw 		= resizeParam.leftY;
				_self.m_rectInfo.rw 		= resizeParam.rightY;

				//
				// canvas
				//
				var devicePixelRatio = window.devicePixelRatio || 1;
				var ratio = devicePixelRatio;

				_self.m_canvas.width  			= ratio * __chartWidth;
				_self.m_canvas.height 			= ratio * __chartHeight;

				_self.m_canvasLY.width  		= ratio * resizeParam.leftY;
				_self.m_canvasLY.height 		= ratio * __chartHeight;

				_self.m_canvasRY.width  		= ratio * resizeParam.rightY;
				_self.m_canvasRY.height 		= ratio * __chartHeight;

				_self.m_memcanvas.width  		= _self.m_canvas.width;
				_self.m_memcanvas.height 		= _self.m_canvas.height;

				//
				_self.m_chartdraw.style.left 	= resizeParam.left + 'px';
				_self.m_chartdraw.style.top 	= resizeParam.top + 'px';
				_self.m_chartdraw.style.width 	= resizeParam.width + 'px';
				_self.m_chartdraw.style.height 	= __chartHeight + 'px';

				_self.m_canvas.style.left 		= resizeParam.leftY + 'px';
				_self.m_canvas.style.top 		= 0 + 'px';
				_self.m_canvas.style.width 		= __chartWidth + 'px';
				_self.m_canvas.style.height 	= __chartHeight + 'px';

				_self.m_canvasLY.style.left 	= 0 + 'px';
				_self.m_canvasLY.style.top 		= 0 + 'px';
				_self.m_canvasLY.style.width 	= resizeParam.leftY + 'px';
				_self.m_canvasLY.style.height 	= __chartHeight + 'px';

				_self.m_canvasRY.style.left 	= resizeParam.leftY + __chartWidth + 'px';
				_self.m_canvasRY.style.top 		= 0 + 'px';
				_self.m_canvasRY.style.width 	= resizeParam.rightY + 'px';
				_self.m_canvasRY.style.height 	= __chartHeight + 'px';

				_self.m_btnClose.style.left 	= resizeParam.leftY + __chartWidth - 15 + 'px';
				_self.m_btnClose.style.top 		= 5 + 'px';

				// #1779
				_self.didResizeActionButton(resizeParam);
				//

				// TODO: #691
				_self.SetBaseSize();
			};

			// #1779
			this.didResizeActionButton = function(resizeParam) {
				if(resizeParam === undefined || resizeParam == null) {
					//console.debug('[HOSINO] fail to resize => param:' + resizeParam);
					return;
				}

				try {
					var __xEnv = _self.didGetEnvInfo();
					// #2247
					if(__xEnv.System.UseForMiniChart === true) {
						return;
					}
					// [end] #2247

					var nLeftPos = resizeParam.leftY + __xEnv.ActionButtonLeft;
					var nTopPos  = __xEnv.ActionButtonTop;
					_self.m_initParam.btnDetailInfo.style.left = nLeftPos + 'px';
					_self.m_initParam.btnDetailInfo.style.top  = nTopPos  + 'px';

					nLeftPos += __xEnv.ActionButtonGap + __xEnv.ActionButtonSize;
					_self.m_initParam.btnLegendInfo.style.left = nLeftPos + 'px';
					_self.m_initParam.btnLegendInfo.style.top  = nTopPos  + 'px';

				}
				catch(e) {
					console.error(e);
				}
			};
			//

			/**
			 * set y axis width
			 * @param[in] argLeft	left axis width
			 * @param[in] argRight	right axis width
			 * @param[in] argWidth	full width
			 */
			this.didChangeAxisWidth = function(argLeft, argRight) {
				var __resizeParam = {
					left: _self.m_rectInfo.x,
					top: _self.m_rectInfo.y,
					width: _self.m_rectInfo.width,
					height: _self.m_rectInfo.height,
					leftY: argLeft,
					rightY: argRight
				};

				_self.didResizePanel(__resizeParam);
			};


			/**
			 * resize panel height
			 * @param[in] argHeight	new height
			 * @param[in] argTop	new top position(option)
			 *
			 */
			this.didResizePanelHeight = function(argHeight, argTop) {
				var __resizeParam = {
					left: _self.m_rectInfo.x,
					top: argTop !== undefined ? argTop :_self.m_rectInfo.y,
					width: _self.m_rectInfo.width,
					height: argHeight,
					leftY: _self.m_rectInfo.lw,
					rightY: _self.m_rectInfo.rw
				};

				_self.didResizePanel(__resizeParam);
			};

			this.AddChartObj = function(strChartName) {
				var __chartObj = null;

				__chartObj = _self.m_doFactory.createDrawObject(strChartName);
				if(__chartObj === undefined || __chartObj === null) {
					//console.debug("[HOSION] there is no indicator like " + strChartName);
					return;
				}

				// //console.debug(strChartName);
				_self.m_arrChartObjlist.push(__chartObj);
				//_self.m_arrChartObjlist[_self.m_arrChartObjlist.length-1].Init(_self, strChartName, _self.m_drawWrapper);
				__chartObj.Init(this, strChartName, _self.m_drawWrapper);

				if (strChartName != 'IchiMoku') {
					__chartObj.didCalculateData();
				}
			};

			/**
			 * @param[in] argDo indicator object
			 */
			this.didAddChartObj = function(argDo) {
				var __chartObj = argDo;
				if(__chartObj === undefined || __chartObj === null) {
					//console.debug("[HOSION] there is no indicator like " + strChartName);
					return;
				}

				// //console.debug(strChartName);
				_self.m_arrChartObjlist.push(__chartObj);

				__chartObj.Init(this, __chartObj.m_strIndicator, _self.m_drawWrapper);

				var xShiftInfo = _self.didGetShiftInfo();

				if(xShiftInfo !== undefined && xShiftInfo != null && __chartObj.SetOffMinus !== undefined && __chartObj.SetOffMinus != null) {
					// #729
					__chartObj.SetOffMinus(xUtils.didCalculateShiftValue(xShiftInfo, xUtils.constants.default.SHIFT_IS_ST));
				}

				if (__chartObj.m_strIndicator !== 'IchiMoku') {
					__chartObj.didCalculateData();
				}

				return(true);
			};

			/**
			 * トレンドラインオブジェクトを生成する。
			 * @param  {string} strTrendLine	トレンドライン名
			 * @param  {object} posval			位置
			 * @return {object}
			 */
			this.CreateTrendlineObj = function(strTrendLine, posval) {
				//
				// removed by chos sunwoo at 2017.05.22
				// 非時系列パネルではトレンドラインは生成できないため、ノーマルパネルへ移動した。
				//
			};

			/**
			 * end of creating line-study object
			 */
			this.DidEndCreatingObject = function() {
				var xResult = {
					refresh:false,
					newOrder:undefined
				};
				if(_self.m_currTrendlineObj != undefined && _self.m_currTrendlineObj != null) {
					////console.debug("DidEndCreatingObject => go false... " + _self.m_currTrendlineObj);
					_self.m_currTrendlineObj.m_bCreating = false;

					if(_self.m_currTrendlineObj.isAutoDeleteObject && _self.m_currTrendlineObj.isAutoDeleteObject()) {
						console.debug(_self.m_currTrendlineObj);

						if(_self.m_currTrendlineObj.didGetNewOrderValue) {
							xResult.newOrder = _self.m_currTrendlineObj.didGetNewOrderValue();
						}

						// delete object
						//
						if(xUtils.trendLine.didDeleteTargetToolObject(_self.m_currTrendlineObj) === true) {
							xResult.refresh = true;
						}
					}
					// #1576
					// refresh is true...
					else {
						xResult.refresh = true;
					}

					//
					_self.m_currTrendlineObj = undefined;
				}
				else {
					////console.debug("DidEndCreatingObject => " + _self.m_currTrendlineObj);
				}

				return(xResult);
			};

			/**
			 * set last point
			 * @parma[in] posval {x, y}
			 */
			this.SetTrendlineLastPoint = function(posval) {
				if(_self.m_currTrendlineObj !== undefined && _self.m_currTrendlineObj != null) {
					_self.m_currTrendlineObj.SetLastPoint(posval);
					_self.m_currTrendlineObj.SetExtraPoint();
				}
			};

			/**
			 * set to new position by type
			 * @param[in] posval	{x, y}
			 */
			this.SetTrendlineMove = function(posval) {
				if(_self.m_selectTrendlineObj) {
					if (_self.m_selectTrendlineObj.m_iSelectGubun === 1)
						_self.m_selectTrendlineObj.SetStartPoint(posval);
					else if (_self.m_selectTrendlineObj.m_iSelectGubun === 2)
						_self.m_selectTrendlineObj.SetLastPoint(posval);
					else if (_self.m_selectTrendlineObj.m_iSelectGubun === 0)
						_self.m_selectTrendlineObj.SetMovePoint(posval);
					else if (_self.m_selectTrendlineObj.m_iSelectGubun === 3)
						_self.m_selectTrendlineObj.SetExtraPoint(posval);
				}
				else if(_self.m_xSelectedOepObject && _self.m_xSelectedOepObject.SetTrendlineMove) {
					// #1811
					if(_self.m_xSelectedOepObject.SetTrendlineMove(posval)) {
						_self.m_objCrosslineLY.style.visibility = "hidden";
			            _self.m_objCrosslineRY.style.visibility = "hidden";

						return(true); // #2431
					}
					//
				}
			};

			/**
			 * check if there is price bar or not
			 * @return true or false
			 */
			this.hasPriceBar = function() {
				if(_self.m_bMainFrame !== true) {
					return(false);
				}

				var __nObjectCount = _self.m_arrChartObjlist.length;
				for(var __ii = 0; __ii < __nObjectCount; __ii++) {
					if(_self.m_arrChartObjlist[__ii].m_bMainChart === true) {
						return(true);

						break;
					}
				}

				return(false);
			};

			/**
			 * get price bar
			 * @return {object}
			 */
			this.didGetPriceBar = function() {
				if(_self.m_bMainFrame !== true) {
					return;
				}

				var __nObjectCount = _self.m_arrChartObjlist.length;
				for(var __ii = 0; __ii < __nObjectCount; __ii++) {
					var xDo = _self.m_arrChartObjlist[__ii];
					if(xDo && xDo.m_bMainChart === true) {
						return(xDo);

						break;
					}
				}

				return;
			};

			this.didFindObjectByKey = function(argKey) {
				if(argKey === undefined || argKey == null) {
					return;
				}

				var __nObjectCount = _self.m_arrChartObjlist.length;
				for(var ii = 0; ii < __nObjectCount; ii++) {
					var xDo = _self.m_arrChartObjlist[ii];
					if(xDo && argKey === xDo.uniqueKey) {
						return(xDo);
					}
				}

				return;
			};

			this.didFindIndicatorObjectsByTypeId = function(argTypeId) {
				if(argTypeId === undefined || argTypeId == null) {
					return;
				}

				var arrResult = [];
				var __nObjectCount = _self.m_arrChartObjlist.length;
				for(var ii = 0; ii < __nObjectCount; ii++) {
					var xDo = _self.m_arrChartObjlist[ii];
					if(xDo && xDo.m_xSeriesInfo && xDo.m_xSeriesInfo.code && argTypeId === xDo.m_xSeriesInfo.code) {
						arrResult.push({panel:_self, index:ii, indicator:xDo});
					}
				}

				return(arrResult);
			};

			this.didFindFirstIndicatorObjectByTypeId = function(argTypeId) {
				var arrResult = _self.didFindIndicatorObjectsByTypeId(argTypeId);
				if(arrResult === undefined || arrResult == null || arrResult.length === undefined || arrResult.length == null || arrResult.length < 1) {
					return;
				}

				return(arrResult[0]);
			};

			this.didFindSelectedObject = function() {
				var __nObjectCount = _self.m_arrChartObjlist.length;
				for(var ii = 0; ii < __nObjectCount; ii++) {
					var xDo = _self.m_arrChartObjlist[ii];
					if(xDo.m_bSelect === true) {
						if(xDo.m_bMainChart === true) {
							// 価格であるため、削除できない。
							return({
								panel:_self,
								price:xDo,
								index:ii
							});
						}

						// ここからは指標
						return({
							panel:_self,
							indicator:xDo,
							index:ii
						});
					}

					var xSelectedLs = xDo.didFindSelectedLineTool();
					if(xSelectedLs !== undefined && xSelectedLs != null) {
						return({
							panel:_self,
							tool:xSelectedLs,
							index:ii
						});
					}
				}

				return;
			};

			this.didGetCountForAllTrenslines = function() {
				var nSum = 0;
				try {
					var __nObjectCount = _self.m_arrChartObjlist.length;
					for(var ii = 0; ii < __nObjectCount; ii++) {
						var xDo = _self.m_arrChartObjlist[ii];
						if(xDo.didGetCountForAllTrenslines) {
							var nCnt = Math.max(0, xDo.didGetCountForAllTrenslines());
							nSum += nCnt;
						}
					}
				}
				catch(e) {
					nSum = 0;
				}

				return(nSum);
			};

			this.didDeleteIndicator = function(argTypeId) {
				return(false);
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didRemoveSelectedLineTool = function() {
				var __nObjectCount = _self.m_arrChartObjlist.length;
				for(var __ii = 0; __ii < __nObjectCount; __ii++) {
					if((function(argObj){
						if(argObj !== undefined && argObj != null && argObj.didRemoveSelectedLineTool !== undefined) {
							if(argObj.didRemoveSelectedLineTool.call() === true) {
								return(true);
							}

							return(false);
						}
					})(_self.m_arrChartObjlist[__ii]) === true) {
						return(true);
						break;
					}
				}

				return(false);
			};

			/**
			 * if return value is true, you need to refresh screen
			 * @param[in] bFlag	true or false
			 * @return true or false
			 */
			this.didRemoveAllLineTools = function() {
				var __nObjectCount = _self.m_arrChartObjlist.length;
				for(var __ii = 0; __ii < __nObjectCount; __ii++) {
					(function(argObj){
						if(argObj !== undefined && argObj != null) {
							argObj.didRemoveAllLineTools();
						}
					})(_self.m_arrChartObjlist[__ii]);
				}
			};

			/**
			 * clear draw objects
			 */
			this.didClearDrawObjectAt = function(argIndex) {
				var __nObjectCount = _self.m_arrChartObjlist.length;
				if(__nObjectCount > 0 && argIndex >= 0 && argIndex < __nObjectCount) {
					(function(argObj){
						if(argObj !== undefined && argObj != null) {
							argObj.didDestroy();
						}
					})(_self.m_arrChartObjlist[argIndex]);
					delete _self.m_arrChartObjlist[argIndex];
					_self.m_arrChartObjlist.splice(argIndex, 1);

					return(true);
				}

				return(false);
			};

			/**
			 * clear draw objects
			 */
			this.didClearDrawObject = function() {
				var __nObjectCount = _self.m_arrChartObjlist.length;
				for(var __ii = 0; __ii < __nObjectCount; __ii++) {
					(function(argObj){
						if(argObj !== undefined && argObj != null) {
							argObj.didDestroy();
						}
					})(_self.m_arrChartObjlist[__ii]);
					delete _self.m_arrChartObjlist[__ii];
				}

				_self.m_arrChartObjlist = [];

				return(true);
			};

			/**
			 *
			 */
			this.OnDestroy = function() {
				/*
				// var iObjCount = 1;

				for (var idx=0; idx < _self.m_arrChartObjlist.length; idx++) {
					delete _self.m_arrChartObjlist[idx];
				}
				_self.m_arrChartObjlist = [];
				*/
				_self.didClearDrawObject();
			};

			this.didCalculateData = function() {
				for (var ii = 0; ii < _self.m_arrChartObjlist.length; ii++) {
					_self.m_arrChartObjlist[ii].didCalculateData();
				}
			};

			/**
			 *
			 * @param  {[type]} nStart
			 * @param  {[type]} nDSize
			 * @param  {[type]} nSSize
			 * @return {[type]}
			 */
			this.didCalculateRealData = function(nStart, nDSize, nSSize) {
				for (var ii = 0; ii < _self.m_arrChartObjlist.length; ii++) {
					_self.m_arrChartObjlist[ii].didCalculateRealData(nStart, nDSize, nSSize);
				}
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didCalculateDataForExtraObject = function(nStart, nDSize, nSSize) {
				for (var ii = 0; ii < _self.m_arrChartObjlist.length; ii++) {
					_self.m_arrChartObjlist[ii].didCalculateDataForExtraObject(nStart, nDSize, nSSize);
				}
			};

			this.ReceiveCompareData = function(strCode) {
				_self.AddChartObj(strCode);
			};

			/**
			 * apply min & max to price type object
			 */
			this.didApplyMinMaxToPriceType = function() {
				(function(argObjects, argFlag, argScaleUnit){
					if(argFlag === true && argObjects !== undefined && argObjects != null) {
						var __nObjectCount = argObjects.length;
						for (var __ii = 0; __ii < __nObjectCount; __ii++) {
							var __xDo = argObjects[__ii];

							if(__xDo === undefined && __xDo == null) {
								continue;
							}

							if(argFlag === true && __xDo.m_bPriceType === true) {
								__xDo.didApplyScaleUnit(argScaleUnit);

								// don't need to set price size. because under function do that.
								__xDo.didCalcRatioFactor();
							}
						}
					}
				})(_self.m_arrChartObjlist, _self.m_bMainFrame, _self.m_xScaleInfo.current);
			};

			/**
			 * calculate min and max
			 * @param[in] argFlag	full flag
			 */
			this.didCalcMinMax = function(argFlag) {
				var xScaleUnit = _self.m_xScaleInfo.current;

				xUtils.scale.didResetScaleUnit(xScaleUnit);

				var __nObjectCount = _self.m_arrChartObjlist.length;

				var __nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var __nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				for (var __ii = 0; __ii < __nObjectCount; __ii++) {
					var __xDo = _self.m_arrChartObjlist[__ii];

					__xDo.didCalcMinMax(__nScrSIdx, __nScrSize, argFlag);

					var xDoScaleUnit = __xDo.didGetScaleUnit();

					if(_self.m_bMainFrame === true && __xDo.m_bPriceType === true) {
						xScaleUnit.minMaxScreen.maxValue = Math.max(xScaleUnit.minMaxScreen.maxValue, xDoScaleUnit.minMaxScreen.maxValue);
						xScaleUnit.minMaxScreen.minValue = Math.min(xScaleUnit.minMaxScreen.minValue, xDoScaleUnit.minMaxScreen.minValue);
					}
				}

				xScaleUnit.minMaxScreen.diff = xUtils.scale.didCalcDiff(xScaleUnit.minMaxScreen.maxValue, xScaleUnit.minMaxScreen.minValue);

				//
				//
				//
				if(xScaleUnit.minMaxScreen.diff < 0) {
					xUtils.scale.didAdjustReverseMinMax(xScaleUnit);
				}

				//
				// #492
				//
				_self.didApplyMinMaxToPriceType();
			};

			/**
			 * calculate ratio factors
			 */
			this.didCalcRatioFactor = function() {
				var xScaleUnit = _self.m_xScaleInfo.current;

				_self.m_iGridHeight = /*parseInt*/(_self.m_iBaseHeight / xScaleUnit.minMaxScreen.diff);

				var __nObjectCount = _self.m_arrChartObjlist.length;
				for (var __ii = 0; __ii < __nObjectCount; __ii++) {
					var __xDo = _self.m_arrChartObjlist[__ii];

					if(__xDo !== undefined && __xDo != null) {
						__xDo.didCalcRatioFactor();
					}
				}
			};

			/**
			 * prepare for drawing frame
			 */
			var _prepareDrawFrame = function(argPanel) {
				// #2931
				var backgroundColor = _self.didGetBackgroundColor();
				argPanel.m_canvas.style.backgroundColor   = backgroundColor;
				argPanel.m_canvasLY.style.backgroundColor = backgroundColor;
				argPanel.m_canvasRY.style.backgroundColor = backgroundColor;
				//

				argPanel.m_context.clearRect  (0, 0, 1, argPanel.m_canvas.height);
				argPanel.m_contextLY.clearRect(0, 0, 1, argPanel.m_canvasLY.height);
				argPanel.m_contextRY.clearRect(0, 0, 1, argPanel.m_canvasRY.height);

				// #2285
				argPanel.m_context.clearRect  (0, 0, argPanel.m_canvas.width, argPanel.m_canvas.height);
				argPanel.m_contextLY.clearRect(0, 0, argPanel.m_canvasLY.width, argPanel.m_canvasLY.height);
				argPanel.m_contextRY.clearRect(0, 0, argPanel.m_canvasRY.width, argPanel.m_canvasRY.height);

				argPanel.m_context.translate  (0.5, 0.5);
				argPanel.m_contextLY.translate(0.5, 0.5);
				argPanel.m_contextRY.translate(0.5, 0.5);
				//

				argPanel.m_contextLY.font      = argPanel.m_drawWrapper.m_stEnv.ConfigAxis.Font;// "9pt Arial";
				argPanel.m_contextLY.fillStyle = argPanel.m_drawWrapper.m_stEnv.ConfigAxis.FontColor;//"#303030";
				argPanel.m_contextRY.font      = argPanel.m_drawWrapper.m_stEnv.ConfigAxis.Font;//"9pt Arial";
				argPanel.m_contextRY.fillStyle = argPanel.m_drawWrapper.m_stEnv.ConfigAxis.FontColor;//"#303030";
			};

			/**
			 * finish draw frame
			 */
			var _didEndDrawFrame = function() {
				// 원점 복구
				_self.m_context.translate  (-0.5, -0.5);
				_self.m_contextLY.translate(-0.5, -0.5);
				_self.m_contextRY.translate(-0.5, -0.5);
			};

			/**
			 * draw axis panel's border
			 */
			var _drawAxisPanelBorder = function() {
				var __xEnv = _self.didGetEnvInfo();

				var drawLineParam = {
					context : undefined,
					pt1 : {
						x : 0,
						y : 0
					},
					pt2 : {
						x : 0,
						y : 0
					},
					lineWidth : 1,
					lineColor : __xEnv.BorderColor
				};

				var __height = _self.didGetDrawingHeight();
				var __lw     = _self.m_rectInfo.lw;
				var __rw     = _self.m_rectInfo.rw;

				// LEFT
				// upper line
				drawLineParam.context = _self.m_contextLY;
				drawLineParam.pt1.x = 0;
				drawLineParam.pt1.y = 0;
				drawLineParam.pt2.x = __lw;
				drawLineParam.pt2.y = 0;
				gxDc.Line(drawLineParam);

				// left line
				drawLineParam.pt1.x = 0;
				drawLineParam.pt1.y = 0;
				drawLineParam.pt2.x = 0;
				drawLineParam.pt2.y = __height;
				gxDc.Line(drawLineParam);

				// RIGHT
				// bottom line
				drawLineParam.context = _self.m_contextRY;
				drawLineParam.pt1.x = -1;
				drawLineParam.pt1.y = 0;
				drawLineParam.pt2.x = __rw - 2;	// #1753
				drawLineParam.pt2.y = 0;
				gxDc.Line(drawLineParam);

				// right line
				drawLineParam.context = _self.m_contextRY;
				drawLineParam.pt1.x = __rw - 2;	// #1753
				drawLineParam.pt1.y = 0;
				drawLineParam.pt2.x = __rw - 2;	// #1753
				drawLineParam.pt2.y = __height;
				gxDc.Line(drawLineParam);
			};

			/**
			 * draw panel's border
			 */
			var _drawPanelBorder = function(argPanel) {
				var __xEnv = _self.didGetEnvInfo();

				// axis panel
				_drawAxisPanelBorder();

				// panel
				var __context   = _self.m_context;
				var __nWidth    = _self.m_drawWrapper.GetChartFrameAreaWidth();
				var __nHeight   = _self.didGetDrawingHeight();

				var drawLineParam = {
					context : __context,
					pt1 : {
						x : 0,
						y : 0
					},
					pt2 : {
						x : 0,
						y : 0
					},
					lineWidth : 1,
					lineColor : __xEnv.BorderColor
				};

				// right border
				drawLineParam.pt1.x = __nWidth - 1;
				drawLineParam.pt1.y = 0;
				drawLineParam.pt2.x = __nWidth - 1;
				drawLineParam.pt2.y = __nHeight;
				gxDc.Line(drawLineParam);

				// left border
				drawLineParam.pt1.x = 0;
				drawLineParam.pt1.y = 0;
				drawLineParam.pt2.x = 0;
				drawLineParam.pt2.y = __nHeight;
				gxDc.Line(drawLineParam);

				// top border
				drawLineParam.pt1.x = -1;
				drawLineParam.pt1.y = 0;
				drawLineParam.pt2.x = __nWidth;
				drawLineParam.pt2.y = 0;
				gxDc.Line(drawLineParam);

				// bottom border
				drawLineParam.pt1.x = -1;
				drawLineParam.pt1.y = __nHeight - 1;
				drawLineParam.pt2.x = __nWidth;
				drawLineParam.pt2.y = __nHeight - 1;
				gxDc.Line(drawLineParam);
			};

			/**
			 * draw vertical grid
			 * @param[in] panel	target panel
			 */
			this.didDrawVerticalGrid = function(argPanel) {
				// grid show ?
				if(_self.m_drawWrapper.m_stEnv.ConfigAxis.GridShow !== true) {
					return;
				}

				var xEnv = _self.didGetEnvInfo();
				// #2216
				if(xEnv.ConfigAxis.GridVertHide === true) {
					return;
				}
				//

				var gridWidth = _self.m_drawWrapper.GetDrawPanelWidth();
				// drawing param for axis
				var __drawAxisParam = {
					scrollInfo : {
						pos : _self.m_drawWrapper.m_xScrollInfo.pos,
						screenSize : _self.m_drawWrapper.m_xScrollInfo.screenSize
					},
					timeType : _self.m_drawWrapper.didGetReferencedPriceObject().m_symbolInfo.nTType,
					timeInterval : _self.m_drawWrapper.didGetReferencedPriceObject().m_symbolInfo.nTGap,
					config : {
						font : xEnv.ConfigAxis.Font,
						fontColor : xEnv.ConfigAxis.FontColor,
						gridStyle : xEnv.ConfigAxis.GridStyle,
						gridColor : xEnv.ConfigAxis.GridVertColor,
						show : xEnv.ConfigAxis.GridShow
					},
					height : _self.didGetDrawingHeight(), //_self.m_canvas.height,
					axis : _self,
					drawWrapper : _self.m_drawWrapper,
					isGrid : true,
					target : {
						context : _self.m_context,
						leftWidth : xEnv.System.YAxisLeft,
						rightWidth : xEnv.System.YAxisRight,
						gridWidth : gridWidth//_self.m_canvas.width
					},
					levelInfo : _self.m_drawWrapper.didGetScrollLevelInfo(), // #2038
					isNontime : _self.isNontime, // #2037

				};

				xUtils.axis.didDrawXAxisWithLevel(__drawAxisParam);
			};

			/**
			 * draw all chart objects
			 * @param[in] argPanel	panel
			 * @param[in] bResize	resize or not
			 */
			var _drawChartObjects = function(argPanel, bResize) {
				var __nObjectCount = _self.m_arrChartObjlist.length;
				var __bFirst = false;
				var __bLast = false;
				for (var __ii = 0; __ii < __nObjectCount; __ii++) {
					var __xDo = _self.m_arrChartObjlist[__ii];
					if (__ii === 0) {
						__bFirst = true;
					}
					else {
						__bFirst = false;
					}

					if (__ii === __nObjectCount) {
						__bLast = true;
					}

					__xDo.DrawObj(bResize, __bFirst, __bLast);
				}
			};

			/**
			 * get last object in panel
			 * @return object
			 */
			var _didGetLastObject = function() {
				//
				var __nObjectCount = _self.m_arrChartObjlist.length;
				if(__nObjectCount < 1) {
					// TODO: Log
					//console.debug('Frame => DrawYAxis : there is no object.');
					return;
				}

				var __xDo = _self.m_arrChartObjlist[__nObjectCount - 1];

				//
				return(__xDo);
			}

			/**
			 * get axis object in panel(current displayed)
			 * @return object
			 */
			var _didGetAxisYObject = function() {
				var __xDo = _didGetLastObject();
				if(__xDo === undefined || __xDo == null) {
					return(_self);
				}

				return(__xDo);
			};

			var _didGetAxisYPointValue = function() {
				var __xDo = _didGetLastObject();
				if(__xDo === undefined || __xDo == null) {
					return(0);
				}

				if(__xDo.m_bPriceType === true && _self.m_bMainFrame === true) {
					return(_self.m_drawWrapper.GetCurrentSymbolPointValue());
				}

				return(__xDo.didGetPointValue());
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

				var __base = _self.didGetBaseCoordinate();

				if(argLocalPosY !== undefined) {
					__result.offset = __base.height + __base.y - argLocalPosY;
				}

				__result.ratioPv = __base.height !== 0 ? __result.size / __base.height : 0;
				__result.ratioVp = __result.size !== 0 ? __base.height / __result.size : 0;

				return(__result);
			};

			/**
			 * draw Axis Y
			 */
			this.didDrawYAxis = function() {
				var __xDo = _didGetLastObject();
				if(__xDo === undefined || __xDo == null) {
					return;
				}

				var __xEnv = _self.didGetEnvInfo();
				var isCompare = xUtils.isCompareChartMode(__xEnv);

				//
				var __result =
					(function(xDo, verpos){
						var xYAxisInfo = _self.didGetYAxisInfo(xDo);
						var __maxPrice = xYAxisInfo.max;
						var __minPrice = xYAxisInfo.min;
						var __xAxisY = xYAxisInfo.axis;

						//
						// #805
						//
						var __base = _self.didGetBaseCoordinate();
						//

						var __xEnv = _self.didGetEnvInfo();

						var __drawParam = {
							price: {
								max : __maxPrice,
								min : __minPrice,
								verpos : verpos
							},
							config : {
								font : __xEnv.ConfigAxis.Font,
								fontColor : __xEnv.ConfigAxis.FontColor,
								gridStyle : __xEnv.ConfigAxis.GridStyle,
								gridColor : __xEnv.ConfigAxis.GridHorzColor,
								multiColor: __xEnv.ConfigAxis.MultipleLabelColor,
								show : __xEnv.ConfigAxis.GridHorzHide == true ? false : true
							},
							y : __base.y,	// origin pos y
							height : __base.height,
							axis : __xAxisY,
							target : {
								left : {
									context : _self.m_contextLY,
									width : _self.m_rectInfo.lw
								},
								grid : {
									context : _self.m_context,
									width : _self.m_rectInfo.width
								},
								right : {
									context : _self.m_contextRY,
									width : _self.m_rectInfo.rw
								}
							},
							guideSize : __xEnv.System.AxisGuideBase, // #2038
						};

						// #3147
						if(__xEnv.System.SubBackgroundMargin !== undefined && __xEnv.System.SubBackgroundMargin != null) {
							var devicePixelRatio = window.devicePixelRatio || 1;
							var ratio = devicePixelRatio;
							var clipLeft = {
								x: 0,
								y: Math.round(__xEnv.System.SubBackgroundMargin * ratio), // #3470
								width: _self.m_rectInfo.lw,
								height: Math.round((_self.m_rectInfo.height - (__xEnv.System.SubBackgroundMargin * 2) * ratio)) // #3470
							};

							var clipRight = {
								x: 0,
								y: Math.round(__xEnv.System.SubBackgroundMargin * ratio), // #3470
								width: _self.m_rectInfo.rw,
								height: Math.round((_self.m_rectInfo.height - (__xEnv.System.SubBackgroundMargin * 2) * ratio)) // #3470
							};

							__drawParam.target.left.clip = clipLeft;
							__drawParam.target.right.clip = clipRight;
						}
						// [end] #3147

						// #690
						return(xUtils.axis.didDrawYAxisAsBeauty(__drawParam));
					})(__xDo, __xDo.didGetPointValue(isCompare));

				return(__result);
			};

			/**
			 *
			 * @param[in] bResize	triggered by resizing or not
			 */
			this.DrawFrame = function(bResize) {
				_prepareDrawFrame(this);

				//
				_self.didDrawVerticalGrid(this);

				// draw y-axis and grid(horizontal)
				_self.didDrawYAxis();

				// #912
				_self.DrawLastValue();


				// draw object
				_drawChartObjects(this, bResize);

				// draw border line
				_drawPanelBorder(this);

				//_self.DrawAxisBox();

				//
				_self.DrawCrossLine();
				_self.DrawCrossLineYLabel();

				// #1779
				_self.DrawTitleLabel();
				//

				_self.didSetStautsForDetailInfo(); // #2308

				_self.didSetStautsForLegendInfo(); // #2508

				//
				_didEndDrawFrame();
			};

			// #1779
			this.DrawTitleLabel = function() {
			};
			//

			/*
				* !
				*/
			this.DrawGrid = function() {
				/*
				_self.SetBaseSize();

				if (bFirst)
					_self.DrawGridX();

				if (bLast)
					_self.DrawYAxis();
					*/
			};

			/**
			 *
			 * @param[in] iLeft			left
			 * @param[in] iTop			top
			 * @param[in] strChartTitle	title
			 */
			this.SetChartTitle = function(iLeft, iTop, strChartTitle) {
				_self.m_context.font = _self.m_drawWrapper.m_stEnv.Font;//"10pt Arial";
				_self.m_context.fillStyle = _self.m_drawWrapper.m_stEnv.FontColor;//'#f0f0f0';// "#555555";
				_self.DrawText({context:_self.m_context, text:strChartTitle, left:iLeft, top:iTop});
			};

			/**
			 * set cross line
			 * @param[in] posval	{XPos:, YPos:}
			 */
			this.SetCrossLine = function(posval) {
				var __rectFullChart = _self.m_drawWrapper.GetFullDrawPanelRect(true);

				var __posXLeft 		= __rectFullChart.x;
				var __posXRight 	= __rectFullChart.x + __rectFullChart.width;
				var __posYTop 		= __rectFullChart.y;
				var __posYBottom 	= __rectFullChart.y + __rectFullChart.height;

				if (((__posXLeft < posval.XPos) && (__posXRight > posval.XPos)) && ((__posYTop < posval.YPos) && (__posYBottom > posval.YPos))) {
					var __rPos = _self.GetRelativePositionInPanel(posval.XPos, posval.YPos);

					posval.XPos = _self.SetXPosition(__rPos.x);
					posval.YPos = __rPos.y;
				}
				else {
					posval.XPos = -1;
					posval.YPos = -1;
				}

				_self.DrawCrossLine(posval);
				_self.DrawCrossLineYLabel(posval.YPos);
			};

			var _didDrawCrossLineBox = function(nCrossLineXPos, nCrossLineYPos) {
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseObjectCrossline === true && xEnv.CrossLine.hide !== true) {
					try {
						var radius   = xEnv.System.CrosslineBoxRadius;
						var isCircle = false;
						try {
							isCircle = xEnv.CrossLine.box.isCircle;
						}
						catch(e) {
							//console.debug(e);
						}

						if(radius !== undefined && radius != null) {
							if(isCircle) {
								var __drawCircleParam = {
									context : _self.m_context,
									pt : {
										x : nCrossLineXPos,
										y : nCrossLineYPos
									},
									radius : radius,
									lineWeight : xEnv.CrossLine.lineStyle.strokeWeight,
									lineColor : xEnv.CrossLine.lineStyle.strokeColor
								};

					            gxDc.Circle(__drawCircleParam);
							}
							else {
								var __drawRectParam = {
									context : _self.m_context,
									rect : {
										x : 0,
										y : 0,
										width : 0,
										height : 0
									},
									lineWidth : xEnv.CrossLine.lineStyle.strokeWeight,
						    		lineColor : xEnv.CrossLine.lineStyle.strokeColor
								};
								__drawRectParam.rect.x = nCrossLineXPos - (radius + 1);
								__drawRectParam.rect.y = nCrossLineYPos - (radius + 1);
								__drawRectParam.rect.width  =
								__drawRectParam.rect.height = radius * 2 + 1;

								gxDc.Rectangle(__drawRectParam);
							}

						}
					}
					catch(e) {
						console.error(e);
					}
				}
			};

			/**
			 * draw cross line
			 */
			this.DrawCrossLine = function(posval) {
				// #935
				var xEnv 		   = _self.didGetEnvInfo();
				var nCrossLineXPos = -1;
				var nCrossLineYPos = -1;
				if(posval === undefined || posval == null) {
					var ptCrossline= _self.didGetCrosslinePoint();
					nCrossLineXPos = ptCrossline.x;
					nCrossLineYPos = _self.GetRelativePostionY(ptCrossline.y);
				}
				else {
					nCrossLineXPos = posval.XPos;
					nCrossLineYPos = posval.YPos;
				}

				// #1518
				var __panelWidth  = _self.didGetDrawingWidth();
				var __panelHeight = _self.didGetDrawingHeight();
				//

				if(xEnv.CrossLine.hide !== true) {
					var __nFrameWidth  = _self.m_drawWrapper.GetChartFrameAreaWidth();

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
			    		lineWidth : xEnv.CrossLine.lineStyle.strokeWeight,
			    		lineColor : xEnv.CrossLine.lineStyle.strokeColor,
						lineStyle : xEnv.CrossLine.lineStyle.strokeStyle	// #3016
			    	};

					// horizontal line
					__drawLineParam.pt1.x = 0;
					__drawLineParam.pt1.y = nCrossLineYPos;
					__drawLineParam.pt2.x = __panelWidth;
					__drawLineParam.pt2.y = nCrossLineYPos;
					gxDc.Line(__drawLineParam);

					// vertical line
					__drawLineParam.pt1.x = nCrossLineXPos;
					__drawLineParam.pt1.y = 0;
					__drawLineParam.pt2.x = nCrossLineXPos;
					__drawLineParam.pt2.y = __panelHeight;
					gxDc.Line(__drawLineParam);
				}

				_didDrawCrossLineBox(nCrossLineXPos, nCrossLineYPos);

				//
				if(_self.m_drawWrapper.m_stEnv.ShowDataView === true) {
					var __nObjectCount = _self.m_arrChartObjlist.length;
					for (var idx = __nObjectCount - 1; idx >= 0; idx--) {
						_self.m_arrChartObjlist[idx].DrawDataView(idx, nCrossLineXPos);
					}
				}
			};

			/**
			 * draw cross line label for Y Axis
			 * @param[in] iYPos	local position y
			 */
			this.DrawCrossLineYLabel = function(argLocalYPos) {
				// #935
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.CrossLine.hide === true) {
					try {
						_self.m_objCrosslineLY.style.visibility = "hidden"; // #2566
			            _self.m_objCrosslineRY.style.visibility = "hidden"; // #2566
					}
					catch(e) {
						console.error(e);
					}
					return;
				}

				if(argLocalYPos === undefined || argLocalYPos == null) {
					var ptCrossline= _self.didGetCrosslinePoint();
					argLocalYPos = _self.GetRelativePostionY(ptCrossline.y);
				}

				var isCompare = xUtils.isCompareChartMode(xEnv);

				var __xAxisY = _didGetAxisYObject();

				var __verpos = __xAxisY.didGetPointValue(isCompare);
				//var symbolInfo = _self.m_drawWrapper.

	            var showStyleForLabelLY = "hidden";
	            var showStyleForLabelRY = "hidden";

				if (argLocalYPos > -1) {
					var __nPrice = __xAxisY.GetYPosToVal(argLocalYPos);

					//
					__nPrice = xUtils.axis.didAdjustZFValue(__nPrice, true);

					var xScaleUnit = __xAxisY.didGetScaleUnit();
					var xMMScreen  = xScaleUnit.minMaxScreen;
					var	xMultipleFactor = xUtils.axis.label.didCalcMutipleValue(xMMScreen.maxValue, xMMScreen.minValue);
					if(xMultipleFactor) {
						__nPrice = Math.round(__nPrice * xMultipleFactor.pow);
					}

					var strPrice = String(xUtils.number.didGetPointedValue(__nPrice, __verpos));
					//

					// #2824
					try {
						if(xMMScreen.minValue > xMMScreen.maxValue) {
							strPrice = "0";
						}
					}
					catch(e) {
						strPrice = "0";
					}
					//

					var __horzRange = _self.m_drawWrapper.GetHorizontalRangeOfAllPanelsInFullArea();

					var __textLen = _self.m_contextLY.measureText(strPrice).width;

					// #3016
					var iXPosLY = 0;
					var	iXPosRY = __horzRange.right.pos;

					_self.m_objCrosslineLY.innerHTML   = strPrice;
					_self.m_objCrosslineRY.innerHTML   = strPrice;
					_self.m_objCrosslineLY.style.left  = iXPosLY + "px";
					_self.m_objCrosslineRY.style.left  = iXPosRY + "px";
					_self.m_objCrosslineLY.style.top   = argLocalYPos - (_self.m_objCrosslineLY.offsetHeight / 2) + "px";
					_self.m_objCrosslineRY.style.top   = argLocalYPos - (_self.m_objCrosslineRY.offsetHeight / 2) + "px";
					//

					// #923
					try {
						if(xEnv.CrossLine.hide !== true) {
							if(_self.m_drawWrapper.m_stEnv.ConfigAxis.ShowLeft === true) {
			                    showStyleForLabelLY = "visible";
			                }

			                if(_self.m_drawWrapper.m_stEnv.ConfigAxis.ShowRight === true) {
			                    showStyleForLabelRY = "visible";
			                }
						}
					}
					catch(e) {
						console.error(e);
					}
	                //
				}

	            _self.m_objCrosslineLY.style.visibility = showStyleForLabelLY;
	            _self.m_objCrosslineRY.style.visibility = showStyleForLabelRY;
			};

			/**
			 *
			 */
			this.SetBaseSize = function() {
				var __xEnv   = _self.didGetEnvInfo();
				var __width  = _self.m_drawWrapper.GetChartFrameAreaWidth();
				var __height = _self.didGetDrawingHeight();
				var __marginTopOrBottom = Math.round/*parseInt*/(__height * (__xEnv.MarginTopBottom / 100));

				// #1516
				if(_self.m_bMainFrame == true && __xEnv.System.UseFlexMarginTopBottomInMain === true && __xEnv.MinMaxTooltipShow == true) {
					__marginTopOrBottom += __xEnv.System.ExtraMarginForTopBottomInMain || 30;
				}
				//

				_self.m_iBaseWidth   = __width;
				_self.m_iBaseHeight  = __height - (__marginTopOrBottom * 2);
				_self.m_iBaseOriginY = __marginTopOrBottom; // st_Environment->Area_iBlankTop;
				_self.m_iGridWidth = /*parseInt*/(_self.didGetRatioHorizontal(false));

				_self.didCalcRatioFactor();
			};

			/**
			 *
			 */
			this.DrawLine = function(stStyle) {
				var __drawParam = {
					context : stStyle.context,
					pt1 : {
						x : stStyle.startX,
						y : stStyle.startY
					},
					pt2 : {
						x : stStyle.endX,
						y : stStyle.endY
					},
					lineWidth : stStyle.lineWidth,
					lineColor : stStyle.lineColor
				};

				gxDc.Line(__drawParam);
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.DrawLastValue = function() {
				try {
					//
					// #805
					//
					var __base = _self.didGetBaseCoordinate();
					var	__xEnv = _self.didGetEnvInfo();
					//

					var __drawParam = {
						config : {
							font : __xEnv.ConfigAxis.Font,
							fontColor : "#ffffff"//__xEnv.ConfigAxis.FontColor
						},
						y : __base.y,	// origin pos y
						height : __base.height,
						target : {
							left : {
								context : _self.m_contextLY,
								width : _self.m_canvasLY.width
							},
							right : {
								context : _self.m_contextRY,
								width : _self.m_canvasRY.width
							}
						}
					};

					var	__nDataCount = _self.didGetPriceDatas().length;

					var __nObjectCount = _self.m_arrChartObjlist.length;
					var __bFirst = false;
					var __bLast = false;
					for (var __ii = 0; __ii < __nObjectCount; __ii++) {
						var __xDo = _self.m_arrChartObjlist[__ii];
						if (__ii === 0) {
							__bFirst = true;
						}
						else {
							__bFirst = false;
						}

						if (__ii === __nObjectCount) {
							__bLast = true;
						}

						__xDo.DrawLastValue(__drawParam, __nDataCount - 1);
					}
				}
				catch(e) {
					console.debug(e);
				}
			};

			//
			//
			//
			this.didSetDataViewInfo = function(arrDatas, argCrossLineXPos) {
				if(arrDatas === undefined || arrDatas == null || arrDatas.length === undefined || arrDatas.length == null) {
					return;
				}

				var __nObjectCount = _self.m_arrChartObjlist.length;
				for (var ii = 0; ii < __nObjectCount; ii++) {
					var xDo = _self.m_arrChartObjlist[ii];
					var xInfo = xDo.didGetDataViewDataAtPos(argCrossLineXPos);
					if(xInfo !== undefined && xInfo != null) {
						arrDatas.push(xInfo);
					}
				}
			};
			//

			/**
			 * deselect all object
			 */
			this.DeselectAllObject = function() {
				for (var idx = 0; idx < _self.m_arrChartObjlist.length; idx++) {
					var xDo = _self.m_arrChartObjlist[idx];

					//
					xDo.DeselectAllObject();
				}
			};

			/**
			 * チャートオブジェクトが選択されたかを判断する。
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.OnSelectChartObj = function(posval, isHover) { // #2521
				// Y位置をRelative位置へ変換する。
				// Canvas上の位置
				posval.YPos = posval.YPos - _self.m_chartdraw.offsetTop;
				// 修正したとマーキングする。
				posval.YPosAdjusted = true;

				//
				var hitPoint = {
					XPos : _self.m_drawWrapper.GetPosXMargined(posval.XPos),
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
				var idx = 0;
				_self.m_selectTrendlineObj = null;
				//
				_self.m_xSelectedOepObject = null;

				var xEnv = _self.didGetEnvInfo();

				// 順序的に上に位置されているもの（ゼロが一番下）から検査する。
				var __nObjectCount = _self.m_arrChartObjlist.length;
				for (idx = __nObjectCount - 1; idx >= 0; idx--) {
					var __xDo =  _self.m_arrChartObjlist[idx];

					//
					// #644
					// 注文・ポジションライン選択を先にする。
					//

					// ポジション
					if(__xDo.m_arrPosits !== undefined && __xDo.m_arrPosits != null) {
						var __nPositCount = __xDo.m_arrPosits.length;
						for(var ii = __nPositCount - 1; ii >= 0; ii--) {
							var objPositObj = _self.m_arrChartObjlist[idx].m_arrPosits[ii];

							// HitTest
							_self.m_xSelectedOepObject = objPositObj.didHitTest(posval, hitTestTool);
							if (_self.m_xSelectedOepObject) {
								iSelectIndex = xUtils.constants.default.DEFAULT_WRONG_VALUE;
								break;
							}
						}
						if (_self.m_xSelectedOepObject) {
							break;
						}
					}

					// 注文
					if(__xDo.m_arrOrders !== undefined && __xDo.m_arrOrders != null) {
						var __nOrderCount = __xDo.m_arrOrders.length;
						for(var ii = __nOrderCount - 1; ii >= 0; ii--) {
							var objOrderObj = _self.m_arrChartObjlist[idx].m_arrOrders[ii];

							// HitTest
							_self.m_xSelectedOepObject = objOrderObj.didHitTest(posval, hitTestTool);
							if (_self.m_xSelectedOepObject) {
								iSelectIndex = xUtils.constants.default.DEFAULT_WRONG_VALUE;
								break;
							}
						}
						if (_self.m_xSelectedOepObject) {
							break;
						}
					}

					// #1878, #2521
					// Alert & Execution
					if(__xDo.didHitTestForAlertObject) {
						_self.m_xSelectedOepObject = __xDo.didHitTestForAlertObject(posval, hitTestTool);
						if (_self.m_xSelectedOepObject) {
							iSelectIndex = xUtils.constants.default.DEFAULT_WRONG_VALUE;
							break;
						}
					}

					if(isHover != true && __xDo.didHitTestForExecutionObject) {
						_self.m_xSelectedOepObject = __xDo.didHitTestForExecutionObject(posval, hitTestTool);
						if (_self.m_xSelectedOepObject) {
							iSelectIndex = xUtils.constants.default.DEFAULT_WRONG_VALUE;
							break;
						}
					}
					// [end] #1878, #2521

					// トレンドラインから検査する。
					var __nLSCount = __xDo.m_arrTrendlineObjlist.length;
					for (var idxTrend = 0; idxTrend < __nLSCount; idxTrend++) {
						var objLSObj = __xDo.m_arrTrendlineObjlist[idxTrend];
						////console.debug("OnSelectChartObj(Trend) => " + idxTrend + ", " + objLSObj.m_strTrendlineName);

						// HitTest
						_self.m_selectTrendlineObj = objLSObj.didHitTest(posval, hitTestTool);
						if (_self.m_selectTrendlineObj) {
							iSelectIndex = xUtils.constants.default.DEFAULT_WRONG_VALUE;
							break;
						}
					}

					if (_self.m_selectTrendlineObj) {
						break;
					}
				}

				//
				// 注文・ポジション・トレンドラインではない場合は価格・指標をチェックする。
				//
				// #1017
				if (xEnv.System.ContainerSelect === true &&
					xEnv.System.IndicatorSelect === true &&	// #1671
					!_self.m_xSelectedOepObject && !_self.m_selectTrendlineObj) {
					var SelectObj = null;
					for (idx = __nObjectCount - 1; idx >= 0; idx--) {
						var __xDo =  _self.m_arrChartObjlist[idx];
						if(__xDo.m_bPrice === true) {
							continue;
						}

						var bSelectChartObj;

						bSelectChartObj = __xDo.didHitTest(posval, hitTestTool);

						// var SelectObj = null;
						if (bSelectChartObj) {
							iSelectIndex = idx;
							SelectObj = _self.m_arrChartObjlist[idx];
							break;
						}
					}

					if (iSelectIndex > -1) {
						_self.m_arrChartObjlist.splice(iSelectIndex, 1);
						_self.m_arrChartObjlist.push(SelectObj);
					}
				}

				// クローズ
				hitTestTool.closeHitTest(true);
				hitTestTool = {};

				//
				return iSelectIndex;// (iSelectIndex != -1);
			};

			this.DrawText = function(stStyle) {
				stStyle.context.fillText(stStyle.text, stStyle.left, stStyle.top);
			};

			/**
			 *
			 */
			this.GetRelativePostionX = function(argAbsolutePostionX) {
				return(_self.m_drawWrapper.GetRelativePostionX(argAbsolutePostionX));
			};

			/**
			 *
			 */
			this.GetRelativePostionY = function(argAbsolutePostionY, bFlag) {
				if(bFlag === true) {
					return(_self.m_drawWrapper.GetRelativePostionY(argAbsolutePostionY));
				}
				else {

					var __nRelativePosYOnRoot = _self.m_drawWrapper.GetRelativePostionY(argAbsolutePostionY);
					var __nRelativePositionY = __nRelativePosYOnRoot - (_self.m_chartdraw.offsetTop);
					return(__nRelativePositionY);
				}
			};

			/**
			 *
			 */
			this.GetRelativePositionXInfo = function(argAbsolutePostionX) {
				return(_self.m_drawWrapper.GetRelativePositionXInfo(argAbsolutePostionX));
			};

			/**
			 *
			 */
			this.GetRelativePositionInPanel = function(argAbsolutePostionX, argAbsolutePostionY) {
				var __xPosInfo = _self.GetRelativePositionXInfo(argAbsolutePostionX);
				var __yPos = _self.GetRelativePostionY(argAbsolutePostionY);

				var __result = {
					x: {
						pos: __xPosInfo.pos,
						idx: __xPosInfo.idx
					},
					y: __yPos
				};

				return(__result);
			};

			/**
			 * get base coordinate information
			 * @return {y:, width:, height:, rh:, rv:}
			 */
			this.didGetBaseCoordinate = function() {
				var __result = {
					x: 0,
					y: _self.m_iBaseOriginY,
					width: _self.m_drawWrapper.GetChartFrameAreaWidth(),
					height: _self.m_iBaseHeight,
					rh: _self.m_iGridWidth,
					rv: _self.m_iGridHeight
				};

				return(__result);
			};

			/**
			 * get ratio for horizontal
			 * @param[in] baseIsPixel	index / pixel or pixel / index
			 * @return ratio
			 */
			this.didGetRatioHorizontal = function(baseIsPixel) {
				var __ratio = _self.m_drawWrapper.didGetRatioHorizontal(baseIsPixel);
				return(__ratio);
			};

			/**
			 * get last chart object in order
			 * @return object or null
			 */
			this.didGetLastChartObject = function() {
				var __nObjectCount = _self.m_arrChartObjlist.length;
				if(__nObjectCount === undefined || __nObjectCount < 1) {
					//console.debug('didGetLastChartObject => Result is null because of no items');
					return(null);
				}

				var __xDo = _self.didGetChartObjectAt(__nObjectCount - 1);
				return(__xDo);
			};

			/**
			 * get chart object at index
			 * @param[in] argIndex	index
			 * @return object or null
			 */
			this.didGetChartObjectAt = function(argIndex) {
				var __nObjIdx = argIndex === undefined ? 0 : argIndex;
				var __nObjectCount = _self.m_arrChartObjlist.length;
				if(__nObjectCount === undefined || __nObjectCount < 1 || __nObjIdx < 0 || __nObjIdx >= __nObjectCount) {
					//console.debug('didGetChartObjectAt => Result is null because of out of bounds.');
					return(null);
				}

				var __xDo = _self.m_arrChartObjlist[argIndex];
				return(__xDo);
			};

			/**
			 * @return radius value
			 */
			this.didGetSelectionMarkRadius = function() {
				if(_self.m_iGridWidth < 8) {
					return(3);
				}

				return(4);
			};

			/**
			 * get price data array
			 * @return array
			 */
			this.didGetPriceDatas = function() {
				var __datas = _self.m_drawWrapper.didGetPriceDatas();

				return(__datas);
			};

			/**
			 * get price data array
			 * @return array
			 */
			this.didGetReferencedPriceDatas = function() {
				var __datas = _self.m_drawWrapper.didGetReferencedPriceDatas();

				return(__datas);
			};

			/**
			 *
			 */
			this.didClearIndicatorDatas = function() {
				var __nObjectCount = _self.m_arrChartObjlist.length;
				for(var ii = 0; ii < __nObjectCount; ii++) {
					var __xDo = _self.m_arrChartObjlist[ii];
					if(__xDo.didClearIndicatorDatas !== undefined) {
						__xDo.didClearIndicatorDatas();
					}
				}
			};

			//
			//
			//

			this.didGetScaleUnit = function(isRef) {
				if(isRef === true) {
					return(_self.m_xScaleInfo.current);
				}

				return(xUtils.didClone(_self.m_xScaleInfo.current));
			}

			/**
			 * Y軸の情報を取得する。
			 * @param  {[type]} argDo
			 * @return {[type]}
			 */
			this.didGetYAxisInfo = function(argDo) {
				var xScaleUnit = _self.didGetScaleUnit();
				var xYai = {
					min : xScaleUnit.minMaxScreen.minValue,
					max : xScaleUnit.minMaxScreen.maxValue,
					axis: _self
				};

				if(argDo !== undefined && argDo != null) {
					var xDoSu = argDo.didGetScaleUnit();
					if(argDo.m_bPriceType !== true || _self.m_bMainFrame !== true) {
						xYai.min = xDoSu.minMaxScreen.minValue;
						xYai.max = xDoSu.minMaxScreen.maxValue;
						xYai.axis= argDo;
					}
				}

				return(xYai);
			};

			//
			// NOTE: X Axis
			//

			/**
			 * get local position x from screen start index
			 * @param[in] argLocalIdx	local index
			 * @return local position
			 */
			this.GetXPos = function(argLocalIdx) {
				var __nScrXPos = _self.m_drawWrapper.GetXPos(argLocalIdx);
				return(__nScrXPos);
			};

			/**
			 * convert horizontal position to index
			 * use screen index
			 * @param[in] nScrIdx	screen index
			 * @return position
			 */
			this.didConvertHorizontalLocalIndexToPos = function(nScrIdx) {
				var __nXPos = _self.m_drawWrapper.didConvertHorizontalLocalIndexToPos(nScrIdx);
				return(__nXPos);
			};

			/**
			 * convert position to data index
			 * @param[in] argPosX	position x
			 * @return index
			 */
			this.didConvertHorizontalPosToDataIndex = function(argPosX) {
				return(_self.m_drawWrapper.didConvertHorizontalPosToDataIndex(argPosX));
			};

			/**
			 * convert position to data index
			 * @param[in] argPosX	position x
			 * @return index
			 */
			this.didConvertScreenIndexToDataIndex = function(argScrIdx) {
				return(_self.m_drawWrapper.didConvertScreenIndexToDataIndex(argScrIdx));
			};

			//
			// NOTE: Y Axis
			//

			/**
			 * convert price to pixel position
			 * @param[in] strPrice	price
			 * @return position
			 */
			this.GetYPos = function(strPrice) {
				var xScaleUnit = _self.m_xScaleInfo.current;

				var __base = _self.didGetBaseCoordinate();
				var __nPriceDiff = xUtils.didConvertToPrice(strPrice) - xScaleUnit.minMaxScreen.minValue;

				var __nLocalYPos = xUtils.axis.didGetLocalYPos(__base, __nPriceDiff);

				return(__nLocalYPos);
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
			this.GetYPosToVal = function(argLocalPosY) {
				var __xAxisY = _didGetAxisYObject();
				if(__xAxisY !== undefined && __xAxisY != null) {
					return(__xAxisY.GetYPosToVal(argLocalPosY));
				}

				// TODO: return undefined???
				var __xVci = _self.didGetVerticalConvertInfo(argLocalPosY);
				var __nPrice = Math.round(__xVci.min + __xVci.offset * __xVci.ratioPv);

				return(__nPrice);
			};

			// #2038
			this.GetYPixelToVal = function(argOffset) {
				var __xAxisY = _didGetAxisYObject();
				if(__xAxisY !== undefined && __xAxisY != null) {
					return(__xAxisY.GetYPixelToVal(argOffset));
				}

	        	var __xVci = _self.didGetVerticalConvertInfo(0);
				var __nPrice = xUtils.didRoundPrice(argOffset * __xVci.ratioPv);

	            return(__nPrice);
	        };
			//

			/**
			 * convert position to adjusted position
			 * fit to bar position
			 *
			 * @param[in] argScrPosInfo	screen position information {pos:, idx:}
			 * @return position
			 */
			this.SetXPosition = function(argScrPosInfo) {
				var scrPosInfo = argScrPosInfo;
				var nLocalPos = scrPosInfo.pos;
				var nLocalIdx = scrPosInfo.idx;

				var iXPos     = _self.didConvertHorizontalLocalIndexToPos(nLocalIdx);

				return iXPos;
			};

			// #1290
			this.didGetCrosslinePoint = function() {
				return(_self.m_drawWrapper.didGetCrosslinePoint());
			};

			// #1372
			this.didGetDrawingWidth = function(isCalc) { // #3284
				// #3284
				if(isCalc == true) {
					return(_self.m_rectInfo.width - (_self.m_rectInfo.lw + _self.m_rectInfo.rw));
				}
				//

				return(_self.m_rectInfo.width);
			};

			this.didGetDrawingHeight = function() {
				return(_self.m_rectInfo.height);
			};

			// #2308
			this.didSetStautsForDetailInfo = function() {
				if(_self.m_initParam.btnDetailInfo) {
					if(_self.m_bMainFrame == true) {
						var xEnv = _self.didGetEnvInfo();
						if(xEnv.DetailViewStatusIsShown == true) {
							_self.m_initParam.btnDetailInfo.disabled = true;
						}
						else {
							_self.m_initParam.btnDetailInfo.disabled = false;
						}
					}
				}
			};
			//

			// #2508
			this.didSetStautsForLegendInfo = function() {
				if(_self.m_initParam.btnLegendInfo) {
					var nCount = _self.m_arrChartObjlist.length;
					var bShow = false;
					if(nCount > 0) {
						for(var ii = 0; ii < nCount; ii++) {
							var xDo = _self.m_arrChartObjlist[ii];
							if(xDo && xDo.hasObjectToShow) {
								if(xDo.hasObjectToShow() == true) {
									bShow = true;
									break;
								}
							}
						}
					}

					if(true == bShow) {
						_self.m_initParam.btnLegendInfo.style.visibility = "visible";
					}
					else {
						_self.m_initParam.btnLegendInfo.style.visibility = "hidden";
					}
				}
			};
			//
		};

	    exports.createPanel = function(chartWrapper, drawWrapper) {
	        return(new this.panelBase(chartWrapper, drawWrapper));
	    };

	    return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDrawFrameBase");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDrawFrameBase"] =
            loadModule(
                global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDOFactory"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./canvas2DUtil"),
				require("./chartUtil"),
				require("./chartDOFactory")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDrawFrameBase",
            ['ngc/canvas2DUtil', 'ngc/chartUtil', 'ngc/chartDOFactory'],
                function(gxDc, xUtils, doFactory) {
                    return loadModule(gxDc, xUtils, doFactory);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDrawFrameBase"] =
            loadModule(
                global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDOFactory"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDrawFrameBase");
})(this);
