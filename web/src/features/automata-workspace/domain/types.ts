export type TokenType =
  | 'AUTOMATA'
  | 'ESTADOS'
  | 'ALFABETO'
  | 'INICIAL'
  | 'ACEPTACION'
  | 'TRANSICIONES'
  | 'LLAVE_L'
  | 'LLAVE_R'
  | 'COMA'
  | 'FLECHA'
  | 'IDENTIFICADOR'
  | 'SIMBOLO'
  | 'EOF'
  | 'ERROR';

export interface Token {
  type: TokenType;
  value: string;
  line: number;
  column: number;
}

export interface Transicion {
  origen: string;
  simbolo: string;
  destino: string;
}

export interface Automata {
  nombre: string;
  estados: string[];
  alfabeto: string[];
  estadoInicial: string;
  estadosAceptacion: string[];
  transiciones: Transicion[];
  tokens: Token[];
  esDeterminista: boolean;
}

export interface SimTraceStep {
  estados: string[];
  simbolo: string | null;
}
