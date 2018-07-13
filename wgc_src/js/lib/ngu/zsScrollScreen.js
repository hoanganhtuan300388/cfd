(function(global){
	"use strict";

	var loadModule = function (xUtils, parentClass, mouseCapture, zsScrollWrap) {
		var _exports = function(id) {
			//
			// private
			//
			var _self = this;
			var _classObj = this;
			var _className = "ScreenPanel";
			var _classRef = this;
			var _zsWrap = null;

			var _logNum = 0;

			var _uniqueId = xUtils.createGuid();

			//
			this.prototype = new parentClass();
			parentClass.apply(this, arguments);

			this.method = this.prototype.method;
			this.method.superior = {};
			this.method.classObj = this;
			this.method.className = _className;
			this.method.id = id;
			this.method.mouseCapture = new mouseCapture();

			//
			//
			//
			for ( var m in this.prototype.method) {
				if ($.isFunction(this.prototype.method[m]))
					this.method.superior[m] = this.prototype.method[m];
			}

			this.m_eventTables = [];

			this.m_hammer;

			this.method.m_zsWrap = null;

			this.m_nWrapWidth = 0;
			this.m_nWrapHeight = 0;

			this.m_initParam;

			this.m_xSettings = {
				THUMB_SIZING_BUTTON_SIZE : 9, // #1827
				THUMB_SIZING_BUTTON_RIGHT_MARGIN : 4, // #1827
				THUMB_SIZING_BUTTON_LEFT_MARGIN : 4, // #1827
				THUMB_SIZING_BUTTON_HEIGHT: 64,		// #2801
				STEP_BUTTON_SIZE : 24,

				STEP_PRESSING_TIME : 300, // #2783
			};

			this.m_rectInfo = {
				x : 0,
				y : 0,
				width : 0,
				height : 0
			};

			this.m_pScroll = null;
			this.m_pDelegate = null;

			this.m_toIdRepeatDown = -1;
			this.m_tiIdRepeatDown = -1;
			this.m_nRepeatTime = 50;
			this.m_bMouseDown = false;
			this.m_bStepButtonLDown = false;
			this.m_bStepButtonRDown = false;

			// #1362
			this.m_ptMouse = {x:-1, y:-1};
			//

			// this.m_rcArea = {x:0, y: 0, width:0, height:0}; // #2296

			// elements

			//
			// private function
			//

			/**
			 *
			 */
			var _getTagetChildDOMElementById = function(scrobj, id) {
				var jqElem = scrobj._$object.find('#' + id);
				var domElem = $(jqElem).get(0);

				return (domElem);
			};

			var _findDomElementById = function(scrobj, id) {
				var jqElem = scrobj._$object.find('#' + id);
				var domElem = $(jqElem).get(0);

				return(domElem);
			};

			var _findDomElementsByClassName = function(scrobj, clsName) {
					var jqElem = scrobj._$object.find('.' + clsName);
					var domElems = $(jqElem);

					return(domElems);
			};

			var _didCreateDomElem = function(id, className) {
				var domElem = document.createElement("div");
				domElem.setAttributeNS( null, "id", id);
				domElem.className = className;

				return(domElem);
			};

			var _didCreateDomElemWithImage = function(id, className, imgId, imgClassName) {
				var domElem = document.createElement("div");
				domElem.setAttributeNS( null, "id", id);
				domElem.className = className;

				var domElemImage = document.createElement("image");
				domElemImage.setAttributeNS( null, "id", imgId);
				domElemImage.className = imgClassName;

				domElem.appendChild(domElemImage);

				return(domElem);
			};

			var _didCreateDomElemButton = function(id, className, text) {
				var domElem = document.createElement("button");
				domElem.setAttributeNS( null, "id", id);
				domElem.className = className + " btn btn-default";
				domElem.innerHTML = text;

				return(domElem);
			};

			var _didCreateDomElemButtonWithImage = function(id, className, imgId, imgClassName) {
				var domElem = document.createElement("button");
				domElem.setAttributeNS( null, "id", id);
				domElem.className = className + " btn btn-default";

				var domElemImage = document.createElement("image");
				domElemImage.setAttributeNS( null, "id", imgId);
				domElemImage.className = imgClassName;

				domElem.appendChild(domElemImage);

				return(domElem);
			};

			var _didCreateDomElemCanvas = function(id, className) {
				var domElem = document.createElement("canvas");
				domElem.setAttributeNS( null, "id", id);
				domElem.className = className;

				return(domElem);
			};

			var _didCreateDomElemThumbBar = function(domElemPar, initParam) {
				var domElemThumbBar  = _didCreateDomElem("eidZsThumbArea", "classZsArea");

				var domElemThumbMid  = _didCreateDomElem("eidZsThumbBarM", "classZsThumbMove");
				var domElemThumbLeft = _didCreateDomElemWithImage("eidZsThumbBarL", "classZsThumbSize", "eidZsThumbBarImgL", "classZsThmubSizeImage");
				var domElemThumbRight= _didCreateDomElemWithImage("eidZsThumbBarR", "classZsThumbSize", "eidZsThumbBarImgR", "classZsThmubSizeImage");

				domElemThumbBar.appendChild(domElemThumbMid);
				domElemThumbBar.appendChild(domElemThumbLeft);
				domElemThumbBar.appendChild(domElemThumbRight);

				if(domElemPar) {
					domElemPar.appendChild(domElemThumbBar);
				}

				initParam = initParam || _self.m_initParam;
				initParam.thumbBar = domElemThumbBar;
				initParam.thumbBarL= domElemThumbLeft;
				initParam.thumbBarM= domElemThumbMid;
				initParam.thumbBarR= domElemThumbRight;

				return(domElemThumbBar);
			};

			var _didCreateDomElemScrollArea = function(domElemPar, initParam) {
				var domElemScrollArea = _didCreateDomElem("eidZsScrollArea", "classZsScrollArea");
				var domElemThumbBar  = _didCreateDomElemThumbBar(domElemScrollArea, _self.m_initParam);

				//
				var domElemScrollBgArea = _didCreateDomElemCanvas("eidZsBackground", "classZsScrollBackground");
				domElemScrollArea.appendChild(domElemScrollBgArea);
				//

				domElemScrollArea.appendChild(domElemThumbBar);

				if(domElemPar) {
					domElemPar.appendChild(domElemScrollArea);
				}

				initParam = initParam || _self.m_initParam;
				initParam.scrollArea = domElemScrollArea;
				initParam.scrollBgArea = domElemScrollBgArea;

				return(domElemScrollArea);
			};

			var _didCreateDomElemActionArea = function(domElemPar, initParam, isLeft) {
				var className = "classZsActionArea";
				var mark = isLeft === true ? "L" : "R";
				var elemId = "eidZsActionArea" + mark;
				var buttonId = "eidZsActionButton" + mark;
				var buttonClassName = "classZsActionButton";
				var imgElemId = isLeft === true ? "eidZsActionButtonLeftImage" : "eidZsActionButtonRightImage";
				var imgclassName = isLeft === true ? "classZsActionButtonLeftImage" : "classZsActionButtonRightImage";

				var domElemActionArea   = _didCreateDomElem(elemId, className);
				var	domElemActionButton = _didCreateDomElemButtonWithImage(buttonId, buttonClassName, imgElemId, imgclassName);

				domElemActionArea.appendChild(domElemActionButton);

				if(domElemPar) {
					domElemPar.appendChild(domElemActionArea);
				}

				initParam = initParam || _self.m_initParam;
				if(isLeft === true) {
					initParam.actionAreaL = domElemActionArea;
					initParam.actionButtonL = domElemActionButton
				}
				else {
					initParam.actionAreaR = domElemActionArea;
					initParam.actionButtonR = domElemActionButton
				}

				return(domElemActionArea);
			};

			var _didInitChildElements = function(initParam) {
				_self.m_initParam = initParam;

				var __deParent = _self.m_initParam.parent;
				var __no = _self.m_initParam.no;

				// left area
				_didCreateDomElemActionArea(__deParent, _self.m_initParam, true);
				// right area
				_didCreateDomElemActionArea(__deParent, _self.m_initParam, false);
				// scroll area
				_didCreateDomElemScrollArea(__deParent, _self.m_initParam);
			};

			/**
			 * remove elements link
			 */
			var _didRemoveLinkElements = function() {
				if(_self.m_initParam !== undefined && _self.m_initParam != null) {
					var __deParent = _self.m_initParam.parent;

					var __actionAreaL = _self.m_initParam.actionAreaL;
					var __actionAreaR = _self.m_initParam.actionAreaR;
					var __scrollArea  = _self.m_initParam.scrollArea;

					// close link
					__deParent.removeChild(__actionAreaL);
					__deParent.removeChild(__actionAreaR);
					__deParent.removeChild(__scrollArea);

					//
					_self.m_initParam = {};
				}
			};

			var _didGetAdjustedMouseEventPosition = function(event, capturedObj) {
				//
				//
				//
				var jidChartWrap;

				if(capturedObj !== undefined && capturedObj != null) {
					jidChartWrap = $(capturedObj).offset();
				}
				else {
					jidChartWrap = $(event.currentTarget).offset();
				}

				var scrollX =
					    window.scrollX 			// Modern Way (Chrome, Firefox)
					 || window.pageXOffset 		// (Modern IE, including IE11
					 || document.documentElement.scrollLeft	// (Old IE, 6,7,8)
					 ;
				var scrollY =
					    window.scrollY 			// Modern Way (Chrome, Firefox)
					 || window.pageYOffset 		// (Modern IE, including IE11
					 || document.documentElement.scrollTop	// (Old IE, 6,7,8)
					 ;

				// #1021

				var posValueClient = {
					XPos : (event.clientX - jidChartWrap.left + scrollX),
					YPos : (event.clientY - jidChartWrap.top  + scrollY),
				};
				var posValueOffset = {
					XPos : (event.offsetX == undefined ? event.layerX : event.offsetX),
					YPos : (event.offsetY == undefined ? event.layerY : event.offsetY)
				};
				var posval = posValueClient;

				return(posval);
			};

			var _didEventProcForDown = function(targetId, posval, argEvent, capturedObj, someObject) {
				if(targetId === undefined || targetId == null) {
					return(true);
				}

				console.log("")

				try {
					if(targetId.indexOf("eidZsActionButtonL") >= 0) {
						_self.m_bStepButtonLDown = true;
						_didCheckRepeatTimeout();

						return(true);
					}
					else if(targetId.indexOf("eidZsActionButtonR") >= 0) {
						_self.m_bStepButtonRDown = true;
						_didCheckRepeatTimeout();

						return(true);
					}
					else if(targetId === "eidZsThumbBarM") {
						_self.m_pScroll.ELBtnDn({EVT_MOVING:true}, posval);

						return(false);
					}
					else if(targetId === "eidZsThumbBarL" || targetId === "eidZsThumbBarImgL") {
						_self.m_pScroll.ELBtnDn({EVT_SIZING1:true}, posval);

						return(false);
					}
					else if(targetId === "eidZsThumbBarR" || targetId === "eidZsThumbBarImgR") {
						_self.m_pScroll.ELBtnDn({EVT_SIZING2:true}, posval);

						return(false);
					}
					else {

						return(true);
					}

					return(true);
				}
				catch(e) {
					console.error(e);
				}

				return(true);
			};

			var _didEventProcForMove = function(targetId, posval, capturedObj, someObject) {
				if(targetId === undefined || targetId == null) {
					return(true);
				}

				if(_self.m_bMouseDown) {
					if(_self.m_pScroll.EMouseMove({}, posval)) {
						// console.log(_self.m_pScroll);
						// console.log("_didEventProcForMove => " + JSON.stringify(posval));
						// console.log("_didEventProcForMove => ThumbPos : " + _self.m_pScroll.m_nThumbPos);
						//_self.SetZSBPos(_self.m_pScroll.m_nThumbPos, true);
						_self.didUpdateScrollBar(true);
					}
				}
			};

			var _didEventProcForUp = function(targetId, posval, argEvent, capturedObj, someObject) {
				// #1307
				_self.m_pScroll.ELBtnUp({}, posval);

				_didEndMouseAction();
			};

			/**
			 *
			 */
			var _initDOMElements = function(jobjScreen) {
				_self.m_jobjScreen = jobjScreen;

				// set chart element's area to object's
				var domElemChartWrap = _findDomElementById(jobjScreen, "idZsWrap");
				if(domElemChartWrap !== undefined && domElemChartWrap != null)  {
					//
					// #704
					domElemChartWrap.setAttributeNS(null, "tabindex", 1);
					//

					_self.m_nWrapWidth  = domElemChartWrap.offsetWidth;
					_self.m_nWrapHeight = domElemChartWrap.offsetHeight;

					//
					_self.m_initParam = {
						root : domElemChartWrap,
						parent : domElemChartWrap
					};


					_didInitChildElements(_self.m_initParam);
				}
			};

			var _didCreateZoomScroll = function(pDelegate) {
				_self.m_pDelegate = pDelegate;
				_self.m_pScroll = new zsScrollWrap(_self, Math.ceil((_self.m_xSettings.THUMB_SIZING_BUTTON_SIZE + 1) * 2)); // #2296
			};

			/**
			 * after load screen, this method is called.
			 * @param  {[type]} argPlotStyleInfos
			 * @return {[type]}
			 */
			this.didInitScreen = function(pDelegate, argSettings) {
				if(argSettings) {
					_self.m_xSettings = xUtils.didClone(argSettings);
				}

				_didCreateZoomScroll(pDelegate);

				_initDOMElements(_self);

				_didInitEventTables();

				//
				_self.setEventHandler();

				//
				_self.DidCallAfterDoneWithOnLoad();
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didGetUniqueId = function() {
				return(_uniqueId);
			};

			this.didStartCapture = function(eventElem) {
				_self.method.mouseCapture.didStartCapture(eventElem, _self.OnMouseMove, _self.OnMouseUp)
			};

			/*
			 * !
			 *
			 */
			this.setEventHandler = function() {
				// find dom element
				var domElem = null;
				var __ii = 0;
			};

			//
			// Scroll Interface
			//
			this.SetZSBInit = function(nShows, nContents, nShowsMin, nShowsMax, bDraw) {
				// #1824
				var ret = _self.m_pScroll.SetContentsSize(nShows, nContents, nShowsMin, nShowsMax, bDraw);

				if(bDraw) {
					_self.didUpdateScrollBar(false);
				}

				return(ret);
			};

			this.SetZSBRange = function(nShows, nContents, bDraw) {
				var ret = _self.m_pScroll.ChangeContentsSize(nShows, nContents);

				if(bDraw) {
					_self.didUpdateScrollBar(true);
				}

				return(ret);
			};

			this.SetZSBPos = function(nPos, bUpdate) {
				var ret = _self.m_pScroll.ChangeThumbPos(nPos);

				return(ret);
			};

			var _Invalidate = function(onleDraw) {
				_self.didUpdateScrollBar(onleDraw);
			};

			var _GetBackgroundContextInfo = function() {
				var xZsnd = {};
				xZsnd.canvas		= _self.m_initParam.scrollBgArea;
				xZsnd.context		= _self.m_initParam.scrollBgArea.getContext("2d");
				xZsnd.rcDraw		= xUtils.didClone(_self.m_rectInfo.scrollBgDrawArea);
				xZsnd.margin		= {
					left  : 1,
					top   : 1,
					right : 1,
					bottom: 1
				};

				return(xZsnd);
			};

			var _Draw = function() {
				//
				_didSetSizeToDomElem(_self.m_initParam.actionAreaL	, _self.m_rectInfo.actionAreaLeft);
				_didSetSizeToDomElem(_self.m_initParam.actionButtonL, _self.m_rectInfo.actionAreaLeftButton);
				_didSetSizeToDomElem(_self.m_initParam.actionAreaR	, _self.m_rectInfo.actionAreaRight);
				_didSetSizeToDomElem(_self.m_initParam.actionButtonR, _self.m_rectInfo.actionAreaRightButton);
				_didSetSizeToDomElem(_self.m_initParam.scrollArea 	, _self.m_rectInfo.scrollArea);
				_didSetSizeToDomElem(_self.m_initParam.scrollBgArea	, _self.m_rectInfo.scrollBgArea);
				_didSetSizeToDomElem(_self.m_initParam.thumbBar		, _self.m_rectInfo.thumbBar);
				_didSetSizeToDomElem(_self.m_initParam.thumbBarL	, _self.m_rectInfo.thumbBarL);
				_didSetSizeToDomElem(_self.m_initParam.thumbBarR	, _self.m_rectInfo.thumbBarR);
				_didSetSizeToDomElem(_self.m_initParam.thumbBarM	, _self.m_rectInfo.thumbBarM);

				// background canvas
				_didSetSizeToDomElemAsCanvas(_self.m_initParam.scrollBgArea	, _self.m_rectInfo.scrollBgArea);

				//
				//
				//
				var bDrawDefault = false;
				if(_self.m_pDelegate) {
					var xZsnd = _GetBackgroundContextInfo();

					bDrawDefault = _self.m_pDelegate.WillBeDrawnBackground(_self, xZsnd);
				}
			};

			//
			//
			//

			var _didSetSizeToDomElem = function(domElem, rectInfo) {
				domElem.style.left 	= rectInfo.x      + 'px';
				domElem.style.top   	= rectInfo.y      + 'px';
				domElem.style.width 	= rectInfo.width  + 'px';
				domElem.style.height = rectInfo.height + 'px';
			};

			var _didSetSizeToDomElemAsCanvas = function(domElem, rectInfo) {
				var devicePixelRatio = window.devicePixelRatio || 1;
				var ratio = devicePixelRatio;

				var __width			 = rectInfo.width;
				var __height		 = rectInfo.height;
				domElem.width  		 = ratio * __width;
				domElem.height 		 = ratio * __height;

				domElem.style.left 	 = rectInfo.x      + 'px';
				domElem.style.top    = rectInfo.y      + 'px';
				domElem.style.width  = rectInfo.width  + 'px';
				domElem.style.height = rectInfo.height + 'px';
			};

			this.didUpdateScrollBar = function(onlyDraw, rectInfo) {
				if(rectInfo) {
					_didCalcArea(onlyDraw, rectInfo);
				}
				else {
					_didCalcArea(onlyDraw, xUtils.didClone(_self.m_rcArea));
				}

				var thumbSize = _self.m_pScroll.m_rectThumbB.width;
				var __thumbSizeWidth = _self.m_xSettings.THUMB_SIZING_BUTTON_SIZE;
				if(thumbSize < __thumbSizeWidth * 2) {
					// hide thumbBar size control
					_self.m_rectInfo.thumbBarL.width = 0;
					_self.m_rectInfo.thumbBarR.width = 0;

					_self.m_initParam.thumbBarL.style.visibility = "hidden";
					_self.m_initParam.thumbBarR.style.visibility = "hidden";
				}
				else {
					_self.m_initParam.thumbBarL.style.visibility = "visible";
					_self.m_initParam.thumbBarR.style.visibility = "visible";
				}

				//
				_Draw();
			};

			var __calcMiddleWidth = function(width1, width2) {
				return(width1 - width2 * 2 + 2);
			};

			var _didCalcArea = function(onlyDraw, rectInfo) {
				var __width  = rectInfo.width;
				var __height = rectInfo.height;

				var __thumbSizeWidth  = _self.m_xSettings.THUMB_SIZING_BUTTON_SIZE;
				var __actionAreaWidth = _self.m_xSettings.STEP_BUTTON_SIZE;
				var __thumbBarMarginLR= _self.m_xSettings.THUMB_SIZING_BUTTON_LEFT_MARGIN + _self.m_xSettings.THUMB_SIZING_BUTTON_RIGHT_MARGIN;

				__width = Math.max(__actionAreaWidth, __width);

				var	__scrollAreaWidth = __calcMiddleWidth(__width, __actionAreaWidth);
				var rectScroll = xUtils.didClone(rectInfo);
				rectScroll.width = __scrollAreaWidth;

				if(onlyDraw !== true) {
					_self.m_pScroll.SetArea(rectScroll);
				}
				// console.debug(_self.m_pScroll);

				var	__thumbWidth = _self.m_pScroll.m_rectThumbB.width;
				var	__thumbPos   = _self.m_pScroll.m_rectThumbB.x;

				// console.debug("didResizeScreen => " + JSON.stringify(rectInfo));

				//
				var __rect = xUtils.shapes.didGetDefaultRect();
				__rect.height = __height;

				_self.m_rectInfo = {};
				_self.m_rectInfo.actionAreaLeft = xUtils.didClone(__rect);
				_self.m_rectInfo.actionAreaLeft.width = __actionAreaWidth;

				_self.m_rectInfo.actionAreaLeftButton = xUtils.didClone(__rect);
				_self.m_rectInfo.actionAreaLeftButton.width = __actionAreaWidth;
				_self.m_rectInfo.actionAreaLeftButton.height= __actionAreaWidth;
				_self.m_rectInfo.actionAreaLeftButton.y = parseInt((__height - __actionAreaWidth) / 2);

				_self.m_rectInfo.actionAreaRight = xUtils.didClone(__rect);
				_self.m_rectInfo.actionAreaRight.x = __width - __actionAreaWidth;
				_self.m_rectInfo.actionAreaRight.width = __actionAreaWidth;

				_self.m_rectInfo.actionAreaRightButton = xUtils.didClone(__rect);
				_self.m_rectInfo.actionAreaRightButton.width = __actionAreaWidth;
				_self.m_rectInfo.actionAreaRightButton.height= __actionAreaWidth;
				_self.m_rectInfo.actionAreaRightButton.y = parseInt((__height - __actionAreaWidth) / 2);

				_self.m_rectInfo.scrollArea = xUtils.didClone(__rect);
				_self.m_rectInfo.scrollArea.x = __actionAreaWidth - 1;
				_self.m_rectInfo.scrollArea.width = __scrollAreaWidth;

				_self.m_rectInfo.scrollBgArea = xUtils.didClone(__rect);
				_self.m_rectInfo.scrollBgArea.x  	 = _self.m_xSettings.THUMB_SIZING_BUTTON_LEFT_MARGIN + 1;
				_self.m_rectInfo.scrollBgArea.width  = __scrollAreaWidth - 2 - (2 + _self.m_xSettings.THUMB_SIZING_BUTTON_LEFT_MARGIN + _self.m_xSettings.THUMB_SIZING_BUTTON_RIGHT_MARGIN) - 1; // #2801
				_self.m_rectInfo.scrollBgArea.height = __height - 2;

				_self.m_rectInfo.scrollBgDrawArea 		 = xUtils.didClone(__rect);
				_self.m_rectInfo.scrollBgDrawArea.width  = __scrollAreaWidth - 2;
				_self.m_rectInfo.scrollBgDrawArea.height = __height - 2;

				//
				_self.m_rectInfo.thumbBar = xUtils.didClone(__rect);
				_self.m_rectInfo.thumbBar.x = 1 + __thumbPos;
				_self.m_rectInfo.thumbBar.y = 1;
				_self.m_rectInfo.thumbBar.width = __thumbWidth - 4;
				_self.m_rectInfo.thumbBar.height = __height - 4;

				var __thumbBarWidth  = _self.m_rectInfo.thumbBar.width;
				var __thumbBarHeight = _self.m_rectInfo.thumbBar.height;
				__rect.height = __thumbBarHeight;
				_self.m_rectInfo.thumbBarM = xUtils.didClone(__rect);
				_self.m_rectInfo.thumbBarM.x = __thumbSizeWidth /*- 1 */- _self.m_xSettings.THUMB_SIZING_BUTTON_LEFT_MARGIN; // #2801
				_self.m_rectInfo.thumbBarM.width = __calcMiddleWidth(__thumbBarWidth, __thumbSizeWidth) + __thumbBarMarginLR - 1;

				__rect.y = 0; // #2801
				__rect.height = _self.m_xSettings.THUMB_SIZING_BUTTON_HEIGHT;

				_self.m_rectInfo.thumbBarL = xUtils.didClone(__rect);
				_self.m_rectInfo.thumbBarL.width = __thumbSizeWidth;

				_self.m_rectInfo.thumbBarR = xUtils.didClone(__rect);
				_self.m_rectInfo.thumbBarR.x = __thumbBarWidth - __thumbSizeWidth;
				_self.m_rectInfo.thumbBarR.width = __thumbSizeWidth;


				return(__thumbWidth);
			};

			this.didResizeScreen = function(rectInfo) {
				if(rectInfo === undefined || rectInfo == null) {
					return;
				}

				_self.didUpdateScrollBar(false, rectInfo);
			};

			var _didStartRepeatDownAction = function() {
				_didClearRepeatDownAction();

				// console.log("_didStartRepeatDownAction");
				_self.m_tiIdRepeatDown = setInterval(function() {
					if(_self.m_bStepButtonLDown) {
						_didScrollStep(-1, true);
					}
					else if(_self.m_bStepButtonRDown) {
						_didScrollStep(1, true);
					}
				}, _self.m_nRepeatTime);
			};

			var _didCheckRepeatTimeout = function() {
				_didClearRepeatTimeout();

				_self.m_toIdRepeatDown = setTimeout(function() {
					_didStartRepeatDownAction();
				}, _self.m_xSettings.STEP_PRESSING_TIME); // #2783
			};

			var _didClearRepeatTimeout = function() {
				if(_self.m_toIdRepeatDown >= 0) {
					clearTimeout(_self.m_toIdRepeatDown);
					_self.m_toIdRepeatDown = -1;
				}
			};

			var _didClearRepeatDownAction = function() {
				if(_self.m_tiIdRepeatDown >= 0) {
					clearTimeout(_self.m_tiIdRepeatDown);
					_self.m_tiIdRepeatDown = -1;
				}
			};

			var _didEndMouseAction = function() {
				_self.m_bMouseDown = false;
				_self.m_bStepButtonLDown = false;
				_self.m_bStepButtonRDown = false;
				_didClearRepeatDownAction();
				_didClearRepeatTimeout();
			};

			//
			//
			//

			var _zsWrap_OnMouseDown = function(event) {
				//
				var __event = event || window.event;

				//
				_self.m_bMouseDown = true;

				if(!__event) {
					return(true);
				}

				var posval = _didGetAdjustedMouseEventPosition(__event);

				var ret = _didEventProcForDown(__event.target.id, posval, __event);
				if(ret === true) {
					return(true);
				}
			};

			var _zsWrap_OnMouseUp = function(event, capturedObj) {
				var __event = event || window.event;

				var posval = _didGetAdjustedMouseEventPosition(event, capturedObj);

				var ret = _didEventProcForUp(event.target.id, posval, __event, capturedObj);
				if(ret === true) {
					return(true);
				}
			};

			var _zsWrap_OnMouseMove = function(event, capturedObj) {
				//
				var __event = event || window.event;

				// #1362
				if(_self.m_ptMouse.x === event.clientX && _self.m_ptMouse.y === event.clientY) {
					return(true);
				}

				_self.m_ptMouse.x = event.clientX;
				_self.m_ptMouse.y = event.clientY;
				//

				var posval = _didGetAdjustedMouseEventPosition(__event, capturedObj);

				var ret = _didEventProcForMove(__event.target.id, posval, __event);
				if(ret === true) {
					return(true);
				}

				//
			};

			var _zsWrap_OnMouseWheel = function(event) {

			};

			var _zsWrap_OnDragOver = function(event) {

			};

			var _zsWrap_OnKeyDown = function(event) {

			};

			var _zsWrap_OnDoubleClick = function(event) {

			};

			var _zsWrap_OnContextMenu = function(event) {

			};

			var _zsWrap_OnMouseOver = function(event) {

			};

			var _didScrollStep = function(nStep, bDraw) {
				if(nStep == 0) {
					return(false);
				}

				var __bChanged = _self.m_pScroll.StepScroll(nStep);
				if(__bChanged) {
					_self.didUpdateScrollBar(false);

					return(true);
				}

				return(false);
			};

			var _zsWrap_OnMouseLeave = function(event) {
				// _didEndMouseAction();
			};

			var _zsWrap_OnClick = function(event) {
				_didEndMouseAction();

				if(!event) {
					return(false);
				}

				try {
					var targetId = event.target.id;

					if(targetId.indexOf("eidZsActionButtonL") >= 0) {
						_didScrollStep(-1, true);
					}
					else if(targetId.indexOf("eidZsActionButtonR") >=0) {
						_didScrollStep(1, true);
					}
					else {
						return(false);
					}

					return(true);
				}
				catch(e) {

				}

				return(false);
			};

			var _zsWrap_OnResize = function() {
				var zsWrapObj = _self.didFindDomElementById("idZsWrap");
				_self.m_nWrapWidth  = zsWrapObj.offsetWidth;
				_self.m_nWrapHeight = zsWrapObj.offsetHeight;

				_self.m_rcArea = {x:0, y: 0, width:_self.m_nWrapWidth, height:_self.m_nWrapHeight};

				_self.didResizeScreen(xUtils.didClone(_self.m_rcArea));
			};

			this.didGetEndScrollPos = function() {
				var range = _self.m_pScroll.GetSBRange();

				return(range.length);
			};

			/**
			 * find element by id(child element)
			 * @param[in] id	element id
			 * @return element or undefined
			 */
			this.didFindDomElementById = function(id) {
				return(_findDomElementById(_self, id));
			};

			//

			//
			// TODO: remove comment
			// in ChartDraw
			//
			this.OnResize = function() {
				_zsWrap_OnResize();
			};

			this.OnMouseOver = function(strId) {
				alert(_classRef.method.className + "(" + _classRef.method.id + "):" + strId);
			};

			/**
			 *
			 */
			this.OnMouseDown = function(event) {
				//
				var __event = event || window.event;

				// don't permit right mouse down
				if(__event.button != 0) {
					return;
				}

				if(_zsWrap_OnMouseDown(__event) === true) {
					return;
				}

				//
				_self.didStartCapture(__event.currentTarget);
			};

			/**
			 * @param[in] event			event
			 * @param[in] capturedObj	captured object(element)
			 */
			this.OnMouseUp = function(event, capturedObj) {
				var __event = event || window.event;

				if(_zsWrap_OnMouseUp(__event, capturedObj) === true) {
					return;
				}
			};

			/**
			 * @param[in] event			event
			 * @param[in] capturedObj	captured object(element)
			 */
			this.OnMouseMove = function(event, capturedObj) {
				var __event = event || window.event;

				if(_zsWrap_OnMouseMove(__event, capturedObj) === true) {
					return;
				}
			};

			/**
			 *
			 */
			this.OnClick = function(event) {
				//
				var __event = event || window.event;

				// don't permit right mouse down
				if(__event.button != 0) {
					return;
				}

				if(_zsWrap_OnClick(__event) === true) {
					return;
				}
			};

			/**
			 *
			 */
			this.OnMouseLeave = function(event) {
				//
				var __event = event || window.event;

				if(_zsWrap_OnMouseLeave(__event) === true) {
					return;
				}
			};

			/**
			 *
			 */
			this.OnMouseEnter = function(event) {
				//
				var __event = event || window.event;
			};

			this.OnDragOver = function(event) {
				var __event = event || window.event;

				if(_zsWrap_OnDragOver(__event) === true) {
					return;
				}
			};

			this.OnMouseWheel = function(event) {
				var __event = event || window.event;

				if(_zsWrap_OnMouseWheel(__event) === true) {
					return;
				}
			};

			this.OnKeyDown = function(event) {
				var __event = event || window.event;

				if(_zsWrap_OnKeyDown(__event) === true) {
					return;
				}
			};

			this.OnDoubleClick = function(event) {
				var __event = event || window.event;

				if(_zsWrap_OnDoubleClick(__event) === true) {
					return;
				}
			};



			/**
			 *
			 */
			this.OnUnload = function() {
				_didRemoveLinkElements();

				//
				delete _self.m_pScroll;
				_self.m_pScroll = null;

				//
				delete _self.method.mouseCapture;
        		_self.mouseCapture = null;
			};

			this.OnContextMenu = function(event) {
				//
				var __event = event || window.event;

				_zsWrap_OnContextMenu(__event);

				//
				event.preventDefault();
			}

			/**
			 *  original is Init
			 */
			this.DidCallAfterDoneWithOnLoad = function() {
				//
				this.addEventOfZsDraw();
			};

			/**
			 * clear event
			 */
			this.clearEventOfZsDraw = function() {
				var targetElement = _getTagetChildDOMElementById(_self, 'idZsWrap');
				if (targetElement.removeListener) {
					for(var __ii in _eventTables) {
						var __eventItem = _eventTables[__ii];
						if(__eventItem === undefined || __eventItem == null || __eventItem.handler === undefined) {
							break;
						}

						targetElement.removeListener(__eventItem.eventNane, __eventItem.handler, false);
					}
				} else if (targetElement.detachEvent) {
					for(var __ii in _self.m_eventTables) {
						var __eventItem = _self.m_eventTables[__ii];
						if(__eventItem === undefined || __eventItem == null || __eventItem.handler === undefined) {
							break;
						}

						targetElement.detachEvent(__eventItem.eventNane, __eventItem.handler, false);
					}
				}
			};

			/**
			 * add event
			 */
			this.addEventOfZsDraw = function() {
				var targetElement = _getTagetChildDOMElementById(_self, 'idZsWrap');
				if (targetElement.addEventListener) {
					for(var __ii in _self.m_eventTables) {
						var __eventItem = _self.m_eventTables[__ii];
						if(__eventItem === undefined || __eventItem == null || __eventItem.handler === undefined) {
							break;
						}

						targetElement.addEventListener(__eventItem.eventNane, __eventItem.handler, false);
					}
				} else if (targetElement.attachEvent) {
					for(var __ii in _self.m_eventTables) {
						var __eventItem = _self.m_eventTables[__ii];
						if(__eventItem === undefined || __eventItem == null || __eventItem.handler === undefined) {
							break;
						}

						targetElement.attachEvent(__eventItem.eventNane, __eventItem.handler, false);
					}
				}
			};

			var _didInitEventTables = function() {
				_self.m_eventTables.push({ eventNane : "unload"			, handler : _self.OnUnload			});
				_self.m_eventTables.push({ eventNane : "resize"			, handler : _self.OnResize			});
				_self.m_eventTables.push({ eventNane : "mousedown"		, handler : _self.OnMouseDown		});
				_self.m_eventTables.push({ eventNane : "mouseup"		, handler : _self.OnMouseUp			});
				_self.m_eventTables.push({ eventNane : "mousemove"		, handler : _self.OnMouseMove		});
				_self.m_eventTables.push({ eventNane : "keydown"		, handler : _self.OnKeyDown			});
				_self.m_eventTables.push({ eventNane : "dblclick"		, handler : _self.OnDoubleClick		});
				_self.m_eventTables.push({ eventNane : "click"			, handler : _self.OnClick			});
				_self.m_eventTables.push({ eventNane : "mouseenter"		, handler : _self.OnMouseEnter		});
				_self.m_eventTables.push({ eventNane : "mouseleave"		, handler : _self.OnMouseLeave		});

				_self.m_eventTables.push({ eventNane : "mousewheel"		, handler : _self.OnMouseWheel		});	// wheel(IE)
				_self.m_eventTables.push({ eventNane : "DOMMouseScroll"	, handler : _self.OnMouseWheel		});	// Chrome, Opera, Safari, FireFox

				_self.m_eventTables.push({ eventNane : "contextmenu"	, handler : _self.OnContextMenu		});

				_self.m_eventTables.push({ eventNane : "__end__"		, handler : undefined				});
				_self.m_eventTables.push({ eventNane : "dragover"		, handler : _self.OnDragOver		});
				_self.m_eventTables.push({ eventNane : "keypress"		, handler : _self.OnKeyDown			});
				_self.m_eventTables.push({ eventNane : "storage"		, handler : _self.OnStorageChange	});
			};

			// ------------------------------------------------------------------------------------------------------------
			// INTERFACE
			// ------------------------------------------------------------------------------------------------------------

			//
			// #748
			// Register reflect methods
			//
			this.didRegisterReflector = function(argType, argMethod) {
			};

			//
			// IZoomScrollbarDelegate
			//

			this.didSetDelegate = function(pDelegate) {
				_self.m_pDelegate = pDelegate;
			};

			this.DidScrollToPos = function(caller, nPos, pShows) {
				_Invalidate(true);

				if(_self.m_pScroll) {
					var pDelegate = _self.m_pDelegate;
					if(pDelegate && pDelegate.DidScrollToPos) {
					 	pDelegate.DidScrollToPos(_self, nPos, pShows);
					}
				}
			};

			this.DidScrollUpdate = function(caller, notifyData) {
				_Invalidate();
			};

			this.WillBeDrawnBackground = function(caller, notifyData) {
				if(m_pScroll) {
					var pDelegate = _self.m_pDelegate;
					if(pDelegate && pDelegate.WillBeDrawnBackground) {
						return(pDelegate.WillBeDrawnBackground(_self, pZsnd));
					}
				}

				return(false);
			};

			this.WillBeDrawnThumb = function(caller, notifyData) {
				if(m_pScroll) {
					var pDelegate = _self.m_pDelegate;
					if(pDelegate && pDelegate.WillBeDrawnThumb) {
						return(pDelegate.WillBeDrawnThumb(_self, pZsnd));
					}
				}

				return(false);
			};
		};

   	 	return(_exports);
	};

	//console.debug("[MODUEL] Loading => zsScrollScreen");

	// Enable module loading if available
	if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
			module["exports"] =
				loadModule(
					require("../ngc/chartUtil"),
					require("../ngc/screen"),
					require("../ngc/mouseCapture"),
					require("./zsScrollWrap")
				);
	} else {// if (typeof define !== 'undefined' && define["amd"]) { // AMD
			define("ngu/zsScrollScreen", ['ngc/chartUtil', 'ngc/screen', 'ngc/mouseCapture', 'ngu/zsScrollWrap'],
				function(xUtils, parentClass, mouseCapture, zsScrollWrap) {
					return loadModule(xUtils, parentClass, mouseCapture, zsScrollWrap);
				});
	}

	//console.debug("[MODUEL] Loaded => zsScrollScreen");
 })(this);
