'use client';

import { useRef, useState, type JSX } from 'react';
import type { ObjBase } from '../pantalla-types';
import { decodificarVariable } from './pantalla-utils';
import { COLORES } from './colors';
import { EnTipoVariable } from '../../../src/utils/common-lib-commac-generador/NXP_BE/globals/enumOld';

interface Props {
  obj: ObjBase;
  value: string;
  onChange: (v: string) => void;
  isValid: boolean;
  onEnter?: () => void;
  responsive?: boolean;
}

// ─── Parse initial display strings ───────────────────────────────────────────

function parseMmSsStr(s: string): { min: number; seg: number } {
  const m = s.match(/^(\d+)m(\d+)s?$/i) ?? s.match(/^(\d+):(\d+)$/);
  if (m) return { min: parseInt(m[1]!, 10), seg: parseInt(m[2]!, 10) };
  return { min: 0, seg: 0 };
}

function parseHhMmStr(s: string): { hora: number; min: number } {
  const m = s.match(/^(\d+)h(\d+)m?$/i) ?? s.match(/^(\d+):(\d+)$/);
  if (m) return { hora: parseInt(m[1]!, 10), min: parseInt(m[2]!, 10) };
  return { hora: 0, min: 0 };
}

function parseHhMmSsStr(s: string): { hora: number; min: number; seg: number } {
  const m = s.match(/^(\d+)h(\d+)m(\d+)s?$/i) ?? s.match(/^(\d+):(\d+):(\d+)$/);
  if (m) return { hora: parseInt(m[1]!, 10), min: parseInt(m[2]!, 10), seg: parseInt(m[3]!, 10) };
  return { hora: 0, min: 0, seg: 0 };
}

function parseFechaStr(s: string): { dia: number; mes: number; yy: number } {
  const m = s.match(/^(\d+)\/(\d+)\/(\d+)$/);
  if (m) {
    const yy = parseInt(m[3]!, 10);
    return { dia: parseInt(m[1]!, 10), mes: parseInt(m[2]!, 10), yy: yy > 99 ? yy - 2000 : yy };
  }
  return { dia: 1, mes: 1, yy: 0 };
}

// ─── Clamp helpers ────────────────────────────────────────────────────────────

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

// ─── Sub-input component ──────────────────────────────────────────────────────

interface FieldProps {
  value: string;
  max: number;
  onChange: (v: string) => void;
  onEnter?: () => void;
  nextRef?: React.RefObject<HTMLInputElement | null>;
  autoFocus?: boolean;
  label: string;
  responsive?: boolean;
}

function toEditableValue(value: string): string {
  const normalized = value.replace(/^0+(?=\d)/, '');
  return normalized === '' ? '0' : normalized;
}

