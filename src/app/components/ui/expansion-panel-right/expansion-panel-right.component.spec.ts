import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpansionPanelRightComponent } from './expansion-panel-right.component';

describe('ExpansionPanelRightComponent', () => {
  let component: ExpansionPanelRightComponent;
  let fixture: ComponentFixture<ExpansionPanelRightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExpansionPanelRightComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpansionPanelRightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
