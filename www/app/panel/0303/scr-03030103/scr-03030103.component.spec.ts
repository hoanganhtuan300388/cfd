/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03030103Component } from './scr-03030103.component';

describe('Scr03030103Component', () => {
  let component: Scr03030103Component;
  let fixture: ComponentFixture<Scr03030103Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03030103Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03030103Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
