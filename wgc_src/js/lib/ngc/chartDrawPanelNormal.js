(function(global){
	"use strict";

	var loadModule = function(xUtils, layoutBaseClass, drawFrameClass, xAxisPanelClass, axisUnitFactory) {
		"use strict";

		var exports = function(chartWrapper, ctrlLayout) {
			//
			// private
			//
			var _self = this;
			var _chartWrapper = chartWrapper;
			var _drawFrameClass = drawFrameClass;
			var _ctrlLayout = ctrlLayout;

			this.prototype = new layoutBaseClass(chartWrapper, ctrlLayout);
		    layoutBaseClass.apply(this, arguments);

			this.OBJECT_NAME = "NORMAL_LAYOUT";

			/**
			 *
			 */
			this.didCreateAxisXPanel = function() {
				//
				// X Axis
				//
				_self.m_chartXAxisObj = new xAxisPanelClass(_chartWrapper, _self, _ctrlLayout);
				_self.m_chartXAxisObj.Init();
			};

			this.GetDataSize = function() {
				return(_self.GetDataCount());
			};


			/**
			    Calculate for Drawing Information for Volume
			    @param[in,out] nStart		start position ( index )
				@param[in,out] nSize		screen data size
				@param[in]     nState		state
			*/
			var _CalcForDrawV = function(nStart, nSize, nState) {
				var result = {screenStartIndex:nStart, screenSize:nSize};

			    //=========================================================================
			    // CHECK FOR DRAW
			    //=========================================================================
				if(!_self.CheckForDraw()) return(result);

				//=========================================================================
			    // AXIS-X CHECK
			    //=========================================================================
				_self.SetAxisStyle(xUtils.constants.ngc.enum.ELS_VOLUME, true);

				// m_pCfg
				var xEnv = _ctrlLayout.didGetEnvInfo();

			    //=========================================================================
			    // X WIDTH
			    //=========================================================================
				_self.m_nXWidth	= _self.GetChartFrameAreaWidth();
				_self.m_xAxisX.m_nDiffSize = 5; // #2568

				//=========================================================================
			    // X WIDTH
			    //=========================================================================
				var	rc		= _self.GetFullDrawPanelRect();
				var	nWidth	= rc.width;
				_self.m_nXWidth	= rc.width; // m_pCfg->m_rcWnd.Width ( ) - m_pCfg->GetYWidth	( ) ;
				rc			= _self.CheckMulti1Panel(rc)	;
				_self.m_nXWidth	=
				nWidth		= rc.width;

			    //=========================================================================
			    // SCREEN SHOW DATA SIZE
			    //=========================================================================
				var xFullRange = _self.didGetFullRange();
				var nZoomSize  = _self.ExGetZoomInfo();

				_self.m_xAxisX.m_stScaleInfo.dMaxS	= xFullRange.length;// _self.m_nDataSize + parseInt(xEnv.MarginRight) + _self.m_nOffFull ;
				_self.m_xAxisX.m_stScaleInfo.dMinS	= 0 ;

				_self.m_nScrDSize = nZoomSize ;

				if( _self.m_nScrDSize <= 0 ) {
					return(result);
				}

				var xScrInfo;
				if((xScrInfo = _self.CalcScrDInfo ( nStart , nSize , nState )) === undefined || xScrInfo == null ) {
					return(result);
				}

				nStart	= xScrInfo.screenStartIndex;
				nSize	= xScrInfo.screenSize;

				result.screenStartIndex = nStart;
				result.screenSize       = nSize;

				// #729
				var nOffMinus= xUtils.didCalculateShiftValue(_self.m_xShiftInfo, xUtils.constants.default.SHIFT_IS_ST);

				var nDataIdx = xUtils.EC_GetDataZScr(nStart, nOffMinus, 0, false);

				var xVolume  = _self.didCalcReferencedPriceVolumeAtRange({position:nDataIdx, length:nSize});

				var dVolFull = xVolume.fullVolume ;
				var dVol	 = xVolume.rangeVolume ;

				if( dVol < -1 ) {
					return(result);
				}

				var nRWidth	 	= nWidth - (nSize + 1) * xEnv.System.Gap;

				// Get Volume
				_self.m_xAxisX.CalcAxisInfoVol(_self, nRWidth, nOffMinus, 1, xFullRange.length, dVol, dVolFull, result.screenStartIndex, result.screenSize); // #2568

				//
				return(result);
			}

			/**
			    Calculate for Drawing Information for Normal
			    @param[in,out] nStart		start position ( index )
				@param[in,out] nSize		screen data size
				@param[in]     nState		state
			*/
			var _CalcForDrawN = function(nStart, nSize, nState) {
				var result = {screenStartIndex:nStart, screenSize:nSize};

				//=========================================================================
			    // CHECK FOR DRAW
			    //=========================================================================
				if(!_self.CheckForDraw()) return(result);

				//=========================================================================
			    // AXIS-X CHECK
			    //=========================================================================
				_self.SetAxisStyle(xUtils.constants.ngc.enum.ELS_NORMAL, true);
				_self.m_xAxisX.m_nDiffSize = 0; // m_pCfg->GetWDiffSize ( m_nXWidth ) ;

				// m_pCfg
				var xEnv = _ctrlLayout.didGetEnvInfo();

			    //=========================================================================
			    // X WIDTH
			    //=========================================================================
				var	rc			= _self.GetFullDrawPanelRect();
				var	nWidth		= rc.width;
				_self.m_nXWidth	= rc.width; // m_pCfg->m_rcWnd.Width ( ) - m_pCfg->GetYWidth	( ) ;
				rc				= _self.CheckMulti1Panel(rc)	;
				_self.m_nXWidth	=
				nWidth			= rc.width;

			    //=========================================================================
			    // SCREEN SHOW DATA SIZE
			    //=========================================================================
				var xFullRange = _self.didGetFullRange();
				var nZoomSize  = _self.ExGetZoomInfo();
				var nDataSize  = _self.GetDataSize();
				var nOffFull   = _self.m_xShiftInfo.all;

				_self.m_xAxisX.m_stScaleInfo.dMaxS	= xFullRange.length;// _self.m_nDataSize + parseInt(xEnv.MarginRight) + _self.m_nOffFull ;
				_self.m_xAxisX.m_stScaleInfo.dMinS	= 0 ;

				// #1653
				_self.m_nScrDSize = _self.m_xAxisX.CalcAxisInfoByScrollInfo(_self, nWidth, _self.m_xScrollInfo, nDataSize, nOffFull);
				// [end] #1653

				var xScrInfo;
				if((xScrInfo = _self.CalcScrDInfo ( nStart , nSize , nState )) === undefined || xScrInfo == null ) {
					return(result);
				}

				result.screenStartIndex = xScrInfo.screenStartIndex;
				result.screenSize       = xScrInfo.screenSize;

				return(result);
			}


			/**
			    Calculate for Drawing Information
			    @param[in,out] nStart		start position ( index )
				@param[in,out] nSize		screen data size
				@param[in]     nState		state
			*/
			this.CalcForDraw = function(nStart, nSize, nState) {
				var result = {screenStartIndex:nStart, screenSize:nSize};

				switch( _self.m_nAxisX ) {
					case	xUtils.constants.ngc.enum.ELS_NORMAL	:
					case	xUtils.constants.ngc.enum.ELS_FULL		:
						result = _CalcForDrawN( nStart , nSize , nState ) ;
						break ;
					case	xUtils.constants.ngc.enum.ELS_VOLUME	:
						result = _CalcForDrawV( nStart , nSize , nState ) ;
						break ;
				}

				return(result);
			};

			/**
			 *
			 */
			this.OnTrendLineAdd = function(strTrendLine) {
				_self.m_bTrendLine = xUtils.trendLine.isDrawableTrendline(strTrendLine);
				if (!_self.m_bTrendLine) {
					var idx = 0;
					if (strTrendLine === xUtils.constants.trendLineCodes.deleteOne) {
						(function(argPanel){
							if(argPanel !== undefined && argPanel != null && argPanel.didRemoveSelectedLineTool !== undefined) {
								argPanel.didRemoveSelectedLineTool();
								_self.DrawingChartDrawFrame(true);
							}
						})(_self.GetDrawPanelAt(_self.m_iCanvasMouseDownIndex));
					}
					else if (strTrendLine === xUtils.constants.trendLineCodes.deleteAll) {
						_self.didRemoveAllLineTools(true);
						_self.DrawingChartDrawFrame(true);
					}

					// #1558
					_self.m_strTrendLine = strTrendLine;
					//

					return;
				}
				_self.m_strTrendLine = strTrendLine;
			};

			//
			// NOTE: Event process
			//

			/**
			 * [description]
			 * @param  {[type]} keyValue
			 * @return {[type]}
			 */
			this.didGetObjectInfo = function(objectName, isSelected) {
				if(isSelected === true) {
					var xSelectedPanel = _self.GetDrawPanelAt(_self.m_iCanvasMouseDownIndex);
					if(xSelectedPanel !== undefined && xSelectedPanel != null) {

						var xInfo = xSelectedPanel.didFindSelectedObject();
						return(xInfo);
					}
				}

				return;
			};

			this.didGetOrderingInfoForIndicators = function(argList) {
				if(argList === undefined || argList == null || argList.length === undefined || argList.length == null || argList.length < 1) {
					return;
				}

				var bResult= false;
				var nCount = _self.m_arrChartDrawFramelist.length;

				var xOrderingInfos = [];

				for(var ii = 0; ii < nCount; ii++) {
					var xPanel = _self.m_arrChartDrawFramelist[ii];
					var xOi = [];
					var listLen = argList.length;

					if(xPanel && xPanel.didFindFirstIndicatorObjectByTypeId) {
						for(var jj = 0; jj < listLen; jj++) {
							var typeId = argList[jj];
							if(xPanel.didFindFirstIndicatorObjectByTypeId(typeId)) {
								xOi.push(typeId);
								argList.splice(jj, 1);
								break;
							}
						}
					}

					if(xOi.length > 0) {
						xOrderingInfos.push(xOi);
					}
				}

				if(xOrderingInfos.length > 0) {
					return(xOrderingInfos);
				}

				return;
			};

			/**
			 * 特定指標（キー）の設定を修正する。
			 * @param  {string} argKey		key
			 * @param  {string} argSettings	JSON string
			 * @return {boolean}
			 */
			this.didChangeIndicatorSettingByKey = function(argKey, argSettings) {
				//
				// #710
				//
				var xChanged = {
					isMulti : false,
					param   : false,
					plot    : false,
					shift   : false,
					line    : false
				};
				//

				var bResult= false;
				var nCount = _self.m_arrChartDrawFramelist.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPanel = _self.m_arrChartDrawFramelist[ii];
					if(xPanel && xPanel.didChangeIndicatorSettingByKey) {
						if((bResult = xPanel.didChangeIndicatorSettingByKey(argKey, argSettings, xChanged)) === true) {
							break;
						}
					}
				}

				if(bResult === true) {
					// #710
					_self.didEndChangeForIndicator(false, xChanged);

					//
					return(true);
				}

				return;
			};

			/**
			 * 特定指標（タイプID）の設定を修正する。
			 * @param  {string} argTypeId	type id
			 * @param  {string} argSettings	JSON string
			 * @return {boolean}
			 */
			this.didChangeIndicatorSettingByTypeId = function(argTypeId, argSettings) {
				var xEnv   = _self.didGetEnvInfo();

				//
				// #710
				//
				var xChanged = {
					isMulti : xEnv.System.MultipleSeries,
					param   : false,
					plot    : false,
					shift   : false,
					line    : false
				};
				//

				var bResult= false;
				var nCount = _self.m_arrChartDrawFramelist.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPanel = _self.m_arrChartDrawFramelist[ii];
					if(xPanel && xPanel.didChangeIndicatorSettingByTypeId) {
						var bRes = xPanel.didChangeIndicatorSettingByTypeId(argTypeId, argSettings, xChanged);
						if(xEnv.System.MultipleSeries === true) {
							bResult |= bRes;
						}
						else {
							if(bRes === true) {
								bResult = bRes;
								break;
							}
						}
					}
				}

				if(bResult === true) {
					// #710
					_self.didEndChangeForIndicator(false, xChanged);

					//
					return(true);
				}

				return;
			};

			/**
			 * [description]
			 * @param  {[type]} keyValue
			 * @return {[type]}
			 */
			this.didGetCurrentLiveIndicatorInformationAll = function() {
				var nCount = _self.m_arrChartDrawFramelist.length;

				var isPriceType = true;
				var xResult = {
					trends : [],
					ocillators : []
				};

				for(var ii = 0; ii < nCount; ii++) {
					var xPanel = _self.m_arrChartDrawFramelist[ii];
					if(xPanel && xPanel.didGetCurrentLiveIndicatorInformationAll) {
						var arrInfos1 = xPanel.didGetCurrentLiveIndicatorInformationAll(false, true);
						if(arrInfos1 && arrInfos1.length && arrInfos1.length > 0) {
							xUtils.didAppendDatas(xResult.trends, arrInfos1);
						}

						var arrInfos2 = xPanel.didGetCurrentLiveIndicatorInformationAll(false, false);
						if(arrInfos2 && arrInfos2.length && arrInfos2.length > 0) {
							xUtils.didAppendDatas(xResult.ocillators, arrInfos2);
						}
					}
				}

				return(xResult);
			};

			this.didDeleteTargetToolObject = function(argDoLs) {
				if(xUtils.trendLine.didDeleteTargetToolObject(argDoLs) === true) {
					_self.DrawingChartDrawFrame(false);

					return(true);
				}
				// if(argDoLs !== undefined && argDoLs != null && argDoLs.m_doParent !== undefined && argDoLs.m_doParent != null && argDoLs.m_doParent.didRemoveTargetLineTool !== undefined) {
				// 	if(argDoLs.m_doParent.didRemoveTargetLineTool(argDoLs) === true) {
				// 		_self.DrawingChartDrawFrame(false);
				//
				// 		return(true);
				// 	}
				// }
			};

			var _didDeleteTargetIndicator = function(argTypeId) {
				var nCount = _self.m_arrChartDrawFramelist.length;
				for(var ii = 0; ii < nCount; ii++) {
					var xPanel = _self.m_arrChartDrawFramelist[ii];
					if(xPanel !== undefined && xPanel != null) {
						var xResult = xPanel.didDeleteIndicator(argTypeId);
						if(xResult !== undefined && xResult != null) {
							// 再計算およびリフレッシュ
							_self.didEndChangeForIndicator(true);

							//
							return(xResult);

							break;
						}
					}
				}
			};

			/**
			 * [description]
			 * @param  {[type]} keyValue
			 * @return {[type]}
			 */
			this.didProcessForDeleteKeyEvent = function(keyValue) {
				var xSelectedPanel = _self.GetDrawPanelAt(_self.m_iCanvasMouseDownIndex);
				if(xSelectedPanel !== undefined && xSelectedPanel != null) {

					var xInfo = xSelectedPanel.didFindSelectedObject();

					//
					// #708
					if(xInfo) {
						//
						// #704
						if(xInfo.tool && xInfo.tool.ls) {
							var xDoLs = xInfo.tool.ls;

							if(_self.didDeleteTargetToolObject(xDoLs) === true) {
								return;
							}
						}
						//
						// #708
						else if(xInfo.indicator) {
							var xTargetInfo = _self.didDeleteSelectedIndicator()
							var xResult = _self.m_ctrlLayout.didNotifyForDeletingIndicator(xTargetInfo);
						}
					}
				}

				return;
			};

			this.didDeleteSelectedIndicator = function() {
				return(_didDeleteTargetIndicator());
			};

			this.didDeleteIndicatorByTypeId = function(argTypeId) {
				return(_didDeleteTargetIndicator(argTypeId));

				/*
				var iExistSpanIndex = -1;
				for (idx = 0; idx < _self.m_arrChartDrawFramelist.length; idx++) {
					for (idxObj = 0; idxObj < _self.m_arrChartDrawFramelist[idx].m_arrChartObjlist.length; idxObj++) {
						if ((_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_bSelect) && (!_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_bMainChart)) {
							if(_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_strIndicator == 'IchiMoku') {
								// if
								// (parseInt(_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_arrPeriod[3])
								// == _self.m_iSpanMax)
								{
									for (idxSpan = 0; idxSpan < _self.m_arrIchiMokulist.length; idxSpan++) {
										if(_self.m_arrIchiMokulist[idxSpan] == parseInt(_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_arrPeriod[3])) {
											iExistSpanIndex = idxSpan;
											break;
										}
									}
									if(iExistSpanIndex > -1) {
										_self.m_iSpanMax = 0;
										_self.m_arrIchiMokulist.splice(iExistSpanIndex, 1);
										for (idxSpan = 0; idxSpan < _self.m_arrIchiMokulist.length; idxSpan++) {
											_self.m_iSpanMax = Math.max(_self.m_iSpanMax, _self.m_arrIchiMokulist[idxSpan]);
										}

										var iGap = parseInt(_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_arrPeriod[3]) - _self.m_iSpanMax;
										for (var idxDelete = 0; idxDelete < iGap; idxDelete++) {
											_gfJsonData.Modules.deleteBlankData();
										}

										_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist.splice(idxObj, 1);

										break;
									}
								}
							}
							else {
								_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist.splice(idxObj, 1);
								_self.ResizeChart(false);
								return;
							}
						}
					}
					if(iExistSpanIndex > -1) {
						var iEndX = _self.m_iEndX;

						var __nDataCount = _self.GetDataCount();
						if(iEndX > (__nDataCount - 1)) {
							iEndX = __nDataCount - 1;
						}

						// _self.m_iStartX = iStartX;
						_self.m_iEndX = iEndX;

						for (idx = 0; idx < _self.m_arrChartDrawFramelist.length; idx++) {
							for (idxObj = 0; idxObj < _self.m_arrChartDrawFramelist[idx].m_arrChartObjlist.length; idxObj++) {
								if (!_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_bMainChart) {
									_self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].didClearData(1, _self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].m_strChartName);
									// _self.m_arrChartDrawFramelist[idx].m_arrChartObjlist[idxObj].ReceiveData();
								}
							}
						}
						_self.ReceiveData();
						_self.DrawingChartDrawFrame(false);
						break;
					}
				}
				*/

				return(false);
			};

			//
			// NOTE: X Axis
			//

			this.didGetAxisX = function() {
				return(_self);
			};

	        /**
			 * pixel offset -> index offset
			 * @param[in] argPixel pixel
			 * @return offset
			 */
			this.didConvertPixelToOffset = function(argPixel) {
				if(_self.m_xAxisX !== undefined && _self.m_xAxisX != null) {
					var __offset = _self.m_xAxisX.GetMovePx2Idx(_self, argPixel, false);

					return(__offset);
				}
				else {
					var __ratio = _self.didGetRatioHorizontal(true);
					var __offset = parseInt(argPixel * __ratio);
					return(__offset);
				}
			};

			/**
			 * [description]
			 * @param  {[type]} iXPos
			 * @return {[type]}
			 */
	        this.GetXIndexGap = function(iXPos) {
				// TODO: AXISX
				if(_self.m_xAxisX !== undefined && _self.m_xAxisX != null) {
					var nScrSIdx = _self.m_xScrollInfo.pos;
					var nScrSPos = 0;
					var nScrCPos = iXPos;

					var xOutput  = {};

					var bResult  = _self.m_xAxisX.GetPos2Index(_self, nScrSIdx, nScrSPos, iXPos, false, 0, xOutput);

					return(xOutput.nRIdx);
				}
				else {
					var __ratio = _self.didGetRatioHorizontal(true);
		            var iIndexGap = parseInt(iXPos * __ratio);
		            // alert(iIndexGap);
		            return iIndexGap;
				}
	        };

			/**
			 *
			 */
			this.GetXIndex = function(iXPos) {
				return(_self.didConvertHorizontalPosToDataIndex(iXPos, true));
			};

	        /**
	         * convert position to data index
			 * @param[in] argPosX	position x
			 * @param[in] bRelative	relative or not
			 * @return index
			 */
			this.didConvertHorizontalPosToDataIndex = function(argPosX, bRelative) {
				var __posX = (bRelative === true) ? argPosX : _self.GetRelativePostionX(argPosX);

				var __nLocalIndex = _self.didConvertPixelToOffset(__posX);

				var __nDataIndex = _self.didConvertLocalIndexToDataIndex(__nLocalIndex);//_self.m_iStartX + __nOffset;

				return(__nDataIndex);
			};

			/**
			 * get local position x from screen start index
			 * @param[in] argLocalIdx	local index
			 * @return local position
			 */
	        this.GetXPos = function(argLocalIdx) {
				var nScrCPos = 0;

				// TODO: AXISX
				if(_self.m_xAxisX !== undefined && _self.m_xAxisX != null) {
					var nScrSIdx = _self.m_xScrollInfo.pos;
					var nScrSPos = 0;
					var nScrCIdx = argLocalIdx + nScrSIdx;

					var xLRInfo  = {};
					nScrCPos = _self.m_xAxisX.GetIndex2Pixel(_self, nScrSIdx, nScrSPos, nScrCIdx, xLRInfo);

					return(nScrCPos);
				}
				else {

		        	var __ratio = _self.didGetRatioHorizontal(false);
		        	var __nGridWidth = /*parseInt*/(__ratio);

		            var iXPos = Math.round/*parseInt*/(argLocalIdx * __ratio);// + 1;

		            iXPos = Math.round/*parseInt*/(iXPos + (__nGridWidth / 2));

					/*
					if(nScrCPos !== iXPos) {
						// console.debug("[WGC] MISMATCH => "+ argLocalIdx);
					}
					*/

		            return iXPos;
				}
	        };

	        /**
			 * get local position x from data index
			 *
			 * @param[in] dataIndex data index
			 * @return local position
			 */
	        this.GetXPosAtDataIndex = function(dataIndex) {
				var __localIndex = _self.didConvertDataIndexToLocalIndex(dataIndex);

				return(_self.GetXPos(__localIndex));

				// TODO: REMOVE
	        	var __ratio = _self.didGetRatioHorizontal(false);
	        	var __nGridWidth = /*parseInt*/(__ratio);

	            var __nLocalPositionX = Math.round/*parseInt*/(__localIndex * __ratio);// + 1;

	            __nLocalPositionX = Math.round/*parseInt*/(__nLocalPositionX + (__nGridWidth / 2));

	            return(__nLocalPositionX);
	        };

			/**
			 * get local position x from data index
			 *
			 * @param[in] dataIndex data index
			 * @return local position
			 */
	        this.GetIndex2Pixel = function(dataIndex, extraOuput) {
				var nScrSIdx = _self.m_xScrollInfo.pos;
				var nScrSPos = 0;
				// #881
				// dataIndex => screenIndex
				var nScrCIdx = _self.m_xShiftInfo.left + dataIndex;
				//

				var nScrCPos = _self.m_xAxisX.GetIndex2Pixel(_self, nScrSIdx, nScrSPos, nScrCIdx, extraOuput);

	            return(nScrCPos);
	        };

			/**
			 * get ratio for horizontal
			 *
			 * @param[in] baseIsPixel index / pixel or pixel / index
			 * @return ratio
			 */
			this.didGetRatioHorizontal = function(baseIsPixel) {
				if(_self.m_xAxisX !== undefined && _self.m_xAxisX != null) {
					var __ratio = 0.0;

					if(_self.m_xAxisX.m_dRatioD !== 0) {
						if(baseIsPixel) {
							__ratio = 1 / _self.m_xAxisX.m_dRatioD;
						}
						else {
							__ratio = _self.m_xAxisX.m_dRatioD;
						}
					}

					return(__ratio);
				}

				var __ratio = 0.0;
				var __frameWidth = _self.GetChartFrameAreaWidth();

				var __nScreenSize = _self.m_xScrollInfo.screenSize; //(_self.m_iEndX - _self.m_iStartX + 1)
				if(baseIsPixel) {
					__ratio = (__nScreenSize) / __frameWidth;
				}
				else {
					__ratio = __frameWidth / (__nScreenSize);
				}

				return(__ratio);
			};

			/**
			 * @param[in] nLocalXPos local x position
			 * @return {pos:, width:}
			 */
			this.didGetAdjustedBarInfo = function(nLocalXPos) {
				var __ratio = _self.didGetRatioHorizontal(false);
	        	var __barWidth = /*parseInt*/(__ratio);

	        	var __result = xUtils.axis.didGetAdjustedBarInfo(__barWidth, nLocalXPos);

				return(__result);
			};

			/**
			 * @return {boolean}
			 */
			this.didGetSaveInfo = function() {

			};

			// #1169
			this.didProcForMouseDownInAxisArea = function(posval, argEvent) {
				var check = _self.didCheckOepPosInAxisArea(posval);
				if(check === undefined || check == null) {
					return(false);
				}

				var xResult = check.result;

				if(check.cursor) {
					_self.SetMouseCursor(check.cursor);
				}
				// [end] #1524

				_self.didDeselectAllFrameObjects();

				// symbol Information
				var symbolInfo = _self.m_xDoBasePrice.m_symbolInfo;

				//
				var isNew = false;
				var isContext = false;
				var localDrawFrame = xResult.panel;
				var objectInfo;

				//
				//
				//
				var trendLineInfo;
				var strOrderLine = xUtils.constants.trendLineCodes.orderLine;

				try {
					trendLineInfo = _ctrlLayout.didFindTrendlineInfoAt(strOrderLine);

					//
					trendLineInfo.isAdd = true;
				}
				catch(e) {
					// console.debug(e);
				}

				localDrawFrame.CreateTrendlineObj(strOrderLine, posval, trendLineInfo);

				//
				_self.m_bOrderLine = true;

				// 再描画する。
				_self.DrawingChartDrawFrame(false);

				return(true);
			};
			//

			// #1524
			this.didCheckOepPosInAxisArea = function(posval) {
				// not trendline
				if(_self.m_bTrendLine) {
					return;
				}

				// not resize
				if(_self.m_bMouseRowResize) {
					return;
				}

				// get panel postion
				var xResult = _self.didGetPanelInfoAtPos(posval);
				if(!xResult) {
					return;
				}

				// just only valid in main panel
				if(xResult.isMain !== true) {
					// console.debug("Not main");

					return;
				}

				var xEnv = _self.didGetEnvInfo();
				if(xEnv.System.UseOneClickOepMode !== true) {
					return;
				}

				var cursor = 'crosshair';
				if(xEnv.System.OepMouseCursor !== undefined && xEnv.System.OepMouseCursor != null)  {
					cursor = 'url(' + xEnv.System.OepMouseCursor + '), crosshair';
				}

				return({result:xResult, cursor:cursor});
			};
			// [end] #1524

			/**
			 * [description]
			 * @param  {[type]} posval
			 * @param  {[type]} contextMenu
			 * @return {[type]}
			 */
			this.OnContextMenu = function(posval, contextMenu) {
				// #1927
				_self.didClearTooltipEventer();
				_self.didShowTooltip(false);
				//

				// not trendline
				if(_self.m_bTrendLine) {
					return;
				}

				// not resize
				if(_self.m_bMouseRowResize) {
					return;
				}

				// get panel postion
				var xResult = _self.didGetPanelInfoAtPos(posval);
				if(!xResult) {
					return;
				}

				// just only valid in main panel
				if(xResult.isMain !== true) {
					// console.debug("Not main");

					return;
				}

				// must be price
				if(!_self.m_xDoBasePrice || !_self.m_xDoBasePrice.m_symbolInfo ) {
					return;
				}

				_self.didDeselectAllFrameObjects();

				// symbol Information
				var symbolInfo = _self.m_xDoBasePrice.m_symbolInfo;

				//
				var isNew = false;
				var isContext = false;
				var localDrawFrame;
				var objectInfo;
				var xEnv = _self.didGetEnvInfo();

				contextMenu.symbolCode = symbolInfo.strCode;
				contextMenu.symbol     = xUtils.didClone(symbolInfo);

				var __newOrderFunc__ = function(localDrawFrame, posval, symbolInfo) {
					// get price
					var __nPrice = localDrawFrame.GetYPosToVal(posval.YPos);
					//
					__nPrice = xUtils.axis.didAdjustZFValue(__nPrice, true);

					//
					var result = {
						symbol		: xUtils.didClone(symbolInfo),
						symbolCode	: symbolInfo.strCode,
						price 		: __nPrice
					};

					return(result);
				};

				// drawing area
				if(xResult.axis === 0) {
					if(xResult.panel) {
						localDrawFrame = xResult.panel;

						localDrawFrame.OnSelectChartObj(posval);
						// not trendline
						if(localDrawFrame.m_selectTrendlineObj) {
							localDrawFrame.m_selectTrendlineObj.m_bSelect = false;
						}
						// order or position object
						else if(localDrawFrame.m_xSelectedOepObject) {
							// get object Information
							var objectInfo = localDrawFrame.m_xSelectedOepObject.didGetOepObjectInfo();

							if(objectInfo) {
								// set
								contextMenu.objectInfo = objectInfo.origin;
								if(objectInfo.isOrder === true) {
									objectInfo.isCancel = true;
								}
								else {
									objectInfo.isPosit = true;
								}
								contextMenu.isNew =
								isNew             = false;
								isContext 		  = true;
							}
						}
						// empty area
						else {
							contextMenu.objectInfo = objectInfo = __newOrderFunc__(localDrawFrame, posval, symbolInfo);
							contextMenu.price = objectInfo.price;
							contextMenu.isNew =
							isNew             = true;
							isContext 		  = true;
						}
					}
				}
				else if(xEnv.System.ContextMenuOrderAll === true) {
					if(xResult.panel) {
						localDrawFrame = xResult.panel;
						contextMenu.objectInfo = objectInfo = __newOrderFunc__(localDrawFrame, posval, symbolInfo);
						contextMenu.price = objectInfo.price;
						contextMenu.isNew =
						isNew             = true;
						isContext 		  = true;
					}
				}

				if(objectInfo) {
					if(isNew == true) {
						_self.m_chartWrapper.didReflectCallForNewOrder(contextMenu);
					}
					else {
						if(objectInfo.isOrder == true) {
							if(contextMenu.objectInfo) {
								if(contextMenu.objectInfo.cancelableFlag === true) {
									contextMenu.isCancel = true;
									_self.m_chartWrapper.didReflectCallForCancelOrder(contextMenu);
								}
							}
						}
						else {
							if(contextMenu.objectInfo) {
								if(contextMenu.objectInfo.checkSettlementFlag === true) {
									contextMenu.isPosit = true;
									_self.m_chartWrapper.didReflectCallForExecutionOrder(contextMenu);
								}
							}
						}
					}
				}

				// 再描画する。
				_self.DrawingChartDrawFrame(false);
			};

			// #1441
			this.WillBeDrawnBackground = function(notifyData) {
				if(notifyData && _self.m_xDoBasePrice) {
					try {
						var pstDp = notifyData;

						_self.m_xDoBasePrice.didDrawPriceOnFullMode(pstDp);
					}
					catch(e) {
						console.error(e);
					}
				}
			};

			// [end] #1441
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDrawPanelNormal");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDrawPanelNormal"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDrawPanelBase"],
				global["WGC_CHART"]["chartDrawFrameNormal"],
				global["WGC_CHART"]["chartXAxisPanelNormal"],
				global["WGC_CHART"]["chartAxisUnit"]
            );
	}
    else if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
        module["exports"] =
            loadModule(
                require("./chartUtil"),
				require("./chartDrawPanelBase"),
				require("./chartDrawFrameNormal"),
				require("./chartXAxisPanelNormal"),
				require("./chartAxisUnit")
            );
    } else if (typeof define !== 'undefined' && define["amd"]) { // AMD
        define("ngc/chartDrawPanelNormal",
            ['ngc/chartUtil', 'ngc/chartDrawPanelBase', 'ngc/chartDrawFrameNormal', 'ngc/chartXAxisPanelNormal', 'ngc/chartAxisUnit'],
                function(xUtils, layoutBaseClass, drawFrameClass, xAxisPanelClass, axisUnitFactory) {
                    return loadModule(xUtils, layoutBaseClass, drawFrameClass, xAxisPanelClass, axisUnitFactory);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDrawPanelNormal"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"],
				global["WGC_CHART"]["chartDrawPanelBase"],
				global["WGC_CHART"]["chartDrawFrameNormal"],
				global["WGC_CHART"]["chartXAxisPanelNormal"],
				global["WGC_CHART"]["chartAxisUnit"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDrawPanelNormal");
})(this);
