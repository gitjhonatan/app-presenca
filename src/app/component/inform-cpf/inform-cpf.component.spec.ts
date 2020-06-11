import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InformCPFComponent } from './inform-cpf.component';

describe('InformCPFComponent', () => {
  let component: InformCPFComponent;
  let fixture: ComponentFixture<InformCPFComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InformCPFComponent ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InformCPFComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
