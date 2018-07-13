/**
 * 
 * スピード注文
 * 
 */
import { Component, ElementRef,ViewChild ,ChangeDetectorRef} from '@angular/core';
import { PanelManageService, BusinessService,ResourceService,PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips ,StringUtil, CommonUtil} from '../../../core/common';
import { MessageBox } from '../../../util/utils';
import { AskBidUnitComponent } from '../../../component/ask-bid-unit/ask-bid-unit.component';
import { SpeedOrderComponent } from '../../../component/speed-order/speed-order.component';
import { SpeedOrderQTYComponent } from '../../../component/speed-order-qty/speed-order-qty.component';
import { SymbolCfdComponent } from '../../../ctrls/symbol-cfd/symbol-cfd.component';
import { Messages, GetWarningMessage} from '../../../../../common/message';
import { ERROR_CODE } from "../../../../../common/businessApi";
import * as values from "../../../values/Values";

import * as commonApp from '../../../../../common/commonApp';
import { GetAttentionMessage } from '../../../util/commonUtil';

declare var moment:any;
declare var BigDecimal:any;

const TITLE_SPEED_EXEC = 'スピード注文約定';
const TITLE_SPEED_ERROR = 'スピード注文エラー';
const TITLE_SPEEDALL_ERROR = 'スピード全決済注文エラー';

