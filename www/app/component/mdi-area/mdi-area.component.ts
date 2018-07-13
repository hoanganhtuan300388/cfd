import { Component, OnInit, Input, ChangeDetectorRef, SimpleChanges, ElementRef } from '@angular/core';
import { PanelManageService, IPanelInfo } from "../../core/common";

declare var $:any;

@Component({
  selector: 'mdi-area',
  templateUrl: './mdi-area.component.html',
  styleUrls: ['./mdi-area.component.css']
})
export class MdiAreaComponent {
  uniqueId:string;

  @Input('virtual-index') virtualIndex: number;
  @Input('panels') panels: IPanelInfo[];
  @Input('active') active: boolean;

  constructor(private panelMng:PanelManageService,
              private _changeRef: ChangeDetectorRef) {

  }

  /**
   * init object
   */
  ngOnInit() {
    // force stop scroll
    let $cont = $('mdi-area');
    $cont.on("scroll", ()=>{
      $cont.scrollTop(0);
    });    
  }

  /**
   * 
   */
  public getContent( scr:IPanelInfo ){
    return `<${scr.component} id='${scr.uniqueId}'></${scr.component}>`;
  }
}
