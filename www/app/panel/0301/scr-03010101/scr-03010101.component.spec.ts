/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03010101Component } from './scr-03010101.component';

describe('Scr03010101Component', () => {
  let component: Scr03010101Component;
  let fixture: ComponentFixture<Scr03010101Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03010101Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03010101Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
