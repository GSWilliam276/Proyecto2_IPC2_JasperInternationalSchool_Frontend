import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioGraduacion } from './formulario-graduacion';

describe('FormularioGraduacion', () => {
  let component: FormularioGraduacion;
  let fixture: ComponentFixture<FormularioGraduacion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioGraduacion],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioGraduacion);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
