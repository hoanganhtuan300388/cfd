/**
 *
 * 約定・失効通知
 *
 */
import { Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, BusinessService, StringUtil } from '../../../core/common';
import * as commonApp from '../../../../../common/commonApp';
import { keyUpDown, SetSelectd } from '../../../util/commonUtil';

declare var $:any;
declare var moment:any;
//-----------------------------------------------------------------------------
// COMPONENT : Scr03010400Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03010400',
  templateUrl: './scr-03010400.component.html',
  styleUrls: ['./scr-03010400.component.scss']
})
export class Scr03010400Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  private gridObj;
  private dataModel:any;
  private subscrib:any;
  private noticeList:Array<any> = [];
  private dayNow:any = null;
  private initFlg:boolean = false;
  private seletedIndex:number = null;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef,
               public business: BusinessService) {
    super( '03010400', screenMng, element, changeRef);
  }

  ngAfterViewInit(){
    super.ngAfterViewInit();
    if (this.business.notifyer !== null && this.business.notifyer.event != null) {
      this.subscrib = this.business.notifyer.event().subscribe(val => {
        switch (val[1].eventType) {
          case commonApp.NoticeType.NOTIFY_EXECUTION:
          case commonApp.NoticeType.NOTIFY_ORDER_INVALIDAION:
          case commonApp.NoticeType.NOTIFY_SPEED_EXPIRE:
          case commonApp.NoticeType.NOTIFY_EXPIRE:
            this.getNoticeList(this.dataModel);
            break;
          default:
            break;
        }
      })
    }
    this.gridLoad();
    $(this.element.nativeElement).find(".panel-notify").on("keydown",(e:KeyboardEvent)=>{
      SetSelectd(e,this.gridObj,this.seletedIndex);
    })
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    this.subscrib.unsubscribe();
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  initLayout(param: any) {
    super.initLayout(param);
  }

  /**
   * override function.
   *
   * 画面が最小化から復元された際、呼び出される。
   */
  public onPanelRestored(){
    super.onPanelRestored();

    if(this.gridObj){
      this.gridObj.pqGrid('refreshDataAndView');
    }
  }  

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  private gridLoad(){
    const colModel = [
      {dataIndx:'time', title: "", align:"center", width: 72, cls: 'body-col-no-padding',
        render:(ui)=>{
          if (ui.rowData.date) {
            return '<div class="body-col-num-mid" title="'+ ui.rowData.date +'\n'+ ui.rowData.name +'\n'+ ui.rowData.notice + '" >'+ui.rowData.time+'</div>';
          } else {
            return '<div class="body-col-num-mid body-col-bg-divider">'+ui.rowData.time+'</div>';
          }
        }
      },
      {dataIndx:'notice', title: "", align: 'left', width: 220, cls: 'body-col-no-padding',
        render:(ui)=>{
          if (ui.rowData.date) {
            return '<div title="'+ ui.rowData.date +'\n'+ ui.rowData.name +'\n'+ ui.rowData.notice + '" >'+ui.rowData.name+'<br/>'+ui.rowData.notice+'</div>';
          } else {
            return '<div class="body-col-bg-divider"></div>';
          }
        }
      }
    ];
    let $grd = $(this.element.nativeElement).find("#Grid");
    this.gridObj = $grd.pqGrid({
      width : "auto",
      height: "100%",
      editable: false,
      draggable: false,
      columnTemplate: { halign: 'center', dataType: 'string', tooltip:false, sortable: false, editor: false, nodrag: true, resizable: false },
      mergeCells: [],
      wrap: false,
      hwrap: false,
      numberCell: false,
      showTitle: false,
      showToolbar: false,
      showTop: false,
      showBottom: false,
      showHeader:false,
      scrollModel: { lastColumn: "none" },
      dataModel: { data: [],location:"local" },
      pageModel: { type: 'local', rPP:65535 },
      selectionModel: { type:'row', mode:'single' },
      swipeModel: { on: false },
      stripeRows: false,
      colModel: colModel,
      rowSelect:($event, ui)=> {
        if (ui.addList.length > 0) {
          this.seletedIndex = ui.addList[0].rowIndx;
        }
      },
      cellKeyDown: ( event, ui ) => {
        keyUpDown(this.gridObj,event,ui);
      },
      refresh: ($event, ui)=> {
        this.showMsgIfNoRows();
      }
    });
    this.dataModel = this.gridObj.pqGrid('option','dataModel');
    this.getNoticeList(this.dataModel);
  }

  private getNoticeList(dataModel:any) {
    this.initFlg = true;
    this.business.getNoticeList().subscribe(val => {
      this.noticeList.length = 0;
      val.result.forEach(element => {
        if (element.eventType == commonApp.NoticeType.NOTIFY_EXECUTION || element.eventType == commonApp.NoticeType.NOTIFY_ORDER_INVALIDAION || element.eventType == commonApp.NoticeType.NOTIFY_SPEED_EXPIRE || element.eventType == commonApp.NoticeType.NOTIFY_EXPIRE) {
          let msg = element.eventMessage.eventMessage.split("]");
          // let date = moment("Mon, 06 Mar 2017 21:22:23 +0000");
          let dates = element.eventMessage.eventDate.split(" ");
          let parse = dates[1] + " " + dates[2] + ", " + dates[5] + " " + dates[3];
          let t = new Date(parse);
          let date = moment(t,'YYYYMMDDHHmm').format('YYYY/MM/DD HH:mm');
          let name = msg[0] + ']';
          let notice =  msg[1];
          let timeIdx = element.eventMessage.eventDate.indexOf(':');
          let time = element.eventMessage.eventDate.substr(timeIdx - 2, 5);
          if (date.split(" ")[0] != this.dayNow) {
            if (this.dayNow != null) {
              this.noticeList.push({date:null,time:date.split(" ")[0].substr(5),name:null,notice:null});
            }
            this.dayNow = date.split(" ")[0];
          }
          this.noticeList.push({date:date,time:time,name:name,notice:notice});
        }
      });
      dataModel.data = this.noticeList;
      this.gridObj.pqGrid('refreshDataAndView');
      this.updateView();

      this.gridObj.pqGrid('option','height',this.getGridHeight())
      this.gridObj.pqGrid('refresh');

      // スクロール位置を画面高さと行数に合わせる
      let idx = 1;
      const rowHeight = $(this.element.nativeElement.querySelector("#Grid .pq-grid-row")).height();
      const gridHeight = this.getGridHeight();
      const rowCount = Math.ceil(gridHeight/rowHeight);
      if (this.noticeList.length < rowCount) {
        idx = this.noticeList.length;
      }
      this.gridObj.pqGrid('scrollRow',{rowIndxPage: this.noticeList.length - idx});
      this.seletedIndex = this.noticeList.length - idx;
      this.updateView();

      this.initFlg = false;
    },
    err=>{
      this.initFlg = false;
    });
  }

  private getGridHeight(){
    return $(this.element.nativeElement.querySelector(".panel")).outerHeight() - $(this.element.nativeElement.querySelector(".navbar")).outerHeight() - $(this.element.nativeElement.querySelector(".row.row-table-footer")).outerHeight(true) - 2;
  }

  public onResizing($event){
    super.onResizing();
    if (this.gridObj) {
      this.gridObj.pqGrid('option','height',this.getGridHeight())
      this.gridObj.pqGrid('refresh');
    }
  }

  private showMsgIfNoRows(){
    if (this.gridObj) {
      let data = this.gridObj.pqGrid('option', 'dataModel.data');
      if (!this.initFlg && data.length == 0) {
        this.gridObj.pqGrid('loadComplete');
      }
    }
  }

}
