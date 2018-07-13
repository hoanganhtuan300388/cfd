/**
 *
 * 注文一覧
 *
 */
import { Observable } from 'rxjs/Observable';
import { Component, ElementRef, ChangeDetectorRef,AfterViewInit, ViewChild  } from '@angular/core';
import { PanelManageService, BusinessService, IPanelClose, ResourceService,
         PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, StringUtil } from '../../../core/common';
import { DropdownComponent, IDropdownItem } from '../../../ctrls/dropdown/dropdown.component';
import { IReqOrderList, IResOrderItem, ILayoutInfo} from "../../../values/Values";
import { Subject } from 'rxjs/Subject';

import { keyUpDown, DeepCopy, SetSelectd } from '../../../util/commonUtil';
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { AlertModifyDialogComponent } from '../../../component/alert-modify-dialog/alert-modify-dialog.component';
import { DialogService } from "ng2-bootstrap-modal";
import { AwakeContextMenu } from '../../../util/commonUtil'; // #2338
import { ERROR_CODE } from "../../../../../common/businessApi";
import { Messages, GetWarningMessage} from '../../../../../common/message';
import { MessageBox } from '../../../util/utils';
import { window } from 'rxjs/operators/window';
import { IResOrderList } from 'app/values/http/orderList';
import { SpeedOrderConfirmComponent } from '../../../component/speed-order-confirm/speed-order-confirm.component';

declare var $:any;
declare var moment:any;

export interface ISortValue {
  cfdProductCode?:string,
  settleType?:string,
  buySellType?:string,
  orderQuantity?:number,
  orderPrice?:number,
  orderStatus?:string,
  orderDatetime?:string,
  invalidDatetime?:string,
  orderJointId?:string,
  orderKey?:string,
  isShow?:boolean,
  orderType?:string
}

const _STATUS_EXECUED   = "2";
const _STATUS_EXECUING  = "4";
const _STATUS_WAIT      = "0";
const _STATUS_CANCELED  = "3";
const _STATUS_CANCEING  = "5";
const _STATUS_INVALID   = "8";
const _NEW              = "0";
const _SETTLE           = "1";
const _BOTH             = "01";
const electron = (window as any).electron;

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020300Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03020300',
  templateUrl: './scr-03020300.component.html',
  styleUrls: ['./scr-03020300.component.scss']
})
export class Scr03020300Component extends PanelViewBase implements AfterViewInit{
    // page
    pageSize:number = 200;
    currentPage:number;
    totalPage:number;

    // tooltip text
    TOOLTIP_PREV_MOVE:string;
    TOOLTIP_NEXT_MOVE:string;

    public stockList = [];
    replace(arg0: any, arg1: any): any {
        throw new Error("Method not implemented.");
    }
    public orderProductList =[];

    private subscribeNotifyer:any;
    private dateCheckerNotifyer:any;
    private orderIndex = 0;

    private initFlg:boolean;
    private seletedIndex:number = null;
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------

  // contextMenu
    @ViewChild('contextMenuComponent') public contextMenuComponent: ContextMenuComponent;
    public contextItemsWithoutModify = [
        { title : CommonConst.PANELLIST['03020301'].title, scrId: "03020301", enabled:true},
        { divider:true },
        { title : CommonConst.PANELLIST['03020104'].title, scrId: "03020104", enabled:true, useLayout:true},
        { title : CommonConst.PANELLIST['03020100'].title + '（売）', scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.SELL_TYPE_VAL, autoPrice:true, useLayout:true }, // #2410
        { title : CommonConst.PANELLIST['03020100'].title + '（買）', scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.BUY_TYPE_VAL , autoPrice:true, useLayout:true }, // #2410
        { title : CommonConst.PANELLIST['03030600'].title, scrId: "03030600", enabled:true, useLayout:true, option: { linked:true } }, // #2266, #2993
        { title : CommonConst.PANELLIST['03010500'].title + '登録', scrId: "03010500", enabled:true, useAlert:true} // #2297
    ]
    public contextItemsWithModify = [
        { title : CommonConst.PANELLIST['03020101'].title, scrId: "03020101", enabled:true},
        { title : CommonConst.PANELLIST['03020102'].title, scrId: "03020102", enabled:true},
        { title : CommonConst.PANELLIST['03020301'].title, scrId: "03020301", enabled:true},
        { divider:true },
        { title : CommonConst.PANELLIST['03020104'].title, scrId: "03020104", enabled:true, useLayout:true},
        { title : CommonConst.PANELLIST['03020100'].title + '（売）', scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.SELL_TYPE_VAL, autoPrice:true, useLayout:true }, // #2410
        { title : CommonConst.PANELLIST['03020100'].title + '（買）', scrId: CommonConst.PANEL_ID_NEW_ORDER, enabled:true, buySellType:CommonConst.BUY_TYPE_VAL , autoPrice:true, useLayout:true }, // #2410
        { title : CommonConst.PANELLIST['03030600'].title, scrId: "03030600", enabled:true, useLayout:true, option: { linked:true } }, // #2266, #2993
        { title : CommonConst.PANELLIST['03010500'].title + '登録', scrId: "03010500", enabled:true, useAlert:true} // #2297
    ]
    public contextItems = [];

    stockItem:IDropdownItem[];
    orderStatuItem:IDropdownItem[];
    orderTypeItem:IDropdownItem[];
    dateItem:IDropdownItem[];

    public NOROW_MSG:string = '対象の注文はございません。';
    public addTitleBarId:string = 'title-bar-add-content';
    public gridObj;

    public symbolCode = '0000';

