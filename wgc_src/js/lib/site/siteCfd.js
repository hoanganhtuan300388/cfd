(function(global){
	"use strict";

	var loadModule = function(xUtils) {
		"use strict";

		//
		// MARK:[begin] NGU
		//
		var exports = function() {
			var _self = this;

			// CFD margin #1691 => "5" -> "30"

			// #2910, #3151
			var _didGetTrendlineCursorUrl = function(name) {
				try {
					var url = "-webkit-image-set(";

					url += "url('assets/images/cursors/icon-chart-" + name + ".png') 1x,";
					url += "url('assets/images/cursors/icon-chart-" + name + "@2x.png') 2x,";
					url += "url('assets/images/cursors/icon-chart-" + name + "@3x.png') 3x)";

					return(url);
				}
				catch(e) {
					console.error(e);
				}
			};
			// [end] #2910

			// #3151
			var _didGetCursorUrl = function(name) {
				try {
					var url = "-webkit-image-set(";

					url += "url('assets/images/cursors/" + name + ".png') 1x,";
					url += "url('assets/images/cursors/" + name + "@2x.png') 2x";
					url += ")";

					return(url);
				}
				catch(e) {
					console.error(e);
				}
			};
			// [end] #2910

			// #2361
			var _didInitCursors = function() {
				try {
					var chartConfig = xUtils.constants.chartConfig;

					// normal
					chartConfig.System.CursorConfig = {
						"move" : "-webkit-grabbing",
						"row-resize" : "row-resize",
						"hover-object" : "pointer",
					};

					// trendline
					var trendLineCodes = xUtils.constants.trendLineCodes;
					var trendLineCursors = {};

					// #2910, #3151
					trendLineCursors[xUtils.constants.trendLineCodes.trendLine] 		=
					trendLineCursors[xUtils.constants.trendLineCodes.horzLine]  		=
					trendLineCursors[xUtils.constants.trendLineCodes.vertLine]  		=
					trendLineCursors[xUtils.constants.trendLineCodes.doubleTrendline] 	=
					trendLineCursors[xUtils.constants.trendLineCodes.fiboFan] 			=
					trendLineCursors[xUtils.constants.trendLineCodes.fiboRetracement] 	= _didGetCursorUrl("cursor-draw") + ", default";
					// [end] #2910, #3151
					trendLineCursors[xUtils.constants.trendLineCodes.deleteOneRepeat] 	= _didGetCursorUrl("cursor-select") + ", pointer"; // #3151
					trendLineCursors[xUtils.constants.trendLineCodes.crossHair] 		= _didGetCursorUrl("cursor-chart-crosshair") + " 8 8, crosshair"; // #2566, #3151

					var trendLineTools = xUtils.trendLine;
				   	var trendLineInfo;

					var tlcKeys = Object.keys(trendLineCursors);
					for(var ii = 0; ii < tlcKeys.length; ii++) {
						try {
							var tlcKey = tlcKeys[ii];
							var cursor = trendLineCursors[tlcKey];
							trendLineInfo  = trendLineTools.didGetDefaultTrendlineInfoAt(tlcKey, true);
							if(trendLineInfo) {
								trendLineInfo.cursor = cursor;

								if(tlcKey != xUtils.constants.trendLineCodes.deleteOneRepeat) {
									trendLineInfo.isHoverObject = true;
								}
							}
						}
						catch(e) {
							console.error(e);
						}
					}
				}
				catch(e) {
					console.error(e);
				}
			};
			// [end] 2361

			var _didInitStyles = function() {
				try {
					var chartConfig = xUtils.constants.chartConfig;

					chartConfig.System.UseFlexMarginTopBottomInMain = true; // #1516
					chartConfig.System.ExtraMarginForTopBottomInMain = 30; // #1516
					chartConfig.MarginRight = "10"; // #2788

					chartConfig.TitleLeft = 60;
					chartConfig.TitleTop  = 20;
					chartConfig.LabelMarkGap = 5;
					chartConfig.LabelMarkBoxSize = 12;
					chartConfig.ActionButtonTop = 16;
					chartConfig.ActionButtonLeft= 5;
					chartConfig.ActionButtonGap = 5;
					chartConfig.ActionButtonSize = 16;

					chartConfig.BorderColor     =
					chartConfig.BackgroundColor = "transparent";

					chartConfig.SubBackgroundColor = "#3f3f55"; // #2931

					chartConfig.XAxisBorderColor     =
					chartConfig.XAxisBackgroundColor = "transparent";

					chartConfig.ShowTitleLabel = true;
					chartConfig.ShowDataView = false;

					chartConfig.Font = '13px Roboto'; // #3016

					chartConfig.System.DefaultPriceBar = "cfd";
					chartConfig.System.UseContextMenu = true;
					chartConfig.System.AllowSmoothScroll = false;
					chartConfig.System.DontMoveOnTrendlineSelectMode = true;
					chartConfig.System.DontUseAutoShowOepChange = true; // #2330, #2566

					chartConfig.ExtraPanelWidth = 24; // #1298

					// #1516
					chartConfig.LabelFormat = {
						timeFormat0: "hh:mm:ss",
						dateFormat1: "MM/DD",
						timeFormat1: "hh:mm",
						dateFormat2: "YYYY/MM/DD",
						dateFormat3: "YYYY/MM",		// #2310
					};

					// #3285
					chartConfig.TooltipLabelStyle = {
						background : "#aab8d8",
						lineColor  : "#aab8d8",
						fontColor  : "#4f5080",
					};
					// [end] #3285

					chartConfig.MinMaxTooltipShow = true; // #1516
					chartConfig.MarginTopBottom = "10"; // #1516

					// #1827
					chartConfig.ZSBConfig = {
						LineColor: "#00e6e6",
						BgColor1 : "#0088cc",
						BgColor2 : "rgba(0, 77, 153, 0.6)",
					};
					//

					chartConfig.PriceStyleConfig.Candle.fillUpColor   =
					chartConfig.PriceStyleConfig.Candle.strokeUpColor = "#e02424";
					chartConfig.PriceStyleConfig.Candle.fillDnColor   =
					chartConfig.PriceStyleConfig.Candle.strokeDnColor = "#13a5c2";

					// #3016
					chartConfig.PriceStyleConfig.Line.strokeColor = "#dde1f0";
					chartConfig.Font = '13px Roboto';
					chartConfig.FontColor = "#aab8d8";

					chartConfig.ConfigAxis.Font = '13px Roboto';
					chartConfig.ConfigAxis.FontColor = "#aab8d8";

					chartConfig.System.YAxisWidth = 84;
					chartConfig.System.YAxisRight = 84;

					chartConfig.System.CrosslineLabelXWidth = 88;

					chartConfig.CrossLine.lineStyle.strokeStyle = 0;
					chartConfig.CrossLine.lineStyle.strokeWeight= 1;
					chartConfig.CrossLine.lineStyle.strokeColor = "#ffffff";
					//

					// #1878, #2438
					chartConfig.OrderStyleConfig.ask.strokeColor = "#13a5c2";
					chartConfig.OrderStyleConfig.bid.strokeColor = "#f54242";

					// #3148
					chartConfig.PositStyleConfig.ask.strokeColor2= "#4295f5";
					chartConfig.PositStyleConfig.bid.strokeColor2= "#f54242";
					chartConfig.PositStyleConfig.ask.strokeWeight=
					chartConfig.PositStyleConfig.bid.strokeWeight= 2;
					chartConfig.PositStyleConfig.ask.strokeColor =
					chartConfig.PositStyleConfig.bid.strokeColor = "#2D2D42";
					// [end] #3148

					chartConfig.AlertStyleConfig.default.strokeColor = "#84ccc9"; // #3597
					chartConfig.AlertStyleConfig.ask.strokeColor = "#84ccc9"; // #3597
					chartConfig.AlertStyleConfig.bid.strokeColor = "#84ccc9"; // #3597
					chartConfig.AlertStyleConfig.dummy.strokeColor = "#84ccc9"; // #3597

					chartConfig.ExecutionStyleConfig.noFill = true;
					// #3148
					chartConfig.ExecutionStyleConfig.ask.strokeColor2= "#4295f5"; // #3597
					chartConfig.ExecutionStyleConfig.bid.strokeColor2= "#f54242";
					chartConfig.ExecutionStyleConfig.ask.strokeWeight=
					chartConfig.ExecutionStyleConfig.bid.strokeWeight= 2;
					chartConfig.ExecutionStyleConfig.ask.strokeColor =
					chartConfig.ExecutionStyleConfig.bid.strokeColor = "#2D2D42";
					// [end] #3148
					//

					// #3047
					chartConfig.System.UseGlobalTrendlineColor = true;
					chartConfig.TrendlineColor = "rgba(221, 225, 240, 0.6)"; // #dde1f0 , 0.6

					chartConfig.OrderStyleConfig.ask.cloneColor = "#4295f5"; // clone color for ask // #3597
					chartConfig.OrderStyleConfig.bid.cloneColor = "#f54242"; // clone color for bid

					chartConfig.OrderStyleConfig.ask.strokeColor = "rgba(66, 149, 245, 0.6)"; // #4295f5, 0.6 // #3597
					chartConfig.OrderStyleConfig.bid.strokeColor = "rgba(254, 66, 66, 0.6)" ; // #f54242, 0.6
					//

					chartConfig.ConfigAxis.GridStyle = 0;
					chartConfig.ConfigAxis.GridHorzColor = "#525366"; // #3016
					chartConfig.ConfigAxis.GridVertColor = "#525366";

					// #1927
					chartConfig.TooltipDelay  = 300; // #2851
					chartConfig.TooltipOffset = 15;
					//

					// #2007
					chartConfig.PriceStyleConfig.AskBid = {};
					chartConfig.PriceStyleConfig.AskBid.bidStrokeColor =
					chartConfig.PriceStyleConfig.AskBid.askStrokeColor = "#2D2D42"; // #3148
					chartConfig.PriceStyleConfig.AskBid.askColor = "#F24040";
					chartConfig.PriceStyleConfig.AskBid.bidColor = "#378BDF";
					chartConfig.PriceStyleConfig.AskBid.invalidColor = "#505050";
					chartConfig.PriceStyleConfig.AskBid.rightMargin = 10;
					chartConfig.PriceStyleConfig.AskBid.shapeHorzSize = 12; // #3148
					chartConfig.PriceStyleConfig.AskBid.shapeVertSize = 14; // #3148
					chartConfig.PriceStyleConfig.AskBid.shapeGap = 5;
					chartConfig.PriceStyleConfig.AskBid.textGap = 3; // #3347
					//

					// #1924
					chartConfig.System.Scroll.zoom = 100;
					chartConfig.System.Scroll.screenSize.max = null;
					chartConfig.System.UseMouseWheel = false;
					//

					chartConfig.System.TickJustLine = true; // #2286

					// #2277
					chartConfig.System.NoDisplayAtOutOfArea = true;
					chartConfig.System.DisplayEmptyInDetailViewWhenInvalid = true;
					//

					// #2566
					chartConfig.System.DefaultTrendline = "TL0001";
					//

					// #2585
					chartConfig.System.ContainerSelect = false;
					chartConfig.System.IndicatorSelect = false;
					chartConfig.System.TrendlineLimits = 100;
					//

					// #3140, #3147
					chartConfig.System.BackgroundLogo = {
						LeftMargin : 8,
						BottomMargin : 6,
						Width  : 164,
						Height : 12,
					};

					chartConfig.System.SubBackgroundMargin = 2;
					//

					//
					// constants
					//

					// #2277
					var constants = xUtils.constants;
					constants.text.dataView.invalid = "";
					//

					constants.default.RULER_MARGIN = 12;

					//
					// number
					//

					// #2289
					var number = xUtils.number;
					if(number) {
						if(!number.config) {
							number.config = {};
						}

						number.config.invalidComma = true;
					}
					// [end] #2289

					//
					// hitTest
					//
					var hitTest = xUtils.hitTest;
					if(hitTest) {
						if(!hitTest.config) {
							hitTest.config = {
								size : 3,
								color : '#aaaaaa'
							}
						}
						else {
							hitTest.config.size = 3;
						}
					}

					_didInitCursors(); // #2361

					//
					// dateTime
					//
					// #3425
					var dateTime = xUtils.dateTime;
					if(dateTime) {
						dateTime.defaultWeekday = dateTime.weekDays.monday;
					}
					// [end] #3425
				}
				catch(e) {

				}
			};

            var _didInitIndicatorCodes = function() {
                try {
                    xUtils.constants.indicatorCodes = {
            			SMA_TRIPLE:"0600",
                        BOLLINGER_BANDS_TRIPLE_SUPER:"0601",
                        SPANMODEL:"0602",
                        HEIKINASHI:"0603",
						RSI_TRIPLE:"0604",
						ICHIMOKU_CFD:"0605",
						STOCHASTIC_CFD:"0606",

                        MACD:"0607",
            			RCI:"0608",
						EMA_TRIPLE:"0609",
            			BOLLINGER_BANDS_TRIPLE:"0610",

            		};
                }
                catch(e) {
                    console.error(e);
                }
            };

            var _didInitIndicators = function() {
                try {
                    xUtils.constants.indicators = [
						{
            				code:xUtils.constants.indicatorCodes.SMA_TRIPLE,
            				name:"Simple Moving Average",               display:"単純移動平均線",	display_s:"SMA",
            				splitFlag:false, usedFlag:false, enable:true, valid:true
            				, extraDiff:0, editableExtraDiff:true
            				,
            				priceType : true,
            				params : [
            					{ name : "Period1"		, alias : "期間1"				, value : 5    , default:5  , range: { min:   1,  max: 200, step: 1 } , linked:true},
            					{ name : "Period2"		, alias : "期間2"				, value : 25   , default:25 , range: { min:   1,  max: 200, step: 1 } , linked:true},
            					{ name : "Period3"		, alias : "期間3"				, value : 75   , default:75 , range: { min:   1,  max: 200, step: 1 } , linked:true}
            				],
            				plots : [
            					{ name : "MA1"			, alias : "MA1"	, plotStyle : 0, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle : 0 , paramLink:"Period1", showHideOption:true},
            					{ name : "MA2"			, alias : "MA2"	, plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle : 0 , paramLink:"Period2", showHideOption:true},
            					{ name : "MA3"			, alias : "MA3"	, plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle : 0 , paramLink:"Period3", showHideOption:true}
            				]
            			},
                        {
            				code:xUtils.constants.indicatorCodes.EMA_TRIPLE,
            				name:"Exponential Moving Average",               display:"指数平滑移動平均線",	display_s:"EMA", // #3314
            				splitFlag:false, usedFlag:false, enable:true, valid:true
            				, extraDiff:0, editableExtraDiff:true
            				,
            				priceType : true,
            				params : [
            					{ name : "Period1"		, alias : "期間1"				, value : 5    , default:5  , range: { min:   1,  max: 200, step: 1 } , linked:true},
            					{ name : "Period2"		, alias : "期間2"				, value : 10   , default:10 , range: { min:   1,  max: 200, step: 1 } , linked:true},
            					{ name : "Period3"		, alias : "期間3"				, value : 20   , default:20 , range: { min:   1,  max: 200, step: 1 } , linked:true}
            				],
            				plots : [
            					{ name : "EMA1"			, alias : "EMA1"	, plotStyle : 0, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle : 0 , paramLink:"Period1", showHideOption:true},
            					{ name : "EMA2"			, alias : "EMA2"	, plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle : 0 , paramLink:"Period2", showHideOption:true},
            					{ name : "EMA3"			, alias : "EMA3"	, plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle : 0 , paramLink:"Period3", showHideOption:true}
            				]
            			},
            			{
            				code:xUtils.constants.indicatorCodes.BOLLINGER_BANDS_TRIPLE,
            				name:"Bollinger's Band",             display:"ボリンジャーバンド",	display_s:"BBand",
            				splitFlag:false, usedFlag:false, enable:true, valid:true
            				, extraDiff:0, editableExtraDiff:true
            				,
            				priceType : true,
            				params : [
            					{ name : "Period"		, alias : "ボリンジャーバンド" , value : 20    , default:20,  range: { min:   1,  max: 120, step: 1 }}
            				],
            				plots : [
            					{ name : "Middle"		, alias : "ボリンジャーバンド"	  , plotStyle : 0, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle : 0, showHideOption: true }, // #3078
            					{ name : "Up1"			, alias : "偏差＋1"	  	, plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle : 0, showHideOption: true },
            					{ name : "Dn1"			, alias : "偏差－1"	 	, plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle : 0, showHideOption: true },
            					{ name : "Up2"			, alias : "偏差＋2"	  	, plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle : 0, showHideOption: true },
            					{ name : "Dn2"			, alias : "偏差－2"	 	, plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle : 0, showHideOption: true },
            					{ name : "Up3"			, alias : "偏差＋3"	  	, plotStyle : 0, color : xUtils.color.tables.lists[3], lineWeight : 1, lineStyle : 0, showHideOption: true },
            					{ name : "Dn3"			, alias : "偏差－3"	 	, plotStyle : 0, color : xUtils.color.tables.lists[3], lineWeight : 1, lineStyle : 0, showHideOption: true }
            				],
							titles : [
								{ plotNo: 0, params:[0] },
								{ plotNo: 1, display:"1σ" }, // #3088
								{ plotNo: 3, display:"2σ" }, // #3088
								{ plotNo: 5, display:"3σ" }, // #3088
							]
            			},
                        {
            				code:xUtils.constants.indicatorCodes.BOLLINGER_BANDS_TRIPLE_SUPER,
            				name:"Bollinger's Band",             display:"スーパーボリンジャー",	display_s:"SuperBBand",
            				splitFlag:false, usedFlag:false, enable:true, valid:true
            				, extraDiff:0, editableExtraDiff:true
            				,
            				priceType : true,
            				params : [
            					{ name : "Period"		, alias : "移動期間"			 , value : 21   , default:20,  range: { min:   1,  max: 120, step: 1 }},
								{ name : "BGSpan"		, alias : "遅行スパン"			, value : 21   , default:20,  range: { min:   1,  max: 120, step: 1 }},
								{ name : "Band1"		, alias : "バンド1"				, value : 1    , default:1,  range: { min:   1,  max: 120, step: 1 }},
								{ name : "Band2"		, alias : "バンド2"				, value : 2    , default:2,  range: { min:   1,  max: 120, step: 1 }},
								{ name : "Band3"		, alias : "バンド3"				, value : 3    , default:3,  range: { min:   1,  max: 120, step: 1 }},

            				],
            				plots : [
            					{ name : "Middle"		, alias : "移動平均"	  	, plotStyle : 0, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle : 0, showHideOption: true, paramLink:"Period"}, // #3078
								{ name : "BGSpan"		, alias : "遅行スパン"	 	, plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle : 0, showHideOption: true, paramLink:"BGSpan", moveShiftParamLink:1 },
            					{ name : "Up1"			, alias : "バンド1"	  		, plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle : 0, showHideOption: true, paramLink:"Band1" },
            					{ name : "Dn1"			, alias : "バンド1"	 		, plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle : 0, showHideOption: true, paramLink:"Band1" },
            					{ name : "Up2"			, alias : "バンド2"	  		, plotStyle : 0, color : xUtils.color.tables.lists[3], lineWeight : 1, lineStyle : 0, showHideOption: true, paramLink:"Band2" },
            					{ name : "Dn2"			, alias : "バンド2"	 		, plotStyle : 0, color : xUtils.color.tables.lists[3], lineWeight : 1, lineStyle : 0, showHideOption: true, paramLink:"Band2" },
            					{ name : "Up3"			, alias : "バンド3"	  		, plotStyle : 0, color : xUtils.color.tables.lists[4], lineWeight : 1, lineStyle : 0, showHideOption: true, paramLink:"Band3" },
            					{ name : "Dn3"			, alias : "バンド3"	 		, plotStyle : 0, color : xUtils.color.tables.lists[4], lineWeight : 1, lineStyle : 0, showHideOption: true, paramLink:"Band3" }	// #3078
            				],
							// #1779
							titles : [
								{ plotNo: 0, params:[0] },
								{ plotNo: 1, params:[1] },
								{ plotNo: 2, params:[2], display:"バンド1" },
								{ plotNo: 4, params:[3], display:"バンド2" },
								{ plotNo: 6, params:[4], display:"バンド3" },
							]
							//
            			},
						{
            				code:xUtils.constants.indicatorCodes.SPANMODEL,
            				name:"Ichmoku Kinkohyo",             display:"スパンモデル",	display_s:"スパンモデル",
            				splitFlag:false, usedFlag:false, enable:true, valid:true
            				,
            				priceType : true,
            				params : [
								{ name : "Period1"		, alias : "転換線"			 , value : 9	    , default:9,   range: { min: 1,  max: 120, step: 1 } },
            					{ name : "Period2"		, alias : "基準線"		     , value : 26	    , default:26,   range: { min: 1,  max: 120, step: 1 } },
								{ name : "Period3"		, alias : "遅行スパン"	   , value : 26		  , default:26,   range: { min: 1,  max: 120, step: 1 } }, // #2519
            				],
            				plots : [
            					{ name : "TenkanSen"			, alias : "転換線"  		, plotStyle : 0, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle : 0  , showHideOption:true}, // #2519
            					{ name : "KizyunSen"			, alias : "基準線"	   		, plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle : 0  , showHideOption:true}, // #2519
            					{ name : "ChikouSen"			, alias : "遅行スパン"	 	, plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle : 0  , showHideOption:true, moveShiftParamLink:2 }, // #2519, #3078
            				]
            			},
            			{
            				code:xUtils.constants.indicatorCodes.ICHIMOKU_CFD,
            				name:"Ichmoku Kinkohyo",             display:"一目均衡表",	display_s:"一目均衡表",
            				splitFlag:false, usedFlag:false, enable:true, valid:true
            				,
            				priceType : true,
            				params : [
            					{ name : "Period1"		, alias : "転換線"			 , value : 9	    , default:9,   range: { min: 1,  max: 120, step: 1 } },
            					{ name : "Period2"		, alias : "基準線"		     , value : 26	    , default:26,   range: { min: 1,  max: 120, step: 1 } },
            					{ name : "Period3"		, alias : "先行スパン1"	   , value : 26		  , default:26,   range: { min: 1,  max: 120, step: 1 } },
								{ name : "Period4"		, alias : "先行スパン2"	   , value : 52		  , default:52,   range: { min: 1,  max: 120, step: 1 } },
								{ name : "Period5"		, alias : "遅行スパン"	   , value : 26		  , default:26,   range: { min: 1,  max: 120, step: 1 } },
            				],
            				plots : [
            					{ name : "TenkanSen"			, alias : "転換線"  		, plotStyle : 0, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle : 0  , showHideOption:true},
            					{ name : "KizyunSen"			, alias : "基準線"	   		, plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle : 0  , showHideOption:true},
            					{ name : "SenkouSpan1"			, alias : "先行スパン1"     , plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle : 0 , showHideOption:true , moveShiftParamLink:2 }, // #2830
            					{ name : "SenkouSpan2"			, alias : "先行スパン2"	   , plotStyle : 0, color : xUtils.color.tables.lists[3], lineWeight : 1, lineStyle : 0 , showHideOption:true , moveShiftParamLink:3 }, // #2830
								{ name : "ChikouSen"			, alias : "遅行スパン"	 	, plotStyle : 0, color : xUtils.color.tables.lists[4], lineWeight : 1, lineStyle : 0  , showHideOption:true , moveShiftParamLink:4 }, // #2830, #3078
            					{ name : "SenkouSpan2Calc"		, alias : "先行スパン2計算"  , ignore:true }
            				]
            			},
						{
            				code:xUtils.constants.indicatorCodes.HEIKINASHI,
            				name:"Heikinashi",               display:"平均足",	display_s:"平均足",
            				splitFlag:false, usedFlag:false, enable:true, valid:true
            				, extraDiff:0, editableExtraDiff:true
            				,
            				priceType : false,
            				params : [
            					{ name : "Period"		, alias : "平均足"			   , value : 5    , default:5  , range: { min:   1,  max: 200, step: 1 } , linked:true}
            				],
            				plots : [
            					{ name : "Heikinashi"	, alias : "平均足"	, plotStyle : 0, type : 2, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle : 0 , paramLink:"Period"},
            				]
            			},
            			{
            				code:xUtils.constants.indicatorCodes.MACD,
            				name:"MACD",                         display:"MACD",		display_s:"MACD",
            				splitFlag:true,  usedFlag:false, enable:true, valid:true
            				,
            				params : [
            					{ name : "ShortPeriod"	, alias : "MACD 短期"	  , value : 12	, default:12,   range: { min: 1,  max: 255, step: 1 } },
            					{ name : "LongPeriod"	, alias : "MACD 長期"   , value : 26	, default:26,  range: { min: 1, max: 255, step: 1 } },
            					{ name : "Period"		, alias : "シグナル"	 , value : 9  , default:9,   range: { min: 1,  max: 255, step: 1 } }
            				],
            				plots : [
            					{ name : "Short"		, alias : "MACD 短期"	   	, ignore : true },
            					{ name : "Long"			, alias : "MACD 長期"	   	, ignore : true },
            					{ name : "MACD"			, alias : "MACD"	 	  , plotStyle : 0, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle : 0 , showHideOption: true},
            					{ name : "Signal"		, alias : "SIGNAL" 	      , plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle : 0 , showHideOption: true},
            					{ name : "Ocillator"	, alias : "オシレーター"   , ignore:true }
            				],
							// #1779
							titles : [
								{ plotNo: 2, params:[0, 1], display:"MACD" },
								{ plotNo: 3, params:[2],    display:"SIGNAL" },
							]
							//
            			},
            			{
            				code:xUtils.constants.indicatorCodes.STOCHASTIC_CFD,
            				name:"Stochastics(Fast/Slow)",                  display:"ストキャスティクス",	display_s:"SC_FS", // #3314
            				splitFlag:true,  usedFlag:false, enable:true, valid:true
            				,
            				params : [
            					{ name : "KPeriod"		, alias : "%K"		, value : 9		, default:9,   range: { min: 1,  max: 255, step: 1 } },
            					{ name : "DPeriod"		, alias : "%D"		, value : 3		, default:3,   range: { min: 1,  max: 255, step: 1 } },
            					{ name : "SPeriod"		, alias : "Slow%D"	, value : 3	 	, default:3,   range: { min: 1,  max: 255, step: 1 } }
            				],
            				plots : [
            					{ name : "FastK"		, alias : "%K"  	, plotStyle : 0, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle : 0 , showHideOption:true, paramLink:"KPeriod"},
            					{ name : "FastD"		, alias : "%D"	    , plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle : 0 , showHideOption:true, paramLink:"DPeriod"},
            					{ name : "SlowD"		, alias : "Slow%D"	, plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle : 0 , showHideOption:true, paramLink:"SPeriod"},
								{ name : "Calc1"		, alias : "Calc1"	, ignore:true},
								{ name : "Calc2"		, alias : "Calc2"	, ignore:true},

            				]
            			},
            			{
            				code:xUtils.constants.indicatorCodes.RSI_TRIPLE,
            				name:"Relative Strength Index",      display:"RSI",					display_s:"RSI",
            				splitFlag:true,  usedFlag:false, enable:true, valid:true
            				,
            				params : [
								{ name : "Period1"		, alias : "RSI短期"				, value : 7    , default:5  , range: { min:   1,  max: 200, step: 1 } , linked:true},
            					{ name : "Period2"		, alias : "RSI中期"				, value : 14   , default:25 , range: { min:   1,  max: 200, step: 1 } , linked:true},
            					{ name : "Period3"		, alias : "RSI長期"				, value : 42   , default:75 , range: { min:   1,  max: 200, step: 1 } , linked:true}
            				],
            				plots : [
            					{ name : "RSI_S"		, alias : "RSI短期"	   		, plotStyle : 0, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle :0, paramLink:"Period1", showHideOption:true},
								{ name : "RSI_M"		, alias : "RSI中期"	   		, plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle :0, paramLink:"Period2", showHideOption:true},
								{ name : "RSI_L"		, alias : "RSI長期"	   		, plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle :0, paramLink:"Period3", showHideOption:true},
								// #2824
								{ name : "Gain"			, alias : "Gain"			, ignore:true },
            					{ name : "Loss"			, alias : "Loss"			, ignore:true },
            				]
            			},
            			{
            				code:xUtils.constants.indicatorCodes.RCI,
            				name:"Rank Correlation Index(RCI)",                  display:"RCI",	display_s:"RCI",
            				splitFlag:true,  usedFlag:false, enable:true, valid:true
            				,
            				params : [
            					{ name : "Period1"		, alias : "短期"			, value : 5    , default:5  , range: { min:   1,  max: 120, step: 1 }},
            					{ name : "Period2"		, alias : "中期"			, value : 20   , default:20 , range: { min:   1,  max: 120, step: 1 }},
            					{ name : "Period3"		, alias : "長期"			, value : 60   , default:60 , range: { min:   1,  max: 120, step: 1 }}
            				],
            				plots : [
            					{ name : "RCI1"			, alias : "RCI短期"		, plotStyle : 0, color : xUtils.color.tables.lists[0], lineWeight : 1, lineStyle : 0},
            					{ name : "RCI2"			, alias : "RCI中期"		, plotStyle : 0, color : xUtils.color.tables.lists[1], lineWeight : 1, lineStyle : 0},
            					{ name : "RCI3"			, alias : "RCI長期"		, plotStyle : 0, color : xUtils.color.tables.lists[2], lineWeight : 1, lineStyle : 0}

            				]
            			},
            		];
                }
                catch(e) {
                    console.error(e);
                }
            };

            var _didInitIndicatorGroups = function() {
                try {
                    xUtils.constants.indicatorGroups = {
            			trend : {
            				name: "Trend",
            				display: "トレンド系",
            				indicators : [
            					xUtils.constants.indicatorCodes.SMA_TRIPLE,
                                xUtils.constants.indicatorCodes.EMA_TRIPLE,
            					xUtils.constants.indicatorCodes.BOLLINGER_BANDS_TRIPLE,
                                xUtils.constants.indicatorCodes.BOLLINGER_BANDS_TRIPLE_SUPER,
                                xUtils.constants.indicatorCodes.SPANMODEL,
                                xUtils.constants.indicatorCodes.ICHIMOKU_CFD,
                                xUtils.constants.indicatorCodes.HEIKINASHI,
            				]
            			},
            			oscillator : {
            				name: "Oscillator",
            				display: "オシレーター系",
            				indicators : [
            					xUtils.constants.indicatorCodes.MACD,
                                xUtils.constants.indicatorCodes.STOCHASTIC_CFD,
            					xUtils.constants.indicatorCodes.RSI_TRIPLE,
            					xUtils.constants.indicatorCodes.RCI
            				]
            			}
            		};
                }
                catch(e) {
                    console.error(e);
                }
            };

			this.didInitSite = function() {
				_didInitStyles();
                _didInitIndicatorCodes();
                _didInitIndicators();
                _didInitIndicatorGroups();
            };
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => siteCfd");

	// Enable module loading if available
	if (typeof module === 'object' /*&& module["exports"]*/) { // CommonJS
		module["exports"] =
    		loadModule(
    			require("../ngc/chartUtil")
    		);
	} else { //f (typeof define !== 'undefined' && define["amd"]) { // AMD
		define("site/siteCfd", ['ngc/chartUtil'],
    		function(xUtils) {
    			return loadModule(xUtils);
    		});
	}

	//console.debug("[MODUEL] Loaded => siteCfd");
})(this);
