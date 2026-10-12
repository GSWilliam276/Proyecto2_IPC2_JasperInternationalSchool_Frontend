import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { Empleados, EmpleadoResumen } from '../../servicios/empleados';
import { FormularioEmpleado } from '../formulario-empleado/formulario-empleado';

/** Listado paginado de empleados: busqueda, crear, editar, activar y desactivar */
@Component({
  selector: 'app-lista-empleados',
  imports: [FormularioEmpleado, CurrencyPipe],
  templateUrl: './lista-empleados.html',
})
export class ListaEmpleados implements OnInit {
  private readonly servicio = inject(Empleados);

  protected readonly tamano = 10;
  protected readonly empleados = signal<EmpleadoResumen[]>([]);
  protected readonly pagina = signal(1);
  protected readonly cargando = signal(false);
  protected readonly error = signal('');

  protected readonly pendiente = signal<EmpleadoResumen | null>(null);
  protected readonly procesando = signal(false);
  protected readonly creando = signal(false);
  protected readonly editando = signal<EmpleadoResumen | null>(null);

  protected readonly hayMas = computed(() => this.empleados().length === this.tamano);

  private busqueda = '';
  private temporizador: ReturnType<typeof setTimeout> | undefined;

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.listar(this.pagina(), this.tamano, this.busqueda).subscribe({
      next: (lista) => {
        this.empleados.set(lista);
        this.cargando.set(false);
      },
      error: (e) => {
        this.cargando.set(false);
        this.error.set(e.error?.mensaje ?? 'No se pudo cargar la lista');
      },
    });
  }

  /** El debounce espera 350 ms despues de la ultima tecla antes de consultar */
  protected alEscribir(texto: string): void {
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => {
      this.busqueda = texto.trim();
      this.pagina.set(1);
      this.cargar();
    }, 350);
  }

  protected anterior(): void {
    if (this.pagina() > 1) {
      this.pagina.update((p) => p - 1);
      this.cargar();
    }
  }

  protected siguiente(): void {
    if (this.hayMas()) {
      this.pagina.update((p) => p + 1);
      this.cargar();
    }
  }

  /** "BIBLIOTECARIO" -> "Bibliotecario", para mostrar*/
  protected etiquetaPuesto(puesto: string): string {
    return puesto.charAt(0) + puesto.slice(1).toLowerCase();
  }

  /** "2024-03-01" -> "01/03/2024" */
  protected formatear(fecha: string): string {
    const [anio, mes, dia] = fecha.split('-');
    return `${dia}/${mes}/${anio}`;
  }

  /** Desactivar a un maestro, secretaria o bibliotecario tambien desactiva su cuenta de acces */
  protected arrastraCuenta(e: EmpleadoResumen): boolean {
    return e.idUsuario !== null && ['MAESTRO', 'SECRETARIA', 'BIBLIOTECARIO'].includes(e.puesto);
  }

  //Activar / desactivar con confirmacion 

  protected pedirConfirmacion(empleado: EmpleadoResumen): void {
    this.pendiente.set(empleado);
  }

  protected cancelarConfirmacion(): void {
    this.pendiente.set(null);
  }

  protected confirmar(): void {
    const empleado = this.pendiente();
    if (!empleado) {
      return;
    }
    this.procesando.set(true);

    const peticion =
      empleado.estado === 'ACTIVO'
        ? this.servicio.desactivar(empleado.idEmpleado)
        : this.servicio.activar(empleado.idEmpleado);

    peticion.subscribe({
      next: () => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.cargar();
      },
      error: (e) => {
        this.procesando.set(false);
        this.pendiente.set(null);
        this.error.set(e.error?.mensaje ?? 'No se pudo completar la acción');
      },
    });
  }

  //Crear y editar 

  /** El formulario guardo (creando o editando): se cierra y se recarga */
  protected alGuardar(): void {
    const eraCreacion = this.creando();
    this.creando.set(false);
    this.editando.set(null);
    if (eraCreacion) {
      this.pagina.set(1);
    }
    this.cargar();
  }
}
