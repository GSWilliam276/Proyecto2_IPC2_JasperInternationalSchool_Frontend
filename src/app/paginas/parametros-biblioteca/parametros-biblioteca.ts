import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ParametrosActuales, Parametros } from '../../servicios/parametros-biblioteca';

/** El plazo se cuenta en dias enteros */
const entero = (c: AbstractControl): ValidationErrors | null =>
  Number.isInteger(c.value) ? null : { entero: true };

/** Pantalla para consultar y editar el plazo de prestamo y la multa por dia (CU103 y CU104) */
@Component({
  selector: 'app-parametros-biblioteca',
  imports: [ReactiveFormsModule, CurrencyPipe],
  templateUrl: './parametros-biblioteca.html',
})
export class ParametrosBiblioteca implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly servicio = inject(Parametros);

  protected readonly vigentes = signal<ParametrosActuales | null>(null);
  protected readonly cargando = signal(true);
  protected readonly guardando = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal(false);

  protected readonly formulario = this.fb.nonNullable.group({
    diasPrestamo: [7, [Validators.required, Validators.min(1), Validators.max(365), entero]],
    multaPorDia: [1, [Validators.required, Validators.min(0.01), Validators.max(1000)]],
  });

  ngOnInit(): void {
    this.servicio.consultar().subscribe({
      next: (p) => {
        this.vigentes.set(p);
        this.formulario.patchValue(p);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los parámetros');
      },
    });
  }

  protected guardar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.exito.set(false);

    this.servicio.editar(this.formulario.getRawValue()).subscribe({
      next: (p) => {
        this.guardando.set(false);
        this.vigentes.set(p);
        this.exito.set(true);
      },
      error: (e) => {
        this.guardando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudieron guardar los parámetros');
      },
    });
  }
}
