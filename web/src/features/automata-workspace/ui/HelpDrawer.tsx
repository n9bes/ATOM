import styles from './HelpDrawer.module.css';

interface HelpDrawerProps {
  open: boolean;
  onClose: () => void;
}

const EXAMPLE = `automata Paridad {
  estados { q0, q1 }
  alfabeto { 0, 1 }
  inicial q0
  aceptacion { q0 }
  transiciones {
    q0 -> 0 -> q0
    q0 -> 1 -> q1
    q1 -> 0 -> q1
    q1 -> 1 -> q0
  }
}`;

const KEYWORDS = [
  { term: 'automata <Nombre> { ... }', desc: 'Envuelve toda la definición del autómata.' },
  { term: 'estados { q0, q1, ... }', desc: 'Lista de estados del autómata, separados por coma.' },
  { term: 'alfabeto { 0, 1, ... }', desc: 'Símbolos válidos que puede consumir el autómata.' },
  { term: 'inicial q0', desc: 'Estado desde el que arranca la simulación. Debe existir en "estados".' },
  { term: 'aceptacion { q0, ... }', desc: 'Estados que aceptan la cadena si se termina en ellos.' },
  {
    term: 'transiciones { origen -> símbolo -> destino }',
    desc: 'Una por línea. Si un mismo origen+símbolo tiene más de un destino, el autómata es no determinista (AFND).',
  },
];

export function HelpDrawer({ open, onClose }: HelpDrawerProps) {
  if (!open) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.drawer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Sintaxis de ATOM</span>
          <span className={styles.close} onClick={onClose}>
            ✕
          </span>
        </div>
        <pre className={styles.example}>{EXAMPLE}</pre>
        <div className={styles.keywordList}>
          {KEYWORDS.map((kw) => (
            <div key={kw.term}>
              <div className={styles.term}>{kw.term}</div>
              <div className={styles.desc}>{kw.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
