import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ListaSolvencias } from './lista-solvencias';

describe('ListaSolvencias', () => {
  let component: ListaSolvencias;
  let fixture: ComponentFixture<ListaSolvencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaSolvencias],
    }).compileComponents();

    fixture = TestBed.createComponent(ListaSolvencias);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
