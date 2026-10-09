import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaCarreras } from './lista-carreras';

describe('ListaCarreras', () => {
  let component: ListaCarreras;
  let fixture: ComponentFixture<ListaCarreras>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCarreras],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaCarreras);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
