/**
 *
 * PanelManageService
 *
 */
import { Component, OnInit, Input, ElementRef, ViewChild, HostListener, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, IViewData, IDragDropData, IPanelInfo, CommonConst, CommonEnum, Tooltips  } from '../core/common';
import { ViewBase} from "../core/viewBase";
import * as values from "../values/values";
import * as CommonApp from '../../../common/commonApp';

declare var $:any;
declare var _:any;
declare var ResizeDetector:any;

const BY_WINDOW  = 1;
const BY_ELEMENT = 2;
const electron   = (window as any).electron;

//-----------------------------------------------------------------------------
// CLASS : PanelViewBase
// ----------------------------------------------------------------------------
export class PanelViewBase extends ViewBase implements OnInit {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  // 画面識別ID
  protected uniqueId:string = '';

  // 画面データ共有 Group ID
  protected groupId:number = 0;

  // title bar text.
  protected _title:string;

  protected _subTitle:string;

  // parent & child 検索用meta data
  protected metaComponent: {hostId:string, view:ViewBase }[] = [];

  // 外部から渡されたParameter
  public params:any;

  // panel info
  protected _panelInfo:IPanelInfo;

  // tooltip
  public TOOLTIP_SETTING: string = "";
  public TOOLTIP_HIDE: string = "";
  public TOOLTIP_CLOSE: string = "";

  // for drag
  @ViewChild("dragCanvas") dragCanvas;
  protected dragNdrop_img        : HTMLImageElement;
  protected dragNdrop_txt        : string;
  protected dragNdrop_font       : string ='14px Courier New';
  protected dragNdrop_background : string = '#FFFFFF';
  protected dragNdrop_txtcolor   : string = '#5f9ea0';
  protected dragNdrop_data = {} as IDragDropData;
  public isDragOK              : boolean = false;  // 最適化作業

  // for electron
  private detectResize = {
    resizeDetector:null,
    browser:null,
    $panel:null,
    $head:null,
    $body:null,
    bySide:0
  }

  // 最大化される前のサイズ位置情報
  private rectInfoBeforeMaxmized = {
    maximized:false,
    width:0,
    height:0,
    top:0,
    left:0
  }

