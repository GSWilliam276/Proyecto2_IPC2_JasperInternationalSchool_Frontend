import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsistenciaMaestro } from './asistencia-maestro';

describe('AsistenciaMaestro', () => {
  let component: AsistenciaMaestro;
  let fixture: ComponentFixture<AsistenciaMaestro>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsistenciaMaestro],
    }).compileComponents();

    fixture = TestBed.createComponent(AsistenciaMaestro);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
