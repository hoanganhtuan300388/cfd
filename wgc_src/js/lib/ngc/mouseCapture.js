(function(global){
	"use strict";

	var loadModule = function(xUtils) {
		"use strict";

		var mouseCapture = function() {
			var _self = this;

			this.onMouseMove = null;
			this.onMouseUp = null;

			this.onTouchMove = null;
			this.onTouchEnd = null;

			this.m_capturedObj = null;
			this.m_capturedObjForTouch = null;

			var _onMouseMove = function(event) {
				var __event = event || window.event;

				if(_self.onMouseMove !== undefined && _self.onMouseMove != null) {
					_self.onMouseMove.call(null, __event, _self.m_capturedObj);
				}

				xUtils.didStopPropagation(__event);
			};

			var _onMouseUp = function(event) {
				var __event = event || window.event;

				if(_self.onMouseUp !== undefined && _self.onMouseUp != null) {
					_self.onMouseUp.call(null, __event, _self.m_capturedObj);
				}

				_self.didStopCapture();
			};

			this.didStartCapture = function(domElem, mm, mu) {
				_self.m_capturedObj = domElem;

				_self.onMouseMove = mm;
				_self.onMouseUp = mu;

				var __targetElement = document;

				if (__targetElement.addEventListener) {
					__targetElement.addEventListener("mousemove", _onMouseMove, false);
					__targetElement.addEventListener("mouseup", _onMouseUp, false);
				} else if (__targetElement.attachEvent) {
					__targetElement.attachEvent("mousemove", _onMouseMove, false);
					__targetElement.attachEvent("mouseup", _onMouseUp, false);
				}
			};

			this.didStopCapture = function() {
				var __targetElement = document;

				if (__targetElement.removeEventListener) {
					__targetElement.removeEventListener("mousemove", _onMouseMove, false);
					__targetElement.removeEventListener("mouseup", _onMouseUp, false);
				} else if (__targetElement.detachEvent) {
					__targetElement.detachEvent("mousemove", _onMouseMove, false);
					__targetElement.detachEvent("mouseup", _onMouseUp, false);
				}

				_self.m_capturedObj = null;
				_self.onMouseMove = null;
				_self.onMouseUp = null;
			};

			var _onTouchEnd = function(event) {
				var __event = event || window.event;

				if(_self.onTouchEnd !== undefined && _self.onTouchEnd != null) {
					_self.onTouchEnd.call(null, __event, _self.m_capturedObjForTouch);
				}

				_self.didStopTouchCapture();
			};

			var _onTouchMove = function(event) {
				var __event = event || window.event;

				if(_self.onTouchMove !== undefined && _self.onTouchMove != null) {
					_self.onTouchMove.call(null, __event, _self.m_capturedObjForTouch);
				}

				xUtils.didStopPropagation(__event);
			};

			this.didStartTouchCapture = function(domElem, mm, mu) {
				_self.m_capturedObjForTouch = domElem;

				_self.onTouchMove = mm;
				_self.onTouchEnd = mu;

				var __targetElement = document;

				if (__targetElement.addEventListener) {
					__targetElement.addEventListener("touchmove", _onTouchMove, false);
					__targetElement.addEventListener("touchend", _onTouchEnd, false);
				} else if (__targetElement.attachEvent) {
					__targetElement.attachEvent("touchmove", _onMouseMove, false);
					__targetElement.attachEvent("touchend", _onMouseUp, false);
				}
			};

			this.didStopTouchCapture = function() {
				var __targetElement = document;

				if (__targetElement.removeEventListener) {
					__targetElement.removeEventListener("touchmove", _onTouchMove, false);
					__targetElement.removeEventListener("touchend", _onTouchEnd, false);
				} else if (__targetElement.detachEvent) {
					__targetElement.detachEvent("touchmove", _onTouchMove, false);
					__targetElement.detachEvent("touchend", _onTouchEnd, false);
				}

				_self.m_capturedObjForTouch = null;
				_self.onTouchMove = null;
				_self.onTouchEnd = null;
			};
		};

		return(mouseCapture);
	};

	//console.debug("[MODUEL] Loading => mouseCapture");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["mouseCapture"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"]
			);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
			loadModule(
				require("./chartUtil")
			);
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/mouseCapture", ['ngc/chartUtil'], function(xUtils) {
			return loadModule(xUtils);
		});
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["mouseCapture"] =
			loadModule(
				global["WGC_CHART"]["chartUtil"]
			);
    }

	//console.debug("[MODUEL] Loaded => mouseCapture");
})(this);
