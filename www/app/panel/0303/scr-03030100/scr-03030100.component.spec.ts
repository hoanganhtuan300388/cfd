/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03030100Component } from './scr-03030100.component';

describe('Scr03030100Component', () => {
  let component: Scr03030100Component;
  let fixture: ComponentFixture<Scr03030100Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03030100Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03030100Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
