/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03030200Component } from './scr-03030200.component';

describe('Scr03030200Component', () => {
  let component: Scr03030200Component;
  let fixture: ComponentFixture<Scr03030200Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03030200Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03030200Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
