/**
 * @file 	commonUtil.js
 * @brief
 * @author	choi sunwoo
 * @date 	2017.04.25
 */

 //
 //
 //
 import * as CommonConst from '../const/commonConst';
 import * as CommonEnum from '../const/commonEnum';
 import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';	// #1439

declare var $:any;
declare var jQuery;
declare var moment:any;
declare var BigDecimal:any;

/**
 * get product type from meigara code
 * @param  {[type]} meigaraCode
 * @return {string}
 */
export function GetProductTypeFromMeigaraCode(meigaraCode) {
	// let codeLen:number = meigaraCode ? meigaraCode.length : 0;

	// let productType:string = CommonConst.WS_PRODUCT_TYPE_LIST['STOCK'];
	// if(codeLen == CommonConst.INDEX_CODE_LEN) {
	// 	productType = CommonConst.WS_PRODUCT_TYPE_LIST['INDEX'];
	// }
	// else if(codeLen == CommonConst.FOP_CODE_LEN) {
	// 	if(meigaraCode[1] == '6') {  // future
	// 		productType = CommonConst.WS_PRODUCT_TYPE_LIST['INDEX_FUTURES'];
	// 	}
	// 	else {  // option
	// 		productType = CommonConst.WS_PRODUCT_TYPE_LIST['INDEX_OPTIONS'];
	// 	}
	// }

	// return(productType);
	return '';
}

/**
 * get product type from meigara code
 * @param  {[type]} meigaraCode
 * @return {string}
 */
export function GetProductTypeFromSymbolCode(symbolCode) {
	// let codeLen:number = symbolCode ? symbolCode.length : 0;

	// let productType:string = CommonConst.WS_PRODUCT_TYPE_LIST['STOCK'];
	// if(codeLen == CommonConst.INDEX_CODE_LEN) {
	// 	productType = CommonConst.WS_PRODUCT_TYPE_LIST['INDEX'];
	// }
	// else if(codeLen == CommonConst.FOP_CODE_LEN) {
	// 	if(symbolCode[1] == '6') {  // future
	// 		productType = CommonConst.WS_PRODUCT_TYPE_LIST['INDEX_FUTURES'];
	// 	}
	// 	else {  // option
	// 		productType = CommonConst.WS_PRODUCT_TYPE_LIST['INDEX_OPTIONS'];
	// 	}
	// }

	// return(productType);
	return '';
}

export function DeepCopy(argObject) {
	try {
		if ($ === undefined || jQuery === undefined) {
			return;
		}

		//return ($.extend({}, arg));
		return ($.extend(true, {}, argObject));
	}
	catch(e) {
		console.error(e);
	}
}

