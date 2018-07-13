/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03010400Component } from './scr-03010400.component';

describe('Scr03010400Component', () => {
  let component: Scr03010400Component;
  let fixture: ComponentFixture<Scr03010400Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03010400Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03010400Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
