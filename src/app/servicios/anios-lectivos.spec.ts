import { TestBed } from '@angular/core/testing';
import { AniosLectivos } from './anios-lectivos';

describe('AniosLectivos', () => {
  let service: AniosLectivos;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AniosLectivos);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
