/**
 *
 * 建玉一覧
 *
 */
import { Component, ElementRef, ViewChild, ChangeDetectorRef, ComponentFactoryResolver } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/zip";
import { DialogService } from "ng2-bootstrap-modal";
import { ForceReload } from "../../../core/notification";
import { PanelManageService, PanelViewBase, IViewData, IPanelClose, CommonEnum, CommonConst, Tooltips, BusinessService, StringUtil, CommonUtil, ResourceService } from '../../../core/common';
import { DropdownComponent, IDropdownItem } from '../../../ctrls/dropdown/dropdown.component';
import { IStreamPrice, IResPositionInfo, IConversionRate, IResconversionRate, IReqPriceList, IReqPositionList, IResPositionList, IResProductList, IProductInfo, IResPrice} from "../../../values/Values";
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { keyUpDown, DeepCopy, SetSelectd } from '../../../util/commonUtil';
import { ERROR_CODE } from "../../../../../common/businessApi";
import { Messages, GetWarningMessage} from '../../../../../common/message';
import { MessageBox } from '../../../util/utils';

// #2266
import { ILayoutInfo } from '../../../values/Values';

// #2297
import { AlertModifyDialogComponent } from '../../../component/alert-modify-dialog/alert-modify-dialog.component';
//

import { AwakeContextMenu } from '../../../util/commonUtil'; // #2338

import { SpeedOrderConfirmComponent } from '../../../component/speed-order-confirm/speed-order-confirm.component';

