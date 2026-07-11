export interface AutomatonExample {
  id: string;
  name: string;
  source: string;
}

const src = (lines: string[]) => lines.join('\n');

/** Autómatas precargados al iniciar la app, para que haya algo que explorar de entrada. */
export const SEED_AUTOMATONS: AutomatonExample[] = [
  {
    id: 'paridad',
    name: 'Paridad',
    source: src([
      'automata Paridad {',
      '  estados { q0, q1 }',
      '  alfabeto { 0, 1 }',
      '  inicial q0',
      '  aceptacion { q0 }',
      '  transiciones {',
      '    q0 -> 0 -> q0',
      '    q0 -> 1 -> q1',
      '    q1 -> 0 -> q1',
      '    q1 -> 1 -> q0',
      '  }',
      '}',
    ]),
  },
  {
    id: 'binario3',
    name: 'Binario ÷3',
    source: src([
      'automata Binario3 {',
      '  estados { q0, q1, q2 }',
      '  alfabeto { 0, 1 }',
      '  inicial q0',
      '  aceptacion { q0 }',
      '  transiciones {',
      '    q0 -> 0 -> q0',
      '    q0 -> 1 -> q1',
      '    q1 -> 0 -> q2',
      '    q1 -> 1 -> q0',
      '    q2 -> 0 -> q1',
      '    q2 -> 1 -> q2',
      '  }',
      '}',
    ]),
  },
];

/** Ejemplos rápidos accesibles desde la barra lateral, para cargar y aprender la sintaxis. */
export const QUICK_EXAMPLES: AutomatonExample[] = [
  {
    id: 'ex-termina-en-01',
    name: 'Termina en 01',
    source: src([
      'automata TerminaEn01 {',
      '  estados { q0, q1, q2 }',
      '  alfabeto { 0, 1 }',
      '  inicial q0',
      '  aceptacion { q2 }',
      '  transiciones {',
      '    q0 -> 0 -> q1',
      '    q0 -> 1 -> q0',
      '    q1 -> 0 -> q1',
      '    q1 -> 1 -> q2',
      '    q2 -> 0 -> q1',
      '    q2 -> 1 -> q0',
      '  }',
      '}',
    ]),
  },
  {
    id: 'ex-sin-dos-ceros',
    name: 'Sin dos ceros seguidos',
    source: src([
      'automata SinDosCeros {',
      '  estados { q0, q1, q2 }',
      '  alfabeto { 0, 1 }',
      '  inicial q0',
      '  aceptacion { q0, q1 }',
      '  transiciones {',
      '    q0 -> 1 -> q0',
      '    q0 -> 0 -> q1',
      '    q1 -> 1 -> q0',
      '    q1 -> 0 -> q2',
      '    q2 -> 0 -> q2',
      '    q2 -> 1 -> q2',
      '  }',
      '}',
    ]),
  },
];

export function nuevoAutomataSource(numero: number): string {
  return src([
    `automata NuevoAutomata${numero} {`,
    '  estados { q0 }',
    '  alfabeto { 0, 1 }',
    '  inicial q0',
    '  aceptacion { q0 }',
    '  transiciones {',
    '    q0 -> 0 -> q0',
    '    q0 -> 1 -> q0',
    '  }',
    '}',
  ]);
}
