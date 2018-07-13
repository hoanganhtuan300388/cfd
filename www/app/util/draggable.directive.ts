import { Directive, Input, ElementRef, HostListener, Renderer, OnInit, EventEmitter, Output } from '@angular/core';
import { PanelManageService, PanelViewBase, CommonConst } from '../core/common';

declare var $: any;
declare var _: any;

// マグネット距離
const MAGNET_DISTANT = 10;

class RECT{
  left:number;
  top:number;
  right:number;
  bottom:number;
}

class MOVED {
  isLeftMoved:boolean;
  isTopMoved:boolean;
  isRightMoved:boolean;
  isBottomMoved:boolean;
}

@Directive({
  selector: '[ng2-draggable]'
}) 
export class Draggable implements OnInit {
  topStart: number = 0;
  leftStart: number = 0;
  panel:PanelViewBase = null;
  md: boolean = false;
  _allowDrag: boolean = true;
  _dragTarget: any = null;
  _aniComplete: boolean = true;

  private _parentArea:any;

  private bindMouseUp;
  private bindMouseMove;

  private mdiAreaRect:RECT;

  private focusDiv:HTMLElement;

  private dynamicHtmlRect:RECT[];

  private draggableArea:RECT;

  @Output() moved = new EventEmitter();

  constructor(public element: ElementRef,
              public panelMng:PanelManageService) {

  }

  ngOnInit() {
    this.element.nativeElement.className += ' cursor-draggable';

    // css changes
    if (this._allowDrag && this._dragTarget ) {
      this._dragTarget.style.position = 'absolute';
      this._dragTarget.style.transform = 'translate3d(0, 0, 0)';
    }
  }

  ngOnDestroy(){
    this.panel = null;
  }

  private getMaskOffset( area:any ){
    var width = 0;
    var height = 0;
    var top = 0;

    for( var i=0; i < area.length; i++ ){
      var element = area[i] as HTMLElement;
      top = Math.max( top, element.offsetTop );
      width = Math.max( width, element.offsetWidth );
      height = Math.max( height, element.offsetHeight );
    }

    return {top:top, width:width, height:height};
  }

  private MagnetRect(x, y, event: MouseEvent):boolean{
    var rtn = false;

    if (this.md && this._allowDrag) {
      var rect = new RECT()
      var pos_y = event.clientY - this.topStart;

      if( this._parentArea ){
        if (event.clientX <= 0 || event.clientX >= this._parentArea.width) {
          return;
        }
        if (event.clientY <= this._parentArea.top || event.clientY >= this._parentArea.height) {
          return;
        }
      }

      if(this.element.nativeElement.parentElement.parentElement.parentElement.id == ""){
        this.movePanel(event.clientX - this.leftStart, pos_y );
      } else {
        //マグネット補正しない場合、パネル位置をマウスに追随する。
        if(!this.magnet(event)){
          this.movePanel(event.clientX - this.leftStart, pos_y );
        }
      }

      event.preventDefault();
    }

    return rtn;
  }

  private movePanel( left:number, top:number ){
    top = Math.max(top, this.draggableArea.top);
    top = Math.min(top, this.draggableArea.bottom);
    left = Math.max(left, this.draggableArea.left);
    left = Math.min(left, this.draggableArea.right)
    if( this.panel ){
      // for Panels
      this.panel.movePanel( left, top );
    }else{
      // for dialog
      this._dragTarget.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    }
  }

