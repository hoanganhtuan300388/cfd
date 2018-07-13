/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { Scr03010200Component } from './scr-03010200.component';

describe('Scr03010200Component', () => {
  let component: Scr03010200Component;
  let fixture: ComponentFixture<Scr03010200Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ Scr03010200Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(Scr03010200Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
