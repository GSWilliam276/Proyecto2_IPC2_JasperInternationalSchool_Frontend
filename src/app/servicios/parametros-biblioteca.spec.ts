import { TestBed } from '@angular/core/testing';
import { ParametrosBiblioteca } from './parametros-biblioteca';

describe('ParametrosBiblioteca', () => {
  let service: ParametrosBiblioteca;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParametrosBiblioteca);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
