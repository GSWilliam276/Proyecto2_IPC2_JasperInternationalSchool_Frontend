import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioGrado } from './formulario-grado';

describe('FormularioGrado', () => {
  let component: FormularioGrado;
  let fixture: ComponentFixture<FormularioGrado>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioGrado],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioGrado);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
