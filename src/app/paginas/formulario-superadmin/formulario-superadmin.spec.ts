import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormularioSuperadmin } from './formulario-superadmin';

describe('FormularioSuperadmin', () => {
  let component: FormularioSuperadmin;
  let fixture: ComponentFixture<FormularioSuperadmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioSuperadmin],
    }).compileComponents();

    fixture = TestBed.createComponent(FormularioSuperadmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
