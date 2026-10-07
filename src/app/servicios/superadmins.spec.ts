import { TestBed } from '@angular/core/testing';
import { Superadmins } from './superadmins';

describe('Superadmins', () => {
  let service: Superadmins;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Superadmins);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
