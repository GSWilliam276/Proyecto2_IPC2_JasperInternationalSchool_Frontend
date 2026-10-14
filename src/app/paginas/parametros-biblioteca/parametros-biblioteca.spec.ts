import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParametrosBiblioteca } from './parametros-biblioteca';

describe('ParametrosBiblioteca', () => {
  let component: ParametrosBiblioteca;
  let fixture: ComponentFixture<ParametrosBiblioteca>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParametrosBiblioteca],
    }).compileComponents();

    fixture = TestBed.createComponent(ParametrosBiblioteca);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
