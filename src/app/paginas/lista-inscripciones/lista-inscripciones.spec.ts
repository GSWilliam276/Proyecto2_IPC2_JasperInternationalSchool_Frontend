import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaInscripciones } from './lista-inscripciones';

describe('ListaInscripciones', () => {
  let component: ListaInscripciones;
  let fixture: ComponentFixture<ListaInscripciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaInscripciones],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaInscripciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
