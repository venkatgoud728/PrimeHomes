import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OwnerInquiries } from './owner-inquiries';

describe('OwnerInquiries', () => {
  let component: OwnerInquiries;
  let fixture: ComponentFixture<OwnerInquiries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OwnerInquiries],
    }).compileComponents();

    fixture = TestBed.createComponent(OwnerInquiries);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
