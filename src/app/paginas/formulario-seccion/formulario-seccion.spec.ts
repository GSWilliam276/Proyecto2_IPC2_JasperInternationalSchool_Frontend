import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioSeccion } from './formulario-seccion';

describe('FormularioSeccion', () => {
  let component: FormularioSeccion;
  let fixture: ComponentFixture<FormularioSeccion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioSeccion],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioSeccion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
