(function(global){
	"use strict";

	var loadModule = function (xUtils, parentClass, mouseCapture) {
		var _exports = function(id) {
			//
			// private
			//
			var _self = this;
			var _classObj = this;
			var _className = "ScreenPanel";
			var _classRef = this;
			var _chartWrapper = null;

			var _logNum = 0;

			var _uniqueId = xUtils.createGuid();

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
			this.method.m_chartWrap = null;
			this.method.m_chartWrapChartType = null;
			this.method.m_chartWrapTrendline = null;
			this.method.m_chartWrapDataConverter = null;
			this.method.m_chartWrapIndicator = null;

			for ( var m in this.prototype.method) {
				if ($.isFunction(this.prototype.method[m]))
					this.method.superior[m] = this.prototype.method[m];
			}

			this.m_eventTables = [];

			/**
			 * 注文・ポジション用のコールバックメソッド
			 * @type {[type]}
			 */
			var _reflectMethodForOep = null;
			var _reflectMethodForNewOrder = null;
			var _reflectMethodForCancelOrder = null;
			var _reflectMethodForExecutionOrder = null;
			var _reflectMethodForNofifyingEventAboutDeletedIndicator = null;
			var _reflectMethodForFocusing = null;
			var _reflectMethodForDataViewInfo = null;
			var _reflectMethodForTrendline = null;
			var _reflectMethodForError = null;
			var	_reflectCallForRequestNextData = null;
			var	_reflectMethodForContextMenu = null;
			var _reflectMethodForDetailView = null; // #1779
			var	_reflectMethodForDoubleClick = null; // #2061

			/*
			 * this.method.onLoad = function() { if ( ( _classRef._onLoad !==
			 * undefined ) && ( _classRef._onLoad !== null ) )
			 * _classRef._onLoad(_classRef.method.classObj); };
			 */

			/**
			 * after load screen, this method is called.
			 * @param  {[type]} argPlotStyleInfos
			 * @return {[type]}
			 */
			this.didInitScreen = function(argSettings, argPlotStyleInfos) {
				_didInitEventTables();

				_chartWrapper = _self.method.m_chartWrap;
				if (_chartWrapper === undefined || _chartWrapper == null) {
					// console.debug("[WGC] :" + '[ERROR] chart is null. => ' + _chartWrapper);
					return;
				}

				//
				_self.setChartEventHandler();

				//
				_chartWrapper.didInitChartWrapper(_self, argSettings, argPlotStyleInfos);

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
			this.setChartEventHandler = function() {
				// find dom element
				var domElem = null;
				var __ii = 0;
			};

			//
			// TODO: remove comment
			// in ChartDraw
			//
			this.OnResize = function() {
				_chartWrapper.OnResize();
			};

			this.OnMouseOver = function(strId) {
				alert(_classRef.method.className + "(" + _classRef.method.id + "):" + strId);
			};

			/**
			 *
			 */
			this.OnMouseDown = function(event) {
				//
				//
				//
				_self.didReflectCallForFocusing();

				//
				var __event = event || window.event;

				// #1966
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.UseContextMenu !== true) {
					// don't permit right mouse down
					if(__event.button != 0) {
						return;
					}
				}
				//

				if(_chartWrapper.OnMouseDown(__event) === true) {
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

				if(_chartWrapper.OnMouseUp(__event, capturedObj) === true) {
					return;
				}
			};

			/**
			 * @param[in] event			event
			 * @param[in] capturedObj	captured object(element)
			 */
			this.OnMouseMove = function(event, capturedObj) {
				var __event = event || window.event;

				if(_chartWrapper.OnMouseMove(__event, capturedObj) === true) {
					return;
				}
			};

			this.OnDragOver = function(event) {
				var __event = event || window.event;

				if(_chartWrapper.OnDragOver(__event) === true) {
					return;
				}
			};

			this.OnMouseWheel = function(event) {
				var __event = event || window.event;

				if(_chartWrapper.OnMouseWheel(__event) === true) {
					return;
				}
			};

			this.OnKeyDown = function(event) {
				var __event = event || window.event;

				if(_chartWrapper.OnKeyDown(__event) === true) {
					return;
				}
			};

			this.OnDoubleClick = function(event) {
				var __event = event || window.event;

				if(_chartWrapper.OnDoubleClick(__event) === true) {
					return;
				}
			};

			this.OnSwipe = function(event) {
				return;
				var __event = event || window.event;

				if(_chartWrapper.OnSwipe(__event) === true) {
					return;
				}
			};

			/**
			 *
			 */
			this.OnUnload = function() {
				_self.method.m_chartWrap.OnDestroy();
				delete _self.method.m_chartWrap;
				_self.method.m_chartWrap = null;
				_chartWrapper = null;

				//
				// destroy manager
				//
				delete _self.method.m_chartWrapTrendline;
				_self.method.m_chartWrapTrendline = null;

				delete _self.method.m_chartWrapChartType;
				_self.method.m_chartWrapChartType = null;

				delete _self.method.m_chartWrapDataConverter;
				_self.method.m_chartWrapDataConverter = null;

				delete _self.method.m_chartWrapIndicator;
				_self.method.m_chartWrapIndicator = null;

				//
				delete _self.method.mouseCapture;
				_self.mouseCapture = null;
			};

			this.OnContextMenu = function(event) {
				//
				//
				//
				_self.didReflectCallForFocusing();

				//
				var __event = event || window.event;

				_chartWrapper.OnContextMenu(__event);

				//
				event.preventDefault();
			}

			// #2880
			this.didRegisterEventForDomElemResize = function() {
				if(window.addEventListener) {
					try {
						window.addEventListener('resize', _self.OnWindowResized, false);
					}
					catch(e) {
						console.error(e);
					}
				}
				else if(window.attachEvent) {
					try {
						window.attachEvent('resize', _self.OnWindowResized, false);
					}
					catch(e) {
						console.error(e);
					}
				}
			};

			this.didUnregisterEventForDomElemResize = function() {
				if(window.removeListener) {
					try {
						window.removeListener('resize', _self.OnWindowResized, false);
					}
					catch(e) {
						console.error(e);
					}
				}
				else if(window.detachEvent) {
					try {
						window.detachEvent('resize', _self.OnWindowResized, false);
					}
					catch(e) {
						console.error(e);
					}
				}
			}

			this.OnWindowResized = function() {
				var devicePixelRatio = window.devicePixelRatio || 1;
				if(_self.__devicePixelRatio__ != devicePixelRatio) {
					_self.__devicePixelRatio__ = devicePixelRatio;

					_self.OnResize();
				}
			};
			//

			/**
			 *  original is Init
			 */
			this.DidCallAfterDoneWithOnLoad = function() {
				//
				this.addEventOfChartDraw();

				this.didRegisterEventForDomElemResize(); // #2880

				// init drawing wrapper
				_chartWrapper.didCallAfterDoneWithOnLoad();
			};

			/**
			 * clear event
			 */
			this.clearEventOfChartDraw = function() {
				var targetElement = _getTagetChildDOMElementById(_self, 'idChartWrap');
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

				/*
				if($ !== undefined) {
					$(targetElement).off("swipe", _self.OnSwipe);
				}
				*/
			};

			/**
			 * add event
			 */
			this.addEventOfChartDraw = function() {
				var targetElement = _getTagetChildDOMElementById(_self, 'idChartWrap');
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
			// その他
			// for #895
			//

			/**
			 * 拡大・縮小
			 * @param  {Boolean} isIn
			 * @param  {number}  step
			 * @return {[type]}
			 */
			this.didApplyZoomInOut = function(isIn, step) {
				return(_chartWrapper.didApplyZoomInOut(isIn, step));
			};

			/**
			 * 最新位置への移動
			 * @param  {[type]} bEndPos
			 * @return {[type]}
			 */
			this.didApplyGoToEndPos = function(bEndPos, isNotFix) {
				return(_chartWrapper.didApplyGoToEndPos(bEndPos, isNotFix));
			};

			//
			// 指標情報連動
			// for #708
			//

			/**
			 * 指標を追加する。
			 * @param  {string} code
			 * @param  {string} info
			 * @return {boolean}
			 */
			this.didAddIndicator = function(code, info) {
				return(_chartWrapper.didAddIndicator(code, info));
			};

			this.didChangeIndicatorSettingByTypeId = function(argTypeId, argSettings) {
				return(_chartWrapper.didChangeIndicatorSettingByTypeId(argTypeId, argSettings, true));
			};

			this.didChangeBasicChartType = function(argName) {
				return(_chartWrapper.didChangeBasicChartType(argName));
			}

			/**
			 * チャート上の指標リスト情報を取得する。
			 * added by choi sunwoo at 2017.05.08 for #708
			 * @return {string}
			 */
			this.didGetCurrentIndicatorInformationAll = function(isSave, toString) {
				var xResult = _chartWrapper.didGetCurrentIndicatorInformationAll(isSave);
				if(toString) {
					return(JSON.stringify(xResult));
				}

				return(xResult);
			};

			/**
			 * チャートへ指標リスト情報を反映する。
			 * added by choi sunwoo at 2017.06.23 for #928
			 * @return {string}
			 */
			this.didSetCurrentIndicatorInformationAll = function(argInfo) {
				var info = argInfo;

				var xResult = _chartWrapper.didSetCurrentIndicatorInformationAll(info);

				return(true);
			};

			/**
			 * チャート上の特定（タイプID）指標情報を取得する。
			 * added by choi sunwoo at 2017.05.10 for #708
			 * @return {string}
			 */
			this.didGetCurrentIndicatorInformationByTypeId = function(argTypeId) {
				var xResult = _chartWrapper.didGetCurrentIndicatorInformationByTypeId(argTypeId);

				return(JSON.stringify(xResult));
			};

			/**
			 * 特定指標（キー）を削除する。
			 * @param  {string} argTypeId		type id
			 * @return {boolean}
			 */
			this.didDeleteIndicatorByTypeId = function(argTypeId) {
				var result = _chartWrapper.didDeleteIndicatorByTypeId(argTypeId);

				return(result);
			};

			/**
			 * 全ての指標を削除する。
			 * @param  {string} argTypeId		type id
			 * @return {boolean}
			 */
			this.didDeleteAllIndicators = function() {
				var result = _chartWrapper.didDeleteAllIndicators();

				return(result);
			};

			/**
			 * 選択された指標を削除する。
			 * @return {boolean}
			 */
			this.didDeleteSelectedIndicator = function() {
				var result = _chartWrapper.didDeleteSelectedIndicator();

				return(result);
			}

			//
			//
			//
			this.didSetFocusingFlag = function(argFocusing, argRefresh) {
				return(_chartWrapper.didSetFocusingFlag(argFocusing, argRefresh));
			};
			//

			//
			// Reflect
			//

			this.didReflectCallForContextMenu = function(argData) {
				if(argData === undefined || argData == null) {
					return;
				}

				console.debug(argData);

				if(_reflectMethodForContextMenu !== undefined && _reflectMethodForContextMenu != null) {
					return(_reflectMethodForContextMenu(_self, argData));
				}
			};

			this.didReflectCallForCancelOrder = function(argData) {
				if(argData === undefined || argData == null) {
					return;
				}

				// console.debug("[WGC] :" + argData);

				if(_reflectMethodForCancelOrder !== undefined && _reflectMethodForCancelOrder != null) {
					return(_reflectMethodForCancelOrder(_self, argData));
				}
			};

			this.didReflectCallForExecutionOrder = function(argData) {
				if(argData === undefined || argData == null) {
					return;
				}

				// console.debug("[WGC] :" + argData);

				if(_reflectMethodForExecutionOrder !== undefined && _reflectMethodForExecutionOrder != null) {
					return(_reflectMethodForExecutionOrder(_self, argData));
				}
			};

			this.didReflectCallForFocusing = function() {
				_self.didSetFocusingFlag(true, false);

				if(_reflectMethodForFocusing !== undefined && _reflectMethodForFocusing != null) {
					return(_reflectMethodForFocusing(_self));
				}
			};

			/**
			 * チャートから指標が削除された場合、通知をする。
			 * @param  {[type]} argTypeId
			 * @return {[type]}
			 */
			this.didReflectCallForIndicatorIsDeleted = function(argInfo) {
				if(argInfo === undefined || argInfo == null) {
					return;
				}

				// console.debug("[WGC] reflect: delete indicator : " + JSON.stringify(argInfo));

				if(_reflectMethodForNofifyingEventAboutDeletedIndicator !== undefined && _reflectMethodForNofifyingEventAboutDeletedIndicator != null) {
					return(_reflectMethodForNofifyingEventAboutDeletedIndicator(_self, argInfo));
				}
			};

			//
			// Reflect to screenChart
			//
			this.didReflectCallForNewOrder = function(argOrder) {
				if(argOrder === undefined || argOrder == null) {
					return;
				}

				//console.debug("New order:" + JSON.stringify(argOrder));

				if(_reflectMethodForNewOrder !== undefined && _reflectMethodForNewOrder != null) {
					_reflectMethodForNewOrder(_self, argOrder);
				}
			};

			//
			// Reflect to screenChart
			// #1779
			this.didReflectCallForDetailView = function(argData) {
				console.debug(argData);

				if(_reflectMethodForDetailView !== undefined && _reflectMethodForDetailView != null) {
					_reflectMethodForDetailView(argData);
				}
			};

			/**
			 * チャートから注文・ポジションの内容が変更されたのをコールバック用のメソッドへ返事する。
			 * @param  {[type]} argOepValue
			 * @return {[type]}
			 */
			this.didReflectCallForOepValueIsChanged = function(argOepValue) {
				if(argOepValue === undefined || argOepValue == null) {
					return;
				}

				if(_reflectMethodForOep !== undefined && _reflectMethodForOep != null) {
					_reflectMethodForOep(_self, argOepValue);
				}
			};

			//
			// Reflect to screenChart
			//
			this.didReflectCallForDataViewInfo = function(argData) {
				if(argData === undefined || argData == null) {
					return;
				}

				// console.debug("\ndidReflectCallForDataViewInfo => ");
				// console.debug(argData);

				if(_reflectMethodForDataViewInfo !== undefined && _reflectMethodForDataViewInfo != null) {
					_reflectMethodForDataViewInfo(_self, argData);
				}
			};

			this.didReflectCallForError = function(argErrorCode) {
				if(_reflectMethodForError !== undefined && _reflectMethodForError != null) {
					_reflectMethodForError(_self, argErrorCode);
				}
			};

			this.didReflectCallForTrendline = function(argInfo) {
				if(_reflectMethodForTrendline !== undefined && _reflectMethodForTrendline != null) {
					_reflectMethodForTrendline(_self, argInfo);
				}
			};

			// #956
			this.didReflectCallForRequestNextData = function() {
				if(_reflectCallForRequestNextData !== undefined && _reflectCallForRequestNextData != null) {
					_reflectCallForRequestNextData(_self);
				}
			};
			//

			// #2061
			this.didReflectCallForDoubleClick = function(argInfo) {
				if(_reflectMethodForDoubleClick !== undefined && _reflectMethodForDoubleClick != null) {
					_reflectMethodForDoubleClick(_self, argInfo);
				}
			};
			//

			//
			// #717
			//

			/**
			 * [description]
			 * @param  {[type]} argLoadInfos
			 * @return {[type]}
			 */
			this.didSetLoadInfoForTheLineTools = function(argLoadInfos) {
				return(_chartWrapper.didSetLoadInfoForTheLineTools(argLoadInfos));
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didGetSaveInfoOfTheLineTools = function(toString) {
				var xResult = _chartWrapper.didGetSaveInfoOfTheLineTools();

				if(toString === true) {
					return(JSON.stringify(xResult));
				}
				else {
					return(xResult);
				}
			};

			//

			//
			// #748
			// Register reflect methods
			//
			this.didRegisterReflector = function(argType, argMethod) {
				if(argType === "oep") {
					_reflectMethodForOep = argMethod;
				}
				else if(argType === "contextMenu") {
					_reflectMethodForContextMenu = argMethod;
				}
				else if(argType === "newOrder") {
					_reflectMethodForNewOrder = argMethod;
				}
				else if(argType === "cancelOrder") {
					_reflectMethodForCancelOrder = argMethod;
				}
				else if(argType === "executionOrder") {
					_reflectMethodForExecutionOrder = argMethod;
				}
				else if(argType === "focus") {
					_reflectMethodForFocusing = argMethod;
				}
				else if(argType === "indicator") {
					_reflectMethodForNofifyingEventAboutDeletedIndicator = argMethod;
				}
				else if(argType === "dataview") {
					_reflectMethodForDataViewInfo = argMethod;
				}
				else if(argType === "error") {
					_reflectMethodForError = argMethod;
				}
				else if(argType === "trendline") {
					_reflectMethodForTrendline = argMethod;
				}
				else if(argType === "nextData") {
					_reflectCallForRequestNextData = argMethod;
				}
				else if(argType === "detailView") {	// #1779
					_reflectMethodForDetailView = argMethod;
				}
				// #2061
				else if(argType === "doubleClick") {
					_reflectMethodForDoubleClick = argMethod;
				}
				//
			};

			//
			this.didSetChartConfig = function(argConfig) {
				return(_chartWrapper.didSetChartConfig(argConfig));
			};

			//
			//
			//

			// #1252
			this.didUpdateBusinessDate = function(businessDate, bDraw, timeZoneInfo) { // #3414
				if(_self.method.m_chartWrapDataConverter && _self.method.m_chartWrapDataConverter.OnReceiveBusinessDate) {
					_self.method.m_chartWrapDataConverter.OnReceiveBusinessDate(businessDate, bDraw, timeZoneInfo); // #3414
				}
			};

			this.didRecvChartDataFromServer = function(receiveRawDatas, receiveInfo, timeZoneInfo) {
				if(_self.method.m_chartWrapDataConverter !== undefined && _self.method.m_chartWrapDataConverter != null) {
					var requestInfo 		= xUtils.dataConverter.didGetDefaultRequestInfo();

					requestInfo.receiveInfo = receiveInfo;
					requestInfo.strCode     = receiveInfo.code;
					requestInfo.strName     = receiveInfo.name;
					requestInfo.nTType		= receiveInfo.timeType;
					requestInfo.nTGap		= receiveInfo.timeGap;
					requestInfo.nPValCrt	= receiveInfo.pointValue;

					requestInfo.strDispTab	= receiveInfo.display;

					_self.method.m_chartWrapDataConverter.OnReceiveData(receiveRawDatas, requestInfo, timeZoneInfo);
				}
			};

			this.didRecvChartNextDataFromServer = function(receiveRawDatas) {
				if(_self.method.m_chartWrapDataConverter !== undefined && _self.method.m_chartWrapDataConverter != null) {
					_self.method.m_chartWrapDataConverter.OnReceiveNextData(receiveRawDatas);
				}
			};

			this.didRecvChartRealDataFromServer = function(receiveRawDatas) {
				if(_self.method.m_chartWrapDataConverter !== undefined && _self.method.m_chartWrapDataConverter != null) {
					_self.method.m_chartWrapDataConverter.OnReceiveRealDatas(receiveRawDatas);
				}
			};

			this.didClearDatas = function() {
				if(_self.method.m_chartWrapDataConverter !== undefined && _self.method.m_chartWrapDataConverter != null) {
					_self.method.m_chartWrapDataConverter.didClearDatas();
				}

				return(_chartWrapper.didClearDatas());
			};

			this.didClearOrderPositObjects = function(isOrder, isPosit) {
				return(_chartWrapper.didClearOrderPositObjects(isOrder, isPosit));
			}

			// #1181
			this.didRecvChartDataFromServerAt = function(receiveRawDatas, receiveInfo, timeZoneInfo, id) {
				if(_self.method.m_chartWrapDataConverter !== undefined && _self.method.m_chartWrapDataConverter != null) {
					var requestInfo 		= xUtils.dataConverter.didGetDefaultRequestInfo();

					requestInfo.receiveInfo = receiveInfo;
					requestInfo.strCode     = receiveInfo.code;
					requestInfo.strName     = receiveInfo.name;
					requestInfo.nTType		= receiveInfo.timeType;
					requestInfo.nTGap		= receiveInfo.timeGap;
					requestInfo.nPValCrt	= receiveInfo.pointValue;

					requestInfo.strDispTab	= receiveInfo.display;

					_self.method.m_chartWrapDataConverter.OnReceiveData(receiveRawDatas, requestInfo, timeZoneInfo, id);
				}
			};

			this.didRecvChartRealDataFromServerAt = function(receiveRawDatas, id) {
				if(_self.method.m_chartWrapDataConverter !== undefined && _self.method.m_chartWrapDataConverter != null) {
					_self.method.m_chartWrapDataConverter.OnReceiveRealDatas(receiveRawDatas, id);
				}
			};

			//
			// Trendline
			//
			//
			/**
			 *
			 */
			this.didAddLineStudy = function(trendLineCode) {
				try {
					return(_chartWrapper.didApplyTrendline(trendLineCode));
				}
				catch(e) {
					// console.debug("[WGC] :" + e);
				}
			};

			this.didApplyTrendline = function(trendLineCode, isSelect, color, text) {
				try {
					return(_chartWrapper.didApplyTrendline(trendLineCode, isSelect, color, text));
				}
				catch(e) {
					// console.debug("[WGC] :" + e);
				}
			};

			//

			//
			// Receive Order & Position data
			//

			this.didReceiveOepDataFromServer = function(receiveRawDatas, isOrder) {
				if(_self.method.m_chartWrapDataConverter !== undefined && _self.method.m_chartWrapDataConverter != null) {
					if(isOrder === true) {
						_self.method.m_chartWrapDataConverter.OnReceiveOrderData(receiveRawDatas);
					}
					else {
						_self.method.m_chartWrapDataConverter.OnReceivePositData(receiveRawDatas);
					}
				}
			};

			//

			//
			// Receive Execution & Alert data
			// #2032
			//

			this.didReceiveAlertDataFromServer = function(receiveRawDatas) {
				if(_self.method.m_chartWrapDataConverter !== undefined && _self.method.m_chartWrapDataConverter != null) {
					_self.method.m_chartWrapDataConverter.OnReceiveAlertData(receiveRawDatas);
				}
			};

			this.didReceiveExecutionDataFromServer = function(receiveRawDatas) {
				if(_self.method.m_chartWrapDataConverter !== undefined && _self.method.m_chartWrapDataConverter != null) {
					_self.method.m_chartWrapDataConverter.OnReceiveExecutionData(receiveRawDatas);
				}
			};

			this.didClearExecutionObjects = function() {
				return(_chartWrapper.didClearExecutionObjects());
			};
			this.didClearAlertObjects = function() {
				return(_chartWrapper.didClearAlertObjects());
			};
			//

			//

			// #935
			this.didApplyLocalSetting = function(key, isOn) {
				try {
					return(_chartWrapper.didApplyLocalSetting(key, isOn));
				}
				catch(e) {
					// console.debug("[WGC] :" + e);
				}
			};

			// #959
			this.didApplyChartSetting = function(argSettings) {
				try {
					return(_chartWrapper.didApplyChartSetting(argSettings));
				}
				catch(e) {
					// console.debug("[WGC] :" + e);
				}
			};

			// #959
			this.didApplyChartIndicatorPlotColorSetting = function(argSettings) {
				try {
					return(_chartWrapper.didApplyChartIndicatorPlotColorSetting(argSettings));
				}
				catch(e) {
					// console.debug("[WGC] :" + e);
				}
			};

			// #1796
			this.didUpdateTrendlinesStyle = function(color, text) {
				try {
					return(_chartWrapper.didUpdateTrendlinesStyle(color, text));
				}
				catch(e) {
					console.error(e);
				}
			};
			//

			//
			// MARK:debug(#1105)
			//
			this.didGetCurrentSymbolInfo = function() {
				try {
					return(_chartWrapper.didGetCurrentSymbolInfo());
				}
				catch(e) {
					// console.debug("[WGC] :" + e);
				}
			};

			//
			// MARK:debug(#1105)
			//
			this.didSetPointValueForCurrentSymbol = function(argPoint) {
				try {
					return(_chartWrapper.didSetPointValueForCurrentSymbol(argPoint));
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
					return(_chartWrapper.didSetZSBHandle(zsbHandle));
				}
				catch(e) {
					// console.debug("[WGC] :" + e);
				}
			};

			// [end] #1441

			// #1966
			this.didGetEnvInfo = function() {
				return(_chartWrapper.didGetEnvInfo());
			};

			//

			// #2007
			this.didUpdateAskBidData = function(hide, ask, bid, validFlag) {
				try {
					return(_chartWrapper.didUpdateAskBidData(hide, ask, bid, validFlag));
				}
				catch(e) {
					console.error(e);
				}
			};
			//

		};

   	 	return(_exports);
	};

	//console.debug("[MODUEL] Loading => screenChart");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["screenChart"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["screen"],
				global["WGC_CHART"]["mouseCapture"]
			);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
			loadModule(
				require("./chartUtil"),
				require("./screen"),
				require("./mouseCapture")
			);
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/screenChart", ['ngc/chartUtil', 'ngc/screen', 'ngc/mouseCapture'],
			function(xUtils, parentClass, mouseCapture) {
				return loadModule(xUtils, parentClass, mouseCapture);
			});
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["screenChart"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["screen"],
				global["WGC_CHART"]["mouseCapture"]
			);
    }

	//console.debug("[MODUEL] Loaded => screenChart");
 })(this);
