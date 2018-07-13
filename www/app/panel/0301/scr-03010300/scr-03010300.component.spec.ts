/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03010300Component } from './scr-03010300.component';

describe('Scr03010300Component', () => {
  let component: Scr03010300Component;
  let fixture: ComponentFixture<Scr03010300Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03010300Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03010300Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
