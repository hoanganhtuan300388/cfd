import { Component, OnInit, Input, Output, EventEmitter, ElementRef } from '@angular/core';

declare var $:any;

export interface IDropdownItem{
  value:any;
  text:string;
}

@Component({
  selector: 'dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  public btnWidth: string = "auto";

  public _titleShow:boolean = false;

  public _titleOptionShow:boolean = false;

  @Input()
  disabled: boolean = false;

  @Input()
  items:IDropdownItem[];

  @Input()
  select:any;

  @Input()
  set btnwidth(val){
    this.btnWidth = val + 'px';
  }

  @Input('dropdown-title-show')
  set dropdownTitleShow(hide: boolean) {
    this._titleShow = hide;
  }
  // [dropdown-title-show]="true"

  @Input('dropdown-option-show')
  set dropdownOptionShow(hide: boolean) {
    this._titleOptionShow = hide;
  }

  @Output()
  changed = new EventEmitter();

  constructor( private element:ElementRef) { }

  ngOnInit() {
  }

  ngAfterViewInit() {
    let $btn = $(this.element.nativeElement).find('.button');
    $btn.css('width', this.btnWidth);
    let _self = this;
    $(document).on('click', $btn, function(event) {
      $(_self.element.nativeElement).find('.dropdown-menu').css('width', _self.btnWidth);
    });

  }

  /**
   * 選択されたmarket名を表示
   */
  public selectedText():string {
    let item = this.items.filter((item)=>item.value==this.select).pop();
    if(item != undefined)
      return item.text;
    else if (this.select != undefined && typeof (this.select) == "string")
      return this.select;
    else
      return "";
  }

  /**
   * event emit
   */
  private onChangeSelect( val ){
     var event = document.createEvent('Event');

    event.initEvent( 'change', false, true );

    event["selected"] = val;

    this.changed.emit(event);
  }
}