//-----------------------------------------------------------------------------
// COMPONENT : Scr03020104Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03020104',
  templateUrl: './scr-03020104.component.html',
  styleUrls: ['./scr-03020104.component.scss']
})
export class Scr03020104Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
    private subscribeTick:any;

    @ViewChild('slider') slider: ElementRef;
    @ViewChild('askbid') componentAskBid: AskBidUnitComponent;
    @ViewChild('speedOrder') speedOrder: SpeedOrderComponent;
    @ViewChild('speedOrderQty') speedOrderQty: SpeedOrderQTYComponent;
    @ViewChild('symbolcfd') symbolcfd: SymbolCfdComponent;
    
    public symbol;
    public productCode:string;
    public errMessage:string ;
    public errCanvas:boolean = false;
    public productList:values.IProductInfo;
    public priceId:string;
    public conversionRate;

    public hasAttentionMessage:boolean = false;
    public attentionMessage:string="";
    public stockTitle ="";   
    
    public orderTitletool:string ="スピード注文";
    public stockTitletool:string ="";
    public titleMouse:boolean=false;

    private subscrib:any;

    public validFlag;
    public resetNum :number;    

    private positionList:values.IResPositionInfo[] = [];
    private notifyerSubscribe = [];
    public baseIdx:number;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public business:BusinessService,
               public resource: ResourceService,
               public changeRef:ChangeDetectorRef,
               public element: ElementRef) {                 
    super( '03020104', screenMng, element, changeRef); 
    this.notifyerSubscribe.push(this.business.notifyer.event().subscribe(val=>{
      if(this.productCode)  // 通知がきた時ポジション情報更新
      this.getPositionList(this.productCode);
    }));
  }

  ngOnInit() {
    super.ngOnInit();

    if(this.params && this.params.layout && this.params.layout.productCode ){
        this.productCode = this.params.layout.productCode.toString();    	
    }else{
        this.productCode =this.resource.config_order().initSpeedOrderProduct;
    }

    this.setSpeedInfo();
    
    this.business.getProductList().subscribe(
      val =>{
       	val.result.productList.forEach(element => {
       		if(element.cfdProductCode == this.productCode){
       			this.symbolcfd.changedCode(this.productCode,element.meigaraSeiKanji);
       			this.stockTitle =element.meigaraSeiKanji;
       			this.stockTitletool =element.meigaraSeiKanji;
       			this.stockTitle = this.stockTitle;
       			
       			this.setTitle("スピード注文", this.stockTitle);
       			this.orderTitletool = "スピード注文 "+this.stockTitletool;
       			this.updateView();
       		}
      	});
      }
    );
  }

  ngAfterViewInit(){
    super.ngAfterViewInit();
    this.baseIdx = Number(this.uniqueId.split("_")[2])*1000;
    this.speedOrderQty.baseIdx = this.baseIdx;
    this.symbolcfd.baseIdx = this.baseIdx;
    if (this.business.notifyer !== null && this.business.notifyer.event != null) {
      this.subscrib = this.business.notifyer.event().subscribe(val => {
        switch (val[1].eventType) {
          case commonApp.NoticeType.SPEED_EXECUTION:
          this.componentAskBid.isDisabled = false;
          this.updateView();
          this.componentAskBid.changeRef.detectChanges();
          let timmer = setInterval(()=>{
              if($(this.element.nativeElement).find("button.buttondis[disabled]").length==0){
                  let $top = $(this.element.nativeElement).find(".panel-top");
                  if($top.length){
                      $(this.element.nativeElement).find(".panel-body2").addClass("panel-blink");
                  }
                  clearInterval(timmer);
              }
          },50)
          break;
        case commonApp.NoticeType.SPEED_EXPIRE:
        //   this.panelData.isPriceDisabled = false;
          this.componentAskBid.isDisabled = false;
          this.updateView();
          break;
        case commonApp.NoticeType.UNEXPECTED_INCIDENT:
          MessageBox.info({title:'スピード注文エラー', message:Messages.ERR_0001},()=>{
            //   this.panelData.isPriceDisabled = false;
            this.componentAskBid.isDisabled = false;
            this.updateView();
          });
          break;
          default:
            break;
        }
      })
    }
  }

  private setSpeedInfo(){
    // if(this.resource.config_orderProduct(this.productCode).speedOrderAllowSlippage ==false){
    // 	this.speedOrderQty.allowqty = this.resource.config_orderProduct(this.productCode).speedOrderAllowSlippageValue;
    // }
    // else
    //   this.speedOrderQty.allowqty = undefined;
  	
    this.speedOrderQty.qty = this.resource.config_orderProduct(this.productCode).initSpeedOrderQuantity;
    this.resetNum = this.speedOrderQty.qty;
  }
  
  public titleMouseEvent(event:Event){
  	
  	this.titleMouse = event["titleMouse"]; 
  	this.updateView();
  }
  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngOnDestroy(){
    super.ngOnDestroy();
    if( this.subscribeTick ){
      this.subscribeTick.unsubscribe();
    }
    this.subscrib.unsubscribe();
    
    this.notifyerSubscribe.forEach(s=>{
      s.unsubscribe();
    })
  }

  /**
   * OVERRIDE : save layout
   */
  public getLayoutInfo():values.ILayoutInfo{
    var result = super.getLayoutInfo();

    // set product code.
    result.productCode = this.productCode;

    return result;
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public onChangeSymbol(event:Event){
  	this.speedOrder.sellPrice ='0';
    this.speedOrder.buyPrice = '0';
    this.speedOrder.sellGainLoss ='0';
    this.speedOrder.buyGainLoss ='0';
    this.speedOrder.sellValGaubLoss= '0';
    this.speedOrder.buyValGaubLoss = '0';
    this.speedOrder.sellBalance = '0';
    this.speedOrder.buyBalance = '0';
    
    this.symbol = event["selected"];
    this.productCode = this.symbol.symbolCode;
    this.stockTitletool =this.symbol.symbolName;

    this.stockTitle = this.symbol.symbolName
    this.setTitle("スピード注文", this.stockTitle);
    this.orderTitletool = "スピード注文 "+this.stockTitletool;
    // this.subTitle = this.orderTitletool;      
    
    this.productList =this.business.symbols.getSymbolInfo(this.productCode);
    this.speedOrderQty.tradeUnit =this.productList.tradeUnit;
    
    this.componentAskBid.productList = this.productList;
    this.componentAskBid.currency = this.productList.currency; 

    this.setSpeedInfo();
    // close tick
    if( this.subscribeTick ){
        this.subscribeTick.unsubscribe();
    }

      /*if(this.order_modify.boUnit >=1 ){
      	this.order_modify.priceMax = 999999;
      }else if(this.order_modify.boUnit ==0.1 ){
      	this.order_modify.priceMax = 99999.9;
      }else if(this.order_modify.boUnit ==0.01  ){
      	this.order_modify.priceMax = 9999.99;
      }else if(this.order_modify.boUnit ==0.001  ){
      	this.order_modify.priceMax = 999.999;
      }*/
      
    this.business.getConversionRate().subscribe(val=>{        
        for(let conversionRate of val.result.conversionRateList){
            if(conversionRate.currency == this.productList.currency){
                this.conversionRate = conversionRate;
                this.computePips_ValuatedGainLoss();                
            }
        }
    });
      
    this.business.notifyer.conversionRate().subscribe(val=>{
        if(val.conversionRateList !=null){
            for(let conversionRateReal of val.conversionRateList){
                if(conversionRateReal.currency == this.productList.currency){
                    this.conversionRate = conversionRateReal;
                    this.computePips_ValuatedGainLoss();
                }
            }
        }
    });

    var inputAtt = {cfdProductCode:this.productCode};
    this.business.getAttentionInfoList(inputAtt).subscribe(val=>{
        if(val.status == "0"){
            if(val.result.attentionProductList == null || val.result.attentionProductList.length ==0){
                this.hasAttentionMessage=false;
            }else{
                this.attentionMessage = GetAttentionMessage(val.result.attentionProductList);
                this.hasAttentionMessage=true;
                this.updateView();
            }
        }
    //attentionText
    });

      // open new tick
      var input = {productCodes:this.symbol.symbolCode};

      // request price info
      this.componentAskBid.isDisabled = true;
      this.business.getPriceList(input).subscribe(val=>{
        if( val && val.result.priceList ){
            var price = val.result.priceList[0];
            this.validFlag = price.validFlag;
            this.priceId =price.priceId;
            // request real tick
            this.subscribeTick = this.business.symbols.tick(this.symbol.symbolCode).subscribe(val=>{
              this.priceId = val.priceId;              
              this.componentAskBid.realUpdate(val);
              this.computePips_ValuatedGainLoss();
            });
                  
            // update ask & bid
            this.componentAskBid.update(price);
            this.componentAskBid.isDisabled = false;
        }
        
        this.getPositionList(this.productCode);
      });
    }

    public onErrorDismiss(){
        // console.log(event["errCanvas"]);
        this.errCanvas = false;
    }

/*     public onCanvasBoolean(){
  	  this.speedOrderQty.qtyBorder=false;
    }; */

    public orderSender(event){
        this.componentAskBid.isDisabled = true;
        $(this.element.nativeElement).find(".panel-body2").removeClass("panel-blink");
  	    let qtyinput = this.speedOrderQty;
        this.errMessage ="未入力の項目があります。";
        // console.log("speedOrder.qty===>"+this.speedOrderQty.qty);
        if((event["sellbuy"] != '3') && (qtyinput.qty == null || qtyinput.qty.toString() =="" || qtyinput.qty ==undefined) ){
            qtyinput.qtyMessage = "取引数量を入力してください。";
            this.errCanvas = true;
            qtyinput.qtyBorder =true;
            this.componentAskBid.isDisabled = false;            
            return;
        }else{
            this.errCanvas = false;
            qtyinput.qtyBorder =false;
        }
        if((event["sellbuy"] != '3') && (qtyinput.qty <= 0)) {
            qtyinput.qtyMessage = "取引数量は0より大きい値を入力してください。";
            this.errCanvas = true;
            qtyinput.qtyBorder =true;
            this.componentAskBid.isDisabled = false;
            return;
        }else{
            this.errCanvas = false;
            qtyinput.qtyBorder =false;
        }
        if(event["sellbuy"] == '3') {
          var inputAll:values.IReqSpeedAllSettleOrder = {
            cfdProductCode: this.productCode,
            orderType: CommonConst.ORDER_NORMAL,
            priceId: this.priceId,
            orderBidPrice:this.componentAskBid.bid.toString(),            
            orderAskPrice:this.componentAskBid.ask.toString(),
          }
          // if(this.speedOrderQty.allowqty)
          //   inputAll['allowedSlippage'] = this.speedOrderQty.allowqty;
        if(this.resource.config_orderProduct(this.productCode).speedOrderAllowSlippage ==false){
          inputAll['allowedSlippage'] = this.resource.config_orderProduct(this.productCode).speedOrderAllowSlippageValue;
        }
          // let messageAlert ="["+this.productList.meigaraSeiKanji +"]";
          let messageAlert = '';
          this.business.speedAllSettleOrder(inputAll).subscribe(                
            val=>{
              // console.log(val);
                if(val.status == ERROR_CODE.OK){
                }
                else if(val.status == ERROR_CODE.NG){                  
                  MessageBox.info({title:TITLE_SPEEDALL_ERROR, message:Messages.ERR_0001 + '[CFDS3501T]'}, ()=>{
                    this.componentAskBid.isDisabled = false;
                    this.updateView();
                  });
                }
                else if(val.status == ERROR_CODE.WARN){
                  // for (let clientInfo of val.clientInfoMessage) {
                  //     messageAlert += (clientInfo.message + '[' + clientInfo.messageCode + ']\n');
                  // }
                  MessageBox.info({title:TITLE_SPEEDALL_ERROR, message:GetWarningMessage(val.clientInfoMessage)}, ()=>{
                    this.componentAskBid.isDisabled = false;
                    this.updateView();
                  });
                }
            },
            err=>{
                MessageBox.info({title:TITLE_SPEEDALL_ERROR, message:Messages.ERR_0012 + '[CFDS3502C]'}, ()=>{
                  this.componentAskBid.isDisabled = false;
                  this.updateView();
                });
            }
          );
        }
        else {
          var input:values.IReqSpeedOrder = {
              cfdProductCode:this.productCode,                                
              orderType:CommonConst.ORDER_NORMAL,
              buySellType:event["sellbuy"].toString(),                      
              executionType:CommonConst.EXEC_MARKET_P_VAL,
              orderQuantity: this.speedOrderQty.qty.toString(),
              priceId:this.priceId,
              orderBidPrice:this.componentAskBid.bid.toString(),            
              orderAskPrice:this.componentAskBid.ask.toString(),
          }
          // if(this.speedOrderQty.allowqty)
          //   input['allowedSlippage'] = this.speedOrderQty.allowqty;          
          if(this.resource.config_orderProduct(this.productCode).speedOrderAllowSlippage ==false){
            input['allowedSlippage'] = this.resource.config_orderProduct(this.productCode).speedOrderAllowSlippageValue;
          }          
        // console.log("IReqSpeedOrder");
          // let messageAlert ="["+this.productList.meigaraSeiKanji +"]";
          let messageAlert ="";
          this.business.speedOrder(input).subscribe(
              val=>{
                  if(val.status == ERROR_CODE.OK){
                  }
                  else if(val.status == ERROR_CODE.NG){
                    MessageBox.info({title:TITLE_SPEED_ERROR, message:Messages.ERR_0001 + '[CFDS3401T]'}, ()=>{
                      this.componentAskBid.isDisabled = false;
                      this.updateView();
                    });
                  }
                  else if(val.status == ERROR_CODE.WARN){
                    // for (let clientInfo of val.clientInfoMessage) {
                    //   messageAlert += (clientInfo.message + '[' + clientInfo.messageCode + ']\n');
                    // }
                    MessageBox.info({title:TITLE_SPEED_ERROR, message:GetWarningMessage(val.clientInfoMessage)}, ()=>{
                      this.componentAskBid.isDisabled = false;
                      this.updateView();
                    });
                  }
              },
              err=>{
                MessageBox.info({title:TITLE_SPEED_ERROR, message:Messages.ERR_0012 + '[CFDS3402C]'}, ()=>{
                  this.componentAskBid.isDisabled = false;
                  this.updateView();
                });
              }
          );          
        }
    }

  private getPips(bs: string, bidaskPrice: number, avgPrice: number, boUnit: number): number {
    if(!avgPrice) return 0;
    let ret = 0;
    let decPCnt = StringUtil.getDecimalPCnt(boUnit);
    // （BID値 －買平均レート（※1）） ÷ 呼値単位 ※小数点以下は切り捨て
    if(bs == CommonConst.SELL_TYPE_VAL) { // 売り建玉
      // （ASK値－売平均レート（※1））×（－1） ÷ 呼値単位 ※小数点以下は切り捨て
      ret = Number((bidaskPrice - avgPrice).toFixed(decPCnt)) * -1 / boUnit;
    }
    else {  // 買い建玉
      // （BID値 －買平均レート（※1）） ÷ 呼値単位 ※小数点以下は切り捨て
      ret = Number((bidaskPrice - avgPrice).toFixed(decPCnt)) / boUnit;
    }

    return Math.floor(ret * Math.pow(10, decPCnt)) / Math.pow(10, decPCnt);
  }
  // private getValuatedGainLoss(bs: string, bidaskPrice: number, avgPrice: number, boUnit: number)

  private getPositionList(code: string) {
    this.positionList = [];
    var inputList = {cfdProductCode:this.productCode};
    this.speedOrder.sellPrice = '0';
    this.speedOrder.buyPrice = '0';
    this.speedOrder.sellGainLoss ='0';
    this.speedOrder.buyGainLoss ='0';
    this.speedOrder.sellValGaubLoss= '0';
    this.speedOrder.buyValGaubLoss = '0';
    this.speedOrder.sellBalance = '0';
    this.speedOrder.buyBalance = '0';
    
    this.business.getProductPositionList(inputList).subscribe(val=>{

      switch(val.status){
        case ERROR_CODE.WARN:
          MessageBox.info({title:'建玉一覧取得エラー', message:Messages.ERR_0001});
          break;
        case ERROR_CODE.NG:
          MessageBox.info({title:'建玉一覧取得エラー', message:(Messages.ERR_0001 + '[CFDS0801T]')});
          break;
      }

      if(val.status == ERROR_CODE.WARN || val.status == ERROR_CODE.NG) {
        this.speedOrder.sellPrice = '';
        this.speedOrder.buyPrice = '';
        this.speedOrder.sellGainLoss ='';
        this.speedOrder.buyGainLoss ='';
        this.speedOrder.sellValGaubLoss= '';
        this.speedOrder.buyValGaubLoss = '';
        this.speedOrder.sellBalance = '';
        this.speedOrder.buyBalance = '';
        this.updateView();
        return;
      }

      if(val && val.result && val.result.positionList)
        this.positionList = val.result.positionList;
    
        if(this.positionList.length) {
          let sellBalance =0
          let buyBalance =0
          let format = StringUtil.getBoUnitFormat(this.productList.boUnit,true);
          let decPCnt = StringUtil.getDecimalPCnt(this.productList.boUnit);
          let quotationPriceBig;
          let currentQuantityBig;
          let sellqtyPriceBig = new BigDecimal("0");
          let buyqtyPriceBig = new BigDecimal("0");
          for (let position of this.positionList) {
            quotationPriceBig = new BigDecimal(position.quotationPrice.toString());
            currentQuantityBig = new BigDecimal(position.currentQuantity.toString());
            if(position.buySellType == CommonConst.SELL_TYPE_VAL){
                sellBalance += position.currentQuantity;
                sellqtyPriceBig = sellqtyPriceBig.add(quotationPriceBig.multiply(currentQuantityBig));
            }else{
                buyBalance += position.currentQuantity;
                buyqtyPriceBig = buyqtyPriceBig.add(quotationPriceBig.multiply(currentQuantityBig));
            }                
          }
    
          let avgPrice = 0;
          if(sellBalance > 0){
            let sellBalanceBig = new BigDecimal(sellBalance.toString());
            avgPrice = Number(sellqtyPriceBig.divide(sellBalanceBig, decPCnt, BigDecimal.ROUND_DOWN).toString());
          }
          this.speedOrder.sellPrice = StringUtil.formatNumber(avgPrice, format); 
    
          avgPrice = 0;
          if(buyBalance > 0){
            let buyBalanceBig = new BigDecimal(buyBalance.toString());
            avgPrice = Number(buyqtyPriceBig.divide(buyBalanceBig, decPCnt, BigDecimal.ROUND_DOWN).toString());
          }
          this.speedOrder.buyPrice = StringUtil.formatNumber(avgPrice, format);

          this.speedOrder.sellBalance = StringUtil.formatNumber(sellBalance, '#,##0', false);
          this.speedOrder.buyBalance = StringUtil.formatNumber(buyBalance, '#,##0', false);
    
          this.computePips_ValuatedGainLoss();
        }
    
        // this.speedOrder.sellPrice =StringUtil.CommaWithZero(this.speedOrder.sellPrice);
        // this.speedOrder.buyPrice = StringUtil.CommaWithZero(this.speedOrder.buyPrice);
        // this.speedOrder.sellGainLoss =StringUtil.CommaWithZero(this.speedOrder.sellGainLoss);
        // this.speedOrder.buyGainLoss =StringUtil.CommaWithZero(this.speedOrder.buyGainLoss);
        // this.speedOrder.sellValGaubLoss= StringUtil.CommaWithZero(this.speedOrder.sellValGaubLoss);
        // this.speedOrder.buyValGaubLoss = StringUtil.CommaWithZero(this.speedOrder.buyValGaubLoss);
        // this.speedOrder.sellBalance = StringUtil.CommaWithZero(this.speedOrder.sellBalance);
        // this.speedOrder.buyBalance = StringUtil.CommaWithZero(this.speedOrder.buyBalance);
        
        this.updateView();
    },
    err=>{
      switch(err.status) {
        case ERROR_CODE.NETWORK:
          MessageBox.info({title:'建玉一覧取得エラー', message:(Messages.ERR_0002 + '[CFDS0802C]')});
          break;
      }
    });    
  }

  private computePips_ValuatedGainLoss() {
    let sellGainLoss:number = 0;
    let buyGainLoss:number = 0;
    let sellValGaubLoss:number = 0;
    let buyValGaubLoss:number = 0;
    if(this.positionList.length) {
      this.speedOrder.sellValGaubLoss= '0';
      this.speedOrder.buyValGaubLoss = '0';      
      let decPCnt = StringUtil.getDecimalPCnt(Math.min(this.productList.boUnit, this.productList.tradeUnit));
      let format = StringUtil.getBoUnitFormat(this.productList.boUnit,false);

      let sellGain = this.getPips(CommonConst.SELL_TYPE_VAL, Number(this.componentAskBid.ask), StringUtil.S2N_removeComma(this.speedOrder.sellPrice), this.productList.boUnit);
      this.speedOrder.sellGainLoss = StringUtil.formatNumber(sellGain, '#,##0', true);

      let buyGain = this.getPips(CommonConst.BUY_TYPE_VAL, Number(this.componentAskBid.bid), StringUtil.S2N_removeComma(this.speedOrder.buyPrice), this.productList.boUnit);
      this.speedOrder.buyGainLoss = StringUtil.formatNumber(buyGain, '#,##0', true);
      for (let position of this.positionList) {
        // ①（現在値（※1） - 建値） × value（※2） × 現在数量 × 取引単位		
        // ②①を有効小数桁数で切り捨て		
        // ③②×コンバージョンレート.BID		
        // ④③を小数点以下で切り捨て		
        // ⑤④ + 金利調整額 + 配当金残高(nullの場合は0扱い)            
        // ※1 現在値		
        //   売買区分が「売」の場合→ask	
        //   売買区分が「買」の場合→bid            
        // ※2 value		
        //   売買区分が「売」の場合→-1	
        //   売買区分が「買」の場合→1
        let qPrice = position.quotationPrice;
        let cCnt = position.currentQuantity;
        let tUnit = this.productList.tradeUnit;
        let interBal = position.interestRateBalance;
        let dividBal = position.dividenedBalance;
        let convBid;
        let floatingpos;
        if (this.productList.currency == 'JPY') {
          convBid = 1;
          floatingpos = 0;
        } else {
          convBid = Number(this.conversionRate.bid);
          floatingpos = Number(this.conversionRate.floatingpos);
        }
        if(position.buySellType == CommonConst.SELL_TYPE_VAL){
          let cPrice = Number(this.componentAskBid.ask);
          sellValGaubLoss += CommonUtil.calcProfit(cPrice, qPrice, -1, cCnt, tUnit,convBid,interBal,dividBal,floatingpos);
        }else{
          let cPrice = Number(this.componentAskBid.bid);
          buyValGaubLoss += CommonUtil.calcProfit(cPrice, qPrice, 1, cCnt, tUnit,convBid,interBal,dividBal,floatingpos);
        }
      }
      this.speedOrder.sellValGaubLoss = StringUtil.formatNumber(sellValGaubLoss, '#,##0', true);
      this.speedOrder.buyValGaubLoss = StringUtil.formatNumber(buyValGaubLoss, '#,##0', true);
    }
    this.updateView();
  }  
}