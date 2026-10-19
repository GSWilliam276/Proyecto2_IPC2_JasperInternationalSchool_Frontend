import { TestBed } from '@angular/core/testing';
import { Multas } from './multas';

describe('Multas', () => {
  let service: Multas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Multas);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
