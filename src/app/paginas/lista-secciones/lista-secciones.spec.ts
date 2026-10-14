import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaSecciones } from './lista-secciones';

describe('ListaSecciones', () => {
  let component: ListaSecciones;
  let fixture: ComponentFixture<ListaSecciones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaSecciones],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaSecciones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
