import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioAnioLectivo } from './formulario-anio-lectivo';

describe('FormularioAnioLectivo', () => {
  let component: FormularioAnioLectivo;
  let fixture: ComponentFixture<FormularioAnioLectivo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAnioLectivo],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioAnioLectivo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
