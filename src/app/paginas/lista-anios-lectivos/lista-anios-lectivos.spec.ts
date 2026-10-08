import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaAniosLectivos } from './lista-anios-lectivos';

describe('ListaAniosLectivos', () => {
  let component: ListaAniosLectivos;
  let fixture: ComponentFixture<ListaAniosLectivos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaAniosLectivos],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaAniosLectivos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
