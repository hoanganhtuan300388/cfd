/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { ManagerService } from './manager.service';

describe('ManagerService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ManagerService]
    });
  });

  it('should ...', inject([ManagerService], (service: ManagerService) => {
    expect(service).toBeTruthy();
  }));
});
