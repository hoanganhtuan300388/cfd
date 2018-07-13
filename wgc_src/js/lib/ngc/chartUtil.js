(function(global){
	"use strict";

	var loadModule = function(gxDc) {
		"use strict";

		// 存在チェック
		if (String.prototype.formatString == undefined) {
			/**
			 * フォーマット関数
			 */
			String.prototype.formatString = function(arg) {
				// 置換ファンク
				var rep_fn = undefined;

				// オブジェクトの場合
				if (typeof arg == "object") {
					rep_fn = function(m, k) { return arg[k]; }
				}
				// 複数引数だった場合
				else {
					var args = arguments;
					rep_fn = function(m, k) { return args[ parseInt(k) ]; }
				}

				return this.replace( /\{(\w+)\}/g, rep_fn );
			}
		}

		/*
			@fliptopbox

			LZW Compression/Decompression for Strings
			Implementation of LZW algorithms from:
			http://rosettacode.org/wiki/LZW_compression#JavaScript
			Usage:
			var a = 'a very very long string to be squashed';
			var b = a.compress(); // 'a veryāăąlong striċ to bečquashed'
			var c = b.uncompress(); // 'a very very long string to be squashed'
			// console.debug("[WGC] :" + a === c); // True
			var d = a.compress(true); // return as Array
			// console.debug("[WGC] :" + d); // [97, 32, 118 .... 101, 100] an Array of ASCII codes
		*/

		if (String.prototype.compress == undefined) {
			String.prototype.compress = function (asArray) {
				"use strict";
				// Build the dictionary.
				asArray = (asArray === true);
				var i,
					dictionary = {},
					uncompressed = this,
					c,
					wc,
					w = "",
					result = [],
					ASCII = '',
					dictSize = 256;
				for (i = 0; i < 256; i += 1) {
					dictionary[String.fromCharCode(i)] = i;
				}

				for (i = 0; i < uncompressed.length; i += 1) {
					c = uncompressed.charAt(i);
					wc = w + c;
					//Do not use dictionary[wc] because javascript arrays
					//will return values for array['pop'], array['push'] etc
				   // if (dictionary[wc]) {
					if (dictionary.hasOwnProperty(wc)) {
						w = wc;
					} else {
						result.push(dictionary[w]);
						ASCII += String.fromCharCode(dictionary[w]);
						// Add wc to the dictionary.
						dictionary[wc] = dictSize++;
						w = String(c);
					}
				}

				// Output the code for w.
				if (w !== "") {
					result.push(dictionary[w]);
					ASCII += String.fromCharCode(dictionary[w]);
				}
				return asArray ? result : ASCII;
			};
		}

		if (String.prototype.decompress == undefined) {
			String.prototype.decompress = function () {
				"use strict";
				// Build the dictionary.
				var i, tmp = [],
					dictionary = [],
					compressed = this,
					w,
					result,
					k,
					entry = "",
					dictSize = 256;
				for (i = 0; i < 256; i += 1) {
					dictionary[i] = String.fromCharCode(i);
				}

				if(compressed && typeof compressed === 'string') {
					// convert string into Array.
					for(i = 0; i < compressed.length; i += 1) {
						tmp.push(compressed[i].charCodeAt(0));
					}
					compressed = tmp;
					tmp = null;
				}

				w = String.fromCharCode(compressed[0]);
				result = w;
				for (i = 1; i < compressed.length; i += 1) {
					k = compressed[i];
					if (dictionary[k]) {
						entry = dictionary[k];
					} else {
						if (k === dictSize) {
							entry = w + w.charAt(0);
						} else {
							return null;
						}
					}

					result += entry;

					// Add w+entry[0] to the dictionary.
					dictionary[dictSize++] = w + entry.charAt(0);

					w = entry;
				}
				return result;
			};
		}

		/*
		if(Array.prototype.insertAt === undefined) {
			Array.prototype.insertAt = function(i, rest) {
			  return this.slice(0,i).concat(rest,this.slice(i));
			}
		}
		*/


		/**
		 * @class CChartTrendlineObj
		 *
		 */
		var _ChartUtils = {};

		_ChartUtils.debug = {};

		_ChartUtils.debug.staticCount = 0;

		_ChartUtils.debug.modeOn = true;

		_ChartUtils.debug.logDebug = function(str) {
			if(_ChartUtils.debug.logger) {
				_ChartUtils.debug.logger.debug(str);
			}
			else {
				 console.debug('[WGC][LOG:D] ' + str);
			}
		};

		_ChartUtils.debug.logTrace = function(str) {
			console.debug('[WGC][LOG:T] ' + str);
		};

		_ChartUtils.debug.logInfo = function(str) {
			console.debug('[WGC][LOG:I] ' + str);
		};

		_ChartUtils.debug.logWarn = function(str) {
			console.debug('[WGC][LOG:W] ' + str);
		};

		_ChartUtils.debug.logError = function(str) {
			console.debug('[WGC][LOG:E] ' + str);
		};

		_ChartUtils.debug.log = function(str, level) {
			if (level === 'trace') {
				_ChartUtils.debug.logTrace(str);
			} else if (level === 'info') {
				_ChartUtils.debug.logInfo(str);
			} else if (level === 'warn') {
				_ChartUtils.debug.logWarn(str);
			} else if (level === 'error') {
				_ChartUtils.debug.logError(str);
			} else {
				_ChartUtils.debug.logDebug(str);
			}
		}

		_ChartUtils.debug.formattedLog = function(level, strFormat) {
			var argLen = arguments.length;
			var strLog = strFormat;
			if(argLen > 1) {
				if(strFormat.formatString !== undefined) {
					var arrData = [];
					for(var ii = 2; ii < argLen; ii++) {
						arrData.push(arguments[ii]);
					}
					strLog = strFormat.formatString(arrData);
				}
			}

			_ChartUtils.debug.log(strLog, level);
		}

		_ChartUtils.debug.logForCompareValue = function(prefix, argOld, argNew, level) {
			var str = prefix + ' => Old(' + argOld + '), New(' + argNew + ')';
			_ChartUtils.debug.log(str, level);
		};

		_ChartUtils.debug.getTimeZoneInfo = function(argSymbolCode) {
			// TODO: for just
			if($.ngcModule !== undefined) {
				if($.ngcModule.hasOwnProperty('testUnitsChart') === true) {
					return($.ngcModule.testUnitsChart.getTimeZoneInfo(argSymbolCode));
				}
			}

			return;
		};

		_ChartUtils.debug.getSymbolCodes = function() {
			// TODO: for just
			if($.ngcModule !== undefined) {
				if($.ngcModule.hasOwnProperty('testUnitsChart') === true) {
					return($.ngcModule.testUnitsChart.getSymbolCodes());
				}
			}

			return;
		};

		/**
		 * [didGetDataSimulator description]
		 * @return {[type]} [description]
		 */
		_ChartUtils.debug.didGetDataSimulator = function() {
			// TODO: for just
			if($.ngcModule !== undefined) {
				if($.ngcModule.hasOwnProperty('testUnitsChart') === true) {
					return($.ngcModule.testUnitsChart.getDataSimulator());
				}
			}

			return;
		};

		/**
		 * [didGetOrderPositSimulator description]
		 * @return {[type]} [description]
		 */
		_ChartUtils.debug.didGetOrderPositSimulator = function() {
			// TODO: for just
			if($.ngcModule !== undefined) {
				if($.ngcModule.hasOwnProperty('testUnitsChart') === true) {
					return($.ngcModule.testUnitsChart.getOrderPositSimulator());
				}
			}

			return;
		};

		//
		//
		//
		//_ChartUtils.SI

		//
		// Color
		//

		_ChartUtils.color = {};
		_ChartUtils.color.tables = {
			keywords : {

			},
			lists : [
				"#D61004",
				"#86D2B5",
				"#CDCB00",
				"#E96126",
				"#FCC507",

				"#44B3C2",
				"#F1A94E",
				"#E45641",
				"#5D4C46",
				"#7B8D8E",
				"#F2EDD8",
			]
		};

		_ChartUtils.color.invertColor = function(hexTripletColor) {
			try {
		        var color = hexTripletColor;
		        color = color.substring(1); // remove #
		        color = parseInt(color, 16); // convert to integer
		        color = 0xFFFFFF ^ color; // invert three bytes
		        color = color.toString(16); // convert to hex
		        color = ("000000" + color).slice(-6); // pad with leading zeros
		        color = "#" + color; // prepend #
		        return color;
			}
			catch(e) {
				console.debug(e);
			}

			return(hexTripletColor);
	    };

		//
		//
		//
		_ChartUtils.shapes = {};
		_ChartUtils.shapes.RECT = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};

		_ChartUtils.shapes.SIZE = {
			cx: 0,
			cy: 0
		};

		_ChartUtils.shapes.POINT = {
			x: 0,
			y: 0
		};

		_ChartUtils.shapes.didGetDefaultRect = function() {
			return(_ChartUtils.didClone(_ChartUtils.shapes.RECT));
		};

		_ChartUtils.shapes.didGetDefaultSize = function() {
			return(_ChartUtils.didClone(_ChartUtils.shapes.SIZE));
		};

		_ChartUtils.shapes.didGetDefaultPoint = function() {
			return(_ChartUtils.didClone(_ChartUtils.shapes.POINT));
		};

		_ChartUtils.shapes.SetRect = function(rect, x, y, width, height) {
			if(typeof rect === "object") {
				rect.x = x;
				rect.y = y;
				rect.width = width;
				rect.height = height;
			}
		};

		_ChartUtils.shapes.InflateRect = function(rect, x, y) {
			if(typeof rect === "object") {
				rect.x -= x;
				rect.y -= y;
				rect.width += x * 2;
				rect.height += y * 2;
			}
		};

		_ChartUtils.shapes.Rect = {};
		_ChartUtils.shapes.Rect.Contains = function(pos, rect, useBorder) {
			if(pos === undefined || pos == null || rect === undefined || rect == null) {
				return(false);
			}

			if(useBorder === true) {
				if((pos.x >= rect.x && pos.x <= (rect.x + rect.width)) && (pos.y >= rect.y && pos.y <= (rect.y + rect.height))) {
					return(true);
				}
			}
			else {
				if((pos.x > rect.x && pos.x < (rect.x + rect.width)) && (pos.y > rect.y && pos.y < (rect.y + rect.height))) {
					return(true);
				}
			}

			return(false);
		};

		_ChartUtils.shapes.posInRect = function(pos, rect, useBorder) {
			if(pos === undefined || pos == null || rect === undefined || rect == null) {
				return(false);
			}

			if(useBorder === true) {
				if((pos.x >= rect.x && pos.x <= (rect.x + rect.width)) && (pos.y >= rect.y && pos.y <= (rect.y + rect.height))) {
					return(true);
				}
			}
			else {
				if((pos.x > rect.x && pos.x < (rect.x + rect.width)) && (pos.y > rect.y && pos.y < (rect.y + rect.height))) {
					return(true);
				}
			}

			return(false);
		};

		_ChartUtils.shapes.posvalInRect = function(posval, rect, useBorder) {
			if(posval === undefined || posval == null || rect === undefined || rect == null) {
				return(false);
			}

			if(useBorder === true) {
				if((posval.XPos >= rect.x && posval.XPos <= (rect.x + rect.width)) && (posval.YPos >= rect.y && posval.YPos <= (rect.y + rect.height))) {
					return(true);
				}
			}
			else {
				if((posval.XPos > rect.x && posval.XPos < (rect.x + rect.width)) && (posval.YPos > rect.y && posval.YPos < (rect.y + rect.height))) {
					return(true);
				}
			}

			return(false);
		};


		//
		// モバイルのゼスチャーを処理するためのもの
		//
		_ChartUtils.mobileGesture = {};
		_ChartUtils.mobileGesture.swipeConfig = {
			durationThreshold : 500,			// More time than this, and it isn't a swipe.
			horizontalDistanceThreshold : 30,	// Swipe horizontal displacement must be more than this.
			verticalDistanceThreshold : 30		// Swipe vertical displacement must be less than this.
		};

		/**
		 * swipe start
		 * @param  {[type]} posval
		 * @return {[type]}
		 */
		_ChartUtils.mobileGesture.swipeStart = function(posval) {
			var timeStamp = new Date().getTime();

			var swipeEvent = {
				swipestart : {
					coords : [posval.XPos, posval.YPos],
					time : timeStamp
				},
				swipestop : {
					coords : [posval.XPos, posval.YPos],
					time : timeStamp
				},
				isTrigger : false,
				type : undefined,
				changed : {
					coords : [0, 0],
					time : 0
				}
			};

			return(swipeEvent);
		};

		/**
		 * swipe move
		 * @param  {[type]} swipeEvent
		 * @param  {[type]} posval
		 * @return {[type]}
		 */
		_ChartUtils.mobileGesture.swipeMove = function(swipeEvent, posval) {
			if(swipeEvent === undefined || swipeEvent == null) {
				return;
			}

			var timeStamp = new Date().getTime();

			swipeEvent.swipestop.coords[0] = swipeEvent.swipestart.coords[0];
			swipeEvent.swipestop.coords[1] = swipeEvent.swipestart.coords[1];
			swipeEvent.swipestop.time = swipeEvent.swipestart.time;

			swipeEvent.swipestart.coords[0] = posval.XPos;
			swipeEvent.swipestart.coords[1] = posval.YPos;
			swipeEvent.swipestart.time = timeStamp;
			swipeEvent.isTrigger = false;

			return(swipeEvent);
		};

		/**
		 * swipe end
		 * @param  {[type]} swipeEvent
		 * @param  {[type]} posval
		 * @return {[type]}
		 */
		_ChartUtils.mobileGesture.swipeEnd = function(swipeEvent, posval) {
			if(swipeEvent === undefined || swipeEvent == null) {
				return;
			}

			var timeStamp = new Date().getTime();

			swipeEvent.swipestop.coords[0] = posval.XPos;
			swipeEvent.swipestop.coords[1] = posval.YPos;
			swipeEvent.swipestop.time = timeStamp;

			var horizontalDistanceThreshold = _ChartUtils.mobileGesture.swipeConfig.horizontalDistanceThreshold;
			var durationThreshold = _ChartUtils.mobileGesture.swipeConfig.durationThreshold;

			var distanceCheck = swipeEvent.swipestop.coords[0] - swipeEvent.swipestart.coords[0];
			var durationCheck = swipeEvent.swipestop.time - swipeEvent.swipestart.time;

			swipeEvent.changed.coords[0] = distanceCheck;
			swipeEvent.changed.time = durationCheck;

			// 移動距離が制限以下、経過時間が制限以下の場合のみ適用する。
			if(Math.abs(distanceCheck) >= horizontalDistanceThreshold && durationCheck <= durationThreshold) {
				swipeEvent.isTrigger = true;
				swipeEvent.type = distanceCheck < 0 ? "swipeleft" : "swiperight";

				return(swipeEvent);
			}

			//
			return;
		};

		//
		//
		//
		_ChartUtils.smoothScroll = {};
		_ChartUtils.smoothScroll.config = {
			minimumMiliseconds : 10,
			spline : null,//new KeySpline(0.25, 0.9, 0.1, 1.0),
			velocityMax : 4,
			velocityRange : 0.25,
			secondsFactor : 1000,
			frame : 15,
			duration : 3,
			timerFactor : 10,
			overflowFactor : 5,
			overflowDefaultCount : 20,
			distanceFactor : 1,
			maxDistanceFactor : 5
		};

		/**
		 * [description]
		 * @param  {Boolean} isLeft
		 * @param  {[type]}  initialFactor
		 * @param  {[type]}  velocityFactor
		 * @param  {[type]}  duration
		 * @param  {[type]}  frame
		 * @param  {[type]}  timerFactor
		 * @param  {[type]}  overflowFactor
		 * @param  {[type]}  overflowDefaultCount
		 * @return {[type]}
		 */
		_ChartUtils.smoothScroll.didGetBezierCurveInfo = function(initialFactor, distanceFactor, duration, frame, timerFactor, overflowFactor, overflowDefaultCount) {
			// 結果データ
			var result = {
				timerMs : 10,
				overLimit : 100,
				direction : -1,
				datas : []
			};

			// 基本パラメータ
			var velocityMax = _ChartUtils.smoothScroll.config.velocityMax;
			var velocityRange = _ChartUtils.smoothScroll.config.velocityRange;
			var secondsFactor = _ChartUtils.smoothScroll.config.secondsFactor;

			// 可変パラメータの初期値を設定する。
			frame = (frame === undefined || frame == null) ? _ChartUtils.smoothScroll.config.frame : frame;
			duration = (duration === undefined || duration == null) ? _ChartUtils.smoothScroll.config.duration : duration;
			timerFactor = (timerFactor === undefined || timerFactor == null) ? _ChartUtils.smoothScroll.config.timerFactor : timerFactor;
	        overflowFactor = (overflowFactor === undefined || overflowFactor == null) ? _ChartUtils.smoothScroll.config.overflowFactor : overflowFactor;
	        overflowDefaultCount = (overflowDefaultCount === undefined || overflowDefaultCount == null) ? _ChartUtils.smoothScroll.config.overflowDefaultCount : overflowDefaultCount;

			//
			// pixel per bar
			// 移動距離を幅で補正するためのパラメータ
			distanceFactor = (distanceFactor === undefined || distanceFactor == null || distanceFactor === 0) ? _ChartUtils.smoothScroll.config.distanceFactor : distanceFactor;
			if(distanceFactor > 1) {
				distanceFactor = Math.sqrt(distanceFactor);
			}
			distanceFactor = Math.min(_ChartUtils.smoothScroll.config.maxDistanceFactor, distanceFactor);

			//
			// 速度補正パラメータ
			var velocityFactor = 1 / distanceFactor;
			// 実行補正パラメータ（繰り返し補正パラメータ）
			var newDistanceFactor = _ChartUtils.smoothScroll.config.distanceFactor;

			// spline
	        var spline = _ChartUtils.smoothScroll.config.spline;
			if(spline === undefined || spline == null) {
				spline =
				_ChartUtils.smoothScroll.config.spline = new KeySpline(0.25, 0.9, 0.1, 1.0);
			}

			var initialRatio   = 0;	// 初期位置を指定する比率
	        var timeRangeRatio = 1;	// duration補正用比率
	        var overflowCount  = 0;	// ストップ条件があってもすぐ止まらないような補正数
			var direction = 1;
			// initial energy or velocity
			if(initialFactor !== undefined && initialFactor != null) {
				if(initialFactor >= 0) {
					// right
					direction = 1;
				}
				else {
					// left
					direction = -1;
					initialFactor = initialFactor * -1;
				}

				// 移動距離補正は「初期速度＋速度パラメータ」
				newDistanceFactor = Math.max(1, velocityFactor + initialFactor);

				// 初期位置パラメータを制限で補正する。
				initialFactor = Math.max(Math.min(velocityMax, initialFactor), 0.01);

				// 初期位置美率を取得する。
	            initialRatio = (1 - initialFactor / velocityMax) * velocityRange;

				// データが0 ~ 1の値で逆データを取る。
	            timeRangeRatio = (1 - spline.get(initialFactor / velocityMax)) * timerFactor;
				// overflow数を取得する。
	            overflowCount = (1 - spline.get(initialFactor / velocityMax)) * overflowFactor;
	        }

			// 方向
			result.direction = direction;

			// 実行時間
	        var timeRange = duration * secondsFactor * timeRangeRatio * velocityFactor;

			// 実行数
	        var loop = frame * duration * newDistanceFactor;

			// 実行間隔
	        result.timerMs = Math.max(_ChartUtils.smoothScroll.config.minimumMiliseconds, parseInt(timeRange / loop));

			// 急に止まることを防ぐための残数補正
			result.overLimit = overflowCount + overflowDefaultCount;

			// 初期位置
	        var startIndex = 1 + Math.round(initialRatio * loop);
			// 移動距離計算のための時間
	        var milliSecondsForFrame = secondsFactor / frame;

			// データ作成
			for(var ii = startIndex; ii < loop; ii++) {
				var splineX = ii / loop;
				var splineY = (1 - spline.get(splineX));
				//
				// 瞬間速度 = spline * 速度補正 * 方向
				//
				var velocity = splineY * velocityFactor * direction;
				//
				var distance = velocity * milliSecondsForFrame;

				// 結果
				result.datas.push({
					splineX : splineX,
					splineY : splineY,
					velocity : velocity,
					distance : distance,
					no : ii
				});
			};

			//
			// TODO: [DEBUG]
			//
			result.debug = {
				frame : frame,
				duration : duration,
				timerFactor : timerFactor,
				overflowFactor : overflowFactor,
				overflowDefaultCount : overflowDefaultCount,
				initialRatio : initialRatio,
				timeRangeRatio : timeRangeRatio,
				overflowCount : overflowCount,
				initialFactor : initialFactor,
				timeRange : timeRange,
				distanceFactor : distanceFactor,
				velocityFactor : velocityFactor,
				newDistanceFactor : velocityFactor * initialFactor
			};

			//
			return(result);
		};

		//
		// data converter
		//
		_ChartUtils.dataConverter = {};

		_ChartUtils.dataConverter.requestInfo = {
			nDIdx       : 0,    /** data index */
	        nEType      : 0,    /** exchange type */
	        nMType      : 0,    /** market type ( STOCK ... ) */
	        nPType      : 0,    /** price type ( price: 0x04, ask: 0x01, bid: 0x02 ) */

	        nBCnt       : 0,    /** bar count */
	        nTType      : 0,    /** time type */
			nTGap       : 1,	/** time gap(only minute) */

	        nPValCrt    : 0,    /** point value for chart */
	        nPValOep    : 0,    /** point value for order & position */

	        nGaps       : [1, 1, 1, 1, 1, 1, 1],    /** time gaps */
	        strName     : '',                       /** symbol name */
	        strCode     : '',                       /** symbol code */
	        strTime     : '',                       /**   */

	        nSTime      : 0,    /** start time */
	        nETime      : 0,    /** end   time */
	        nCType      : 0,    /** period & count call type ( BAR OR PERIOD OR NOW ) */

	        bRemains    : false,    /** remains flag */

	        bN_MPrice   : false,    /** apply or not modified price(useless in FX) */

	        // NO-CONTROL PARAM
	        nDType      : 0,    /** Drawing type */

	        nTickCount  : 0,    /** tick remain... */

	        // CHANGE FLAG
	        bChanged    : false,    /** only code changed flag */
	        bRequest    : false,    /** requestable flag */

	        bComplete   : false,    /** request complete flag */

	        // ETC
	        nCallPage   : 0,    /** current calling page */
	        nCallCount  : 0,    /** total called count */
	        nEDate4Call : 0,    /** end data for request period type request needs time in next key */
	        bUseMultiVal: false,    /** use adjusted price in point value or original value */
	        strDispExtra: '',   /** extra data for display */
	        strDispTab  : '',   /** display data for Tab */
	        bLoadFlag   : false,    /** loaded flag. on load data, to do special process, flag on -> do process -> flag off */

	        // TIME LIMIT
	        nServerDate : 0,    /** server date */
	        nSWorkTime  : 0,    /** start working time ( symbol & day dependence ) */
	        nEWorkTime  : 0,    /** end   working time ( symbol & day dependence ) */

			//
			requestCode : "",
			receiveInfo : {},

	        // DUMMY
	        dummy : 0
	    };

		_ChartUtils.dataConverter.didGetDefaultRequestInfo = function() {
			return(_ChartUtils.didClone(_ChartUtils.dataConverter.requestInfo));
		};

		_ChartUtils.dataConverter.didCalcAverageCandle = function(argData, isFull) {
			if(argData !== undefined && argData != null) {
				try {
					var __nCount = argData.length;
					if(__nCount < 2) {
						return(false);
					}

					var __nStart = 1;
					if(isFull !== true) {
						__nStart = __nCount - 1;
					}

					for(var __ii = __nStart; __ii < __nCount; __ii++) {
						var __stPricePre = argData[__ii - 1];
						var __stPriceRef = argData[__ii];

						if(!__stPriceRef || !__stPricePre) {
							continue;
						}

						//
						// 始値：一本前の足の（始値＋終値）÷２
						// 終値：現在の足の（始値＋高値＋安値＋終値）÷４
						var __avgOpen  = Math.round((__stPricePre.open + __stPricePre.close) * 0.5);
						var __avgClose = Math.round((__stPriceRef.open + __stPriceRef.high + __stPriceRef.low + __stPriceRef.close) * 0.25);

						__stPriceRef.avgOpen = __avgOpen;
						__stPriceRef.avgClose = __avgClose;
					}

					return(true);
				}
				catch(e) {
					console.error(e);
				}

				return(false);
			};
		};

		_ChartUtils.dataConverter.didCalcCompareData = function(argData, pointValue, isFull) {
			if(argData !== undefined && argData != null) {
				try {
					var __nCount = argData.length;
					if(__nCount < 1) {
						return(false);
					}

					pointValue = pointValue || 0; // #1443
					pointValue = Math.max(0, pointValue);
					var __pow = Math.pow(10, pointValue);

					var __stPriceBase = argData[0];

					var __nStart = 0;
					if(isFull !== true) {
						__nStart = __nCount - 1;
					}

					for(var __ii = __nStart; __ii < __nCount; __ii++) {
						var __stPriceRef = argData[__ii];

						if(!__stPriceRef) {
							continue;
						}

						if(!__stPriceBase) {
							__stPriceRef.compareData = 0;
							continue;
						}

						//
						var __compareData = Math.round(__pow * (100 * (__stPriceRef.close - __stPriceBase.close) / __stPriceBase.close));

						__compareData = __compareData || 0; // #1443

						__stPriceRef.compareData = __compareData;
					}

					return(true);
				}
				catch(e) {
					console.error(e);
				}

				return(false);
			};
		}

		_ChartUtils.dataConverter.didMergePriceDataWithRealData = function(argxPrice, receiveData) {
			var stPrice;
			if(argxPrice === undefined || argxPrice == null) {
				stPrice = _ChartUtils.didClone(receiveData);
			}
			else {
				stPrice = _ChartUtils.didClone(argxPrice);
			}

			var close = receiveData.close;

			// #2226
			if(stPrice.close <= 0) {
				stPrice.open  =
				stPrice.high  =
				stPrice.low   =
				stPrice.close = close;
			}
			else {
				stPrice.close = close;
				if(stPrice.high < close) {
					stPrice.high = close;
				}

				if(stPrice.low > close) {
					stPrice.low = close;
				}
			}
			//

			stPrice.volume += receiveData.volume;
			stPrice.amount += receiveData.amount;

			//
			return(stPrice);
		};

		/**
		 * [didConvertRawTimeToChartTime description]
		 * @param  {[type]} rawTime
		 * @return hhmmss
		 */
		_ChartUtils.dataConverter.didConvertRawTimeToChartTime = function(rawTime) {
			if(typeof rawTime === "string") {
				var timeDatas = rawTime.split(":");
				var newTime = parseInt(timeDatas[0]) * 10000 + parseInt(timeDatas[1]) * 100 + 0;

				return(newTime);
			}

			return;
		};

		/**
		 * [didValidateData description]
		 * @param  {[type]} stPrice
		 * @param  {[type]} bModify
		 * @return {[type]}
		 */
		_ChartUtils.dataConverter.didValidateData = function(stPrice, bModify) {
			if(_ChartUtils.validator.isValidPrice(stPrice) !== true) {
				if(bModify === true) {
					stPrice.open  =
					stPrice.high  =
					stPrice.low   =
					stPrice.close = 0;
				}

				stPrice.flag = false;
			}

			return(stPrice);
		};

		_ChartUtils.dataConverter.didConvertSerialData = function(receiveRawData, bModify) {
			if(receiveRawData === undefined || receiveRawData == null) {
				return;
			}

			var stPrice = {
				ymd		: receiveRawData[0],
				hms		: receiveRawData[1],
				open	: receiveRawData[2],
				high	: receiveRawData[3],
				low		: receiveRawData[4],
				close	: receiveRawData[5],
				volume	: receiveRawData[6],
				amount	: receiveRawData[7],
				oi		: receiveRawData[8],
				tno		: 0,
				seqNo	: 0,
				flag	: true
			};

			if(receiveRawData.length > 9) {
				stPrice.seqNo = receiveRawData[9];
				if(stPrice.seqNo === undefined || stPrice.seqNo == null) {
					stPrice.seqNo = 0;
				}
			}

			_ChartUtils.dataConverter.didValidateData(stPrice, bModify);

			return(stPrice);
		}

		_ChartUtils.dataConverter.didConvertTickData = function(receiveRawData, bModify) {
			if(receiveRawData === undefined || receiveRawData == null) {
				return;
			}

			/*
				Tick
				tickData : {
	            MsgType : 52,
	            SecuriteCode : "7203",
	            MarketCode : 1,
	            SequenceNum : 0,
	            Time : "",
	            PresenceMap : 0,
	            Price : 0,
	            ChangePrice : 0,
	            ChangeRate : 0,
	            Comparision : 0,
	            Status : 0,
	            Qty : 0,
	            Vwap : 0
	        },

			*/
			var close  = receiveRawData.Price;
			var volume = receiveRawData.Qty;
			var seqNo  = receiveRawData.SequenceNum;

			var stPrice = {
				ymd		: 0,	// TODO: why be there any date information in raw TICK data in GMO?
				hms		: _ChartUtils.dataConverter.didConvertRawTimeToChartTime(receiveRawData.Time),
				open	: close,
				high	: close,
				low		: close,
				close	: close,
				volume	: volume,
				amount	: 0,
				oi		: 0,
				tno		: 0,
				seqNo	: seqNo,
				flag	: true
			};

			_ChartUtils.dataConverter.didValidateData(stPrice, bModify);

			return(stPrice);
		};

		_ChartUtils.dataConverter.didConvertCandleStickData = function(receiveRawData, bModify) {
			if(receiveRawData === undefined || receiveRawData == null) {
				return;
			}
			/*
				CandleStick data format
				candleStickData : {
					MsgType : 103,
					SecuriteCode : "7203",
					MarketCode : 1,
					ChartDate : 20100719,
					PresenceMap : 0,
					SessionType : 0,
					PriceTime : "",
					OpenPrice : 0,
					HighPrice : 0,
					LowPrice : 0,
					ClosePrice : 0,
					Volume : 0
			},
			*/
			var stPrice = {
				ymd		: receiveRawData.ChartDate,
				hms		: _ChartUtils.dataConverter.didConvertRawTimeToChartTime(receiveRawData.PriceTime),
				open	: receiveRawData.OpenPrice,
				high	: receiveRawData.HighPrice,
				low		: receiveRawData.LowPrice,
				close	: receiveRawData.ClosePrice,
				volume	: receiveRawData.Volume,
				amount	: 0,
				oi		: 0,
				tno		: 0,
				flag	: true
			};

			return(stPrice);
		};

		_ChartUtils.dataConverter.didMakeEmptyPriceData = function(dateTimeUnit, closePrice) {
			var stDatetime = _ChartUtils.timeZone.convertTimeunitToDatetime(dateTimeUnit);
			var stPrice = {
				ymd		: stDatetime.date,
				hms		: stDatetime.time,
				open	: closePrice,
				high	: closePrice,
				low		: closePrice,
				close	: closePrice,
				volume	: 0,
				amount	: 0,
				oi		: 0,
				tno		: 0,
				flag	: true
			};

			stPrice.fixed = true;

			return(stPrice);
		};

		_ChartUtils.dataConverter.isMinusCandleForPriceData = function(stPrice, isAverage) {
			if(stPrice === undefined || stPrice == null) {
				return(true);
			}

			if(isAverage === true) {
				if(stPrice.hasOwnProperty("avgOpen") !== true || stPrice.hasOwnProperty("avgClose") !== true) {
					return(true);
				}

				if (parseInt(stPrice.avgOpen) <= parseInt(stPrice.avgClose)) {
					return(false);
				}
				else {
					return(true);
				}
			}
			else {
				if(stPrice.hasOwnProperty("open") !== true || stPrice.hasOwnProperty("close") !== true) {
					return(true);
				}

				if (parseInt(stPrice.open) <= parseInt(stPrice.close)) {
					return(false);
				}
				else {
					return(true);
				}
			}
		};

		//
		//
		//

		//
		// math
		//
		_ChartUtils.math = {};

		_ChartUtils.math.didCalcBasselCorrection = function(argValue, argPeriod) {
			return(argValue);

			if( argPeriod > 1 ) {
				argValue	= ( ( argPeriod * 1.0 ) / ( argPeriod - 1 ) ) * argValue;
			}

			return(argValue);
		};

		_ChartUtils.math.didCalcDiv = function(dDiv, dDive) {
			var isValid = true;
			var dData   = _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;
			if( dDiv === 0 ) {
				if( dDive === 0 ) {
					dData = 0;
					isValid = true;
				}
				else {
					dData   = _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;
					isValid = false;
				}
			}
			else {
				isValid = true;
				dData	= ( dDive / dDiv ) ;
			}

			return({valid:isValid, value:dData});
		};

		_ChartUtils.math.constants = {
			methods : {
				simple : 0,
				exponential : 1,
				weight : 2,
				wilder : 3
			}
		};

		_ChartUtils.math.log10 = function(argData) {
			if(!Math.log10) {
				return(Math.round(Math.log(argData) / Math.LN10 * 1e6) / 1e6);
			}
			else {
				return(Math.log10(argData));
			}
		};

		_ChartUtils.math.didCalcSum = function(argData) {
			var	dSumRet	= 0 ;
			if(argData === undefined || argData == null) {
				return(dSumRet);
			}

			var nCount = arrData.length;
			if(nCount < 1) {
				return(dSumRet);
			}

			for(var ii = 0; ii < nCount; ii++) {
				dSumRet += arrData[ii];
			}

			return(dSumRet);
		};

		_ChartUtils.math.CalcSumWithRange = function(argData, argRange) {
			var	dSumRet	= 0 ;
			if(argData === undefined || argData == null || argRange === undefined || argRange == null || argRange.length === undefined || argRange.length == null || argRange.length < 1) {
				return(dSumRet);
			}

			var nCount = arrData.length;
			if(nCount < 1) {
				return(dSumRet);
			}

			var nStart   = 0;
			var nLoopEnd = 0;
			if(argRange.location !== undefined && argRange.location != null) {
				nStart = argRange.location;
			}

			nLoopEnd = nStart + argRange.length;
			if(nStart < 0) {
				nLoopEnd += nStart;
				nStart = 0;
			}

			nLoopEnd = Math.min(nCount, nLoopEnd);

			for(var ii = nStart; ii < nLoopEnd; ii++) {
				dSumRet += arrData[ii];
			}

			return(dSumRet);
		};

		/**
			Calculate Summation
			@param[in]     lpData		original data
			@param[in,out] dSum			out summation data or pre-summation data
			@param[in]     bFirst		first flag
			@return        double ( Summation )
		*/
		_ChartUtils.math.CalcSum = function(argData, dSum, bFirst) {
			var	dSumRet	= 0 ;
			var	ii		= 0 ;
			if( bFirst ) {
				var		nCnt	= argData.length;
				var		dRes	= 0 ;
				for ( ii = 0 ; ii < nCnt ; ii++ ) {
					if( ii == 0 ) {
						dRes	= argData[ ii ] ;
					}

					dSum	+= argData[ ii ] ;
				}

				dSumRet	= dSum ;
				dSum	-= dRes ;
			}
			else {
				var dPre = argData;
				dSumRet	= dSum ;
				dSum	-= dPre;
			}

			return({ret:dSumRet, sum:dSum});
		};

		/**
			calculate Moving Average
			@param[in]     argData		original data
			@param[in]     nPeriod		period
			@param[in]     argMethod	Method
			@return        double ( Moving Average )
		*/
		_ChartUtils.math.CalcMA = function(argData, nPeriod, argMethod) {
			if( nPeriod <= 0 ) {
				return 0 ;
			}

			var	ii	= 0 ;
			var	dMA;
			var dSum = 0 ;
			var nCnt = argData.length;
			var nMethod = argMethod;
			if(typeof argMethod === "string") {
				if(_ChartUtils.math.constants.methods.hasOwnProperty(argMethod) === true) {
					nMethod = _ChartUtils.math.constants.methods[argMethod];
				}
				else {
					nMethod = _ChartUtils.math.constants.methods.simple;
				}
			}


			if(nMethod === _ChartUtils.math.constants.methods.exponential) {
				var	dMAP	= argData[0];
				var	dVal	= argData[1];
				var	dFac	= 2.0 / ( nPeriod + 1 ) ;
				dMA			= dVal * dFac + dMAP * ( 1 - dFac ) ;
			}
			else if(nMethod === _ChartUtils.math.constants.methods.weight) {
				nCnt = argData.length;
				var	nSPrd	= 0 ;
				for ( ii = 0 ; ii < nCnt ; ii++ ) {
					dSum	+= (argData[ii] * ( ii + 1 ));
					nSPrd	+= (ii + 1);
				}

				dMA	= dSum / nSPrd ;
			}
			else if(nMethod === _ChartUtils.math.constants.methods.wilder) {
				var	dMAP	= argData[0];
				var	dVal	= argData[1];
				dMA			= ( dVal + ( nPeriod - 1 ) * dMAP ) / nPeriod ;
			}
			//if(nMethod === _ChartUtils.math.constants.methods.simple) {
			else {
				nCnt = argData.length;
				for ( ii = 0 ; ii < nCnt ; ii++ ) {
					dSum += argData[ii];
				}

				dMA = dSum / nPeriod ;
			}


			return(dMA);
		};

		/**
		 * GMOの計算式と合わせるためのもの
		 * @param  {[type]} argNewData
		 * @param  {[type]} argPreSum
		 * @param  {[type]} argPeriod
		 * @return {[type]}
		 */
		_ChartUtils.math.didCalcSumLikeGMO = function(argNewData, argPreSum, argPeriod) {
			/*
				Periodがある場合、X(N)に対するSUM(N) - SUM(N-1) = X(N) - X(N - 1 - (Period - 1))になる。
				そうすると、
				SUM(N) = SUM(N-1) - X(N - 1 - (Period - 1)) + X(N)
				ここで、
				X(N - 1 - (Period - 1)) ≒ SUM(N-1) / Period = AVG(N-1)
				として
				SUM(N) = SUM(N-1) - (SUM(N-1) / Period) + X(N) = SUM(N-1) - AVG(N-1) + X(N)
				としたのがGMOの方式
				「チャート計算式(抜粋)のDMI計算式参照」
				SumPDM = SumPDM[1] - (SumPDM[1] / Length) + PDM
				SumTR  = SumTR[1]  - (SumTR[1]  / Length) + TRange

				SumMDM = SumMDM[1] - (SumMDM[1] / Length) + MDM
				SumTR  = SumTR[1]  - (SumTR[1]  / Length) + TRange
			 	*/
			var dAvg = 0;
			if(argPeriod === undefined || argPeriod == null || argPeriod <= 0) {
				return;
			}

			dAvg = argPreSum / argPeriod;

			var dSumRet = argPreSum - dAvg + argNewData;

			return(dSumRet);
		};

		/**
		 * TR（True Range）を計測する。
		 *（1）当日の高値と前日の終値の差→当日の高値－前日の終値
		 *（2）前日の終値と当日の安値の差→前日終値－当日安値
		 *（3）当日の高値と当日の安値の差→当日の高値－当日の安値
		 * 絶対値を使用する。
		 *
		 * @param  {[type]} dHigh
		 * @param  {[type]} dLow
		 * @param  {[type]} dCloseP
		 * @return {[type]}
		 */
		_ChartUtils.math.didCalcTrueRange = function(dHigh, dLow, dCloseP) {
			var dTemp1	= Math.abs(dCloseP - dLow);
			var dTemp2	= Math.abs(dHigh - dLow);
			var dTemp3	= Math.abs(dHigh - dCloseP);
			var	dTR		= Math.max(dTemp1, dTemp2, dTemp3);

			return(dTR);
		};

		/**
		 * GMOの計算式と合わせるためのもの
		 * @param  {[type]} argNewData
		 * @param  {[type]} argPreSum
		 * @param  {[type]} argPeriod
		 * @return {[type]}
		 */
		_ChartUtils.math.didCalcAvgLikeGMO = function(argNewData, argPreAvg, argPeriod) {
			/*
				「チャート計算式(抜粋)」の「DMI」タブにある「ADX」の計算式はついのようになっている。
				ADX = (Length - 1) * ADX[1] / Length + DMI / Length

				これを展開すると
				ADX = ADX[1] - ADX[1] / Length + DMI / Length = SUM[1] / Length - ADX[1] / Length + DMI / Length
				    = (SUM[1] - ADX[1] + DMI) / Length

			 	*/
			if(argPeriod === undefined || argPeriod == null || argPeriod <= 0) {
				return;
			}

			var dAvgRet = ((argPeriod - 1) * argPreAvg + argNewData) / argPeriod;

			return(dAvgRet);
		};

		/**
		 * Calculate Moving Average
		 * @param[in]   argData		original data
		 * @param[in]	dSum		out summation data or pre-summation data
		 * @param[in]   nPeriod		period
		 * @param[in]   argMethod	Method
		 * @param[in]   bFirst		first flag
		 * @param[in]   bFast		process mode ( default : TRUE )
		 * @return      double ( Moving Average )
		 */
		_ChartUtils.math.CalcMAEx = function(argData, dSum, nPeriod, argMethod, bFirst, bFast) {
			var	dMA	= 0 ;
			var	ii	= 0 ;

			var nMethod = argMethod;
			if(typeof argMethod === "string") {
				if(_ChartUtils.math.constants.methods.hasOwnProperty(argMethod) === true) {
					nMethod = _ChartUtils.math.constants.methods[argMethod];
				}
				else {
					nMethod = _ChartUtils.math.constants.methods.simple;
				}
			}

			if( bFast ) {
				if(nMethod === _ChartUtils.math.constants.methods.simple) {
					if( bFirst ) {
						var		nCnt	= argData.length;
						var		dRes	= 0 ;
						for ( ii = 0 ; ii < nCnt ; ii++ ) {
							if( ii == 0 ) {
								dRes	= argData[ ii ] ;
							}

							dSum	+= argData[ ii ] ;
						}

						dMA		= dSum / nPeriod ;
						dSum	-= dRes ;
					}
					else {
						var	dPre	= argData ;
						dMA		= dSum / nPeriod ;
						dSum	-= dPre ;
					}

					return({ma:dMA, sum:dSum});
				}
			}

			dMA	= _ChartUtils.math.CalcMA(argData, nPeriod, nType);

			return({ma:dMA, sum:0});
		};

		_ChartUtils.math.didCalcMovingAverageWithSingleDatas = function(datas) {
			var result = _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;

			if(datas === undefined || datas == null) {
				// console.debug("[WGC] _CalcMovingAverage => datas is " + datas);
				return(result);
			}

			var dataLength = datas.length;
			if(dataLength == undefined || dataLength < 1) {
				// console.debug("[WGC] _CalcMovingAverage is NAN.");
				return(result);
			}

			var sum = 0;
			for(var ii = 0; ii < dataLength; ii++) {
				var data = datas[ii];
				sum += data;
			}

			result = sum / dataLength;

			return(result);
		};

		_ChartUtils.math.didCalcStandardDeviationWithSingleDatas = function(datas) {
			var result = _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;

			if(datas === undefined || datas == null) {
				// console.debug("[WGC] _CalcStandardDeviation => datas is " + datas);
				return(result);
			}

			var dataLength = datas.length;
			if(dataLength == undefined || dataLength < 1) {
				// console.debug("[WGC] _CalcStandardDeviation is NAN.");
				return(result);
			}

			var sum = 0;
			var sum2 = 0;
			for(var ii = 0; ii < dataLength; ii++) {
				var data = datas[ii];
				sum += data;
				sum2 += (data * data);
			}

			var dVar = (sum2 - (sum * sum) / dataLength) / dataLength;
			if(dVar < 0) {
				dVar = 0;
			}

			var d1SD = Math.sqrt(dVar);

			return(d1SD);
		};

		_ChartUtils.math.didCalcMovingAverage2 = function(datas, target) {
			var result = _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;

			var singleDatas = _ChartUtils.didGetSingleDatasFromPriceDatas(datas, target);

			result = _ChartUtils.math.didCalcMovingAverageWithSingleDatas(singleDatas);

			// console.debug("[WGC] _CalcMovingAverage => " + result);

			return(result);
		};

		_ChartUtils.math.didCalcStandardDeviation2 = function(datas, target) {
			var result = _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;

			var singleDatas = _ChartUtils.didGetSingleDatasFromPriceDatas(datas, target);

			var result = _ChartUtils.math.didCalcStandardDeviationWithSingleDatas(singleDatas);

			return(result);
		};

		_ChartUtils.math.didCalcMovingAverage = function(datas, target) {
			var result = _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;

			if(datas === undefined || datas == null) {
				// console.debug("[WGC] _CalcMovingAverage => datas is " + datas);
				return(result);
			}

			var dataLength = datas.length;
			if(dataLength == undefined || dataLength < 1) {
				// console.debug("[WGC] _CalcMovingAverage is NAN.");
				return(result);
			}

			var sum = 0;
			for(var ii = 0; ii < dataLength; ii++) {
				var data = datas[ii][target];
				sum += data;
			}

			result = sum / dataLength;

			// console.debug("[WGC] _CalcMovingAverage => " + result);

			return(result);
		};

		_ChartUtils.math.didCalcStandardDeviation = function(datas, target) {
			var result = _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;

			if(datas === undefined || datas == null) {
				// console.debug("[WGC] _CalcStandardDeviation => datas is " + datas);
				return(result);
			}

			var dataLength = datas.length;
			if(dataLength == undefined || dataLength < 1) {
				// console.debug("[WGC] _CalcStandardDeviation is NAN.");
				return(result);
			}

			var sum = 0;
			var sum2 = 0;
			for(var ii = 0; ii < dataLength; ii++) {
				var data = datas[ii][target];
				sum += data;
				sum2 += (data * data);
			}

			var dVar = (sum2 - (sum * sum) / dataLength) / dataLength;
			if(dVar < 0) {
				dVar = 0;
			}

			var d1SD = Math.sqrt(dVar);

			// console.debug("[WGC] _CalcStandardDeviation => " + d1SD);

			return(d1SD);
		};

		_ChartUtils.math.didCalcHighestValue = function(argDatas) {
			if(argDatas === undefined || argDatas == null || argDatas.length === undefined || argDatas.length == null || argDatas.length < 1) {
				return;
			}

			var	nCount = argDatas.length;
			var dData = argDatas[0];
			for(var ii = 1; ii < nCount; ii++) {
				dData = Math.max(dData, argDatas[ii]);
			}

			return(dData);
		};

		_ChartUtils.math.didCalcLowestValue = function(argDatas) {
			if(argDatas === undefined || argDatas == null || argDatas.length === undefined || argDatas.length == null || argDatas.length < 1) {
				return;
			}

			var	nCount = argDatas.length;
			var dData  = argDatas[0];
			for(var ii = 1; ii < nCount; ii++) {
				dData = Math.min(dData, argDatas[ii]);
			}

			return(dData);
		};

		//
		//
		//
		_ChartUtils.trendLine = {};

		_ChartUtils.trendLine.didDeleteTargetToolObject = function(argDoLs) {
			if(argDoLs !== undefined && argDoLs != null && argDoLs.m_doParent !== undefined && argDoLs.m_doParent != null && argDoLs.m_doParent.didRemoveTargetLineTool !== undefined) {
				return(argDoLs.m_doParent.didRemoveTargetLineTool(argDoLs));
			}

			return(false);
		};

		/**
		 * is new order line or action
		 * @param[in] argLineCode	line code
		 * @return true or false
		 */
		_ChartUtils.trendLine.isNewOrderLine = function(argLineCode) {
			if (argLineCode === undefined || argLineCode == null) {
				return(false);
			}

			if(argLineCode === _ChartUtils.constants.trendLineCodes.orderLine) {
				return(true);
			}

			return(false);
		};

		/**
		 * is drawable trend line or action
		 * @param[in] argLineCode	line code
		 * @return true or false
		 */
		_ChartUtils.trendLine.isDrawableTrendline = function(argLineCode) {
			if (argLineCode === undefined || argLineCode == null ||
				argLineCode === _ChartUtils.constants.trendLineCodes.pointer	||
				argLineCode === _ChartUtils.constants.trendLineCodes.deleteOne	||
				argLineCode === _ChartUtils.constants.trendLineCodes.deleteAll
				) {
				return(false);
			}

			return(true);
		};

		// #2566
		_ChartUtils.trendLine.isObjectMovableMode = function(argLineCode) {
			if(argLineCode === _ChartUtils.constants.trendLineCodes.pointer) {
				return(true);
			}

			return(false);
		};
		_ChartUtils.trendLine.isCrossHairMode = function(argLineCode) {
			if(argLineCode === _ChartUtils.constants.trendLineCodes.crossHair) {
				return(true);
			}

			return(false);
		};
		_ChartUtils.trendLine.isScrollableMode = function(argLineCode) {
			if(argLineCode === _ChartUtils.constants.trendLineCodes.pointer || argLineCode === _ChartUtils.constants.trendLineCodes.crossHair) {
				return(true);
			}

			return(false);
		};
		//

		// #1300
		_ChartUtils.trendLine.isDeleteOneRepeat = function(argLineCode) {
			if(argLineCode === _ChartUtils.constants.trendLineCodes.deleteOneRepeat) {
				return(true);
			}

			return(false);
		};

		_ChartUtils.trendLine.didGetDefaultTrendlineInfoAt = function(argLineCode, isRef) {
			if(argLineCode === undefined || argLineCode == null) {
				return;
			}

			var objects;
			var count;
			var	trendLineInfo;

			objects = _ChartUtils.constants.trendLines;
			count = objects.length;
			try {
				for(var ii = 0; ii < count; ii++) {
					trendLineInfo = objects[ii];
					if(trendLineInfo && trendLineInfo.code && trendLineInfo.code === argLineCode) {
						if(isRef === true) {
							return(trendLineInfo);
						}

						return(_ChartUtils.didClone(trendLineInfo));
					}
				}
			}
			catch(e) {
				console.error(e);
				trendLineInfo = undefined;
			}

			return(trendLineInfo);
		};

		_ChartUtils.trendLine.didGetDefaultTrendlineInfos = function() {
			var xResult = {};

			var objects;
			var count;

			//
			objects = _ChartUtils.constants.trendLines;
			count = objects.length;
			for(var ii = 0; ii < count; ii++) {
				var trendLineInfo = objects[ii];
				if(trendLineInfo === undefined && trendLineInfo == null) {
					continue;
				}

				if(trendLineInfo.tool === true) {
					continue;
				}

				var code = trendLineInfo.code;
				xResult[code] = _ChartUtils.didClone(trendLineInfo);
			}

			return(xResult);
		};

		//
		// MARK: Tools
		//

		/**
		 * get span(left shift)
		 * @return number
		 */
		_ChartUtils.didGetShifLeftCount = function(argMoveShift) {
			if(argMoveShift < 0) {
				return(Math.abs(argMoveShift));
			}

			return(0);
		};

		/**
		 * get span(right shift)
		 * @return number
		 */
		_ChartUtils.didGetShifRightCount = function(argMoveShift) {
			if(argMoveShift > 0) {
				return(Math.abs(argMoveShift));
			}

			return(0);
		};

		/**
		 * [description]
		 * @param  {[type]} argInfo
		 * @return {[type]}
		 */
		_ChartUtils.didCalculateShiftInfo = function(argInfo, isSt) {
			if(argInfo !== undefined && argInfo != null) {
				if(argInfo.extraDiff !== undefined && argInfo.extraDiff != null) {
					var isParamOrLeft = false;
					if(isSt === true) {
						isParamOrLeft = true;
					}
					// #729
					var nShift = _ChartUtils.didCalculateShiftValue(argInfo.extraDiff, isParamOrLeft);
					//

					//
					return(nShift);
				}
				else if(argInfo.left !== undefined && argInfo.left != null && argInfo.right !== undefined && argInfo.right != null) {
					var extraDiff = argInfo.right;
					var isParamOrLeft = false;
					if(isSt === true) {
						extraDiff = argInfo.left;
						isParamOrLeft = true;
					}
					// #729
					var nShift = _ChartUtils.didCalculateShiftValue(extraDiff, isParamOrLeft);
					//

					//
					return(nShift);
				}
			}

			return(0);
		};

		/**
		 * [description]
		 * @param  {[type]} argInfo
		 * @return {[type]}
		 */
		_ChartUtils.didCalculateShiftValueWithExtraDiff = function(argValue, isSt) {
			var isParamOrLeft = false;
			if(isSt === true) {
				isParamOrLeft = true;
			}

			return(_ChartUtils.didCalculateShiftValue(argValue, isParamOrLeft));
		};

		/**
		 * [description]
		 * @param  {[type]}  argValue
		 * @param  {Boolean} isLeft
		 * @param  {Boolean} isParam
		 * @param  {Boolean} isSt
		 * @return {[type]}
		 */
		_ChartUtils.didCalculateShiftValue = function(argValue, isParamOrLeft) {
			var nShift = 0;
			if(typeof argValue === "string") {
				nShift = parseInt(argValue);
			}
			else if(typeof argValue === "number") {
				nShift = argValue;
			}
			else {
				nShift = 0;
			}

			// #729
			if(isParamOrLeft === true) {
				nShift = (-1 * nShift);
			}
			//

			//
			return(nShift);
		};

		/**
		 * 基準データインデックスからシフト情報を補正したインデックスへ変換する。
		 * @param  {[type]} argIndex
		 * @param  {[type]} argShift
		 * @return {[type]}
		 */
		_ChartUtils.didConvertShiftedIndex = function(argIndex, argShift, toDataIndex) {
			if(toDataIndex === true) {
				return(argIndex + argShift);
			}
			else {
				return(argIndex - argShift);
			}
		};

		/**
		 * Get Convert Data ( Raw Data Index -> Screen Data Index ) for Draw Object
		 * @param  {[type]} nSorDIdx	screen or data index
		 * @param  {[type]} nMOff		minus offset(left shift value)
		 * @param  {[type]} nDiff		difference
		 * @param  {[type]} bD2S		data to screen flag
		 * @return {[type]}	number
		 */
		_ChartUtils.EC_GetDataZScr = function(nSorDIdx, nMOff, nDiff, bD2S) {
			var	nRet	= 0 ;
			if(bD2S === true)
				nRet	= nSorDIdx - ( nMOff - nDiff ) ;
			else
		        nRet	= nSorDIdx + ( nMOff - nDiff ) ;

			return nRet ;
		};

		_ChartUtils.didCheckNavigator = function() {
			var agent = navigator.userAgent.toLowerCase();

			if (agent.indexOf("chrome") != -1)
		        return 'Chrome';
		    else if (agent.indexOf("opera") != -1)
		        return 'Opera';
		    else if (agent.indexOf("firefox") != -1)
		        return 'Firefox';
		    else if (agent.indexOf("safari") != -1)
		        return 'Safari';
		    else if (agent.indexOf("msie") != -1)
		        return 'IE';
		};

		/**
		 * @param[in] strChartType	chart type
		 * @return true or false
		 */
		_ChartUtils.isNontimeChartType = function(strChartType) {
			if ((strChartType === _ChartUtils.constants.chartTypeCode.threeLineBreak	) ||
				(strChartType === _ChartUtils.constants.chartTypeCode.pointAndFigure	) ||
				(strChartType === _ChartUtils.constants.chartTypeCode.reverseCycleLine	) ||
				(strChartType === _ChartUtils.constants.chartTypeCode.kagi				) ||
				(strChartType === _ChartUtils.constants.chartTypeCode.renko				)
				) {
				return(true);
			}

			return(false);
		};

		// #2247
		_ChartUtils.didGetXAxisHeight = function(xEnv) {
			if(!xEnv) {
				return(_ChartUtils.constants.default.XAXIS_HEIGHT);
			}

			if(xEnv.System.UseForMiniChart === true) {
				return(0);
			}

			return(_ChartUtils.constants.default.XAXIS_HEIGHT);
		};
		_ChartUtils.didGetExtraPanelVisibility = function(xEnv) {
			if(!xEnv) {
				return("visible");
			}

			if(xEnv.System.UseForMiniChart === true) {
				return("hidden");
			}

			return("visible");
		};
		_ChartUtils.didGetAxisPanelVisibility = function(xEnv) {
			if(!xEnv) {
				return("visible");
			}

			if(xEnv.System.UseForMiniChart === true) {
				return("hidden");
			}

			return("visible");
		};
		// [end] #1557

		// #1540
		_ChartUtils.isComparePriceBar = function(xEnv) {
			if(!xEnv) {
				return(false);
			}

			if(xEnv.System.DefaultPriceBar === "compare") {
				return(true);
			}

			return(false);
		};

		_ChartUtils.isCFDPriceBar = function(xEnv) {
			if(!xEnv) {
				return(false);
			}

			if(xEnv.System.DefaultPriceBar === "cfd") {
				return(true);
			}

			return(false);
		};
		// [end] #1540

		// #1557
		_ChartUtils.isAvailableSmoothScroll = function(xEnv) {
			if(!xEnv) {
				return(false);
			}

			if(xEnv.System.AllowSmoothScroll !== true) {
				return(false);
			}

			return(xEnv.UseSmoothScroll);
		};
		// [end] #1557

		// #2566
		_ChartUtils.isAvailableToSelectObject = function(xEnv) {
			if(!xEnv) {
				return(false);
			}

			if(xEnv.System.UseForMiniChart != true && xEnv.AvailableToSelectObject == true) {
				return(true);
			}

			return(false);
		};
		_ChartUtils.isAvailableToScrollScreen = function(xEnv) {
			if(!xEnv) {
				return(false);
			}

			if(xEnv.System.UseForMiniChart != true && xEnv.AvailableToScrollScreen == true) {
				return(true);
			}

			return(false);
		};
		_ChartUtils.didStateChangeOnTrendline = function(xEnv, trendLine) {
			if(!xEnv) {
				return(false);
			}

			var bUpdate = false;
			if(_ChartUtils.trendLine.isObjectMovableMode(trendLine) == true) {
				xEnv.AvailableToSelectObject = true;
			}
			else {
				xEnv.AvailableToSelectObject = false;
			}

			if(_ChartUtils.trendLine.isScrollableMode(trendLine) == true) {
				xEnv.AvailableToScrollScreen = true;
			}
			else {
				xEnv.AvailableToScrollScreen = false;
			}

			try {
				if(_ChartUtils.trendLine.isCrossHairMode(trendLine) == true) {
					xEnv.CrossLine.hide = false;
				}
				else {
					xEnv.CrossLine.hide = true;
				}

				bUpdate = true;
			}
			catch(e) {
				console.error(e);
			}

			return(bUpdate);
		};
		// [end] #2566

		// #1558, #2566
		_ChartUtils.isAvailableMouseScrollActionOnCFD = function(xEnv, trendLine) {
			if(!xEnv) {
				return(false);
			}

			return(_ChartUtils.isAvailableToScrollScreen(xEnv));
		};
		// [end] #1558

		/**
		 * @param[in] strChartType	chart type
		 * @return true or false
		 */
		_ChartUtils.isAvailableChartTypeForCallingPreviousNext = function(xEnv) {
			if(!xEnv) {
				return(false);
			}

			if(xEnv.System.UseRequestPreviousNext !== true) {
				return(false);
			}

			var strChartType = xEnv.ChartType;
			if(_ChartUtils.isNontimeChartType(strChartType) === true) {
				return(false);
			}

			// #1540
			var isComparePriceBar = _ChartUtils.isComparePriceBar(xEnv);
			if(isComparePriceBar === true && _ChartUtils.constants.chartTypeCode.compareChart === strChartType) {
				return(false);
			}

			return(true);
		};

		/**
		 * @param[in] strChartType	chart type
		 * @return true or false
		 */
		_ChartUtils.isAvailableToUseChartType = function(xEnv, strChartType) {
			if(!xEnv) {
				return(false);
			}

			if(strChartType === undefined || strChartType == null) {
				return(false);
			}

			//
			if(_ChartUtils.getChartTypeNumCodeFromCode(strChartType) <= _ChartUtils.constants.ngc.enum.ELS_INVALID) {
				return(false);
			}
			//

			if(strChartType === xEnv.ChartType) {
				return(false);
			}

			// #1540
			var isComparePriceBar = _ChartUtils.isComparePriceBar(xEnv);
			if(isComparePriceBar !== true && strChartType === _ChartUtils.constants.chartTypeCode.compareChart) {
				return(false);
			}
			//

			return(true);
		}

		/**
		 * @param[in] strChartType	chart type
		 * @return true or false
		 */
		_ChartUtils.isCompareChartMode = function(xEnv) {
			if(!xEnv) {
				return(false);
			}

			// #1540
			var isComparePriceBar = _ChartUtils.isComparePriceBar(xEnv);
			if((isComparePriceBar === true && _ChartUtils.constants.chartTypeCode.compareChart === xEnv.ChartType)) {
				return(true);
			}
			//

			return(false);
		};

		_ChartUtils.getChartTypeNumCodeFromCode = function(strChartType) {
			var nCount = _ChartUtils.constants.chartType.length;
			for(var ii = 0; ii < nCount; ii++) {
				var xChartType = _ChartUtils.constants.chartType[ii];
				if(xChartType !== undefined && xChartType != null && xChartType.code === strChartType) {
					return(xChartType.numCode);
				}
			}

			return(_ChartUtils.constants.ngc.enum.ELS_INVALID);
		};

		_ChartUtils.didAppendDatas = function(target, source) {
			if(typeof target !== "object") {
				return;
			}

			var push = Array.prototype.push;

			push.apply(target, source);
		};

		/**
		 * append empty datas to target
		 * @param  {[type]} targetDatas
		 * @param  {[type]} targetTimes
		 * @param  {[type]} targetTickNos
		 * @param  {[type]} source
		 * @return {[type]}
		 */
		_ChartUtils.didAppendEmptyDatas = function(targetDatas, targetTimes, targetTickNos, source) {
			if(!source || !source.length || source.length < 1) {
				return;
			}

			if(typeof targetDatas !== "object" || typeof targetTimes !== "object" || typeof targetTickNos !== "object") {
				return;
			}

			var nCount = source.length;
			for(var ii = 0; ii < nCount; ii++) {
				var __stPrice = source[ii];

				targetDatas.push(_ChartUtils.didClone(__stPrice));

				//
				var __strTimeVal = _ChartUtils.dateTime.convertNumberDatetimeToTimelineData(__stPrice.ymd, __stPrice.hms);
				// var __date = _ChartUtils.dateTime.convertNumberToDateString(__stPrice.ymd);
				// var __time = _ChartUtils.dateTime.convertNumberToTimeString(__stPrice.hms);
				// var __strTimeVal = __date + __time;

				targetTimes.push(__strTimeVal);

				//
				targetTickNos.push(0);
			}
		};

		/**
		 * [description]
		 * @return {[type]}
		 */
		_ChartUtils.createGuid = function(){
			var s4 = function(){
				return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
			};
			return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
		};

		/**
		 * calculate center value(rounding)
		 *
		 * @return number
		 */
		_ChartUtils.didClone = function(arg) {
			if ($ === undefined || jQuery === undefined) {
				return;
			}

			//return ($.extend({}, arg));
			return ($.extend(true, {}, arg));
		};

		// #1388
		_ChartUtils.didStopPropagation = function(event) {
			if(event) {
				if(event.stopPropagation) {
					event.stopPropagation();
				}
				else {
					event.cancelBubble = true;
				}
			}
		};

		_ChartUtils.didAdjustCanvasResolution = function(canvas, width, height, apply) {
			var context = canvas ? canvas.getContext("2d") : null;
			var devicePixelRatio  = window.devicePixelRatio || 1;
			var backingStoreRatio = 1;
			if(context) {
				backingStoreRatio = context.webkitBackingStorePixelRatio ||
									context.mozBackingStorePixelRatio    ||
									context.msBackingStorePixelRatio     ||
									context.oBackingStorePixelRatio      ||
									context.backingStorePixelRatio       || 1;
			}

			var ratio = devicePixelRatio / backingStoreRatio;

			if(apply === true) {
				var width  = canvas.width;
				var height = canvas.height;
				canvas.width = ratio * width;
				canvas.height = ratio * height;
			}

			return(ratio);
		};

		_ChartUtils.didCalcRatioOfContext2D = function(context) {
			var devicePixelRatio  = window.devicePixelRatio || 1;
			var backingStoreRatio = 1;
			if(context) {
				backingStoreRatio = context.webkitBackingStorePixelRatio ||
									context.mozBackingStorePixelRatio    ||
									context.msBackingStorePixelRatio     ||
									context.oBackingStorePixelRatio      ||
									context.backingStorePixelRatio       || 1;
			}

			var ratio = devicePixelRatio / backingStoreRatio;

			return(ratio);
		};

		_ChartUtils.didConvertTimeTypeKeyToNumber = function(strType) {
			try {
				if(_ChartUtils.constants.timeType.hasOwnProperty(strType) === true) {
					return(_ChartUtils.constants.timeType[strType]);
				}
			}
			catch(e) {

			}
			return;
		};

		/**
		 * [MCR_ISZERO description]
		 * @param {[type]} arg
		 */
		_ChartUtils.MCR_ISZERO = function(arg) {
			if(0 === arg) {
				return(true);
			}

			return(false);
		};

		_ChartUtils.didGetCrossPoint = function(ptHS, ptHF, ptLS, ptLF) {
			var	dA	= 0 ,
				dB	= 0 ,	// y = ax + b
				dC	= 0 ,
				dD	= 0 ;	// y = cx + d

			dA	= ( ptHF.y - ptHS.y ) / ( ptHF.x - ptHS.x ) ;
			dB	= ptHF.y - dA * ptHF.x ;

			dC	= ( ptLF.y - ptLS.y ) / ( ptLF.x - ptLS.x ) ;
			dD	= ptLF.y - dC * ptLF.x ;

			var ptRet = {};

			ptRet.x = parseInt ( ( dD - dB ) / ( dA - dC ) );
			ptRet.y = parseInt ( dA * ptRet.x + dB );

			return(ptRet);
		};

		/**
		 * calculate center value(rounding)
		 *
		 * @return number
		 */
		_ChartUtils.didCalcCenterPos = function(arg1, arg2) {
			return (Math.round((arg2 - arg1) / 2));
		};

		/**
		 *
		 */
		_ChartUtils.didGetDataFromPriceData = function(stPrice, target) {
			if(stPrice === undefined || stPrice == null) {
				// console.debug("[WGC] didGetDataFromPriceData => datas is " + stPrice);
				return;
			}

			return(stPrice[target]);
		};

		/**
		 *
		 */
		_ChartUtils.didGetSingleDatasFromPriceDatas = function(datas, target) {
			if(datas === undefined || datas == null) {
				// console.debug("[WGC] didGetSingleDatasFromPriceDatas => datas is " + datas);
				return;
			}

			var dataLength = datas.length;
			if(dataLength == undefined || dataLength < 1) {
				// console.debug("[WGC] didGetSingleDatasFromPriceDatas is NAN.");
				return;
			}

			var singleDatas = [];
			for(var ii = 0; ii < dataLength; ii++) {
				singleDatas.push(datas[ii][target]);
			}

			return(singleDatas);
		};

		/**
		 *
		 */
		_ChartUtils.didConvertToPrice = function(argPrice) {
			var ret = _ChartUtils.didRoundPrice(argPrice, true);
			/*
			 * if(ret === NaN) { return(0); }
			 */

			return (ret);
		};

		/**
		 *
		 */
		_ChartUtils.didConvertToVolume = function(argVolume) {
			var ret = parseInt(argVolume);
			/*
			 * if(ret === NaN) { return(0); }
			 */

			return (ret);
		};

		/**
		 * @param[in] argMax
		 * @param[in] argMin
		 * @return size
		 */
		_ChartUtils.didCalcPriceSize = function(argMax, argMin, isOpt) {
			if(isOpt !== true) {
				return (argMax + 1 - argMin);
			}

			return (argMax - argMin);
		};

		/**
		 * @param[in] argPrice
		 * @return rounded price
		 */
		_ChartUtils.didRoundPrice = function(argPrice, isFloor) {
			//
			if(isFloor === true) {
				return(parseInt(argPrice));
			}
			else {
				return(Math.round(argPrice));
			}
		};

		/**
		 * @param[in] argPrice
		 * @return rounded price
		 */
		_ChartUtils.isValidValue = function(argValue) {
			//
			if (argValue === undefined || argValue === _ChartUtils.constants.default.DEFAULT_WRONG_VALUE) {
				return (false);
			}

			return (true);
		};

		/**
		 * get price value parsed(double)
		 *
		 * @param {any} stPrice price object
		 * @param {any} target 	close, high, ...
		 * @param {any} dFactor re-calculate factor
		 * @returns number
		 */
		_ChartUtils.didGetPriceValue = function(stPrice, target, dFactor) {
			var dResult = 0.0;

			if(stPrice === undefined || stPrice == null) {
				return(dResult);
			}

			// make lowercase
			var checkStr = target.toLowerCase();
			// is registered keyword?
			if(_ChartUtils.constants.keywords.price.hasOwnProperty(checkStr) === true) {
				checkStr = _ChartUtils.constants.keywords.price[checkStr];
			}
			else {
				//
				return(dResult);
			}

			// typical price
			if(checkStr === _ChartUtils.constants.keywords.price.typical) {
				dResult = (stPrice.high + stPrice.low + stPrice.close) / 3;
			}
			// weighted price
			else if(checkStr === _ChartUtils.constants.keywords.price.weight) {
				dResult = (stPrice.open + stPrice.high + stPrice.low + stPrice.close) / 3;
			}
			// data in price info.
			else {
				if(stPrice.hasOwnProperty(checkStr) !== true) {
					return(dResult);
				}

				//
				//
				//
				if(checkStr === _ChartUtils.constants.keywords.price.volume || checkStr === _ChartUtils.constants.keywords.price.amount) {
					dFactor = undefined;
				}

				dResult = stPrice[checkStr];
			}

			// re-calculate by factor
			if(dFactor !== undefined) {
				dResult = dResult * dFactor;
			}

			//
			return(dResult);
		};

		/**
		 *
		 */
		_ChartUtils.didGetPriceDisplay = function(target, stPrice, verpos, noPrefix) {
			var prefix = _ChartUtils.constants.text.dataView[target];
			var strDisp = _ChartUtils.number.didGetPointedValue(stPrice[target], verpos);

			if(noPrefix === true) {
				return(String(strDisp));
			}

			return(String(prefix + strDisp));
		};

		_ChartUtils.didGetDataViewItemTitle = function(target) {
			if(_ChartUtils.constants.text.dataView.hasOwnProperty(target) === true) {
				return(_ChartUtils.constants.text.dataView[target]);
			}

			return("");
		};

		/**
		 *
		 */
		_ChartUtils.indicator = {};

		_ChartUtils.indicator.plotState = {
			stateUp		: 1,
			stateDn		: -1,
			stateNone	: 0,
		};

		_ChartUtils.indicator.plotType = {
			ESDG_PLOTLINE		: 0,
			ESDG_SIMPLEBAR		: 1,
			ESDG_CANDLEBAR		: 2,
			ESDG_NEWS			: 3,
			ESDG_ORDER			: 4,
			ESDG_KAGI			: 5,
			ESDG_RENKO			: 6,
			ESDG_PNF			: 7,
			ESDG_TLB			: 8,
			ESDG_REVC			: 9,
			ESDG_SIDEBAR		: 10,
			ESDG_PLOTBASELINE	: 11,
			ESDG_ORDERUNIT		: 12,
			ESDG_POSITIONUNIT	: 13,

			ESDG_COUNT			: 14
		};

		_ChartUtils.indicator.plotStyle = {
			ESSS_PL_LINE		: 0,
			ESSS_PL_STICK		: 1,
			ESSS_PL_POINT		: 2,
			ESSS_SB_STICK		: 3,
			ESSS_SB_BAR			: 4,
			ESSS_SB_FILL		: 5,
			ESSS_AV_BAR			: 6,
			ESSS_AV_FILLBAR		: 7,
			ESSS_AV_LINE		: 8,

			ESSS_PL_KAGI		: 100,
			ESSS_PL_RENKO		: 101,
			ESSS_PL_PNF			: 102,
			ESSS_PL_TLB			: 103,
		};

		_ChartUtils.indicator.constValue = {
			/*
			ESCV_TYPICAL	: 0	,
			ESCV_WEIGHT 	: 1	,	// 1
			ESCV_OPEN		: 2	,	// 2	EPDF_OPEN
			ESCV_HIGH		: 3	,	// 3	EPDF_HIGH
		    ESCV_LOW		: 4	,	// 4	EPDF_LOW
			ESCV_CLOSE		: 5	,	// 5	EPDF_CLOSE
			ESCV_VOL		: 6	,	// 6	EPDF_VOL
			ESCV_AMT		: 7	,	// 7	EPDF_AMT
			ESCV_COUNT		: 8	,

			ESCV_SIMPLE		: 5	,

			ESCV_MA_WEIGHT	: 1	,	// 1	Moving Average ( Weight )
			ESCV_MA_EXP		: 4 ,	// 4	Moving Average ( Exponential )
			ESCV_MA_SIMPLE	: 5	,	// 5	Moving Average ( Simple )
			ESCV_MA_WILDER	: 6	,	// 6	Moving Average ( Welles Wilder Method )
			*/
			ESCV_SYM_MONEY	: 1 ,	// 0	money calc.
			ESCV_SYM_PERCENT: 2	,	// 1	percent calc.
			/*
			ESCV_SYM_NO		: 0 ,
			ESCV_SYM_YES	: 1 ,

			ESCV_MA_DEFAULT	: 99	// 99	Moving Average ( Default )
			*/
		};

		_ChartUtils.indicator.didConvertMethodKeyword = function(argKey) {
			if(argKey === undefined || argKey == null) {
				return;
			}

			if(_ChartUtils.constants.keywords.indicator.hasOwnProperty(argKey)) {
				return(_ChartUtils.constants.keywords.indicator[argKey]);
			}
		};

		_ChartUtils.indicator.didGetParamValueForDisplay = function(argParam) {
			if(argParam === undefined || argParam == null) {
				return("");
			}

			var value = argParam.value;
			if(argParam.list !== undefined && argParam.list != null) {
				var nCount = argParam.list.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xItem = argParam.list[ii];
					if(xItem.value === value) {
						return(xItem.display);
					}
				}

				return(value);
			}
			else {
				return(value);
			}
		}

		/**
		 * get default indicator information
		 * @param[in] argCode	code
		 * @return object
		 */
		_ChartUtils.indicator.didGetDefaultInfo = function(argCode) {
			if(argCode === undefined || argCode == null || argCode === "") {
				return;
			}

			for(var ii in _ChartUtils.constants.indicators) {
				var xInfo = _ChartUtils.constants.indicators[ii];
				if(xInfo !== undefined && xInfo != null) {
					if(xInfo.code === argCode) {
						return(_ChartUtils.didClone(xInfo));
					}
				}
			}

			return;
		};

		/**
		 * added by choi sunwoo at 2017.05.09 for #708
		 * 指標の全リスト情報を次のように構成する。
		 * {trend:[{typeId:typeId, show:false, info:{指標情報}}], oscillator:[{typeId:typeId, show:false, info:{指標情報}}]}
		 * @return {object}
		 */
		_ChartUtils.indicator.didGetDefaultSeriesInfos = function() {
			var xResult = {
				trend : [],
				oscillator : []
			};

			var indicators;
			var count;
			var target;

			// トレンド系
			indicators = _ChartUtils.constants.indicatorGroups.trend.indicators;
			count = indicators.length;
			target = xResult.trend;
			for(var ii = 0; ii < count; ii++) {
				var code = indicators[ii];
				var item = { code: code, show:false, info:_ChartUtils.indicator.didGetDefaultInfo(code) };
				target.push(item);
			}

			// オシレーター系
			indicators = _ChartUtils.constants.indicatorGroups.oscillator.indicators;
			count = indicators.length;
			target = xResult.oscillator;
			for(var ii = 0; ii < count; ii++) {
				var code = indicators[ii];
				var item = { code: code, show:false, info:_ChartUtils.indicator.didGetDefaultInfo(code) };
				target.push(item);
			}

			return(xResult);
		};

		/**
		 * added by choi sunwoo at 2017.05.09 for #708
		 * 指標の全リスト情報を次のように構成する。
		 * {trend:[{typeId:typeId, show:false, info:{指標情報}}], oscillator:[{typeId:typeId, show:false, info:{指標情報}}]}
		 * @return {object}
		 */
		_ChartUtils.indicator.didGetDefaultPlotColorInfos = function() {
			var xResult = {
				trend : [],
				oscillator : []
			};

			var indicators;
			var count;
			var target;

			// トレンド系
			indicators = _ChartUtils.constants.indicatorGroups.trend.indicators;
			count = indicators.length;
			target = xResult.trend;
			for(var ii = 0; ii < count; ii++) {
				var code = indicators[ii];
				var xInfo = _ChartUtils.indicator.didGetDefaultInfo(code);
				if(xInfo) {
					var item = { code: code, display: xInfo.display, info:_ChartUtils.indicator.didGetDefaultPlotColorInfo(xInfo) };
					target.push(item);
				}

			}

			// オシレーター系
			indicators = _ChartUtils.constants.indicatorGroups.oscillator.indicators;
			count = indicators.length;
			target = xResult.oscillator;
			for(var ii = 0; ii < count; ii++) {
				var code = indicators[ii];
				var xInfo = _ChartUtils.indicator.didGetDefaultInfo(code);
				if(xInfo) {
					var item = { code: code, display: xInfo.display, info:_ChartUtils.indicator.didGetDefaultPlotColorInfo(xInfo) };
					target.push(item);
				}
			}

			return(xResult);
		};

		/**
		 * [description]
		 * @param  {[type]} argSrc
		 * @param  {[type]} usePlotColor
		 * @param  {[type]} dontUseLine
		 * @return {[type]}
		 */
		_ChartUtils.indicator.didDecodeSeriesInformation = function(argSeriesInfo, argSaveInfo, useUpdate) {
			if(!argSeriesInfo || !argSaveInfo) {
				return;
			}

			var xResult = {};
			var count;

			var xSiNew = {
				code : argSeriesInfo.code,
				show : argSeriesInfo.show,
				info : useUpdate === true ? argSeriesInfo.info : _ChartUtils.didClone(argSeriesInfo.info)
			};

			var seriesInfo = xSiNew.info;
			var xInfo = argSaveInfo.i;
			if(xInfo && seriesInfo) {
				var xDstParams = seriesInfo.params;
				if(xInfo.pa) {
					count = xInfo.pa.length;
					if(count > 0) {
						for(var ii = 0; ii < count; ii++) {
							var xSrcParam = xInfo.pa[ii];
							try {
								var index = xSrcParam[0];
								var value = xSrcParam[1];

								var xDstParam = xDstParams[index];
								xDstParam.value = value;
							}
							catch(e) {
								console.error(e);
							}
						}
					}
				}

				var xDstPlots = seriesInfo.plots;
				if(xInfo.ps) {
					count = xInfo.ps.length;
					if(count > 0) {
						for(var ii = 0; ii < count; ii++) {
							var xSrcPlot = xInfo.ps[ii];
							try {
								var index = xSrcPlot[0];
								var hide  = xSrcPlot[1];

								var xDstPlot = xDstPlots[index];
								if(hide) { // #2397
									xDstPlot.hide = true; // #2397
								}
								// #2397
								else {
									xDstPlot.hide = false;
								}
								//
							}
							catch(e) {
								console.error(e);
							}
						}
					}
				}

				var xDstLines = seriesInfo.lines;
				if(xInfo.l) {
					count = xInfo.l.length;
					if(count > 0) {
						for(var ii = 0; ii < count; ii++) {
							var xSrcLine = xInfo.l[ii];
							try {
								var index = xSrcLine[0];
								var hide  = xSrcLine[1];

								var xDstLine = xDstLines[index];
								if(hide) { // #2397
									xDstLine.hide = true; // #2397
								}
								// #2397
								else {
									xDstLine.hide = false;
								}
								//
							}
							catch(e) {
								console.error(e);
							}
						}
					}
				}
			}

			//
			return(seriesInfo);
		};

		/**
		 * [description]
		 * @param  {[type]}  typeId
		 * @param  {[type]}  seriesInfos
		 * @param  {Boolean} isTrend
		 * @return {[type]}
		 */
		_ChartUtils.indicator.didFindSeriesInfoWithTypeId = function(typeId, seriesInfos, isTrend) {
			if(typeId === undefined || typeId == null || typeId === "" || seriesInfos === undefined || seriesInfos == null) {
				return;
			}

			try {
				var indicators;
				if(isTrend === true) {
					indicators = seriesInfos.trend;
				}
				else {
					indicators = seriesInfos.oscillator;
				}

				var nCount = indicators.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xSi = indicators[ii];
					if(xSi.code === typeId) {
						return(xSi);
					}
				}

				return;
			}
			catch(e) {

			}

			return;
		};

		/**
		 * [description]
		 * @param  {[type]} argSrc
		 * @param  {[type]} usePlotColor
		 * @param  {[type]} dontUseLine
		 * @return {[type]}
		 */
		_ChartUtils.indicator.didConvertToShortSeriesInformation = function(argSrc, isSave, usePlotColor, dontUseLine) {
			if(!argSrc) {
				return;
			}

			var xResult = {};
			var count;

			if(isSave === true) {
				var xSave = {
				};

				if(argSrc.params) {
					count = argSrc.params.length;
					if(count > 0) {
						xSave.pa = [];
						for(var ii = 0; ii < count; ii++) {
							var xSrcParam = argSrc.params[ii];
							xSave.pa.push([ii,xSrcParam.value]);
						}
					}
				}

				if(argSrc.plots) {
					count = argSrc.plots.length;
					if(count > 0) {
						xSave.ps = [];
						for(var ii = 0; ii < count; ii++) {
							var xSrcPlot = argSrc.plots[ii];
							if(xSrcPlot.ignore === true) {
								continue;
							}
							if(xSrcPlot.hide === true) {
								xSave.ps.push([ii,1]);
							}
							// #2397
							else {
								xSave.ps.push([ii,0]);
							}
							//
						}
					}
				}

				if(dontUseLine !== true && argSrc.lines) {
					count = argSrc.lines.length;
					if(count > 0) {
						xSave.l = [];
						for(var ii = 0; ii < count; ii++) {
							var xSrcLine = argSrc.lines[ii];

							if(xSrcLine.hide === true) {
								xSave.l.push([ii,1]);
							}
							// #2397
							else {
								xSave.l.push([ii,0]);
							}
							//
						}
					}
				}

				return(xSave);
			}

			// code
			// display
			// displya_s
			// priceType
			xResult.code 		= argSrc.code;
			if(isSave !== true) {
				xResult.display 	= argSrc.display;
				xResult.displya_s	= argSrc.displya_s;
				if(argSrc.priceType === true) {
					xResult.priceType = true;
				}
			}

			// params
			// 	{name, value, range or list}
			if(argSrc.params) {
				if(isSave === true) {
					xResult.pa = [];
				}
				else {
					xResult.params = [];
				}
				count = argSrc.params.length;
				for(var ii = 0; ii < count; ii++) {
					var xSrcParam = argSrc.params[ii];
					var xNewParam = {};
					if(isSave === true) {
						xNewParam.n = xSrcParam.name;
						xNewParam.v = xSrcParam.value;

						//
						xResult.pa.push(xNewParam);
					}
					else {
						xNewParam.name    = xSrcParam.name;
						xNewParam.value   = xSrcParam.value;
						xNewParam.alias   = xSrcParam.alias;
						xNewParam.default = xSrcParam.default;
						if(xSrcParam.range) {
							xNewParam.range = _ChartUtils.didClone(xSrcParam.range);
						}
						else if(xSrcParam.list) {
							xNewParam.list = _ChartUtils.didClone(xSrcParam.list);
						}

						//
						if(xSrcParam.linked) {
							xNewParam.linked = xSrcParam.linked;
						}

						//
						xResult.params.push(xNewParam);
					}
				}
			}

			//
			// plots
			// 	{name, alias, hide}
			if(argSrc.plots) {
				if(isSave === true) {
					xResult.ps = [];
				}
				else {
					xResult.plots = [];
				}
				count = argSrc.plots.length;
				for(var ii = 0; ii < count; ii++) {
					var xSrcPlot = argSrc.plots[ii];
					if(xSrcPlot.ignore === true) {
						continue;
					}

					if(xSrcPlot.showHideOption !== true) {
						continue;
					}

					var xNewPlot = {};
					if(isSave === true) {
						xNewPlot.n  = xSrcPlot.name;
						if(xSrcPlot.hide === true) {
							xNewPlot.h = true;
						}

						xResult.ps.push(xNewPlot);
					}
					else {
						xNewPlot.name  = xSrcPlot.name;
						if(xSrcPlot.hide === true) {
							xNewPlot.hide = true;
						}
						xNewPlot.alias = xSrcPlot.alias;

						if(usePlotColor === true) {
							xNewPlot.color  = xSrcPlot.color;
						}

						//
						if(xSrcPlot.paramLink) {
							xNewPlot.paramLink = xSrcPlot.paramLink;
						}

						xResult.plots.push(xNewPlot);
					}
				}
			}

			//
			// lines
			// 	{name, value, lineColor}
			if(dontUseLine !== true && argSrc.lines) {
				if(isSave === true) {
					xResult.l = [];
				}
				else {
					xResult.lines = [];
				}

				count = argSrc.lines.length;
				for(var ii = 0; ii < count; ii++) {
					var xSrcLine = argSrc.lines[ii];

					if(xSrcLine.showHideOption !== true) {
						continue;
					}

					var xNewLine = {};
					if(isSave === true) {
						xNewLine.n  = xSrcLine.name;
						if(xSrcLine.hide === true) {
							xNewLine.h = true;
						}

						xResult.l.push(xNewLine);
					}
					else {
						xNewLine.name  = xSrcLine.name;
						//xNewLine.value = xSrcLine.value;
						if(xSrcLine.hide === true) {
							xNewLine.hide = true;
						}
						xNewLine.alias = xSrcLine.alias;

						xResult.lines.push(xNewLine);
					}


				}
			}

			//
			return(xResult);
		};

		// #1793
		_ChartUtils.indicator.didConvertToRestoreSeriesInformation = function(argSrc, isSave, usePlotColor, dontUseLine) {
			if(!argSrc) {
				return;
			}

			var xResult = {};
			var count;

			// code
			// display
			// displya_s
			// priceType
			xResult.code 		= argSrc.code;
			if(isSave !== true) {
				xResult.display 	= argSrc.display;
				xResult.displya_s	= argSrc.displya_s;
				if(argSrc.priceType === true) {
					xResult.priceType = true;
				}
			}

			// params
			// 	{name, value, range or list}
			if(argSrc.params) {
				if(isSave === true) {
					xResult.pa = [];
				}
				else {
					xResult.params = [];
				}
				count = argSrc.params.length;
				for(var ii = 0; ii < count; ii++) {
					var xSrcParam = argSrc.params[ii];
					var xNewParam = {};
					if(isSave === true) {
						xNewParam.n = xSrcParam.name;
						xNewParam.v = xSrcParam.value;

						//
						xResult.pa.push(xNewParam);
					}
					else {
						xNewParam.name    = xSrcParam.name;
						xNewParam.value   = xSrcParam.value;
						xNewParam.alias   = xSrcParam.alias;
						xNewParam.default = xSrcParam.default;
						if(xSrcParam.range) {
							xNewParam.range = _ChartUtils.didClone(xSrcParam.range);
						}
						else if(xSrcParam.list) {
							xNewParam.list = _ChartUtils.didClone(xSrcParam.list);
						}

						if(xSrcParam.linked) {
							xNewParam.linked = xSrcParam.linked;
						}

						//
						xResult.params.push(xNewParam);
					}
				}
			}

			//
			// plots
			// 	{name, alias, hide}
			if(argSrc.plots) {
				if(isSave === true) {
					xResult.ps = [];
				}
				else {
					xResult.plots = [];
				}
				count = argSrc.plots.length;
				for(var ii = 0; ii < count; ii++) {
					var xSrcPlot = argSrc.plots[ii];
					// if(xSrcPlot.ignore === true) {
					// 	continue;
					// }
					//
					// if(xSrcPlot.showHideOption !== true) {
					// 	continue;
					// }

					var xNewPlot = {};
					if(isSave === true) {
						xNewPlot.n  = xSrcPlot.name;
						if(xSrcPlot.hide === true) {
							xNewPlot.h = true;
						}

						xResult.ps.push(xNewPlot);
					}
					else {
						xNewPlot.name  = xSrcPlot.name;
						if(xSrcPlot.hide === true) {
							xNewPlot.hide = true;
						}
						xNewPlot.alias = xSrcPlot.alias;

						if(usePlotColor === true) {
							xNewPlot.color  = xSrcPlot.color;
						}

						if(xSrcPlot.paramLink) {
							xNewPlot.paramLink = xSrcPlot.paramLink;
						}

						xResult.plots.push(xNewPlot);
					}
				}
			}

			//
			// lines
			// 	{name, value, lineColor}
			if(dontUseLine !== true && argSrc.lines) {
				if(isSave === true) {
					xResult.l = [];
				}
				else {
					xResult.lines = [];
				}

				count = argSrc.lines.length;
				for(var ii = 0; ii < count; ii++) {
					var xSrcLine = argSrc.lines[ii];

					if(xSrcLine.showHideOption !== true) {
						continue;
					}

					var xNewLine = {};
					if(isSave === true) {
						xNewLine.n  = xSrcLine.name;
						if(xSrcLine.hide === true) {
							xNewLine.h = true;
						}

						xResult.l.push(xNewLine);
					}
					else {
						xNewLine.name  = xSrcLine.name;
						//xNewLine.value = xSrcLine.value;
						if(xSrcLine.hide === true) {
							xNewLine.hide = true;
						}
						xNewLine.alias = xSrcLine.alias;

						xResult.lines.push(xNewLine);
					}


				}
			}

			//
			return(xResult);
		};
		//

		/**
		 * [description]
		 * @param  {[type]} argSrc
		 * @return {[type]}
		 */
		_ChartUtils.indicator.didGetDefaultPlotColorInfo = function(argSrc) {
			if(!argSrc) {
				return;
			}

			var xResult = {};
			var count;

			// code
			// display
			// displya_s
			// priceType
			xResult.code 		= argSrc.code;

			//
			// plots
			// 	{name, alias, hide}
			if(argSrc.plots) {
				xResult.plots = [];
				count = argSrc.plots.length;
				for(var ii = 0; ii < count; ii++) {
					var xSrcPlot = argSrc.plots[ii];
					if(xSrcPlot.ignore === true) {
						continue;
					}

					var xNewPlot = {};
					xNewPlot.no  	= ii;
					xNewPlot.color  = xSrcPlot.color;

					xResult.plots.push(xNewPlot);
				}
			}

			//
			return(xResult);
		};

		/**
		 * [description]
		 * @param  {[type]} dest
		 * @param  {[type]} src
		 * @return {[type]}
		 */
		_ChartUtils.indicator.didApplySeriesInfos = function(dest, src) {
			if(!dest || !src) {
				return;
			}

			var destCount;
			var destObjs;
			var srcObjs;
			var srcCount;

			var destData;
			var srcData;

			// extraDiff
			if(src.extraDiff !== undefined && src.extraDiff != null) {
				dest.extraDiff = src.extraDiff;
			}

			// params
			destObjs = dest.params;
			srcObjs = src.params;
			if(destObjs && destObjs.length && srcObjs && srcObjs.length) {
				srcCount = srcObjs.length;
				for(var ii = 0; ii < srcCount; ii++) {
					var srcItem = srcObjs[ii];
					destCount = destObjs.length;
					for(var jj = 0; jj < destCount; jj++) {
						var destItem = destObjs[jj];
						if(srcItem.name && srcItem.name === destItem.name) {
							if(srcItem.value !== undefined && srcItem.value != null) {
								destItem.value = srcItem.value;
							}
							break;
						}
					}
				}
			}

			// plots
			destObjs = dest.plots;
			srcObjs = src.plots;
			if(destObjs && destObjs.length && srcObjs && srcObjs.length) {
				srcCount = srcObjs.length;
				for(var ii = 0; ii < srcCount; ii++) {
					var srcItem = srcObjs[ii];
					destCount = destObjs.length;
					for(var jj = 0; jj < destCount; jj++) {
						var destItem = destObjs[jj];
						if(srcItem.name && srcItem.name === destItem.name) {
							if(srcItem.plotStyle !== undefined && srcItem.plotStyle != null) {
								destItem.plotStyle = srcItem.plotStyle;
							}
							if(srcItem.color !== undefined && srcItem.color != null) {
								destItem.color = srcItem.color;
							}
							if(srcItem.lineStyle !== undefined && srcItem.lineStyle != null) {
								destItem.lineStyle = srcItem.lineStyle;
							}
							if(srcItem.lineWeight !== undefined && srcItem.lineWeight != null) {
								destItem.lineWeight = srcItem.lineWeight;
							}
							if(srcItem.hide !== undefined && srcItem.hide != null) {
								destItem.hide = srcItem.hide;
							}

							break;
						}
					}
				}
			}

			// lines
			destObjs = dest.lines;
			srcObjs = src.lines;
			if(destObjs && destObjs.length && srcObjs && srcObjs.length) {
				srcCount = srcObjs.length;
				for(var ii = 0; ii < srcCount; ii++) {
					var srcItem = srcObjs[ii];
					destCount = destObjs.length;
					for(var jj = 0; jj < destCount; jj++) {
						var destItem = destObjs[jj];
						if(srcItem.name && srcItem.name === destItem.name) {
							if(srcItem.value !== undefined && srcItem.value != null) {
								destItem.value = srcItem.value;
							}
							if(srcItem.lineColor !== undefined && srcItem.lineColor != null) {
								destItem.lineColor = srcItem.lineColor;
							}
							if(srcItem.lineStyle !== undefined && srcItem.lineStyle != null) {
								destItem.lineStyle = srcItem.lineStyle;
							}
							if(srcItem.lineWeight !== undefined && srcItem.lineWeight != null) {
								destItem.lineWeight = srcItem.lineWeight;
							}
							if(srcItem.hide !== undefined && srcItem.hide != null) {
								destItem.hide = srcItem.hide;
							}

							break;
						}
					}
				}
			}
		};

		/**
		 * [description]
		 * @param  {[type]} dest
		 * @param  {[type]} src
		 * @return {[type]}
		 */
		_ChartUtils.indicator.didApplySeriesPlotColorInfos = function(dest, plotColorInfos) {
			if(!dest || !plotColorInfos) {
				return(false);
			}

			var destCount;
			var destObjs;
			var srcObjs;
			var srcCount;

			var destData;
			var srcData;

			// plots
			destObjs = dest.plots;
			srcObjs = plotColorInfos;
			if(destObjs && destObjs.length && srcObjs && srcObjs.length) {
				srcCount = srcObjs.length;
				for(var ii = 0; ii < srcCount; ii++) {
					var srcItem = srcObjs[ii];
					var color = srcItem.color;
					var isBar   = srcItem.bar;
					var colorUp = srcItem.colorUp;
					var colorDn = srcItem.colorDn;
					var targets = srcItem.targets;
					if(targets === undefined || targets == null) {
						continue;
					}

					destCount = destObjs.length;
					for(var jj = 0; jj < destCount; jj++) {
						try {
							if(targets.indexOf(jj) < 0) {
								continue;
							}

							var destItem = destObjs[jj];
							if(color !== undefined && color != null) {
								destItem.color = color;
							}

							if(colorUp !== undefined && colorUp != null) {
								destItem.colorUp = colorUp;
							}

							if(colorDn !== undefined && colorDn != null) {
								destItem.colorDn = colorDn;
							}
						}
						catch(e) {
							// console.debug("[WGC] :" + e);
						}
					}
				}
			}

			return(true);
		};

		/**
		 *
		 */
		_ChartUtils.validator = {};

		/**
		 * @param[in] argxPrice price object
		 * @return true or false
		 */
		_ChartUtils.validator.isValidPrice = function(argxPrice, isAverage) {
			if (argxPrice === undefined || argxPrice === null || argxPrice.close === undefined || argxPrice.close == null || parseInt(argxPrice.close) === 0) {
				return (false);
			}

			if(isAverage === true) {
				if(!argxPrice.avgClose || !argxPrice.avgOpen) {
					return (false);
				}
			}

			return (true);
		};

		/**
		 * @param[in] argxPrice price object
		 * @return true or false
		 */
		_ChartUtils.validator.isFixedPrice = function(argxPrice, xEnv) {
			try {
				if(xEnv && xEnv.System.ShowFixedData === true) {
					return(false);
				}

				if(argxPrice && argxPrice.fixed === true) {
					return(true);
				}
			}
			catch(e) {

			}

			return (false);
		};

		/**
		 *
		 */
		_ChartUtils.axis = {};

		// #1224
		_ChartUtils.axis.label = {};
		_ChartUtils.axis.label.multipleValue = {
			1 : '(x) 10',
			2 : '(x) 100',
			3 : '(x) 1000',
			4 : '(x) 一万',
			5 : '(x) 十万',
			6 : '(x) 百万',
			7 : '(x) 千万',
			8 : '(x) 一億',
			9 : '(x) 十億',
		};

		// #2038
		_ChartUtils.axis.didCalcBarGapInfoFromLevelInfo = function(barSize, barGap, levelInfo) {
			var result = {barSize:barSize, barGap:barGap};
			if(!levelInfo) {
				return(result);
			}

			result.barGap  = levelInfo.gap;
			result.barSize = Math.round((levelInfo.bar - 1) / 2);

			return(result);
		};
		//

		_ChartUtils.axis.label.didCalcMutipleValue = function(value1, value2) {
			if(!_ChartUtils.constants.chartConfigConstants.YLabelLengthLimit || _ChartUtils.constants.chartConfigConstants.YLabelLengthLimit < 1) {
				return;
			}

			if(typeof value1 !== "number") {
				return;
			}

			var nLen1 = String(value1).length;
			var nLen2 = 0;
			var value;

			if(typeof value2 === "number") {
				nLen2 = String(value2).length;
			}

			if(nLen1 < nLen2) {
				value = value2;
			}
			else {
				value = value1;
			}

			var checkValue = 0;
			for(var ii = 0; ii < _ChartUtils.constants.chartConfigConstants.YLabelLengthLimit; ii++) {
				checkValue += (9 * Math.pow(10, ii));
			}

			value = Math.abs(value);

			if(value > checkValue) {
				var _temp = value;
				var multiple = 1;
				while(_temp > 999999) {
					var pow = Math.pow(0.1, multiple);
					_temp = pow * _temp;

					multiple++;
				}

				var result = {
					multiple : multiple,
					display  : _ChartUtils.axis.label.multipleValue[multiple],
					pow      : Math.pow(0.1, multiple)
				}

				return(result);
			}
		};

		/**
		 * pixelとdoubleの変換に誤差があるのでこの値を調整する。
		 * @param  {[type]}  argValue	original value
		 * @param  {Boolean} isFive		use 0, 5 unit or 10 unit
		 * @return {[type]}
		 */
		_ChartUtils.axis.didAdjustZFValue = function(argValue, isFive) {
			var result = argValue;

			// #1255のため、comment
			// // #1105
			// var value  = argValue;
			// //
			//
			// if(isFive === true) {
			// 	var __n10Digit = parseInt(value % 10);
			// 	var __nValue = parseInt(value * 0.1);
			// 	if(1 < __n10Digit && __n10Digit <= 5) {
			// 		__nValue = __nValue * 10 + 5;
			// 	}
			// 	else if(5 < __n10Digit && __n10Digit <= 9) {
			// 		__nValue = (__nValue + 1) * 10;
			// 	}
			// 	else {
			// 		__nValue = __nValue * 10;
			// 	}
			//
			// 	result = __nValue;
			// }
			// else {
			// 	var __nValue = Math.round(value * 0.1) * 10;
			//
			// 	result = __nValue;
			// }

			//
			return(result);
		};

		/**
		 *
		 */
		_ChartUtils.axis.didGetLocalYPos = function(argBase, argPriceDiff) {
			var base = argBase;

			// get offset from base
			// var nOffset = Math.round/*parseInt*/((base.rv * argPriceDiff));// + 1;
			var offset = ((base.rv * argPriceDiff));// + 1;

			// _ChartUtils.debug.logForCompareValue('Frame:GetYPos => ', nOffset, nOffset1);
			// adjust
			var nLocalYPos = Math.round/* parseInt */(base.height + base.y - offset);// - (base.rv / 2));
			//var nLocalYPos1 = Math.round/* parseInt */(base.height + base.y - offset - (base.rv / 2));

			// _ChartUtils.debug.logForCompareValue('_ChartUtils.axis.didGetLocalYPos => ', nLocalYPos, nLocalYPos1);

			//
			return (nLocalYPos);
		};

		/**
		 *
		 */
		_ChartUtils.axis.didGetLocalXPos = function(argBase, argDiff) {
			var base = argBase;

			// get offset from base
			// var nOffset = Math.round/*parseInt*/((base.rv * argPriceDiff));// + 1;
			var offset = ((base.rh * argDiff));// + 1;

			// _ChartUtils.debug.logForCompareValue('Frame:GetYPos => ', nOffset, nOffset1);
			// adjust
			var nLocalXPos = Math.round/* parseInt */(base.width + base.x - offset);// - (base.rv / 2));
			//var nLocalYPos1 = Math.round/* parseInt */(base.height + base.y - offset - (base.rv / 2));

			// _ChartUtils.debug.logForCompareValue('_ChartUtils.axis.didGetLocalYPos => ', nLocalYPos, nLocalYPos1);

			//
			return (nLocalXPos);
		};

		/**
		 *
		 */
		_ChartUtils.axis.didGetLocalPos = function(argBase, argValueDiff, bHorz) {
			var base = argBase;
			var nLocalPos = 0;

			// get offset from base
			if(bHorz === true) {
				var offset = ((base.rh * argValueDiff));// + 1;

				nLocalPos = Math.round/* parseInt */(base.x + offset);// - (base.rv / 2));
			}
			else {
				var offset = ((base.rv * argValueDiff));// + 1;

				nLocalPos = Math.round/* parseInt */(pixelSize + base.y - offset);// - (base.rv / 2));
			}

			//
			return (nLocalPos);
		};

		/**
		 * @param[in] argPrice
		 * @return rounded price
		 */
		_ChartUtils.axis.didCalcRulerUnitY = function(argPriceDiff, argHeight, verpos) {
			var priceDiff = argPriceDiff;

			verpos = verpos || 0; // #1443

			var rulerUnit = Math.round(argPriceDiff / 5);
			var bMicro = false;
			if (rulerUnit <= 1) {
				bMicro = true;
			} else {
				var nGap = Math.round(argHeight / 50);
				if (nGap === 0) {
					nGap = 1;
				}

				if (nGap > rulerUnit) {
					rulerUnit = nGap;
				}

				rulerUnit = Math.round((rulerUnit / nGap + 0.5) * 5);
			}

			var result = {
				flag : bMicro,
				unit : rulerUnit
			};

			return (result);
		};

		// #2038
		_ChartUtils.axis.didCalcRulerUnitYAsGuideOffset = function(argPriceDiff, argHeight, guideOffset, verpos) {
			var priceDiff = argPriceDiff;

			verpos = verpos || 0; // #1443

			var rulerUnit = guideOffset;
			var bMicro = false;
			if (rulerUnit <= 1) {
				bMicro = true;
			}

			var result = {
				flag : bMicro,
				unit : rulerUnit
			};

			return (result);
		};

		/**
		 * グリード単位を計算する。（詳細バージョン）
		 * @param  {[type]} argParams
		 * @return {[type]}
		 */
		_ChartUtils.axis.didCalcRulerUnitAsGuideOffset = function(argParams) {
			var	dOrg		= argParams.dOrg;
			var nPointVal	= 0;//argParams.nPointVal;
			var dXVal		= argParams.dXVal ;
		  	var	dMax		= argParams.dMax  ;
		  	var	dMin		= argParams.dMin  ;
		  	var	bSign		= argParams.bSign ;
		  	var	bDiff		= argParams.bDiff ;
		  	var	bLog 		= argParams.bLog  ;

			// point value is 10's exponent
			// offset must be over than upper pow value
			var	dCheck		= Math.pow ( 10.0 , -1 * nPointVal ) ;
			var	nSign		= ( dOrg < 0 ) ? -1 : 1 ;
			var	dTemp		= dOrg * nSign ;
			var	dTemp1		= 0;
			var	nSig		= 1;
			var	ii			= 0;
			var	nLoopMax	= 0;
			var	dMMChk		= ( dMax - dMin ) * _ChartUtils.constants.ngcl.define.NGCL_AXIS_RATE1;
			var	dCvt		= 0;
			var	dDCheck 	= dMMChk * _ChartUtils.constants.ngcl.define.NGCL_AXIS_RATE2;//min( dOrg * 2.5, dMMChk );

			// Original value may be positive number.
			// but 0 value is return.
			if( dOrg === 0 ) {
				return dCheck ;
			}

			if(dOrg <= 5) {
				return(dOrg);
			}

			if(dOrg < 10) {
				return(10);
			}

			var dCalced= dOrg;
			var dTemp1 = dOrg % 10;
			var dTemp2 = dOrg - dTemp1;
			if(dTemp1 < 5) {
				dCalced = dTemp2 + 5;
			}
			else {
				dCalced = dTemp2 + 10;
			}

			return(dCalced);
		};
		//

		/**
		 * グリード単位を計算する。
		 * @param  {[type]} argValueDiff
		 * @param  {[type]} argPixelDiff
		 * @return {[type]}
		 */
		_ChartUtils.axis.didCalcRulerUnit = function(argValueDiff, argPixelDiff) {
			var rulerUnit = Math.round(argValueDiff / 5);
			var bMicro = false;
			if (rulerUnit <= 1) {
				bMicro = true;
			} else {
				var nGap = Math.round(argPixelDiff / 50);
				if (nGap === 0) {
					nGap = 1;
				}

				if (nGap > rulerUnit) {
					rulerUnit = nGap;
				}

				rulerUnit = Math.round((rulerUnit / nGap + 0.5) * 5);
			}

			var result = {
				flag : bMicro,
				unit : rulerUnit
			};

			return (result);
		};

		/**
		 * グリードの値をきれいに刻むため、ベース値を調整する。
		 * @param  {[type]} argOrigin	original value
		 * @param  {[type]} argOffset	grid offset value
		 * @return {[type]}
		 */
		_ChartUtils.axis.didCalcRulerBase = function(argOrigin, argOffset) {
			var dOrg	= argOrigin;
			var	dDOff	= argOffset;

			// point value is 10's exponent
			// offset must be over than upper pow value
			var	dCheck	= 5;
			var	nSign	= ( dOrg < 0 ) ? -1 : 1 ;
			var	dTemp	= dOrg * nSign ;
			var	dTemp1	= 0;
			var	nSig	= 1;
			var	ii		= 0;
			var	nLoopMax= 0;
			var	dCvt	= 0;

			var	nMulti	= parseInt( dTemp / dDOff );

			dTemp	= dDOff * nMulti;

			return( dTemp * nSign );
		};

		/**
		 * draw X-Axis
		 *
		 * @param[in] argDrawParam
		 * @return true or false
		 */
		_ChartUtils.axis.didDrawXAxisVer0 = function(argDrawParam) {
			if (argDrawParam.isGrid === true && argDrawParam.config.show !== true) {
				return (false);
			}

			var nScrSIdx = argDrawParam.scrollInfo.pos;
			var nScrSize = argDrawParam.scrollInfo.screenSize;
			var drawWrapper = argDrawParam.drawWrapper;
			var xAxisX = argDrawParam.axis;
			var nDiv = parseInt(nScrSize / 4);

			var	gridStyle = argDrawParam.config.gridStyle;
			var gridColor = argDrawParam.config.gridColor;
			var fontColor = argDrawParam.config.fontColor;
			var font = argDrawParam.config.font;
			var bShowGrid = argDrawParam.config.show;
			var leftWidth = argDrawParam.target.leftWidth;
			var rightWidth = argDrawParam.target.rightWidth;
			var gridWidth = argDrawParam.target.gridWidth;
			var height = argDrawParam.height;
			var nTType = argDrawParam.timeType;

			var drawLineParam = {
				context : argDrawParam.target.context,
				pt1 : {
					x : 0,
					y : 0
				},
				pt2 : {
					x : 0,
					y : 0
				},
				lineWidth : 1,
				lineColor : gridColor
			};

			var drawTextParam = {
				context : argDrawParam.target.context,
				pt : {
					x : 0,
					y : 0
				},
				text : '',
				font : font,
				fillStyle : fontColor
			};

			// 3 lines
			for (var ii = 1; ii <= 3; ii++) {
				var iIndex;
				var strDate = "";

				// make local index
				var nLocalIdx = ii * nDiv;

				//
				var localXPos = xAxisX.GetXPos(nLocalIdx);
				var dataIdx   = drawWrapper.didConvertLocalIndexToDataIndex(nLocalIdx);

				var localYPos = -1;

				// for grid in panel
				if (argDrawParam.isGrid === true) {
					drawLineParam.pt1.x = localXPos;
					drawLineParam.pt1.y = 1;
					drawLineParam.pt2.x = localXPos;
					drawLineParam.pt2.y = height - 1;
					drawLineParam.lineStyle = gridStyle;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);
				}
				// for ruler in axis-x panel
				else {
					// draw axis ruler
					drawLineParam.pt1.x = localXPos;
					drawLineParam.pt1.y = localYPos;
					drawLineParam.pt2.x = localXPos;
					drawLineParam.pt2.y = localYPos + 3;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);

					var xTimeData = drawWrapper.didGetTimedataAt(dataIdx, false, true);
					if (xTimeData === undefined || xTimeData === null) {
						continue;
					}

					var timeData  = xTimeData.dateTime;
					if (timeData === undefined || timeData === null) {
						continue;
					}

					//
					// TODO: change timeUnit check method. use some types not trcode.
					//
					var strRuler = '';
					var strTemp = '';
					if (nTType <= _ChartUtils.constants.timeType.minute) {
						strTemp = timeData.slice(8);
						strRuler = _ChartUtils.dateTime.formatTimeString(strTemp, _ChartUtils.dateTime.timeFormat1);
					} else {
						strTemp = timeData.slice(0, 8);
						strRuler = _ChartUtils.dateTime.formatDateString(strTemp, _ChartUtils.dateTime.dateFormat1);
					}

					var strWidth = argDrawParam.target.context.measureText(strRuler).width;
					var localXPosText = parseInt(localXPos - (strWidth / 2));
					//
					if (localXPosText < leftWidth) {
						localXPosText = leftWidth + 2;
					} else if ((localXPosText + strWidth) > (gridWidth - rightWidth)) {
						localXPosText = (gridWidth - rightWidth) - strWidth - 5;
					}

					var localYPosText = localYPos + 15;

					drawTextParam.text = strRuler;
					drawTextParam.pt.x = localXPosText;
					drawTextParam.pt.y = localYPosText;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					gxDc.TextOut(drawTextParam);
				}
			}
		};

		_ChartUtils.axis.canBePrintLabelOnXAxis = function(timeType, timeInterval, xTimeDataCur, xTimeDataPre, offset, nDiv) {
			if(xTimeDataCur === undefined || xTimeDataCur === null) {
				return(false);
			}

			var timeDataCur  = xTimeDataCur.dateTime;
			if(timeDataCur === undefined || timeDataCur === null) {
				return(false);
			}

			// 以前データがなければ
			if(!xTimeDataPre) {
				return(true);
			}

			var timeDataPre  = xTimeDataPre.dateTime;
			if(!timeDataPre) {
				return(true);
			}

			var	nCDate	= parseInt(timeDataCur.slice(0, 8));
			var	nCTime	= parseInt(timeDataCur.slice(8));
			var	nCTickNo= xTimeDataCur.tickNo;
			var	nPDate	= parseInt(timeDataPre.slice(0, 8));
			var	nPTime	= parseInt(timeDataPre.slice(8));
			var	nPTickNo= xTimeDataPre.tickNo ;
			var	stCur	= _ChartUtils.dateTime.convertNumberToDatetime(nCDate, nCTime);
			var	stPre	= _ChartUtils.dateTime.convertNumberToDatetime(nPDate, nPTime);

			// #1443
			nDiv		= nDiv || 3;
			offset		= offset || 0;
			//
			offset		= Math.abs(offset);

			if(_ChartUtils.constants.timeType.hour < timeType) {
				if( offset % nDiv == 0 )
					return( true ) ;
			}
			else if(_ChartUtils.constants.timeType.hour == timeType) {
				if( stPre.year  < stCur.year  )
					return( true ) ;

				if( stPre.month < stCur.month )
					return( true ) ;

				if( stPre.day	 < stCur.day   )
					return( true ) ;

				if( offset % nDiv == 0 )
					return( true ) ;
			}
			else if(_ChartUtils.constants.timeType.minute == timeType) {
				if( stPre.year  < stCur.year  )
					return( true ) ;

				if( stPre.month < stCur.month )
					return( true ) ;

				if( stPre.day	 < stCur.day   )
					return( true ) ;

				if( offset % nDiv == 0 )
					return( true ) ;
			}
			else if(_ChartUtils.constants.timeType.tick == timeType) {
				if( offset % nDiv == 0 )
					return( true ) ;
			}
			else {
				if( offset % nDiv == 0 )
					return( true ) ;
			}

			return(false);
		};

		_ChartUtils.axis.canBePrintLabelOnXAxisVer0 = function(timeType, timeInterval, xTimeDataCur, xTimeDataPre) {
			if(xTimeDataCur === undefined || xTimeDataCur === null) {
				return(false);
			}

			var timeDataCur  = xTimeDataCur.dateTime;
			if(timeDataCur === undefined || timeDataCur === null) {
				return(false);
			}

			if(!xTimeDataPre) {
				return(true);
			}

			var timeDataPre  = xTimeDataPre.dateTime;
			if(!timeDataPre) {
				return(true);
			}

			var	nCDate	= parseInt(timeDataCur.slice(0, 8));
			var	nCTime	= parseInt(timeDataCur.slice(8));
			var	nCTickNo= xTimeDataCur.tickNo;
			var	nPDate	= parseInt(timeDataPre.slice(0, 8));
			var	nPTime	= parseInt(timeDataPre.slice(8));
			var	nPTickNo= xTimeDataPre.tickNo ;
			var	stCur	= _ChartUtils.dateTime.convertNumberToDatetime(nCDate, nCTime);
			var	stPre	= _ChartUtils.dateTime.convertNumberToDatetime(nPDate, nPTime);

			if(_ChartUtils.constants.timeType.week < timeType) {
				if( stPre.year < stCur.year ) {
					return( true ) ;
				}
			}
			else if(_ChartUtils.constants.timeType.hour < timeType) {
				if( stPre.year < stCur.year ) {
					return( true ) ;
				}

				if( stPre.year == stCur.year && stPre.month < stCur.month ) {
					return( true ) ;
				}

				if( stPre.day	 < stCur.day   ) {
					return( true ) ;
				}
			}
			else if(_ChartUtils.constants.timeType.hour == timeType) {
				if( stPre.year  < stCur.year  )
					return( true ) ;

				if( stPre.month < stCur.month )
					return( true ) ;

				if( stPre.day	 < stCur.day   )
					return( true ) ;

				if( stPre.hour  < stPre.hour  )
					return( true ) ;

				var	nDiv	= 5 ;
				if( timeInterval <= 3 )
					nDiv	= 5  ;
				else if( timeInterval <= 10 )
					nDiv	= 15 ;
				else if( timeInterval <= 15 )
					nDiv	= 60 ;
				else
					nDiv	= 60 ;

				if( stCur.minute % nDiv == 0 )
					return( true ) ;
			}
			else if(_ChartUtils.constants.timeType.hour == timeType) {
				if( stPre.year  < stCur.year  )
					return( true ) ;

				if( stPre.month < stCur.month )
					return( true ) ;

				if( stPre.day	 < stCur.day   )
					return( true ) ;

				if( stPre.hour  < stPre.hour  )
					return( true ) ;

				var	nDiv	= 5 ;
				if( timeInterval <= 3 )
					nDiv	= 4 ;
				else if( timeInterval <= 10 )
					nDiv	= 8 ;
				else
					nDiv	= 24 ;

				if( stCur.hour % nDiv == 0 )
					return( true ) ;
			}
			else if(_ChartUtils.constants.timeType.minute == timeType) {
				if( stPre.year  < stCur.year  )
					return( true ) ;

				if( stPre.month < stCur.month )
					return( true ) ;

				if( stPre.day	 < stCur.day   )
					return( true ) ;

				if( stPre.hour  < stPre.hour  )
					return( true ) ;

				var	nDiv	= 5 ;
				if( timeInterval <= 3 )
					nDiv	= 5  ;
				else if( timeInterval <= 10 )
					nDiv	= 15 ;
				else if( timeInterval <= 15 )
					nDiv	= 60 ;
				else
					nDiv	= 60 ;

				if( stCur.minute % nDiv == 0 )
					return( true ) ;
			}
			else if(_ChartUtils.constants.timeType.tick == timeType) {
				if( stPre.year  < stCur.year  )
					return( true ) ;

				if( stPre.month < stCur.month )
					return( true ) ;

				if( stPre.day	 < stCur.day   )
					return( true ) ;

				if( stPre.hour  < stPre.hour  )
					return( true ) ;

				if( stPre.minute < stPre.minute  )
					return( true ) ;

				var	nDiv	= 5 ;
				if( timeInterval <= 3 )
					nDiv	= 5  ;
				else if( timeInterval <= 10 )
					nDiv	= 15 ;
				else if( timeInterval <= 15 )
					nDiv	= 60 ;
				else
					nDiv	= 60 ;

				if( stCur.second % nDiv == 0 )
					return( true ) ;
			}

			return(false);
		};

		/**
		 * draw X-Axis
		 * @param[in] argDrawParam
		 * @return true or false
		 */
		_ChartUtils.axis.didDrawXAxis = function(argDrawParam) {
			if (argDrawParam.isGrid === true && argDrawParam.config.show !== true) {
				return (false);
			}

			var nScrSIdx = argDrawParam.scrollInfo.pos;
			var nScrSize = argDrawParam.scrollInfo.screenSize;

			if(nScrSize < 1) {
				return (false);
			}

			var drawWrapper = argDrawParam.drawWrapper;
			var xAxisX 		= argDrawParam.axis;

			var	gridStyle 	= argDrawParam.config.gridStyle;
			var gridColor 	= argDrawParam.config.gridColor;
			var fontColor 	= argDrawParam.config.fontColor;
			var font 		= argDrawParam.config.font;
			var bShowGrid 	= argDrawParam.config.show;
			var leftWidth 	= argDrawParam.target.leftWidth;
			var rightWidth 	= argDrawParam.target.rightWidth;
			var gridWidth 	= argDrawParam.target.gridWidth;
			var height 		= argDrawParam.height;

			var nTType 		= argDrawParam.timeType;
			var	nTGap		= argDrawParam.timeInterval;

			var drawLineParam = {
				context : argDrawParam.target.context,
				pt1 : {
					x : 0,
					y : 0
				},
				pt2 : {
					x : 0,
					y : 0
				},
				lineWidth : 1,
				lineColor : gridColor
			};

			var drawTextParam = {
				context : argDrawParam.target.context,
				pt : {
					x : 0,
					y : 0
				},
				text : '',
				font : font,
				fillStyle : fontColor
			};

			if(argDrawParam.clip) {
				drawTextParam.clip = argDrawParam.clip;
			}

			var __tmpCanvas__  = document.createElement('canvas');
			var __tmpContext__ = __tmpCanvas__.getContext('2d');
			var __calcText__   = _ChartUtils.timeZone.getDefaultDisplayString(nTType);
			__tmpContext__.font= font; // #3016
			var __calcWidth__  = __tmpContext__.measureText(__calcText__).width;
			__tmpContext__	   = undefined;
			__tmpCanvas__	   = undefined;

			var maxDiv		   = Math.min(Math.max(3, parseInt(gridWidth / __calcWidth__)), 8);
			var nDiv 		   = parseInt(nScrSize / maxDiv);

			if(isNaN(nDiv)) {
				nDiv = 3;
			}

			//
			var	nLastX;
			var nLastDataIdx;
			for (var ii = 0; ii < nScrSize; ii++) {
				var iIndex;
				var strDate = "";

				// make local index
				var nLocalIdx = ii;

				//
				var localXPos = xAxisX.GetXPos(nLocalIdx);
				var dataIdx   = drawWrapper.didConvertLocalIndexToDataIndex(nLocalIdx);

				var xTimeData = drawWrapper.didGetTimedataAt(dataIdx, false, true);
				if (xTimeData === undefined || xTimeData === null) {
					continue;
				}

				var timeData  = xTimeData.dateTime;
				if (timeData === undefined || timeData === null) {
					continue;
				}

				var xTimeDataPre = drawWrapper.didGetTimedataAt(dataIdx - 1, false, true);
				var nOffset = 0;
				nOffset = dataIdx;

				/*
				var nOffset = 0;
				if(nLastDataIdx !== undefined && nLastDataIdx !== undefined) {
					nOffset = dataIdx - nLastDataIdx;
				}
				else {
					nOffset = dataIdx;
				}
				*/

				if(_ChartUtils.axis.canBePrintLabelOnXAxis(nTType, nTGap, xTimeData, xTimeDataPre, nOffset, nDiv) !== true) {
					continue;
				}

				var localYPos = -1;

				//
				// TODO: change timeUnit check method. use some types not trcode.
				//
				var strRuler = '';
				var strTemp = '';
				if (nTType <= _ChartUtils.constants.timeType.hour) {
					strTemp = timeData.slice(8);
					strRuler = _ChartUtils.dateTime.formatTimeString(strTemp, _ChartUtils.dateTime.timeFormat1);
				} else {
					strTemp = timeData.slice(0, 8);
					strRuler = _ChartUtils.dateTime.formatDateString(strTemp, _ChartUtils.dateTime.dateFormat1);
				}

				var strWidth = __calcWidth__;
				var localXPosText = parseInt(localXPos - (strWidth / 2));
				//
				if (localXPosText < leftWidth) {
					continue;
				}

				if(nLastX !== undefined && nLastX != null && nLastX > (localXPosText - (strWidth + 5))) {
					continue;
				}

				// for grid in panel
				if (argDrawParam.isGrid === true) {
					drawLineParam.pt1.x = localXPos;
					drawLineParam.pt1.y = 1;
					drawLineParam.pt2.x = localXPos;
					drawLineParam.pt2.y = height - 1;
					drawLineParam.lineStyle = gridStyle;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);
				}
				// for ruler in axis-x panel
				else {
					// draw axis ruler
					if(argDrawParam.showRuler) { // #1944
						drawLineParam.pt1.x = localXPos;
						drawLineParam.pt1.y = localYPos;
						drawLineParam.pt2.x = localXPos;
						drawLineParam.pt2.y = localYPos + 3;
						drawLineParam.lineColor = gridColor;
						gxDc.Line(drawLineParam);
					}

					var localYPosText = localYPos + 10; // #3168

					drawTextParam.text = strRuler;
					drawTextParam.pt.x = localXPosText;
					drawTextParam.pt.y = localYPosText;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					gxDc.TextOut(drawTextParam);
				}

				nLastX = localXPosText;
				nLastDataIdx = dataIdx;
			}
		};

		// #2038
		_ChartUtils.axis.didDrawXAxisWithLevel = function(argDrawParam) {
			if(argDrawParam.levelInfo === undefined || argDrawParam.levelInfo == null) {
				return(_ChartUtils.axis.didDrawXAxis(argDrawParam));
			}

			if (argDrawParam.isGrid === true && argDrawParam.config.show !== true) {
				return (false);
			}

			var nScrSIdx = argDrawParam.scrollInfo.pos;
			var nScrSize = argDrawParam.scrollInfo.screenSize;

			if(nScrSize < 1) {
				return (false);
			}

			var drawWrapper = argDrawParam.drawWrapper;
			var xAxisX 		= argDrawParam.axis;

			var	gridStyle 	= argDrawParam.config.gridStyle;
			var gridColor 	= argDrawParam.config.gridColor;
			var fontColor 	= argDrawParam.config.fontColor;
			var font 		= argDrawParam.config.font;
			var bShowGrid 	= argDrawParam.config.show;
			var leftWidth 	= argDrawParam.target.leftWidth;
			var rightWidth 	= argDrawParam.target.rightWidth;
			var gridWidth 	= argDrawParam.target.gridWidth;
			var height 		= argDrawParam.height;

			var nTType 		= argDrawParam.timeType;
			var	nTGap		= argDrawParam.timeInterval;

			var levelInfo	= argDrawParam.levelInfo;
			var levelGuide	= levelInfo.guideOffset || 1;
			levelGuide		= Math.max(1, levelGuide);

			var guideSize	= levelInfo.guideSize;

			var drawLineParam = {
				context : argDrawParam.target.context,
				pt1 : {
					x : 0,
					y : 0
				},
				pt2 : {
					x : 0,
					y : 0
				},
				lineWidth : 1,
				lineColor : gridColor
			};

			var drawTextParam = {
				context : argDrawParam.target.context,
				pt : {
					x : 0,
					y : 0
				},
				text : '',
				font : font,
				fillStyle : fontColor
			};

			if(argDrawParam.clip) {
				drawTextParam.clip = argDrawParam.clip;
			}

			var __tmpCanvas__  = document.createElement('canvas');
			var __tmpContext__ = __tmpCanvas__.getContext('2d');
			var __calcText__   = _ChartUtils.timeZone.getDefaultDisplayString(nTType);
			var __calcWidth__  = __tmpContext__.measureText(__calcText__).width;
			__tmpContext__	   = undefined;
			__tmpCanvas__	   = undefined;

			var textDiv		   = levelGuide * Math.max(1, Math.ceil(__calcWidth__ / guideSize));

			//
			var	nLastX;
			var nLastDataIdx;
			for (var ii = 0; ii < nScrSize; ii++) {
				var iIndex;
				var strDate = "";

				// make local index
				var nLocalIdx = ii;

				//
				var localXPos = xAxisX.GetXPos(nLocalIdx);
				var dataIdx   = drawWrapper.didConvertLocalIndexToDataIndex(nLocalIdx);

				// #2038
				if(dataIdx % levelGuide != 0) {
					continue;
				}

				var localYPos = -1;

				// for grid in panel
				if (argDrawParam.isGrid === true) {
					drawLineParam.pt1.x = localXPos;
					drawLineParam.pt1.y = 1;
					drawLineParam.pt2.x = localXPos;
					drawLineParam.pt2.y = height - 1;
					drawLineParam.lineStyle = gridStyle;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);
				}
				// for ruler in axis-x panel
				else {
					// draw axis ruler
					drawLineParam.pt1.x = localXPos;
					drawLineParam.pt1.y = localYPos;
					drawLineParam.pt2.x = localXPos;
					drawLineParam.pt2.y = localYPos + 3;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);
				}

				//
				if (argDrawParam.isGrid != true && argDrawParam.isNontime !== true) { // #2037
					// #2038
					if(dataIdx % textDiv != 0) {
						continue;
					}

					var xTimeData = drawWrapper.didGetTimedataAt(dataIdx, false, true);
					if (xTimeData === undefined || xTimeData === null) {
						continue;
					}

					var timeData  = xTimeData.dateTime;
					if (timeData === undefined || timeData === null) {
						continue;
					}

					var xTimeDataPre = drawWrapper.didGetTimedataAt(dataIdx - 1, false, true);
					var nOffset = 0;
					nOffset = dataIdx;

					var strRuler = '';
					var strTemp = '';
					if (nTType <= _ChartUtils.constants.timeType.hour) {
						strTemp = timeData.slice(8);
						strRuler = _ChartUtils.dateTime.formatTimeString(strTemp, _ChartUtils.dateTime.timeFormat1);
					} else {
						strTemp = timeData.slice(0, 8);
						strRuler = _ChartUtils.dateTime.formatDateString(strTemp, _ChartUtils.dateTime.dateFormat1);
					}

					var strWidth = __calcWidth__;
					var localXPosText = parseInt(localXPos - (strWidth / 2));
					// if (localXPosText < leftWidth) {
					// 	continue;
					// }

					// if(nLastX !== undefined && nLastX != null && nLastX > (localXPosText - (strWidth + 5))) {
					// 	continue;
					// }

					var localYPosText = localYPos + 15;

					drawTextParam.text = strRuler;
					drawTextParam.pt.x = localXPosText;
					drawTextParam.pt.y = localYPosText;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					gxDc.TextOut(drawTextParam);

					nLastX = localXPosText;
					nLastDataIdx = dataIdx;
				}
			}
		};
		// [end] #2038

		/**
		 * draw X-Axis
		 * @param[in] argDrawParam
		 * @return true or false
		 */
		_ChartUtils.axis.didDrawXAxisVer1 = function(argDrawParam) {
			if (argDrawParam.isGrid === true && argDrawParam.config.show !== true) {
				return (false);
			}

			var nScrSIdx = argDrawParam.scrollInfo.pos;
			var nScrSize = argDrawParam.scrollInfo.screenSize;
			var drawWrapper = argDrawParam.drawWrapper;
			var xAxisX = argDrawParam.axis;
			var nDiv = parseInt(nScrSize / 4);

			var	gridStyle 	= argDrawParam.config.gridStyle;
			var gridColor 	= argDrawParam.config.gridColor;
			var fontColor 	= argDrawParam.config.fontColor;
			var font 		= argDrawParam.config.font;
			var bShowGrid 	= argDrawParam.config.show;
			var leftWidth 	= argDrawParam.target.leftWidth;
			var rightWidth 	= argDrawParam.target.rightWidth;
			var gridWidth 	= argDrawParam.target.gridWidth;
			var height 		= argDrawParam.height;

			var nTType 		= argDrawParam.timeType;
			var	nTGap		= argDrawParam.timeInterval;

			var drawLineParam = {
				context : argDrawParam.target.context,
				pt1 : {
					x : 0,
					y : 0
				},
				pt2 : {
					x : 0,
					y : 0
				},
				lineWidth : 1,
				lineColor : gridColor
			};

			var drawTextParam = {
				context : argDrawParam.target.context,
				pt : {
					x : 0,
					y : 0
				},
				text : '',
				font : font,
				fillStyle : fontColor
			};

			if(argDrawParam.clip) {
				drawTextParam.clip = argDrawParam.clip;
			}

			//
			var	nLastX;
			//for (var ii = nScrSize - 1; ii >= 0; ii--) {
			for (var ii = 0; ii < nScrSize; ii++) {
				var iIndex;
				var strDate = "";

				// make local index
				var nLocalIdx = ii;

				//
				var localXPos = xAxisX.GetXPos(nLocalIdx);
				var dataIdx   = drawWrapper.didConvertLocalIndexToDataIndex(nLocalIdx);

				var xTimeData = drawWrapper.didGetTimedataAt(dataIdx, false, true);
				if (xTimeData === undefined || xTimeData === null) {
					continue;
				}

				var timeData  = xTimeData.dateTime;
				if (timeData === undefined || timeData === null) {
					continue;
				}

				var xTimeDataPre = drawWrapper.didGetTimedataAt(dataIdx - 1, false, true);

				if(_ChartUtils.axis.canBePrintLabelOnXAxis(nTType, nTGap, xTimeData, xTimeDataPre) !== true) {
					continue;
				}

				var localYPos = -1;

				//
				// TODO: change timeUnit check method. use some types not trcode.
				//
				var strRuler = '';
				var strTemp = '';
				if (nTType <= _ChartUtils.constants.timeType.hour) {
					strTemp = timeData.slice(8);
					strRuler = _ChartUtils.dateTime.formatTimeString(strTemp, _ChartUtils.dateTime.timeFormat1);
				} else {
					strTemp = timeData.slice(0, 8);
					strRuler = _ChartUtils.dateTime.formatDateString(strTemp, _ChartUtils.dateTime.dateFormat1);
				}

				var __tmp__ = document.createElement('canvas').getContext('2d');
				drawTextParam.text = strRuler;
				var strWidth = __tmp__.measureText(strRuler).width;
				var localXPosText = parseInt(localXPos - (strWidth / 2));
				//

				if(nLastX !== undefined && nLastX != null && nLastX < (localXPosText + strWidth + 5)) {
					continue;
				}

				// for grid in panel
				if (argDrawParam.isGrid === true) {
					drawLineParam.pt1.x = localXPos;
					drawLineParam.pt1.y = 1;
					drawLineParam.pt2.x = localXPos;
					drawLineParam.pt2.y = height - 1;
					drawLineParam.lineStyle = gridStyle;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);
				}
				// for ruler in axis-x panel
				else {
					// draw axis ruler
					drawLineParam.pt1.x = localXPos;
					drawLineParam.pt1.y = localYPos;
					drawLineParam.pt2.x = localXPos;
					drawLineParam.pt2.y = localYPos + 3;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);

					var localYPosText = localYPos + 15;

					drawTextParam.text = strRuler;
					drawTextParam.pt.x = localXPosText;
					drawTextParam.pt.y = localYPosText;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					gxDc.TextOut(drawTextParam);
				}

				nLastX = localXPosText;
			}
		};

		/**
		 * draw Y-Axis
		 *
		 * @param[in] argDrawParam draw param { price:{max, min, verpos}, config:{font, fontColor, lineColor, show}, height,
		 *            axis, target:{ left:{context, width}, grid:{context, width}, right:{context, width}} }
		 * @return true or false
		 */
		_ChartUtils.axis.didDrawYAxis = function(argDrawParam) {
			/*
			 * argDrawParam
			 */
			var nMaxValue = parseInt(argDrawParam.price.max.toFixed(0)); // #2181
			var nMinValue = parseInt(argDrawParam.price.min.toFixed(0)); // #2181
			var nMMPrice  = _ChartUtils.didCalcPriceSize(nMaxValue, nMinValue);
			var verpos    = argDrawParam.price.verpos;

			//
			if (nMMPrice <= 0) {
				return (false);
			} else {
				var rulerInfo = _ChartUtils.axis.didCalcRulerUnitY(nMMPrice, argDrawParam.height);
				var iYPos;
				var strPrice = "";
				var	gridStyle = argDrawParam.config.gridStyle;
				var gridColor = argDrawParam.config.gridColor;
				var fontColor = argDrawParam.config.fontColor;
				var font = argDrawParam.config.font;
				var bShowGrid = argDrawParam.config.show;
				var drawParam = {};
				var leftWidth = argDrawParam.target.left.width;
				var rightWidth = argDrawParam.target.right.width;
				var gridWidth = argDrawParam.target.grid.width;
				var height = argDrawParam.height;
				var iXPosLY = leftWidth - 4;
				var iXPosRY = 0;
				var xAxisY = argDrawParam.axis;

				var	xMultipleFactor = _ChartUtils.axis.label.didCalcMutipleValue(nMaxValue, nMinValue);

				var drawLineParam = {
					context : null,
					pt1 : {
						x : 0,
						y : 0
					},
					pt2 : {
						x : 0,
						y : 0
					},
					lineWidth : 1,
					lineColor : gridColor
				};

				var drawTextParam = {
					context : null,
					pt : {
						x : 0,
						y : 0
					},
					text : '',
					font : font,
					fillStyle : fontColor
				};

				var nStartValue = parseInt(nMinValue);
				var nEndValue = parseInt(nMaxValue);

				for (var priceValue = nStartValue; priceValue <= nEndValue; priceValue++) {
					var nXPosLY = iXPosLY;
					var nXPosRY = iXPosRY;

					if (rulerInfo.flag !== true) {
						if ((priceValue % rulerInfo.unit) !== 0) {
							continue;
						}
					}

					// use draw object's method for y
					var nYPos = xAxisY.GetYPos(priceValue);

					// grid
					if (bShowGrid === true) {
						drawLineParam.context = argDrawParam.target.grid.context;
						drawLineParam.pt1.x = 1;
						drawLineParam.pt1.y = nYPos;
						drawLineParam.pt2.x = gridWidth - 1;
						drawLineParam.pt2.y = nYPos;
						drawLineParam.lineStyle = gridStyle;
						drawLineParam.lineColor = gridColor;
						gxDc.Line(drawLineParam);
					}

					//
					// ruler
					//

					// left ruler
					drawLineParam.context = argDrawParam.target.left.context;
					drawLineParam.pt1.x = nXPosLY;
					drawLineParam.pt1.y = nYPos;
					drawLineParam.pt2.x = nXPosLY + 3;
					drawLineParam.pt2.y = nYPos;
					drawLineParam.lineStyle = null;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);

					// right ruler
					drawLineParam.context = argDrawParam.target.right.context;
					drawLineParam.pt1.x = nXPosRY;
					drawLineParam.pt1.y = nYPos;
					drawLineParam.pt2.x = nXPosRY + 3;
					drawLineParam.pt2.y = nYPos;
					drawLineParam.lineStyle = null;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);

					// ruler text
					// #1224
					var rulerData = priceValue;
					if(xMultipleFactor) {
						rulerData = Math.round(rulerData * xMultipleFactor.pow);
					}

					strPrice = _ChartUtils.number.didGetPointedValue(rulerData, verpos);

					nXPosLY = leftWidth - argDrawParam.target.left.context.measureText(strPrice).width - 6;
					nXPosRY = 6;

					// left ruler
					drawTextParam.context = argDrawParam.target.left.context;
					drawTextParam.text = strPrice;
					drawTextParam.pt.x = nXPosLY;
					drawTextParam.pt.y = nYPos;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					gxDc.TextOut(drawTextParam);

					// right ruler
					drawTextParam.context = argDrawParam.target.right.context;
					drawTextParam.text = strPrice;
					drawTextParam.pt.x = nXPosRY;
					drawTextParam.pt.y = nYPos;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					gxDc.TextOut(drawTextParam);
				}

				// #1224
				if(xMultipleFactor) {
					var strDisp = xMultipleFactor.display;

					nYPos   = 8;
					nXPosLY = leftWidth - argDrawParam.target.left.context.measureText(strDisp).width - 6;
					nXPosRY = 6;

					drawTextParam.useBox   = true;
					drawTextParam.boxStyle = argDrawParam.config.multiColor;

					// left ruler
					drawTextParam.context = argDrawParam.target.left.context;
					drawTextParam.text = strDisp;
					drawTextParam.pt.x = nXPosLY;
					drawTextParam.pt.y = nYPos;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					gxDc.DrawSingleLineText(drawTextParam, true);

					// right ruler
					drawTextParam.context = argDrawParam.target.right.context;
					drawTextParam.text = strDisp;
					drawTextParam.pt.x = nXPosRY;
					drawTextParam.pt.y = nYPos;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					gxDc.DrawSingleLineText(drawTextParam, true);
				}

				return true;
			}
		};

		/**
		 * グリード単位を計算する。（詳細バージョン）
		 * @param  {[type]} argParams
		 * @return {[type]}
		 */
		_ChartUtils.axis.didCalcRulerUnit = function(argParams) {
			var	dOrg		= argParams.dOrg;
			var nPointVal	= 0;//argParams.nPointVal;
			var dXVal		= argParams.dXVal ;
		  	var	dMax		= argParams.dMax  ;
		  	var	dMin		= argParams.dMin  ;
		  	var	bSign		= argParams.bSign ;
		  	var	bDiff		= argParams.bDiff ;
		  	var	bLog 		= argParams.bLog  ;

			// point value is 10's exponent
			// offset must be over than upper pow value
			var	dCheck		= Math.pow ( 10.0 , -1 * nPointVal ) ;
			var	nSign		= ( dOrg < 0 ) ? -1 : 1 ;
			var	dTemp		= dOrg * nSign ;
			var	dTemp1		= 0;
			var	nSig		= 1;
			var	ii			= 0;
			var	nLoopMax	= 0;
			var	dMMChk		= ( dMax - dMin ) * _ChartUtils.constants.ngcl.define.NGCL_AXIS_RATE1;
			var	dCvt		= 0;
			var	dDCheck 	= dMMChk * _ChartUtils.constants.ngcl.define.NGCL_AXIS_RATE2;//min( dOrg * 2.5, dMMChk );

			// Original value may be positive number.
			// but 0 value is return.
			if( dOrg === 0 ) {
				return dCheck ;
			}

			if( dTemp > dMMChk ) {
				dMMChk = dTemp * 1.5;
				dDCheck = dMMChk * _ChartUtils.constants.ngcl.define.NGCL_AXIS_RATE2;
			}

			// Use Max value except LOG
			if(bLog !== true) {
				dTemp = Math.max( dTemp , dDCheck ) ;
			}

			// Use Max value 10 Ratio
			//
		//	dTemp = max( dTemp, dMMChk / 10 );
			/*
			if( dTemp * 10 < dMMChk )
			{
				dTemp = dMMChk / 10;
			}
			*/

			var	dPoint	= 1 ;
			var	nCnt	= 0 ;

			dXVal		= 1 ;
			if( dTemp < 1 ) { // 0 ~ 1
				nSig	= -1;
				nCnt	= 1;
				while ( dTemp < 0.1 )
				{
					dTemp	*= 10 ;
					dPoint	/= 10 ;
					nCnt++ ;
				}
			}
			else {
				while ( dTemp > 1 ) {
					dTemp	/= 10 ;
					dPoint	*= 10 ;
					nCnt++ ;
		//			dXVal	/= 10 ;
				}
			}

			var	n64Temp		= 0;
			var	n64Frag		= 0;
			for( ii = nCnt + nPointVal; ii >= 0; ii-- ) {
				// + Part
				n64Temp = parseInt( dTemp * 10 );
				n64Frag	= parseInt( n64Temp + 5 ) % 5;
				n64Temp	= n64Temp - n64Frag + 5;

				dCvt	= n64Temp * 1.0;
				dTemp1	= ( dCvt * dPoint / 10 );
				if( dDCheck <= dTemp1 && dMMChk >= dTemp1 ) {
					dPoint	/= 10;
					dTemp	*= 10;
					break;
				}

				dCvt	= dCvt - 5;
				dTemp1	= ( dCvt * dPoint / 10 );

		//		dCvt = var ( dTemp * 2 + 0.9 ) / 2.0;

				//if( dOrg >= ( dCvt * dPoint / 10 ) && dOrg <= ( dCvt * dPoint / 10 ) )
				if( dDCheck <= dTemp1 && dMMChk >= dTemp1 ) {
					dPoint	/= 10;
					dTemp	*= 10;
					break;
				}

				dPoint	/= 10;
				dTemp	*= 10;
			}

			dCvt	= dCvt * dPoint;

			var dFactor1 = Math.pow( 10.0, nPointVal + 1 );

			var lTemp = parseInt(dCvt * dFactor1);
		    if( lTemp % 10 != 0 ) {
				lTemp	= ( ( lTemp / 10 ) + 1 ) * 10;
				dCvt	= (lTemp) / dFactor1;
		    }

			if( bSign ) {
				dOrg	= dCvt * nSign ;
			}
			else {
				dOrg	= dCvt ;
			}

			// output
			argParams.dXVal = dXVal;

			//
			return(dOrg);
		};

		/**
		 * draw Y-Axis
		 *
		 * @param[in] argDrawParam draw param { price:{max, min, verpos}, config:{font, fontColor, lineColor, show}, height,
		 *            axis, target:{ left:{context, width}, grid:{context, width}, right:{context, width}} }
		 * @return true or false
		 */
		_ChartUtils.axis.didDrawYAxisAsBeauty = function(argDrawParam) {
			/*
			 * argDrawParam
			 */
			var nMaxValue = parseInt(argDrawParam.price.max.toFixed(0)); // #2181
 			var nMinValue = parseInt(argDrawParam.price.min.toFixed(0)); // #2181
			var nMMPrice  = _ChartUtils.didCalcPriceSize(nMaxValue, nMinValue);
			var verpos    = argDrawParam.price.verpos;

			//
			if (nMMPrice <= 0) {
				return (false);
			} else {
				// #2038
				var rulerInfo;
				var isGuideOffset = false;
				if(argDrawParam.guideSize !== undefined && argDrawParam.guideSize !== null) {
					var guideOffset = argDrawParam.axis.GetYPixelToVal(argDrawParam.guideSize);

					rulerInfo = _ChartUtils.axis.didCalcRulerUnitYAsGuideOffset(nMMPrice, argDrawParam.height, guideOffset);
					isGuideOffset = true;
				}
				else {
					rulerInfo = _ChartUtils.axis.didCalcRulerUnitY(nMMPrice, argDrawParam.height);
				}
				var rulerCalcParam = {
					dOrg		: rulerInfo.unit,
					nPointVal	: 0,
					dXVal		: 1,
					dMax		: argDrawParam.price.max,
					dMin		: argDrawParam.price.min,
					bSign		: false,
					bDiff		: true,
					bLog 		: false,
				};
				// #1253 , #2038
				var rulerUnit;
				if(isGuideOffset == true) {
					rulerUnit = Math.round(_ChartUtils.axis.didCalcRulerUnitAsGuideOffset(rulerCalcParam));
				}
				else {
					rulerUnit = Math.round(_ChartUtils.axis.didCalcRulerUnit(rulerCalcParam));
				}
				//

				var iYPos;
				var strPrice = "";
				var gridStyle = argDrawParam.config.gridStyle;
				var gridColor = argDrawParam.config.gridColor;
				var fontColor = argDrawParam.config.fontColor;
				var font = argDrawParam.config.font;
				var bShowGrid = argDrawParam.config.show;
				var drawParam = {};
				var leftWidth = argDrawParam.target.left.width;
				var rightWidth = argDrawParam.target.right.width;
				var gridWidth = argDrawParam.target.grid.width;
				var height = argDrawParam.height;
				var iXPosLY = leftWidth - 4;
				var iXPosRY = 0;
				var xAxisY 	= argDrawParam.axis;
				var	nDOff	= parseInt( ( ( rulerInfo.unit ) * xAxisY.m_iGridHeight ) * 1.5 );

				var	xMultipleFactor = _ChartUtils.axis.label.didCalcMutipleValue(nMaxValue, nMinValue);

				var drawLineParam = {
					context : null,
					pt1 : {
						x : 0,
						y : 0
					},
					pt2 : {
						x : 0,
						y : 0
					},
					lineWidth : 1,
					lineColor : gridColor
				};

				var drawTextParam = {
					context : null,
					pt : {
						x : 0,
						y : 0
					},
					text : '',
					font : font,
					fillStyle : fontColor
				};

				var nSameCnt	= 0;
				var dNewD		= _ChartUtils.axis.didCalcRulerBase(nMinValue, rulerUnit);
				var dData		= 0;
				var nPreYPos	= -1 * _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;
				//
				var dUpperLimit	= nMaxValue + rulerUnit * 2;
				for(dData = dNewD; dData < dUpperLimit; dData += rulerUnit) {
					var nXPosLY = iXPosLY;
					var nXPosRY = iXPosRY;

					// use draw object's method for y
					var nYPos = xAxisY.GetYPos(dData);

					// #805
					if(nYPos < (0 - nDOff * 2) || nYPos > (argDrawParam.y + argDrawParam.height + nDOff * 3)) {
						break;
					}

					// grid
					if (bShowGrid === true) {
						drawLineParam.context = argDrawParam.target.grid.context;
						drawLineParam.pt1.x = 1;
						drawLineParam.pt1.y = nYPos;
						drawLineParam.pt2.x = gridWidth - 1;
						drawLineParam.pt2.y = nYPos;
						drawLineParam.lineStyle = gridStyle;
						drawLineParam.lineColor = gridColor;
						gxDc.Line(drawLineParam);
					}

					//
					// ruler
					//

					if(argDrawParam.showRuler) { // #1944
						// left ruler
						drawLineParam.context = argDrawParam.target.left.context;
						drawLineParam.pt1.x = nXPosLY;
						drawLineParam.pt1.y = nYPos;
						drawLineParam.pt2.x = nXPosLY + 3;
						drawLineParam.pt2.y = nYPos;
						drawLineParam.lineStyle = null;
						drawLineParam.lineColor = gridColor;
						gxDc.Line(drawLineParam);

						// right ruler
						drawLineParam.context = argDrawParam.target.right.context;
						drawLineParam.pt1.x = nXPosRY;
						drawLineParam.pt1.y = nYPos;
						drawLineParam.pt2.x = nXPosRY + 3;
						drawLineParam.pt2.y = nYPos;
						drawLineParam.lineStyle = null;
						drawLineParam.lineColor = gridColor;
						gxDc.Line(drawLineParam);
					}

					// ruler text
					// #1224
					var rulerData = dData;
					if(xMultipleFactor) {
						rulerData = Math.round(rulerData * xMultipleFactor.pow);
					}

					strPrice = _ChartUtils.number.didGetPointedValue(rulerData, verpos);

					nXPosLY = leftWidth - argDrawParam.target.left.context.measureText(strPrice).width - _ChartUtils.constants.default.RULER_MARGIN;
					nXPosRY = _ChartUtils.constants.default.RULER_MARGIN;

					// left ruler
					drawTextParam.context = argDrawParam.target.left.context;
					drawTextParam.text = strPrice;
					drawTextParam.pt.x = Math.round(nXPosLY);
					drawTextParam.pt.y = nYPos + 0.5;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					drawTextParam.clip = argDrawParam.target.left.clip; // #3147
					gxDc.TextOut(drawTextParam);

					// right ruler
					drawTextParam.context = argDrawParam.target.right.context;
					drawTextParam.text = strPrice;
					drawTextParam.pt.x = Math.round(nXPosRY);
					drawTextParam.pt.y = nYPos + 0.5;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					drawTextParam.clip = argDrawParam.target.right.clip; // #3147
					gxDc.TextOut(drawTextParam);
				}

				var dLowerLimit	= nMinValue - rulerUnit * 2;
				for(dData = dNewD - rulerUnit; dData > dLowerLimit; dData -= rulerUnit) {
					var nXPosLY = iXPosLY;
					var nXPosRY = iXPosRY;

					// use draw object's method for y
					var nYPos = xAxisY.GetYPos(dData);

					// #805
					if(nYPos < (0 - nDOff * 2) || nYPos > (argDrawParam.y + argDrawParam.height + nDOff * 3)) {
						break;
					}

					// grid
					if (bShowGrid === true) {
						drawLineParam.context = argDrawParam.target.grid.context;
						drawLineParam.pt1.x = 1;
						drawLineParam.pt1.y = nYPos;
						drawLineParam.pt2.x = gridWidth - 1;
						drawLineParam.pt2.y = nYPos;
						drawLineParam.lineColor = gridColor;
						gxDc.Line(drawLineParam);
					}

					//
					// ruler
					//

					// left ruler
					drawLineParam.context = argDrawParam.target.left.context;
					drawLineParam.pt1.x = nXPosLY;
					drawLineParam.pt1.y = nYPos;
					drawLineParam.pt2.x = nXPosLY + 3;
					drawLineParam.pt2.y = nYPos;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);

					// right ruler
					drawLineParam.context = argDrawParam.target.right.context;
					drawLineParam.pt1.x = nXPosRY;
					drawLineParam.pt1.y = nYPos;
					drawLineParam.pt2.x = nXPosRY + 3;
					drawLineParam.pt2.y = nYPos;
					drawLineParam.lineColor = gridColor;
					gxDc.Line(drawLineParam);

					// ruler text
					// #1224
					var rulerData = dData;
					if(xMultipleFactor) {
						rulerData = Math.round(rulerData * xMultipleFactor.pow);
					}

					strPrice = _ChartUtils.number.didGetPointedValue(rulerData, verpos);

					nXPosLY = leftWidth - argDrawParam.target.left.context.measureText(strPrice).width - _ChartUtils.constants.default.RULER_MARGIN; // #3016
					nXPosRY = _ChartUtils.constants.default.RULER_MARGIN; // #3016

					// left ruler
					drawTextParam.context = argDrawParam.target.left.context;
					drawTextParam.text = strPrice;
					drawTextParam.pt.x = Math.round(nXPosLY);
					drawTextParam.pt.y = nYPos;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					drawTextParam.clip = argDrawParam.target.left.clip; // #3147
					gxDc.TextOut(drawTextParam);

					// right ruler
					drawTextParam.context = argDrawParam.target.right.context;
					drawTextParam.text = strPrice;
					drawTextParam.pt.x = Math.round(nXPosRY);
					drawTextParam.pt.y = nYPos;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					drawTextParam.clip = argDrawParam.target.right.clip; // #3147
					gxDc.TextOut(drawTextParam);
				}

				// #1224
				if(xMultipleFactor) {
					var strDisp = xMultipleFactor.display;

					nYPos   = 8;
					nXPosLY = leftWidth - argDrawParam.target.left.context.measureText(strDisp).width - 6;
					nXPosRY = 6;

					drawTextParam.useBox   = true;
					drawTextParam.boxStyle = argDrawParam.config.multiColor;

					// left ruler
					drawTextParam.context = argDrawParam.target.left.context;
					drawTextParam.text = strDisp;
					drawTextParam.pt.x = nXPosLY;
					drawTextParam.pt.y = nYPos;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					drawTextParam.clip = argDrawParam.target.left.clip; // #3147
					gxDc.DrawSingleLineText(drawTextParam, true);

					// right ruler
					drawTextParam.context = argDrawParam.target.right.context;
					drawTextParam.text = strDisp;
					drawTextParam.pt.x = nXPosRY;
					drawTextParam.pt.y = nYPos;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					drawTextParam.clip = argDrawParam.target.right.clip; // #3147
					gxDc.DrawSingleLineText(drawTextParam, true);
				}

				return true;
			}
		};

		/**
		 * draw Y-Axis
		 *
		 * @param[in] argDrawParam draw param { price:{max, min, verpos}, config:{font, fontColor, lineColor, show}, height,
		 *            axis, target:{ left:{context, width}, grid:{context, width}, right:{context, width}} }
		 * @return true or false
		 */
		_ChartUtils.axis.didDrawLastValueOnYAxis = function(argDrawParam) {
			try {
				var verpos  	= argDrawParam.price.verpos;
				var	dData		= argDrawParam.price.value;
				var	fillColor 	= argDrawParam.price.color;

				//
				var iYPos;
				var strPrice  = "";
				var fontColor = argDrawParam.config.fontColor;
				var font = argDrawParam.config.font;

				var leftWidth  = argDrawParam.target.left.width;
				var rightWidth = argDrawParam.target.right.width;

				var iXPosLY = leftWidth - 4;
				var iXPosRY = 0;
				var xAxisY 	= argDrawParam.axis;

				var drawTextParam = {
					context : null,
					pt : {
						x : 0,
						y : 0
					},
					text : '',
					font : font,
					fillStyle : fontColor,
					boxStyle : fillColor
				};

				var nXPosLY = iXPosLY;
				var nXPosRY = iXPosRY;

				// use draw object's method for y
				var nYPos = xAxisY.GetYPos(dData);

				var xScaleUnit = xAxisY.didGetScaleUnit();
				var xMMScreen  = xScaleUnit.minMaxScreen;

				// ruler text
				var	xMultipleFactor = _ChartUtils.axis.label.didCalcMutipleValue(xMMScreen.maxValue, xMMScreen.minValue);
				if(xMultipleFactor) {
					dData = Math.round(dData * xMultipleFactor.pow);
				}
				strPrice = _ChartUtils.number.didGetPointedValue(dData, verpos);

				var nMargin = _ChartUtils.constants.default.RULER_MARGIN;

				// left
				if(leftWidth > 0) {
					nXPosLY = leftWidth - argDrawParam.target.left.context.measureText(strPrice).width - nMargin;

					drawTextParam.context = argDrawParam.target.left.context;
					drawTextParam.text = strPrice;
					drawTextParam.pt.x = nXPosLY;
					drawTextParam.pt.y = nYPos;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					gxDc.DrawSingleLineText(drawTextParam);
				}

				// right
				if(rightWidth > 0) {
					nXPosRY = nMargin;

					drawTextParam.context = argDrawParam.target.right.context;
					drawTextParam.text = strPrice;
					drawTextParam.pt.x = nXPosRY;
					drawTextParam.pt.y = nYPos;
					drawTextParam.font = font;
					drawTextParam.fillStyle = fontColor;
					gxDc.DrawSingleLineText(drawTextParam);
				}

				return true;
			}
			catch(e) {
				console.error(e);
			}

			return(false);
		};

		/**
		 * @param[in] nLocalXPos local x position
		 * @return {pos:, width:}
		 */
		_ChartUtils.axis.didGetAdjustedBarInfo = function(argBarWidth, nLocalXPos) {
			// #1508
			var __barWidth  = parseInt(argBarWidth);
			var __barWidth1 = __barWidth - 1;
			var __halfRatio = __barWidth1 / 2;
			var __halfBar = parseInt(__halfRatio);
			var __result = {grid: __barWidth};
			if(nLocalXPos !== undefined) {
				if(__barWidth > 30) {
					__result.pos = parseInt(nLocalXPos - __halfBar + 3);
					__result.width = parseInt(nLocalXPos + __halfBar - 3) - __result.pos;
				}
				else if(__barWidth > 15) {
					__result.pos = parseInt(nLocalXPos - __halfBar + 2);
					__result.width = parseInt(nLocalXPos + __halfBar - 2) - __result.pos;
				}
				else if(__barWidth > 10) {
					__result.pos = parseInt(nLocalXPos - __halfBar + 1);
					__result.width = parseInt(nLocalXPos + __halfBar - 1) - __result.pos;
				}
				else if(__barWidth > 3) {
					__result.pos = parseInt(nLocalXPos - __halfBar);
					__result.width = parseInt(nLocalXPos + __halfBar) - __result.pos;
				}
				else if(__barWidth > 1) {
					__result.pos = parseInt(nLocalXPos - 1);
					__result.width = parseInt(nLocalXPos + 1) - __result.pos;
				}
				else {
					__result.pos = nLocalXPos;
					__result.width = 1;
				}
			}
			// [end] #1508

			return(__result);
		};

		/**
		 *
		 */
		_ChartUtils.dataValidator = {};

		_ChartUtils.dataValidator.isValidData = function(argValue, bFlag) {
			//
			if (argValue === undefined || parseInt(argValue) === _ChartUtils.constants.default.DEFAULT_WRONG_VALUE) {
				return (false);
			}

			if (bFlag === true && parseInt(argValue) === 0) {
				return (false);
			}

			return (true);
		};

		//
		//
		//

		_ChartUtils.array = {};
		_ChartUtils.array.insertAt = function(array, index, datas) {
			if(array === undefined || array == null) {
				return(datas);
			}

			var nCount = array.length;
			if(nCount === undefined || nCount == null || nCount < 1) {
				return(datas);
			}

			if(index < 0) {
				index = 0;
			}

			if(index >= nCount) {
				return(array.concat(datas));
			}

			return(array.slice(0, index).concat(datas, array.slice(index)));
		};

		/**
		 *
		 */
		_ChartUtils.number = {};

		_ChartUtils.number.util = {};

		_ChartUtils.number.util.getComma = function( v ) {
			return ( String( v ).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,' ) );
		};

		_ChartUtils.number.util.float2int = function( v ) {
			return ( v || 0 ); // #1443
		};

		// 小数点n位までを残す関数
		// number=対象の数値
		// n=残したい小数点以下の桁数
		_ChartUtils.number.util.floatFormat = function( number, n ) {
			var __pow = Math.pow( 10 , n ) ;

			return Math.round( number * __pow ) / __pow ;
		}

		_ChartUtils.number.util.getPointValue = function( p ) {
			// #1105
			var priceValue = p.price;
			var pointValue = p.point;

			var strZero = "";
			var strSign = "";
			var strTemp = priceValue.toString();
			var strPoint;
			var arrayOfStrings = strTemp.split(".");
			if(arrayOfStrings.length > 1) {
				strPoint = arrayOfStrings[1];
				strTemp = arrayOfStrings[0];
			}

			// minus value
			if (strTemp.substring(0, 1) == "-") {
				strTemp = strTemp.substring(1, strTemp.length);
				strSign = "-";
			}

			for (var idx = strTemp.length; idx <= pointValue; idx++) {
				strZero = strZero + "0";
			}

			// 0.0000xxxx
			strTemp = strZero + strTemp;

			// 1234 => 1,234
			var nPointed = strTemp.length - pointValue;
			// #2289
			var strNonPoint = _ChartUtils.number.util.getComma(strTemp.substring(0, (nPointed)));
			if(_ChartUtils.number.config && _ChartUtils.number.config.invalidComma === true) {
				strNonPoint = strTemp.substring(0, (nPointed));
			}
			// #2289

			var strPointValue = strTemp.substring((nPointed), strTemp.length);

			if(true) {
				var strPointData = strPointValue + (strPoint !== undefined ? strPoint : "");
				var strRealPointData = strPointData.substring(0, p.point);

				var hasPoint = false;
				if(strRealPointData !== undefined && strRealPointData != null) {
					var __trimCheck = strRealPointData;
					__trimCheck.trim();
					if(__trimCheck !== "") {
						hasPoint = true;
					}
				}
				if(hasPoint === true) {
					return  strSign + strNonPoint + "." + strRealPointData;
				}
				else {
					return  strSign + strNonPoint;
				}
			}
			else {
				if(strPoint !== undefined && strPoint != null) {
					var __trimCheck = strPoint;
					__trimCheck.trim();
					if(__trimCheck !== "") {
						hasPoint = true;
					}
				}

				if(hasPoint !== true) {
					if(strPointValue !== undefined && strPointValue != null) {
						var __trimCheck = strPointValue;
						__trimCheck.trim();
						if(__trimCheck !== "") {
							hasPoint = true;
						}
					}
				}

				if(hasPoint === true) {
					return  strSign + strNonPoint + "." + strPointValue + (strPoint !== undefined ? strPoint : "");
				}
				else {
					return  strSign + strNonPoint;
				}
			}
		};

		_ChartUtils.number.util.didGetPointedValue = function(argData) {
			argData.price = Math.round(argData.price);

			return(_ChartUtils.number.util.getPointValue(argData));
		};

			/* floatを四捨五入する */
		_ChartUtils.number.util.roundXL = function(n, digits) {
			// 小数点切り上げ
			if (digits >= 0) return parseFloat(n.toFixed(digits));

			digits = Math.pow(10, digits);
			var t = Math.round(n * digits) / digits;

			return parseFloat(t.toFixed(0));
		};

		_ChartUtils.number.util.getDigit = function(n, digits) {
			if (digits <= 0) return parseFloat(n);
			var _nBase = digits * 10;
			return ( parseInt( ( n / _nBase).toFixed(0) ) * _nBase );
		};

		/**
		 *
		 */
		_ChartUtils.number.formatAsfillSize = function(argNum, argFill, argCount) {
			var result = (new Array(argCount + 1 - argNum.toString().length)).join(argFill) + argNum;
			return (result);
		};

		/**
		 *
		 */
		_ChartUtils.number.didGetPointedValue = function(argValue, argPoint, isFloor) {
			if(isFloor !== true) {
				argValue = Math.round(argValue);
			}

			return(String(_ChartUtils.number.util.getPointValue({
				price : argValue,
				point : argPoint
			})));
		};

		_ChartUtils.scroll = {};

		/**
		 *
		 */
		_ChartUtils.scroll.getZoomFactorBy = function(argSize) {
			var factor = 1;
			if (argSize < 20)
				factor = 1;
			else if (argSize < 50)
				factor = 2;
			else if (argSize < 100)
				factor = 5;
			else if (argSize < 200)
				factor = 10;
			else if (argSize < 300)
				factor = 20;
			else
				factor = 30;
			/*
			 * else if (argSize < 400) factor = 30; else if (argSize < 500) factor = 50; else factor = 100;
			 */
			return (factor);
		};

		/**
		 * NOTE : structure
		 */
		_ChartUtils.struct = {};

		_ChartUtils.struct.ST_VALUE_INFO = {
			nNo : 0,
			nData : 0,
			nExIData : 0,
			dRatio : 0,
			strName : "",
			lpData : null
		};

		_ChartUtils.error = {};
		_ChartUtils.error.errorCodes = {
			errorStart:100,
			overLimitForTrendline:101,
		};

		/**
		 * NOTE : constants
		 */
		_ChartUtils.constants = {};

		_ChartUtils.constants.text = {
			dataView : {
				open  	: "始値",
				avgOpen : "始値",
				high  	: "高値",
				low   	: "安値",
				close 	: "終値",
				avgClose: "終値",
				volume	: "売買高",
				amount	: "取引量",
				oi    	: "OI",

				invalid : " "
			}
		};

		_ChartUtils.constants.chartConfigConstants = {
			TextSpace : 10,
			LineSpace : 20,
			// #1518
			SelectedMark : {
				lineColor:'#599cbf',
				fillColor:'#ffff96'
			},
			// [end] #1518
			SelectedFill : {
				lineColor:'#a0a0a0',
				fillColor:'#eeeeee'
			},

			Scroll : {
				zoom : 90,	// #1457

				screenSize : {
					max : 100,
					min : 10
				}

				// #1653
				,
				barSize:3,
				barGap :1,
			},
			YAxisWidth : 60,
			YAxisLeft  : 0,
			YAxisRight : 60,
			Gap : 0,
			MultipleSeries : false,
			UseGlobalTrendlineColor:false,
			TrendlineLimits:10,
			TickJustLine:false,
			IndicatorLimits:10,
			ContainerSelect:true, // #1573 -> #1671
			IndicatorSelect:true, // #1671
			MinimumPanelSpace:30,
			ValueSmoothFactor:10,

			// #894
			UseContextMenu : false,
			UseScrollAction: true,
			ContextMenuOrderAll : false,
			UseOneClickOepMode : false,
			UseRequestPreviousNext : false,

			// #1169
			OepAmendLimitPixel : 5,

			// #1224
			MultipleLabelLimit : 99999,
			YLabelLengthLimit  : 7,

			// #1271
			ShowFixedData : false,

			// #1290
			UseObjectCrossline : false,
			CrosslineBoxRadius : 15,

			// #1495
			UseMouseWheel : true,

			// #1540
			DefaultPriceBar : "default",
			//

			// #1557
			AllowSmoothScroll : true,
			//
		};

		_ChartUtils.constants.chartConfig = {
			System : _ChartUtils.didClone(_ChartUtils.constants.chartConfigConstants),

			//
			// #748
			//
			Focusing : false,
			FocusingBackground   : '#95372F',
			FocusingForeground   : '#FFFFFF',
			UnfocusingBackground : '#FAF5F1',
			UnfocusingForeground : '#95372F',
			FocusingAlpha : 0.3,
			//

			//
			// #775
			//
			UseSmoothScroll : true,
			//

			//
			// #1094
			//
			UseNewOrderLine : false,
			//


			BackgroundColor : '#FFFFFF',
			BorderColor     : '#949494',

			MarginTopBottom : "5",	// top and bottom space ratio percent
			MarginRight     : "5",	// right space(bar count)

			ConfigAxis : {
				ShowLeft : false,
				ShowRight : true,
				Font: '12px Arial',
				FontColor : '#949494',
				GridShow : true,
				GridColor : '#949494',
				GridStyle : gxDc.penstyle.dot,
				GridVertColor : '#949494',
				GridHorzColor : '#949494',
				MultipleLabelColor : '#95372F',
			},

			// #1558
			DontMoveOnTrendlineSelectMode : false,
			//

			//
			// #506
			//
			CrossLine : {
				hide : false,
				fontStyle: {
					// fontFamily: "Arial",
					fontSize: "12px",
					fontColor: "#949494"
				},
				lineStyle: {
					strokeStyle : gxDc.penstyle.solid,
					strokeWeight : 1,
					strokeColor : "#949494"	//a0a0a0
				},
				box : {
					isCircle : true
				},
				height: "17px",
				backgroundColor:"#303030"
			},
			TrendlineColor : "#E64546",
			TrendlineFillAlpha : 0.5,

			//

			Font : '12px Arial',
			FontColor : '#949494',

			// Flag
			ShowDataView : true,
			ReflectDataView : true,
			GoToEndPos : true,

			/* order and position */
			OrderStyleConfig : {
				default : {
					strokeStyle : gxDc.penstyle.solid,
					strokeWeight : 1,
					strokeColor : "#fe4a4a"
				},
				bid : {
					strokeStyle : gxDc.penstyle.solid,
					strokeWeight : 1,
					strokeColor : "#0D87F2"
				},
				ask : {
					strokeStyle : gxDc.penstyle.solid,
					strokeWeight : 1,
					strokeColor : "#FE4A4A"
				},
				dummy : {
					strokeStyle : gxDc.penstyle.dashdotdot,
					strokeWeight : 1,
					strokeColor : "#fe4a4a"
				}
			},
			PositStyleConfig : {
				default : {
					strokeStyle : gxDc.penstyle.solid,
					strokeWeight : 1,
					strokeColor : "#0d87f2"
				},
				bid : {
					strokeStyle : gxDc.penstyle.solid,
					strokeWeight : 1,
					strokeColor : "#0D87F2"
				},
				ask : {
					strokeStyle : gxDc.penstyle.solid,
					strokeWeight : 1,
					strokeColor : "#FE4A4A"
				},
				dummy : {
					strokeStyle : gxDc.penstyle.dashdotdot,
					strokeWeight : 1,
					strokeColor : "#0d87f2"
				}
			},
			// #1878
			AlertStyleConfig : {
				default : {
					strokeStyle : gxDc.penstyle.dash,
					strokeWeight : 1,
					strokeColor : "#0d87f2"
				},
				bid : {
					strokeStyle : gxDc.penstyle.dash,
					strokeWeight : 1,
					strokeColor : "#0D87F2"
				},
				ask : {
					strokeStyle : gxDc.penstyle.dash,
					strokeWeight : 1,
					strokeColor : "#FE4A4A"
				},
				dummy : {
					strokeStyle : gxDc.penstyle.dashdotdot,
					strokeWeight : 1,
					strokeColor : "#0d87f2"
				}
			},
			ExecutionStyleConfig : {
				noFill : true,
				default : {
					strokeStyle : gxDc.penstyle.solid,
					strokeWeight : 1,
					strokeColor : "#0d87f2"
				},
				bid : {
					strokeStyle : gxDc.penstyle.solid,
					strokeWeight : 1,
					strokeColor : "#0D87F2"
				},
				ask : {
					strokeStyle : gxDc.penstyle.solid,
					strokeWeight : 1,
					strokeColor : "#FE4A4A"
				},
				dummy : {
					strokeStyle : gxDc.penstyle.dashdotdot,
					strokeWeight : 1,
					strokeColor : "#0d87f2"
				}
			},
			// [end] #1878

			/* price style */
			ChartType : "Candle",
			PriceStyleConfig : {
				Candle : {
					strokeWeight : 1,
					strokeColor : "#eeeeee",
					strokeUpColor : "#fe4a4a",
					strokeDnColor : "#0d87f2",
					fillUpColor : "#fe7c7c",
					fillDnColor : "#55abf6"
				},
				Line : {
					strokeWeight : 1,
					strokeColor : "#fe7c7c"
				},
				OHLC : {
					strokeWeight : 1,
					strokeUpColor : "#fe7c7c",
					strokeDnColor : "#55abf6",
				},
				HLC : {
					strokeWeight : 1,
					strokeUpColor : "#fe7c7c",
					strokeDnColor : "#55abf6",
				},
				TLB : {
					params : [
						{ name: 'period', value: 5 }
					],
					strokeWeight : 1,
					strokeUpColor : "#fe4a4a",
					strokeDnColor : "#0d87f2",
					fillUpColor : "#fe7c7c",
					fillDnColor : "#55abf6"
				},
				KAGI : {
					params : [
						{ name: 'period', value: 0.5 }
					],
					strokeWeight : 1,
					strokeUpColor : "#fe4a4a",
					strokeDnColor : "#0d87f2"
				},
				RENKO : {
					params : [
						{ name: 'period', value: 5 }
					],
					strokeWeight : 1,
					strokeUpColor : "#fe4a4a",
					strokeDnColor : "#0d87f2"
				},
				PNF : {
					params : [
						{ name: 'period', value: 3 }
					],
					strokeWeight : 1,
					strokeUpColor : "#fe4a4a",
					strokeDnColor : "#0d87f2"
				},
				RCL : {
					params : [
						{ name: 'period', value: 5 }
					],
					strokeWeight : 1,
					strokeColor   : "#fe7c7c",
					strokeUpColor : "#fe4a4a",
					strokeDnColor : "#0d87f2"
				},
				CompareChart : {
					strokeWeight : 1,
					strokeColors : {
						"0" : _ChartUtils.color.tables.lists[0],
						"1" : _ChartUtils.color.tables.lists[1],
						"2" : _ChartUtils.color.tables.lists[2],
						"3" : _ChartUtils.color.tables.lists[3],
						"4" : _ChartUtils.color.tables.lists[4],
						"5" : _ChartUtils.color.tables.lists[5],
						"6" : _ChartUtils.color.tables.lists[6],
					}
				}
			}
		};

		/**
		 * get chart config(cloned)
		 * @return chart config
		 */
		_ChartUtils.constants.didGetClonedDefaultChartConfig = function() {
			var xNewConfig = _ChartUtils.didClone(_ChartUtils.constants.chartConfig);
			return(xNewConfig);
		};

		/**
		 * color table
		 */
		_ChartUtils.constants.colors = {
			default : [
				'#f675c4', '#25b5a6', '#459915', '#ff007f', '#0f8989', '#8d2582', '#39a6d4', '#d439b9', '#f33603', '#00d8ff', '#f05d15', '#b59f25', '#54b525'
			],
			indicator : [
				'#f675c4', '#25b5a6', '#459915', '#ff007f', '#0f8989', '#8d2582', '#39a6d4', '#d439b9', '#f33603', '#00d8ff', '#f05d15', '#b59f25', '#54b525'
			]
		};

		/**
		 * time type
		 */
		_ChartUtils.constants.timeType = {
			tick : 0,
			minute : 1,
			hour : 2,
			day : 3,
			week : 4,
			month : 5
		};

		/**
		 * number constants
		 */
		_ChartUtils.constants.default = {
			XAXIS_HEIGHT : 30,
			YAXIS_WIDTH : 60,
			TOP_HEIGHT : 0,
			DELETEKEY : 46,
			TREND_WIDTH : 0,
			RIGHTMARGINAREA : 0,
			LEFTMARGINAREA : 0,
			BOTTOMMARGINAREA : 0,
			DEFAULT_WRONG_VALUE : 9999999999999,	//999999999



			DISPLAY_NONE_DATA : '',

			SHIFT_IS_ST : false,

			RULER_MARGIN:6,
		};

		_ChartUtils.constants.keyEvent =  {
			DELETE	: 46,
			RETURN	: 13,
			SPACE   : 32,

			SHIFT	: 16,
			CTRL	: 17,

			isCombineKey : function(keyValue) {
				if(keyValue === _ChartUtils.constants.keyEvent.SHIFT || keyValue === _ChartUtils.constants.keyEvent.CTRL) {
					return(true);
				}

				return(false);
			}
		};

		_ChartUtils.constants.ngc = {
			enum : {
				// ENUM_LAYOUT_STYLE
				ELS_INVALID		: -1,
				ELS_NORMAL		: 0 ,
				ELS_FULL		: 1	,
				ELS_VOLUME		: 2 ,
				ELS_KAGI		: 3	,
				ELS_RENKO		: 4	,
				ELS_TLB			: 5	,
				ELS_PNF			: 6	,
				ELS_REVC		: 7	,
				ELS_NUMBER		: 8	,
				ELS_AV			: 9	,

				ELS_COUNT		: 10,

				// ENUM_CALL_TYPE_STYLE
				ECTS_INIT		: 0 ,
				ECTS_CHANGE		: 1 ,
				ECTS_UPDATE		: 2	,

				// ENUM_CHART_DRAW_STYLE
				ECDS_NORMAL		: 0 ,
				ECDS_FULL		: 1	,
				ECDS_VOLUME		: 2	,

				ECDS_COUNT		: 3 ,

				// ENUM_LINEAR_DRAW_STYLE
				ELDS_RESTORE	: 0 ,
				ELDS_LINEAR		: 1	,
				ELDS_REVERSE	: 2	,
				ELDS_LOG		: 3	,

				ELDS_COUNT		: 4	,
			},
			// define
			define : {
				//=============================================================================
				// PROCESS END VALUE
				//=============================================================================
				NGC_FAIL			:	0,
				NGC_SUCCESS			:	1,
				NGC_RULLERX			:	2,
				NGC_RULLERY			:	3,


				NGC_JUL_DATESTART : 19000000,
				NGC_DATA_LOG	:	10.0,
			},
			macro : {
				NGC_OK				: function(x) {return(x === _ChartUtils.constants.ngc.NGC_SUCCESS);},
				__GETSIZE_INT		: function(x) {
					if(x === undefined || x == null)  {
						return(0);
					}

					if(x.hasOwnProperty("length")) {
						return(x.length);
					}

					return(0);
				},
				__GETDTYPE : function(high,low)	{
					return( (high) << 16 | (low) );
				},
				__GETHTYPE : function(dtype) {
					return( ( (dtype) >> 16 ) & 0x0000FFFF );
				},
				__GETLTYPE : function(dtype) {
					return( ( (dtype) ) & 0x0000FFFF );
				},
				__GETGTYPE : function(dtype) {
					return( ( (dtype) >> 12 ) & 0x000F );
				},
				__GETSTYPE : function(dtype) {return( ( (dtype) ) & 0x00000FFF ); },
				__GETTMARK : function(dtype) { return( ( (dtype) ) & 0x000000FF ); },
				__GETTNUM  : function(dtype) { return( ( (dtype) >> 8 ) & 0x00FFFFFF ); },
				__GETTFLAG : function(num,mark) { return( (num) << 8 | (mark) ); },
			}
		};

		_ChartUtils.constants.ngcl = {
			// enum
			enum : { // #933
				EUS_UPDATE_IQ		: 0 ,
				EUS_UPDATE_RT		: 1 ,
				EUS_RESIZE			: 2	,
				EUS_ZOOM			: 3	,
				EUS_SCROLL			: 4	,
				EUS_OBJECT_MOVE		: 5	,
				EUS_CHANGE_LAYOUT	: 6	,
				EUS_ADD_SERIES		: 7	,
				EUS_YDIR_MOVE		: 8 ,

				EUS_COUNT			: 9 ,
			},

			// define
			define : {
				NGCL_AXIS_RATE1	:	0.33,
				NGCL_AXIS_RATE2	:	0.6
			}
		};

		_ChartUtils.constants.keywords = {
			defaults : {
				price : "Price",
				period: "Period",
				method: "Method",
				subPrice: "SubPrice",
			},
			price : {
				ymd				: "ymd",
				hms				: "hms",
				date			: "ymd",
				time			: "hms",
				close			: "close",
				c				: "close",
				open			: "open",
				o				: "open",
				high			: "high",
				h				: "high",
				low				: "low",
				l				: "low",
				volume			: "volume",
				vol				: "volume",
				v				: "volume",
				amount			: "amount",
				amt				: "amount",
				a				: "amount",
				openInterest	: "oi",
				oi				: "oi",
				open_interest	: "oi",
				typical			: "typical",
				t				: "typical",
				weight			: "weight",
				weighted		: "weight",
				w				: "weight"
			},
			indicator : {
				simple 		: "simple",
				s			: "simple",
				exponent    : "exponential",
				exponential : "exponential",
				exp 		: "exponential",
				e			: "exponential",
				weight		: "weight",
				weighted	: "weight",
				w			: "weight"

			}
		};

		/**
		 * indicators
		 */
		_ChartUtils.constants.indicatorCodes = {
		};

		_ChartUtils.constants.indicatorGroups = {
			trend : {
				name: "Trend",
				display: "トレンド系",
				indicators : [
				]
			},
			oscillator : {
				name: "Oscillator",
				display: "オシレーター系",
				indicators : [
				]
			}
		};

		_ChartUtils.constants.indicatorColors = {
			baseline : "#FE7C7C"
		};

		_ChartUtils.constants.indicators = [
		],

		/**
		 * trend lines
		 */
		_ChartUtils.constants.trendLineCodes = {
			_prefix				: 'TL',

			pointer 			: 'TL0000',
			trendLine 			: 'TL0004',
			horzLine 			: 'TL0002',
			vertLine 			: 'TL4099',
			crossLine 			: 'TL4128',
			rectangle 			: 'TL0006',
			triangle 			: 'TL0007',
			text	 			: 'TL0009',
			trendLineByAngle	: 'TL0020',
			fiboArc 			: 'TL0013',
			fiboFan 			: 'TL0014',
			fiboRetracement 	: 'TL0015',
			fiboTimezone 		: 'TL4112',
			ganFanUp 			: 'TL0033',
			ganFanDown 			: 'TL0034',
			circle	 			: 'TL0035',

			tooltipText			: 'TL0090',
			doubleTrendline		: 'TL0091',	// #1558

			deleteOne 			: 'TL9990',
			deleteAll 			: 'TL9999',

			deleteOneRepeat		: 'TL9991',	// #1300

			crossHair			: 'TL0001',	// #2566

			orderLine			: 'OL0002',
		};

		_ChartUtils.constants.trendLineDefault = {
			lineStyle : 0,
			lineWeight: 1,
			lineColor : "#EE687B",
			fill      : false,
			fillColor : "#EE687B",
			text	  : "Text"
		};

		_ChartUtils.constants.trendLines = [
			// tid0
			{
				tool : true,
				code : _ChartUtils.constants.trendLineCodes.pointer				, display : 'Select'			, image : _ChartUtils.constants.trendLineCodes.pointer
			},
			// tid1
			{
				code : _ChartUtils.constants.trendLineCodes.trendLine			, display : 'Trend Line'		, image : _ChartUtils.constants.trendLineCodes.trendLine
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid2
			{
				code : _ChartUtils.constants.trendLineCodes.horzLine			, display : 'Horizontal Line'	, image : _ChartUtils.constants.trendLineCodes.horzLine
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid3
			{
				code : _ChartUtils.constants.trendLineCodes.vertLine			, display : 'Vertical Line'		, image : _ChartUtils.constants.trendLineCodes.vertLine
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid4
			{
				code : _ChartUtils.constants.trendLineCodes.crossLine			, display : 'Cross Line'		, image : _ChartUtils.constants.trendLineCodes.crossLine
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid5
			{
				code : _ChartUtils.constants.trendLineCodes.rectangle			, display : 'Rectangle'			, image : _ChartUtils.constants.trendLineCodes.rectangle
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : true, fillColor : "#FFFFFF"
				}
			},
			// tid6
			{
				code : _ChartUtils.constants.trendLineCodes.triangle			, display : 'Triangle'			, image : _ChartUtils.constants.trendLineCodes.triangle
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : true, fillColor : "#FFFFFF"
				}
			},
			// tid7
			{
				code : _ChartUtils.constants.trendLineCodes.trendLineByAngle	, display : 'Angle'				, image : _ChartUtils.constants.trendLineCodes.trendLineByAngle
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid8
			{
				code : _ChartUtils.constants.trendLineCodes.fiboArc			, display : 'Fib Arc'			, image : _ChartUtils.constants.trendLineCodes.fiboArc
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid9
			{
				code : _ChartUtils.constants.trendLineCodes.fiboFan			, display : 'Fib Fan'			, image : _ChartUtils.constants.trendLineCodes.fiboFan
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid10
			{
				code : _ChartUtils.constants.trendLineCodes.fiboRetracement	, display : 'Fib Retracement'	, image : _ChartUtils.constants.trendLineCodes.fiboRetracement
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid11
			{
				code : _ChartUtils.constants.trendLineCodes.fiboTimezone		, display : 'Fib TimeZone'		, image : _ChartUtils.constants.trendLineCodes.fiboTimezone
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid12
			{
				code : _ChartUtils.constants.trendLineCodes.ganFanUp			, display : 'Gan Fan(Up)'		, image : _ChartUtils.constants.trendLineCodes.ganFanUp
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid13
			{
				code : _ChartUtils.constants.trendLineCodes.ganFanDown		, display : 'Gan Fan(Down)'		, image : _ChartUtils.constants.trendLineCodes.ganFanDown
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid14
			{
				tool : true,
				code : _ChartUtils.constants.trendLineCodes.deleteOne			, display : 'Delete'			, image : _ChartUtils.constants.trendLineCodes.deleteOne
			},
			// tid15
			{
				tool : true,
				code : _ChartUtils.constants.trendLineCodes.deleteAll			, display : 'Delete All'		, image : _ChartUtils.constants.trendLineCodes.deleteAll
			},
			// tid16
			{
				code : _ChartUtils.constants.trendLineCodes.text				, display : 'Text'				, image : _ChartUtils.constants.trendLineCodes.text
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : true, fillColor : "#FFFFFF"
				}
				,
				textInfo: {
					text:_ChartUtils.constants.trendLineDefault.text
				}
			},
			// tid17
			// #1558
			{
				code : _ChartUtils.constants.trendLineCodes.doubleTrendline		, display : 'Channel Line'		, image : _ChartUtils.constants.trendLineCodes.doubleTrendline
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid18
			{
				code : _ChartUtils.constants.trendLineCodes.tooltipText				, display : 'Tooltip'		, image : _ChartUtils.constants.trendLineCodes.text
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : true, fillColor : "#FFFFFF"
				}
				,
				textInfo: {
					text:_ChartUtils.constants.trendLineDefault.text
				}
			},
			// tid19
			{
				code : _ChartUtils.constants.trendLineCodes.orderLine			, display : 'Order Line'	, image : _ChartUtils.constants.trendLineCodes.horzLine
				,
				styles : {
					lineStyle : 0 , lineWeight : 1, lineColor : "#EE687B",
					fill : false, fillColor : "#EE687B"
				}
			},
			// tid20
			// #1300
			{
				tool : true,
				code : _ChartUtils.constants.trendLineCodes.deleteOneRepeat		, display : 'Delete'		, image : _ChartUtils.constants.trendLineCodes.deleteOne
			},
			// tid21
			// #2566
			{
				tool : true,
				code : _ChartUtils.constants.trendLineCodes.crossHair		, display : 'Crosshair'		, image : _ChartUtils.constants.trendLineCodes.crossLine
			},
		];

		/**
		 * chart type
		 */
		_ChartUtils.constants.chartTypeCode = {
			candle : 'Candle',
			line : 'Line',
			bar_ohlc : 'Bar',
			bar_hlc : 'Bar(HLC)',
			threeLineBreak : 'TLB',
			reverseCycleLine : 'RCL',
			pointAndFigure : 'P&F',
			transCandle : 'TransCandle',
			longVolume : 'LongVolume',
			equiVolume : 'EquiVolume',
			averageCandle : "AverageCandle",
			kagi : 'Kagi',
			renko : 'Renko',
			compareChart : 'CompareChart'
		};

		_ChartUtils.constants.chartType = [ {
			code : _ChartUtils.constants.chartTypeCode.candle,
			display : 'ローソク足',
			valid : true
			, numCode : _ChartUtils.constants.ngc.enum.ELS_NORMAL
		}, {
			code : _ChartUtils.constants.chartTypeCode.transCandle,
			display : 'ロウソク足(変形)',
			valid : true
			, numCode : _ChartUtils.constants.ngc.enum.ELS_NORMAL
		}, {
			code : _ChartUtils.constants.chartTypeCode.bar_ohlc,
			display : 'バーチャート(４本値)',
			valid : true
			, numCode : _ChartUtils.constants.ngc.enum.ELS_NORMAL
		}, {
			code : _ChartUtils.constants.chartTypeCode.bar_hlc,
			display : 'バーチャート(高安終)',
			valid : true
			, numCode : _ChartUtils.constants.ngc.enum.ELS_NORMAL
		}, {
			code : _ChartUtils.constants.chartTypeCode.line,
			display : 'ラインチャート',
			valid : true
			, numCode : _ChartUtils.constants.ngc.enum.ELS_NORMAL
		}, {
			code : _ChartUtils.constants.chartTypeCode.longVolume,
			display : 'ロウソクボリューム',
			valid : false
			, numCode : _ChartUtils.constants.ngc.enum.ELS_VOLUME
		}, {
			code : _ChartUtils.constants.chartTypeCode.equiVolume,
			display : 'エクイボリューム',
			valid : false
			, numCode : _ChartUtils.constants.ngc.enum.ELS_VOLUME
		}, {
			code : _ChartUtils.constants.chartTypeCode.averageCandle,
			display : '平均足',
			valid : true
			, numCode : _ChartUtils.constants.ngc.enum.ELS_NORMAL
		}, {
			code : _ChartUtils.constants.chartTypeCode.pointAndFigure,
			display : 'P&F',
			valid : false
			, numCode : _ChartUtils.constants.ngc.enum.ELS_PNF
		}, {
			code : _ChartUtils.constants.chartTypeCode.kagi,
			display : 'カギ足',
			valid : false
			, numCode : _ChartUtils.constants.ngc.enum.ELS_KAGI
		}, {
			code : _ChartUtils.constants.chartTypeCode.renko,
			display : '練行足',
			valid : false
			, numCode : _ChartUtils.constants.ngc.enum.ELS_RENKO
		}, {
			code : _ChartUtils.constants.chartTypeCode.threeLineBreak,
			display : '新値足(三本)',
			valid : false
			, numCode : _ChartUtils.constants.ngc.enum.ELS_TLB
		}, {
			code : _ChartUtils.constants.chartTypeCode.reverseCycleLine,
			display : '逆ウォッチ曲線',
			valid : false
			, numCode : _ChartUtils.constants.ngc.enum.ELS_REVC
		}, {
			code : _ChartUtils.constants.chartTypeCode.compareChart,
			display : '比較チャート',
			valid : false
			, numCode : _ChartUtils.constants.ngc.enum.ELS_NORMAL
		} ];

		/**
		 * [hitTest description]
		 * @type {Object}
		 */
		_ChartUtils.hitTest = {};

		_ChartUtils.hitTest.config = {
			size : 7,
			color : '#aaaaaa'
		};

		/**
		 * @param[in] mctx		context
		 * @param[in] posval	{XPos, YPos}
		 * @return true or false
		 */
		_ChartUtils.hitTest.didHitTest = function(mctx, posval) {
			// #1518
			var ratio = _ChartUtils.didCalcRatioOfContext2D();
			var __posval = _ChartUtils.didClone(posval);
			__posval.XPos = Math.round(__posval.XPos * ratio);
			__posval.YPos = Math.round(__posval.YPos * ratio);
			// [end] #1518

			// #2305
			var imageData;
			var size = _ChartUtils.hitTest.config.size || 3;
			var ratio= _ChartUtils.didCalcRatioOfContext2D();
			size	 = Math.round(ratio * size);
			size	 = Math.max(size, 3);
			//

			// #2394
			var __xPos = __posval.XPos - size;
			var __yPos = __posval.YPos - size;
			var __size = 2 * size + 1;

			imageData = mctx.getImageData(__xPos, __yPos, __size, __size);
			var nLen = parseInt(imageData.data.length / 4);
			for(var __ii = 0; __ii < nLen; __ii++) {
				if(imageData.data[__ii * 4 + 3] > 0) {
					return(true);
				}
			}
			//

			return(false);
		};

		_ChartUtils.hitTest.prepareTools = function(rect, posvalHit, canvas, context) {
			/*
			_self.m_memcanvas = document.createElement('canvas');
			_self.m_memcanvas.width = _self.m_canvas.width;
			_self.m_memcanvas.height = _self.m_canvas.height;
			_self.m_memcontext = _self.m_memcanvas.getContext('2d');
			 */

			var hitTestTool = function(rect, posvalHit, canvas, context) {
				var _self = this;

				this.m_rect    = _ChartUtils.didClone(rect);
				this.m_canvas  = canvas;
				this.m_context = context;
				this.m_bFlag   = false;

				this.m_posvalHit= _ChartUtils.didClone(posvalHit);

				if(_self.m_canvas === undefined || _self.m_canvas == null) {
					_self.m_canvas = document.createElement('canvas');
					_self.m_context = _self.m_canvas.getContext('2d');

					_self.m_bFlag = true;
				}

				this.willBeHitTest = function(isFirst) {
					// HitTest用のCanvasの位置を整える。
					_self.m_canvas.left   = 0;
					_self.m_canvas.top    = 0;
					_self.m_canvas.width  = _self.m_rect.width;
					_self.m_canvas.height = _self.m_rect.height;

					// #2285
					// Canvasをクリアする。
					_self.m_context.clearRect(0, 0, _self.m_canvas.width, _self.m_canvas.height);

					if(isFirst === true) {
						// Originを移動する。
						_self.m_context.translate(0.5, 0.5);
					}
					//
				};

				this.didHitTest = function() {
					return(_ChartUtils.hitTest.didHitTest(_self.m_context, _self.m_posvalHit));
				};

				this.closeHitTest = function(isEnd) {
					// Originをもとに戻す。
					if(isEnd === true) {
						_self.m_context.translate(-0.5, -0.5);
					}
					// Canvasをクリアする。
					_self.m_context.clearRect(0, 0, _self.m_canvas.width, _self.m_canvas.height);

					//
					if(_self.m_bFlag === true) {
						_self.m_canvas = {};
						_self.m_context = {};
						_self.m_rect = {};
						_self.m_posvalHit = {};
					}
				};
			};

			return(new hitTestTool(rect, posvalHit, canvas, context));
		};


		/**
		 * [http description]
		 * @type {[type]}
		 */
		_ChartUtils.timeZone = {};

		_ChartUtils.timeZone.oneDayUnit = 24 * 60;

		_ChartUtils.timeZone.getDefaultDisplayString = function(timeType) {
			if(timeType > _ChartUtils.constants.timeType.hour) {
				return("9999/99/99");
			}

			return("99:99");
		};

		/**
		 * 時間ユニットから時間データ(数字型)へ変更する。
		 * @param  {[type]} timeUnit	seconds unit
		 * @return [Object]
		 */
		_ChartUtils.timeZone.convertTimeunitToDatetime = function(timeUnit) {
			var result = {
				date : 0,
				time : 0
			};

			// to milliSeconds
			var xDatetime = new Date(timeUnit * 1000);
			result.date = _ChartUtils.dateTime.convertDateToNumber(xDatetime);
			result.time = _ChartUtils.dateTime.convertTimeToNumber(xDatetime);

			return(result);
		};

		_ChartUtils.timeZone.convertDatetimeToTimeunit = function(argDate, argTime) {
			var dateTime = _ChartUtils.dateTime.convertNumberToDate(argDate, argTime);

			return(dateTime.getTime() / 1000);
		};

		_ChartUtils.timeZone.convertDatetimeStringFromPriceData = function(stPrice, timeType) {
			try {
				var date   = stPrice.ymd;
				var time   = stPrice.hms;
				// #1305
				var ret  = _ChartUtils.dateTime.convertNumberToDateString(date, _ChartUtils.dateTime.dateFormat1);
				if (timeType < _ChartUtils.constants.timeType.day) {
					ret += " " + _ChartUtils.dateTime.convertNumberToTimeString(time, _ChartUtils.dateTime.timeFormat1);
				}
				//

				return(ret);
			}
			catch(e) {
				console.error(e);
			}

			return("");
		}

		_ChartUtils.timeZone.calculateTimezoneUnit = function(businessDate, timeZone) {
			timeZone.unit  = {};

			// #1249
			var baseDate = businessDate + timeZone.dateOffset;

			timeZone.unit.begin = _ChartUtils.timeZone.convertDatetimeToTimeunit(baseDate, timeZone.begin);
			timeZone.unit.limit = _ChartUtils.timeZone.convertDatetimeToTimeunit(baseDate, timeZone.limit);
			timeZone.unit.final = _ChartUtils.timeZone.convertDatetimeToTimeunit(baseDate, timeZone.final);
			/*
			var beginTime = _ChartUtils.dateTime.convertNumberToDate(baseDate, timeZone.begin);
			var limitTime = _ChartUtils.dateTime.convertNumberToDate(baseDate, timeZone.limit);
			var finalTime = _ChartUtils.dateTime.convertNumberToDate(baseDate, timeZone.final);

			// second unit
			timeZone.unit.begin = beginTime.getTime() / 1000;
			timeZone.unit.limit = limitTime.getTime() / 1000;
			timeZone.unit.final = finalTime.getTime() / 1000;
			*/

			return(true);
		};

		_ChartUtils.timeZone.didGetTimeGapForTimezoneUnitAs = function(timeType, timeGap) {
			var timeGapForTimezoneUnit = 1;
			if(timeType === _ChartUtils.constants.timeType.hour) {
				timeGapForTimezoneUnit = timeGap * 60 * 60;
			}
			else if(timeType === _ChartUtils.constants.timeType.minute) {
				timeGapForTimezoneUnit = timeGap * 60;
			}
			else if(timeType === _ChartUtils.constants.timeType.day) {
				timeGapForTimezoneUnit = timeGap * 60 * 60 * 24;
			}
			else if(timeType === _ChartUtils.constants.timeType.week) {
				timeGapForTimezoneUnit = timeGap * 60 * 60 * 24 * 7;
			}
			else if(timeType === _ChartUtils.constants.timeType.month) {
				timeGapForTimezoneUnit = timeGap * 60 * 60 * 24 * 30;
			}
			else {
				timeGapForTimezoneUnit = 1;
			}

			return(timeGapForTimezoneUnit);
		};

		_ChartUtils.timeZone.didCheckTimeType = function(timeType) {
			var	isTick	 = false;
			var	isDwm	 = false;
			if(timeType === _ChartUtils.constants.timeType.tick) {
				isTick = true;
				isDwm  = false;
			}
			else if(timeType === _ChartUtils.constants.timeType.minute || timeType === _ChartUtils.constants.timeType.hour) {
				isTick = false;
				isDwm  = false;
			}
			else {
				isTick = false;
				isDwm  = true;
			}

			return({isTick:isTick, isDwm:isDwm});
		}

		_ChartUtils.timeZone.didAdjustDatetimeUnitAsTimezone = function(dateTimeUnit, timeZone, timeType, timeGap) {
			if(timeType !== _ChartUtils.constants.timeType.hour && timeType !== _ChartUtils.constants.timeType.minute) {
				return(dateTimeUnit);
			}

			var timeGapForTimezoneUnit = _ChartUtils.timeZone.didGetTimeGapForTimezoneUnitAs(timeType, timeGap);

			var beginTimezoneUnit = timeZone.unit.begin;
			var finalTimezoneUnit = timeZone.unit.final;

			var diff = dateTimeUnit - beginTimezoneUnit;
			var quotient = parseInt(diff / timeGapForTimezoneUnit);
			var remain   = parseInt(diff % timeGapForTimezoneUnit);

			var adjustedDatetimeUnit = beginTimezoneUnit + quotient * timeGapForTimezoneUnit;
			// TODO: 後で終了時間に関して確認が必要になる。
			// 終了時間は扱っていないようなので終了時間の場合は直前の時間帯で変更する。
			// #1268 : 上のTODO処理
			if(adjustedDatetimeUnit > timeZone.unit.final) {
			//if(adjustedDatetimeUnit >= timeZone.unit.final) {
				diff     = finalTimezoneUnit - beginTimezoneUnit;
				quotient = parseInt(diff / timeGapForTimezoneUnit);
				remain   = parseInt(diff % timeGapForTimezoneUnit);

				var offset = 0;
				if(remain === 0) {
					// #1268 : 上のTODO処理
					//offset = -1;
				}
				adjustedDatetimeUnit = beginTimezoneUnit + (quotient + offset) * timeGapForTimezoneUnit;
			}

			return(adjustedDatetimeUnit);
		};

		/**
		 * @see http://qiita.com/osakanafish/items/c64fe8a34e7221e811d0
		 */
		_ChartUtils.dateTime = {};

		_ChartUtils.dateTime.timeType = [ 'tick', 'minute', 'hour', 'day', 'week', 'month' ];

		_ChartUtils.dateTime.weekDays = {
			sunday : 0,
			monday : 1,
			tuesday : 2,
			wednesday : 3,
			thursday : 4,
			friday : 5,
			saterday : 6
		};

		_ChartUtils.dateTime.dateTimeFormat1 = 'YYYYMMDDhhmmss';
		_ChartUtils.dateTime.dateFormat1 = 'YYYY/MM/DD';
		_ChartUtils.dateTime.timeFormat1 = 'hh:mm';

		_ChartUtils.dateTime.formatDateString = function(strDate, format) {
			var formatStr = new String(format);
			if (!formatStr)
				formatStr = 'YYYY-MM-DD';

			formatStr = formatStr.replace(/YYYY/g, strDate.slice(0, 4));
			formatStr = formatStr.replace(/MM/g, strDate.slice(4, 6));
			formatStr = formatStr.replace(/DD/g, strDate.slice(6, 8));

			return (formatStr);
		};

		_ChartUtils.dateTime.formatTimeString = function(strTime, format) {
			var formatStr = new String(format);
			if (!formatStr)
				formatStr = 'hh:mm:ss';

			formatStr = formatStr.replace(/hh/g, strTime.slice(0, 2));
			formatStr = formatStr.replace(/mm/g, strTime.slice(2, 4));
			formatStr = formatStr.replace(/ss/g, strTime.slice(4, 6));

			return (formatStr);
		};

		_ChartUtils.dateTime.convertNumberToTimeString = function(argTime, format) {
			var hour = parseInt(argTime / 10000);
			var minute = parseInt(argTime / 100) % 100;
			var second = parseInt(argTime % 100);

			var time_str = _ChartUtils.number.formatAsfillSize(hour, '0', 2) + _ChartUtils.number.formatAsfillSize(minute, '0', 2)
					+ _ChartUtils.number.formatAsfillSize(second, '0', 2);

			// #1305
			if(format) {
				time_str = _ChartUtils.dateTime.formatTimeString(time_str, format);
			}
			//

			return (time_str);
		};

		_ChartUtils.dateTime.convertNumberToDateString = function(argTime, format) {
			var year  = parseInt(argTime / 10000);
			var month = parseInt(argTime / 100) % 100;
			var day   = parseInt(argTime % 100);

			var date_str = _ChartUtils.number.formatAsfillSize(year, '0', 4) + _ChartUtils.number.formatAsfillSize(month, '0', 2)
					+ _ChartUtils.number.formatAsfillSize(day, '0', 2);

			// #1305
			if(format) {
				date_str = _ChartUtils.dateTime.formatDateString(date_str, format);
			}
			//

			return (date_str);
		};

		_ChartUtils.dateTime.convertNumberToDate = function(argDate, argTime) {
			var hour   = null;
			var minute = null;
			var second = null;

			var year  = parseInt(argDate / 10000);
			// month is start with 0(0 ~ 11)
			var month = (parseInt(argDate / 100) % 100) - 1;
			var day   = parseInt(argDate % 100);

			if(argTime !== undefined && argTime != null) {
				hour   = parseInt(argTime / 10000);
				minute = parseInt(argTime / 100) % 100;
				second = parseInt(argTime % 100);
			}

			return (new Date(year, month, day, hour, minute, second));
		};

		_ChartUtils.dateTime.convertNumberToDatetime = function(argDate, argTime) {
			var dateTime = {
				year	: 0,
				month	: 0,
				day		: 0,
				hour	: 0,
				minute	: 0,
				second	: 0
			};

			dateTime.year  = parseInt(argDate / 10000);
			// month is start with 0(0 ~ 11)
			dateTime.month = (parseInt(argDate / 100) % 100) - 1;
			dateTime.day   = parseInt(argDate % 100);

			if(argTime !== undefined && argTime != null) {
				dateTime.hour   = parseInt(argTime / 10000);
				dateTime.minute = parseInt(argTime / 100) % 100;
				dateTime.second = parseInt(argTime % 100);
			}

			return (dateTime);
		};

		/**
		 * Dateオブジェクトから日付データを取ってyyyymmddの数字で変換する。
		 * @param  {Date}	argDate	Date object
		 * @return {number}
		 */
		_ChartUtils.dateTime.convertDateToNumber = function(argDate) {
			 if(typeof argDate !== "object") {
				 return;
			 }

			 var year  = argDate.getFullYear();
			 var month = argDate.getMonth() + 1;
			 var day   = argDate.getDate();

			 var ret = year * 10000 + month * 100 + day;

			 return(ret);
		};

		/**
		 * Dateオブジェクトから時間データを取ってhhmmssの数字で変換する。
		 * @param  {Date}	argDate	Date object
		 * @return {number}
		 */
		_ChartUtils.dateTime.convertTimeToNumber = function(argDate) {
			if(typeof argDate !== "object") {
		 		return;
		 	}

			var hour   = argDate.getHours();
			var minute = argDate.getMinutes();
			var second = argDate.getSeconds();

			var ret = hour * 10000 + minute * 100 + second;

			return(ret);
		};

		/**
		 *
		 */
		_ChartUtils.dateTime.convertStringToDate = function(strDate, format) {
			/*
			var year  = parseInt(strDate.slice(0, 4));
			var month = parseInt(strDate.slice(4, 6));// - 1;
			var day   = parseInt(strDate.slice(6, 8));

			var timedata = strDate.slice(8);
			var hour   = null;
			var minute = null;
			var second = null;
			if (timedata.length < 6) {
				hour = parseInt(timedata.slice(0, 1));
				minute = parseInt(timedata.slice(1, 3));
				second = parseInt(timedata.slice(3, 5));
			} else {
				hour = parseInt(timedata.slice(0, 2));
				minute = parseInt(timedata.slice(2, 4));
				second = parseInt(timedata.slice(4, 6));
			}

			var date = new Date(year, month, day, hour, minute, second);
			return (date);
			*/
			try {
				if(strDate === undefined || strDate == undefined) {
					return;
				}

				var dateData = strDate.slice(0, 8);
				var timeData = strDate.slice(8);
				var date     = parseInt(dateData);
				var time;
				if(timeData.length < 6) {
					timeData = null;
				}
				else {
					time = parseInt(timeData);
				}

				return(_ChartUtils.dateTime.convertNumberToDate(date, time));
			}
			catch(e) {
				console.error(e);
			}
		};

		// #1516
		_ChartUtils.dateTime.convertNumberDatetimeToTimelineData = function(argDate, argTime) {
			//
			var __date = _ChartUtils.dateTime.convertNumberToDateString(argDate);
			var __time = _ChartUtils.dateTime.convertNumberToTimeString(argTime);
			var __strTimeVal = __date + __time;

			return(__strTimeVal);
		};
		//

		/**
		 * 日付をフォーマットする
		 *
		 * @param {Date}
		 *            date 日付
		 * @param {String}
		 *            [format] フォーマット
		 * @return {String} フォーマット済み日付
		 */
		_ChartUtils.dateTime.formatDate = function(date, format) {
			if (!format)
				format = 'YYYY-MM-DD hh:mm:ss.SSS';
			format = format.replace(/YYYY/g, date.getFullYear());
			format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
			format = format.replace(/DD/g, ('0' + date.getDate()).slice(-2));
			format = format.replace(/hh/g, ('0' + date.getHours()).slice(-2));
			format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
			format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
			if (format.match(/S/g)) {
				var milliSeconds = ('00' + date.getMilliseconds()).slice(-3);
				var length = format.match(/S/g).length;
				for (var i = 0; i < length; i++)
					format = format.replace(/S/, milliSeconds.substring(i, i + 1));
			}
			return format;
		};

		/**
		 * 日付を加算する
		 *
		 * @param[in] {Date} date 日付
		 * @param[in] {Number} num 加算数
		 * @param[in] {String} [interval] 加算する単位
		 * @return {Date} 加算後日付
		 */
		_ChartUtils.dateTime.addDate = function(date, num, interval) {
			switch (interval) {
			case 'year':
				date.setFullYear(date.getFullYear() + num);
				break;
			case 'month':
				date.setMonth(date.getMonth() + num);
				break;
			case 'hour':
				date.setHours(date.getHours() + num);
				break;
			case 'minute':
				date.setMinutes(date.getMinutes() + num);
				break;
			case 'second':
				date.setSeconds(date.getSeconds() + num);
				break;
			case 'week':
				date.setDate(date.getDate() + num * 7);
				break;
			default:
				date.setDate(date.getDate() + num);
			}
			return date;
		};

		_ChartUtils.dateTime.addDatetime = function(dateTime, num, interval) {
			var xDatetime;
			if(typeof dateTime === "string") {
				xDatetime = _ChartUtils.dateTime.convertStringToDate(dateTime);
			}
			else {
				xDatetime = _ChartUtils.dateTime.convertStringToDate(String(dateTime));
			}

			return(_ChartUtils.dateTime.addDate(xDatetime, num, interval));
		};

		/**
		 * calculate date target date's week
		 *
		 * @param[in] {Date} date date
		 * @param[in] {Number} week week number(0:sunday ~ 6)
		 * @return {Date} calculated date
		 */
		_ChartUtils.dateTime.getDateOfTheWeekAtDate = function(date, week) {
			if(week === undefined || week == null) {
				week = _ChartUtils.dateTime.weekDays.saterday;
			}

			var week = Math.min(_ChartUtils.dateTime.weekDays.saterday, Math.max(_ChartUtils.dateTime.weekDays.sunday, week));
			var weekOfDate = date.getDay();
			var diff = week - weekOfDate;

			return (_ChartUtils.dateTime.addDate(date, diff));
		};

		/**
		 * 月の一日の日付で返却する。
		 * @param  {[type]} date
		 * @return [type]
		 */
		_ChartUtils.dateTime.getDateOfTheMonthAtDate = function(date) {
			var year = date.getFullYear();
			var month= date.getMonth();
			var day  = 1; // 一日にする。

			return(new Date(year, month, day));
		};


		/**
		 * 2つの日付の差を計算する
		 *
		 * @param {Date}
		 *            date1 日付1
		 * @param {Date}
		 *            date2 日付2
		 * @param {String}
		 *            [interval] 差の単位
		 * @return {Number} 2つの日付の差
		 */
		_ChartUtils.dateTime.dateDiff = function(date1, date2, interval, round) {
			var diff = date2.getTime() - date1.getTime();
			switch (interval) {
			case 'year':
				var d1 = new Date(date1.getTime());
				var d2 = new Date(date2.getTime());
				var i = 0;
				if(round === true) {
					d1.setYear(0);
					d2.setYear(0);
					if (diff >= 0) {
						i = d2.getTime() < d1.getTime() ? -1 : 0;
					} else {
						i = d2.getTime() <= d1.getTime() ? 0 : 1;
					}
				}
				return date2.getFullYear() - date1.getFullYear() + i;
				break;
			case 'month':
				var d1 = new Date(date1.getTime());
				var d2 = new Date(date2.getTime());
				var i = 0;
				if(round === true) {
					d1.setYear(0);
					d1.setMonth(0);
					d2.setYear(0);
					d2.setMonth(0);
					if (diff >= 0) {
						i = d2.getTime() < d1.getTime() ? -1 : 0;
					} else {
						i = d2.getTime() <= d1.getTime() ? 0 : 1;
					}
				}
				return ((date2.getFullYear() * 12) + date2.getMonth()) - ((date1.getFullYear() * 12) + date1.getMonth()) + i;
				break;
			case 'hour':
				return parseInt(diff / (60 * 60 * 1000));
				break;
			case 'minute':
				return parseInt(diff / (60 * 1000));
				break;
			case 'second':
				return parseInt(diff / 1000);
				break;
			case 'week':
				return parseInt(diff / (24 * 60 * 60 * 1000 * 7));
				break;
			default: // day
				return parseInt(diff / (24 * 60 * 60 * 1000));
			}
		};

		/**
		 * [scale description]
		 * @type {Object}
		 */
		_ChartUtils.scale = {};

		_ChartUtils.scale.constants = {
			NGC_SCALE_FULL	 : -1,
			NGC_SCALE_SCREEN : 0,
			NGC_SCALE_USER	 : 1
		};

		_ChartUtils.scale.unit = {
			minMaxScreen : {
				minValue : _ChartUtils.constants.default.DEFAULT_WRONG_VALUE,
				minIndex : -1,
				maxValue : -1 * _ChartUtils.constants.default.DEFAULT_WRONG_VALUE,
				maxIndex : -1,
				diff     : -1,
				ratio    : 0
			},
			minMaxTotal : {
				minValue : _ChartUtils.constants.default.DEFAULT_WRONG_VALUE,
				minIndex : -1,
				maxValue : -1 * _ChartUtils.constants.default.DEFAULT_WRONG_VALUE,
				maxIndex : -1,
				diff     : -1,
				ratio    : 0
			}
		};

		_ChartUtils.scale.info = {
			previous : _ChartUtils.didClone(_ChartUtils.scale.unit),
			current  : _ChartUtils.didClone(_ChartUtils.scale.unit)
		};

		_ChartUtils.scale.didAdjustReverseMinMax = function(scaleUnit) {
			if(scaleUnit === undefined || scaleUnit == null) {
				return;
			}

			_ChartUtils.scale.didResetMinMax(scaleUnit.minMaxScreen, true, 10000);
			_ChartUtils.scale.didResetMinMax(scaleUnit.minMaxTotal , true, 10000);
		};

		_ChartUtils.scale.didCreateScaleInfo = function() {
			return(_ChartUtils.didClone(_ChartUtils.scale.info));
		};

		_ChartUtils.scale.didCreateScaleUnit = function() {
			return(_ChartUtils.didClone(_ChartUtils.scale.unit));
		};

		_ChartUtils.scale.didResetMinMax = function(argMinMax, toZero, toLimit) {
			if(argMinMax === undefined || argMinMax == null) {
				return;
			}

			if(toZero === true) {
				argMinMax.minValue = 0;
				argMinMax.minIndex = -1;
				argMinMax.maxValue = 0;
				argMinMax.maxIndex = -1;
				argMinMax.diff     = 0;
				argMinMax.ratio    = 0;

				if(typeof toLimit === "number" && toLimit > 0) {
					argMinMax.diff	   =
					argMinMax.maxValue = Math.min(10000, toLimit);
				}
			}
			else {
				argMinMax.minValue = _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;
				argMinMax.minIndex = -1;
				argMinMax.maxValue = -1 * _ChartUtils.constants.default.DEFAULT_WRONG_VALUE;
				argMinMax.maxIndex = -1;
				argMinMax.diff     = -1;
				argMinMax.ratio    = 0;
			}
		};

		_ChartUtils.scale.didResetScaleUnit = function(scaleUnit, toZero) {
			if(scaleUnit === undefined || scaleUnit == null) {
				return;
			}

			_ChartUtils.scale.didResetMinMax(scaleUnit.minMaxScreen);
			_ChartUtils.scale.didResetMinMax(scaleUnit.minMaxTotal);
		};

		_ChartUtils.scale.didBackupScaleInfo = function(argScaleInfo) {
			if(argScaleInfo === undefined || argScaleInfo == null || argScaleInfo.previous === undefined || argScaleInfo.previous == null) {
				return;
			}

			argScaleInfo.previous = _ChartUtils.didClone(argScaleInfo.current);
		};

		/**
		 * @param[in] argMax
		 * @param[in] argMin
		 * @return size
		 */
		_ChartUtils.scale.didCalcDiff = function(argMax, argMin, isOpt) {
			if(isOpt !== true) {
				return (argMax + 1 - argMin);
			}

			return (argMax - argMin);
		};

		/**
		 * @param[in] argMax
		 * @param[in] argMin
		 * @return size
		 */
		_ChartUtils.scale.didCalcScaleUnit = function(argScaleUnit) {
			if(argScaleUnit === undefined || argScaleUnit == null) {
				return;
			}

			//
			argScaleUnit.minMaxScreen.diff = _ChartUtils.scale.didCalcDiff(argScaleUnit.minMaxScreen.maxValue, argScaleUnit.minMaxScreen.minValue);
			argScaleUnit.minMaxTotal.diff  = _ChartUtils.scale.didCalcDiff(argScaleUnit.minMaxTotal.maxValue , argScaleUnit.minMaxTotal.minValue );
		};

		//
		// Type definition
		//

		_ChartUtils.dataType = {};

		_ChartUtils.dataType.range = {
			location: 0,
			length:0
		};

		_ChartUtils.dataType.didGetRangeObject = function() {
			_ChartUtils.didClone(_ChartUtils.dataType.range);
		};

		_ChartUtils.dataType._ST_MINMAX_DATA = {
			nMaxIdx	: 0 ,
			nMinIdx	: 0 ,
			dMax	: 0 ,
			dMin	: 0
		};

		//
		return (_ChartUtils);
	};

	//console.debug("[MODUEL] Loading => chartUtil");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartUtil"] = loadModule(global["WGC_CHART"]["canvas2DUtil"]);
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] = loadModule(require("./canvas2DUtil"));
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartUtil", ['ngc/canvas2DUtil'], function(gxDc) { return loadModule(gxDc); });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartUtil"] = loadModule(global["WGC_CHART"]["canvas2DUtil"]);
    }

	//console.debug("[MODUEL] Loaded => chartUtil");
})(this);
