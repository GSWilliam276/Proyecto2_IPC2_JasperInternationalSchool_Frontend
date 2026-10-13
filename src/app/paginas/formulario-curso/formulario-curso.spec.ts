import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioCurso } from './formulario-curso';

describe('FormularioCurso', () => {
  let component: FormularioCurso;
  let fixture: ComponentFixture<FormularioCurso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioCurso],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioCurso);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
