(function(global){
	"use strict";

	var loadModule = function(xUtils) {
		"use strict";

		var CTimeManager = function() {
			var _self = this;

			// data handler
			this.m_xOwner = null;

			this.m_nTimeType = xUtils.constants.timeType.minute;
			this.m_nTimeGap  = 1;

			//
			this.m_xTimezoneInfo = {};

			/**
			 * 営業日を計算する。
			 * @param  {[type]} argDate
			 * @param  {[type]} argTime
			 * @return [type]
			 */
			var _didCalculateBusinessDate = function(argDate, argTime) {
				var compare = _didCompareDatetimeInTimezoneAsOneday(argDate, argTime);
				var newDate = argDate;
				if(compare < 0) {
					///var
					var xDate = xUtils.dateTime.addDate(xUtils.dateTime.convertNumberToDate(argDate), -1);
					newDate = xUtils.dateTime.convertDateToNumber(xDate);
				}
				else if(compare > 0) {
					var xDate = xUtils.dateTime.addDate(xUtils.dateTime.convertNumberToDate(argDate), 1);
					newDate = xUtils.dateTime.convertDateToNumber(xDate);
				}

				return(newDate);
			};

			/**
			 * 時間を比較する。
			 * @param  {[type]} argDate
			 * @param  {[type]} argTime
			 * @return [type]
			 */
			var _didCompareDatetimeInTimezoneAsOneday = function(argDate, argTime) {
				var dateTimeUnit = xUtils.timeZone.convertDatetimeToTimeunit(argDate, argTime);

				return(_didCompareDatetimeUnitInTimezoneAsOneday(dateTimeUnit));
			};

			var _didCompareDatetimeUnitInTimezoneAsOneday = function(dateTimeUnit) {
				if(_self.m_xTimezoneInfo.oneDayUnit === undefined || _self.m_xTimezoneInfo.oneDayUnit == null) {
					return(-1);
				}

				if(dateTimeUnit < _self.m_xTimezoneInfo.oneDayUnit.begin) {
					return(-1);
				}

				if(dateTimeUnit >= _self.m_xTimezoneInfo.oneDayUnit.limit) {
					return(1);
				}

				return(0);
			};

			var _didCompareDatetimeInTimezone = function(timeZone, dateTimeUnit) {
				if(timeZone.unit.begin > dateTimeUnit) {
					return(-1);
				}

				if(timeZone.unit.begin <= dateTimeUnit && dateTimeUnit < timeZone.unit.limit) {
					return(0);
				}

				return(1);
			};

			var _didFindTimezoneNoWithDatetimeUnit = function(dateTimeUnit) {
				for(var ii in _self.m_xTimezoneInfo.timeZones) {
					var timeZone = _self.m_xTimezoneInfo.timeZones[ii];
					if(timeZone === undefined || timeZone == null || timeZone.use !== true) {
						continue;
					}

					//
					//
					//
					if(_didCompareDatetimeInTimezone(timeZone, dateTimeUnit) == 0) {
						return(parseInt(ii));
					}
				}
			};

			var _didFindTimezoneNoWithTime = function(argDate, argTime) {
				//
				var dateTimeUnit = xUtils.timeZone.convertDatetimeToTimeunit(argDate, argTime);

				return(_didFindTimezoneNoWithDatetimeUnit(dateTimeUnit));
			};

			this.didInitTimeManager = function(owner) {
				_self.m_xOwner = owner;
			};

			/**
			 * [description]
			 * @param  {[type]} timeType
			 * @param  {[type]} timeGap
			 * @param  {[type]} requestCode
			 * @param  {[type]} businessDate
			 * @param  {[type]} timeZoneInfo
			 * @return [type]
			 */
			this.didClearAndMakeTimeTable = function(timeType, timeGap, requestCode, businessDate, timeZoneInfo, useDefault) {
				_self.m_nTimeType = timeType;
				_self.m_nTimeGap  = timeGap;

				//
				// set server date
				//
				if(timeZoneInfo === undefined || timeZoneInfo == null) {
					// #1252
					if(_self.m_xTimezoneInfo === undefined || _self.m_xTimezoneInfo == null) {
						if(useDefault === true) {
							_self.m_xTimezoneInfo = xUtils.debug.getTimeZoneInfo(requestCode);
							if(_self.m_xTimezoneInfo === undefined || _self.m_xTimezoneInfo == null) {
								return;
							}
						}
					}
				}
				else {
					_self.m_xTimezoneInfo = xUtils.didClone(timeZoneInfo);
					if(_self.m_xTimezoneInfo === undefined || _self.m_xTimezoneInfo == null) {
						return;
					}
				}

				if(businessDate !== undefined && businessDate != null) {
					_self.m_xTimezoneInfo.businessDate = businessDate;
				}

				// check business date
				if(_self.m_xTimezoneInfo.businessDate === undefined || _self.m_xTimezoneInfo.businessDate == null || _self.m_xTimezoneInfo.businessDate < xUtils.constants.ngc.define.NGC_JUL_DATESTART) {
					return;
				}

				var oneDayUnit = {
					begin : null,
					final : null,
					limit : null
				};

				var nTimezoneCount = _self.m_xTimezoneInfo.timeZones.length;
				for(var ii = 0; ii < nTimezoneCount; ii++) {
					var timeZone = _self.m_xTimezoneInfo.timeZones[ii];
					if(timeZone === undefined || timeZone == null || timeZone.use !== true) {
						continue;
					}

					xUtils.timeZone.calculateTimezoneUnit(_self.m_xTimezoneInfo.businessDate, timeZone);

					if(oneDayUnit.begin === undefined || oneDayUnit.begin == null) {
						oneDayUnit.begin = timeZone.unit.begin;
					}

					// #1249
					if(timeZone.unit.final !== undefined && timeZone.unit.final != null) {
						oneDayUnit.final = timeZone.unit.final;
					}

					if(timeZone.unit.limit !== undefined && timeZone.unit.limit != null) {
						oneDayUnit.limit = timeZone.unit.limit;
					}
					//
					// if(ii >= nTimezoneCount - 1) {
					// 	oneDayUnit.final = timeZone.unit.final;
					// 	oneDayUnit.limit = timeZone.unit.limit;
					// }
				}

				_self.m_xTimezoneInfo.oneDayUnit = oneDayUnit;
			};

			/**
			 * タイムテーブルによってデータをマーキングする。（追加するかアップデートするか）
			 * @param  {[type]} timeType
			 * @param  {[type]} timeGap
			 * @param  {[type]} stPrice
			 * @return [type]
			 */
			this.didMarkingTimezoneWithDatetime = function(timeType, timeGap, stPrice, tickCount) {
				var result = {
					valid : true,
					priceDatas : [],
					isAdd : false,
					stPrice : null,
					compare : 0,
					isTickUp : false,
					reason : ""
				};

				var businessDate = _self.m_xTimezoneInfo.businessDate;
				var businessTime = _self.m_xTimezoneInfo.businessTime;

				// 日付および時間をチェックする。営業日ではないデータはすべて捨てる。
				var newDatetimeUnit = xUtils.timeZone.convertDatetimeToTimeunit(stPrice.ymd, stPrice.hms);
				result.compare = _didCompareDatetimeUnitInTimezoneAsOneday(newDatetimeUnit);
				if(result.compare < 0) {
					result.valid = false;
					result.reason = "received datetime is older than business date => Business(" + businessDate + "), Income(" + stPrice.ymd + ")";

					return(result);
				}
				// TODO:
				else if(result.compare > 0) {
					result.valid = false;
					result.reason = "received datetime is over than business date => Business(" + businessDate + "), Income(" + stPrice.ymd + ")";

					return(result);
				}

				// Updateで使用するため、最後のデータを呼び出す。
				var stLastData = _self.m_xOwner.didGetLastData();

				//
				// ティック、日足、週足、月足
				//

				// ティック
				if(timeType === xUtils.constants.timeType.tick) {
					// 以前データが何もない場合はただ追加するだけ
					if(stLastData === undefined || stLastData == null) {
						result.isAdd = true;
						result.stPrice = stPrice;

						return(result);
					}

					var lastDatetimeUnit = xUtils.timeZone.convertDatetimeToTimeunit(stLastData.ymd, stLastData.hms);
					// 以前データより過去のデータの場合は捨てる。
					if(lastDatetimeUnit > newDatetimeUnit) {
						result.valid = false;

						return(result);
					}

					var __tno = 0;

					//
					if(timeGap < 2) {
						// それ以外のデータはすべて追加である。
						result.isAdd = true;
					}
					else {
						//
						if(nTickCount >= timeGap) {
							result.isAdd = true;
						}
						else {
							result.isAdd = false;
							result.isTickUp = true;
						}
					}

					if(result.isAdd === true) {
						if(lastDatetimeUnit === newDatetimeUnit) {
							__tno = stLastData.tno + 1;
						}
					}

					stPrice.tno = __tno;

					result.stPrice = stPrice;

					// just add data
					return(result);
				}
				// 週足
				else if(timeType === xUtils.constants.timeType.week) {
					var weekDay = xUtils.dateTime.defaultWeekday; // #3425
					var xBusinessDate = xUtils.dateTime.convertNumberToDate(businessDate, businessTime);
					var xNewDate = xUtils.dateTime.getDateOfTheWeekAtDate(xBusinessDate, weekDay); // #3425
					stPrice.ymd = xUtils.dateTime.convertDateToNumber(xNewDate);
					stPrice.hms = businessTime;

					// 以前データが何もない場合はただ追加するだけ
					if(stLastData === undefined || stLastData == null) {
						result.isAdd = true;
						result.stPrice = stPrice;

						return(result);
					}

					//
					var xLastDate = xUtils.dateTime.convertNumberToDate(stLastData.ymd, businessTime);
					var xLastWeekDate = xUtils.dateTime.getDateOfTheWeekAtDate(xLastDate, weekDay); // #3425

					//
					var diff = xUtils.dateTime.dateDiff(xLastWeekDate, xNewDate, "week", true);
					// 以前データより過去のデータの場合は捨てる。
					if(diff < 0) {
						result.valid = false;

						return(result);
					}

					// データマージは価格データオブジェクトで行う。
					result.stPrice = stPrice;

					// 大きい場合は追加、そうではない場合は訂正である。
					if(diff > 0) {
						result.isAdd = true;
					}

					return(result);
				}
				// 月足
				else if(timeType === xUtils.constants.timeType.month) {
					var xBusinessDate = xUtils.dateTime.convertNumberToDate(businessDate, businessTime);
					var xNewDate = xUtils.dateTime.getDateOfTheMonthAtDate(xBusinessDate);
					stPrice.ymd = xUtils.dateTime.convertDateToNumber(xNewDate);
					stPrice.hms = businessTime;

					// 以前データが何もない場合はただ追加するだけ
					if(stLastData === undefined || stLastData == null) {
						result.isAdd = true;
						result.stPrice = stPrice;

						return(result);
					}

					var xLastDate = xUtils.dateTime.convertNumberToDate(stLastData.ymd, businessTime);
					var xLastMonthDate = xUtils.dateTime.getDateOfTheMonthAtDate(xLastDate); // #3425

					//
					var diff = xUtils.dateTime.dateDiff(xLastMonthDate, xNewDate, "month", true);
					// 以前データより過去のデータの場合は捨てる。
					if(diff < 0) {
						result.valid = false;

						return(result);
					}

					// データマージは価格データオブジェクトで行う。
					result.stPrice = stPrice;

					// 大きい場合は追加、そうではない場合は訂正である。
					if(diff > 0) {
						result.isAdd = true;
					}

					return(result);
				}
				// 日足
				else if(timeType === xUtils.constants.timeType.day){
					var xBusinessDate = xUtils.dateTime.convertNumberToDate(businessDate, businessTime);
					var xNewDate = xBusinessDate;
					stPrice.ymd = businessDate;
					stPrice.hms = businessTime;

					// 以前データが何もない場合はただ追加するだけ
					if(stLastData === undefined || stLastData == null) {
						result.isAdd = true;
						result.stPrice = stPrice;

						return(result);
					}

					var xLastDate = xUtils.dateTime.convertNumberToDate(stLastData.ymd);

					//
					var diff = xUtils.dateTime.dateDiff(xLastDate, xNewDate, "day", true);
					// 以前データより過去のデータの場合は捨てる。
					if(diff < 0) {
						result.valid = false;

						return(result);
					}

					// データマージは価格データオブジェクトで行う。
					result.stPrice = stPrice;

					// 大きい場合は追加、そうではない場合は訂正である。
					if(diff > 0) {
						result.isAdd = true;
					}

					return(result);
				}

				// TODO:
				if(result.compare > 0) {
					result.valid = false;
					result.reason = "received data is over date.";

					return(result);
				}

				//
				// 分足
				//

				// find new timezone number
				var newTimeZoneNo = _didFindTimezoneNoWithDatetimeUnit(newDatetimeUnit);
				if(newTimeZoneNo === undefined || newTimeZoneNo == null) {
					result.valid = false;

					return(result);
				}

				var newTimeZone = _self.m_xTimezoneInfo.timeZones[newTimeZoneNo];

				// タイムゾーンによって補正されたタイムユニットへ変換する。
				var adjustedDatetimeUnit = xUtils.timeZone.didAdjustDatetimeUnitAsTimezone(newDatetimeUnit, newTimeZone, timeType, timeGap);
				var adjustedDatetime = xUtils.timeZone.convertTimeunitToDatetime(adjustedDatetimeUnit);
				stPrice.ymd = adjustedDatetime.date;
				stPrice.hms = adjustedDatetime.time;

				// 以前データが何もない場合はただ追加するだけ
				if(stLastData === undefined || stLastData == null) {
					result.isAdd = true;
					result.stPrice = stPrice;

					return(result);
				}

				// last data
				var lastDatetimeUnit = xUtils.timeZone.convertDatetimeToTimeunit(stLastData.ymd, stLastData.hms);
				var lastTimeZone;
				var lastTimeZoneNo = _didFindTimezoneNoWithDatetimeUnit(lastDatetimeUnit);
				var isValidLastTimeZone = false;

				if(lastTimeZoneNo !== undefined && lastTimeZoneNo != null) {
					isValidLastTimeZone = true;

					lastTimeZone = _self.m_xTimezoneInfo.timeZones[lastTimeZoneNo];

					// 同一時間帯かをチェックする。
					if(_didCheckSameTimeunit(lastDatetimeUnit, adjustedDatetimeUnit, lastTimeZone, timeType, timeGap)) {
						result.isAdd = false;

						result.stPrice = stPrice;//xUtils.dataConverter.didMergePriceDataWithRealData(stLastData, stPrice);

						return(result);
					}
				}

				// ここからは必ず追加データになる。
				result.isAdd = true;

				// make default data
				var premadeDatas = [];
				var nTimezoneCount = _self.m_xTimezoneInfo.timeZones.length;
				var bAll = false;
				var fromDatetimeUnit;
				var toDatetimeUnit;
				var curTimeZone;
				var extraFlag = false;
				var lastClose = stLastData.close;

				// 以前タイムゾーン
				for(var ii = 0; ii < newTimeZoneNo; ii++) {
					fromDatetimeUnit = null;
					toDatetimeUnit = null;
					extraFlag = false;
					var timeZone = _self.m_xTimezoneInfo.timeZones[ii];
					if(timeZone === undefined || timeZone == null || timeZone.use !== true) {
						continue;
					}

					//
					// 新規データの間に空データを入れる。
					//
					if(bAll !== true) {
						if(lastTimeZoneNo === undefined || lastTimeZoneNo == null) {
							lastTimeZoneNo = ii;
							lastTimeZone = _self.m_xTimezoneInfo.timeZones[lastTimeZoneNo];
							lastDatetimeUnit = lastTimeZone.unit.begin;
						}

						if(ii === lastTimeZoneNo) {
							bAll = true;

							fromDatetimeUnit = lastDatetimeUnit;
							toDatetimeUnit = timeZone.unit.final;

							if(isValidLastTimeZone === true) {
								extraFlag = true;
							}
						}
					}
					else {
						fromDatetimeUnit = timeZone.unit.begin;
						toDatetimeUnit = timeZone.unit.final;
					}

					// 空データを作成し、そのデータを追加しておく。
					if(fromDatetimeUnit != null && toDatetimeUnit != null) {
						var useEqualAlso = true;
						var emptyDatas = _didMakeEmptyDatas(lastClose, fromDatetimeUnit, toDatetimeUnit, timeType, timeGap, extraFlag, useEqualAlso);

						xUtils.didAppendDatas(result.priceDatas, emptyDatas);
					}
				}

				// 新規タイムゾーン
				extraFlag = false;
				if(newTimeZoneNo === lastTimeZoneNo) {
					fromDatetimeUnit = lastDatetimeUnit;

					if(isValidLastTimeZone === true) {
						extraFlag = true;
					}
				}
				else {
					fromDatetimeUnit = newTimeZone.unit.begin;
				}

				toDatetimeUnit = adjustedDatetimeUnit;
				if(fromDatetimeUnit != null && toDatetimeUnit != null) {
					var emptyDatas = _didMakeEmptyDatas(lastClose, fromDatetimeUnit, toDatetimeUnit, timeType, timeGap, extraFlag);

					xUtils.didAppendDatas(result.priceDatas, emptyDatas);
				}

				// データマージは価格データオブジェクトで行う。
				result.stPrice = stPrice;

				return(result);
			};

			/**
			 * タイムテーブルによってデータをマーキングする。（追加するかアップデートするか）
			 * @param  {[type]} timeType
			 * @param  {[type]} timeGap
			 * @param  {[type]} stPrice
			 * @return [type]
			 */
			this.didMakeCloseDateData = function(timeType, timeGap) {
				var result = {
					valid : true,
					priceDatas : [],
					isAdd : false,
					stPrice : null,
					compare : 0,
					isTickUp : false,
					reason : ""
				};

				// Updateで使用するため、最後のデータを呼び出す。
				var stLastData = _self.m_xOwner.didGetLastData();

				// 以前データが何もない場合はただ追加するだけ
				if(stLastData === undefined || stLastData == null) {
					result.valid = false;
					result.reason = "there is no price datas.";

					return(result);
				}

				//
				// ティック、日足、週足、月足
				//

				// 分ではない場合はinvalid
				if(timeType != xUtils.constants.timeType.minute && timeType != xUtils.constants.timeType.hour) { // #3425
					result.valid = false;
					result.reason = "only for minute or hour!!!";

					return(result);
				}

				//
				// 分足
				//

				// last data
				var lastDatetimeUnit = xUtils.timeZone.convertDatetimeToTimeunit(stLastData.ymd, stLastData.hms);
				var lastTimeZone;
				var lastTimeZoneNo = _didFindTimezoneNoWithDatetimeUnit(lastDatetimeUnit);
				var isValidLastTimeZone = false;

				// ここからは必ず追加データになる。
				result.isAdd = true;

				// make default data
				var premadeDatas = [];
				var nTimezoneCount = _self.m_xTimezoneInfo.timeZones.length;
				var bAll = false;
				var fromDatetimeUnit;
				var toDatetimeUnit;
				var curTimeZone;
				var extraFlag = false;
				var lastClose = stLastData.close;

				// 以前タイムゾーン
				for(var ii = lastTimeZoneNo; ii < nTimezoneCount; ii++) {
					fromDatetimeUnit = null;
					toDatetimeUnit = null;
					extraFlag = false;
					var timeZone = _self.m_xTimezoneInfo.timeZones[ii];
					if(timeZone === undefined || timeZone == null || timeZone.use !== true) {
						continue;
					}

					fromDatetimeUnit = timeZone.unit.begin;
					toDatetimeUnit = timeZone.unit.final;

					// #3189
					if(fromDatetimeUnit < lastDatetimeUnit && lastDatetimeUnit < toDatetimeUnit) {
						fromDatetimeUnit = lastDatetimeUnit;
						extraFlag = true;
					}
					// [end] #3189

					// 空データを作成し、そのデータを追加しておく。
					if(fromDatetimeUnit != null && toDatetimeUnit != null) {
						var useEqualAlso = true;
						var emptyDatas = _didMakeEmptyDatas(lastClose, fromDatetimeUnit, toDatetimeUnit, timeType, timeGap, extraFlag, useEqualAlso);

						xUtils.didAppendDatas(result.priceDatas, emptyDatas);
					}
				}

				try {
					var nPriceDataCount = result.priceDatas.length;
					if(nPriceDataCount > 0) {
						var lastDatas = result.priceDatas.splice(nPriceDataCount - 1, 1);

						// データマージは価格データオブジェクトで行う。
						result.stPrice = lastDatas[0];
					}
					else {
						result.valid = false;
						result.reason = "there is no data to add.";
					}
				}
				catch(e) {

				}

				return(result);
			};

			/**
			 * 同一時間ユニットであるかどうかをチェックする。
			 * @param  {[type]} lastDatetimeUnit
			 * @param  {[type]} newDatetimeUnit
			 * @param  {[type]} timeZone
			 * @param  {[type]} timeType
			 * @param  {[type]} timeGap
			 * @return [type]
			 */
			var _didCheckSameTimeunit = function(lastDatetimeUnit, newDatetimeUnit, timeZone, timeType, timeGap) {
				if(timeType !== xUtils.constants.timeType.hour && timeType !== xUtils.constants.timeType.minute) {
					return(true);
				}

				// タイムタイプによる、時間間隔を取得する。
				var timeGapForTimezoneUnit = xUtils.timeZone.didGetTimeGapForTimezoneUnitAs(timeType, timeGap);

				// タイムユニットゾーン情報を計算する。
				var beginTimeunit = lastDatetimeUnit;
				var limitTimeunit = lastDatetimeUnit + timeGapForTimezoneUnit;

				// 制限用のタイムユニットがタイムゾーンの範囲外になった場合はゾーンのリミットまでにする。
				// これはタイムユニットゾーンがタイムゾーンの警戒線になった場合になる。
				// 例として、7分足で9:00スタートの場合、ラスト時間帯が11:27だとすると
				// 本来は11:27 ~ 11:34の間であるが、前場が11:30で終了されるから
				// 後場の開始時間である12:30が適用され、11:27 ~ 12:30になる。
				// #1268
				if(limitTimeunit > timeZone.unit.final) {
				//if(limitTimeunit >= timeZone.unit.final) {
					limitTimeunit = timeZone.unit.limit;
				}

				// タイムユニットゾーンなのかをチェックする。
				if(beginTimeunit <= newDatetimeUnit && newDatetimeUnit < limitTimeunit) {
					return(true);
				}

				return(false);
			};

			/**
			 * リアルデータの時刻によって空いている時間帯のデータは直前バーの終値で空データを作成する必要がある。
			 * ただし、分足のみで限られる。
			 * 元々タイムテーブルを持っているのがその二つしかない。（秒足、時足の世界もあるが、それはここでは処理しない。）
			 * @param  {[type]} closePrice
			 * @param  {[type]} fromDatetimeUnit
			 * @param  {[type]} toDatetimeUnit
			 * @param  {[type]} timeType
			 * @param  {[type]} timeGap
			 * @param  {[type]} extraFlag
			 * @return [type]
			 */
			var _didMakeEmptyDatas = function(closePrice, fromDatetimeUnit, toDatetimeUnit, timeType, timeGap, extraFlag, useEqualAlso) {
				if(timeType !== xUtils.constants.timeType.hour && timeType !== xUtils.constants.timeType.minute) {
					return;
				}

				var results = [];

				var timeGapForTimezoneUnit = xUtils.timeZone.didGetTimeGapForTimezoneUnitAs(timeType, timeGap);

				var fromTu = fromDatetimeUnit;
				var toTu = toDatetimeUnit;

				if(extraFlag === true) {
					fromTu = fromTu + timeGapForTimezoneUnit;
				}

				if(useEqualAlso === true) {
					for(var curTu = fromTu; curTu <= toTu; curTu += timeGapForTimezoneUnit) {
						var stPrice = xUtils.dataConverter.didMakeEmptyPriceData(curTu, closePrice);

						results.push(stPrice);
					}
				}
				else {
					for(var curTu = fromTu; curTu < toTu; curTu += timeGapForTimezoneUnit) {
						var stPrice = xUtils.dataConverter.didMakeEmptyPriceData(curTu, closePrice);

						results.push(stPrice);
					}
				}

				return(results);
			};

			// #1252
			this.isBusinessDateChanged = function(businessDate) {
				if(businessDate === undefined || businessDate == null) {
					return(false);
				}

				if(_self.m_xTimezoneInfo.businessDate === undefined || _self.m_xTimezoneInfo.businessDate == null) {
					return(true);
				}

				if(_self.m_xTimezoneInfo.businessDate < businessDate) {
					return(true);
				}

				if(_self.m_xTimezoneInfo.businessDate > businessDate) {
					// console.debug("[LOG:TM] new business date is past. Incoming(" + businessDate + "), Current(" + _self.m_xTimezoneInfo.businessDate + ")");
				}

				return(false);
			};

			this.didDestroy = function() {
			};
		};

		var CDataHandlerUnit = function(multiTargetId) {
			var _self = this;

			// data handler
			this.m_nMultiTargetId = multiTargetId;
			this.m_xOwner = null;
			this.m_xTimeManager = null;

			this.m_requestInfo = xUtils.dataConverter.didGetDefaultRequestInfo();

			this.didInitDataHandlerUnit = function(owner, timeManager) {
				_self.m_xOwner = owner;
				_self.m_xTimeManager = new CTimeManager();

				_self.m_xTimeManager.didInitTimeManager(_self);
			};

			/**
			 * リアルデータを受信された場合の処理プロセスである。
			 * @param  {Object} stPrice	受信されたリアルデータ
			 * @return {Object} { valid, isNew, priceDatas, stPrice }
			 */
			var _didProcessRealData = function(stPrice) {
				var newDate = stPrice.ymd;
				var newTime = stPrice.hms;

				// TODO: find timeZone
				// 1. 以前データがあるのかをチェックする。
				// 2. 過去データの場合は捨てる。（営業日でないデータは捨てる。）
				// 3. タイムテーブルによってデータをマーキングする。（追加するかアップデートするか）
				// 4. 無効データは捨てる。

				// 新規データのタイムユニットを取得する。
				var dateTimeUnit = xUtils.timeZone.convertDatetimeToTimeunit(newDate, newTime);

				// 最終データのタイムユニットを取得する。
				var lastDatetimeUnit = _self.m_xOwner.didGetLastDatetimeUnit();
				// 過去データなのかをチェックする。
				if(lastDatetimeUnit !== undefined && lastDatetimeUnit != null) {
					if(dateTimeUnit < lastDatetimeUnit) {
						// invalid data
						//console.debug("[LOG:DH] Process real data => Invalid - Reason(past time data is came.) : Last(" + lastDatetimeUnit + "), Income(" + dateTimeUnit + ") => " + JSON.stringify(stPrice));
						return;
					}
				}

				var timeType	= _self.m_requestInfo.nTType;
				var timeGap		= _self.m_requestInfo.nTGap;
				var	tickCount	= _self.m_requestInfo.nTickCount;

				// タイムテーブルによってデータをマーキングする。（追加するかアップデートするか）
				var result = _self.m_xTimeManager.didMarkingTimezoneWithDatetime(timeType, timeGap, stPrice, tickCount);

				// 無効データの場合は捨てる。
				if(result.valid !== true) {
					// console.debug("[LOG:DH] Process real data => Invalid - Reason(past time data is came.) : Last(" + lastDatetimeUnit + "), Income(" + dateTimeUnit + ") => " + JSON.stringify(stPrice));
					return;
				}

				if(result.isAdd) {
					_self.m_requestInfo.nTickCount = 1;
				}
				else {
					if(result.isTickUp === true) {
						_self.m_requestInfo.nTickCount++;
					}
				}

				return(result);
			};

			var _didConvertCandleStickDataToReadablePriceData = function(receiveRawData, tickNo) {
				var stPrice = xUtils.dataConverter.didConvertCandleStickData(receiveRawData);
				if(stPrice === undefined || stPrice == null) {
					return;
				}

				stPrice.tno	= (typeof tickNo === "number") ? tickNo : 0;

				// TODO: do I need to check price validation at real data?

				return(stPrice);
			};

			var _didConvertTickDataToReadablePriceData = function(receiveRawData) {
				var stPrice = xUtils.dataConverter.didConvertTickData(receiveRawData);
				if(stPrice === undefined || stPrice == null) {
					return;
				}

				// TODO: FIX date
				if(stPrice.ymd < xUtils.constants.ngc.define.NGC_JUL_DATESTART) {
					stPrice.ymd = 20100719;
				}

	            return(stPrice);
			};

			/**
			 * [_didConvertRawPriceDataToReadablePriceData description]
			 * @param  {[type]} receiveRawData
			 * @param  {[type]} tickNo
			 * @return {[type]}
			 */
			var _didConvertSerialPriceDataToReadablePriceData = function(receiveRawData, tickNo) {
				var stPrice = xUtils.dataConverter.didConvertSerialData(receiveRawData);
				if(stPrice === undefined || stPrice == null) {
					return;
				}

				return(stPrice);
			};

			var _didConvertCandleStickDatasToReadablePriceDatas = function(receiveRawDatas) {
				var arrRecvDatas = [];
				var arrRecvTimes = [];
				var nRecvCount = receiveRawDatas.length;
				for(var __ii = 0; __ii < nRecvCount; __ii++) {
					var __stRawPrice = receiveRawDatas[__ii];
					var __stPrice = _didConvertCandleStickDataToReadablePriceData(__stRawPrice);
					if(__stPrice === undefined || __stPrice == null) {
						continue;
					}

					arrRecvDatas.push(__stPrice);

					// #1516
					var __strTimeVal = xUtils.dateTime.convertNumberDatetimeToTimelineData(__stPrice.ymd, __stPrice.hms);
					// var __date = xUtils.dateTime.convertNumberToDateString(__stPrice.ymd);
					// var __time = xUtils.dateTime.convertNumberToTimeString(__stPrice.hms);
					// var __strTimeVal = __date + __time;

					arrRecvTimes.push(__strTimeVal);
				}

				var result = {
					datas : arrRecvDatas,
					times : arrRecvTimes
				};

				return(result);
			};

			var _didConvertTickDatasToReadablePriceDatas = function(receiveRawDatas) {
				var arrRecvDatas = [];
				var arrRecvTimes = [];
				var nRecvCount = receiveRawDatas.length;
				for(var __ii = 0; __ii < nRecvCount; __ii++) {
					var __stRawPrice = receiveRawDatas[__ii];
					var __stPrice = _didConvertTickDataToReadablePriceData(__stRawPrice);
					if(__stPrice === undefined || __stPrice == null) {
						continue;
					}

					arrRecvDatas.push(__stPrice);

					// #1516
					var __strTimeVal = xUtils.dateTime.convertNumberDatetimeToTimelineData(__stPrice.ymd, __stPrice.hms);
					// var __date = xUtils.dateTime.convertNumberToDateString(__stPrice.ymd);
					// var __time = xUtils.dateTime.convertNumberToTimeString(__stPrice.hms);
					// var __strTimeVal = __date + __time;

					arrRecvTimes.push(__strTimeVal);
				}

				var result = {
					datas : arrRecvDatas,
					times : arrRecvTimes
				};

				return(result);
			};

			var _didGetBusinessTime = function() {
				try {
					var businessTime = _self.m_xTimeManager.m_xTimezoneInfo.businessTime;

					return(businessTime);
				}
				catch(e) {
					console.error(e);
				}

				return(90000);
			}

			var _didConvertSerialPriceDatasToReadablePriceDatas = function(receiveRawDatas, isTick, isDwm) {
				var arrRecvDatas = [];
				var arrRecvTimes = [];
				var	arrRecvTnos  = [];
				var nRecvCount = receiveRawDatas.length;

				var	preDate;
				var	preTime;

				var businessTime = _didGetBusinessTime();

				for(var __ii = 0; __ii < nRecvCount; __ii++) {
					var __stRawPrice = receiveRawDatas[__ii];
					var __stPrice = _didConvertSerialPriceDataToReadablePriceData(__stRawPrice);
					if(__stPrice === undefined || __stPrice == null) {
						continue;
					}

					var __date = xUtils.dateTime.convertNumberToDateString(__stPrice.ymd);
					var __time;
					if(isDwm === true) {
						__time = xUtils.dateTime.convertNumberToTimeString(businessTime);
					}
					else {
						__time = xUtils.dateTime.convertNumberToTimeString(__stPrice.hms);
					}


					var __tno  = 0;
					var __strTimeVal = __date + __time;

					arrRecvTimes.push(__strTimeVal);

					if(isTick === true && __ii > 0) {
						var preIdx = __ii - 1;
						var __strPreTimeVal = arrRecvTimes[preIdx];
						var __pretno = arrRecvTnos[preIdx];
						if(parseInt(__strPreTimeVal) === parseInt(__strTimeVal)) {
							// same time
							__tno = __pretno + 1;
						}
					}



					arrRecvTnos.push(__tno);

					//
					__stPrice.tno = __tno;
					arrRecvDatas.push(__stPrice);
				}

				var result = {
					datas : arrRecvDatas,
					times : arrRecvTimes,
					tnos  : arrRecvTnos
				};

				return(result);
			};

			this.OnReceiveData = function(receiveRawDatas, requestInfo, timeZoneInfo) {
				var multiTargetId		= _self.m_nMultiTargetId;

				var requestInfo         =
				_self.m_requestInfo		= xUtils.didClone(requestInfo);

				var timeType = requestInfo.nTType;
				var timeGap  = requestInfo.nTGap;

				//
				//
				var businessDate = null;
				_self.m_xTimeManager.didClearAndMakeTimeTable(timeType, timeGap, _self.m_requestInfo.requestCode, businessDate, timeZoneInfo);
				//

				var checkTimeType	= xUtils.timeZone.didCheckTimeType(timeType);
				var	isTick	 		= checkTimeType.isTick;
				var	isDwm	 		= checkTimeType.isDwm;

				var receiveDatas     =
				_self.m_receiveDatas = _didConvertSerialPriceDatasToReadablePriceDatas(receiveRawDatas, isTick, isDwm);

				_self.m_requestInfo.nTType = timeType;
				_self.m_requestInfo.nTGap  = timeGap;

				//
				//_self.m_xTimeManager.didClearAndMakeTimeTable(timeType, timeGap, _self.m_requestInfo.requestCode, businessDate, timeZoneInfo);

				//
				var chartWrap = _self.m_xOwner.didGetChartWrap();
				if(chartWrap !== undefined && chartWrap != null) {
					chartWrap.willBeReceivedData(requestInfo, receiveDatas, undefined, multiTargetId);
					chartWrap.didReceiveData(requestInfo, receiveDatas, undefined, multiTargetId);
					chartWrap.DrawingChartDrawFrame(false);
				}
				else {
					return(false);
				}

				//
				return(true);
			};

			var _didConcatForReceiveDatas = function(oldDatas, newDatas) {
				if(!oldDatas || !newDatas) {
					return;
				}

				try {
					var result = {
						datas : oldDatas.datas.concat(newDatas.datas),
						times : oldDatas.times.concat(newDatas.times),
						tnos  : oldDatas.tnos.concat(newDatas.tnos)
					};

					return(result);
				}
				catch(e) {
					console.error(e);
				}

				return;
			};

			/**
			 * TODO: this methods is delegate method for receiving data
			 *
			 */
			this.OnReceiveNextData = function(receiveRawDatas) {
				var requestInfo = _self.m_requestInfo;

				var timeType	= requestInfo.nTType;
				var timeGap  	= requestInfo.nTGap;

				var checkTimeType	= xUtils.timeZone.didCheckTimeType(timeType);
				var	isTick	 		= checkTimeType.isTick;
				var	isDwm	 		= checkTimeType.isDwm;

				//
				var newReceiveDatas = _didConvertSerialPriceDatasToReadablePriceDatas(receiveRawDatas, isTick, isDwm);
				var oldReceiveDatas = _self.m_receiveDatas;

				var nextCount   = newReceiveDatas.datas.length;

				var receiveDatas     =
				_self.m_receiveDatas = _didConcatForReceiveDatas(newReceiveDatas, oldReceiveDatas);

				//
				var chartWrap = _self.m_xOwner.didGetChartWrap();
				if(chartWrap !== undefined && chartWrap != null) {
					chartWrap.willBeReceivedData(requestInfo, receiveDatas, nextCount);
					chartWrap.didReceiveData(requestInfo, receiveDatas, nextCount);
					chartWrap.DrawingChartDrawFrame(false);
				}
				else {
					return(false);
				}

				//
				return(true);
			};

			this.OnReceiveOrderData = function(receiveDatas) {
				var orderDatas = [];
				var nRecvCount = receiveDatas.length;
				for(var ii = 0; ii < nRecvCount; ii++) {
					var recvData = receiveDatas[ii];

					var orderData;
					try {
						if(recvData.isKv === true) {
							orderData = xUtils.didClone(recvData);
						}
						else {
							orderData = {
								ask : recvData[0],
								buysell : recvData[1],
								price : recvData[2].replace(".", ""),
								volume : recvData[3],
								dateTime : recvData[4],
								cancelableFlag : recvData[5],
								correctableFlag : recvData[6],
								id : recvData[7],
								someFlag : recvData[8],
								toolTipText : recvData[9],
								extraPrice : recvData[10],
								orderJointId : recvData[11],
							};
						}

						orderDatas.push(orderData);
					}
					catch(e) {
						console.error(e);
					}
				}

				//
				var chartWrap = _self.m_xOwner.didGetChartWrap();
				if(chartWrap !== undefined && chartWrap != null) {
					chartWrap.willBeReceivedOrderPositData(true, orderDatas);
					chartWrap.didReceiveOrderPositData(true, orderDatas);
					chartWrap.DrawingChartDrawFrame(false);
				}
				else {
					return(false);
				}

				//
				return(true);
			};

			this.OnReceivePositData = function(receiveDatas) {
				var positDatas = [];
				var nRecvCount = receiveDatas.length;
				for(var ii = 0; ii < nRecvCount; ii++) {
					var recvData = receiveDatas[ii];

					var positData;
					try {
						if(recvData.isKv === true) {
							positData = xUtils.didClone(recvData);
						}
						else {
							positData = {
								ask : recvData[0],
								buysell : recvData[1],
								price : parseInt(recvData[2].replace(".", "")),
								volume : recvData[3],
								dateTime : recvData[4],
								checkSettlementFlag : recvData[5],
								id : recvData[6],
								toolTipText : recvData[7]
							};
						}

						positDatas.push(positData);
					}
					catch(e) {
						console.error(e);
					}
				}

				//
				var chartWrap = _self.m_xOwner.didGetChartWrap();
				if(chartWrap !== undefined && chartWrap != null) {
					chartWrap.willBeReceivedOrderPositData(false, positDatas);
					chartWrap.didReceiveOrderPositData(false, positDatas);
					chartWrap.DrawingChartDrawFrame(false);
				}
				else {
					return(false);
				}

				//
				return(true);
			};

			// #1878
			this.OnReceiveAlertData = function(receiveDatas) {
				var alertDatas = [];
				var nRecvCount = receiveDatas.length;
				for(var ii = 0; ii < nRecvCount; ii++) {
					var recvData = receiveDatas[ii];

					var alertData;
					try {
						if(recvData.isKv === true) {
							alertData = xUtils.didClone(recvData);
						}
						else {
							alertData = {
								ask : recvData[0],
								title : recvData[1],
								price : recvData[2].replace(".", ""),
								dateTime : recvData[3],
								availableFlag : recvData[4],
								id : recvData[5],
								toolTipText : recvData[6]
							};
						}

						alertDatas.push(alertData);
					}
					catch(e) {
						console.error(e);
					}
				}

				//
				var chartWrap = _self.m_xOwner.didGetChartWrap();
				if(chartWrap !== undefined && chartWrap != null) {
					chartWrap.willBeReceivedAlertExecutionData(true, alertDatas);
					chartWrap.didReceiveAlertExecutionData(true, alertDatas);
					chartWrap.DrawingChartDrawFrame(false);
				}
				else {
					return(false);
				}

				//
				return(true);
			};

			this.OnReceiveExecutionData = function(receiveDatas) {
				var executionDatas = [];
				var nRecvCount = receiveDatas.length;
				for(var ii = 0; ii < nRecvCount; ii++) {
					var recvData = receiveDatas[ii];

					var executionData;
					try {
						if(recvData.isKv === true) {
							executionData = xUtils.didClone(recvData);
						}
						else {
							executionData = {
								ask : recvData[0],
								buysell : recvData[1],
								price : parseInt(recvData[2].replace(".", "")),
								volume : recvData[3],
								dateTime : recvData[4],
								availableFlag : recvData[5],
								id : recvData[6],
								toolTipText : recvData[7]
							};
						}

						executionDatas.push(executionData);
					}
					catch(e) {
						console.error(e);
					}
				}

				//
				var chartWrap = _self.m_xOwner.didGetChartWrap();
				if(chartWrap !== undefined && chartWrap != null) {
					chartWrap.willBeReceivedAlertExecutionData(false, executionDatas);
					chartWrap.didReceiveAlertExecutionData(false, executionDatas);
					chartWrap.DrawingChartDrawFrame(false);
				}
				else {
					return(false);
				}

				//
				return(true);
			};
			// [end] #1878

			/**
			 *
			 *
			 * @param {any} receiveData
			 */
			this.OnReceiveRealData = function(receiveData, bDraw) {
				var multiTargetId	= _self.m_nMultiTargetId;
				var chartWrap 		= _self.m_xOwner.didGetChartWrap();
				if(chartWrap !== undefined && chartWrap != null) {
					chartWrap.willBeReceivedRealData(receiveData, multiTargetId);
					chartWrap.didReceiveRealData(receiveData, multiTargetId);
					if(bDraw === true) {
						chartWrap.DrawingChartDrawFrame(false);
					}
				}
				else {
					return(false);
				}

				//
				return(true);
			};

			/**
			 *
			 *
			 * @param {any} receiveData
			 */
			this.OnReceiveRealDatas = function(receiveDatas) {
				var chartWrap = _self.m_xOwner.didGetChartWrap();
				if(chartWrap === undefined || chartWrap == null || !chartWrap.DrawingChartDrawFrame) {
					return(false);
				}

				if(receiveDatas === undefined || receiveDatas == null) {
					return(false);
				}

				var nCount = receiveDatas.length;
				if(nCount === undefined || nCount == null || nCount < 1) {
					return(false);
				}

				var failCount = 0;

				for(var ii = 0; ii < nCount; ii++) {
					try {
						var stPrice = receiveDatas[ii];

						var receiveData = _didProcessRealData(stPrice);
						if(receiveData === undefined || receiveData == null) {
							//console.debug("[LOG:DH] TICK data is wrong format data. => " + JSON.stringify(receiveData));
							failCount++;
							continue;
						}

						if(receiveData.valid !== true) {
							//console.debug("[LOG:DH] TICK data is invalid. => " + JSON.stringify(receiveData));
							failCount++;
							continue;
						}

						//console.debug("[LOG:DHOnReceiveRealData2 ==> " + JSON.stringify(receiveData));

						_self.OnReceiveRealData(receiveData);
					}
					catch(e) {
						console.error(e);
						failCount++;
					}
				}

				// if(failCount > 0) {
				// 	return(false);
				// }

				chartWrap.DrawingChartDrawFrame(false);

				return(true);
			};

			/**
			 *
			 *
			 * @param {any} receiveData
			 */
			this.OnReceiveRealDataAsCandleStick= function(receiveRawData) {
				var stPrice = _didConvertCandleStickDataToReadablePriceData(receiveRawData);
				var receiveData = _didProcessRealData(stPrice);
				if(receiveData === undefined || receiveData == null) {
					//console.debug("[LOG:DH] TICK data is wrong format data. => " + JSON.stringify(receiveRawData));
					return;
				}

				if(receiveData.valid !== true) {
					//console.debug("[LOG:DH] TICK data is invalid. => " + JSON.stringify(receiveRawData));
					return;
				}

				//console.debug("[LOG:DH] OnReceiveRealData2 ==> " + JSON.stringify(receiveData));

				//
				var chartWrap = _self.m_xOwner.didGetChartWrap();
				if(chartWrap !== undefined && chartWrap != null) {
					chartWrap.willBeReceivedRealData(receiveData);
					chartWrap.didReceiveRealData(receiveData);
					chartWrap.DrawingChartDrawFrame(false);
				}
				else {
					return(false);
				}

				//
				return(true);
			};

			/**
			 *
			 *
			 * @param {any} receiveData
			 */
			this.OnReceiveRealDataAsTick= function(receiveRawData) {
				var stPrice = _didConvertTickDataToReadablePriceData(receiveRawData);
				var receiveData = _didProcessRealData(stPrice);
				if(receiveData === undefined || receiveData == null) {
					//console.debug("[LOG:DH] TICK data is wrong format data. => " + JSON.stringify(receiveRawData));
					return;
				}

				//console.debug("[LOG:DH] OnReceiveRealData2 ==> " + JSON.stringify(receiveData));

				//
				var chartWrap = _self.m_xOwner.didGetChartWrap();
				if(chartWrap !== undefined && chartWrap != null) {
					chartWrap.willBeReceivedRealData(receiveData);
					chartWrap.didReceiveRealData(receiveData);
					chartWrap.DrawingChartDrawFrame(false);
				}
				else {
					return(false);
				}

				//
				return(true);
			};

			// #1252
			this.OnReceiveBusinessDate = function(businessDate, bDraw, timeZoneInfo) { // #3414
				if(businessDate === undefined || businessDate == null) {
					return;
				}

				if(!_self.m_xTimeManager) {
					return;
				}

				var requestInfo = _self.m_requestInfo;

				var timeType = requestInfo.nTType;
				var timeGap  = requestInfo.nTGap;

				// #3425
				var xResult;
				if(timeType == xUtils.constants.timeType.minute || timeType == xUtils.constants.timeType.hour) {
					xResult = _self.m_xTimeManager.didMakeCloseDateData(timeType, timeGap); // make rest data for current date
				}

				_self.m_xTimeManager.didClearAndMakeTimeTable(timeType, timeGap, requestInfo.requestCode, businessDate, timeZoneInfo); // #3414

				// make close data only for minute or hour
				if(timeType == xUtils.constants.timeType.minute || timeType == xUtils.constants.timeType.hour) {
					if(xResult && xResult.valid == true) {
						var receiveData = xResult;
						//console.debug("[LOG:DHOnReceiveRealData2 ==> " + JSON.stringify(receiveData));
						// console.debug("[WGC] :" + receiveData);
						_self.OnReceiveRealData(receiveData);
					}
				}
				// [end] #3425

				if(bDraw == true) {
					var chartWrap = _self.m_xOwner.didGetChartWrap();
					if(chartWrap && chartWrap.DrawingChartDrawFrame) {
						chartWrap.DrawingChartDrawFrame(false);
					}
				}
			};

			//
			this.didGetLastData = function() {
				if(_self.m_xOwner === undefined || _self.m_xOwner == null) {
					return;
				}

				return(_self.m_xOwner.didGetLastData(_self.m_nMultiTargetId));
			};

			this.didGetLastDatetimeUnit = function() {
				if(_self.m_xOwner === undefined || _self.m_xOwner == null) {
					return;
				}

				return(_self.m_xOwner.didGetLastDatetimeUnit(_self.m_nMultiTargetId));
			};

			this.didDestroy = function() {
				if(_self.m_xTimeManager) {
					_self.m_xTimeManager.didDestroy();
					delete _self.m_xTimeManager;
					_self.m_xTimeManager = null;
				}
			};
		};

		var CDataHandler = function() {
			var _self = this;

			// data converter
			this.m_xOwner = null;

			this.m_xHandlerUnit = null;
			this.m_xTimeManager = null;

			this.didInitDataHandler = function(owner) {
				_self.m_xOwner = owner;

				_self.m_xHandlerUnit = new CDataHandlerUnit();
				_self.m_xTimeManager = new CTimeManager();

				//
				_self.m_xHandlerUnit.didInitDataHandlerUnit(_self, _self.m_xTimeManager);
				_self.m_xTimeManager.didInitTimeManager(_self);
			};

			this.didGetLastData = function(id) {
				if(_self.m_xOwner === undefined || _self.m_xOwner == null) {
					return;
				}

				return(_self.m_xOwner.didGetLastData(id));
			};

			this.didGetLastDatetimeUnit = function(id) {
				if(_self.m_xOwner === undefined || _self.m_xOwner == null) {
					return;
				}

				return(_self.m_xOwner.didGetLastDatetimeUnit(id));
			};

			this.didDestroy = function() {
				delete _self.m_xHandlerUnit;
				delete _self.m_xTimeManager;

				_self.m_xHandlerUnit = null;
				_self.m_xTimeManager = null;
			};

			//
			// OnXxx handler
			//

			this.OnReceiveData = function(receiveRawDatas, requestInfo, timeZoneInfo) {
				if(_self.m_xHandlerUnit === undefined || _self.m_xHandlerUnit == null) {
					return;
				}

				return(_self.m_xHandlerUnit.OnReceiveData(receiveRawDatas, requestInfo, timeZoneInfo));
			};

			this.OnReceiveNextData = function(receiveRawDatas) {
				if(_self.m_xHandlerUnit === undefined || _self.m_xHandlerUnit == null) {
					return;
				}

				return(_self.m_xHandlerUnit.OnReceiveNextData(receiveRawDatas));
			};

			this.OnReceiveOrderData = function(receiveDatas) {
				if(_self.m_xHandlerUnit === undefined || _self.m_xHandlerUnit == null) {
					return;
				}

				return(_self.m_xHandlerUnit.OnReceiveOrderData(receiveDatas));
			};

			this.OnReceivePositData = function(receiveDatas) {
				if(_self.m_xHandlerUnit === undefined || _self.m_xHandlerUnit == null) {
					return;
				}

				return(_self.m_xHandlerUnit.OnReceivePositData(receiveDatas));
			};

			// #1878
			this.OnReceiveAlertData = function(receiveDatas) {
				if(_self.m_xHandlerUnit === undefined || _self.m_xHandlerUnit == null) {
					return;
				}

				return(_self.m_xHandlerUnit.OnReceiveAlertData(receiveDatas));
			};

			this.OnReceiveExecutionData = function(receiveDatas) {
				if(_self.m_xHandlerUnit === undefined || _self.m_xHandlerUnit == null) {
					return;
				}

				return(_self.m_xHandlerUnit.OnReceiveExecutionData(receiveDatas));
			};
			// [end] #1878

			this.OnReceiveRealData = function(receiveData) {
				if(_self.m_xHandlerUnit === undefined || _self.m_xHandlerUnit == null) {
					return;
				}

				return(_self.m_xHandlerUnit.OnReceiveRealData(receiveData));
			};

			this.OnReceiveRealDatas = function(receiveDatas) {
				if(_self.m_xHandlerUnit === undefined || _self.m_xHandlerUnit == null) {
					return;
				}

				return(_self.m_xHandlerUnit.OnReceiveRealDatas(receiveDatas));
			};

			this.OnReceiveRealDataAsCandleStick= function(receiveRawData) {
				if(_self.m_xHandlerUnit === undefined || _self.m_xHandlerUnit == null) {
					return;
				}

				return(_self.m_xHandlerUnit.OnReceiveRealDataAsCandleStick(receiveRawData));
			};

			this.OnReceiveRealDataAsTick= function(receiveRawData) {
				if(_self.m_xHandlerUnit === undefined || _self.m_xHandlerUnit == null) {
					return;
				}

				return(_self.m_xHandlerUnit.OnReceiveRealDataAsTick(receiveRawData));
			};

			this.didGetChartWrap = function() {
				if(_self.m_xOwner === undefined || _self.m_xOwner == null) {
					return;
				}

				return(_self.m_xOwner.m_chartWrap);
			};

			this.didClearDatas = function() {
			};
		};

		var CDataHandlerEx = function() {
			var _self = this;

			// data converter
			this.m_xOwner = null;

			this.m_nUnitId = 0;
			this.m_xHandlerUnits = {};

			this.didCreateDataHandlerUnit = function(id) {
				if(id === undefined || id == null) {
					id = 0;
				}

				var xHandlerUnit = new CDataHandlerUnit(id);

				xHandlerUnit.didInitDataHandlerUnit(_self);

				_self.m_xHandlerUnits[id] = xHandlerUnit;

				return(xHandlerUnit);
			};

			this.didInitDataHandler = function(owner) {
				_self.m_xOwner = owner;
			};

			this.didGetLastData = function(id) {
				if(_self.m_xOwner === undefined || _self.m_xOwner == null) {
					return;
				}

				return(_self.m_xOwner.didGetLastData(id));
			};

			this.didGetLastDatetimeUnit = function(id) {
				if(_self.m_xOwner === undefined || _self.m_xOwner == null) {
					return;
				}

				return(_self.m_xOwner.didGetLastDatetimeUnit(id));
			};

			this.didDestroy = function() {
				_self.didClearDatas();
			};

			this.didGetDataHandlerUnit = function(id) {
				id = id || 0; // #1443
				var xHandlerUnit = _self.m_xHandlerUnits[id];
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					xHandlerUnit = _self.didCreateDataHandlerUnit(id);
				}

				return(xHandlerUnit);
			};

			//
			// OnXxx handler
			//

			this.OnReceiveData = function(receiveRawDatas, requestInfo, timeZoneInfo, multiTargetId) {
				var xHandlerUnit = _self.didGetDataHandlerUnit(multiTargetId);
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceiveData(receiveRawDatas, requestInfo, timeZoneInfo));
			};

			this.OnReceiveNextData = function(receiveRawDatas) {
				var xHandlerUnit = _self.didGetDataHandlerUnit();
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceiveNextData(receiveRawDatas));
			};

			this.OnReceiveOrderData = function(receiveDatas) {
				var xHandlerUnit = _self.didGetDataHandlerUnit();
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceiveOrderData(receiveDatas));
			};

			this.OnReceivePositData = function(receiveDatas) {
				var xHandlerUnit = _self.didGetDataHandlerUnit();
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceivePositData(receiveDatas));
			};

			// #1878
			this.OnReceiveAlertData = function(receiveDatas) {
				var xHandlerUnit = _self.didGetDataHandlerUnit();
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceiveAlertData(receiveDatas));
			};

			this.OnReceiveExecutionData = function(receiveDatas) {
				var xHandlerUnit = _self.didGetDataHandlerUnit();
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceiveExecutionData(receiveDatas));
			};
			// [end] #1878

			this.OnReceiveRealData = function(receiveData, multiTargetId) {
				var xHandlerUnit = _self.didGetDataHandlerUnit(multiTargetId);
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceiveRealData(receiveData));
			};

			this.OnReceiveRealDatas = function(receiveDatas, multiTargetId) {
				var xHandlerUnit = _self.didGetDataHandlerUnit(multiTargetId);
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceiveRealDatas(receiveDatas));
			};

			this.OnReceiveRealDataAsCandleStick= function(receiveRawData) {
				var xHandlerUnit = _self.didGetDataHandlerUnit();
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceiveRealDataAsCandleStick(receiveRawData));
			};

			this.OnReceiveRealDataAsTick= function(receiveRawData) {
				var xHandlerUnit = _self.didGetDataHandlerUnit();
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceiveRealDataAsTick(receiveRawData));
			};

			// #1252
			this.OnReceiveBusinessDate= function(businessDate, bDraw, timeZoneInfo) { // #3414
				var xHandlerUnit = _self.didGetDataHandlerUnit();
				if(xHandlerUnit === undefined || xHandlerUnit == null) {
					return;
				}

				return(xHandlerUnit.OnReceiveBusinessDate(businessDate, bDraw, timeZoneInfo)); // #3414
			};
			//

			this.didGetChartWrap = function() {
				if(_self.m_xOwner === undefined || _self.m_xOwner == null) {
					return;
				}

				return(_self.m_xOwner.m_chartWrap);
			};

			this.didClearDatas = function() {
				var keys = Object.keys(_self.m_xHandlerUnits);
				var nCount = keys.length;
				for(var ii = 0; ii < nCount; ii++) {
					var key = keys[ii];
					var xHandlerUnit = _self.m_xHandlerUnits[key];
					xHandlerUnit.didDestroy();
					delete(_self.m_xHandlerUnits[ii]);
				}

				_self.m_xHandlerUnits = {};
			};
		};

		var exports = {};

		exports.didGetDataHandler = function(owner) {
			var xDataHandler = new CDataHandler();
			xDataHandler.didInitDataHandler(owner);
			return(xDataHandler);
		};

		exports.didGetDataHandlerEx = function(owner) {
			var xDataHandler = new CDataHandlerEx();
			xDataHandler.didInitDataHandler(owner);
			return(xDataHandler);
		};

		return(exports);
	};

	//console.debug("[MODUEL] Loading => chartDataHandler");

	// Enable module loading if available
	if (global["WGC_CHART"]) {
		global["WGC_CHART"]["chartDataHandler"] =
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
        define("ngc/chartDataHandler",
            ['ngc/chartUtil'],
                function(xUtils) {
                    return loadModule(xUtils);
                });
    } else { // Shim
        if (!global["WGC_CHART"]) global["WGC_CHART"] = {};
        global["WGC_CHART"]["chartDataHandler"] =
            loadModule(
                global["WGC_CHART"]["chartUtil"]
            );
    }

	//console.debug("[MODUEL] Loaded => chartDataHandler");
})(this);
