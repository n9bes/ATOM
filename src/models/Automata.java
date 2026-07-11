package models;

import java.util.List;

public class Automata {

    private final String nombre;
    private final List<String> estados;
    private final List<String> alfabeto;
    private final String estadoInicial;
    private final List<String> estadosAceptacion;
    private final List<Transicion> transiciones;
    private final List<Token> tokens;
    private final boolean esDeterminista;

    public Automata(String nombre, List<String> estados, List<String> alfabeto,
                    String estadoInicial, List<String> estadosAceptacion,
                    List<Transicion> transiciones, List<Token> tokens,
                    boolean esDeterminista) {
        this.nombre = nombre;
        this.estados = estados;
        this.alfabeto = alfabeto;
        this.estadoInicial = estadoInicial;
        this.estadosAceptacion = estadosAceptacion;
        this.transiciones = transiciones;
        this.tokens = tokens;
        this.esDeterminista = esDeterminista;
    }

    public String getNombre() {
        return nombre;
    }

    public List<String> getEstados() {
        return estados;
    }

    public List<String> getAlfabeto() {
        return alfabeto;
    }

    public String getEstadoInicial() {
        return estadoInicial;
    }

    public List<String> getEstadosAceptacion() {
        return estadosAceptacion;
    }

    public List<Transicion> getTransiciones() {
        return transiciones;
    }

    public List<Token> getTokens() {
        return tokens;
    }

    public boolean esDeterminista() {
        return esDeterminista;
    }

    // muestra el AST del automata en formato de árbol visual.
    public void mostrarAST() {
        System.out.println();
        System.out.println("[AST] Automata: " + nombre);
        System.out.println("├── Tipo: " + (esDeterminista ? "AFD" : "AFND"));
        System.out.println("├── Estados: " + estados);
        System.out.println("├── Alfabeto: " + alfabeto);
        System.out.println("├── Estado Inicial: " + estadoInicial);
        System.out.println("├── Aceptación: " + estadosAceptacion);
        System.out.println("└── Transiciones:");

        for (int i = 0; i < transiciones.size(); i++) {
            String prefijo = (i < transiciones.size() - 1) ? "    ├── " : "    └── ";
            System.out.println(prefijo + transiciones.get(i));
        }
    }

    // tabla de tokens generados lexer.
    public void mostrarTokens() {
        System.out.println();
        System.out.println("[TOKENS] Total: " + tokens.size());
        System.out.println(String.format("  %-18s %-15s %-6s %-6s", "TIPO", "VALOR", "LÍNEA", "COL"));
        System.out.println("  " + "-".repeat(45));

        for (Token t : tokens) {
            String valor = t.getValue().isEmpty() ? "(vacío)" : t.getValue();
            System.out.println(String.format("  %-18s %-15s %-6d %-6d",
                    t.getType(), valor, t.getLine(), t.getColumn()));
        }
    }

    @Override
    public String toString() {
        return "[Automata: " + nombre + " | Tipo: " + (esDeterminista ? "AFD" : "AFND") +
                " | Estados: " + estados.size() + " | Transiciones: " + transiciones.size() + "]";
    }
}
