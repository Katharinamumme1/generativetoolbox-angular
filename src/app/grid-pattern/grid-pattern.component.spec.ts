import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GridPatternComponent } from './grid-pattern.component';

describe('GridPatternComponent', () => {
  let component: GridPatternComponent;
  let fixture: ComponentFixture<GridPatternComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GridPatternComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GridPatternComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
