(function(global){
	"use strict";

	var loadModule = function(xUtils, drawWrapClass) {
		"use strict";

		var exports = function(scrObj) {
			var _ownerObj = scrObj;	/// screenChart object
			var _self = this;

			var _domElements = {};

			var _drawWrapper = null;

			var _debugNo = 0;

			this.m_jobjScreen = null;
			this.m_drawWrapper = null;

			this.m_ChartDrawObj = null;

			this.m_EtcFolder = "./view/images/etcBtn/";

			this.m_arrThemes = [
				'White',
				'Gray',
				'Sky'
			];

			this.m_arrYAxisStyles = [
				'Both',
				'Left',
				'Right'
			];

			this.m_objL = 0;
			this.m_objT = 0;
			this.m_targetObj = null;
			this.m_iColorButton = -1;
			this.m_iChartWrapWidth = 0;
			this.m_iChartWrapHeight = 0;

			this.iMousedownTimeout = 0;

			this.m_callbackTrendline = null;

			// for touch
			this.m_bTouchMode = false;
			this.m_xTouchPosvalLast = null;

			// #1362
			this.m_ptMouse = {x:-1, y:-1};
			//

			//
			// private function
			//

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

			/**
			 *
			 */
			var _didShowHideMenuObj = function(scrobj, bShow) {

			};

			/**
			 * @param[in] event			mouse event
			 * @param[in] capturedObj	capturedObj
			 * @return {XPos:, YPos:}
			 */
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

				//
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
			}

			/**
			 *
			 */
			var _initDOMElements = function(jobjScreen) {
				_self.m_jobjScreen = jobjScreen;

				// set chart element's area to object's
				var domElemChartWrap = _findDomElementById(jobjScreen, "idChartWrap");
				if(domElemChartWrap !== undefined && domElemChartWrap != null)  {
					//
					// #704
					domElemChartWrap.setAttributeNS(null, "tabindex", 1);
					//

					_self.m_iChartWrapWidth  = domElemChartWrap.offsetWidth;
					_self.m_iChartWrapHeight = domElemChartWrap.offsetHeight;

					// set chart area's width
					var domElemChartArea = _findDomElementById(jobjScreen, "idChartArea");
					domElemChartArea.style.width = _self.m_iChartWrapWidth + "px";
				}
			};

			/**
			 * initilize draw wrapper
			 * @param[in] jobjScreen	screen jquery object for chart
			 */
			var _didInitCtrlLayout = function(jobjScreen, argSettings, argPlotStyleInfos) {
				_drawWrapper = new drawWrapClass(_self);
				_self.m_drawWrapper = _drawWrapper;

				_self.m_drawWrapper.didInitCtrlLayout(argSettings, argPlotStyleInfos);
			};

			/**
			 * initialize
			 * @param[in]	scrObj	screen object
			 */
			this.didInitChartWrapper = function(scrObj, argSettings, argPlotStyleInfos) {
				//
				_initDOMElements(scrObj);

				//
				_didInitCtrlLayout(scrObj, argSettings, argPlotStyleInfos);
			};

			/**
			 *  original is Init
			 */
			this.didCallAfterDoneWithOnLoad = function() {
				// init drawing wrapper
				//_self.m_drawWrapper.didInitCtrlLayout();

				//
				// TODO: move outer
				//
				// change default code
				//this.method.m_chartWrap.OnReceive_RequestData({strCode:'USD/JPY'});
			};

			/**
			 * find element by id(child element)
			 * @param[in] id	element id
			 * @return element or undefined
			 */
			this.didFindDomElementById = function(id) {
				if(_self.m_jobjScreen === undefined || _self.m_jobjScreen == null) {
					return(undefined);
				}

				return(_findDomElementById(_self.m_jobjScreen, id));
			};

			/**
			 * find element by class name(child element)
			 * @param[in] clsName	class name
			 * @return element or undefined
			 */
			this.didFindDomElementsByClassName = function(clsName) {
				if(_self.m_jobjScreen === undefined || _self.m_jobjScreen == null) {
					return(undefined);
				}

				return(_findDomElementsByClassName(_self.m_jobjScreen, clsName));
			};

			/**
			 * 指標を追加する。
			 * @param  {string} code
			 * @param  {string} info
			 * @return {boolean}
			 */
			this.didAddIndicator = function(code, info) {
				return(_self.m_drawWrapper.didAddIndicator(code, info));
			};

			this.didChangeBasicChartType = function(argName) {
				return(_self.m_drawWrapper.didChangeBasicChartType(argName));
			}

			// #1878
			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedAlertExecutionData = function(isAlertOrExecution, receivedDatas) {
				_self.m_drawWrapper.willBeReceivedAlertExecutionData(isAlertOrExecution, receivedDatas);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveAlertExecutionData = function(isAlertOrExecution, receivedDatas) {
				_self.m_drawWrapper.didReceiveAlertExecutionData(isAlertOrExecution, receivedDatas);
			};
			// [end] #1878

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedOrderPositData = function(isOrderOrPosit, receivedDatas) {
				_self.m_drawWrapper.willBeReceivedOrderPositData(isOrderOrPosit, receivedDatas);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveOrderPositData = function(isOrderOrPosit, receivedDatas) {
				_self.m_drawWrapper.didReceiveOrderPositData(isOrderOrPosit, receivedDatas);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedData = function(symbolInfo, receivedDatas, nextCount, multiTargetId) {
				_self.m_drawWrapper.willBeReceivedData(symbolInfo, receivedDatas, nextCount, multiTargetId);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveData = function(symbolInfo, receivedDatas, nextCount, multiTargetId) {
				_self.m_drawWrapper.didReceiveData(symbolInfo, receivedDatas, nextCount, multiTargetId);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedRealData = function(receivedData, multiTargetId) {
				_self.m_drawWrapper.willBeReceivedRealData(receivedData, multiTargetId);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveRealData = function(receivedData, multiTargetId) {
				_self.m_drawWrapper.didReceiveRealData(receivedData, multiTargetId);
			};

			/**
			 * [didGetBasePriceDataInfo description]
			 * @return {[type]}
			 */
			this.didGetBasePriceDataInfo = function(id) {
				return(_self.m_drawWrapper.didGetBasePriceDataInfo(id));
			};

			/**
			 * @param[in] bResize
			 */
			this.DrawingChartDrawFrame = function(bResize) {
				_self.m_drawWrapper.DrawingChartDrawFrame(bResize);
			};

			/// <summary>  </summary>
			this.Init = function() {
			};

			/// <summary>  </summary>
			this.HideAllMenu = function( bIndiSetting ) {
				/*
				//TODO
				var menuObj = _self.didFindDomElementById("idCodeListMenu");
				menuObj.style.visibility = "hidden";
				menuObj = _self.didFindDomElementById("idChartPeriodMenu");
				menuObj.style.visibility = "hidden";
				menuObj = _self.didFindDomElementById("idBasicChartMenu");
				menuObj.style.visibility = "hidden";
				menuObj = _self.didFindDomElementById("idIndicatorMenu");
				menuObj.style.visibility = "hidden";
				menuObj = _self.didFindDomElementById("idSettingArea");
				menuObj.style.visibility = "hidden";
				menuObj = _self.didFindDomElementById("idThemelistMenu");
				menuObj.style.visibility = "hidden";
				menuObj = _self.didFindDomElementById("idYAxislistMenu");
				menuObj.style.visibility = "hidden";
				menuObj = _self.didFindDomElementById("idIndiSettingArea");
				menuObj.style.visibility = "hidden";
				menuObj = _self.didFindDomElementById("idCompareArea");
				menuObj.style.visibility = "hidden";

				if (bIndiSetting)
				{
					for (var idx = 0; idx < 5; idx++)
					{
						var PeriodObj = _self.didFindDomElementsByClassName("classPeriodText" + idx);
						PeriodObj[0].style.visibility = "hidden";
						var ColorObj = _self.didFindDomElementById("idIndiColor" + idx);
						ColorObj.style.visibility = "hidden";
					}
				}
				*/
			};

			//
			// On_ Event
			//

			var _didEventProcForDown = function(targetId, posval, argEvent, capturedObj, someObject) {
				if(targetId === undefined || targetId == null) {
					return(true);
				}

				if ((String(targetId).substring(0, 9) === "idCanvasX")
						|| (String(targetId).substring(0, 9) === "idCanvasL")
						|| (String(targetId).substring(0, 13) === "idCrosslineLY")
						|| (String(targetId).substring(0, 9) === "idCanvasR")
						|| (String(targetId).substring(0, 13) === "idCrosslineRY")
						|| (String(targetId).substring(0, 6) === "idIndi")
						|| (String(targetId).substring(0, 12) === "idBasicChart") || (String(targetId).substring(0, 13) === "idChartPeriod")
						|| (String(targetId).substring(0, 9) === "idSetting") || (String(targetId).substring(0, 8) === "idLogout")
						|| (String(targetId).substring(0, 14) === "idCompareChart") || (String(targetId).substring(0, 6) === "idList")
						|| (String(targetId).substring(0, 11) === "idTrendLine") || (String(targetId).substring(0, 12) === "idPeriodList")
						|| (String(targetId).substring(0, 10) === "idCodeList") || (String(targetId).substring(0, 7) === "idTLine")
						|| (String(targetId).substring(0, 7) === "idTheme") || (String(targetId).substring(0, 8) === "idCandle")
						|| (String(targetId).substring(0, 5) === "idSet") || (String(targetId).substring(0, 7) === "idYAxis")
						|| (String(targetId).substring(0, 6).trim() === "") || (String(targetId).substring(0, 11) === "idChartWrap")
						|| (String(targetId).substring(0, 10) === "idCloseBtn") || (String(targetId).substring(0, 11) === "idTrendArea")
						|| (String(targetId).substring(0, 10) === "idCodeEdit") || (String(targetId).substring(0, 17) === "idCompareCodeList")
						|| (String(targetId).substring(0, 9) === "idCompare") || (String(targetId).substring(0, 12) === "idRefreshBtn")
						|| (String(targetId).substring(0, 10) === "idMinusBtn") || (String(targetId).substring(0, 9) === "idPlusBtn")
						|| (String(targetId).substring(0, 14) === "idShiftLeftBtn") || (String(targetId).substring(0, 15) === "idShiftRightBtn")

					) {
					return(true);
				}

				var isAxisArea = false;
				if((String(targetId).substring(0, 9) === "idCanvasR") || (String(targetId).substring(0, 13) === "idCrosslineRY")) {
					isAxisArea = true;
				}

				// #1779
				var actionArea = {
					isDetail:false,
					isLegend:false,
					isExtraArea:false,
				};

				if((String(targetId).indexOf("eidDetailInfoButton") >= 0)) {
					actionArea.targetId = targetId;
					actionArea.isDetail = true;
				}
				else if((String(targetId).indexOf("eidLegendInfoButton") >= 0)) {
					actionArea.targetId = targetId;
					actionArea.isLegend = true;
				}
				else if((String(targetId).indexOf("eidExtraPanelItem") >= 0)) {
					actionArea.targetId = targetId;
					actionArea.isExtraArea = true;
				}
				else {
					actionArea = null;
				}
				// [end] #1779

				_self.HideAllMenu(true);

				// TODO: hide color picker
				if(_self.didHideColorPicker !== undefined) {
					_self.didHideColorPicker.apply(true);
				}

				//
				_didShowHideMenuObj(_ownerObj, false);

				//
				return(_self.m_drawWrapper.OnMouseDown(posval, argEvent, isAxisArea, actionArea));
			};

			var _didEventProcForMove = function(targetId, posval, capturedObj, someObject) {
				if(targetId === undefined || targetId == null) {
					return(true);
				}

				if(capturedObj === undefined || capturedObj == null) {
					if ((String(targetId).substring(0, 9) == "idCanvasX")
							// || (String(targetId).substring(0, 9) == "idCanvasL")
							//|| /(String(targetId).substring(0, 9) == "idCanvasR")
							|| (String(targetId).substring(0, 6) == "idIndi")
							|| (String(targetId).substring(0, 12) == "idBasicChart") || (String(targetId).substring(0, 13) == "idChartPeriod")
							|| (String(targetId).substring(0, 9) == "idSetting") || (String(targetId).substring(0, 8) == "idLogout")
							|| (String(targetId).substring(0, 14) == "idCompareChart") || (String(targetId).substring(0, 6) == "idList")
							|| (String(targetId).substring(0, 11) == "idTrendLine") || (String(targetId).substring(0, 12) == "idPeriodList")
							|| (String(targetId).substring(0, 10) == "idCodeList") || (String(targetId).substring(0, 7) == "idTLine")
							|| (String(targetId).substring(0, 7) == "idTheme") || (String(targetId).substring(0, 8) == "idCandle")
							|| (String(targetId).substring(0, 5) == "idSet") || (String(targetId).substring(0, 7) == "idYAxis")
							|| (String(targetId).substring(0, 9) == "idCompare") || (String(targetId).substring(0, 6).trim() == ""))
						return(true);
				}

				var isAxisArea = false;
				if((String(targetId).substring(0, 9) === "idCanvasR") || (String(targetId).substring(0, 13) === "idCrosslineRY")) {
					isAxisArea = true;
				}

				// #1779
				var actionArea = {
					isDetail:false,
					isLegend:false,
					isExtraArea:false,
				};

				if((String(targetId).indexOf("eidDetailInfoButton") >= 0)) {
					actionArea.targetId = targetId;
					actionArea.isDetail = true;
				}
				else if((String(targetId).indexOf("eidLegendInfoButton") >= 0)) {
					actionArea.targetId = targetId;
					actionArea.isLegend = true;
				}
				else if((String(targetId).indexOf("eidExtraPanelItem") >= 0)) {
					actionArea.targetId = targetId;
					actionArea.isExtraArea = true;
				}
				else {
					actionArea = null;
				}
				// [end] #1779

				_self.m_drawWrapper.OnMouseMove(posval, isAxisArea, actionArea);
			};

			var _didEventProcForUp = function(targetId, posval, argEvent, capturedObj, someObject) {
				window.clearInterval(_self.iMousedownTimeout);

				// #1524
				var isAxisArea = false;
				if((String(targetId).substring(0, 9) === "idCanvasR") || (String(targetId).substring(0, 13) === "idCrosslineRY")) {
					isAxisArea = true;
				}
				// [end] #1524

				// #1307
				if ((capturedObj !== undefined && capturedObj != null) || String(targetId).substring(0, 8) == "idCanvas") {
					_self.m_drawWrapper.OnMouseUp(posval, argEvent, isAxisArea);
				}
			};

			var _didEventProcForContextMenu = function(targetId, posval, contextMenu) {
				if(targetId === undefined || targetId == null) {
					return(true);
				}


				if ((String(targetId).substring(0, 9) == "idCanvasX") || (String(targetId).substring(0, 6) == "idIndi")
						|| (String(targetId).substring(0, 12) == "idBasicChart") || (String(targetId).substring(0, 13) == "idChartPeriod")
						|| (String(targetId).substring(0, 9) == "idSetting") || (String(targetId).substring(0, 8) == "idLogout")
						|| (String(targetId).substring(0, 14) == "idCompareChart") || (String(targetId).substring(0, 6) == "idList")
						|| (String(targetId).substring(0, 11) == "idTrendLine") || (String(targetId).substring(0, 12) == "idPeriodList")
						|| (String(targetId).substring(0, 10) == "idCodeList") || (String(targetId).substring(0, 7) == "idTLine")
						|| (String(targetId).substring(0, 7) == "idTheme") || (String(targetId).substring(0, 8) == "idCandle")
						|| (String(targetId).substring(0, 5) == "idSet") || (String(targetId).substring(0, 7) == "idYAxis")
						|| (String(targetId).substring(0, 9) == "idCompare") || (String(targetId).substring(0, 6).trim() == ""))
					return(true);

				_self.HideAllMenu(true);

				// TODO: hide color picker
				if(_self.didHideColorPicker !== undefined) {
					_self.didHideColorPicker.apply(true);
				}

				//
				_didShowHideMenuObj(_ownerObj, false);

				// #1966
				var isAxisArea = false;
				if((String(targetId).substring(0, 9) === "idCanvasR") || (String(targetId).substring(0, 13) === "idCrosslineRY")) {
					isAxisArea = true;
				}

				var actionArea = {
					isDetail:false,
					isLegend:false,
					isExtraArea:false,
				};

				if((String(targetId).indexOf("eidDetailInfoButton") >= 0)) {
					actionArea.targetId = targetId;
					actionArea.isDetail = true;
				}
				else if((String(targetId).indexOf("eidLegendInfoButton") >= 0)) {
					actionArea.targetId = targetId;
					actionArea.isLegend = true;
				}
				else if((String(targetId).indexOf("eidExtraPanelItem") >= 0)) {
					actionArea.targetId = targetId;
					actionArea.isExtraArea = true;
				}
				else {
					actionArea = null;
				}
				// [end] #1966

				//
				_self.m_drawWrapper.OnContextMenu(posval, contextMenu, isAxisArea, actionArea);
			};

			// #2061
			var _didEventProcForDoubleClick = function(targetId, posval, argEvent) {
				if(targetId === undefined || targetId == null) {
					return(true);
				}

				if ((String(targetId).substring(0, 9) === "idCanvasX")
						|| (String(targetId).substring(0, 9) === "idCanvasL")
						|| (String(targetId).substring(0, 13) === "idCrosslineLY")
						//|| (String(targetId).substring(0, 9) === "idCanvasR")
						//|| (String(targetId).substring(0, 13) === "idCrosslineRY")
						|| (String(targetId).substring(0, 6) === "idIndi")
						|| (String(targetId).substring(0, 12) === "idBasicChart") || (String(targetId).substring(0, 13) === "idChartPeriod")
						|| (String(targetId).substring(0, 9) === "idSetting") || (String(targetId).substring(0, 8) === "idLogout")
						|| (String(targetId).substring(0, 14) === "idCompareChart") || (String(targetId).substring(0, 6) === "idList")
						|| (String(targetId).substring(0, 11) === "idTrendLine") || (String(targetId).substring(0, 12) === "idPeriodList")
						|| (String(targetId).substring(0, 10) === "idCodeList") || (String(targetId).substring(0, 7) === "idTLine")
						|| (String(targetId).substring(0, 7) === "idTheme") || (String(targetId).substring(0, 8) === "idCandle")
						|| (String(targetId).substring(0, 5) === "idSet") || (String(targetId).substring(0, 7) === "idYAxis")
						|| (String(targetId).substring(0, 6).trim() === "") || (String(targetId).substring(0, 11) === "idChartWrap")
						|| (String(targetId).substring(0, 10) === "idCloseBtn") || (String(targetId).substring(0, 11) === "idTrendArea")
						|| (String(targetId).substring(0, 10) === "idCodeEdit") || (String(targetId).substring(0, 17) === "idCompareCodeList")
						|| (String(targetId).substring(0, 9) === "idCompare") || (String(targetId).substring(0, 12) === "idRefreshBtn")
						|| (String(targetId).substring(0, 10) === "idMinusBtn") || (String(targetId).substring(0, 9) === "idPlusBtn")
						|| (String(targetId).substring(0, 14) === "idShiftLeftBtn") || (String(targetId).substring(0, 15) === "idShiftRightBtn")

					) {
					return(true);
				}

				var isAxisArea = false;
				if((String(targetId).substring(0, 9) === "idCanvasR") || (String(targetId).substring(0, 13) === "idCrosslineRY")) {
					isAxisArea = true;
				}

				_self.HideAllMenu(true);

				// TODO: hide color picker
				if(_self.didHideColorPicker !== undefined) {
					_self.didHideColorPicker.apply(true);
				}

				//
				_didShowHideMenuObj(_ownerObj, false);

				//
				return(_self.m_drawWrapper.OnDoubleClick(posval, argEvent, isAxisArea));
			};
			//

			/*
			 * !
			 *
			 */
			this.OnMouseDown = function(event) {
				var __event = event || window.event;

				if (_self.m_bTouchMode === true) {
					return(true);
				}

				var posval = _didGetAdjustedMouseEventPosition(__event);
				/*
				// TODO: [LOG]
				// console.debug("[WGC] :" + 'OnMouseDown');
				// console.debug("[WGC] :" + __event);
				// console.debug("[WGC] :" + posval);
				// console.debug("[WGC] :" + '\n');

				//console.debug("OnMouseDown: ==>" + event.target.id);
				//console.debug(posval);
				*/
				//

				var ret = _didEventProcForDown(__event.target.id, posval, __event);
				if(ret === true) {
					return(true);
				}
			};

			/**
			 * @param[in] event			event
			 * @param[in] capturedObj	captured object(element)
			 */
			this.OnMouseUp = function(event, capturedObj) {
				var __event = event || window.event;

				if (_self.m_bTouchMode === true) {
					return(true);
				}

				var posval = _didGetAdjustedMouseEventPosition(event, capturedObj);

				var ret = _didEventProcForUp(event.target.id, posval, __event, capturedObj);
				if(ret === true) {
					return(true);
				}
			};

			/**
			 * @param[in] event			event
			 * @param[in] capturedObj	captured object(element)
			 */
			this.OnMouseMove = function(event, capturedObj) {
				var __event = event || window.event;

				// #1362
				if(_self.m_ptMouse.x === event.clientX && _self.m_ptMouse.y === event.clientY) {
					return(true);
				}

				_self.m_ptMouse.x = event.clientX;
				_self.m_ptMouse.y = event.clientY;
				//

				if (_self.m_bTouchMode === true) {
					return(true);
				}

				var posval = _didGetAdjustedMouseEventPosition(__event, capturedObj);
				/* TODO: [LOG]
				// console.debug("[WGC] :" + 'OnMouseMove');
				// console.debug("[WGC] :" + posval);
				// console.debug("[WGC] :" + '\n');
				*/
				var ret = _didEventProcForMove(event.target.id, posval, capturedObj);
				if(ret === true) {
					return(true);
				}
			};

			this.OnDragOver = function(event) {
				// event.cancelBubble = true;
				// event.stopPropagation();

				// event.preventDefault();
				// _self.m_drawWrapper.OnMouseMove({XPos:event.clientX,
				// YPos:event.clientY});
				// event.target.releaseCapture();
			};

			this.OnMouseWheel = function(event) {
				var __event = event || window.event;

				var iXPos, iDelta = 0;
				if (__event.ctrlKey || __event.metaKey)
					__event.preventDefault();

				iXPos = __event.clientX;

				// #1495
				var __wheelDelta;
				var __div = 120;
				if ('wheelDelta' in __event) {
					__wheelDelta = __event.wheelDelta;
					__div = 120;
				}
				else {
					// FireFox
					__wheelDelta = __event.detail;
					__div = -3;
				}

				if(__wheelDelta === undefined || __wheelDelta == null) {
					return;
				}

				if(typeof __wheelDelta === "string") {
					iDelta = parseInt(__wheelDelta) / __div;
				}
				else if(typeof __wheelDelta === "object") {
					return;
				}
				else {
					iDelta = __wheelDelta / __div;
				}

				if(isNaN(iDelta) === true) {
					return;
				}

				iDelta = Math.round(iDelta);
				// [end] #1495

				_self.m_drawWrapper.OnMouseWheel({
					XPos : iXPos,
					Delta : iDelta
				});

			};

			this.OnKeyDown = function(event) {
				var __event = event || window.event;
				// console.debug("[WGC] :" + event.which);
				// event.preventDefault();
				// return false;
				// event.returnValue = false;

				_self.m_drawWrapper.OnKeyDown(__event.which);
			};

			this.OnDoubleClick = function(event) {
				var __event = event || window.event;

				if (_self.m_bTouchMode === true) {
					return(true);
				}

				var posval = _didGetAdjustedMouseEventPosition(__event);
				// TODO: [LOG]
				// console.debug("[WGC] :" + 'OnMouseDown');
				// console.debug("[WGC] :" + __event);
				// console.debug("[WGC] :" + posval);
				// console.debug("[WGC] :" + '\n');

				//console.debug("OnMouseDown: ==>" + event.target.id);
				//console.debug(posval);
				//

				_didEventProcForDoubleClick(__event.target.id, posval, __event);
			};

			/**
			 * @param[in] event			event
			 */
			this.OnSwipe = function(event) {
				var __event = event || window.event;

				_self.m_drawWrapper.OnSwipe(__event);
			};

			/**
			 *
			 */
			this.OnUnload = function() {
				_self.m_drawWrapper.OnDestroy();

				delete _self.m_drawWrapper;
				_self.m_drawWrapper = null;
			};

			/*
			 * !
			 *
			 */
			this.OnContextMenu = function(event) {
				var __event = event || window.event;

				if (_self.m_bTouchMode === true) {
					return(true);
				}

				var posval = _didGetAdjustedMouseEventPosition(__event);
				/*
				// TODO: [LOG]
				// console.debug("[WGC] :" + 'OnMouseDown');
				// console.debug("[WGC] :" + __event);
				// console.debug("[WGC] :" + posval);
				// console.debug("[WGC] :" + '\n');

				//console.debug("OnMouseDown: ==>" + event.target.id);
				//console.debug(posval);
				*/
				//

				var contextMenu = {
					event : xUtils.didClone(__event)
				};

				var ret = _didEventProcForContextMenu(__event.target.id, posval, contextMenu);
				if(ret === true) {
					return(true);
				}
			};


			/**
			 * origin is DidCodeChange
			 * @param[in] argRecv
			 * @return [object]
			 */
			this.OnReceive_RequestData = function(argRecv) {
				if(_self.m_drawWrapper !== undefined && _self.m_drawWrapper != null) {
					return(_self.m_drawWrapper.OnReceive_RequestData(argRecv));
				}
			};

			/// <summary> Executes the URL select action.</summary>
			this.OnResize = function() {
				var chartWrapObj = _self.didFindDomElementById("idChartWrap");
				_self.m_iChartWrapWidth = chartWrapObj.offsetWidth;
				_self.m_iChartWrapHeight = chartWrapObj.offsetHeight;
				// console.debug("[WGC] :" + window.innerHeight + "/" +chartWrapObj.offsetHeight);


				var ObjChartDraw = _self.didFindDomElementById("idChartArea");
				ObjChartDraw.style.width = _self.m_iChartWrapWidth + "px";
				ObjChartDraw.style.height = _self.m_iChartWrapHeight + "px";

				//
				_self.m_drawWrapper.ResizeChart(true);
			}; // end draw

			/**
			 *
			 */
			this.OnBottomBtnClick = function( strId ) {
				_self.m_drawWrapper.didClick_ActionButton(strId);
			};

			/**
			 *
			 */
			this.OnBottomBtnUp = function() {
				//TODO
				window.clearInterval(_self.iMousedownTimeout);
			};

			/**
			 * do for action button
			 */
			this.didClick_ActionButton = function(strId) {
				if (strId == "idRefreshBtn") {
					// TODO: not load data, go to end
					//_self.LoadData();
				}
				else if (strId == "idMinusBtn")
					_self.OnMouseWheel({Delta:-1});
				else if (strId == "idPlusBtn")
					_self.OnMouseWheel({Delta:1});
				else if (strId == "idShiftLeftBtn")
				{
					_self.m_drawWrapper.didScrollScreen(-1);
					window.clearInterval(_self.iMousedownTimeout);
					_self.iMousedownTimeout = window.setInterval(function() { _self.m_drawWrapper.didScrollScreen(-1) }, 150);
				}
				else if (strId == "idShiftRightBtn")
				{
					_self.m_drawWrapper.didScrollScreen(1);
					window.clearInterval(_self.iMousedownTimeout);
					_self.iMousedownTimeout = window.setInterval(function() { _self.m_drawWrapper.didScrollScreen(1)}, 150);
				}
			};

			/**
			 * [description]
			 * @param  {[type]} delta
			 * @return {[type]}
			 */
			this.didScrollScreen = function(delta, bDraw) {
				_self.m_drawWrapper.didScrollScreen(delta, bDraw);
			};

			//
			// 指標インタフェース
			//

			/**
			 * 全ての指標を削除する。
			 * @param  {string} argTypeId		type id
			 * @return {boolean}
			 */
			this.didDeleteAllIndicators = function() {
				return(_self.m_drawWrapper.didDeleteAllIndicators());
			};

			/**
			 * 特定指標（キー）を削除する。
			 * @param  {string} argTypeId		type id
			 * @return {boolean}
			 */
			this.didDeleteIndicatorByTypeId = function(argTypeId) {
				return(_self.m_drawWrapper.didDeleteIndicatorByTypeId(argTypeId));
			};

			/**
			 * 選択された指標を削除する。
			 * @return {boolean}
			 */
			this.didDeleteSelectedIndicator = function() {
				return(_self.m_drawWrapper.didDeleteSelectedIndicator());
			};

			/**
			 * 特定指標（キー）の設定を修正する。
			 * @param  {string} argKey		key
			 * @param  {string} argSettings	JSON string
			 * @return {boolean}
			 */
			this.didChangeIndicatorSettingByKey = function(argKey, argSettings) {
				return(_self.m_drawWrapper.didChangeIndicatorSettingByKey(argKey, argSettings));
			};

			/**
			 * 特定指標（タイプID）の設定を修正する。
			 * @param  {string}  argTypeId		type id
			 * @param  {string}  argSettings	JSON string
			 * @param  {boolean} argIsApplyInfo	apply information or not
			 * @return {boolean}
			 */
			this.didChangeIndicatorSettingByTypeId = function(argTypeId, argSettings, argIsApplyInfo) {
				return(_self.m_drawWrapper.didChangeIndicatorSettingByTypeId(argTypeId, argSettings, argIsApplyInfo));
			};

			/**
			 * チャート上の指標リスト情報を取得する。
			 * added by choi sunwoo at 2017.05.08 for #708
			 * @return {object}
			 */
			this.didGetCurrentIndicatorInformationAll = function(isSave) {
				return(_self.m_drawWrapper.didGetCurrentIndicatorInformationAll(isSave));
			};

			/**
			 * チャートへ指標リスト情報を反映する。
			 * added by choi sunwoo at 2017.06.23 for #928
			 * @return {string}
			 */
			this.didSetCurrentIndicatorInformationAll = function(argInfo) {
				return(_self.m_drawWrapper.didSetCurrentIndicatorInformationAll(argInfo));
			};

			/**
			 * チャート上の特定（タイプID）指標情報を取得する。
			 * added by choi sunwoo at 2017.05.10 for #708
			 * @return {string}
			 */
			this.didGetCurrentIndicatorInformationByTypeId = function(argTypeId) {
				return(_self.m_drawWrapper.didGetCurrentIndicatorInformationByTypeId(argTypeId));
			};

			//
			// Reflect for deleting indicator
			//
			this.didReflectCallForIndicatorIsDeleted = function(argInfo) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					return(_ownerObj.didReflectCallForIndicatorIsDeleted(argInfo));
				}
			};

			this.didReflectCallForError = function(argErrorCode) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					return(_ownerObj.didReflectCallForError(argErrorCode));
				}
			};

			this.didReflectCallForTrendline = function(argInfo) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					return(_ownerObj.didReflectCallForTrendline(argInfo));
				}
			};

			// #2061
			this.didReflectCallForDoubleClick = function(argInfo) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					return(_ownerObj.didReflectCallForDoubleClick(argInfo));
				}
			};
			//

			//
			// Reflect to screenChart
			//
			this.didReflectCallForDataViewInfo = function(argData) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					_ownerObj.didReflectCallForDataViewInfo(JSON.stringify(argData));
				}
			};

			//
			// 注文・ポジションインタフェース
			//

			//
			// Reflect to screenChart
			//
			this.didReflectCallForNewOrder = function(argOrder) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					_ownerObj.didReflectCallForNewOrder(argOrder);
				}
			};

			//
			// Reflect to screenChart
			//
			this.didReflectCallForCancelOrder = function(argOrder) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					_ownerObj.didReflectCallForCancelOrder(argOrder);
				}
			};

			//
			// Reflect to screenChart
			//
			this.didReflectCallForExecutionOrder = function(argOrder) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					_ownerObj.didReflectCallForExecutionOrder(argOrder);
				}
			};

			//
			// Reflect to screenChart
			//
			this.didReflectCallForOepValueIsChanged = function(argOepValue) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					_ownerObj.didReflectCallForOepValueIsChanged(argOepValue);
				}
			};

			// #985
			this.didReflectCallForRequestNextData = function(argInfo) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					return(_ownerObj.didReflectCallForRequestNextData(argInfo));
				}
			};
			//

			//
			// Reflect to screenChart
			// #1779
			this.didReflectCallForDetailView = function(argData) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					_ownerObj.didReflectCallForDetailView(argData);
				}
			};

			// #1966
			this.didReflectCallForContextMenu = function(argData) {
				if(_ownerObj !== undefined && _ownerObj != null) {
					_ownerObj.didReflectCallForContextMenu(argData);
				}
			};
			//

			//
			// #717
			//

			/**
			 * [description]
			 * @param  {[type]} argLoadInfo
			 * @return {[type]}
			 */
			this.didSetLoadInfoForTheLineTools = function(argLoadInfos) {
				return(_self.m_drawWrapper.didSetLoadInfoForTheLineTools(argLoadInfos));
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didGetSaveInfoOfTheLineTools = function() {
				return(_self.m_drawWrapper.didGetSaveInfoOfTheLineTools());
			};
			//

			//
			//
			//
			this.didSetFocusingFlag = function(argFocusing, argRefresh) {
				return(_self.m_drawWrapper.didSetFocusingFlag(argFocusing, argRefresh));
			};
			//

			//
			// チャート設定
			//
			this.didSetChartConfig = function(argConfig) {
				return(_self.m_drawWrapper.didSetChartConfig(argConfig));
			}

			this.didClearDatas = function() {
				_self.m_drawWrapper.didClearDatas();
				_self.DrawingChartDrawFrame();
			};

			//
			this.didClearOrderPositObjects = function(isOrder, isPosit) {
				_self.m_drawWrapper.didClearOrderPositObjects(isOrder, isPosit);
				_self.DrawingChartDrawFrame();
			};

			// #2032
			this.didClearExecutionObjects = function() {
				_self.m_drawWrapper.didClearExecutionObjects();
				_self.DrawingChartDrawFrame();
			};
			this.didClearAlertObjects = function() {
				_self.m_drawWrapper.didClearAlertObjects();
				_self.DrawingChartDrawFrame();
			};
			//

			/**
			 * 拡大・縮小
			 * @param  {Boolean} isIn
			 * @param  {number}  step
			 * @return {[type]}
			 */
			this.didApplyZoomInOut = function(isIn, step) {
				_self.m_drawWrapper.didApplyZoomInOut(isIn, step);
			};

			/**
			 * 最新位置への移動
			 * @param  {[type]} bEndPos
			 * @return {[type]}
			 */
			this.didApplyGoToEndPos = function(bEndPos, isNotFix) {
				return(_self.m_drawWrapper.didApplyGoToEndPos(bEndPos, isNotFix));
			};

			/**
			 *
			 */
			this.didAddLineStudy = function(trendLineCode) {
				return(_self.m_drawWrapper.didApplyTrendline(trendLineCode));
			};

			this.didApplyTrendline = function(trendLineCode, isSelect, color, text) {
				return(_self.m_drawWrapper.didApplyTrendline(trendLineCode, isSelect, color, text));
			};

			// #935
			this.didApplyLocalSetting = function(key, isOn) {
				return(_self.m_drawWrapper.didApplyLocalSetting(key, isOn));
			};

			// #959
			this.didApplyChartSetting = function(argSettings) {
				return(_self.m_drawWrapper.didApplyChartSetting(argSettings));
			};

			// #959
			this.didApplyChartIndicatorPlotColorSetting = function(argSettings) {
				return(_self.m_drawWrapper.didApplyChartIndicatorPlotColorSetting(argSettings));
			};

			//
			// dummy
			//
			this.dummy = function() {
			};

			//
			// MARK:debug(#1105)
			//
			this.didGetCurrentSymbolInfo = function() {
				return(_self.m_drawWrapper.GetCurrentSymbolInfo());
			};

			this.didGetEnvInfo = function() {
				return(_self.m_drawWrapper.didGetEnvInfo());
			};

			//
			// MARK:debug(#1105)
			//
			this.didSetPointValueForCurrentSymbol = function(argPoint) {
				try {
					return(_self.m_drawWrapper.didSetPointValueForCurrentSymbol(argPoint));
				}
				catch(e) {
					// console.debug("[WGC] :" + e);
				}
			};

			//
			// #1441
			//

			this.didSetZSBHandle = function(zsbHandle) {
				try {
					return(_self.m_drawWrapper.didSetZSBHandle(zsbHandle));
				}
				catch(e) {
					// console.debug("[WGC] :" + e);
				}
			};
			// [end] #1441
			// #1796
			this.didUpdateTrendlinesStyle = function(color, text) {
				try {
					return(_self.m_drawWrapper.didUpdateTrendlinesStyle(color, text));
				}
				catch(e) {
					console.error(e);
				}
			};
			//

			// #2007
			this.didUpdateAskBidData = function(hide, ask, bid, validFlag) {
				try {
					return(_self.m_drawWrapper.didUpdateAskBidData(hide, ask, bid, validFlag));
				}
				catch(e) {
					console.error(e);
				}
			};
			//
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartWrap");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartWrap"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDrawWrap"]
			);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
			loadModule(
				require("./chartUtil"),
				require("./chartDrawWrap")
			);
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartWrap", ['ngc/chartUtil', 'ngc/chartDrawWrap'],
			function(xUtils, drawWrapClass) {
				return loadModule(xUtils, drawWrapClass);
			});
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartWrap"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDrawWrap"]
			);
    }

	//console.debug("[MODUEL] Loaded => chartWrap");
})(this);
