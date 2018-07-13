/**
 *
 * CFD銘柄コードコントロール
 *
 */
import { Component, OnInit, ElementRef, Output, EventEmitter, Input, ChangeDetectorRef } from '@angular/core';
import { PanelViewBase, PanelManageService, ResourceService, BusinessService, WindowService,
         CommonConst, Tooltips,
         IViewState, ViewBase } from "../../core/common";
import {LocalStorage} from '../../util/utils';
import {conversion} from '../../util/stringUtil';

// #1301
import { DetectChange } from '../../util/commonUtil';
//

declare var _: any;

//-----------------------------------------------------------------------------
// COMPONENT : SymbolCfdComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'symbol-cfd',
  templateUrl: './symbol-cfd.component.html',
  styleUrls: ['./symbol-cfd.component.scss']
})
export class SymbolCfdComponent {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  @Input('isSearchButtonVisible') public isSearchButtonVisible: boolean = true;
  public isSearchPanelVisible: boolean = false;
  public showList: Array<any> = [];
  public productList: Array<any> = [];
  public watchList: Array<any> = [];
  public historyList: Array<any> = [];
  public classifiedproductList02: Array<any> = [];
  public classifiedproductList03: Array<any> = [];
  public classifiedproductList04: Array<any> = [];
  public classifiedproductList05: Array<any> = [];

  public cfdSymbolName: string;
  public cfdSymbolCode:string = "";
  public searchCode:string = "";
  public productType:string = "00";

  public showHistory:boolean = true;
  public showResult:boolean = false;
    // 選択されたTableの行
  private selectedRow:EventTarget = null;

  public currentPage: number = 0;
  public keyword: string = "";
  public btnWidth: string = "232px";

  private symbolCodeNameMatrix = {};
  private bindMouseDown;

  public baseIdx:number = 0;

  @Input()
  set product(val){
    this.setProductCode(val);
  }

  // event emitter.
  @Output()
  changed = new EventEmitter();

  @Input()
  set btnwidth(val){
    this.btnWidth = val + 'px';
  }

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(private panelMng:PanelManageService,
              private resource:ResourceService,
              private windowService:WindowService,
              private business:BusinessService,
              private changeRef:ChangeDetectorRef,
              public element: ElementRef) {

    // // 銘柄一覧取得
    // business.getProductList().subscribe(val=>{
    //   console.log(val);
    // })

    // // 分類済み銘柄一覧取得
    // business.getClassifiedProducts().subscribe(val=>{
    //   console.log(val);
    // })

    // ウォッチリスト一覧取得
/*    business.getWatchList().subscribe(val=>{
      console.log(val);
    })*/

    // this.getClassifiedProducts();
    // this.getProductList();
  }

  ngOnInit() {
    this.getClassifiedProducts();
    this.getProductList();

  }

