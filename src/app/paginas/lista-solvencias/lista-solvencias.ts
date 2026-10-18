import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { EstudianteResumen, Estudiantes } from '../../servicios/estudiantes';
import { MESES } from '../../servicios/pagos';
import { SaldoResumen, SolvenciaResumen, Solvencias } from '../../servicios/solvencias';

/** Saldo de un estudiante, emision de solvencias (CU069) e historial de emitidas */
@Component({
  selector: 'app-lista-solvencias',
  imports: [CurrencyPipe],
  templateUrl: './lista-solvencias.html',
})
export class ListaSolvencias implements OnInit {
  private readonly servicio = inject(Solvencias);
  private readonly estudiantesServicio = inject(Estudiantes);

  protected readonly estudiantes = signal<EstudianteResumen[]>([]);
  protected readonly elegido = signal<number | null>(null);
  protected readonly saldo = signal<SaldoResumen | null>(null);
  protected readonly solvencias = signal<SolvenciaResumen[]>([]);
  protected readonly cargando = signal(false);
  protected readonly emitiendo = signal(false);
  protected readonly error = signal('');
  protected readonly exito = signal('');

  protected readonly nombreMes = (m: number) => MESES[m - 1];

  ngOnInit(): void {
    this.estudiantesServicio.listar(1, 100, '', 'ACTIVO').subscribe({
      next: (l) => this.estudiantes.set(l),
      error: (e) => this.error.set(e.error?.mensaje ?? 'No se pudieron cargar los estudiantes'),
    });
    this.cargarHistorial();
  }

  protected alElegir(valor: string): void {
    this.elegido.set(valor ? Number(valor) : null);
    this.saldo.set(null);
    this.error.set('');
    this.exito.set('');
    this.cargarHistorial();
    const id = this.elegido();
    if (id === null) {
      return;
    }
    this.cargando.set(true);
    this.servicio.saldo(id).subscribe({
      next: (s) => {
        this.saldo.set(s);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        //409: no esta inscrito en el año activo, o el grado no tiene tarifa
        this.error.set(e.error?.mensaje ?? 'No se pudo calcular el saldo');
      },
    });
  }

  protected generar(): void {
    const id = this.elegido();
    if (id === null) {
      return;
    }
    this.emitiendo.set(true);
    this.error.set('');
    this.exito.set('');
    this.servicio.emitir(id).subscribe({
      next: (s) => {
        this.emitiendo.set(false);
        this.exito.set(s.yaExistia
          ? `Ya existía la solvencia #${s.idSolvencia} de este mes para ${s.estudianteNombre}.`
          : `Solvencia #${s.idSolvencia} generada para ${s.estudianteNombre}.`);
        this.cargarHistorial();
      },
      error: (e) => {
        this.emitiendo.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo generar la solvencia');
      },
    });
  }

  private cargarHistorial(): void {
    this.servicio.listar(1, 20, this.elegido()).subscribe({ next: (l) => this.solvencias.set(l) });
  }

  protected fechaHora(texto: string): string {
    return texto.replace('T', ' ').substring(0, 16);
  }
}
