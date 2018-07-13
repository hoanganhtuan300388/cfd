/**
 * 
 * 設定：サウンド
 * 
 */
import { Component, OnInit, ElementRef, ChangeDetectorRef, Input } from '@angular/core';
import { PanelViewBase, ComponentViewBase, 
         PanelManageService, ResourceService, WindowService,
         CommonConst, Tooltips,
         IViewState, IViewData, ViewBase } from "../../core/common";

import { IConfigSound,IConfigSoundSettings } from '../../core/configinterface';
import * as BusinessConst from '../../const/businessConst';

//-----------------------------------------------------------------------------
// COMPONENT : ConfigSoundComponent
// ----------------------------------------------------------------------------
@Component({
  selector: 'config-sound',
  templateUrl: './config-sound.component.html',
  styleUrls: ['./config-sound.component.scss']
})
export class ConfigSoundComponent extends ComponentViewBase {
  //---------------------------------------------------------------------------
  // property
  // --------------------------------------------------------------------------

  @Input('config')
  set config(val){
    this.soundSettings = val.soundSettings;
  }
  public soundSettings:IConfigSoundSettings = {};
  public executionSoundFile:string = "";
  public alertSoundFile:string = "";
  private dirSeperator = "\\";

  //---------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------
  constructor(public panelMng:PanelManageService,
              public resource:ResourceService,
              public window:WindowService,
              public element: ElementRef,
              public changeRef:ChangeDetectorRef) {
    super(panelMng, element, changeRef);
  }
  
  ngAfterViewInit(){
    // for Mac os
    const electron = (window as any).electron;
    if(electron){
      var ipc  = electron.remote.require('./main');

      this.dirSeperator =  ipc.FileUtil.dirSeperator();
    }
        
    if (this.soundSettings.executionSoundFolder.length > 0) {
      this.executionSoundFile = this.soundSettings.executionSoundFolder + this.dirSeperator + this.soundSettings.executionSoundFile;
    } else {
      this.executionSoundFile = "";
    }
    if (this.soundSettings.alertSoundFolder.length > 0) {
      this.alertSoundFile = this.soundSettings.alertSoundFolder + this.dirSeperator + this.soundSettings.alertSoundFile;
    } else {
      this.alertSoundFile = "";
    }
  }

  /**
   * 視聴するボタンクリック時
   */
  public viewSound(type:string) {
    //let audio = this.element.nativeElement.find('#alertMusicFilePathBlock');
    //audio = this.alertMusicFilePathArea;
    if (type == "alert") {
      let audio = new Audio(this.alertSoundFile);
      audio.play();
    } else {
      let audio = new Audio(this.executionSoundFile);
      audio.play();
    }
  }

  public selectSoundFile(type:string) {
    let defaultDir='';

    if(type == 'alert'){
      defaultDir = this.soundSettings.alertSoundFolder;
    }else if(type == 'execution'){
      defaultDir = this.soundSettings.executionSoundFolder;
    }

    this.window.openSelectFile("mp3", defaultDir).subscribe(
      path => {
        if (path) {
          if (type == "alert") {
            this.soundSettings.alertSoundFolder = path.dir;
            this.soundSettings.alertSoundFile = path.base;
            this.alertSoundFile = path.file;
          } else {
            this.soundSettings.executionSoundFolder = path.dir;
            this.soundSettings.executionSoundFile = path.base;
            this.executionSoundFile = path.file;
          }
          this.updateView();
        }
      })
  }

  public init(){
    let soundSettings = this.resource.defaultSoundSetting();
    this.soundSettings.alertSound = soundSettings.alertSound;
    this.soundSettings.alertSoundFile = soundSettings.alertSoundFile;
    this.soundSettings.alertSoundFolder = soundSettings.alertSoundFolder;
    this.soundSettings.executionSound = soundSettings.executionSound;
    this.soundSettings.executionSoundFile = soundSettings.executionSoundFile;
    this.soundSettings.executionSoundFolder = soundSettings.executionSoundFolder;
    if (this.soundSettings.executionSoundFolder.length > 0) {
      this.executionSoundFile = this.soundSettings.executionSoundFolder + this.dirSeperator + this.soundSettings.executionSoundFile;
    } else {
      this.executionSoundFile = "";
    }
    if (this.soundSettings.alertSoundFolder.length > 0) {
      this.alertSoundFile = this.soundSettings.alertSoundFolder + this.dirSeperator + this.soundSettings.alertSoundFile;
    } else {
      this.alertSoundFile = "";
    }
    this.updateView();
  }
  //---------------------------------------------------------------------------
  // override
  //---------------------------------------------------------------------------


  //---------------------------------------------------------------------------
  // member
  //---------------------------------------------------------------------------
}
