(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc) {
		"use strict";

		var exports = function(chartWrapper, drawWrapper) {
			//
			// private
			//
			var _self = this;
			var _chartWrapper = chartWrapper;
			var _drawWrapper = drawWrapper;

			//
			this.OBJECT_NAME = "TOOLTIP_LAYOUT";

			this.m_chartWrapper = _chartWrapper;
			this.m_drawWrapper  = _drawWrapper;

			this.m_domElemRoot	= null;
			this.m_domElemDisp	= null;

			this.m_rectInfo = {
				x: 0, y: 0, width: 0, height: 0, lw: 0, rw: 0
			};

			_self.m_xSelectedExecutionObject = null;

			this.m_tooltipData;
			this.m_toolTipPosval;

			/**
			 * @param[in] initParam		initParam = {root : null, onMouseDown: null, onMouseMove: null, onClose: null}
			 */
			this.didInitElements = function(domElemRoot) {
				if(!domElemRoot) {
					return;
				}

				var xEnv = _self.didGetEnvInfo();

				_self.m_domElemRoot = domElemRoot;

				var __deParent = _self.m_domElemRoot;

				//
				_self.m_domElemDisp	= document.createElement("div");
				_self.m_domElemDisp.setAttributeNS( null, "id", "eidTooltipPanelItem");
				_self.m_domElemDisp.className = "classTooltipPanelItem";
				_self.m_domElemDisp.style.position = "absolute";

				//
				_self.m_domElemRoot.appendChild(_self.m_domElemDisp);
			};

			/**
			 * init panel
			 *
			 * @param[in] bMainFrame	is mainframe or not
			 * @param[in] initParam		initParam = {root : null, onMouseDown: null, onMouseMove: null, onClose: null}
			 */
			this.didInitPanel = function(domElemRoot) {
				//
				_self.didInitElements(domElemRoot);
			};

			this.didGetEnvInfo = function() {
				return(_self.m_drawWrapper.didGetEnvInfo());
			};

			this.isShown = function() {
				if(!_self.m_domElemDisp || !_self.m_domElemDisp.style || _self.m_domElemDisp.style.visibility == "hidden") {
					return(false);
				}

				return(true);
			}

			this.didShowTooltip = function(isShow, posval, tooltipData, limitRect) {
				try {
					var xEnv = _self.didGetEnvInfo();

					if(isShow == true) {
						var newPosval = {
							XPos : posval.XPos,
							YPos : posval.YPos + xEnv.TooltipOffset
						};

						var checkPosval = {
							XPos : newPosval.XPos + _self.m_domElemDisp.offsetWidth,
							YPos : newPosval.YPos + _self.m_domElemDisp.offsetHeight
						};

						if(limitRect) {
							if(checkPosval.XPos > (limitRect.x + limitRect.width)) {
								newPosval.XPos = posval.XPos - (_self.m_domElemDisp.offsetWidth);
							}

							if(checkPosval.YPos > (limitRect.y + limitRect.height)) {
								newPosval.YPos = posval.YPos - (xEnv.TooltipOffset + _self.m_domElemDisp.offsetHeight);
							}
						}

						_self.m_domElemDisp.innerHTML = tooltipData;
						console.log(_self.m_domElemDisp.offsetHeight);
						if(_self.isShown() !== true || (_self.m_tooltipData && _self.m_tooltipData != tooltipData)) {
							if(newPosval) {
								_self.m_domElemDisp.style.left = newPosval.XPos + "px";
								_self.m_domElemDisp.style.top  = newPosval.YPos + "px";
							}
						}

						_self.m_tooltipData = tooltipData;
						_self.m_toolTipPosval = xUtils.didClone(newPosval);
						_self.m_domElemDisp.style.visibility = "visible";
					}
					else {
						_self.m_domElemDisp.style.visibility = "hidden";
					}
				}
				catch(e) {
					console.error(e);
				}
			};

			this.didDestroy = function() {
				if(_self.m_domElemRoot) {
					_self.m_domElemRoot.removeChild(_self.m_domElemDisp);
				}

				_self.m_domElemRoot = null;
				_self.m_domElemDisp = null;

				_self.m_chartWraper = null;
				_self.m_ctrlLayout = null;
			};
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDrawPanelTooltip");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDrawPanelTooltip"] =
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
        define("ngc/chartDrawPanelTooltip",
            ['ngc/chartUtil', 'ngc/canvas2DUtil'],
                function(xUtils, gxDc) {
                    return loadModule(xUtils, gxDc);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDrawPanelTooltip"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["canvas2DUtil"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDrawPanelTooltip");
})(this);
