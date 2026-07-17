import type { ReactNode } from "react";
import type { Flow, FlowTab, Item } from "@/lib/types";
import { IconButton } from "@/components/ui/IconButton";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { ArrowLeft, List, Pencil, Route, Trash } from "@/components/ui/icons";
import { PetaCanvas } from "@/components/peta/PetaCanvas";
import { SusunEditor } from "@/components/susun/SusunEditor";

type TabButtonProps = {
  isActive: boolean;
  onClick: () => void;
  icon: ReactNode;
  children: string;
};

function TabButton({ isActive, onClick, icon, children }: TabButtonProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      onClick={onClick}
      className={`t-label flex h-[38px] flex-1 items-center justify-center gap-[7px] rounded-[9px] transition-colors ${
        isActive ? "bg-surface text-ink shadow-node" : "text-muted hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}

type Props = {
  flow: Flow;
  tab: FlowTab;
  onTabChange: (tab: FlowTab) => void;
  onBack: () => void;
  onEditFlow: () => void;
  onDeleteFlow: () => void;
  onAddStage: (name: string) => void;
  onRenameStage: (stageId: string, name: string) => void;
  onRemoveStage: (stageId: string) => void;
  onMoveStage: (stageId: string, direction: -1 | 1) => void;
  onAddItem: (stageId: string, text: string) => void;
  onEditItem: (stageId: string, item: Item) => void;
};

export function FlowView({
  flow,
  tab,
  onTabChange,
  onBack,
  onEditFlow,
  onDeleteFlow,
  onAddStage,
  onRenameStage,
  onRemoveStage,
  onMoveStage,
  onAddItem,
  onEditItem,
}: Props) {
  const actions = (
    <>
      <IconButton label="Ubah alur" onClick={onEditFlow}>
        <Pencil />
      </IconButton>
      <IconButton label="Hapus alur" className="text-danger" onClick={onDeleteFlow}>
        <Trash />
      </IconButton>
    </>
  );

  return (
    <div className="flex h-dvh flex-col">
      {/* Mobile: header bertumpuk. Desktop (sm+): satu bilah 68px — lebar layar dipakai peta. */}
      <header className="shrink-0 border-b border-line bg-surface">
        <div className="safe-top mx-auto flex w-full max-w-[1440px] flex-col gap-2.5 px-[13px] pb-3.5 sm:h-[68px] sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:pt-0 sm:pb-0">
          <div className="flex items-center justify-between sm:min-w-0 sm:flex-1 sm:justify-start sm:gap-3.5">
            <IconButton label="Kembali ke daftar alur" onClick={onBack}>
              <ArrowLeft />
            </IconButton>
            <div className="hidden h-[26px] w-px shrink-0 bg-line sm:block" aria-hidden="true" />
            <div className="hidden min-w-0 flex-col sm:flex">
              <h1 className="t-seksi truncate text-ink">{flow.name}</h1>
              {flow.tujuan && (
                <p className="t-meta truncate text-muted">Tujuan: {flow.tujuan}</p>
              )}
            </div>
            <div className="flex items-center gap-0.5 sm:hidden">{actions}</div>
          </div>

          <div className="px-[7px] sm:hidden">
            <h1 className="t-alur text-ink">{flow.name}</h1>
            {flow.tujuan && <p className="t-meta text-muted">Tujuan: {flow.tujuan}</p>}
          </div>

          <div
            role="tablist"
            aria-label="Tampilan alur"
            className="mx-[7px] flex gap-1 rounded-xl bg-line-2 p-1 sm:mx-0 sm:w-[300px] sm:shrink-0"
          >
            <TabButton
              isActive={tab === "peta"}
              onClick={() => onTabChange("peta")}
              icon={<Route />}
            >
              Peta
            </TabButton>
            <TabButton
              isActive={tab === "susun"}
              onClick={() => onTabChange("susun")}
              icon={<List />}
            >
              Susun
            </TabButton>
          </div>

          <div className="hidden items-center gap-0.5 sm:flex sm:flex-1 sm:justify-end">
            {actions}
          </div>
        </div>
      </header>

      {tab === "peta" ? (
        <ErrorBoundary
          fallback={
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
              <p className="t-seksi text-ink">Peta gagal digambar</p>
              <p className="t-body max-w-[320px] text-muted">
                Datamu aman. Buka tab Susun untuk memeriksa isi alur ini.
              </p>
            </div>
          }
        >
          <PetaCanvas
            stages={flow.stages}
            flowName={flow.name}
            onGoToSusun={() => onTabChange("susun")}
          />
        </ErrorBoundary>
      ) : (
        <SusunEditor
          flow={flow}
          onAddStage={onAddStage}
          onRenameStage={onRenameStage}
          onRemoveStage={onRemoveStage}
          onMoveStage={onMoveStage}
          onAddItem={onAddItem}
          onEditItem={onEditItem}
        />
      )}
    </div>
  );
}
