import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SegmentStatusListComponent } from './segment-status-list.component';

describe('SegmentStatusListComponent', () => {
  let component: SegmentStatusListComponent;
  let fixture: ComponentFixture<SegmentStatusListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SegmentStatusListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SegmentStatusListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
