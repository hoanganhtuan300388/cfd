/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03020200Component } from './scr-03020200.component';

describe('Scr03020200Component', () => {
  let component: Scr03020200Component;
  let fixture: ComponentFixture<Scr03020200Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03020200Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03020200Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
