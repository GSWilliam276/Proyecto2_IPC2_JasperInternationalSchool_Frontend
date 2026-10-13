import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaCurriculos } from './lista-curriculos';

describe('ListaCurriculos', () => {
  let component: ListaCurriculos;
  let fixture: ComponentFixture<ListaCurriculos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaCurriculos],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaCurriculos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
