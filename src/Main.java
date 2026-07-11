import exceptions.SintaxisException;
import models.Automata;
import models.Lexer;
import models.Parser;
import models.Simulador;
import models.Token;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Scanner;

public class Main {

    private static final Map<String, String> automatas = new LinkedHashMap<>();
    private static final Map<String, Automata> automatasCompilados = new LinkedHashMap<>();

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        boolean flag = true;

        System.out.println("==================================================");
        System.out.println("                  [ATOM-PARSER] v1                ");
        System.out.println("==================================================");

        while (flag) {
            System.out.println("\n[ MENÚ PRINCIPAL ]");
            System.out.println("0. Ver Documentación");
            System.out.println("1. CREAR autómata ");
            System.out.println("2. COMPILAR autómata");
            System.out.println("3. EDITAR autómata");
            System.out.println("4. ELIMINAR autómata");
            System.out.println("5. SHOW autómata");
            System.out.println("6. Cargar autómata de ejemplo");
            System.out.println("7. VER AST");
            System.out.println("8. SIMULAR cadena");
            System.out.println("9. Salir");
            System.out.printf("\n[%d autómatas | %d compilados] > Seleccione una opción: ", automatas.size(), automatasCompilados.size());

            String op = scanner.nextLine().trim();

            switch (op) {
                case "0":
                    showDocumentacion(scanner);
                    break;
                case "1":
                    crearAutomata(scanner);
                    break;
                case "2":
                    startParser(scanner);
                    break;
                case "3":
                    editarAutomata(scanner);
                    break;
                case "4":
                    eliminarAutomata(scanner);
                    break;
                case "5":
                    showAutomata(scanner);
                    break;
                case "6":
                    cargarEjemplo();
                    break;
                case "7":
                    verAST(scanner);
                    break;
                case "8":
                    simularCadena(scanner);
                    break;
                case "9":
                    System.out.println("\n[SYS] Leaving ATOM...");
                    flag = false;
                    break;
                default:
                    System.out.println("\n[ERR] Comando no reconocido.");
            }
        }
    }

    // CREACION AUTOMATA
    private static void crearAutomata(Scanner scanner) {
        System.out.println("\n--- CREAR AUTÓMATA ---");
        System.out.print("Ingrese un nombre: ");
        String nombre = scanner.nextLine().trim();

        if (nombre.isEmpty()) {
            nombre = "Automata_" + (automatas.size() + 1);
        }

        System.out.println("\nIngrese su autómata.");
        System.out.println("Ingrese la palabra FIN para guardar.");
        System.out.println("--------------------------------");

        String automata = leerBloque(scanner);
        automatas.put(nombre, automata);
        System.out.println("\n[SYS] Autómata [" + nombre + "] guardado.");
    }

    private static String leerBloque(Scanner scanner) {
        StringBuilder texto = new StringBuilder();

        // lee cada linea despues de un enter, hasta encontrar la palbra FIN
        while (true) {
            String linea = scanner.nextLine();

            if (linea.trim().equalsIgnoreCase("FIN")) {
                break;
            }

            if (linea.trim().toLowerCase().endsWith(" fin")) {
                texto.append(linea.substring(0, linea.length() - 4)).append("\n");
                break;
            }
            if (linea.trim().toLowerCase().endsWith("}fin")) {
                texto.append(linea.substring(0, linea.length() - 3)).append("\n");
                break;
            }

            texto.append(linea).append("\n");
        }
        return texto.toString().trim();
    }

    // EDICION AUTOMATA POR LINEAS
    private static void editarAutomata(Scanner scanner) {
        String automataKey = seleccionarAutomata(scanner, "EDITAR");
        if (automataKey == null) return;

        /*
         *  separamos el codigo en lineas segun los enter '\n'
         *  para poder editar de manera mas específica
         */
        List<String> lineas = new ArrayList<>(Arrays.asList(automatas.get(automataKey).split("\n")));
        boolean editando = true;

        while (editando) {
            System.out.println("\n-- EDITOR DE LÍNEAS: [" + automataKey + "] --");
            for (int i = 0; i < lineas.size(); i++) {
                System.out.printf("%3d | %s\n", (i + 1), lineas.get(i));
            }
            System.out.println("------------------------------------------");
            System.out.println(" Opciones:");
            System.out.println(" [Número] -> Numero de la linea a editar (ej. '4')");
            System.out.println(" [+]      -> Agregar nueva línea al final");
            System.out.println(" [-]      -> Borrar línea (ej. '-4')");
            System.out.println(" [X]      -> Guardar cambios");
            System.out.print("\n > ");

            String opcion = scanner.nextLine().trim().toUpperCase();

            if (opcion.equals("X")) {
                StringBuilder newAutomata = new StringBuilder();

                // volvemos a ensamblar el automata en un bloque de texto
                for (String l : lineas) {
                    newAutomata.append(l).append("\n");
                }
                // lo guardamos en su key
                automatas.put(automataKey, newAutomata.toString().trim());
                System.out.println("\n[SYS] Autómata [" + automataKey + "] actualizado correctamente.");

                editando = false;

            } else if (opcion.equals("+")) {
                System.out.print("Nueva línea: ");
                lineas.add(scanner.nextLine()); // directamente agrega una linea nueva

            } else if (opcion.startsWith("-")) {
                try {
                    int num = Integer.parseInt(opcion.substring(1).trim());
                    if (num >= 1 && num <= lineas.size()) {
                        lineas.remove(num - 1);
                        System.out.println("[SYS] Linea eliminada");
                    } else {
                        System.out.println("[ERR] Num out of range.");
                    }
                } catch (Exception e) {
                    System.out.println("[ERR] Opción inválida.");
                }

            } else {
                try {
                    // intenta agarrar la var opcion para ver si se refiera a una linea
                    int num = Integer.parseInt(opcion);

                    if (num >= 1 && num <= lineas.size()) {
                        System.out.println("\nLínea " + num + ": " + lineas.get(num - 1));
                        System.out.print("Escriba denuevo con modificaciones: ");

                        String nuevaLinea = scanner.nextLine();
                        lineas.set(num - 1, nuevaLinea);

                        System.out.println("[SYS] Linea actualizada.");
                    } else {
                        System.out.println("[ERR] Num out of range.");
                    }

                } catch (Exception e) {
                    System.out.println("[ERR] Opción inválida.");
                }
            }
        }
    }

    // ELIMINAR AUTOMATA
    private static void eliminarAutomata(Scanner scanner) {
        String key = seleccionarAutomata(scanner, "ELIMINAR");
        if (key != null) {
            automatas.remove(key);
            System.out.println("\n[SYS] Autómata [" + key + "] eliminado.");
        }
    }

    // MOSTRAR AUTOMATA
    private static void showAutomata(Scanner scanner) {
        String key = seleccionarAutomata(scanner, "VISUALIZAR");
        if (key != null) {
            System.out.println("\n--- AUTOMATA [" + key + "] ---");
            System.out.println(automatas.get(key));
            System.out.println("-------------------------");
        }
    }

    // COMPILADOR gestiona el analisis léxico con LEXER y sintáctico con el PARSER
    private static void startParser(Scanner scanner) {
        String key = seleccionarAutomata(scanner, "COMPILAR");
        if (key != null) {
            String automata = automatas.get(key);

            System.out.println("\n-- INICIANDO COMPILACIÓN --");

            try {
                System.out.println("[SYS] Ejecutando analisis léxico...");
                Lexer lexer = new Lexer(automata);
                List<Token> tokens = lexer.tokenize();

                System.out.println("[SYS] Ejecutando analisis sintáctico...");
                Parser parser = new Parser(tokens);

                Automata ast = parser.startParser();

                // almacenar AST compilado (reemplaza si ya existía)
                automatasCompilados.put(key, ast);

                System.out.println("\n[OK] Compilación exitosa, autómata válido.");
                System.out.println("[SYS] AST almacenado como [" + key + "]. Use 'VER AST' para visualizarlo.");

            } catch (SintaxisException e) {
                System.out.println("\n[ERR] Error sintáctico:");
                System.out.println("    " + e.getMessage());
            } catch (Exception e) {
                System.out.println("\n[ERR] Error:");
                System.out.println("    " + e.getMessage());
            }
            System.out.println("------------------------------------------");

        }
    }

    // auxiliar para seleccionar automata
    // devuelve la key / nombre
    private static String seleccionarAutomata(Scanner scanner, String accion) {
        if (automatas.isEmpty()) {
            System.out.println("\n[ERR] No hay automatas registrado. Primero ingrese uno.");
            return null;
        }

        System.out.println("\n-- Seleccione un Autómata para [" + accion + "] --");
        List<String> keys = new ArrayList<>(automatas.keySet()); // reune todas las keys del hashmap de automatas

        for (int i = 0; i < keys.size(); i++) {
            System.out.println((i + 1) + ". " + keys.get(i));
        }
        System.out.println("0. Salir");
        System.out.print("Seleccione un automata: ");

        try {
            int option = Integer.parseInt(scanner.nextLine().trim());
            if (option == 0) return null;

            if (option > 0 && option <= keys.size()) {
                return keys.get(option - 1); // corregimos
            } else {
                System.out.println("\n[ERR] Número invalido.");
            }
        } catch (NumberFormatException e) {
            System.out.println("\n[ERR] Formato de entrada invalido, debe ser un numero.");
        }
        return null;
    }

    private static void cargarEjemplo() {
        // String automataParidad = "automata Paridad {estados { q0, q1 } alfabeto { 0, 1 } inicial q0 aceptacion { q0 } transiciones {q0 -> 0 -> q0 q0 -> 1 -> q1 q1 -> 0 -> q1 q1 -> 1 -> q0} }";
        String automataParidad = """
                automata Paridad {
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
                }
                """;
        automatas.put("Ejemplo_Paridad", automataParidad.trim());
        System.out.println("\n[SYS] Automata de ejemplo cargado: [Ejemplo_Paridad]");
    }

    // AST de un autómata compilado
    private static void verAST(Scanner scanner) {
        if (automatasCompilados.isEmpty()) {
            System.out.println("\n[ERR] No hay autómatas compilados. Primero compile uno (opción 2).");
            return;
        }

        System.out.println("\n-- Seleccione un Autómata compilado para [VER AST] --");
        List<String> keys = new ArrayList<>(automatasCompilados.keySet());

        for (int i = 0; i < keys.size(); i++) {
            System.out.println((i + 1) + ". " + keys.get(i) + " " + automatasCompilados.get(keys.get(i)));
        }
        System.out.println("0. Salir");
        System.out.print("Seleccione: ");

        try {
            int option = Integer.parseInt(scanner.nextLine().trim());
            if (option == 0) return;

            if (option > 0 && option <= keys.size()) {
                Automata ast = automatasCompilados.get(keys.get(option - 1));
                ast.mostrarAST();
                ast.mostrarTokens();
            } else {
                System.out.println("\n[ERR] Número invalido.");
            }
        } catch (NumberFormatException e) {
            System.out.println("\n[ERR] Formato de entrada invalido.");
        }
    }

    private static void simularCadena(Scanner scanner) {
        if (automatasCompilados.isEmpty()) {
            System.out.println("\n[ERR] No hay autómatas compilados. Primero compile uno (opción 2).");
            return;
        }

        System.out.println("\n-- Seleccione un Autómata compilado para [SIMULAR] --");
        List<String> keys = new ArrayList<>(automatasCompilados.keySet());

        for (int i = 0; i < keys.size(); i++) {
            System.out.println((i + 1) + ". " + keys.get(i) + " " + automatasCompilados.get(keys.get(i)));
        }
        System.out.println("0. Salir");
        System.out.print("Seleccione: ");

        try {
            int option = Integer.parseInt(scanner.nextLine().trim());
            if (option == 0) return;

            if (option < 1 || option > keys.size()) {
                System.out.println("\n[ERR] Número inválido.");
                return;
            }

            Automata ast = automatasCompilados.get(keys.get(option - 1));
            Simulador sim = new Simulador(ast);

            System.out.print("\nIngrese la cadena a evaluar (vacía para ε): ");
            String cadena = scanner.nextLine();

            sim.simular(cadena);

        } catch (NumberFormatException e) {
            System.out.println("\n[ERR] Formato inválido.");
        }
    }

    private static void showDocumentacion(Scanner scanner) {
        System.out.println("\n==================================================");
        System.out.println("                   MANUAL: ATOM                    ");
        System.out.println("==================================================");
        System.out.println("DESCRIPCIÓN:");
        System.out.println("  ATOM Parser permite definir Autómatas Finitos");
        System.out.println("  bajo las siguientes reglas establecidas.\n");

        System.out.println("SINTAXIS Y KEYWORDS:");
        System.out.println(" 1. automata <Nombre> { ... }");
        System.out.println(" 2. estados { q0, q1, ... }");
        System.out.println(" 3. alfabeto { a, b, 0, 1, ... }");
        System.out.println(" 4. inicial <estado_inicio>");
        System.out.println(" 5. aceptacion { <estado_final>, ... }");
        System.out.println(" 6. transiciones { <origen> -> <simbolo> -> <destino> }\n");

        System.out.println("==================================================");
        System.out.println("Presione ENTER para volver al menu principal...");

        scanner.nextLine();
    }
}