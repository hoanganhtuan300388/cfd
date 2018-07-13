import { Directive, HostListener, ElementRef, Input, Output, EventEmitter } from '@angular/core';

@Directive({
  selector: '[tab-Index]'
})
export class TabIndexDirective {
  @Input('type') public _type;
  @Input('minIndex') public _minIndex;
  @Output() dismissErrorKbn:EventEmitter<any> = new EventEmitter();
  private target;
  constructor(private element:ElementRef) {
    this.target = $(element.nativeElement);
    this.target.click(() => {
      let errKbn = this.target.attr("errorKbn");
      if (errKbn) {
        this.dismissErrorKbn.emit(errKbn);
      }
    })
  }

  @HostListener('keydown', ['$event']) onKeyDown(event:KeyboardEvent) {
    switch (event.keyCode) {
      case 9:
        //tab key
        if (this._minIndex) {
          while (true) {
            let first = $(".container").find("[tabindex=" + this._minIndex.toString() + "]");
            if (first.length > 0) {
              first.focus();
              event.preventDefault();
              break;
            }
            this._minIndex += 10;
          }
        } else {
          let n = Math.floor(Number(this.target.attr("tabindex"))/10)*10;
          while(true){
            n += 10;
            let idx = n.toString();
            let next = $(".container").find("[tabindex=" + idx + "]");
            let type = next.attr("tabtype");
            if (next.length > 0 && type != "radio") {
              next.focus();
              event.preventDefault();
              break;
            } else {
              for (let index = 1; index < 4; index++) {
                let key = (n + index).toString();
                let hit = $(".container").find("[tabindex=" + key + "]");
                if (hit.length > 0) {
                  hit.focus();
                  event.preventDefault();
                  return;
                }
              }
            }
          }
        }
        break;
      case 13:
        // enter key
        if (this._type == "ToggleButton") {
          this.target.trigger("click");
        }
        break;
      case 32:
        // space key
    /*     if (this._type == "Symbol") {
          this.target.trigger("click");
          this.removeCss(this.target);
        } */
        break;
      case 37:
        // arrow left
        if (this._type == "ToggleButton") {
          let idx = (Number(this.target.attr("tabindex")) - 1).toString();
          let leftElement = this.target.parent().parent().find("[tabindex=" + idx + "]");
          if (leftElement.length != 0) {
            leftElement.trigger("click");
            leftElement.focus();
          }
        }
        break;
      case 38:
        // arrow up
        if (this._type == "Symbol") {
          this.target.trigger("click");
        } else if (this._type == "Radio") {
          let idxUp = (Number(this.target.attr("tabindex")) - 40).toString();
          let idxDown = (Number(this.target.attr("tabindex")) + 40).toString();
          let upElement = this.target.parent().parent().parent().parent().find("[tabindex=" + idxUp + "]");
          let downElement = this.target.parent().parent().parent().parent().find("[tabindex=" + idxDown + "]");
          if (upElement.attr("tabtype") == "radio") {
            upElement.parent().trigger("click");
            upElement.focus();
          } else if (downElement.attr("tabtype") == "radio") {
            downElement.parent().trigger("click");
            downElement.focus();
          }
        }
        break;
      case 39:
        // arrow right
        if (this._type == "ToggleButton") {
          let idx = (Number(this.target.attr("tabindex")) + 1).toString();
          let rightElement = this.target.parent().parent().find("[tabindex=" + idx + "]");
          if (rightElement.length != 0) {
            rightElement.trigger("click");
            rightElement.focus();
          }
        }
        break;
      case 40:
        // arrow down
        if (this._type == "Symbol") {
          this.target.trigger("click");
        } else if (this._type == "Radio") {
          let idxUp = (Number(this.target.attr("tabindex")) - 40).toString();
          let idxDown = (Number(this.target.attr("tabindex")) + 40).toString();
          let upElement = this.target.parent().parent().parent().parent().find("[tabindex=" + idxUp + "]");
          let downElement = this.target.parent().parent().parent().parent().find("[tabindex=" + idxDown + "]");
          if (upElement.attr("tabtype") == "radio") {
            upElement.parent().trigger("click");
            upElement.focus();
          } else if (downElement.attr("tabtype") == "radio") {
            downElement.parent().trigger("click");
            downElement.focus();
          }
        }
        break;
      default:
        break;
    }
  }

  @HostListener('focus', ['$event']) onFocus(event) {
    this.addCss(this.target);
  }

  @HostListener('focusout', ['$event']) onFocusout(event) {
    this.removeCss(this.target);
  }

  private addCss(target){
    if (target.attr("type") == "checkbox") {
      target.next().find(".check").addClass('tab-focusing');
    }
  }

  private removeCss(target){
    if (target.attr("type") == "checkbox") {
      target.next().find(".check").removeClass('tab-focusing');
    }
  }
}
