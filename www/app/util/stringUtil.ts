/**
 * stringUtil
 */
import { CommonConst, CommonEnum } from '../core/common';

// input YYYYMMDD output YYYY/MM/DD
export function YYYYMMDDtoDateFormat(input: string): string{
  return (input.slice(0, 4) + '/'+ input.slice(4,6) + '/' + input.slice(-2));
}

// input YYYY/MM/DD output YYYYMMDD
export function DateFormatToYYYYMMDD(input: string): string{
  return (input.slice(0, 4) + input.slice(5, 7) + input.slice(-2));
}

export function GetNumberToCommaOrDash(value: number): string{
  if(value)
    return value.toLocaleString();
  else
    return '-';
}

export function ConvertRgb(color16:string): string {
  return 'rgb(' + parseInt(color16.substr(1,2),16) + ','
                + parseInt(color16.substr(3,2),16) + ','
                + parseInt(color16.substr(5,2),16) + ')';
}

// 画面に表示する数値を３桁comma区切りで表示する
export function Comma(num) {
  return num?num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):'';
}

export function CommaWithDash(num) {
  if(num)
    return num?num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):'';
  else
    return '-';
}

export function CommaWithZero(num) {
  return num?num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","):'0';
}

export function GetTradeQty(isUp:boolean, qty:number, tradeUnit:number): number{
  if(isUp)
    return (qty + tradeUnit - (qty%tradeUnit));
  else
    return (qty - tradeUnit - (qty%tradeUnit))?(qty - tradeUnit - (qty%tradeUnit)):0;
}

export function getBoUnitFormat(boUnit:number,comma:boolean=true):string {
  let format = '#,###';
  if(!comma) format = '#';
  let boUnitLength = Math.floor(Math.abs(Math.log10(boUnit)));
  if(boUnitLength > 0){
    format += '.';
    for(let i=boUnitLength; i--;) {
      format += '0';
    }
  }
  return format
}

export function getFloatingposFormat(floatingpos:number,comma:boolean=true):string {
  let format = '#,###';
  if(!comma) format = '#';
  if(floatingpos > 0){
    format += '.';
    for(let i=floatingpos; i--;) {
      format += '0';
    }
  }
  return format
}

declare var pq:any;
export function formatNumber(number:number, format:string, pSign:boolean=false):string {
  let result = pq.formatNumber(number, format);
  if(number > 0 && pSign){
    result = '+' + result;
  }
  return result;
}

// 1バイト/2バイト文字を識別して文字数を返却する
export function countLength(str) {
  var r = 0;
  for (var i = 0; i < str.length; i++) {
      var c = str.charCodeAt(i);
      // Shift_JIS: 0x0 ～ 0x80, 0xa0 , 0xa1 ～ 0xdf , 0xfd ～ 0xff
      // Unicode : 0x0 ～ 0x80, 0xf8f0, 0xff61 ～ 0xff9f, 0xf8f1 ～ 0xf8f3
      if ( (c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
          r += 1;
      } else {
          r += 2;
      }
  }
  return r;
}

/*
  全角英大文字、全角英小文字、半角英小文字　→　半角英大文字
  全角かな／カナ小文字（拗音、促音）　→　全角かな／カナ大文字
  半角かな／カナ小文字（拗音、促音）　→　半角かな／カナ大文字
  全角数字　→　半角数字
  全角記号「＆」「．」「　」「，」（アンパサンド、ピリオド、スペース、カンマ）　→　半角記号
  横棒「－」「-」「ｰ」（全角／半角ハイフン（兼マイナス）、半角長音）　→　全角長音「ー」　※1
  銘柄名称に使用されうる、半角中点「･」　→　全角中点「・」　※2
  ※1）すべて長音用途で使用されているため長音に統一すべきであるが、半角長音は半角カナ記号であるため、全角長音に統一
  ※2）半角中点は半角カナ記号であるため、全角中点に統一
*/
export function conversion(str:string):string {
  let kanaMap = {
    "ぁ":"あ","ぃ":"い","ぅ":"う","ぇ":"え","ぉ":"お","ゃ":"や","ゅ":"ゆ","ょ":"よ","っ":"つ",
    "ァ":"ア","ィ":"イ","ゥ":"ウ","ェ":"エ","ォ":"オ","ャ":"ヤ","ュ":"ユ","ョ":"ヨ","ッ":"ツ",
    "ｧ":"ｱ","ｨ":"ｲ","ｩ":"ｳ","ｪ":"ｴ","ｫ":"ｵ","ｬ":"ﾔ","ｭ":"ﾕ","ｮ":"ﾖ","ｯ":"ﾂ",
    "＆":"&","．":".","　":" ","，":",","･":"・",
    "－":"ー","-":"ー","ｰ":"ー",
  };
  str = str.replace(/[Ａ-Ｚａ-ｚ０-９]/g, function(s) {
      return String.fromCharCode(s.charCodeAt(0) - 65248);
    }).toUpperCase();
  let reg = new RegExp('(' + Object.keys(kanaMap).join('|') + ')', 'g');
  return str.replace(reg, function (match) {
      return kanaMap[match];
  })
}

export function currency(price, boUnit){
  let currentPrice:number = price;
  let format = getBoUnitFormat(boUnit);
  let formatVal:string = formatNumber(currentPrice, format);
  return formatVal;
}

export function S2N_removeComma(input: string): number {
  return Number((input).replace(/,/g, ''));  
}

// from boUnit to decimal point count
// 0.01 -> 2 0.1 -> 1 1 -> 0
export function getDecimalPCnt(input: number): number {
  let str = input.toString();
  let pnt = str.indexOf('.');
  let ret = 0;
  if(pnt > 0) {
    ret = (str.slice(pnt)).length - 1;
  }
  return ret;
}