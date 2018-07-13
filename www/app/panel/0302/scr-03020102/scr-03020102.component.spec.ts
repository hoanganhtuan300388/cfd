/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03020102Component } from './scr-03020102.component';

describe('Scr03020102Component', () => {
  let component: Scr03020102Component;
  let fixture: ComponentFixture<Scr03020102Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03020102Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03020102Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
