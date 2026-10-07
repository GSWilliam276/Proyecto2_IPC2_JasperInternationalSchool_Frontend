import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaSuperadmins } from './lista-superadmins';

describe('ListaSuperadmins', () => {
  let component: ListaSuperadmins;
  let fixture: ComponentFixture<ListaSuperadmins>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaSuperadmins],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaSuperadmins);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
