import { Component, ElementRef, ViewChild, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { YYYYMMDDtoDateFormat } from '../../util/stringUtil';

declare var $:any;
declare var JapaneseHolidays:any;

@Component({
  selector: 'calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss']
})
export class CalendarComponent implements OnInit {

  @Output() focus = new EventEmitter<any>();

  @Input() isDisabled:boolean = false;
  @Input() isDateOnly:boolean = true;
  @Input() isWeekdayOnly:boolean = false;
  @Input() isOneMonthOnly:boolean = false;

  @Input() dateModel:string;
  @Output() dateModelChange = new EventEmitter<string>();

  public minDate:Date = new Date(2007,1,1);
  public maxDate:Date = new Date(2100,1,1);
  public disabledDates:Date[] = [];
  public defaultValue:Date = new Date();

  constructor(public element: ElementRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit(){
    if (this.isOneMonthOnly) {
      var today = new Date();
      this.minDate = today;
      this.maxDate = this.getAddMonthDate(today.getFullYear(), today.getMonth(), today.getDate(), 1);
    }

    if (this.isWeekdayOnly) {
      this.disabledDates = this.getHolidays(this.minDate, this.maxDate);
    }
  }

  /**
   * input boxへのフォーカスイベント
   */
  public onFocus($event) {
    this.focus.emit();
  }

  /**
   * カレンダーの日付選択が変更された時のイベント
   */
  public onValueChanged(event) {
    if (!event) {
      this.dateModelChange.emit("");
    } else {
      this.dateModel = event.toString();
      if (this.dateModel.length == 8) {
        if( /^[0-9]{8}/.test(this.dateModel) ){
          this.dateModel = YYYYMMDDtoDateFormat(this.dateModel);
        } else {
          this.dateModel = "";
        }
        this.dateModelChange.emit(this.dateModel);
      } else if (this.dateModel.length == 10) {
        let regex = /^[0-9]{4}\/[0-9]{2}\/[0-9]{2}/;
        if (!regex.test(this.dateModel)) {
          this.dateModel = "";
        }
        this.dateModelChange.emit(this.dateModel);
      } else if (this.dateModel.length > 10) {
        this.dateModel = "";
        this.dateModelChange.emit(this.dateModel);
      }
    }
  }

  /**
   * 祝日を取得する
   */
  private getHolidays(startDate:Date, endDate:Date) :Date[] {
    let today = new Date();
    let thisYear = today.getFullYear();
    var retHolidays:Date[] = [];

    for (let year:number = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      for (let month = startDate.getMonth(); month <= startDate.getMonth(); month++) {
        // 祝日
        let holidays = JapaneseHolidays.getHolidaysOf(year);
        holidays.forEach(function(holiday) {
          let date = new Date(year, holiday.month - 1, holiday.date);
          if (date.getMonth() == month) {
            retHolidays.push(date);
          }
        });

        // 土日
        for (let day = 1; day <= 31; day++) {
          let date = new Date(year, month, day);
          // 日または土
          if (date.getDay() == 0 || date.getDay() == 6) {
            retHolidays.push(date);
          }
        }
      }
    }

    return retHolidays;
  }

  /**
   * 指定した数分先の月を取得する
   */
  private getAddMonthDate(year, month, day, add):Date {
  	var addMonth = month + add;
  	var endDate = this.getEndOfMonth(year,addMonth);//add分を加えた月の最終日を取得

  	//引数で渡された日付がnヶ月後の最終日より大きければ日付を次月最終日に合わせる
  	//5/31→6/30のように応当日が無い場合に必要
  	if(day > endDate){
  		day = endDate;
  	}else{
  		day = day - 1;
  	}

  	var addMonthDate = new Date(year,addMonth,day);
  	return addMonthDate;
  }

  /**
   * 月の最終日を取得する
   */
  private getEndOfMonth(year, month):number {
  	var endDate = new Date(year,month,0);
  	return endDate.getDate();
  }




}
