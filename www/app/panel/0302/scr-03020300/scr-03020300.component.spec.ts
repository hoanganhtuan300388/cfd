/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03020300Component } from './scr-03020300.component';

describe('Scr03020300Component', () => {
  let component: Scr03020300Component;
  let fixture: ComponentFixture<Scr03020300Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03020300Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03020300Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