  private initMdiAreaRect() {
    // 'mdi-area'の区域を算出する
    let windowDiv = document.getElementsByTagName('mdi-area');
    let footerDiv = document.getElementsByTagName('footer')[0] as HTMLElement;
    let menubar = document.getElementsByTagName('menu-bar')[0] as HTMLElement;
    let menubarAmount = document.getElementsByTagName('menu-bar-amount')[0] as HTMLElement;
    let windowDivOut = document.getElementsByClassName('panel-body');
    let panelWinDiv = windowDiv[0] as HTMLElement;
    let panelWinDivOut = windowDivOut[0] as HTMLElement;
    let rectOtherW = new RECT();

    if(panelWinDiv){
      let ltOfOtherPanelW = this.getLeftTop(panelWinDiv);
      rectOtherW.left = ltOfOtherPanelW.x;
      rectOtherW.top = ltOfOtherPanelW.y;
      rectOtherW.right = ltOfOtherPanelW.x + panelWinDiv.offsetWidth,
      rectOtherW.bottom = rectOtherW.top + panelWinDiv.offsetHeight - footerDiv.firstElementChild.clientHeight
                          - menubar.firstElementChild.clientHeight - menubarAmount.firstElementChild.clientHeight;
      this.mdiAreaRect = rectOtherW;
    }else{
      let ltOfOtherPanelW = this.getLeftTop(panelWinDivOut);//panel-body
      rectOtherW.left = ltOfOtherPanelW.x;
      rectOtherW.top = ltOfOtherPanelW.y;
      rectOtherW.right = ltOfOtherPanelW.x + panelWinDivOut.offsetWidth,
      rectOtherW.bottom = rectOtherW.top + panelWinDivOut.offsetHeight;
      this.mdiAreaRect = rectOtherW;
    }
    
    
  }

  private initDynamicHtmlRect() {
    //DIVの親NODE(Src)からIDを取得する。
    let focusPanelId:string = this.focusDiv.parentElement.id;
    
    //全パネルのDynamicHtmlを取得する。
    let panelsDH = document.getElementsByTagName('dynamic-html');
    this.dynamicHtmlRect = [];

    for(let i=0; i< panelsDH.length; i++){
      let panelSrc = panelsDH[i].firstElementChild as HTMLElement;
      //フォーカスパネルではない場合
      if(panelSrc.id != focusPanelId){
        let panelDiv = panelSrc.firstElementChild as HTMLElement;
        //パネルの区域を算出する。
        let rectOther = new RECT();
        let ltOfOtherPanel = this.getLeftTop(panelDiv);
        rectOther.left = ltOfOtherPanel.x;
        rectOther.top = ltOfOtherPanel.y;
        rectOther.right = rectOther.left + panelDiv.offsetWidth,
        rectOther.bottom = rectOther.top + panelDiv.offsetHeight
        // this.dynamicHtmlRect[i] = rectOther;
        this.dynamicHtmlRect.push(rectOther);
      }
    }
  }

  private initDraggableErea() {
    this.draggableArea = {
      left: this.mdiAreaRect.left - this.focusDiv.offsetWidth + CommonConst.FORBIDDEN_DISTANT,
      top: this.mdiAreaRect.top,
      right: this.mdiAreaRect.right - CommonConst.FORBIDDEN_DISTANT,
      bottom: this.mdiAreaRect.bottom - this.element.nativeElement.offsetHeight
    }
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
   * タイトルバーclassを持つエレメントはパネルだ。
   */
  private isPanelElement(){
    let rtn = $(this.element.nativeElement).hasClass("titlebar-draggable");
    return rtn;
  }

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (event.button === 2)
      return; // prevents right click drag, remove his if you don't want it

    // 外出したパネルエレメント
    if( this.isExternalWindow() && this.isPanelElement()){
      return;
    }

    if( this._dragTarget ){
      this.md = true;

      var str = this._dragTarget.style.transform.replace('translate3d(', '').replace(')', '');
      var left = 0;
      var top = 0;

      if (str.length > 0) {
        var pos = str.split(',');

        left = pos[0].replace('px', '');
        top = pos[1].replace('px', '');
      }

      this.leftStart = event.clientX - left;
      this.topStart = event.clientY - top;
      let area = document.getElementsByTagName('mdi-area');
      // get parent area
      if(area.length>0){
        this._parentArea = this.getMaskOffset(area);
      }else{
        let area = document.getElementsByClassName('panel-body');
        this._parentArea = this.getMaskOffset(area);
      }

      // set capture mouse event
      this.bindMouseUp = _.bind(this.onMouseUp,this);
      this.bindMouseMove = _.bind(this.onMouseMove,this);

      $(document).bind( 'mouseup', this.bindMouseUp);
      $(document).bind( 'mousemove', this.bindMouseMove);

      this.initMdiAreaRect();

      this.focusDiv = this.element.nativeElement.parentElement.parentElement;

      this.initDynamicHtmlRect();

      this.initDraggableErea();
    }
  }

