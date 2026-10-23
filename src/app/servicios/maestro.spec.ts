import { TestBed } from '@angular/core/testing';
import { Maestro } from './maestro';

describe('Maestro', () => {
  let service: Maestro;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Maestro);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
