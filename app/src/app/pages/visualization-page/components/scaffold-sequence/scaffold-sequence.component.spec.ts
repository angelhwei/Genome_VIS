import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScaffoldSequenceComponent } from './scaffold-sequence.component';

describe('ScaffoldSequenceComponent', () => {
  let component: ScaffoldSequenceComponent;
  let fixture: ComponentFixture<ScaffoldSequenceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScaffoldSequenceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ScaffoldSequenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
