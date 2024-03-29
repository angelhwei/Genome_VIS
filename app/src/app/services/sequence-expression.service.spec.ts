import { TestBed } from '@angular/core/testing';

import { SequenceExpressionService } from './sequence-expression.service';

describe('SequenceExpressionService', () => {
  let service: SequenceExpressionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SequenceExpressionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
