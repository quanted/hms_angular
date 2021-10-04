import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutOutputComponent } from './about-output.component';

describe('AboutOutputComponent', () => {
  let component: AboutOutputComponent;
  let fixture: ComponentFixture<AboutOutputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AboutOutputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AboutOutputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
