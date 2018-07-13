import { Directive, ElementRef, Input, HostListener } from '@angular/core';

@Directive({
    selector: '[input-restrict]'
})
export class InputRestrict {
    @Input('input-restrict') regex: string;

    constructor(private element:ElementRef) {
    }

    @HostListener('keypress', ['$event']) onKeyPress(event) {
        let e = <KeyboardEvent> event;
        // console.log("====keypress====", e.charCode, e.key, e.keyCode, e.shiftKey, e.ctrlKey);
        let regExp =  new RegExp(this.regex);
        let caretPos: number = this.element.nativeElement.selectionStart;
        let curText: string = this.element.nativeElement.value;
        let nextText: string = curText.substring(0, caretPos).concat(e.key).concat(curText.substr(caretPos));
        // console.log("====nextText====", nextText);
        if (nextText && !nextText.match(regExp)) {
            event.preventDefault();
        } else {
            return;
        }
    }

    // 保留
    // @HostListener('keydown', ['$event']) onKeyDown(event) {
    //     let e = <KeyboardEvent> event;
    //         // BackSpace, Tab, Enter, Esc, Delete
    //     if ([8, 9, 13, 27, 46].indexOf(e.keyCode) !== -1 ||
    //         // Ctrl+A
    //         (e.keyCode === 65 && (e.ctrlKey || e.metaKey)) ||
    //         // Ctrl+C
    //         (e.keyCode === 67 && (e.ctrlKey || e.metaKey)) ||
    //         // Ctrl+V
    //         (e.keyCode === 86 && (e.ctrlKey || e.metaKey)) ||
    //         // Ctrl+X
    //         (e.keyCode === 88 && (e.ctrlKey || e.metaKey)) ||
    //         // End, Home, Left, Up, Right, Down
    //         (e.keyCode >= 35 && e.keyCode <= 40)) {
    //         return;
    //     }

    //     let inputChar = String.fromCharCode(e.keyCode);
    //     // Num 0-9
    //     if (e.keyCode >= 96 && e.keyCode <= 105) {
    //         inputChar = String(e.keyCode - 96);
    //     }
    //     let regExp =  new RegExp(this.regex);
    //     let caretPos: number = this.element.nativeElement.selectionStart;
    //     let curText: string = this.element.nativeElement.value;
    //     let nextText: string = curText.substring(0, caretPos).concat(inputChar).concat(curText.substr(caretPos));
    //     if (nextText && !nextText.match(regExp)) {
    //         event.preventDefault();
    //     } else {
    //         return;
    //     }
    // }    
}