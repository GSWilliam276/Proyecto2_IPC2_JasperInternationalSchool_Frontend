import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioCurriculo } from './formulario-curriculo';

describe('FormularioCurriculo', () => {
  let component: FormularioCurriculo;
  let fixture: ComponentFixture<FormularioCurriculo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioCurriculo],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioCurriculo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
