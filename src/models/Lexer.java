package models;

import enums.TokenType;

import java.util.*;

public class Lexer {
    private final String input;
    private int position;
    private int line;
    private int column;
    private final List<Token> tokens;

    private final Map<String, TokenType> KEYWORDS;

    public Lexer(String input) {
        this.input = input;
        this.position = 0;
        this.line = 1;
        this.column = 1;
        this.tokens = new ArrayList<>();

        this.KEYWORDS = Map.of("automata", TokenType.AUTOMATA, "estados", TokenType.ESTADOS, "alfabeto", TokenType.ALFABETO, "inicial", TokenType.INICIAL, "aceptacion", TokenType.ACEPTACION, "transiciones", TokenType.TRANSICIONES);
    }

    public List<Token> tokenize() {
        System.out.printf("\t[LEXER] %3d |", line);
        while (position < input.length()) {
            char current = scan();

            // espacio y comentarios
            if (Character.isWhitespace(current)) {
                nextChar();
                continue;
            } else if (current == '#') {
                while (position < input.length() && scan() != '\n') {
                    nextChar();
                }
                continue;
            }

            // delimitadores - operadores
            if (current == '{') {
                addToken(TokenType.LLAVE_L, "{");
                nextChar();
            } else if (current == '}') {
                addToken(TokenType.LLAVE_R, "}");
                nextChar();
            } else if (current == ',') {
                addToken(TokenType.COMA, ",");
                nextChar();
            } else if (current == '-' && scanNext() == '>') {
                addToken(TokenType.FLECHA, "->");
                nextChar();
                nextChar();
            }

            // identificadores y keywords
            else if (Character.isLetter(current) || current == '_') {
                String word = readToken();
                TokenType type = KEYWORDS.getOrDefault(word, TokenType.IDENTIFICADOR);
                addToken(type, word);
            }
            // simbolos numericos // errores
            else if (Character.isDigit(current)) {
                String symbol = readToken();
                addToken(TokenType.SIMBOLO, symbol);
            } else {
                addToken(TokenType.ERROR, String.valueOf(current));
                nextChar();
            }
        }

        addToken(TokenType.EOF, "");
        System.out.println();
        return tokens;
    }

    // read del token entero actual
    private String readToken() {
        StringBuilder word = new StringBuilder();
        while (position < input.length() && (Character.isLetterOrDigit(scan()) || scan() == '_')) {
            word.append(scan());
            nextChar();
        }
        return word.toString();
    }

    // devuelve el char en la position actual
    private char scan() {
        if (position >= input.length()) return '\0';
        return input.charAt(position);
    }

    // devuelve el char siguiente
    private char scanNext() {
        if (position + 1 >= input.length()) return '\0';
        return input.charAt(position + 1);
    }

    // avanza 1 posicion
    private void nextChar() {
        if (scan() == '\n') {
            line++;
            System.out.printf("\n\t[LEXER] %3d |", line);
            column = 1;
        } else {
            column++;
        }
        position++;
    }

    /*
     * cuando anadimos un Token almacenamos lo que define al token en si:
     * TokenType type el tipo de token que es, IDENTIFICADOR o demas
     * String value el contenido del token
     *
     * y por otro lado, valores como 'line' y 'column' para control
     * asi poder controlar y gestionar los errores mas facilmente
     */
    private void addToken(TokenType type, String value) {
        tokens.add(new Token(type, value, line, column - value.length()));
        log(value);
    }

    private void log(String mensaje) {
        System.out.print(" " + mensaje);

        try {
            Thread.sleep(250);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }
}