/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { MiniChartComponent } from './mini-chart.component';

describe('MiniChartComponent', () => {
  let component: MiniChartComponent;
  let fixture: ComponentFixture<MiniChartComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MiniChartComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MiniChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
