import { TestBed } from '@angular/core/testing';
import { Curriculos } from './curriculos';

describe('Curriculos', () => {
  let service: Curriculos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Curriculos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
