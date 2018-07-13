(function(global){
	"use strict";

	var loadModule = function(xUtils, gxDc) {
		"use strict";

		//
		// MARK:[begin] NGU
		//
		var exports = {};

		//
		//
		//
		exports.didDrawMiniLineChartIn = function(pstDp) {
            if(!pstDp) {
                return;
            }

            try {
				var __nLocalXPos1, __nLocalXPos2, __nLocalYPos1, __nLocalYPos2;
				var __stPrice1, stPrice2;

				var stPrice;

				var arrData= pstDp.datas;
                var ncCnt = 0;
                if(!arrData || arrData.length === undefined || (ncCnt = arrData.length) == null || ncCnt < 2) { // #2844
                    return;
                }

				var xEnv   = pstDp.stEnv;

				var	rcDraw = pstDp.rcDraw;
				var margin = pstDp.margin;

				xUtils.shapes.InflateRect(rcDraw, 0, -3);

				var nWidth  = rcDraw.width;
				var nHeight = rcDraw.height;

				var	dMin	=  1 * xUtils.constants.default.DEFAULT_WRONG_VALUE;
				var	dMax	= -1 * xUtils.constants.default.DEFAULT_WRONG_VALUE;
				for(var ii = 0; ii < ncCnt; ii++) {
					var __stPrice = arrData[ii];
					dMin	= Math.min(dMin, __stPrice.close);
					dMax	= Math.max(dMax, __stPrice.close);
				}

				var	dDiff	= (dMax - dMin);
				var	pY		= null;
				if(dDiff < 0) {
					// console.debug("[D] LDPF_DrawPriceOnFullMode : wrong min(" + dMin + ") & max(" + dMax + ")\n");
					return;
				}
				else if(dDiff == 0) {
					pY	= Math.round(rcDraw.y + rcDraw.height / 2);
				}

				var	nTotalSize	= pstDp.totalSize;

				var	dRatioX	= ((nWidth)) / (nTotalSize - 1); // #2844
				var	dRatioY	= ((nHeight) / dDiff);

				var __nScrSIdx = 0;
				var __nScrSize = nTotalSize;

				//
				// #505
				//
				var __nLoopStart = 0;
				var __nLoopEnd   =__nScrSize;
				var	lineWidth	 = 1;
				var lineColor	 = xEnv.MiniChartConfig.LineColor;
				var fillColor	 = lineColor;
				var __context = pstDp.context;

				__context.translate(0.5, 0.5);

				// #1827
				var __drawLinesParam = {
		    		context : __context,
		    		pts : [],
		    		lineWidth : lineWidth,
		    		lineColor : lineColor
		    	};

				var __drawPolygonParam = {
					context:__context,
					pt1s:[],
					pt2s:[],
					lineWidth:lineWidth,
					lineColor:lineColor,
					fillColor:fillColor
				};
				//

				var __tempHeight = rcDraw.height + 10;

				__drawPolygonParam.grad = {
					colors : [xEnv.MiniChartConfig.BgColor2, xEnv.MiniChartConfig.BgColor1],
					pt1 : {x:0, y:0},
					pt2 : {x:0, y:__tempHeight}
				};

				__drawLinesParam.lineColor = xEnv.MiniChartConfig.LineColor;

				var arrPoints = [];
				var ptStart;
				var ptEnd;
				var bFirst = true;
				for(var __dataIndex = 0; __dataIndex < nTotalSize; __dataIndex++) {
					var __stPrice1 = arrData[__dataIndex];
					if(xUtils.validator.isValidPrice(__stPrice1) !== true) {
						continue;
					}

					__nLocalXPos1 = Math.round(rcDraw.x + dRatioX * (__dataIndex));
					if(pY !== undefined && pY != null) {
						__nLocalYPos1 = pY;
					}
					else {
						__nLocalYPos1 = Math.round(rcDraw.y + rcDraw.height - (dRatioY * (__stPrice1.close - dMin)));
					}

					// #1827
					var pt = {x:__nLocalXPos1, y:__nLocalYPos1};
					if(bFirst) {
						ptStart = xUtils.didClone(pt);
						bFirst = false;
					}

					ptEnd = xUtils.didClone(pt);

					__drawPolygonParam.pt1s.push(pt);
					__drawLinesParam.pts.push(pt);
					//
				}

				// #1827
				if(ptStart && ptEnd) {
					ptEnd.y   =
					ptStart.y = rcDraw.y + __tempHeight;

					__drawPolygonParam.pt2s.push(ptStart);
					__drawPolygonParam.pt2s.push(ptEnd);

					gxDc.PolygonGradient(__drawPolygonParam);
				}

				gxDc.Lines(__drawLinesParam);
				//

				__context.translate(-0.5, -0.5);
            }
            catch(e) {
                console.error(e);
            }
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => siteTools");

	// Enable module loading if available
	if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
		module["exports"] =
    		loadModule(
    			require("../ngc/chartUtil"),
                require("../ngc/canvas2DUtil")
    		);
	} else { //f (typeof define !== 'undefined' && define["amd"]) { // AMD
		define("site/siteTools", ['ngc/chartUtil'], ['ngc/canvas2DUtil'],
    		function(xUtils, gxDc) {
    			return loadModule(xUtils, gxDc);
    		});
	}

	//console.debug("[MODUEL] Loaded => siteTools");
})(this);
