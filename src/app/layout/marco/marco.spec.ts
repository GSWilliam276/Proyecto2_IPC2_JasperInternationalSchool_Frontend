import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Marco } from './marco';

describe('Marco', () => {
  let component: Marco;
  let fixture: ComponentFixture<Marco>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Marco],
    }).compileComponents();

    fixture = TestBed.createComponent(Marco);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
