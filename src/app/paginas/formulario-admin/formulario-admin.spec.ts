import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioAdmin } from './formulario-admin';

describe('FormularioAdmin', () => {
  let component: FormularioAdmin;
  let fixture: ComponentFixture<FormularioAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