declare var $:any;
declare var pq:any;
declare var moment:any;
declare var BigDecimal:any;

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020400Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03020400',
  templateUrl: './scr-03020400.component.html',
  styleUrls: ['./scr-03020400.component.scss']
})
export class Scr03020400Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public addTitleBarId:string = 'title-bar-add-content';
  // contextMenu
  @ViewChild('contextMenuComponent') public contextMenuComponent: ContextMenuComponent;
  public contextItems = [];
  public contextItems1 = [
    { title : '一括決済注文',           scrId: "03020103", enabled:true, all:true, useLayout:true },
    { title : 'ロスカットレート一括変更', scrId: "03020200", enabled:true, all:true, useLayout:true },
    { divider:true },
    { title : 'スピード注文',           scrId: "03020104", enabled:true, useLayout:true },
    { title : '新規注文（売）',         scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.SELL_TYPE_VAL, autoPrice:true, useLayout:true }, // #2410
    { title : '新規注文（買）',         scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.BUY_TYPE_VAL , autoPrice:true, useLayout:true }, // #2410
    { title : 'チャート',              scrId: "03030600", enabled:true, useLayout:true, option: { linked:true } }, // #2266, #2993
    { title : 'アラート登録',           scrId: "03010500", enabled:true, useAlert:true} // #2297
  ]
  public contextItems2 = [
    { title : '決済注文',              scrId: "03020103", enabled:true, useLayout:true },
    { title : '一括決済注文',           scrId: "03020103", enabled:true, all:true, useLayout:true },
    { title : 'ロスカットレート変更',    scrId: "03020200", enabled:true, useLayout:true },
    { title : 'ロスカットレート一括変更', scrId: "03020200", enabled:true, all:true, useLayout:true },
    { divider:true },
    { title : 'スピード注文',          scrId: "03020104", enabled:true, useLayout:true },
    { title : '新規注文（売）',        scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.SELL_TYPE_VAL, autoPrice:true, useLayout:true }, // #2410
    { title : '新規注文（買）',        scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.BUY_TYPE_VAL , autoPrice:true, useLayout:true }, // #2410
    { title : 'チャート',             scrId: "03030600", enabled:true, useLayout:true, option: { linked:true } }, // #2266, #2993
    { title : 'アラート登録',          scrId: "03010500", enabled:true, useAlert:true} // #2297
  ]

  // dropdown
  @ViewChild('dropDownProductList') dropDownProductList: DropdownComponent
  @ViewChild('dropDownOrderType') dropDownOrderType: DropdownComponent
  @ViewChild('dropDownViewType') dropDownViewType: DropdownComponent
  productListItem:IDropdownItem[];
  orderTypeItem:IDropdownItem[];
  viewTypeItem:IDropdownItem[];

  // grid
  positionGrid:any;
  gridData:any[]=[];
  render:any;

  productList:any[];
  summary:any[];
  resPrice:IResPrice[];
  resProduct:IProductInfo[];
  resConvRate:IConversionRate[];

  subscribeTick:any[]=[];

  NOROW_MSG:string = '対象の建玉はございません。';

  private initFlg:boolean;
  private focusedRowData:any;
  private closeSubscrib:any;
  private notifySubscribe = [];
  private seletedIndex:number = null;
  private onfocusSubscrib:any;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
    public element: ElementRef,
    public business: BusinessService,
    public componentFactoryResolver: ComponentFactoryResolver,
    public dialogService:DialogService,
    public changeRef:ChangeDetectorRef,
    public contextMenu: ContextMenuService,
    public resource:ResourceService)
  {
    super( '03020400', screenMng, element, changeRef);

    this.render = this.getRender();
    this.productListItem = [
      {value:'', text:'全銘柄'}
    ];
    this.orderTypeItem = [
      {value:'', text:'売＆買'},
      {value:'1', text:'売'},
      {value:'2', text:'買'}
    ];
    this.viewTypeItem = [
      {value:'', text:'サマリー/建玉'},
      {value:'1', text:'サマリーのみ'},
      {value:'2', text:'建玉のみ'}
    ];

    this.notification();
    this.closeSubscrib = this.panelMng.onClosePanel().subscribe(val => {
      if (val.id == "03020103") {
        if(val.reason && val.reason.closeReason == 'panelClosed'){
          this.didUnColorTheRow();
        }
      }
    })
    this.onfocusSubscrib = this.panelMng.onfocus().subscribe(val => {
      if (val.id == "03020103") {
        this.focusedRowData = val.panelParams.layout.option.focusedRowData;
      } else {
        this.focusedRowData = null;
      }
      this.didColorTheRow();
    });
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  protected initLayout(param:any){
    super.initLayout(param);

    var layout = param.layout as ILayoutInfo;
    let colOption = [];
    if(layout && layout.option && layout.option){
      let json = this.setLayoutOption(layout.option);
      colOption = json.colOption || [];
      this.dropDownViewType.select = json.viewType;
      this.focusedRowData = json.focusedRowData;
    }

    this.business.symbols.getProductList().subscribe(val=>{
      this.resProduct = val;
      this.initGrid(colOption);
      this.didColorTheRow();
      this.setGroupModel();
      this.requestData();
    });
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    this.unsubscribe();
    if (this.closeSubscrib) {
      this.closeSubscrib.unsubscribe();
      this.closeSubscrib = null;
    }
    if (this.onfocusSubscrib) {
      this.onfocusSubscrib.unsubscribe();
      this.onfocusSubscrib = null;
    }

    this.notifySubscribe.forEach(s=>{
      s.unsubscribe();
    })
  }

  ngAfterViewInit(){
    super.ngAfterViewInit();
    $(this.element.nativeElement).find(".panel-position-list").on("keydown",(e:KeyboardEvent)=>{
        SetSelectd(e,this.positionGrid,this.seletedIndex);
    })
  }

  public getLayoutInfo():ILayoutInfo{
    let result:ILayoutInfo = super.getLayoutInfo();

    result.option = this.getLayoutOption();

    return result;
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  private getLayoutOption(){
    let option:{colOption?:any, viewType?:any, focusedRowData?:any} = {};

    let colOption = [];
    for(let col of this.positionGrid.pqGrid('option','colModel')){
      colOption.push({
        dataIndx : col.dataIndx,
        width : col.width
      });
    }

    option.colOption = colOption;
    option.viewType = this.dropDownViewType.select;
    option.focusedRowData = this.focusedRowData;

    return JSON.stringify(option).replace(/\"/g, "'");
  }

  private setLayoutOption(option:string){
    return JSON.parse(option.replace(/'/g, "\""));
  }

  unsubscribe(){
    if( this.subscribeTick.length != 0){
      this.subscribeTick.forEach(ob => ob.unsubscribe());
      this.subscribeTick = [];
    }
  }

  onChangeOrderType($event){
    this.dropDownOrderType.select=$event.selected;
    this.setFilter();
  }

  onChangeProductList($event){
    this.dropDownProductList.select=$event.selected;
    this.setFilter();
  }

  onChangeViewType($event){
    this.dropDownViewType.select=$event.selected;
    this.setGroupModel();
    this.bindGridData();
    this.setFilter();
  }

  onClickRefresh($event){
    this.requestData(false);
  }

  onResizing($event){
    super.onResizing();
    this.positionGrid.pqGrid('option','height',this.getGridHeight());
    this.positionGrid.pqGrid('refreshDataAndView');
    this.checkIfShowNoData();
    $(this.element.nativeElement).find('.dropdown-item.open .dropdown-toggle').trigger("click");
  }

  getGridHeight(){
    return $(this.element.nativeElement.querySelector(".panel")).outerHeight()-$(this.element.nativeElement.querySelector(".navbar")).outerHeight() - 2;
  }

  // ************* GRID ************** //
  initGrid(colOption?:any) {
    let that = this;
    pq.aggregate.all = (col,arr)=>{
      if(arr.dataIndx == 'isSummary') return true;
    };

    let tempColModel = [
      { dataIndx: 'colOrderButton', title: this.getOrderButtonTitle(), sortable:false, width:92, postRender: (ui)=>{this.postRenderOrderButton(ui)}, cls: 'body-col-first' },
      { dataIndx: 'colProductName', title: '銘柄', align: 'left', width:144, tooltip:true },
      { dataIndx: 'colBuySellType', title: '売買', width:72 },
      { dataIndx: 'colCurrentQuantity', title: '建玉数', align: 'right', width:96, cls: 'body-col-num' },
      { dataIndx: 'colOrderQuantity', title:'注文中', align: 'right', width:72, cls: 'body-col-num' },
      { dataIndx: 'colQuotationPrice', title: '建単価', align: 'right', width:112, cls: 'body-col-num' },
      { dataIndx: 'colCurrentPrice', title: '現在値', align: 'right', width:72, cls: 'body-col-num' },
      { dataIndx: 'colLosscutRate', title: 'ロスカットレート', sortable:false, align: 'right', width:96, postRender: (ui)=>{this.postRenderLosscutRate(ui)}, cls: 'body-col-num header-col-text-transform-80' },
      { dataIndx: 'colProfit', title: '評価損益', align: 'right', width:144, cls: 'body-col-num' },
      { dataIndx: 'colProfitRate', title: '損益率', align: 'right', width:88, cls: 'body-col-num' },
      { dataIndx: 'colInterestRateBalance', title: '金利/価格調整額', align: 'right', width:160, cls: 'body-col-num' },
      { dataIndx: 'colDividenedBalance', title: '権利調整額', align: 'right', width:152, cls: 'body-col-num' },
      { dataIndx: 'colMargin', title: '拘束証拠金', align: 'right', width:152, cls: 'body-col-num' },
      { dataIndx: 'colExcutionDate', title: '約定日時', sortable:false, width:144, cls: 'body-col-num' },
      { dataIndx: 'colPositionKey', title: '建玉番号', sortable:false, width:76, cls: 'body-col-num' },
      { dataIndx: 'isSummary', hidden:true },
      { dataIndx: 'cfdProductCode', hidden:true },
      { dataIndx: 'buySellType', hidden:true }
    ]

    let colModel = [];
    if(colOption && colOption.length != 0){
      colModel = colOption.map(m=>{
        let col = tempColModel.find(f=>f.dataIndx==m.dataIndx);
        (col as any).width = m.width;
        return col;
      });
    } else {
      colModel = tempColModel;
    }

    this.positionGrid = $(this.element.nativeElement).find("#grid"+this.pageId).pqGrid({
        width: 'auto',
        height: this.getGridHeight(),
        columnTemplate: { halign: 'center', align: 'center', dataType: 'string', summary:{ type: 'all' }, tooltip:false,
          render:(ui)=>{
            if(typeof this.render[ui.dataIndx] == 'function'){
              return this.render[ui.dataIndx](ui);
            }
            return ui;
          },
          sortType: (rowData1, rowData2, dataIndx)=>{
            // sort by summary
            if( this.dropDownViewType.select == '' ){
              let data1 = this.summary.filter(val=> rowData1.cfdProductCode == val.cfdProductCode && rowData1.buySellType == val.buySellType )[0];
              let data2 = this.summary.filter(val=> rowData2.cfdProductCode == val.cfdProductCode && rowData2.buySellType == val.buySellType )[0];
              if(data1[dataIndx] != data2[dataIndx]) {
                if(dataIndx == 'colProductName'){
                  return this.defaultSorter(data1,data2);
                }
                if(data1[dataIndx] < data2[dataIndx]) return -1;
                if(data1[dataIndx] > data2[dataIndx]) return 1;
                return this.defaultSorter(data1,data2);
              }
            }

            // sort
            if(dataIndx == 'colProductName'){
              return this.defaultSorter(rowData1,rowData2);
            }
            if(rowData1[dataIndx] < rowData2[dataIndx]) return -1;
            if(rowData1[dataIndx] > rowData2[dataIndx]) return 1;
            return this.defaultSorter(rowData1,rowData2);
          }
        },
        groupModel: this.getGroupModel(),
        colModel: colModel,
        dataModel: { data: [] },
        sortModel: { on:true, cancel:true },
        selectionModel: { type:'row', mode:'single' },
        scrollModel: { lastColumn:"none" },
        pageModel: { type: 'local', rPP:65535 },
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
          this.didColorTheRow();
          this.checkIfShowNoData();
        },
        cellKeyDown: ( event, ui ) => {
          keyUpDown(this.positionGrid,event,ui,true);
        },
        refreshHeader:function($event:Event, ui){
          if(that.dropDownViewType.select == ''){
            this.$header.find('.pq-grid-col').find('#plusButton').click(()=>this.Group().expandAll());
            this.$header.find('.pq-grid-col').find('#minusButton').click(()=>this.Group().collapseAll());
          } else {
            this.$cont.find('span.pq-group-icon').remove();
            this.$header.find('.pq-grid-col').find('#plusButton').hide();
            this.$header.find('.pq-grid-col').find('#minusButton').hide();
          }
        },
        rowDblClick:function($event:MouseEvent, ui){
          let isSummary = ui.rowData.isSummary;
          let rowData = that.getRowData(ui);

          if(rowData.colCurrentQuantity > rowData.colOrderQuantity){
            that.openPanel('03020103', rowData, ui, {useLayout:true});
          }
        },
        rowRightClick:function($event:MouseEvent, ui){
          that.contextItems = [];

          let isSummary = ui.rowData.isSummary;
          let rowData = that.getRowData(ui);

          if( isSummary ) {
            that.contextItems = that.contextItems1.map(m=>{
              let item:any = m;
              if(item.divider) return item;
              if(item.scrId == '03020103' && item.all) {
                  item.enabled = rowData.colCurrentQuantity > rowData.colOrderQuantity ? true : false;
              }
              return item;
            });

            that.showContextMenu($event, rowData, ui);
          } else {
            that.contextItems = that.contextItems2.map(m=>{
              let item:any = m;
              if(item.divider) return item;
              if(item.scrId == '03020103') {
                if(item.all) {
                  let summaryData = that.summary.find(m=>rowData.cfdProductCode == m.cfdProductCode);
                  item.enabled = summaryData.colCurrentQuantity > summaryData.colOrderQuantity ? true : false;
                } else {
                  item.enabled = rowData.colCurrentQuantity > rowData.colOrderQuantity ? true : false;
                }
              }
              return item;
            })

            that.showContextMenu($event, rowData, ui);
          }
        }
    });
  }

  openPanel(scrId:string, rowData:any, ui:any, item:any){
    // #2266
    let self = this;
    let isAll = false;
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
            layout.option.productName = self.resProduct.filter(el => el.cfdProductCode == rowData.cfdProductCode)[0].meigaraSeiKanji;
            layout.option.channl = "hold";

            isAll = item&&item.all ? item.all : rowData.isSummary; // 一括
            layout.option.isAll = isAll;
            layout.option.positionKey = layout.option.isAll?"":rowData.colPositionKey;

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
      }

      // 外出した画面から呼び出される画面は外だして表示。
      if(param.layout == null){
        param.layout = {};
      }
      param.layout.external = this.isExternalWindow();

      if (scrId == "03020103") {
        let data:any;
        if (ui) {
          data = ui.rowData;
        } else {
          data = item.rowData;
        }

        // find summary row
        if(isAll && !data.isSummary){
          for(let i=this.gridData.length+this.summary.length;i--;){
            let row = this.positionGrid.pqGrid( "getRowData", { rowIndx: i } );
            if(typeof row.pq_children !== 'undefined'
              && row.pq_children[0].cfdProductCode == data.cfdProductCode
              && row.pq_children[0].buySellType == data.buySellType){
                data = row;
                break;
            }
          }
        }

        this.focusedRowData = data;
        param.layout.option.focusedRowData = data;
      }

      if(scrId == "03020104"){  // speed order
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
        this.panelMng.openPanel( this.panelMng.virtualScreen(), scrId, param).subscribe(val=>{
          if (scrId == "03020103" && val) {
            this.didColorTheRow();
            this.updateView();
          }
        });
      }
    }
    catch(e) {
      console.error(e);
    }
  }

  showContextMenu($event, rowData, ui){
    this.updateView();
    this.contextMenu.show.next({
      contextMenu: this.contextMenuComponent,
      event: $event,
      item: {rowData:rowData,ui:ui}
    });
    $event.preventDefault();
    $event.stopPropagation();

    AwakeContextMenu($event); // #2338
  }

  onClickContextItem(row: any, item:any){
    this.openPanel(item.scrId, row.rowData, row.ui, item);
  }

  postRenderOrderButton(ui){
    let that = this;
    let grid = this.positionGrid.pqGrid("getInstance").grid;
    let $cell = grid.getCell(ui);

    $cell.find('button').bind('click',function(){
      let rowData = that.getRowData(ui);
      that.openPanel('03020103', rowData, ui, {useLayout:true});
    });
  }
  postRenderLosscutRate(ui){
    let that = this;
    let grid = this.positionGrid.pqGrid("getInstance").grid;
    let $cell = grid.getCell(ui);

    $cell.find('button,a').bind('click',function(){
      let rowData = that.getRowData(ui);
      that.openPanel('03020200', rowData, null, {useLayout:true});
    });
  }

  bindGridData(scrollTop:boolean=true) {
    if(this.dropDownViewType.select == '1'){
      this.positionGrid.pqGrid( "option", "dataModel.data", this.summary );
    } else{
      this.positionGrid.pqGrid( "option", "dataModel.data", this.gridData );
    }
    this.refreshGrid(scrollTop);
  }

  private refreshGrid(reset:boolean=true) {
    this.positionGrid.pqGrid( "refreshDataAndView" );
    if (reset) {
      this.positionGrid.pqGrid( "scrollRow", { rowIndxPage: 0 });
    this.checkIfShowNoData();
  }
  }

  setGroupModel() {
    if(this.dropDownViewType.select == '') {
      this.positionGrid.pqGrid( "getInstance" ).grid.Group().option(this.getGroupModel(true));
    } else {
      this.positionGrid.pqGrid( "getInstance" ).grid.Group().option(this.getGroupModel(false));
    }
  }

  getOrderButtonTitle(){
    let title = [];
    title.push('<button id="plusButton" class="button button-icon-tin" style="margin-left:-15px;"><i class="svg-icons icon-position-open"></i></button>');
    title.push('<button id="minusButton" class="button button-icon-tin" style="margin-left:4px;"><i class="svg-icons icon-position-close"></i></button>');
    return title.join('');
  }

  getGroupModel(on=true){
    let groupModel = {
      on: on,
      dataIndx: ['colProductName'],
      summaryInTitleRow: 'all',
      collapsed: [false],
      summaryEdit: false,
      fixCols: false,
      title:["{0}"]
    }
    return groupModel
  }

  setFilter(){
    let selectedProductCode = this.dropDownProductList.select;
    let selectedOrderType = this.dropDownOrderType.select;
    this.positionGrid.pqGrid( "filter", {
      oper: 'replace',
      mode: 'AND',
      rules: [
        { dataIndx: 'cfdProductCode', condition: 'equal', value: selectedProductCode },
        { dataIndx: 'buySellType', condition: 'equal', value: selectedOrderType }
      ]
    });
    this.positionGrid.pqGrid('scrollRow', { rowIndxPage: 0 });
    this.bindGridData();
    this.updateView();
  }

  getRender(){
    return {
      colOrderButton : (ui)=>{ //銘柄
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let attr:string = '';
        let currentQuantity:number = rowData.colCurrentQuantity;
        let orderQuantity:number = rowData.colOrderQuantity;

        if(currentQuantity > orderQuantity) {
          attr = ''
        } else {
          attr = 'disabled'
        }

        if(isSummary){ //サマリー
          return '<button type="button" class="button button-label button-position-collective-settlement" '+attr+' name="orderAll">一括決済</button>';
        } else {
          return '<button type="button" class="button button-label button-position-settlement"'+attr+' name="order">決済</button>';
        }
      },
      colProductName : (ui)=>{ //銘柄
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);
        let data = rowData.colProductName;
        data = data.split('--')[0];

        if(isSummary && this.dropDownViewType.select == ''){
          ui.cellData = data;
          ui.foramtVal = data;
          return ui;
        } else {
          if(this.dropDownViewType.select == '') return '';
          return data;
        }
      },
      colBuySellType : (ui)=>{ //売買
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let text:string = rowData.colBuySellType;
        let css:string;

        if(!isSummary && this.dropDownViewType.select == '') return '';

        switch(rowData.buySellType){
          case '1': css='label label-order-icon sell'; break;
          case '2': css='label label-order-icon buy'; break;
          default: css='';
        }

        return '<span class="'+css+'">'+text+'</span>';
      },
      colCurrentQuantity : (ui)=>{// 建玉数 / 注文中   colOrderQuantity
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let currentQuantity:number = rowData.colCurrentQuantity;
        let formatVal:string = StringUtil.formatNumber(currentQuantity, '#,###');

        return formatVal
      },
      colOrderQuantity : (ui)=>{// 建玉数 / 注文中   colOrderQuantity
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let orderQuantity:number = rowData.colOrderQuantity;
        let formatVal:string = StringUtil.formatNumber(orderQuantity, '#,###');

        return formatVal;
      },
      colExcutionDate : (ui)=>{ // 約定日時
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        if(isSummary){ //サマリー
          return '-';
        } else { // 建玉
          return moment(rowData.executionDate,'YYYYMMDDHHmmss').format('YY/MM/DD HH:mm:ss');
        }
      },
      colQuotationPrice : (ui)=>{ // 建単価
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let quotationPrice:number = rowData.colQuotationPrice;
        let boUnit = this.resProduct.filter(val=>val.cfdProductCode==rowData.cfdProductCode)[0].boUnit;
        let format = StringUtil.getBoUnitFormat(boUnit);
        let formatVal:string = StringUtil.formatNumber(quotationPrice, format);

        let text:string = formatVal;

        if(isSummary) text = '<span class="pull-left label">平均</span>' + text;

        return text
      },
      colCurrentPrice : (ui)=>{ // 現在値
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let currentPrice:number = rowData.colCurrentPrice;
        let boUnit = this.resProduct.filter(val=>val.cfdProductCode==rowData.cfdProductCode)[0].boUnit;
        let format = StringUtil.getBoUnitFormat(boUnit);
        let formatVal:string = StringUtil.formatNumber(currentPrice, format);

        let text:string = formatVal;

        return text;
      },
      colLosscutRate : (ui)=>{ // ロスカットレート
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let boUnit = this.resProduct.filter(val=>val.cfdProductCode==rowData.cfdProductCode)[0].boUnit;
        let format = StringUtil.getBoUnitFormat(boUnit);
        let formatVal:string = StringUtil.formatNumber(rowData.losscutRate, format);

        if(isSummary){ //サマリー
          return {
            text: '<button type="button" class="button button-label button-position-collective-change" name="losscutAll">一括変更</button>',
            style: 'text-align:center;'
          }
        } else { // 建玉
          return '<a href="#" class="num-link" name="losscut">'+formatVal+'</a>';
        }
      },
      colProfit : (ui)=>{ // 評価損益 colProfitRate
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let profit:number = rowData.colProfit;
        let formatVal:string = StringUtil.formatNumber(profit, '#,###');

        let text:string = isSummary ? '<span class="pull-left label">合計</span>' : '';

        if(formatVal == undefined){
          text += '<span> </span><span class="unit"></span>';
        }
        else if(profit < 0){
          text += '<span class="text-price-down">' + formatVal + '</span><span class="unit">円</span>';
        } else if (profit > 0){
          text += '<span class="text-price-up">+' + formatVal+ '</span><span class="unit">円</span>';
        } else {
          text += '<span>' + formatVal + '</span><span class="unit">円</span>';
        }

        return text;
      },
      colProfitRate : (ui)=>{ // 損益率 colProfitRate
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let quotationPrice:number = rowData.colQuotationPrice;
        let profitRate:number = rowData.colProfitRate;
        let format = '#,###.00';
        let formatVal:string = StringUtil.formatNumber(profitRate, '#,###.00');

        let text:string = ''

        if(formatVal == undefined) {
          text += '<span></span><span class="unit"></span>';
        }
        else if(quotationPrice <= 0) {
          text += '<span>-</span><span class="unit">%</span>';
        } else if(profitRate < 0){
          text += '<span class="text-price-down">' + formatVal + '</span><span class="unit">%</span>';
        } else if (profitRate > 0){
          text += '<span class="text-price-up">+' + formatVal + '</span><span class="unit">%</span>';
        } else {
          text += '<span>' + formatVal + '</span><span class="unit">%</span>';
        }

        return text;
      },
      colInterestRateBalance : (ui)=>{ // 金利/価格調整額
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let interestRateBalance:number = rowData.colInterestRateBalance;

        let text:string = '0';
        let formatVal:string = StringUtil.formatNumber(interestRateBalance, '#,###');

        if(interestRateBalance > 0) {
          text = '+' + formatVal;
        } else {
          text = formatVal;
        }

        if(isSummary){ //サマリー
          text = '<span class="pull-left label">合計</span>' + text + '<span class="unit">円</span>';
        } else { // 建玉
          text = text + '<span class="unit">円</span>';
        }

        return text;
      },
      colDividenedBalance : (ui)=>{ // 権利調整額
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let cfdProductCode:string = rowData.cfdProductCode;
        let resProduct:IProductInfo = this.resProduct.filter(el => el.cfdProductCode == cfdProductCode)[0];

        let dividendExistenceFlg:string = resProduct.dividendExistenceFlg;
        let dividenedBalance:number = rowData.colDividenedBalance;

        let text:string = '0';
        let formatVal:string = StringUtil.formatNumber(dividenedBalance, '#,###');

        if(dividenedBalance > 0) {
          text = '+' + formatVal
        } else {
          text = formatVal
        }

        if(isSummary){ //サマリー
          if(dividendExistenceFlg=='1'){
            text = '<span class="pull-left label">合計</span>' + text + '<span class="unit">円</span>';
          } else {
            text = '<span style="text-align:center">-</span>';
          }
        } else { // 建玉
          if(dividendExistenceFlg=='1'){
            text = text + '<span class="unit">円</span>';
          } else {
            text = '<span style="text-align:center">-</span>';
          }
        }

        return text;
      },
      colMargin : (ui)=>{ // 拘束証拠金
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let margin:number = rowData.colMargin;
        let formatVal:string = StringUtil.formatNumber(margin, '#,###');
        if(isSummary){ //サマリー
          return '<span class="pull-left label">合計</span>' + formatVal + '<span class="unit">円</span>';
        } else { // 建玉
          return formatVal + '<span class="unit">円</span>';
        }
      },
      colPositionKey : (ui)=>{ // 建玉番号
        let isSummary = ui.rowData.isSummary;
        let rowData = this.getRowData(ui);

        let positionKey:string = rowData.colPositionKey;

        if(isSummary){
          return '-';
        } else {
          return positionKey.match(/\d{4}$/) ? positionKey.match(/\d{4}$/)[0] : '';
        }
      }
    }
  }

  getRowData (ui){
    let isSummary = ui.rowData.isSummary;
    let children = ui.rowData.pq_children;
    let gridData = this.positionGrid.pqGrid('option','dataModel.data');
    let rowData;

    if(isSummary && this.dropDownViewType.select == '' && children) {
      rowData = this.summary.filter(el=>{
        if(el.cfdProductCode == children[0].cfdProductCode && el.buySellType == children[0].buySellType) return el;
      })[0];
    } else if(isSummary && this.dropDownViewType.select == '1') {
      rowData = this.summary.filter(el=>{
        if(el.cfdProductCode == ui.rowData.cfdProductCode && el.buySellType == ui.rowData.buySellType) return el;
      })[0];
    } else {
      rowData = ui.rowData;
    }

    return rowData
  }

  // calcBaseProfit(cPrice:number,qPrice:number,askbid:number,cCnt:number,tUnit:number, convbid:number,boUnit:number, floatingpos:number){
  //   let cPriceBig = new BigDecimal(cPrice.toString());
  //   let qPriceBig = new BigDecimal(qPrice.toString());
  //   let askbidBig = new BigDecimal(askbid.toString());
  //   let cCntBig = new BigDecimal(cCnt.toString());
  //   let tUnitBig = new BigDecimal(tUnit.toString());

  //   let baseProfit = cPriceBig.subtract(qPriceBig);
  //   baseProfit = baseProfit.multiply(askbidBig).multiply(cCntBig).multiply(tUnitBig);

  //   // let decPCnt = Math.max(StringUtil.getDecimalPCnt(tUnit), StringUtil.getDecimalPCnt(boUnit)) ;
  //   baseProfit.setScale(floatingpos, BigDecimal.ROUND_DOWN);
  //   return baseProfit;
  // }

  // calcProfit(cPrice:number,qPrice:number,askbid:number,cCnt:number,tUnit:number,convbid:number,interBal:number,dividBal:number, boUnit:number, floatingpos:number):number{
  //   let baseProfit = this.calcBaseProfit(cPrice,qPrice,askbid,cCnt,tUnit, convbid, boUnit, floatingpos);
  //   let convbidBig = new BigDecimal(convbid.toString());
  //   let interBalBig = new BigDecimal(interBal.toString());
  //   let dividBalBig = new BigDecimal(dividBal.toString());

  //   let result = baseProfit.multiply(convbidBig);
  //   result = result.setScale(0, BigDecimal.ROUND_DOWN);
  //   result = result.add(interBalBig).add(dividBalBig);

  //   return Number(result.toString());
  // }

  calcProfit2(cPrice:number,qPrice:number,askbid:number,cCnt:number,tUnit:number,convbid:number,interBal:number,dividBal:number, boUnit:number, floatingpos:number):number{
    let baseProfit = CommonUtil.calcBaseProfit(cPrice,qPrice,askbid,cCnt,tUnit, convbid, floatingpos);
    let convbidBig = new BigDecimal(convbid.toString());
    let interBalBig = new BigDecimal(interBal.toString());
    let dividBalBig = new BigDecimal(dividBal.toString());

    let profit;
    if (convbid == 0) {
      profit = baseProfit.multiply(convbidBig);
      profit = profit.setScale(0, BigDecimal.ROUND_DOWN);
      profit = profit.add(interBalBig).add(dividBalBig);
    } else {
      let result2 = interBalBig.divide(convbidBig, floatingpos, BigDecimal.ROUND_DOWN);
      let result3 = dividBalBig.divide(convbidBig, floatingpos, BigDecimal.ROUND_DOWN);
      profit = baseProfit.add(result2).add(result3);
    }

    return Number(profit.toString());
  }

  calcProfitRate(profit:number, cCnt:number, qPrice:number, tUnit:number){
    var profitBig = new BigDecimal(profit.toString());
    var cCntBig = new BigDecimal(cCnt.toString());
    var qPriceBig = new BigDecimal(qPrice.toString());
    var tUnitBig = new BigDecimal(tUnit.toString());
    var result = profitBig
      .divide(cCntBig, 15, BigDecimal.ROUND_DOWN)
      .divide(qPriceBig, 15, BigDecimal.ROUND_DOWN)
      .divide(tUnitBig, 4, BigDecimal.ROUND_DOWN)
      .multiply(new BigDecimal("100"));

    return Number(result.toString());
  }

  calcGridData(productCode:string = null){

    for(var i=this.gridData.length; i--;){
      let row = this.gridData[i];

      let cfdProductCode:string = row.cfdProductCode;

      if(productCode != null && productCode != cfdProductCode){
        continue;
      }

      let resProduct:IProductInfo = this.resProduct.filter(el => el.cfdProductCode == cfdProductCode)[0];
      let resPrice:IResPrice = this.resPrice.filter(el => el.cfdProductCode == cfdProductCode)[0];
      let accountType:string = resProduct.accountType.replace('CFD','');
      let productName:string = resProduct.meigaraSeiKanji;
      let currentPrice:number = null;

      if (resPrice) {
        currentPrice = row.buySellType=='1' ? Number(resPrice.ask) : Number(resPrice.bid);
      }

      let variable:number = row.buySellType=='1' ? -1 : 1;
      let quotationPrice:number = row.quotationPrice;
      let currentQuantity:number = row.currentQuantity || 0;
      let tradeUnit:number = resProduct.tradeUnit;
      let conversionRate = this.resConvRate.find((el)=>resProduct.currency==el.currency);
      let convBid:number;
      let floatingpos:number;
      if (resProduct.currency == 'JPY') {
        convBid = 1;
        floatingpos = 0;
      } else {
        convBid = Number(conversionRate.bid);
        floatingpos = Number(conversionRate.floatingpos);
      }
      let interestRateBalance:number = row.interestRateBalance || 0;
      let dividenedBalance:number = row.dividenedBalance || 0;
      let boUnit:number = this.resProduct.filter(val=>val.cfdProductCode==cfdProductCode)[0].boUnit;
      let profit:number = null;
      if (resPrice) {
        profit = CommonUtil.calcProfit(currentPrice,quotationPrice,variable,currentQuantity,tradeUnit,convBid,interestRateBalance,dividenedBalance, floatingpos);
      }
      let profit2:number = null;
      if (resPrice) {
        profit2 = this.calcProfit2(currentPrice,quotationPrice,variable,currentQuantity,tradeUnit,convBid,interestRateBalance,dividenedBalance, boUnit, floatingpos);
      }
      let profitRate:number = null;
      if (resPrice) {
        profitRate = this.calcProfitRate(profit2,currentQuantity,quotationPrice,tradeUnit);
      }
      row.colCurrentQuantity = currentQuantity;
      row.colQuotationPrice = quotationPrice;
      row.colProfit = profit;
      row.colProfitRate = profitRate;
      row.colInterestRateBalance = interestRateBalance;
      row.colDividenedBalance = dividenedBalance;
      row.colProductName = productName+'['+accountType+']'+'--[buySellType'+row.buySellType+']';
      row.colBuySellType = row.buySellType=='1' ? '売' : row.buySellType=='2' ? '買' : '';
      row.colOrderQuantity = row.orderQuantity || 0;
      if (resPrice) {
        row.colCurrentPrice = row.buySellType==1 ? resPrice.ask : resPrice.bid;
      } else {
        row.colCurrentPrice = null;
      }
      row.colMargin = Number(row.margin) + Number(row.optionalMargin);
      row.colPositionKey = row.positionKey;
    }
  }

  calcGridDataSummary(productCode:string = null){
    let arrBuySellType = ["1","2"];

    if(productCode == null){
      this.summary = [];
    }

    for(var k=arrBuySellType.length; k--;){
      for(var i=this.productList.length; i--;){
        let cfdProductCode = this.productList[i];
        let _buySellType = arrBuySellType[k];

        if(productCode != null && productCode != cfdProductCode){
          continue;
        }

        let dataArr = this.gridData.filter((el)=>{
          if(el.cfdProductCode == cfdProductCode && el.buySellType == _buySellType) return el;
        });

        if(dataArr.length == 0) continue;

        let resProduct:IProductInfo = this.resProduct.filter(el => el.cfdProductCode == cfdProductCode)[0];
        let resPrice:IResPrice = this.resPrice.filter(el => el.cfdProductCode == cfdProductCode)[0];

        let colCurrentQuantity:number = 0;
        dataArr.forEach((el)=>{ colCurrentQuantity += (el.currentQuantity ? Number(el.currentQuantity) : 0) });

        let colOrderQuantity:number = 0;
        dataArr.forEach((el)=>{ colOrderQuantity += (el.orderQuantity ? Number(el.orderQuantity) : 0) });

        let calcQuotationPriceBig = new BigDecimal("0");
        let quotationPriceBig;
        let currentQuantityBig;
        dataArr.forEach((el)=>{
          quotationPriceBig = new BigDecimal(el.quotationPrice.toString());
          if (el.currentQuantity) {
            currentQuantityBig = new BigDecimal(el.currentQuantity.toString());
          } else {
            currentQuantityBig = new BigDecimal("0");
          }
          calcQuotationPriceBig = calcQuotationPriceBig.add(quotationPriceBig.multiply(currentQuantityBig));
        });

        let decPCnt = StringUtil.getDecimalPCnt(resProduct.boUnit);
        let colCurrentQuantityBig = new BigDecimal(colCurrentQuantity.toString());
        let avgTmp = calcQuotationPriceBig.divide(colCurrentQuantityBig, decPCnt, BigDecimal.ROUND_DOWN);
        let colQuotationPrice:number = Number(avgTmp.toString());

        let buySellType:string = dataArr[0].buySellType;
        let currentPrice:number = null;
        if (resPrice) {
          currentPrice = buySellType=='1' ? Number(resPrice.ask) : Number(resPrice.bid);
        }
        let variable:number = buySellType=='1' ? -1 : 1;
        let tradeUnit:number = resProduct.tradeUnit;
        let conversionRate = this.resConvRate.find((el)=>resProduct.currency==el.currency);
        let convBid: number;
        let floatingpos: number;
        if (resProduct.currency == 'JPY') {
          convBid = 1;
          floatingpos = 0;
        } else {
          convBid = Number(conversionRate.bid);
          floatingpos = Number(conversionRate.floatingpos);
        }
        let colProfit:number = null;
        let colProfit2 = new BigDecimal("0");
        let tempProfit2:number = null;
        let boUnit:number = this.resProduct.filter(val=>val.cfdProductCode==cfdProductCode)[0].boUnit;
        if (resPrice) {
          dataArr.forEach((el)=>{
            colProfit += CommonUtil.calcProfit(Number(currentPrice), el.quotationPrice, variable, el.currentQuantity, tradeUnit, convBid, el.interestRateBalance, el.dividenedBalance, floatingpos);
            tempProfit2 = this.calcProfit2(currentPrice, el.quotationPrice, variable, el.currentQuantity, tradeUnit, convBid, el.interestRateBalance, el.dividenedBalance, boUnit, floatingpos);
            colProfit2 = colProfit2.add(new BigDecimal(tempProfit2.toString()))
          });
        }
        let sumCrrentQuantity:number=0;
        dataArr.forEach((el)=>{
          sumCrrentQuantity += Number(el.currentQuantity);
        });
        let colProfitRate:number = null;
        if (resPrice) {
          colProfitRate = this.calcProfitRate(Number(colProfit2.toString()), sumCrrentQuantity, colQuotationPrice, tradeUnit);
        }
        let colInterestRateBalance:number = 0;
        dataArr.forEach((el)=>{
          colInterestRateBalance += Number(el.interestRateBalance);
        });

        let colDividenedBalance:number = 0;
        dataArr.forEach((el)=>{
          colDividenedBalance += Number(el.dividenedBalance);
        });

        let colMargin:number = 0;
        dataArr.forEach((el)=>{
          colMargin += (Number(el.margin) + Number(el.optionalMargin));
        });

        let summary = {
          colProductName : dataArr[0].colProductName,
          colBuySellType : dataArr[0].colBuySellType,
          colCurrentQuantity : colCurrentQuantity,
          colOrderQuantity : colOrderQuantity,
          colQuotationPrice : colQuotationPrice,
          colCurrentPrice : dataArr[0].colCurrentPrice,
          colProfit : colProfit,
          colProfitRate : colProfitRate,
          colInterestRateBalance : colInterestRateBalance,
          colDividenedBalance : colDividenedBalance,
          colMargin : colMargin,
          colPositionKey : dataArr[0].positionKey,
          cfdProductCode : cfdProductCode,
          buySellType : dataArr[0].buySellType,
          isSummary : true
        }

        if(productCode == null){
          // add summary
          this.summary.push(summary);
        }else{
          // update summary
          for( let i=0; i < this.summary.length; i++){
            let smm = this.summary[i];
            if(smm.colProductName == summary.colProductName && 
              smm.colBuySellType == summary.colBuySellType ){
              Object.keys(summary).forEach(key=>{
                smm[key] = summary[key];
              })
              break;
            }
          }
        }
      }
    }

    if(productCode == null){
      this.summary.sort((a,b)=>this.defaultSorter(a,b));
    }
  }

  defaultSorter(a,b):number{
    let kana1 = this.resProduct.find(ele=>ele.cfdProductCode==a.cfdProductCode).meigaraSeiKana;
    let kana2 = this.resProduct.find(ele=>ele.cfdProductCode==b.cfdProductCode).meigaraSeiKana;
    if(kana1 < kana2) return -1;
    if(kana1 > kana2) return 1;
    if(a.buySellType < b.buySellType) return 1;
    if(a.buySellType > b.buySellType) return -1;
    if(a.colExcutionDate < b.colExcutionDate) return -1;
    if(a.colExcutionDate > b.colExcutionDate) return 1;
    if(a.colPositionKey < b.colPositionKey) return -1;
    if(a.colPositionKey > b.colPositionKey) return 1;
    return 0;
  }

  updateRowData(cfdProductCode) {
    let gridData = this.positionGrid.pqGrid('option','dataModel.data');
    let lastIndx = -1;
    let arrRefreshed = [];

    for(let i=gridData.length;i--;){
      let row = gridData[i];
      if(cfdProductCode == row.cfdProductCode){
        //this.positionGrid.pqGrid( "refreshRow", { rowIndx:row.pq_ri, refresh:false } );
        this.positionGrid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'colQuotationPrice', skip:true } );
        this.positionGrid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'colCurrentPrice', skip:true } );
        this.positionGrid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'colProfit', skip:true } );
        this.positionGrid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'colProfitRate', skip:true } );
      }
      arrRefreshed.push(row.pq_ri);
    }

    // refresh all summary rows
    if(this.dropDownViewType.select == ''){
      for(let i=this.gridData.length+this.summary.length;i--;){
        if(arrRefreshed.indexOf(i) == -1) {
          let row = this.positionGrid.pqGrid( "getRowData", { rowIndx: i } );
          if(typeof row.pq_children !== 'undefined' && row.pq_children[0].cfdProductCode == cfdProductCode){
            //this.positionGrid.pqGrid( "refreshRow", { rowIndx:row.pq_ri, refresh:false } );
            this.positionGrid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'colQuotationPrice', skip:true } );
            this.positionGrid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'colCurrentPrice', skip:true } );
            this.positionGrid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'colProfit', skip:true } );
            this.positionGrid.pqGrid( "refreshCell", { rowIndx:row.pq_ri, dataIndx:'colProfitRate', skip:true } );
          }
        }
      }
    }

    //this.positionGrid.pqGrid('getInstance').grid.iRefresh.softRefresh();
  }

  getPositionProductList(positions:IResPositionInfo[]){
    this.productListItem = [{value:'', text:'全銘柄'}];
    if(this.resProduct){
      for (let row of this.resProduct) {
        if( -1 < positions.findIndex(f=>f.cfdProductCode==row.cfdProductCode) ){
          this.productListItem.push({
            value: row.cfdProductCode,
            text: row.meigaraSeiKanji
          });
        }
      }
    }
    if (!this.productListItem.find(item => item.value == this.dropDownProductList.select)) {
      this.dropDownProductList.select = "";
      this.setFilter();
    }
    this.updateView();
  }

  reloadPosition(positions:IResPositionInfo[]){
    this.gridData = [];
    this.unsubscribe();    
    this.getPositionProductList(positions);
    this.getPriceList(positions);
  }

  // ********** HTTP REQUEST ********** //
  requestData(isCache: boolean = true) {
    // this.positionGrid.pqGrid('showLoading');
    this.gridData = [];
    this.unsubscribe();
    this.initFlg = true;
    var input: IReqPositionList = {listdataGetType:'ALL', pageCnt:200};

    let obConversionRate = this.business.getConversionRate();
    let obPositionList: Observable<IResPositionList>;
    if(isCache) {
      obPositionList = this.business.getPositionList(input);
    }
    else {
      obPositionList = this.business.getPositionListDirect(input);
    }

    Observable.zip(obConversionRate, obPositionList).subscribe(
      val => {
        this.resConvRate = val[0].result.conversionRateList;
        let resPositionList:IResPositionList = val[1];
        if(resPositionList.status == ERROR_CODE.OK){ // OK
          if (resPositionList.result.positionList) {
            this.getPositionProductList(resPositionList.result.positionList);
            this.getPriceList(resPositionList.result.positionList);
          }
        }
        else if(resPositionList.status == ERROR_CODE.WARN) { // NG or WARN
          this.positionGrid.pqGrid( "option", "dataModel.data", this.gridData );
          MessageBox.info({title:'建玉一覧取得エラー', message:Messages.ERR_0001});
          this.positionGrid.pqGrid("option", "strNoRows", Messages.ERR_0006);
          this.initFlg = false;
          this.refreshGrid(true);
        }
        else if(resPositionList.status == ERROR_CODE.NG) {
          this.positionGrid.pqGrid( "option", "dataModel.data", this.gridData );
          MessageBox.info({title:'建玉一覧取得エラー', message:(Messages.ERR_0001 + '[CFDS0801T]')});
          this.positionGrid.pqGrid("option", "strNoRows", Messages.ERR_0006 + '[CFDS0801T]');
          this.initFlg = false;
          this.refreshGrid(true);
        }
      },
      err=>{
        switch(err.status) {
          case ERROR_CODE.NETWORK:
            this.positionGrid.pqGrid( "option", "dataModel.data", this.gridData );
            MessageBox.info({title:'建玉一覧取得エラー', message:(Messages.ERR_0002 + '[CFDS0802C]')});
            this.positionGrid.pqGrid("option", "strNoRows", Messages.ERR_0002 + '[CFDS0802C]');
            this.initFlg = false;
            this.refreshGrid(false);
            break;
        }
      }
    );
  }

  //レート取得API
  getPriceList(positions:IResPositionInfo[]) {
    // remove duplicates
    this.productList = Array.from( new Set(
      positions.map((el)=>{return el.cfdProductCode;})
    ));

    let input:IReqPriceList={ productCodes:this.productList };
    this.business.getPriceList(input).subscribe(output => {

      if(output.status == '0'){ // OK
        this.gridData = positions;
        this.resPrice = output.result.priceList;

        this.calcGridData();
        this.calcGridDataSummary();

        this.gridData.sort((a,b)=>this.defaultSorter(a,b));

        this.bindGridData();

        this.setFilter();
        this.requestRealData();
      } else { // NG or WARN
        this.gridData = positions;
        this.resPrice = [];
        this.calcGridData();
        this.calcGridDataSummary();
        this.bindGridData();
        this.setFilter();
      }
      // this.positionGrid.pqGrid('hideLoading');
      this.initFlg = false;
      this.refreshGrid(true);
    },
    err=>{
      this.gridData = positions;
      this.resPrice = [];
      this.calcGridData();
      this.calcGridDataSummary();
      this.bindGridData();
      this.setFilter();
    });
  }

  requestRealData(){
    this.productList.forEach((el)=>{
      let tick = this.business.symbols.tick(el).subscribe(
        val=>{
          this.resPrice.forEach((resPrice) => {
            if(resPrice.cfdProductCode == val.cfdProductCode){
              resPrice = $.extend(resPrice,val); // update price
            }
          });

          this.calcGridData(val.cfdProductCode);
          this.calcGridDataSummary(val.cfdProductCode);
          this.updateRowData(val.cfdProductCode);
        }
      )
      this.subscribeTick.push(tick);
    });

  }

  notification(){
    this.notifySubscribe.push(this.business.notifyer.position().subscribe(val=>{
      if(val.type == 'new'){
        this.addPosition(val);
      } else if(val.type == 'update') {
        this.updatePosition(val);
      } else if(val.type == 'delete') {
        this.deletePosition(val);
      } else if(val.type == 'append') {
        this.appendPosition(val);
      } else if(val.type == 'reload') {
        this.reloadPosition(val.positions);
      }
    }));

    this.notifySubscribe.push(this.business.notifyer.conversionRate().subscribe(val=>{
      this.resConvRate.forEach(f=>{
        let newData = val.conversionRateList.find(d=>d.currency == f.currency);
        if(newData){
          f.currency = newData.currency;
          f.createBusinessDate = newData.createBusinessDate;
          f.seq = newData.seq.toString();
          f.createDatetime = newData.createDatetime;
          f.bid = newData.bid;
          f.ask = newData.ask;
          f.floatingpos = newData.floatingpos.toString();
        }
      });
      this.calcGridData();
      this.calcGridDataSummary();
      this.bindGridData();
    }));

    this.notifySubscribe.push(this.business.notifyer.forceReload().subscribe(val=>{
      if(val == ForceReload.orderEvent){
        this.requestData();
      }
    }))
  }

  private didColorTheRow() {
    if (this.positionGrid) {
      let $allTr = $(this.element.nativeElement).find("#grid" + this.pageId + ", tr.sync").removeClass("sync");
      if (!this.focusedRowData) {
        return;
      }

      let rowIndx = -1;
      // サマリーのみの場合
      if (this.dropDownViewType.select == "1" && this.focusedRowData.isSummary) {
        if (this.focusedRowData.pq_children) {
          rowIndx = this.findRowIndx(this.summary, this.focusedRowData.pq_children[0].buySellType, this.focusedRowData.pq_children[0].cfdProductCode);
        } else {
          rowIndx = this.findRowIndx(this.summary, this.focusedRowData.buySellType, this.focusedRowData.cfdProductCode);
        }
        // 建玉のみの場合
      } else if (this.dropDownViewType.select == "2" && !this.focusedRowData.isSummary) {
        rowIndx = this.findRowIndx(this.gridData, this.focusedRowData.buySellType, this.focusedRowData.cfdProductCode, this.focusedRowData.colPositionKey);
      } else if (this.dropDownViewType.select == "") {
        let seen = new Set();
        let tempDataKey;
        let tempSummaryIndx = -1;
        let tempPlus;
        let focusedBuySellType;
        let focusedCfdProductCode
        let colPositionKey;
        let summaryIndx;
        let gridDataIndx;
        if (this.focusedRowData.isSummary) {
          tempPlus = 0;
          if (this.focusedRowData.pq_children) {
            focusedBuySellType = this.focusedRowData.pq_children[0].buySellType.toString(), 
            focusedCfdProductCode = this.focusedRowData.pq_children[0].cfdProductCode.toString();
          } else {
            focusedBuySellType = this.focusedRowData.buySellType.toString(), 
            focusedCfdProductCode = this.focusedRowData.cfdProductCode.toString();
          }
        } else {
          tempPlus = 1;
          focusedBuySellType = this.focusedRowData.buySellType.toString();
          focusedCfdProductCode = this.focusedRowData.cfdProductCode.toString();
          colPositionKey = this.focusedRowData.colPositionKey;
        }

        if (!this.isMathedInFilter(focusedBuySellType, focusedCfdProductCode)) {
          return;
        }
        let tempBuySellType;
        let tempCfdProductCode;
        let gridIndx = -1;
        for (let i = 0; i < this.gridData.length; i++) {
          tempBuySellType = this.gridData[i].buySellType.toString();
          tempCfdProductCode = this.gridData[i].cfdProductCode.toString();
          if (!this.isMathedInFilter(tempBuySellType, tempCfdProductCode)) {
            continue;
          }
          gridIndx ++;
          if (summaryIndx && gridDataIndx) {
            break;
          }
          if (!gridDataIndx && colPositionKey == this.gridData[i].colPositionKey) {
            gridDataIndx = gridIndx;
          }
          tempDataKey = tempBuySellType + tempCfdProductCode;
          if (seen.has(tempDataKey)) continue;
          tempSummaryIndx++;
          if (!summaryIndx && this.isMatched(this.gridData[i], focusedBuySellType, focusedCfdProductCode)) {
            if (this.focusedRowData.isSummary) {
              gridDataIndx = gridIndx;
            }
            summaryIndx = tempSummaryIndx;
          }
          seen.add(tempDataKey)
        }
        rowIndx = summaryIndx + gridDataIndx + tempPlus;
      }

      let $tr = this.positionGrid.pqGrid("getRow", { rowIndx: rowIndx});
      if ($tr) {
        $tr.addClass("sync");
      }
    }
  }

  private findRowIndx(data:any[], buySellType:string, cfdProductCode:string, colPositionKey?:string) {
    let index = -1;
    if (!this.isMathedInFilter(buySellType, cfdProductCode)) {
      return index;
    }
    for (let i = 0; i < data.length; i++) {
      if (this.isMathedInFilter(data[i].buySellType, data[i].cfdProductCode)) {
        index ++;
        if (this.isMatched(data[i], buySellType, cfdProductCode, colPositionKey)) {
          break;
        }
      }
    }
    return index;
  }

  private isMathedInFilter(buySellType:string, cfdProductCode:string) {
    let filterProductCode = this.dropDownProductList.select;
    let filterOrderType = this.dropDownOrderType.select;
    return (!filterProductCode || filterProductCode == cfdProductCode) && (!filterOrderType || filterOrderType == buySellType);
  }

  private isMatched(data:any, buySellType:string, cfdProductCode:string, colPositionKey?:string) {
    if (colPositionKey) {
      return data.colPositionKey == colPositionKey;
    } else {
      return data.cfdProductCode == cfdProductCode && data.buySellType == buySellType;
    }
  }

  private didUnColorTheRow() {
    let rowIndx = this.positionGrid.pqGrid("getRowIndx", { rowData: this.focusedRowData });
    let $tr = this.positionGrid.pqGrid("getRow", { rowIndx: rowIndx.rowIndx });
    if ($tr) {
      $tr.removeClass("sync");
    }
  }

  private addPosition(val){
    val.positions.forEach(row=>{
      let indx = this.gridData.findIndex(f=>f.cfdProductCode==row.cfdProductCode);
      if(indx == -1){
        this.gridData.push(row);
        this.addProduct(row);
      } else {
        this.gridData.splice(indx,0,row);
      }
    });

    this.calcGridData();
    this.calcGridDataSummary();
    this.gridData.sort((a,b)=>this.defaultSorter(a,b));
    this.bindGridData(false);
  }

  private updatePosition(val){
    val.positions.forEach(row=>{
      for(let rowData of this.gridData){
        if(rowData.positionKey==row.positionKey){
          rowData = $.extend(rowData,row);
        }
      }
    });
    this.calcGridData();
    this.calcGridDataSummary();
    this.bindGridData(false);
  }

  private deletePosition(val){
    val.positions.forEach(row=>{
      let indx = this.gridData.findIndex(f=>f.positionKey==row.positionKey);
      this.gridData.splice(indx,1);
    });

    this.calcGridData();
    this.calcGridDataSummary();
    this.bindGridData(false);
  }

  private appendPosition(val){
    this.addPosition(val);
  }

  private addProduct(row){
    var prc:IResPrice = {
      cfdProductCode:row.cfdProductCode,
      bid:"0", ask:"0",
      change:"0", open:"0", high:"0", low:"0",
      validFlag:"0", bidChange:"0", askChange:"0", priceId:"0"};

    let idx = this.resPrice.findIndex(item=>item.cfdProductCode == row.cfdProductCode);
    if(idx < 0) {
      this.resPrice.push(prc);
    }
    idx = this.productList.findIndex(item=>item == row.cfdProductCode);
    if(idx < 0) {
      this.productList.push(row.cfdProductCode);
    }    
    idx = this.productListItem.findIndex(item=>item.value == row.cfdProductCode);
    if(idx < 0) {
      this.productListItem.push({value:row.cfdProductCode, text:this.business.symbols.getSymbolInfo(row.cfdProductCode).meigaraSeiKanji});
    }

    // get product price
    this.business.getPriceList({productCodes:[row.cfdProductCode]}).subscribe(output => {
      if(output.status == '0'){
        let idx = this.resPrice.findIndex(f=>f.cfdProductCode==row.cfdProductCode);
        this.resPrice[idx] = output.result.priceList[0];

        // get product tick
        let tick = this.business.symbols.tick(row.cfdProductCode).subscribe(
          val=>{
            this.resPrice.forEach((resPrice) => {
              if(resPrice.cfdProductCode == val.cfdProductCode){
                resPrice = $.extend(resPrice,val); // update price
              }
            });
    
            this.calcGridData();
            this.calcGridDataSummary();
            this.updateRowData(val.cfdProductCode);
          }
        )
        this.subscribeTick.push(tick);
      }
    });
  }

  private checkIfShowNoData(){
    if (this.positionGrid) {
      let data = this.positionGrid.pqGrid('option','dataModel.data');
      if (!this.initFlg && data.length == 0 && this.initFlg != undefined) {
          this.positionGrid.pqGrid('loadComplete');
      }
    }
  }

  /**
   * override function.
   *
   * 画面が最小化から復元された際、呼び出される。
   */
  public onPanelRestored(){
    super.onPanelRestored();

    if(this.positionGrid){
      this.positionGrid.pqGrid('refreshDataAndView');
    }    
  }

}
