import { TestBed } from '@angular/core/testing';
import { PropertyBadge } from './property-badge';

describe('PropertyBadge', () => {
  let service: PropertyBadge;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PropertyBadge);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
