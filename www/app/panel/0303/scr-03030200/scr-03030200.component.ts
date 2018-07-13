/**
 *
 * マーケットサマリー
 *
 */
import { Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, BusinessService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips } from '../../../core/common';
import { Messages} from '../../../../../common/message';

declare var $:any;
declare var moment:any;
//-----------------------------------------------------------------------------
// COMPONENT : Scr03030200Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030200',
  templateUrl: './scr-03030200.component.html',
  styleUrls: ['./scr-03030200.component.scss']
})
export class Scr03030200Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  private gridObjIndex;
  private gridObjForeign;
  public noRowMsg:string = "";
  private timmer;
  public noDataFlg:boolean = false;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public business:BusinessService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef) {
    super( '03030200', screenMng, element, changeRef);
  }

  ngAfterViewInit(){
    super.ngAfterViewInit();
    this.gridLoad();
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    clearInterval(this.timmer);
  }

  initLayout(param:any){
    super.initLayout(param);
  }

  public onResizing($event) {
    super.onResizing();
    this.refreshGrid();
  }

  /**
   * override function.
   *
   * 画面が最小化から復元された際、呼び出される。
   */
  public onPanelRestored(){
    super.onPanelRestored();
    
    if(this.gridObjIndex){
      this.gridObjIndex.pqGrid('refreshDataAndView');
    }

    if(this.gridObjForeign){
      this.gridObjForeign.pqGrid('refreshDataAndView');
    }
  }

  private gridLoad(){
    const colModelIndex = [
      {dataIndx:'productName', title: "指数", dataType:"string", align:"left", sortable: false, editor: false, nodrag: true, resizable:false, width: 106, cls: 'body-col-first'},
      {dataIndx:'current', title: "現在値", dataType:"number", align:"right", sortable: false, editor: false, nodrag: true, resizable:false, width: 160, cls: 'body-col-num body-col-num2' },
      {dataIndx:'change', title: "前日比", dataType:"number", align:"right", sortable: false, editor: false, nodrag: true, resizable:false, width: 88, cls: 'body-col-num', render:function(ui){
        let text = "";
        if(ui.cellData > 0){
          text += '<span class="text-price-up">+' + ui.cellData + '</span>';
        } else if(ui.cellData < 0){
          text += '<span class="text-price-down">' + ui.cellData + '</span>';
        } else {
          text += '<span>' + ui.cellData + '</span>';
        }
        return text;
      }},
      {dataIndx:'changePercentage', title: "前日比(%)", dataType:"number", align:"right", sortable: false, editor: false, nodrag: true, resizable:false, width: 88, cls: 'body-col-num', render:function(ui){
        let text = "";
        if(ui.cellData > 0){
          text += '<span class="text-price-up">+' + ui.cellData + '%</span>';
        } else if(ui.cellData < 0){
          text += '<span class="text-price-down">' + ui.cellData + '%</span>';
        } else {
          text += '<span>' + ui.cellData + '%</span>';
        }
        return text;
      }},
      {dataIndx:'updateDatetime', title: "更新日時", dataType:"string", align:"center", sortable: false, editor: false, nodrag: true, resizable:false, width: 116, cls: 'body-col-dark', render:function(ui){
        return moment(ui.cellData,'YYYYMMDDHHmmss').format('MM/DD HH:mm');
      }},
    ];

    const colModelForeign = [
      {dataIndx:'productName', title: "為替", dataType:"string", align:"left", sortable: false, editor: false, nodrag: true, resizable:false, width: 106},
      {dataIndx:'bid', title: "BID", dataType:"number", align:"right", sortable: false, editor: false, nodrag: true, resizable:false, width: 80, cls: 'body-col-num' },
      {dataIndx:'ask', title: "ASK", dataType:"number", align:"right", sortable: false, editor: false, nodrag: true, resizable:false, width: 80, cls: 'body-col-num' },
      {dataIndx:'change', title: "前日比", dataType:"number", align:"right", sortable: false, editor: false, nodrag: true, resizable:false, width: 88, cls: 'body-col-num', render:function(ui){
        let text = "";
        if(ui.cellData > 0){
          text += '<span class="text-price-up">+' + ui.cellData + '</span>';
        } else if(ui.cellData < 0){
          text += '<span class="text-price-down">' + ui.cellData + '</span>';
        } else if(ui.cellData == null){
          text += '';
        } else {
          text += '<span>' + ui.cellData + '</span>';
        }
        return text;
      }},
      {dataIndx:'changePercentage', title: "前日比(%)", dataType:"number", align:"right", sortable: false, editor: false, nodrag: true, resizable:false, width: 88, cls: 'body-col-num', render:function(ui){
        let text = "";
        if(ui.cellData > 0){
          text += '<span class="text-price-up">+' + ui.cellData + '%</span>';
        } else if(ui.cellData < 0){
          text += '<span class="text-price-down">' + ui.cellData + '%</span>';
        } else if(ui.cellData == null){
          text += '';
        } else {
          text += '<span>' + ui.cellData + '%</span>';
        }
        return text;
      }},
      {dataIndx:'updateDatetime', title: "更新日時", dataType:"string", align:"center", sortable: false, editor: false, nodrag: true, resizable:false, width: 116, cls: 'body-col-dark', render:function(ui){
        return moment(ui.cellData,'YYYYMMDDHHmmss').format('MM/DD HH:mm');
      }},
    ];

    var $grdIndex = $(this.element.nativeElement).find("#indexGrid");
    this.gridObjIndex = $grdIndex.pqGrid({
      width : "auto",
      height : "flex",
      editable: false,
      draggable: false,
      columnTemplate: { halign: 'center', align: 'center', dataType: 'string', tooltip: false},
      mergeCells: [],
      wrap: false,
      hwrap: false,
      numberCell: false,
      showTitle: false,
      showToolbar: false,
      showTop: false,
      showBottom: false,
      scrollModel: { lastColumn: "none" },
      dataModel: { data: [],location:"local" },
      selectionModel: { column:false, row:false, type:null },
      swipeModel: { on: false },
      stripeRows: false,
      colModel: colModelIndex
    });
    var $grdForeign = $(this.element.nativeElement).find("#foreignGrid");
    this.gridObjForeign = $grdForeign.pqGrid({
      width : "auto",
      height : "flex",
      editable: false,
      draggable: false,
      columnTemplate: { halign: 'center', align: 'center', dataType: 'string', tooltip: false},
      mergeCells: [],
      wrap: false,
      hwrap: false,
      numberCell: false,
      showTitle: false,
      showToolbar: false,
      showTop: false,
      showBottom: false,
      scrollModel: { lastColumn: "none" },
      dataModel: { data: [],location:"local" },
      selectionModel: { column:false, row:false, type:null },
      swipeModel: { on: false },
      stripeRows: false,
      colModel: colModelForeign
    });

    const dataModelIndex = this.gridObjIndex.pqGrid('option','dataModel');
    const dataModelForeign = this.gridObjForeign.pqGrid('option','dataModel');
    this.getMarketSummary(dataModelIndex,dataModelForeign);
    this.timmer = setInterval(() =>{
        this.getMarketSummary(dataModelIndex,dataModelForeign);
    },60000)
  }

  private getMarketSummary(dataModelIndex,dataModelForeign){
    // this.gridObjIndex.pqGrid('showLoading');
    this.business.marketSummary().subscribe(val => {
      if(val.status == '0'){ // OK
        dataModelIndex.data = val.result.indexMarketSummaryList;
        dataModelForeign.data = val.result.foreignMarketSummaryList;
        this.noDataFlg = false;
        $(this.element.nativeElement).find(".row").show();
        this.refreshGrid();
      } else { // NG or WARN
        dataModelIndex.data = [];
        dataModelForeign.data = [];
        this.noRowMsg = Messages.ERR_0006 + "[CFDS1801T]";
        this.noDataFlg = true;
        $(this.element.nativeElement).find(".row").hide();
        this.updateView();
      }
      // this.gridObjIndex.pqGrid('hideLoading');
    },
    err=>{
      dataModelIndex.data = [];
      dataModelForeign.data = [];
      this.noRowMsg = Messages.ERR_0002 + "[CFDS1802C]";
      this.noDataFlg = true;
      $(this.element.nativeElement).find(".row").hide();
      // this.gridObjIndex.pqGrid('hideLoading');
      this.updateView();
    });
  }

  private refreshGrid(){
    this.gridObjIndex.pqGrid('refreshDataAndView');
    this.gridObjIndex.pqGrid('loadComplete');
    this.gridObjForeign.pqGrid('refreshDataAndView');
    this.gridObjForeign.pqGrid('loadComplete');
    this.updateView();
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
}
