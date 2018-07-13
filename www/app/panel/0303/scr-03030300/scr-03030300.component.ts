/**
 *
 * 経済カレンダー
 *
 */
import { Component, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { PanelManageService, ResourceService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, BusinessService, StringUtil } from '../../../core/common';
import { IReqMarketCalendarInfo, IResMarketCalendarInfo } from "../../../values/Values";
import { DropdownComponent, IDropdownItem } from '../../../ctrls/dropdown/dropdown.component';
import { keyUpDown, SetSelectd } from '../../../util/commonUtil';
import { ERROR_CODE } from "../../../../../common/businessApi";
import { Messages, GetWarningMessage} from '../../../../../common/message';
import { Observable } from 'rxjs/Observable';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';

declare var $:any;
declare var moment:any;
//-----------------------------------------------------------------------------
// COMPONENT : Scr03030300Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030300',
  templateUrl: './scr-03030300.component.html',
  styleUrls: ['./scr-03030300.component.scss']
})
export class Scr03030300Component extends PanelViewBase {
  @ViewChild('countryListChild') countryListChild : DropdownComponent

  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
    // grid<i class="svg-icons icon-flg-JN"></i>
    public marketCalendarGrid:any;
    public countryList:IDropdownItem[]=[
      { value:'',  text:'すべての国' },
      { value:'JN',  text:'日本' },
      { value:'US',  text:'アメリカ' },
      { value:'EC',  text:'ＥＵ' },
      { value:'GE',  text:'ドイツ' },
      { value:'UK',  text:'イギリス' },
      { value:'FR',  text:'フランス' },
      { value:'CH',  text:'中国' },
      { value:'HK',  text:'香港' },
      { value:'IN',  text:'インド' },
      { value:'AU',  text:'オーストラリア' },
      { value:'NZ',  text:'ニュージーランド' },
      { value:'CA',  text:'カナダ' },
      { value:'SZ',  text:'スイス' },
      { value:'SA',  text:'南アフリカ' },
      { value:'BZ',  text:'ブラジル' },
      { value:'IT',  text:'イタリア' },
      { value:'RU',  text:'ロシア' },
      { value:'SK',  text:'韓国' },
      { value:'MX',  text:'メキシコ' },
      { value:'ID',  text:'インドネシア' },
      { value:'TU',  text:'トルコ' },
      { value:'SW',  text:'スウェーデン' },
      { value:'TA',  text:'台湾' },
      { value:'TH',  text:'タイ' },
      { value:'MA',  text:'マレーシア' },
      { value:'SI',  text:'シンガポール' },
      { value:'PH',  text:'フィリピン' },
      { value:'CL',  text:'チリ' }
    ];

