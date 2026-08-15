import { ControlsPanel } from "@/components/controls-panel";
import { PreviewCanvas } from "@/components/preview-canvas";
import { StorySidebar } from "@/components/story-sidebar";
import { useWorkbench } from "@/hooks/use-workbench";

export function App() {
  const { state, selectStory, setArg, setZoom, setPageIndex } = useWorkbench();
  const selected = state.stories.find((story) => story.id === state.selectedId);
  const pages = state.previewError ? state.lastGoodPages : state.pages;

  return (
    <div className="grid h-full grid-cols-[244px_minmax(0,1fr)_276px] max-[960px]:grid-cols-[220px_minmax(0,1fr)]">
      <StorySidebar
        stories={state.stories}
        errors={state.errors}
        selectedId={state.selectedId}
        onSelect={(id) => selectStory(id)}
      />
      <PreviewCanvas
        selected={selected}
        pages={pages}
        diagnostics={state.diagnostics}
        previewError={state.previewError}
        zoom={state.zoom}
        pageIndex={state.pageIndex}
        storyCount={state.stories.length}
        onZoom={setZoom}
        onPageIndex={setPageIndex}
      />
      <div className="max-[960px]:hidden">
        <ControlsPanel
          selected={selected}
          args={state.args}
          onChange={setArg}
        />
      </div>
    </div>
  );
}
