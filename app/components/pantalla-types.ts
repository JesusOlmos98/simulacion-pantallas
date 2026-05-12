// Tipos compartidos entre Omega y CTI40 Plus

export type ObjBase = Record<string, unknown> & { tipoObjeto: number };

export interface DescriptorPantalla {
  idPantalla: number; // 0 para la principal
  indicePantalla: number;
  esPrincipal: boolean;
  idUnicoEdicion?: number; // presente al navegar desde una línea (valorEditableONav)
}
