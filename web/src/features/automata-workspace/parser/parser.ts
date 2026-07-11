import type { Automata, Token, TokenType, Transicion } from '../domain/types';
import { tokenize } from './tokenizer';

/** Espeja exceptions.SintaxisException.java: línea, columna, mensaje y token encontrado. */
export class SintaxisError extends Error {
  readonly line: number;
  readonly column: number;
  readonly found: string;
  readonly description: string;

  constructor(mensaje: string, token: Token) {
    super(`Error Sintáctico en la línea ${token.line}, columna ${token.column}: ${mensaje}. Se encontró '${token.value}'`);
    this.line = token.line;
    this.column = token.column;
    this.found = token.value;
    this.description = mensaje;
  }
}

/** Recursive-descent parser + validación semántica. Espeja src/models/Parser.java. */
class Parser {
  private readonly tokens: Token[];
  private pos = 0;
  private current: Token;

  private readonly estadosSet = new Set<string>();
  private readonly alfabetoSet = new Set<string>();
  private readonly transicionesClaves = new Set<string>();
  private readonly paresOrigenSimbolo = new Set<string>();
  private readonly estadosUsados = new Set<string>();
  private readonly simbolosUsados = new Set<string>();
  private esDeterminista = true;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.current = tokens[0];
  }

  parse(): Automata {
    this.match('AUTOMATA');
    const nombre = this.current.value;
    this.match('IDENTIFICADOR');
    this.match('LLAVE_L');

    const estados = this.parseEstados();
    const alfabeto = this.parseAlfabeto();
    const estadoInicial = this.parseInicial();
    const estadosAceptacion = this.parseAceptacion();
    const transiciones = this.parseTransiciones();

    this.validarUsoCompleto();

    this.match('LLAVE_R');
    this.match('EOF');

    return {
      nombre,
      estados,
      alfabeto,
      estadoInicial,
      estadosAceptacion,
      transiciones,
      tokens: this.tokens,
      esDeterminista: this.esDeterminista,
    };
  }

  private parseEstados(): string[] {
    const estados: string[] = [];
    this.match('ESTADOS');
    this.match('LLAVE_L');

    estados.push(this.agregarEstado(this.current));
    this.match('IDENTIFICADOR');
    while (this.isType('COMA')) {
      this.match('COMA');
      estados.push(this.agregarEstado(this.current));
      this.match('IDENTIFICADOR');
    }

    this.match('LLAVE_R');
    return estados;
  }

  private agregarEstado(token: Token): string {
    const estado = token.value;
    if (this.estadosSet.has(estado)) {
      throw new SintaxisError(`Estado duplicado '${estado}'`, token);
    }
    this.estadosSet.add(estado);
    return estado;
  }

  private parseAlfabeto(): string[] {
    const alfabeto: string[] = [];
    this.match('ALFABETO');
    this.match('LLAVE_L');

    alfabeto.push(this.agregarSimbolo(this.current));
    this.matchSimbolo();
    while (this.isType('COMA')) {
      this.match('COMA');
      alfabeto.push(this.agregarSimbolo(this.current));
      this.matchSimbolo();
    }

    this.match('LLAVE_R');
    return alfabeto;
  }

  private agregarSimbolo(token: Token): string {
    const simbolo = token.value;
    if (this.alfabetoSet.has(simbolo)) {
      throw new SintaxisError(`Símbolo duplicado en el alfabeto '${simbolo}'`, token);
    }
    this.alfabetoSet.add(simbolo);
    return simbolo;
  }

  private parseInicial(): string {
    this.match('INICIAL');
    const token = this.current;
    const estadoInicial = token.value;
    if (!this.estadosSet.has(estadoInicial)) {
      throw new SintaxisError(`El estado inicial '${estadoInicial}' no ha sido declarado en la lista de estados`, token);
    }
    this.match('IDENTIFICADOR');
    return estadoInicial;
  }

  private parseAceptacion(): string[] {
    const aceptacion: string[] = [];
    this.match('ACEPTACION');
    this.match('LLAVE_L');

    if (this.isType('IDENTIFICADOR')) {
      aceptacion.push(this.validarYAgregarAceptacion(this.current));
      this.match('IDENTIFICADOR');
      while (this.isType('COMA')) {
        this.match('COMA');
        aceptacion.push(this.validarYAgregarAceptacion(this.current));
        this.match('IDENTIFICADOR');
      }
    }

    this.match('LLAVE_R');

    if (aceptacion.length === 0) {
      throw new SintaxisError('Debe declararse al menos un estado de aceptación', this.current);
    }
    return aceptacion;
  }

  private validarYAgregarAceptacion(token: Token): string {
    const estado = token.value;
    if (!this.estadosSet.has(estado)) {
      throw new SintaxisError(`El estado de aceptación '${estado}' no ha sido declarado en la lista de estados`, token);
    }
    return estado;
  }

  private parseTransiciones(): Transicion[] {
    const transiciones: Transicion[] = [];
    this.match('TRANSICIONES');
    this.match('LLAVE_L');

    while (this.isType('IDENTIFICADOR')) {
      transiciones.push(this.parseTransicion());
    }

    this.match('LLAVE_R');
    return transiciones;
  }

  private parseTransicion(): Transicion {
    const origenToken = this.current;
    const origen = origenToken.value;
    if (!this.estadosSet.has(origen)) {
      throw new SintaxisError(`El estado de origen '${origen}' en la transición no está declarado en la lista de estados`, origenToken);
    }
    this.match('IDENTIFICADOR');
    this.match('FLECHA');

    const simboloToken = this.current;
    const simbolo = simboloToken.value;
    if (!this.alfabetoSet.has(simbolo)) {
      throw new SintaxisError(`El símbolo '${simbolo}' en la transición no está declarado en el alfabeto`, simboloToken);
    }
    this.matchSimbolo();
    this.match('FLECHA');

    const destinoToken = this.current;
    const destino = destinoToken.value;
    if (!this.estadosSet.has(destino)) {
      throw new SintaxisError(`El estado de destino '${destino}' en la transición no está declarado en la lista de estados`, destinoToken);
    }
    this.match('IDENTIFICADOR');

    const claveExacta = `${origen}|${simbolo}|${destino}`;
    if (this.transicionesClaves.has(claveExacta)) {
      throw new SintaxisError(`Transición duplicada: '${origen} -> ${simbolo} -> ${destino}' ya fue declarada`, destinoToken);
    }
    this.transicionesClaves.add(claveExacta);

    const claveND = `${origen}|${simbolo}`;
    if (this.paresOrigenSimbolo.has(claveND)) {
      this.esDeterminista = false;
    }
    this.paresOrigenSimbolo.add(claveND);

    this.estadosUsados.add(origen);
    this.estadosUsados.add(destino);
    this.simbolosUsados.add(simbolo);

    return { origen, simbolo, destino };
  }

  private isType(type: TokenType): boolean {
    return this.current.type === type;
  }

  private match(expected: TokenType): void {
    if (this.isType(expected)) {
      this.advance();
    } else {
      throw new SintaxisError(`Se esperaba token de tipo ${expected}`, this.current);
    }
  }

  private matchSimbolo(): void {
    if (this.isType('SIMBOLO') || this.isType('IDENTIFICADOR')) {
      this.advance();
    } else {
      throw new SintaxisError('Se esperaba símbolo del alfabeto', this.current);
    }
  }

  private advance(): void {
    this.pos++;
    if (this.pos < this.tokens.length) {
      this.current = this.tokens[this.pos];
    }
  }

  private validarUsoCompleto(): void {
    for (const estado of this.estadosSet) {
      if (!this.estadosUsados.has(estado)) {
        throw new SintaxisError(`El estado '${estado}' fue declarado pero nunca se utiliza en ninguna transición`, this.current);
      }
    }
    for (const simbolo of this.alfabetoSet) {
      if (!this.simbolosUsados.has(simbolo)) {
        throw new SintaxisError(`El símbolo '${simbolo}' fue declarado en el alfabeto pero nunca se utiliza en ninguna transición`, this.current);
      }
    }
  }
}

export interface CompileError {
  /** Descripción del problema, sin el prefijo "Error Sintáctico en la línea...". */
  description: string;
  /** Mensaje completo tal como lo reporta el motor (línea, columna, descripción y token encontrado). */
  message: string;
  line: number;
  column: number;
  found: string;
}

export type CompileResult =
  | { ok: true; automata: Automata }
  | { ok: false; error: CompileError; tokens: Token[] };

export function compile(source: string): CompileResult {
  const tokens = tokenize(source);
  try {
    const automata = new Parser(tokens).parse();
    return { ok: true, automata };
  } catch (e) {
    if (e instanceof SintaxisError) {
      return {
        ok: false,
        error: { description: e.description, message: e.message, line: e.line, column: e.column, found: e.found },
        tokens,
      };
    }
    throw e;
  }
}
