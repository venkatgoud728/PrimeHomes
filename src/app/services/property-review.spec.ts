import { TestBed } from '@angular/core/testing';
import { PropertyReview } from './property-review';

describe('PropertyReview', () => {
  let service: PropertyReview;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyReview);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
