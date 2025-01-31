import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FontbaukastenComponent } from './fontbaukasten.component';

describe('FontbaukastenComponent', () => {
  let component: FontbaukastenComponent;
  let fixture: ComponentFixture<FontbaukastenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FontbaukastenComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FontbaukastenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
