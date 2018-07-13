(function(global){
	"use strict";

	var loadModule = function(sm) {
		var scrMng = sm;

		//
		// Screen
		//
		var Screen = function(id) {
			var _self = this;
			var _scrMng = sm;

			this._scrMng = _scrMng;

			// element id
			this._id = id;
			// parent element
			this._parent = null;
			// this element
			this._$object = null;
			// data loader
			this._arrDatLoader = [];
			// onload method
			this._onLoad = null;

			// local
			var _object = null;
			var _classRef = this;

			//this._classRef = this;

			this.method = {
				classObj : this
			};

			//-------------------------------------------------------------------------
			// public function
			// par - parent element.
			//-------------------------------------------------------------------------
			this.method.create = function( parent, url, option, onLoad ){
		// console.debug("[WGC] Screen.method.create");
				// Screen object
				var ref = this.classObj;

				// set to local reference
				_classRef = ref;

				// create div element
				ref._object = document.createElement( "div" );

				// jquery
				ref._$object = $(ref._object);
				ref._$object.addClass( "Screen" );

				// set id
				ref._object.id = ref._id;//makeScrID( ref._id.split("_")[1] );

				//
				// append to child
				//
				if( parent !== null )
					ref._$object.appendTo( $(parent) );
				else
					document.body.appendChild( ref._object );

				// set css style
				ref._$object.css( option );

				// set parent
				ref._parent = parent;
				// set onload method
				ref._onLoad	= onLoad;

				// add to screen list
				// TODO: fix
				//scrMng.push( ref );

				// URL load
				if( url && url.length > 0 )
				{
					var scr = new ScrLoader( ref._object, url );
					scr.loadScreen( ref.method.onLoad );
				}
				// just load
				else
				{
					onLoad();
				}

				// return element
				return(ref._object);
			};

			this.method.attach = function( url, onLoad ){
				var ref = this.classObj;

		// console.debug("[WGC] :" + ref);

				_classRef = ref;
				this._classRef = ref;

				// create div element
				ref._object = document.getElementById( ref._id );

				if( ref._object )
				{
					ref._$object = $(ref._object);

					ref._parent  = ref._object.offsetParent;
					ref._onLoad	 = onLoad;

					ref._$object.addClass( "Screen" );

					//LoadScreen( ref._$object, url, ref.method._onLoad );
					var scr = new ScrLoader( ref._object, url );
					scr.loadScreen( ref.method.onLoad );

					// TODO:
					// scrMng.push( ref );

					return ref._object;
				}

				return null;
			};

			this.method.attachToTarget = function(jqElemTarget){
				var ref = this.classObj;

				_classRef = ref;
				this._classRef = ref;

				// create div element
				ref._object = jqElemTarget.get(0);
				ref._$object = jqElemTarget;

				if(ref._object) {
					ref._parent  = ref._object.offsetParent;

					ref._$object.addClass("Screen");

					return ref._object;
				}

				return null;
			};


			/**
				call onload callback method
				*/
			this.method.onLoad = function()
			{
				if ( ( _classRef._onLoad !== undefined ) && ( _classRef._onLoad !== null ) )
				{
					//_classRef._onLoad(_classRef._$object);
					_classRef._onLoad(_classRef);
				}
			};

			this.method.destroy = function(){
				var ref = this.classObj;

				ref.clearDataLoader();
			};

			this.method.onClose = function(){
				var ref = this.classObj;
				var $obj = $( ref.getElement() );

				// TODO:
				//scrMng.remove( ref );

				$obj.remove();

				//_log( "screen::onClose");
			};

			this.getElement = function(){
				return this._object;
			};
		}

		return(Screen);
	};

	//console.debug("[MODUEL] Loading => screen");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["screen"] =
			loadModule(
				global["WGC_CHART"]["screenManager"]
			);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
			loadModule(
				require("./screenManager")
			);
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define('ngc/screen',
			['ngc/screenManager'],
				function(screenManager) {
					return loadModule(screenManager);
				});
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["screen"] =
			loadModule(
				global["WGC_CHART"]["screenManager"]
			);
    }

	//console.debug("[MODUEL] Loaded => screen");
 })(this);