  private onMouseUp(event: MouseEvent) {
    this.md = false;

    // move完了のイベント発生
    var evt = document.createEvent('Event');
    evt.initEvent( 'moved', false, true );
    this.moved.emit( evt );

    // release capture mouse event
    $(document).unbind( 'mouseup', this.bindMouseUp);
    $(document).unbind( 'mousemove', this.bindMouseMove);

    this.mdiAreaRect = new RECT();

    this.focusDiv = null;

    this.dynamicHtmlRect = [];
  }

  public onMouseMove(event: MouseEvent) {
    if(this.md){
      this.MagnetRect( event.clientX, event.clientY, event);
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.md = true;
    this.topStart = event.changedTouches[0].clientY - this._dragTarget.style.top.replace('px', '');
    this.leftStart = event.changedTouches[0].clientX - this._dragTarget.style.left.replace('px', '');
    event.stopPropagation();
  }

  @HostListener('document:touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    this.md = false;
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.md && this._allowDrag) {
      this._dragTarget.style.top = (event.changedTouches[0].clientY - this.topStart) + 'px';
      this._dragTarget.style.left = (event.changedTouches[0].clientX - this.leftStart) + 'px';
    }
    event.stopPropagation();
  }

  @Input('drag-target')
  set dragTarget(target: any) {
    if( target ){
      var id = target.parentNode.id;
      var inst = this.panelMng.getPanel(id);

      this._dragTarget = target;

      // set panel instance
      if( inst != null ){
        this.panel = inst.instance;
      }
    }
  }

  /**
   * マグネット機能
   * DIV（パネル）から左上の座標を取得する。
   * 
   * divOb:HTMLElement　DIV（パネル）エレメント
   * 戻り値：座標
   */
  private getLeftTop(divOb:HTMLElement) {
      let str = divOb.style.transform.replace('translate3d(', '').replace(')', '');
      let left = 0;
      let top = 0;

      if (str.length > 0) {
        let pos = str.split(',');

        left = Number(pos[0].replace('px', ''));
        top = Number(pos[1].replace('px', ''));
      }
      return {x:left,y:top};
  }

  /**
   * マグネット機能
   * 
   * event :MouseEvent マウスイベント
   * 戻り値：マグネットしたか
   *   TRUE:マグネットした FALSE:マグネットしない
   */
  private magnet(event: MouseEvent):boolean{
    
    //DIV（パネル）の左上の座標を取得する。
    let ltOfMovePanel = { x:event.clientX - this.leftStart, y:event.clientY - this.topStart};
    //移動中の区域を算出する。
    let rectMove = new RECT();
    rectMove.left = ltOfMovePanel.x;
    rectMove.top = ltOfMovePanel.y;
    rectMove.right =   rectMove.left + this.focusDiv.offsetWidth;
    rectMove.bottom =  rectMove.top + this.focusDiv.offsetHeight;

    let moved = new MOVED();
    let isMoved = this.doMagnet(this.mdiAreaRect, rectMove, moved);
    //補正した場合
    if (isMoved) {
      this.movePanel( rectMove.left, rectMove.top );
      return true;
    }

    for(let i=0; i< this.dynamicHtmlRect.length; i++){

      isMoved = this.doMagnet(this.dynamicHtmlRect[i], rectMove, moved);
      //補正した場合
      if(isMoved){
        this.movePanel(rectMove.left, rectMove.top);
        return true;
      }
    }
    if (moved.isBottomMoved
      || moved.isLeftMoved
      || moved.isRightMoved
      || moved.isTopMoved) {
      this.movePanel(rectMove.left, rectMove.top);
      return true;
    }
    return false;
  }

  /**
   * 参照パネル左辺がマグネットエリアに入っているかどうかを判断する。
   * @param rectRefer 参照パネル
   * @param rectMagnet マグネットエリア
   * @return 入っている:true;入っていない:false
   */
  private isLeftLineInMagnetErea(rectRefer:RECT, rectMagnet:RECT):boolean {
    return rectRefer.left >= rectMagnet.left
           && rectRefer.left <= rectMagnet.right
           && rectRefer.top <= rectMagnet.bottom
           && rectRefer.bottom >= rectMagnet.top;
  }

