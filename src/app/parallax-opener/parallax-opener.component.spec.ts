import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParallaxOpenerComponent } from './parallax-opener.component';

describe('ParallaxOpenerComponent', () => {
  let component: ParallaxOpenerComponent;
  let fixture: ComponentFixture<ParallaxOpenerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParallaxOpenerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParallaxOpenerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
