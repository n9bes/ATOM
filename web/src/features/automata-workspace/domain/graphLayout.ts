import type { Automata } from './types';

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  labelY: number;
  inicial: boolean;
  aceptacion: boolean;
  initPath: string;
}

export interface GraphEdge {
  path: string;
  label: string;
  labelX: number;
  labelY: number;
}

export interface GraphLayout {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const RADIO_NODO = 24;
const CENTRO_X = 210;
const CENTRO_Y = 125;

/** Distribuye los estados en un círculo y calcula las curvas de las transiciones. */
export function layoutGraph(automata: Automata): GraphLayout {
  const radio = automata.estados.length <= 2 ? 62 : 72;
  const posiciones: Record<string, { x: number; y: number }> = {};

  automata.estados.forEach((estado, i) => {
    const angulo = (2 * Math.PI * i) / automata.estados.length - Math.PI / 2;
    posiciones[estado] = {
      x: CENTRO_X + radio * Math.cos(angulo),
      y: CENTRO_Y + radio * Math.sin(angulo),
    };
  });

  const aceptacionSet = new Set(automata.estadosAceptacion);
  const nodes: GraphNode[] = automata.estados.map((estado) => {
    const pos = posiciones[estado];
    const inicial = estado === automata.estadoInicial;
    return {
      id: estado,
      x: pos.x,
      y: pos.y,
      labelY: pos.y + 5,
      inicial,
      aceptacion: aceptacionSet.has(estado),
      initPath: inicial ? `M ${pos.x - 60},${pos.y} L ${pos.x - RADIO_NODO - 2},${pos.y}` : '',
    };
  });

  const pares: Record<string, string[]> = {};
  for (const t of automata.transiciones) {
    const clave = `${t.origen}>>${t.destino}`;
    (pares[clave] ??= []).push(t.simbolo);
  }

  const edges: GraphEdge[] = [];
  for (const clave of Object.keys(pares)) {
    const [origen, destino] = clave.split('>>');
    const label = pares[clave].join(', ');
    const p1 = posiciones[origen];
    const p2 = posiciones[destino];
    if (!p1 || !p2) continue;

    if (origen === destino) {
      const dxc = p1.x - CENTRO_X;
      const dyc = p1.y - CENTRO_Y;
      const distc = Math.sqrt(dxc * dxc + dyc * dyc) || 1;
      const angulo = Math.atan2(dyc / distc, dxc / distc);
      const sx = p1.x + RADIO_NODO * Math.cos(angulo - 0.5);
      const sy = p1.y + RADIO_NODO * Math.sin(angulo - 0.5);
      const ex = p1.x + RADIO_NODO * Math.cos(angulo + 0.5);
      const ey = p1.y + RADIO_NODO * Math.sin(angulo + 0.5);
      const bulge = RADIO_NODO + 15;
      const c1x = p1.x + bulge * Math.cos(angulo - 0.35);
      const c1y = p1.y + bulge * Math.sin(angulo - 0.35);
      const c2x = p1.x + bulge * Math.cos(angulo + 0.35);
      const c2y = p1.y + bulge * Math.sin(angulo + 0.35);
      // Distancia entre la etiqueta y el propio loop: chica, para que el número quede
      // pegado a la curva y no se corte contra el borde del panel en los nodos de arriba.
      const distanciaEtiqueta = bulge + 4;
      edges.push({
        path: `M ${sx},${sy} C ${c1x},${c1y} ${c2x},${c2y} ${ex},${ey}`,
        label,
        labelX: p1.x + distanciaEtiqueta * Math.cos(angulo) - 6,
        labelY: p1.y + distanciaEtiqueta * Math.sin(angulo),
      });
      continue;
    }

    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / dist;
    const uy = dy / dist;
    const sx = p1.x + ux * RADIO_NODO;
    const sy = p1.y + uy * RADIO_NODO;
    const ex = p2.x - ux * RADIO_NODO;
    const ey = p2.y - uy * RADIO_NODO;
    const hayReversa = !!pares[`${destino}>>${origen}`];

    // La perpendicular usada para el "bow" de la curva se calcula sobre un par de nodos
    // ordenado canónicamente (no sobre la dirección de esta arista puntual). Así, las dos
    // aristas de un par recíproco comparten la misma perpendicular de referencia y solo
    // se distinguen por el signo, quedando en lados opuestos en vez de superponerse.
    const nodoMenor = origen < destino ? origen : destino;
    const nodoMayor = origen < destino ? destino : origen;
    const posMenor = posiciones[nodoMenor];
    const posMayor = posiciones[nodoMayor];
    const dCanX = posMayor.x - posMenor.x;
    const dCanY = posMayor.y - posMenor.y;
    const distCan = Math.sqrt(dCanX * dCanX + dCanY * dCanY) || 1;
    const canPx = -dCanY / distCan;
    const canPy = dCanX / distCan;
    const signo = origen === nodoMenor ? 1 : -1;

    const curvatura = hayReversa ? 26 : 12;
    const mx = (sx + ex) / 2;
    const my = (sy + ey) / 2;
    const ctrlX = mx + canPx * curvatura * signo;
    const ctrlY = my + canPy * curvatura * signo;
    edges.push({
      path: `M ${sx},${sy} Q ${ctrlX},${ctrlY} ${ex},${ey}`,
      label,
      labelX: mx + canPx * curvatura * signo * 0.6,
      labelY: my + canPy * curvatura * signo * 0.6,
    });
  }

  return { nodes, edges };
}