function TimeField({ value, max, onChange, onEnter, nextRef, autoFocus, label, responsive }: FieldProps): JSX.Element {
  const maxLen = String(max).length;
  const [draft, setDraft] = useState<string | null>(null);

  function handleChange(raw: string): void {
    const digits = raw.replace(/\D/g, '').slice(0, maxLen);
    setDraft(digits);
    onChange(digits);
    // auto-tab cuando alcanzamos la longitud máxima
    if (digits.length >= maxLen && nextRef?.current) {
      setDraft(null);
      nextRef.current.focus();
      nextRef.current.select();
    }
  }

  return (
    <div className="flex items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        value={draft ?? value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && onEnter) onEnter();
        }}
        onFocus={(e) => {
          setDraft(toEditableValue(value));
          e.target.select();
        }}
        onClick={(e) => e.currentTarget.select()}
        onBlur={() => setDraft(null)}
        className={`bg-transparent text-center outline-none [-moz-appearance:textfield] ${responsive ? 'text-2xl w-14' : 'text-6xl w-24'}`}
        style={{ color: COLORES.success }}
        autoFocus={autoFocus}
      />
      <span className={`text-white ${responsive ? 'text-lg' : 'text-4xl'}`}>{label}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function ObjEditVariablesTiempoFecha({ obj, value, onChange, isValid, onEnter, responsive }: Props): JSX.Element {
  const tipoVar = obj.tipoVar as number;
  const tipoVarEdicion = (obj.tipoVarEdicion ?? obj.tipoVar) as number;
  const maximo = obj.maximo as number;
  const minimo = obj.minimo as number;

  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);

  const minStr = decodificarVariable(minimo, tipoVar);
  const maxStr = decodificarVariable(maximo, tipoVar);

  // ─── MMSS ────────────────────────────────────────────────────────────────────

  if (tipoVar === EnTipoVariable.tiempoMs || tipoVar === EnTipoVariable.pTiempoMs || tipoVarEdicion === EnTipoVariable.tiempoMs || tipoVarEdicion === EnTipoVariable.pTiempoMs) {
    const { min, seg } = parseMmSsStr(value);
    const minStr2 = String(min).padStart(2, '0');
    const segStr = String(seg).padStart(2, '0');

    function emitMmSs(newMin: string, newSeg: string): void {
      const m = clamp(parseInt(newMin || '0', 10), 0, 99);
      const s = clamp(parseInt(newSeg || '0', 10), 0, 59);
      onChange(`${String(m).padStart(2, '0')}m${String(s).padStart(2, '0')}s`);
    }

    return (
      <FieldsWrapper
        isValid={isValid}
        minStr={minStr}
        maxStr={maxStr}
        responsive={responsive}
      >
        <TimeField
          value={minStr2}
          max={99}
          label="m"
          onChange={(v) => emitMmSs(v, segStr)}
          onEnter={onEnter}
          nextRef={ref2}
          autoFocus
          responsive={responsive}
        />
        <TimeField
          value={segStr}
          max={59}
          label="s"
          onChange={(v) => emitMmSs(minStr2, v)}
          onEnter={onEnter}
          autoFocus={false}
          responsive={responsive}
        />
      </FieldsWrapper>
    );
  }

  // ─── HHMM ────────────────────────────────────────────────────────────────────

  if (tipoVar === EnTipoVariable.tiempoHm || tipoVar === EnTipoVariable.pTiempoHm || tipoVarEdicion === EnTipoVariable.tiempoHm || tipoVarEdicion === EnTipoVariable.pTiempoHm) {
    const { hora, min } = parseHhMmStr(value);
    const horaStr = String(hora).padStart(2, '0');
    const minStr2 = String(min).padStart(2, '0');

    function emitHhMm(newHora: string, newMin: string): void {
      const h = clamp(parseInt(newHora || '0', 10), 0, 23);
      const m = clamp(parseInt(newMin || '0', 10), 0, 59);
      onChange(`${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}m`);
    }

    return (
      <FieldsWrapper
        isValid={isValid}
        minStr={minStr}
        maxStr={maxStr}
        responsive={responsive}
      >
        <TimeField
          value={horaStr}
          max={23}
          label="h"
          onChange={(v) => emitHhMm(v, minStr2)}
          onEnter={onEnter}
          nextRef={ref2}
          autoFocus
          responsive={responsive}
        />
        <TimeField
          value={minStr2}
          max={59}
          label="m"
          onChange={(v) => emitHhMm(horaStr, v)}
          onEnter={onEnter}
          autoFocus={false}
          responsive={responsive}
        />
      </FieldsWrapper>
    );
  }

  // ─── Fecha ───────────────────────────────────────────────────────────────────

  if (tipoVar === EnTipoVariable.fecha || tipoVarEdicion === EnTipoVariable.fecha) {
    const { dia, mes, yy } = parseFechaStr(value);
    const diaStr = String(dia).padStart(2, '0');
    const mesStr = String(mes).padStart(2, '0');
    const yyStr = String(yy).padStart(2, '0');

    function emitFecha(newDia: string, newMes: string, newYy: string): void {
      const d = clamp(parseInt(newDia || '1', 10), 1, 31);
      const m = clamp(parseInt(newMes || '1', 10), 1, 12);
      const y = clamp(parseInt(newYy || '0', 10), 0, 99);
      onChange(`${String(d).padStart(2, '0')}/${String(m).padStart(2, '0')}/${String(y).padStart(2, '0')}`);
    }

    return (
      <FieldsWrapper
        isValid={isValid}
        minStr={minStr}
        maxStr={maxStr}
        responsive={responsive}
      >
        <TimeField
          value={diaStr}
          max={31}
          label="/"
          onChange={(v) => emitFecha(v, mesStr, yyStr)}
          onEnter={onEnter}
          nextRef={ref2}
          autoFocus
          responsive={responsive}
        />
        <TimeField
          value={mesStr}
          max={12}
          label="/"
          onChange={(v) => emitFecha(diaStr, v, yyStr)}
          onEnter={onEnter}
          nextRef={ref3}
          autoFocus={false}
          responsive={responsive}
        />
        <TimeField
          value={yyStr}
          max={99}
          label=""
          onChange={(v) => emitFecha(diaStr, mesStr, v)}
          onEnter={onEnter}
          autoFocus={false}
          responsive={responsive}
        />
      </FieldsWrapper>
    );
  }

  // ─── HHMMSS (tiempo, pTiempo, tiempoHms, pTiempoHms) ────────────────────────

  {
    const { hora, min, seg } = parseHhMmSsStr(value);
    const horaStr = String(hora).padStart(2, '0');
    const minStr2 = String(min).padStart(2, '0');
    const segStr = String(seg).padStart(2, '0');

    function emitHhMmSs(newHora: string, newMin: string, newSeg: string): void {
      const h = clamp(parseInt(newHora || '0', 10), 0, 23);
      const m = clamp(parseInt(newMin || '0', 10), 0, 59);
      const s = clamp(parseInt(newSeg || '0', 10), 0, 59);
      onChange(`${String(h).padStart(2, '0')}h${String(m).padStart(2, '0')}m${String(s).padStart(2, '0')}s`);
    }

    // Suprimir aviso de hooks: ref2/ref3 son usados condicionalmente según tipo
    void ref1;
    void ref3;

    return (
      <FieldsWrapper
        isValid={isValid}
        minStr={minStr}
        maxStr={maxStr}
        responsive={responsive}
      >
        <TimeField
          value={horaStr}
          max={23}
          label="h"
          onChange={(v) => emitHhMmSs(v, minStr2, segStr)}
          onEnter={onEnter}
          nextRef={ref2}
          autoFocus
          responsive={responsive}
        />
        <TimeField
          value={minStr2}
          max={59}
          label="m"
          onChange={(v) => emitHhMmSs(horaStr, v, segStr)}
          onEnter={onEnter}
          nextRef={ref3}
          autoFocus={false}
          responsive={responsive}
        />
        <TimeField
          value={segStr}
          max={59}
          label="s"
          onChange={(v) => emitHhMmSs(horaStr, minStr2, v)}
          onEnter={onEnter}
          autoFocus={false}
          responsive={responsive}
        />
      </FieldsWrapper>
    );
  }
}

// ─── Layout wrapper ───────────────────────────────────────────────────────────

function FieldsWrapper({ isValid, minStr, maxStr, children, responsive }: { isValid: boolean; minStr: string; maxStr: string; children: React.ReactNode; responsive?: boolean }): JSX.Element {
  return (
    <div className={`flex flex-col items-center ${responsive ? 'gap-4' : 'gap-8'}`}>
      <div
        className={`flex items-center gap-1 rounded-2xl ${responsive ? 'px-4 py-3' : 'px-8 py-5'}`}
        style={{ backgroundColor: COLORES.tertiary, outline: isValid ? 'none' : `2px solid ${COLORES.error ?? '#ef4444'}` }}
      >
        {children}
      </div>
      <span className={`${responsive ? 'text-sm' : 'text-2xl'} ${isValid ? 'text-white/60' : 'text-red-500'}`}>
        {minStr} - {maxStr}
      </span>
    </div>
  );
}
