import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DataUploadPageComponent } from './data-upload-page.component';

describe('DataUploadPageComponent', () => {
  let component: DataUploadPageComponent;
  let fixture: ComponentFixture<DataUploadPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataUploadPageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DataUploadPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
