import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { compile, type CompileResult } from '../parser/parser';
import { buildSimTrace, esAceptada, parseSimbolosDeInput } from '../domain/simulator';
import type { SimTraceStep } from '../domain/types';
import { loadAutomatons, saveAutomatons, type PersistedAutomaton } from '../services/storage';
import { SEED_AUTOMATONS, QUICK_EXAMPLES, nuevoAutomataSource, type AutomatonExample } from '../services/examples';

export interface WorkspaceAutomaton {
  id: string;
  name: string;
  source: string;
  compiled: CompileResult | null;
  stale: boolean;
}

type RightTab = 'diagrama' | 'tokens';

interface SimState {
  input: string;
  symbols: string[] | null;
  trace: SimTraceStep[] | null;
  stepIndex: number;
  playing: boolean;
  error: string | null;
}

const EMPTY_SIM: SimState = { input: '', symbols: null, trace: null, stepIndex: 0, playing: false, error: null };

function compileAll(list: PersistedAutomaton[]): WorkspaceAutomaton[] {
  return list.map((a) => ({ ...a, compiled: compile(a.source), stale: false }));
}

function makeId(prefix: string, counter: number): string {
  return `${prefix}-${counter}`;
}

export function useAutomataWorkspace() {
  const [automatons, setAutomatons] = useState<WorkspaceAutomaton[]>(() => {
    const persisted = loadAutomatons();
    return compileAll(persisted && persisted.length ? persisted : SEED_AUTOMATONS);
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<RightTab>('diagrama');
  const [helpOpen, setHelpOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sim, setSim] = useState<SimState>(EMPTY_SIM);
  const idCounter = useRef(1);
  const simTimer = useRef<number | null>(null);

  useEffect(() => {
    saveAutomatons(automatons.map(({ id, name, source }) => ({ id, name, source })));
  }, [automatons]);

  useEffect(() => {
    if (simTimer.current) window.clearInterval(simTimer.current);
    if (!sim.playing) return;
    simTimer.current = window.setInterval(() => {
      setSim((s) => {
        if (!s.trace || s.stepIndex >= s.trace.length - 1) return { ...s, playing: false };
        return { ...s, stepIndex: s.stepIndex + 1 };
      });
    }, 850);
    return () => {
      if (simTimer.current) window.clearInterval(simTimer.current);
    };
  }, [sim.playing]);

  const current = useMemo(() => automatons.find((a) => a.id === selectedId) ?? null, [automatons, selectedId]);

  const resetSim = useCallback(() => setSim(EMPTY_SIM), []);

  const selectAutomaton = useCallback(
    (id: string) => {
      setSelectedId(id);
      setRightTab('diagrama');
      setDeleteConfirmId(null);
      setSidebarOpen(false);
      resetSim();
    },
    [resetSim],
  );

  const goHome = useCallback(() => {
    setSelectedId(null);
    setSidebarOpen(false);
  }, []);

  const addAutomaton = useCallback((name: string, source: string, idPrefix: string) => {
    const n = idCounter.current;
    const id = makeId(idPrefix, n);
    idCounter.current = n + 1;
    const created: WorkspaceAutomaton = { id, name, source, compiled: compile(source), stale: false };
    setAutomatons((list) => [...list, created]);
    setSelectedId(id);
    setRightTab('diagrama');
    setSidebarOpen(false);
    resetSim();
  }, [resetSim]);

  const newAutomaton = useCallback(() => {
    const n = idCounter.current;
    addAutomaton(`Autómata ${n}`, nuevoAutomataSource(n), 'nuevo');
  }, [addAutomaton]);

  const loadExample = useCallback(
    (example: AutomatonExample) => addAutomaton(example.name, example.source, example.id),
    [addAutomaton],
  );

  const askDelete = useCallback((id: string) => setDeleteConfirmId(id), []);
  const cancelDelete = useCallback(() => setDeleteConfirmId(null), []);
  const confirmDelete = useCallback(
    (id: string) => {
      setAutomatons((list) => list.filter((a) => a.id !== id));
      setSelectedId((sel) => (sel === id ? null : sel));
      setDeleteConfirmId(null);
    },
    [],
  );

  const updateSource = useCallback((id: string, source: string) => {
    setAutomatons((list) => list.map((a) => (a.id === id ? { ...a, source, stale: !!a.compiled } : a)));
  }, []);

  const compileCurrent = useCallback(() => {
    if (!selectedId) return;
    setAutomatons((list) =>
      list.map((a) => (a.id === selectedId ? { ...a, compiled: compile(a.source), stale: false } : a)),
    );
    resetSim();
  }, [selectedId, resetSim]);

  const toggleHelp = useCallback(() => setHelpOpen((v) => !v), []);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const setSimInput = useCallback((value: string) => {
    setSim({ ...EMPTY_SIM, input: value });
  }, []);

  const startSim = useCallback(() => {
    if (!current || !current.compiled || !current.compiled.ok) return;
    const symbols = parseSimbolosDeInput(sim.input);
    const alfabeto = current.compiled.automata.alfabeto;
    const invalido = symbols.find((s) => !alfabeto.includes(s));
    if (invalido !== undefined) {
      setSim((s) => ({ ...s, trace: null, error: `El símbolo '${invalido}' no pertenece al alfabeto del autómata.` }));
      return;
    }
    const trace = buildSimTrace(current.compiled.automata, symbols);
    setSim((s) => ({ ...s, symbols, trace, stepIndex: 0, playing: false, error: null }));
  }, [current, sim.input]);

  const stepPrev = useCallback(() => {
    setSim((s) => ({ ...s, stepIndex: Math.max(0, s.stepIndex - 1), playing: false }));
  }, []);

  const stepNext = useCallback(() => {
    setSim((s) => (s.trace ? { ...s, stepIndex: Math.min(s.trace.length - 1, s.stepIndex + 1), playing: false } : s));
  }, []);

  const togglePlay = useCallback(() => {
    setSim((s) => {
      if (!s.trace) return s;
      if (s.stepIndex >= s.trace.length - 1) return { ...s, stepIndex: 0, playing: true };
      return { ...s, playing: !s.playing };
    });
  }, []);

  const currentAccepted = useMemo(() => {
    if (!current?.compiled?.ok || !sim.trace) return null;
    const atEnd = sim.stepIndex === sim.trace.length - 1;
    if (!atEnd) return null;
    return esAceptada(current.compiled.automata, sim.trace.slice(0, sim.stepIndex + 1));
  }, [current, sim.trace, sim.stepIndex]);

  return {
    automatons,
    current,
    selectAutomaton,
    goHome,
    newAutomaton,
    loadExample,
    quickExamples: QUICK_EXAMPLES,
    deleteConfirmId,
    askDelete,
    cancelDelete,
    confirmDelete,
    updateSource,
    compileCurrent,
    helpOpen,
    toggleHelp,
    sidebarOpen,
    toggleSidebar,
    closeSidebar,
    rightTab,
    setRightTab,
    sim,
    setSimInput,
    startSim,
    stepPrev,
    stepNext,
    togglePlay,
    currentAccepted,
  };
}

export type AutomataWorkspace = ReturnType<typeof useAutomataWorkspace>;
