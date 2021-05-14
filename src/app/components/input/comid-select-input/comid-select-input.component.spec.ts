import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ComidSelectInputComponent } from './comid-select-input.component';

describe('MapSelectInputComponent', () => {
  let component: ComidSelectInputComponent;
  let fixture: ComponentFixture<ComidSelectInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ComidSelectInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ComidSelectInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
