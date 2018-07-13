/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03020100Component } from './scr-03020100.component';

describe('Scr03020100Component', () => {
  let component: Scr03020100Component;
  let fixture: ComponentFixture<Scr03020100Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03020100Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03020100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
