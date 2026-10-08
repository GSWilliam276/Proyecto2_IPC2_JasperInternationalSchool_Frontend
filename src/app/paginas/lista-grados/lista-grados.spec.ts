import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaGrados } from './lista-grados';

describe('ListaGrados', () => {
  let component: ListaGrados;
  let fixture: ComponentFixture<ListaGrados>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaGrados],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaGrados);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
