(function(global){
	"use strict";

	var loadModule = function(xUtils) {
		"use strict";

		var exports = function(pDelegate, thumbSizeMin, useOneOver) { // #2296
			var _self = this;

			this.m_pDelegate = pDelegate;

			this.m_bUseOneOver = useOneOver || false;

			this.m_bVert = false;
			this.m_rcArea = xUtils.shapes.didGetDefaultRect();
			this.m_dThumbRate = 0;
			this.m_lThumbSize = 0;
			this.m_nThumbPos = 0;

			this.m_bValid 		= false;
			this.m_bStepButton	= false;
			this.m_nShowsMin 	= 0;
			this.m_nShowsMax 	= 0;

			this.m_nPosPointed	= 0;
			this.m_nShowsPointed= 0;
			this.m_rectPointed	= xUtils.shapes.didGetDefaultRect();

			this.m_dDataPerSize	= 0;
			this.m_dPosRatio	= 0;
			this.m_sizExtra		= xUtils.shapes.didGetDefaultSize();
			this.m_nScrollSize	= 0;
			this.m_nShows		= 0;
			this.m_nContents	= 0;
			this.m_nFullSize	= 0;
			this.m_nStartPos	= 0;
			this.m_nEndPos		= 0;

			this.m_nShowFactor	= 0;

			this.m_pStepState	= null;
			this.m_bStepStateLt	= false;

			this.m_bEventLock	= false;

			this.m_nThumbSizeMin= thumbSizeMin || 20;

			// Thumb area information
			this.m_rectThumbC1	= xUtils.shapes.didGetDefaultRect();
			this.m_rectThumbCC	= xUtils.shapes.didGetDefaultRect();
			this.m_rectThumbC2	= xUtils.shapes.didGetDefaultRect();
			this.m_rectThumbS1	= xUtils.shapes.didGetDefaultRect();
			this.m_rectThumbS2	= xUtils.shapes.didGetDefaultRect();
			this.m_rectThumbB	= xUtils.shapes.didGetDefaultRect();
			this.m_rectThumbG	= xUtils.shapes.didGetDefaultRect();
			this.m_rectThumbT	= xUtils.shapes.didGetDefaultRect();

			this.m_rectThumb	= xUtils.shapes.didGetDefaultRect();
			this.m_rectStepLt	= xUtils.shapes.didGetDefaultRect();
			this.m_rectStepRb	= xUtils.shapes.didGetDefaultRect();


			var	UDZS_HALFBAR_SIZE				= 1;
			var	UDZS_BARSIZE					= (2 * UDZS_HALFBAR_SIZE + 1);
			var	UDZS_THUMBRATIO_FACTOR			= 0.5;

			var	UDZS_TIMERVAL_FOR_STEP			= 50;
			var	UDZS_TIMERVAL_FOR_STEPTRIGGER	= 300;
			var	UDZS_TIMERID_BEGIN				= 60000;
			var	UDZS_TIMERID_FOR_STEP			= (UDZS_TIMERID_BEGIN + 1);
			var	UDZS_TIMERID_FOR_STEPTRIGGER	= (UDZS_TIMERID_BEGIN + 2);

			var	UDZS_TIMERID_END				= 60099;
			var	UDZS_MINIMUM_THUMBSHOW			= 7;
			var	UDZS_MAXIMUM_THUMBSHOW			= 100;

			var	USE_GRAD_THUMB					= 1;

			var	ZSB_DRAW_COUNTER_MARK			= 1;
			var	ZSB_DRAW_SIZING_MARK			= 1;


			var _didInitVariables = function() {
				_self.m_bVert	= false;
				_self.m_rcArea	= xUtils.shapes.didGetDefaultRect();

				_self.m_pptPointed = null;

				_self.m_dThumbRate = 0.0;
				_self.m_lThumbSize = 0;

				_self.m_nShows = 0;
				_self.m_nContents = 0;
				_self.m_nFullSize = 0;
				_self.m_nScrollSize = 0;

				_self.m_nStartPos = 0;
				_self.m_nEndPos = 0;
				_self.m_nThumbPos = 0;

				_self.m_dPosRatio = 0;

				_self.m_sizExtr	= xUtils.shapes.didGetDefaultSize();
				_self.m_bValid = false;

				_self.m_pPtSizing1		= null;
				_self.m_pPtSizing2		= null;

				_self.m_nShowsPointed	= 0;

				_self.m_dDataPerSize	= 0;

				_self.m_nShowFactor		= 3;

				_self.m_rectStepRb	= xUtils.shapes.didGetDefaultRect();
				_self.m_rectStepLt	= xUtils.shapes.didGetDefaultRect();

				_self.m_bStepButton	= false;

				_self.m_pStepState	= null;
				_self.m_bStepStateLt= false;

				_self.m_bEventLock	= false;

				_self.m_nShowsMin	= 1;
			};

			var _didGetScrollBarSize = function() {
				if(_self.m_bUseOneOver) {
					return(_self.m_nFullSize);
				}

				return(_self.m_nFullSize - 1);
			};

			this.GetSBInfo = function() {
				var xSBInfo = {
					pos : _self.m_nThumbPos,
					range : {
						location : 0,
						length : _self.m_nFullSize
					},
					screenSize : _self.m_nShows,
					scrollRange: {
						location : 0,
						length : (_self.m_nFullSize - _self.m_nShows)
					}
				};

				return(xSBInfo);
			};

			this.GetSBRange = function() {
				return(_self.GetSBInfo().scrollRange);
			};

			this.StepScroll = function(nStep) {
				if(nStep == 0) {
					return(false);
				}

				if(nStep < 0) {
					_self.EStepButtonDown(true);
				}
				else {
					_self.EStepButtonDown(false);
				}

				return(true);
			};

			this.didInitScroll = function(pDelegate) {
				_didInitVariables(pDelegate);
			};

			this.SetContentsSize = function(nShows, nContents, nShowsMin, nShowsMax) {
				_self.m_nShows		= Math.max(0, nShows);
				_self.m_nContents	= Math.max(0, nContents);
				if(nShowsMin !== undefined && nShowsMin) {
					_self.m_nShowsMin = Math.max(1, nShowsMin);
				}

				// #1824
				if(nShowsMax !== undefined && nShowsMax != null && nShowsMax < nShowsMin) {
					nShowsMax = null;
				}

				_self.m_nShowsMax = nShowsMax;
				//

				return(_self.Calculate(true, true));
			};

			this.SetArea = function(rcArea) {
				_self.m_rcArea = xUtils.didClone(rcArea);

				if(_self.m_bStepButton) {
					var	nSize = 0;

					if(_self.m_bVert) {
						nSize						= _self.m_rcArea.width;

						_self.m_rectStepLt.x		= _self.m_rcArea.x;
						_self.m_rectStepLt.y		= _self.m_rcArea.y;

						m_rectStepRb.x				= _self.m_rcArea.x;
						m_rectStepRb.y				= _self.m_rcArea.y + _self.m_rcArea.height - nSize;

						m_rectStepLt.width			= nSize;
						m_rectStepLt.Height			= nSize;

						m_rectStepRb.width			= nSize;
						m_rectStepRb.Height			= nSize;
					}
					else {
						nSize	= m_rcArea.height

						_self.m_rectStepLt.x		= _self.m_rcArea.x;
						_self.m_rectStepLt.y		= _self.m_rcArea.y;

						_self.m_rectStepRb.x		= _self.m_rcArea.x + _self.m_rcArea.width - nSize;
						_self.m_rectStepRb.y		= _self.m_rcArea.y;

						_self.m_rectStepLt.width	= nSize;
						_self.m_rectStepLt.Height	= nSize;

						_self.m_rectStepRb.width	= nSize;
						_self.m_rectStepRb.Height	= nSize;
					}
				}
				else {
					_self.m_rectStepRb	= xUtils.shapes.didGetDefaultRect();
					_self.m_rectStepLt	= xUtils.shapes.didGetDefaultRect()
				}

				_self.Calculate(false, true);
			};

			this.ChangeContentsSize = function(nShows, nContents) {
				var bCalc = false;
				var bContents = false;

				if(nShows > 0) {
					if(nShows != _self.m_nShows) {
						_self.m_nShows= nShows;

						bCalc	= true;
					}
				}

				if(nContents > 1) {
					if(nContents != _self.m_nContents) {
						_self.m_nContents = nContents;

						bCalc		= true;
						bContents	= true;
					}
				}

				if(bCalc === true) {
					return(_self.Calculate(bContents, true));
				}

				return(false);
			};

			this.CalcThumbRatioAndSize = function(nSize) {
				if(_self.m_bValid === true) {
					_self.m_dThumbRate	= _self.m_nShows / _self.m_nFullSize;
				}
				else {
					_self.m_dThumbRate = 1.0;
				}

				_self.m_lThumbSize	= parseInt(nSize * _self.m_dThumbRate);
			};

			this.ResizeThumb = function(bLT, nMovedPixel) {
				var	bUpdate		= true;
				var	rcThis		= xUtils.didClone(_self.m_rcArea);
				var	rectThumb	= xUtils.didClone(_self.GetAreaForThumb());
				var	rect		= xUtils.didClone(_self.m_rectPointed);
				var	nDiff		= 0;
				var	nMovedPos	= 0;
				if(_self.m_bVert) {
					// get min & max thumb size
					var	nMin	= _self.GetMinThumbSize();
					var	nMax	= _self.GetMaxThumbSize();	// #1824

					if(!bLT) {
						nMax		= Math.min(_self.m_rectPointed.y + _self.m_rectPointed.height - rectThumb.y, nMax);	// #1824
						var	nTemp	= rect.height;
						rect.height	= Math.min(nMax, Math.max(nMin, rect.height - nMovedPixel));
						nDiff		= rect.height - nTemp;
						rect.y		= rect.y - nDiff;
					}
					else {
						nMax		= Math.min(rectThumb.y + rectThumb.height - _self.m_rectPointed.y, nMax);	// #1824
						rect.height	= Math.max(nMin, Math.min(nMax, _self.m_rectPointed.height + nMovedPixel));
					}

					_self.Calculate2(false);

					_self.CalculateThumb2(rect);
				}
				else {
					// get min & max thumb size
					var	nMin	= _self.GetMinThumbSize();
					var	nMax	= _self.GetMaxThumbSize();	// #1824

					if(bLT) {
						nMax		= Math.min(_self.m_rectPointed.x + _self.m_rectPointed.width - rectThumb.x, nMax);	// #1824
						var	nTemp	= rect.width;
						rect.width	= Math.min(nMax, Math.max(nMin, rect.width - nMovedPixel));
						nDiff		= rect.width - nTemp;
						rect.x		= rect.x - nDiff;
					}
					else {
						nMax		= Math.min(rectThumb.x + rectThumb.width - _self.m_rectPointed.x, nMax);	// #1824
						rect.width	= Math.max(nMin, Math.min(nMax, _self.m_rectPointed.width + nMovedPixel));
					}

					_self.Calculate2(false);

					_self.CalculateThumb2(rect);
				}

				return(bUpdate);
			};

			/*!
				get minimum thumb size ratio
				@param[in]	nSize	size
				@return		double
				*/
			this.GetMinThumbRatio = function(nSize) {
				if(nSize < 1) {
					return(0.0);
				}

				var	nMinThumb = _self.GetMinThumbSize();

				return((nMinThumb) / nSize);
			};

			/*!
				get minimum thumb size
				@return		int
				*/
			this.GetMinThumbSize = function() {
				var	nTemp1	= 0;
				var rectThumb = xUtils.didClone(_self.GetAreaForThumb());
				var	 nSize = _self.m_bVert ? rectThumb.height : rectThumb.width;
				if(_self.m_nFullSize < 1) {
					nTemp1 = nSize;
				}
				else {
					nTemp1 = nSize / _self.m_nFullSize;
				}

				var	nShowsMin = Math.max(UDZS_MINIMUM_THUMBSHOW, _self.m_nShowsMin);

				var	nMinThumb = Math.max(nTemp1 * nShowsMin, UDZS_BARSIZE * 5);

				return(nMinThumb);
			};

			/*!
				get minimum thumb size
				@return		int
				*/
			this.GetMaxThumbSize = function() {
				var	nTemp1	= 0;
				var rectThumb = xUtils.didClone(_self.GetAreaForThumb());
				var	 nSize = _self.m_bVert ? rectThumb.height : rectThumb.width;
				if(_self.m_nFullSize < 1) {
					nTemp1 = nSize;
				}
				else {
					nTemp1 = nSize / _self.m_nFullSize;
				}

				var	nMaxThumb = xUtils.constants.default.DEFAULT_WRONG_VALUE;
				var	nShowsMax = _self.m_nShowsMax;
				if(nShowsMax && nShowsMax > _self.m_nShowsMin) {
					if(_self.m_bVert) {
						nMaxThumb = Math.min(nTemp1 * nShowsMax, rectThumb.height);
					}
					else {
						nMaxThumb = Math.min(nTemp1 * nShowsMax, rectThumb.width);
					}
				}

				return(nMaxThumb);
			};

			this.GetAreaForThumb = function() {
				var rectRet = xUtils.didClone(_self.m_rcArea);
				if(_self.m_bStepButton === true) {
					var	nSize = 0;
					if(_self.m_bVert === true) {
						rectRet.y		= _self.m_rectStepLt.y + _self.m_rectStepLt.height;
						rectRet.height	= rectRet.height - (_self.m_rectStepLt.height + _self.m_rectStepRb.height);
					}
					else {
						rectRet.x		= _self.m_rectStepLt.x + _self.m_rectStepLt.width;
						rectRet.width	= rectRet.width - (_self.m_rectStepLt.width + _self.m_rectStepRb.width);
					}
				}

				return(rectRet);
			};

			this.CalculateThumb = function(pOffset, bMove) {
				{
					var		rectThumb	= _self.GetAreaForThumb();
					var		lSize = 0;

					var		rect		= xUtils.shapes.didGetDefaultRect();
					var		ncCBar = UDZS_HALFBAR_SIZE;

					if(pOffset !== undefined && pOffset != null) {
						if(_self.m_bVert === true) {
							lSize				= rectThumb.height;
						}
						else {
							lSize				= rectThumb.width;

							rect				= _self.m_rectPointed;
							rect.x				= Math.min(rectThumb.x + rectThumb.width - _self.m_rectPointed.width, Math.max(rectThumb.x, rect.x + pOffset));
							if(!bMove) {
								rect.width = _self.m_rectPointed.width - (rect.x - _self.m_rectPointed.x);
							}

							_self.m_rectThumbG			= xUtils.didClone(rect);
							_self.m_rectThumbB			= xUtils.didClone(rect);

							_self.m_rectThumbG.height	= _self.m_rectThumbG.height / 2;

							_self.m_rectThumbS1.width	= _self.m_rectThumbB.width;
							_self.m_rectThumbS1.height	= ncCBar * 4 + 1;
							_self.m_rectThumbS1.x		= _self.m_rectThumbB.x;
							_self.m_rectThumbS1.y		= _self.m_rectThumbB.y + _self.m_rectThumbB.height - ((ncCBar * 2) + _self.m_rectThumbS1.height);


							_self.m_rectThumbS2			= xUtils.didClone(_self.m_rectThumbS1);
							_self.m_rectThumbS2.y		= _self.m_rectThumbB.y + (ncCBar * 2);

							_self.m_rectThumbCC.x		= _self.m_rectThumbB.x + _self.m_rectThumbB.width / 2;
							_self.m_rectThumbCC.y		= _self.m_rectThumbB.y + _self.m_rectThumbG.height / 2 - ncCBar;
							_self.m_rectThumbCC.width	= _self.m_rectThumbG.width;
							_self.m_rectThumbCC.height	= 2 * ncCBar + 1;

							_self.m_rectThumbC1			= xUtils.didClone(_self.m_rectThumbCC);
							_self.m_rectThumbC1.y		= _self.m_rectThumbCC.y + 2 * _self.m_rectThumbCC.height;

							_self.m_rectThumbC2			= xUtils.didClone(_self.m_rectThumbCC);
							_self.m_rectThumbC2.y		= _self.m_rectThumbCC.x - 2 * _self.m_rectThumbCC.height;
						}
					}
					else {
						if(_self.m_bVert) {
							lSize				= rectThumb.height;

							rect.x				= rectThumb.x;
							rect.y				= rectThumb.y + parseInt(_self.m_dPosRatio * _self.m_nThumbPos);
							rect.width			= rectThumb.width;
							rect.height			= parseInt(lSize * _self.m_dThumbRate);

							_self.m_rectThumbG			= xUtils.didClone(rect);
							_self.m_rectThumbB			= xUtils.didClone(rect);

							_self.m_rectThumbG.width	= _self.m_rectThumbG.width / 2;

							_self.m_rectThumbS1.x		= _self.m_rectThumbB.x + ncCBar * 2;
							_self.m_rectThumbS1.y		= _self.m_rectThumbB.y + ncCBar * 2;
							_self.m_rectThumbS1.width	= 2 * ncCBar + 1;
							_self.m_rectThumbS1.height	= _self.m_rectThumbB.height - ncCBar * 4;

							_self.m_rectThumbS2			= xUtils.didClone(_self.m_rectThumbS1);
							_self.m_rectThumbS2.x		= _self.m_rectThumbB.x + _self.m_rectThumbB.width - _self.m_rectThumbS1.width - ncCBar * 2;

							_self.m_rectThumbCC.x		= _self.m_rectThumbB.x + _self.m_rectThumbB.width / 2 - ncCBar;
							_self.m_rectThumbCC.y		= _self.m_rectThumbB.y + _self.m_rectThumbG.height / 2;
							_self.m_rectThumbCC.width	= 2 * ncCBar + 1;
							_self.m_rectThumbCC.height	= _self.m_rectThumbG.height;

							_self.m_rectThumbC1			= xUtils.didClone(_self.m_rectThumbCC);
							_self.m_rectThumbC1.x		= _self.m_rectThumbCC.x - 2 * _self.m_rectThumbCC.width;

							_self.m_rectThumbC2			= xUtils.didClone(_self.m_rectThumbCC);
							_self.m_rectThumbC2.x		= _self.m_rectThumbCC.x + 2 * _self.m_rectThumbCC.width;
						}
						else {
							lSize						= rectThumb.width;

							rect.x						= rectThumb.x + parseInt(_self.m_dPosRatio * _self.m_nThumbPos);
							rect.y						= rectThumb.y;
							rect.width					= parseInt(lSize * _self.m_dThumbRate);
							rect.height					= rectThumb.height;

							_self.m_rectThumbG			= xUtils.didClone(rect);
							_self.m_rectThumbB			= xUtils.didClone(rect);

							_self.m_rectThumbG.height	= _self.m_rectThumbG.height / 2;

							_self.m_rectThumbS1.x		= _self.m_rectThumbB.x + ncCBar * 2;
							_self.m_rectThumbS1.y		= _self.m_rectThumbB.y + ncCBar * 2;
							_self.m_rectThumbS1.width	= 2 * ncCBar + 1;
							_self.m_rectThumbS1.height	= _self.m_rectThumbB.height - ncCBar * 4;

							_self.m_rectThumbS2			= xUtils.didClone(_self.m_rectThumbS1);
							_self.m_rectThumbS2.x		= _self.m_rectThumbB.x + _self.m_rectThumbB.width - _self.m_rectThumbS1.width - ncCBar * 2;

							_self.m_rectThumbCC.x		= _self.m_rectThumbB.x + _self.m_rectThumbB.width / 2 - ncCBar;
							_self.m_rectThumbCC.y		= _self.m_rectThumbB.y + _self.m_rectThumbG.height / 2;
							_self.m_rectThumbCC.width	= 2 * ncCBar + 1;
							_self.m_rectThumbCC.height	= _self.m_rectThumbG.height;

							_self.m_rectThumbC1			= xUtils.didClone(_self.m_rectThumbCC);
							_self.m_rectThumbC1.x		= _self.m_rectThumbCC.x - 2 * _self.m_rectThumbCC.width;

							_self.m_rectThumbC2			= xUtils.didClone(_self.m_rectThumbCC);
							_self.m_rectThumbC2.x		= _self.m_rectThumbCC.x + 2 * _self.m_rectThumbCC.width;
						}
					}
				}
			};

			this.ChangeThumbPos = function(nPos) {
				if(_self.m_bEventLock == false && nPos >= 0 && nPos < _self.m_nFullSize && _self.m_nThumbPos != nPos) {
					_self.m_nThumbPos = nPos;

					_self.CalculateThumb(undefined, false);

					if(_self.m_pDelegate) {
						_self.m_pDelegate.DidScrollUpdate(_self, undefined);
					}

					return(true);
				}

				return(false);
			}

			this.Calculate = function (bContents, bCalcThumb) {
				if(bContents) {
					_self.m_nFullSize = _self.m_nContents;
					_self.m_nFullSize += (_self.m_sizExtra.cx + _self.m_sizExtra.cy);

					_self.m_nStartPos = _self.m_sizExtra.cx;
					_self.m_nEndPos   = _self.m_nFullSize - _self.m_sizExtra.cy;
				}

				if(_self.m_nFullSize < 1) {
					_self.m_bValid = false;
				}

				{
					var nSize = 0;
					var rectArea = _self.GetAreaForThumb();
					if(_self.m_bVert === true) {
						nSize = rectArea.height;
					}
					else {
						nSize = rectArea.width;
					}

					_self.CalcThumbRatioAndSize(nSize);

					if(nSize > 0) { // #2296
						_self.m_dDataPerSize	= ((_self.m_nFullSize) / nSize);

						// #2296
						if(_self.m_nShowsMin !== undefined && _self.m_nShowsMin != null && !isNaN(_self.m_nShowsMin)) {
							_self.m_nShowsMin = Math.max(_self.m_nShowsMin, Math.ceil(_self.m_dDataPerSize * _self.m_nThumbSizeMin));
						}
						//

						var dTemp = nSize - _self.m_lThumbSize;
						if(_self.m_nShows == _self.m_nFullSize) {
							_self.m_dPosRatio = 0;
						}
						else {
							_self.m_dPosRatio = (dTemp) / (_self.m_nFullSize - _self.m_nShows);
						}
					}

					_self.m_bValid = true;
				}

				if(bCalcThumb) {
					_self.CalculateThumb(undefined, false);
				}

				return(_self.m_bValid);
			};

			this.CalcShowsFromThumbRatio = function(nSize) {
				if(_self.m_bValid) {
					_self.m_dThumbRate	= ((_self.m_lThumbSize)) / nSize;
					_self.m_nShows		= Math.round(_self.m_nFullSize * _self.m_dThumbRate);
				}
			};

			this.Calculate2 = function(bMove) {
				var rectArea = xUtils.didClone(_self.GetAreaForThumb());

				if(!bMove) {
					var	nSize	= 0;

					if(_self.m_bVert) {
						nSize				= rectArea.height;
						_self.m_lThumbSize	= _self.m_rectThumbB.height;
					}
					else {
						nSize				= rectArea.width;
						_self.m_lThumbSize	= _self.m_rectThumbB.width;
					}

					if(nSize < 1) {
						return(_self.m_bValid = false);
					}
					else {
						_self.CalcShowsFromThumbRatio(nSize);

						if(nSize != 0) {
							_self.m_dDataPerSize	= ((_self.m_nFullSize) / nSize);

							var dTemp = nSize - _self.m_lThumbSize;
							if(_self.m_nFullSize == _self.m_nShows) {
								_self.m_dPosRatio = 0;
							}
							else {
								_self.m_dPosRatio = (dTemp) / (_self.m_nFullSize - _self.m_nShows);
							}
						}

						_self.m_bValid = true;
					}
				}

				if(_self.m_bVert) {
					_self.m_nThumbPos	= (_self.m_dPosRatio != 0.0) ? (_self.m_nFullSize - _self.m_nShows) - (Math.round((_self.m_rectThumbB.y - rectArea.y) / _self.m_dPosRatio)) : 0;
				}
				else {
					_self.m_nThumbPos	= (_self.m_dPosRatio != 0.0) ? (Math.round((_self.m_rectThumbB.x - rectArea.x) / _self.m_dPosRatio)) : 0;
				}

				return(_self.m_bValid);
			};

			this.CalculateThumb2 = function(rect) {
				if(_self.m_bValid) {
					var	ncCBar = 1;

					{
						if(_self.m_bVert) {
							_self.m_rectThumbG			= xUtils.didClone(rect);
							_self.m_rectThumbB			= xUtils.didClone(rect);

							_self.m_rectThumbG.width	= _self.m_rectThumbG.width / 2;

							_self.m_rectThumbS1.width	= _self.m_rectThumbB.width;
							_self.m_rectThumbS1.height	= ncCBar * 4 + 1;
							_self.m_rectThumbS1.x		= _self.m_rectThumbB.x;
							_self.m_rectThumbS1.y		= _self.m_rectThumbB.y + _self.m_rectThumbB.height - ((ncCBar * 2) + _self.m_rectThumbS1.height);


							_self.m_rectThumbS2			= xUtils.didClone(_self.m_rectThumbS1);
							_self.m_rectThumbS2.y		= _self.m_rectThumbB.y + (ncCBar * 2);

							_self.m_rectThumbCC.x		= _self.m_rectThumbB.x + _self.m_rectThumbB.width / 2;
							_self.m_rectThumbCC.y		= _self.m_rectThumbB.y + _self.m_rectThumbG.height / 2 - ncCBar;
							_self.m_rectThumbCC.width	= _self.m_rectThumbG.width;
							_self.m_rectThumbCC.height	= 2 * ncCBar + 1;

							_self.m_rectThumbC1			= xUtils.didClone(_self.m_rectThumbCC);
							_self.m_rectThumbC1.y		= _self.m_rectThumbCC.y + 2 * _self.m_rectThumbCC.height;

							_self.m_rectThumbC2			= xUtils.didClone(_self.m_rectThumbCC);
							_self.m_rectThumbC2.y		= _self.m_rectThumbCC.x - 2 * _self.m_rectThumbCC.height;
						}
						else {
							_self.m_rectThumbG			= xUtils.didClone(rect);
							_self.m_rectThumbB			= xUtils.didClone(rect);

							_self.m_rectThumbG.height	= _self.m_rectThumbG.height / 2;

							_self.m_rectThumbS1.x		= _self.m_rectThumbB.x + (ncCBar * 2);
							_self.m_rectThumbS1.y		= _self.m_rectThumbB.y;
							_self.m_rectThumbS1.width	= ncCBar * 4 + 1;
							_self.m_rectThumbS1.height	= _self.m_rectThumbB.height;

							_self.m_rectThumbS2			= xUtils.didClone(_self.m_rectThumbS1);
							_self.m_rectThumbS2.x		= _self.m_rectThumbB.x + _self.m_rectThumbB.width - (_self.m_rectThumbS1.width + (ncCBar * 2));

							_self.m_rectThumbCC.x		= _self.m_rectThumbB.x + _self.m_rectThumbB.width / 2 - ncCBar;
							_self.m_rectThumbCC.y		= _self.m_rectThumbB.y + _self.m_rectThumbG.height / 2;
							_self.m_rectThumbCC.width	= 2 * ncCBar + 1;
							_self.m_rectThumbCC.height	= _self.m_rectThumbG.height;

							_self.m_rectThumbC1			= xUtils.didClone(_self.m_rectThumbCC);
							_self.m_rectThumbC1.x		= _self.m_rectThumbCC.x - 2 * _self.m_rectThumbCC.width;

							_self.m_rectThumbC2			= xUtils.didClone(_self.m_rectThumbCC);
							_self.m_rectThumbC2.x		= _self.m_rectThumbCC.x + 2 * _self.m_rectThumbCC.width;
						}
					}
				}
				else {
					_self.m_rectThumbC1	= xUtils.shapes.didGetDefaultRect();
					_self.m_rectThumbCC	= xUtils.shapes.didGetDefaultRect();
					_self.m_rectThumbC2	= xUtils.shapes.didGetDefaultRect();
					_self.m_rectThumbS1	= xUtils.shapes.didGetDefaultRect();
					_self.m_rectThumbS2	= xUtils.shapes.didGetDefaultRect();
					_self.m_rectThumbB	= xUtils.shapes.didGetDefaultRect();
					_self.m_rectThumbG	= xUtils.shapes.didGetDefaultRect();
				}
			};

			this.MoveThumbWithPixel = function(nMovedPixel) {
				var	bUpdate		= true;
				var	rectThumb	= xUtils.didClone(_self.GetAreaForThumb());
				var	rect		= xUtils.didClone(_self.m_rectPointed);
				var	nDiff		= 0;
				var	nMovedPos	= 0;
				if(_self.m_bVert) {
					rect.y		= Math.min(rectThumb.y + rectThumb.height - _self.m_rectPointed.height, Math.max(rectThumb.y, rect.y + nMovedPixel));
					nDiff		= rect.y - _self.m_rectPointed.y;

					_self.Calculate2(true);
					_self.CalculateThumb2(rect);
				}
				else {
					rect.x		= Math.min(rectThumb.x + rectThumb.width - _self.m_rectPointed.width, Math.max(rectThumb.x, rect.x + nMovedPixel));
					nDiff		= rect.x - _self.m_rectPointed.x;

					_self.Calculate2(true);
					_self.CalculateThumb2(rect);
				}

				return(bUpdate);
			};

			this.ELBtnDn = function(wp, lp) {
				var	bRet = false;
				var	nFlags = wp;
				var	point = xUtils.shapes.didGetDefaultPoint();
				point.x = lp.XPos;
				point.y = lp.YPos;

				var	rectTs1	= xUtils.didClone(_self.m_rectThumbS1);
				var	rectTs2	= xUtils.didClone(_self.m_rectThumbS2);
				var	rectTb	= xUtils.didClone(_self.m_rectThumbB);

				xUtils.shapes.InflateRect(rectTs1, 1, 1);
				xUtils.shapes.InflateRect(rectTs2, 1, 1);

				var	bSizing	= false;
				if(nFlags.EVT_SIZING1) {
					bSizing = true;

					if(!_self.m_pPtSizing1) {
						_self.m_pPtSizing1 = xUtils.shapes.didGetDefaultPoint();
					}

					_self.m_pPtSizing1.x = point.x;
					_self.m_pPtSizing1.y = point.y;

					_self.m_nPosPointed		= _self.m_nThumbPos;
					_self.m_nShowsPointed	= _self.m_nShows;
					_self.m_rectPointed		= xUtils.didClone(_self.m_rectThumbB);

					_self.m_aclrThumb		= _self.m_aclrThumbPointed;

					if(_self.m_pDelegate) {
						_self.m_pDelegate.DidScrollUpdate(_self, null);
					}

					bRet = true;
				}
				else if(nFlags.EVT_SIZING2) {
					bSizing = true;

					if(!_self.m_pPtSizing2) {
						_self.m_pPtSizing2 = xUtils.shapes.didGetDefaultPoint();
					}

					_self.m_pPtSizing2.x = point.x;
					_self.m_pPtSizing2.y = point.y;

					_self.m_nPosPointed		= _self.m_nThumbPos;
					_self.m_nShowsPointed	= _self.m_nShows;
					_self.m_rectPointed		= xUtils.didClone(_self.m_rectThumbB);

					_self.m_aclrThumb		= _self.m_aclrThumbPointed;

					if(_self.m_pDelegate) {
						_self.m_pDelegate.DidScrollUpdate(_self, null);
					}

					bRet = true;
				}
				else if(nFlags.EVT_MOVING) {
					if(!_self.m_pptPointed) {
						_self.m_pptPointed = xUtils.shapes.didGetDefaultPoint();
					}

					_self.m_pptPointed.x = point.x;
					_self.m_pptPointed.y = point.y;

					_self.m_nPosPointed		= _self.m_nThumbPos;
					_self.m_nShowsPointed	= _self.m_nShows;
					_self.m_rectPointed		= xUtils.didClone(_self.m_rectThumbB);

					_self.m_aclrThumb		= _self.m_aclrThumbPointed;

					if(_self.m_pDelegate) {
						_self.m_pDelegate.DidScrollUpdate(_self, null);
					}

					bRet = true;
				}
				else if(nFlags.EVT_STEP_DOWN) {
					_self.m_bStepStateLt = true;

					_self.EStepButtonDown(_self.m_bStepStateLt);

					bRet = true;
				}
				else if(nFlags.EVT_STEP_UP) {
					_self.m_bStepStateLt = false;

					_self.EStepButtonDown(_self.m_bStepStateLt);

					bRet = true;
				}

				return(bRet);
			};

			this.EStepButtonDown = function(bScrollDown) {
				if(bScrollDown) {
					_self.m_nThumbPos--;
				}
				else {
					_self.m_nThumbPos++;
				}

				_self.m_nThumbPos = Math.min(_self.m_nFullSize - _self.m_nShows, Math.max(0, _self.m_nThumbPos));

				_self.CalculateThumb(null, false);

				if(_self.m_pDelegate) {
					_self.m_bEventLock = true;
					_self.m_pDelegate.DidScrollToPos(_self, _self.m_nThumbPos, null);
					_self.m_bEventLock = false;
				}

				return(true);
			};

			/*!
				event for left button up
				see WM_LEFTBUTTONUP
				@param[in]	wp	flags
				@param[in]	lp	point
				*/
			this.ELBtnUp = function(wp, lp) {
				var	bRet = false;
				var	nFlags = wp;
				var	point = xUtils.shapes.didGetDefaultPoint();
				point.x = lp.XPos;
				point.y = lp.YPos;

				if(_self.m_pptPointed) {
					_self.m_pptPointed = undefined;

					_self.m_aclrThumb	= _self.m_aclrThumbNormal;

					bRet = true;
				}
				else if(_self.m_pPtSizing1) {
					_self.m_pPtSizing1 = undefined;

					_self.m_aclrThumb	= _self.m_aclrThumbNormal;

					bRet = true;
				}
				else if(_self.m_pPtSizing2) {
					_self.m_pPtSizing2 = undefined;

					_self.m_aclrThumb	= _self.m_aclrThumbNormal;

					bRet = true;
				}
				else if(_self.m_uiTeStepTrigger == UDZS_TIMERID_FOR_STEPTRIGGER) {
					_self.m_uiTeStepTrigger = 0;

					_self.m_aclrStepLt = _self.m_aclrStepNormal;
					_self.m_aclrStepRb = _self.m_aclrStepNormal;

					bRet = true;
				}
				else if(_self.m_pStepState) {
					// clear step
					_self.m_pStepState = null;
					if(_self.m_uiTeStep == UDZS_TIMERID_FOR_STEP) {
						_self.m_uiTeStep = 0;
					}

					_self.m_aclrStepLt = _self.m_aclrStepNormal;
					_self.m_aclrStepRb = _self.m_aclrStepNormal;

					bRet = true;
				}

				if(bRet && _self.m_pDelegate) {
					_self.m_pDelegate.DidScrollUpdate(_self, null);
				}

				return(bRet);
			};

			this.EMouseMove = function(wp, lp) {
				var	bRet = false;
				var	nFlags = wp;
				var	point = xUtils.shapes.didGetDefaultPoint();
				point.x = lp.XPos;
				point.y = lp.YPos;

				var pt = point;

				var	bUpdate	= false;

				var	bSizing	= false;

				if(_self.m_pptPointed) {
					var lDiff = 0;
					if(_self.m_bVert) {
						lDiff = pt.y - _self.m_pptPointed.y;
					}
					else {
						lDiff = pt.x - _self.m_pptPointed.x;
					}

					bUpdate = _self.MoveThumbWithPixel(lDiff);

					if(bUpdate && _self.m_pDelegate) {
						_self.m_bEventLock = true;
						_self.m_pDelegate.DidScrollToPos(_self, _self.m_nThumbPos, null);
						_self.m_bEventLock = false;
					}

					bRet = true;
				}
				else if(_self.m_pPtSizing1) {
					bSizing = true;
					var lDiff = 0;
					if(_self.m_bVert) {
						lDiff = pt.y - _self.m_pPtSizing1.y;
					}
					else {
						lDiff = pt.x - _self.m_pPtSizing1.x;
					}

					bUpdate = _self.ResizeThumb(true, lDiff);

					if(bUpdate && _self.m_pDelegate) {
						_self.m_bEventLock = true;
						_self.m_pDelegate.DidScrollToPos(_self, _self.m_nThumbPos, _self.m_nShows);
						_self.m_bEventLock = false;
					}

					bRet = true;
				}
				else if(_self.m_pPtSizing2) {
					bSizing = true;
					var lDiff = 0;
					if(_self.m_bVert) {
						lDiff = pt.y - _self.m_pPtSizing2.y;
					}
					else
					{
						lDiff = pt.x - _self.m_pPtSizing2.x;
					}

					bUpdate = _self.ResizeThumb(false, lDiff);

					if(bUpdate && _self.m_pDelegate) {
						_self.m_bEventLock = true;
						_self.m_pDelegate.DidScrollToPos(_self, _self.m_nThumbPos, _self.m_nShows);
						_self.m_bEventLock = false;
					}

					bRet = true;
				}

				return(bRet);
			};
		};

		return(exports);
	};

	//// console.debug("[MODUEL] Loading => zsScrollWrap");

	// Enable module loading if available
	if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
			module["exports"] =
		loadModule(
			require("../ngc/chartUtil")
		);
	} else { //f (typeof define !== 'undefined' && define["amd"]) { // AMD
			define("ngu/zsScrollWrap", ['ngc/chartUtil'],
		function(xUtils) {
			return loadModule(xUtils);
		});
	}

	//// console.debug("[MODUEL] Loaded => zsScrollWrap");
})(this);
