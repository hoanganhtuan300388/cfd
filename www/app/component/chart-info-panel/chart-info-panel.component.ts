import { Component, OnInit, ElementRef, Output, EventEmitter } from '@angular/core';
import { PanelManageService, ComponentViewBase } from '../../core/common';

// #1439
import { ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { DetectChange } from '../../util/commonUtil';
//

import * as ChartConst from '../../const/chartConst'; // #2303

declare var moment:any;

export interface IIFourValuesInfoChild {
  display    : string;
  value      : string;
  color      : string;
}

export interface IIFourValuesInfo {
  display : string;
  isPrice : boolean;
  childs  : IIFourValuesInfoChild[];
}

export const MAX_DATA_COUNT = 10;
export const MAX_DATA_CHILD_COUNT = 10;

declare var $:any;

@Component({
  selector: 'chart-info-panel',
  templateUrl: './chart-info-panel.component.html',
  styleUrls: ['./chart-info-panel.component.scss']
})
export class ChartInfoPanelComponent extends ComponentViewBase {

  /* 非表示イベント */
  @Output() close = new EventEmitter();

  /* 始終高安値 */
  public currentDatas:Array<IIFourValuesInfo> = [];
  private defaultDisplays:any = ['','','','','']; // #2277

	public currentDatetime:string = "";

  constructor( public panelMng:PanelManageService,
               public element: ElementRef,
               public changeRef: ChangeDetectorRef) {
    super(panelMng, element, changeRef);
  }

  ngOnInit() {
    super.ngOnInit();

    // for (let j=0; j<MAX_DATA_COUNT; j++) {
    //   let childs:IIFourValuesInfoChild[] = [];
		//
    //   for(let i = 0; i < MAX_DATA_CHILD_COUNT; i++) {
    //     let child: IIFourValuesInfoChild = {
    //       display    : '',
    //       value      : '',
    //       color      : '',
    //     }
    //     childs.push(child);
    //   }
    //   let item: IIFourValuesInfo = {
    //     display : '',
    //     isPrice : true,
    //     childs  : childs,
    //   }
    //   this.currentDatas.push(item);
    // }
		//
    // for(let i = 0; i < this.defaultDisplays.length; i++) {
    //   this.currentDatas[0].childs[i].display = this.defaultDisplays[i];
    // }

  }

  ngAfterViewInit(){
    this.initPosition();
  }

  /**
   * パネルの位置設定
   */
  public initPosition(){
    var target = this.element.nativeElement.children[0];
    target.style.transform = `translate3d(${(35)}px, ${(68)}px, 0)`;
    target.style.top = '0px';
    target.style.left = '0px';
  }

  /*
   * パネル移動完了イベント
   */
  public onMoved($event) {
    // パネル位置が上下左右にはみ出した場合は親パネル内に納める
    const $parent = $(this.element.nativeElement.parentElement);
    const info = this.element.nativeElement.children[0];
    const $info = $(info);
    const parentRightLimit = $parent.position().left + $parent.width() - $info.width();
    const parentBottomLimit = $parent.position().top + $parent.height() - $info.height() - 8;
    let left = $info.position().left;
    let top = $info.position().top;
    let overflow = false;

    // 左右位置
    if ($parent.position().left > $info.position().left) {
      // 左に隠れている
      overflow = true;
      left = $parent.position().left;
    } else if (parentRightLimit < $info.position().left) {
      // 右に隠れている
      overflow = true;
      left = parentRightLimit;
    }

    // 上下位置
    if ($parent.position().top > $info.position().top) {
      // 上に隠れている
      overflow = true;
      top = $parent.position().top;
    } else if (parentBottomLimit < $info.position().top) {
      // 下に隠れている
      overflow = true;
      top = parentBottomLimit;
    }

    if (overflow) {
      info.style.transform = `translate3d(${(left)}px, ${(top)}px, 0)`;
    }
  }

  /*
   * 閉じるボタンクリックイベント
   */
  public onCloseInfoPanelBtnClicked() {
    this.close.emit();
  }

	private didUpdateCurrentDatas(dataCount:number, forceReset?:boolean) { // #2277
		let self = this;
		let nCount = self.currentDatas.length;
		if(forceReset === true || nCount != dataCount) {
			self.currentDatas = [];

			for (let j=0; j<dataCount; j++) {
	      let childs:IIFourValuesInfoChild[] = [];

	      for(let i = 0; i < MAX_DATA_CHILD_COUNT; i++) {
	        let child: IIFourValuesInfoChild = {
	          display    : '',
	          value      : '',
	          color      : '',
	        }
	        childs.push(child);
	      }
	      let item: IIFourValuesInfo = {
	        display : '',
	        isPrice : true,
	        childs  : childs,
	      }
	      this.currentDatas.push(item);
	    }

      if(this.currentDatas.length > 0) { // check count
        for(let i = 0; i < this.defaultDisplays.length; i++) {
          this.currentDatas[0].childs[i].display = this.defaultDisplays[i];
        }
      }
		}
	}

  /*
   * パネル情報更新
   * @param info 更新情報 Json
   */
  public updateInfo(info:any, timeType?:string) { // #2303
		// #1104
		let self = this;
		let dataInfo:any = JSON.parse(info);

    if(!timeType) {
      timeType = ChartConst.TIME_TYPE_DAY;
    }

    let newDatas = dataInfo.datas;
    // console.log('updateInfo newDatas ' + JSON.stringify(newDatas.length));
    if(newDatas) {
			let newDataCount:number = newDatas.length;

			self.didUpdateCurrentDatas(newDataCount, true); // #2319

      let isValid:boolean = false; // #2277

      // 追加されていれば表示
	    for(let i = 0; i < newDatas.length; i++) {
        let newData:any = newDatas[i];

        // #2277
        if(newData.isPrice == true) {
          if(newData.dateTime) {
            //
            let dateTimeFormatIn:string = 'YYYYMMDDHHmmss';
            let dataTimeFormatOut:string = 'MM/DD HH:mm';
            if(timeType == ChartConst.TIME_TYPE_DAY || timeType == ChartConst.TIME_TYPE_WEEK) {
              dataTimeFormatOut = 'YYYY/MM/DD';
            }
            else if(timeType == ChartConst.TIME_TYPE_MONTH) {
              dataTimeFormatOut = 'YYYY/MM';
            }
            else if(timeType == ChartConst.TIME_TYPE_TICK) {
              dataTimeFormatOut = 'HH:mm:ss';
            }

            self.currentDatetime = moment(newData.dateTime,dateTimeFormatIn).format(dataTimeFormatOut);

            if(self.currentDatetime.indexOf('Invalid') < 0) {
              isValid = true;
            }
          }
        }
        //

        if(isValid != true) {
          break;
        }

        this.currentDatas[i].display = newData.display;
        this.currentDatas[i].isPrice = newData.isPrice;

        // 要素
        let newDataChilds = newDatas[i].datas;
        for (let j = 0; j < newDataChilds.length; j++) {
          // 追加・更新されていれば表示
          this.currentDatas[i].childs[j].display = newDataChilds[j].display;
          this.currentDatas[i].childs[j].value = newDataChilds[j].value;
          this.currentDatas[i].childs[j].color = newDataChilds[j].color;
        }
      }

      // #2277
      if(isValid != true) {
        self.didUpdateCurrentDatas(newDataCount, true);
      }
      //

	    // 余計な要素を非表示
	    var findDatas = this.currentDatas.filter((item)=>item.display !== '');
	    if (findDatas.length > newDatas.length) {
	      for(let i = newDatas.length; i < findDatas.length; i++) {
	        // ---- 削除
	        this.currentDatas[i].display = '';
	        this.currentDatas[i].isPrice = true;
	        for (let j = 0; j < this.currentDatas[i].childs.length; j++) {
	          this.currentDatas[i].childs[j].display = '';
	          this.currentDatas[i].childs[j].value = '';
	          this.currentDatas[i].childs[j].color = '';
	        }
	      }
	    }
		}

    self.didCallDetectChange();
  }

  // #1439
	protected didCallDetectChange() {
    let self = this;
    DetectChange(self.changeRef);
  }
}
