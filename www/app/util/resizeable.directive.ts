import { Directive, Input, ElementRef, HostListener, EventEmitter, Renderer, OnInit, Output} from '@angular/core';
import { PanelManageService, PanelViewBase, CommonConst } from '../core/common';

declare var $:any;
declare var _: any;

const DIRECTION = {
  south : 0x01,
  west  : 0x02,
  east  : 0x04,
  north : 0x08,
  southeast : 0x05,
  southwest : 0x03,
  northeast : 0x0c,
  northwest : 0x0a
}

@Directive({
  selector: '[ng2-resizeable]'
})
export class Resizeable implements OnInit{
  topStart:number=0;
  leftStart:number=0;

  left:number=0;
  top:number=0;
  height:number=0;
  width:number=0;

  minWidth;
  maxWidth;
  minHeight;
  maxHeight;

  containerHeight;

  direction:number=0;
  panel:PanelViewBase = null;

  md:boolean;
  // agHeight:number=0;
  // agWidth:number=0;
  // panelName:string;

  private bindMouseUp;
  private bindMouseMove;

  @Input('resizeable') _resizeable = "both";

  @Output() resized = new EventEmitter();
  @Output() resizing = new EventEmitter();

  constructor(public element: ElementRef,
              public panelMng:PanelManageService) {

  }

  /**
   *
   */
  ngOnInit(){
    if(!this.isExternalWindow() || !this.isPanelElement()){
      // 内部画面
      this.initInnerPanel();
    }else{
      // 外部画面
      this.initExternalPanel();
    }
  }

  ngOnDestroy(){
    this.panel = null;
  }

  /**
   * 外だしウィンドウなのかチェックする。
   */
  private isExternalWindow(){
    var win = window as any;
    var param = win.electron?win.electron.parameter?win.electron.parameter:null:null;

    return param?param.panelId?true:false:false;
  }

  /**
   * パネルID命名規則に一致しない場合は内部エレメント。
   */
  private isPanelElement(){
    let parentId = this.element.nativeElement.parentElement.id;

    return /^_window([0-9])+-scrid_([0-9])+/.test(parentId);
  }

  /**
   * 外だし画面の場合初期化
   */
  private initExternalPanel(){
    // create dumy element.
    var ele = document.createElement("div");
    var win = window as any;

    ele.className = 'gw-resizeable';
    this.element.nativeElement.appendChild( ele );

    // if(win.electron){
    //   let browser = win.electron.remote.getCurrentWindow();
    //   browser.on('resize', (e)=>{
    //     setTimeout(() => {
    //       this.riseEvent_resizing();          
    //     }, 10);
    //   });
    // }
  }

  /**
   * 内部画面の場合初期化
   */
  private initInnerPanel(){
    // 上下リサイズ
    if(this._resizeable == "both" || this._resizeable == "height"){
      var ele_s = document.createElement("div");
      var ele_n = document.createElement("div");

      ele_s.className = 'gw-resizeable gw-resizeable-s';
      ele_n.className = 'gw-resizeable gw-resizeable-n';
      this.element.nativeElement.appendChild( ele_s );
      this.element.nativeElement.appendChild( ele_n );

      ele_s.addEventListener('mousedown',(e)=>{
        this.startResize( DIRECTION.south, e);
      });
      ele_n.addEventListener('mousedown',(e)=>{
        this.startResize( DIRECTION.north, e);
      });
    }

    // 左右リサイズ
    if(this._resizeable == "both" || this._resizeable == "width"){
      var ele_e = document.createElement("div");
      var ele_w = document.createElement("div");

      ele_e.className = 'gw-resizeable gw-resizeable-e';
      ele_w.className = 'gw-resizeable gw-resizeable-w';
      this.element.nativeElement.appendChild( ele_e );
      this.element.nativeElement.appendChild( ele_w );

      ele_e.addEventListener('mousedown',(e)=>{
        this.startResize( DIRECTION.east, e);
      });
      ele_w.addEventListener('mousedown',(e)=>{
        this.startResize( DIRECTION.west, e);
      });
    }

    // 両方向リサイズ
    if(this._resizeable == "both"){
      var ele_se = document.createElement("div");
      var ele_sw = document.createElement("div");
      var ele_nw = document.createElement("div");
      var ele_ne = document.createElement("div");

      ele_se.className = 'gw-resizeable gw-resizeable-se';
      ele_sw.className = 'gw-resizeable gw-resizeable-sw';
      ele_nw.className = 'gw-resizeable gw-resizeable-nw';
      ele_ne.className = 'gw-resizeable gw-resizeable-ne';
      this.element.nativeElement.appendChild( ele_se );
      this.element.nativeElement.appendChild( ele_sw );
      this.element.nativeElement.appendChild( ele_nw );
      this.element.nativeElement.appendChild( ele_ne );

      ele_se.addEventListener('mousedown',(e)=>{
        this.startResize( DIRECTION.southeast, e);
      });
      ele_sw.addEventListener('mousedown',(e)=>{
        this.startResize( DIRECTION.southwest, e);
      });
      ele_nw.addEventListener('mousedown',(e)=>{
        this.startResize( DIRECTION.northwest, e);
      });
      ele_ne.addEventListener('mousedown',(e)=>{
        this.startResize( DIRECTION.northeast, e);
      });
    }

    this.element.nativeElement.style.position = 'absolute';

    // set panel instance
    var id = this.element.nativeElement.parentNode.id;
    var inst = this.panelMng.getPanel(id);

    if( inst != null ){
      this.panel = inst.instance;
    }
  }