    public orderList:Array<IResOrderItem>;
    public dateFrom:string;
    public dateTo:string;
    private sortValue:any;
    private orderJointGroup:any;
    public stockSelected:string;
    public orderTypeSelected:string;
    public orderStatuSelected:string;
    public dateSelected:string;
    private dateSelectedFrom:string;
    private dateSelectedTo:string;
    private dataModel:any;
    private focusedOrderJointId:any;
    private unfocusOrderJointId:any;
    private closeSubscrib:any;
    private onfocusSubscrib:any;
    public loadCompleteFlg:boolean = false;
    //---------------------------------------------------------------------------
    // constructor
    // --------------------------------------------------------------------------
    constructor( public screenMng:PanelManageService,
                public business:BusinessService,
                public changeRef:ChangeDetectorRef,
                public contextMenu: ContextMenuService,
                public dialogService:DialogService,
                public element: ElementRef,
                public resource:ResourceService
                ) {
        super( '03020300', screenMng, element, changeRef);

        // this.TOOLTIP_PREV_MOVE = Tooltips.PAGE_PREV_MOVE;
        // this.TOOLTIP_NEXT_MOVE = Tooltips.PAGE_NEXT_MOVE;

        this.currentPage = 1;

        this.stockItem = [
            { value:'',  text:'全銘柄' },
        ];

        this.stockSelected = "";
        this.orderTypeItem = [
            {value:'', text:'新規＆決済'},
            {value:'0', text:'新規'},
            {value:'1', text:'決済'}
        ];
        this.orderTypeSelected = "";
        this.orderStatuItem = [
            { value:'0145',  text:'有効' },
            { value:'38',  text:'取消済' },
            { value:'2',  text:'約定済' },
            { value:'01245',  text:'有効＋約定済' },
            { value:'0123458',  text:'全状態' },
        ];
        this.orderStatuSelected = "0145";
        this.dateItem = [
            { value:'1', text:'本日のみ' },
            { value:'2', text:'昨日から' },
            { value:'3', text:'1週間前から' },
            { value:'4', text:'2週間前から' },
            { value:'5', text:'1ヶ月前から' },
        ];
        this.dateSelected = this.dateItem[3].value;
        this.dateSelectedTo = moment().format('YYYYMMDD')+"235959";
        this.dateSelectedFrom = moment().add(-14, 'days').format('YYYYMMDD'+"000000");
        this.getOrderProductList();

        this.subscribeNotifyer = this.business.notifyer.order().subscribe(val=>{
            // val.type : 'new',    新規追加
            //          : 'update', 建玉更新
            // val.orders
            // console.log("receive notify");
            // console.log(val);
            if(val.type == "new"){
                this.addOrders(val.orders);
            }else if(val.type == "update"){
                this.updateOrders(val.orders);
            }else if(val.type == "reload"){
                this.reloadOrders(val.orders);
            }else if(val.type == "append"){
              let data = val as any;
              this.appendOrders(data.orders, data.last);
            }
        });
        this.subscribeNotifyer = this.business.notifyer.powerAmount().subscribe(val=>{
          if (val && val.status == ERROR_CODE.OK) {
            // datetime:"20180111113914"
            //yyyymmdd000059
            if(Number(val.datetime.slice(-6)) < 60) { // 1分間隔で発生するので00:00:00 ~ 00:00:59の間に発生する
              this.dateChanged(this.dateSelected);
              this.modifyShowHide();
              this.filterPage();
              this.refreshGrid(true);
            }
          }
      });        
    }

    ngOnDestroy(){
        super.ngOnDestroy();
        if(this.dateCheckerNotifyer){
          this.dateCheckerNotifyer.unsubscribe();
          this.dateCheckerNotifyer = null;
      }        
        if(this.subscribeNotifyer){
            this.subscribeNotifyer.unsubscribe();
            this.subscribeNotifyer = null;
        }
        if (this.closeSubscrib) {
            this.closeSubscrib.unsubscribe();
            this.closeSubscrib = null;
        }
        if (this.onfocusSubscrib) {
            this.onfocusSubscrib.unsubscribe();
            this.onfocusSubscrib = null;
        }
    }

    ngAfterViewInit(){
        super.ngAfterViewInit();
        $(this.element.nativeElement).find(".panel-order-list").on("keydown",(e:KeyboardEvent)=>{
            SetSelectd(e,this.gridObj,this.seletedIndex);
        })
    }

    initLayout(param:any){
        super.initLayout(param);

        var layout = param.layout as ILayoutInfo;
        let colOption = [];
        if (layout && layout.option && layout.option) {
            let json = this.setColumnOption(layout.option.colOption);
            colOption = json || [];
            this.stockSelected = layout.option.stockSelected ? layout.option.stockSelected : this.stockSelected;
            this.orderTypeSelected = layout.option.orderTypeSelected ? layout.option.orderTypeSelected : this.orderTypeSelected;
            this.orderStatuSelected = layout.option.orderStatuSelected ? layout.option.orderStatuSelected : this.orderStatuSelected;
            this.dateSelected = layout.option.dateSelected ? layout.option.dateSelected : this.dateSelected;
            this.dateChanged(this.dateSelected);
            if (layout.option.orderJointId) {
                this.focusedOrderJointId = layout.option.orderJointId
            }
        }

        this.gridLoad(colOption);

        if (layout && layout.option && layout.option.orderJointId) {
            this.didColorTheRow();
        }
        this.closeSubscrib = this.panelMng.onClosePanel().subscribe(val => {
            if (val.id == "03020101" || val.id == "03020102") {
                if (val.reason && val.reason.closeReason == 'panelClosed') {
                    this.didUnColorTheRow();
                }
            }
        })
        this.onfocusSubscrib = this.panelMng.onfocus().subscribe(val => {
            this.unfocusOrderJointId = this.focusedOrderJointId;
            if (val.id == "03020101" || val.id == "03020102") {
                this.focusedOrderJointId = val.panelParams.layout.option.orderJointId;
            } else {
                this.focusedOrderJointId = null;
            }
            this.didColorTheRow();
        });
    }

