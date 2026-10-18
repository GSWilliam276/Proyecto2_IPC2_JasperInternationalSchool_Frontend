import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioPago } from './formulario-pago';

describe('FormularioPago', () => {
  let component: FormularioPago;
  let fixture: ComponentFixture<FormularioPago>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioPago],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioPago);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
