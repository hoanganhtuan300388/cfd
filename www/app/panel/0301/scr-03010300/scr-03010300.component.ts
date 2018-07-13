/**
 * 
 * 設定
 * 
 */
import { Component, ElementRef, ChangeDetectorRef, ViewChild } from '@angular/core';
import { PanelManageService, PanelViewBase, ResourceService, BusinessService,
         IViewData, CommonEnum, CommonConst, Tooltips } from '../../../core/common';
import { IConfigSetting, IConfigComm, IConfigAlert } from '../../../core/configinterface';
import { MessageBox } from '../../../util/utils';
import { Messages} from '../../../../../common/message';

// #2386
import { DeepCopy } from '../../../util/commonUtil';
//

declare var $:any;  // for jquery

//-----------------------------------------------------------------------------
// COMPONENT : Scr03010300Component
// ----------------------------------------------------------------------------
@Component({
  selector: 'scr-03010300',
  templateUrl: './scr-03010300.component.html',
  styleUrls: ['./scr-03010300.component.scss']
})
export class Scr03010300Component extends PanelViewBase {

  @ViewChild('slider') slider: ElementRef;

  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------
  public selectTab:string = "0";

  public  setting:IConfigSetting;  // clone config setting 
  private origin:IConfigSetting;   // orgin config setting

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor( public screenMng:PanelManageService,
               public element: ElementRef,
               public resource:ResourceService,
               public business:BusinessService,
               public changeRef:ChangeDetectorRef) {                 
    super( '03010300', screenMng, element, changeRef); 

    // #2386
    this.origin  = DeepCopy(resource.config.setting);
    this.setting = DeepCopy(resource.config.setting);
    //
  }

  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------
  ngAfterViewInit() {
    super.ngAfterViewInit();
  }

  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
  /**
   * 
   * @param event 
   */
  public onSelected(event){
    this.selectTab = event;
    $(this.slider.nativeElement).carousel(parseInt(event));
  }

  /**
   * DLG画面を閉じる。
   */
  public confirm(event, status: string) {
		if(status === 'OK') {
      this.saveConfig(this.setting);
      this.close();
		}
		else if(status === 'APPLY') {
      this.saveConfig(this.setting);
    }
    else{
      // this.saveConfig(this.origin);
      // #2386 : just close
      this.close();      
    }
  }

  /**
   * 
   */
  private isModified(){
    var setting = JSON.stringify(this.setting);
    var origin  = JSON.stringify(this.origin);

    return setting != origin;
  }

  /**
   * 
   */
  private saveConfig(setting:any){
    // #2386
    let self = this;
    if(self.isModified()){      
      self.business.setSettings(self.makeInput(setting)).subscribe(
        val=>{
          if(val.status == "0"){
            self.resource.config.setting = DeepCopy(setting); // #2386
            
            self.origin = DeepCopy(setting); // #2386

            self.resource.fireUpdateConfig();
          }else{
            MessageBox.info({title:'設定保存エラー', message:Messages.ERR_0001+'[CFDS3201T]'});
          }
        },
        err=>{
          MessageBox.info({title:'設定保存エラー', message:Messages.ERR_0002+'[CFDS3202C]'});
        }
      )
    }
    //
  }

  private makeInput(setting:IConfigSetting){
    var result = [];

    // 注文設定情報
    result.push({'001':[{orderSettings:setting.order.orderSettings}]});

    // 銘柄別注文設定情報
    result.push({'002':[setting.orderProduct]});
    
    // サウンド設定情報
    result.push({'003':[{soundSettings:setting.sound.soundSettings}]});
    
    // 表示設定情報
    result.push({'004':[{displaySettings:setting.display.displaySettings}]});

    // チャート表示設定情報
    result.push({'005':[{chartSettings:setting.chartDisplay.chartSettings}]});

    // チャート色設定情報
    result.push({'006':[{chartColorSettings:setting.chartColor.chartColorSettings}]});

    // テクニカル設定情報
    result.push({'007':[setting.chartTech]});

    return result;
  }
}
