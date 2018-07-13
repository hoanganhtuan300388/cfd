(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc, doPriceBaseClass, doExtraFactory) {
	    "use strict";

	    var exports = function() {
	        //
	        // private
	        //
	        var _self = this;

	        this.prototype = new doPriceBaseClass();
			doPriceBaseClass.apply(this, arguments);

			this.m_xTooltipHigh;
            this.m_xTooltipLow;

			this.m_arrOrders = [];
			this.m_arrPosits = [];

			this.m_arrAlerts = [];
			this.m_arrExecutions = [];

			this.m_xAskBid = {
				validFlag : false,
				ask : undefined,
				bid : undefined
			};

			var _DeselectAllOrders = function() {
				var nCount = _self.m_arrOrders.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xDoo = _self.m_arrOrders[ii];
					if(xDoo && xDoo.DeselectAllObject) {
						xDoo.DeselectAllObject();
					}
				}
			};

			var _DeselectAllPosits = function() {
				var nCount = _self.m_arrPosits.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xDop = _self.m_arrPosits[ii];
					if(xDop && xDop.DeselectAllObject) {
						xDop.DeselectAllObject();
					}
				}
			};

			var _DeselectAllAlerts = function() {
				var nCount = _self.m_arrAlerts.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xDoo = _self.m_arrAlerts[ii];
					if(xDoo && xDoo.DeselectAllObject) {
						xDoo.DeselectAllObject();
					}
				}
			};

			var _DeselectAllExecutions = function() {
				var nCount = _self.m_arrExecutions.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xDop = _self.m_arrExecutions[ii];
					if(xDop && xDop.DeselectAllObject) {
						xDop.DeselectAllObject();
					}
				}
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.DeslectAllRest = function() {
				_DeselectAllOrders();
				_DeselectAllPosits();
				_DeselectAllAlerts();
				_DeselectAllExecutions();
			};

			/**
			 * get data size
			 * @returns number
			 */
			this.didGetDataSize = function() {
	            return(_self.m_arrData.length);
	        };

			this.didGetMinMaxAtRange = function(range) {
				if(range === undefined || range == null) {
					return;
				}

				// Total
				var	nTDSize		= _self.didGetDataSize();
				var nStartDIdx  = range.location;
				var nLoopEnd	= ((nStartDIdx + range.length < nTDSize) ? (nStartDIdx + range.length) : nTDSize);

				var result = {
					nLIdx : nStartDIdx,
					nHIdx : nStartDIdx,
					dHigh : -1 * xUtils.constants.default.DEFAULT_WRONG_VALUE,
					dLow  : 1  * xUtils.constants.default.DEFAULT_WRONG_VALUE
				};

				for(var __dataIndex = nStartDIdx; __dataIndex < nLoopEnd; __dataIndex++) {
					var __stPrice   = _self.didGetDataAt(__dataIndex, false);

					if (__stPrice === undefined || __stPrice === null || parseInt(__stPrice.close) === 0) {
						continue;
					}

					var __close = xUtils.didConvertToPrice(__stPrice.close);
					var __open  = xUtils.didConvertToPrice(__stPrice.open);
					var __high  = xUtils.didConvertToPrice(__stPrice.high);
					var __low   = xUtils.didConvertToPrice(__stPrice.low);

					// Max
					if(result.dHigh < __high) {
						result.dHigh = __high;
						result.nHIdx = __dataIndex;
					}

					// Min
					if(result.dLow > __low) {
						result.dLow = __low;
						result.nLIdx = __dataIndex;
					}
				}

				return(result);
			};

			/**
	         * [didDrawExtraObjects description]
	         * @return {[type]} [description]
	         */
	        this.didDrawExtraObjects = function() {
				_self.didDrawAskBid(); // #2007

			    _self.didDrawTrendLines();
				_self.didDrawAlertExecution();
			    _self.didDrawOrderPosit();
				_self.didDrawHighLowObject();
	        };

			// #2007
			this.didUpdateAskBidData = function(hide, ask, bid, validFlag) {
				try {
					if(hide !== undefined && hide != null) {
						var xEnv = _self.didGetEnvInfo();
						xEnv.HideAskBid = hide;
					}
					else {
						_self.m_xAskBid = {};
						_self.m_xAskBid.validFlag = validFlag;
						_self.m_xAskBid.ask = ask;
						_self.m_xAskBid.bid = bid;
					}

					return(true);

				}
				catch(e) {
					console.error(e);
				}
			};
			//

			// #2007
			this.didDrawAskBid = function() {
				if(!_self.m_xAskBid) {
					return;
				}

				var xEnv	  = _self.didGetEnvInfo();
				if(xEnv.HideAskBid === true) {
					return;
				}

				var rectArea  = _self.m_drawWrapper.GetChartFrameAreaRect();
				// set to draw parameter
				var context   = _self.m_context;
	            var font      = xEnv.Font;

				var drawTextParam = {
					context : context,
					pt : {
						x : 0,
						y : 0
					},
					text : "",
					font : font,
					fillStyle : "",
					useMultiline : false,
					useBox : false
				};

				var xAxisY = _self.didGetAxisY();
				var verpos = _self.didGetPointValue();
				var strAsk = "";
				var strBid = "";

				var nYPosAsk = 0;
				var nYPosBid = 0;

				var rectAsk = {};
				if(_self.m_xAskBid.ask) {
					strAsk = xUtils.number.didGetPointedValue(_self.m_xAskBid.ask, verpos);
					drawTextParam.text = strAsk;
					gxDc.DrawText(drawTextParam, true, rectAsk);

					nYPosAsk = xAxisY.GetYPos(_self.m_xAskBid.ask);
				}

				var rectBid = {};
				if(_self.m_xAskBid.bid) {
					strBid = xUtils.number.didGetPointedValue(_self.m_xAskBid.bid, verpos);
					drawTextParam.text = strAsk;
					gxDc.DrawText(drawTextParam, true, rectBid);

					nYPosBid = xAxisY.GetYPos(_self.m_xAskBid.bid);
				}

				var width = rectAsk.width ? rectAsk.width : 0;
				width = rectBid.width ? Math.max(rectBid.width, width) : width;

				var drawTriangleParam = {
					context:context,
					pt1:{x:0, y:0},
					pt2:{x:0, y:0},
					pt3:{x:0, y:0},
					lineWidth:1,
					lineColor:"",
					fillColor:""
				};

				// #2788
				var xAxisX = _self.didGetAxisX();
				var __dataIndex = Math.max(0, _self.didGetDataSize());
				var xBarInfos= {};
				var __nLocalXPos = xAxisX.GetIndex2Pixel(__dataIndex, xBarInfos);
				var rigthAnchorPos = Math.round(width + xEnv.PriceStyleConfig.AskBid.shapeGap + xEnv.PriceStyleConfig.AskBid.shapeHorzSize + xBarInfos.pos);
				// [end] #2788
				var shapeHorzSize = xEnv.PriceStyleConfig.AskBid.shapeHorzSize; // #3148
				var shapeVertSize = Math.round(xEnv.PriceStyleConfig.AskBid.shapeVertSize / 2); // #3148

				// Ask
				if(_self.m_xAskBid.ask) {
					drawTriangleParam.pt2.x =
					drawTriangleParam.pt3.x = rigthAnchorPos - width - xEnv.PriceStyleConfig.AskBid.shapeGap;
					drawTriangleParam.pt1.x = drawTriangleParam.pt2.x - shapeHorzSize;
					drawTriangleParam.pt1.y = nYPosAsk;
					drawTriangleParam.pt2.y = drawTriangleParam.pt1.y - shapeVertSize;
					drawTriangleParam.pt3.y = drawTriangleParam.pt1.y + shapeVertSize;

					drawTriangleParam.lineColor = xEnv.PriceStyleConfig.AskBid.askStrokeColor; // #3148
					drawTriangleParam.fillColor = _self.m_xAskBid.validFlag === true ? xEnv.PriceStyleConfig.AskBid.askColor : xEnv.PriceStyleConfig.AskBid.invalidColor;

					gxDc.Triangle(drawTriangleParam);

					//
					drawTextParam.text = strAsk;
					drawTextParam.pt.x = drawTriangleParam.pt2.x + xEnv.PriceStyleConfig.AskBid.textGap; // #3347
					drawTextParam.pt.y = nYPosAsk - 1 - shapeVertSize; // #2007
					drawTextParam.fillStyle = drawTriangleParam.fillColor;
					gxDc.TextOut(drawTextParam);
				}

				// Bid
				if(_self.m_xAskBid.bid) {
					drawTriangleParam.pt2.x =
					drawTriangleParam.pt3.x = rigthAnchorPos - width - xEnv.PriceStyleConfig.AskBid.shapeGap;
					drawTriangleParam.pt1.x = drawTriangleParam.pt2.x - shapeHorzSize;
					drawTriangleParam.pt1.y = nYPosBid;
					drawTriangleParam.pt2.y = drawTriangleParam.pt1.y - shapeVertSize;
					drawTriangleParam.pt3.y = drawTriangleParam.pt1.y + shapeVertSize;

					drawTriangleParam.lineColor = xEnv.PriceStyleConfig.AskBid.bidStrokeColor; // #3148
					drawTriangleParam.fillColor = _self.m_xAskBid.validFlag === true ? xEnv.PriceStyleConfig.AskBid.bidColor : xEnv.PriceStyleConfig.AskBid.invalidColor;

					gxDc.Triangle(drawTriangleParam);

					//
					drawTextParam.text = strBid;
					drawTextParam.pt.x = drawTriangleParam.pt2.x + xEnv.PriceStyleConfig.AskBid.textGap; // #3347
					drawTextParam.pt.y = nYPosBid - 1 + shapeVertSize; // #2007
					drawTextParam.fillStyle = drawTriangleParam.fillColor;
					gxDc.TextOut(drawTextParam);
				}
			};

	        /**
			 * draw trend lines
			 */
			this.didDrawTrendLines = function() {
				var xScaleUnit = _self.m_xScaleInfo.current;

				var nLSCount = _self.m_arrTrendlineObjlist.length;
				for (var ii = 0; ii < nLSCount; ii++) {
					var xDoLs = _self.m_arrTrendlineObjlist[ii];
					xDoLs.DrawObj(xScaleUnit.minMaxScreen.maxValue, xScaleUnit.minMaxScreen.minValue);
				}
			};

			/**
			 * draw self
			 */
			this.didDrawSelf = function(posval) {
				var __nTType = _self.m_symbolInfo.nTType;
				var __nTTGap = _self.m_symbolInfo.nTGap;
				var __xEnv   = _self.didGetEnvInfo();

				if (__xEnv.System.TickJustLine === true && (__nTType == xUtils.constants.timeType.tick && __nTTGap < 2)) {
					_self.DrawLineChart(posval);
				}
				else {
					switch (__xEnv.ChartType) {
						case xUtils.constants.chartTypeCode.candle :
							_self.DrawCandleChart(posval);
							break;
						case xUtils.constants.chartTypeCode.transCandle :
							_self.DrawTransCandleChart(posval);
							break;
						case xUtils.constants.chartTypeCode.bar_ohlc :
							_self.DrawBarOHLCChart(posval);
							break;
						case xUtils.constants.chartTypeCode.bar_hlc :
							_self.DrawBarHLCChart(posval);
							break;
						case xUtils.constants.chartTypeCode.line :
							_self.DrawLineChart(posval);
							break;
						case xUtils.constants.chartTypeCode.equiVolume :
							_self.DrawEquiVolumeChart(posval);
							break;
						case xUtils.constants.chartTypeCode.longVolume :
							_self.DrawLongVolumeChart(posval);
							break;
						case xUtils.constants.chartTypeCode.averageCandle :
							// TODO: #1054
							_self.DrawAverageCandleChart(posval);
							break;
						case xUtils.constants.chartTypeCode.compareChart :
							// #1181
							_self.DrawCompareChart(posval);
							break;
						default :
							_self.DrawCandleChart(posval);
							break;
					}
				}
			};

			this.didDrawDataView = function(argDtp, argDataIndex) {
				return(argDtp);
			};

			this.didDrawDataViewForSubItems = function(argDtp, argDataIndex) {
				return(argDtp);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedData = function(symbolInfo, receivedDatas) {
				// TODO: check if code is changed

				return(true);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas	{datas: datas, times: times}
			 */
			this.didReceiveData = function(symbolInfo, receivedDatas) {
				// TODO: deep copy
				_self.m_symbolInfo = xUtils.didClone(symbolInfo);
				_self.m_strChartName = _self.m_symbolInfo.strName;
				_self.m_point = _self.m_symbolInfo.nPValCrt;

				if(_self.m_symbolInfo.strDispTab && _self.m_symbolInfo.strDispTab != "") {
					_self.m_strChartName = _self.m_symbolInfo.strDispTab;
				}

				//
				_self.m_arrData = receivedDatas.datas;
				_self.m_arrTimeData = receivedDatas.times;
				_self.m_arrTickNo = receivedDatas.tnos;

				//
				// #1054
				//
				xUtils.dataConverter.didCalcAverageCandle(_self.m_arrData, true);

				// #1516
				_self.didProcRestAfterReceivingData();

				//
				return(true);
			};

			//

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
				if(receivedData === undefined || receivedData == null) {
					return(false);
				}

				var bAdd    = receivedData.isAdd;
				var stPrice = receivedData.stPrice;

				// そんなことはないと思うが万が一、データがなく、アップデートで来た場合、強制的に追加にする。
				var nDataCount = _self.m_arrData.length;
				if(nDataCount < 1) {
					nDataCount = 0;
					bAdd = true;
				}

				var nLastIndex = nDataCount - 1;

				if(bAdd === true) {
					var __priceDatas = receivedData.priceDatas;

					// 空で作られたデータがあれば一緒に追加しておく。
					if(__priceDatas !== undefined && __priceDatas != null && __priceDatas.length > 0) {
						// data, time, tickno
						xUtils.didAppendEmptyDatas(_self.m_arrData, _self.m_arrTimeData, _self.m_arrTickNo, __priceDatas);
					}

					// 追加であるため、始値、高値、安値を終値にする。
					var __stPrice = xUtils.didClone(stPrice);
					__stPrice.open =
					__stPrice.high =
					__stPrice.low  = __stPrice.close;

					//
					_self.m_arrData.push(__stPrice);

					// #1516
					var __strTimeVal = xUtils.dateTime.convertNumberDatetimeToTimelineData(__stPrice.ymd, __stPrice.hms);
					// var __date = xUtils.dateTime.convertNumberToDateString(__stPrice.ymd);
					// var __time = xUtils.dateTime.convertNumberToTimeString(__stPrice.hms);
					// var __strTimeVal = __date + __time;
					//

					_self.m_arrTimeData.push(__strTimeVal);

					var	__tno  = 0;
					if(_self.m_symbolInfo.nTType === xUtils.constants.timeType.tick) {
						if(nLastIndex > 0) {
							var preIdx = nLastIndex - 1;
							var preTimeVal = _self.m_arrTimeData[preIdx];
							var preTickNo  = _self.m_arrTickNo[preIdx];

							if(parseInt(preTimeVal) === parseInt(__strTimeVal)) {
								__tno = preTickNo + 1;
							}
						}
					}

					_self.m_arrTickNo.push(__tno);
				}
				else {
					// #888
					var __stPrice = xUtils.didClone(stPrice);

					var stLastData = _self.m_arrData[nDataCount - 1];
					_self.m_arrData[nDataCount - 1] = xUtils.dataConverter.didMergePriceDataWithRealData(stLastData, __stPrice);
					/*
					var stLastData = _self.m_arrData[nDataCount - 1];
					_self.m_arrData[nDataCount - 1] = xUtils.dataConverter.didMergePriceDataWithRealData(stLastData, stPrice);
					*/
				}

				//
				// #1054
				//
				xUtils.dataConverter.didCalcAverageCandle(_self.m_arrData, false);

				//
				return(true);
			};

			/**
			 * @param[in] lsName	name
		     * @param[in] posval	{XPos:0, YPos:0}
		     * @return object
			 */
			this.CreateTrendlineObj = function(lsName, posval, trendLineInfo, skipStore) {
				return(_self.didCreateTrendlineObj(lsName, posval, trendLineInfo, skipStore));
			};

			//
			// order and position and so on
			//

			var _didClearOepaObjects = function(argObjects) {
				if(argObjects === undefined || argObjects == null) {
					return;
				}

				var nObjectCount = argObjects.length;
				for(var ii = nObjectCount - 1; ii >= 0; ii--) {
					argObjects[ii].didDestroy();
					delete argObjects[ii]
				}

				argObjects = [];

				return(true);
			};

			var _didClearOrderPositObjects = function(argObjects) {
				return(_didClearOepaObjects(argObjects));
			};

			var _didReceiveOrderPositData = function(isOrderOrPosit, receiveData) {
				if(receiveData === undefined || receiveData == null) {
					return;
				}

				var doOPObjects = isOrderOrPosit === true ? _self.m_arrOrders : _self.m_arrPosits;
				var nOPCount = doOPObjects.length;
				for(var ii = 0; ii < nOPCount; ii++) {
					var doOPObj = doOPObjects[ii];
					if(doOPObj !== undefined && doOPObj != null) {
						if(doOPObj.didUpdateData(receiveData) === true) {
							return(true);
						}
					}
				}

				return(_didAddOrderPositData(isOrderOrPosit, receiveData));
			};

			var _didAddOrderPositData = function(isOrderOrPosit, receiveData) {
				if(receiveData === undefined || receiveData == null) {
					return;
				}

				var bOrderOrPosit = isOrderOrPosit;
				var doOPObject = doExtraFactory.didCreateOrderPositObject(bOrderOrPosit, _self.m_chartFrame, _self.m_drawWrapper, _self, receiveData);

				if(doOPObject !== undefined && doOPObject != null) {
					if(bOrderOrPosit === true) {
						_self.m_arrOrders.push(doOPObject);
					}
					else {
						_self.m_arrPosits.push(doOPObject);
					}

					return(true);
				}
			};

			var _didDrawOrderPositObjects = function(argObjects) {
				if(argObjects === undefined || argObjects == null) {
					return;
				}

				var xScaleUnit = _self.m_xScaleInfo.current;

				var nObjectCount = argObjects.length;
				for(var ii = 0; ii < nObjectCount; ii++) {
					argObjects[ii].DrawObj(xScaleUnit.minMaxScreen.maxValue, xScaleUnit.minMaxScreen.minValue);
				}
			};

			this.didClearOrderPositObjects = function(isOrder, isPosit) {
				if(isOrder === true) {
					_didClearOrderPositObjects(_self.m_arrOrders);
					_self.m_arrOrders = [];
				}

				if(isPosit === true) {
					_didClearOrderPositObjects(_self.m_arrPosits);
					_self.m_arrPosits = [];
				}

				return(true);
	        };

			/**
			 * draw order and position objects
			 */
			this.didDrawOrderPosit = function() {
				_didDrawOrderPositObjects(_self.m_arrOrders);

				// #1298
				var doPosits = _self.didGetDoPositions();
				_didDrawOrderPositObjects(doPosits);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedOrderPositData = function(isOrderOrPosit, receivedDatas) {
				return(true);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveOrderPositData = function(isOrderOrPosit, receivedDatas) {
				if(receivedDatas === undefined || receivedDatas == null) {
					return;
				}

				var nRecvLen = receivedDatas.length;
				for(var ii = 0; ii < nRecvLen; ii++) {
					_didReceiveOrderPositData(isOrderOrPosit, receivedDatas[ii]);
				}

				return(true);
			};

			// #717

			/**
			 * [description]
			 * @param  {[type]} argLoadInfos
			 * @return {[type]}
			 */
			this.didSetLoadInfoForTheLineTools = function(argLoadInfos) {
				// clear all line-tools
				// no save
				_self.didClearLineStudyObject();

				if(argLoadInfos === undefined || argLoadInfos == null) {
					return(true);
				}

				var xLoadInfos;
				if(typeof argLoadInfos === "string") {
					xLoadInfos = JSON.parse(argLoadInfos);
				}
				else {
					xLoadInfos = argLoadInfos;
				}

				var xLoadInfo;
				var nCount = 0;
				if(xLoadInfos.length && xLoadInfos.length > 0) {
					xLoadInfo = xLoadInfos[0];
					nCount = xLoadInfos.length;
				}
				else {
					xLoadInfo = xLoadInfos;
				}

				if(xLoadInfo === undefined || xLoadInfo == null) {
					return(true);
				}

				_self.didCreateTrendlineObj(xLoadInfo.c, null, xLoadInfo);

				for(var ii = 1; ii < nCount; ii++) {
					xLoadInfo = xLoadInfos[ii];
					_self.didCreateTrendlineObj(xLoadInfo.c, null, xLoadInfo);
				}

				return(true);
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.didGetSaveInfoOfTheLineTools = function() {
				var nCount = _self.m_arrTrendlineObjlist.length;
				var xSaveInfos = {
					symbol : _self.m_symbolInfo.strCode,
					lss : []
				};
				for(var ii = 0; ii < nCount; ii++) {
					var xDoLs = _self.m_arrTrendlineObjlist[ii];
					try {
						if(xDoLs && xDoLs.didGetObjectSaveInfo) {
							xSaveInfos.lss.push(xDoLs.didGetObjectSaveInfo());
						}
					}
					catch(e) {
						console.error(e);
					}
				}

				return(xSaveInfos);
			};
			//

			// #758

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
				var xEnv      = _self.didGetEnvInfo();
				// #2277
				if(xEnv.System.NoDisplayAtOutOfArea) {
					if(argLocalXPos < 0) {
						return;
					}
				}
				//

				var xViewData = {
					isPrice : true,
					display : _self.didGetDisplayTitle(),
					datas : []
				};

				var dataIndex = _self.GetXIndex(argLocalXPos);

				var stPrice = _self.didGetDataAt(dataIndex, false);// _self.m_drawWrapper.GetBaseDataAtPos(argDataIndex, false);

				var isAvg   = xEnv.ChartType === xUtils.constants.chartTypeCode.averageCandle ? true : false;

	            var isValid = true;
				if ((stPrice === undefined) || (stPrice === null) || (stPrice.close === 0)) {
	                isValid = false;
	            }
				else if(isAvg === true && (!stPrice.avgClose || !stPrice.avgOpen)) {
					isValid = false;
				}

	            // draw data
				var xViewItem = {
					display : "",
					value : xUtils.constants.text.dataView.invalid
				};
				var xData;

				var target;

				var xDatetime = _self.m_drawWrapper.didGetTimedataAt(dataIndex, false, true); // #2303

				var __nTType = _self.m_symbolInfo.nTType;

				if(isValid === true) {
					// #2303
					if(xDatetime) {
						xViewData.dateTime = xDatetime.dateTime;
					}
					//

					// #2303
					if(__nTType == xUtils.constants.timeType.tick) {
						xData = xUtils.didClone(xViewItem);
						target = 'close';
						xData.display = "TICK"; // #2323
						xData.value   = xUtils.didGetPriceDisplay(target , stPrice, _self.m_point, true);
						xViewData.datas.push(xData);
					}
					else {
						xData = xUtils.didClone(xViewItem);
						if(isAvg === true) {
							target = 'avgOpen';
						}
						else {
							target = 'open';
						}
						xData.display = xUtils.didGetDataViewItemTitle(target);
						xData.value   = xUtils.didGetPriceDisplay(target , stPrice, _self.m_point, true);
						xViewData.datas.push(xData);

						xData = xUtils.didClone(xViewItem);
						target = 'high';
						xData.display = xUtils.didGetDataViewItemTitle(target);
						xData.value   = xUtils.didGetPriceDisplay(target , stPrice, _self.m_point, true);
						xViewData.datas.push(xData);

						xData = xUtils.didClone(xViewItem);
						target = 'low';
						xData.display = xUtils.didGetDataViewItemTitle(target);
						xData.value   = xUtils.didGetPriceDisplay(target , stPrice, _self.m_point, true);
						xViewData.datas.push(xData);

						xData = xUtils.didClone(xViewItem);
						if(isAvg === true) {
							target = 'avgClose';
						}
						else {
							target = 'close';
						}
						xData.display = xUtils.didGetDataViewItemTitle(target);
						xData.value   = xUtils.didGetPriceDisplay(target , stPrice, _self.m_point, true);
						xViewData.datas.push(xData);
					}
					//
				}
				else {
					// #2277
					if(xEnv.System.DisplayEmptyInDetailViewWhenInvalid) {
						if(xDatetime) {
							xViewData.dateTime = xDatetime.dateTime;
						}
					}
					//

					// #2303
					if(__nTType == xUtils.constants.timeType.tick) {
						xData = xUtils.didClone(xViewItem);
						target = 'close';
						xData.display = "TICK"; // #2323
						xViewData.datas.push(xData);
					}
					else {
						xData = xUtils.didClone(xViewItem);
						target = 'open';
						xData.display = xUtils.didGetDataViewItemTitle(target);
						xViewData.datas.push(xData);

						xData = xUtils.didClone(xViewItem);
						target = 'high';
						xData.display = xUtils.didGetDataViewItemTitle(target);
						xViewData.datas.push(xData);

						xData = xUtils.didClone(xViewItem);
						target = 'low';
						xData.display = xUtils.didGetDataViewItemTitle(target);
						xViewData.datas.push(xData);

						xData = xUtils.didClone(xViewItem);
						target = 'close';
						xData.display = xUtils.didGetDataViewItemTitle(target);
						xViewData.datas.push(xData);
					}
					// #2303
				}

				return(xViewData);
			};

			this.DrawLastValue = function(argDrawParam, dataIndex) {
				try {

					if(argDrawParam === undefined || argDrawParam == null) {
						return;
					}

					// #1259
					_self.didDrawLastValueForOep(argDrawParam, dataIndex);
					//
				}
				catch(e) {

				}
			};

			// #1259
			this.didDrawLastValueForOep = function(argDrawParam, dataIndex) {
				try {

					if(argDrawParam === undefined || argDrawParam == null) {
						return;
					}

					var xEnv = _self.didGetEnvInfo();

					argDrawParam.axis = _self.didGetAxisY();

					// #2459
					(function(argDrawParam, dataIndex){
						var nCount = _self.m_arrAlerts.length;
						for(var ii = 0; ii < nCount; ii++) {
							var xDoa = _self.m_arrAlerts[ii];
							if(xDoa && xDoa.didDrawLastValue) {
								xDoa.didDrawLastValue(argDrawParam, dataIndex);
							}
						}
					})(argDrawParam, dataIndex);
					//

					(function(argDrawParam, dataIndex){
						var nCount = _self.m_arrOrders.length;
						for(var ii = 0; ii < nCount; ii++) {
							var xDoo = _self.m_arrOrders[ii];
							if(xDoo && xDoo.didDrawLastValue) {
								xDoo.didDrawLastValue(argDrawParam, dataIndex);
							}
						}
					})(argDrawParam, dataIndex);

					(function(argDrawParam, dataIndex){
						var nCount = _self.m_arrPosits.length;
						for(var ii = 0; ii < nCount; ii++) {
							var xDop = _self.m_arrPosits[ii];
							if(xDop && xDop.didDrawLastValue) {
								xDop.didDrawLastValue(argDrawParam, dataIndex);
							}
						}
					})(argDrawParam, dataIndex);
				}
				catch(e) {

				}
			};

			//
			// #1441
			this.didDrawPriceOnFullMode = function(pstDp) {
				var __nLocalXPos1, __nLocalXPos2, __nLocalYPos1, __nLocalYPos2;
				var __stPrice1, stPrice2;

				var stPrice;

				var ncCnt     = _self.didGetDataSize();
				if(ncCnt < 1) {
					console.debug("[D] LDPF_DrawPriceOnFullMode : no data\n");
					return;
				}

				var xEnv   = _self.didGetEnvInfo();

				var	rcDraw = pstDp.rcDraw;
				var margin = pstDp.margin;

				xUtils.shapes.InflateRect(rcDraw, 0, -3);

				var nWidth  = rcDraw.width;
				var nHeight = rcDraw.height;

				var	dMin	=  1 * xUtils.constants.default.DEFAULT_WRONG_VALUE;
				var	dMax	= -1 * xUtils.constants.default.DEFAULT_WRONG_VALUE;
				for(var ii = 0; ii < ncCnt; ii++) {
					var __stPrice = _self.didGetDataAt(ii, false);
					dMin	= Math.min(dMin, __stPrice.close);
					dMax	= Math.max(dMax, __stPrice.close);
				}

				var	dDiff	= (dMax - dMin);
				var	pY		= null;
				if(dDiff < 0) {
					console.debug("[D] LDPF_DrawPriceOnFullMode : wrong min(" + dMin + ") & max(" + dMax + ")\n");
					return;
				}
				else if(dDiff == 0) {
					pY	= Math.round(rcDraw.y + rcDraw.height / 2);
				}

				var	nTotalSize	= _self.m_drawWrapper.m_xScrollInfo.range.length; // #2801

				var	dRatioX	= ((nWidth)) / (nTotalSize);
				var	dRatioY	= ((nHeight) / dDiff);

				var __nScrSIdx = 0;
				var __nScrSize = nTotalSize;

				//
				// #505
				//
				var __nLoopStart = 0;
				var __nLoopEnd   =__nScrSize;
				var	lineWidth	 = xEnv.PriceStyleConfig.Line.strokeWeight;
				var lineColor	 = xEnv.PriceStyleConfig.Line.strokeColor;
				var fillColor	 = lineColor;
				var __context = pstDp.context;

				__context.translate(0.5, 0.5);

				// #1827
				var __drawLinesParam = {
		    		context : __context,
		    		pts : [],
		    		lineWidth : lineWidth,
		    		lineColor : lineColor
		    	};

				var __drawPolygonParam = {
					context:__context,
					pt1s:[],
					pt2s:[],
					lineWidth:lineWidth,
					lineColor:lineColor,
					fillColor:fillColor,
					fillAlpha:xEnv.TrendlineFillAlpha
				};
				//

				var __tempHeight = rcDraw.height + 10;

				if(xEnv.ZSBConfig) {
					__drawPolygonParam.grad = {
						colors : [xEnv.ZSBConfig.BgColor2, xEnv.ZSBConfig.BgColor1],
						pt1 : {x:0, y:0},
						pt2 : {x:0, y:__tempHeight}
					};

					__drawLinesParam.lineColor = xEnv.ZSBConfig.LineColor;
				}

				var arrPoints = [];
				var ptStart;
				var ptEnd;
				var bFirst = true;
				for(var __nLocalIdx = __nLoopStart; __nLocalIdx < __nLoopEnd; __nLocalIdx++) {
					var __dataIndex = _self.m_drawWrapper.didConvertLocalIndexToDataIndex(__nLocalIdx, true);
					var __stPrice1 = _self.didGetDataAt(__dataIndex, false);
					if(xUtils.validator.isValidPrice(__stPrice1) !== true) {
						continue;
					}

					// // #1271
					// if(xUtils.validator.isFixedPrice(__stPrice, xEnv) === true) {
					// 	continue;
					// }
					// //

					__nLocalXPos1 = Math.round(rcDraw.x + dRatioX * (__nLocalIdx));
					if(pY !== undefined && pY != null) {
						__nLocalYPos1 = pY;
					}
					else {
						__nLocalYPos1 = Math.round(rcDraw.y + rcDraw.height - (dRatioY * (__stPrice1.close - dMin)));
					}

					// #1827
					var pt = {x:__nLocalXPos1, y:__nLocalYPos1};
					if(bFirst) {
						ptStart = xUtils.didClone(pt);
						bFirst = false;
					}

					ptEnd = xUtils.didClone(pt);

					__drawPolygonParam.pt1s.push(pt);
					__drawLinesParam.pts.push(pt);
					//
				}

				// #1827
				if(ptStart && ptEnd) {
					ptEnd.y   =
					ptStart.y = rcDraw.y + __tempHeight;

					__drawPolygonParam.pt2s.push(ptStart);
					__drawPolygonParam.pt2s.push(ptEnd);

					gxDc.PolygonGradient(__drawPolygonParam);
				}

				gxDc.Lines(__drawLinesParam);
				//

				__context.translate(-0.5, -0.5);
			};

			// [end] #1441
			this.didPrintDebugData = function(isAvg) {
				var pointValue = _self.didGetPointValue();
				var powValue = Math.pow(pointValue);
				var nCount = _self.m_arrData.length;
				for(var ii = 0; ii < nCount; ii++) {
					var stPrice = _self.m_arrData[ii];
					var strPrint = xUtils.number.formatAsfillSize(ii, " ", 5) + ":	";

					if(isAvg) {
						if(stPrice.avgOpen) {
							strPrint += "avg.o(" + xUtils.didGetPriceDisplay('avgOpen' , stPrice, pointValue) + "),";
						}
						else {
							strPrint += "avg.o(null),";
						}
						strPrint += "h(" + xUtils.didGetPriceDisplay('high' , stPrice, pointValue) + "),";
						strPrint += "l(" + xUtils.didGetPriceDisplay('low'  , stPrice, pointValue) + "),";
						if(stPrice.avgClose) {
							strPrint += "avg.c(" + xUtils.didGetPriceDisplay('avgClose', stPrice, pointValue) + "),";
						}
						else {
							strPrint += "avg.c(null),";
						}
					}
					else {
						strPrint += "o(" + xUtils.didGetPriceDisplay('open' , stPrice, pointValue) + "),";
						strPrint += "h(" + xUtils.didGetPriceDisplay('high' , stPrice, pointValue) + "),";
						strPrint += "l(" + xUtils.didGetPriceDisplay('low'  , stPrice, pointValue) + "),";
						strPrint += "c(" + xUtils.didGetPriceDisplay('close', stPrice, pointValue) + "),";
					}

					xUtils.debug.log(strPrint);
				}
			};

			//
			//
			//

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
			var _didInitHighLowTooltipUnit = function() {
				var xEnv = _self.didGetEnvInfo();
				_self.didClearSubObjects();

				var lsId = xUtils.constants.trendLineCodes.tooltipText;
				var posval = {XPos:100, YPos:100};
				if(!_self.m_xTooltipHigh) {
					_self.m_xTooltipHigh = _self.CreateTrendlineObj(lsId, posval, null, true);
					_self.m_xTooltipHigh.didSetState({hide:true, nonTouch:true});
					_self.m_xTooltipHigh.didApplySimpleAttribute(undefined, "High\nText", true, xEnv.TooltipLabelStyle.background, xEnv.TooltipLabelStyle.lineColor, xEnv.TooltipLabelStyle.fontColor);
				}

				if(!_self.m_xTooltipLow) {
					_self.m_xTooltipLow  = _self.CreateTrendlineObj(lsId, posval, null, true);
					_self.m_xTooltipLow.didSetState({hide:true, nonTouch:true});
					_self.m_xTooltipLow.didApplySimpleAttribute(undefined, "Low\nText", false, xEnv.TooltipLabelStyle.background, xEnv.TooltipLabelStyle.lineColor, xEnv.TooltipLabelStyle.fontColor);
				}

				_self.m_xTooltipHigh.didSetState({hide:false});
				_self.m_xTooltipLow.didSetState({hide:false});
			};

			this.didInitSubObjects = function(chartFrame, drawWrapper) {
			};

			// #1454: restore to before #1181
			this.didClearSubObjects = function() {
				if(_self.m_xTooltipHigh) {
					_self.m_xTooltipHigh.didDestroy();
					_self.m_xTooltipHigh = null;
				}

				if(_self.m_xTooltipLow) {
					_self.m_xTooltipLow.didDestroy();
					_self.m_xTooltipLow = null;
				}
			};

			// #1516
			this.didProcRestAfterReceivingData = function() {
				_didInitHighLowTooltipUnit();
			};
			//

			// #1181, #1454, #1516
			this.didClearSubObjectDatas = function() {
				_self.m_xAskBid = undefined;

				if(_self.m_xTooltipHigh) {
					_self.m_xTooltipHigh.didSetState({hide:true});
				}

				if(_self.m_xTooltipLow) {
					_self.m_xTooltipLow.didSetState({hide:true});
				}
			};

			// #1516
			this.didConvertDatetimeStringFromPriceData = function(stPrice, timeType) {
				try {
					var xEnv   = _self.didGetEnvInfo();

					var date   = stPrice.ymd;
					var time   = stPrice.hms;
					var retStr = "";
					// #2310
					if(timeType > xUtils.constants.timeType.week) {
						retStr = xUtils.dateTime.convertNumberToDateString(date, xEnv.LabelFormat.dateFormat3);
					}
					//
					else if(timeType > xUtils.constants.timeType.hour) {
						retStr = xUtils.dateTime.convertNumberToDateString(date, xEnv.LabelFormat.dateFormat2);
					}
					else if(timeType > xUtils.constants.timeType.tick) {
						retStr = xUtils.dateTime.convertNumberToDateString(date, xEnv.LabelFormat.dateFormat1);
						retStr += " " + xUtils.dateTime.convertNumberToTimeString(time, xEnv.LabelFormat.timeFormat1);
					}
					else {
						retStr = xUtils.dateTime.convertNumberToTimeString(time, xEnv.LabelFormat.timeFormat0);
					}

					return(retStr);
				}
				catch(e) {
					console.error(e);
				}

				return("");
			};

			// #1516
			this.didProcForAfterCalculatingMinMax = function() {
				var xScaleUnit = _self.m_xScaleInfo.current;

				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();

				var xHighValue = xScaleUnit.minMaxScreen.maxValue;
				var xHighIndex = xScaleUnit.minMaxScreen.maxIndex;
				var stHPrice   = _self.didGetDataAt(xHighIndex, false);

				var xLowValue  = xScaleUnit.minMaxScreen.minValue;
				var xLowIndex  = xScaleUnit.minMaxScreen.minIndex;
				var stLPrice   = _self.didGetDataAt(xLowIndex, false);

				var __nTType   = _self.m_symbolInfo.nTType;
				var	verpos	   = _self.didGetPointValue();

				var xDataInfo = {
					datas : {
					}
				};

				var isDwm		= xUtils.timeZone.didCheckTimeType(__nTType).isDwm; // #3812

				if(_self.m_xTooltipHigh && stHPrice) {
					var __strDisp= _self.didConvertDatetimeStringFromPriceData(stHPrice, __nTType);
					__strDisp += " ";
					__strDisp += xUtils.number.didGetPointedValue(xHighValue, verpos);

					var __strTimeVal = xUtils.dateTime.convertNumberDatetimeToTimelineData(stHPrice.ymd, stHPrice.hms);
					// #3812
					if(isDwm == true) {
						__strTimeVal = xUtils.dateTime.convertNumberDatetimeToTimelineData(stHPrice.ymd, 90000);
					}
					// [end] #3812
					var xDiHigh = {
						x : __strTimeVal,
						y : xHighValue,
						t : stHPrice.tno
					};
					xDataInfo.datas["1"] = xDiHigh;
					_self.m_xTooltipHigh.didSetDatas(xDataInfo);
					_self.m_xTooltipHigh.didApplySimpleAttribute(null, __strDisp);
				}

				if(_self.m_xTooltipLow && stLPrice) {
					var __strDisp= _self.didConvertDatetimeStringFromPriceData(stLPrice, __nTType);
					__strDisp += " ";
					__strDisp += xUtils.number.didGetPointedValue(xLowValue, verpos);

					var __strTimeVal = xUtils.dateTime.convertNumberDatetimeToTimelineData(stLPrice.ymd, stLPrice.hms);
					// #3812
					if(isDwm == true) {
						__strTimeVal = xUtils.dateTime.convertNumberDatetimeToTimelineData(stLPrice.ymd, 90000);
					}
					// [end] #3812
					var xDiLow = {
						x : __strTimeVal,
						y : xLowValue,
						t : stLPrice.tno
					};
					xDataInfo.datas["1"] = xDiLow;
					_self.m_xTooltipLow.didSetDatas(xDataInfo);
					_self.m_xTooltipLow.didApplySimpleAttribute(null, __strDisp);
				}
			};
			//

			/**
			 * draw trend lines
			 */
			this.didDrawHighLowObject = function() {
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.MinMaxTooltipShow !== true) {
					return;
				}

				var xScaleUnit = _self.m_xScaleInfo.current;

				if(_self.m_xTooltipHigh) {
					_self.m_xTooltipHigh.DrawObj(xScaleUnit.minMaxScreen.maxValue, xScaleUnit.minMaxScreen.minValue);
				}
				if(_self.m_xTooltipLow) {
					_self.m_xTooltipLow.DrawObj(xScaleUnit.minMaxScreen.maxValue, xScaleUnit.minMaxScreen.minValue);
				}
			};

			//
			// Order & Postion & Alert & Execution
			//

			/**
			 * draw order and position objects
			 */
			this.didDrawAlertExecution = function() {
				_didDrawAlertExecutionObjects(_self.m_arrAlerts);

				// #1298
				var doExecutions = _self.didGetDoExecutions();
				_didDrawAlertExecutionObjects(doExecutions);
			};

			var _didDrawAlertExecutionObjects = function(argObjects) {
				if(argObjects === undefined || argObjects == null) {
					return;
				}

				var xScaleUnit = _self.m_xScaleInfo.current;

				var nObjectCount = argObjects.length;
				for(var ii = 0; ii < nObjectCount; ii++) {
					argObjects[ii].DrawObj(xScaleUnit.minMaxScreen.maxValue, xScaleUnit.minMaxScreen.minValue);
				}
			};

			//
			// alert and exection and so on
			//

			var _didReceiveAlertExecutionData = function(isAlertOrExecution, receiveData) {
				if(receiveData === undefined || receiveData == null) {
					return;
				}

				var doObjects = isAlertOrExecution === true ? _self.m_arrAlerts : _self.m_arrExecutions;
				var nCount = doObjects.length;
				for(var ii = 0; ii < nCount; ii++) {
					var doObj = doObjects[ii];
					if(doObj !== undefined && doObj != null) {
						if(doObj.didUpdateData(receiveData) === true) {
							return(true);
						}
					}
				}

				return(_didAddAlertExecutionData(isAlertOrExecution, receiveData));
			};

			var _didAddAlertExecutionData = function(isAlertOrExecution, receiveData) {
				if(receiveData === undefined || receiveData == null) {
					return;
				}

				var bAlertOrExecution = isAlertOrExecution;
				var doObject;
				if(isAlertOrExecution == true) {
					doObject = doExtraFactory.didCreateAlertObject(_self.m_chartFrame, _self.m_drawWrapper, _self, receiveData);
				}
				else {
					doObject = doExtraFactory.didCreateExecutionObject(_self.m_chartFrame, _self.m_drawWrapper, _self, receiveData);
				}

				if(doObject !== undefined && doObject != null) {
					if(bAlertOrExecution === true) {
						_self.m_arrAlerts.push(doObject);
					}
					else {
						_self.m_arrExecutions.push(doObject);
					}

					return(true);
				}
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.willBeReceivedAlertExecutionData = function(isAlertOrExecution, receivedDatas) {
				return(true);
			};

			/**
			 * @param[in] symbolInfo
			 * @param[in] receivedDatas data[][price type]
			 */
			this.didReceiveAlertExecutionData = function(isAlertOrExecution, receivedDatas) {
				if(receivedDatas === undefined || receivedDatas == null) {
					return;
				}

				var nRecvLen = receivedDatas.length;
				for(var ii = 0; ii < nRecvLen; ii++) {
					_didReceiveAlertExecutionData(isAlertOrExecution, receivedDatas[ii]);
				}

				return(true);
			};

			//
			// another requested objects
			//
			this.didClearExecutionObjects = function() {
				_didClearOepaObjects(_self.m_arrExecutions);
				_self.m_arrExecutions = [];
				return(true);
			};

			this.didClearAlertObjects = function() {
				_didClearOepaObjects(_self.m_arrAlerts);
				_self.m_arrAlerts = [];
				return(true);
			};

			// #1878, #2521
			this.didHitTestForAlertObject = function(posval, hitTestTool) {
				var xSelectedObject;

				// Alert
				if(_self.m_arrAlerts !== undefined && _self.m_arrAlerts != null) {
					var __nCount = _self.m_arrAlerts.length;
					for(var ii = __nCount - 1; ii >= 0; ii--) {
						var doExtraObj = _self.m_arrAlerts[ii];

						// HitTest
						xSelectedObject = doExtraObj.didHitTest(posval, hitTestTool);
						if(xSelectedObject) {
							return(xSelectedObject);
						}
					}
				}

				return;
			};

			this.didHitTestForExecutionObject = function(posval, hitTestTool) {
				var xSelectedObject;

				// Execution
				if(_self.m_arrExecutions !== undefined && _self.m_arrExecutions != null) {
					// #2521
					var doExecutions = _didGetDoExtras(_self.m_arrExecutions);
					if(doExecutions) {
						var __nCount = doExecutions.length;
						for(var ii = __nCount - 1; ii >= 0; ii--) {
							var doExtraObj = doExecutions[ii];

							// HitTest
							xSelectedObject = doExtraObj.didHitTest(posval, hitTestTool);
							if(xSelectedObject) {
								return(xSelectedObject);
							}
						}
					}
					//
				}

				return;
			};
			//

			// #1298
			var _didGetDoExtras = function(fromDatas, isOutside) {
				if(!fromDatas) {
					return;
				}

				var xScrollInfo = _self.m_drawWrapper.didGetScrollInfo(true);
				if(!xScrollInfo) {
					if(isOutside == true) {
						return;
					}

					return(fromDatas);
				}

				var xAxisX        = _self.didGetAxisX()

				var __nLocalXIdx1 = xAxisX.didConvertLocalIndexToDataIndex(0);
				var __nLocalXIdx2 = xAxisX.didConvertLocalIndexToDataIndex(xScrollInfo.screenSize);

				var __dateTime1 = _self.m_drawWrapper.didGetTimedataAt(__nLocalXIdx1, false, true);
				var __dateTime2 = _self.m_drawWrapper.didGetTimedataAt(__nLocalXIdx2, false, true);
				if(!__dateTime1 || !__dateTime2) {
					if(isOutside == true) {
						return;
					}

					return(fromDatas);
				}

				var nDateTime1 = parseInt(__dateTime1.dateTime);
				var nDateTime2 = parseInt(__dateTime2.dateTime);

				var results = [];
				var nCount = fromDatas.length;
				for(var ii = 0; ii < nCount; ii++) {
					var doExtra = fromDatas[ii];
					if(!doExtra || !doExtra.m_xObjectInfo) {
						continue;
					}

					var doDatetime = parseInt(doExtra.m_xObjectInfo.dateTime);

					if(isOutside == true) {
						if(doDatetime < nDateTime1 || nDateTime2 <= doDatetime) {
							results.push(doExtra);
						}
					}
					else {
						if(doDatetime >= nDateTime1 && nDateTime2 > doDatetime) {
							results.push(doExtra);
						}
					}
				}

				return(results);
			};

			this.didGetDoExecutions = function(isOutside) {
				return(_didGetDoExtras(_self.m_arrExecutions, isOutside));
			};

			this.didGetDoPositions = function(isOutside) {
				return(_didGetDoExtras(_self.m_arrPosits, isOutside));
			};
			//

			// #1927
			this.didGetDoOrdersWithJointId = function(jointId) {
				if(!jointId || jointId.length < 1) {
					return;
				}

				var results = [];
				var nCount = _self.m_arrOrders.length;
				for(var ii = 0; ii < nCount; ii++) {
					var doOrder = _self.m_arrOrders[ii];
					if(!doOrder || !doOrder.m_xObjectInfo || !doOrder.m_xObjectInfo.orderJointId || doOrder.m_xObjectInfo.orderJointId != jointId) {
						continue;
					}

					results.push(doOrder);
				}

				return(results);
			};
			//

			// #1966
			this.didCheckPricePos = function(price) {
				// 1: price >= ask, 0: ask > price > bid, -1: bid >= price
				if(price === undefined || price == null)  {
					price = 0;
				}

				try {
					if(_self.m_xAskBid.ask <= price) {
						return(1);
					}

					if(_self.m_xAskBid.bid >= price) {
						return(-1);
					}

					return(0);
				}
				catch(e) {
					console.error(e);
				}

				return(0);
			};
			//

			// #2247
			/**
			 * draw line chart
			 */
			this.DrawLineChart = function(posval) {
				_self.SetBackgroundCodeName("");
				var __nLocalXPos1, __nLocalXPos2, __nLocalYPos1, __nLocalYPos2;
				var __stPrice1, stPrice2;

				var xEnv = _self.didGetEnvInfo();

				//
				// #505
				//
				var stPrice;

				var __nScrSIdx = _self.m_drawWrapper.m_xScrollInfo.pos;
				var __nScrSize = _self.m_drawWrapper.m_xScrollInfo.screenSize;

				//
				// #505
				//
				var __nLoopStart = 0;
				var __nLoopEnd =__nScrSize;
				var __bHitTest = false;
				var lineWidth = 1;
				var lineColor = _self.m_drawWrapper.m_stEnv.PriceStyleConfig.Line.strokeColor;
				var fillColor = lineColor;
				var __context = _self.m_context;
				if(posval !== undefined) {
					var __dataIndexAtPos = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(posval.XPos, false) - 3;
					__nLoopStart = _self.m_drawWrapper.didConvertDataIndexToLocalIndex(__dataIndexAtPos);
					__nLoopEnd = __nLoopStart + xUtils.hitTest.config.size;

					__bHitTest = true;

					fillColor =
					lineColor = xUtils.hitTest.config.color;

					__context = _self.m_memcontext;
				}
				else {
					// #676
					if(_self.m_bSelect === true) {
						fillColor =
						lineColor = xEnv.System.SelectedFill.lineColor;
					}
				}

				var __drawLinesParam = {
		    		context : __context,
		    		pts : [],
		    		lineWidth : lineWidth,
		    		lineColor : lineColor
		    	};

				var __drawPolygonParam = {
					context:__context,
					pt1s:[],
					pt2s:[],
					lineWidth:lineWidth,
					lineColor:lineColor,
					fillColor:fillColor,
					fillAlpha:xEnv.TrendlineFillAlpha
				};

				var __tempHeight = _self.didGetPanelHeight();

				if(xEnv.MiniChartConfig) {
					__drawPolygonParam.grad = {
						colors : [xEnv.MiniChartConfig.BgColor2, xEnv.MiniChartConfig.BgColor1],
						pt1 : {x:0, y:0},
						pt2 : {x:0, y:__tempHeight}
					};

					__drawLinesParam.lineColor = xEnv.MiniChartConfig.LineColor;
				}

				var arrPoints = [];
				var ptStart;
				var ptEnd;
				var bFirst = true;

				var xAxisX = _self.didGetAxisX();
				var xAxisY = _self.didGetAxisY();

				for(var __nLocalIdx = __nLoopStart - 1; __nLocalIdx <= __nLoopEnd; __nLocalIdx++) {
					var __dataIndex = _self.m_drawWrapper.didConvertLocalIndexToDataIndex(__nLocalIdx);
					var __stPrice1 = _self.didGetDataAt(__dataIndex, false);
					if(xUtils.validator.isValidPrice(__stPrice1) !== true) {
						continue;
					}

					var xBarInfos= {};
					__nLocalXPos1 = xAxisX.GetIndex2Pixel(__dataIndex, xBarInfos);
					__nLocalYPos1 = xAxisY.GetYPos(__stPrice1.close);

					// #1827
					var pt = {x:__nLocalXPos1, y:__nLocalYPos1};
					if(bFirst) {
						ptStart = xUtils.didClone(pt);
						bFirst = false;
					}

					ptEnd = xUtils.didClone(pt);

					__drawPolygonParam.pt1s.push(pt);
					__drawLinesParam.pts.push(pt);
					//
				}

				// #1827
				if(__bHitTest != true && xEnv.System.UseForMiniChart == true && ptStart && ptEnd) {
					ptEnd.y   =
					ptStart.y = __tempHeight;

					__drawPolygonParam.pt2s.push(ptStart);
					__drawPolygonParam.pt2s.push(ptEnd);

					gxDc.PolygonGradient(__drawPolygonParam);
				}

				gxDc.Lines(__drawLinesParam);
				//
			};
			//
	    };

	    return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDOPriceBarCFD");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOPriceBarCFD"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOPriceBase"],
				global["WGC_CHART"]["chartDOExtraCFD"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./canvas2DUtil"),
				require("./chartDOPriceBase"),
				require("./chartDOExtraCFD")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDOPriceBarCFD",
            ['ngc/chartUtil', 'ngc/canvas2DUtil', 'ngc/chartDOPriceBase', 'ngc/chartDOExtraCFD'],
                function(xUtils, gxDc, doPriceBaseClass, doExtraFactory) {
                    return loadModule(xUtils, gxDc, doPriceBaseClass, doExtraFactory);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOPriceBarCFD"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOPriceBase"],
				global["WGC_CHART"]["chartDOExtraCFD"]
            );
    }
	//console.debug("[MODUEL] Loaded => chartDOPriceBarCFD");
})(this);
