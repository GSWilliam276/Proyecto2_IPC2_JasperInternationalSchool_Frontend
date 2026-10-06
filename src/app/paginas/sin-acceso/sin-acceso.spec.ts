import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SinAcceso } from './sin-acceso';

describe('SinAcceso', () => {
  let component: SinAcceso;
  let fixture: ComponentFixture<SinAcceso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SinAcceso],
    }).compileComponents();

    fixture = TestBed.createComponent(SinAcceso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