  /**
   * リサイズをスタートする。
   *
   * @param direction
   * @param event
   */
  public startResize( type, event){
    if(event.button === 2)
      return; // prevents right click drag, remove his if you don't want it

    this.direction=type;
    this.md = true;
    this.leftStart = event.clientX;
    this.topStart = event.clientY;

    if(this.panel){
      this.left   = (this.panel.left)?this.panel.left:0;
      this.top    = (this.panel.top)?this.panel.top:0;
    }
    this.width  = this.element.nativeElement.offsetWidth;
    this.height = this.element.nativeElement.offsetHeight;

    this.minWidth  = Number($(this.element.nativeElement).css('min-width').replace('px',''));
    this.maxWidth  = Number($(this.element.nativeElement).css('max-width').replace('px',''));
    this.minHeight = Number($(this.element.nativeElement).css('min-height').replace('px',''));
    this.maxHeight = Number($(this.element.nativeElement).css('max-height').replace('px',''));

    this.minWidth  = isNaN(this.minWidth)?100:this.minWidth;
    this.maxWidth  = isNaN(this.maxWidth)?10000:this.maxWidth;
    this.minHeight = isNaN(this.minHeight)?100:this.minHeight;
    this.maxHeight = isNaN(this.maxHeight)?10000:this.maxHeight;

    // set capture mouse event
    this.bindMouseUp = _.bind(this.onMouseUp,this);
    this.bindMouseMove = _.bind(this.onMouseMove,this);

    $(document).bind( 'mouseup', this.bindMouseUp);
    $(document).bind( 'mousemove', this.bindMouseMove);

    // container height
    let $container = $("mdi-area");
    if ($container.length > 0) {
      let offset = $container.offset();
      this.containerHeight = $container.height() - offset.top - 24;
    }
  }

  /**
   * MouseUP：リサイズ完了
   *
   * @param event
   */
  private onMouseUp(event:MouseEvent) {
    if( this.md == true ){
      this.md = false;

      // release capture mouse event
      $(document).unbind( 'mouseup', this.bindMouseUp);
      $(document).unbind( 'mousemove', this.bindMouseMove);

      // resize完了のイベント発生
      var evt = document.createEvent('Event');
      evt.initEvent( 'resized', false, true );

      this.resized.emit( evt );
    }
  }

  /**
   * MouseMove：リサイズ中
   *
   * @param event
   */
  private onMouseMove(event:MouseEvent) {
    if( this.md ){
      // 下側リサイズ
      if( this.direction & DIRECTION.south ){
        let modify = event.clientY - this.topStart;

        this.setHeight( this.height + modify );
      }
      // 上側リサイズ
      if( this.direction & DIRECTION.north ){
        let modify = event.clientY - this.topStart;

        modify = (this.top + modify < 0 )?-this.top:modify;

        if(this.setHeight( this.height - modify )){
          this.setTop( this.top + modify );
        }
      }

      // 右側リサイズ
      if( this.direction & DIRECTION.east ){
        let modify = event.clientX - this.leftStart;

        this.setWidth( this.width + modify );
      }
      // 左側リサイズ
      if( this.direction & DIRECTION.west ){
        let modify = event.clientX - this.leftStart;

        modify = (this.left + modify < 0 )?-this.left:modify;
        
        if(this.setWidth( this.width - modify )){
          this.setLeft( this.left + modify );
        }
      }

      this.riseEvent_resizing();
    }
  }

  private riseEvent_resizing(){
    // resizingのイベント発生
    var evt = document.createEvent('Event');
    evt.initEvent( 'resizing', false, true );

    this.resizing.emit( event );
  }

  private setTop( top:number ){
    if( this.panel ){
      this.panel.top = top;
    }else{
      this.element.nativeElement.style.top = top + 'px';
    }
  }

  private setLeft( left:number ){
    if( this.panel ){
      this.panel.left = left;
    }else{
      this.element.nativeElement.style.left = left + 'px';
    }
  }

  private setWidth( width:number ){
    if (width >= this.minWidth && width <= this.maxWidth
      && (this.panel.left + width) >= CommonConst.FORBIDDEN_DISTANT) {
      if( this.panel ){
        this.panel.width = width;
      }else{
        this.element.nativeElement.style.width = width + 'px';
      }
      return true;
    }

    return false;
  }

  private setHeight( height:number ){
    let top = this.getTop();
    // limited container element's height
    if(this.containerHeight < height + top){
      height = this.containerHeight - top;
    }

    if(height >= this.minHeight && height <= this.maxHeight){
      if( this.panel ){
        this.panel.height = height;
      }else{
        this.element.nativeElement.style.height = height + 'px';
      }
      return true;
    }

    return false;
  }

  private getTop(){
    let top = 0;
    if( this.panel ){
      top = this.panel.top;
    }else{
      top = this.element.nativeElement.style.top.replace('px', '');
    }
    return Number(top);
  }

  // @HostListener('touchstart', ['$event'])
  // onTouchStart(event:TouchEvent) {
  //   this.md = true;
  //   this.topStart = event.changedTouches[0].clientY - this._dragTarget.style.top.replace('px','');
  //   this.leftStart = event.changedTouches[0].clientX - this._dragTarget.style.left.replace('px','');
  //   event.stopPropagation();
  // }

  // @HostListener('document:touchend')
  // onTouchEnd() {
  //   this.md = false;
  // }

  // @HostListener('document:touchmove', ['$event'])
  // onTouchMove(event:TouchEvent) {
  //   if(this.md && this._allowDrag){
  //     this._dragTarget.style.top = ( event.changedTouches[0].clientY - this.topStart ) + 'px';
  //     this._dragTarget.style.left = ( event.changedTouches[0].clientX - this.leftStart ) + 'px';
  //   }
  //   event.stopPropagation();
  // }

  // @Input('drag-target')
  // set dragTarget(target:any){
  //   this._dragTarget = target;
  // }
}
