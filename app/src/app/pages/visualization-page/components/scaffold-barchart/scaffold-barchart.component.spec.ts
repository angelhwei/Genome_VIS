import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaffoldBarchartComponent } from './scaffold-barchart.component';

describe('ScaffoldBarchartComponent', () => {
  let component: ScaffoldBarchartComponent;
  let fixture: ComponentFixture<ScaffoldBarchartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScaffoldBarchartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScaffoldBarchartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
