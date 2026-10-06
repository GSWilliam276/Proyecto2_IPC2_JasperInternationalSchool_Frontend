import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PanelSuperadmin } from './panel-superadmin';

describe('PanelSuperadmin', () => {
  let component: PanelSuperadmin;
  let fixture: ComponentFixture<PanelSuperadmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelSuperadmin],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelSuperadmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