  /**
   * 参照パネル右辺がマグネットエリアに入っているかどうかを判断する。
   * @param rectRefer 参照パネル
   * @param rectMagnet マグネットエリア
   * @return 入っている:true;入っていない:false
   */
  private isRightLineInMagnetErea(rectRefer:RECT, rectMagnet:RECT):boolean {
    return rectRefer.right >= rectMagnet.left
           && rectRefer.right <= rectMagnet.right
           && rectRefer.top <= rectMagnet.bottom
           && rectRefer.bottom >= rectMagnet.top;
  }

  /**
   * 参照パネル上辺がマグネットエリアに入っているかどうかを判断する。
   * @param rectRefer 参照パネル上辺
   * @param rectMagnet マグネットエリア
   * @return 入っている:true;入っていない:false
   */
  private isTopLineInMagnetErea(rectRefer:RECT, rectMagnet:RECT):boolean {
    return rectRefer.top >= rectMagnet.top
           && rectRefer.top <= rectMagnet.bottom
           && rectRefer.right >= rectMagnet.left
           && rectRefer.left <= rectMagnet.right;
  }

  /**
   * 参照パネル下辺がマグネットエリアに入っているかどうかを判断する。
   * @param rectRefer 参照パネル
   * @param rectMagnet マグネットエリア
   * @return 入っている:true;入っていない:false
   */
  private isBottomLineInMagnetErea(rectRefer:RECT, rectMagnet:RECT):boolean {
    return rectRefer.bottom >= rectMagnet.top
           && rectRefer.bottom <= rectMagnet.bottom
           && rectRefer.right >= rectMagnet.left
           && rectRefer.left <= rectMagnet.right;
  }

  /**
   * フォーカスパネル左側マグネット処理
   * 
   * rectRefer:RECT 参照パネルの区域
   * rectFocus:RECT フォーカスパネルの区域
   * 戻り値：補足したかどうかフラグ
   */
  private doLeftMagnet(rectRefer:RECT, rectFocus:RECT):boolean {
    // フォーカスパネル左側マグネットエリア
    let rectFL = {
      left:   rectFocus.left - MAGNET_DISTANT,
      top:    rectFocus.top - MAGNET_DISTANT,
      right:  rectFocus.left + MAGNET_DISTANT,
      bottom: rectFocus.bottom + MAGNET_DISTANT
    };
    // 参照パネル左辺がマグネットエリアに入っている場合
    if(this.isLeftLineInMagnetErea(rectRefer, rectFL)){
      let move = rectRefer.left - rectFocus.left;
      rectFocus.left = rectRefer.left;
      rectFocus.right += move;
      return true;
    }else if (this.isRightLineInMagnetErea(rectRefer, rectFL)){
      // 参照パネル右辺がマグネットエリアに入っている場合
      let move = rectRefer.right - rectFocus.left;
      rectFocus.left = rectRefer.right;
      rectFocus.right += move;
      return true;
    }
    return false;
  };

  /**
   * フォーカスパネル右側マグネット処理
   * 
   * rectRefer:RECT 参照パネルの区域
   * rectFocus:RECT フォーカスパネルの区域
   * 戻り値：補足したかどうかフラグ
   */
  private doRightMagnet(rectRefer:RECT, rectFocus:RECT):boolean {
    // フォーカスパネル右側マグネットエリア
    let rectFR = {
      left:   rectFocus.right - MAGNET_DISTANT,
      top:    rectFocus.top - MAGNET_DISTANT,
      right:  rectFocus.right + MAGNET_DISTANT,
      bottom: rectFocus.bottom + MAGNET_DISTANT
    };
    // 参照パネル左辺がマグネットエリアに入っている場合
    if(this.isLeftLineInMagnetErea(rectRefer, rectFR)){
      let move = rectRefer.left - rectFocus.right;
      rectFocus.right = rectRefer.left;
      rectFocus.left += move;
      return true;
    }else if (this.isRightLineInMagnetErea(rectRefer, rectFR)){
      // 参照パネル右辺がマグネットエリアに入っている場合
      let move = rectRefer.right - rectFocus.right;
      rectFocus.right = rectRefer.right;
      rectFocus.left += move;
      return true;
    }
    return false;
  };

