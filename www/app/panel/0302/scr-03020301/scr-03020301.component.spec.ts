/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03020301Component } from './scr-03020301.component';

describe('Scr03020301Component', () => {
  let component: Scr03020301Component;
  let fixture: ComponentFixture<Scr03020301Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03020301Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03020301Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
