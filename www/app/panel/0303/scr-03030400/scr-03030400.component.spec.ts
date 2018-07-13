/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03030400Component } from './scr-03030400.component';

describe('Scr03030400Component', () => {
  let component: Scr03030400Component;
  let fixture: ComponentFixture<Scr03030400Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03030400Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03030400Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
