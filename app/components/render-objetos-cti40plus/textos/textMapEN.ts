import { EnTextos } from '@/src/utils/common-lib-commac-generador/enumTextos';

// Map de textos en inglés - O(1) lookup
export const textMapEN = new Map<number | EnTextos, string>([
  [EnTextos.textNoText, ''],
  [EnTextos.textClimaRecinto, 'Room climate'],
  [EnTextos.textTemperaturaDeseada, 'Desired temperature'],
  [EnTextos.textCorreccionHumedad, 'Humidity correction'],
  [EnTextos.textVentilacion, 'Ventilation']
  // TODO: Completar traducciones al inglés
]);
