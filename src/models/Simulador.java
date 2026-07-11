package models;

import java.util.HashSet;
import java.util.Set;

public class Simulador {

    private final Automata automata;

    public Simulador(Automata automata) {
        this.automata = automata;
    }

    public boolean simular(String input) {
        System.out.println("\n[SIM] Tipo: " + (automata.esDeterminista() ? "AFD" : "AFND"));
        return automata.esDeterminista() ? simularAFD(input) : simularAFND(input);
    }

    // ── AFD ──────────────────────────────────────────────────────────────────
    private boolean simularAFD(String input) {
        String estadoActual = automata.getEstadoInicial();
        System.out.println("[SIM] Estado inicial: [" + estadoActual + "]");

        for (int i = 0; i < input.length(); i++) {
            String simbolo = String.valueOf(input.charAt(i));
            String siguiente = delta(estadoActual, simbolo);

            if (siguiente == null) {
                System.out.println("[SIM] Lee '" + simbolo + "' -> sin transición definida. RECHAZADA ✗");
                return false;
            }
            System.out.println("[SIM] Lee '" + simbolo + "' -> [" + estadoActual + "] -> [" + siguiente + "]");
            estadoActual = siguiente;
        }

        boolean aceptada = automata.getEstadosAceptacion().contains(estadoActual);
        System.out.println("[SIM] Estado final: [" + estadoActual + "] -> " + (aceptada ? "ACEPTADA ✓" : "RECHAZADA ✗"));
        return aceptada;
    }

    // ── AFND — subconjuntos ───────────────────────────────────────────────────
    private boolean simularAFND(String input) {
        Set<String> actuales = new HashSet<>();
        actuales.add(automata.getEstadoInicial());
        System.out.println("[SIM] Estados iniciales: " + actuales);

        for (int i = 0; i < input.length(); i++) {
            String simbolo = String.valueOf(input.charAt(i));
            Set<String> siguientes = deltaND(actuales, simbolo);

            System.out.println("[SIM] Lee '" + simbolo + "' -> " + actuales + " -> " + siguientes);

            if (siguientes.isEmpty()) {
                System.out.println("[SIM] Conjunto vacío de estados alcanzables. RECHAZADA ✗");
                return false;
            }
            actuales = siguientes;
        }

        boolean aceptada = actuales.stream().anyMatch(e -> automata.getEstadosAceptacion().contains(e));
        System.out.println("[SIM] Estados finales: " + actuales + " -> " + (aceptada ? "ACEPTADA ✓" : "RECHAZADA ✗"));
        return aceptada;
    }

    // δ(estado, simbolo) para AFD — un único destino o null
    private String delta(String estado, String simbolo) {
        for (Transicion t : automata.getTransiciones()) {
            if (t.getOrigen().equals(estado) && t.getSimbolo().equals(simbolo)) {
                return t.getDestino();
            }
        }
        return null;
    }

    // δ(estados, simbolo) para AFND — todos los destinos posibles desde el conjunto actual
    private Set<String> deltaND(Set<String> estados, String simbolo) {
        Set<String> resultado = new HashSet<>();
        for (String estado : estados) {
            for (Transicion t : automata.getTransiciones()) {
                if (t.getOrigen().equals(estado) && t.getSimbolo().equals(simbolo)) {
                    resultado.add(t.getDestino());
                }
            }
        }
        return resultado;
    }
}