  ngAfterViewInit() {
    $(this.element.nativeElement).find('.button').css('width', this.btnWidth);
    let offset = $(this.element.nativeElement).find(".button-dropdown-frame").offset();
    if (offset != undefined) {
      let maxHeight = $(".container").height();
      if (offset.top+220 > maxHeight) {
        let drop = $(this.element.nativeElement).find(".dropdown-menu-search");
        drop.css("top",-222);
      }
    }
    this.initCode();
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------

  // #1301
  public updateSymbol(code:string, text:string, trigger?:boolean) {
    let self = this;
    self.cfdSymbolCode = code;
    self.cfdSymbolName = self.symbolCodeNameMatrix[self.cfdSymbolCode];

    if(trigger === true) {
      // send event
      var event = document.createEvent('Event');

      event.initEvent( 'change', false, true );
      event["selected"] = {symbolName:text, symbolCode:code};

      self.changed.emit(event);
    }
    else {
      DetectChange(self.changeRef)
    }
  }
  //

  private setProductCode(code:string){
    this.cfdSymbolCode = code;
  }

  public onSearch(event:Event){
    if(!this.bindMouseDown){
      this.isSearchPanelVisible = !this.isSearchPanelVisible;
      this.productType = "00";
      //this.cfdSymbolName = "";
      this.searchCode = "";
      this.showHistory = true;
      this.showResult = false;
      $(this.element.nativeElement).find(".li-search").trigger("click");
      this.getProductList();
      this.bindMouseDown = _.bind(this.onMouseDown,this);
      $(document).bind( 'mousedown', this.bindMouseDown);
    } else {
      this.closeSearch();
    }
  }

  public onMouseDown(event:Event){
    var BreakException = {};

    try{
      if(event['originalEvent'] && event['originalEvent'].path){
        var path = event['originalEvent'].path;
        path.forEach(el => {
          if(el == this.element.nativeElement)
            throw BreakException;
        });
      }
    }catch(e){
      return;
    }

    this.closeSearch();
  }

  public closeSearch(){
    $(document).unbind( 'mousedown', this.bindMouseDown);
    this.bindMouseDown = null;
    this.isSearchPanelVisible = !this.isSearchPanelVisible;
    this.showList.length = 0;
  }

    // 分類済み銘柄一覧
  private getClassifiedProducts() {
    this.business.getClassifiedProducts().subscribe(
      res => {
        // var jsn = res.json();
        if (res) {
          this.classifiedproductList02.length = 0;
          this.classifiedproductList03.length = 0;
          this.classifiedproductList04.length = 0;
          this.classifiedproductList05.length = 0;
            // console.log("getClassifiedProducts start");
          //if (Array.isArray(res)) {
            res.result.forEach(element => {
              if (element.categoryLabel == "指数・商品") {
                  element.productList.forEach(element => {
                    this.classifiedproductList02.push(element);
                  });
                }
                if (element.categoryLabel == "米国株") {
                  element.productList.forEach(element => {
                    this.classifiedproductList03.push(element);
                  });
                }
                if (element.categoryLabel == "中国株") {
                  element.productList.forEach(element => {
                    this.classifiedproductList04.push(element);
                  });
                }
                if (element.categoryLabel == "ETF") {
                  element.productList.forEach(element => {
                    this.classifiedproductList05.push(element);
                  });
                }
              // if (element.categoryLabel == "商品" || element.categoryLabel == "その他指数" || element.categoryLabel == "株価指数") {
              //   element.productList.forEach(element => {
              //     if(element.productList){
              //       element.productList.forEach(element => {
              //         this.classifiedproductList02.push(element);
              //       });
              //     }else{
              //       this.classifiedproductList02.push(element);
              //     }
              //   });
              // }
              // if (element.categoryLabel == "米国株") {
              //   element.productList.forEach(element => {
              //     element.productList.forEach(element => {
              //       this.classifiedproductList03.push(element);
              //     });
              //   });
              // }
              // if (element.categoryLabel == "中国株") {
              //   element.productList.forEach(element => {
              //     element.productList.forEach(element => {
              //       this.classifiedproductList04.push(element);
              //     });
              //   });
              // }
              // if (element.categoryLabel == "ハイレバETF" || element.categoryLabel == "株価指数ETF" || element.categoryLabel == "REIT") {
              //   element.productList.forEach(element => {
              //     if(element.productList){
              //       element.productList.forEach(element => {
              //         this.classifiedproductList05.push(element);
              //       });
              //     }else{
              //       this.classifiedproductList05.push(element);
              //     }
              //   });
              // }
            });
          //}
        }
        // console.log("getClassifiedProducts end");
      },
    );
  }

  // 銘柄一覧
  private getProductList() {
    this.business.getProductList().subscribe(
      res => {
        // var jsn = res.json();
        if (res) {
          this.productList.length = 0;
          //if (Array.isArray(res)) {
            res.result.productList.forEach(element => {
              this.productList.push(element);
              this.showList = this.getHistory();
              this.symbolCodeNameMatrix[element.cfdProductCode] = element.meigaraSeiKanji;
            });
          //}
          this.getWatchList();
          this.initCode();
        }
      },
    );
  }

  // ウォッチリスト一覧
  private getWatchList() {
    this.business.getWatchList().subscribe(
      res => {
        if( res && res.status == '0'){
          if (res.result.watchList) {
            this.watchList.length = 0;
            res.result.watchList.forEach(element => {
              let symbol = {"cfdProductCode":element,"meigaraSeiKanji":this.symbolCodeNameMatrix[element]};
              this.watchList.push(symbol);
            });
          }
        }
      },
    );
  }

// 検索選択肢のイベント
  public onclickProductType(e){
    let scroll = $(this.element.nativeElement).find(".table-area");
    if (scroll) {
      scroll.scrollTop(0);
    }
    this.showList.length = 0;
    switch (this.productType) {
      case "00":
        if(this.searchCode == ""){
          this.showHistory = true;
          this.showResult = false;
        }else{
          this.showHistory = false;
          this.showResult = true;
        }
/*        this.productList.forEach(element => {
          this.showList.push(element);
        });*/
        this.inCfdSymbolCodeflg(this.searchCode);
        break;
      case "01":
        this.showHistory = false;
        if(this.searchCode != ""){
          this.showResult = true;
        }else{
          this.showResult = false;
        }
        this.inCfdSymbolCodeflg(this.searchCode);
/*        this.watchList.forEach(element => {
          this.showList.push(element);
        });*/
        break;
      case "02":
        this.showHistory = false;
        if(this.searchCode != ""){
          this.showResult = true;
        }else{
          this.showResult = false;
        }
/*        this.classifiedproductList02.forEach(element => {
          this.showList.push(element);
        });*/
        this.inCfdSymbolCodeflg(this.searchCode);
        break;
      case "03":
        this.showHistory = false;
        if(this.searchCode != ""){
          this.showResult = true;
        }else{
          this.showResult = false;
        }
/*        this.classifiedproductList03.forEach(element => {
          this.showList.push(element);
        });*/
        this.inCfdSymbolCodeflg(this.searchCode);
        break;
      case "04":
        this.showHistory = false;
        if(this.searchCode != ""){
          this.showResult = true;
        }else{
          this.showResult = false;
        }
/*      this.classifiedproductList04.forEach(element => {
        this.showList.push(element);
      });*/
      this.inCfdSymbolCodeflg(this.searchCode);
      break;
      case "05":
        this.showHistory = false;
        if(this.searchCode != ""){
          this.showResult = true;
        }else{
          this.showResult = false;
        }
/*        this.classifiedproductList05.forEach(element => {
          this.showList.push(element);
        });*/
        this.inCfdSymbolCodeflg(this.searchCode);
        break;
      default:
        break;
    }
  }

// 入力情報の取得
  public inCfdSymbolCode(event:string) {
    this.searchCode = event;
    if (this.searchCode) {
      this.showHistory = false;
      this.showResult = true;
    }else{
      if(this.productType == "00"){
        this.showHistory = true;
      }
      this.showResult = false;
    }
    this.inCfdSymbolCodeflg(this.searchCode);
    this.changeRef.detectChanges();
  }

// 入力情報のデータ表示
  public inCfdSymbolCodeflg(keyword: string) {
    let keywords = conversion(keyword).split(" ");
    switch (this.productType) {
      case "00":
        if (this.showResult) {
          this.showList = this.getResult(this.productList,keywords);
        } else {
          this.showList = this.getHistory();
        }
        break;
      case "01":
        this.showList = this.getResult(this.watchList,keywords);
        break;
      case "02":
        this.showList = this.getResult(this.classifiedproductList02,keywords);
        break;
      case "03":
        this.showList = this.getResult(this.classifiedproductList03,keywords);
        break;
      case "04":
        this.showList = this.getResult(this.classifiedproductList04,keywords);
        break;
      case "05":
        this.showList = this.getResult(this.classifiedproductList05,keywords);
        break;
      default:
        break;
    }
  }

  /**
   *  選択された銘柄を記録する。
   */
  private selected( e:Event, code:string, text:string ){

    // 選択したTableの行を色表示
    if( this.selectedRow ){
      $(this.selectedRow).removeClass( 'selected' );
    }

    $(e.currentTarget).addClass( 'selected' );

    this.selectedRow = e.currentTarget;

    this.closeSearch();
    this.saveHistory({cfdProductCode:code, meigaraSeiKanji:text});
    this.changedCode( code, text );
  }

    /**
   * 銘柄を選択して画面閉じる。
   *
   */
  // private selectOk( e:Event, code:string, text:string ){
  //   this.closeSearch();
  //   this.changedCode( code, text );
  // }

  private initCode(){
    if(this.cfdSymbolCode){
      this.cfdSymbolName = this.symbolCodeNameMatrix[this.cfdSymbolCode];
    }
  }

  /**
   *
   * @param code
   * @param text
   */
  public  changedCode(code:string, text:string){
    this.cfdSymbolName = text;
    this.cfdSymbolCode = code;

    // send event
    var event = document.createEvent('Event');

    event.initEvent( 'change', false, true );
    event["selected"] = {symbolName:text, symbolCode:code};

    this.changed.emit(event);
  }

  private saveHistory(symbol){
    let list = LocalStorage.getUserValue("recentMeigaraList");
    this.historyList.length = 0;
    if (!list) {
      this.historyList.unshift(symbol);
    } else if (list.length < 30) {
      this.historyList = list;
      let hit = null;
      for (let index = 0; index < list.length; index++) {
        if (list[index].cfdProductCode == symbol.cfdProductCode) {
          hit = index;
          break;
        }
      }
      if (hit != null) {
        this.historyList.splice(hit,1);
      }
      this.historyList.unshift(symbol);
    } else {
      this.historyList = list;
      if (list.filter((element)=>element.cfdProductCode==symbol.cfdProductCode).length == 0) {
        this.historyList.pop();
        this.historyList.unshift(symbol);
      }
    }
    LocalStorage.setUserValue("recentMeigaraList",this.historyList);
  }

  private getHistory(){
    if (LocalStorage.getUserValue("recentMeigaraList")) {
      return LocalStorage.getUserValue("recentMeigaraList");
    } else {
      return [];
    }
  }

  private getResult(list:Array<any>,keywords:Array<string>){
    return list.filter((element)=> this.contains(element.cfdProductCode,keywords) || this.contains(element.meigaraSeiKanji,keywords) || this.contains(element.meigaraSeiKana,keywords) || this.contains(element.meigaraSeiBkana,keywords) || this.contains(element.meigaraRyakuKanji,keywords) || this.contains(element.meigaraRyakuKana,keywords) || this.contains(element.meigaraEiji,keywords) || this.contains(element.securitiesCode,keywords) || this.contains(element.companyName1,keywords) || this.contains(element.companyName2,keywords) || this.contains(element.companyName3,keywords));
    }

  private contains(str:string,keys:Array<string>){
    if (!str) {
      return false;
    }
    let contain:boolean = true;
    str = conversion(str);
    keys.forEach(key => {
      if (!str.includes(key)) {
        contain = false;
        return contain;
      }
    });
    return contain;
  }

}
