(function(global){
	"use strict";

	var loadModule = function(xUtils) {
	    "use strict";

		/*
		 *
		 */
	    var exports = {};

		//
		//
		//
		var _AxisUnit = function() {
			//
	        // private
	        //
	        var _self = this;

			//
			this.m_stScaleInfo		= xUtils.scale.didCreateScaleUnit();	// Scale Information

			this.m_dMaxD			= -1 * xUtils.constants.default.DEFAULT_WRONG_VALUE;	/// max value for drawing
			this.m_dMinD			= xUtils.constants.default.DEFAULT_WRONG_VALUE;			/// min value for drawing
			this.m_dRatioD			= 0;	/// ratio for drawing

			this.m_nDiffSize		= 0;	///

			this.m_nDispPoint		= 0;

			this.m_nRecalCnt		= 0;

			this.m_nDOIdx			= -1;
			this.m_arrDOIdx			= [];	//

			this.m_bBase			= false;	// use base ( for min value )
			this.m_dMinBase			= 0;	//

			this.m_nBarPlus			= 0;	// bar plus size...

		    this.m_arrAxisLabel  	= [];   /// axis label list

			this.m_dZoom			= 0;
			this.m_dZoomStore		= 0;

			this.m_bRevMM			= false;

			//
			// Methods
			//

			/**
			 * [description]
			 * @param  {[type]} argScaleUnit
			 * @return {[type]}
			 */
			this.SetMinMax = function(argScaleUnit) {
				return(false);
			};

			this.ResetAxis = function() {
				xUtils.scale.didResetScaleUnit(_self.m_stScaleInfo);
			};

			this.CalcDrawInfo = function(argBaseCoordinate) {
				return(true);
			};


			/**
			 * get zoom value
			 * @return  double
			 * */
			this.GetZoom = function() {
			    return(_self.m_dZoomStore + _self.m_dZoom);
			};

			this.IsDrawObj = function(argDo) {
				return(false);
			};

			this.GetDO = function(argIdx) {
				return(null);
			};

			this.AddDO = function(argDo) {

			};

			this.GetDiffSize = function(lpGate, nSize) {
				return(_self.m_nDiffSize);
			}

			this.SetBaseMode = function(bBase, dBase) {
				_self.m_bBase = bBase;
				if(_self.m_bBase === true) {
					_self.m_dMinBase = dBase;
				}
			}

			/**
			    Get Convert Data ( pixel -> data )
			    @param[in]     lpGate		gate
				@param[in]     nPixel		pixel
				@param[in]     bOrigin		flag
			    @return        double
			*/
			this.GetPixel2Data = function(lpGate, nPixel, bOrgin) {
				return(0.0);
			}

			/**
			    Get Convert Data ( data -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     dData		data
			    @return        int
			*/
			this.GetData2Pixel = function(lpGate, dData) {
				return(0);
			}


			/**
			    Get Convert Data ( offset -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     nOffset		offset
			    @return        int
			*/
			this.GetOffset2Pixel = function(lpGate, nOffset) {
				return(0);
			};

			/**
			    Calculate Axis Information
			    @param[in]     lpGate		gate
				@param[in]     nScrSize		screen size( pixel )
				@param[in]     nBarSize		bar size( pixel )
				@param[in]     nGap			gap( pixel )
				@param[in]     nDataSize	drawing data size
			    @return        int ( Drawing data size )
			*/
			this.CalcAxisInfo = function(lpGate, nScrSize, nBarSize, nGap, nDataSize) {
				return(0);
			};

			/**
			    Calculate Axis Information
			    @param[in]     lpGate		gate
				@param[in]     nScrSize		screen size
				@param[in]     nBarSize		bar size
				@param[in]     nGap			gap
				@param[in]     nDataSize	drawing data size
			    @return        int ( Drawing data size )
			*/
			this.CalcAxisInfoEx = function(lpGate, nScrSize, nBarSize, nGap, nDataSize, nOffSize) {
				return(0);
			};

			// #1653
			/**
			 * Calculate Axis Information
			 * @param  {[type]} lpGate      [gate]
			 * @param  {[type]} nScrSize    [screen size]
			 * @param  {[type]} xScrollInfo [scroll Information]
			 * @param  {[type]} nDataSize   [data size]
			 * @param  {[type]} nOffSize    [offset seize]
			 * @return {[type]}             [number]
			 */
			this.CalcAxisInfoByScrollInfo = function(lpGate, nScrSize, xScrollInfo, nDataSize, nOffSize) {
				return(0);
			};
			// [end] #1653

			this.didDestroyRest = function() {

			};

			/**
			 * call when you delete this object
			 */
			this.didDestroy = function() {
				_self.m_arrDOIdx = [];

				_self.didDestroyRest();
			};
		};

		//
		// AxisX
		//

		var _AxisUnitX = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _AxisUnit();
			_AxisUnit.apply(this, arguments);

			this.m_nGap			= 0;	// Gap Size in pixel
			this.m_nSize		= 0;	// bar size in pixel
			this.m_nDOff		= 0;
			this.m_nBar			= 0;	// offset per data

			this.m_nCalcSize	= 0;	//

			// #1653
			this.CalculateScrollInfo = function(xScrollInfo, xEnv, nDelta, barSizeLimit) {
				try {
					if(!xScrollInfo) {
						return;
					}

					// #2038
					var levelList = xScrollInfo.levelList;
					if(levelList && levelList.length && levelList.length > 0) {
						var nCount = levelList.length;
						var level  = xScrollInfo.level || 0;
						if(nDelta > 0) {
							level++;
						}
						else if(nDelta < 0) {
							level--;
						}

						level = Math.max(0, Math.min(level, nCount - 1));

						var levelInfo = levelList[level];

						// #1653
						var barGap  = levelInfo.gap;
						var barSize = Math.round((levelInfo.bar - 1) / 2);

						xScrollInfo.barSize = barSize;
						xScrollInfo.barGap  = barGap;
						xScrollInfo.level   = level;

						return;
					}
					//

					// #1653
					var barGap  = xScrollInfo.barGap;
					var barSize = xScrollInfo.barSize + nDelta;

					if(barSize < 0) {
						barSize = 0;
					}
					else if(barSize > barSizeLimit){
						barSize = parseInt(barSizeLimit);
					}

					if(barSize > 7) {
						barGap = 3;
					}
					else if(barSize > 5) {
						barGap = 2;
					}
					else if(barSize > 0) {
						barGap = 1;
					}
					else {
						barGap = 0;
					}

					xScrollInfo.barSize = barSize;
					xScrollInfo.barGap  = barGap;
				}
				catch(e) {
					console.error(e);
				}
			};

			/**
			    Get Convert Data ( position -> index )
			    @param[in]     lpGate		gate
				@param[in]     nSIdx		start index
				@param[in]     nSPos		start position
				@param[in]     nCPos		current position
				@param[out]    nRIdx		out data
				@param[in]     bLimit		use limit
				@param[in]     nLimit		limit
			    @return        BOOL
			*/
			this.GetPos2Index = function(lpGate, nSIdx, nSPos, nCPos, bLimit, nLimit, extraOuput) {
				var	nLeft	= 0 ,
					nRight	= 0 ;
				var nLLimit	= 0 ,
					nRLimit	= 0 ;

				var	nDiffPos= nCPos - ( nSPos + _self.GetDiffSize ( lpGate , 0 ) );
				var	nMoveIdx= _self.GetMovePx2Idx ( lpGate , nDiffPos , false ) ;
				if( nMoveIdx <= (-1 * xUtils.constants.default.DEFAULT_WRONG_VALUE) ) {
					return(false);
				}

				var	nIdx	= 0 ;
				var	nCheck	= 0 ;

				var xLRInfo  = {};
				if( bLimit ) {
					nIdx		= nSIdx + nMoveIdx ;
					nCheck		= _self.GetIndex2Pixel ( lpGate , nSIdx , nSPos , nIdx , xLRInfo ) ;

					nLLimit		= nCheck - nLimit ;
					nRLimit		= nCheck + nLimit ;

					if( nLLimit <= nCPos && nCPos <= nRLimit ) {
						if(typeof extraOuput === "object") {
							extraOuput.nRIdx = nIdx ;
						}

						return(true);
					}
					return(false);
				}
				else {
					nIdx	= nSIdx + nMoveIdx ;
					if(typeof extraOuput === "object") {
						extraOuput.nRIdx = nIdx ;
					}

					return(true);
				}
			};

			/**
			    Get Convert Data ( moving pixel -> index offset )
			    @param[in]     lpGate		gate
				@param[in]     nPxData		pixel
				@param[in]     bMove		flag
			    @return        int
			*/
			this.GetMovePx2Idx = function(lpGate, nPxData, bMove) {
				if( _self.m_nDOff == 0 )
					return 0 ;

				return parseInt( ( nPxData /** 2.1*/ ) /  _self.m_nDOff ) ;
			};


			/**
			    Get Convert Data ( offset -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     nOffset		offset
			    @return        int
			*/
			this.GetOffset2Pixel = function(lpGate, nOffset) {
				return parseInt( _self.m_nDOff * nOffset ) ;
			};

			/**
			    Get Convert Data ( index -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     nScrSIdx		screen start index
				@param[in]     nScrSPos		screen start position( pixel )
				@param[in]     nDIdx		current data index
				@param[out]    extraOuput	left bar position and right bar position
			    @return        int
			*/
			this.GetIndex2Pixel	= function(lpGate, nScrSIdx, nScrSPos, nScrCIdx, extraOuput) {
				var nDiff	= nScrCIdx - nScrSIdx ;
				var	nCLCnt	= 0 ;
				var	nRet	= 0 ;
				var	nPDiff	= 0 ;
				nCLCnt		= nDiff + 1 ;
				nPDiff		= ( nDiff + 1 ) * _self.m_nGap + ( 2 * nDiff + 1 ) * _self.m_nSize + nCLCnt ;

				nRet		= nScrSPos + nPDiff ;

				var nLeft	= 0;
				var nRight	= 0;
				if( _self.m_nSize <= 0 ) {
					nLeft		=
					nRight		= nRet ;
				}
				else {
					nLeft		= nRet - _self.m_nSize ;
					nRight		= nRet + _self.m_nSize + 1 ;
				}

				if(extraOuput !== undefined && extraOuput != null) {
					extraOuput.nLeft		= nLeft;
					extraOuput.nRight		= nRight;
					extraOuput.pos			= nLeft;
					extraOuput.width		= nRight - nLeft - 1;
					if(extraOuput.width < 0) {
						extraOuput.width = 0;
					}
					extraOuput.center		= nRet;
				}

				return nRet	;
			};

			/**
			    Calculate Axis Information
			    @param[in]     lpGate		gate
				@param[in]     nScrSize		screen size( pixel )
				@param[in]     nBarSize		bar size( pixel )
				@param[in]     nGap			gap( pixel )
				@param[in]     nDataSize	drawing data size
			    @return        int ( Drawing data size )
			*/
			this.CalcAxisInfo = function(lpGate, nScrSize, nBarSize, nGap, nDataSize) {
				var	nDSize	= 0 ;

				_self.m_nDOff	= ( nBarSize * 2 + 1 ) + nGap ;

				// left & right 1 pixel minus...
				if( _self.m_nDOff != 0 ) {
					nDSize	= parseInt(( nScrSize - nGap ) / _self.m_nDOff);
				}

				_self.m_nGap	= nGap ;
				_self.m_nSize	= nBarSize ;

				if( nDSize < 0 )
					nDSize	= 0 ;

				_self.m_nCalcSize	= nDataSize	;

				return nDSize	;
			};

			/**
			    Calculate Axis Information
			    @param[in]     lpGate		gate
				@param[in]     nScrSize		screen size
				@param[in]     nBarSize		bar size
				@param[in]     nGap			gap
				@param[in]     nDataSize	drawing data size
			    @return        int ( Drawing data size )
			*/
			this.CalcAxisInfoEx = function(lpGate, nScrSize, nBarSize, nGap, nDataSize, nOffSize) {
				if( nDataSize <= 0 ) {
					_self.m_bRevMM	= true;
				}
				else {
					_self.m_bRevMM	= false;
				}

				var nData = nDataSize + nOffSize + lpGate.GetSBDiff();

				return(_self.CalcAxisInfo(lpGate, nScrSize, nBarSize, nGap, nData));
			};

			// #1653
			/**
			 * Calculate Axis Information
			 * @param  {[type]} lpGate      [gate]
			 * @param  {[type]} nScrSize    [screen size]
			 * @param  {[type]} xScrollInfo [scroll Information]
			 * @param  {[type]} nDataSize   [data size]
			 * @param  {[type]} nOffSize    [offset seize]
			 * @return {[type]}             [number]
			 */
			this.CalcAxisInfoByScrollInfo = function(lpGate, nScrSize, xScrollInfo, nDataSize, nOffSize) {
				var result = 0;
				try {
					result = _self.CalcAxisInfoEx(lpGate, nScrSize, xScrollInfo.barSize, xScrollInfo.barGap, nDataSize, nOffSize);
					xScrollInfo.screenSize = result;
				}
				catch(e) {
					console.error(e);
				}

				return(result);
			};
			// [end] #1653
		};

		var _AxisUnitXv1 = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _AxisUnit();
			_AxisUnit.apply(this, arguments);

			this.m_nGap			= 0;	// Gap Size in pixel
			this.m_nSize		= 0;	// bar size in pixel

			this.m_nBar			= 0;	// offset per data

			this.m_nCalcSize	= 0;	//

			// #1653
			this.CalculateScrollInfo = function(xScrollInfo, xEnv, nDelta, barSizeLimit) {
				try {
					if(!xScrollInfo) {
						return;
					}

					var iInc = 1;
					var __nCurPos = xScrollInfo.pos;
					var __nCurSize = xScrollInfo.screenSize;

					iInc = xUtils.scroll.getZoomFactorBy(__nCurSize);

					var iLeft = 0, iRight = 0;

					var __nNewPos = 0;
					var __nNewSize = 0;
					var __nFactor = nDelta * iInc;
					if(nDelta > 0) { // Big
						__nCurSize = __nCurSize - __nFactor;
						if(__nCurSize < xEnv.System.Scroll.screenSize.min) {
							__nCurSize = xEnv.System.Scroll.screenSize.min;
						}
					}
					else { // Small
						__nCurSize = __nCurSize - __nFactor;

						// #1294
						if(xEnv.System.Scroll.screenSize.max !== undefined && xEnv.System.Scroll.screenSize.max != null) {
							if(__nCurSize > xEnv.System.Scroll.screenSize.max) {
								__nCurSize = xEnv.System.Scroll.screenSize.max;
							}
						}
						//

						//
						var __nTemp = __nCurSize + __nCurPos;
						var __nDiff = __nTemp - xScrollInfo.range.length;

						if(__nDiff > 0) {
							var __nTempPos = __nCurPos - __nDiff;
							if(__nTempPos < 0) {
								// __nCurSize = __nCurSize + __nTempPos;
								__nTempPos = 0;
							}

							__nCurPos = __nTempPos;
						}
					}

					xScrollInfo.pos 		= __nCurPos;
					xScrollInfo.screenSize	= __nCurSize;

					// 画面サイズが既存スクロールサイズを超えた場合、スクロールサイズを変更する。
					// また、位置を０にする。
					if(xScrollInfo.range.length < xScrollInfo.screenSize) {
		        		// if range is smaller than screen size, set range to screen size and set position to zero.
		        		xScrollInfo.range.length = xScrollInfo.screenSize;
		        		xScrollInfo.pos = 0;
		        	}
				}
				catch(e) {
					console.error(e);
				}
			};

			/**
			    Get Convert Data ( position -> index )
			    @param[in]     lpGate		gate
				@param[in]     nSIdx		start index
				@param[in]     nSPos		start position
				@param[in]     nCPos		current position
				@param[out]    nRIdx		out data
				@param[in]     bLimit		use limit
				@param[in]     nLimit		limit
			    @return        BOOL
			*/
			this.GetPos2Index = function(lpGate, nSIdx, nSPos, nCPos, bLimit, nLimit, extraOuput) {
				var xLRInfo = {
					nLeft	: 0 ,
					nRight	: 0
				} ;
				var nLLimit	= 0 ,
					nRLimit	= 0 ;
				var	nDiff	= nCPos - nSPos ;
				var	nMove	= _self.GetMovePx2Idx ( lpGate , nDiff , false ) ;
				if( nMove <= (-1 * xUtils.constants.default.DEFAULT_WRONG_VALUE) )
					return(false);

				var	nIdx	= 0 ;
				var	nCheck	= 0 ;
				if( bLimit ) {
					nIdx		= nSIdx + nMove ;
					nCheck		= _self.GetIndex2Pixel ( lpGate , nSIdx , nSPos , nIdx , xLRInfo ) ;

					nLLimit		= nCheck - nLimit ;
					nRLimit		= nCheck + nLimit ;

					if( nLLimit <= nCPos && nCPos <= nRLimit ) {
						if(typeof extraOuput === "object") {
							extraOuput.nRIdx = nIdx ;
						}

						return(true);
					}

					return(false);
				}
				else {
					nIdx		= nSIdx + nMove ;

					if(typeof extraOuput === "object") {
						extraOuput.nRIdx = nIdx ;
					}

					return(true);
				}
			};

			/**
			    Get Convert Data ( moving pixel -> index offset )
			    @param[in]     lpGate		gate
				@param[in]     nPxData		pixel
				@param[in]     bMove		flag
			    @return        int
			*/
			this.GetMovePx2Idx = function(lpGate, nPxData, bMove) {
				if( _self.m_dRatioD == 0 )
					return 0 ;

				return parseInt( ( nPxData /** 2.1*/ ) /  _self.m_dRatioD ) ;
			};


			/**
			    Get Convert Data ( offset -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     nOffset		offset
			    @return        int
			*/
			this.GetOffset2Pixel = function(lpGate, nOffset) {
				return parseInt( _self.m_dRatioD * nOffset ) ;
			};

			/**
			    Get Convert Data ( index -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     nScrSIdx		screen start index
				@param[in]     nScrSPos		screen start position( pixel )
				@param[in]     nDIdx		current data index
				@param[out]    extraOuput	left bar position and right bar position
			    @return        int
			*/
			this.GetIndex2Pixel	= function(lpGate, nScrSIdx, nScrSPos, nScrCIdx, extraOuput) {
				var nScrCPos = nScrSPos + Math.round( ( nScrCIdx - nScrSIdx ) * _self.m_dRatioD ) + _self.m_nGap;

				//nCenter	= extraOuput.nLeft + Math.round( ( _self.m_nBar + 1 ) / 2 ) + ( ( _self.m_nBar % 2 ) ? - 1 : 0 );
				var nCenter	= Math.round(nScrCPos + _self.m_dRatioD / 2);

				var xBarInfo= xUtils.axis.didGetAdjustedBarInfo(_self.m_dRatioD, nCenter);

				if(extraOuput !== undefined && extraOuput != null) {
					extraOuput.nLeft		= xBarInfo.pos;
					extraOuput.nRight		= xBarInfo.pos + xBarInfo.width; // #2568
					extraOuput.pos			= xBarInfo.pos;
					extraOuput.width		= xBarInfo.width;
					extraOuput.center		= nCenter;
				}


				return( nCenter	);
			};

			/**
			    Calculate Axis Information
			    @param[in]     lpGate		gate
				@param[in]     nScrSize		screen size( pixel )
				@param[in]     nBarSize		bar size( pixel )
				@param[in]     nGap			gap( pixel )
				@param[in]     nDataSize	drawing data size
			    @return        int ( Drawing data size )
			*/
			this.CalcAxisInfo = function(lpGate, nScrSize, nBarSize, nGap, nDataSize) {
				var		nDSize			= 0 ;
				var		nZoom			= 1;
				var		nGD				= 2;	// gap denominator
				var		nGM				= nGap;	// gap max
				var		nGFac1			= 0;
				var		nGFac2			= 0;
				var		dOffset			= 0;
				nZoom = lpGate.ExGetZoomInfo();

				if( nZoom < 1 )
					return( nDSize );

				// 1. Get Data's Offset
				dOffset = ( ( nScrSize + nGap ) ) / nZoom;
				nGFac1	= parseInt( dOffset / nGD );
				nGFac2	= Math.min( nGM, nGFac1 );

				if( dOffset <= 1 ) {
					_self.m_nBar = 1;
				}
				else {
					_self.m_nBar	= parseInt( dOffset ) - nGFac2;
				}

				if( _self.m_nBar % 2 == 0 && nGFac2 >= 1 ) {
					_self.m_nBar = _self.m_nBar + 1;
				}

				while( _self.m_nBar < nGFac2 ) {
					_self.m_nBar++;
				}

				_self.m_dRatioD	= dOffset;
				_self.m_nGap	= nGap ;
				_self.m_nSize	= nBarSize ;

				if( nDSize < 0 ) {
					nDSize	= 0 ;
				}

				_self.m_nCalcSize	= nDataSize	;

				return( nZoom )	;
			};

			/**
			    Calculate Axis Information
			    @param[in]     lpGate		gate
				@param[in]     nScrSize		screen size
				@param[in]     nBarSize		bar size
				@param[in]     nGap			gap
				@param[in]     nDataSize	drawing data size
			    @return        int ( Drawing data size )
			*/
			this.CalcAxisInfoEx = function(lpGate, nScrSize, nBarSize, nGap, nDataSize, nOffSize) {
				if( nDataSize <= 0 ) {
					_self.m_bRevMM	= true;
				}
				else {
					_self.m_bRevMM	= false;
				}

				// 左右シフトのことを計算する。
				var nData = nDataSize + nOffSize + lpGate.GetSBDiff();

				return(_self.CalcAxisInfo(lpGate, nScrSize, nBarSize, nGap, nData));
			};

			// #1653
			/**
			 * Calculate Axis Information
			 * @param  {[type]} lpGate      [gate]
			 * @param  {[type]} nScrSize    [screen size]
			 * @param  {[type]} xScrollInfo [scroll Information]
			 * @param  {[type]} nDataSize   [data size]
			 * @param  {[type]} nOffSize    [offset seize]
			 * @return {[type]}             [number]
			 */
			this.CalcAxisInfoByScrollInfo = function(lpGate, nScrSize, xScrollInfo, nDataSize, nOffSize) {
				var result = 0;
				try {
					result = _self.CalcAxisInfoEx(lpGate, nScrSize, xScrollInfo.screenSize, xScrollInfo.barGap, nDataSize, nOffSize);
					xScrollInfo.screenSize = result;
				}
				catch(e) {
					console.error(e);
				}

				return(result);
			};
			// [end] #1653
		};

		var _AxisUnitXFull = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _AxisUnitX();
			_AxisUnitX.apply(this, arguments);

			this.m_nDiffSize = 10;

			/**
			    Get Convert Data ( moving pixel -> index offset )
			    @param[in]     lpGate		gate
				@param[in]     nPxData		pixel
				@param[in]     bMove		flag
			    @return        int
			*/
			this.GetMovePx2Idx = function(lpGate, nPxData, bMove) {
				if( _self.m_dRatioD == 0 )
					return 0 ;

				return parseInt( ( nPxData /** 2.1*/ ) /  _self.m_dRatioD ) ;
			};

			/**
			    Get Convert Data ( offset -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     nOffset		offset
			    @return        int
			*/
			this.GetOffset2Pixel = function(lpGate, nOffset) {
				return parseInt( _self.m_dRatioD * nOffset ) ;
			};

			/**
			    Get Convert Data ( index -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     nScrSIdx		screen start index
				@param[in]     nScrSPos		screen start position( pixel )
				@param[in]     nDIdx		current data index
				@param[out]    extraOuput	left bar position and right bar position
			    @return        int
			*/
			this.GetIndex2Pixel	= function(lpGate, nScrSIdx, nScrSPos, nScrCIdx, extraOuput) {
				var	nWDiff	 = _self.GetDiffSize ( lpGate , 0 ) ;
				var nScrCPos = nScrSPos + nWDiff + Math.round( (2 * ( nScrCIdx - nScrSIdx ) + 1) * _self.m_dRatioD );

				//nCenter	= extraOuput.nLeft + Math.round( ( _self.m_nBar + 1 ) / 2 ) + ( ( _self.m_nBar % 2 ) ? - 1 : 0 );
				var nCenter	= Math.round(nScrCPos + _self.m_dRatioD / 2);

				var xBarInfo= xUtils.axis.didGetAdjustedBarInfo(_self.m_dRatioD, nCenter);

				if(extraOuput !== undefined && extraOuput != null) {
					extraOuput.nLeft		= xBarInfo.pos;
					extraOuput.nRight		= xBarInfo.pos + xBarInfo.width; // #2568
					extraOuput.pos			= xBarInfo.pos;
					extraOuput.width		= xBarInfo.width;
					extraOuput.center		= nCenter;
				}


				return( nCenter	);
			};

			this.GetDiffSize = function(lpGate, nSize) {
				return(_self.m_nDiffSize);
			};

			this.CalcDrawInfo = function(argBaseCoordinate, argEnv) {
				if(argBaseCoordinate === undefined || argBaseCoordinate == null) {
					return;
				}

				_self.m_dLogRevision = 0;

				var	nRSize 		= Math.max(0, argBaseCoordinate.width - _self.GetDiffSize());
				xUtils.scale.didCalcScaleUnit(_self.m_stScaleInfo);

				var xMM = _self.m_stScaleInfo.minMaxScreen;

				var dMax = xMM.maxValue;
				var dMin = xMM.minValue;

				if( dMax < dMin ) {
					_self.m_bRevMM	= true;

					dMax	=
					dMin	= 0;
				}
				else {
					_self.m_bRevMM	= false;
				}

				var dDiff		= xUtils.scale.didCalcDiff(dMax, dMin);

				if( dDiff == 0 ) {
					xMM.ratio	= 0 ;
				}
				else {
					xMM.ratio		= nRSize / dDiff ;
				}

				_self.m_dMaxD	= dMax	;
				_self.m_dMinD	= dMin	;
				_self.m_dRatioD	= xMM.ratio ;

				return(true);
			};

			/**
			    Calculate Axis Information
			    @param[in]     lpGate		gate
				@param[in]     nScrSize		screen size( pixel )
				@param[in]     nBarSize		bar size( pixel )
				@param[in]     nGap			gap( pixel )
				@param[in]     nDataSize	drawing data size
			    @return        int ( Drawing data size )
			*/
			this.CalcAxisInfo = function(lpGate, nScrSize, nBarSize, nGap, nDataSize) {
				_self.CalcDrawInfo(lpGate, nScrSize);

				var	nLGap		= nGap ;

				_self.m_nDOff	= parseInt ( m_dRatioD ) ;
				_self.m_nGap	= nGap ;

				var	nBSize	= ( m_nDOff - 1 - m_nGap ) / 2 ;

				while ( _self.m_nGap > 0 && nBSize < 1 ) {
					_self.m_nGap-- ;
					nBSize	= ( _self.m_nDOff - 1 - _self.m_nGap ) / 2 ;
				}

				_self.m_nSize		= nBSize	;

				_self.m_nCalcSize	= nDataSize	;

				return _self.m_nCalcSize ;
			};

			/**
			    Get Convert Data ( pixel -> data )
			    @param[in]     lpGate		gate
				@param[in]     nPixel		pixel
				@param[in]     bOrigin		flag
			    @return        double
			*/
			this.GetPixel2Data = function(lpGate, nPixel, bOrgin) {
				if( _self.m_dRatioD === 0 )
					return 0 ;

				var dDiff = 0 ;

				if( bOrigin )
					dDiff	= ( nPixel - m_nDiffSize ) ;
				else
					dDiff	= ( nPixel ) ;

				return dDiff / _self.m_dRatioD ;
			}

			/**
			    Get Convert Data ( data -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     dData		data
			    @return        int
			*/
			this.GetData2Pixel = function(lpGate, nBase, dBase, dData, nSize) {
				var nDDiff	= ( parseInt( ( dData - dBase ) * _self.m_dRatioD ) ) ;

				var	nRBase	= nBase - _self.GetDiffSize ( lpGate , nSize ) ;

				return ( nRBase - nDDiff ) ;
			}


			/**
			    Get Convert Data ( offset -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     nOffset		offset
			    @return        int
			*/
			this.GetOffset2Pixel = function(lpGate, nOffset) {
				return(0);
			};
		};

		var _AxisUnitXNum = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _AxisUnitX();
			_AxisUnitX.apply(this, arguments);
		};

		var _AxisUnitXNT = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _AxisUnitXNum();
			_AxisUnitXNum.apply(this, arguments);
		};

		var _AxisUnitXKagi = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _AxisUnitXNT();
			_AxisUnitXNT.apply(this, arguments);
		};

		var _AxisUnitXRenko = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _AxisUnitXNT();
			_AxisUnitXNT.apply(this, arguments);
		};

		var _AxisUnitXPnF = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _AxisUnitXNT();
			_AxisUnitXNT.apply(this, arguments);
		};

		var _AxisUnitXVolume = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _AxisUnitX();
			_AxisUnitX.apply(this, arguments);

			this.m_arrVI = [];
			this.m_stOutArea = xUtils.didClone(xUtils.struct.ST_VALUE_INFO);

			// #1653
			this.CalculateScrollInfo = function(xScrollInfo, xEnv, nDelta, barSizeLimit) {
				try {
					if(!xScrollInfo) {
						return;
					}

					var iInc = 1;
					var __nCurPos = xScrollInfo.pos;
					var __nCurSize = xScrollInfo.screenSize;

					iInc = xUtils.scroll.getZoomFactorBy(__nCurSize);

					var iLeft = 0, iRight = 0;

					var __nNewPos = 0;
					var __nNewSize = 0;
					var __nFactor = nDelta * iInc;
					if(nDelta > 0) { // Big
						__nCurSize = __nCurSize - __nFactor;
						if(__nCurSize < xEnv.System.Scroll.screenSize.min) {
							__nCurSize = xEnv.System.Scroll.screenSize.min;
						}
					}
					else { // Small
						__nCurSize = __nCurSize - __nFactor;

						// #1294
						if(xEnv.System.Scroll.screenSize.max !== undefined && xEnv.System.Scroll.screenSize.max != null) {
							if(__nCurSize > xEnv.System.Scroll.screenSize.max) {
								__nCurSize = xEnv.System.Scroll.screenSize.max;
							}
						}
						//

						//
						var __nTemp = __nCurSize + __nCurPos;
						var __nDiff = __nTemp - xScrollInfo.range.length;

						if(__nDiff > 0) {
							var __nTempPos = __nCurPos - __nDiff;
							if(__nTempPos < 0) {
								// __nCurSize = __nCurSize + __nTempPos;
								__nTempPos = 0;
							}

							__nCurPos = __nTempPos;
						}
					}

					xScrollInfo.pos 		= __nCurPos;
					xScrollInfo.screenSize	= __nCurSize;

					// 画面サイズが既存スクロールサイズを超えた場合、スクロールサイズを変更する。
					// また、位置を０にする。
					if(xScrollInfo.range.length < xScrollInfo.screenSize) {
		        		// if range is smaller than screen size, set range to screen size and set position to zero.
		        		xScrollInfo.range.length = xScrollInfo.screenSize;
		        		xScrollInfo.pos = 0;
		        	}
				}
				catch(e) {
					console.error(e);
				}
			};

			/**
			 * Calculate Axis Information for Volume
			 * @param  {[type]} lpGate		gate
			 * @param  {[type]} nScrSize	screen size
			 * @param  {[type]} nOMinus		offset minus
			 * @param  {[type]} nGap		gap
			 * @param  {[type]} nDataSize	drawing data size
			 * @param  {[type]} dVolume		volume data(in screen)
			 * @param  {[type]} dVolFull	volume data full
			 * @param  {[type]} nStart		start index
			 * @param  {[type]} nSize		data size
			 * @return {[type]}
			 */
			this.CalcAxisInfoVol = function(lpGate, nScrSize, nOMinus, nGap, nDataSize, dVolume, dVolFull, nStart, nSize) {
				_self.m_nCalcSize			= nDataSize ;
			    //=========================================================================
			    // BASE INFO
			    //=========================================================================
				_self.m_arrVI		= [];

				// Gap information
				_self.m_nGap		= nGap ;

				// 環境
				var xEnv			= lpGate.didGetEnvInfo();
				// 価格データ
				var arrPriceDatas	= lpGate.didGetPriceDatas();

				// 価格データ数
				var	nDOCnt			= xUtils.constants.ngc.macro.__GETSIZE_INT(arrPriceDatas);

				var	nf_cnt			= 0 ;

				// 左右余白を適用
				// Minus X-Diff. Size * 2
				var	nRSize			= nScrSize - 2 * _self.GetDiffSize(lpGate, nSize);

				// #2568
                if(nSize > 0) {
                    nRSize = nRSize - (nSize - 1) * nGap;
                }
                //

				// Calc. Volume
				var	dRVol			= dVolume ;
				// Average Volume
				var	dVolAvg			= nDOCnt < 1 ? 0 : dVolFull / nDOCnt ;

				// Exception case
				var	nDataIdx		= 0 ;		// Data Index
				var	nScrPos			= nStart ;	// Screen Index

				// 仮想のデータ
				// 全体の平均データの半分
				var nDummyVolData	= 0;

				var	nPrePos			= 0 ;

				var nExtraGap		= 0;
				// convert Screen -> Data
				// Screen Index, Offset Minus, Object Offset, Screen -> Data ( FALSE )
				nDataIdx			= xUtils.EC_GetDataZScr(nScrPos, nOMinus, 0, false) ;

				//
				// データのサイズがおかしい場合の処理
				//
				if( nDOCnt < 1 || nDataIdx + nSize <= 0 || nDataIdx >= nDOCnt || nSize <= 0 || dVolume <= 0 ) {
					_self.m_dRatioD			= nRSize / dVolFull ;
					nDummyVolData			= parseInt ( dVolAvg * _self.m_dRatioD );
					_self.m_stOutArea.nNo	= 0 ;
					_self.m_stOutArea.nData	= nDummyVolData ;

					nPrePos				= 0 ;
					for ( nf_cnt = 0 ; nf_cnt < nSize ; nf_cnt++ ) {
						var stNew 		= xUtils.didClone(xUtils.struct.ST_VALUE_INFO);
						stNew.nNo		= nGap + nDummyVolData + nExtraGap + nPrePos ;
						stNew.nData		= nDummyVolData ;

						nPrePos			= stNew.nNo + stNew.nData ;

						_self.m_arrVI.push ( stNew ) ;
					}

					_self.m_nDOff				= 0 ;
					return 0 ;
				}

				var		nSIdx		= ( nDataIdx < 0 ) ? 0 : nDataIdx ;
				var		nRest		= nDOCnt - ( nDataIdx + nSize ) ;	//
				var		nLoop		= 0 ;								// ｽﾇﾁｦ Dataﾀﾇ ｷ酩ﾁ ﾄｫｿ鏆ｮ [ KOREAN ]

				// 右側の余白区間がある場合の準備
				if( nRest < 0 ) {
					if( nDataIdx < 0 ) {
						nLoop	= nDOCnt ;
						dRVol		+= ( -1 * ( nRest + nDataIdx ) ) * dVolAvg ;
					}
					else {
						nLoop	= nDOCnt - nDataIdx ;
						dRVol	+= ( -1 * nRest ) * dVolAvg ;
					}
				}
				else {
					if( nDataIdx < 0 ) {
						nLoop	= nDataIdx + nSize ;
						dRVol	+= ( -1 * nDataIdx ) * dVolAvg ;
					}
					else {
						nLoop		= nSize ;
					}
				}

				// 画面幅 / 出来高
				_self.m_dRatioD			= nRSize / dRVol ;	// Screen / volume
				nDummyVolData			= parseInt ( dVolAvg * _self.m_dRatioD );
				_self.m_stOutArea.nData	= nDummyVolData;	// bar span size

				nPrePos				= 0 ;

				var didProcForDummy = function(argPrePos, argGap, argVolData, argLoop, arrVI) {
					for(var __ii = 0 ; __ii < argLoop ; __ii++ ) {
						var stNew 		= xUtils.didClone(xUtils.struct.ST_VALUE_INFO);
						stNew.nNo		= argGap + nExtraGap + argPrePos ;
						stNew.nData		= argVolData ;

						argPrePos		= stNew.nNo + stNew.nData ;

						arrVI.push ( stNew ) ;
					}

					return(argPrePos);
				};

			    //=========================================================================
			    // 表示できない区間のデータの場合の処理
			    //=========================================================================
				if( nDataIdx < 0 ) {
					var nRLoop	= -1 * nDataIdx ;
					nPrePos = didProcForDummy(nPrePos, nGap, nDummyVolData, nRLoop, _self.m_arrVI);
				}

			    //=========================================================================
			    // 正常区間の処理
			    //=========================================================================
				for ( nf_cnt = 0 ; nf_cnt < nLoop ; nf_cnt++ ) {
					var stRef		= arrPriceDatas [ nSIdx + nf_cnt ] ;
					var stNew 		= xUtils.didClone(xUtils.struct.ST_VALUE_INFO);
					var dVolume		= xUtils.didGetPriceValue(stRef, xUtils.constants.keywords.price.volume);
					stNew.nNo		= nGap + nPrePos + nExtraGap ;
					stNew.nData		= Math.round ( dVolume * _self.m_dRatioD ) ; // #2568

					nPrePos			= stNew.nNo + stNew.nData ;

					_self.m_arrVI.push ( stNew ) ;
				}

			    //=========================================================================
			    // 右側の余白区間の処理
			    //=========================================================================
				if( nRest < 0 ) {
					var nRLoop	= -1 * nRest ;
					nPrePos = didProcForDummy(nPrePos, nGap, nDummyVolData, nRLoop, _self.m_arrVI);
				}

			    //=========================================================================
			    //
			    //=========================================================================
				_self.m_nDOff	= xUtils.constants.ngc.macro.__GETSIZE_INT ( _self.m_arrVI ) ;

				return(xUtils.constants.ngc.NGC_SUCCESS);
			};

			/**
			    Get Convert Data ( moving pixel -> index offset )
			    @param[in]     lpGate		gate
				@param[in]     nPxData		pixel
				@param[in]     bMove		flag
			    @return        int
			*/
			this.GetMovePx2Idx = function(lpGate, nPxData, bMove) {
				var			  xEnv	= lpGate.didGetEnvInfo();
				if( bMove === true ) {
					var	frameWidth = lpGate.GetChartFrameAreaWidth();
					var nBCnt	= lpGate.ExGetZoomInfo();

					var	dRatio	= nBCnt === 0 ? 0 : frameWidth / nBCnt ;

					if( dRatio <= 0 ) return 0 ;

					return parseInt ( nPxData / dRatio ) ;
				}
				else
				{
					var	nCnt	= xUtils.constants.ngc.macro.__GETSIZE_INT ( _self.m_arrVI ) ;
					if( nCnt < 1 ) return (-1 * xUtils.constants.default.DEFAULT_WRONG_VALUE) ;	//  CSW_MOD
					var	nWDiff	= _self.GetDiffSize ( lpGate , 0 ) ;		// x-diff

					var	pstVIS	= _self.m_arrVI [ 0 ] ;
					var	pstVIF	= _self.m_arrVI [ nCnt - 1 ] ;

			        //=======================================================================
			        // Left Area
			        //=======================================================================
					if( nPxData < nWDiff + pstVIS.nNo ) {
						var	nOutSize= _self.m_stOutArea.nData * 2 + _self.m_nGap ;
						var	dRatio	= ( Math.abs ( nPxData )  ) / nOutSize ;
						dRatio	+= 0.5 ;

						return (-1 * parseInt ( dRatio ) ) ;
					}
			        //=======================================================================
			        // Right Area
			        //=======================================================================
					else if( nPxData > nWDiff + pstVIF.nNo + pstVIF.nData + _self.m_nGap ) {
						var	nOutSize= _self.m_stOutArea.nData * 2 + _self.m_nGap ;
						var	dRatio	= ( Math.abs ( nPxData - ( nWDiff + pstVIF.nNo + pstVIF.nData + _self.m_nGap ) )  ) / nOutSize ;
						dRatio	+= 0.5 ;

						return ( nCnt + parseInt ( dRatio ) ) ;
					}
			        //=======================================================================
			        // Normal Area
			        //=======================================================================
					else {
						for ( var ii = 0 ; ii < nCnt ; ii++ ) {
							var stRef	= _self.m_arrVI [ ii ] ;
							if( nWDiff + stRef.nNo <= nPxData && nWDiff + stRef.nNo + stRef.nData + _self.m_nGap >= nPxData	) {
								return ii ;
							}
						}
					}

					return (-1 * xUtils.constants.default.DEFAULT_WRONG_VALUE) ;
				}
			};

			/**
			    Get Convert Data ( offset -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     nOffset		offset
			    @return        int
			*/
			this.GetOffset2Pixel = function(lpGate, nOffset) {
				if( _self.m_nDOff == 0 ) {
					return 0 ;
				}

				var		frameWidth	= lpGate.GetChartFrameAreaWidth();

				var		nWDiff	= _self.GetDiffSize ( lpGate , 0 ) ;		// x-diff
				var		dTemp	= nOffset * ( ( frameWidth - nWDiff ) / _self.m_nDOff );
				var		nRet	= Math.round(dTemp);
				return( nRet );
			};

			/**
			    Get Convert Data ( index -> pixel )
			    @param[in]     lpGate		gate
				@param[in]     nStart		start index
				@param[in]     nPos			start position
				@param[in]     nIdx			current index
				@param[out]    nLeft		left bar position
				@param[out]    nRight		right bar position
			    @return        int
			*/
			this.GetIndex2Pixel	= function(lpGate, nScrSIdx, nScrSPos, nScrCIdx, extraOuput) {
				var	nDCnt	= xUtils.constants.ngc.macro.__GETSIZE_INT ( _self.m_arrVI ) ;		// Total view count
				var	nDIdx	= nScrCIdx - nScrSIdx ;					// offset
				var	nWDiff	= _self.GetDiffSize ( lpGate , 0 ) ;		// x-diff
				var	nSign	= ( nDIdx < 0 ) ? -1 : 1 ;			// sign
				var	nRet	= nScrSPos ;							// return

				//=========================================================================
			    // CHECK : OUT OF SCREEN
			    //=========================================================================
				if( nDCnt < 1 || nDIdx < 0 || nDIdx >= nDCnt ) {
					if( nSign < 0 || nDCnt < 1 ) {
						nRet	= nScrSPos + nWDiff +
								  ( 2 * nDIdx + 1 ) * _self.m_stOutArea.nData + nSign +
								  nSign * ( nDIdx + 1 ) * _self.m_nGap ;
					}
					else {
						var stRef	= _self.m_arrVI [ nDCnt - 1 ] ;
						var nIDiff	= nDIdx - ( nDCnt - 1 ) ;
			            nRet	= nScrSPos + nWDiff + stRef.nNo + stRef.nData +
								  _self.m_nGap + nIDiff + ( 2 * nIDiff - 1 ) * _self.m_stOutArea.nData ;
					}

					if(extraOuput !== undefined && extraOuput != null) {
						if( _self.m_stOutArea.nData <= 0 ) {
							extraOuput.nLeft		=
							extraOuput.nRight		= nRet ;
						}
						else {
							extraOuput.nLeft		= nRet - _self.m_stOutArea.nData ;
							extraOuput.nRight		= nRet + _self.m_stOutArea.nData + 1 ;
						}
					}

					return nRet ;
				}

			    //=========================================================================
			    // OFFSET DATA
			    //=========================================================================
				var stRef	= _self.m_arrVI [ nDIdx ] ;
				// #1321
				//
				if(stRef) {
					nRet		= Math.round(nScrSPos + nWDiff + stRef.nNo + stRef.nData / 2) ;

					var xBarInfo= xUtils.axis.didGetAdjustedBarInfo(stRef.nData, nRet);

					if(extraOuput !== undefined && extraOuput != null) {
						extraOuput.nLeft		= xBarInfo.pos;
						extraOuput.nRight		= xBarInfo.pos + xBarInfo.width; // #2568
						extraOuput.pos			= xBarInfo.pos;
						extraOuput.width		= xBarInfo.width;
						extraOuput.center		= nRet;
					}
				}

			    return  nRet ;
			};
		};

		//
		// AxisY
		//

		var _AxisUnitY = function() {
			//
	        // private
	        //
	        var _self = this;

	        this.prototype = new _AxisUnit();
			_AxisUnit.apply(this, arguments);

			this.m_dMaxL		= -1;
			this.m_dMinL		= xUtils.constants.default.DEFAULT_WRONG_VALUE;
			this.m_dRatioL		= 0;

			this.m_dLogRevision	= 0;	// log revision factor

			this.m_bLog			= false;
			this.m_bReverse		= false;

			this.m_arrDrawObj	= [];

			this.didDestroyRest = function() {
				_self.m_arrDrawObj = [];
			};

			this.GetRawData = function(dData) {
				if(_self.m_bLog === true) {
					return Math.pow(xUtils.constants.ngc.define.NGC_DATA_LOG, dData) - _self.m_dLogRevision ;
				}
				else {
					return(dData);
				}
			};

			this.IsDrawObj = function(argDo) {
				if(argDo === undefined || argDo == null) {
					return(false);
				}

				var	nCnt = _self.m_arrDrawObj.length;
				for( var ii = 0 ; ii < nCnt ; ii++ ) {
					var xDoCmp	= _self.m_arrDrawObj [ ii ] ;
					if(xDoCmp === argDo) {
						return(true);
					}
				}

				return(false);
			};

			this.GetDO = function(argIdx) {
				var	nCnt = _self.m_arrDrawObj.length;
				if(nCnt < 1 || argIdx < 0 || argIdx >= nCnt) {
					return(null);
				}

				return(_self.m_arrDrawObj[argIdx]);
			};

			this.AddDO = function(argDo) {
				var bFind = _self.IsDrawObj ( argDo ) ;

			    //=========================================================================
			    // if be , no action
			    //=========================================================================
				if( bFind === true ) return ;

			    //=========================================================================
			    // Add Object
			    //=========================================================================
				_self.m_arrDrawObj.push ( argDo ) ;
			};

			this.CalcDrawInfo = function(argBaseCoordinate, argEnv) {
				if(argBaseCoordinate === undefined || argBaseCoordinate == null) {
					return;
				}

				_self.m_dLogRevision = 0;

				var	nRSize 		= Math.max(0, argBaseCoordinate.height);
				var dZoom       = _self.GetZoom( );
	    		var dMoveValue  = 0;

				xUtils.scale.didCalcScaleUnit(_self.m_stScaleInfo);

				var xMM = _self.m_stScaleInfo.minMaxScreen;

				var dMax = xMM.maxValue;
				var dMin = xMM.minValue;

				if( dMax < dMin ) {
					_self.m_bRevMM	= true;

					dMax	=
					dMin	= 0;
				}
				else {
					_self.m_bRevMM	= false;
				}

				var dMaxL = 0;
				var dMinL = 0;

				if( dMin <= 0 ) {
					_self.m_dLogRevision	= 1.0 - dMin ;
					dMaxL			= xUtils.math.log10( dMax + _self.m_dLogRevision ) ;
					dMinL			= xUtils.math.log10( 1.0 ) ;
				}
				else {
					dMaxL			= xUtils.math.log10 ( dMax ) ;		// log max
					dMinL			= xUtils.math.log10 ( dMin ) ;		// log min
				}

				var dDiff		= xUtils.scale.didCalcDiff(dMax, dMin);
				var dDiffL		= xUtils.scale.didCalcDiff(dMaxL, dMinL);

				// fix double type's bug
				/*
				if( dDiff	< 0.0000001 ) {
					dMax += 0.1;
					dMin -= 0.1;
					dDiff = dMax - dMin;
				}

				if( dDiffL	< 0.0000001 ) {
					dMaxL += 0.1;
					dMinL -= 0.1;
					dDiffL = dMaxL - dMinL;
				}
				*/

				if( dDiff	< 0 ) dDiff		= 0 ;
				if( dDiffL	< 0 ) dDiffL	= 0 ;

				if( dDiff == 0 ) {
					xMM.ratio	= 0 ;

					if( dMax > 0 ) {
						_self.m_dMaxD = dMax * 3.0 / 2.0 ;
						_self.m_dMinD = 0 ;
					}
					else if( dMax < 0 ) {
						_self.m_dMaxD = 0 ;
						_self.m_dMinD = dMax * 3.0 / 2.0 ;
					}
					else {
						_self.m_dMaxD = 100 ;
						_self.m_dMinD = 0 ;
					}

					_self.m_dRatioD = nRSize / xUtils.scale.didCalcDiff(_self.m_dMaxD,  _self.m_dMinD);
				}
				else {
					xMM.ratio		= nRSize / dDiff ;
					_self.m_dRatioD	= xMM.ratio ;

					_self.m_dMaxD	= dMax	;
					_self.m_dMinD	= dMin	;
				}

				//=======================================================================
			    // log
			    //=======================================================================
				if( dDiffL == 0 ) {
					if( dMaxL > 0 ) {
						_self.m_dMaxL	= dMaxL * 3.0 / 2.0 ;
						_self.m_dMinL	= 0 ;
					}
					else if( dMaxL < 0 ) {
						_self.m_dMaxL	= 0 ;
						_self.m_dMinL	= dMaxL * 3.0 / 2.0 ;
					}
					else {
						_self.m_dLogRevision	= 1.0 ;
						_self.m_dMaxL	= xUtils.math.log10 ( 100 + _self.m_dLogRevision ) ;
						_self.m_dMinL	= xUtils.math.log10 ( 1.0 ) ;
					}

					_self.m_dRatioL		= nRSize / xUtils.scale.didCalcDiff(_self.m_dMaxL,  _self.m_dMinL);
				}
				else {
					_self.m_dRatioL	= nRSize / ( dDiffL ) ;

					_self.m_dMaxL	= dMaxL ;
					_self.m_dMinL	= dMinL ;
				}

				return(true);
			};
		};

		exports.constants = {
			AXISY_NORMAL : 0,
			AXISX_NORMAL : 100,

		};

		exports.didCreateAxisUnit = function(argAxisType) {
			if(argAxisType === exports.constants.AXISY_NORMAL) {
				return(new _AxisUnitY());
			}

			return;
		};

		exports.SF_CreateAxisX = function(argAxisType) {
			switch (argAxisType) {
				case xUtils.constants.ngc.enum.ELS_NORMAL:
				case xUtils.constants.ngc.enum.ELS_COMPARE:
					return(new _AxisUnitXv1());
					break;
				case xUtils.constants.ngc.enum.ELS_VOLUME:
					return(new _AxisUnitXVolume());
					break;
				case xUtils.constants.ngc.enum.ELS_PNF:
					return(new _AxisUnitXPnF());
					break;
				case xUtils.constants.ngc.enum.ELS_RENKO:
					return(new _AxisUnitXRenko());
					break;
				case xUtils.constants.ngc.enum.ELS_KAGI:
					return(new _AxisUnitXKagi());
					break;
				default:
					break;
			}

			return;
		};

	    return(exports);
	};

	//console.debug("[MODUEL] Loading => chartAxisUnit");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartAxisUnit"] =
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
        define("ngc/chartAxisUnit",
            ['ngc/chartUtil'],
                function(xUtils) {
                    return loadModule(xUtils);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartAxisUnit"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartAxisUnit");
})(this);
