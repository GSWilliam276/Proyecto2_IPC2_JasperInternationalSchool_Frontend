import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaMisCursos } from './lista-mis-cursos';

describe('ListaMisCursos', () => {
  let component: ListaMisCursos;
  let fixture: ComponentFixture<ListaMisCursos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaMisCursos],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaMisCursos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
