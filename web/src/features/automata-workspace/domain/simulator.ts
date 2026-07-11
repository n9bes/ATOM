import type { Automata, SimTraceStep } from './types';

/**
 * Simulación por construcción de subconjuntos: espeja src/models/Simulador.java.
 * Un AFD es simplemente un AFND donde cada paso tiene, a lo sumo, un estado activo,
 * así que un único recorrido cubre ambos casos.
 */
export function buildSimTrace(automata: Automata, simbolos: string[]): SimTraceStep[] {
  const trace: SimTraceStep[] = [{ estados: [automata.estadoInicial], simbolo: null }];

  for (const simbolo of simbolos) {
    const previos = trace[trace.length - 1].estados;
    const siguientes = new Set<string>();
    for (const estado of previos) {
      for (const t of automata.transiciones) {
        if (t.origen === estado && t.simbolo === simbolo) siguientes.add(t.destino);
      }
    }
    trace.push({ estados: Array.from(siguientes), simbolo });
  }

  return trace;
}

export function esAceptada(automata: Automata, trace: SimTraceStep[]): boolean {
  const ultimos = trace[trace.length - 1].estados;
  return ultimos.some((estado) => automata.estadosAceptacion.includes(estado));
}

/** Separa la cadena a simular en símbolos: por espacios si los hay, si no por carácter. */
export function parseSimbolosDeInput(raw: string): string[] {
  const trimmed = raw.trim();
  if (!trimmed) return [];
  return trimmed.includes(' ') ? trimmed.split(/\s+/).filter(Boolean) : trimmed.split('');
}
