/**
 * global
 * @file	global.js
 * @brief	global function, constants, ...
 * @author	cukim
 * @date
 */

/**
 *
 */
var session = {

	get: function(key){
		return this[key];
	},

	set: function(key, data){
		this[key] = data;
		return this;
	},

	remove: function(key){
		delete this[key];
	}
};

/**
 *
 */
var createGuid = function(){
	var s4 = function(){
		return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
	};
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
};

/**
 *
 */
var xhr = function(method, url, async, callback, user, password) {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() {
		if(xhr.readyState == 4) {
			if(xhr.status == 200){
				callback(xhr.responseText);
			}else{
				console.error(xhr.status + ' (' + xhr.statusText + ')');
			}
		}
	};
	xhr.open(method, url, async, user, password);
	xhr.send();
};

//
// added by choi sunwoo at 2017.03.27
// constants
// 数字などソース上で固定になっているのを調整をしやすくするため、集めておく。
// ＊この物は基本的にwindow['target']のようになるので上書きされる可能性もあるので注意が必要
//

var __constants__ = {
	tab : {
		height : 37
	},
	border : {
		dropPositionSizeRatio : 0.25,
		dragSize : 100,
		size : 7,
		halfSize : 3.5,
		types : {
			vert : {
				target : "vertical",
				lw : "left",
				rw : "right",
				sizeTarget : "width"
			},
			horz : {
				target : "horizontal",
				lw : "top",
				rw : "bottom",
				sizeTarget : "height"
			}
		}
	}
};

