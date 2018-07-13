/**
 *
 * ニュース：本文
 *
 */
import { Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import { WindowService, ResourceService, PanelManageService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, BusinessService, StringUtil } from '../../../core/common';
import { IReqSearch, IResSearch,IReqFeedback,IResFeedback,ILayoutInfo } from "../../../values/Values";
declare var $:any;
declare var moment:any;
//-----------------------------------------------------------------------------
// COMPONENT : Scr03030501Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030501',
  templateUrl: './scr-03030501.component.html',
  styleUrls: ['./scr-03030501.component.scss']
})
export class Scr03030501Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public newsData:any = {};
  public noList:boolean = false;
  public upBtnCheck:boolean = false;
  public downBtnCheck:boolean = false;
  public searchErr:boolean = false;
  public searchErrMsg:string = '';
  public relevantProducts:any;
  private rowIndx:number;
  private rowLen:number;
  private headlineId:number;
  private pdfUrl:string='https://sec-sso.click-sec.com/loginweb/sso-redirect?s=05&p=01&sp=08';
  public fileUrl:string;
  public newsVenderIcon:string = '';
  private subscription:any;
  private subscrip:any
  private searchSubscrip:any;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef,
               public business: BusinessService,
               public resource:ResourceService, 
               public window:WindowService) {
    super( '03030501', screenMng, element, changeRef);
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  initLayout(param:any){
    let option;

    this.ui();
    
    if( param.layout.option == null || param.layout.option.data == null ){
      return;
    }

    option = param.layout.option;
    
    this.newsData   = option.data;
    this.headlineId = option.data.headlineId;
    this.newsData.pureStory = option.data.pureStory.replace(/(?:\r\n|\r|\n)/g,'<br />');
    this.rowIndx    = option.rowIndx?option.rowIndx:0;
    this.rowLen     = option.rowLen?option.rowLen:0;

    this.btnCheck();
    this.noList=true;
    if(this.newsData.resourceType!='0011') {
      this.searchList();
    }

    this.fileUrl=this.pdfUrl+"&sessionId="+this.resource.environment.session.sessionId +"&rp=headlineId="+this.headlineId;

    this.subscrip = this.screenMng.onChannelEvent().subscribe(val=>{
      if(val.channel == 'newsDetail') {
        let option = val.arg.layout.option;
        this.newsData   = option.data;
        this.headlineId = option.data.headlineId;
        this.newsData.pureStory = option.data.pureStory.replace(/(?:\r\n|\r|\n)/g,'<br />');
        this.rowIndx    = option.rowIndx?option.rowIndx:0;
        this.rowLen     = option.rowLen?option.rowLen:0;
        this.btnCheck();

        if(option.data.resourceType!='0011') {
          this.searchList();
        } else {
          this.relevantProducts.length = 0;
        }
        this.fileUrl=this.pdfUrl+"&sessionId="+this.resource.environment.session.sessionId +"&rp=headlineId="+this.headlineId;
        this.resetVenderIcon();
        this.updateView();
      }
    });

    this.subscription = this.screenMng.onClosePanel().subscribe(val => {
      if (val.id == "03030500" && val.reason.closeReason == 'panelClosed') {
        this.close();
      }
    })

    this.resetVenderIcon();
  }

  ngOnDestroy(){
    super.ngOnDestroy();

    if(this.subscription){
      this.subscription.unsubscribe();
    }
    if(this.subscrip){
      this.subscrip.unsubscribe();
    }
    if(this.searchSubscrip){
      this.searchSubscrip.unsubscribe();
    }
  }

  public onResizing($event){
    super.onResizing();
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  private btnCheck(){
    if(this.rowIndx==0) {
      this.upBtnCheck=true;
    } else {
      this.upBtnCheck=false;
    }

    if(this.rowIndx==(this.rowLen-1)) {
      this.downBtnCheck=true;
    } else {
      this.downBtnCheck=false;
    }
  }

  public pdfLink($event){
    this.window.openBrowser(this.fileUrl);
  }

  public onListUp($event) {
    let data=this.newsData;
    let idx=this.rowIndx;
    this.screenMng.fireChannelEvent('news', {headlineId:data.headlineId, action:'up', rowIndx:idx});
    this.resetVenderIcon();
  }

  public onListDown($event) {
    let data=this.newsData;
    let idx=this.rowIndx;
    this.screenMng.fireChannelEvent('news', {headlineId:data.headlineId, action:'down', rowIndx:idx});
    this.resetVenderIcon();
  }

  public itemClick(code) {
    let _self=this;
    let input: IReqFeedback = {news_id:this.headlineId, product_cpc:code, datetime:moment().format('YYYYMMDDHHmmss')};
    this.business.feedback(input).subscribe(val => {
      let param:any = {};
      let layout: ILayoutInfo = {} as ILayoutInfo;
      layout.productCode = code;
      layout.external = this.isExternalWindow();
      param.layout = layout;
      this.screenMng.openPanel( this.screenMng.virtualScreen(), '03020100' , param);
    });
  }

  private searchList(){
    let _self=this;
    this.searchErr=false;
    let input: IReqSearch = {id:this.headlineId};
    this.relevantProducts=[];
    if (this.searchSubscrip) {
      this.searchSubscrip.unsubscribe();
    }
    this.searchSubscrip = this.business.search(input).subscribe(val => {
      if(val.status=="OK") {
        if (val.relevant_products.length > 0) {
          _self.relevantProducts=val.relevant_products;
          _self.noList = false;
          _self.searchErr = false
        }  else {
        _self.relevantProducts.length = 0;
        _self.noList=true;
        }
      }

      if(val.status=="NG" || val.status=="2") {
        _self.searchErrMsg='データが取得できませんでした。しばらくしてからもう一度お試しください。[CFDS4201T]';
        _self.searchErr=true;
        _self.noList=false;
      } else if(val.status=="100") {
        _self.searchErrMsg='インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS4202C]';
        _self.searchErr=true;
        _self.noList=false;
      }

      _self.updateView();
    }, err => {
      _self.searchErrMsg='インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS4202C]';
      _self.searchErr=true;
      _self.noList=false;
      _self.updateView();
    });
  }

  private ui(){
    let _element = $(this.element.nativeElement);

    //open-list
    _element.find('.btn_open').on('click', function(){
      let _view_box = $(this).closest('.panel-body'),
          _has = _view_box.hasClass('open'),
          _icon = $(this).children('.svg-icons');

      if(_has){
        _view_box.removeClass('open');
        _icon.removeClass('icon-close-exdata').addClass('icon-open-exdata');
      }else{
        _view_box.addClass('open');
        _icon.removeClass('icon-open-exdata').addClass('icon-close-exdata');
        
      }
    });
  }

  private resetVenderIcon() {
    if(this.newsData.newsVenderCode=='1'){
      this.newsVenderIcon="icon-vender-marketwin-24";
    } else if(this.newsData.newsVenderCode=='2'){
      this.newsVenderIcon="icon-vender-nikkei";
    } else if(this.newsData.newsVenderCode=='3'){
      this.newsVenderIcon="icon-vender-dowjones";
    } else if(this.newsData.newsVenderCode=='8'){
      this.newsVenderIcon="icon-vender-msaaf";
    } else if(this.newsData.newsVenderCode=='9'){
      this.newsVenderIcon="icon-vender-jp";
    } else if(this.newsData.newsVenderCode=='10'){
      this.newsVenderIcon="icon-vender-dhz";
    }
  }

  public getLayoutInfo():ILayoutInfo{
    let result:ILayoutInfo = super.getLayoutInfo();

    result.option = this.params.layout.option; 

    return result;
  }
}
