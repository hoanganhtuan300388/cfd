(function(global){
	"use strict";

	var loadModule = function(gxDc, xUtils, doBaseClassFactory, doExtraUnitFactory) {
	    "use strict";

		//
		// class _DOPlot
		//
		var _doOPContainerBase    = doBaseClassFactory.didGetBaseExtraContainerClass();
		var _doOrderContainerBase = doBaseClassFactory.didGetOrderContainerClass();
		var _doPositContainerBase = doBaseClassFactory.didGetPositContainerClass();

		// order
	    var _doOrderContainerCFD = function() {
	        //
			//
			//contextMenu
			var _self = this;

	        this.prototype = new _doOrderContainerBase();
			_doOrderContainerBase.apply(this, arguments);

			this.didGetTooltipText = function(isOnly) {
				// 1927
				if(isOnly !== true && _self.m_xObjectInfo.orderJointId) {
					if(_self.m_doParent && _self.m_doParent.didGetDoOrdersWithJointId) {
						var jointOrders = _self.m_doParent.didGetDoOrdersWithJointId(_self.m_xObjectInfo.orderJointId);
						if(jointOrders && jointOrders.length > 0) {
							var jointTooltipText = "";

							for(var ii = 0; ii < jointOrders.length; ii++) {
								var doOrder = jointOrders[ii];
								if(doOrder) {
									var toolTipText = doOrder.didGetTooltipText(true);
									if(toolTipText) {
										jointTooltipText += toolTipText + "<br/>";
									}
								}
							}

							if(jointTooltipText.length > 0) {
								return(jointTooltipText);
							}
						}
					}
				}

				//
				if(_self.m_xObjectInfo) {
					return(_self.m_xObjectInfo.toolTipText)
				}
			};

			/**
	         * [didCreateUnit description]
	         * @return {[type]} [description]G
	         */
	        this.didCreateUnit = function(argUnitInfo) {
				// #2545
				if(_self.m_xObjectInfo === undefined || _self.m_xObjectInfo == null || _self.m_xObjectInfo.correctableFlag != true || _self.m_xObjectInfo.cancelableFlag != true) {
					return;
				}

	            var doExtraUnit = doExtraUnitFactory.didCreateOrderPositUnit(true, _self.m_chartFrame, _self.m_drawWrapper, _self.m_doParent, _self, argUnitInfo);

	            return(doExtraUnit);
	        };

			// #2545
			this.didGetJointObjectInfosWithJointId = function() {
				var doParent = _self.m_doParent;
				if(!doParent) {
					return;
				}

				if(doParent.didGetDoOrdersWithJointId) {
					try {
						var jointOrders = doParent.didGetDoOrdersWithJointId(_self.m_xObjectInfo.orderJointId);
						if(jointOrders && jointOrders.length > 0) {
							var nCount = jointOrders.length;
							var jointObjectInfos;
							for(var ii = 0; ii < nCount; ii++) {
								var doOrder = jointOrders[ii];
								if(doOrder && doOrder.m_bOrder == true && doOrder.m_xObjectInfo) {
									if(!jointObjectInfos) {
										jointObjectInfos = [];
									}

									jointObjectInfos.push(xUtils.didClone(doOrder.m_xObjectInfo));
								}
							}

							return(jointObjectInfos);
						}
					}
					catch(e) {
						console.error(e);
					}
				}
			};
			//
	    };

		// posit
	    var _doPositContainerCFD = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doPositContainerBase();
			_doPositContainerBase.apply(this, arguments);

			this.didGetTooltipText = function() {
				if(_self.m_xObjectInfo) {
					return(_self.m_xObjectInfo.toolTipText)
				}
			};

			/**
	         * [didCreateUnit description]
	         * @return {[type]} [description]G
	         */
	        this.didCreateUnit = function(argUnitInfo) {
	            var doExtraUnit = doExtraUnitFactory.didCreateOrderPositUnit(false, _self.m_chartFrame, _self.m_drawWrapper, _self.m_doParent, _self, argUnitInfo);

	            return(doExtraUnit);
	        };

			// #1298
			this.didHitTest = function(posval, hitTestTool, extraDrawParam) {
				var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                var result = _self.m_arrUnits[ii].didHitTest(posval, hitTestTool, extraDrawParam);
	                if(result !== undefined && result != null) {
						return(_self);
	                }
	            }

				return;
			};

			this.didDrawObj = function(posval, extraDrawParam) {
	            var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                var result = _self.m_arrUnits[ii].didDrawObj(posval, extraDrawParam);
	                if(result !== undefined && result != null) {
						return(_self);
						//return(result);
	                }
	            }
	        };

			this.DrawObjAtFixedPosX = function(posval, extraDrawParam) {
				var bHitTest = false;
				if(posval !== undefined && posval != null) {
					bHitTest = true;
				}

				_self.SetBaseSize();

	            _self.didDrawObj(posval, extraDrawParam);

			}; // end draw
	    };

		// Base
		var _doNonOrderBaseCFD = function() {
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

			this.didGetTooltipText = function() {
				if(_self.m_xObjectInfo) {
					return(_self.m_xObjectInfo.toolTipText)
				}
			};
		};

		var _doAlertContainerCFD = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doNonOrderBaseCFD();
			_doNonOrderBaseCFD.apply(this, arguments);

			this.m_bAlert = true;

			/**
	         * [didCreateUnit description]
	         * @return {[type]} [description]G
	         */
	        this.didCreateUnit = function(argUnitInfo) {
	            var doExtraUnit = doExtraUnitFactory.didCreateAlertUnit(_self.m_chartFrame, _self.m_drawWrapper, _self.m_doParent, _self, argUnitInfo);

	            return(doExtraUnit);
	        };

			// #2459
			this.isAvailableToCreateDummy = function(posval) {
				if(_self.m_xObjectInfo && _self.m_xObjectInfo.availableFlag == true) {
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
			//

			// #2462, #2459
			this.isAvailableToMoveObject = function() {
				return(true);
			};
			//
	    };

		var _doExecutionContainerCFD = function() {
	        //
			//
			//
			var _self = this;

	        this.prototype = new _doNonOrderBaseCFD();
			_doNonOrderBaseCFD.apply(this, arguments);

			this.m_bExecution = true;

			/**
	         * [didCreateUnit description]
	         * @return {[type]} [description]G
	         */
	        this.didCreateUnit = function(argUnitInfo) {
	            var doExtraUnit = doExtraUnitFactory.didCreateExecutionUnit(_self.m_chartFrame, _self.m_drawWrapper, _self.m_doParent, _self, argUnitInfo);

	            return(doExtraUnit);
	        };

			/**
	         * [didDrawObj description]
	         * @param  {[type]} posval [description]
	         * @return {[type]}        [description]
	         */
	        this.didDrawObj = function(posval, extraDrawParam) {
	            var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                var result = _self.m_arrUnits[ii].didDrawObj(posval, extraDrawParam);
	                if(result !== undefined && result != null) {
						return(_self);
						//return(result);
	                }
	            }
	        };

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @param  {[type]} hitTestTool
			 * @return {[type]}
			 */
			this.didHitTest = function(posval, hitTestTool, extraDrawParam) {
				var nUnitCount = _self.m_arrUnits.length;
	            for(var ii = 0; ii < nUnitCount; ii++) {
	                var result = _self.m_arrUnits[ii].didHitTest(posval, hitTestTool, extraDrawParam);
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
			this.DrawObjAtFixedPosX = function(posval, extraDrawParam) {
				var bHitTest = false;
				if(posval !== undefined && posval != null) {
					bHitTest = true;
				}

				_self.SetBaseSize();

	            _self.didDrawObj(posval, extraDrawParam);

			}; // end draw
	    };

	    var _exports = {};

		_exports.didCreateOrderPositObject = function(bOrderOrPosit, chartFrame, drawWrapper, doParent, argObjectInfo) {
			var doLocal = null;

			if(bOrderOrPosit === true) {
				doLocal = new _doOrderContainerCFD();
			}
			else {
				doLocal = new _doPositContainerCFD();
			}

	        if(doLocal.didInitObject !== undefined) {
	            doLocal.didInitObject(chartFrame, drawWrapper, doParent, argObjectInfo);
	        }

			return(doLocal);
	    };

		_exports.didCreateAlertObject = function(chartFrame, drawWrapper, doParent, argObjectInfo) {
			var doLocal = null;

			doLocal = new _doAlertContainerCFD();

	        if(doLocal.didInitObject !== undefined) {
	            doLocal.didInitObject(chartFrame, drawWrapper, doParent, argObjectInfo);
	        }

			return(doLocal);
	    };

		_exports.didCreateExecutionObject = function(chartFrame, drawWrapper, doParent, argObjectInfo) {
			var doLocal = null;

			doLocal = new _doExecutionContainerCFD();

	        if(doLocal.didInitObject !== undefined) {
	            doLocal.didInitObject(chartFrame, drawWrapper, doParent, argObjectInfo);
	        }

			return(doLocal);
	    };


		return(_exports);
	};

	//console.debug("[MODUEL] Loading => chartDOExtraCFD");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDOExtraCFD"] =
            loadModule(
                global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDOOrderPosit"],
				global["WGC_CHART"]["chartDOExtraUnitCFD"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./canvas2DUtil"),
				require("./chartUtil"),
				require("./chartDOOrderPosit"),
				require("./chartDOExtraUnitCFD")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDOExtraCFD",
            ['ngc/canvas2DUtil', 'ngc/chartUtil', 'ngc/chartDOOrderPosit', 'ngc/chartDOExtraUnitCFD'],
                function(gxDc, xUtils, doBaseClassFactory, doExtraUnitFactory) {
                    return loadModule(gxDc, xUtils, doBaseClassFactory, doExtraUnitFactory);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDOExtraCFD"] =
            loadModule(
                global["WGC_CHART"]["canvas2DUtil"],
				global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDOOrderPosit"],
				global["WGC_CHART"]["chartDOExtraUnitCFD"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDOExtraCFD");
})(this);
