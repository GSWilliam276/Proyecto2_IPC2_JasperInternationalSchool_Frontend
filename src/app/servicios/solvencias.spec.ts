import { TestBed } from '@angular/core/testing';
import { Solvencias } from './solvencias';

describe('Solvencias', () => {
  let service: Solvencias;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Solvencias);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
