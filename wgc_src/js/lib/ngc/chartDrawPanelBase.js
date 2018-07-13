(function(global){
	"use strict";

	var loadModule = function(xUtils, drawFrameClass, xAxisPanelClass, doFactory, axisUnitFactory, extraPanelClass, tooltipClass, gxDc) {
		"use strict";

		var exports = function(chartWrapper, ctrlLayout) {
			//
			// private
			//
			var _self = this;
			var _chartWrapper = chartWrapper;
			var _drawFrameClass = drawFrameClass;
			var _ctrlLayout = ctrlLayout;
			var _doFactory = doFactory;

			//
			this.OBJECT_NAME = "BASE_LAYOUT";

			this.m_doFactory = doFactory;
			this.m_chartWrapper = _chartWrapper;
			this.m_ctrlLayout = _ctrlLayout;
			this.m_domElemChartDraw = null;
			this.m_xDoBasePrice = null;
			this.m_arrChartDrawFramelist = [];
			this.m_chartXAxisObj = null;
			this.m_arrIchiMokulist = [];	// ichimoku list
			this.m_strCompareCode = "";		//
			this.m_strDomElemPostfix = "";

			this.m_arrDoSubPrices = [];	// #1181

			this.m_domElems = {
				layoutRoot : null,
				layout : null,
				panelRoot : null,
				axis : null,
				axisCanvas : null,
				axisLabel : null
			};

			//
			//
			//
			this.m_xScrollInfo = {
				pos: 0,
				range : {
					location : 0,
					length : 0
				},
				screenSize: _ctrlLayout.m_stEnv.System.Scroll.zoom, // #2057

				// #1653
				useCalcZoom:true,
				barSize : _ctrlLayout.m_stEnv.System.Scroll.barSize,// #2057
				barGap  : _ctrlLayout.m_stEnv.System.Scroll.barGap,	// #2057
				//

				// #2038
				levelList : _ctrlLayout.m_stEnv.System.Scroll.LevelList,
				level     : _ctrlLayout.m_stEnv.System.Scroll.Level ? _ctrlLayout.m_stEnv.System.Scroll.Level : 0,
				//
			};

			this.m_xShiftInfo = {
				all: 0,
				left: 0,
				right: 0
			};

			this.m_iSpanMax = 0;			//
			this.m_iStartX = 0;
			this.m_iEndX = 0;

			this.m_iXPosIndex = 0;
			this.m_bMouseDown = false;
			this.m_bMouseRowResize = false;
			this.m_bMouseUpXArea = false;
			this.m_iXPosMouseDown = 0;

			this.m_bTrendLine = false;					// line-study creating mode
			this.m_bOrderLine = false;
			this.m_bMouseDownSelectedChartObj = false;

			// #1290
			this.m_ptCrossline = {};
			this.m_bCrosslineObject = false;
			//
			this.m_nSelectedChartObjectIndex = -1;
			//

			this.m_SelectFrame = null;
			this.m_iRowPos = null;
			this.m_iCanvasMouseDownIndex = 0;
			this.m_iCanvasMouseMoveIndex = 0;

			//
			// base information
			//
			this.m_symbolInfo = {};

			// base data
			this.m_xPriceInfo = {
				m_iHighVal : -xUtils.constants.default.DEFAULT_WRONG_VALUE,
				m_iLowVal : xUtils.constants.default.DEFAULT_WRONG_VALUE,
				m_iUpCount : 0,
				m_iDownCount : 0,
				m_bStateUp : false,
				m_bStateDown : false,
				m_iOpenVal : 0,
				m_iBoxCount : 0,
				m_iBoxSize : 0
			};

			//
			this.m_stEnv = _ctrlLayout.m_stEnv;

			//
			this.m_xSwipeInfo = {};
			this.m_xSwipeEvent;

			//
			this.m_xAxisX = null;
			this.m_nAxisX = xUtils.constants.ngc.enum.ELS_NORMAL;

			this.m_nXWidth= 0;

			//
			//
			//

			//
			// private methods
			//

			// #3140, #3147
			var _didDrawBackgrounds = function() {
				var xEnv = _self.didGetEnvInfo();
				var canvas = _self.m_domElems.background;
				if(canvas) {
					var context = canvas.getContext("2d");

					canvas.style.backgroundColor = "transparent";
					context.clearRect(0, 0, 1, canvas.height);
					context.clearRect(0, 0, canvas.width, canvas.height);

					//
					var nFrameCount = _self.m_arrChartDrawFramelist.length;
					if(nFrameCount > 1) {
						var __bgWidth  = _self.GetDrawPanelWidth();
						for(var ii = 1; ii < nFrameCount; ii++) {
							var xFrame = _self.m_arrChartDrawFramelist[ii];
							if(!xFrame) {
								continue;
							}

							try {
								var bgColor  = xFrame.didGetBackgroundColor(true);
								var rectInfo = xFrame.m_rectInfo;

								var drawRectParam = {
						    		context : context,
						    		rect : {
							    		x : 0,
							    		y : Math.round(rectInfo.y + xEnv.System.SubBackgroundMargin),
							    		width : Math.round(__bgWidth),
							    		height : Math.round(rectInfo.height - xEnv.System.SubBackgroundMargin * 2)
						    		},
						    		lineWidth : 1,
						    		lineColor : bgColor,
									fillColor : bgColor,
						    	};
								gxDc.Rectangle(drawRectParam);
							}
							catch(e) {
								console.error(e);
							}
						}
					}
				}
			};

			var _didAdjustSizeForBackgrounds = function() {
				var xEnv = _self.didGetEnvInfo();

				var __bgLeft   = xEnv.ExtraPanelWidth;
				var __bgWidth  = _self.GetDrawPanelWidth();
				var __bgHeight = _self.GetFullDrawPanelHeight();

				if(_self.m_domElems.background) {
					var devicePixelRatio = window.devicePixelRatio || 1;
					var ratio = devicePixelRatio;

					_self.m_domElems.background.width  = ratio * __bgWidth;
					_self.m_domElems.background.height = ratio * __bgHeight;

					_self.m_domElems.background.style.left   = __bgLeft   + "px";
					_self.m_domElems.background.style.width  = __bgWidth  + "px";
					_self.m_domElems.background.style.height = __bgHeight + "px";
				}

				if(_self.m_domElems.backgroundLogo) {
					_self.m_domElems.backgroundLogo.style.left   = __bgLeft   + (xEnv.System.BackgroundLogo.LeftMargin) + "px";
					_self.m_domElems.backgroundLogo.style.top    = __bgHeight - (xEnv.System.BackgroundLogo.BottomMargin + xEnv.System.BackgroundLogo.Height) + "px";
				}
			};
			// [end] #3140, #3147

			var _didAdjustSizeOfPanels = function() {
				//
				_self.CheckBlankChartDrawFramelist();

				var iFrameCount = _self.m_arrChartDrawFramelist.length;
				var iChartWrapHeight = _self.GetFullDrawPanelHeight();
				var iDivFrameHeight = parseInt(iChartWrapHeight / (iFrameCount + 1));

				var __resizeParam = {
					left: _self.GetLeftPosOfTheLayout(),
					top: 0,
					width: _self.GetDrawPanelWidth(),
					height: 0,
					leftY: _self.m_stEnv.System.YAxisLeft,
					rightY: _self.m_stEnv.System.YAxisRight
				};


				var __previousPos = 0;
				var __previousHeight = 0;
				for (var __ii = 0; __ii < iFrameCount; __ii++) {
					var __drawPanel = _self.m_arrChartDrawFramelist[__ii];

					if(__ii === 0) {
						__resizeParam.top = 0;
					}
					else {
						__resizeParam.top = __previousPos + __previousHeight - 1;
					}

					if(__ii === (iFrameCount - 1)) {
						__resizeParam.height = iChartWrapHeight - (__resizeParam.top) + 1;
					}
					else if(__ii === 0) {
						__resizeParam.height = iDivFrameHeight * 2;
					}
					else {
						__resizeParam.height = iDivFrameHeight;
					}

					__drawPanel.didResizePanel(__resizeParam);

					__previousPos = __resizeParam.top;
					__previousHeight = __resizeParam.height;
				}

				// X Axis
				var xEnv = _self.didGetEnvInfo();
				__resizeParam.top    = _self.GetFullDrawPanelHeight() - 1;
				__resizeParam.height = xUtils.didGetXAxisHeight(xEnv) + 1;
				_self.m_chartXAxisObj.didResizePanel(__resizeParam);

				// #1298
				__resizeParam.left   = 0;
				__resizeParam.top	 = 0;
				__resizeParam.height = _self.GetFullDrawPanelHeight() + xUtils.didGetXAxisHeight(xEnv);
				__resizeParam.width	 = xEnv.ExtraPanelWidth;
				_self.m_xExtraPanel.didResizePanel(__resizeParam);

				_didAdjustSizeForBackgrounds(); // #3140, #3147

				//
				_self.SetBottomButton(iChartWrapHeight);
			};

			/**
			 * move boundary between panels
			 *
			 * @param[in] argPosY position(screen)
			 */
			var _didMovePanelBoundaryPosTo = function(argPosY, panelNo) {
				// #1050
				if(_self.m_bMouseDown === true || panelNo > 0) {
					_self.SetMouseCursor('row-resize');
				}

				//
				// moving border between panels
				//
				if(_self.m_bMouseDown) {
					_self.m_bMouseRowResize = true;

					var __nUpperPanelNo = _self.m_iCanvasMouseDownIndex - 1;
					var __nLowerPanelNo = _self.m_iCanvasMouseDownIndex;

					var __drawPanelUpper = _self.GetDrawPanelAt(__nUpperPanelNo);
					var __drawPanelLower = _self.GetDrawPanelAt(__nLowerPanelNo);

					// if one or twe panel is null, do default.
					if ((__drawPanelUpper === null) || (__drawPanelLower === null)) {
						_self.m_bMouseRowResize = false;
						_self.SetMouseCursor('default');
						return;
					}

					var __upperRect = __drawPanelUpper.didGetPanelRect();
					var __lowerRect = __drawPanelLower.didGetPanelRect();

					// y position on chart base
					var __yPosAtChart = _self.GetPosYMargined(argPosY);
					// moved offset
					var __movedOffset = __lowerRect.top - __yPosAtChart;

					// changed height
					var __upperHeight = __upperRect.height - __movedOffset;
					var __lowerHeight = __lowerRect.height + __movedOffset;

					//
					var __limitHeight = xUtils.constants.chartConfigConstants.MinimumPanelSpace;
					if ((__upperHeight < __limitHeight) || (__lowerHeight < __limitHeight)) {
						return;
					}

					// resize panel height
					__drawPanelUpper.didResizePanelHeight(__upperHeight + 1);
					// #3470
					var lowerYPos = __drawPanelUpper.m_rectInfo.y + __drawPanelUpper.m_rectInfo.height;
					__drawPanelLower.didResizePanelHeight(__lowerHeight - 1, lowerYPos);
					// [end] #3470

					// re-draw
					__drawPanelUpper.DrawFrame(true);
					__drawPanelLower.DrawFrame(true);
				}
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			var _didCheckIfSelectedChartObjectIsTrendlineOrNot = function() {
				var selectedIndex = _self.m_nSelectedChartObjectIndex;
				if(selectedIndex === undefined || selectedIndex == null || selectedIndex < 0) {
					return;
				}

				if(selectedIndex >= xUtils.constants.default.DEFAULT_WRONG_VALUE) {
					return(true);
				}

				return(false);
			};

			/**
			 * non-time datas or not
			 * @return true or false
			 */
			this.isNontimeChartType = function() {
				return(xUtils.isNontimeChartType(_self.m_stEnv.ChartType));
			};

			//
			// public methods
			//

			this.DisableSelection = function(divObj) {
				if(typeof divObj.onselectstart != 'undefined') // IE
						divObj.onselectstart = function(){ return false; };
				// else if(typeof divObj.style.MozUserSelect != 'undefined') // FireFox
				// divObj.style.MozUserSelect = 'none';
			};

			/**
			 *
			 */
			this.didCreateDrawPanel = function(argNo, initParam) {
				//
				var __chartDrawFrame = _drawFrameClass.createPanel(_chartWrapper, _self);

				// if empty, it is default panel as Base price bar
				if(argNo === 0) {
					// save base price
					_self.m_xDoBasePrice = __chartDrawFrame.didInitDrawFrame(true, initParam);
				}
				else {
					__chartDrawFrame.didInitDrawFrame(false, initParam);
				}

				return(__chartDrawFrame);
			};

			/**
			 * create new panel
			 *
			 * @param[in] argNo 		panel number
			 * @param[in] argBlank		create blank or not
			 * @param[in] argBasePrice	base price
			 * @return panel
			 */
			this.didAppendDrawPanel = function(argNo, argBlank, argBasePrice, argTypeName, argChartType) {
				var __parentObj = _self.m_domElems.panelRoot;
				_self.DisableSelection(__parentObj);

				var initParam = {
					root : _self.m_domElemChartDraw,
					no : argNo,
					parent : __parentObj,
					onMouseDown : _self.OnCanvasMouseDownPosition,
					onMouseMove : _self.OnCanvasMouseMovePosition,
					onClose : _self.OnCloseButtonClick,
					closeImage : _chartWrapper.m_EtcFolder + 'Close_H.png',
					anotherInfo : null,
					blank : argBlank,
					basePrice : argBasePrice,
					priceTypeName : argTypeName
				};

				//
				var __chartDrawFrame = _self.didCreateDrawPanel(argNo, initParam, argChartType);

				//
				_self.m_arrChartDrawFramelist.push(__chartDrawFrame);

				//
				return(__chartDrawFrame);
			};

			/**
			 *
			 */
			this.didCreateAxisXPanel = function() {
				//
				// X Axis
				//
				_self.m_chartXAxisObj = new xAxisPanelClass(_chartWrapper, _self, _ctrlLayout);
				_self.m_chartXAxisObj.Init();
			};

			/**
			 * create chart's drawing frame
			 * @param[in] argBasePrice
			 * @param[in] argTypeName
			 */
			this.didCreateChartDrawFrame = function(argBasePrice, argTypeName) {
				//
				// draw frame(panel)
				//
				_self.m_arrChartDrawFramelist = [];
				_self.didAppendDrawPanel(0, false, argBasePrice, argTypeName, _self.m_stEnv.ChartType);

				//
				// X Axis
				//
				_self.didCreateAxisXPanel(_self.m_stEnv.ChartType);

				// #1298
				_self.didCreateExtraPanel();

				//
				//
				//
				_self.ResizeChart(true);

				// _self.SetBottomButton(iChartWrapHeight);
			};

			/**
			 *
			 */
			this.didGetShiftInfo = function(bRecalc) {
				if(bRecalc === true) {
					var __nFrameCount = _self.m_arrChartDrawFramelist.length;
					_self.m_xShiftInfo.all = 0;
					_self.m_xShiftInfo.left = 0;
					_self.m_xShiftInfo.right = 0;

					for(var __ii = 0; __ii < __nFrameCount; __ii++) {
						var __xPanel = _self.m_arrChartDrawFramelist[__ii];
						if(__xPanel !== undefined && __xPanel != null && __xPanel.didCalcShiftInfo !== undefined) {
							(function(argPanel, argRef){
								var ___tempResult = argPanel.didCalcShiftInfo();
								argRef.all = Math.max(___tempResult.all, argRef.all);
								argRef.left = Math.max(___tempResult.left, argRef.left);
								argRef.right = Math.max(___tempResult.right, argRef.right);
							})(__xPanel, _self.m_xShiftInfo);
						}
					}
				}

				return(_self.m_xShiftInfo);
			};

			this.SetBottomButton = function(iChartWrapHeight) {
				var domElemBottomTools = _chartWrapper.didFindDomElementById("idChartBottomTools");
				if(domElemBottomTools !== undefined && domElemBottomTools != null) {
					domElemBottomTools.style.left = (_self.GetDrawPanelWidth() / 2) - (180 / 2) + "px";
					domElemBottomTools.style.top = iChartWrapHeight - 5 + "px";
				}
			};

			/**
			 * onclick event handler
			 * for close button(x)
			 * @param[in] event	event
			 */
			this.OnCloseButtonClick = function(event) {
				var iIndex = String(event.currentTarget.id).substring(10,12);
				if (!_self.m_arrChartDrawFramelist[iIndex].m_bMainFrame) {
					var bExistIchiMoku = false;
					var iExistSpanIndex = -1;
					var idxObj = 0;
					for (idxObj = 0; idxObj < _self.m_arrChartDrawFramelist[iIndex].m_arrChartObjlist.length; idxObj++) {
						var idxSpan = 0;
						if(_self.m_arrChartDrawFramelist[iIndex].m_arrChartObjlist[idxObj].m_strChartName == 'IchiMoku')
						{
							for (idxSpan = 0; idxSpan < _self.m_arrIchiMokulist.length; idxSpan++)
							{
								if(_self.m_arrIchiMokulist[idxSpan] == parseInt(_self.m_arrChartDrawFramelist[iIndex].m_arrChartObjlist[idxObj].m_arrPeriod[3]))
								{
									iExistSpanIndex = idxSpan;
									break;
								}
							}
							if(iExistSpanIndex > -1)
							{
								_self.m_iSpanMax = 0;
								_self.m_arrIchiMokulist.splice(iExistSpanIndex, 1);
								for (idxSpan = 0; idxSpan < _self.m_arrIchiMokulist.length; idxSpan++)
									_self.m_iSpanMax = Math.max(_self.m_iSpanMax, _self.m_arrIchiMokulist[idxSpan]);

								var iGap = parseInt(_self.m_arrChartDrawFramelist[iIndex].m_arrChartObjlist[idxObj].m_arrPeriod[3]) - _self.m_iSpanMax;
								for (var idxDelete = 0; idxDelete < iGap; idxDelete++)
									_gfJsonData.Modules.deleteBlankData();
							}

							bExistIchiMoku = true;
							break;
						}
					}

					_self.m_arrChartDrawFramelist[iIndex].OnDestroy();

					if(bExistIchiMoku)
					{

						for (var idx = 0; idx < _self.m_arrChartDrawFramelist.length; idx++)
						{
							for (idxObj = 0; idxObj < _self.m_arrChartDrawFramelist[idx].m_arrChartObjlist.length; idxObj++)
							{
								if (!_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_bMainChart)
								{
									_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].didClearData(1, _self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_strChartName);
									// this.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].ReceiveData();
								}
							}
						}
						_self.ReceiveData();
					}

					_self.ResizeChart(false);
				}
			};

			/**
			 * calculate for real data
			 *
			 * @param {any} bReal
			 * @returns true or false
			 */
			this.didCalculateAllData = function(bReal) {
				var __nFrameCount = _self.m_arrChartDrawFramelist.length;
				if(bReal === true) {
					var nDSize = _self.GetBaseDataCount();
					var nStart = _self.m_xScrollInfo.pos;
					var nSSize = _self.m_xScrollInfo.screenSize;
					for(var __ii = 0; __ii < __nFrameCount; __ii++) {
						(function(argPanel){
							if(argPanel !== undefined && argPanel != null && argPanel.didCalculateData !== undefined) {
								argPanel.didCalculateRealData(nStart, nDSize, nSSize);
							}

						})(_self.m_arrChartDrawFramelist[__ii]);
					}
				}
				else {
					for(var __ii = 0; __ii < __nFrameCount; __ii++) {
						(function(argPanel){
							if(argPanel !== undefined && argPanel != null && argPanel.didCalculateData !== undefined) {
								argPanel.didCalculateData();
							}

						})(_self.m_arrChartDrawFramelist[__ii]);
					}
				}

				return(true);
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didCalculateDataForExtraObject = function() {
				var nFrameCount = _self.m_arrChartDrawFramelist.length;

				var nDSize = _self.GetBaseDataCount();
				var nStart = _self.m_xScrollInfo.pos;
				var nSSize = _self.m_xScrollInfo.screenSize;
				for(var __ii = 0; __ii < nFrameCount; __ii++) {
					(function(argPanel){
						if(argPanel !== undefined && argPanel != null && argPanel.didCalculateDataForExtraObject !== undefined) {
							argPanel.didCalculateDataForExtraObject(nStart, nDSize, nSSize);
						}

					})(_self.m_arrChartDrawFramelist[__ii]);
				}
			};

			/*
			this.ReceiveData = function() {
				var idx = 0;
				var idxObj = 0;
				for (idx = 0; idx < _self.m_arrChartDrawFramelist.length; idx++)
				{
					if(this.m_arrChartDrawFramelist[idx].m_bMainFrame)
					{
						for (idxObj = 0; idxObj < _self.m_arrChartDrawFramelist[idx].m_arrChartObjlist.length; idxObj++)
						{
							if(_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_bMainChart)
							{
								_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].ReceiveData();
								break;
							}
						}
						break;
					}
				}

				for (idx = 0; idx < _self.m_arrChartDrawFramelist.length; idx++)
				{
					// if(this.m_arrChartDrawFramelist[idx].m_bMainFrame)
					{
						for (idxObj = 0; idxObj < _self.m_arrChartDrawFramelist[idx].m_arrChartObjlist.length; idxObj++)
						{
							if (!_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_bMainChart)
								_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].ReceiveData();
						}
					}
				}
			};
			*/

			this.ReceiveCompareData = function(strCode) {
				for (var idx = 0; idx < _self.m_arrChartDrawFramelist.length; idx++)
				{
					if(_self.m_arrChartDrawFramelist[idx].m_bMainFrame)
						_self.m_arrChartDrawFramelist[idx].ReceiveCompareData(strCode);
				}
			};

			this.CalcMaxMin = function() {
				for (var idx = 0; idx < _self.m_arrChartDrawFramelist.length; idx++)
				{
					_self.m_arrChartDrawFramelist[idx].CalcMaxMin();
				}
			};

			/**
			 *
			 */
			this.DrawingChartDrawFrame = function(bResize) {
				var __axisPanel = _self.m_domElems.axis;
				__axisPanel.style.backgroundColor = _self.m_stEnv.BackgroundColor;

				if (!bResize) {
					_self.didCalcMinMax(false);
				}
				for (var idx = 0; idx < _self.m_arrChartDrawFramelist.length; idx++) {
					(function(drawPanel){
						drawPanel.DrawFrame(bResize);
					})(_self.m_arrChartDrawFramelist[idx]);
				}

				_self.m_chartXAxisObj.didDraw();

				// #1298
				if(_self.m_xExtraPanel && _self.m_xExtraPanel.didDraw) {
					_self.m_xExtraPanel.didDraw();
				}
				//

				_didDrawBackgrounds(); // #3140, #3147
			};

			/**
			 * resize chart
			 * @param  {[type]} bResize
			 * @return {[type]}
			 */
			this.ResizeChartEx = function(bResize) {
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseObjectCrossline === true) {
					if(_self.m_ptCrossline.x === undefined || _self.m_ptCrossline.x == null || _self.m_ptCrossline.y === undefined || _self.m_ptCrossline.y == null) {
						var iChartWrapWidth  = _self.GetDrawPanelWidth();
						var iChartWrapHeight = _self.GetFullDrawPanelHeight();

						_self.m_ptCrossline.x	= parseInt(iChartWrapWidth  / 2);
						_self.m_ptCrossline.y	= parseInt(iChartWrapHeight / 2);
					}
				}

				// #705
				_didAdjustSizeOfPanels();
				//

				//
				// #705
				_ctrlLayout.RecalcProc(xUtils.constants.ngcl.enum.EUS_RESIZE);
				//

				//
				_self.didRecalcFactor();

				//
				_self.DrawingChartDrawFrame(bResize);


			};

			/**
			 *
			 */
			this.ResizeChart = function(bResize) {
				_self.ResizeChartEx(bResize);
			};

			/**
			 * initialize dom elements
			 * @return {[type]}
			 */
			this.didInitElements = function() {
				_self.m_domElems.layoutRoot = _chartWrapper.didFindDomElementById("idChartArea");
				var __deParent = _self.m_domElems.layoutRoot;

				var __domElemId = "";

				// layout
				__domElemId = "idChartDrawAPIPanel" + _self.m_strDomElemPostfix;
				_self.m_domElems.layout = document.createElement("div");
				_self.m_domElems.layout.setAttributeNS( null, "id", __domElemId);
				_self.m_domElems.layout.className = "classChartLayout";

				// panels
				__domElemId = "idChartDrawArea" + _self.m_strDomElemPostfix;
				_self.m_domElems.panelRoot = document.createElement("div");
				_self.m_domElems.panelRoot.setAttributeNS( null, "id", __domElemId);
				_self.m_domElems.panelRoot.className = "classChartDrawArea";

				// axis
				__domElemId = "idChartXArea" + _self.m_strDomElemPostfix;
				_self.m_domElems.axis = document.createElement("div");
				_self.m_domElems.axis.setAttributeNS( null, "id", __domElemId);
				_self.m_domElems.axis.className = "classChartXArea";

				// extra panel
				__domElemId = "idChartExtraPanel";
				_self.m_domElems.extraPanel = document.createElement("div");
				_self.m_domElems.extraPanel.setAttributeNS( null, "id", __domElemId);
				_self.m_domElems.extraPanel.className = "classChartExtraPanel";

				// #3147
				// background
				__domElemId = "idChartDrawAreaBackground" + _self.m_strDomElemPostfix;
				_self.m_domElems.background = document.createElement("canvas");
				_self.m_domElems.background.setAttributeNS( null, "id", __domElemId);
				_self.m_domElems.background.className = "classChartDrawAreaBackground";

				__domElemId = "idChartDrawAreaBackgroundLogo" + _self.m_strDomElemPostfix;
				_self.m_domElems.backgroundLogo = document.createElement("div");
				_self.m_domElems.backgroundLogo.setAttributeNS( null, "id", __domElemId);
				_self.m_domElems.backgroundLogo.className = "classChartDrawAreaBackgroundLogo";

				_self.m_domElems.panelRoot.appendChild(_self.m_domElems.background);
				_self.m_domElems.panelRoot.appendChild(_self.m_domElems.backgroundLogo);
				//

				// make tree
				_self.m_domElems.layout.appendChild(_self.m_domElems.panelRoot);
				_self.m_domElems.layout.appendChild(_self.m_domElems.axis);
				__deParent.appendChild(_self.m_domElems.layout);

				//
				return(_self.m_domElems.layout);
			};

			/**
			 * remove elements link
			 */
			this.didRemoveLinkElements = function() {
				if(_self.m_domElems.layoutRoot !== undefined && _self.m_domElems.layoutRoot != null) {
					_self.m_domElems.axis.removeChild(_self.m_domElems.axisCanvas);
					_self.m_domElems.axis.removeChild(_self.m_domElems.axisLabel);

					// #3147
					_self.m_domElems.panelRoot.removeChild(_self.m_domElems.background);
					_self.m_domElems.panelRoot.removeChild(_self.m_domElems.backgroundLogo);
					//

					_self.m_domElems.layout.removeChild(_self.m_domElems.axis);
					_self.m_domElems.layout.removeChild(_self.m_domElems.extraPanel);
					_self.m_domElems.layout.removeChild(_self.m_domElems.panelRoot);

					_self.m_domElems.layoutRoot.removeChild(_self.m_domElems.layout);
				}
			};

			var _InitAxisX = function(bDefault, nStyle) {
				var	nAxis	= nStyle ;

				if( bDefault ) {
					_self.SetAxisStyle ( xUtils.constants.ngc.enum.ELS_NORMAL ) ;
				}
				else {
					_self.SetAxisStyle ( nAxis ) ;
				}

				return xUtils.constants.ngc.define.NGC_SUCCESS ;
			};

			// #2038
			this.didInitVariables = function() {
				var levelInfo = _self.didGetScrollLevelInfo();
				var barGapInfo= xUtils.axis.didCalcBarGapInfoFromLevelInfo(_self.m_xScrollInfo.barSize, _self.m_xScrollInfo.barGap, levelInfo);

				if(barGapInfo) {
					_self.m_xScrollInfo.barSize = barGapInfo.barSize;
					_self.m_xScrollInfo.barGap  = barGapInfo.barGap;
				}

				// #2566
				try {
					var xEnv = _self.didGetEnvInfo();
					_self.m_strTrendLine = xEnv.System.DefaultTrendline;
					xUtils.didStateChangeOnTrendline(xEnv, _self.m_strTrendLine);
				}
				catch(e) {
					console.error(e);
				}
				//
			};
			//

			/**
			 * Init
			 */
			this.didInitDrawPanelLayout = function(argBasePrice) {
				// #2038
				_self.didInitVariables();

				// create root element of the chart
				_self.m_domElemChartDraw = _self.didInitElements();

				// #3404
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseForMiniChart == true) {
					try {
						if(_self.m_domElems && _self.m_domElems.backgroundLogo) {
							_self.m_domElems.backgroundLogo.style.display = "none";
						}
					}
					catch(e) {
						console.error(e);
					}
				}
				// [end] #3404

				// create layer
				_self.didCreateChartDrawFrame(argBasePrice);

				//
				_InitAxisX(true, 0);
			};

			/**
			 * check blank panel and remove
			 *
			 *
			 */
			this.CheckBlankChartDrawFramelist = function() {
				var iElementIdIndex = -1;
				var idx = 0;
				var parentObj;
				var divObj;
				var canvasObj;
				var canvasObjLY;
				var canvasObjRY;
				var closeBtn;

				//
				// reverse tracking
				//
				for (idx = _self.m_arrChartDrawFramelist.length - 1; idx >= 0; idx--) {
					var __drawPanel = _self.m_arrChartDrawFramelist[idx];
					// console.debug("[WGC] :" + _self.m_arrChartDrawFramelist[idx].m_arrChartObjlist.length);
					if(__drawPanel !== undefined && __drawPanel != null && __drawPanel.didCheckEmptyPanel(true) === true) {
						_self.m_arrChartDrawFramelist.splice(idx, 1);
					}
				}

				for(var __ii in _self.m_arrChartDrawFramelist) {
					var __drawPanel = _self.m_arrChartDrawFramelist[__ii];
					if(__drawPanel !== undefined && __drawPanel != null) {
						__drawPanel.didResetPanelNo(__ii);
					}
				}
			};

			/**
			 * change chart type origin is OnMenuBasicChartClick
			 * ChangeLayout
			 * @param[in] strBasicChart chart type
			 */
			this.didChangeBasicChartType = function(strBasicChart) {
				var	nAxisID	= xUtils.getChartTypeNumCodeFromCode(strBasicChart);

				_self.SetAxisStyle( nAxisID ) ;
			};

			/**
			 * [description]
			 * @param  {Boolean} isAdjustedPanel
			 * @param  {[type]}  extraInfo
			 * @return {[type]}
			 */
			this.didEndChangeForIndicator = function(isAdjustedPanel, extraInfo) {
				//
				if(isAdjustedPanel === true) {
					//
					// #705
					_didAdjustSizeOfPanels();
					//
				}

				//
				// #710
				//
				var bRecalc = true;

				if(extraInfo !== undefined && extraInfo != null) {
					bRecalc = false;

					if(extraInfo.param === true || extraInfo.shift === true) {
						bRecalc = true;
					}
				}

				if(bRecalc === true) {
					// シフト情報を更新する。
					_self.didGetShiftInfo(true);

					//
					_ctrlLayout.RecalcProc(xUtils.constants.ngcl.enum.EUS_ADD_SERIES);

					//
					_self.didRecalcFactor();
				}

				//
				//_self.ResizeChart(false);
				_self.DrawingChartDrawFrame(false);
			};

			/**
			 * 指標を追加する。
			 * @param  {string} code
			 * @param  {string} info
			 * @return {boolean}
			 */
			this.didAddIndicator = function(code, info, isRef) {
				// price trend type or not
				var __xDos = _self.m_doFactory.createDrawObject(code, false, info, isRef);
				if(__xDos === undefined || __xDos == null) {
					return(false);
				}

				var __bPriceType = __xDos.m_bPriceType;

				var isAdjustedPanel = false;

				if(__bPriceType) {
					var iMainChartIdx;
					var idx = 0;
					for(idx = 0; idx < _self.m_arrChartDrawFramelist.length; idx++)
					{
						if(_self.m_arrChartDrawFramelist[idx].m_bMainFrame)
						{
							iMainChartIdx = idx;
							break;
						}
					}

					_self.m_arrChartDrawFramelist[iMainChartIdx].didAddChartObj(__xDos);
				}
				else {
					var __nFrameCount = _self.m_arrChartDrawFramelist.length;
					if(__nFrameCount < 0) {
						__nFrameCount = 0;
					}

					// #468
					var __drawPanel = _self.didAppendDrawPanel(__nFrameCount, true);
					if(__drawPanel !== undefined && __drawPanel != null) {
						__drawPanel.didAddChartObj(__xDos);
					}

					isAdjustedPanel = true;
				}

				_self.didEndChangeForIndicator(isAdjustedPanel);

				return(true);
			};

			/**
			 *
			 */
			this.OnTrendLineAdd = function(strTrendLine) {
			};

			// #1441, #1298
			this.didGetScrollInfo = function(isCopy) {
				if(!_self.m_xScrollInfo) {
					return;
				}

				if(isCopy == true) {
					return(xUtils.didClone(_self.m_xScrollInfo));
				}

				return(_self.m_xScrollInfo);
			};
			// [end] #1441

			/**
			 * get scroll size
			 * @return size
			 */
			this.didGetScrollSize = function() {
				return(_self.m_xScrollInfo.range.length);
			};

			//
			this.didGetScrollEndPos = function() {
				//return(_self.m_xScrollInfo.range.length - (_self.m_xShiftInfo.right + _self.m_xScrollInfo.screenSize));
				return(_self.m_xScrollInfo.range.length - (_self.m_xScrollInfo.screenSize));
			};

			/**
			 *
			 * @return {[type]} [description]
			 */
			this.didScrollToEndPos = function(bEndPos, isNotFix, bDraw) {
				// #895
				if(bEndPos !== true) {
					if(isNotFix !== true) {
						_self.m_stEnv.GoToEndPos = false;
					}

					return(true);
				}
				else {
					if(isNotFix !== true) {
						_self.m_stEnv.GoToEndPos = true;
					}
				}

				// #1456
				_self.didStopSwipeAction();
				//

				//
				_self.m_xScrollInfo.pos = _self.didGetScrollEndPos();

				_ctrlLayout.RecalcProc(xUtils.constants.ngcl.enum.EUS_SCROLL);

				_self.didRecalcFactor();

				_self.DrawingChartDrawFrame(false);

				return(true);
			};

			/**
			 * #985
			 * @return {[type]} [description]
			 */
			var _didScrollTo = function(argPos, bDraw) {
				var __nScrollCount = _self.didGetScrollSize();
				var __bChanged = true;
				var __nNewPos = 0;
				var __xEnv = _self.didGetEnvInfo();

				if(argPos !== undefined && argPos != null) {
					__nNewPos = parseInt(argPos);
				}

				__xEnv.GoToEndPos = false;
				if(__nNewPos < 0) {
					__nNewPos = 0;
					__bChanged = false;
				}
				else if(__nNewPos >= __nScrollCount - _self.m_xScrollInfo.screenSize) {
					__nNewPos = __nScrollCount - _self.m_xScrollInfo.screenSize;
					__bChanged = false;
					__xEnv.GoToEndPos = true;
				}

				_self.m_xScrollInfo.range.extra = 0;

				if(__nNewPos === _self.m_xScrollInfo.pos) {
					return(false);
				}

				//
				_self.m_xScrollInfo.pos = __nNewPos;

				_ctrlLayout.RecalcProc(xUtils.constants.ngcl.enum.EUS_SCROLL);

				_self.didRecalcFactor();

				if(bDraw === true) {
					_self.DrawingChartDrawFrame(false);
				}

				return(true);
			};

			/**
			 *
			 */
			var _didZoomTo = function(nShows, bDraw) {
				var	xEnv = _self.didGetEnvInfo();
				var __nCurPos = _self.m_xScrollInfo.pos;
				var __nCurSize = _self.m_xScrollInfo.screenSize;
				if(nShows == __nCurSize) {
					return(false);
				}

				__nCurSize = nShows;
				if(__nCurSize < xEnv.System.Scroll.screenSize.min) {
					__nCurSize = xEnv.System.Scroll.screenSize.min;
				}
				else {
					// #1824
					__nCurSize = _self.didAdjustZoomMax(__nCurSize);

					//
					var __nTemp = __nCurSize + __nCurPos;
					var __nDiff = __nTemp - _self.m_xScrollInfo.range.length;

					if(__nDiff > 0) {
						var __nTempPos = __nCurPos - __nDiff;
						if(__nTempPos < 0) {
							// __nCurSize = __nCurSize + __nTempPos;
							__nTempPos = 0;
						}

						__nCurPos = __nTempPos;
					}
				}

				_self.m_xScrollInfo.pos 		= __nCurPos;
				_self.m_xScrollInfo.screenSize	= __nCurSize;

				// 画面サイズが既存スクロールサイズを超えた場合、スクロールサイズを変更する。
				// また、位置を０にする。
				if(_self.m_xScrollInfo.range.length < _self.m_xScrollInfo.screenSize) {
	        		// if range is smaller than screen size, set range to screen size and set position to zero.
	        		_self.m_xScrollInfo.range.length = _self.m_xScrollInfo.screenSize;
	        		_self.m_xScrollInfo.pos = 0;
	        	}

				//
				// TODO: #643
				// スクロールが終わったら、再計算
				//
				_ctrlLayout.RecalcProc(xUtils.constants.ngcl.enum.EUS_SCROLL);
				//

				// TODO: #691
				_self.didRecalcFactor();

				//
				if(bDraw === true) {
					_self.DrawingChartDrawFrame(false);
				}

				return(true);
			};

			/**
			 * scroll
			 *
			 * @param[in] nDelta delta
			 */
			this.didScrollScreen = function(nDelta, bDraw, isMouse) {
				if(nDelta === 0) {
					return(false);
				}

				var __nScrollCount = _self.didGetScrollSize();
				var __bChanged = true;
				var __nNewPos = _self.m_xScrollInfo.pos - nDelta;
				var __xEnv = _self.didGetEnvInfo();

				// console.debug("[WGC] :" + __nNewPos + ", " + nDelta);
				// #985
				var nOverTriggerForRequestingPastCount = 0;
				if(isMouse === true && xUtils.isAvailableChartTypeForCallingPreviousNext(__xEnv)) {
					_self.m_bOverTriggerForRequestingPast = true;
					nOverTriggerForRequestingPastCount = parseInt(0.3 * _self.m_xScrollInfo.screenSize);

					if(isNaN(nOverTriggerForRequestingPastCount)) {
						nOverTriggerForRequestingPastCount = 0;
					}
				}
				//

				// #985
				if(__nNewPos < (-1 * nOverTriggerForRequestingPastCount)) {
					__nNewPos = (-1 * nOverTriggerForRequestingPastCount);
					__bChanged = false;
				}
				else if(__nNewPos > __nScrollCount - _self.m_xScrollInfo.screenSize) {
					__nNewPos = __nScrollCount - _self.m_xScrollInfo.screenSize;
					__bChanged = false;
				}

				_self.m_xScrollInfo.pos = __nNewPos;

				if(isMouse === true && __nNewPos < 0) {
					_self.m_xScrollInfo.range.extra = __nNewPos;
				}

				//
				// TODO: #643
				// スクロールが終わったら、再計算
				//
				_ctrlLayout.RecalcProc(xUtils.constants.ngcl.enum.EUS_SCROLL);
				//

				// TODO: #691
				_self.didRecalcFactor();

				if(bDraw === true) {
					_self.DrawingChartDrawFrame(false);
				}

				return(__bChanged);
			};

			// #1824
			this.didAdjustZoomMax = function(zoomSize) {
				var xEnv = _self.didGetEnvInfo();
				try {
					// if(_ctrlLayout && _ctrlLayout.didGetSBHandle && _ctrlLayout.didGetSBHandle()) {
					// 	return(zoomSize);
					// }

					// #1824
					if(xEnv.System.Scroll.screenSize.max !== undefined && xEnv.System.Scroll.screenSize.max != null && zoomSize > xEnv.System.Scroll.screenSize.max) {
						zoomSize = xEnv.System.Scroll.screenSize.max;
					}
				}
				catch(e) {
					console.error(e);
				}

				return(zoomSize);
			};

			/**
			 *
			 */
			this.didZoomScreen = function(nDelta, bDraw) {
				// #1495
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseScrollAction !== true) {
					return;
				}
				//

				// #1653
				try {
					var frameWidth = _self.GetChartFrameAreaWidth();
					var barSizeLimit = parseInt(frameWidth / 4);
					_self.m_xAxisX.CalculateScrollInfo(_self.m_xScrollInfo, xEnv, nDelta, barSizeLimit);
				}
				catch(e) {
					console.error(e);
				}
				// [end] #1653

				//
				// TODO: #643
				// スクロールが終わったら、再計算
				//
				_ctrlLayout.RecalcProc(xUtils.constants.ngcl.enum.EUS_ZOOM); // #1653
				//

				// TODO: #691
				_self.didRecalcFactor();

				//
				if(bDraw === true) {
					_self.DrawingChartDrawFrame(false);
				}
			};

			this.didToggleGoToEndPos = function(isStop) {
				try {
					var	xEnv = _self.didGetEnvInfo();

					if(isStop === true) {
						var nEndPos = _self.didGetScrollEndPos();

						if(_self.m_xScrollInfo.pos >= nEndPos) {
							xEnv.GoToEndPos = true;
						}
					}
					else {
						xEnv.GoToEndPos = false;
					}
				}
				catch(e) {
					console.error(e);
				}
			}

			/**
			 * onmousedown handler
			 *
			 * @param[in] posval {XPos:0, YPos:0}
			 *
			 */
			this.OnMouseDown = function(posval, argEvent, isAxisArea, actionArea) {
				var xEnv = _self.didGetEnvInfo();

				// #1927
				_self.didClearTooltipEventer();
				_self.didShowTooltip(false);
				//

				_self.m_bOverTriggerForRequestingPast = false;

				//
				// #599
				_self.didStopSwipeAction();

				_self.m_bMouseDown = true;

				// #1290
				_self.m_bCrosslineObject = false;
				//

				_self.m_bMouseUpXArea = false;
				_self.m_iXPosMouseDown = posval.XPos;

				_self.m_bMouseDownSelectedChartObj = false;
				//
				_self.m_nSelectedChartObjectIndex = -1;
				//

				// #1300
				var isDeleteOneRepeat = xUtils.trendLine.isDeleteOneRepeat(_self.m_strTrendLine);
				var isCrossHairMode = xUtils.trendLine.isCrossHairMode(_self.m_strTrendLine); // #2566
				var isAvailableToSelectObject = xUtils.isAvailableToSelectObject(xEnv); // #2566

				//
				if(_self.m_bTrendLine && isDeleteOneRepeat !== true && isCrossHairMode !== true) { // #2566
					// #554
					var xPanel = _self.m_arrChartDrawFramelist[_self.m_iCanvasMouseDownIndex];
					if(xPanel !== undefined && xPanel != null && xPanel.m_bMainFrame === true) {
						// #1300
						if(xUtils.trendLine.isDeleteOneRepeat(_self.m_strTrendLine) === true) {
							// 全てのオブジェクトを非選択ステータスへ変更する。
							_self.didDeselectAllFrameObjects();

							//
						}
						else {
							// #1094
							var nAllTrendlineCount = _self.didGetCountForAllTrenslines();
							var bOverLimit = false;
							var bNewOrderLine = xUtils.trendLine.isNewOrderLine(_self.m_strTrendLine);
							if(nAllTrendlineCount >= xEnv.System.TrendlineLimits) {
								bOverLimit = true;
							}

							if(bNewOrderLine != true && bOverLimit == true) {
								console.debug("[WGC] Over limit");
								//
								// TODO: notify
								setTimeout(function() {
									try {
										_ctrlLayout.didNotifyForError(xUtils.error.errorCodes.overLimitForTrendline);
									}
									catch(e) {
										console.debug(e);
									}
								},
								50);

								return;
							}
							else {
								//
								//
								//
								var trendLineInfo;

								try {
									trendLineInfo = _ctrlLayout.didFindTrendlineInfoAt(_self.m_strTrendLine);

									//
									trendLineInfo.isAdd = true;
								}
								catch(e) {
									console.debug(e);
								}

								xPanel.CreateTrendlineObj(_self.m_strTrendLine, posval, trendLineInfo);

								// #2241
								// 再描画する。
								_self.DrawingChartDrawFrame(false);
							}
						}
					}
				}
				else if(isAxisArea === true) {
					var xResAa = _self.didProcForMouseDownInAxisArea(posval, argEvent);
					if(xResAa === true) {
						return;
					}

					return(true);
				}
				//
				//
				// クリック時、オブジェクトがマウス位置にあるかを調査する。
				//
				//else if ((!_self.m_bMouseRowResize) && (_self.didCheckPosvalInPanel(posval) === true)) {
				else if((_self.didCheckPosvalInPanel(posval) === true)) {
					// カーサを変更する。
					// #2361
					if(actionArea) {
						_self.UnsetMouseCursor(); // #2384
					}
					else {
						// #2384
						if(xEnv.CrossLine.hide == true) {
							// #2796, #3022
							if(isDeleteOneRepeat != true) {
								_self.UnsetMouseCursor(); // #2384
								_self.SetMouseCursor('move');
							}
							//
						}
						else {
							_self.UnsetMouseCursor(); // #2796
							_self.SetMouseCursor('move'); // #2384
						}
						// #2384
					}

					// 全てのオブジェクトを非選択ステータスへ変更する。
					_self.didDeselectAllFrameObjects();

					// #1290
					_self.m_bCrosslineObject = _self.isHitCrosslineBox(posval);
					if(_self.m_bCrosslineObject === true) {
						// console.debug("[LOG#1290] isHitCrosslineBox => Hitted!!! : " + JSON.stringify(posval));
					}
					else if(isDeleteOneRepeat == true || isAvailableToSelectObject == true) { //#2566
						// マウスが位置した描画パネルを取得する。
						var localDrawFrame = _self.m_arrChartDrawFramelist[_self.m_iCanvasMouseDownIndex];

						// 情報があれば何が選択されたか検査する。
						if(localDrawFrame !== undefined && localDrawFrame != null) {
							//
							_self.m_nSelectedChartObjectIndex = localDrawFrame.OnSelectChartObj(posval);

							//
							// #2133
							var notifyData;

							if(localDrawFrame.m_selectTrendlineObj) {
								// #1300
								if(_self.m_bTrendLine && isDeleteOneRepeat === true) {
									localDrawFrame.didRemoveSelectedLineTool();
								}
								else {
									// #2133
									notifyData = localDrawFrame.m_selectTrendlineObj.didGetSimpleAttribute();
									//
								}
							}

							// #2133
							setTimeout(function() {
								try {
									_ctrlLayout.didNotifyForTrendline(notifyData);
								}
								catch(e) {
									console.debug(e);
								}
							},
							50);
							//

							// #2462, #2459
							if(localDrawFrame.m_xSelectedOepObject && localDrawFrame.m_xSelectedOepObject.isAvailableToMoveObject) {
								if(localDrawFrame.m_xSelectedOepObject.isAvailableToMoveObject() != true) {
									localDrawFrame.m_xSelectedOepObject.DeselectAllObject();
									localDrawFrame.m_xSelectedOepObject = undefined;
									_self.m_nSelectedChartObjectIndex = -1;
								}
							}
							//
						}
					}

					// 再描画する。
					_self.DrawingChartDrawFrame(false);
				}


				// nothing to be selected
				if(_self.m_nSelectedChartObjectIndex < 0) {
					//
					_didCheckPanelResizeFlagWithRowPos(_self.m_iRowPos);
					//
				}

				//#1779
				var xResAction = _self.didProcForMouseDownAboutAction(posval, argEvent, actionArea);
				if(xResAction === true) {
					_self.m_bMouseDown = false; // #2361

					return;
				}

				// #599
				_self.didPrepareSwipeAction(posval);
				//
			};

			/**
			 * onmouseup handler
			 *
			 * @param[in] posval {XPos:0, YPos:0}
			 */
			this.OnMouseUp = function(posval, argEvent, isAxisArea) {
				//
				var mouseDownedPanel = _self.GetDrawPanelAt(_self.m_iCanvasMouseDownIndex);

				//
				var iSelectIndex = -1;
				var SelectObj = null;
				var iObjCount = 0;
				var idx = 0;
				var	xEnv = _self.didGetEnvInfo();

				// #1300
				var isDeleteOneRepeat = xUtils.trendLine.isDeleteOneRepeat(_self.m_strTrendLine);

				//
				// Linestudy mode
				//
				if(_self.m_bMouseDown) {
					if(_self.m_bTrendLine || _self.m_bOrderLine) {
						if(isDeleteOneRepeat !== true && // #1300
							mouseDownedPanel !== undefined && mouseDownedPanel != null) {
							//
							// #476
							mouseDownedPanel.SetTrendlineLastPoint(posval);

							// #1094
							var xDecoResult = mouseDownedPanel.DidEndCreatingObject();
							if(xDecoResult) {
								if(xDecoResult.newOrder !== undefined && xDecoResult.newOrder != null) {
									// TODO: reflect
									if(_self.m_chartWrapper.didReflectCallForNewOrder) {
										var xOepData = xDecoResult.newOrder;
										xOepData.isNew = true;
										xOepData.objectInfo = xDecoResult.newOrder;

										_self.m_chartWrapper.didReflectCallForNewOrder(xOepData);
									}
								}

								if(xDecoResult.refresh === true) {
									_self.DrawingChartDrawFrame(false);
								}
							}
							//
						}

						if(_self.m_chartWrapper.m_callbackTrendline !== undefined && _self.m_chartWrapper.m_callbackTrendline != null) {
							_self.m_chartWrapper.m_callbackTrendline.call();
							_self.m_bTrendLine = false;
						}
					}
					//
					// 注文・ポジション移動モード
					//
					else if(mouseDownedPanel && mouseDownedPanel.m_xSelectedOepObject) {
						var oepResult = mouseDownedPanel.m_xSelectedOepObject.didStopEditMode(posval, argEvent);

						if(oepResult !== undefined && oepResult != null) {
							// TODO: reflect
							if(_self.m_chartWrapper.didReflectCallForOepValueIsChanged) {
								_self.m_chartWrapper.didReflectCallForOepValueIsChanged(oepResult);
							}
						}

						_self.DrawingChartDrawFrame(false);
					}
					else {
						// #985
						if(_self.m_xScrollInfo.pos < 0) {
							_didScrollTo(0, true);

							if(_self.m_chartWrapper.didReflectCallForRequestNextData) {
								_self.m_chartWrapper.didReflectCallForRequestNextData();
							}
						}
						//
					}
				}

				// #1524
				var cursor = 'default';
				if(isAxisArea === true) {
					var check = _self.didCheckOepPosInAxisArea(posval);
					if(check && check.cursor) {
						cursor = check.cursor;
					}
				}
				// [end] #1524

				_self.SetMouseCursor(cursor);	// #1524


				_self.m_iRowPos = null;
				_self.m_bMouseDown = false;
				_self.m_bMouseRowResize = false;
				_self.m_bMouseDownSelectedChartObj = false;

				// #1169
				_self.m_bOrderLine = false;

				//
				_self.m_nSelectedChartObjectIndex = -1;
				//

				//
				_self.m_bOverTriggerForRequestingPast = false;

				//
				// #599
				//
				if(_self.didTriggerSwipeAction(posval) !== true) {
					_self.didToggleGoToEndPos(true);
				}

				// #1290
				_self.m_bCrosslineObject = false;

				// #2361, #2431, #2360
				//
				if(_self.didProcForCursorForTrendline) {
					_self.didProcForCursorForTrendline(_self.m_strTrendLine, cursor);
				}
				else {
					_self.UnsetMouseCursor(); // #2384
				}
				//
			};

			var _didCheckInRowGapSize = function(argGap) {
				if(argGap === undefined || argGap == null) {
					return(false);
				}

				if ((argGap >= 0) && (argGap < 10)) {
					return(true);
				}

				return(false);
			};

			var _didCheckPanelResizeFlagWithRowPos = function(argRowPos) {
				if(argRowPos === undefined || argRowPos == null) {
					_self.m_bMouseRowResize = false;
				}
				else {
					_self.m_bMouseRowResize = true;
				}
			};

			/**
			 * onmousemove handler
			 *
			 * @param[in] posval {PosX:0, PosY:0}
			 */
			this.OnMouseMove = function(posval, isAxisArea, actionArea) {
				var xEnv = _self.didGetEnvInfo();

				// #1290
				var bAllowScroll = _self.didProcForCrosslineOnMouseMove(posval);

				//
				var divObjTop    = _chartWrapper.didFindDomElementById("idChartDraw" + (_self.m_iCanvasMouseDownIndex-1));
				var divObjBottom = _chartWrapper.didFindDomElementById("idChartDraw" + _self.m_iCanvasMouseDownIndex);
				var divObjMove   = _chartWrapper.didFindDomElementById("idChartDraw" + _self.m_iCanvasMouseMoveIndex);
				var xEnv = _self.didGetEnvInfo();
				//
				if(divObjMove === null || divObjMove === undefined) {
					_self.m_bMouseRowResize = false;
					_self.UnsetMouseCursor(); // #2384
					return;
				}

				// #1050
				var iRowResizeGap = _self.GetPosYMargined(posval.YPos) - divObjMove.offsetTop;
				if(_didCheckInRowGapSize(iRowResizeGap) === true) {
					_self.m_iRowPos = iRowResizeGap;
				}
				else {
					_self.m_iRowPos = null;
				}

				// #1300
				var isDeleteOneRepeat = xUtils.trendLine.isDeleteOneRepeat(_self.m_strTrendLine);
				var isCrossHairMode = xUtils.trendLine.isCrossHairMode(_self.m_strTrendLine); // #2566

				//
				if(_self.m_bMouseDown && (_self.m_bTrendLine || _self.m_bOrderLine) && isCrossHairMode != true) { // #2566
					// #1300
					if(isDeleteOneRepeat !== true) {
						_self.m_arrChartDrawFramelist[_self.m_iCanvasMouseDownIndex].SetTrendlineLastPoint(posval);
						_self.DrawingChartDrawFrame(false);
					}
				}
				else if((_self.m_bMouseDown && !_self.m_bMouseRowResize)) {
					// TrendLine Moving
					if(_self.m_nSelectedChartObjectIndex === xUtils.constants.default.DEFAULT_WRONG_VALUE) {
						// #2431
						var localDrawFrame = _self.m_arrChartDrawFramelist[_self.m_iCanvasMouseDownIndex];
						try {
							if(localDrawFrame.SetTrendlineMove(posval) === true) {
								_self.SetMouseCursor('move', true); //
							}
							_self.DrawingChartDrawFrame(false);
						}
						catch(e) {
							console.error(e);
						}
						//
						return;
					}

					// #1147
					if(xEnv.System.UseScrollAction !== true) {
						return;
					}
					//

					if(bAllowScroll !== true) {
						return;
					}

					_self.UnsetMouseCursor(); // #2566
					_self.SetMouseCursor('move');

					var __currentIdx = _self.didConvertHorizontalPosToDataIndex(posval.XPos, false);
					var __previousIdx = _self.didConvertHorizontalPosToDataIndex(_self.m_iXPosMouseDown, false);
					var iIndexGap = __currentIdx - __previousIdx;
					if(iIndexGap !== 0) {
						// #895
						_self.didToggleGoToEndPos(false);
						//

						//
						_self.didScrollScreen(iIndexGap, false, true);
						//

						_self.DrawingChartDrawFrame(false);

						if(Math.abs(iIndexGap) > 0) {
							_self.m_iXPosMouseDown = posval.XPos;
						}
					}
				}
				else if(((_didCheckInRowGapSize(iRowResizeGap) === true) || _self.m_bMouseRowResize) && _didCheckIfSelectedChartObjectIsTrendlineOrNot() !== true) {
					_didMovePanelBoundaryPosTo(posval.YPos, _self.m_iCanvasMouseMoveIndex);
				}
				else {
					// #1524
					var cursor = 'default';
					if(isAxisArea === true) {
						var check = _self.didCheckOepPosInAxisArea(posval);
						if(check && check.cursor) {
							cursor = check.cursor;
						}
					}
					// [end] #1524
					//

					_self.m_bMouseRowResize = false;

					// #2360
					if(isAxisArea != true && _self.didProcForCursorForTrendline) {
						_self.didProcForCursorForTrendline(_self.m_strTrendLine, cursor);
					}
					else {
						_self.SetMouseCursor(cursor);	// #1524
					}
					//

					_self.m_iXPosIndex = _self.didConvertHorizontalPosToDataIndex(posval.XPos, false);

					// #2566
					_self.didProcForTooltip(posval, actionArea);

					if(_self.didProcForMouseHoverOnObject) {
			 			_self.didProcForMouseHoverOnObject(posval, actionArea); // #2361
					}
					//
				}
			};

			/**
			 * @param[in] event			event
			 */
			this.OnSwipe = function(event) {
				// #775
				var xEnv = _self.didGetEnvInfo();
				// #1557
				if(xUtils.isAvailableSmoothScroll(xEnv) !== true) {
					return;
				}
				//

				// イベントがない場合は処理しない。
				if(event === undefined || event == null) {
					return;
				}

				//
				// スワイプフラグがあった場合は処理しない。
				//
				if(_self.m_xSwipeInfo.isSwipe === true) {
					return;
				}

				var swipestart = event.swipestart;
				var swipestop  = event.swipestop;

				var distance   = {
					x : swipestop.coords[0] - swipestart.coords[0],
					y : swipestop.coords[1] - swipestart.coords[1]
				};

				var elapsedTime = swipestop.time - swipestart.time; // milliSeconds
				var velocity = {
					x : distance.x / elapsedTime,
					y : distance.y / elapsedTime
				};

				/*
				// console.debug("[WGC] \n\nOnSwipe");
				// console.debug("[WGC] :" + distance);
				// console.debug("[WGC] :" + elapsedTime);
				// console.debug("[WGC] Distance : " + distance);
				// console.debug("[WGC] Elapse : " + elapsedTime);
				// console.debug("[WGC] Velocity : " + JSON.stringify(velocity));
				*/

				// スクロールスタート
				_self.m_xSwipeInfo.isSwipe = true;
				//
				_self.didSwipeScroll(velocity.x);
			};

			/**
			 * [description]
			 * @param  {[type]} velocity
			 * @return {[type]}
			 */
			this.didSwipeScroll = function(velocity) {
				//
				var swipeFunction = function() {
					//
					// pixel per bar
					//

					// #2677
					var baseFrame = _self.didGetBasePriceFrame();
					var distanceFactor;
					var localDistanceFactor = _self.didGetDistanceFactor();
					if(localDistanceFactor !== 0) {
						distanceFactor = localDistanceFactor;
						if(distanceFactor < 0.1) {
							distanceFactor = 0.1;
						}
					}
					//

					//
					// ベジエ情報を取得する。
					var bezierCurveInfo = xUtils.smoothScroll.didGetBezierCurveInfo(velocity, distanceFactor);

					//
					var nLoop = bezierCurveInfo.datas.length;
					var nIndex = 0;

					// 単位実行関数
					var funcInterval = function() {
						// spline information
						var splineInfo = bezierCurveInfo.datas[nIndex];
						// 例外の場合はストップする。
						if(splineInfo === undefined) {
							//
							_self.didStopSwipeAction();
							return;
						}

						// 移動距離
						var delta = Math.round(splineInfo.distance);
						if(Math.abs(delta) < 1) {
							// 移動距離が1未満の場合、overflowを起動する。
							if(bezierCurveInfo.overLimit > 0) {
								delta = 1 * bezierCurveInfo.direction;
								bezierCurveInfo.overLimit--;
							}
							else {
								_self.didStopSwipeAction();
								return;
							}
						}

						// スクロールする。
						if(_self.didScrollScreen(delta, true) !== true) {
							// スクロール範囲を超えた場合はtrue以外が返却されるため、ストップする。
							_self.didStopSwipeAction();
							return;
						}

						// 次のデータ準備
						nIndex++;
						// 全て実行した場合はoverflowを起動する。
						if(nIndex >= nLoop) {
							if(bezierCurveInfo.overLimit > 0) {
								nIndex = nLoop - 1;
								bezierCurveInfo.overLimit--;
							}
							else {
								_self.didStopSwipeAction();
								return;
							}
						}
					};

					// 強制終了用のIDを補完しておく。
					_self.m_xSwipeInfo.intervalId = setInterval(funcInterval, bezierCurveInfo.timerMs);
				};

				swipeFunction();
			};

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.didPrepareSwipeAction = function(posval) {
				// #1147
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseScrollAction !== true) {
					return;
				}

				//
				// トレンドライン描画モードでは動作しない。
				//
				if(_self.m_bTrendLine === true) {
					return;
				}

				//
				//
				//
				if(!xUtils.isAvailableSmoothScroll(xEnv)) {
					return;
				}

				var checkScroll = _self.didCheckScrollAvailable();
				if(!checkScroll || checkScroll.scroll !== true) {
					return;
				}

				//
				// トレンドラインが操作されている状態は動作しない。
				//
				var isTrendlineSelected = _didCheckIfSelectedChartObjectIsTrendlineOrNot();
				if(isTrendlineSelected === true) {
					return;
				}

				// #1290
				if(_self.m_bCrosslineObject === true) {
					return;
				}
				//

				_self.m_xSwipeInfo.Event = xUtils.mobileGesture.swipeStart(posval);
				_self.m_xSwipeInfo.isSwipe = false;
			};

			//
			this.didTriggerSwipeAction = function(posval) {
				_self.m_xSwipeInfo.Event = xUtils.mobileGesture.swipeEnd(_self.m_xSwipeInfo.Event, posval);
				if(_self.m_xSwipeInfo.Event && _self.m_xSwipeInfo.Event.type) {
					var swipeEvent = xUtils.didClone(_self.m_xSwipeInfo.Event);
					_self.m_xSwipeInfo.Event = undefined;
					_self.OnSwipe(swipeEvent);

					return(true);
				}

				return(false);
			};

			/**
			 * stop swipe action
			 * @return {[type]}
			 */
	        this.didStopSwipeAction = function() {
				//
				_self.m_xSwipeInfo.isSwipe = false;
				_self.m_xSwipeInfo.Event = undefined;
				if(_self.m_xSwipeInfo.intervalId !== undefined) {
					// console.debug("[WGC] clear intervalId => " + _self.m_xSwipeInfo.intervalId);
					clearInterval(_self.m_xSwipeInfo.intervalId);
					_self.m_xSwipeInfo.intervalId = undefined;
				}

				_self.didToggleGoToEndPos(true);
	        };

			/**
			 * [description]
			 * @param  {[type]}  objectName
			 * @param  {Boolean} isSelected
			 * @return {[type]}
			 */
			this.didGetObjectInfo = function(objectName, isSelected) {
			}

			/**
			 * [description]
			 * @param  {[type]} keyValue
			 * @return {[type]}
			 */
			this.didProcessForDeleteKeyEvent = function(keyValue) {

			};

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.SetCrossLinePoint = function(posval) {
				var __rectFullChart = _self.GetFullDrawPanelRect(true);
				var __rectFullFrame = _self.GetChartFrameAreaRect(true);

				var __posXLeft 		= __rectFullChart.x;
				var __posXRight 	= __rectFullChart.x + __rectFullChart.width;
				var __posYTop 		= __rectFullChart.y;
				var __posYBottom 	= __rectFullChart.y + __rectFullChart.height;

				// __posYTop 			= __rectFullFrame.y;
				// __posYBottom 		= __rectFullFrame.y + __rectFullFrame.height;

				if (((__posXLeft < posval.XPos) && (__posXRight > posval.XPos)) && ((__posYTop < posval.YPos) && (__posYBottom > posval.YPos))) {
					_self.m_ptCrossline.x = _self.didCalcAdjustedRelativePositionFromAbsolutePosition(posval.XPos);
					_self.m_ptCrossline.y = _self.GetRelativePostionY(posval.YPos);
				}
				else {
					_self.m_ptCrossline.x = -1;
					_self.m_ptCrossline.y = -1;
				}

				var __posval = {XPos: _self.m_ptCrossline.x, YPos: _self.m_ptCrossline.y};

				for (var idx = 0; idx < _self.m_arrChartDrawFramelist.length; idx++) {
					var panel = _self.m_arrChartDrawFramelist[idx];
					if(panel !== undefined && panel != null) {
						panel.SetCrossLine(xUtils.didClone(__posval));
					}
				}
				_self.DrawingChartDrawFrame(false);

				_self.m_chartXAxisObj.SetCrossLine(xUtils.didClone(__posval));
				_self.m_chartXAxisObj.didDraw();
			};

			// #1290
			this.didCalcAdjustedRelativePositionFromAbsolutePosition = function(argAbsolutePostionX) {
				var nAdjustedLocalPos = _self.m_chartXAxisObj.SetXPosition(argAbsolutePostionX);

				return(nAdjustedLocalPos);
			};

			// #1290
			this.didGetCrosslinePoint = function() {
				return(xUtils.didClone(_self.m_ptCrossline));
			};

			this.OnDragOver = function(posval) {
				// console.debug("[WGC] :" + posval.YPos);
				// _self.SetMouseCursor('default');
			};

			/**
			 * mousewheel event handler
			 * @param[in] posval	{Delta}
			 */
			this.OnMouseWheel = function(posval) {
				if(_self.m_xSwipeInfo.isSwipe === true) {
					return(true);
				}

				_self.didZoomScreen(posval.Delta, true);
			};

			/**
			 * [description]
			 * @param  {[type]} keyValue
			 * @return {[type]}
			 */
			this.OnKeyDown = function(keyValue, combineKey) {
				var idx = 0;
				var idxObj = 0;
				var idxSpan = 0;

				//
				if(combineKey !== undefined && combineKey != null) {
					if(keyValue === xUtils.constants.keyEvent.RETURN) {
						if(xUtils.debug.modeOn === true) {
							var xObjInfo = _self.didGetObjectInfo("", true);

							if(xObjInfo && xObjInfo.indicator && xObjInfo.indicator.didPrintDebugData) {
								xObjInfo.indicator.didPrintDebugData();
							}
						}

						return;
					}

					//
					// #778
					//
					if(keyValue === xUtils.constants.keyEvent.SPACE) {
						if(xUtils.debug.modeOn === true) {
							var xObjInfo = _self.didGetObjectInfo("", true);

							if(xObjInfo.indicator) {
								var xInfo = xUtils.indicator.didConvertToShortSeriesInformation(xObjInfo.indicator.m_xSeriesInfo);

								// console.debug("[WGC] :" + xInfo);
							}
						}

						return;
					}
					//
				}

				//
				// #704
				if(keyValue === xUtils.constants.keyEvent.DELETE) {
					_self.didProcessForDeleteKeyEvent(keyValue);
				}
			};

			this.OnCanvasMouseDownPosition = function(event) {
				var iIndex = String(event.currentTarget.id).substring(8,10);
				_self.m_iCanvasMouseDownIndex = iIndex;
			};

			this.OnCanvasMouseMovePosition = function(event) {
				var iIndex = String(event.currentTarget.id).substring(8,10);
				_self.m_iCanvasMouseMoveIndex = iIndex;
			};

			this.OnCanvasMouseUpPosition = function(event) {
				_self.m_bMouseUpXArea = true;
			};

			// #2384
			this.UnsetMouseCursor = function() {
				_self.SetMouseCursor('');
				_self.SetMouseCursor('', true);
			};
			//

			this.SetMouseCursor = function(cursor, toMain) {
				var divObj =  _chartWrapper.didFindDomElementById("idChartArea");
				// #2384
				if(toMain) {
					var domElemTarget = _chartWrapper.didFindDomElementById("idCanvas0");
					if(domElemTarget) {
						divObj = domElemTarget;
					}
				}

				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.CursorConfig && cursor) {
					try {
						var temp = xEnv.System.CursorConfig[cursor];
						if(temp !== undefined && temp != null) {
							cursor = temp;
						}
					}
					catch(e) {
						console.error(e);
					}
				}
				//

				divObj.style.cursor = cursor;
			};

			/**
			 * get price data array
			 * @return array
			 */
			this.didGetPriceDatas = function() {
				var __datas = _self.m_xDoBasePrice.didGetPriceDatas();

				return(__datas);
			};

			/**
			 * get price data
			 * @return array
			 */
			this.didGetReferencedPriceObject = function() {
				return(_self.m_xDoBasePrice);
			};

			/**
			 * get price data array
			 * @return array
			 */
			this.didGetReferencedPriceDatas = function(id) {
				var __datas = _self.m_xDoBasePrice.didGetPriceDatas(id);

				return(__datas);
			};

			/**
			 * get price data array
			 * @return array
			 */
			this.didGetTimeDatas = function(id) {
				var __datas = _self.m_xDoBasePrice.didGetTimeDatas(id);

				return(__datas);
			};

			/**
			 * get price data array
			 * @return array
			 */
			this.didGetTickNos = function() {
				var __datas = _self.m_xDoBasePrice.didGetTickNos();

				return(__datas);
			};

			this.hasTimeDatas = function() {
				var __datas = _self.m_xDoBasePrice.didGetTimeDatas();
				if(__datas === undefined || __datas == null || __datas.length === undefined || __datas.length == null || __datas.length < 1) {
					return(false);
				}

				return(true);
			};

			/**
			 * get data count
			 *
			 * @return number
			 */
			this.GetDataCount = function() {
				var __nDataCount = 0;
				var __xDatas = _self.didGetPriceDatas();
				if(__xDatas !== undefined && __xDatas != null) {
					__nDataCount = __xDatas.length;
				}

				return(__nDataCount);
			};

			this.didGetFullRange = function() {
				var __nDataCount = _self.GetDataCount();

	        	var result = {
					position : 0,
					length : (__nDataCount + parseInt(_self.m_stEnv.MarginRight) + _self.m_xShiftInfo.all)
				};

				return(result);
			};

			this.didCalcReferencedPriceVolumeAtRange = function(argRange) {
				var __datas = _self.m_xDoBasePrice.didCalcVolumeAtRange(argRange);

				return(__datas);
			};

			/**
			 * get data count
			 *
			 * @return number
			 */
			this.GetBaseDataCount = function() {
				var __nDataCount = 0;
				var __xDatas = _self.didGetReferencedPriceDatas();
				if(__xDatas !== undefined && __xDatas != null) {
					__nDataCount = __xDatas.length;
				}

				return(__nDataCount);
			};

			/**
			 * get datas(array) to by count
			 *
			 * @param[in] to to
			 * @param[in] count count
			 * @return array
			 */
			this.GetBaseDatas = function(to, count) {
				var __nDataCount = 0;
				var __xDatas = _self.didGetReferencedPriceDatas();
				if(__xDatas !== undefined && __xDatas != null) {
					__nDataCount = __xDatas.length;
				}

				var __result = [];

				if(to < count - 1 || __nDataCount < count) {
					return(null);
				}

				for(var __ii = count - 1; __ii >= 0; __ii--) {
					var __stPrice = __xDatas[to - __ii];
					__result.push(__stPrice);
				}

				return(__result);
			};

			/**
			 * @param[in] argXPos x position
			 * @param[in] bAdjusted adjusted or raw
			 * @return price data
			 */
			this.GetBaseDataAtPos = function(argXPos, bAdjusted) {
				var __dataIndex = _self.didConvertHorizontalPosToDataIndex(argXPos, bAdjusted);

				var __result = _self.GetBaseDataAt(__dataIndex, false);

				return(__result);
			};

			/**
			 * get data at
			 *
			 * @param[in] at at
			 * @param[in] bScreen screen index or data index
			 * @return price data
			 */
			this.GetBaseDataAt = function(at, bScreen) {
				var __nDataCount = 0;
				var __xDatas = _self.didGetReferencedPriceDatas();
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
			 * get time data at position
			 * @param[in] argXPos 		x position
			 * @param[in] bAdjusted 	adjusted or raw
			 * @param[in] ignoreLimit	ignore limit or not
			 * @return time string(YYYYMMDDHHMMSS)
			 */
			this.didGetTimedataAtPos = function(argXPos, bAdjusted, ignoreLimit) {
				var __dataIndex = _self.didConvertHorizontalPosToDataIndex(argXPos, bAdjusted);

				var __result = _self.didGetTimedataAt(__dataIndex, false, ignoreLimit);

				return(__result);
			};

			/**
			 * get time data at index
			 *
			 * @param[in] at at
			 * @param[in] bScreen screen index or data index
			 * @param[in] ignoreLimit	ignore limit or not
			 * @return time string(YYYYMMDDHHMMSS)
			 */
			this.didGetTimeIndexByTimeString = function(argTimedata) {
				// TODO: TIMELINE
				var __nDataCount = 0;
				var __xDatas = _self.didGetTimeDatas();
				if(__xDatas !== undefined && __xDatas != null) {
					__nDataCount = __xDatas.length;
				}

				if(__nDataCount < 1) {
					return;
				}

				var __timeType = xUtils.dateTime.timeType[_self.m_xDoBasePrice.m_symbolInfo.nTType];

				// #1150
				var	__timeInterval = _self.m_xDoBasePrice.m_symbolInfo.nTGap;
				if(__timeInterval === undefined || __timeInterval == null) {
					__timeInterval = 1;
				}
				else {
					__timeInterval = Math.max(1, __timeInterval);
				}
				//

				var __xData1 = __xDatas[0];
				var __xData2 = __xDatas[__nDataCount - 1];
				var __timeData1 = xUtils.dateTime.convertStringToDate(argTimedata);

				if(__xData1 > argTimedata) {
					var __timeData2 = xUtils.dateTime.convertStringToDate(__xData1);

					// #1150
					var __diff = parseInt(xUtils.dateTime.dateDiff(__timeData1, __timeData2, __timeType) / __timeInterval);

					return((0 - __diff));
				}
				else if(__xData2 < argTimedata) {
					var __timeData2 = xUtils.dateTime.convertStringToDate(__xData2);

					// #1150
					var __diff = parseInt(xUtils.dateTime.dateDiff(__timeData1, __timeData2, __timeType) / __timeInterval);

					return((__nDataCount - 1 - __diff));
				}
				else {
					return(_self.didFindTimeIndexBy(argTimedata));
				}
			};

			/**
			 * get time data at index
			 *
			 * @param[in] at at
			 * @param[in] bScreen screen index or data index
			 * @param[in] ignoreLimit	ignore limit or not
			 * @return time string(YYYYMMDDHHMMSS:####)
			 */
			this.didGetTimedataAt = function(at, bScreen, ignoreLimit) {
				var __nDataCount = 0;
				var __xTimes = _self.didGetTimeDatas();
				var	__xTnos	 = _self.didGetTickNos();

				if(__xTimes !== undefined && __xTimes != null) {
					__nDataCount = __xTimes.length;
				}

				// data index
				var __dataIndex = (bScreen === true) ? _self.didConvertLocalIndexToDataIndex(at) : at;

				if(ignoreLimit === true) {
					if(__nDataCount < 1) {
						return(null);
					}

					var __nTType = _self.m_xDoBasePrice.m_symbolInfo.nTType;
					var __nTGap  = _self.m_xDoBasePrice.m_symbolInfo.nTGap;

					// #924
					var __result = {
						dateTime : undefined,
						tickNo : 0
					};

					if(__dataIndex < 0) {
						var __nOffset = __dataIndex;
						var __xData = __xTimes[0];
						var __dateData = xUtils.dateTime.convertStringToDate(__xData);
						var __timeType = xUtils.dateTime.timeType[__nTType];
						var __calcDate = xUtils.dateTime.addDate(__dateData, __nOffset * __nTGap, __timeType);

						__result.dateTime = xUtils.dateTime.formatDate(__calcDate, xUtils.dateTime.dateTimeFormat1);
					}
					else if(__dataIndex >= __nDataCount) {
						var __nOffset = __dataIndex - (__nDataCount - 1);
						var __xData   = __xTimes[__nDataCount - 1];
						var __dateData = xUtils.dateTime.convertStringToDate(__xData);
						var __timeType = xUtils.dateTime.timeType[__nTType];
						var __calcDate = xUtils.dateTime.addDate(__dateData, __nOffset * __nTGap, __timeType);

						__result.dateTime = xUtils.dateTime.formatDate(__calcDate, xUtils.dateTime.dateTimeFormat1);
					}
					else {
						__result.dateTime = __xTimes[__dataIndex];

						try {
							// #924
							var tno = __xTnos[__dataIndex];
							if(isNaN(tno)) {
								tno = 0;
							}
							__result.tickNo = tno;
						}
						catch(e) {

						}
					}

					return(__result);
				}

				if(__nDataCount < 1 || __dataIndex < 0 || __dataIndex >= __nDataCount) {
					return(null);
				}

				var __result = {
					dateTime : __xTimes[__dataIndex],
					tickNo : 0
				};

				try {
					// #924
					var tno = __xTnos[__dataIndex];
					if(isNaN(tno)) {
						tno = 0;
					}
					__result.tickNo = tno;
				}
				catch(e) {

				}

				return(__result);
			};

			/**
			 * find index by time data
			 * @param[in] timeData	time data
			 * @return index
			 */
			this.didFindTimeIndexBy = function(timeData) {
				var __timeIndex;
				var __nDataCount = 0;
				var __xDatas = _self.didGetTimeDatas();
				if(__xDatas !== undefined && __xDatas != null) {
					__nDataCount = __xDatas.length;
				}

				if(__nDataCount < 1) {
					return;
				}

				var minIndex = 0;
			    var maxIndex = __nDataCount - 1;
			    var searchElement = timeData;
			    var currentIndex = 0;
			    var currentElement;

				// #3211
				var offset = 0;
				for(currentIndex = 0; currentIndex < __nDataCount; currentIndex++) {
					currentElement = __xDatas[currentIndex];
					if(currentElement < searchElement) {
						continue;
					}

					if(currentElement == searchElement) {
						break;
					}

					offset = -1;

					break;
				}

				currentIndex = Math.max(0, currentIndex + offset);
				// [end] #3211

				return(currentIndex);

			    // while (minIndex <= maxIndex) {
			    //     currentIndex = (minIndex + maxIndex) / 2 || 0; // #1443
			    //     currentElement = __xDatas[currentIndex];
				//
			    //     if(currentElement < searchElement) {
			    //         minIndex = currentIndex + 1;
			    //     }
			    //     else if(currentElement > searchElement) {
			    //         maxIndex = currentIndex - 1;
			    //     }
			    //     else {
			    //         return currentIndex;
			    //     }
			    // }
				//
			    // return(currentIndex);
			};

			/**
			 * check target index is out of the data range or not.
			 *
			 * @param[in] index data index
			 * @return true or false
			 */
			this.IsOuterIndex = function(index) {
			    var iTotCount = _self.GetDataCount();

			    if(iTotCount < 1 || index < 0 || index >= iTotCount) {
			    	return(true);
			    }

			    return(false);
			};

			/**
			 * check target indexes is out of the data range or not.
			 *
			 * @param[in] indexes data index array
			 * @return true or false
			 */
			this.IsOuterIndexes = function(indexes) {
			    var iTotCount = _self.GetDataCount();

			    if(iTotCount < 1) {
			    	return(true);
			    }

			    for(var __ii in indexes) {
			        var nDataIdx = indexes[__ii];
			        if(nDataIdx < 0 || nDataIdx >= iTotCount)
			            return(true);
			    }

			    return(false);
			};

			/**
			 * @return object {panel, canvas}
			 */
			this.GetXAxisPanelElementInfo = function() {
				var xEnv = _self.didGetEnvInfo(); // #2247

				var result = {};
				var domElem = _self.m_domElems.axis;
				var domElemCanvas = null;

				domElem.style.position         = "absolute";
				domElem.style.backgroundColor  = _self.m_stEnv.BackgroundColor;
				domElem.style.left   = xUtils.constants.default.LEFTMARGINAREA + "px"; // this.YAXIS_WIDTH
				domElem.style.top    = _self.GetFullDrawPanelHeight(); + "px";
				domElem.style.width  = _self.GetDrawPanelWidth() + "px";
				domElem.style.height = xUtils.didGetXAxisHeight(xEnv) + "px"; // #2247
				domElem.style.visibility = xUtils.didGetAxisPanelVisibility(xEnv); // #2247

				// create XAxis canvas
			    domElemCanvas = document.createElement("canvas");
			    domElemCanvas.setAttributeNS(null, "id", "idCanvasX");
			    domElemCanvas.style.position = "absolute";
			    domElemCanvas.style.backgroundColor = _self.m_stEnv.BackgroundColor;
				// #1272
				domElemCanvas.style.left = "0px";
				//
			    domElemCanvas.onmouseup = _self.OnCanvasMouseUpPosition;
			    domElem.appendChild(domElemCanvas);

				_self.m_domElems.axisCanvas = domElemCanvas;

				//
				var __domElemCrosslineX = document.createElement("div");
				domElem.appendChild(__domElemCrosslineX);

				_self.m_domElems.axisLabel = __domElemCrosslineX;

				result.panel  = domElem;
				result.canvas = domElemCanvas;
				result.label  = __domElemCrosslineX;

				return(result);
			};

			/**
			 *
			 */
			this.GetRelativePostionX = function(argAbsolutePostionX, noExtra) {
				var nRelativePositionX = argAbsolutePostionX - _self.GetLeftPosOfTheLayout(noExtra);
				return(nRelativePositionX);
			};

			/**
			 *
			 */
			this.GetRelativePostionY = function(argAbsolutePostionY) {
				var nRelativePositionY = argAbsolutePostionY - (xUtils.constants.default.TOP_HEIGHT);
				return(nRelativePositionY);
			};

			/**
			 *
			 */
			this.GetPosXMargined = function(argVal, noExtra) {
				return(_self.GetRelativePostionX(argVal, noExtra));
			};

			/**
			 *
			 */
			this.GetPosYMargined = function(argVal) {
				return(_self.GetRelativePostionY(argVal));
			};

			/**
			 * @return y-axis area width
			 */
			this.GetYAxisAreaWidth = function() {
				var __width = _self.m_stEnv.System.YAxisLeft + _self.m_stEnv.System.YAxisRight;

				return(__width);
			};

			/**
			 * get chart area width
			 * @return chart area width
			 */
			this.GetDrawPanelWidth = function() {
				return(_chartWrapper.m_iChartWrapWidth - _self.GetNonChartAreaWidth());
			};

			/**
			 * get chart area width
			 * @return chart area width
			 */
			this.GetHorizontalRangeOfAllPanelsInFullArea = function() {
				var __result = {
					left : {
						pos : 0,
						width : 0
					},
					center : {
						pos : 0,
						width : 0
					},
					right : {
						pos : 0,
						width : 0
					}
				};

				__result.left.pos = 0;
				__result.left.width = _self.m_stEnv.System.YAxisLeft;
				__result.center.pos = __result.left.pos + __result.left.width;
				__result.center.width = _self.GetChartFrameAreaWidth();
				__result.right.pos = __result.center.pos + __result.center.width;
				__result.right.width = _self.m_stEnv.System.YAxisRight;

				return(__result);
			};

			/**
			 * get chart area width
			 * @return chart area width
			 */
			this.GetFullDrawPanelHeight = function() {
				var xEnv = _self.didGetEnvInfo(); // #2247
				return(_chartWrapper.m_iChartWrapHeight - (xUtils.constants.default.TOP_HEIGHT + xUtils.didGetXAxisHeight(xEnv) + xUtils.constants.default.BOTTOMMARGINAREA)); // #2247
			};

			/**
			 * get full chart area(except axis area and margin)
			 * @return {x, y, width, height}
			 */
			/**
			 * get full chart area(except axis area and margin)
			 * @param  {[type]} exceptOnlyXAxis	except only x-axis area
			 * @return {x, y, width, height}
			 */
			this.GetFullDrawPanelRect = function(exceptOnlyXAxis) {
				var __rect = {
					x : _self.m_stEnv.System.YAxisLeft,
					y : xUtils.constants.default.TOP_HEIGHT,
					width  : exceptOnlyXAxis === true ? _self.GetDrawPanelWidth() : _self.GetChartFrameAreaWidth(),
					height : _self.GetFullDrawPanelHeight()
				};

				return(__rect);
			};

			/**
			 * get chart area width
			 * @return non-chart area width
			 */
			this.GetNonChartAreaWidth = function() {
				var __width = xUtils.constants.default.RIGHTMARGINAREA + xUtils.constants.default.LEFTMARGINAREA + _self.GetExtraPanelWidth();

				return(__width);
			};

			this.GetLeftPosOfTheLayout = function(noExtra) {
				var xEnv = _self.didGetEnvInfo();
				var nLeftLayoutPos = xUtils.constants.default.LEFTMARGINAREA + xEnv.System.YAxisLeft;
				if(noExtra !== true) {
					nLeftLayoutPos += _self.GetExtraPanelWidth();
				}

				return(nLeftLayoutPos);
			};

			this.GetExtraPanelWidth = function() {
				var xEnv = _self.didGetEnvInfo();
				var __nExtraWidth = xEnv.ExtraPanelWidth || 0;

				return(__nExtraWidth);
			};

			/**
			 * @return chart area width
			 */
			this.GetChartFrameAreaWidth = function() {
				var __width = _chartWrapper.m_iChartWrapWidth - (_self.GetNonChartAreaWidth() + _self.GetYAxisAreaWidth());
				return(__width);
			};

			/**
			 * get full chart area(except axis area and margin)
			 * @return {x, y, width, height}
			 */
			this.GetChartFrameAreaRect = function(entire) {
				var xEnv = _self.didGetEnvInfo(); // #2247
				var __rect = {
					x : 0,
					y : 0,
					width  : _self.GetChartFrameAreaWidth(),
					height : _self.GetFullDrawPanelHeight()
				};

				if(entire === true) {
					__rect.height = (_chartWrapper.m_iChartWrapHeight + xUtils.didGetXAxisHeight(xEnv)); // #2247
				}

				return(__rect);
			};

			/**
			 * get chart frame area information
			 *
			 * @return object
			 */
			this.GetChartFrameAreaInfo = function() {
				var __result = {
					leftAxis  : _self.m_stEnv.System.YAxisLeft,
					rightAxis : _self.m_stEnv.System.YAxisRight,
					chart : {
						left : _self.m_stEnv.System.YAxisLeft,
						width : _self.GetChartFrameAreaWidth()
					}
				};

				return(__result);
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
			 * @param[in] argNo panel number
			 * @return panel or null
			 */
			this.GetDrawPanelAt = function(argNo) {
				var __nFrameCount = _self.m_arrChartDrawFramelist.length;
				if(__nFrameCount < 1 || argNo < 0 || argNo >= __nFrameCount) {
					return(null);
				}

				return(_self.m_arrChartDrawFramelist[argNo]);
			};

			/**
			 * 該当位置がパネル内にあるかをチェックする。
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.didCheckPosvalInPanel = function(posval) {
				if(posval === undefined || posval == null) {
					return(false);
				}

				// 描画領域情報を取得する。
				var rectPanel = _self.GetFullDrawPanelRect();

				// 検査する。
				if(xUtils.shapes.posvalInRect(posval, rectPanel) === true) {
					return(true);
				}

				//
				return(false);
			};

	        /**
	         *
	         */
	        this.didClearFactors = function(nextCount) {
				var xEnv = _self.didGetEnvInfo();

	        	_self.m_xScrollInfo.pos = 0;
	        	_self.m_xScrollInfo.range.location = 0;
	        	_self.m_xScrollInfo.range.length = 0;
				if((nextCount === undefined || nextCount == null) && xEnv.System.ResetScaleFactor === true) { // #2057
					_self.m_xScrollInfo.screenSize = xEnv.System.Scroll.zoom;

					// #1653, #2057
					_self.m_xScrollInfo.barSize = xEnv.System.Scroll.barSize;
					_self.m_xScrollInfo.barGap  = xEnv.System.Scroll.barGap;
					//

					// #2038
					_self.m_xScrollInfo.levelList = xEnv.System.Scroll.LevelList;
					_self.m_xScrollInfo.level     = xEnv.System.Scroll.Level ? xEnv.System.Scroll.Level : 0;
					//
				}

	        	_self.m_xShiftInfo.all = 0;
	        	_self.m_xShiftInfo.left = 0;
	        	_self.m_xShiftInfo.right = 0;

	        	//
	        	_self.m_iSpanMax = 0;
	    		_self.m_iStartX = 0;
	    		_self.m_iEndX = 0;
	    		_self.m_iXPosIndex = 0;
	    		_self.m_bMouseDown = false;
	    		_self.m_bMouseRowResize = false;
	    		_self.m_bMouseUpXArea = false;
	    		_self.m_iXPosMouseDown = 0;

				// #1149
	    		_self.m_bMouseDownSelectedChartObj = false;
				//
				_self.m_nSelectedChartObjectIndex = -1;
				//

	    		_self.m_SelectFrame = null;
	    		_self.m_iRowPos = null;
	    		_self.m_iCanvasMouseDownIndex = 0;
	    		_self.m_iCanvasMouseMoveIndex = 0;
	        };

	        /**
	         *
	         */
	        this.didClearIndicatorDatas = function() {
	        	var __nFrameCount = _self.m_arrChartDrawFramelist.length;
	        	for (var __ii = 0; __ii < __nFrameCount; __ii++) {
	        		(function(argObj){
						if(argObj !== undefined && argObj != null) {
							argObj.didClearIndicatorDatas();
						}
					})(_self.m_arrChartDrawFramelist[__ii]);
				}
	        };

	        /**
	         * clear data
	         *
	         * just clear datas
	         */
	        this.didClearDatas = function() {
	        	// 1. clear request information
	        	// 2. clear base price data
	        	// 3. clear extra price data
	    		_self.m_xDoBasePrice.didClearDatas();

				//
				_self.didClearIndicatorDatas();

				//
				// #1002
				//

				//
				_ctrlLayout.RecalcProc(xUtils.constants.ngcl.enum.EUS_UPDATE_IQ);

				//
				_self.didRecalcFactor();

				//
				_self.DrawingChartDrawFrame(false);
	        };

	        /**
	         * if return value is true, you need to refresh screen
	         * @param[in] bFlag	true or false
	         * @return true or false
	         */
	        this.didRemoveAllLineTools = function(bFlag) {
	        	if(bFlag === false) {
	        		return;
	        	}

	        	var __nFrameCount = _self.m_arrChartDrawFramelist.length;
	        	for (var __ii = 0; __ii < __nFrameCount; __ii++) {
	        		(function(argObj){
						if(argObj !== undefined && argObj != null) {
							argObj.didRemoveAllLineTools();
						}
					})(_self.m_arrChartDrawFramelist[__ii]);
				}

	        	return;
	        };

			// #1878
			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedAlertExecutionData = function(isAlertOrExecution, receivedDatas) {
				if(_self.m_xDoBasePrice.willBeReceivedAlertExecutionData !== undefined && _self.m_xDoBasePrice.willBeReceivedAlertExecutionData != null) {
					return(_self.m_xDoBasePrice.willBeReceivedAlertExecutionData(isAlertOrExecution, receivedDatas));
				}
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveAlertExecutionData = function(isAlertOrExecution, receivedDatas) {
				if(_self.m_xDoBasePrice.didReceiveAlertExecutionData !== undefined && _self.m_xDoBasePrice.didReceiveAlertExecutionData != null) {
					return(_self.m_xDoBasePrice.didReceiveAlertExecutionData(isAlertOrExecution, receivedDatas));
				}
			};
			// [end] #1878

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedOrderPositData = function(isOrderOrPosit, receivedDatas) {
				if(_self.m_xDoBasePrice.willBeReceivedOrderPositData !== undefined && _self.m_xDoBasePrice.willBeReceivedOrderPositData != null) {
					return(_self.m_xDoBasePrice.willBeReceivedOrderPositData(isOrderOrPosit, receivedDatas));
				}
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveOrderPositData = function(isOrderOrPosit, receivedDatas) {
				if(_self.m_xDoBasePrice.didReceiveOrderPositData !== undefined && _self.m_xDoBasePrice.didReceiveOrderPositData != null) {
					return(_self.m_xDoBasePrice.didReceiveOrderPositData(isOrderOrPosit, receivedDatas));
				}
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
				// #1181
				if(_self.m_xDoBasePrice.willBeReceivedData(symbolInfo, receivedDatas, multiTargetId) !== true) {
					return;
				}

				// step 1 ~ 4
				(function(){
					// 1. clear request information
		        	// 2. clear base price data
		        	// 3. clear extra price data
		    		_self.m_xDoBasePrice.didClearDatas();

					// 4. clear indicator data
		    		(function(){
		    			// TODO: clear indicator data
		    			_self.didClearIndicatorDatas();
		    		});
					//_self.didClearIndicatorDatas();
				})();
				//_self.didClearDatas();

				// #1572
				if(nextCount === undefined || nextCount == null) {
					// prepare to receive for base price
					// remove all line studies if code is changed
					//
					_self.didRemoveAllLineTools();

					// prepare to receive for base price
					// remove all order and position
					_self.didClearOrderPositObjects(true, true);

					// #1575
					_self.didClearAllSubRequestedObjects(false, false, true, true);
				}

				// clear drawing factors
				_self.didClearFactors(nextCount);
				//_self.didClearFactors();
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
				(function(){
					_self.m_xDoBasePrice.didReceiveData(symbolInfo, receivedDatas, multiTargetId);
				})();

				// all indicators
				// non-times
				_self.didCalculateAllData();

				// #3627
				// シフト情報を更新する。
				_self.didGetShiftInfo(true);
				// [end] #3627

				// #933
				// when receiving inquiry data, move to scroll to end.
				var xEnv = _self.didGetEnvInfo();
				xEnv.GoToEndPos = true;

				//
				// TODO: #643
				// スクロールが終わったら、再計算
				//
				_ctrlLayout.RecalcProc(xUtils.constants.ngcl.enum.EUS_UPDATE_IQ);
				//

				//
				_self.didRecalcFactor();

				if(nextCount) {
					_didScrollTo(nextCount, false);
				}
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedRealData = function(receivedData, multiTargetId) {

			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveRealData = function(receivedData, multiTargetId) {
				(function(){
					//
					_self.m_xDoBasePrice.didReceiveRealData(receivedData, multiTargetId);
				})();

				// all indicators
				// non-times
				_self.didCalculateAllData(true);

				// スクロールサイズを更新する。
				// この計算はRecalcProcの中で行われる。
				// _self.didCalcScrollInfo();

				//
				// TODO: #643
				// スクロールが終わったら、再計算
				//
				_ctrlLayout.RecalcProc(xUtils.constants.ngcl.enum.EUS_UPDATE_RT);
				//

				//
				_self.didRecalcFactor();
			};

			this.didRecalcProcess = function(argStatus) {

			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didRecalcFactor = function() {
				//
				// RecalcAxis
				//

				// 1. calculate min, max
				_self.didCalcMinMax(false);

				// 2. calculate axis information(ratio)
				_self.didCalcRatioFactor();
			};

			/**
			 *
			 */
			this.didCalcRatioFactor = function() {
				var __nFrameCount = _self.m_arrChartDrawFramelist.length;
	        	for (var __ii = 0; __ii < __nFrameCount; __ii++) {
	        		(function(argObj){
						if(argObj !== undefined && argObj != null && argObj.didCalcRatioFactor !== undefined) {
							argObj.didCalcRatioFactor();
						}
					})(_self.m_arrChartDrawFramelist[__ii]);
				}
			};

			/**
			 * calculate min and max
	         * @param[in] argFlag	full flag
	         */
	        this.didCalcMinMax = function(argFlag) {
	        	var __nFrameCount = _self.m_arrChartDrawFramelist.length;
	        	for (var __ii = 0; __ii < __nFrameCount; __ii++) {
	        		(function(argObj){
						if(argObj !== undefined && argObj != null && argObj.didCalcMinMax !== undefined) {
							argObj.didCalcMinMax(argFlag);
						}
					})(_self.m_arrChartDrawFramelist[__ii]);
				}
	        };

			/**
			 *
			 */
			this.didReceiveDataExt = function() {
				_self.m_xDoBasePrice.didReceiveDataExt();
			};

			/**
			 *
			 */
			this.didReceiveDataForNontime = function(argLayout) {
			};

			/**
			 *
			 */
			this.SetThreeBreakLine = function(iIndex, stPrice) {
				_self.m_xDoBasePrice.SetThreeBreakLine(iIndex, stPrice);
			};

			/**
			 *
			 */
			this.SetPointFigure = function(iIndex, stPrice) {
				_self.m_xDoBasePrice.SetPointFigure(iIndex, stPrice);
			};

			/**
			 * @param[in] strTime
			 */
			this.didGetIndexOfTime = function(strTime, tickNo, bAdjust, ignoreLimit) {
				var __dataIndex = _self.m_xDoBasePrice.didGetDataIndexOfTime(strTime, tickNo);

				var __index = undefined;

				if(__dataIndex === undefined || __dataIndex == null || __dataIndex < 0) {
					if(ignoreLimit === true) {
						__dataIndex = _self.didGetTimeIndexByTimeString(strTime);
					}
				}

				if(__dataIndex !== undefined) {
					if(bAdjust) {
						__index = _self.didConvertDataIndexToLocalIndex(__dataIndex);// - _self.m_iStartX;
					}
					else {
						__index = __dataIndex;
					}
				}

				return(__index);
			};

			/**
			 * pop object is selected
			 *
			 * @param[in] panel target panel
			 * @return object
			 */
			this.didPopSelectedChartObjInPanel = function(panel) {
				if(panel === undefined || panel == null || panel.m_arrChartObjlist === undefined) {
					return(null);
				}

				var __nObjectCount = panel.m_arrChartObjlist.length;
				var __selectedObj = null;
				for (var __ii = __nObjectCount - 1; __ii >= 0; __ii--) {
					var __tempObj = panel.m_arrChartObjlist[__ii];
					if(__tempObj === undefined || __tempObj == null) {
						continue;
					}

					if(__tempObj.m_bSelect === true) {
						__selectedObj = __tempObj;
						panel.m_arrChartObjlist.splice(__ii, 1);

						break;
					}
				}

				return(__selectedObj);
			};

			//
			// handler
			//

			/**
			 * ondoubleclick handler
			 * #2061
			 */
			this.OnDoubleClick = function(posval, argEvent, isAxisArea) {
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseDoubleClick !== true) {
					return;
				}

				_self.m_bOverTriggerForRequestingPast = false;

				_self.didStopSwipeAction();

				_self.m_bCrosslineObject = false;

				_self.m_bMouseUpXArea = false;
				_self.m_iXPosMouseDown = posval.XPos;
				_self.m_bMouseDownSelectedChartObj = false;
				_self.m_nSelectedChartObjectIndex = -1;
				//

				//
				if(_self.m_bTrendLine || isAxisArea) {
					return;
				}

				if((_self.didCheckPosvalInPanel(posval) === true)) {
					// 全てのオブジェクトを非選択ステータスへ変更する。
					_self.didDeselectAllFrameObjects();

					// #1290
					_self.m_bCrosslineObject = _self.isHitCrosslineBox(posval);
					if(_self.m_bCrosslineObject !== true) {
						// マウスが位置した描画パネルを取得する。
						var localDrawFrame = _self.m_arrChartDrawFramelist[_self.m_iCanvasMouseDownIndex];

						// 情報があれば何が選択されたか検査する。
						if(localDrawFrame !== undefined && localDrawFrame != null) {
							//
							_self.m_nSelectedChartObjectIndex = localDrawFrame.OnSelectChartObj(posval);

							//
							// TODO: notify
							if(localDrawFrame.m_selectTrendlineObj) {
								setTimeout(function() {
									try {
										_ctrlLayout.didNotifyForDoubleClick(localDrawFrame.m_selectTrendlineObj.didGetSimpleAttribute());
									}
									catch(e) {
										console.debug(e);
									}
								},
								50);
							}
						}
					}

					// 再描画する。
					_self.DrawingChartDrawFrame(false);
				}
			};

			/**
			 *
			 */
			this.OnDestroy = function() {
				// destroy all panels
				var iFrameCount = _self.m_arrChartDrawFramelist.length;
				for (var idx = 0; idx < iFrameCount; idx++) {
					_self.m_arrChartDrawFramelist[idx].OnDestroy();
				}

				_self.m_arrChartDrawFramelist = [];

				// destroy axis x panel
				_self.m_chartXAxisObj.OnDestroy();
				delete _self.m_chartXAxisObj;
				_self.m_chartXAxisObj = null;

				// self destroy
				_self.didRemoveLinkElements();

				//
				_self.didDestroy();

				//
				_self.didDestroyExtra();
			};

			this.didDestroy = function() {
				if(_self.m_xAxisX !== undefined && _self.m_xAxisX != null) {
					delete _self.m_xAxisX;
					_self.m_xAxisX = null;
				}
			};

			this.didDestroyExtra = function() {

			};

			//
			// TODO: under code is TODO list
			//

			/**
			 * change chart setting
			 *
			 * @param[in] stEnv environment
			 */
			this.OnSettingEnv = function(stEnv) {
				return;
			};

			/**
			 * get base price panel
			 * @return panel or undefined
			 */
			this.didGetBasePriceFrame = function() {
				var __nFrameCount = _self.m_arrChartDrawFramelist.length;
				for (var __ii = 0; __ii < __nFrameCount; __ii++) {
					var __xPanel = _self.m_arrChartDrawFramelist[__ii];
					if(__xPanel.hasPriceBar() === true) {
						return(__xPanel);
					}
				}

				return;
			};

			/**
			 * @param[in] mctx		context
			 * @param[in] posval	{XPos, YPos}
			 * @return true or false
			 */
			this.didHitTest = function(mctx, posval) {
				var posvalAdjusted = {
					XPos : _self.GetPosXMargined(posval.XPos),
					YPos : _self.GetPosYMargined(posval.YPos)
				};

				// #1927
				// if(posval.__onmove__ === true) {
				// 	posvalAdjusted.__onmove__ = posval.__onmove__;
				// }

				return(xUtils.hitTest.didHitTest(mctx, posvalAdjusted));
			};

			/**
			 *
			 */
			this.didGetXGridDatas = function() {
				var __result = {

				};

				var __nDataCount = _self.GetDataCount();

				for (var __ii = 0; __ii <= 3; __ii++) {
					var iIndex;

					var iTotCount = _self.GetDataCount();

					if(_self.m_iEndX > (iTotCount - 1 - _self.m_iSpanMax - _self.m_stEnv.MarginRight))
						iIndex = parseInt(((_self.m_iEndX - _self.m_iStartX - _self.m_iSpanMax - _self.m_stEnv.MarginRight + (iTotCount - 1 - _self.m_iEndX)) * __ii) / 3);
					else
						iIndex = parseInt(((_self.m_iEndX - _self.m_iStartX) * __ii) / 3);

					var iXPos = _self.GetXPos(iIndex);
					var iYPos = -1;

					var stPrice = _self.GetBaseDataAt(_self.m_iStartX + iIndex, false);

					if(parseInt(stPrice.close) == 0)
						break;

					_self.DrawLine({context:_self.m_context, startX:iXPos, startY:1, endX:iXPos, endY:_self.m_canvas.height - 1, lineWidth:1, lineColor:'#F0F0F0'});

				}

				return(__result);
			};

			/**
			 * change indicator setting
			 *
			 * @param[in] stIndeEnv
			 */
			this.OnIndiSettingEnv = function(stIndiEnv) {
				// TODO: change for indicator target
				return;
			};

			/**
			 * [didMoveDoToNewPanel description]
			 * @param  {[type]} argFromPanel [description]
			 * @return {[type]}              [description]
			 */
			this.didMoveDoToNewPanel = function(argFromPanel) {
				var fromPanel = argFromPanel;
				//
				// check event panel
				//
				if(fromPanel !== undefined && fromPanel != null) {

					// find target object
					var popObject = _self.didPopSelectedChartObjInPanel(fromPanel);

					// check target object
					if(popObject !== undefined && popObject != null) {

						_self.m_bMouseUpXArea = false;

						var nFrameCount = _self.m_arrChartDrawFramelist.length;
						if(nFrameCount < 0) {
							nFrameCount = 0;
						}

						// #468
						var newPanel = _self.didAppendDrawPanel(nFrameCount, true);

						if(popObject != null) {
							newPanel.m_arrChartObjlist.push(popObject);
							popObject.ReSetFrame(newPanel);

							if(popObject.m_bMainChart) {
								fromPanel.SetMainFrame(false);
								newPanel.SetMainFrame(true);
							}
						}

						// resize
						_self.ResizeChart(false);
					}
				}
			};

			this.didMoveSelectedDoToTargetPanel = function(argFromPanelNo, argTargetPanelNo) {
				var nFromPanelNo = _self.m_iCanvasMouseDownIndex;
				var nTargerPanelNo = _self.m_iCanvasMouseMoveIndex;
				var iSelectIndex = -1;
				var SelectObj = null;
				var iObjCount = _self.m_arrChartDrawFramelist[nFromPanelNo].m_arrChartObjlist.length;
				for (var idx = iObjCount-1; idx >= 0; idx--) {
					if(_self.m_arrChartDrawFramelist[nFromPanelNo].m_arrChartObjlist[idx].m_bSelect)
					{
						iSelectIndex = idx;
						SelectObj = _self.m_arrChartDrawFramelist[nFromPanelNo].m_arrChartObjlist[idx];
						break;
					}
				}

				if(iSelectIndex > -1) {
					// console.debug("[WGC] :" + _self.m_arrChartDrawFramelist[_self.m_iCanvasMouseDownIndex].m_arrChartObjlist.length);
					_self.m_arrChartDrawFramelist[nFromPanelNo].m_arrChartObjlist.splice(iSelectIndex, 1);
					_self.m_arrChartDrawFramelist[nTargerPanelNo].m_arrChartObjlist.push(SelectObj);
					SelectObj.ReSetFrame(_self.m_arrChartDrawFramelist[nTargerPanelNo]);

					if(SelectObj.m_bMainChart) {
						_self.m_arrChartDrawFramelist[nFromPanelNo].didSetMainFrame(false);
						_self.m_arrChartDrawFramelist[_self.m_arrChartDrawFramelist.length-1].didSetMainFrame(true);
					}
				}

				//
				//
				//
				_self.ResizeChart(false);
			};

			this.didGetEnvInfo = function() {
				return(_self.m_stEnv);
			};

			this.GetDataSize = function() {
				return(0);
			};

			//
			// NOTE:
			//

			/**
			    Set ( Change ) Axis Style
			    @param[in]     nStyle		style
			    @return        int
			*/
			this.SetAxisStyle = function(nStyle, nullCreate) {
				if(nullCreate === true) {
					if( _self.m_xAxisX === undefined || _self.m_xAxisX == null ) {
						_self.m_xAxisX = axisUnitFactory.SF_CreateAxisX( nStyle ) ;
						_self.m_nAxisX = nStyle ;
					}

					return(xUtils.constants.ngc.define.NGC_SUCCESS);
				}

				if( _self.m_nAxisX != nStyle ) {
					if( _self.m_xAxisX !== undefined && _self.m_xAxisX != null ) {
						delete _self.m_xAxisX ;
						_self.m_xAxisX = null;
					}

					_self.m_xAxisX = axisUnitFactory.SF_CreateAxisX( nStyle ) ;
					_self.m_nAxisX = nStyle ;

					return(xUtils.constants.ngc.define.NGC_SUCCESS);
				}
				else {
					if( _self.m_xAxisX === undefined || _self.m_xAxisX == null ) {

						_self.m_xAxisX = axisUnitFactory.SF_CreateAxisX( nStyle ) ;

						return(xUtils.constants.ngc.define.NGC_SUCCESS);
					}
				}

				return(xUtils.constants.ngc.define.NGC_SUCCESS);
			}

			/**
			    Get Axis Style
			    @return        int
			*/
			this.GetAxisStyle = function() {
				return( _self.m_nAxisX );
			}


			/**
			    Check for Draw
			    @return        BOOL
			*/
			this.CheckForDraw = function() {
				/*
			    //=========================================================================
			    // 1. AREA CHECK ( SIZE < 0 RETURN )
			    //=========================================================================
				if( m_pCfg->m_rcWnd.Width ( ) < 1 && m_pCfg->m_rcWnd.Height ( ) < 1 )
					return( false ) ;
				//=========================================================================
			    // 2. DATA SIZE CHECK ( SIZE < 0 )
			    //=========================================================================
				if( m_nDataSize < 0 )
				{
					m_nDataSize	= 0 ;
				}
				*/

			    //=========================================================================
			    // SUCCESS
			    //=========================================================================
				return(true);
			}


			this.CheckMulti1Panel = function(rc) {
				return(rc);
				/*
				if( m_pCfg->m_bM1POverlay )
						return rc ;

					CRect	rcRet	= rc ;
					int		nPSCnt	= __GETSIZE_INT ( m_arrPPanelS ) ;
					CCLPanel	* pPanel	= NULL ;
					double	dDiv	= 0 ;
					for ( int i = 0 ; i < nPSCnt ; i++ )
					{
						pPanel	= m_arrPPanelS [ i ] ;
						dDiv	= pPanel->CheckDivide ( ) ;
						if( dDiv > 0 )
						{
							rcRet.right	= rc.left + long ( rc.Width ( ) * dDiv ) ;
							break ;
						}
					}

					return rcRet ;
				 */
			};

			/**
			    Calculate for Drawing Information
			    @param[in,out] nStart		start position ( index )
				@param[in,out] nSize		screen data size
				@param[in]     nState		state
			*/
			this.CalcForDraw = function(nStart, nSize, nState) {

				return({screenStartIndex:nStart, screenSize:nSize});
			};


			//
			// NOTE: Scroll
			//

			this.CalcScrDInfo = function(nStart, nSize, nState) {
				var result = {screenStartIndex:nStart, screenSize:nSize};

				// #933
				var bEndPos = false;
				if(nState === xUtils.constants.ngcl.enum.EUS_UPDATE_IQ) {
					bEndPos = true;
				}

				// #933
				_self.didCalcScrollInfo(null, bEndPos);

				// nStart
				result.screenStartIndex = _self.m_xScrollInfo.pos;
				// m_nScrDSize
				result.screenSize       = _self.m_xScrollInfo.screenSize;

				return(result);
			}

			/**
	         * calculate scroll information
	         * @param[in] shiftInfo	shift
	         * @param[in] bEndPos	scroll to end position
	         */
	        this.didCalcScrollInfo = function(shiftInfo, bEndPos) {
	        	if(shiftInfo !== undefined && shiftInfo != null) {
	        		_self.m_xShiftInfo.all = shiftInfo.all;
	        		_self.m_xShiftInfo.left = shiftInfo.left;
	        		_self.m_xShiftInfo.right = shiftInfo.right;
	        	}

	        	_self.m_iSpanMax = _self.m_xShiftInfo.left + _self.m_xShiftInfo.right;

	        	var xFullRange = _self.didGetFullRange();

	        	_self.m_xScrollInfo.range.length = xFullRange.length;
	        	//
	        	if(_self.m_xScrollInfo.range.length < _self.m_xScrollInfo.screenSize) {
	        		_self.m_xScrollInfo.range.length = _self.m_xScrollInfo.screenSize;
					// #985
					if(_self.m_bOverTriggerForRequestingPast !== true) {
						_self.m_xScrollInfo.pos = 0;
					}
	        	}
	        	else {
	        		if(bEndPos === true) {
						_self.m_xScrollInfo.pos = _self.didGetScrollEndPos();
	        		}
					else if(_self.m_stEnv.GoToEndPos === true) {
	        			_self.m_xScrollInfo.pos = _self.didGetScrollEndPos();
					}
	        	}

				// #1441
				_self.SetSBRange();
				// [end] #1441
	        };

			// #1441
			this.GetSBHandle = function() {
				return(_ctrlLayout.didGetSBHandle());
			};

			this.SetSBRange = function() {
				var zsbHandle = _self.GetSBHandle();
				if(zsbHandle) {
					zsbHandle.SetZSBRange(_self.m_xScrollInfo.screenSize, _self.m_xScrollInfo.range.length, true);
					zsbHandle.SetZSBPos(_self.m_xScrollInfo.pos, true);
				}
			};

			this.DidScrollToPos = function(argPos, nShows) {
				if(nShows) {
					_didZoomTo(nShows, true);
				}
				_didScrollTo(argPos, true);
			};

			this.WillBeDrawnBackground = function(pstDp) {

			};

			// [end] #1441

			this.GetSBDiff = function() {
				return(parseInt(_self.m_stEnv.MarginRight));
			};

			this.ExGetZoomInfo = function() {
				return(_self.m_xScrollInfo.screenSize);
			};

			/**
	         * convert local index to data index
			 * @param[in] argLocalIdx	local index
			 * @return index
			 */
			this.didConvertLocalIndexToDataIndex = function(argLocalIdx, ignoreScrollPos) {
				var __nScrSIdx = /*_self.m_iStartX;//*/_self.m_xScrollInfo.pos;
				if(ignoreScrollPos) {
					__nScrSIdx = 0;
				}
				var __nDataIdx = (__nScrSIdx + argLocalIdx) - (_self.m_xShiftInfo.left);

				return(__nDataIdx);
			};

			/**
	         * convert local index to data index
			 * @param[in] argLocalIdx	local index
			 * @return index
			 */
			this.didConvertDataIndexToLocalIndex = function(argDataIdx) {
				var __nScrSIdx = /*_self.m_iStartX;//*/_self.m_xScrollInfo.pos;
				var __nLocalIdx = (_self.m_xShiftInfo.left + argDataIdx) - __nScrSIdx;

				return(__nLocalIdx);
			};

			//
			// NOTE: X Axis
			//

			this.didGetAxisX = function() {
				return(_self);
			};

	        /**
			 * pixel offset -> index offset
			 * @param[in] argPixel pixel
			 * @return offset
			 */
			this.didConvertPixelToOffset = function(argPixel) {
				var __ratio = _self.didGetRatioHorizontal(true);
				var __offset = parseInt(argPixel * __ratio);
				return(__offset);
			};

	        /**
	         *
	         */
	        this.GetXIndexGap = function(iXPos) {
	            var __ratio = _self.didGetRatioHorizontal(true);
	            var iIndexGap = parseInt(iXPos * __ratio);
	            // alert(iIndexGap);
	            return iIndexGap;
	        };

			/**
			 *
			 */
			this.GetXIndex = function(iXPos) {
				return(_self.didConvertHorizontalPosToDataIndex(iXPos, true));
			};

	        /**
	         * convert position to data index
			 * @param[in] argPosX	position x
			 * @param[in] bRelative	relative or not
			 * @return index
			 */
			this.didConvertHorizontalPosToDataIndex = function(argPosX, bRelative) {
				var __posX = (bRelative === true) ? argPosX : _self.GetRelativePostionX(argPosX);

				var __nLocalIndex = _self.didConvertPixelToOffset(__posX);
				var __nDataIndex = _self.didConvertLocalIndexToDataIndex(__nLocalIndex);//_self.m_iStartX + __nOffset;

				return(__nDataIndex);
			};

			/**
			 * get local position x from screen start index
			 * @param[in] argLocalIdx	local index
			 * @return local position
			 */
	        this.GetXPos = function(argLocalIdx) {
	        	var __ratio = _self.didGetRatioHorizontal(false);
	        	var __nGridWidth = /*parseInt*/(__ratio);

	            var iXPos = Math.round/*parseInt*/(argLocalIdx * __ratio);// + 1;

	            iXPos = Math.round/*parseInt*/(iXPos + (__nGridWidth / 2));

	            return iXPos;
	        };

			/**
	         * スクリーンインデックスをピクセル位置へ変換する。
	         * use screen index
	         * @param[in] nScrIdx	screen index
	         * @return position
	         */
	        this.didConvertHorizontalLocalIndexToPos = function(nScrIdx) {
				return(_self.GetXPos(nScrIdx));
	        };

	        /**
			 * get local position x from data index
			 *
			 * @param[in] dataIndex data index
			 * @return local position
			 */
	        this.GetXPosAtDataIndex = function(dataIndex) {
	        	var __ratio = _self.didGetRatioHorizontal(false);
	        	var __nGridWidth = /*parseInt*/(__ratio);
	        	var __localIndex = _self.didConvertDataIndexToLocalIndex(dataIndex);

	            var __nLocalPositionX = Math.round/*parseInt*/(__localIndex * __ratio);// + 1;

	            __nLocalPositionX = Math.round/*parseInt*/(__nLocalPositionX + (__nGridWidth / 2));

	            return(__nLocalPositionX);
	        };

			/**
			 * get local position x from data index
			 *
			 * @param[in] dataIndex data index
			 * @return local position
			 */
	        this.GetIndex2Pixel = function(dataIndex, extraOuput) {
				var __ratio = _self.didGetRatioHorizontal(false);
	        	var __nGridWidth = /*parseInt*/(__ratio);
	        	var __localIndex = _self.didConvertDataIndexToLocalIndex(dataIndex);

	            var __nLocalPositionX = Math.round/*parseInt*/(__localIndex * __ratio);// + 1;

	            __nLocalPositionX = Math.round/*parseInt*/(__nLocalPositionX + (__nGridWidth / 2));

				if(typeof extraOuput === "object") {
					var xBarInfo = _self.didGetAdjustedBarInfo(__nLocalPositionX);

					extraOuput.barRange = xBarInfo;
					extraOuput.barInfo  = {
						center : __nLocalPositionX,
						left   : __nLocalPositionX - ((parseInt(xBarInfo.width / 2) + 1)),
						right  : __nLocalPositionX + ((parseInt(xBarInfo.width / 2) + 1)),
					}
				}

	            return(__nLocalPositionX);
	        };

			/**
			 * get ratio for horizontal
			 *
			 * @param[in] baseIsPixel index / pixel or pixel / index
			 * @return ratio
			 */
			this.didGetRatioHorizontal = function(baseIsPixel) {
				var __ratio = 0.0;
				var __frameWidth = _self.GetChartFrameAreaWidth();

				var __nScreenSize = _self.m_xScrollInfo.screenSize; //(_self.m_iEndX - _self.m_iStartX + 1)
				if(baseIsPixel) {
					__ratio = (__nScreenSize) / __frameWidth;
				}
				else {
					__ratio = __frameWidth / (__nScreenSize);
				}

				return(__ratio);
			};

			/**
			 * [description]
			 * @param  {[type]} argAbsolutePostionX
			 * @return {[type]}
			 */
			this.GetRelativePositionXInfo = function(argAbsolutePostionX) {
				var nRelativePos = _self.GetRelativePostionX(argAbsolutePostionX);
				var nRelativeIdx = _self.didConvertDataIndexToLocalIndex(_self.GetXIndex(nRelativePos));

				var result = {
					pos : nRelativePos,
					idx : nRelativeIdx
				};

				return(result);
			};

			/**
			 * @param[in] nLocalXPos local x position
			 * @return {pos:, width:}
			 */
			this.didGetAdjustedBarInfo = function(nLocalXPos) {
				var __ratio = _self.didGetRatioHorizontal(false);
	        	var __barWidth = /*parseInt*/(__ratio);
	        	var __barWidth1 = __barWidth - 1;
	        	var __halfRatio = __barWidth1 / 2;
	        	var __halfBar = parseInt(__halfRatio);
	        	var __result = {grid: __barWidth};
	        	if(nLocalXPos !== undefined) {
	        		if(__barWidth > 30) {
						__result.pos = parseInt(nLocalXPos - __halfBar + 3);
						__result.width = parseInt(nLocalXPos + __halfBar - 3) - __result.pos;
					}
	        		else if(__barWidth > 15) {
						__result.pos = parseInt(nLocalXPos - __halfBar + 2);
						__result.width = parseInt(nLocalXPos + __halfBar - 2) - __result.pos;
					}
					else if(__barWidth > 5) {
						__result.pos = parseInt(nLocalXPos - __halfBar + 1);
						__result.width = parseInt(nLocalXPos + __halfBar - 1) - __result.pos;
					}
					else if(__barWidth > 3) {
						__result.pos = parseInt(nLocalXPos - __halfBar);
						__result.width = parseInt(nLocalXPos + __halfBar) - __result.pos;
					}
	        		/*
					else if(__barWidth > 1) {
						__result.pos = parseInt(nLocalXPos - 1);
						__result.width = parseInt(nLocalXPos + 1) - __result.pos;
					}*/
					else {
						__result.pos = nLocalXPos;
						__result.width = 1;
					}
	        	}

				return(__result);
			};

			//
			//
			//
			this.didSetDataViewInfo = function(arrDatas) {
				var nCount = _self.m_arrChartDrawFramelist.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPanel = _self.m_arrChartDrawFramelist[ii];
					xPanel.didSetDataViewInfo(arrDatas, _self.m_ptCrossline.x);
				}
			};

			this.didGetSelectedTrendlineInfo = function() {
				var nCount = _self.m_arrChartDrawFramelist.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPanel = _self.m_arrChartDrawFramelist[ii];
					var xInfo  = xPanel.didFindSelectedObject();
					if(xInfo && xInfo.tool) {
						return(xInfo.tool);
					}
				}
			};

			this.didGetCountForAllTrenslines = function() {
				var	nSum = 0;
				var nCount = _self.m_arrChartDrawFramelist.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPanel = _self.m_arrChartDrawFramelist[ii];
					try {
						var nCnt = Math.max(0, xPanel.didGetCountForAllTrenslines());
						nSum += nCnt;
					}
					catch(e) {

					}
				}

				return(nSum);
			};

			//
			// #894
			//
			this.didClearAllSubRequestedObjects = function(isOrder, isPosit, isExecution, isAlert) {
				if(_self.m_xDoBasePrice === undefined || _self.m_xDoBasePrice == null) {
					return(false);
				}

				var isOpFlag = _self.m_xDoBasePrice.didClearOrderPositObjects(isOrder, isPosit);
				var isExecutionFlag = false;
				if(isExecution === true) {
					isExecutionFlag = _self.m_xDoBasePrice.didClearExecutionObjects();
				}

				var isAlertFlag = false;
				if(isAlert === true) {
					isAlertFlag = _self.m_xDoBasePrice.didClearAlertObjects();
				}

				_self.DrawingChartDrawFrame(false);
			};

			this.didClearOrderPositObjects = function(isOrder, isPosit) {
				if(_self.m_xDoBasePrice === undefined || _self.m_xDoBasePrice == null) {
					return(false);
				}

				var isOpFlag = _self.m_xDoBasePrice.didClearOrderPositObjects(isOrder, isPosit);

				//_self.DrawingChartDrawFrame(false);
			};

			// #2032
			this.didClearExecutionObjects = function() {
				if(_self.m_xDoBasePrice === undefined || _self.m_xDoBasePrice == null) {
					return(false);
				}

				var isFlag = _self.m_xDoBasePrice.didClearExecutionObjects();

				//_self.DrawingChartDrawFrame(false);
			};

			this.didClearAlertObjects = function() {
				if(_self.m_xDoBasePrice === undefined || _self.m_xDoBasePrice == null) {
					return(false);
				}

				var isFlag = _self.m_xDoBasePrice.didClearAlertObjects();

				//_self.DrawingChartDrawFrame(false);
			};
			//


			this.didGetAxisXPanel = function() {
				return(_self.m_chartXAxisObj);
			}


			this.didGetPanelInfoAtPos = function(posval) {
				var xHorzArea = _self.GetHorizontalRangeOfAllPanelsInFullArea();
				var nFullHeight = _self.GetFullDrawPanelHeight();
				if(posval.YPos < 0 || posval.YPos > nFullHeight) {
					// console.debug("Out of area in Height");

					return;
				}

				var xResult = {
				};

				if(xHorzArea.left.pos <= posval.XPos && posval.XPos <= xHorzArea.left.pos + xHorzArea.left.width) {
					// console.debug("Left axis");
					xResult.axis = -1;
				}

				if(xHorzArea.center.pos <= posval.XPos && posval.XPos <= xHorzArea.center.pos + xHorzArea.center.width) {
					// console.debug("Center");
					xResult.axis = 0;
				}

				if(xHorzArea.right.pos <= posval.XPos && posval.XPos <= xHorzArea.right.pos + xHorzArea.right.width) {
					xResult.axis = 1;
				}

				var nCount = _self.m_arrChartDrawFramelist.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPanel = _self.m_arrChartDrawFramelist[ii];
					if(xPanel) {
						var xRect = xPanel.didGetPanelRect();
						if(xRect.top <= posval.YPos && posval.YPos <= xRect.top + xRect.height) {
							xResult.panel = xPanel;
							xResult.panelNo = ii;
							xResult.isMain = xPanel.m_bMainFrame;
						}
					}
				}

				return(xResult);
			};

			this.didDeselectAllFrameObjects = function(bRefresh) {
				// 全てのオブジェクトを非選択ステータスへ変更する。
				for(var ii = 0; ii < _self.m_arrChartDrawFramelist.length; ii++) {
					_self.m_arrChartDrawFramelist[ii].DeselectAllObject();
				}

				if(bRefresh === true) {
					_self.DrawingChartDrawFrame(false);
				}
			};

			// #1169
			this.didProcForMouseDownInAxisArea = function(posval, argEvent) {
				return(false);
			};
			//

			// #1524
			this.didCheckOepPosInAxisArea = function(posval) {
				return;
			};
			//

			// #1290
			this.didProcForCrosslineOnMouseMove = function(posval) {
				var result = _self.didCheckScrollAvailable();

				var bFlag= false;
				var bAllowScroll = true;

				if(result) {
					bFlag = result.crossline;
					bAllowScroll = result.scroll;
				}

				// #507
				if(bFlag === true) {
					_self.SetCrossLinePoint(posval);
				}

				return(bAllowScroll);
			};

			// #1558
			this.didCheckScrollAvailable = function() {
				var xEnv = _self.didGetEnvInfo();
				var bFlag= false;
				var bAllowScroll = true;
				if(xEnv.System.UseObjectCrossline === true && _self.m_bCrosslineObject === true && _self.m_bMouseDown === true) {
					bFlag = true;
					bAllowScroll = false;
				}
				else if(xEnv.System.UseObjectCrossline !== true) {
					if(xUtils.isCFDPriceBar(xEnv)) {
						if(xUtils.isAvailableMouseScrollActionOnCFD(xEnv, _self.m_strTrendLine)) {
							bFlag = true;
							bAllowScroll = true;
						}
						else {
							bFlag = false;
							bAllowScroll = false;
						}
					}
					else {
						bFlag = true;
						bAllowScroll = true;
					}
				}

				if(_self.m_bMouseDown !== true) {
					bAllowScroll = false;
				}

				return({scroll:bAllowScroll, crossline:bFlag});
			};

			this.isHitCrosslineBox = function(posval) {
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseObjectCrossline !== true) {
					return(false);
				}

				if(_self.m_ptCrossline === undefined || _self.m_ptCrossline == null) {
					return(false);
				}

				try {
					var radius = xEnv.System.CrosslineBoxRadius + 3;
					var nDistX = Math.abs(posval.XPos - _self.m_ptCrossline.x);
					var nDistY = Math.abs(posval.YPos - _self.m_ptCrossline.y);
					if(xEnv.CrossLine.box.isCircle) {
						var nDist  = Math.sqrt(Math.pow(nDistX, 2) + Math.pow(nDistY, 2));
						if(nDist < radius) {
							return(true);
						}
					}
					else {
						if(nDistX < radius && nDistY < radius) {
							return(true);
						}
					}
				}
				catch(e) {
					console.error(e);
				}

				return(false);
			};

			// #1779
			this.didProcForMouseDownAboutAction = function(posval, argEvent, actionArea) {
				if(actionArea === undefined || actionArea == null) {
					return(false);
				}

				if(actionArea.isDetail) {
					if(_self.m_chartWrapper.didReflectCallForDetailView) {
						var xNotifyData = {
							targetId:actionArea.targetId
						};
						_self.m_chartWrapper.didReflectCallForDetailView(xNotifyData);
					}

					// #2308
					var xEnv = _self.didGetEnvInfo();
					xEnv.DetailViewStatusIsShown = true;
					_self.DrawingChartDrawFrame();
					//

					return(true);
				}

				if(actionArea.isLegend) {
					try {
						var nCount = _self.m_arrChartDrawFramelist.length;
						for(var ii = 0; ii < nCount; ii++) {
							var xDf = _self.m_arrChartDrawFramelist[ii];
							if(xDf && xDf.didClickLegendButton) {
								if(xDf.didClickLegendButton(actionArea.targetId) === true) {
									break;
								}
							}
						}

						return(true);
					}
					catch(e) {
						console.error(e);
					}

					return(true);
				}

				if(actionArea.isExtraArea) {
					try {
						if(_self.m_xExtraPanel && _self.m_xExtraPanel.OnSelectChartObj) {
							_self.m_xExtraPanel.OnSelectChartObj(posval);
						}

						return(true);
					}
					catch(e) {
						console.error(e);
					}
				}

				return(false);
			};
			//

			// #1298
			this.didCreateExtraPanel = function() {
				_self.m_xExtraPanel = new extraPanelClass(_chartWrapper, _self);
				_self.m_xExtraPanel.didInitPanel(_self.m_domElemChartDraw);
			};
			//

			// #1927
			this.m_toolTipToid = null;
			this.m_toolTipPosval = null;
			this.m_toolTipActionArea = null;
			this.didShowTooltip = function(isShow, posval, toolTipText, limitRect) {
				if(_self.m_xTooltip === undefined || _self.m_xTooltip == null) {
					_self.m_xTooltip = new tooltipClass(_chartWrapper, _self);
					_self.m_xTooltip.didInitPanel(_self.m_domElemChartDraw);
				}

				_self.m_xTooltip.didShowTooltip(isShow, posval, toolTipText, limitRect);
			};

			this.didClearTooltipEventer = function() {
				_self.m_toolTipPosval = null;
				_self.m_toolTipActionArea = null;
				if(_self.m_toIdTooltip !== undefined && _self.m_toIdTooltip != null) {
					clearTimeout(_self.m_toIdTooltip);
				}
				_self.m_toIdTooltip = null;
			};

			this.didHitTestForExtraObject = function(posval, actionArea) {
				if(!posval) {
					return;
				}

				var hitPosVal = xUtils.didClone(posval);
				hitPosVal.__onmove__ = true;

				var xDoSelected;
				if(actionArea && actionArea.isExtraArea == true) {
					if(_self.m_xExtraPanel.OnSelectChartObj(hitPosVal) >= 0) {
						xDoSelected = _self.m_xExtraPanel.m_xDoExtraSelected;
					}
				}
				else {
					var localDrawFrame = _self.m_arrChartDrawFramelist[_self.m_iCanvasMouseMoveIndex];
					if(localDrawFrame.OnSelectChartObj(hitPosVal) >= 0) {
						xDoSelected = localDrawFrame.m_xSelectedOepObject;
					}
				}

				return(xDoSelected);
			};

			this.didProcForTooltip = function(posval, actionArea) {
				try {
					if(!posval) {
						return;
					}

					var xEnv = _self.didGetEnvInfo();
					var isDeleteOneRepeat = xUtils.trendLine.isDeleteOneRepeat(_self.m_strTrendLine);
					var isCrossHairMode = xUtils.trendLine.isCrossHairMode(_self.m_strTrendLine); // #2566

					// #2566
					if(_self.m_bMouseDown == true || _self.m_bOrderLine == true || isDeleteOneRepeat == true || (_self.m_bTrendLine == true && isCrossHairMode != true)) {
						return;
					}
					//

					_self.didShowTooltip(false);
					_self.didClearTooltipEventer();

					_self.m_toolTipPosval  = xUtils.didClone(posval);
					_self.m_toolTipActionArea  = xUtils.didClone(actionArea);
					_self.m_toIdTooltip = setTimeout(function() {
						if(_self.m_toolTipPosval && _self.m_toolTipActionArea)  {
							var xDoSelected = _self.didHitTestForExtraObject(_self.m_toolTipPosval, _self.m_toolTipActionArea);
							if(xDoSelected && xDoSelected.didGetTooltipText) {
								var rect = {
									x:0,
									y:0,
									width : _chartWrapper.m_iChartWrapWidth,
									height: _chartWrapper.m_iChartWrapHeight
								};

								_self.didShowTooltip(true, _self.m_toolTipPosval, xDoSelected.didGetTooltipText(), rect);
							}
						}

						_self.didClearTooltipEventer();
					}, xEnv.TooltipDelay);
				}
				catch(e) {
					console.error(e);
				}
			};

			// #2038
			this.didGetScrollLevelInfo = function() {
				if(_self.m_xScrollInfo.levelList === undefined || _self.m_xScrollInfo.levelList == null || _self.m_xScrollInfo.levelList.length === undefined || _self.m_xScrollInfo.levelList.length == null || _self.m_xScrollInfo.levelList.length < 1) {
					return;
				}

				var level = _self.m_xScrollInfo.level || 0;

				return(_self.m_xScrollInfo.levelList[level]);
			};
			//

			// #2677
			this.didGetDistanceFactor = function() {
				var __ratio = 0.0;
				var __frameWidth = _self.GetChartFrameAreaWidth();

				var __nScreenSize = _self.m_xScrollInfo.screenSize;
				__ratio = __frameWidth / (__nScreenSize);

				return(__ratio);
			};
			// [end] #2677
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDrawPanelBase");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDrawPanelBase"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDrawFrameNormal"],
				global["WGC_CHART"]["chartXAxisPanelNormal"],
				global["WGC_CHART"]["chartDOFactory"],
				global["WGC_CHART"]["chartAxisUnit"],
				global["WGC_CHART"]["chartDrawPanelExtra"],
				global["WGC_CHART"]["chartDrawPanelTooltip"],
				global["WGC_CHART"]["canvas2DUtil"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./chartDrawFrameNormal"),
				require("./chartXAxisPanelNormal"),
				require("./chartDOFactory"),
				require("./chartAxisUnit"),
				require("./chartDrawPanelExtra"),
				require("./chartDrawPanelTooltip"),
				require("./canvas2DUtil")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDrawPanelBase",
            ['ngc/chartUtil', 'ngc/chartDrawFrameNormal', 'ngc/chartXAxisPanelNormal', 'ngc/chartDOFactory', 'ngc/chartAxisUnit', 'ngc/chartDrawPanelExtra', 'ngc/chartDrawPanelTooltip', 'ngc/canvas2DUtil'],
                function(xUtils, drawFrameClass, xAxisPanelClass, doFactory, axisUnitFactory, extraPanelClass, tooltipClass, gxDc) {
                    return loadModule(xUtils, drawFrameClass, xAxisPanelClass, doFactory, axisUnitFactory, extraPanelClass, tooltipClass, gxDc);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDrawPanelBase"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDrawFrameNormal"],
				global["WGC_CHART"]["chartXAxisPanelNormal"],
				global["WGC_CHART"]["chartDOFactory"],
				global["WGC_CHART"]["chartAxisUnit"],
				global["WGC_CHART"]["chartDrawPanelExtra"],
				global["WGC_CHART"]["chartDrawPanelTooltip"],
				global["WGC_CHART"]["canvas2DUtil"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDrawPanelBase");
})(this);
