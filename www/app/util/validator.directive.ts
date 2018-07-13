import { Directive, ElementRef, forwardRef, Attribute, Output, EventEmitter, HostListener, Input } from '@angular/core';
import { Validator, AbstractControl, NG_VALIDATORS } from '@angular/forms';
import * as StringUtil from './stringUtil';

declare var $: any;

@Directive({
    // selector: '[validatorNumber][formControlName],[validatorNumber][formControl],[validatorNumber][ngModel]',
    selector: '[validator-number]',
    exportAs:'ValidatorNumber',
    providers: [
        { provide: NG_VALIDATORS, useExisting: forwardRef(() => ValidatorNumber), multi: true }
    ]
})
export class ValidatorNumber implements Validator {
    @Input('active') public active=true;
    @Input('min') public _valMin;
    @Input('max') public _valMax;
    @Input('base') public _valBase;
    @Input('unit') 
    set unit(val){
        if(val){
            let point = val.toString().split('.')[1];

            this._point = (point)?point.length:0;
            this._format = StringUtil.getBoUnitFormat(val, false);        
            this._valUnit = val;
            
            if(this._point > 0 ){
                this._regex = /^\d+(\.?\d*)$/;
            }
        }
    } 
    @Input('restrict') 
    set restrict(val){
        this._regex = new RegExp(val);
    }
    @Output() ngModelChange = new EventEmitter();

    // get element value
    get value(){
        return this.element.nativeElement.value;
    }

    public validatorNumber:string;
    private _point = 0;
    private _valUnit = 1;
    private _regex = /^[0-9]*$/;
    private _format = '#';

    //-------------------------------------------------------------------------
    //
    //-------------------------------------------------------------------------
    constructor( private element:ElementRef) {
        this._valMax  = 999999;
        this._valMin  = 0;
        this._valUnit = 1;
        // console.log(this);
    }

    //-------------------------------------------------------------------------
    //
    //-------------------------------------------------------------------------
    private setValue( value:number ){      
        value = Number(value.toFixed(this._point));
        value = Math.max( value, this._valMin );
        value = Math.min( value, this._valMax );

        let str = StringUtil.formatNumber(value, this._format);
        if(this.element.nativeElement.maxLength > 0) {
          if(Number(this.element.nativeElement.maxLength) < str.length){
            return;
          }
        }
        
        this.element.nativeElement.value = str;
        this.ngModelChange.emit(str);
    }

    private useBase(value){
        return this._valBase && !value;
    }

    public increase(){
        let value = this.element.nativeElement.value;

        if(this.useBase(value)){
            this.setValue( this._valBase );
        }else{
            this.setValue( Number(value) + this._valUnit );   
        }
    }

    public decrease(){
        let value = this.element.nativeElement.value;

        if(this.useBase(value)){
            this.setValue( this._valBase );
        }else{
            this.setValue( Number(value) - this._valUnit );   
        }
    }
    
    @HostListener('keydown', ['$event']) onKeyDown(event) {
        if(event.keyCode == 38 ){
            // up key down
            this.increase();
            return
        }
        if(event.keyCode == 40 ){
            // down key down
            this.decrease();
            return
        }
    }

    @HostListener('mousewheel', ['$event']) onMouseWheel(event) {
        if(event.wheelDeltaY > 0 ){
            // up wheel
            this.increase();
            return
        }
        if(event.wheelDeltaY < 0 ){
            // down wheel
            this.decrease();
            return
        }
    }

    //-------------------------------------------------------------------------
    //　input-restrict
    //-------------------------------------------------------------------------
    @HostListener('keypress', ['$event']) onKeyPress(event) {
        let e = <KeyboardEvent> event;
        // let regExp =  new RegExp(this._regex);
        let caretPos: number = this.element.nativeElement.selectionStart;
        let curText: string = this.element.nativeElement.value;
        let nextText: string = curText.substring(0, caretPos).concat(e.key).concat(curText.substr(caretPos));
        let invalid = !nextText.match(this._regex);

        if( invalid ) {
            event.preventDefault();
        } else {
            return;
        }
    }

    //-------------------------------------------------------------------------
    //
    //-------------------------------------------------------------------------
    checkVal(value:string){
        let v = parseInt(value);
        let cutValue;
        if( v >= parseInt(this._valMin.toString()) && v <= parseInt(this._valMax.toString()) ){
            return true;
        }
        return false;    
    }

    validate(c: AbstractControl): { [key: string]: any } {
        if(!this.active){
            return null;
        }
        if (c.value === undefined || !c.value) {
            return null;
        }
        let val = Number(c.value.toString());
        if (isNaN(val)) {
            this.element.nativeElement.value = "";
            this.ngModelChange.emit(this.value);
            return null;
        }
        let chkRange = true;
        let inputVals = c.value.toString().split('.');
        let fmtMaxVals = this._valMax.toString().split('.');
        // console.log("====inputVals=====", inputVals, fmtMaxVals);
        if (Number(c.value) < this._valMin || inputVals[0].length > fmtMaxVals[0].length) {
          chkRange = false;
        }
        if (inputVals.length > 1) {
            if (fmtMaxVals.length == 1) {
                chkRange = false;
            } else if (inputVals[1].length > fmtMaxVals[1].length) {
                chkRange = false;
            }
        }
        if (!chkRange) {
            // #3263, #3291
            let cutValue = inputVals[0].substring(0, fmtMaxVals[0].length);
            if (inputVals.length > 1 && fmtMaxVals.length > 1) {
                cutValue = cutValue + '.' + inputVals[1].substring(0, fmtMaxVals[1].length);
            }
            this.element.nativeElement.value = cutValue;
            this.ngModelChange.emit(cutValue);

            // #3263, #3291問題に従って削除する。
            // Lengthを比較して最大値以上になったら空白表示
            // this.element.nativeElement.value = '';
            // this.ngModelChange.emit('');
            // [end] #3263, #3291
            return null;
        }
        if (parseInt(inputVals[0]) > parseInt(fmtMaxVals[0])) {
            let cutValue = inputVals[0].substring(0,fmtMaxVals[0].length-1);
            this.element.nativeElement.value = cutValue;
            this.ngModelChange.emit(cutValue);
            return null;
        } else if (inputVals.length > 1 && parseInt(inputVals[1]) > parseInt(fmtMaxVals[1])) {
            let cutValue = inputVals[0].substring(0, fmtMaxVals[0].length) + '.' + inputVals[1].substring(0, fmtMaxVals[1].length-1);
            this.element.nativeElement.value = cutValue;
            this.ngModelChange.emit(cutValue);
            return null;
        }
        return null;
        // let e = c.root.get(this.validatorNumber);
        // this.flag  = false;
        //return {validatorNumber: false };

        // control vlaue
        // let e = c.root.get(this.validatorNumber);

        // // value not equal
        // if (e && v !== e.value && !this.isReverse) {
        //   return {
        //     validatorNumber: false
        //   }
        // }

        // // value equal and reverse
        // if (e && v === e.value && this.isReverse) {
        //     delete e.errors['validatorNumber'];
        //     if (!Object.keys(e.errors).length) e.setErrors(null);
        // }

        // // value not equal and reverse
        // if (e && v !== e.value && this.isReverse) {
        //     e.setErrors({
        //         validatorNumber: false
        //     })
        // }

        // return null;
    }
}