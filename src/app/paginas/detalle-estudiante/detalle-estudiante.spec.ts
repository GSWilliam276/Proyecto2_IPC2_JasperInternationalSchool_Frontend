import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleEstudiante } from './detalle-estudiante';

describe('DetalleEstudiante', () => {
  let component: DetalleEstudiante;
  let fixture: ComponentFixture<DetalleEstudiante>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleEstudiante],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleEstudiante);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
