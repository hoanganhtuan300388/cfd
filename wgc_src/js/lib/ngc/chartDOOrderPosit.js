(function(global){
	"use strict";

	var loadModule = function(gxDc, xUtils, doOPUnitFactory) {
	    "use strict";

		/**
		 * @class CChartTrendlineObj
		 *
		 */
		var _doOPContainerBase = function() {
			//
			//
			//
			var _self = this;

			this.m_doParent = {};
			this.m_chartFrame = {};
			this.m_chartdraw = {};

			//
			this.m_drawWrapper = null;

			//

	        this.m_bOrder = true;
	        this.m_arrUnits = [];
			this.m_xDummyUnit = null;
	        this.m_xObjectInfo = {};

	        /**
	         * [didCreateUnit description]
	         * @return {[type]} [description]G
	         */
	        this.didCreateUnit = function(argUnitInfo) {
	            var doOPUnit = doOPUnitFactory.didCreateOrderPositUnit(_self.m_bOrder, _self.m_chartFrame, _self.m_drawWrapper, _self.m_doParent, _self, argUnitInfo);

	            return(doOPUnit);
	        };

	        var _didFindUnitById = function(argId) {
	            if(argId === undefined || argId == null) {
	                return;
	            }

	            var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                var doUnit = _self.m_arrUnits[ii];
	                if(doUnit !== undefined && doUnit != null) {
	                    if(doUnit.m_xObjectInfo.id === argId) {
	                        return({object: doUnit, index: ii});
	                    }
	                }
	            }
	        };

	        var _didRemoveUnitAtIndex = function(argIndex) {

	            var nUnitCount = _self.m_arrUnits.length;
	            if(nUnitCount < 1 || argIndex < 0 || argIndex >= nUnitCount) {
	                return;
	            }

	            delete _self.m_arrUnits[argIndex];
	            _self.m_arrUnits.splice(argIndex, 1);

	            return(true);
	        };

			/**
			 * ダミーオブジェクトを生成する。
			 * @return {[type]}
			 */
			var _didCreateDummyObject = function() {
				//
				//
				//
				if(_self.m_xDummyUnit !== undefined && _self.m_xDummyUnit != null) {
					_self.m_xDummyUnit.didDestroy();
					_self.m_xDummyUnit = null;
				}

				var nCount = _self.m_arrUnits.length;
				if(nCount < 1) {
					return(false);
				}

				var xDoUnit = _self.m_arrUnits[0];

				_self.m_xDummyUnit = _self.didCreateUnit(_self.m_xObjectInfo);

				_self.m_xDummyUnit.m_xData1 = xUtils.didClone(xDoUnit.m_xData1);
				_self.m_xDummyUnit.m_xData2 = xUtils.didClone(xDoUnit.m_xData2);
				_self.m_xDummyUnit.m_xData3 = xUtils.didClone(xDoUnit.m_xData3);
				_self.m_xDummyUnit.m_posSelectVal = xUtils.didClone(xDoUnit.m_posSelectVal);

				_self.m_xDummyUnit.m_bDummyObject = true;

				return(true);
			};

			/**
			 * deselect all object
			 */
			this.DeselectAllObject = function() {
				var nCount = _self.m_arrUnits.length;
				for (var ii = 0; ii < nCount; ii++) {
					_self.m_arrUnits[ii].m_bSelect = false;
				}
			};

	        this.didRemoveUnitById = function(argId) {
	            var unitFound = _didFindUnitById(argId);

	            if(unitFound !== undefined && unitFound != null) {
	                return(_didRemoveUnitAtIndex(unitFound.index));
	            }
	        };

	        this.didUpdateData = function(receiveData) {
	            if(receiveData === undefined || receiveData == null) {
	                return;
	            }

	            var id = receiveData.id;

	            var unitFound = _didFindUnitById(id);
	            if(unitFound !== undefined && unitFound != null) {
	                if(receiveData.deleted === true) {
	                    _didRemoveUnitAtIndex(unitFound.index);

	                    // xUtils.debug.log("unit is deleted!!!! : " + id);
	                }
	                else {
	                    unitFound.object.didSetObjectInfo(receiveData);

	                    // xUtils.debug.log("unit is updated!!!! : " + unitFound.object.debug.toString());
	                }

	                return(true);
	            }
	        };

			/**
				init object

				@param[in]	chartFrame 		CChartDrawFrame object
				@param[in]	strTrendline 	line study name
				@param[in]	posval 			position value {XPos: value , YPos: value}
				@param[in]	iMaxPrice 		max price
				@param[in]	iMinPrice 		min price
				*/
			this.didInitObject = function(chartFrame, drawWrapper, doParent, argObjectInfo) {
				//
				_self.m_drawWrapper = drawWrapper;
				_self.m_doParent = doParent;

				//
				_self.ReSetFrame(chartFrame);

	            //
	            _self.didSetObjectInfo(argObjectInfo);
			};

	        /**
	         * set object information
	         * @param  {[type]} argObjectInfo [description]
	         * @return {[type]}               [description]
	         */
	        this.didSetObjectInfo = function(argObjectInfo) {
	            if(argObjectInfo === undefined || argObjectInfo == null) {
	                return;
	            }

	            // copy
	            _self.m_xObjectInfo = xUtils.didClone(argObjectInfo);

	            //
	            // MARK: only one data
	            //
	            var doOPUnit = _self.didCreateUnit(_self.m_xObjectInfo);
	            if(doOPUnit !== undefined && doOPUnit != null) {
	                _self.m_arrUnits.push(doOPUnit);
	            }
	        };

			var _didDestroyDummyUnit = function() {
				if(_self.m_xDummyUnit !== undefined && _self.m_xDummyUnit != null) {
					_self.m_xDummyUnit.didDestroy();
					_self.m_xDummyUnit = null;
				}
			};

	        this.didDestroyUnits = function() {
	            var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                _self.m_arrUnits[ii].didDestroy();
	                delete _self.m_arrUnits[ii];
	            }

	            _self.m_arrUnits = [];

				// ダミー用のものは削除する。
				_didDestroyDummyUnit();
	        };

			/**
			 * call when you delete this object
			 */
			this.didDestroy = function() {
				_self.m_doParent    = {};
				_self.m_chartFrame  = {};
				_self.m_chartdraw   = {};

				//
				_self.m_drawWrapper = null;

	            //
	            _self.didDestroyUnits();
			};

			/**
			 *
			 */
			this.ReSetFrame = function(chartFrame) {
	            _self.m_chartFrame = chartFrame;

	            var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                _self.m_arrUnits[ii].ReSetFrame(chartFrame);
	            }
			};

	        /**
	         * [didDrawObj description]
	         * @param  {[type]} posval [description]
	         * @return {[type]}        [description]
	         */
	        this.didDrawObj = function(posval) {
	            var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                var result = _self.m_arrUnits[ii].didDrawObj(posval);
	                if(result !== undefined && result != null) {
						return(_self);
						//return(result);
	                }
	            }
	        };

	        /**
	         * [didDrawSelf description]
	         * @param  {[type]} bHitTest    hit test or not
	         * @return {object} object or undefined
	         */
	        this.didDrawSelf = function(bHitTest) {

	        };

			/**
				hit test for the all line-study object
				@param[in]	posval 	useless
				@return	object to be hit
				*/
			this.DrawSelectObj = function(posval) {
	            return(_self.didDrawObj(posval));
			};

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @param  {[type]} hitTestTool
			 * @return {[type]}
			 */
			this.didHitTest = function(posval, hitTestTool) {
				var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                var result = _self.m_arrUnits[ii].didHitTest(posval, hitTestTool);
	                if(result !== undefined && result != null) {
						return(_self);
	                }
	            }

				return;
			};


			/**
			 *
			 *
			 * @param {any} iMaxPrice
			 * @param {any} iMinPrice
			 * @param {any} posval
			 */
			this.DrawObj = function(iMaxPrice, iMinPrice, posval) {
				var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                _self.m_arrUnits[ii].DrawObj(iMaxPrice, iMinPrice, posval);
	            }

				if(_self.m_xDummyUnit !== undefined && _self.m_xDummyUnit != null) {
					_self.m_xDummyUnit.DrawObj(iMaxPrice, iMinPrice);
				}
			};

			this.ReceiveData = function() {
				// do nothing
			};

			this.SetBaseSize = function() {
				return true;
			};

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.isAvailableToCreateDummy = function(posval) {
				return(false);
			};

			// #2462
			this.isAvailableToMoveObject = function() {
				return;
			};
			//

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.SetTrendlineMove = function(posval) {
				if(_self.isAvailableToCreateDummy(posval) !== true) {
					return;
				}

				if(_self.m_xDummyUnit === undefined || _self.m_xDummyUnit == null) {
					_didCreateDummyObject();
				}

				if(_self.m_xDummyUnit === undefined || _self.m_xDummyUnit == null) {
					return;
				}

				_self.m_xDummyUnit.m_strTrendlineName = "Dummy";

				_self.m_xDummyUnit.SetMovePoint(posval);
				// console.debug("[WGC] SetTrendlineMove => " + JSON.stringify(posval));

				// #1811
				var xEnv = _self.didGetEnvInfo();
				xEnv.CrossLine.hide = true;
				//

				return(true);
			};

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @return {[type]}
			 */
			this.didStopEditMode = function(posval, argEvent) {
				var xEnv = _self.didGetEnvInfo();
				// #2566
				if(xEnv.System.DontUseAutoShowOepChange != true) {
					xEnv.CrossLine.hide = false; // #1811
				}
				//

				var xOepData = {
					symbol		: _self.m_doParent.m_symbolInfo,
					symbolCode	: _self.m_doParent.m_symbolInfo.strCode,
				};

				if(_self.m_xDummyUnit === undefined || _self.m_xDummyUnit == null) {

					if(xEnv.System.UseOneClickOepMode !== true) {
						return;
					}

					var reflector = (_self.m_drawWrapper && _self.m_drawWrapper.m_chartWrapper) ? _self.m_drawWrapper.m_chartWrapper : undefined;
					if(reflector) {
						if(_self.m_xObjectInfo) {
							if(_self.m_bOrder === true && _self.m_xObjectInfo.cancelableFlag === true) {
								if(reflector.didReflectCallForCancelOrder) {
									xOepData.event = xUtils.didClone(argEvent);
									xOepData.objectInfo = xUtils.didClone(_self.m_xObjectInfo);
									xOepData.isCancel = true;

									_self.m_drawWrapper.m_chartWrapper.didReflectCallForCancelOrder(xOepData);
								}
							}
							else if(_self.m_bOrder !== true && _self.m_xObjectInfo.checkSettlementFlag === true) {
								if(reflector.didReflectCallForExecutionOrder) {
									xOepData.event = xUtils.didClone(argEvent);
									xOepData.objectInfo = xUtils.didClone(_self.m_xObjectInfo);
									xOepData.isPosit = true;

									_self.m_drawWrapper.m_chartWrapper.didReflectCallForExecutionOrder(xOepData);
								}
							}
						}
					}

					return;
				}

				xOepData.objectInfo	= xUtils.didClone(_self.m_xDummyUnit.m_xObjectInfo);
				xOepData.isAmend	= true;
				xOepData.price 		= _self.m_xDummyUnit.m_xData1.curValue.y;
				xOepData.isOrder	= _self.m_bOrder;
				// #2545
				if(_self.didGetJointObjectInfosWithJointId) {
					xOepData.jointObjectInfos = _self.didGetJointObjectInfosWithJointId();
				}
				//

				// ダミー用のものは削除する。
				_didDestroyDummyUnit();

				//
				return(xOepData);
			};

			this.didGetOepObjectInfo = function() {
				if(!_self.m_doParent) {
					return;
				}

				var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                var xUnit = _self.m_arrUnits[ii];
	                if(xUnit && xUnit.m_bSelect) {
						//#2545
						var xOepObjectInfo = xUnit.didGetOepObjectInfo();
						if(_self.didGetJointObjectInfosWithJointId) {
							if(xOepObjectInfo) {
								xOepObjectInfo.jointObjectInfos = _self.didGetJointObjectInfosWithJointId();
							}
						}

						return(xOepObjectInfo);
						//
	                }
	            }

				return;
			};

			this.didGetEnvInfo = function() {
				return(_self.m_doParent.didGetEnvInfo());
			};

			// #1259
			this.didDrawLastValue = function(argDrawParam, dataIndex) {
				var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                var xUnit = _self.m_arrUnits[ii];
	                if(xUnit && xUnit.didDrawLastValue) {
						xUnit.didDrawLastValue(argDrawParam, dataIndex); // #1811
	                }
	            }

				// #1811
				if(_self.m_xDummyUnit && _self.m_xDummyUnit.didDrawLastValue) {
					_self.m_xDummyUnit.didDrawLastValue(argDrawParam, dataIndex);
				}
				//
			};
		};

	    var _doOrderContainer = function() {
	        //
			//
			//contextMenu
			var _self = this;

	        this.prototype = new _doOPContainerBase();
			_doOPContainerBase.apply(this, arguments);

	        this.m_bOrder = true;

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.isAvailableToCreateDummy = function(posval) {
				if(_self.m_xObjectInfo && _self.m_xObjectInfo.correctableFlag === true) {
					if(posval) {
						var nCount = _self.m_arrUnits.length;
						for(var ii = 0; ii < nCount; ii++) {
							var xUnit = _self.m_arrUnits[ii];
							if(xUnit && xUnit.m_bSelect) {
								try {
									if(Math.abs(xUnit.m_xData1.curPos.y - posval.YPos) > xUtils.constants.chartConfigConstants.OepAmendLimitPixel) {
										return(true);
									}
								}
								catch(e) {
									//
								}
								break;
							}
						}

						return(false);
					}

					return(true);
				}

				return(false);
			};

			// #2462
			this.isAvailableToMoveObject = function() {
				return(true);
			};
			//
	    };

	    var _doPositContainer = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doOPContainerBase();
			_doOPContainerBase.apply(this, arguments);

	        this.m_bOrder = false;

			/**
			 * [description]
			 * @return {[type]}
			 */
			this.isAvailableToCreateDummy = function(posval) {
				return(false);
			};
	    };

	    var _exports = {};

		_exports.didCreateOrderPositObject = function(bOrderOrPosit, chartFrame, drawWrapper, doParent, argObjectInfo) {
			var doLocal = null;

			if(bOrderOrPosit === true) {
				doLocal = new _doOrderContainer();
			}
			else {
				doLocal = new _doPositContainer();
			}

	        if(doLocal.didInitObject !== undefined) {
	            doLocal.didInitObject(chartFrame, drawWrapper, doParent, argObjectInfo);
	        }

			return(doLocal);
	    };

		// #1878
		_exports.didGetBaseExtraContainerClass = function() {
			return(_doOPContainerBase);
		};

		_exports.didGetOrderContainerClass = function() {
			return(_doOrderContainer);
		};

		_exports.didGetPositContainerClass = function() {
			return(_doPositContainer);
		};
		//

		return(_exports);
	};

	//console.debug("[MODUEL] Loading => chartDOOrderPosit");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOOrderPosit"] =
            loadModule(
                global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDOOrderPositUnit"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./canvas2DUtil"),
				require("./chartUtil"),
				require("./chartDOOrderPositUnit")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDOOrderPosit",
            ['ngc/canvas2DUtil', 'ngc/chartUtil', 'ngc/chartDOOrderPositUnit'],
                function(gxDc, xUtils, doOPUnitFactory) {
                    return loadModule(gxDc, xUtils, doOPUnitFactory);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOOrderPosit"] =
            loadModule(
                global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDOOrderPositUnit"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOOrderPosit");
})(this);
