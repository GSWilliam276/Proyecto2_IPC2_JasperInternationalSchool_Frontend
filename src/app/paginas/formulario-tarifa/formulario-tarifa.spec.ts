import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioTarifa } from './formulario-tarifa';

describe('FormularioTarifa', () => {
  let component: FormularioTarifa;
  let fixture: ComponentFixture<FormularioTarifa>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioTarifa],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioTarifa);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
