import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaTarifas } from './lista-tarifas';

describe('ListaTarifas', () => {
  let component: ListaTarifas;
  let fixture: ComponentFixture<ListaTarifas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaTarifas],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaTarifas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