var __utils__ = {
	getDragRange : function(borderInfo) {
		return({
			size : borderInfo.dragSize,
			borderSize : borderInfo.size,
			limit : borderInfo.dragSize * 2 + borderInfo.size
		});
	},
	isLeftWing : function(position) {
		if(position === __constants__.border.types.vert.lw || position === __constants__.border.types.horz.lw) {
			return(true);
		}

		return(false);
	},
	isVerticalBorderWithTarget : function(target) {
		if(target === __constants__.border.types.vert.target) {
			return(true);
		}

		return(false);
	},
	isVerticalBorder : function(position) {
		if(position === __constants__.border.types.vert.lw || position === __constants__.border.types.vert.rw) {
			return(true);
		}

		return(false);
	},
	getBorderSizeTarget : function(tagetType) {
		if(targetType === __constants__.border.types.vert.target) {
			return(__constants__.border.types.vert.sizeTarget);
		}
		else {
			return(__constants__.border.types.horz.sizeTarget);
		}
	},
	getBorderInfoWithType : function(targetType) {
		var result = {
			wh : __constants__.border.types.horz.sizeTarget,
			lt : __constants__.border.types.horz.lw
		};

		if(targetType === __constants__.border.types.vert.target){
			result.wh = __constants__.border.types.vert.sizeTarget;
			result.lt = __constants__.border.types.vert.lw;
		}

		return(result);
	},
	getBorderTargetWithPosition : function(position) {
		var isVert = __utils__.isVerticalBorder(position);
		var result = __constants__.border.types.horz.target;
		if(isVert) {
			result = __constants__.border.types.vert.target;
		}

		return(result);
	},
	getDropPosition : function(className){
		var position;
		if(className === 'drop-area-left'){
			position = __constants__.border.types.vert.lw;
		}else if(className === 'drop-area-right'){
			position = __constants__.border.types.vert.rw;
		}else if(className === 'drop-area-top'){
			position = __constants__.border.types.horz.lw;
		}else if(className === 'drop-area-bottom'){
			position = __constants__.border.types.horz.rw;
		}
		else {
			return(false);
		}
		return position;
	},
	getDropPositionForLayout : function(className){
		var position;
		if(className === 'layout-drop-area-left'){
			position = __constants__.border.types.vert.lw;
		}else if(className === 'layout-drop-area-right'){
			position = __constants__.border.types.vert.rw;
		}else if(className === 'layout-drop-area-top'){
			position = __constants__.border.types.horz.lw;
		}else if(className === 'layout-drop-area-bottom'){
			position = __constants__.border.types.horz.rw;
		}
		else {
			return(false);
		}

		return position;
	},
	calcBorderPosEx : function(argSize, argCount, argNo, argHalfSize) {
		if(argSize === undefined || argSize == null || argSize < 1) {
			return(0);
		}

		if(argCount === undefined || argCount == null || argCount < 1) {
			return(0);
		}

		if(argNo === undefined || argNo == null || argNo < 1 || argNo >= argCount) {
			return(0);
		}

		var width = argSize;
		var counts = argCount;
		var no = argNo;

		var nPos = Math.round(width * no * (1 / counts) - argHalfSize);

		return(nPos);
	},
	calcBorderPos : function(argSize, argHalfSize, argPosition) {
		if(argSize === undefined || argSize == null || argSize < 1) {
			return(0);
		}

		if(argPosition !== undefined && argPosition != null && argPosition > 0) {
			return(argPosition);
		}

		var nPos = argSize * 0.5 - argHalfSize;

		return(nPos);
	},
	didCalculateMatirx : function(argMatrix, layoutOffset, borderInfo) {
		if(argMatrix === undefined || argMatrix == null) {
			return;
		}

		var colBorders = {};
		var rowBorders = [];

		var offsets = [

	    ];

		var offsetDefault = {
			left    : 0,
			top     : 0,
			width   : 0,
			height  : 0
		};

		var nRowCounts = argMatrix.length;
		var ratioHeight= (layoutOffset.height - borderInfo.size * (nRowCounts - 1)) / nRowCounts;
		var offsetCalc = {
			width : layoutOffset.width,
			height : layoutOffset.height
		};

		if(nRowCounts > 2) {
			offsetCalc.height = ratioHeight * 2;
		}

		var topOffset = 0;
		for(var nRow = 0; nRow < nRowCounts; nRow++) {
			//
			// 行ではtop, heightのみ使用する。
			//
			var offsetRow = $.extend(true, {}, offsetDefault);
			//
			offsetRow.left  = topOffset;
			offsetRow.height = offsetCalc.height;

			// 追加する。
			rowBorders.push(offsetRow);

			//
			var nColCounts = argMatrix[nRow];
			if(nColCounts < 1) {
				// TODO:
				console.log("__utils__::didCalculateMatirx => Error: column is zero at " + nRow + " -> " + nColCounts);
				continue;
			}

			//
			var colBorderInfo = {
				no : nRow,
				borders : []
			};

			var leftOffset = 0;
			var ratioWidth = (layoutOffset.width - borderInfo.size * (nColCounts - 1)) / nColCounts;

			if(nColCounts > 2) {
				offsetCalc.width = ratioWidth * 2;
			}
			else {
				offsetCalc.width = layoutOffset.width;
			}

			for(var nCol = 0; nCol < nColCounts; nCol++) {
				//
				// 列ではleft, widthのみ使用する。
				//
				var offsetCol = $.extend(true, {}, offsetDefault);

				//
				offsetCol.left  = leftOffset;
				offsetCol.width = offsetCalc.width;

				//
				colBorderInfo.borders.push(offsetCol);

				// re-calculate left offset
				leftOffset = leftOffset + ratioWidth + borderInfo.halfSize;
			}

			colBorders[String(nRow)] = colBorderInfo;

			// re-calculate top offset
			topOffset = topOffset + ratioHeight + borderInfo.halfSize;
		}

		var results = {
			row : rowBorders,
			col : colBorders
		};

		return(results);
	},
	/**
	 * レイアウトをマトリックス情報で分割する。
	 * @param  {[type]} layout
	 * @param  {[type]} argMatrix
	 * @return [type]
	 */
	didDivideMatirx : function(layout, argMatrix, defaultWidget) {
		if(layout === undefined || layout == null || argMatrix === undefined || argMatrix == null) {
			return;
		}

		var colBorders = [];

		var rowPanels = [];
		var rowBorders = [];

		var xMatrixInfos = [

		];

		var xMatirxInfoDefault = {
			panels : []
		};

		// 基本パネルを追加する。
		var widgetMain;
		if(defaultWidget === true) {
			widgetMain = new Widget('Main', layout);
		}
		var panelMain = layout.addPanelWithWidget(widgetMain);
		rowPanels.push(panelMain);

		// パネル情報を追加する。
		(function() {
			var xMatirxInfo = $.extend(true, {}, xMatirxInfoDefault);
			xMatirxInfo.panels.push(panelMain);
			xMatrixInfos.push(xMatirxInfo);
		})();

		var rowDivType = __constants__.border.types.horz.rw;	// bottom
		var colDivType = __constants__.border.types.vert.rw;	// right

		//
		var panelRowTarget = panelMain;

		var nRowCounts = argMatrix.length;

		// top position
		var topOffset = 0;

		// まずは行を分割する。
		for(var nRow = 0; nRow < nRowCounts - 1; nRow++) {
			var widget;
			if(defaultWidget === true) {
				widget = new Widget('FXQB1_ROW' + nRow + 1, layout);
			}

			var panelRow = panelRowTarget.addPanelWithWidget(rowDivType, widget);

			(function() {
				var xMatirxInfo = $.extend(true, {}, xMatirxInfoDefault);
				xMatirxInfo.panels.push(panelRow);
				xMatrixInfos.push(xMatirxInfo);
			})();

			rowPanels.push(panelRow);
			rowBorders.push(panelRow.parentBorders[0]);

			panelRowTarget = panelRow;
		}

		// 列のほうを分割する。
		for(var nRow = 0; nRow < nRowCounts; nRow++) {
			var xMatrixInfo = xMatrixInfos[nRow];

			// 0番目のものは行の最初のパネル
			var panelRow = xMatrixInfo.panels[0];

			//
			var colBorderInfo = {
				no : nRow,
				borders : []
			};

			// 列の数が0以下だと処理しない。
			var nColCounts = argMatrix[nRow];
			if(nColCounts < 1) {
				// TODO:
				console.log("__utils__::didCalculateMatirx => Error: column is zero at " + nRow + " -> " + nColCounts);
				continue;
			}

			//
			var panelColTarget = panelRow;
			for(var nCol = 0; nCol < nColCounts - 1; nCol++) {
				var widget;
				if(defaultWidget === true) {
					widget = new Widget('FXQB1_ROW' + (nRow + 1) + "COL" + (nCol + 1), layout);
				}

				var panelCol = panelColTarget.addPanelWithWidget(colDivType, widget);

				// 列のパネル情報を記録しておく。
				xMatrixInfo.panels.push(panelCol);

				// Border情報を記録しておく。
				colBorderInfo.borders.push(panelCol.parentBorders[0]);

				//
				panelColTarget = panelCol;
			}

			colBorders.push(colBorderInfo);
		}

		var results = {
			row : rowBorders,
			col : colBorders,
			matrix : xMatrixInfos
		};

		return(results);
	},
	/**
	 * Layoutをマトリックス情報に従って分割し、Widgetを配置する。
	 * @param  {[type]} argLayout
	 * @param  {[type]} argMatrix
	 * @param  {[type]} argWidgets
	 * @return {[type]}
	 */
	didDivideLayoutWithWidget : function(argLayout, argMatrix, argWidgets) {
		if(argLayout === undefined || argLayout == null || argMatrix === undefined || argMatrix == null || argWidgets === undefined || argWidgets == null) {
			return(false);
		}

		var layout = argLayout;
		var matrix = argMatrix;
		var widgets= argWidgets;

		//
		// {row, col}
		// row : [{left, top, width, height}]
		// col : [{left, top, width, height}]
		//
		var resultOffsets = __utils__.didCalculateMatirx(matrix, layout.offset, layout.borderInfo);

		//
		// [{panels:[]}]
		//
	    var resultMatrixs = __utils__.didDivideMatirx(layout, matrix, false);

	    // 行から配置する。
	    var nWidgetCount = widgets.length;
	    var nWidgetNo = 0;
	    var nPanelRows = resultMatrixs.matrix.length;
	    for(var nRow = 0; nRow < nPanelRows; nRow++) {
	      var rowInfo = resultMatrixs.matrix[nRow];
	      var nPanelCols = rowInfo.panels.length;
	      for(var nCol = 0; nCol < nPanelCols; nCol++) {
	        var widget = widgets[nWidgetNo];
	        var panel  = rowInfo.panels[nCol];
	        panel.addWidget(widget);

	        nWidgetNo++;
	        if(nWidgetNo >= nWidgetCount) {
	          break;
	        }
	      }
	    }

		// 行からリサイズする。
	    var nRowCounts = resultMatrixs.row.length;
	    for(var nRow = 0; nRow < nRowCounts - 1; nRow++) {
	        var border = resultMatrixs.row[nRow];
	        var offset = resultOffsets.row[nRow];

	        border.didRecalculateOffset(offset);
	    }

		// 列をリサイズする。
	    var nRowCounts = resultMatrixs.col.length;
	    for(var nRow = 0; nRow < nRowCounts; nRow++) {
	        var matrixInfo = resultMatrixs.col[nRow];
	        var offsetInfo = resultOffsets.col[nRow];
	        var nColCounts = matrixInfo.borders.length;
	        for(var nCol = 0; nCol < nColCounts; nCol++) {
	            var border = matrixInfo.borders[nCol];
	            var offset = offsetInfo.borders[nCol];

	            border.didRecalculateOffset(offset);
	        }
	    }

		return(true);
	},
	createGuid : function() {
		var s4 = function(){
			return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
		};
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
	},
	/**
	 * イベント対象に対する位置を計算する。
	 * @param  {[type]} event
	 * @return {[type]}
	 */
	didConvertToRelativePositionForEvent : function(event) {
		var jqOffset = $(event.currentTarget).offset();

		var posValueClient = {
			x : (event.clientX - jqOffset.left),
			y : (event.clientY - jqOffset.top)
		};

		return(posValueClient);
	},

	/*
		@fliptopbox

		LZW Compression/Decompression for Strings
		Implementation of LZW algorithms from:
		http://rosettacode.org/wiki/LZW_compression#JavaScript
		Usage:
		var a = 'a very very long string to be squashed';
		var b = a.compress(); // 'a veryāăąlong striċ to bečquashed'
		var c = b.uncompress(); // 'a very very long string to be squashed'
		console.log(a === c); // True
		var d = a.compress(true); // return as Array
		console.log(d); // [97, 32, 118 .... 101, 100] an Array of ASCII codes
	*/

	//didCompressString : (argSrc, asArray) => {
	didCompressString : function(argSrc, asArray) {
		"use strict";
		// Build the dictionary.
		asArray = (asArray === true);
		var i,
			dictionary = {},
			uncompressed = argSrc,
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
	},

	didDecompressString : function(argSrc) {
		"use strict";
		// Build the dictionary.
		var i, tmp = [],
			dictionary = [],
			compressed = argSrc,
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
	},
	/**
	 * calculate center value(rounding)
	 *
	 * @return number
	 */
	didClone : function(arg) {
		if ($ === undefined || jQuery === undefined) {
			return;
		}

		//return ($.extend({}, arg));
		return ($.extend(true, {}, arg));
	}
};
