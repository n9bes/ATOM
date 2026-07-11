import styles from './AutomataWorkspace.module.css';
import { useAutomataWorkspace } from './hooks/useAutomataWorkspace';
import { TopBar } from './ui/TopBar';
import { Sidebar } from './ui/Sidebar';
import { AutomataListView } from './ui/AutomataListView';
import { EditorPanel } from './ui/EditorPanel';
import { RightPanel } from './ui/RightPanel';
import { HelpDrawer } from './ui/HelpDrawer';

export function AutomataWorkspace() {
  const w = useAutomataWorkspace();

  return (
    <div className={styles.app}>
      <TopBar current={w.current} onGoHome={w.goHome} onToggleHelp={w.toggleHelp} onToggleSidebar={w.toggleSidebar} />

      <div className={styles.body}>
        <Sidebar
          automatons={w.automatons}
          selectedId={w.current?.id ?? null}
          onSelect={w.selectAutomaton}
          deleteConfirmId={w.deleteConfirmId}
          onAskDelete={w.askDelete}
          onCancelDelete={w.cancelDelete}
          onConfirmDelete={w.confirmDelete}
          onNewAutomaton={w.newAutomaton}
          quickExamples={w.quickExamples}
          onLoadExample={w.loadExample}
          isOpen={w.sidebarOpen}
          onBackdropClick={w.closeSidebar}
        />

        <main className={styles.main}>
          {!w.current ? (
            <AutomataListView automatons={w.automatons} onSelect={w.selectAutomaton} onNewAutomaton={w.newAutomaton} />
          ) : (
            <div className={styles.editorRow}>
              <EditorPanel
                automaton={w.current}
                onSourceChange={(value) => w.updateSource(w.current!.id, value)}
                onCompile={w.compileCurrent}
              />
              <RightPanel
                automaton={w.current}
                rightTab={w.rightTab}
                onSetRightTab={w.setRightTab}
                sim={w.sim}
                currentAccepted={w.currentAccepted}
                onSimInputChange={w.setSimInput}
                onSimStart={w.startSim}
                onSimStepPrev={w.stepPrev}
                onSimStepNext={w.stepNext}
                onSimTogglePlay={w.togglePlay}
              />
            </div>
          )}
        </main>
      </div>

      <HelpDrawer open={w.helpOpen} onClose={w.toggleHelp} />
    </div>
  );
}
