import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorialDialogContentComponent } from './tutorial-dialog-content.component';

describe('TutorialDialogContentComponent', () => {
  let component: TutorialDialogContentComponent;
  let fixture: ComponentFixture<TutorialDialogContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TutorialDialogContentComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TutorialDialogContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
