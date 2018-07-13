import { Component, ElementRef, ChangeDetectorRef, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ResourceService, CommonEnum, CommonConst, Tooltips, BusinessService, PanelManageService, StringUtil, ComponentViewBase } from '../../core/common';
import { DialogService } from "ng2-bootstrap-modal";
import { MessageBox } from '../../util/utils';
import { WithLinkDialogComponent } from '../with-link-dialog/with-link-dialog.component';
import { SymbolCfdComponent} from '../../ctrls/symbol-cfd/symbol-cfd.component';
import * as BusinessConst from '../../const/businessConst';

interface IAlertItem {
  product?:string,
  symbolName?:string,
  basicRate?:string,
  validFlag?:string,
  signal?:string,
  key?:string,
  from?:string
}

@Component({
  selector: 'alert-add-modify',
  templateUrl: './alert-add-modify.component.html',
  styleUrls: ['./alert-add-modify.component.scss']
})
export class AlertAddModifyComponent extends ComponentViewBase {
  public isProcessing:boolean = false;
  public alert:IAlertItem = {basicRate:'0'};
  public modifyFlg:boolean = false;
  public maxRate:number = 99999.99;
  public boUnit:number = 1;
  public initProduct = BusinessConst.DefaultProductCode;
  public tooltipMsg:string="";
  public tooltipCheck:boolean=false;
  public tooltipMouseOver:boolean=false;
  public fromAlert:boolean = true;
  public errMsg:string = "";
  private tempRate:string;
  private currentBidPrice:string;
  private subscribeTick;
  @ViewChild("symbol") symbol:SymbolCfdComponent;

  constructor(public panelMng:PanelManageService,
    public resource:ResourceService,
    public element: ElementRef,
    public changeRef:ChangeDetectorRef,
    public dialogService:DialogService,
    public business:BusinessService  // #2344
    )
  {
    super(panelMng, element, changeRef);
  }

  @Input('alert')
  set show(params) {
    this.alert = params?params:{basicRate:"0"};
    this.tempRate = this.alert.basicRate?this.alert.basicRate:"0";
    this.init();
  }

  @Output()
  onConfirm = new EventEmitter();

  ngOnInit() {
    this.isProcessing = false;
    super.ngOnInit();
  }

  ngAfterViewInit(){
    $(this.element.nativeElement).find(".errcheck").click(() => {
      this.tooltipCheck = false;
    })
    setTimeout(() => {
      this.changeRef.detectChanges();
    }, 50);
  }

  public init(){
    if (this.alert.product) {
      this.initProduct = this.alert.product;
      this.alert.symbolName = this.business.symbols.getSymbolInfo(this.alert.product).meigaraSeiKanji;
      if (this.alert.key) {
        this.modifyFlg = true;
        if (this.alert.from == "alert") {
          this.fromAlert = true;
        } else {
          this.fromAlert = false;
        }
        if (this.symbol) {
          this.symbol.updateSymbol(this.initProduct,this.alert.symbolName,false);
        }
      } else {
        this.fromAlert = false;
        if (this.symbol) {
          this.symbol.updateSymbol(this.initProduct,this.alert.symbolName,false);
        }
        this.modifyFlg = false;
      }
      this.getRateBoUnit(this.alert.product,this.modifyFlg);
    } else {
      this.alert = {product:BusinessConst.DefaultProductCode, symbolName:"", basicRate:"0", validFlag:"1", signal:"1"};
      this.initProduct = BusinessConst.DefaultProductCode;
      if (this.symbol) {
        this.symbol.updateSymbol(this.initProduct,this.alert.symbolName,false);
      }
      this.fromAlert = true;
      this.modifyFlg = false;
      this.getRateBoUnit(this.alert.product);
    }

    if(this.subscribeTick){
      this.subscribeTick.unsubscribe();
      this.subscribeTick = null;
    }
    if (this.subscribeTick) {
      this.subscribeTick.unsubscribe();
    }
    this.subscribeTick = this.business.symbols.tick(this.alert.product).subscribe(realPrice => {
      this.currentBidPrice = realPrice.bid;
    })
  }

  public onChangedSymbol(event:Event){
    var symbol = event["selected"];
    if(symbol){
      this.tooltipCheck = false;
      this.alert.basicRate = "0";
      this.getRateBoUnit(symbol.symbolCode);
      this.alert.product = symbol.symbolCode;
      if(this.subscribeTick){
        this.subscribeTick.unsubscribe();
      }
      let input = {productCodes:this.alert.product};
      this.business.getPriceList(input).subscribe(val=>{
        if( val && val.result.priceList ){
          var price = val.result.priceList[0];
          this.subscribeTick = this.business.symbols.tick(symbol.symbolCode).subscribe(realPrice=>{
            this.currentBidPrice = realPrice.bid;
          });
          this.currentBidPrice = price.bid;
        }
        this.isProcessing = false;
      })
    }
  }

  public onConfirmClick(type:string){
    console.log("onConfirmClick");
    console.log(this.isProcessing);
    if(this.isProcessing) {
      this.updateView();
      return;
    }
    this.isProcessing = true;
    this.updateView();
    if (type != "CLOSE") {
      let rate = Number(this.alert.basicRate);
      if (this.alert.basicRate == "") {
        this.tooltipCheck = true;
        this.tooltipMsg = "レート(BID)を入力してください。";
        this.errMsg = "未入力の項目があります。";
      } else if (rate < this.boUnit) {
        this.tooltipCheck = true;
        this.tooltipMsg = "レート(BID)は" + this.boUnit + "以上の値を入力してください。";
        this.errMsg = "未入力の項目があります。";
      } else {
        this.alert.basicRate = this.formatRate(this.alert.basicRate);        
        if (type == "ADD") {
          this.addAlert();
        } else {
          this.modifyAlert();
        }
      }
    } else {
      this.isProcessing = false;
      if (this.subscribeTick) {
        this.subscribeTick.unsubscribe();
      }
      this.onConfirm.emit(false);
    }
  }

