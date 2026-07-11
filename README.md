# ATOM - Analizador Léxico y Sintáctico

Diaz, Cristian Leandro. Sosa Ducass, Mateo Ismael. Velozo, Agustin.

Este proyecto consiste en el diseño e implementación de un analizador léxico (Lexer) y sintáctico (Parser) para **ATOM**, un lenguaje de dominio específico (DSL) diseñado para la descripción y simulación formal de Autómatas Finitos.

El proyecto está desarrollado en **Java** y cuenta con una arquitectura modular y manejo detallado de excepciones sintácticas y semánticas.

Además del compilador, el repositorio incluye en `web/` una interfaz web (PWA) en React + TypeScript que porta este mismo motor al navegador. Ver [`web/README.md`](web/README.md) para su documentación.

## Estructura del Proyecto

```
ATOM/
├── src/
│   ├── enums/
│   │   └── TokenType.java          # Categorías de tokens válidos en ATOM
│   ├── exceptions/
│   │   └── SintaxisException.java   # Excepción personalizada para errores del compilador
│   ├── models/
│   │   ├── Lexer.java              # Analizador léxico
│   │   ├── Parser.java             # Analizador sintáctico con validación semántica
│   │   └── Token.java              # Representación individual de un token
│   └── Main.java                   # Interfaz interactiva de consola (Menú)
└── README.md                       # Instrucciones de compilación y uso
```

## Requisitos

- **Java Development Kit (JDK)** versión 11 minimamente.
- Consola del sistema compatible con codificación UTF-8.

## Compilación

Para compilar el proyecto desde la terminal, ubíquese en la raíz del proyecto (`ATOM/`) y ejecute:

```bash
# Crear directorio de compilación
mkdir out\production\ATOM

# Compilar todos los archivos fuente especificando UTF-8
javac -encoding UTF-8 -d out/production/ATOM src/Main.java src/enums/TokenType.java src/exceptions/SintaxisException.java src/models/Token.java src/models/Lexer.java src/models/Parser.java
```

## Ejecución

Una vez compilado, ejecute el programa principal con el siguiente comando:

```bash
java -cp out/production/ATOM Main
```

## Características y Reglas Semánticas Soportadas

El analizador sintáctico realiza la validación de la gramática formal en orden estricto (`estados`, `alfabeto`, `inicial`, `aceptacion`, `transiciones`) y aplica las siguientes **reglas semánticas** en tiempo de análisis:

1. **Estado Inicial**: Debe haber sido declarado previamente en el bloque `estados`.
2. **Estados de Aceptación**: Todos los estados de aceptación deben pertenecer al conjunto de `estados` declarados.
3. **Transiciones**:
   - El estado de origen y el estado de destino deben pertenecer al conjunto de `estados` declarados.
   - El símbolo consumido en la transición debe pertenecer al `alfabeto` definido.
4. **Duplicados**: No se permiten estados duplicados ni símbolos de alfabeto duplicados.

Cualquier violación a estas reglas detendrá la compilación y arrojará una descripción exacta del error indicando la línea y columna correspondientes.
