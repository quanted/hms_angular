import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpansionPanelLeftComponent } from './expansion-panel-left.component';

describe('ExpansionPanelLeftComponent', () => {
  let component: ExpansionPanelLeftComponent;
  let fixture: ComponentFixture<ExpansionPanelLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpansionPanelLeftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpansionPanelLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
