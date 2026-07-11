package models;

public class Transicion {

    private final String origen;
    private final String simbolo;
    private final String destino;

    public Transicion(String origen, String simbolo, String destino) {
        this.origen = origen;
        this.simbolo = simbolo;
        this.destino = destino;
    }

    public String getOrigen() { return origen; }
    public String getSimbolo() { return simbolo; }
    public String getDestino() { return destino; }

    @Override
    public String toString() {
        return origen + " --" + simbolo + "--> " + destino;
    }
}
