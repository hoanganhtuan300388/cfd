/**
 *
 * お知らせ:リスト
 *
 */
import { Component, ElementRef, ChangeDetectorRef } from '@angular/core';
import { PanelManageService, PanelViewBase, IViewData, CommonEnum, CommonConst, Tooltips, BusinessService, StringUtil, ResourceService } from '../../../core/common';
import { IReqInformationList, IResInformationList, IReqInformationMessage, IResInformationMessage } from "../../../values/Values";
import { ERROR_CODE } from "../../../../../common/businessApi";
import { Messages, GetWarningMessage} from '../../../../../common/message';

declare var $:any;
declare var moment:any;
//-----------------------------------------------------------------------------
// COMPONENT : Scr03030400Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03030400',
  templateUrl: './scr-03030400.component.html',
  styleUrls: ['./scr-03030400.component.scss']
})
export class Scr03030400Component extends PanelViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public selectedTab:string;
  private gridDataRowCnt:number = 0;
  private infoGrid:any = null;
  private clientInfoGrid:any = null;
  public nickName:string;
  private gridAllData:any;
  public upBtnCheck:boolean = true;
  public downBtnCheck:boolean = true;
  public warnCheck:boolean = false;
  public messageData:any = {day:"", msg:"", title:""};
  public listErrShow:boolean = false;
  public msgErrShow:boolean = false;
  private informationListForAllIndx:number = null;
  private informationListForClientIndx:number = null;
  private listErrText:string="データが取得できませんでした。";
  private msgErrText:string="データが取得できませんでした。";
  private infoSelected:any;
  private initFlg:boolean = false;
  private BUTTOM_DEDUCT_HEIGHT = 24 + 6; /* footer + gap height */
  private seletedIndex:number = null;

  public nickNameFlg :boolean = false;
  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public changeRef:ChangeDetectorRef,
               public resource:ResourceService,
               public business: BusinessService) {
    super( '03030400', screenMng, element, changeRef);
    this.informationListForAllIndx = this.resource.getInfomationSelected().informationListForAllIndx;
    this.informationListForClientIndx = this.resource.getInfomationSelected().informationListForClientIndx;
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  initLayout(param:any){
    super.initLayout(param);
    this.initInfoGrid();
    this.getUserInfo();
    this.getInformationList();
    this.ui();
  }

  ngOnDestroy(){
    super.ngOnDestroy();
    this.resource.setInfomationSelected({informationListForAllIndx:this.informationListForAllIndx,informationListForClientIndx:this.informationListForClientIndx});
  }

  ngAfterViewInit(){
    super.ngAfterViewInit();
    $(this.element.nativeElement).find(".panel-customer").on("keydown",(e:KeyboardEvent)=>{
        if(e.keyCode == 38 || e.keyCode == 40){
          if (this.infoGrid) {
            if (this.seletedIndex == null) {
              this.infoGrid.pqGrid( "setSelection", {rowIndxPage:0} );
              this.btnCheck(0);
            } else {
              this.infoGrid.pqGrid( "setSelection", {rowIndx:this.seletedIndex} );
            }
          }
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

    if(this.infoGrid){
      this.infoGrid.pqGrid('refreshDataAndView');
    }    
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  public onResizing($event){
    super.onResizing();
    this.infoGrid.pqGrid('refresh');
    let $con_re = $(this.element.nativeElement).find('.con_re');
    let $con_hd = $(this.element.nativeElement).find('.con_re .con_hd');
    let $con_bt = $(this.element.nativeElement).find('.con_re .con_bt');
    let $bar = $(this.element.nativeElement).find('.con_re i');
    let re_height = $(this.element.nativeElement.querySelector(".panel")).height()
                    - $(this.element.nativeElement.querySelector(".navbar")).height()
                    - $(this.element.nativeElement.querySelector(".tab dt")).height()
                    - $bar.outerHeight();
    let hd_height = $bar.position().top;
    if (hd_height > re_height-this.BUTTOM_DEDUCT_HEIGHT) {
      hd_height = re_height - this.BUTTOM_DEDUCT_HEIGHT;
    }
    let bt_height = re_height - hd_height - this.BUTTOM_DEDUCT_HEIGHT;
    $bar.css({
      top: hd_height
    });
    $con_re.height(re_height);
    $con_hd.height(hd_height);
    $con_bt.height(bt_height);

    this.updateView();
    let sElement = $("li.info-for-client span.nicknamebr") ;
    let niceNameWidth = sElement[0].offsetWidth;
    let niceNameWidthDiv = $("li.info-for-client").width();
    
    if($("li.info-for-client span.nicknamebr").hasClass("nicknamebr2")){
        if(niceNameWidthDiv > 340){
          $("li.info-for-client span.nicknamebr").removeClass("nicknamebr2");
        }
    }
    if(niceNameWidth > niceNameWidthDiv){
      $("li.info-for-client span.nicknamebr").addClass("nicknamebr2");
    }
    
  }

  public onSelectedTab($event){
    if (!this.initFlg) {
      this.messageData = {day:"", msg:"", title:""};
      this.warnCheck=false;
      if(this.selectedTab == "0" && this.gridAllData && this.gridAllData.informationListForAll) {
        this.seletedIndex = this.informationListForAllIndx;
        this.gridDataRowCnt=this.gridAllData.informationListForAll.length;
        this.bindInfoGridData(this.gridAllData.informationListForAll, this.informationListForAllIndx);
      } else if(this.selectedTab != "0" && this.gridAllData.informationListForClient) {
        this.seletedIndex = this.informationListForClientIndx;
        this.gridDataRowCnt=this.gridAllData.informationListForClient.length;
        this.bindInfoGridData(this.gridAllData.informationListForClient, this.informationListForClientIndx);
      }
    }
  }

  public onUpBtnClick($event){
    let rowData=this.infoGrid.pqGrid('SelectRow').getSelection();
    let indx=rowData[0].rowIndx-1;
    if(indx>-1) {
      this.infoGrid.pqGrid( "setSelection", null );
      this.infoGrid.pqGrid( "setSelection", {rowIndx:indx});
    }
    this.btnCheck(indx);
  }

  public onDownBtnClick($event){
    let rowData=this.infoGrid.pqGrid('SelectRow').getSelection();
    let indx=rowData[0].rowIndx+1;
    if(indx<this.gridDataRowCnt) {
      this.infoGrid.pqGrid( "setSelection", null );
      this.infoGrid.pqGrid( "setSelection", {rowIndx:indx});
    }
    this.btnCheck(indx);
  }

  private btnCheck(indx:number) {
    if (indx != undefined) {
      if(this.gridDataRowCnt<=1){
        this.upBtnCheck=true;
        this.downBtnCheck=true;
      } else {
        if(indx>0) {
          this.upBtnCheck=false;
        } else if(indx==0) {
          this.upBtnCheck=true;
        }

        if((indx+1)==this.gridDataRowCnt) {
          this.downBtnCheck=true;
        } else if((indx+1)<this.gridDataRowCnt) {
          this.downBtnCheck=false;
        }
      }
      this.messageData = {day:"", msg:"", title:""};
      if(indx>=0){
        let rowData = this.infoGrid.pqGrid( "getRowData", {rowIndx: indx} );
        this.messageData.title=rowData.title;
        rowData.checkFlag='1';
        this.infoGrid.pqGrid( "refreshRow", {rowIndx:indx} );
        if(this.selectedTab == "0") {
          this.informationListForAllIndx=indx;
        } else {
          this.informationListForClientIndx=indx;
        }
        this.getInformationMessage(String(rowData.seqno));
      }
      super.updateView();
    }
  }

  private initInfoGrid() {
    let _self=this;
    let colModel = [
      {dataIndx: 'seqno', dataType:'string', title:'seqno', align:'center', hidden:true},
      {dataIndx: 'checkFlag', dataType:'string', title:'checkFlag', align:'center', hidden:true},
      {dataIndx: 'importantLevel', width:70, dataType:'string', title:'importantLevel', align:'left', cls: 'body-col-first',
        render:(ui)=>{
          let warn=" ";
          if(ui.rowData.importantLevel=='3'){
            warn='<div class="label label-important">重要</div>';
          }
          return warn;
        }
      },
      {dataIndx: 'startupDatetime', width:80, dataType:'string', title:'startupDatetime', align:'left', cls:'body-col-num-mid',
        render:(ui)=>{
          let spanCls = '';
          if(ui.rowData.checkFlag != null && ui.rowData.checkFlag=='0') {
            spanCls = 'text-news-unread';
          }
         
          return '<span class="' + spanCls + '" style="font-size:inherit">' + moment(ui.cellData).format('YY/MM/DD') + '</span>';
        }
      },
      {dataIndx: 'title', dataType:'string', title:'title', align:'left',
        render:(ui)=>{
          if(ui.rowData.checkFlag != null && ui.rowData.checkFlag=='0') {
            return {cls: 'text-news-unread'};
          }
        }
      }
    ];

    this.infoGrid = $(this.element.nativeElement).find("#grid"+this.pageId).pqGrid({
      width: "100%",
      height: "100%",
      columnTemplate: { tooltip:false },
      showHeader: false,
      wrap: false,
      hwrap: false,
      editable: false,
      numberCell: false,
      showTitle: false,
      showToolbar: false,
      showTop: false,
      showBottom: false,
      _minColWidth: 20,
      scrollModel:{horizontal:false},
      selectionModel:{type: 'row', mode: 'single'},
      dataModel: { data: [] },
      colModel: colModel,
      //strNoRows: 'お知らせはありません。',
      strNoRows: 'お知らせはございません。',
      trigger: true,
      cellClick: (event, ui) => {
        _self.btnCheck(ui.rowIndx);
      },
      cellKeyDown: ( event, ui ) => {
        let indx=ui.rowIndx;
        if(event.key=='ArrowDown') {
          let data=_self.infoGrid.pqGrid( "option", "dataModel.data" );
          if(data.length>0 && (data.length-1) >= (ui.rowIndx+1)){
            _self.infoGrid.pqGrid( "setSelection", null );
            _self.infoGrid.pqGrid( "setSelection", {rowIndx:ui.rowIndx+1} );
            indx+=1;
            _self.btnCheck(indx);
          }
        }

        if(event.key=='ArrowUp') {
          if(ui.rowIndx>0){
            _self.infoGrid.pqGrid( "setSelection", null );
            _self.infoGrid.pqGrid( "setSelection", {rowIndx:ui.rowIndx-1} );
            indx-=1;
            _self.btnCheck(indx);
          }
        }
      },
      rowSelect:($event, ui)=> {
        if (ui.addList.length > 0) {
          this.seletedIndex = ui.addList[0].rowIndx;
        }
      },
      refresh: ($event, ui)=> {
        this.showMsgIfNoRows();
      }
    });

  }

  private bindInfoGridData(gridData:any, index:number, init:boolean = false) {
    if(gridData.length>0){
      this.upBtnCheck=false;
      this.downBtnCheck=false;
    } else {
      this.upBtnCheck=true;
      this.downBtnCheck=true;
    }
    this.infoGrid.pqGrid( "scrollRow", { rowIndxPage: 0 } );
    this.infoGrid.pqGrid( "option", "dataModel.data", gridData );
    this.infoGrid.pqGrid( "refreshDataAndView" );
    this.infoGrid.pqGrid( "setSelection", null );
    if (!init) {
      this.infoGrid.pqGrid( "setSelection", {rowIndx:index});
      setTimeout(() => {
        this.btnCheck(index);
      },500);
    }
    this.infoGrid.pqGrid( "loadComplete");
  }

  private getInformationList(){
    let _self=this;
    _self.listErrShow=false;
    _self.initFlg = true;
    this.business.getInformationList().subscribe(val => {
      _self.gridAllData=val.result;
      console.log(val.result);
      if(val.status == '0'){
        let unread = _self.gridAllData.informationListForClient.filter(info => info.checkFlag == "0");
        if (unread.length > 0) {
          _self.gridDataRowCnt = _self.gridAllData.informationListForClient.length;
          _self.selectedTab = "1";
          _self.trigerClick();
          _self.bindInfoGridData(_self.gridAllData.informationListForClient, null, true);

        } else {
          _self.gridDataRowCnt = _self.gridAllData.informationListForAll.length;
          _self.selectedTab = "0";
          _self.trigerClick();
          _self.bindInfoGridData(_self.gridAllData.informationListForAll, null, true);
        }
      } else if(val.status ==ERROR_CODE.WARN) {
        _self.listErrText='データが取得できませんでした。しばらくしてからもう一度お試しください。';
        _self.listErrShow=true;
      } else if(val.status ==ERROR_CODE.NG) {
        _self.listErrText='データが取得できませんでした。しばらくしてからもう一度お試しください。[CFDS2501T]';
        _self.listErrShow=true;
      } else {
        _self.listErrText="インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS2502C]";
        _self.listErrShow=true;
      }
      _self.initFlg = false;
    },
    err=>{
      switch(err.status) {
        case ERROR_CODE.NETWORK:
          _self.listErrText=Messages.ERR_0002 + '[CFDS2502C]';
          _self.listErrShow=true;          
          break;
      }            
      _self.initFlg = false;
    });
  }

  private getInformationMessage(seqno:string){
    let _self=this;
    let mode='2';
    let upBtnCheckOld = this.upBtnCheck;
    let downBtnCheckOld = this.downBtnCheck;
    this.upBtnCheck = true;
    this.downBtnCheck = true;
    if(this.selectedTab == "1") {
      mode='1';
    }
    _self.msgErrShow=false;
    //_self.warnCheck=false;
    let input: IReqInformationMessage = {mode:mode, seqno:seqno};
    this.business.getInformationMessage(input).subscribe(val => {
      if(val.status == '0'){
        console.log(val.result);
        let level = val.result.importantLevel;

        if(level=='3'){
          _self.warnCheck=true;
        }else{
          _self.warnCheck=false;
        }

        let day = moment(val.result.startupDatetime).format('YY/MM/DD');
        let msg = val.result.message;

        _self.messageData.day=day;
        _self.messageData.msg=_self.unhtmlspecialchars(msg);

      } else if(val.status ==ERROR_CODE.WARN) {
        _self.msgErrText='データが取得できませんでした。しばらくしてからもう一度お試しください。';
        _self.msgErrShow=true;
      } else if(val.status ==ERROR_CODE.NG) {
        _self.msgErrText='データが取得できませんでした。しばらくしてからもう一度お試しください。[CFDS2601T]';
        _self.msgErrShow=true;
      } else {
        _self.msgErrText='インターネットに接続されていない、または接続先のサーバーに問題が発生しているため、接続できませんでした。[CFDS2602C]';
        _self.msgErrShow=true;
      }
      _self.upBtnCheck = upBtnCheckOld;
      _self.downBtnCheck = downBtnCheckOld;
      _self.updateView();
    });
  }

  private unhtmlspecialchars(str:string):string{
    str = str.replace(/&#39;/g,"'");
    str = str.replace(/&quot;/g,"\"");
    str = str.replace(/&lt;/g,"<");
    str = str.replace(/&gt;/g,">");
    str = str.replace(/&uuml;/g,"?");
    str = str.replace(/&amp;/g,"&");
    return str;
  }

  private getUserInfo(){
    let _self=this;
    this.business.getUserInfo().subscribe(val => {
      if(val.result.nickname!==undefined && val.result.nickname!==null && val.result.nickname!='') {
        _self.nickName = val.result.nickname;
        //_self.nickName = "ああああああああああああああああああ";

        setTimeout(()=> {
          this.niceNameWhiteSpace();
        }, 300);
        
        if (StringUtil.countLength(val.result.nickname) >= 23) {
          var _tab = $(this.element.nativeElement).find('.tab'),
              _dt = _tab.children('dt');
              //_dt.find('li#tab-nickname').addClass('text-small');
        }
      }  else {
        this.nickNameFlg = true;
        //_self.nickName = 'お客様へのお知らせ';
      }
    });
  }

  public niceNameWhiteSpace(){
    this.updateView();
    let sElement = $("li.info-for-client span.nicknamebr") ;
    let niceNameWidth = sElement[0].offsetWidth;
    let niceNameWidthDiv = $("li.info-for-client").width();
    // console.log("niceNameWidth---------:"+ niceNameWidth);
    // console.log("niceNameWidthDiv---------:"+ niceNameWidthDiv);
    $("li.info-for-client span.nicknamebr").removeClass("nicknamebr2");
    if(niceNameWidthDiv < niceNameWidth){
      $("li.info-for-client span.nicknamebr").addClass("nicknamebr2");

    }else{
      $("li.info-for-client span.nicknamebr").removeClass("nicknamebr2");
    }
  }

  private ui(){
    let _self=this;
    //
    function con_re($selector){
      let con_d = $selector.find(".con_re"),
        con_t = con_d.find("> div:first-child"),
        con_i = con_d.find("> i"),
        con_b = con_i.next(),
        mouse_ch = false,
        mouse_y = 0,
        con_h = 0;

      con_i.on("mousedown",function(e:MouseEvent){
          mouse_ch = true;
          if(mouse_y === 0){
             mouse_y = e.clientY;
             con_h = con_t.height();
          }
          $(document).on( 'mouseup', ()=>{
            mouse_ch = false;
            $(document).off( 'mouseup');
            $(document).off( 'mousemove');
            mouse_y = 0;
          });
          $(document).on( 'mousemove', function(me:MouseEvent){
            if(!mouse_ch) return true;
            let _mt = me.clientY - mouse_y;
            let _con_i_top = con_h + _mt;

            if (_con_i_top <= 0) {
              _con_i_top = 0;
            } else if (_con_i_top >= con_d.height()-30) {
              _con_i_top = con_d.height()-30;
            }
            con_i.css("top",_con_i_top);
            con_t.height(_con_i_top);
            con_b.height(con_d.height() - _con_i_top - con_i.outerHeight() - _self.BUTTOM_DEDUCT_HEIGHT);
            _self.infoGrid.pqGrid( "refresh" );
          });
        }
      );
    }

    var _tab = $(this.element.nativeElement).find('.tab'),
        _dt = _tab.children('dt'),
        _dd = _tab.children('dd');

    _dt.find('li').click(function(){
      var _li = $(this),
          _idx = _li.index();
      _li.addClass('active').siblings().removeClass('active');
    }).first().trigger('click');

    con_re(_tab);
  }

  private trigerClick(){
    if (this.selectedTab == "0") {
      $(this.element.nativeElement).find(".info-for-all").trigger('click');
    } else {
      $(this.element.nativeElement).find(".info-for-client").trigger('click');
    }
  }

  private showMsgIfNoRows(){
    if (this.infoGrid) {
      let data = this.infoGrid.pqGrid('option', 'dataModel.data');
      if (!this.initFlg && data.length == 0) {
        this.infoGrid.pqGrid('loadComplete');
      }
    }
  }

}
