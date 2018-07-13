/**
 *
 * 新規注文入力
 *
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Output, EventEmitter, ViewChild } from '@angular/core'; // #3161
import { PanelViewBase, ComponentViewBase, StringUtil,
         PanelManageService, ResourceService,
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";

declare var $:any;  // for jquery

//-----------------------------------------------------------------------------
// COMPONENT : OrderInputComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'settle-input',
  templateUrl: './settle-input.component.html',
  styleUrls: ['./settle-input.component.scss']
})
export class SettleInputComponent extends ComponentViewBase{
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public buysellType:string;
  public orderType:string ="1";
	public qty:number =0;
	public maxqty:number =0;
	public holdqty:number =0;
	public holdqtying:number =0;
	public holdprice:string ='0';
	public price:number;
	public isTrailStop:boolean=false;
  public isAll:boolean;
  public allowedSlippage:number;
	public allowqty:number;
	public validFlag:string ="0";
	public tradeUnit:number =1;
  public orderTime:string ="";
  public priceOco1:number;
  public priceOco2:number;
  public conversionBid;
  public bidPrice:number =0;
  public askPrice:number =0;
  public maxAllow:number;
  public marginTxt:string = '-';
  public marginOco1Txt:string = '-';
  public marginOco2Txt:string = '-';
  public margin:number =0;
  public marginOco1:number =0;
  public marginOco2:number =0;
  public trailWidth:number =0;
  public priceMax;
  public priceMin;
  public execType:string ="0";
  public productList;
  public boUnit:number;
  public singleMultiBoolean:boolean=true;
  public qtyBorder:boolean =false;
  public priceBorder:boolean =false;
  public priceOco1Border:boolean =false;
  public priceOco2Border:boolean =false;
  public allowQtyBorder:boolean =false;
  public orderTimeBorder:boolean =false;
  public trailBorder:boolean =false;
  public qtyTool:boolean =false;
  public priceTool:boolean =false;
  public allowqtyTool:boolean =false;
  public trailTool:boolean =false;
  public priceOco1Tool:boolean =false;
  public priceOco2Tool:boolean =false;
  public orderTimeTool;
  public qtyMessage;
  public priceMessage;
  public trailMessage;
  public orderTimeMessage;
  public priceOco1Message;
  public priceOco2Message;
  @Output()
  onErrClick = new EventEmitter<any>();   // go, back button click

  @Output()
  onOrderTypeClick = new EventEmitter<any>();   // go, back button click

  @Output()
  onErrorDismiss = new EventEmitter();
  
  @ViewChild('eidQtyInput') eidQtyInput: ElementRef; // #3161

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);

  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngOnInit() {
    super.ngOnInit();
  }

  // event handler
  public onclickQty(e, updown) {  // 注文数量
    // if(this.symbolCode.length) {
  	this.onErrClick.emit();
      if(this.qty ==null || this.qty ==undefined || this.qty < 0){
          this.qty =0
      }
       if(updown == "UP") {
         this.qty +=1 ;

         if(this.maxqty < this.qty) {
           this.qty = this.maxqty;
         }
       } else {
         this.qty -=1;
         if(this.qty < 0) {
           this.qty = 0;
         }
       }
       this.marginCalc();
       this.updateView();
    // }
  }
  public onclickPrice(e, updown){  // 注文指値価格
    // // 成行解除
    // this.isMarketPrice = false;
  	this.onErrClick.emit();
  	if(this.price == null ||this.price == undefined || this.price <0)
        this.price = 0;
    // if(this.symbolCode.length){
       if(updown == "UP") {


          if(this.boUnit >=1 ){
        	 this.price += 1;

        	 if(this.price > 999999)
              this.price = 999999;
          }else if(this.boUnit ==0.1 ){
          	this.price += 0.1;
          	this.price = Number(this.price.toFixed(1));
          	if(this.price > 99999.9)
              this.price = 99999.9;
          }else if(this.boUnit ==0.01  ){
          	this.price += 0.01;
          	this.price = Number(this.price.toFixed(2));
          	if(this.price > 9999.99)
              this.price = 9999.99;
          }else if(this.boUnit ==0.001  ){
          	this.price += 0.001;
          	this.price = Number(this.price.toFixed(3));
          	if(this.price > 999.999)
              this.price = 999.999;
          }

       }
       else {
      	 if(this.price ==0){
        	 return;
         }
         if(this.boUnit >=1 ){
        	 this.price -= 1;

         }else if(this.boUnit ==0.1 ){
          	this.price -= 0.1;
          	this.price = Number(this.price.toFixed(1));
         }else if(this.boUnit ==0.01  ){
          	this.price -= 0.01;
          	this.price = Number(this.price.toFixed(2));
         }else if(this.boUnit ==0.001  ){
          	this.price -= 0.001;
          	this.price = Number(this.price.toFixed(3));
         }
     }
     this.marginCalc();
     this.updateView();
  }
  public onClickBsMulti(){
  	this.onErrClick.emit();
  }
  public onclickOrderTime(){
  	this.onErrClick.emit();
  }

  public onclickTrail(e, updown){  // 注文指値価格
		if(this.trailWidth ==null || this.trailWidth ==undefined || this.trailWidth < 0){
	    this.trailWidth =5
		}
	   if(updown == "UP") {
	    	 this.trailWidth += 1;
	   }
	   else {
	  	  if(this.trailWidth ==5){
	    	 return;
	    	}
	       this.trailWidth -= 1;

	   }
	   this.onErrClick.emit();
	}
  // event handler


  public priceCheck(price):number{
  	if(price == null ||price == undefined || price <0){
  			return  price = 0;
    }

  }


  public onclickOcoPrice(e, updown){  // 注文指値価格
  	this.priceOco1 = this.priceCheck(this.priceOco1);
       if(updown == "UP") {

        	if(this.boUnit >=1 ){
        	 this.priceOco1 += 1;
        	 if(this.priceOco1 > 999999)
              this.priceOco1 = 999999;
          }else if(this.boUnit ==0.1 ){
          	this.priceOco1 += 0.1;
          	this.priceOco1 = Number(this.priceOco1.toFixed(1));
          	if(this.priceOco1 > 99999.9)
              this.priceOco1 = 99999.9;
          }else if(this.boUnit ==0.01  ){
          	this.priceOco1 += 0.01;
          	this.priceOco1 = Number(this.priceOco1.toFixed(2));
          	if(this.priceOco1 > 9999.99)
              this.priceOco1 = 9999.99;
          }else if(this.boUnit ==0.001  ){
          	this.priceOco1 += 0.001;
          	this.priceOco1 = Number(this.priceOco1.toFixed(3));
          	if(this.priceOco1 > 999.999)
              this.priceOco1 = 999.999;
          }
       }
       else {
      	 if(this.priceOco1 ==0){
        	 return;
         }
         if(this.boUnit >=1 ){
        	 this.priceOco1 -= 1;

          }else if(this.boUnit ==0.1 ){
          	this.priceOco1 -= 0.1;
          	this.priceOco1 = Number(this.priceOco1.toFixed(1));
          }else if(this.boUnit ==0.01  ){
          	this.priceOco1 -= 0.01;
          	this.priceOco1 = Number(this.priceOco1.toFixed(2));
          }else if(this.boUnit ==0.001  ){
          	this.priceOco1 -= 0.001;
          	this.priceOco1 = Number(this.priceOco1.toFixed(3));
          }

     }
     this.marginCalc();
     this.onErrClick.emit();
     this.updateView();
  }
  public onclickOcoPrice2(e, updown){  // 注文指値価格
  	this.priceOco2 = this.priceCheck(this.priceOco2);
       if(updown == "UP") {

        	if(this.boUnit >=1 ){
        	 this.priceOco2 += 1;
        	 if(this.priceOco2 > 999999)
              this.priceOco2 = 999999;

          }else if(this.boUnit ==0.1 ){
          	this.priceOco2 += 0.1;
          	this.priceOco2 = Number(this.priceOco2.toFixed(1));
          	if(this.priceOco2 > 99999.9)
              this.priceOco2 = 99999.9;
          }else if(this.boUnit ==0.01  ){
          	this.priceOco2 += 0.01;
          	this.priceOco2 = Number(this.priceOco2.toFixed(2));
          	if(this.priceOco2 > 9999.99)
              this.priceOco2 = 9999.99;
          }else if(this.boUnit ==0.001  ){
          	this.priceOco2 += 0.001;
          	this.priceOco2 = Number(this.priceOco2.toFixed(3));
          	if(this.priceOco2 > 999.999)
              this.priceOco2 = 999.999;
          }
       }
       else {
      	 if(this.priceOco2 ==0){
        	 return;
         }
         if(this.boUnit >=1 ){
        	 this.priceOco2 -= 1;
          }else if(this.boUnit ==0.1 ){
          	this.priceOco2 -= 0.1;
          	this.priceOco2 = Number(this.priceOco2.toFixed(1));
          }else if(this.boUnit ==0.01  ){
          	this.priceOco2 -= 0.01;
          	this.priceOco2 = Number(this.priceOco2.toFixed(2));
          }else if(this.boUnit ==0.001  ){
          	this.priceOco2 -= 0.001;
          	this.priceOco2 = Number(this.priceOco2.toFixed(3));
          }

     }
       this.marginCalc();
       this.onErrClick.emit();
       this.updateView();
  }
  public priceUpdate(price){
      this.bidPrice = price.bid;
      this.askPrice = price.ask;
      this.validFlag = price.validFlag;
      this.marginCalc();
  }
  public conversionBidUpdate(bidPrice){
      this.conversionBid = Number(bidPrice);
      this.marginCalc();
  }
  public marginCalc(){
  	let orderPrice =0;
  	let orderPriceOco1 =0;
    let orderPriceOco2 =0;
    let holdprice:number = StringUtil.S2N_removeComma(this.holdprice);
    let decPCnt = StringUtil.getDecimalPCnt(this.boUnit);
    if(this.singleMultiBoolean){
    	if(this.orderType =="1"){ // 成行
        if(this.buysellType =="1"){ // 売り　(注文価格※1－建値※2)×取引数量×銘柄の取引単位×コンバージョンレート.BID
          // ・成行注文で買建玉（売注文）の場合：　現在プライスのBID値
      		orderPrice = Number((this.bidPrice - holdprice).toFixed(decPCnt));
        }else{  // 買い (建値※2－注文価格※1)×取引数量×銘柄の取引単位×コンバージョンレート.BID
          // ・成行注文で売建玉（買注文）の場合：　現在プライスのASK値
          orderPrice = Number((holdprice - this.askPrice).toFixed(decPCnt));
      	}
      }else{  // 指値
        if(this.price) {
          if(this.buysellType =="1"){ // 売り　(注文価格※1－建値※2)×取引数量×銘柄の取引単位×コンバージョンレート.BID
            orderPrice = Number((this.price - holdprice).toFixed(decPCnt));
          }else{// 買い (建値※2－注文価格※1)×取引数量×銘柄の取引単位×コンバージョンレート.BID
            orderPrice = Number((holdprice - this.price).toFixed(decPCnt));
          }
        }
      }
      if(Number(this.qty) && (this.orderType == CommonConst.EXEC_MARKET_P_VAL || Number(this.price)) ) {
        this.margin = Number(parseInt((orderPrice * this.qty * this.tradeUnit * this.conversionBid).toString()));
        this.marginTxt = StringUtil.formatNumber(this.margin, '#,##0', true);
      }
      else {
        this.margin = 0;
        this.marginTxt = '-';
      }
    }else{
      if(this.buysellType =="1"){ // // 売り　(注文価格※1－建値※2)×取引数量×銘柄の取引単位×コンバージョンレート.BID
        orderPriceOco1 = Number((this.priceOco1 - holdprice).toFixed(decPCnt));
        orderPriceOco2 = Number((this.priceOco2 - holdprice).toFixed(decPCnt));
      }else{  // 買い (建値※2－注文価格※1)×取引数量×銘柄の取引単位×コンバージョンレート.BID
        orderPriceOco1 = Number((holdprice - this.priceOco1).toFixed(decPCnt));
        orderPriceOco2 = Number((holdprice - this.priceOco2).toFixed(decPCnt));
    		// orderPriceOco1 = holdprice - this.priceOco1;
    		// orderPriceOco2 = holdprice - this.priceOco2;
      }
      if(!this.priceOco1 || !Number(this.priceOco1) || !Number(this.qty)) {
        this.marginOco1 = 0;
        this.marginOco1Txt = '-';
      }
      else {
        // this.marginOco1 = Math.floor(orderPriceOco1 * this.qty * this.tradeUnit *  this.conversionBid);
        this.marginOco1 = Number(parseInt((orderPriceOco1 * this.qty * this.tradeUnit *  this.conversionBid).toString()));
        this.marginOco1Txt = StringUtil.formatNumber(this.marginOco1, '#,##0', true);
      }
      if(!this.priceOco2 || !Number(this.priceOco2) || !Number(this.qty)) {
        this.marginOco2 = 0;
        this.marginOco2Txt = '-';
      }
      else {
        // this.marginOco2 = Math.floor(orderPriceOco2 * this.qty * this.tradeUnit *  this.conversionBid);
        this.marginOco2 = Number(parseInt((orderPriceOco2 * this.qty * this.tradeUnit *  this.conversionBid).toString()));
        this.marginOco2Txt = StringUtil.formatNumber(this.marginOco2, '#,##0', true);
      }
    }
    this.updateView();
  }

  public onOrderType(orderType){
    this.orderType = orderType;

    if(this.orderType =="3"){
      // bootstrap material init.
      setTimeout(function() {
        if( $ && $.material ){
          $.material.init();
        }
      }, 10);
    }

    this.marginCalc();
    this.onOrderTypeClick.emit();
    this.onErrClick.emit();
    this.updateView();
  }

  public onOrderOcoType(){
  	this.onErrClick.emit();
  }
  public onClickOrderTime(){
  	this.onErrClick.emit();
  }
  public onclickBuysell(){
  	this.onErrClick.emit();
  }
  public setqty(){
  	this.qtyTool = true;
    this.updateView();
  }
  public getqty(){
  	this.qtyTool = false;
    this.updateView();
  }
  public setprice(){
  	this.priceTool = true;
    this.updateView();
  }
  public getprice(){
  	this.priceTool = false;
    this.updateView();
  }
  public setallowqty(){
  	this.allowqtyTool = true;
    this.updateView();
  }
  public getallowqty(){
  	this.allowqtyTool = false;
    this.updateView();
  }
  public trailErr(trail){
    this.trailTool =trail;
    this.updateView();
  }

  public setpriceOco(){
  	this.priceOco1Tool = true;
    this.updateView();
  }
  public getpriceOco(){
  	this.priceOco1Tool = false;
    this.updateView();
  }
  public setpriceOco2(){
  	this.priceOco2Tool = true;
    this.updateView();
  }
  public getpriceOco2(){
  	this.priceOco2Tool = false;
    this.updateView();
  }

  public setOrderTimeTool(){
  	this.orderTimeTool = true;
    this.updateView();
  }
  public getSrderTimeTool(){
  	this.orderTimeTool = false;
    this.updateView();
  }

  public onChangedCode(event:any){
    // this.initComponent();
    // this.symbolCode = event.symbolCode;
    // this.getCodeInfo(this.symbolCode);
  }

  /* カレンダーを表示するため、一時的にoverflow:hiddenを解除 */
  public toggleVisible( visible:boolean) {
    var $calouselInner = $("div.carousel-inner");
    if (visible) {
      $calouselInner.css('overflow', 'visible')
    } else {
      $calouselInner.css('overflow', 'hidden')
    }
  }

  /**
   * open screen
   *
   * @param scrId
   */
  private openChart(scrId) {

    // this.panelMng.openPanel(
    //   this.resource.config.common.virtualScreen, scrId,
    //   {symbolcode:this.symbolCode, marketcode:this.marketCode});
  }

  public getDefaultSinglePrice() {
    if(this.buysellType == CommonConst.SELL_TYPE_VAL) {
      return(this.bidPrice);
    } else {
      return(this.askPrice);
    }
  }

  public dismissError(errKbn) {
    this[errKbn] = false;
    this.onErrorDismiss.emit();
  }

  // #3161
  protected didGetValueFromEvent(event: any): string {
    return ($(event.currentTarget).val().toString());
  }

  public setQuantityValueInRange = (newValue: string, overClear?: boolean) => {
    let self = this;
    if (self.maxqty === undefined || self.maxqty == null || self.maxqty < 1) {
      return;
    }

    let nMaxQty: number = self.maxqty;
    let maxQty: string = String(self.maxqty);
    let nNewValue: number = parseInt(newValue);
    if (overClear == true) {
      if (nNewValue > nMaxQty) {
        return;
      }

      if (nNewValue < 0) {
        return;
      }
    }
    else {
      nNewValue = Math.max(1, Math.min(nMaxQty, nNewValue));
    }

    return (nNewValue);
  }

  /**
   * 取引数量のINPUTに値を反映する。
   * 
   * @protected
   * @param {string} newValue 
   * @memberof SettleInputComponent
   */
  protected updateQuantityValue(newValue: string) {
    let self = this;
    try {
      self.eidQtyInput.nativeElement.value = newValue;
    }
    catch (e) {
      console.error(e);
    }
  }

  /**
   * 新たな値を取引数量として適用する。
   * 
   * @protected
   * @memberof SettleInputComponent
   */
  protected didUpdateQuantity = (newValue: number, overClear?: boolean) => {
    let self = this;
    let quantityValue: string = "";
    let checkedValue: any = self.setQuantityValueInRange(newValue + '', overClear);

    // 決済注文時のエラーチェックのため、文字列へ変更する。
    let __self_var__: any = self;
    if (checkedValue === undefined || checkedValue == null || checkedValue < 0) {
      quantityValue = "";
      __self_var__.qty = quantityValue;
    }
    else {
      quantityValue = checkedValue.toFixed(0);
      __self_var__.qty = quantityValue;
    }

    self.marginCalc();
    self.updateQuantityValue(quantityValue);
  }

  protected didUpdateDeltaToQuantityChange = (delta: number, $event?: any) => {
    let self = this;
    let preValue: number = 0;
    if (self.qty === undefined || self.qty == null) {
      preValue = 0;
    }
    else {
      if (typeof self.qty == "string") {
        preValue = parseInt(self.qty);
        if(isNaN(preValue)) {
          preValue = 0;
        }
      }
      else {
        preValue = self.qty;
      }
    }
    let newValue: number = (preValue + delta);

    self.didUpdateQuantity(newValue, false);
  }

  /**
   * click event handler
   * 
   * @memberof SettleInputComponent
   */
  public onClickQuantityChange = (isMinus: boolean, $event?: any) => {
    let self = this;
    let delta: number = isMinus == true ? -1 : 1;
    self.didUpdateDeltaToQuantityChange(delta, $event);
  }

  /**
   * long press handler
   * 
   * @memberof SettleInputComponent
   */
  public onLongPressQuantityChange = (isMinus: boolean, $event?: any) => {
    let self = this;
    let delta: number = isMinus == true ? -1 : 1;
    self.didUpdateDeltaToQuantityChange(delta, $event);
  }

  /**
   * blur, enter
   * 
   * @param {*} $event 
   * @param {boolean} [overClear] 
   * @memberof SettleInputComponent
   */
  public onChangedQuantityInput($event: any, overClear?: boolean) {
    let self = this;
    let changedValue: string = self.didGetValueFromEvent($event);
    let newValue: number = -1;
    if ($.isNumeric(changedValue) != true) {
      changedValue = "";
    }
    else {
      newValue = parseInt(changedValue);
    }

    if (isNaN(newValue)) {
      newValue = -1;
    }

    self.didUpdateQuantity(newValue, overClear);
  }

  public onKeyQuantityInput = ($event: any) => {
    let self = this;

    if (!$event) {
      return;
    }

    // Enter key
    if ($event.keyCode == '13') {
      $event.preventDefault();

      self.onChangedQuantityInput($event, true);
      return;
    }
    // Plus key
    else if ($event.keyCode == '38') {
      $event.preventDefault();

      self.onChangedQuantityInput($event, true);

      self.onClickQuantityChange(false, $event);
      return;
    }
    // Minus key
    else if ($event.keyCode == '40') {
      $event.preventDefault();

      self.onChangedQuantityInput($event, true);

      self.onClickQuantityChange(true, $event);
      return;
    }
  }

  /**
   * mousewheel
   * 
   * @memberof SettleInputComponent
   */
  public onMouseWheelQuantityChange = ($event?: any) => {
    let self = this;
    let isMinus: boolean = false;
    if ($event.wheelDeltaY > 0) {
      isMinus = false;
    }
    else {
      isMinus = true;
    }

    self.onClickQuantityChange(isMinus, $event);
  }
  // [end] #3161
}
