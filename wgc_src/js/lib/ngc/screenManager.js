(function(global){
	"use strict";

	var loadModule = function() {
		"use strict";

		var exports = function() {
			var _self = this;

			this.name = '';
			this.arrScr = [];

			this.push = function(obj){
				_self.arrScr.push( obj );
			};

			this.pop = function(){
				return _self.arrScr.pop( );
			};

			this.remove = function(ele){
				for( var i in scrMng.arrScr )
				{
					if( _self.arrScr[i] == ele )
					{
						_self.arrScr.splice(i,1);
						return;
					}
				}
			};

			this.find = function(ele){
				for( var i in _self.arrScr )
				{
					if( _self.arrScr[i].getElement() == ele )
					{
						return _self.arrScr[i];
					}
				}
				return null;
			};

			this.count = function(){
				return _self.arrScr.length;
			};
		};

	    return(exports);
	};

	//console.debug("[MODUEL] Loading => screenManager");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["screenManager"] = loadModule();
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] = loadModule();
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/screenManager", [], function() { return loadModule(); });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["screenManager"] = loadModule();
    }

	//console.debug("[MODUEL] Loaded => screenManager");
 })(this);