    public gridLoad(colOption?:any) {
        var _self = this;
        const tempColModel = [

            {dataIndx:'modify', title: "", dataType:"string", editor: false, sortable:false, width: 74, cls:'body-col-first', render:function(ui){
                let isFirst = ui.rowData["orderKey"] == ui.rowData["orderJointId"];
                let group = _self.orderJointGroup[ui.rowData["orderJointId"]];
                let isAble = false;
                if(group) {
                  group.forEach(ord=>{
                      if(ord.orderStatus =="1" && ord.orderType != "9"){
                          isAble = true;
                      }
                  });
                }

                if(isAble && isFirst){
                    return '<button type="button" class="modifyCell button button-label button-orderlist-change" >変更</button>'
                }else{
                    return "";
                }
            }, postRender:function(ui){
                var grid = this,
                $cell = grid.getCell(ui);
                $cell.find('.modifyCell').bind('click',function(e){
                    _self.showConfigDlgModify(ui.rowData["orderJointId"],ui.rowData["cfdProductCode"],ui.rowData);
                });
            }},
            {dataIndx:'cancel', title: "", dataType:"string", align:"left", editor: false , sortable:false, width: 72, render:function(ui){
                let isFirst = ui.rowData["orderKey"] == ui.rowData["orderJointId"];
                let group = _self.orderJointGroup[ui.rowData["orderJointId"]];
                let isAble = false;
                if(group) {
                  group.forEach(ord=>{
                      if(ord.orderStatus =="1" && ord.orderType != "9"){
                          isAble = true;
                      }
                  })
                }
                if(isAble && isFirst){
                    return '<button type="button" class="cancelCell button button-label button-orderlist-cancel">取消</button>'
                }else{
                    return "";
                }
            }, postRender:function(ui){
                var grid = this,
                $cell = grid.getCell(ui);
                $cell.find('.cancelCell').bind('click',function(e){
                    _self.showConfigDlgCancel(ui.rowData["orderJointId"],ui.rowData["cfdProductCode"],ui.rowData);
                });
                $cell.find('.cancelCell').bind('dblclick',function(e){
                    e.stopPropagation();
                });
            }},

            {dataIndx:'cfdProductCode', title: "銘柄", dataType:"string", align:"left", editor: false, width: 148, tooltip:true, render:function(ui){
                    let group = _self.orderList.filter((order)=>order.orderKey == ui.rowData["orderKey"])[0];
                    if(group) {
                      let isgroup = group.isgroup;
                      if (!isgroup) {
                          return _self.stockItem.find(ele=>ele.value == ui.cellData );
                      } else {
                          return "";
                      }
                    }
                }},
            {dataIndx:'settleType', title: "取引", dataType:"string", align:"center", editor: false, width: 64 , render:function(ui){
                    if(ui.cellData == '0'){
                        return "<span class='label label-bright'>新規</span>";
                    }else{
                        return "<span class='label label-bright'>決済</span>";
                    }
                }},
            {dataIndx:'buySellType', title: "売買", dataType:"string", align:"center", editor: false, width: 64, render:(ui)=>{
                let text:string;
                let css:string;
                switch(ui.cellData){
                    case '1': text='売'; css='label label-order-icon sell'; break;
                    case '2': text='買'; css='label label-order-icon buy'; break;
                    default:　text=''; css='';
                }
                return '<span class="'+css+'">'+text+'</span>';
                }},
            {dataIndx:'orderType', title: "注文タイプ", dataType:"string", align:"center", editor: false, sortable:false, width: 96, render:function(ui){
                let group = _self.orderList.filter((order)=>order.orderKey == ui.rowData["orderKey"])[0];
                if(group) {
                  let isgroup = group.isgroup;
                  if (isgroup) {
                      return "<div style='text-align:center' class='iconlogic'><i class='svg-icons icon-logic-order'></i></div>";
                  }else if(ui.cellData == '2' || ui.cellData == '3' || ui.cellData == '4' || ui.cellData == '6' || ui.cellData == '9'){
                      if(ui.cellData =='2')return "<div>IFD</div>";
                      else if(ui.cellData =='3')return "<div>OCO</div>";
                      else if(ui.cellData =='4')return "<div>IFD-OCO</div>";
                      else if(ui.cellData =='6')return "<div>トレール</div>";
                      else if(ui.cellData =='9')return "<div>強制決済</div>";
                  }else{
                      if(ui.rowData["executionType"] =='1')return "<div>成行</div>";
                      else if(ui.rowData["executionType"] =='2')return "<div>指値</div>";
                      else if(ui.rowData["executionType"] =='3')return "<div>逆指値</div>";
                  }
                }
            }},
            {dataIndx:'orderQuantity', title: "発注数", dataType:"string", align:"right", editor: false, width: 72, cls: 'body-col-num' ,render:function(ui){
                return _self.formatNumber(ui.cellData);
            }},
            {dataIndx:'executionType', title: "執行条件", dataType:"string", align:"center", editor: false, sortable:false, width: 80 ,render:function(ui){
                if(ui.cellData =="1")return "<span class='label label-bright'>成行</span>";
                else if(ui.cellData =="2")return "<span class='label label-bright'>指値</span>";
                else if(ui.cellData =="3")return "<span class='label label-bright'>逆指値</span>";
                else return "";
            }},
            {dataIndx:'orderPrice', title: "注文価格", dataType:"string", align:"right", editor: false, width: 216, cls: 'body-col-num', render:function(ui){
                let price = _self.currency(ui.cellData, ui.rowData.cfdProductCode);
                if(ui.rowData["orderType"] == '1' && ui.rowData["executionType"] =="1"){
                    if(ui.rowData["allowedSlippage"] !=null){
                        return  price + "<span class='label label-bright'>&nbsp;許容±</span>" + _self.currency(ui.rowData["allowedSlippage"], ui.rowData.cfdProductCode);
                    }else{
                        return  price +"<span class='label label-bright'>&nbsp;許容無制限</span>";
                    }

                }else if(ui.rowData["orderType"] =="6"){    //　トレール
                    var orderS = ui.rowData["orderStatus"];
                    if(orderS == "3" || orderS == "8"){         // 取消済＆失効
                      // console.log("トレール　取消済＆失効");
                      return  price + "<span class='label label-bright'> 幅</span>" + ui.rowData["trailWidth"];
                        // if(ui.rowData["trailPrice"] ==null){    // トレール追跡前
                        //     return  price + "<span class='label label-bright'> 幅</span>" + ui.rowData["trailWidth"];
                        // }else{
                        //     return  price ;
                        // }
                    }else if(orderS == "0" || orderS == "1" || orderS == "2" || orderS == "4" || orderS == "5"){
                      // console.log("トレール　状態が待機中、有効、約定済、執行中、取消中の場合");
                        // 状態が待機中、有効、約定済、執行中、取消中の場合
                        if(ui.rowData["trailPrice"] == null){           // トレール追跡前
                            return  price + "<span class='label label-bright'> 幅</span>" + ui.rowData["trailWidth"];
                        }else if(ui.rowData["buySellType"] =="2"){      // 買注文
                            if(ui.rowData["trailPrice"] < ui.cellData){
                                return  price + " [<span class='label label-bright'>現在</span>:" +_self.currency(ui.rowData["trailPrice"], ui.rowData.cfdProductCode) + "]<span class='label label-bright'> 幅</span>" + ui.rowData["trailWidth"];
                            }else{
                                return  price + "<span class='label label-bright'> 幅</span>" + ui.rowData["trailWidth"];
                            }
                        }else if(ui.rowData["buySellType"] =="1"){
                            if(ui.rowData["trailPrice"] > ui.cellData){ // 売注文
                                return  price + " [<span class='label label-bright'>現在</span>:" +_self.currency(ui.rowData["trailPrice"], ui.rowData.cfdProductCode) + "]<span class='label label-bright'> 幅</span>" + ui.rowData["trailWidth"];
                            }else{
                                return  price + "<span class='label label-bright'> 幅</span>" + ui.rowData["trailWidth"];
                            }
                        }
                    }else{
                      // console.log("トレール　その他場合");
                        return price;
                    }

                }else{
                    return price;
                }
            }},

            {dataIndx:'allowedSlippage', title: "", dataType:"string", align:"center", editor: false, hidden:true},
            {dataIndx:'trailWidth', title: "", dataType:"string", align:"center", editor: false, hidden:true},
            {dataIndx:'trailPrice', title: "", dataType:"string", align:"center", editor: false, hidden:true},
            {dataIndx:'orderKey', title: "", dataType:"string", align:"center", editor: false, hidden:true},
            {dataIndx:'orderStatus', title: "状態", dataType:"string", align:"center", editor: false, width: 72, render:function(ui){
                if(ui.cellData =="0")return "<span>待機中</span>";
                if(ui.cellData =="1")return "<span>有効</span>";
                else if(ui.cellData =="2")return "<span>約定済</span>";
                else if(ui.cellData =="3")return "<span>取消済</span>";
                else if(ui.cellData =="4")return "<span>執行中</span>";
                else if(ui.cellData =="5")return "<span>取消中</span>";
                else if(ui.cellData =="6")return "<span>執行待</span>";
                else if(ui.cellData =="7")return "<span>ロスカット待</span>";
                else if(ui.cellData =="8")return "<span>失効</span>";

            }},
            {dataIndx:'losscutRate', title: "ロスカットレート", dataType:"string", align:"right", editor: false, width: 96, cls: 'body-col-num header-col-text-transform-80', sortable:false, render:function(ui){

                if(ui.rowData["executionType"] !=null && ui.rowData["executionType"] == '1'){
                    return "-";
                }else{
                    if(ui.rowData["settleType"] =="0"  ){
                        if(ui.cellData ==null){
                            return "<span class='label label-bright'>自動</span>";
                        }else{
                            return _self.currency(ui.cellData, ui.rowData.cfdProductCode);
                        }
                    }else{
                        return "-";
                    }
                }
            }},

            {dataIndx:'orderDatetime', title: "受注日時", dataType:"string", align:"center", editor: false, width: 112, cls: 'body-col-num', render:function(ui){
                if(ui.cellData !=""){

                    return moment(ui.cellData,'YYYYMMDDHHmmss').format('MM/DD HH:mm');
                }else{
                    return "";
                }
            }},
            {dataIndx:'invalidDatetime', title: "有効期限", dataType:"string", align:"center", editor: false, width: 144, cls: 'body-col-num', render:function(ui){
                if(ui.rowData["orderType"] =="9"){  // 強制決済
                    return "";
                }else{
                    if(ui.cellData !=null && ui.cellData != ""){

                        return moment(ui.cellData,'YYYYMMDDHHmmss').format('MM/DD HH:mm') +"<span class='label label-bright'>まで</span>";
                    }
                }
            }},
            {dataIndx:'orderJointId', title: "注文番号", dataType:"string", align:"center", editor: false, width: 76, cls: 'body-col-num' ,render:function(ui){
                let group = _self.orderList.filter((order)=>order.orderKey == ui.rowData["orderKey"])[0];
                if(group) {
                  let isgroup = group.isgroup;
                  if (!isgroup) {
                      return '<a href="javascript:void(0)" class="detailCell num-link" style="margin-right:0px" >'+ui.cellData.substring(ui.cellData.length -4,ui.cellData.length)+'</a>'
                  } else {
                      return "-";
                  }
                }
            }, postRender:function(ui){
                var grid = this,
                $cell = grid.getCell(ui);

                $cell.find('.detailCell').bind('click',function(){

                    _self.showConfigDlg(ui.rowData["orderJointId"]);;
                });
            }},
            {dataIndx:'orderSortKey', title: "", dataType:"string", align:"center", editor: false, hidden:true},
        ];

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

        var $grd = $(this.element.nativeElement).find("#grid");
        this.gridObj = $grd.pqGrid({
            width : "auto",
            height : this.getGridHeight(),
            editable: false,
            draggable: true,
            sortModel: { on:true, cancel:true },
            columnTemplate: { halign: 'center', align: 'center', dataType: 'string', tooltip:false,
                sortType(a,b,c){
                    let valueA = _self.sortValue[a.orderKey][c];
                    let valueB = _self.sortValue[b.orderKey][c];
                    let orderKeyA = _self.sortValue[a.orderKey]["orderKey"];
                    let orderKeyB = _self.sortValue[b.orderKey]["orderKey"];
                    if(valueA > valueB) return 1
                    if(valueA < valueB) return -1
                    if(a.orderJointId > b.orderJointId) return 1
                    if(a.orderJointId < b.orderJointId) return -1
                    if(orderKeyA > orderKeyB) return 1
                    if(orderKeyA < orderKeyB) return -1

                    return 0;
                }
            },
            mergeCells: [],
            wrap: false,
            hwrap: false,
            numberCell: false,
            showTitle: false,
            showToolbar: false,
            showTop: false,
            showBottom: false,
            strNoRows: this.NOROW_MSG,
            // groupModel: {
            //     on: false,
            //     dataIndx: ['orderJointId'],
            //     collapsed:[false],
            //     // fixCols:false,
            //     merge:false,
            //     header:false,
            //     fixCols:false,
            //     summaryInTitleRow:''
            //     // title:['{0}','{0}','{0}','{0}','{0}']
            // },

            pageModel: { type: 'local', rPP:this.pageSize },
            scrollModel: { lastColumn: "none" },
            dataModel: { data: [],location:"local" },
            selectionModel: { type:'row', mode:'single' },
            swipeModel: { on: false },
            stripeRows: false,

            colModel: colModel,
            postRenderInterval: -1,
            rowSelect:($event, ui)=> {
                if (ui.addList.length > 0) {
                  this.seletedIndex = ui.addList[0].rowIndx;
                }
            },
            cellKeyDown: ( event, ui ) => {
              keyUpDown(this.gridObj,event,ui);
            },
            beforeSort: (event, ui) => {
                if (ui.sorter.length > 0) {
                    this.setSortValue(ui.dataIndx,ui.sorter[0].dir);
                }
            },
            rowDblClick: ($event:MouseEvent, ui)=>{
                let isModify = false;
                let group = _self.orderJointGroup[ui.rowData["orderJointId"]];
                if(group) {
                  group.forEach(ord=>{
                      if(ord.orderStatus =="1" && ord.orderType != "9"){
                          isModify = true;
                      }
                  })
                }
                if(isModify){
                    this.showConfigDlgModify(ui.rowData["orderJointId"],ui.rowData["cfdProductCode"],ui.rowData);
                }
            },
            rowRightClick: ($event:MouseEvent, ui)=>{
                this.showContextMenu($event, ui.rowData);
            },
            refresh: ($event, ui)=> {
                this.didColorTheRow();
                this.checkIfShowNoData();
            }
        });

        this.getOrderList();
    }

