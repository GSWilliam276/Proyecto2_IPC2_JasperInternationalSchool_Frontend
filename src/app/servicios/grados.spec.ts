import { TestBed } from '@angular/core/testing';
import { Grados } from './grados';

describe('Grados', () => {
  let service: Grados;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Grados);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
