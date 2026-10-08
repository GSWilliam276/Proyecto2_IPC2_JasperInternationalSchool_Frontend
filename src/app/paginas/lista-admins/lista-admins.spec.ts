import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaAdmins } from './lista-admins';

describe('ListaAdmins', () => {
  let component: ListaAdmins;
  let fixture: ComponentFixture<ListaAdmins>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaAdmins],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaAdmins);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
