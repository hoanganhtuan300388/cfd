(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc) {
	    "use strict";

	    var exports = function (chartWrapper, drawWrapper) {
	        //
	        // private
	        //

	        var _self = this;
	        var _chartWrapper = chartWrapper;
	        var _drawWrapper = drawWrapper;

	        //
	        // public
	        //
			this.OBJECT_NAME = "BASE_AXIS";

	        this.m_drawWrapper = drawWrapper;

	        this.m_xAxisPanel = {};

			this.m_objCrosslineX = {};

			this.m_canvas = {};
			this.m_context = {};
			this.WIDTH = 0;
			this.HEIGHT = 0;

			this.memcanvas = {};
			this.mctx = {};

			this.m_rectInfo = {
				x: 0, y: 0, width: 0, height: 0, lw: 0, rw: 0
			};

			this.isNontime = false; // #2037

			/**
			 *
			 */
			this.didDrawPanelBorder = function() {
				var __lineColor = _self.m_drawWrapper.m_stEnv.XAxisBorderColor;
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
				var __panelWidth  = _self.didGetDrawingWidth();
				var __panelHeight = _self.didGetDrawingHeight();
				//

				__drawRectParam.rect.width  = __panelWidth  - 2;	// #1753
				__drawRectParam.rect.height = __panelHeight - 2;	// #1753
				gxDc.Rectangle(__drawRectParam);

				var __chartFrameAreaInfo = _self.m_drawWrapper.GetChartFrameAreaInfo();

				// left line
				__drawLineParam.pt1.x = __chartFrameAreaInfo.chart.left;
				__drawLineParam.pt1.y = 0;
				__drawLineParam.pt2.x = __chartFrameAreaInfo.chart.left;
				__drawLineParam.pt2.y = __panelHeight - 2;	// #1753
				gxDc.Line(__drawLineParam);

				// bottom line
				__drawLineParam.pt1.x = __chartFrameAreaInfo.chart.left + __chartFrameAreaInfo.chart.width - 1;	// #1753
				__drawLineParam.pt1.y = 0;
				__drawLineParam.pt2.x = __chartFrameAreaInfo.chart.left + __chartFrameAreaInfo.chart.width - 1;	// #1753
				__drawLineParam.pt2.y = __panelHeight - 2;	// #1753
				gxDc.Line(__drawLineParam);
	        };

	        /**
	         *
	         */
			this.didDrawXAxis = function () {
				var xEnv = _self.didGetEnvInfo();

				var gridWidth = _self.m_drawWrapper.GetDrawPanelWidth();

				var __drawParam = {
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
					height : _self.didGetDrawingHeight(),
					axis : _self,
					drawWrapper : _self.m_drawWrapper,
					isGrid : false,
					target : {
						context : _self.m_context,
						leftWidth : xEnv.System.YAxisLeft,
						rightWidth : xEnv.System.YAxisRight,
						gridWidth : gridWidth
					},
					clip : {
						x: xEnv.System.YAxisLeft,
						y: 0,
						width: _self.m_drawWrapper.GetChartFrameAreaWidth(),
						height: _self.didGetDrawingHeight()
					},
					levelInfo : _self.m_drawWrapper.didGetScrollLevelInfo(), // #2038
					isNontime : _self.isNontime, // #2037
				};

				xUtils.axis.didDrawXAxisWithLevel(__drawParam);
			};

			/**
			 * resize panel
			 * @param[in] resizeParam	param
			 */
			this.didResizePanel = function(resizeParam) {
				if(resizeParam === undefined || resizeParam == null) {
					return;
				}

				_self.m_rectInfo.x 			= resizeParam.left;
				_self.m_rectInfo.y 			= resizeParam.top;
				_self.m_rectInfo.width 		= resizeParam.width;
				_self.m_rectInfo.height 	= resizeParam.height;
				_self.m_rectInfo.lw 		= resizeParam.leftY;
				_self.m_rectInfo.rw 		= resizeParam.rightY;

				var devicePixelRatio = window.devicePixelRatio || 1;
				var ratio = devicePixelRatio;

				_self.m_canvas.width			= ratio * resizeParam.width;
				_self.m_canvas.height			= ratio * resizeParam.height;

				_self.m_canvas.style.width		= resizeParam.width  + "px";
				_self.m_canvas.style.height		= resizeParam.height + "px";

				_self.m_xAxisPanel.style.left   = resizeParam.left   + "px";
				_self.m_xAxisPanel.style.top    = resizeParam.top    + "px";
				_self.m_xAxisPanel.style.width  = resizeParam.width  + "px";
				_self.m_xAxisPanel.style.height = resizeParam.height + "px";
			}

			/**
			 *
			 */
			this.didDraw = function() {
				var xEnv = _self.didGetEnvInfo();
				_self.m_canvas.style.backgroundColor = xEnv.XAxisBackgroundColor;

				if (_self.m_context === _self.mctx) {
					_self.m_context.fillStyle = 'black';
				} else {
					_self.m_context.fillStyle = _self.fill;
				}

				if (_self.x > _self.WIDTH || _self.y > _self.HEIGHT) {
					return;
				}

				if (_self.x + _self.w < 0 || _self.y + _self.h < 0) {
					return;
				}

				_self.SetBaseSize();

				_self.m_context.clearRect(0, 0, _self.m_canvas.width, 1);

				// #2285
				_self.m_context.clearRect(0, 0, _self.m_canvas.width, _self.m_canvas.height);
				_self.m_context.translate(0.5, 0.5);
				//

				_self.m_context.font = xEnv.ConfigAxis.Font;
				_self.m_context.fillStyle = xEnv.ConfigAxis.FontColor;

				_self.DrawCrossLineX(); // #2566, #2293

				_self.didDrawXAxis();
				_self.didDrawPanelBorder();

				_self.m_context.translate(-0.5, -0.5);

			}; // end draw

			// #1290
			this.didGetCrosslinePoint = function() {
				return(_self.m_drawWrapper.didGetCrosslinePoint());
			};

	        /**
	         *
	         */
			this.Init = function (initParam) {
				var xEnv = _self.didGetEnvInfo(); // #2247

			    var xAxisPanelElemInfo	= _self.m_drawWrapper.GetXAxisPanelElementInfo();
			    _self.m_xAxisPanel		= xAxisPanelElemInfo.panel;
			    _self.m_canvas			= xAxisPanelElemInfo.canvas;
			    _self.m_objCrosslineX	= xAxisPanelElemInfo.label;

				_self.m_canvas.left = 0;
				_self.m_canvas.width = _self.m_xAxisPanel.offsetWidth;
				_self.m_canvas.height = xUtils.didGetXAxisHeight(xEnv); // #2247

				_self.HEIGHT = _self.m_canvas.height;
				_self.WIDTH = _self.m_canvas.width;
				_self.m_context = _self.m_canvas.getContext('2d');

			    //
			    // cross line x
	            //
				_self.m_objCrosslineX.setAttributeNS( null, "id", "idCrosslineX");

				_self.m_objCrosslineX.style.left = "0px";
				_self.m_objCrosslineX.style.top = "1px";
				_self.m_objCrosslineX.style.position = "absolute";
				_self.m_objCrosslineX.style.visibility = "hidden";

				var parentObj = _self.m_xAxisPanel;
				parentObj.appendChild(_self.m_objCrosslineX);

			    //
			    // for hit test
	            //
				_self.memcanvas = document.createElement('canvas');
				_self.memcanvas.height = _self.HEIGHT;
				_self.memcanvas.width = _self.WIDTH;
				_self.mctx = _self.memcanvas.getContext('2d');
			};

			this.SetBaseSize = function() {
				return true;
			};

			/***************************************************************************
			 * function : SetCrossLine descriptiion :
			 **************************************************************************/
			this.SetCrossLine = function (posval) {
				var __nCrossLineXPos = posval.XPos;
				var __nCrossLineYPos = posval.YPos;
				// 下端Scaleの上に日付ラベルを表示する
				_self.DrawCrossLineX(__nCrossLineXPos, __nCrossLineYPos);
			};

			/***************************************************************************
			 * function : DrawCrossLineX descriptiion : 下端Scaleの上に日付ラベルを表示する
			 **************************************************************************/
			/**
			 * 下端Scaleの上に日付ラベルを表示する
			 * @param[in] iXPos
			 */
			this.DrawCrossLineX = function (iXPos, iYPos) {
				// #935
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.CrossLine.hide === true) {
					_self.m_objCrosslineX.style.visibility = "hidden"; // #2566
					return;
				}

				// #2566, #2293
				var nCrossLineXPos = -1;
				var nCrossLineYPos = -1;
				if(iXPos === undefined || iXPos == null || iYPos === undefined || iYPos == null) {
					var ptCrossline= _self.didGetCrosslinePoint();
					nCrossLineXPos = ptCrossline.x;
					nCrossLineYPos = ptCrossline.y;
				}
				else {
					nCrossLineXPos = iXPos;
					nCrossLineYPos = iYPos;
				}

				iXPos = nCrossLineXPos;
				iYPos = nCrossLineYPos;
				// [end] #2566, #2293

				if(iYPos > -1) {
					var xTimeData = _self.GetXPosToVal(iXPos);
					if(xTimeData === undefined || xTimeData == null) {
						return;
					}

					var strDateTime = xTimeData.dateTime;
					if(strDateTime === undefined || strDateTime == null) {
						return;
					}

					if (strDateTime.length < 4) {
						return;
					}

					//  #2310
					var strDate = String(strDateTime).substring(0,4) + "/" + String(strDateTime).substring(4,6) + "/" +String(strDateTime).substring(6,8);// String(stPrice.ymd)
					var strTime = "";

					var __nTType = _self.m_drawWrapper.didGetReferencedPriceObject().m_symbolInfo.nTType;
					var strDisp  = "";
					var nDispWidth = xEnv.System.CrosslineLabelXWidth; // #3016
					if (__nTType <= xUtils.constants.timeType.hour) {
						strDate = String(strDateTime).substring(0,4) + "/" + String(strDateTime).substring(4,6) + "/" +String(strDateTime).substring(6,8);// String(stPrice.ymd)
						strTime = String(strDateTime).substring(8,14);
						if (strTime.length == 5)
							strTime = "0" + strTime;
						else if (strTime.length == 4)
							strTime = "00" + strTime;
						else if (strTime.length == 3)
							strTime = "000" + strTime;
						else if (strTime.length == 2)
							strTime = "0000" + strTime;
						else if (strTime.length == 1)
							strTime = "00000" + strTime;

						if(__nTType < xUtils.constants.timeType.minute) {
							strDate = "";
							strTime = strTime.substring(0, 2) + ":" + strTime.substring(2, 4) + ":" + strTime.substring(4, 6);
							strDisp = strTime;
							// nDispWidth = _self.m_context.measureText(strDisp).width; // #3016

							iXPos = _self.SetXPosition(iXPos) - parseInt(nDispWidth / 2);
							_self.m_objCrosslineX.innerHTML = "&nbsp" + strTime + "&nbsp";
						}
						else {
							strTime = strTime.substring(0, 2) + ":" + strTime.substring(2, 4);
							strDisp = strDate + " " + strTime;
							// nDispWidth = _self.m_context.measureText(strDisp).width; // #3016

							iXPos = _self.SetXPosition(iXPos) - parseInt(nDispWidth / 2);
							_self.m_objCrosslineX.innerHTML = "&nbsp" + strDate.substring(5, strDate.length) + "&nbsp" + strTime + "&nbsp";
						}
					}
					else {
						if(__nTType > xUtils.constants.timeType.week) {
							strDate = String(strDateTime).substring(0,4) + "/" + String(strDateTime).substring(4,6);
						}
						else {
							strDate = String(strDateTime).substring(0,4) + "/" + String(strDateTime).substring(4,6) + "/" +String(strDateTime).substring(6,8);
						}
						//
						strDisp = strDate;

						// nDispWidth = _self.m_context.measureText(strDisp).width; // #3016

						iXPos = _self.SetXPosition(iXPos) - parseInt(nDispWidth / 2);
						_self.m_objCrosslineX.innerHTML = "&nbsp" + strDate + "&nbsp";
					}

					_self.m_objCrosslineX.style.top = "1px";
					// _self.m_objCrosslineX.style.width = parseInt(nDispWidth) + 9 + "px";  // #3016

					iXPos += xEnv.ExtraPanelWidth;
					//

					// #1518
					var __panelWidth  = _self.didGetDrawingWidth();
					var __panelHeight = _self.didGetDrawingHeight();

					if (iXPos < _self.m_drawWrapper.m_stEnv.System.YAxisLeft) {
						iXPos = _self.m_drawWrapper.m_stEnv.System.YAxisLeft;
					}
					else if ((iXPos + _self.m_objCrosslineX.offsetWidth) > (__panelWidth - _self.m_drawWrapper.m_stEnv.System.YAxisRight)) {
						iXPos = (__panelWidth - _self.m_drawWrapper.m_stEnv.System.YAxisRight) - _self.m_objCrosslineX.offsetWidth;
					}


					_self.m_objCrosslineX.style.left = iXPos + "px";

					_self.m_objCrosslineX.style.visibility = "visible";
				}
				else
					_self.m_objCrosslineX.style.visibility = "hidden";
			};

			/**
			 *
			 */
			this.SetXPosition = function (argPosX) {
			    var scrPosInfo = _self.m_drawWrapper.GetRelativePositionXInfo(argPosX);
			    var nScrPos = scrPosInfo.pos;
			    var nScrIdx = scrPosInfo.idx;

			    /*
				if (nScrIdx < 0)
				    nScrIdx = 0;
				else if (nScrIdx > (iTotCount - 1))
				    nScrIdx = iTotCount - 1;

				*/
				var iXPosVal = _self.GetXPos(nScrIdx);

				return iXPosVal;
			};

			this.DrawLine = function (stStyle) {
				_self.m_context.beginPath();
				_self.m_context.moveTo(stStyle.startX, stStyle.startY);
				_self.m_context.lineTo(stStyle.endX, stStyle.endY);
				_self.m_context.lineWidth = stStyle.lineWidth;
				// _self.m_context.globalAlpha=1.0;
				_self.m_context.strokeStyle = stStyle.lineColor;
				_self.m_context.stroke();
			};

			this.DrawRectangle = function(stStyle) {
				_self.m_context.beginPath();
				_self.m_context.rect(stStyle.rectX, stStyle.rectY, stStyle.rectW, stStyle.rectH);
				// _self.m_context.globalAlpha=1.0;
				_self.m_context.fillStyle = stStyle.fillColor;
				_self.m_context.fill();
				_self.m_context.lineWidth = stStyle.lineWidth;
				_self.m_context.strokeStyle = stStyle.lineColor;
				_self.m_context.stroke();
			};

	        this.DrawText = function(stStyle) {
	            if(stStyle.context === undefined || stStyle.context == null) {
	                return;
	            }

	            stStyle.context.save();
	            if(stStyle.fillColor !== undefined && stStyle.fillColor != null) {
	                stStyle.context.fillStyle = stStyle.fillColor;
	            }
	            stStyle.context.fillText(stStyle.text, stStyle.left, stStyle.top);
	            stStyle.context.restore();
	        };

			/**
			 *
			 */
			this.OnDestroy = function() {
				// TODO: destroy


				_self.didRemoveLinkElements();
			};


			/**
			 * remove elements link
			 */
			this.didRemoveLinkElements = function() {
			};

			//
			// NOTE: Axis X
			//

			this.didGetAxisX = function() {
				return(_self.m_drawWrapper.didGetAxisX());
			};

			/**
			 * get screen position(pixel) from local index
			 * @param[in] argLocalIdx	local index
			 * @return screen position
			 */
			this.GetXPos = function(argLocalIdx) {
				var xAxisX = _self.didGetAxisX();

				//
	        	var __nScrXPos = xAxisX.GetXPos(argLocalIdx) + _self.m_drawWrapper.m_stEnv.System.YAxisLeft;
				return(__nScrXPos);
	        };

			/**
			 *
			 */
			this.GetXPosToVal = function (argPosX) {
				//iXPos = iXPos - _self.m_drawWrapper.m_stEnv.System.YAxisLeft;

				var __nLocalXPos = argPosX - _self.m_drawWrapper.m_stEnv.System.YAxisLeft;
				var __dataIdx = _self.m_drawWrapper.didConvertHorizontalPosToDataIndex(__nLocalXPos, true);

				var __strDatetime = _self.m_drawWrapper.didGetTimedataAt(__dataIdx, false, true);

				return(__strDatetime);
			};

			/**
			 * get ratio for horizontal
			 * @param[in] baseIsPixel	index / pixel or pixel / index
			 * @return ratio
			 */
			this.didGetRatioHorizontal = function(baseIsPixel) {
				return(_self.m_drawWrapper.didGetRatioHorizontal(baseIsPiexel));
			};

			// #935
			this.didGetEnvInfo = function() {
				return(_self.m_drawWrapper.didGetEnvInfo());
			};

			// #1372
			this.didGetDrawingWidth = function() {
				return(_self.m_rectInfo.width);
			};

			this.didGetDrawingHeight = function() {
				return(_self.m_rectInfo.height);
			};

			// #2566
			this.didChangeCrosslineLabelShowStatus = function() {
				var xEnv = _self.didGetEnvInfo();
				if(xEnv.CrossLine.hide === true) {
					_self.m_objCrosslineX.style.visibility = "hidden"; // #2566
				}
				else {
					_self.m_objCrosslineX.style.visibility = "visible"; // #2566
				}
			};
			//
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartXAxisPanelBase");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartXAxisPanelBase"] =
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
        define("ngc/chartXAxisPanelBase",
			['ngc/chartUtil', 'ngc/canvas2DUtil'],
				function(xUtils, gxDc) {
					return loadModule(xUtils, gxDc);
				});
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartXAxisPanelBase"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"]
			);
    }

	//console.debug("[MODUEL] Loaded => chartXAxisPanelBase");
})(this);