  private closeReasonIsMoveInternal=false;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(
      public pageId:string,
      public panelMng:PanelManageService,
      public element: ElementRef,
      public changeRef:ChangeDetectorRef
    )
  {
    super(panelMng, element, changeRef);

    // tooltip setting
    this.TOOLTIP_SETTING = Tooltips.PANEL_SETTING;
    this.TOOLTIP_HIDE = Tooltips.PANEL_HIDE;
    this.TOOLTIP_CLOSE = Tooltips.PANEL_CLOSE;

    // ngx-contextMenuが直ぐに表示されるように。画面にフォクスを入れる。
    $(element.nativeElement).trigger('click');
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  /**
   * init object
   */
  ngOnInit() {
    // set unique panel id.
    this.uniqueId = this.element.nativeElement.id;

    // set component instance to panel's info
    this._panelInfo = this.panelMng.getPanel( this.uniqueId );

    if( this._panelInfo ){
      this._panelInfo.instance = this;
      this.params  = this._panelInfo.params;
    }else{
      if( this.isExternalWindow()){
        var win = window as any;
        // this.params = win.electron.parameter;
        if(win.electron.parameter.option){
          this.params = win.electron.parameter.option.params;
        }
      }
    }

    this.params = this.params?this.params:{};

    // set gfhost-name
    var host= CommonConst.COMPONENT_PREFIX + this.uniqueId.replace( CommonConst.PANEL_ID_PREFIX, '' );
    this.element.nativeElement.setAttribute(host, '');

    // regist meta info for find parent.
    this.registMetaComponent( host, this );
  }

  /**
   *
   */
  ngOnDestroy(){
    super.ngOnDestroy();

    // clear meta info.
    this.metaComponent = [];
    this._panelInfo = null;
  }

  /**
   *
   */
  ngAfterViewInit(){
    // inti panel layout
    this.initLayout(this.params);

    // set focus screen window.
    this.panelMng.panelFocus(this.uniqueId, {id:this.pageId, uniqueId:this.uniqueId, panelParams:this.params});

    // bootstrap material init.
    if( $ && $.material ){
      $.material.init();
    }

    // create drag image
    this.dragNdrop_img = new Image();

    // capture drag & drop event
    $(this.element.nativeElement).find('.panel-body').on('drop',(e)=>this.ondrop(e.originalEvent));

    this.initElectron();
  }

  /**
   * override function.
   *
   * 画面が最小化された際、呼び出される。
   */
  public onPanelMinimized(){
  }

  /**
   * override function.
   *
   * 画面が最小化から復元された際、呼び出される。
   */
  public onPanelRestored(){
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  private initElectron(){

    // 外だし画面の場合
    if(this.isExternalWindow()){
      this.setTitle(this.title());
      this.detectResize.browser = electron.remote.getCurrentWindow();

      // set resizeable
      var $div = $(this.element.nativeElement).find('.gw-resizeable');

      this.detectResize.$panel = $(this.element.nativeElement).find('.panel');
      this.detectResize.$body = $(this.element.nativeElement).find('.panel-body');
      this.detectResize.$head = $(this.element.nativeElement).find('.panel-heading');

      this.detectResize.browser.setResizable($div.length>0);

      // resize once
      this.resizeWindowByElement();

      this.initBrowserMinMax();

      // detect resize event from dom element.
      this.detectResizeElement();

      // detect resize event from window
      this.detectResizeWindow();

      var setPanelPos = ()=>{
        var rect = this.detectResize.browser.getBounds();

        this.params.left = rect.x;
        this.params.top = rect.y;
      }

      // detect window moved
      this.detectResize.browser.on('maximize', (event,arg)=>{
        this.detectResize.bySide = 0;
      });
      
      // detect window moved
      this.detectResize.browser.on('move', (event,arg)=>{
        setPanelPos();
      });
      setPanelPos();

      // layoutInfo queryの応答
      electron.ipcRenderer.on(CommonApp.IPC_LAYOUTINFO_QUERY, (event, arg) => {
        electron.ipcRenderer.sendSync(CommonApp.IPC_LAYOUTINFO_SET, this.getLayoutInfo());
      });
    }
  }

  /**
   * inti panel layout
   *
   * @param param
   */
  protected initLayout(param:any){
    // set panel position
    if( param ){
      if(param['left'] != undefined && param['top'] != undefined){
        this.movePanel(param.left, param.top);
      }

      if(param['width'] != undefined){
        this.width = param['width'];
      }
      if(param['height'] != undefined){
        this.height = param['height'];
      }
    }
  }

  public findMetaComponent( hostId: string ){
    var meta = this.metaComponent.find( (item)=>{ return item.hostId == hostId });

    return meta?meta.view:null;
  }

  public registMetaComponent( hostId: string, view:ViewBase ){
    var meta = {hostId:hostId, view:view };

    this.metaComponent.push( meta );
  }

  /**
   *  panel title
   */
  public setTitle(title:string, subTitle?:string){
    this._title = title;
    this._subTitle = subTitle;
    if(this._panelInfo){
      this._panelInfo.title = this._title;
      this._panelInfo.subTitle = this._subTitle;
    }

    if(electron && this.isExternalWindow()){
      var win = electron.remote.getCurrentWindow();
      if(this._subTitle && this._title != this._subTitle)
        win.setTitle(this._title + ' ' + this._subTitle);
      else
        win.setTitle(this._title);
    }
  }

  public title():string{
    var str = this._title?this._title:this._panelInfo?this._panelInfo.title:null;

    if(!str){
      str = CommonConst.PANELLIST[this.pageId].title;
    }

    if(!this._subTitle || str == this._subTitle)
      return str;
    else
      return str + ' ' + this._subTitle;
  }

  // /**
  //  *  panel sub title
  //  */
  // get subTitle(){
  //   if(this._panelInfo){
  //     return this._panelInfo.subTitle;
  //   }
  //   return '';
  // }
  // set subTitle( subtitle:string ){
  //   if(this._panelInfo){
  //     this._panelInfo.subTitle = subtitle;
  //   }
  // }

  /**
   * left property
   */
  set left(left:number){
    var target = this.element.nativeElement.children[0];

    this.params.left = left;
    // target.style.left = left + 'px';
    target.style.transform = `translate3d(${(left)}px, ${(this.params.top)}px, 0)`; 
  }
  get left(){
    if(this.params){
      return this.params.left;
    }
    return 0;
  }

  /**
   * top property
   */
  set top(top:number){
    var target = this.element.nativeElement.children[0];

    this.params.top = top;
    // target.style.top = top + 'px';
    target.style.transform = `translate3d(${(this.params.left)}px, ${(top)}px, 0)`; 
  }
  get top(){
    if(this.params){
      return this.params.top;
    }
    return 0;
  }

  /**
   * width property
   */
  set width(width:number){
    var target = this.element.nativeElement.children[0];

    this.params.width = width;
    target.style.width = width + 'px';
  }
  get width(){
    if(this.params){
      return this.params.width;
    }
    return 0;
  }

  /**
   * height property
   */
  set height(height:number){
    var target = this.element.nativeElement.children[0];

    this.params.height = height;
    target.style.height = height + 'px';
  }
  get height(){
    if(this.params){
      return this.params.height;
    }
    return 0;
  }

  /**
   * パネルの位置設定
   *
   * @param left
   * @param top
   */
  public movePanel(left:number, top:number){
    var target = this.element.nativeElement.children[0];

    this.params.left = left;
    this.params.top = top;

    if(!this.isExternalWindow()){
      target.style.transform = `translate3d(${(left)}px, ${(top)}px, 0)`; 
    }
  }

 /**
  *
  */
  public getPosition(){
    return {left:this.params.left, top:this.params.top};
  }

  /**
   *
   */
  protected updateDragData( data:IViewData ){
    this.dragNdrop_data.flag   = data.flag;
    this.dragNdrop_data.market = data.market;
    this.dragNdrop_data.symbol = data.symbol;
    this.dragNdrop_data.symbolName = data.symbolName;
  }

  /**
   * view dataの変更イベントを受信 -> drag data設定
   */
  public onChangeViewData( data:IViewData, sender:ViewBase, byChild:boolean ){
    // Panel間Broadcastイベントの場合
    if( data.flag & CommonEnum.ViewDataFlag.BROADCAST ){
      if( data.groupId && this.groupId > 0 && data.groupId == this.groupId ){
        this.updateDragData(data);

        this.makeDragText();

        super.onChangeViewData( data, sender, byChild );
      }
    }
    else if( data.flag & CommonEnum.ViewDataFlag.GROUP ){
      this.groupId = data.groupId;
      super.onChangeViewData(data, sender, byChild);
    }
    else if( data.flag & CommonEnum.ViewDataFlag.SYMBOL ){
      super.onChangeViewData( data, sender, byChild );

      this.updateDragData(data);

      this.makeDragText();

      // is group panel
      if( this.groupId > 0 ){
        data.flag |= CommonEnum.ViewDataFlag.BROADCAST;
        data.groupId = this.groupId;
        this.panelMng.broadcastViewData( data, this );
      }
    }
  }

  /**
   * drag start
   */
  @HostListener('dragstart', ['$event'])
  ondragstart(e: any){
    // console.log('drag-start');
    if(this.dragNdrop_data.symbol) {
			// #960
			this.dragNdrop_data.flag |= CommonEnum.ViewDataFlag.DRAGDROP;
			//

      let data = JSON.stringify(this.dragNdrop_data);
      e.dataTransfer.setData('data', data);
      e.dataTransfer.setDragImage(this.dragNdrop_img, 10, 10);
    }
  }

  /**
   * drop
   */
  ondrop(e: any) {
    // console.log('drag-drop');
    if(e.dataTransfer && e.dataTransfer.items.length) {
      let data = JSON.parse(e.dataTransfer.getData("data"));
      if(data.symbol != this.dragNdrop_data.symbol) {
        this.dragNdrop_data = data;
        this.makeDragText();
        this.onChangeViewData(data, this, false);
      }
    }
  }

  /**
   * set focus screen window.
   */
  @HostListener('mousedown', ['$event'])
  onMouseDown(event:MouseEvent) {
    if(event.button == 0) {
      let contextMenu = $('.ngx-contextmenu');
      if (contextMenu) {
        $(contextMenu).addClass('invisible')
      }
      if (this.dragCanvas) {
        if (this.dragNdrop_data.symbol) {
          this.makeDrageImage(this.dragNdrop_txt);
          this.isDragOK = true;
        }
        else
          this.isDragOK = false;
      }
    }
    else if(event.button === 2)
    {
      // prevents right click drag, remove his if you don't want it
      return;
    }

    // set focus screen window.
    this.panelMng.panelFocus(this.uniqueId, {id:this.pageId, uniqueId:this.uniqueId, panelParams:this.params});
  }

  public inoutWindow(){
    if(this.isExternalWindow()){
      this.importWindow();
    }else{
      this.exportWindow();
    }
  }

  /**
   *  外にポップアップされた画面をMDI内部に移動させる。
   *  import window
   */
  public importWindow(){
    if(electron){
      var win = electron.remote.getCurrentWindow();
      win.removeAllListeners('close');
      win.removeAllListeners("focus");
      var layout = this.getLayoutInfo();

      window.onbeforeunload = (e) => {
        // fire event. close panel
        this.panelMng.fireClosePanel({id:this.pageId, uniqueId:this.uniqueId, reason:{closeReason:'movedInSide', panelParams:this.params}});
        
        this.panelMng.importWindow(this.pageId, layout);
      }

      win.close();
    }
  }

  /**
   *  MDI内部画面を外にポップアップさせる。
   *  export window
   */
  public exportWindow(){
    var layout = this.getLayoutInfo();
    var $pnl   = $(this.element.nativeElement).find('.panel');
    let width  = $pnl.outerWidth();
    let height = $pnl.outerHeight();
    var pos    = layout.position;

    this.params.layout = layout;
    this.params.left = 0;
    this.params.top = 0;

    this.panelMng.exportWindow(this.pageId, null, null, width, height, this.params, this.uniqueId);

  }

  /**
   * close screen window.
   */
  public close( ){
    this.panelMng.closePanel({id:this.pageId, uniqueId:this.uniqueId, reason:{closeReason:'panelClosed', panelParams:this.params}});

    if( this.isExternalWindow() ){
      electron.remote.getCurrentWindow().close();
    }

    // this.updateView();
  }

  /**
   * panel"↓"のイベント
   */
  public minisize(){
    if(this.isExternalWindow()){
      if(electron){
        electron.remote.getCurrentWindow().minimize();
      }
    }else{
     this.panelMng.behavePanelTouch( this.uniqueId );
    }
  }

  /**
   * panel □ 最大化イベント
   *
   * @param fixedWidth 幅固定の場合 true
   */
  public maximize(fixedWidth:boolean=false){
    if(this.isExternalWindow()){
      // フレーム外に表示中
      if(electron){
        var cur = electron.remote.getCurrentWindow();
        this.detectResize.bySide = 0;
        if( cur ){
          if( cur.isMaximized()){
            cur.unmaximize();
          }else{
            cur.maximize();
          }
        }
      }
    } else {
      // フレーム内に表示中
      const $pnl = $($(this.element.nativeElement).find('.panel')[0]);

      if (this.rectInfoBeforeMaxmized.maximized) {
        // 元に戻す
        $pnl.width(this.rectInfoBeforeMaxmized.width);
        $pnl.height(this.rectInfoBeforeMaxmized.height);

        this.element.nativeElement.children[0].style.transform = (`translate3d(${(this.rectInfoBeforeMaxmized.left)}px, ${(this.rectInfoBeforeMaxmized.top)}px, 0)`);
        this.rectInfoBeforeMaxmized.maximized = false;
        this.params.left = this.rectInfoBeforeMaxmized.left;
        this.params.top = this.rectInfoBeforeMaxmized.top;

      } else {
        // 初期位置・サイズ保存
        const trans = this.element.nativeElement.children[0].style.transform.replace('translate3d(', '').replace(')', '');
        if (trans.length > 0) {
          const pos = trans.split(',');
          this.rectInfoBeforeMaxmized.left = Number(pos[0].replace('px', ''));
          this.rectInfoBeforeMaxmized.top =  Number(pos[1].replace('px', ''));
        }
        this.rectInfoBeforeMaxmized.width = $pnl.width();
        this.rectInfoBeforeMaxmized.height = $pnl.height();

        // 最大化する
        const mdiArea = document.getElementsByTagName('mdi-area');
        const footerArea = document.getElementsByTagName('footer');
        const menuBar = document.getElementsByTagName('menu-bar');
        const menuBarAmnt = document.getElementsByTagName('menu-bar-amount');
        const h = $(mdiArea).height() - $(footerArea).find('.footer').height() - $(menuBar).find('.navbar.navbar-menu').height() - $(menuBarAmnt).find('.navbar.navbar-amount').height() - 2;
        let left = 0;

        $pnl.height(h);

        if (fixedWidth) {
          //幅固定の場合
          left = this.rectInfoBeforeMaxmized.left;
        } else {
          //縦横最大化の場合
          $pnl.width($(mdiArea).width() - 2);
        }

        this.element.nativeElement.children[0].style.transform = (`translate3d(${(left)}px, 0, 0)`);
        this.rectInfoBeforeMaxmized.maximized = true;
        if(!fixedWidth) {
          this.params.left = 0;
        }
        this.params.top = 0;
      }
      this.onResizing()
    }
  }

  /**
   * make drag image
   */
  protected makeDrageImage(dragTxt: string) {
    let canvas = this.dragCanvas.nativeElement;
    let ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.font= this.dragNdrop_font;
    let rect = ctx.measureText(this.dragNdrop_txt);
    canvas.width = rect.width + (rect.width / 4);
    ctx.fillStyle = this.dragNdrop_background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = this.dragNdrop_txtcolor;
    ctx.textAlign = 'center';
    ctx.font= this.dragNdrop_font;
    ctx.fillText(dragTxt, canvas.width / 2, 20);

    // ctx.fillStyle = gradient;
    this.dragNdrop_img.width = canvas.width;
    this.dragNdrop_img.height = canvas.height;
    this.dragNdrop_img.src = canvas.toDataURL();
  }

  /**
   * make drag text
   */
  protected makeDragText() {
    this.dragNdrop_txt = '[' + this.dragNdrop_data.symbol + ']' + this.dragNdrop_data.symbolName;
  }

  /**
   * 外だしウィンドウなのかチェックする。
   */
  public isExternalWindow(){
    return this.panelMng.isExternalWindow();
  }

  public isWin32(){
    var electron = (window as any).electron;

    if( electron ){
      return electron.remote.process.platform !== 'darwin';
    }

    return false;
  }

  /**
   * resize detect form element
   */
  private detectResizeElement(){
    this.detectResize.resizeDetector = new ResizeDetector(this.detectResize.$body, ()=>{
      this.resizeWindowByElement();
    });
  }

  /**
   * resize detector from window
   */
  private detectResizeWindow(){
    this.detectResize.browser.on('resize', (e)=>{
      if(this.detectResize.browser.isResizable()){
        setTimeout(() => {
          if(this.detectResize.bySide == BY_ELEMENT){
            this.detectResize.bySide = 0;
            return;
          }

          var pos = this.detectResize.browser.getSize();

          if( !this.detectResize.browser.isMinimized()){
            // change element's size
            this.detectResize.bySide = BY_WINDOW;        
            this.width = pos[0];
            this.height = pos[1];
          }
    
          this.onResizing();
        }, 0);
      }else{
        // change browser size
        var wdt = this.detectResize.$panel.outerWidth();
        var hgt = this.detectResize.$panel.outerHeight();

        this.detectResize.browser.setSize(wdt, hgt);        
      }
    });
  }

  /**
   * if resized element. then resize window.
   */
  private resizeWindowByElement(){
    if(this.detectResize.bySide == BY_WINDOW){
      this.detectResize.bySide = 0;
      return;
    }

    this.detectResize.bySide = BY_ELEMENT;
    // change browser size
    var wdt = this.detectResize.$panel.outerWidth();
    var hgt = this.detectResize.$panel.outerHeight();

    this.detectResize.browser.setSize(wdt, hgt);
  }

  /**
   * set external window min & max size
   */
  private initBrowserMinMax(){
    let ele = this.element.nativeElement.children[0]; // panel element
    let win = this.detectResize.browser;
    let minWdt, minHgt;
    let maxWdt, maxHgt;

    if(ele){
      minWdt = $(ele).css('min-width');
      maxWdt = $(ele).css('max-width');
      minHgt = $(ele).css('min-height');
      maxHgt = $(ele).css('max-height');

      minWdt = parseInt(minWdt.replace('px',''));
      maxWdt = parseInt(maxWdt.replace('px',''));
      minHgt = parseInt(minHgt.replace('px',''));
      maxHgt = parseInt(maxHgt.replace('px',''));

      minWdt = isNaN(minWdt)?CommonConst.PANEL_SIZE_MIN:minWdt;
      minHgt = isNaN(minHgt)?CommonConst.PANEL_SIZE_MIN:minHgt;
      maxWdt = isNaN(maxWdt)?CommonConst.PANEL_SIZE_MAX:maxWdt;
      maxHgt = isNaN(maxHgt)?CommonConst.PANEL_SIZE_MAX:maxHgt;

      win.setMinimumSize(minWdt, minHgt);
      win.setMaximumSize(maxWdt, maxHgt);
    }
  }

  /**
   *  OVERRIDE FUNCTION
   *
   *  派生クラスは super.getLayoutInfo()を忘れないように。
   */
  public getLayoutInfo():values.ILayoutInfo{
    var layout:values.ILayoutInfo={position:{}};
    var $pnl = $(this.element.nativeElement).find('.panel');

    layout.windowId = this.pageId;
    layout.external = this.isExternalWindow();

    // get panel options
    if( this.params ){
      layout.position.x = this.params.left?this.params.left:0;
      layout.position.y = this.params.top?this.params.top:0;
    }

    if(layout.external){
      // external window.
      var $div = $(this.element.nativeElement).find('.gw-resizeable');
      if($div.length > 0 && this.params){
        layout.position.width = this.params.width;
        layout.position.height = this.params.height;
      }
    }else{      
      // inner panel width
      var $div = $(this.element.nativeElement).find('.gw-resizeable-e');
      if($div.length > 0){
        layout.position.width  = $pnl.outerWidth();
      }

      // inner panel height
      $div = $(this.element.nativeElement).find('.gw-resizeable-s');
      if($div.length > 0){
        layout.position.height = $pnl.outerHeight();
      }
    }

    return layout;
  }

  /**
   * リサイズ処理がある場合はoverrideする
   */
  public onResizing($event=null) {
    // dummy
  }

  public isMaximized():boolean {
    return this.rectInfoBeforeMaxmized.maximized;
  }
}