    public apiDateTime:string;
    private dataCheckInterval:any;
    public listErrText:string='';
    public listErrShow:boolean=false;
    public disabledCheck:boolean=true;
    private marketCalendarList:any;
    private initFlg:boolean = false;
    private seletedIndex:number = null;
    private notifyerSubscribe = null;
    private selectedCountryCode:string = "";
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef,
               public business: BusinessService,
               public resource:ResourceService) {
    super( '03030300', screenMng, element, changeRef);
  }


  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  initLayout(param:any){
    super.initLayout(param);
    this.ui();
    this.initGrid();
    this.getMarketCalendarInfo();
    this.realCalendar();
  }

  ngAfterViewInit(){
    super.ngAfterViewInit();
    $(this.element.nativeElement).find(".panel-calendar").on("keydown",(e:KeyboardEvent)=>{
        SetSelectd(e,this.marketCalendarGrid,this.seletedIndex);
    })
  }

  public onResizing(){
    super.onResizing();
    this.marketCalendarGrid.pqGrid('option','height',this.getGridHeight())
    this.marketCalendarGrid.pqGrid('refresh');
  }

  ngOnDestroy(){
    super.ngOnDestroy();

    if(this.notifyerSubscribe){
      this.notifyerSubscribe.unsubscribe();
    }
  }

  /**
   * override function.
   *
   * 画面が最小化から復元された際、呼び出される。
   */
  public onPanelRestored(){
    super.onPanelRestored();

    if(this.marketCalendarGrid){
      this.marketCalendarGrid.pqGrid('refreshDataAndView');
    }
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  private getGridHeight(){
    return $(this.element.nativeElement.querySelector(".panel")).outerHeight() - $(this.element.nativeElement.querySelector(".navbar")).outerHeight() - $(this.element.nativeElement.querySelector(".row.row-header")).outerHeight(true)- $(this.element.nativeElement.querySelector(".row.row-table-footer")).outerHeight(true) - 2;
  }

  private initGrid() {
    let _self=this;
    let colModel = [
      {dataIndx: 'now', dataType:'boolean', title:'now', hidden:true},
      {dataIndx: 'marketCalendarId', dataType:'string', title:'marketCalendarId', hidden:true},
      {dataIndx: 'contentId', dataType:'string', title:'contentId', hidden:true},
      {dataIndx: 'countryCode', dataType:'string', title:'countryCode', hidden:true},
      {dataIndx: 'importantType', dataType:'string', title:'importantType', hidden:true},
      {dataIndx: 'unit', dataType:'string', title:'unit', hidden:true},
      {dataIndx: 'holiday', dataType:'string', title:'holiday', hidden:true},
      {dataIndx: 'marketCalendarDatetime', dataType:'string', title:'marketCalendarDatetime', hidden:true},
      {dataIndx: 'time', dataType:'string',title:'日時', align:'center', width:"17%", sortable: false, nodrag: true, cls:'body-col-num',
        render:(ui)=>{
          let rtn_data='';
          rtn_data=ui.rowData.time;

          if(ui.rowData.holiday=='1' || ui.rowData.importantType=='4' || String(ui.rowData.text).indexOf('休日') > -1) {
            rtn_data='&nbsp;&nbsp;&nbsp;&nbsp;***';
          }
          if (ui.rowData.day == "") {
            return "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + rtn_data;
          }
          return ui.rowData.day + "&nbsp;&nbsp;" + rtn_data;
        }
      },
      {dataIndx: 'text', dataType:'string', title:'経済指標・イベント', align:'left', width:"35%", sortable: false,　nodrag: true, tooltip:true,
        render:(ui)=>{
          let rtn_data='';
          ui.rowData.text = ui.rowData.text.replace(" ","　");
          rtn_data='<i class="svg-icons icon-flg-' + ui.rowData.countryCode + '"></i>' + ui.rowData.text;
          return rtn_data;
        }
      },
      {dataIndx: 'lastTime', dataType:'string', title:'前回', align:'right', width:"16%", sortable: false, nodrag: true, cls:'body-col-num',
        render:(ui)=>{
          let rtn_data='';
          if(ui.rowData.unit==null || ui.rowData.unit=='null') {
            ui.rowData.unit='';
          }
          if(ui.rowData.lastTime!='' && ui.rowData.lastTime!='null' && ui.rowData.lastTime!='0') {

            rtn_data=ui.rowData.lastTime+'<span class="unit">' + ui.rowData.unit + '</span>';
          }
          return rtn_data;
        }
      },
      {dataIndx: 'expected', dataType:'string', title:'予想', align:'right', width:"16%", sortable: false, nodrag: true, cls:'body-col-num',
        render:(ui)=>{
          let rtn_data='';
          if(ui.rowData.unit==null || ui.rowData.unit=='null') {
            ui.rowData.unit='';
          }
          if(ui.rowData.expected!='' && ui.rowData.expected!='null' && ui.rowData.expected!='0') {
            rtn_data=ui.rowData.expected+'<span class="unit">' + ui.rowData.unit + '</span>';
          }
          return rtn_data;
        }
      },
      {dataIndx: 'result', dataType:'string', title:'結果', align:'right', width:"15%", sortable: false, nodrag: true, cls:'body-col-num',
        render:(ui)=>{
          let rtn_data='';
          if(ui.rowData.unit==null || ui.rowData.unit=='null') {
            ui.rowData.unit='';
          }
          if(ui.rowData.result!='' && ui.rowData.result!='null' && ui.rowData.result!='0') {
            rtn_data=ui.rowData.result+'<span class="unit">' + ui.rowData.unit + '</span>';
          }
          return rtn_data;
        }
      }
    ];

    this.marketCalendarGrid = $(this.element.nativeElement).find("#grid"+this.pageId).pqGrid({
      width: "100%",
      height: this.getGridHeight(),
      wrap: false,
      hwrap: false,
      editable: false,
      numberCell: false,
      showTitle: false,
      showToolbar: false,
      showTop: false,
      showBottom: false,
      columnTemplate: { halign: 'center', tooltip:false },
      selectionModel:{type: 'row', mode: 'single'},
      dataModel: { data: [], location: 'local' },
      pageModel: { type: 'local', rPP:65535 },
      sortModel: { sorter: [{ dataIndx: 'marketCalendarDatetime', dir: 'up'}], space: true },
      sort: function() {
        _self.autoMerge(this);
      },
      colModel: colModel,
      strNoRows: Messages.ERR_0032,
      cellKeyDown: ( event, ui ) => {
        keyUpDown(this.marketCalendarGrid,event,ui);
      },
      rowSelect:($event, ui)=> {
        if (ui.addList.length > 0) {
          this.seletedIndex = ui.addList[0].rowIndx;
        }
      },
      refresh: ($event, ui)=> {
        this.showMsgIfNoRows();
      }
    });
  }

  private autoMerge(grid:any) {
    // var mc = [],
    let data = grid.option("dataModel.data");

    var rc = 1,
        j = data.length;

    while (j--) {
        var cd = data[j].day,
            cd_prev = data[j - 1] ? data[j - 1].day : undefined;
        if (cd_prev !== undefined && cd == cd_prev) {
            rc++;
            // 重複する日時は空文字
            data[j].day = '';
        }
        else if (rc > 1) {
            // mc.push({ r1: j, c1: 8, rc: rc, cc: 1 });
            rc = 1;
        }
    }

    // セル結合しない
    // grid.option("mergeCells", mc);

  }

  private bindGridData(gridData:any) {
    this.marketCalendarGrid.pqGrid( "setSelection", null );
    //this.marketCalendarGrid.pqGrid( "scrollRow", { rowIndxPage: 0 } );
    this.marketCalendarGrid.pqGrid( "option", "dataModel.data", gridData );
    this.marketCalendarGrid.pqGrid( "refreshDataAndView" );
    this.marketCalendarGrid.pqGrid( "loadComplete");
    this.dataCheck(this);
    this.dataCheckTimer();
  }

  private gridFilter(val:string) {
    let data = this.makeData(this.marketCalendarList, val);
    this.bindGridData(data);
    this.gotoNow();
  }

  public onChgCountryList($event) {
    this.selectedCountryCode = $event.selected;
    this.gridFilter($event.selected);
  }

  private getMarketCalendarInfo(isCache: boolean = true){
    let _self = this;
    _self.listErrShow=false;
    _self.disabledCheck=true;
    _self.initFlg = true;

    let obPowerAmount = _self.business.getPowerAmount();
    let obMarketCalendarList: Observable<IResMarketCalendarInfo>;

    if(isCache) {
      obMarketCalendarList = _self.business.getMarketCalendarInfo();
    }
    else {
      obMarketCalendarList = _self.business.getMarketCalendarInfoDirect();
    }

    Observable.zip(obPowerAmount, obMarketCalendarList).subscribe(
      val => {
        _self.apiDateTime = val[0].datetime;
        if(val[1].status=='0') {
          _self.marketCalendarList=val[1].result.marketCalendarList;
          let data = _self.makeData(val[1].result.marketCalendarList);
          _self.bindGridData(data);
          this.gotoNow(_self.apiDateTime);
        } else if(val[1].status=='1' || val[1].status=='2') {
          _self.listErrText='データが取得できませんでした。しばらくしてからもう一度お試しください。[CFDS1901T]';
          _self.listErrShow=true;
        } else {
          _self.listErrText='インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS1902C]';
          _self.listErrShow=true;
        }
        _self.disabledCheck=false;
        _self.updateView();
        _self.initFlg = false;        
      },
      err=>{
        switch(err.status) {
          case ERROR_CODE.NETWORK:
            _self.listErrText=Messages.ERR_0002 + '[CFDS1902C]';
            _self.listErrShow=true;          
            break;
        }
        _self.initFlg = false;        
      }
    );    

    // _self.business.getPowerAmount().subscribe(val2 => {
    //   _self.apiDateTime=val2.datetime;
    //   this.business.getMarketCalendarInfo().subscribe(val1 => {
    //     if(val1.status=='0') {
    //       _self.marketCalendarList=val1.result.marketCalendarList;
    //       let data = _self.makeData(val1.result.marketCalendarList);
    //       _self.bindGridData(data);
    //       this.gotoNow(_self.apiDateTime);
    //     } else if(val1.status=='1' || val1.status=='2') {
    //       _self.listErrText='データが取得できませんでした。しばらくしてからもう一度お試しください。[CFDS1901T]';
    //       _self.listErrShow=true;
    //     } else {
    //       _self.listErrText='インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS1902C]';
    //       _self.listErrShow=true;
    //     }
    //     _self.disabledCheck=false;
    //     _self.updateView();
    //     _self.initFlg = false;
    //   },
    //   err=>{
    //     switch(err.status) {
    //       case ERROR_CODE.NETWORK:
    //         _self.listErrText=Messages.ERR_0002 + '[CFDS1902C]';
    //         _self.listErrShow=true;          
    //         break;
    //     }
    //     _self.initFlg = false;
    //   });
    // });
  }

  private dateDiff(date1:Date, date2:Date) : number {
    let diff=(date1.getTime()-date2.getTime())/(1000*60*60*24);
    return diff;
  }

  private dateTimeCheck(date1:Date, date2:Date) : Number {
    let gap = date1.getTime()-date2.getTime();
    let min_gap = gap / 1000 / 60;

    return min_gap;
  }

  private makeData(data:any, countryCode:string=""):any{
    let arr_now_date=String(moment(this.apiDateTime,'YYYYMMDDHHmmss').format('YYYY-MM-DD')).split('-');
    let now_date=new Date(Number(arr_now_date[0]),Number(arr_now_date[1]),Number(arr_now_date[2]));

    let rtn_data:any=[];
    let nowCheck:boolean=false;
    for(let i=0;i<data.length;i++) {
      if(this.selectedCountryCode != "" && this.selectedCountryCode!=data[i].countryCode) {
        continue;
      }
      let arr_date=String(moment(data[i].marketCalendarDatetime,'YYYYMMDDHHmmss').format('YYYY-MM-DD')).split('-');

      let data_date=new Date(Number(arr_date[0]),Number(arr_date[1]),Number(arr_date[2]));
      let diff=this.dateDiff(data_date,now_date);

      if(diff>=-3 || diff<=7) {
        if(diff==0) {
          data[i].now=true
          nowCheck=true;
        } else {
          data[i].now=false
        }

        if(!nowCheck && diff>0) {
          data[i].now=true
          nowCheck=true;
        }

        data[i].day= moment(data[i].marketCalendarDatetime,'YYYYMMDDHHmmss').format('MM/DD');
        data[i].time=moment(data[i].marketCalendarDatetime,'YYYYMMDDHHmmss').format('HH:mm');

        if(data[i].expected==null || String(data[i].expected).trim()=='null' || String(data[i].expected).trim()=='0') {
          data[i].expected='';
        }

        if(data[i].lastTime==null || String(data[i].lastTime).trim()=='null' || String(data[i].lastTime).trim()=='0') {
          data[i].lastTime='';
        }

        if(data[i].result==null || String(data[i].result).trim()=='null' || String(data[i].result).trim()=='0') {
          data[i].result='';
        }
        rtn_data.push(data[i]);
      }
    }

    return rtn_data;
  }

  private dataCheckTimer() {
    if(this.dataCheckInterval!=null){
      clearInterval(this.dataCheckInterval);
    }
    let _self=this;
    this.dataCheckInterval=setInterval(function(){
      _self.dataCheck(_self);
    }, 60000);
  }

  private dataCheck(_self:any){
    this.business.getPowerAmount().subscribe(val => {
      _self.apiDateTime=val.datetime;
      let keyIndicatorAppealTime=_self.resource.environment.clientConfig.keyIndicatorAppealTime;

      let arr_now_date=String(moment(_self.apiDateTime,'YYYYMMDDHHmmss').format('YYYY-MM-DD-HH-mm')).split('-');
      let now_date=new Date(Number(arr_now_date[0]),Number(arr_now_date[1]),Number(arr_now_date[2]),Number(arr_now_date[3]),Number(arr_now_date[4]));

      let data=_self.marketCalendarGrid.pqGrid( "option", "dataModel.data" );

      for(let i=0;i<data.length;i++) {
        let arr_date=String(moment(data[i].marketCalendarDatetime,'YYYYMMDDHHmmss').format('YYYY-MM-DD-HH-mm')).split('-');
        let row_date=new Date(Number(arr_date[0]),Number(arr_date[1]),Number(arr_date[2]),Number(arr_date[3]),Number(arr_date[4]));
        let time=_self.dateTimeCheck(row_date, now_date);

        _self.marketCalendarGrid.pqGrid( "removeClass", {rowIndx: i, cls: 'text-cal-soon'});
        // if((time>=0 && time<=keyIndicatorAppealTime) || (time<0 && time>=-keyIndicatorAppealTime)) {
        if(time>=0 && time<=keyIndicatorAppealTime) {
          _self.marketCalendarGrid.pqGrid( "addClass", {rowIndx: i, cls: 'text-cal-soon'} );
        }
      }
    });
  }

  public onResetClick($event) {
    this.marketCalendarGrid.pqGrid( "setSelection", null );
    this.gotoNow();
  }

  public onSearchClick($event){
    // this.countryListChild.select="";
    // this.countryListChild.selectedText();
    this.getMarketCalendarInfo(false);
  }

  private realCalendar(){
    let _self=this;
    this.notifyerSubscribe = this.business.notifyer.calendar().subscribe(val=>{
      if(val.type=="delete") {
        for(let i=0;i<val.calendars.length;i++) {
          let rows=_self.marketCalendarGrid.pqGrid( "search", { row: { marketCalendarId : val.calendars[i].marketCalendarId } });
          if(rows.length > 0) {
            _self.marketCalendarGrid.pqGrid( "removeData", {rowIndx: rows[0].rowIndx});
          }
        }
        _self.marketCalendarList=_self.marketCalendarGrid.pqGrid( "option", "dataModel.data" );
        _self.marketCalendarGrid.pqGrid( "refreshDataAndView" );
      } else {
        let rowsData=_self.makeData(val.calendars);
        let dataModel = this.marketCalendarGrid.pqGrid('option','dataModel');

        for(let i=0;i<rowsData.length;i++) {
          let data=rowsData[i];
          let idx = dataModel.data.findIndex(f=>f.marketCalendarId == data.marketCalendarId);

          if(idx!=-1){
            // update
            let row = dataModel.data[idx];
            Object.keys(data).forEach(key=>{
              row[key] = data[key];
            });
          } else {
            // new
            _self.marketCalendarGrid.pqGrid( "addRow",{ newRow: data });
          }
          _self.marketCalendarGrid.pqGrid( "refreshDataAndView" );
        }
      }
    });
  }

  private ui(){
    let _element = $(this.element.nativeElement);

    //list-group
    _element.find('.list-group > a').on('click', function(){
      if($(this).hasClass('open')) $(this).removeClass('open').children('.glyphicon').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
      else $(this).addClass('open').children('.glyphicon').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
    });

    //open-list
    _element.find('.open-list > a').on('click', function(){
      let _box = $(this).parent(),
          _notHas = _box.hasClass('no-list'),
          _openHas = _box.hasClass('open');

      if(!_notHas){
        if(_openHas) _box.removeClass('open').find('.glyphicon').removeClass('glyphicon-triangle-right').addClass('glyphicon-triangle-left');
        else _box.addClass('open').find('.glyphicon').removeClass('glyphicon-triangle-left').addClass('glyphicon-triangle-right');
      }
    });
  }

  private gotoNow(curTime:string = null){
    let indexNow = 0;
    
    if(curTime){
      let timeNow = curTime;
      let data = this.marketCalendarGrid.pqGrid("option", "dataModel.data");
      for (var i = 0; i < data.length; i++) {
        if (data[i].marketCalendarDatetime > timeNow) {
          indexNow = i;
          break;
        }
      }
      this.marketCalendarGrid.pqGrid("scrollRow", { rowIndxPage: data.length - 1 });
      this.marketCalendarGrid.pqGrid("setSelection", { rowIndx: indexNow });
      this.seletedIndex = indexNow;
    }else{
      this.business.getPowerAmount().subscribe(
        res => {
          if (res && res.status == "0") {
            let timeNow = res.datetime;
            let data = this.marketCalendarGrid.pqGrid("option", "dataModel.data");
            for (var i = 0; i < data.length; i++) {
              if (data[i].marketCalendarDatetime > timeNow) {
                indexNow = i;
                break;
              }
            }
            this.marketCalendarGrid.pqGrid("scrollRow", { rowIndxPage: data.length - 1 });
            this.marketCalendarGrid.pqGrid("setSelection", { rowIndx: indexNow });
            this.seletedIndex = indexNow;
          }
        }
      );
    }
  }

  private showMsgIfNoRows(){
    if (this.marketCalendarGrid) {
      let data = this.marketCalendarGrid.pqGrid('option', 'dataModel.data');
      if (!this.initFlg && data.length == 0) {
        this.marketCalendarGrid.pqGrid('loadComplete');
      }
    }
  }

}
