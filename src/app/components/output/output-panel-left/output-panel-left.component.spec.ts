import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OutputPanelLeftComponent } from './output-panel-left.component';

describe('OutputPanelLeftComponent', () => {
  let component: OutputPanelLeftComponent;
  let fixture: ComponentFixture<OutputPanelLeftComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OutputPanelLeftComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OutputPanelLeftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
