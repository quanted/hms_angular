import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExecutionPanelComponent } from './execution-panel.component';

describe('ExecutionPanelComponent', () => {
  let component: ExecutionPanelComponent;
  let fixture: ComponentFixture<ExecutionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExecutionPanelComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
