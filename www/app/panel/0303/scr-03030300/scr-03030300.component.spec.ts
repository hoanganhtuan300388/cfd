/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03030300Component } from './scr-03030300.component';

describe('Scr03030300Component', () => {
  let component: Scr03030300Component;
  let fixture: ComponentFixture<Scr03030300Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03030300Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03030300Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
