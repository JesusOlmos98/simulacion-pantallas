'use client';

import type { FormEvent, JSX } from 'react';

const MAC_VALIDATION_MESSAGE = 'La MAC debe ser numérica y tener al menos 6 dígitos.';

interface MacInputFormProps {
  defaultMac: string;
  defaultToken: string;
}

export default function MacInputForm({ defaultMac, defaultToken }: MacInputFormProps): JSX.Element {
  function handleInvalid(event: FormEvent<HTMLInputElement>): void {
    event.currentTarget.setCustomValidity(MAC_VALIDATION_MESSAGE);
  }

  function handleInput(event: FormEvent<HTMLInputElement>): void {
    event.currentTarget.setCustomValidity('');
  }

  return (
    <form
      action="/"
      className="flex flex-col gap-3"
      method="get"
    >
      <input
        className="rounded-lg border border-zinc-300 bg-white px-4 py-4 text-center text-lg font-semibold text-zinc-600 outline-none transition-colors focus:border-purple-600"
        defaultValue={defaultMac}
        inputMode="numeric"
        minLength={6}
        name="mac"
        onInput={handleInput}
        onInvalid={handleInvalid}
        pattern="[0-9]{6,}"
        placeholder="Introduce la MAC"
        title={MAC_VALIDATION_MESSAGE}
        type="text"
      />
      <input
        className="rounded-lg border border-zinc-300 bg-white px-4 py-4 text-center text-lg font-semibold text-zinc-600 outline-none transition-colors focus:border-purple-600"
        defaultValue={defaultToken}
        name="token"
        placeholder="Introduce el token"
        type="text"
      />
      <button
        className="rounded-lg bg-blue-800 px-8 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-700"
        type="submit"
      >
        Entrar
      </button>
    </form>
  );
}