  /**
   * フォーカスパネル上側マグネット処理
   * 
   * rectRefer:RECT 参照パネルの区域
   * rectFocus:RECT フォーカスパネルの区域
   * 戻り値：補足したかどうかフラグ
   */
  private doTopMagnet(rectRefer:RECT, rectFocus:RECT):boolean {
    // フォーカスパネル上側マグネットエリア
    let rectFT = {
      left:   rectFocus.left - MAGNET_DISTANT,
      top:    rectFocus.top - MAGNET_DISTANT,
      right:  rectFocus.right + MAGNET_DISTANT,
      bottom: rectFocus.top + MAGNET_DISTANT
    };
    // 参照パネル上辺がマグネットエリアに入っている場合
    if(this.isTopLineInMagnetErea(rectRefer, rectFT)){
      let move = rectRefer.top - rectFocus.top;
      rectFocus.top = rectRefer.top;
      rectFocus.bottom += move;
      return true;
    }else if (this.isBottomLineInMagnetErea(rectRefer, rectFT)){
      // 参照パネル下辺がマグネットエリアに入っている場合
      let move = rectRefer.bottom - rectFocus.top;
      rectFocus.top = rectRefer.bottom;
      rectFocus.bottom += move;
      return true;
    }
    return false;
  };

  /**
   * フォーカスパネル下側マグネット処理
   * 
   * rectRefer:RECT 参照パネルの区域
   * rectFocus:RECT フォーカスパネルの区域
   * 戻り値：補足したかどうかフラグ
   */
  private doBottomMagnet(rectRefer:RECT, rectFocus:RECT):boolean {
    // フォーカスパネル下側マグネットエリア
    let rectFT = {
      left:   rectFocus.left - MAGNET_DISTANT,
      top:    rectFocus.bottom - MAGNET_DISTANT,
      right:  rectFocus.right + MAGNET_DISTANT,
      bottom: rectFocus.bottom + MAGNET_DISTANT
    };
    // 参照パネル上辺がマグネットエリアに入っている場合
    if(this.isTopLineInMagnetErea(rectRefer, rectFT)){
      let move = rectRefer.top - rectFocus.bottom;
      rectFocus.bottom = rectRefer.top;
      rectFocus.top += move;
      return true;
    }else if (this.isBottomLineInMagnetErea(rectRefer, rectFT)){
      // 参照パネル下辺がマグネットエリアに入っている場合
      let move = rectRefer.bottom - rectFocus.bottom;
      rectFocus.bottom = rectRefer.bottom;
      rectFocus.top += move;
      return true;
    }
    return false;
  };

  /**
   * フォーカスパネルマグネット処理
   * 
   * rectRefer:RECT 参照パネルの区域
   * rectFocus:RECT フォーカスパネルの区域
   * moved:MOVED 補足フラグ
   * 戻り値：完全に補足したかどうかフラグ
   */
  private doMagnet(rectRefer:RECT, rectFocus:RECT, moved:MOVED):boolean {

    moved.isLeftMoved = moved.isLeftMoved ? moved.isLeftMoved : this.doLeftMagnet(rectRefer, rectFocus);
    if (moved.isLeftMoved) {
      moved.isTopMoved = moved.isTopMoved ? moved.isTopMoved : this.doTopMagnet(rectRefer, rectFocus);
      if (!moved.isTopMoved) {
        moved.isBottomMoved = moved.isBottomMoved ? moved.isBottomMoved : this.doBottomMagnet(rectRefer, rectFocus);
      }
      return moved.isTopMoved || moved.isBottomMoved;
    } else {
      moved.isRightMoved = moved.isRightMoved ? moved.isRightMoved : this.doRightMagnet(rectRefer, rectFocus);
      moved.isTopMoved = moved.isTopMoved ? moved.isTopMoved : this.doTopMagnet(rectRefer, rectFocus);
      if (!moved.isTopMoved) {
        moved.isBottomMoved = moved.isBottomMoved ? moved.isBottomMoved : this.doBottomMagnet(rectRefer, rectFocus);
      }
      return moved.isRightMoved && (moved.isTopMoved || moved.isBottomMoved);
    }
  };
}

