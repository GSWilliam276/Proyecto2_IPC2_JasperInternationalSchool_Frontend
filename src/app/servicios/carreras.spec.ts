import { TestBed } from '@angular/core/testing';
import { Carreras } from './carreras';

describe('Carreras', () => {
  let service: Carreras;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Carreras);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
