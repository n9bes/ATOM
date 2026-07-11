package models;

import enums.TokenType;
import exceptions.SintaxisException;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class Parser {
    private final List<Token> tokens;
    private int currentPos;
    private Token currentToken;

    // Sets para validaciones semánticas (no reemplazan las listas del AST)
    private final Set<String> estadosSet         = new HashSet<>();
    private final Set<String> alfabetoSet        = new HashSet<>();
    private final Set<String> aceptacionSet      = new HashSet<>();
    private final Set<String> estadosUsados      = new HashSet<>();
    private final Set<String> simbolosUsados     = new HashSet<>();
    private final Set<String> transicionesClaves = new HashSet<>(); // origen|simbolo|destino — evita duplicados exactos
    private final Set<String> paresOrigenSimbolo = new HashSet<>(); // origen|simbolo — detecta no-determinismo
    private boolean esDeterminista = true;

    public Parser(List<Token> tokens) {
        this.tokens = tokens;
        this.currentPos = 0;
        this.currentToken = tokens.isEmpty() ? null : tokens.get(0);
    }

    public Automata startParser() {
        log("Analizador Sintáctico iniciado");
        match(TokenType.AUTOMATA);

        String nombre = currentToken.getValue();
        log("Autómata '" + nombre + "' detectado.");
        match(TokenType.IDENTIFICADOR);

        match(TokenType.LLAVE_L);

        List<String> estados              = parserEstados();
        List<String> alfabeto             = parserAlfabeto();
        String estadoInicial              = parserInicial();
        List<String> estadosAceptacion    = parserAceptacion();
        List<Transicion> transiciones     = parserTransiciones();

        validarUsoCompleto();

        match(TokenType.LLAVE_R);
        match(TokenType.EOF);
        log("Análisis finalizado.");

        return new Automata(nombre, estados, alfabeto, estadoInicial,
                            estadosAceptacion, transiciones, tokens, esDeterminista);
    }

    private List<String> parserEstados() {
        List<String> estados = new ArrayList<>();

        match(TokenType.ESTADOS);
        match(TokenType.LLAVE_L);
        log("Leyendo lista de ESTADOS --");

        System.out.print("\t[PARSER] \t" + currentToken.getValue());
        estados.add(agregarEstado(currentToken));
        match(TokenType.IDENTIFICADOR);

        while (currentToken.getType() == TokenType.COMA) {
            match(TokenType.COMA);
            System.out.print(", " + currentToken.getValue());
            estados.add(agregarEstado(currentToken));
            match(TokenType.IDENTIFICADOR);
        }

        System.out.println();
        match(TokenType.LLAVE_R);
        return estados;
    }

    /** Agrega al Set y detecta duplicados; retorna el valor para la lista del AST */
    private String agregarEstado(Token token) {
        String estado = token.getValue();
        if (!estadosSet.add(estado)) {
            throw new SintaxisException("Estado duplicado '" + estado + "'", token);
        }
        return estado;
    }

    private List<String> parserAlfabeto() {
        List<String> alfabeto = new ArrayList<>();

        match(TokenType.ALFABETO);
        match(TokenType.LLAVE_L);
        log("Leyendo lista de símbolos en ALFABETO --");

        System.out.print("\t[PARSER] \t" + currentToken.getValue());
        alfabeto.add(agregarSimbolo(currentToken));
        matchSimbolo();

        while (currentToken.getType() == TokenType.COMA) {
            match(TokenType.COMA);
            System.out.print(", " + currentToken.getValue());
            alfabeto.add(agregarSimbolo(currentToken));
            matchSimbolo();
        }

        System.out.println();
        match(TokenType.LLAVE_R);
        return alfabeto;
    }

    private String agregarSimbolo(Token token) {
        String simb = token.getValue();
        if (!alfabetoSet.add(simb)) {
            throw new SintaxisException("Símbolo duplicado en el alfabeto '" + simb + "'", token);
        }
        return simb;
    }

    private String parserInicial() {
        match(TokenType.INICIAL);
        String estadoInicial = currentToken.getValue();
        log("Leyendo estado INICIAL: " + estadoInicial);

        if (!estadosSet.contains(estadoInicial)) {
            throw new SintaxisException(
                "El estado inicial '" + estadoInicial + "' no ha sido declarado en la lista de estados",
                currentToken);
        }
        match(TokenType.IDENTIFICADOR);
        return estadoInicial;
    }

    private List<String> parserAceptacion() {
        List<String> aceptacion = new ArrayList<>();

        match(TokenType.ACEPTACION);
        match(TokenType.LLAVE_L);
        log("Leyendo estados de ACEPTACIÓN --");

        if (currentToken.getType() == TokenType.IDENTIFICADOR) {
            aceptacion.add(validarYAgregarAceptacion(currentToken));
            match(TokenType.IDENTIFICADOR);

            while (currentToken.getType() == TokenType.COMA) {
                match(TokenType.COMA);
                aceptacion.add(validarYAgregarAceptacion(currentToken));
                match(TokenType.IDENTIFICADOR);
            }
        }

        match(TokenType.LLAVE_R);

        if (aceptacion.isEmpty()) {
            throw new SintaxisException(
                "Debe declararse al menos un estado de aceptación", currentToken);
        }
        return aceptacion;
    }

    private String validarYAgregarAceptacion(Token token) {
        String est = token.getValue();
        if (!estadosSet.contains(est)) {
            throw new SintaxisException(
                "El estado de aceptación '" + est + "' no ha sido declarado en la lista de estados",
                token);
        }
        aceptacionSet.add(est);
        return est;
    }

    private List<Transicion> parserTransiciones() {
        List<Transicion> transiciones = new ArrayList<>();

        match(TokenType.TRANSICIONES);
        match(TokenType.LLAVE_L);
        log("Mapeando TRANSICIONES --");

        while (currentToken.getType() == TokenType.IDENTIFICADOR) {
            transiciones.add(parseTransicion());
        }

        match(TokenType.LLAVE_R);
        return transiciones;
    }

    private Transicion parseTransicion() {
        String inicial = currentToken.getValue();
        if (!estadosSet.contains(inicial)) {
            throw new SintaxisException(
                "El estado de origen '" + inicial + "' en la transición no está declarado en la lista de estados",
                currentToken);
        }
        match(TokenType.IDENTIFICADOR);
        match(TokenType.FLECHA);

        String simb = currentToken.getValue();
        if (!alfabetoSet.contains(simb)) {
            throw new SintaxisException(
                "El símbolo '" + simb + "' en la transición no está declarado en el alfabeto",
                currentToken);
        }
        matchSimbolo();
        match(TokenType.FLECHA);

        String destino = currentToken.getValue();
        if (!estadosSet.contains(destino)) {
            throw new SintaxisException(
                "El estado de destino '" + destino + "' en la transición no está declarado en la lista de estados",
                currentToken);
        }
        match(TokenType.IDENTIFICADOR);

        // duplicado exacto (mismo origen, simbolo Y destino) sigue siendo error
        String claveExacta = inicial + "|" + simb + "|" + destino;
        if (!transicionesClaves.add(claveExacta)) {
            throw new SintaxisException(
                "Transición duplicada: '" + inicial + " -> " + simb + " -> " + destino + "' ya fue declarada",
                currentToken);
        }

        // mismo origen+simbolo con distinto destino = AFND (válido, se anota)
        String claveND = inicial + "|" + simb;
        if (!paresOrigenSimbolo.add(claveND)) {
            esDeterminista = false;
        }

        estadosUsados.add(inicial);
        estadosUsados.add(destino);
        simbolosUsados.add(simb);

        log("  -> Transición: [" + inicial + "] lee '" + simb + "' y viaja a [" + destino + "]");
        return new Transicion(inicial, simb, destino);
    }

    private void match(TokenType expectedType) {
        if (currentToken.getType() == expectedType) {
            nextPos();
        } else {
            throw new SintaxisException("Se esperaba token de tipo " + expectedType, currentToken);
        }
    }

    private void matchSimbolo() {
        // el lexer no distingue símbolo de identificador sin contexto;
        // el parser sabe que está leyendo símbolos y acepta ambos tipos
        if (currentToken.getType() == TokenType.SIMBOLO ||
                currentToken.getType() == TokenType.IDENTIFICADOR) {
            nextPos();
        } else {
            throw new SintaxisException("Se esperaba símbolo del alfabeto", currentToken);
        }
    }

    private void nextPos() {
        currentPos++;
        if (currentPos < tokens.size()) {
            currentToken = tokens.get(currentPos);
        }
    }

    private void validarUsoCompleto() {
        for (String estado : estadosSet) {
            if (!estadosUsados.contains(estado)) {
                throw new SintaxisException(
                    "El estado '" + estado + "' fue declarado pero nunca se utiliza en ninguna transición",
                    currentToken);
            }
        }
        for (String simb : alfabetoSet) {
            if (!simbolosUsados.contains(simb)) {
                throw new SintaxisException(
                    "El símbolo '" + simb + "' fue declarado en el alfabeto pero nunca se utiliza en ninguna transición",
                    currentToken);
            }
        }
    }

    private void log(String mensaje) {
        System.out.println("\t[PARSER] " + mensaje);
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}
