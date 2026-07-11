import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import styles from './GraphView.module.css';
import { layoutGraph } from '../domain/graphLayout';
import type { Automata } from '../domain/types';
import { IconButton } from '../../../components/IconButton';

interface GraphViewProps {
  automata: Automata;
  activeStates: Set<string>;
}

const VIEW_W = 420;
const VIEW_H = 250;
const MIN_SCALE = 0.4;
const MAX_SCALE = 4;
const WHEEL_ZOOM_FACTOR = 1.15;
const BUTTON_ZOOM_FACTOR = 1.3;
const DEFAULT_VIEWPORT = { scale: 1, x: 0, y: 0 };

interface Viewport {
  scale: number;
  x: number;
  y: number;
}

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
}

const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s));

export function GraphView({ automata, activeStates }: GraphViewProps) {
  const { nodes, edges } = layoutGraph(automata);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [viewport, setViewport] = useState<Viewport>(DEFAULT_VIEWPORT);
  const [dragging, setDragging] = useState(false);

  /** Aplica un factor de zoom manteniendo fijo, en pantalla, el punto (clientX, clientY). */
  const zoomAt = useCallback((factor: number, clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const svgX = ((clientX - rect.left) / rect.width) * VIEW_W;
    const svgY = ((clientY - rect.top) / rect.height) * VIEW_H;

    setViewport((v) => {
      const newScale = clampScale(v.scale * factor);
      const ratio = newScale / v.scale;
      return { scale: newScale, x: svgX - ratio * (svgX - v.x), y: svgY - ratio * (svgY - v.y) };
    });
  }, []);

  const zoomAtCenter = useCallback(
    (factor: number) => {
      const rect = svgRef.current?.getBoundingClientRect();
      if (!rect) return;
      zoomAt(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
    },
    [zoomAt],
  );

  const resetViewport = useCallback(() => setViewport(DEFAULT_VIEWPORT), []);

  // El wheel necesita un listener nativo no-pasivo para poder cancelar el scroll de la página.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomAt(e.deltaY < 0 ? WHEEL_ZOOM_FACTOR : 1 / WHEEL_ZOOM_FACTOR, e.clientX, e.clientY);
    };
    svg.addEventListener('wheel', handleWheel, { passive: false });
    return () => svg.removeEventListener('wheel', handleWheel);
  }, [zoomAt]);

  const handlePointerDown = (e: ReactPointerEvent<SVGSVGElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, originX: viewport.x, originY: viewport.y };
    setDragging(true);
  };

  const handlePointerMove = (e: ReactPointerEvent<SVGSVGElement>) => {
    const drag = dragRef.current;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!drag || !rect || drag.pointerId !== e.pointerId) return;
    const dx = ((e.clientX - drag.startX) / rect.width) * VIEW_W;
    const dy = ((e.clientY - drag.startY) / rect.height) * VIEW_H;
    setViewport((v) => ({ ...v, x: drag.originX + dx, y: drag.originY + dy }));
  };

  const endDrag = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (dragRef.current?.pointerId === e.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className={`${styles.svg} ${dragging ? styles.dragging : ''}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerLeave={endDrag}
        onPointerCancel={endDrag}
      >
        <defs>
          <marker id="atom-arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill="var(--graph-edge)" />
          </marker>
        </defs>

        <g transform={`translate(${viewport.x} ${viewport.y}) scale(${viewport.scale})`}>
          {edges.map((edge, i) => (
            <g key={i}>
              <path d={edge.path} stroke="var(--graph-edge)" strokeWidth={1.5} fill="none" markerEnd="url(#atom-arrow)" />
              <text x={edge.labelX} y={edge.labelY} className={styles.edgeLabel}>
                {edge.label}
              </text>
            </g>
          ))}

          {nodes.map((node) => {
            const active = activeStates.has(node.id);
            return (
              <g key={node.id}>
                {node.inicial && (
                  <path d={node.initPath} stroke="var(--graph-edge)" strokeWidth={1.5} fill="none" markerEnd="url(#atom-arrow)" />
                )}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={24}
                  className={active ? styles.nodeCircleActive : styles.nodeCircle}
                  stroke={active ? 'var(--graph-node-active)' : 'var(--graph-node-stroke)'}
                />
                {node.aceptacion && (
                  <circle cx={node.x} cy={node.y} r={18} fill="none" stroke={active ? 'var(--graph-node-active)' : 'var(--graph-node-stroke)'} strokeWidth={1.5} />
                )}
                <text x={node.x} y={node.labelY} className={styles.nodeLabel} textAnchor="middle">
                  {node.id}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      <div className={styles.zoomControls}>
        <IconButton onClick={() => zoomAtCenter(BUTTON_ZOOM_FACTOR)} aria-label="Acercar">
          +
        </IconButton>
        <IconButton onClick={() => zoomAtCenter(1 / BUTTON_ZOOM_FACTOR)} aria-label="Alejar">
          −
        </IconButton>
        <IconButton onClick={resetViewport} aria-label="Restablecer vista">
          ⟲
        </IconButton>
      </div>
    </div>
  );
}
