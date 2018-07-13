/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03010100Component } from './scr-03010100.component';

describe('Scr03010100Component', () => {
  let component: Scr03010100Component;
  let fixture: ComponentFixture<Scr03010100Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03010100Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03010100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
