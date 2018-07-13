/**
 *
 * アラート
 *
 */
import { Component, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { PanelManageService, ResourceService, BusinessService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips } from '../../../core/common';
import { IConfigSetting } from '../../../core/configinterface';
import { MessageBox } from '../../../util/utils';
import { DialogService } from "ng2-bootstrap-modal";
import { keyUpDown, SetSelectd } from '../../../util/commonUtil';
import { AlertAddModifyComponent } from '../../../component/alert-add-modify/alert-add-modify.component';

declare var $:any;
//-----------------------------------------------------------------------------
// COMPONENT : Scr03010500Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03010500',
  templateUrl: './scr-03010500.component.html',
  styleUrls: ['./scr-03010500.component.scss']
})
export class Scr03010500Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  private setting:IConfigSetting;
  public alertList: Array<any> = [];
  private gridObj;
  private dataModel:any;
  private subscriber:any;
  public alertInfo:any = {};
  private seletedIndex:number = null;
  @ViewChild('slider') slider: ElementRef;
  @ViewChild('alertAddModify') alert:AlertAddModifyComponent;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public resource:ResourceService,
               public business:BusinessService,
               private dialogService: DialogService,
               public changeRef:ChangeDetectorRef) {
    super( '03010500', screenMng, element, changeRef);
  }

  ngAfterViewInit(){
    super.ngAfterViewInit();
    this.gridLoad();
    $(this.element.nativeElement).find(".panel-alert").on("keydown",(e:KeyboardEvent)=>{
      SetSelectd(e,this.gridObj,this.seletedIndex);
    })
    this.subscriber = this.panelMng.onChannelEvent().subscribe(val=>{
      if (val.channel == 'alertAddModify' || val.channel == "unselectAlert") {
        if (this.dataModel) {
          this.getAlertList(this.dataModel);
        }
      } else if (val.channel == "showAlertList") {
        let info = this.panelMng.getPanel( this.uniqueId );
        if (!info) {
          this.panelMng.winFocus(this.uniqueId);
        }
        else if(info.showscreen)
          this.panelMng.panelFocus(this.uniqueId);
        else
          this.panelMng.behavePanelTouch( this.uniqueId );
      }
    });
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    this.subscriber.unsubscribe();
  }

  public onResizing($event){
    super.onResizing();
    if (this.gridObj) {
      this.gridObj.pqGrid('option','height',this.getGridHeight())
      this.gridObj.pqGrid('refresh');
    }
  }

  /**
   * override function.
   *
   * 画面が最小化から復元された際、呼び出される。
   */
  public onPanelRestored(){
    super.onPanelRestored();

    if(this.gridObj){
      this.gridObj.pqGrid('refreshDataAndView');
    }    
  }

  private getGridHeight(){
    return $(this.element.nativeElement.querySelector(".panel")).outerHeight() - $(this.element.nativeElement.querySelector(".navbar")).outerHeight() - $(this.element.nativeElement.querySelector(".row.row-table-footer")).outerHeight(true) - 2;
  }

  private gridLoad(){
    let _self = this;
    const colModel = [
      {dataIndx:'delete', title: "", dataType:"string", align:"center", sortable: false, editor: false, nodrag: true, resizable: false, width: 80, render:function(ui){
        if (ui.rowData["key"]) {
          return '<button type="button" class="deleteCell button button-label button-orderlist-cancel">削除</button>'
        }
      }, postRender:function(ui){
        var grid = this,
        $cell = grid.getCell(ui);
        $cell.find('.deleteCell').bind('click',function(){
            _self.deleteAlert(ui.rowData["key"]);
        });
      }},
      {dataIndx:'symbolName', title: "銘柄", dataType:"string", align:"left", sortable: false, editor: false, nodrag: true, resizable: false, tooltip:true, width: 136, cls: 'body-col-first header-col-left'},
      {dataIndx:'basicRate', title: "レート(BID)", dataType:"number", align:"right", sortable: false, editor: false, nodrag: true, resizable: false, width: 88, cls: 'body-col-num'},
      {dataIndx:'modify', title: "ON/OFF", dataType:"string", align:"left", sortable: false, editor: false, nodrag: true, resizable: false, width: 112, cls: 'header-col-right body-col-side-by-side', render:function(ui){
        if (ui.rowData["key"]) {
          let ret = '<div><button type="button" class="modifyCell button button-label button-orderlist-edit">編集</button></div>';

          /* @NOTE テーブル更新のたびに$material.init()を実行すると描画がちらつくため、$materialで形成されるタブの構成を指定 */
          if (ui.rowData["validFlag"] == "1") {
            ret += '<div class="checkbox"><label><input type="checkbox" class="selectCell" checked><span class="checkbox-material"><span class="check"></span></span></label></div>';
          } else {
            ret += '<div class="checkbox"><label><input type="checkbox" class="selectCell"><span class="checkbox-material"><span class="check"></span></span></label></div>';
          }
          return ret;
        }
      }, postRender:function(ui){
          var grid = this,
          $cell = grid.getCell(ui);
          $cell.find('.modifyCell').bind('click',function(){
              _self.modifyAlert({key:ui.rowData["key"], product:ui.rowData["product"], basicRate:ui.rowData["basicRate"], from:"alert"});
          });
          // checkboxクリック時に、update()が実行され、screenMng.fireChannelEvent()が呼ばれるとgridが再描画され、
          // 選択された行の背景色がちらつくため、gridにclickイベントを伝番しない
          $cell.find(".checkbox, .checkbox-material, .selectCell, .check").on("click",(e)=>{
              _self.selectAlert(ui.rowData["key"]);
              // @NOTE checkboxと行選択は同時に制御することができない
              // setTimeout(()=>{
              //   _self.gridObj.pqGrid( "setSelection", {rowIndxPage:ui.rowIndx} );
              // }, 100);
              return false;
          })
        }
      }
    ];
    let $grd = $(this.element.nativeElement).find("#Grid");
    this.gridObj = $grd.pqGrid({
      width : "auto",
      height : 328,
      editable: false,
      draggable: false,
      columnTemplate: { halign: 'center', align: 'center', dataType: 'string', tooltip:false},
      mergeCells: [],
      wrap: false,
      hwrap: false,
      numberCell: false,
      showTitle: false,
      showToolbar: false,
      showTop: false,
      showBottom: false,
      scrollModel: { lastColumn: "none" },
      dataModel: { data: [],location:"local" },
      pageModel: { type: 'local', rPP:65535 },
      selectionModel: { type:'row', mode:'single' },
      swipeModel: { on: false },
      stripeRows: false,
      colModel: colModel,
      postRenderInterval: -1,
      rowSelect:($event, ui)=> {
        if (ui.addList.length > 0) {
          this.seletedIndex = ui.addList[0].rowIndx;
        }
      },
      cellKeyDown: ( event, ui ) => {
        keyUpDown(this.gridObj,event,ui);
      }
    });
    this.dataModel = this.gridObj.pqGrid('option','dataModel');
    this.getAlertList(this.dataModel);
  }

  public deleteAlert(alert:any){
    MessageBox.question({
      title:"アラート",
      message:"選択されたアラートを削除します。よろしいですか。"
    },
    (response, checkboxChecked)=>{
      if(response==1) { //OK
        let setting = this.resource.config.setting.alert;
        delete(setting[alert]);
        let info = [{"008":[setting]}];
        this.update(info,true);
      }
    }
    );
  }

  public modifyAlert(alert){
    this.alertInfo = alert;
    $(this.slider.nativeElement).carousel("next");
  }

  public addAlert(){
    let valCount = 0;
    this.alertList.forEach(element => {
      if (element.key) {
        valCount++;
      }
    });
    if (valCount == 10) {
      MessageBox.info({
        title:"アラート",
        message:"アラートの登録可能件数は最大10件です。"
      });
    } else {
      this.alertInfo = {from:"alert"};
      $(this.slider.nativeElement).carousel("next");
    }
  }

  public onConfirm(result:boolean){
    $(this.slider.nativeElement).carousel("prev");
    if (result) {
      this.getAlertList(this.dataModel);
      this.screenMng.fireChannelEvent('alertAddModify', {});
    }
    this.alert.isProcessing = false;
  }

  public selectAlert(key){
    let setting = this.resource.config.setting.alert;
    let input = {productCodes:this.resource.config.setting.alert[key].product};
    this.business.getPriceList(input).subscribe(val=>{
      if( val && val.result.priceList ){
        let rateNow = Number(val.result.priceList[0].bid);
        let signal = "1";
        if (Number(setting[key].basicRate) < rateNow) {
          signal = "2";
        }
        if (setting[key].validFlag == "0") {
          setting[key].validFlag = "1";
        } else {
          setting[key].validFlag = "0";
        }
        setting[key].signal = signal;
        let alert = [{"008":[setting]}];
        this.update(alert);
      }
    })
  }

  private getAlertList(dataModel){
    this.alertList.length = 0;
    this.setting = this.resource.config.setting;
    if (this.setting.alert) {
      for (let key in this.setting.alert) {
        let element = this.setting.alert[key];
        let name = this.business.symbols.getSymbolInfo(element.product).meigaraSeiKanji;
        let check:boolean = false;
        if (element.validFlag == "1") {
          check = true;
        }
        this.alertList.push({key:key, product:element.product, symbolName:name, basicRate:element.basicRate, validFlag:check, signal:element.signal});
      }
    }
    dataModel.data = this.alertList;
    this.gridObj.pqGrid('refreshDataAndView');
    this.gridObj.pqGrid('loadComplete');
    this.updateView();
  }

  private update(alert,refresh:boolean=false){
    this.business.setAlert(alert).subscribe(
      val=>{
        if(val.status == "0"){
          this.resource.config.setting.alert = alert[0]["008"][0];
          if (refresh) {
            this.getAlertList(this.dataModel);
          }
          this.screenMng.fireChannelEvent('alertAddModify', {});
          this.resource.fireUpdateAlertConfig();
        }
      },
      err=>{
        console.log(err);
      }
    )
  }
  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
}
