import { TestBed } from '@angular/core/testing';
import { Libros } from './libros';

describe('Libros', () => {
  let service: Libros;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Libros);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
