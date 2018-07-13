/**
 *
 * AppComponent
 *
 */
import { Component, ChangeDetectorRef, ChangeDetectionStrategy, HostListener } from '@angular/core';
import { CommonConst } from './core/common';
import { ResourceService } from './service/resource.service';
import { BusinessService } from './service/business.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
//-----------------------------------------------------------------------------
// class : AppComponent
// ----------------------------------------------------------------------------
export class AppComponent {
  private _content;

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(
    private resource:ResourceService,
    private business:BusinessService,
    private changeRef:ChangeDetectorRef,
  ){
  }

  ngOnInit(){
    this.init();
  }

  // detectChanges
  @HostListener('document:click', ['$event'])
  onGlobalHookClick(event: TouchEvent) {
    setTimeout(()=>{
      this.changeRef.detectChanges();
    }, 100);
  }

  // // detectChanges
  // @HostListener('document:contextmenu', ['$event'])
  // onGlobalHookContextmenu(event: TouchEvent) {
  //   setTimeout(()=>{
  //     this.changeRef.detectChanges();
  //   }, 100);
  // }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  private init(){
    this.attachRowHoverStyle();
    this.electronHyperLink();

    if(this.isLoginDlg())
    {
      this.initContent();
      return;
    }

    this.business.init();
    this.loadSetting();
  }

  private isLoginDlg(){
    var win = window as any;

    if( win.electron && win.electron.parameter &&
        win.electron.parameter.panelId && win.electron.parameter.panelId == '03010200'){
      return true;
    }

    // for ng serve debug
    if(win.electron == null){
      return true;
    }

    return false;
  }

  /**
   *
   */
  private initContent(){
    var win = window as any;

    if( win.electron && win.electron.parameter && win.electron.parameter.panelId ){
      // for sdi popup window
      this.content = 'scr-03010101';
    }else{
      // for main window.
      this.content = 'scr-03010100';
    }

    this.changeRef.detectChanges();
  }

  set content(str:string){
    this._content = `<${str}></${str}>`;
  }
  get content(){
    return this._content;
  }

  private loadSetting(){
    this.business.getAllSettings().subscribe(val=>{
      // #2603
      if(val.status == "0" && val.result && val.result.length){
        var setting = this.resource.config.setting;

        val.result.forEach(group => {
          var key = Object.keys(group)[0];

          switch(key){
            case '001':{  // 注文設定情報
              setting.order = group[key]?group[key][0]:null;
            }
            break;
            case '002':{  // 銘柄別注文設定情報
              setting.orderProduct = group[key]?group[key][0]:null;
            }
            break;
            case '003':{  // サウンド設定情報
              setting.sound = group[key]?group[key][0]:null;
            }
            break;
            case '004':{  // 表示設定情報
              setting.display = group[key]?group[key][0]:null;
            }
            break;
            case '005':{  // チャート表示設定情報
              setting.chartDisplay = group[key]?group[key][0]:null;
            }
            break;
            case '006':{  // チャート色設定情報
              setting.chartColor = group[key]?group[key][0]:null;
            }
            break;
            case '007':{  // テクニカル設定情報
              setting.chartTech = group[key]?group[key][0]:null;
            }
            break;
            case '008':{  // アラート設定情報
              setting.alert = group[key]?group[key][0]:null;
            }
            break;
          }
        });
      }

      this.initContent();
      // [end] #2603
    },
    err=>{
      this.initContent();
    });

    return false;
  }

  //
  // `pq-grid-title-row > th`とリサイズハンドラーをhoverしている間、
  // その `pq-col-index` を持つ列に `pd-grid-title-hovering` クラスを追加する。
  // 列をリサイズするためのハンドラーをhoverしている間も同じようなスタイルをつけるため、
  // ハンドラーのhoverイベントを対象の列のタイトル要素に対して hoverイベントをトリガーするようにしています。
  // @return void
  //
  private attachRowHoverStyle() {
    $(document)
      .on({
        mouseenter: function() {
          const pqColIndex = $(this).attr("pq-col-indx");
          $(this).closest(".pq-grid-center").find(`.pq-grid-cell[pq-col-indx=${pqColIndex}]`).addClass("pq-grid-title-hovering");
          $(this).closest(".pq-grid-center").find(`.pq-grid-title-row > th[pq-col-indx=${pqColIndex}]:not(.header-col-double)`).addClass("pq-grid-title-hovering");
        },
        mouseleave: function() {
          const pqColIndex = $(this).attr("pq-col-indx");
          $(this).closest(".pq-grid-center").find(`.pq-grid-cell[pq-col-indx=${pqColIndex}]`).removeClass("pq-grid-title-hovering");
          $(this).closest(".pq-grid-center").find(`.pq-grid-title-row > th[pq-col-indx=${pqColIndex}]:not(.header-col-double)`).removeClass("pq-grid-title-hovering");
        }
      }, ".pq-grid-title-row > th:not(.header-col-double)");

    $(document).on({
      'pqGrid:refreshRow pqGrid:refresh pqGrid:refreshCell': function() {
        // console.log("11refresh");
        // thの状態を見て、columnにクラスを付け直していく
        const $hoveringGridTitle = $(this).find("th.pq-grid-title-hovering");
        // console.log($hoveringGridTitle);
        $hoveringGridTitle.trigger("mouseenter");
      }
    }, ".pq-grid")

    $(document)
      .on({
        mouseenter: function() {
          const pqColIndex = $(this).attr("pq-col-indx");
          const gridTtile = $(this).closest(".pq-grid-center").find(`.pq-grid-title-row > th[pq-col-indx=${pqColIndex}]`);
          gridTtile.trigger("mouseenter");
        },
        mouseleave: function() {
          const pqColIndex = $(this).attr("pq-col-indx");
          const gridTtile = $(this).closest(".pq-grid-center").find(`.pq-grid-title-row > th[pq-col-indx=${pqColIndex}]`);
          gridTtile.trigger("mouseleave");
        }
      }, ".pq-grid-col-resize-handle");
  }

  private electronHyperLink(){
    const electron = (window as any).electron;
    if(electron){
      const shell = electron.shell;

      $(document).on('click', 'a[href^="http"]', function(event) {
        var self = this as any;
        event.preventDefault();
        shell.openExternal(self.href);
      });
    }
  }
}
