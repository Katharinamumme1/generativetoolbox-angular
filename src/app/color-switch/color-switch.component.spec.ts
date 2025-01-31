import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorSwitchComponent } from './color-switch.component';

describe('ColorSwitchComponent', () => {
  let component: ColorSwitchComponent;
  let fixture: ComponentFixture<ColorSwitchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColorSwitchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ColorSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
