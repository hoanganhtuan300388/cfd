/**
 *
 * レート一覧
 *
 */
import { Component, ElementRef, ViewChild, ChangeDetectorRef  } from '@angular/core';
import { BusinessService, ResourceService, PanelManageService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips } from '../../../core/common';
import { MessageBox } from '../../../util/utils';
import { PriceListComponent } from '../../../component/price-list/price-list.component';
import { PriceWatchComponent } from '../../../component/price-watch/price-watch.component';
import { SymbolCfdComponent } from '../../../ctrls/symbol-cfd/symbol-cfd.component';
import { IResconversionRate, IProductInfo, IResWatchList, ILayoutInfo } from "../../../values/Values";
import { SetSelectd } from '../../../util/commonUtil';
import { setInterval, clearInterval } from 'timers';

import { ERROR_CODE } from "../../../../../common/businessApi";
import { Messages, } from '../../../../../common/message';

declare var $:any;

//-----------------------------------------------------------------------------
// COMPONENT : Scr03030100Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030100',
  templateUrl: './scr-03030100.component.html',
  styleUrls: ['./scr-03030100.component.scss']
})
export class Scr03030100Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  @ViewChild('PriceList') priceListComponent: PriceListComponent;
  @ViewChild('PriceWatch') priceWatchComponent: PriceWatchComponent;
  @ViewChild('SymbolCfd') symbolCfdComponent: SymbolCfdComponent

  public addTitleBarId:string = 'title-bar-add-content';
  public watchType:number;
  public tabType:number;

  public pageSize:number = 20;
  public currPage:number = 1;
  public totalPage:number = 1;

  public watshList:string[];
  public resWatch:IResWatchList;

  public loaded:boolean = false;

  public WATCH_BUTTON:string = Tooltips.WATCH_BUTTON;
  public WATCH_LIST:string = Tooltips.WATCH_LIST;
  public WATCH_PANEL:string = Tooltips.WATCH_PANEL;

  private subscrib:any;
  private layoutInfo:any = {};
  private initLayoutInfo:any = {};
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService
               ,public element:ElementRef
               ,public business:BusinessService
               ,public resource:ResourceService
               ,public changeRef:ChangeDetectorRef ) {
    super( '03030100', screenMng, element, changeRef);
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  protected initLayout(param:any){
    super.initLayout(param);
    let layout = param.layout as ILayoutInfo;
    let option = null;
    if(layout && layout.option){
      if(layout.option.colOption){
        this.initLayoutInfo = JSON.parse(layout.option.colOption.replace(/'/g, "\""));
      }
      option = layout.option;
    }
    let tab = this.resource.getRateListTabTypeSelected();
    // console.log(tab);
    if (tab.tabType == -1 || !tab.tabType) {
      if (option) {
        if (option.tabType == 0 && option.watchType == 0) {
          this.getWatchList();
        } else {
          this.tabType = option.tabType;
          this.watchType = option.watchType;
          this.updateView();
        }
      } else {
        if(tab.watchType == 0 || Number(tab.watchType) == 0) {
          this.tabType = 0;
          this.watchType = 0;
          this.getWatchList();
        }
        else {
          this.tabType = 0;
          this.watchType = 1;
          this.updateView();
        }        
      }
    } else {
      if (option) {
        if (option.tabType == 0 && option.watchType == 0) {
          this.getWatchList();
        } else {
          this.tabType = option.tabType;
          this.watchType = option.watchType;
          this.updateView();
        }
      } else {
        if (tab.tabType == 0 && tab.watchType == 0) {
          this.getWatchList();
        } else {
          this.tabType = tab.tabType;
          this.watchType = tab.watchType;
          this.updateView();
        }
      }
    }
  }
  
  ngOnDestroy() {
    super.ngOnDestroy();
    if(!this.tabType || (Number(this.tabType) == 0))
      this.tabType = 0;
    if(!this.watchType)
      this.watchType = 0;
    this.watchType = Number(this.watchType);
    this.resource.setRateListTabTypeSelected({tabType:this.tabType, watchType:this.watchType});
  }

  ngAfterViewInit(){
    super.ngAfterViewInit();
    $(this.element.nativeElement).find(".panel-rate-list").on("keydown",(e:KeyboardEvent)=>{
        if (this.priceListComponent) {
          SetSelectd(e,this.priceListComponent.grid,this.priceListComponent.seletedIndex);
        }
    })
  }

  /**
   * override function.
   *
   * 画面が最小化から復元された際、呼び出される。
   */
  public onPanelRestored(){
    super.onPanelRestored();

    if(this.priceListComponent){
      this.priceListComponent.onPanelRestored();
    }
  }

  private getWatchList(updateTabType:boolean=true){
    if (!this.subscrib) {
      this.subscrib = this.business.getWatchList().subscribe(val=>{
        if(val.status == ERROR_CODE.OK){
          this.resWatch = val;
          if (updateTabType) {
            if(this.resWatch.result.watchList.length != 0){
              this.tabType = 0;
            } else {
              this.tabType = 1;
            }
          }
          if(!this.watchType)
            this.watchType = 0;
          this.updateView();
        } 
        // else if(val.status == ERROR_CODE.WARN) {
        //   MessageBox.info({title:'ウォッチリスト取得エラー', message:Messages.ERR_0006});
        // }
        else if(val.status == ERROR_CODE.NG) {
          MessageBox.info({title:'ウォッチリスト取得エラー', message:(Messages.ERR_0006 + '[CFDS2101T]')});
        }        
      },
      err=>{
        switch(err.status) {
          case ERROR_CODE.NETWORK:
            MessageBox.info({title:'ウォッチリスト取得エラー', message:(Messages.ERR_0002 + '[CFDS2102C]')});
            break;
        }
      });
    }
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public onClickWatchBtn($event:Event){
    this.symbolCfdComponent.onSearch($event);
    this.updateView();
  }

  public onChangeSymbol($event:Event){
    var symbol = $event["selected"];
    let cfdProductCode = symbol.symbolCode;
    if(this.priceListComponent) this.priceListComponent.addWatchList(cfdProductCode);
    if(this.priceWatchComponent) this.priceWatchComponent.addWatchList(cfdProductCode);
  }

  public onSelectedTab(tab:number){
    this.totalPage = 1;
    if (tab == 0) {
      this.getWatchList(false);
    }
    this.updateView();
  }

  public onPrevPage($event:Event){
    if (this.currPage > 1) {
      this.currPage--;
      if(this.priceListComponent) this.priceListComponent.setPage(this.currPage);
      if(this.priceWatchComponent) this.priceWatchComponent.setPage(this.currPage);
    }
  }

  public onNextPage($event:Event){
    if (this.currPage < this.totalPage) {
      this.currPage++;
      if(this.priceListComponent) this.priceListComponent.setPage(this.currPage);
      if(this.priceWatchComponent) this.priceWatchComponent.setPage(this.currPage);
    }
  }

  public onResizing($event:Event){
    super.onResizing();
    if(this.priceListComponent) this.priceListComponent.resize(this.params);
    // メイン画面内用
    if($('div').hasClass('navbar-menu')){
      if(this.priceWatchComponent) this.priceWatchComponent.resize(this.params);
    }

  }
  public  onResized($event:Event){
    // メイン画面内用
    if($('div').hasClass('navbar-menu')){
      if(this.priceWatchComponent) this.priceWatchComponent.resized(this.params);
    }
    
  }

  public onChangeViewChild(param:any){
    // console.log("onChangeViewChild");
    // console.log(param);
    switch(param.type){
      case 'page' :
        let pageInfo = param.pageInfo;
        this.totalPage = pageInfo.totalPage || 1;
        this.currPage = pageInfo.currentPage || 1;
        this.updateView();
        break;
      case 'loading' :
        this.loaded = param.loaded;
        this.updateView();
        // console.log("screen loaded");
        break;
      case 'layout' :
        this.layoutInfo[this.tabType] = param.layout;
        this.initLayoutInfo[this.tabType] = this.layoutInfo[this.tabType];
        break;
      default :
        break;
    }
  }

  public getLayoutInfo(){
    let result = super.getLayoutInfo();
    let parse = JSON.stringify(this.initLayoutInfo).replace(/\"/g, "'");
    result.option = {
      colOption : parse,
      tabType: this.tabType,
      watchType: this.watchType
    };
    return result;
  }
  
}
