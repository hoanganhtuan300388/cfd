(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc, doBaseClass) {
	    "use strict";

	    var _doOPUnitBase = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new doBaseClass();
			doBaseClass.apply(this, arguments);

			this.m_xContainer = null;
	        this.m_bOrder = true;
	        this.m_doContainer = {};
	        this.m_xObjectInfo = {};

			this.m_bDummyObject = false;

	        /**
	         * [didSetObjectInfo description]
	         * @param  {[type]} argObjectInfo
	         * @return {[type]}
	         */
	        this.didSetObjectInfo = function(argObjectInfo) {
	            if(argObjectInfo !== undefined && argObjectInfo != null) {
	                _self.m_xObjectInfo = xUtils.didClone(argObjectInfo);

	                _self.didSetData(_self.m_xObjectInfo.dateTime, _self.m_xObjectInfo.price);
	            }
	        };

	        /**
	         * set data
	         * @param  {[type]} argDatetime yyyymmddhhmmss
	         * @param  {[type]} argPrice    price value(non-pointed)
	         * @return true or false
	         */
	        this.didSetData = function(argDatetime, argPrice) {
	            // main line
	            _self.m_xData1.curValue.x = argDatetime;
	            _self.m_xData1.curPos.x = _self.GetXValToPos(_self.m_xData1.curValue.x);
	            _self.m_xData1.curValue.y = argPrice;
	            _self.m_xData1.curPos.y = _self.GetYValToPos(_self.m_xData1.curValue.y);

				// dummy line
				_self.m_bMoving = false;
	            _self.m_xData2.curValue.x = argDatetime;
	            _self.m_xData2.curPos.x = _self.m_xData1.curPos.x;
	            _self.m_xData2.curValue.y = argPrice;
	            _self.m_xData2.curPos.y = _self.m_xData1.curPos.y;
	        };

			this.didInitObject = function(chartFrame, drawWrapper, doParent, doContainer, argUnitInfo) {
				//
				_self.m_drawWrapper = drawWrapper;
				_self.m_doParent = doParent;
				_self.m_doContainer = doContainer;

				//
				_self.ReSetFrame(chartFrame);

				_self.ReceiveData();
				_self.SetBaseSize();

				_self.didSetObjectInfo(argUnitInfo);
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
	            }

				var xEnv    = _self.didGetEnvInfo();
				if(isHitTest) {
					context   = _self.m_memcontext;
					lineColor = _self.m_clrHitTestColor;
				}
				else {
					context   = _self.m_context;
					if(_self.m_bSelect && xEnv.UseOepSelectedColor == true) { // #2059
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

	            gxDc.Line(drawLineParam);

	            var strDisp = _self.m_xObjectInfo.buysell;

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

				if(isHitTest !== true) {
					var iXPos = _self.didGetPanelHalfWidth();
					var pts = [
						{x:iXPos, y:_self.m_xData2.curPos.y}
					];

					// draw selection mark
					_self.DrawSelectionMark(pts);
				}
			};

	        this.didGetStyleInfo = function() {

	        };

	        this.didDestroySubClass = function() {
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
					isOrder		: _self.m_bOrder
				};

				return(result);
			};

			// #1259
			this.didDrawLastValue = function(argDrawParam, dataIndex) {
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
							argDrawParam.price.color = xStyleInfo.ask.strokeColor;
						}
						else if(_self.m_xObjectInfo.ask === false) {
							argDrawParam.price.color = xStyleInfo.bid.strokeColor;
						}
						else {
							argDrawParam.price.color = xStyleInfo.default.strokeColor;
						}
					}
	            }

				xUtils.axis.didDrawLastValueOnYAxis(argDrawParam);
			};

	        //
			// Debug
			//

			this.debug.toString = function() {
	            var __configInfo = 'objectInfo => ' + JSON.stringify(_self.m_xObjectInfo);
				var __data1 = 'xData1 => ' + JSON.stringify(_self.m_xData1);
				var __data2 = 'xData2 => ' + JSON.stringify(_self.m_xData2);
				var __data3 = 'xData3 => ' + JSON.stringify(_self.m_xData3);

				return(__configInfo + "\n" + __data1 + "\n" + __data2 + "\n" + __data3 + "\n");
			}

	    };

	    var _doOrderUnit = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doOPUnitBase();
			_doOPUnitBase.apply(this, arguments);

	        this.m_bOrder = true;

	        this.didGetStyleInfo = function() {
	            return(_self.m_drawWrapper.m_stEnv.OrderStyleConfig);
	        };
	    };

	    var _doPositUnit = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doOPUnitBase();
			_doOPUnitBase.apply(this, arguments);

	        this.m_bOrder = false;

	        this.didGetStyleInfo = function() {
	            return(_self.m_drawWrapper.m_stEnv.PositStyleConfig);
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
				doLocal = new _doOrderUnit();
			}
			else {
				doLocal = new _doPositUnit();
			}

	        if(doLocal.didInitObject !== undefined) {
	            doLocal.didInitObject(chartFrame, drawWrapper, doParent, doContainer, argUnitInfo);
	        }

			return(doLocal);
		};

		// #1878
		_exports.didGetBaseExtraUnitClass = function() {
			return(_doOPUnitBase);
		};

		_exports.didGetOrderUnitClass = function() {
			return(_doOPUnitBase);
		};

		_exports.didGetPositUnitClass = function() {
			return(_doOPUnitBase);
		};
		//

		return(_exports);
	};

	//console.debug("[MODUEL] Loading => chartDOOrderPositUnit");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOOrderPositUnit"] =
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
        define("ngc/chartDOOrderPositUnit",
            ['ngc/chartUtil', 'ngc/canvas2DUtil', 'ngc/chartDOLineStudyBase'],
                function(xUtils, gxDc, doBaseClass) {
                    return loadModule(xUtils, gxDc, doBaseClass);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOOrderPositUnit"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartDOLineStudyBase"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOOrderPositUnit");
})(this);
