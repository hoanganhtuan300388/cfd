import { Component } from '@angular/core';
import { DialogComponent, DialogService } from "ng2-bootstrap-modal";
 
@Component({  selector: 'confirm',
  template: `<div class="modal-content">
                <div class="modal-header">
                  <button type="button" class="close" (click)="close()" >&times;</button>
                  <h4 class="modal-title">{{title || 'Confirm'}}</h4>
                </div>
                <div class="modal-body">
                  <p>{{message || 'Are you sure?'}}</p>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" (click)="confirm()">OK</button>
                  <button type="button" class="btn btn-default" (click)="close()" >Cancel</button>
                </div>
              </div>` 
})
export class ConfirmComponent extends DialogComponent<any,any> {
  public title :any;  // 最適化作業
  public message :any;  // 最適化作業
  constructor(dialogService: DialogService) {
    super(dialogService);
  }
  confirm() {
    // we set dialog result as true on click on confirm button, 
    // then we can get dialog result from caller code 
    this.result = true;
    this.close();
  }
}