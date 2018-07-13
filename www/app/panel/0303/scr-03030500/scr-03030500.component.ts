/**
 *
 * ニュース：リスト
 *
 */
import { Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import { WindowService, ResourceService, PanelManageService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, BusinessService, StringUtil } from '../../../core/common';
import { IReqNewsList, IResNewsList } from "../../../values/Values";
import {conversion} from '../../../util/stringUtil';
import { ERROR_CODE } from "../../../../../common/businessApi";
import { Messages, GetWarningMessage} from '../../../../../common/message';

declare var $:any;
declare var moment:any;

//-----------------------------------------------------------------------------
// COMPONENT : Scr03030500Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030500',
  templateUrl: './scr-03030500.component.html',
  styleUrls: ['./scr-03030500.component.scss']
})
export class Scr03030500Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
    // grid
    public newsGrid:any;
    public searchText:string;
    public listErrText:string='';
    public listErrShow:boolean=false;
    private pdfUrl:string='https://sec-sso.click-sec.com/loginweb/sso-redirect?s=05&p=01&sp=08';

    private gridDataRowCnt:number = 0;
    private closeSubscrip:any;
    private initFlg:boolean = false;
    private subscriber:any;
    private realTimeSubscriber:any;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef,
               public business: BusinessService,
               public resource:ResourceService,
               public window:WindowService) {
    super( '03030500', screenMng, element, changeRef);

  }

  ngAfterViewInit(){
    super.ngAfterViewInit();
    this.closeSubscrip = this.screenMng.onClosePanel().subscribe(val => {
      if (val.id == "03030501") {
        let rowData=this.newsGrid.pqGrid('SelectRow').getSelection();
        if (rowData.length > 0) {
          let indx=rowData[0].rowIndx;
          this.newsGrid.pqGrid( "setSelection", {rowIndx:indx});
        }
      }
    })
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    if(this.closeSubscrip)
      this.closeSubscrip.unsubscribe();
    if(this.subscriber)
      this.subscriber.unsubscribe();
    if(this.realTimeSubscriber)
      this.realTimeSubscriber.unsubscribe();
  }

  /**
   * override function.
   *
   * 画面が最小化から復元された際、呼び出される。
   */
  public onPanelRestored(){
    super.onPanelRestored();

    if(this.newsGrid){
      this.newsGrid.pqGrid('refreshDataAndView');
    }     
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  initLayout(param:any){
    // console.log('initLayout');
    super.initLayout(param);
    // console.log(this.resource.environment.demoTrade);
    if(this.resource.environment.demoTrade){
      this.listErrText="デモ口座ではニュースをご覧いただけません。<br /><br />口座開設いただくと、24時間随時更新のニュースがご利用いただけます。<br /><a class='openaccount text-link-underline' href='#'>口座開設をご希望の方は、こちらよりお申し込みください。</a>";
      this.listErrShow=true;
      this.updateView();
      setTimeout(() => {
        $(this.element.nativeElement).find(".openaccount").click(()=>{
          this.openUrl(this.resource.environment.clientConfig.kouzaOpenURL);
        })
      }, 50);
    } else {
      this.initGrid();
      this.getNewsList('');
      this.realNewsList();
    }
    let _self=this;

    this.subscriber = this.screenMng.onChannelEvent().subscribe(val=>{
      if(val.channel == 'news') {
        let headlineId=val.arg.headlineId;
        let row = _self.newsGrid.pqGrid( "search", { row: { headlineId : headlineId } });
        if(row.length>0) {
          let indx=row[0].rowIndx;
          if(val.arg.action=='up') {
            let rowData=this.newsGrid.pqGrid('SelectRow').getSelection();
            if(rowData.length>0){
              let indx=rowData[0].rowIndx-1;
              if(indx>-1) {
                this.newsGrid.pqGrid( "setSelection", null );
                this.newsGrid.pqGrid( "setSelection", {rowIndx:indx});
              }
              this.btnCheck(indx);
            }
          } else {
            let rowData=this.newsGrid.pqGrid('SelectRow').getSelection();
            if(rowData.length>0){
              let indx=rowData[0].rowIndx+1;
              if(indx<this.gridDataRowCnt) {
                this.newsGrid.pqGrid( "setSelection", null );
                this.newsGrid.pqGrid( "setSelection", {rowIndx:indx});
              }
              this.btnCheck(indx);
            }
          }
        }
      }

    });
  }

  public onResizing($event){
    super.onResizing();
    if (this.newsGrid) {
      this.newsGrid.pqGrid('option','height',this.getGridHeight())
      this.newsGrid.pqGrid('refresh');
    }
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------

  private btnCheck(indx:number) {
    if(indx>=0){
      let rowData = this.newsGrid.pqGrid( "getRowData", {rowIndx: indx} );
      let rowLen=this.newsGrid.pqGrid( "option", "dataModel.data" );
      let param = {
        layout: {
          external: this.isExternalWindow(),
          option:{
            rowIndx:indx,
            rowLen:rowLen.length,
            data:rowData              
          }
        }
      };

      this.screenMng.fireChannelEvent('newsDetail', param);
    }
    super.updateView();
  }

  public pdfLink(url:string){
    this.window.openBrowser(url);
  }

  private initGrid() {
    let _self=this;
    let colModel = [
      {dataIndx: 'headlineId', dataType:'string', title:'headlineId', align:'center', hidden:true},
      {dataIndx: 'newsVenderCode', dataType:'string', title:'newsVenderCode', align:'center', hidden:true},
      {dataIndx: 'newsVenderName', dataType:'string', title:'newsVenderName', align:'center',hidden:true},
      {dataIndx: 'resourceType', dataType:'string', title:'resourceType', align:'center',hidden:true},
      {dataIndx: 'forFilter', dataType:'string', title:'forFilter', align:'center', hidden:true},
      {dataIndx: 'venderIcon', dataType:'string', title:'venderIcon', align:'left', width:"5%", cls:'body-col-first body-col-first2',
        render:(ui)=>{
          let venderIcon:string="";
          if(ui.rowData.newsVenderCode=='1'){
            venderIcon="icon-vender-marketwin-24";
          } else if(ui.rowData.newsVenderCode=='2'){
            venderIcon="icon-vender-nikkei";
          } else if(ui.rowData.newsVenderCode=='3'){
            venderIcon="icon-vender-dowjones";
          } else if(ui.rowData.newsVenderCode=='8'){
            venderIcon="icon-vender-msaaf";
          } else if(ui.rowData.newsVenderCode=='9'){
            venderIcon="icon-vender-jp";
          } else if(ui.rowData.newsVenderCode=='10'){
            venderIcon="icon-vender-dhz";
          }

          return '<i class="svg-icons ' + venderIcon + '"></i>';
        }
      },
      {dataIndx: 'issueDate', dataType:'string', title:'issueDate', align:'left', width:"15%", cls: 'body-col-num-mid',
        render:(ui)=>{
          return moment(ui.cellData,"YYYYMMDDHHmmss").format('MM/DD HH:mm');
        }
      },
      {dataIndx: 'title', dataType:'string', title:'title', align:'left', tooltip:true,
        render:(ui)=>{
          var rowData = ui.rowData,dataIndx = ui.dataIndx;
          rowData.pq_cellcls = rowData.pq_cellcls || {};
          let rtn_data=ui.rowData.title;
          if(ui.rowData.resourceType=='0011'){ //PDF type
            //rtn_data='<span class="textoverflow">'+ui.rowData.title+'</span><i class="svg-icons icon-pdf"></i>';
            rtn_data='<span class="textoverflow textoverflow2">'+ui.rowData.title+'</span>';
          }
          return rtn_data;
        }
      }
    ];

    this.newsGrid = $(this.element.nativeElement).find("#grid"+this.pageId).pqGrid({
      width: "100%",
      columnTemplate: { align: 'left', dataType: 'string', tooltip:false },
      height: this.getGridHeight(),
      showHeader: false,
      wrap: false,
      hwrap: false,
      editable: false,
      numberCell: false,
      showTitle: false,
      showToolbar: false,
      showTop: false,
      showBottom: false,
      scrollModel:{horizontal:false},
      selectionModel:{type: 'row', mode: 'single'},
      dataModel: { data: [], location: 'local' },
      colModel: colModel,
      //strNoRows: '対象のニュースはありません。',
      strNoRows: '対象のニュースはございません。',
      cellClick: (event, ui) => {
        let rowLen=_self.newsGrid.pqGrid( "option", "dataModel.data" );
        let param = {
          layout: {
            external: _self.isExternalWindow(),
            option:{
              rowIndx:ui.rowIndx,
              rowLen:rowLen.length,
              data:ui.rowData              
            }
          }
        };

        this.screenMng.findPanel('03030501').subscribe(pnl=>{
          if (pnl && pnl.length > 0) {
            _self.screenMng.fireChannelEvent('newsDetail', param);
          } else {
            if(ui.rowData.resourceType=='0011'){
              let file_url=_self.pdfUrl+"&sessionId="+_self.resource.environment.session.sessionId +"&rp=headlineId="+ui.rowData.headlineId;
              _self.pdfLink(file_url);
            } else {
              _self.screenMng.openPanel( _self.screenMng.virtualScreen(), '03030501' , param);
            }
          }
        });
      },
      cellKeyDown: ( event, ui ) => {
        if(event.key=='ArrowDown') {
          let data=_self.newsGrid.pqGrid( "option", "dataModel.data" );
          if(data.length>0 && (data.length-1) >= (ui.rowIndx+1)){
            _self.newsGrid.pqGrid( "setSelection", null );
            _self.newsGrid.pqGrid( "setSelection", {rowIndx:ui.rowIndx+1} );
            let rowData = _self.newsGrid.pqGrid( "getRowData", {rowIndx: ui.rowIndx+1} );
            let param = {
              layout: {
                external: _self.isExternalWindow(),
                option:{
                  rowIndx:ui.rowIndx+1,
                  rowLen:data.length,
                  data:rowData              
                }
              }
            };
            _self.screenMng.findPanel('03030501').subscribe(pnl=>{
              if (pnl && pnl.length > 0) {
                _self.screenMng.fireChannelEvent('newsDetail', param);
              } else {
                // _self.screenMng.openPanel( _self.screenMng.virtualScreen(), '03030501' , {data:rowData, rowIndx:ui.rowIndx+1,rowLen:data.length});
              }
            });
          }
        }

        if(event.key=='ArrowUp') {
          if(ui.rowIndx>0){
            _self.newsGrid.pqGrid( "setSelection", null );
            _self.newsGrid.pqGrid( "setSelection", {rowIndx:ui.rowIndx-1} );
            let rowData = _self.newsGrid.pqGrid( "getRowData", {rowIndx: ui.rowIndx-1} );
            let rowLen=_self.newsGrid.pqGrid( "option", "dataModel.data" );
            let param = {
              layout: {
                external: _self.isExternalWindow(),
                option:{
                  rowIndx:ui.rowIndx-1,
                  rowLen:rowLen.length,
                  data:rowData              
                }
              }
            };
            _self.screenMng.findPanel('03030501').subscribe(pnl=>{
              if (pnl && pnl.length > 0) {
                _self.screenMng.fireChannelEvent('newsDetail', param);
              } else {
                // _self.screenMng.openPanel( _self.screenMng.virtualScreen(), '03030501' , {data:rowData, rowIndx:ui.rowIndx-1,rowLen:rowLen.length});
              }
            });
          }
        }
      },
      refresh: ($event, ui)=> {
        this.showMsgIfNoRows();
      }
    });
  }

  public onSearch($event){
    let text = [""];
    if (this.searchText != undefined) {
      text = conversion(this.searchText).split(" ");
    }
    let reg = "";
    text.forEach(element => {
      reg += "(?=.*" + element + ")";
    });
    reg += "^.*$";
    let re = new RegExp(reg, "g");
    this.newsGrid.pqGrid( "scrollRow", { rowIndxPage: 0 } );
    this.newsGrid.pqGrid( "filter", {
          oper: 'replace',
          rule: { dataIndx: 'forFilter', condition: 'regexp', value: re }
    });
    let rowData=this.newsGrid.pqGrid('SelectRow').getSelection();
    if(rowData.length>0) {
      this.newsGrid.pqGrid('SelectRow').removeAll(true);
      this.newsGrid.pqGrid('setSelection', {rowIndxPage: rowData[rowData.length-1].rowIndx});
    }
    this.newsGrid.pqGrid( "loadComplete");
  }

  private getGridHeight(){
    return $(this.element.nativeElement.querySelector(".panel")).outerHeight() - $(this.element.nativeElement.querySelector(".navbar")).outerHeight() - $(this.element.nativeElement.querySelector(".row.row-header")).outerHeight(true)- $(this.element.nativeElement.querySelector(".row.row-table-footer")).outerHeight(true) - 2;
  }

  private bindGridData(gridData:any) {
    this.newsGrid.pqGrid( "option", "dataModel.data", gridData );
    this.newsGrid.pqGrid( "refreshDataAndView" );
    this.newsGrid.pqGrid( "loadComplete");
    this.newsGrid.pqGrid( "sort", {
      sorter: [ { dataIndx: ['issueDate'], dir: ['down'] }, { dataIndx: ['headlineId'], dir: ['down'] } ]
    });
  }

  private getNewsList(id:string){
    let _self = this;
    let input: IReqNewsList = {headlineId:id, getCount:200};
    this.listErrShow=false;
    this.initFlg = true;
    this.business.getNewsList(input).subscribe(val => {
      if(val.status=='0') {
        _self.gridDataRowCnt=val.result.newsList.length;
        val.result.newsList.forEach(news => {
          news.forFilter = conversion(news.title) + " " + conversion(news.pureStory.replace(/(?:\r\n|\r|\n)/g,'<br />'));
          news.title = news.title.replace("-","ー");
        });
        _self.bindGridData(val.result.newsList);
      } else if(val.status=='1' || val.status=='2') {
        _self.listErrText='データが取得できませんでした。しばらくしてからもう一度お試しください。[CFDS2001T]';
        _self.listErrShow=true;
      } else {
        _self.listErrText='インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS2002C]';
        _self.listErrShow=true;
      }
      _self.updateView();
      _self.initFlg = false;
    },
    err=>{
      switch(err.status) {
        case ERROR_CODE.NETWORK:
          _self.listErrText=Messages.ERR_0002 + '[CFDS2002C]';
          _self.listErrShow=true;          
          break;
      }      
      _self.initFlg = false;
    });
  }

  private realNewsList(){
    let _self = this;
    this.realTimeSubscriber = this.business.notifyer.news().subscribe(val => {
      this.newsGrid.pqGrid( 'filter', {
            oper: 'replace',
            rule: { dataIndx: 'forFilter', condition: 'notempty'}
      });
      for (let i = 0; i < val.newsList.length; i++) {
        val.newsList[i].forFilter = conversion(val.newsList[i].title) + " " + conversion(val.newsList[i].pureStory.replace(/(?:\r\n|\r|\n)/g,'<br />'));
        let headlineId = val.newsList[i].headlineId;
        let dataModel = this.newsGrid.pqGrid('option','dataModel');
        let idx = dataModel.data.findIndex(f=>f.headlineId == headlineId);
        if (idx != -1) {
          dataModel.data[idx].newsVenderCode = val.newsList[i].newsVenderCode;
          dataModel.data[idx].newsVenderName = val.newsList[i].newsVenderName;
          dataModel.data[idx].resourceType = val.newsList[i].resourceType;
          dataModel.data[idx].forFilter = val.newsList[i].forFilter;
          dataModel.data[idx].issueDate = val.newsList[i].issueDate;
          dataModel.data[idx].title = val.newsList[i].title;
        } else {
          _self.newsGrid.pqGrid( "deleteRow", { rowIndx: dataModel.data.length-1 } );
          _self.newsGrid.pqGrid( "addRow",{ newRow: val.newsList[i], rowIndx: 0 });
        }
      }
      this.newsGrid.pqGrid( "sort", {
        sorter: [ { dataIndx: ['issueDate'], dir: ['down'] }, { dataIndx: ['headlineId'], dir: ['down'] } ]
      });
      this.onSearch(null);
      let rowData = this.newsGrid.pqGrid('SelectRow').getSelection();

      if(rowData != undefined && rowData!=null && rowData.length>0) {
        this.newsGrid.pqGrid( "scrollRow", { rowIndx: rowData[0].rowIndx } );
        let indx = rowData[0].rowIndx;
        let rowLen=_self.newsGrid.pqGrid( "option", "dataModel.data" );
        let param = {
          layout: {
            external: _self.isExternalWindow(),
            option:{
              rowIndx:indx,
              rowLen:rowLen.length,
              data:rowData[0].rowData              
            }
          }
        };
        this.screenMng.findPanel('03030501').subscribe(pnl=>{
          if (pnl && pnl.length > 0) {
            this.screenMng.fireChannelEvent('newsDetail', param);
          }
        });
      }

    });
  }

  private openUrl(url:string){
    const electron = (window as any).electron;
    if(electron){
      const shell = electron.shell;

      shell.openExternal(url);
    }
  }

  private showMsgIfNoRows(){
    if (this.newsGrid) {
      let data = this.newsGrid.pqGrid('option', 'dataModel.data');
      if (!this.initFlg && data.length == 0) {
        this.newsGrid.pqGrid('loadComplete');
      }
    }
  }

}