export function ConvertSimpleDateFromBusinessDate(businessDate:string) : string{
	if(!businessDate) {
		return;
	}

	let temp = businessDate.replace(/-/g, '');

	return(temp.replace(/\//g, ''));
}

export function FormatDate(date, format) {
	if (!format) {
		format = 'YYYY-MM-DD hh:mm:ss.SSS';
	}

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
}

export function ConvertNumberToDate(argDate:number) : Date {
	let year:number  = parseInt(String(argDate / 10000));
	// month is start with 0(0 ~ 11)
	let month:number = (parseInt(String(argDate / 100)) % 100) - 1;
	let day:number   = parseInt(String(argDate % 100));

	return(new Date(year, month, day));
}

export function ConvertDateToNumber(argDate:Date) : number{
	 if(typeof argDate !== "object") {
		 return;
	 }

	 var year  = argDate.getFullYear();
	 var month = argDate.getMonth() + 1;
	 var day   = argDate.getDate();

	 var ret = year * 10000 + month * 100 + day;

	 return(ret);
}

export function GetDateOfTheWeekAtDate(date) : any {
	var week = 1; // monday

	var weekOfDate = date.getDay();
	var diff = week - weekOfDate;

	date.setDate(date.getDate() + diff);
	return (date);
}

/**
 * 月の一日の日付で返却する。
 * @param  {[type]} date
 * @return [type]
 */
export function GetDateOfTheMonthAtDate(date) : any {
	var year = date.getFullYear();
	var month= date.getMonth();
	var day  = 1; // 一日にする。

	return(new Date(year, month, day));
};

export function IsTopix(tickUnit: string) : boolean {
	// not topix
  if(tickUnit == '0' || tickUnit == '256') {
		return(false);
  }
  else {  // topix
    return(true);
  }
}

export function GetDecimalPointByTickUnit(tickUnit: string) : number {
	// 課題管理４２参考
	// 先OPは小数点0で処理頂ければ問題ない認識です。
	if(tickUnit === undefined || tickUnit == null) {
		return(0);
	}

	//
	if(IsTopix(tickUnit) === true) {
		return(1);
	}
	else {
		return(0);
	}
}

export function GetDecimalPointFromMeigaraInfo(meigaraInfo:any, productType?:string) {
	if(productType === CommonConst.PRODUCT_TYPE_ITEM_INDEX) {
			return(2);
	}

	if(meigaraInfo === undefined || meigaraInfo == null || meigaraInfo.marketList === undefined || meigaraInfo.marketList == null) {
		return(0);
	}

	let market:any;

	if(meigaraInfo.marketList.length === undefined || meigaraInfo.marketList.length == null) {
		market = meigaraInfo.marketList.market;
	}
	else {
		if(meigaraInfo.marketList.length < 1) {
			return(0);
		}

		market = meigaraInfo.marketList[0];
	}

	if(market === undefined || market == null) {
		return(0);
	}

	return(GetDecimalPointByTickUnit(market.tickUnit));
}

export function GetSisuNameByCode(code:string) : string {
	try {
		return(CommonConst.INDEX_LIST[code]);
	}
	catch(e) {
		console.error(e);
	}

	return("");
}

export function GetComma( v ) {
	return ( String( v ).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,' ) );
}

export function GetPointValue(p:any, useComma?:boolean) {
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

	var nPointed = strTemp.length - pointValue;
	var strNonPoint;
	if(useComma === true) {
		strNonPoint = GetComma(strTemp.substring(0, (nPointed)));
	}
	else {
		strNonPoint = strTemp.substring(0, (nPointed));
	}
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
}

export function setPagingActive(self: any) {
    if (self.currentPage <= 1) {
      $(self.element.nativeElement.querySelectorAll("[aria-label='Previous']")).each((idx, e) => {
        $(e).addClass('disable');
      });
    }
    if (self.currentPage > 1) {
      $(self.element.nativeElement.querySelectorAll("[aria-label='Previous']")).each((idx, e) => {
        $(e).removeClass('disable');
      });
    }
    if (self.currentPage < self.totalPage) {
      $(self.element.nativeElement.querySelectorAll("[aria-label='Next']")).each((idx, e) => {
        $(e).removeClass('disable');
      });
    }
    if (self.currentPage >= self.totalPage) {
      $(self.element.nativeElement.querySelectorAll("[aria-label='Next']")).each((idx, e) => {
        $(e).addClass('disable');
      });
    }
}

export function getXmlProperty(layout: any, depth: number = null) {
  var keys = Object.keys(layout);
  var result = '';
  var childNode = [];
  var addResult = '';

  keys.forEach(key => {
    if (layout[key] instanceof Object && !(layout[key] instanceof Array)){
      // 連想配列
      addResult += `<${key}` + getXmlProperty(layout[key]) + `</${key}>`;
    } else if (layout[key] instanceof Array) {
      // array type
      childNode.push({ key: key, val: layout[key] });
    } else {
      // property
      result += ` ${key}="${layout[key]}"`;
    }
  })

  // close node.
  result += '>';

  // get child node xml
  if (childNode.length) {
    var idx = 0;

    childNode.forEach(cld => {
      cld.val.forEach(node => {
        result += `<${cld.key}` + getXmlProperty(node, idx++) + `</${cld.key}>`;
      });
    });
  }

  result += addResult;

  return result;
}

export function addDay(step: number, baseDate?:Date): Date {
	let dt = (baseDate === undefined ? new Date() : new Date(baseDate.getTime()));
	dt.setDate(dt.getDate() + step);
	return dt;
}

export function addMonth(step: number, baseDate?:Date): Date {
	let dt = (baseDate === undefined ? new Date() : new Date(baseDate.getTime()));
	dt.setMonth(dt.getMonth() + step);
	return dt;
}

export function IsArray(object:any) {
	return(Array.isArray(object));
}

export function AppendDatas(target, source) {
	if(typeof target !== "object") {
		return;
	}

	var push = Array.prototype.push;

	push.apply(target, source);
}

export function DetectChange(changeRef:ChangeDetectorRef, isMark?:boolean) {
  if(changeRef) {
    if(isMark === true) {
      changeRef.markForCheck();
    }
    else {
      changeRef.detectChanges();
    }
  }
}

//format money string: xxx,xxx.xx 
export function formatNumber(s, n):string
{
   let num = parseFloat(s);

   let decNum = n;
   let strNum = parseFloat((s + "").replace('-','').replace(/[^\d\.-]/g, "")).toFixed(decNum) + "";
   let strLeft = strNum.split(".")[0].split("").reverse();
   let strRight = strNum.split(".")[1];
   let strReturn = "";
   for(var i = 0; i < strLeft.length; i ++ )
   {
		strReturn += strLeft[i] + ((i + 1) % 3 == 0 && (i + 1) != strLeft.length ? "," : "");
   }
   return (num<0?"-":"") + strReturn.split("").reverse().join("") + (decNum>0?("." + strRight):"");
}

// grid control ArrowUp & ArrowDown
export function keyUpDown(grid, event, ui, group=false) {
	let indx 	= ui.rowIndx;
	let pm  	= grid.pqGrid( "option", "pageModel" );
	let ofs 	= (pm.curPage-1) * pm.rPP;

	if(event.key=='ArrowDown') {
		let next = indx + 1;
		if (group) {
			let dataCount = 0;
			let skipFlg = true;
			while (true) {
				let rowData = grid.pqGrid( "getRowData", {rowIndxPage: dataCount} );
				if (rowData.length == 1) {
					break;
				}
				if (dataCount > indx - ofs && rowData.pq_hidden && skipFlg) {
					next++;
				} else if (dataCount > indx - ofs && !rowData.pq_hidden) {
					skipFlg = false;
				}
				dataCount++;
			}
		}
		let pgMx = ofs + pm.rPP;
		if(next < pgMx){
			grid.pqGrid( "setSelection", null );
			grid.pqGrid( "setSelection", {rowIndx: next} );
		}
		return;
	}

	if(event.key=='ArrowUp') {
		let pgMn = Math.max(0, ofs);
		let prev = indx - 1;
		if (group) {
			let dataCount = 0;
			while (true) {
				let rowData = grid.pqGrid( "getRowData", {rowIndxPage: prev - ofs} );
				if (!rowData.pq_hidden || prev - ofs == 0) {
					break;
				}
				prev--;
			}
		}
		if(prev >= pgMn){
			grid.pqGrid( "setSelection", null );
			grid.pqGrid( "setSelection", {rowIndx:prev} );
		}
		return;
	}
}

// #2338
export function AwakeContextMenu($event?:any, domElemSpecial?:any) {
	if(domElemSpecial) {
		// to force show context menu
    setTimeout(() => {
			try {
				$(domElemSpecial).trigger('click');
				return;
			}
			catch(e) {
				console.error(e);
			}
    });
		//
	}

	if($event) {
		// to force show context menu
    setTimeout(() => {
			try {
				$($event.currentTarget).trigger('click');
			}
			catch(e) {
				console.error(e);
			}
    });
		//
	}

	// stop contextmenu drag
	setTimeout(()=> {
			let as = $(".ngx-contextmenu ul.dropdown-menu li a");
			let menu = $(".ngx-contextmenu ul.dropdown-menu");
			let offset = menu.offset();
			let oldIdx;
      if (as.length > 0) {
        as.each(function(idx) {
            this.ondragstart = function(){
              return false;
			}
			$(as[idx]).bind("mouseenter", () => {
				oldIdx = idx;
			});
			$(as[idx]).bind("mouseout", () => {
				$(as[oldIdx]).blur();
			});
			$(as[idx]).bind("mouseover", () => {
				$(as[idx]).focus();
			});
        })
			}
			if (offset.top < 0) {
				menu.css("margin-top",0);
				menu.css("top",25);
			}
    }, 100);
}
//

// #2322
export function AwakeDetectChange(domElemSpecial:any) {
	if(domElemSpecial) {
		// to force show context menu
    setTimeout(() => {
			try {
				$(domElemSpecial).trigger('click');
				return;
			}
			catch(e) {
				console.error(e);
			}
    });
		//
	}
}
//

export function GetAttentionMessage(attentionProductList:any):string {

	let message = "";
	for(let attent of attentionProductList){
		if(attent.startDate == null){
			if(attent.ratio ==null){
				message += (moment(attent.applyDate,'YYYYMMDD').format('YYYY/MM/DD') + ' ' + attent.attentionType + '\n');
			}else{
				message += (moment(attent.applyDate,'YYYYMMDD').format('YYYY/MM/DD') + ' ' + attent.ratio + ' ' + attent.attentionType + "\n");
			}
		}else{
			if(attent.endDate ==null){
				message += (moment(attent.startDate,'YYYYMMDD').format('YYYY/MM/DD')+"~"+ ' ' + attent.attentionType + '\n');
			}else{
				message += (moment(attent.startDate,'YYYYMMDD').format('YYYY/MM/DD') + "~" + moment(attent.endDate,'YYYYMMDD').format('YYYY/MM/DD')+ ' ' + attent.attentionType + '\n');
			}
		}
	}
	return message;
}

export function SetSelectd(e:KeyboardEvent, grid:any, seletedIndex:number) {
	if(e.keyCode == 38 || e.keyCode == 40){
		if (grid) {
			if (seletedIndex == null) {
				grid.pqGrid( "setSelection", {rowIndxPage:0} );
			} else {
				grid.pqGrid( "setSelection", {rowIndx:seletedIndex} );
			}
		}
	}
}

export function calcBaseProfit(cPrice:number,qPrice:number,askbid:number,cCnt:number,tUnit:number, convbid:number, floatingpos:number){
    let cPriceBig = new BigDecimal(cPrice.toString());
    let qPriceBig = new BigDecimal(qPrice.toString());
    let askbidBig = new BigDecimal(askbid.toString());
    let cCntBig = new BigDecimal(cCnt.toString());
    let tUnitBig = new BigDecimal(tUnit.toString());

    let baseProfit = cPriceBig.subtract(qPriceBig);
    baseProfit = baseProfit.multiply(askbidBig).multiply(cCntBig).multiply(tUnitBig);

    baseProfit.setScale(floatingpos, BigDecimal.ROUND_DOWN);
    return baseProfit;
  }

  export function calcProfit(cPrice:number,qPrice:number,askbid:number,cCnt:number,tUnit:number,convbid:number,interBal:number,dividBal:number, floatingpos:number):number{
    let baseProfit = calcBaseProfit(cPrice,qPrice,askbid,cCnt,tUnit, convbid, floatingpos);
    let convbidBig = new BigDecimal(convbid.toString());
    let interBalBig = new BigDecimal(interBal.toString());
    let dividBalBig = new BigDecimal(dividBal.toString());

    let result = baseProfit.multiply(convbidBig);
    result = result.setScale(0, BigDecimal.ROUND_DOWN);
    result = result.add(interBalBig).add(dividBalBig);

    return Number(result.toString());
  }