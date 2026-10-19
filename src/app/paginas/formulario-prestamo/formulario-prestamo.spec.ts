import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioPrestamo } from './formulario-prestamo';

describe('FormularioPrestamo', () => {
  let component: FormularioPrestamo;
  let fixture: ComponentFixture<FormularioPrestamo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioPrestamo],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioPrestamo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
