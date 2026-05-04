import type { IconType } from 'react-icons/lib';
import React from 'react';

const ICONOS_CTI40PLUS_BASE_PATH = '/img.portal.cticontrol.com/iconos_CTI40_plus';

const ICONOS_CTI40PLUS_IDS = [
  1, 2, 3, 7, 10, 13, 17, 20, 21, 22, 23, 24, 30, 31, 35, 36, 37, 38, 41, 46, 47, 48, 49, 53, 55, 56, 57, 59, 63, 65, 69, 71, 72, 77, 80, 116, 123, 124, 143, 144, 145, 146, 147, 148, 153, 154, 155,
  156, 157, 198, 199, 206, 270, 322, 331, 340, 341, 342, 343, 344, 347, 348, 352, 354, 355, 357, 358, 359, 360, 361, 362, 363, 364, 365, 366, 372, 373, 374, 378, 379, 380, 381, 382, 383, 384, 385,
  386, 387, 388, 389, 390, 391, 392, 393, 394, 403, 404, 405, 406, 407, 408, 409, 410, 411, 412, 414, 415, 416, 417, 418, 419, 420, 421, 422, 423, 424, 425, 426, 427, 429, 432, 433, 434, 435, 436,
  437, 447, 448, 449, 450, 451, 452, 453, 454, 455, 456, 457, 458, 459, 460, 461, 462, 463, 464, 465, 466, 467, 468, 469, 470
] as const;

function crearIconoCTI40Plus(id: number): IconType {
  const IconoCTI40PlusSvg: IconType = ({ size = 24, title, className, style }) => {
    return React.createElement('img', {
      src: `${ICONOS_CTI40PLUS_BASE_PATH}/${id}.svg`,
      alt: title ?? '',
      title,
      className,
      draggable: false,
      'aria-hidden': title === undefined ? true : undefined,
      style: { display: 'inline-block', width: size, height: size, flexShrink: 0, objectFit: 'contain', verticalAlign: 'middle', ...style }
    });
  };

  return IconoCTI40PlusSvg;
}

const ICONO_CTI40PLUS_MAP: Record<number, IconType> = Object.fromEntries(ICONOS_CTI40PLUS_IDS.map((id) => [id, crearIconoCTI40Plus(id)]));

/** Devuelve el componente de icono para un id de icono de barra, o null si no existe mapeo. */
export function resolverIconoCTI40Plus(id: number): IconType | null {
  return ICONO_CTI40PLUS_MAP[id] ?? null;
}