    public showContextMenu($event:MouseEvent, rowData){
        let isgroup = this.orderList.filter((order)=>order.orderKey == rowData["orderKey"])[0].isgroup;
        // if(rowData["orderStatus"] =="1" && rowData["orderType"] != "9" && !isgroup){
          // IFD注文場合１次注文が約定済みの場合２次注文で変更、取消が表示されないのでisgroup条件廃止
          if(rowData["orderStatus"] =="1" && rowData["orderType"] != "9"){
            this.contextItems = this.contextItemsWithModify;
        } else {
            this.contextItems = this.contextItemsWithoutModify
        }
        this.updateView();
        // this.changeRef.detectChanges();
        this.contextMenu.show.next({
          contextMenu: this.contextMenuComponent,
          event: $event,
          item: rowData
        });
        $event.preventDefault();
        $event.stopPropagation();

        AwakeContextMenu($event); // #2338
    }

    public openPanel(scrId: string, rowData: any, item: any) {
        // #2266
        let self = this;
        try {
            let param: any;
            if (item.useLayout === true) {
                param = {};
                let layout: ILayoutInfo = {} as ILayoutInfo;
                if (!!rowData) {
                    layout.productCode = rowData.cfdProductCode;
                    if (item.option) {
                        layout.option = DeepCopy(item.option);
                    }

                    if (!layout.option) {
                        layout.option = {};
                    }

                    layout.option.buySellType = item.buySellType ? item.buySellType : rowData.buySellType;
                    layout.option.productName = self.stockItem.find(el => el.value == rowData.cfdProductCode).text;
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
            else if (item.useAlert === true) {
                let dialogService: DialogService = self.dialogService;
                if (dialogService) {
                    if (!!rowData) {
                        let params: any = {
                            key: undefined,
                            product: rowData.cfdProductCode,
                            basicRate: undefined
                        };

                        dialogService.addDialog(AlertModifyDialogComponent, { params: params }).subscribe(
                            (val) => {
                                if (val) {
                                    self.panelMng.fireChannelEvent('alertAddModify', {});
                                }
                            });
                    }
                }

                return;
            }
            //
            else {
                if (item.scrId == "03020101" || item.scrId == "03020102") { //訂正取消
                    let orderInfos = [];
                    this.orderList.forEach(order => {
                      if (order.orderJointId == rowData.orderJointId) {
                        orderInfos.push(order);
                      }
                    });
                    param = {
                        layout:{ productCode:rowData.cfdProductCode,
                                 option:{orderJointId:rowData.orderJointId, orderInfo:orderInfos}}
                    }
                } else {
                    param = {
                        buySellType: null,
                        productCode: null,
                        productName: null,
                        orderKey: null,
                        channel: 'comm'
                    };

                    if (!!rowData) {
                        param.buySellType = item && item.buySellType ? item.buySellType : rowData.buySellType;
                        param.productCode = rowData.cfdProductCode;
                        param.productName = self.stockItem.find(el => el.value == rowData.cfdProductCode).text;
                        param.orderKey = rowData.orderKey
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
                self.screenMng.findPanel('03020301').subscribe(pnl=>{
                    if (pnl && pnl.length > 0) {
                        self.screenMng.fireChannelEvent('orderDetail', param);
                        // self.screenMng.panelFocus(pnl[0].uniqueId);
                        let info = this.panelMng.getPanel( pnl[0].uniqueId );
                        if(info) {
                          if(info.showscreen)
                            this.panelMng.panelFocus(pnl[0].uniqueId);
                          else
                            this.panelMng.behavePanelTouch( pnl[0].uniqueId );
                        }
                        else {
                          this.panelMng.panelFocus(pnl[0].uniqueId);
                        }
                    } else {
                        if (!param.layout.option) {
                          param.layout.option = {};
                        }
                        self.screenMng.openPanel(self.panelMng.virtualScreen(), scrId, param);
                    }
                });
            } 
            else if(item.scrId == "03020104"){  // speed order
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
                self.screenMng.openPanel(self.panelMng.virtualScreen(), scrId, param).subscribe(val=>{
                    if (item.scrId == "03020101" || item.scrId == "03020102") {
                        this.updateView();
                    }
                })
            }
        }
        catch (e) {
            console.error(e);
        }
    }

    public onClickContextItem(rowData: any, item: any) {
        this.openPanel(item.scrId, rowData, item);
    }

    onResizing($event){
        super.onResizing();
        if (this.gridObj) {
            this.gridObj.pqGrid('option','height',this.getGridHeight());
            this.gridObj.pqGrid('refreshDataAndView');
            let data = this.gridObj.pqGrid('option','dataModel.data');
            if (!this.initFlg && data.length == 0) {
                this.gridObj.pqGrid('loadComplete');
            }
        }
        $(this.element.nativeElement).find('.dropdown-item.open .dropdown-toggle').trigger("click");
    }

    onClickRefresh($event){
        this.reset(false);
    }

    getGridHeight(){
        return $(this.element.nativeElement.querySelector(".panel")).outerHeight()-$(this.element.nativeElement.querySelector(".navbar")).outerHeight() - 2;
    }

    //---------------------------------------------------------------------------
    // override
    //---------------------------------------------------------------------------

    //---------------------------------------------------------------------------
    // member
    //---------------------------------------------------------------------------
    public getOrderProductList(){

    }

    public onPrevPage($event) {
        if (this.currentPage > 1) {
            this.currentPage--;
            this.seletedIndex = null;
            this.setPage();
        }
    }

    public onNextPage($event) {
        if (this.currentPage < this.totalPage) {
            this.currentPage++;
            this.seletedIndex = null;
            this.setPage();
        }
    }

    // ************* FUNCTIONS ************** //
    public setPage(){
        this.gridObj.pqGrid('option','pageModel',{
            type: 'local',
            rPP:this.pageSize,
            curPage: this.currentPage
        });
        this.refreshGrid(true);
    }

    private getSettleType(group, settleType){
        let odrFst = group[0];
        let odrSnd = group[1];
        let valid  = "0145"; // 有効

        if(this.orderStatuSelected == "01245" ){             // filter : 有効＋約定
            // 1次「約定済」2次「有効」 → 新規・決済両方
            if(odrFst.orderStatus == _STATUS_EXECUED && valid.includes(odrSnd.orderStatus)){
                return _BOTH;
            }
            // 1次「有効」 2次「待機中」 → 新規
            if(valid.includes(odrFst.orderStatus) && odrSnd.orderStatus == _STATUS_WAIT){
                return _NEW;
            }
            // 1次「約定済」2次「約定済」 → 新規・決済両方
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_EXECUED){
                return _BOTH;
            }
            // 1次「約定済」2次「取消済」 → 新規
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_CANCELED){
                return _NEW;
            }
            // 1次「約定済」2次「失効」 → 新規
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_INVALID){
                return _NEW;
            }
            // 1次「約定済」2次「執行中」 → 新規
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_EXECUING){
                return _NEW;
            }
            // 1次「約定済」2次「取消中」 → 新規
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_CANCEING){
                return _NEW;
            }
        }else if(this.orderStatuSelected == "2" ){           // filter : 約定
            // 1次「約定済」2次「有効」 → 新規
            if(odrFst.orderStatus == _STATUS_EXECUED && valid.includes(odrSnd.orderStatus)){
                return _NEW;
            }
            // 1次「約定済」2次「約定済」 → 新規・決済両方
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_EXECUED){
                return _BOTH;
            }
            // 1次「約定済」2次「取消済」 → 新規
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_CANCELED){
                return _NEW;
            }
            // 1次「約定済」2次「失効」 → 新規
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_INVALID){
                return _NEW;
            }
            // 1次「約定済」2次「執行中」 → 新規
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_EXECUING){
                return _NEW;
            }
            // 1次「約定済」2次「取消中」 → 新規
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_CANCEING){
                return _NEW;
            }
        }else if(this.orderStatuSelected == "0145" ){        // filter : 有効
            // 1次「約定済」2次「有効」 → 決済
            if(odrFst.orderStatus == _STATUS_EXECUED && valid.includes(odrSnd.orderStatus)){
                return _SETTLE;
            }
            // 1次「有効」 2次「待機中」 → 新規
            if(valid.includes(odrFst.orderStatus) && odrSnd.orderStatus == _STATUS_WAIT){
                return _NEW;
            }
        }else if(this.orderStatuSelected == "38" ){          // filter : 取消
            // 1次「約定済」2次「取消済」 → 決済
            if(odrFst.orderStatus == _STATUS_EXECUED && odrSnd.orderStatus == _STATUS_CANCELED){
                return _SETTLE;
            }
            // 1次「取消済」2次「取消済」 → 両方
            if(odrFst.orderStatus == _STATUS_CANCELED && odrSnd.orderStatus == _STATUS_CANCELED){
                return _BOTH;
            }
        }

        return _BOTH;
    }

    private getOrderStatus( rowData ){
        let status = [];
        let group = this.orderJointGroup[rowData.orderJointId];
        if(group) {
          group.forEach(ord => {
              status.push(ord.orderStatus);
          });
        }
        else {
          status.push(rowData.orderStatus);
        }

        return status;
    }

    private filterPage(){
        var self = this;

        this.gridObj.pqGrid( "filter", {
            oper: 'replace',
            rules: [
                { dataIndx: 'cfdProductCode', condition: 'equal', value: this.stockSelected },
                { dataIndx: 'settleType', condition: function(dataIndx, rowData){
                    let result,
                        settleType = rowData.settleType;
                    let group = self.orderJointGroup[rowData.orderJointId];

                    if(self.orderTypeSelected==""){
                        return true;
                    }

                    // OCO注文ではない複合注文
                    if(rowData.orderType != '3' && group && group.length > 1){
                        settleType = self.getSettleType(group, self.orderTypeSelected);
                    }

                    result = settleType.includes(self.orderTypeSelected);

                    return result;
                }},
                { dataIndx: 'orderStatus', condition: function(dataIndx, rowData){
                    let status = self.getOrderStatus(rowData);
                    let rtn = false;

                    status.forEach(s=>{
                        if(self.orderStatuSelected.includes(s)){
                            rtn = true;
                        }
                    })
                    return rtn;
                }},
                { dataIndx: 'orderDatetime', condition: 'between', value: this.dateSelectedFrom , value2:this.dateSelectedTo}
            ]
        });

        this.currentPage = 1;
        this.updatePageNavi();
    }

    public reset(isCache: boolean = true){
        this.orderIndex = 0;
        this.currentPage = 1;
        // this.gridObj.pqGrid('option','dataModel',{ data: [], location: 'local' });
        this.refreshGrid(true);
        this.getOrderList(isCache);
    }

    public getOrderList(isCache: boolean = true){
        var input: IReqOrderList = {listdataGetType:'ALL', pageCnt:this.pageSize};
        this.loadCompleteFlg = false;
        this.makeDropDownDisable();
        // this.gridObj.pqGrid('showLoading');
        this.initFlg = true;
        this.orderList = [];
        let orderProductList = this.business.orderProductList();
        // let orderList = this.business.getOrderList(input);
        let orderList: Observable<IResOrderList>;
        if(isCache) {
          orderList = this.business.getOrderList(input);
        }
        else {
          orderList = this.business.getOrderListDirect(input);
        }
        Observable.zip(orderProductList,orderList).subscribe(
            val => {
              // console.log("getOrderList01");
                if(val[0].status == '0'){ // OK
                    this.stockItem =[{ value:'',  text:'全銘柄' }];
                    val[0].result.orderProductList.forEach(odr=>{
                        this.stockItem.push({
                            value:odr.cfdProductCode,
                            text:odr.meigaraSeiKanji
                        });
                    })
                }
                if(val[1].status == ERROR_CODE.OK){ // OK
                  // console.log("getOrderList02");
                    let productList:Array<string> = [];
                    this.orderList = val[1].result.orderList;
                    if(this.loadCompleteFlg) {  // resOrderProductList resOrderListのappendより遅く来る場合があるのでその対応
                    }
                    else {
                      this.loadCompleteFlg = val[1].result.append?false:true;
                    }                    
                    
                    this.makeDropDownDisable();
                    // this.dataModel.data = this.orderList;
                    this.setGridData(this.orderList);
                    this.modifyShowHide();
                    // this.gridSort();
                    this.filterPage()
                    // this.refreshGrid(true);
                    this.setPage();
                    this.updateView();
                    // console.log("getOrderList03");
                }
                else if(val[1].status == ERROR_CODE.WARN) { // NG or WARN
                    this.setGridData(this.orderList);
                    MessageBox.info({title:'注文一覧取得エラー', message:Messages.ERR_0001});
                    this.gridObj.pqGrid("option", "strNoRows", Messages.ERR_0006);
                    this.loadCompleteFlg = true;
                }
                else if(val[1].status == ERROR_CODE.NG) {
                    this.setGridData(this.orderList);
                    MessageBox.info({title:'注文一覧取得エラー', message:(Messages.ERR_0001 + '[CFDS0901T]')});
                    this.gridObj.pqGrid("option", "strNoRows", Messages.ERR_0006 + '[CFDS0901T]');
                    this.loadCompleteFlg = true;
                }
                this.initFlg = false;
                this.refreshGrid(true);
                // this.gridObj.pqGrid('hideLoading');
            },
            err=>{
                this.initFlg = false;
                switch(err.status) {
                    case ERROR_CODE.NETWORK:
                    this.setGridData(this.orderList);
                    MessageBox.info({title:'注文一覧取得エラー', message:(Messages.ERR_0002 + '[CFDS0902C]')});
                    this.gridObj.pqGrid("option", "strNoRows", Messages.ERR_0002 + '[CFDS0902C]');
                    this.refreshGrid(false);
                    this.loadCompleteFlg = true;
                    break;
                }
            }
        )
    }

    public onChgSymbolStock($event){
        this.stockSelected = $event.selected;
        this.modifyShowHide();
        this.filterPage()
        // this.gridSort();
        this.refreshGrid(true);
    }

    private setGridData(data){
        this.gridObj.pqGrid('option','dataModel',{ data: data, location: 'local' });
    }

    private refreshGrid(reset:boolean){
        this.gridObj.pqGrid('refreshDataAndView');

        if(reset){
            this.gridObj.pqGrid( "scrollRow", { rowIndxPage: 0 } );
            this.checkIfShowNoData();
        }
    }

    public onChangeOrderType($event){
        this.orderTypeSelected = $event.selected;
        this.modifyShowHide();
        this.filterPage();
        // this.gridSort();
        this.refreshGrid(true);
    }

    public onChangeStatus($event){
        this.orderStatuSelected = $event.selected;

        this.modifyShowHide();
        this.filterPage();
        // this.gridSort();
        this.refreshGrid(true);
    }

    public onChangeDate($event){
        this.dateChanged($event.selected);
        this.modifyShowHide();
        this.filterPage()
        // this.gridSort();
        this.refreshGrid(true);
    }

    private dateChanged(selected:string){
      let filerToDay = moment().format('YYYYMMDD')+"235959";
      let filerFrom;
      switch(selected) {
          case '1' :
              filerFrom = moment().format('YYYYMMDD')+"000000";
          break;
          case '2' :
              filerFrom = moment().add(-1, 'days').format('YYYYMMDD')+"000000";
          break;
          case '3' :
              filerFrom = moment().add(-7, 'days').format('YYYYMMDD'+"000000");
          break;
          case '4' :
              filerFrom = moment().add(-14, 'days').format('YYYYMMDD'+"000000");
          break;
          case '5' :
              filerFrom = moment().add(-1, 'months').format('YYYYMMDD'+"000000");
              break;
      }
      this.dateSelected = selected;
      this.dateSelectedTo = filerToDay;
      this.dateSelectedFrom = filerFrom;
    }


    public showConfigDlg(orderJointId) {
        let param = {
            orderJointId:orderJointId,
            layout:{
                external:this.isExternalWindow(),
                option:{}
            }
        }

        this.screenMng.findPanel('03020301').subscribe(pnl=>{
            if( pnl && pnl.length > 0) {
                this.screenMng.fireChannelEvent('orderDetail', param);
                // this.screenMng.panelFocus(pnl[0].uniqueId);
                let info = this.panelMng.getPanel( pnl[0].uniqueId );
                if(info) {
                  if(info.showscreen)
                    this.panelMng.panelFocus(pnl[0].uniqueId);
                  else
                    this.panelMng.behavePanelTouch( pnl[0].uniqueId );
                }
                else {
                  this.panelMng.panelFocus(pnl[0].uniqueId);
                }
            } else {
                this.screenMng.openPanel( this.screenMng.virtualScreen(), '03020301' , param);
            }
        });
    }

    public showConfigDlgModify(orderJointId , productCode, rowData) {
      let orderInfos = [];
      let param;

      this.orderList.forEach(order => {
        if (order.orderJointId == orderJointId) {
          orderInfos.push(order);
        }
      });
      // console.log("modify order info");
      // console.log(orderInfos);
      param = {
        layout:{
            productCode: productCode,
            external: this.isExternalWindow(),
            option:{
                orderJointId: orderJointId,
                orderInfo: orderInfos
            }
        }
      };

      this.screenMng.openPanel( this.screenMng.virtualScreen(), '03020101' , param).subscribe(val=>{
          if(val){
            this.updateView();
          }
      })
    }

    public showConfigDlgCancel(orderJointId , productCode, rowData) {
      let orderInfos = [];
      let param;

      this.orderList.forEach(order => {
        if (order.orderJointId == orderJointId) {
          orderInfos.push(order);
        }
      });

      param = {
          layout:{
              productCode: productCode,
              external: this.isExternalWindow(),
              option:{
                  orderJointId:orderJointId,
                  orderInfo:orderInfos
                }
            }
        };

      this.screenMng.openPanel( this.screenMng.virtualScreen(), '03020102' , param).subscribe(val=>{
          if (val) {
              this.updateView();
          }
      })

    }

    public commiy(){
        var reg = /(^[+-]?\d+)(\d{3})/;
        var num = this.replace(/\,/g, '');
        num += '';
        while (reg.test(num))
            num = num.replace(reg, '$1' + ',' + '$2');
    }

    public onReload(event:Event){

    }

    private setSortValue(dataIndx:string, dir:string){
        this.sortValue = {};
        this.orderList.forEach(order => {
            let value = this.findMaxOrMin(order.orderJointId,dataIndx,dir,order.orderKey);
            this.sortValue[order.orderKey] = {};
            this.sortValue[order.orderKey][dataIndx] = value;
            this.sortValue[order.orderKey]["orderKey"] = this.findMaxOrMin(order.orderJointId,"orderKey",dir,order.orderKey);
        });
    }

    private modifyShowHide(){
        let orderJointId = "";
        this.orderJointGroup = {};
        if(this.orderList){
            this.orderList.forEach(order => {
                order.isgroup = order.orderJointId != order.orderKey;

                this.makeOrderJointGroup(order,true);
            });
        }
    }

    private makeOrderJointGroup(order:IResOrderItem,isShow:boolean){
        let info = {} as ISortValue;
        info.buySellType = order.buySellType;
        info.cfdProductCode = this.business.symbols.getSymbolInfo(order.cfdProductCode).meigaraSeiKana;
        info.invalidDatetime = order.invalidDatetime;
        info.orderDatetime = order.orderDatetime;
        info.orderJointId = order.orderJointId;
        info.orderPrice = order.orderPrice;
        info.orderQuantity = order.orderQuantity;
        info.orderStatus = order.orderStatus;
        info.settleType = order.settleType;
        info.orderKey = order.orderKey;
        info.isShow = isShow;
        info.orderType = order.orderType;
        if (this.orderJointGroup[order.orderJointId]) {
            this.orderJointGroup[order.orderJointId].push(info);
        } else {
            this.orderJointGroup[order.orderJointId] = [info];
        }
    }

    private findMaxOrMin(orderJointId:string,dataIndx:string,dir:string,orderKey:string){
        let group = this.orderJointGroup[orderJointId];
        let hit;
        if (dataIndx != "settleType" && dataIndx != "orderKey") {
            if(group) {
              group.forEach(element => {
                  let val = element[dataIndx];
                  if (hit == undefined || (dir == "up" && val <= hit) || (dir == "down" && val >= hit)) {
                      hit = val;
                  }
              });
            }
        } else if (dataIndx == "settleType"){
            // 単一注文
            hit = group[0][dataIndx];

            // 複合注文
            if(group.length > 1){
                group.forEach(element => {
                    let val = element.orderStatus;
                    if( element.orderJointId == element.orderKey && val=='2') {
                        // １次注文約定済みの場合、決済注文として見なす。
                        hit = "1";
                    }
                });
            }

        } else {
            if (dir == "up") {
                hit = orderKey;
            } else {
                let keyMax = "";
                if(group) {
                  group.forEach(element => {
                      let val = element["orderKey"];
                      if (keyMax == "" || val >= keyMax) {
                          keyMax = val;
                      }
                  });
                }
                let keyMin = "";
                if(group) {
                  group.forEach(element => {
                      let val = element["orderKey"];
                      if (keyMin == "" || val <= keyMin) {
                          keyMin = val;
                      }
                  });
                }
                if (orderKey == keyMin) {
                    hit = Number(keyMax.substring(keyMax.length -4,keyMax.length));
                } else {
                    // reverse order key. overflow number max.
                    let orderKeyN = Number(orderKey.substring(orderKey.length -4,orderKey.length));
                    let keyMaxN = Number(keyMax.substring(keyMax.length -4,keyMax.length));
                    let keyMinN = Number(keyMin.substring(keyMin.length -4,keyMin.length));
                    hit = keyMaxN - orderKeyN + keyMinN;
                }
            }
        }
        return hit;
    }

    // add new order
    private addOrders(orders:IResOrderItem[]){
        if(orders){
            // let rowList = [];
            let dataModel = this.gridObj.pqGrid('option','dataModel');

            for(let i=orders.length-1; i>=0; i--){
                let order = orders[i];
                if (-1 == this.stockItem.findIndex(f => f.value == order.cfdProductCode)) {
                    this.stockItem.push({value:order.cfdProductCode,
                        text:this.business.symbols.getSymbolInfo(order.cfdProductCode).meigaraSeiKanji});
                }
                this.orderList.splice(0, 0, order);
                if(dataModel.data){
                    let odr = order as any;
                    odr.pq_order = --this.orderIndex;
                    dataModel.data.splice(0, 0, order);
                }
            }

            this.modifyShowHide();
            this.refreshGrid(false);
            this.updatePageNavi();
        }
    }

    private updatePageNavi(){
        this.totalPage = this.gridObj.pqGrid('option','pageModel.totalPages');
        this.totalPage = this.totalPage==0 ? 1 : this.totalPage;
    }

    private appendOrders(orders:IResOrderItem[], bLast: boolean){
        // console.log("appendOrders");
        if(orders && this.orderList){
            let dataModel = this.gridObj.pqGrid('option','dataModel');
            let seq = this.orderList.length;
            for(let i=0; i<orders.length; i++){
                let order = orders[i];
                this.orderList.push(order);

                if(dataModel.data){
                    let odr = order as any;
                    odr.pq_order = ++seq;
                    dataModel.data.push(order);
                }
            }
            this.loadCompleteFlg = bLast;
            if(bLast){
              this.makeDropDownDisable();
              this.modifyShowHide();
              this.refreshGrid(false);
              this.updatePageNavi();
              this.updateView();
            }
        }
    }

    private notInOld(old, updated): any {
      let diff = [];
      Object.keys(updated).forEach(key=>{
        if(old[key] == null) {
          diff.push(key);
        }
      });
      return diff;
    }

    private updateOrderValue(oldValue: any, newValue: any){
      // console.log(oldValue);
      // console.log(newValue);
      Object.keys(oldValue).forEach(key=>{
          switch(key){
              case 'pq_order':
              case 'pq_ri':
              case 'pq_rowselect':
              // case 'trailPrice':  // トレール追跡中の場合トレール価格は配信されないので
              break;
              default:
              oldValue[key] = newValue[key];
              break;
          }
      });
      if(newValue.losscutRate) {
        oldValue['losscutRate'] = newValue.losscutRate;
      }
      if(newValue.trailPrice) {
        oldValue['trailPrice'] = newValue.trailPrice;
      }
    }

    // update order status
    private updateOrders(orders:IResOrderItem[]){
        let rowList = [];
        let dataModel = this.gridObj.pqGrid('option','dataModel');
        orders.forEach(order => {
            let odr = this.orderList.findIndex(f=>f.orderKey == order.orderKey);
            let idx = dataModel.data.findIndex(f=>f.orderKey == order.orderKey);

            // update orderList
            if(odr!=-1){
                this.orderList[odr] = order;
            }

            // update dataModel
            if(idx!=-1){
                this.updateOrderValue(dataModel.data[idx], order);
            }else{
                idx = dataModel.dataUF.findIndex(f=>f.orderKey == order.orderKey);
                if(idx!=-1){
                    this.updateOrderValue(dataModel.dataUF[idx], order);
                }
            }
        });

        this.modifyShowHide();
        this.refreshGrid(false);
    }

    // reload all orders
    private reloadOrders(orders:IResOrderItem[]){
        this.reset();
    }

    private currency(price, symbolCode){
        let currentPrice:number = price;
        let boUnit = this.business.symbols.getSymbolInfo(symbolCode).boUnit;
        let format = StringUtil.getBoUnitFormat(boUnit);
        let formatVal:string = StringUtil.formatNumber(currentPrice, format);
        return formatVal;
    }

    private formatNumber(num){
        let formatVal:string = StringUtil.formatNumber(num, '#,###');
        return formatVal;
    }

    public hasPage(){
        if(this.gridObj){
            let PM = this.gridObj.pqGrid('option','pageModel');
            if( PM && PM.totalPages > 1){
                return true;
            }
        }
        return false;
    }

    private didColorTheRow() {
        let hasFocusDone:boolean = !this.focusedOrderJointId;
        let hasUnfocueDone:boolean = !this.unfocusOrderJointId;
        if (this.gridObj && !(hasFocusDone && hasUnfocueDone)) {
            let datas = this.gridObj.pqGrid("option", "dataModel.data");
            let rowIndx = 0;
            let focusCount = 0;
            let unfocusCount = 0;
            for (let data of datas) {
                if (hasFocusDone && hasUnfocueDone) {
                    return;
                }
                if (!hasFocusDone && data.orderJointId == this.focusedOrderJointId) {
                    if (focusCount == 0) {
                        let focusPage = Math.ceil((rowIndx + 1) / this.pageSize);
                        if (focusPage != this.currentPage) {
                            this.currentPage = Math.ceil((rowIndx + 1) / this.pageSize);
                            this.gridObj.pqGrid("goToPage", { page: this.currentPage });
                        }
                        let rowIndxOfPage = ((rowIndx + 1) % this.pageSize) - 1;
                        this.gridObj.pqGrid("scrollRow", { rowIndxPage: rowIndxOfPage});
                    }
                    let $focustr = this.gridObj.pqGrid("getRow", { rowIndx: rowIndx });
                    $focustr.addClass("sync");
                    focusCount ++;
                    rowIndx ++;
                    continue;
                }
                if (focusCount > 0) {
                    hasFocusDone = true;
                    focusCount = 0;
                }
                if (!hasUnfocueDone && data.orderJointId == this.unfocusOrderJointId) {
                    let $unfocustr = this.gridObj.pqGrid("getRow", { rowIndx: rowIndx });
                    $unfocustr.removeClass("sync");
                    unfocusCount ++;
                    rowIndx ++;
                    continue;
                }
                if (unfocusCount > 0) {
                    hasUnfocueDone = true;
                    unfocusCount = 0;
                }
                rowIndx ++;
            }
        }
    }

    private didUnColorTheRow() {
        let datas = this.gridObj.pqGrid("option", "dataModel.data");
        let rowIndx = 0;
        let unfocusCount = 0;
        for (let data of datas) {
            if (data.orderJointId == this.focusedOrderJointId) {
                let $tr = this.gridObj.pqGrid("getRow", { rowIndx: rowIndx });
                $tr.removeClass("sync");
                rowIndx++;
                unfocusCount++;
                continue;
            }
            if (unfocusCount > 0) {
                this.focusedOrderJointId = null;
                return;
            }
            rowIndx ++;
        }
    }


    private checkIfShowNoData(){
        if (this.gridObj) {
            let data = this.gridObj.pqGrid('option','dataModel.data');
            if (!this.initFlg && data.length == 0) {
                this.gridObj.pqGrid('loadComplete');
            }
        }
    }

    public getLayoutInfo():ILayoutInfo{
        let result:ILayoutInfo = super.getLayoutInfo();

        result.option = {
            colOption: this.getColumnOption(),
            stockSelected　: this.stockSelected,
            orderTypeSelected　: this.orderTypeSelected,
            orderStatuSelected　: this.orderStatuSelected,
            dateSelected : this.dateSelected
        };
        result.option.orderJointId = this.focusedOrderJointId;

        return result;
    }

    private getColumnOption(){
        let colOption = [];
        for(let col of this.gridObj.pqGrid('option','colModel')){
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

    private makeDropDownDisable(){
        if (this.loadCompleteFlg) {
            $(this.element.nativeElement).find(".dropdown-toggle").attr("disabled",false);
            if (this.gridObj) {
                this.gridObj.pqGrid( "option", "sortModel",{ on: true, cancel:true, single:true, type:"local" }  );
            }
        } else {
            $(this.element.nativeElement).find(".dropdown-toggle").attr("disabled",true);
            if (this.gridObj) {
                this.gridObj.pqGrid( "option", "sortModel", { on: false } );
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

    if(this.gridObj){
      this.gridObj.pqGrid('refreshDataAndView');
    }    
  }
}
