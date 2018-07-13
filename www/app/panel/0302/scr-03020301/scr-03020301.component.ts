/**
 *
 * 注文詳細
 *
 */
import { Component, ElementRef,ViewChild,Input,AfterViewInit,ChangeDetectorRef } from '@angular/core';
import { PanelManageService, BusinessService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips } from '../../../core/common';
import { IReqOrderDetail, IResOrderDetail} from "../../../values/Values";
import { orderDetailComponent } from '../../../component/orderDetail/orderDetail.component';
import { ILayoutInfo } from "../../../values/Values";
//-----------------------------------------------------------------------------
// COMPONENT : Scr03020301Component
// ----------------------------------------------------------------------------

const electron = (window as any).electron;

declare var $:any;
@Component({
  selector: 'scr-03020301',
  templateUrl: './scr-03020301.component.html',
  styleUrls: ['./scr-03020301.component.scss']
})
export class Scr03020301Component extends PanelViewBase implements AfterViewInit  {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
    public gridObj1;
    public gridObj2;
    public gridObj3;
    public gridObj4;
    public orderKey = "";
    public disableScrollDown;
    private subscrip:any;

    private INIT_PANEL_HEIGHT = 548;

    @ViewChild('scrollMe') private myScrollContainer: ElementRef;
    @ViewChild('orderDetail') orderDetail: orderDetailComponent;

    ngAfterViewInit() {
        super.ngAfterViewInit();

        //初期サイズがデフォルト画面高さ以上の場合、最適な高さを設定する
        setTimeout(()=>{
          this.onResizing(null);
        }, 300);
    }


    //---------------------------------------------------------------------------
    // constructor
    // --------------------------------------------------------------------------
    constructor(public screenMng: PanelManageService,
        public business: BusinessService,
        public element: ElementRef,
        public changeRef: ChangeDetectorRef) {
        super('03020301', screenMng, element, changeRef);
        this.subscrip = screenMng.onChannelEvent().subscribe(val => {
            if (val.channel == 'orderDetail') {
                this.orderKey = val.arg.orderJointId;
                this.orderDetail.orderDetailTrSend(this.orderKey);
                if(this.isExternalWindow()) { // SDIの場合
                  if(electron){
                    let win = electron.remote.getCurrentWindow();
                    if(win.isMinimized()) {
                      win.restore();
                    }
                    else {
                      win.focus();
                    }
                  }
                }
                else {
                  this.panelMng.panelFocus(this.uniqueId);
                }
            }
        });
    }

    protected initLayout(param: any) {
        super.initLayout(param);
        if (param.layout && param.layout.option && param.layout.option.orderKey) {
            this.orderKey = param.layout.option.orderKey;
        }
        this.orderDetail.orderDetailTrSend(this.orderKey);
        this.panelMng.panelFocus(this.uniqueId);
    }

    public getLayoutInfo(): ILayoutInfo {
        let layout = super.getLayoutInfo();
        layout.option = {};
        layout.option.orderKey = this.orderKey;
        return layout;
    }

  ngAfterViewChecked() {
      this.scrollToBottom();
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    this.subscrip.unsubscribe();
  }

  private onScroll() {
      let element = this.myScrollContainer.nativeElement
      let atBottom = element.scrollHeight - element.scrollTop === element.clientHeight
      if (this.disableScrollDown && atBottom) {
          this.disableScrollDown = false
      } else {
          this.disableScrollDown = true
      }
  }

  private scrollToBottom(): void {
      if (this.disableScrollDown) {
          return
      }
      try {
          this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
      } catch(err) { }
  }

  ngOnInit() {
      super.ngOnInit();
      this.orderKey = this.params.orderJointId ? this.params.orderJointId : "";
  }

  onResizing($event){
    super.onResizing();
    const panel = $(this.element.nativeElement).find('.panel');
    const navHeight = panel.find('.nav').outerHeight();
    const footerHeight = panel.find('.row.row-footer').outerHeight();
    const resizedTableHeight = panel.height() - navHeight - footerHeight;
    panel.find('.tables').height(resizedTableHeight);
  }

  public close(){
      super.close();
  }

  public getTitle(){
      let title = super.title();
      let start = this.orderKey.length - 4;

      this.updateView();
      
      return title + "[" + this.orderKey.substring(start) + "]";
  }
  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
}
