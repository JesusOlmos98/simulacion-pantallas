let idEnvioCounter = 1;

export function nextIdEnvio(): string {
  return String(idEnvioCounter++);
}
