export interface PersistedAutomaton {
  id: string;
  name: string;
  source: string;
}

const STORAGE_KEY = 'atom.automatons.v1';

export function loadAutomatons(): PersistedAutomaton[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveAutomatons(automatons: PersistedAutomaton[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(automatons));
  } catch {
    // almacenamiento no disponible (modo privado, cuota excedida, etc.) — se ignora,
    // el usuario simplemente pierde la persistencia entre sesiones.
  }
}
