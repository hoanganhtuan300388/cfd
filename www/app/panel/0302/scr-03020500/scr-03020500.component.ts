/**
 *
 * 約定履歴
 *
 */
import { Component, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/zip";
import { MessageBox } from '../../../util/utils';
import { ForceReload } from "../../../core/notification";
import { PanelManageService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, BusinessService, StringUtil, ResourceService } from '../../../core/common';
import { DropdownComponent, IDropdownItem } from '../../../ctrls/dropdown/dropdown.component';
import { IReqExecutionList, IResExecutionItem, IProductInfo, ILayoutInfo } from "../../../values/Values";
import { ERROR_CODE } from "../../../../../common/businessApi";
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { keyUpDown, DeepCopy, SetSelectd } from '../../../util/commonUtil';
import { Messages, GetWarningMessage} from '../../../../../common/message';

// #2297
import { DialogService } from "ng2-bootstrap-modal";
import { AlertModifyDialogComponent } from '../../../component/alert-modify-dialog/alert-modify-dialog.component';
//

import { AwakeContextMenu } from '../../../util/commonUtil'; // #2338
import { IResExecutionList } from 'app/values/http/executionList';

import { TitleBarComponent } from '../../../component/title-bar/title-bar.component';
import { SpeedOrderConfirmComponent } from '../../../component/speed-order-confirm/speed-order-confirm.component';

declare var $:any;
declare var pq:any;
declare var moment:any;
declare var saveAs:any;

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020500Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03020500',
  templateUrl: './scr-03020500.component.html',
  styleUrls: ['./scr-03020500.component.scss']
})
export class Scr03020500Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public addTitleBarId:string = 'title-bar-add-content';

  // title bar
  @ViewChild('titleBar') titleBar: TitleBarComponent;

  // contextMenu
  @ViewChild('contextMenuComponent') public contextMenuComponent: ContextMenuComponent;
  public contextItems = [
    { title : CommonConst.PANELLIST['03020301'].title, scrId: "03020301", enabled:true},
    { divider:true },
    { title : CommonConst.PANELLIST['03020104'].title, scrId: "03020104", enabled:true, useLayout:true},
    { title : CommonConst.PANELLIST['03020100'].title + '（売）', scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.SELL_TYPE_VAL, autoPrice:true, useLayout:true }, // #2410
    { title : CommonConst.PANELLIST['03020100'].title + '（買）', scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.BUY_TYPE_VAL , autoPrice:true, useLayout:true }, // #2410
    { title : CommonConst.PANELLIST['03030600'].title, scrId: "03030600", enabled:true, useLayout:true, option: { linked:true } }, // #2266, #2993
    { title : CommonConst.PANELLIST['03010500'].title + '登録', scrId: "03010500", enabled:true, useAlert:true} // #2297
  ]

  // dropdown
  @ViewChild('dropDownExecutionProduct') public dropDownExecutionProduct: DropdownComponent
  @ViewChild('dropDownOrderType') public dropDownOrderType: DropdownComponent
  @ViewChild('dropDownDate') public dropDownDate: DropdownComponent
  public executionProductItem:IDropdownItem[] = [
    {value:'', text:'全銘柄'}
  ];
  public orderTypeItem:IDropdownItem[] = [
    {value:'', text:'新規＆決済'},
    {value:'0', text:'新規'},
    {value:'1', text:'決済'}
  ];
  public dateItem:IDropdownItem[] = [
    {value:"1", text:'2週間前から'},
    {value:'2', text:'1ヶ月前から'},
    {value:'3', text:'2ヶ月前から'},
    {value:'4', text:'3ヶ月前から'}
  ];

  // grid
  public productInfo:IProductInfo[];
  public gridData:IResExecutionItem[];
  public executionGrid:any;

  // page
  public pageSize:number = 200;
  public currentPage:number = 1;
  public totalPage:number = 1;

  // tooltip text
  public NOROW_MSG:string = '対象のお取引はございません。';
  // public TOOLTIP_PREV_MOVE:string = Tooltips.PAGE_PREV_MOVE;
  // public TOOLTIP_NEXT_MOVE:string = Tooltips.PAGE_NEXT_MOVE;

  public dateFrom:string;
  public dateTo:string;

  private gridOption:any;
  private initFlg:boolean;
  private addExecutionSeq = 0;
  private notifyerSubscribe = [];
  private seletedIndex:number = null;
  public loadCompleteFlg:boolean = false;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
    public element: ElementRef,
    public business: BusinessService,
    public contextMenu: ContextMenuService,
    public changeRef:ChangeDetectorRef,
    public dialogService:DialogService,  // #2297
    public resource:ResourceService
    ) {
    super( '03020500', screenMng, element, changeRef);
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  protected initLayout(param:any){
    super.initLayout(param);

    var layout = param.layout as ILayoutInfo;
    let colOption = [];
    if(layout && layout.option && layout.option){
      let json = this.setColumnOption(layout.option.colOption);
      colOption = json || [];
    }

    this.business.symbols.getProductList().subscribe(val=>{
      this.productInfo = val;
      this.initGrid(colOption);
      this.requestData("1");
    });

    this.notification();
  }

  public getLayoutInfo():ILayoutInfo{
    let result:ILayoutInfo = super.getLayoutInfo();

    result.option = {
      colOption : this.getColumnOption()
    };

    return result;
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    this.notifyerSubscribe.forEach(s=>{
      s.unsubscribe();
    })
  }

  ngAfterViewInit(){
    super.ngAfterViewInit();
    $(this.element.nativeElement).find(".panel-contract-list").on("keydown",(e:KeyboardEvent)=>{
        SetSelectd(e,this.executionGrid,this.seletedIndex);
    })
  }

  /**
   * override function.
   *
   * 画面が最小化から復元された際、呼び出される。
   */
  public onPanelRestored(){
    super.onPanelRestored();

    if(this.executionGrid){
      this.executionGrid.pqGrid('refreshDataAndView');
    }      
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  private getColumnOption(){
    let colOption = [];
    for(let col of this.executionGrid.pqGrid('option','colModel')){
      colOption.push({
        dataIndx : col.dataIndx,
        width : col.width
      });
    }

    return JSON.stringify(colOption).replace(/\"/g, "'");
  }

  private setColumnOption(colOption:string){
    return JSON.parse(colOption.replace(/'/g, "\""));
  }

  // ************* DOM EVENTS ************** //
  onChangeOrderType($event){
    this.dropDownOrderType.select = $event.selected;
    this.setFilter();
  }

  onChangeExecutionProduct($event){
    this.dropDownExecutionProduct.select = $event.selected;
    this.setFilter();
  }

  onChangeDate($event){
    this.dropDownDate.select = $event.selected;
    this.executionGrid.pqGrid( "reset", { sort : true } );
    this.requestData(this.dropDownDate.select);
    // this.setFilter();
  }

  onClickExportCSV($event){
    let filename = 'executionHistory_'+moment().format('YYYYMMDD_HHmm');
    let format = 'csv';
    let data = this.executionGrid.pqGrid('exportData', {
      filename: filename,
      format: format,
      render: true
    });

    if(typeof data === "string"){
      data = data.replace(/(<([^>]+)>)/gi, ""); // remove html tag
      data = new Blob([data], { type:"text/plain;charset=UTF-8" });
    }

    saveAs(data, filename+'.'+format );
  }

  onClickRefresh($event){
    // this.executionGrid.pqGrid('option','dataModel',{ data: [], location: 'local' });
    this.requestData(this.dropDownDate.select, false);
  }

  onResizing($event){
    super.onResizing();
    this.executionGrid.pqGrid('option', 'height', this.getGridHeight());
    this.executionGrid.pqGrid('refreshDataAndView');
    let data = this.executionGrid.pqGrid('option','dataModel.data');
    if (!this.initFlg && data.length == 0) {
        this.executionGrid.pqGrid('loadComplete');
    }
    $(this.element.nativeElement).find('.dropdown-item.open .dropdown-toggle').trigger("click");
  }

  getGridHeight(){
    return $(this.element.nativeElement.querySelector(".panel")).outerHeight()-$(this.element.nativeElement.querySelector(".navbar")).outerHeight() - 2;
  }

  prevPage($event) {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.seletedIndex = null;
      this.setPage();
    }
  }

  nextPage($event) {
    if (this.currentPage < this.totalPage) {
      this.currentPage++;
      this.seletedIndex = null;
      this.setPage();
    }
  }

  // ************* FUNCTIONS ************** //
  setPage(){
    this.executionGrid.pqGrid('option','pageModel',{
      type: 'local',
      rPP: this.pageSize,
      curPage: this.currentPage
    });
    this.refreshGrid(true);
    this.updateView();
  }

  setFilter(){
    let cfdProductCode=this.dropDownExecutionProduct.select;
    let settleType=this.dropDownOrderType.select;

    this.executionGrid.pqGrid( "filter", {
      mode: 'AND',
      rules: [
        { dataIndx: 'cfdProductCode', condition: 'equal', value: cfdProductCode },
        { dataIndx: 'settleType', condition: 'equal', value: settleType },
      ]
    });

    this.currentPage = 1;
    this.executionGrid.pqGrid('option','pageModel.curPage', this.currentPage);
    this.updatePageNavi();
    this.refreshGrid(true);
    this.updateView();
  }

  hasPage(){
    if(this.executionGrid){
        let PM = this.executionGrid.pqGrid('option','pageModel');
        if( PM && PM.totalPages > 1){
            return true;
        }
    }
    return false;
  }

  updatePageNavi(){
    this.totalPage = this.executionGrid.pqGrid('option','pageModel.totalPages');
    this.totalPage = this.totalPage==0 ? 1 : this.totalPage;
  }

  setGridData(){
    this.executionGrid.pqGrid('option','dataModel',{ data: this.gridData, location: 'local' });
  }

  refreshGrid(reset:boolean){
    this.executionGrid.pqGrid('refreshDataAndView');

    if(reset){
      this.executionGrid.pqGrid('scrollRow', { rowIndxPage: 0 });
      this.checkIfShowNoData();
    }
    this.titleBar.didSetDisableExport(!this.loadCompleteFlg);
  }

   // ************* INIT GRID ************** //
  initGrid(colOption?:any) {
    var _self = this;

    let tempColModel = [
      { dataIndx: 'cfdProductCode', title: '銘柄', align: 'left', width: 144, tooltip: true, cls:'body-col-first',
        render:(ui)=>{
          return this.executionProductItem.find(ele=>ele.value==ui.cellData);
        },
        sortType:(rowData1,rowData2,dataIndx)=>{
          let data1 = this.productInfo.find(ele=>ele.cfdProductCode==rowData1.cfdProductCode).meigaraSeiKana;
          let data2 = this.productInfo.find(ele=>ele.cfdProductCode==rowData2.cfdProductCode).meigaraSeiKana;
          if(data1 > data2) return 1
          if(data1 < data2) return -1
          return 0
        }
      },
      { dataIndx: 'settleType', title: '取引', width: 64, render:(ui)=>{
          let text:string;
          switch(ui.cellData){
            case '0' : text = '新規'; break;
            case '1' : text = '決済'; break;
            default : text = '';
          }
          return text;
        }
      },
      { dataIndx: 'buySellType', title: '売買', width: 64, render:(ui)=>{
          let text:string;
          let cls:string;
          switch(ui.cellData){
            case '1' : text='売'; cls='label label-order-icon sell'; break;
            case '2' : text='買'; cls='label label-order-icon buy'; break;
            default : text='';
          }
          return '<span class="'+cls+'">'+text+'</span>';
        }
      },
      { dataIndx: 'executionQuantity', title: '約定数', width: 72, align: 'right', cls: 'body-col-num', format:'#,###' },
      { dataIndx: 'executionPrice', title: '約定価格', width: 72, align: 'right', cls: 'body-col-num', render:(ui)=>{
          let executionPrice = ui.cellData;
          let boUnit = this.productInfo.filter(val=>val.cfdProductCode==ui.rowData.cfdProductCode)[0].boUnit;
          let format = StringUtil.getBoUnitFormat(boUnit);
          let formatVal = StringUtil.formatNumber(executionPrice, format);
          return formatVal;
        }
      },
      { dataIndx: 'executionDatetime', title: '約定日時', width: 144, cls: 'body-col-num', render:(ui)=>{
          return moment(ui.cellData,'YYYYMMDDHHmmss').format('YY/MM/DD HH:mm:ss');
        }
      },
      { dataIndx: 'settleDate', title: '受渡日', width: 80, cls: 'body-col-num', render:(ui)=>{
          return moment(ui.cellData,'YYYYMMDDHHmmss').format('YY/MM/DD');
        }
      },
      { dataIndx: 'settleAmount', title: '受渡金額', width: 120, align: 'right', cls: 'body-col-num', render:(ui)=>{
          if (ui.rowData.settleType == '0') {
            return '<span>-</span>';
          }
          let text:string = StringUtil.formatNumber(ui.cellData, '#,###', true);
          let cls:string = '';

          if(ui.cellData > 0){ // +
            cls = 'text-price-up';
          } else if(ui.cellData < 0) { // -
            cls = 'text-price-down';
          }

          return '<span class='+cls+'>'+text+'</span><span class="unit">円</span>';
        }
      },
      { dataIndx: 'orderKey', title: '注文番号', width: 80, cls: 'body-col-num', render:(ui)=>{
          let text = ui.cellData.match(/\d{4}$/) ? ui.cellData.match(/\d{4}$/)[0] : '';
          return '<a href="#" style="text-decoration: none;" class="num-link">'+text+'</a>';
        }, postRender:function(ui){
            var grid = this,
            $cell = grid.getCell(ui);
            $cell.find('.num-link').bind('click',function(){
              let param = {
                orderJointId:ui.rowData.orderJointId,
                layout:{
                  external: _self.isExternalWindow()
                }
              }

              _self.screenMng.findPanel('03020301').subscribe(pnl=>{
                if (pnl && pnl.length > 0) {
                  _self.screenMng.fireChannelEvent('orderDetail', param);
                  _self.screenMng.panelFocus(pnl[0].uniqueId);
                } else {
                  _self.screenMng.openPanel( _self.screenMng.virtualScreen(), '03020301' , param);
                }
              })
            });
        }
      }
    ]

    let colModel = [];
    if(colOption && colOption.length != 0){
      colModel = colOption.map(m=>{
        let col = tempColModel.find(f=>f.dataIndx==m.dataIndx);
        col.width = m.width;
        return col;
      });
    } else {
      colModel = tempColModel;
    }

    let gridOption = {
      width: "auto",
      height: this.getGridHeight(),
      columnTemplate: { halign: 'center', align: 'center', dataType: 'string', tooltip: false },
      colModel: colModel,
      dataModel: { data: [], location: 'local' },
      pageModel: { type: 'local', rPP:this.pageSize },
      selectionModel: { type:'row', mode:'single' },
      sortModel: { on:true, cancel:true },
      scrollModel: { lastColumn:"none" },
      postRenderInterval: -1,
      editable: false,
      numberCell: false,
      swipeModel: { on: false },
      showBottom: true,
      showTitle: false,
      showToolbar: false,
      showTop: false,
      stripeRows: false,
      wrap: false,
      hwrap: false,
      strNoRows: this.NOROW_MSG,
      rowSelect:($event, ui)=> {
        if (ui.addList.length > 0) {
          this.seletedIndex = ui.addList[0].rowIndx;
        }
      },
      refresh: ($event, ui)=> {
        this.checkIfShowNoData();
      },
      rowDblClick: ($event:MouseEvent, ui)=>{
        this.showContextMenu($event, ui.rowData);
      },
      rowRightClick: ($event:MouseEvent, ui)=>{
        this.showContextMenu($event, ui.rowData);
      },
      cellKeyDown: ( event, ui ) => {
        keyUpDown(this.executionGrid,event,ui);
      }
    }

    if(this.gridOption){
      gridOption = this.gridOption;
    }

    this.executionGrid = $(this.element.nativeElement.querySelector("#grid"+this.pageId)).pqGrid(gridOption);
  }

  public showContextMenu($event:MouseEvent, rowData){
    this.contextMenu.show.next({
      contextMenu: this.contextMenuComponent,
      event: $event,
      item: rowData
    });
    $event.preventDefault();
    $event.stopPropagation();

    AwakeContextMenu($event); // #2338
  }

  public openPanel(scrId:string, rowData?:any, item?:any){
    // #2266
    let self = this;
    try {
      let param:any;

      if(!!item) {
        if(item.useLayout === true) {
          param = {};
          let layout:ILayoutInfo = {} as ILayoutInfo;
          if(!!rowData) {
            layout.productCode = rowData.cfdProductCode;
            if(item.option) {
              layout.option = DeepCopy(item.option);
            }

            if(!layout.option) {
              layout.option = {};
            }

            layout.option.buySellType = item.buySellType ? item.buySellType : rowData.buySellType;
            layout.option.productName = self.executionProductItem.find(el => el.value == rowData.cfdProductCode).text;
            layout.option.channl = "comm";

            // #2410
            if(item.autoPrice == true) {
              layout.option.price = CommonConst.NEW_ORDER_PRICE_AUTO_UPDATE_PRICE;
            }

            if(item.orderType) {
              layout.option.orderType = item.orderType;
            }

            // 価格は入力値が優先
            if(item.price) {
              layout.option.price = item.price;
            }
            //
          }

          param.layout = layout;
        }
        // #2297
        else if(item.useAlert === true) {
          let dialogService:DialogService = self.dialogService;
          if(dialogService) {
            if(!!rowData) {
              let params:any = {
                key:undefined,
                product:rowData.cfdProductCode,
                basicRate:undefined
              };

              dialogService.addDialog(AlertModifyDialogComponent,{params:params}).subscribe(
                (val) => {
                  if(val) {
                    self.panelMng.fireChannelEvent('alertAddModify', {});
                  }
                });
            }
          }

          return;
        }
        //
        else {
          param = {
            buySellType: null,
            productCode: null,
            productName: null,
            orderKey: null,
            channel: 'comm'
          };
          if(!!rowData) {
            param.buySellType=item && item.buySellType ? item.buySellType : rowData.buySellType;
            param.productCode=rowData.cfdProductCode;
            param.productName=this.executionProductItem.find(el => el.value == rowData.cfdProductCode).text;
            param.orderKey=rowData.orderKey
          }
        }
      }

      // 外出した画面から呼び出される画面は外だして表示。
      if(param.layout == null){
        param.layout = {};
      }
      param.layout.external = this.isExternalWindow();

      if (item.scrId == "03020301") {
        param.orderJointId = rowData.orderJointId;
        this.screenMng.findPanel('03020301').subscribe(pnl=>{
          if (pnl && pnl.length > 0) {
            this.screenMng.fireChannelEvent('orderDetail', param);
            this.screenMng.panelFocus(pnl[0].uniqueId);
          } else {
            this.panelMng.openPanel( this.panelMng.virtualScreen(), scrId, param);
          }
        });
      } 
      else if(scrId == "03020104"){  // speed order
        let disposable ;
        if (this.resource.confirmHideSpeedOrderAgreement == false) {
          if(this.resource.environment.demoTrade){
            disposable = this.dialogService.addDialog(SpeedOrderConfirmComponent, { params: param });
          }else{
            disposable = this.dialogService.addDialog(SpeedOrderConfirmComponent, { params: param });
          }
        } else {
          this.panelMng.openPanel( this.panelMng.virtualScreen(), scrId, param);
        }              
      }      
      else {
        this.panelMng.openPanel( this.panelMng.virtualScreen(), scrId, param);
      }
    }
    catch(e) {
      console.error(e);
    }
  }

  public onClickContextItem(rowData: any, item:any){
    this.openPanel(item.scrId, rowData, item);
  }

  // ************* HTTP REQUEST ************** //
  requestData(executionDateType:string, isCache: boolean = true) {
    // this.executionGrid.pqGrid('showLoading');
    this.initFlg = true;
    this.loadCompleteFlg = false;
    this.titleBar.didSetDisableExport(!this.loadCompleteFlg);
    this.makeDropDownDisable();
    let obExecutionProductList = this.business.getExecutionProductList();
    // let obExecutionList = this.business.getExecutionList(input);
    let obExecutionList: Observable<IResExecutionList>;

    Observable.zip(obExecutionProductList).subscribe(
      val => {
        let resExProductList = val[0];
        this.executionProductItem = [{value:'', text:'全銘柄'}];

        switch(resExProductList.status){
          case ERROR_CODE.OK:
            for (let product of resExProductList.result.executionProductList) {
              this.executionProductItem.push({
                value : product.cfdProductCode,
                text : product.meigaraSeiKanji
              });
            }
            this.requestData2(executionDateType, isCache);
          break;
          case ERROR_CODE.WARN:
          case ERROR_CODE.NG:
          // [TODO]: ADD ERROR HANDLER
          break;
        }
      },
      err=>{
        this.initFlg = false;
        switch(err.status){
          case ERROR_CODE.NETWORK:
            this.gridData = [];
            this.loadCompleteFlg = true;
            this.setGridData();
            MessageBox.info({title:'約定履歴取得エラー', message:(Messages.ERR_0002 + '[CFDS1002C]')});
            this.executionGrid.pqGrid("option", "strNoRows", Messages.ERR_0002 + '[CFDS1002C]');
            this.refreshGrid(false);
          // reconnect fail
          break;
          case ERROR_CODE.HTTP:
          // http status error
          break;
        }
        // this.executionGrid.pqGrid('hideLoading');
      }
    );
  }

  notification(){
    this.notifyerSubscribe.push(this.business.notifyer.execution().subscribe(val=>{
      if(val.type == "new"){
        this.addExecution(val);
      }else if(val.type == "append"){
        this.appendExcution(val);
      }else if(val.type == "delete"){
        this.deleteExecution(val);
      }else if(val.type == "reload"){
        this.requestData(this.dropDownDate.select);
      }
    }));

    this.notifyerSubscribe.push(this.business.notifyer.forceReload().subscribe(val=>{
      if(val == ForceReload.orderEvent){
        this.requestData(this.dropDownDate.select);
      }
    }));

    this.notifyerSubscribe.push(this.business.notifyer.powerAmount().subscribe(val=>{
      if (val && val.status == ERROR_CODE.OK) {
        // datetime:"20180111113914"
        //yyyymmdd000059
        if(Number(val.datetime.slice(-6)) < 60) { // 1分間隔で発生するので00:00:00 ~ 00:00:59の間に発生する
          this.requestData(this.dropDownDate.select);
        }
      }
    }));        

  }

  private addExecution(val){
    if(val){
      let dataModel = this.executionGrid.pqGrid('option','dataModel');

      for(let i=val.executions.length-1; i>=0; i--){
        let row = val.executions[i];
        // add excutionProduct
        if(-1 == this.executionProductItem.findIndex(f=>f.value==row.cfdProductCode)){
          this.executionProductItem.push({
            value:row.cfdProductCode,
            text:this.productInfo.filter(s=>s.cfdProductCode==row.cfdProductCode)[0].meigaraSeiKanji
          })
        }
        // add excution
        if(dataModel.data){
          row.pq_order = --this.addExecutionSeq;
          dataModel.data.splice(0, 0, row);
        }
      }
      this.refreshGrid(false);
      this.updatePageNavi();
    }
  }

  private appendExcution(val){
    if(val){
      // console.log(val);
      let dataModel = this.executionGrid.pqGrid('option','dataModel');
      if(dataModel.data){
        let seq = dataModel.data.length + dataModel.dataUF.length;
        for(let i=0; i<val.executions.length; i++){
          let row = val.executions[i];

          row.pq_order = ++seq;
          dataModel.data.push(row);
        }
      }
      this.loadCompleteFlg = val.last;
      if(val.last) {
        this.makeDropDownDisable();
        this.refreshGrid(false);
        this.updatePageNavi();
        this.updateView();
      }
    }
  }

  private deleteExecution(val){
    // delete old execution
    if(val){
      let dataModel = this.executionGrid.pqGrid('option','dataModel');
      val.executions.forEach(row=>{
        let idx = dataModel.data.findIndex(f=>f.executionKey == row.executionKey);

        if(idx!=-1){
          dataModel.data.splice(idx,1);
        }else{
          idx = dataModel.dataUF.findIndex(f=>f.executionKey == row.executionKey);
          if(idx!=-1){
            dataModel.dataUF.splice(idx,1);
          }
        }
      })
    }
    this.refreshGrid(false);
    this.updatePageNavi();
  }

  private checkIfShowNoData(){
    if (this.executionGrid) {
        let data = this.executionGrid.pqGrid('option','dataModel.data');
        if (!this.initFlg && data.length == 0) {
            this.executionGrid.pqGrid('loadComplete');
        }
    }
  }

  private makeDropDownDisable(){
    if (this.loadCompleteFlg) {
      $(this.element.nativeElement).find(".dropdown-toggle").attr("disabled",false);
      if (this.executionGrid) {
        this.executionGrid.pqGrid( "option", "sortModel", { on: true, cancel:true, single:true, type:"local" } );
      }
    } else {
      $(this.element.nativeElement).find(".dropdown-toggle").attr("disabled",true);
      if (this.executionGrid) {
        this.executionGrid.pqGrid( "option", "sortModel", { on: false } );
      }
    }
  }

// ************* HTTP REQUEST ************** //
requestData2(executionDateType:string, isCache: boolean = true) {
  // this.executionGrid.pqGrid('showLoading');
  // this.initFlg = true;
  // this.loadCompleteFlg = false;
  // this.titleBar.didSetDisableExport(!this.loadCompleteFlg);
  // this.makeDropDownDisable();
  let input: IReqExecutionList = { listdataGetType:'ALL', executionDateType:executionDateType };
  // let obExecutionProductList = this.business.getExecutionProductList();
  // let obExecutionList = this.business.getExecutionList(input);
  let obExecutionList: Observable<IResExecutionList>;
  if(isCache) {
    obExecutionList = this.business.getExecutionList(input);
  }
  else {
    obExecutionList = this.business.getExecutionListDirect(input);
  }    

  Observable.zip(obExecutionList).subscribe(
    val => {
      let resExList = val[0];

      this.gridData = [];
      // console.log(resExList.result);
      switch(resExList.status){
        case ERROR_CODE.OK:
          this.gridData = resExList.result.executionList;
          if(this.loadCompleteFlg) {  // resExProductListが resExListのappendより遅く来る場合があるのでその対応
          }
          else {
            this.loadCompleteFlg = resExList.result.append?false:true;
          }
          this.makeDropDownDisable();
          this.setGridData();
        break;
        case ERROR_CODE.WARN:
          this.loadCompleteFlg = true;
          this.setGridData();
          MessageBox.info({title:'約定履歴取得エラー', message:Messages.ERR_0001});
          this.executionGrid.pqGrid("option", "strNoRows", Messages.ERR_0006);
        break;
        case ERROR_CODE.NG:
          this.loadCompleteFlg = true;
        // [TODO]: ADD ERROR HANDLER
          this.setGridData();
          MessageBox.info({title:'約定履歴取得エラー', message:(Messages.ERR_0001 + '[CFDS1001T]')}); 
          this.executionGrid.pqGrid("option", "strNoRows", Messages.ERR_0006 + '[CFDS1001T]');
        break;
      }
      this.initFlg = false;        
      this.setFilter();
      this.setPage();
      this.refreshGrid(true);
      // this.executionGrid.pqGrid('hideLoading');
    },
    err=>{
      this.initFlg = false;
      switch(err.status){
        case ERROR_CODE.NETWORK:
          this.loadCompleteFlg = true;
          this.setGridData();
          MessageBox.info({title:'約定履歴取得エラー', message:(Messages.ERR_0002 + '[CFDS1002C]')});
          this.executionGrid.pqGrid("option", "strNoRows", Messages.ERR_0002 + '[CFDS1002C]');
          this.refreshGrid(false);
        // reconnect fail
        break;
        case ERROR_CODE.HTTP:
        // http status error
        break;
      }
      // this.executionGrid.pqGrid('hideLoading');
    }
  );
}  
}
