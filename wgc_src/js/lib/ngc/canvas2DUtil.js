(function(global){
	"use strict";

	var loadModule = function() {
	    "use strict";

		var exports = {};

		exports.penstyle = {
			solid 		: 0,
			dash 		: 1,	/* -------  */
			dot 		: 2,	/* .......  */
			dashdot 	: 3,	/* _._._._  */
			dashdotdot 	: 4		/* _.._.._  */
		};

		var __didAdjustScale = function(context) {
			var devicePixelRatio = window.devicePixelRatio || 1;
			var backingStoreRatio = context.webkitBackingStorePixelRatio ||
									context.mozBackingStorePixelRatio    ||
									context.msBackingStorePixelRatio     ||
									context.oBackingStorePixelRatio      ||
									context.backingStorePixelRatio       || 1;

			var ratio = devicePixelRatio / backingStoreRatio;

			context.scale(ratio, ratio);
		};

	    var __measuretext_cache__ = [];

	    /**
	    * @see https://www.rgraph.net/blog/measuring-text-height-with-html5-canvas.html
	    * Measures text by creating a DIV in the document and adding the relevant text to it.
	    * Then checking the .offsetWidth and .offsetHeight. Because adding elements to the DOM is not particularly
	    * efficient in animations (particularly) it caches the measured text width/height.
	    *
	    * @param  string text   The text to measure
	    * @param  bool   bold   Whether the text is bold or not
	    * @param  string font   The font to use
	    * @param  size   number The size of the text (in pts)
	    * @return array         A two element array of the width and height of the text
	    */
	    var _MeasureText = function(text, bold, font, size) {
	        // This global variable is used to cache repeated calls with the same arguments
	        var str = text + ':' + bold + ':' + font + ':' + size;
	        if (__measuretext_cache__ !== undefined && __measuretext_cache__ != null && typeof(__measuretext_cache__) === 'object' && __measuretext_cache__[str]) {
	            return __measuretext_cache__[str];
	        }

	        var div = document.createElement('DIV');
	            div.innerHTML = text;
	            div.style.position = 'absolute';
	            div.style.top = '-100px';
	            div.style.left = '-100px';
	            div.style.fontFamily = font;
	            div.style.fontWeight = bold ? 'bold' : 'normal';
	            div.style.fontSize = (typeof size === "string") ? size : size + 'pt';
	        document.body.appendChild(div);

	        var size = [div.offsetWidth, div.offsetHeight];

	        document.body.removeChild(div);

	        // Add the sizes to the cache as adding DOM elements is costly and can cause slow downs
	        if (typeof(__measuretext_cache__) != 'object') {
	            __measuretext_cache__ = [];
	        }
	        __measuretext_cache__[str] = size;

	        return size;
	    };

	    /**
	     * [_didSetPenStyle description]
	     * @param  {[type]} context
	     * @param  {[type]} argStyle
	     * @return {[type]}
	     */
	    var _didSetPenStyle = function(context, lineColor, lineWidth, lineStyle) {
	        if(context === undefined || context == null) {
	            return;
	        }

			context.lineCap = "round";

			if(lineStyle === undefined || lineStyle == null) {
				lineStyle = exports.penstyle.solid;
			}

	        if(lineStyle !== undefined && lineStyle != null) {
	            var nPenStyle = exports.penstyle.solid;
	            if(typeof lineStyle === "string") {
	                var strStyle = lineStyle.toLowerCase();
	                if(exports.penstyle.hasOwnProperty(strStyle) === true) {
	                    nPenStyle = exports.penstyle[strStyle];
	                }
	            }
	            else {
	                var style = parseInt(lineStyle);
	                if(style >= exports.penstyle.solid && style <= exports.penstyle.dashdotdot) {
	                    nPenStyle = style;
	                }
	            }

	            var nWeight = 1;
	            if(lineWidth !== undefined && lineWidth != null) {
	                context.lineWidth = lineWidth;
	                nWeight = lineWidth;
	            }

				if(nWeight > 1) {
					context.lineCap = "butt";
				}

	            var nDash = nWeight * 5;
	            var nDashSpace = nDash;
	            var nDot  = nWeight;
	            var nDotSpace = nDot + 1;

	            if(nPenStyle === exports.penstyle.dash) {
	                context.setLineDash([nDash, nDashSpace]);
	            }
	            else if(nPenStyle === exports.penstyle.dot) {
	                context.setLineDash([nDot, nDotSpace]);
	            }
	            else if(nPenStyle === exports.penstyle.dashdot) {
	                context.setLineDash([nDash, nDashSpace, nDot, nDashSpace]);
	            }
	            else if(nPenStyle === exports.penstyle.dashdotdot) {
	                context.setLineDash([nDash, nDashSpace, nDot, nDashSpace, nDot, nDashSpace]);
	            }
	        }

	        if(lineColor !== undefined && lineColor != null) {
	            context.strokeStyle = lineColor;
	        }
	    };

		/**
		 * Rectangle
		 * @param[in]	drawParam 	drawing parameter {context, x, y, width, height, lineWidth, lineColor, fillColor, fillAlpha}
		 *
		 * */
		exports.Rectangle = function(drawParam) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			var __rect = drawParam.rect;

			__context.save();
			__didAdjustScale(__context);
			__context.beginPath();
			__context.rect(__rect.x, __rect.y, __rect.width, __rect.height);
			if(drawParam.fillAlpha !== undefined && drawParam.fillAlpha != null) {
				__context.globalAlpha = drawParam.fillAlpha;
			}
			if(drawParam.fillColor !== undefined && drawParam.fillColor != null) {
				__context.fillStyle = drawParam.fillColor;
				__context.fill();
			}

	        _didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
			__context.stroke();
			__context.restore();
		};

		/**
		 * Rectangle
		 * @param[in]	drawParam 	drawing parameter {context, x, y, width, height, lineWidth, lineColor, fillColor, fillAlpha}
		 *
		 * */
		exports.Ellipse = function(drawParam) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			var __rect = drawParam.rect;

			var __radiusVert = __rect.height / 2;
			var __radiusHorz = __rect.width  / 2;
			var __rectCenter = {
				x : __rect.x + __radiusHorz,
				y : __rect.y + __radiusVert
			};

			__context.save();
			__didAdjustScale(__context);
			__context.beginPath();
			__context.ellipse(__rectCenter.x, __rectCenter.y, __radiusHorz, __radiusVert, 0, 0, 2 * Math.PI);
			if(drawParam.fillAlpha !== undefined && drawParam.fillAlpha != null) {
				__context.globalAlpha = drawParam.fillAlpha;
			}
			if(drawParam.fillColor !== undefined && drawParam.fillColor != null) {
				__context.fillStyle = drawParam.fillColor;
				__context.fill();
			}
	        _didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
			__context.stroke();
			__context.restore();
		};

		/**
		 * circle
		 * @param[in]	drawParam 	drawing parameter {__context, pt:{x, y}, radius, anticlockwise, lineWidth, lineColor, fillColor, fillAlpha}
		 * */
	    exports.Arc = function(drawParam) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			var bFill = false;
			if(drawParam.fillColor !== undefined && drawParam.fillColor != null) {
				bFill = true;
			}

			__context.save();
			__didAdjustScale(__context);
			__context.beginPath();
			__context.lineWidth = drawParam.lineWidth;
			__context.strokeStyle = drawParam.lineColor;

			if(bFill === true) {
				__context.moveTo(drawParam.pt.x, drawParam.pt.y);
			}

			if(typeof drawParam.degree === "number") {
				__context.arc(drawParam.pt.x, drawParam.pt.y, drawParam.radius, 0, (Math.PI / 180) * drawParam.degree, drawParam.anticlockwise);
			}
			else {
				__context.arc(drawParam.pt.x, drawParam.pt.y, drawParam.radius, (Math.PI / 180) * drawParam.degree.from, (Math.PI / 180) * drawParam.degree.to, drawParam.anticlockwise);
			}

			if(bFill === true) {
				// closePathを使用すると最初位置まで線が描かれるため、Fillのみ有効にする。
				__context.closePath();
			}
			if(drawParam.fillAlpha !== undefined && drawParam.fillAlpha != null) {
				__context.globalAlpha = drawParam.fillAlpha;
			}
			if(drawParam.fillColor !== undefined && drawParam.fillColor != null) {
				__context.fillStyle = drawParam.fillColor;
				__context.fill();
			}
	        _didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
			__context.stroke();
			__context.restore();
		};

	    /**
		 * circle
		 * @param[in]	drawParam 	drawing parameter {__context, pt:{x, y}, radius, lineWidth, lineColor, fillColor, fillAlpha}
		 * */
	    exports.Circle = function(drawParam) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			__context.save();
			__didAdjustScale(__context);
			__context.beginPath();
			__context.lineWidth = drawParam.lineWidth;
			__context.strokeStyle = drawParam.lineColor;
			__context.arc(drawParam.pt.x, drawParam.pt.y, drawParam.radius, 0, 2 * Math.PI, true);
			if(drawParam.fillAlpha !== undefined && drawParam.fillAlpha != null) {
				__context.globalAlpha = drawParam.fillAlpha;
			}
			if(drawParam.fillColor !== undefined && drawParam.fillColor != null) {
				__context.fillStyle = drawParam.fillColor;
				__context.fill();
			}
	        _didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
			__context.stroke();
			__context.restore();
		};

		/**
		 * @param[in]	drawParam 	drawing parameter {context, x, y, width, height, lineWidth, lineColor, fillColor, fillAlpha}
		 */
		exports.CurvedCircle = function(drawParam) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			__context.save();
			__didAdjustScale(__context);

			var __rect = drawParam.rect;

			__context.rect(__rect.x, __rect.y, __rect.width, __rect.height);

			var kappa = 0.5522848;
			var ox = (__rect.width / 2) * kappa; 	// control point offset
													// horizontal
			var oy = (__rect.height / 2) * kappa;	// control point offset vertical
			var xe = __rect.x + __rect.width;       // x-end
			var ye = __rect.y + __rect.height;      // y-end
			var xm = __rect.x + __rect.width / 2;   // x-middle
			var ym = __rect.y + __rect.height / 2;  // y-middle
			__context.beginPath();
			__context.moveTo(__rect.x, ym);
			__context.bezierCurveTo(__rect.x, ym - oy, xm - ox, __rect.y, xm, __rect.y);
			__context.bezierCurveTo(xm + ox, __rect.y, xe, ym - oy, xe, ym);
			__context.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
			__context.bezierCurveTo(xm - ox, ye, __rect.x, ym + oy, __rect.x, ym);
	        _didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
			__context.stroke();
			__context.restore();
		};

	    /**
		 * Triangle
		 * @param[in]	drawParam 	drawing parameter {__context, x, y, width, height, lineWidth, lineColor, fillColor, fillAlpha}
		 * */
		exports.Triangle = function(drawParam) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			__context.save();
			__didAdjustScale(__context);
			__context.beginPath();
			__context.moveTo(drawParam.pt1.x, drawParam.pt1.y);
			__context.lineTo(drawParam.pt2.x, drawParam.pt2.y);
			__context.lineTo(drawParam.pt3.x, drawParam.pt3.y);
			__context.closePath();
			if(drawParam.fillAlpha !== undefined && drawParam.fillAlpha != null) {
				__context.globalAlpha = drawParam.fillAlpha;
			}
			if(drawParam.fillColor !== undefined && drawParam.fillColor != null) {
				__context.fillStyle = drawParam.fillColor;
				__context.fill();
			}
	        _didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
			__context.stroke();
			__context.restore();
		};

		/**
		 * Line
		 * @param[in]	drawParam 	drawing parameter {context, pt1:{x,y}, pt2:{x,y}, lineWidth, lineColor}
		 */
		exports.Line = function(drawParam) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			__context.save();
			__didAdjustScale(__context);
			__context.beginPath();
	        __context.moveTo(drawParam.pt1.x, drawParam.pt1.y);
	        __context.lineTo(drawParam.pt2.x, drawParam.pt2.y);
	        _didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
	        __context.stroke();
	        __context.restore();
		};

		/**
		 * Line
		 * @param[in]	drawParam 	drawing parameter {context, pts:[{x,y}], lineWidth, lineColor}
		 */
		exports.Lines = function(drawParam) {
			if(drawParam == undefined || drawParam == null || drawParam.pts === undefined || drawParam.pts == null || drawParam.pts.length === undefined || drawParam.pts.length == null || drawParam.pts.length < 2) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			if(__context == undefined || __context == null) {
				return;
			}

			__context.save();
			__didAdjustScale(__context);
			__context.beginPath();
			var nCount = drawParam.pts.length;
			var pt1 = drawParam.pts[0];
			__context.moveTo(pt1.x, pt1.y);
			for(var ii = 1; ii < nCount; ii++) {
				var pt2 = drawParam.pts[ii];
				__context.lineTo(pt2.x, pt2.y);
			}
	        _didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
	        __context.stroke();
	        __context.restore();
		};

		exports.MeasureTextWidth = function(drawParam) {
			if(drawParam == undefined || drawParam == null) {
				return(0);
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return(0);
			}

			__context.save();
			__context.font = drawParam.font;
	        var width = __context.measureText(drawParam.text).width;
	        __context.restore();

			return(width);
		};

		/**
		 * [description]
		 * @param  {[type]} context
		 * @return {[type]}
		 */
		exports.MeasureDefaultText = function(context) {
			var xResult = {
				width : 0,
				height: 0
			};

			if(context === undefined || context == null) {
				return(xResult);
			}

			xResult.width = context.measureText("M").width;
			xResult.height= Math.round(xResult.width * 1.5);

			return(xResult);
		};

		/**
		 * TextOut
		 * @param[in]	drawParam 	drawing parameter {context, pt:{x,y}, text, font, fillStyle, useMultiline, useBox}
		 */
		exports.TextOut = function(drawParam, isMeasure, outRect) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			__context.save();
			__didAdjustScale(__context);
			if(drawParam.clip) {
				__context.beginPath();
				__context.rect(drawParam.clip.x, drawParam.clip.y, drawParam.clip.x + drawParam.clip.width - 1, drawParam.clip.y + drawParam.clip.height - 1);
				__context.clip();
			}
	        if(drawParam.textBaseline !== undefined && drawParam.textBaseline != null) {
	            __context.textBaseline = drawParam.textBaseline;
	        }
	        else {
				if(drawParam.useMultiline === true || drawParam.useBox === true || drawParam.box) {
					__context.textBaseline = 'top';
				}
				else {
					__context.textBaseline = 'middle';
				}
	        }
			__context.font = drawParam.font;

			try {
				var x1CharInfo = exports.MeasureDefaultText(__context);
				var n1CharW    = x1CharInfo.width;
				var n1CharH    = x1CharInfo.height;

				var width      = __context.measureText(drawParam.text).width;

				var rect = {
					x: drawParam.pt.x,
					y: drawParam.pt.y,
					width: width,
					height: n1CharH
				};

				// set fillstyle
				__context.fillStyle = drawParam.fillStyle;

				var arrText = drawParam.text.split("\n");
				var nLineCount = arrText.length;

				var nMargin = 3;
				if(drawParam.margin !== undefined && drawParam.margin != null) {
					nMargin = drawParam.margin;
				}

				var ptText = {
					x : drawParam.pt.x + nMargin,
					y : drawParam.pt.y + nMargin
				};

				if(drawParam.useMultiline === true) {
					width = 0;
					var arrText = drawParam.text.split("\n");
					var nCount = arrText.length;
					for(var ii = 0; ii < nCount; ii++) {
						var text = arrText[ii];
						var textWidth = __context.measureText(text).width;
						width = Math.max(width, textWidth);
						__context.fillText(text, ptText.x, ptText.y);
						ptText.y += n1CharH;
					}

					width		= width + 2 * nMargin;
					rect.width  = width;
					rect.height = nCount * n1CharH + 2 * nMargin;
				}
				else {
					//subPixelText(__context, drawParam.text, drawParam.pt.x, drawParam.pt.y, 14);
					__context.fillText(drawParam.text, drawParam.pt.x, drawParam.pt.y);
					width = __context.measureText(drawParam.text).width;

					width		= width + 2 * nMargin;
					rect.width  = width;
					rect.height = 1 * n1CharH + 2 * nMargin;
				}

				if(drawParam.useBox === true) {
					__context.rect(rect.x, rect.y, Math.round(rect.width), Math.round(rect.height));	// #1802
			        _didSetPenStyle(__context, drawParam.fillStyle);
					__context.stroke();
				}
				else if(drawParam.box) {
					__context.rect(rect.x, rect.y, Math.round(rect.width), Math.round(rect.height));	// #1802
					if(drawParam.box.color !== undefined && drawParam.box.color != null) {
						__context.globalAlpha = 0.5;
						__context.fillStyle = drawParam.box.color;
						__context.fill();
						__context.globalAlpha = 1;

						//_didSetPenStyle(__context, drawParam.box.color);
					}
					else {
						_didSetPenStyle(__context, drawParam.fillStyle);
						__context.stroke();
					}
				}

				if(outRect !== undefined && outRect != null) {
					outRect.x = rect.x;
					outRect.y = rect.y;
					outRect.width  = Math.round(rect.width);
					outRect.height = Math.round(rect.height);
				}
			}
			catch(e) {
				console.error(e);
			}

	        __context.restore();

			if(isMeasure === true) {
				return(Math.round(width));	// #1802
			}
		};

		/**
		 * TextOut
		 * @param[in]	drawParam 	drawing parameter {context, rect:{x,y,width,height}, text, font, fillStyle, useMultiline, useBox}
		 */
		exports.DrawText = function(drawParam, isMeasure, outRect) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			__context.save();
			__didAdjustScale(__context);
			if(drawParam.clip) {
				__context.beginPath();
				__context.rect(drawParam.clip.x, drawParam.clip.y, drawParam.clip.x + drawParam.clip.width - 1, drawParam.clip.y + drawParam.clip.height - 1);
				__context.clip();
			}
	        __context.textBaseline = 'top';
			__context.font = drawParam.font;

			try {
				var x1CharInfo = exports.MeasureDefaultText(__context);
				var n1CharW    = x1CharInfo.width;
				var n1CharH    = x1CharInfo.height;

				var width      = __context.measureText(drawParam.text).width;

				var rect = {
					x: 0,
					y: 0,
					width: width,
					height: n1CharH
				};

				var arrText = drawParam.text.split("\n");
				var nLineCount = arrText.length;

				var nMargin = 3;
				if(drawParam.margin !== undefined && drawParam.margin != null) {
					nMargin = drawParam.margin;
				}

				var ptText = {
					x : drawParam.pt.x + nMargin,
					y : 0
				};

				var textInfos = [];
				if(drawParam.useMultiline === true) {
					width = 0;
					var arrText = drawParam.text.split("\n");
					var nCount = arrText.length;
					for(var ii = 0; ii < nCount; ii++) {
						var text = arrText[ii];
						var textWidth = __context.measureText(text).width;
						width = Math.max(width, textWidth);

						var textInfo = {
							text : text,
							width : textWidth,
							no : ii
						};

						textInfos.push(textInfo);

						ptText.y += n1CharH;
					}

					width		= width + 2 * nMargin;
					rect.width  = width;
					rect.height = nCount * n1CharH + 2 * nMargin;
				}
				else {
					width = __context.measureText(drawParam.text).width;

					var textInfo = {
						text : drawParam.text,
						width : width,
						y : 0
					};

					textInfos.push(textInfo);

					width		= width + 2 * nMargin;
					rect.width  = width;
					rect.height = 1 * n1CharH + 2 * nMargin;
				}

				if(isMeasure !== true) {
					// set fillstyle
					__context.fillStyle = drawParam.fillStyle;

					var ptCenter = {
						x : Math.round(drawParam.rect.x + drawParam.rect.width  / 2),
						y : Math.round(drawParam.rect.y + drawParam.rect.height / 2)
					};

					var yPos = Math.round(ptCenter.y - rect.height / 2 + nMargin);

					var textInfoCount = textInfos.length;
					for(var ii = 0; ii < textInfoCount; ii++) {
						var textInfo  = textInfos[ii];
						var textWidth = textInfo.width;
						var textPt = {
							x : Math.round(ptCenter.x - textWidth / 2),
							y : yPos + ii * n1CharH
						};

						__context.fillText(textInfo.text, textPt.x, textPt.y);
					}

					if(drawParam.useBox === true) {
						__context.rect(rect.x, rect.y, rect.width, rect.height);
				        _didSetPenStyle(__context, drawParam.fillStyle);
						__context.stroke();
					}
					else if(drawParam.box) {
						__context.rect(rect.x, rect.y, rect.width, rect.height);
						if(drawParam.box.color !== undefined && drawParam.box.color != null) {
							__context.globalAlpha = 0.5;
							__context.fillStyle = drawParam.box.color;
							__context.fill();
							__context.globalAlpha = 1;

							//_didSetPenStyle(__context, drawParam.box.color);
						}
						else {
							_didSetPenStyle(__context, drawParam.fillStyle);
							__context.stroke();
						}
					}
				}

				if(outRect !== undefined && outRect != null) {
					outRect.x = rect.x;
					outRect.y = rect.y;
					outRect.width = rect.width;
					outRect.height = rect.height;
				}
			}
			catch(e) {
				console.error(e);
			}

	        __context.restore();

			if(isMeasure === true) {
				return(width);
			}
		};

		var subPixelBitmap = function(imgData){
		    var spR,spG,spB; // sub pixels
		    var id,id1; // pixel indexes
		    var w = imgData.width;
		    var h = imgData.height;
		    var d = imgData.data;
		    var x,y;
		    var ww = w*4;
		    for(y = 0; y < h; y+=1){ // (go through all y pixels)
		        for(x = 0; x < w-2; x+=3){ // (go through all groups of 3 x pixels)
		            var id = y*ww+x*4; // (4 consecutive values: id->red, id+1->green, id+2->blue, id+3->alpha)
		            var output_id = y*ww+Math.floor(x/3)*4;
		            spR = Math.round((d[id + 0] + d[id + 4] + d[id + 8])/3);
		            spG = Math.round((d[id + 1] + d[id + 5] + d[id + 9])/3);
		            spB = Math.round((d[id + 2] + d[id + 6] + d[id + 10])/3);
		            // console.debug("[WGC] :" + d[id+0], d[id+1], d[id+2] + '|' + d[id+5], d[id+6], d[id+7] + '|' + d[id+9], d[id+10], d[id+11]);
		            d[output_id] = spR;
		            d[output_id+1] = spG;
		            d[output_id+2] = spB;
		            d[output_id+3] = 255; // alpha is always set to 255
		        }
		    }
		    return imgData;
		};
		var subPixelText = function(ctx,text,x,y,fontHeight){

		    var width = ctx.measureText(text).width + 12; // add some extra pixels
		    var hOffset = Math.floor(fontHeight);

		    var c = document.createElement("canvas");
		    c.width  = width * 3; // scaling by 3
		    c.height = fontHeight;
		    c.ctx    = c.getContext("2d");
		    c.ctx.font = ctx.font;
		    c.ctx.globalAlpha = ctx.globalAlpha;
		    c.ctx.fillStyle = ctx.fillStyle;
		    c.ctx.fontAlign = "left";
		    c.ctx.setTransform(3,0,0,1,0,0); // scaling by 3
		    c.ctx.imageSmoothingEnabled = false;
		    c.ctx.mozImageSmoothingEnabled = false; // (obsolete)
		    c.ctx.webkitImageSmoothingEnabled = false;
		    c.ctx.msImageSmoothingEnabled = false;
		    c.ctx.oImageSmoothingEnabled = false;
		    // copy existing pixels to new canvas
		    c.ctx.drawImage(ctx.canvas,x,y-hOffset,width,fontHeight,0,0,width,fontHeight);
		    c.ctx.fillText(text,0,hOffset-3 /* (harcoded to -3 for letters like 'p', 'g', ..., could be improved) */); // draw the text 3 time the width
		    // convert to sub pixels
		    c.ctx.putImageData(subPixelBitmap(c.ctx.getImageData(0,0,width*3,fontHeight)), 0, 0);
		    ctx.drawImage(c,0,0,width-1,fontHeight,x,y-hOffset,width-1,fontHeight);
		};

		/**
		 * DrawSingleLineText
		 * @param[in]	drawParam 	drawing parameter {context, pt:{x,y}, text, font, fillStyle, boxStyle}
		 */
		exports.DrawSingleLineText = function(drawParam, isMeasure) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			__context.save();
			__didAdjustScale(__context);
	        if(drawParam.textBaseline !== undefined && drawParam.textBaseline != null) {
	            __context.textBaseline = drawParam.textBaseline;
	        }
	        else {
				__context.textBaseline = 'middle';
	        }
			__context.font = drawParam.font;

			var nMargin    = 3;

			var x1CharInfo = exports.MeasureDefaultText(__context);
			var n1CharW    = x1CharInfo.width;
			var n1CharH    = x1CharInfo.height;
			var nHeight	   = n1CharH + 2 * nMargin;

			var width      = __context.measureText(drawParam.text).width + 2 * nMargin;

			var rect = {
				x: drawParam.pt.x  - nMargin,
				y: drawParam.pt.y  - parseInt(nHeight * 0.5),
				width : width,
				height: nHeight
			};

			// set fillstyle
			if(drawParam.boxStyle) {
				__context.save();
				__context.beginPath();
				__context.rect(rect.x, rect.y, rect.width, rect.height);
				if(drawParam.fillAlpha !== undefined && drawParam.fillAlpha != null) {
					__context.globalAlpha = drawParam.fillAlpha;
				}
				__context.fillStyle = drawParam.boxStyle;
				__context.fill();
				__context.restore();
			}

			__context.fillStyle = drawParam.fillStyle;
			__context.fillText(drawParam.text, drawParam.pt.x, drawParam.pt.y);

	        __context.restore();

			if(isMeasure === true) {
				return(width);
			}
		};

		exports.Polygon = function(drawParam) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			var nCount1 = 0;
			var nCount2 = 0;

			nCount1 = drawParam.pt1s.length;
			nCount2 = drawParam.pt2s.length;

			if(nCount1 < 1 && nCount2 < 1) {
				return;
			}

			__context.save();
			__didAdjustScale(__context);
			__context.beginPath();

			var pt0;
			if(nCount1 > 0) {
				pt0 = drawParam.pt1s[0];
				__context.moveTo(pt0.x, pt0.y);

				for(var ii = 1; ii < nCount1; ii++) {
					var pt = drawParam.pt1s[ii];
					__context.lineTo(pt.x, pt.y);
				}
			}

			if(nCount2 > 1) {
				if(pt0 === undefined || pt0 == null) {
					pt0 = drawParam.pt2s[0];
					__context.moveTo(pt0.x, pt0.y);

					for(var ii = 1; ii < nCount2; ii++) {
						var pt = drawParam.pt2s[ii];
						__context.lineTo(pt.x, pt.y);
					}
				}
				else {
					for(var ii = nCount2 - 1; ii >= 0; ii--) {
						var pt = drawParam.pt2s[ii];
						__context.lineTo(pt.x, pt.y);
					}
				}
			}

			if(pt0) {
				__context.lineTo(pt0.x, pt0.y);
			}

			__context.closePath();

			if(drawParam.fillAlpha !== undefined && drawParam.fillAlpha != null) {
				__context.globalAlpha = drawParam.fillAlpha;
			}
			if(drawParam.fillColor !== undefined && drawParam.fillColor != null) {
				__context.fillStyle = drawParam.fillColor;
				__context.fill();
			}

	        _didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
			__context.stroke();
			__context.restore();
		};

		// #1827
		exports.PolygonGradient = function(drawParam) {
			if(drawParam == undefined || drawParam == null) {
				return;
			}

			var __context = drawParam.context;
			if(__context == undefined || __context == null) {
				return;
			}

			var nCount1 = 0;
			var nCount2 = 0;

			nCount1 = drawParam.pt1s.length;
			nCount2 = drawParam.pt2s.length;

			if(nCount1 < 1 && nCount2 < 1) {
				return;
			}

			__context.save();
			__didAdjustScale(__context);
			__context.beginPath();

			var pt0;
			if(nCount1 > 0) {
				pt0 = drawParam.pt1s[0];
				__context.moveTo(pt0.x, pt0.y);

				for(var ii = 1; ii < nCount1; ii++) {
					var pt = drawParam.pt1s[ii];
					__context.lineTo(pt.x, pt.y);
				}
			}

			if(nCount2 > 1) {
				if(pt0 === undefined || pt0 == null) {
					pt0 = drawParam.pt2s[0];
					__context.moveTo(pt0.x, pt0.y);

					for(var ii = 1; ii < nCount2; ii++) {
						var pt = drawParam.pt2s[ii];
						__context.lineTo(pt.x, pt.y);
					}
				}
				else {
					for(var ii = nCount2 - 1; ii >= 0; ii--) {
						var pt = drawParam.pt2s[ii];
						__context.lineTo(pt.x, pt.y);
					}
				}
			}

			if(pt0) {
				__context.lineTo(pt0.x, pt0.y);
			}

			__context.closePath();

			if(drawParam.grad) {
				try {
					var __grad  = __context.createLinearGradient(drawParam.grad.pt1.x, drawParam.grad.pt1.y, drawParam.grad.pt2.x, drawParam.grad.pt2.y);
					for(var ii = 0; ii < drawParam.grad.colors.length; ii++) {
						__grad.addColorStop(ii, drawParam.grad.colors[ii]);
					}

					__context.fillStyle = __grad;
					__context.fill();

					if(drawParam.grad.useStroke) {
						_didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
						__context.stroke();
					}
				}
				catch(e) {
					// console.error(e);
				}
			}
			else {
				if(drawParam.fillAlpha !== undefined && drawParam.fillAlpha != null) {
					__context.globalAlpha = drawParam.fillAlpha;
				}

				if(drawParam.fillColor !== undefined && drawParam.fillColor != null) {
					__context.fillStyle = drawParam.fillColor;
					__context.fill();
				}

				_didSetPenStyle(__context, drawParam.lineColor, drawParam.lineWidth, drawParam.lineStyle)
				__context.stroke();
			}

			__context.restore();
		};
		//

	    exports.CalcRect2 = function(str, argFont) {
	        var resRect = {
	            x : 0,
	            y : 0,
	            width : 0,
	            height : 0
	        };
	        var fonts = argFont.split(" ");
	        var fontSize = fonts[0];
	        var fontFamily = fonts[1];
	        var res = _MeasureText(str, false, fontFamily, fontSize);
	        resRect.width = res[0];
	        resRect.height = res[1];

	        return(resRect);
	    };

	    exports.CalcRect = function(context, str, font) {
	        var resRect = {
	            x : 0,
	            y : 0,
	            width : 0,
	            height : 0
	        };

	        if(context === undefined || context == null) {
	            return(resRect);
	        }

			context.save();
			context.font = font;
	        resRect.width = context.measureText(str).width;
	        context.restore();

	        return(resRect);
	    };

		return(exports);
	};

	//console.debug("[MODUEL] Loading => canvas2DUtil");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["canvas2DUtil"] = loadModule();
	}
	else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] = loadModule();
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/canvas2DUtil", [], function() { return loadModule(); });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["canvas2DUtil"] = loadModule();
    }

	//console.debug("[MODUEL] Loaded => canvas2DUtil");
})(this);
