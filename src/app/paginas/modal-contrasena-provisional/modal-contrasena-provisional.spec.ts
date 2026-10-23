import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalContrasenaProvisional } from './modal-contrasena-provisional';

describe('ModalContrasenaProvisional', () => {
  let component: ModalContrasenaProvisional;
  let fixture: ComponentFixture<ModalContrasenaProvisional>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalContrasenaProvisional],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalContrasenaProvisional);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
