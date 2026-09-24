import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyInquiries } from './my-inquiries';

describe('MyInquiries', () => {
  let component: MyInquiries;
  let fixture: ComponentFixture<MyInquiries>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyInquiries],
    }).compileComponents();

    fixture = TestBed.createComponent(MyInquiries);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
