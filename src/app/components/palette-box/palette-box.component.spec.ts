import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaletteBoxComponent } from './palette-box.component';

describe('PaletteBoxComponent', () => {
  let component: PaletteBoxComponent;
  let fixture: ComponentFixture<PaletteBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletteBoxComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PaletteBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
