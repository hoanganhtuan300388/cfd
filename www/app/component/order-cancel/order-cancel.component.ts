/**
 * 
 * 取消注文
 * 
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef,Output,EventEmitter } from '@angular/core';
import { PanelViewBase, ComponentViewBase, StringUtil,
         PanelManageService, ResourceService, 
         CommonConst, Tooltips, BusinessService,
         IViewState, IViewData, ViewBase } from "../../core/common";
//-----------------------------------------------------------------------------
// COMPONENT : OrderCancelComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'order-cancel',
  templateUrl: './order-cancel.component.html',
  styleUrls: ['./order-cancel.component.scss']
})
export class OrderCancelComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public productCode: string = '';
	public orderchooice:string ="single";
  public isSave:boolean = false;
  public settleType:string ="0";
  public settleTypeName:string;
  public sellbuy;
  public sellbuyClass;
  public orderTypeName;
  public orderType;
  public qty;
  public tradeUnit;
  public price;
  public allowqty;
  public orderTime;
  public sellbuyOco;
  public qtyOco;
  public priceOco;
  public priceOco2;
  public priceOcoLossCut;
  public priceOcoLossCut2;
  public orderTypeOco;
  public orderTimeOco;
  public trailqty;
  public losscut;
  
  @Output()
	onNavButtonClick = new EventEmitter<any>();   // go, back button click
	
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element: ElementRef,
              public business:BusinessService,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);                
  }

  
  public onNavBtnClick(val:string){
    this.onNavButtonClick.emit(val);
  }
  
  /**
   * 取消注文情報を設定する。
   * 
   * @param {any} orderList 
   * @memberof OrderCancelComponent
   */
  public setCancelInfo(orderList){
    let productList =this.business.symbols.getSymbolInfo(this.productCode);    
    let format = StringUtil.getBoUnitFormat(productList.boUnit,true);
    // 複合注文
  	if(orderList.length >1){
      // IFD
  		if(orderList[0].orderType =="2"){
  			this.orderchooice = "ifd";
  			this.sellbuyClass = orderList[0].buySellType;
        this.sellbuy = orderList[0].buySellType=='1'?"売":"買";        
  			this.qty = StringUtil.Comma(orderList[0].orderQuantity);
  			this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
  			this.losscut = orderList[0].losscutRate==null?"自動": StringUtil.formatNumber(Number(orderList[0].losscutRate), format);
  			this.orderType =orderList[0].orderType;
        this.orderTypeName = orderList[0].executionType=="2"?"指値":"逆指値";
        this.orderTime = CommonConst.INVALIDDATE_TYPE_TXT[orderList[0].invalidDateType];
  			this.sellbuyOco = orderList[1].buySellType=='1'?"売":"買";
  			this.qtyOco = StringUtil.Comma(orderList[1].orderQuantity);
        this.priceOco = StringUtil.formatNumber(Number(orderList[1].orderPrice), format);
        this.orderTypeOco = orderList[1].executionType == "2" ? "指値" : "逆指値"; // #3292
        this.orderTimeOco = CommonConst.INVALIDDATE_TYPE_TXT[orderList[1].invalidDateType];
      }
      // IFD-OCO
      else if(orderList[0].orderType =="3"){
        this.orderchooice = "oco";
  			this.sellbuyClass = orderList[0].buySellType;
  			this.sellbuy = orderList[0].buySellType=='1'?"売":"買";
        this.qty = StringUtil.Comma(orderList[0].orderQuantity);        
  			this.priceOco = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
        this.priceOco2 = StringUtil.formatNumber(Number(orderList[1].orderPrice), format);
        this.settleType =orderList[0].settleType;
  			if(this.settleType =='0'){
  				this.priceOcoLossCut =orderList[0].losscutRate==null?"自動": StringUtil.formatNumber(Number(orderList[0].losscutRate), format);
  				this.priceOcoLossCut2 = orderList[1].losscutRate==null?"自動": StringUtil.formatNumber(Number(orderList[1].losscutRate), format);
        }
        this.orderTime = CommonConst.INVALIDDATE_TYPE_TXT[orderList[0].invalidDateType];
  		}else{
  			this.orderchooice = "ifdoco";
  			this.sellbuyClass = orderList[0].buySellType;
  			this.sellbuy = orderList[0].buySellType=='1'?"売":"買";
  			this.qty = StringUtil.Comma(orderList[0].orderQuantity);
  			//this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
        if(orderList[0].orderType =="6"){
          if(orderList[0].orderStatus== "3" || orderList[0].orderStatus== "8"){
            if(orderList[0].trailPrice ==null){
                this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);// + " 幅" + orderList[0].trailWidth;
            }else{
                this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
            }
          }else if(orderList[0].orderStatus == "0" || orderList[0].orderStatus == "1" || orderList[0].orderStatus == "2" || orderList[0].orderStatus == "4" || orderList[0].orderStatus == "5"){

            if(orderList[0].trailPrice == null){
                this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);// + " 幅" + orderList[0].trailWidth;
            }else if(orderList[0].buySellType =="2"){
                if(orderList[0].trailPrice < orderList[0].orderPrice){
                    this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format) + " [現在:" + StringUtil.formatNumber(Number(orderList[0].trailPrice), format) + "]";
                }else{
                  this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
                    // this.price = " 幅" + orderList[0].trailWidth;
                }
            }else if(orderList[0].buySellType =="1"){
                if(orderList[0].trailPrice > orderList[0].orderPrice){
                    this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format) + " [現在:" + StringUtil.formatNumber(Number(orderList[0].trailPrice), format) + "]";
                }else{
                  this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
                    // this.price = " 幅" + orderList[0].trailWidth;
                }
            }

          }else{
            this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
          }

      }else{
        this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
      }
        
  			this.losscut = orderList[0].losscutRate==null?"自動": StringUtil.formatNumber(Number(orderList[0].losscutRate), format);
  			this.orderType =orderList[0].orderType;
        this.orderTypeName = orderList[0].executionType=="2"?"指値":"逆指値";
        this.orderTime = CommonConst.INVALIDDATE_TYPE_TXT[orderList[0].invalidDateType];
  			this.sellbuyOco = orderList[1].buySellType=='1'?"売":"買";
  			this.qtyOco = StringUtil.Comma(orderList[1].orderQuantity);
  			this.priceOco = StringUtil.formatNumber(Number(orderList[1].orderPrice), format);
        this.priceOco2 = StringUtil.formatNumber(Number(orderList[2].orderPrice), format);
        this.orderTimeOco = CommonConst.INVALIDDATE_TYPE_TXT[orderList[1].invalidDateType];
  		}  		
  	}else{
  		this.orderchooice = "single";
  		this.settleType =orderList[0].settleType;
  		this.sellbuyClass = orderList[0].buySellType;
			this.sellbuy = orderList[0].buySellType=='1'?"売":"買";
			this.orderType =orderList[0].executionType;
			this.orderTypeName = orderList[0].executionType=="2"?"指値":"逆指値";
			this.settleTypeName ="新規";
			this.qty = StringUtil.Comma(orderList[0].orderQuantity);
      //this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
      if(orderList[0].orderType =="6"){
          if(orderList[0].orderStatus== "3" || orderList[0].orderStatus== "8"){
            if(orderList[0].trailPrice ==null){
                this.price =  StringUtil.formatNumber(Number(orderList[0].orderPrice), format); // + " 幅" + orderList[0].trailWidth;
            }else{
                this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
            }
          }else if(orderList[0].orderStatus == "0" || orderList[0].orderStatus == "1" || orderList[0].orderStatus == "2" || orderList[0].orderStatus == "4" || orderList[0].orderStatus == "5"){

            if(orderList[0].trailPrice == null){
                this.price =  StringUtil.formatNumber(Number(orderList[0].orderPrice), format); // + " 幅" + orderList[0].trailWidth;
            }else if(orderList[0].buySellType =="2"){
                if(orderList[0].trailPrice < orderList[0].orderPrice){
                    this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format) + " [現在:" +  StringUtil.formatNumber(Number(orderList[0].trailPrice), format) + "]";
                }else{
                    this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
                    // this.price = " 幅" + orderList[0].trailWidth;
                }
            }else if(orderList[0].buySellType =="1"){
                if(orderList[0].trailPrice > orderList[0].orderPrice){
                    this.price =  StringUtil.formatNumber(Number(orderList[0].orderPrice), format) + " [現在:" + StringUtil.formatNumber(Number(orderList[0].trailPrice), format) + "]";
                }else{
                  this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
                    // this.price = " 幅" + orderList[0].trailWidth;
                }
            }

          }else{
            this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
          }

      }else{
        this.price = StringUtil.formatNumber(Number(orderList[0].orderPrice), format);
      }

      this.orderTime = CommonConst.INVALIDDATE_TYPE_TXT[orderList[0].invalidDateType];
			
  		if(this.settleType =='0'){
  			 //this.losscut = orderList[0].losscutRate==null?"自動": orderList[0].losscutRate;
         this.losscut = orderList[0].losscutRate==null?"自動": StringUtil.formatNumber(Number(orderList[0].losscutRate), format);
  		}else{
  			if(orderList[0].orderType =="6"){
  				this.isSave =true;
  				this.trailqty = orderList[0].trailWidth + " " + "pips";
  			}else{
  				this.isSave =false;
  			}
  		}
  	}
  	this.updateView();
  }
  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
}
