import { TestBed } from '@angular/core/testing';

import { GeneExpDataService } from './gene-exp-data.service';

describe('GeneExpDataService', () => {
  let service: GeneExpDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GeneExpDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