  private addAlert(){
    let setting = this.resource.config.setting.alert;
    if (setting && Object.keys(setting).length == 10) {
      if (this.alert.from == "alert") {
        MessageBox.info({
          title:"アラート",
          message:"アラートの登録可能件数は最大10件です。"
        });
        this.isProcessing = false;
        this.updateView();
      } else {
        let params = {title:"アラート",message:"アラートの登録可能件数は最大10件です。",link:"アラート設定の編集はこちらから"};
        this.dialogService.addDialog(WithLinkDialogComponent, { params: params }).subscribe(
          (val) => {
            if (val == "openlink") {
              this.panelMng.findPanel('03010500').subscribe(pnl=>{
                if (pnl && pnl.length > 0) {
                  this.panelMng.panelFocus(pnl[0].uniqueId);
                } else {
                  let param = {
                    layout:{
                        external:this.panelMng.isExternalWindow(),
                    }
                  }
                  this.panelMng.openPanel(this.panelMng.virtualScreen(), '03010500', param);
                }
              });
              this.isProcessing = false;
              this.onConfirmClick('CLOSE');
            }
        });
      }
      return;
    }
    let alert = [];
    let input = {productCodes:this.alert.product};
    this.business.getPriceList(input).subscribe(val=>{
      if( val && val.result.priceList ){
        let rateNow = Number(val.result.priceList[0].bid);
        this.currentBidPrice = val.result.priceList[0].bid;
        let signal = "1";
        if (Number(this.alert.basicRate) < rateNow) {
          signal = "2";
        }
        if (setting && Object.keys(setting).length) {
          let kmax = "";
          let knum:number = -1;
          for (let key in setting) {
            if (knum < Number(key.split("_")[1])) {
              knum = Number(key.split("_")[1]);
              kmax = key;
            }
          }
          let ks = kmax.split("_");
          let name = ks[0] + "_";
          let no = Number(ks[1]) + 1;
          name += no;
          setting[name] = {product:this.alert.product, basicRate:this.alert.basicRate.toString(), validFlag:"1", signal:signal};
          alert = [{"008":[setting]}];
        } else {
          alert = [{"008":[{"display_0":{product:this.alert.product, basicRate:this.alert.basicRate.toString(), validFlag:"1", signal:signal}}]}];
        }        
        this.update(alert);        
      }
    })
  }

  private modifyAlert(){
    let input = {productCodes:this.alert.product};
    this.business.getPriceList(input).subscribe(val=>{
      if( val && val.result.priceList ){
        let rateNow = Number(val.result.priceList[0].bid);
        this.currentBidPrice = val.result.priceList[0].bid;
        let signal = "1";
        if (Number(this.alert.basicRate) < rateNow) {
          signal = "2";
        }
        let setting = this.resource.config.setting.alert;
        setting[this.alert.key].basicRate = this.alert.basicRate.toString();
        setting[this.alert.key].product = this.alert.product;
        setting[this.alert.key].signal = signal;
        let alert = [{"008":[setting]}];
        this.update(alert);
      }
    })
  }

  private update(alert){
    this.business.setAlert(alert).subscribe(
      val=>{
        if(val.status == "0"){
          this.resource.config.setting.alert = alert[0]["008"][0];
          this.onConfirm.emit(true);
          this.resource.fireUpdateAlertConfig();
          // this.isProcessing = false;
        }
      },
      err=>{
        console.log(err);
        this.onConfirm.emit(false);
        this.isProcessing = false;
      }
    )
  }

  private getRateBoUnit(symbol,isModify:boolean = false){
    let input = {productCodes:symbol};
    this.business.getPriceList(input).subscribe(val=>{
      if( val && val.result.priceList ){
        if (!isModify && (this.alert.basicRate == undefined || this.alert.basicRate == "0")) {
          this.alert.basicRate = val.result.priceList[0].bid;
          this.tempRate = this.alert.basicRate;
        }
        let info = this.business.symbols.getSymbolInfo(symbol);
        this.boUnit = info.boUnit;
        if(this.boUnit >=1 ){
          this.maxRate = 999999;
        }else if(this.boUnit ==0.1){
           this.maxRate = 99999.9;
        }else if(this.boUnit ==0.01){
           this.maxRate = 9999.99;
        }else if(this.boUnit ==0.001){
           this.maxRate = 999.999;
        }
        if (this.tempRate != "0") {
          this.alert.basicRate = this.tempRate;
          $(this.element.nativeElement).find(".rate-input").val(this.tempRate);
        }
        this.changeRef.detectChanges();
      }
    })
  }

  private formatRate(rate:string) {    
    // rate = rate.toString().replace(/^0+/, '');
    rate = Number(rate).toString();
    if (this.boUnit < 1) {
      let rates = rate.split(".");
      let boUnits = this.boUnit.toString().split(".");
      let fixlength = 0;
      if (!rates[1]) {
        fixlength = boUnits[1].length;
        rate += ".";
      } else {
        fixlength = boUnits[1].length - rates[1].length;
      }
      if (fixlength) {
        for (var index = 0; index < fixlength; index++) {
          rate += "0";
        }
      }
    }
    return rate;
  }

  public tooltipMouseOverCheck(check:boolean) {
    this.tooltipMouseOver=check;
    this.changeRef.detectChanges();
  }

  public getCurrentBidPrice() {
    return this.currentBidPrice;
  }
}
