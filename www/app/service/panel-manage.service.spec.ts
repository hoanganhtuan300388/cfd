/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PanelManageService } from './panel-manage.service';

describe('PanelManageService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PanelManageService]
    });
  });

  it('should ...', inject([PanelManageService], (service: PanelManageService) => {
    expect(service).toBeTruthy();
  }));
});
