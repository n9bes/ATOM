package exceptions;

import models.Token;

public class SintaxisException extends RuntimeException {
    public SintaxisException(String mensaje, Token token) {
        super(String.format("Error Sintáctico en la línea %d, columna %d: %s. Se encontró '%s'",
                token.getLine(), token.getColumn(), mensaje, token.getValue()));
    }
}
