import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetalleCurriculo } from './detalle-curriculo';

describe('DetalleCurriculo', () => {
  let component: DetalleCurriculo;
  let fixture: ComponentFixture<DetalleCurriculo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleCurriculo],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleCurriculo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
