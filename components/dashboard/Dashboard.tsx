import type { Flow } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "./EmptyState";
import { FlowCard } from "./FlowCard";

type Props = {
  flows: Flow[];
  onOpenFlow: (flowId: string) => void;
  onCreate: () => void;
};

export function Dashboard({ flows, onOpenFlow, onCreate }: Props) {
  const isEmpty = flows.length === 0;

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="safe-top mx-auto w-full max-w-[560px] px-5 pb-[18px]">
        <h1 className="t-wordmark text-ink">Alur</h1>
        <p className="t-meta text-muted">Peta proses interaktif</p>
      </header>

      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="mx-auto w-full max-w-[560px] flex-1 px-5">
          <p className="t-overline mb-3 text-muted">Alur saya · {flows.length}</p>
          <ul className="flex flex-col gap-3">
            {flows.map((flow) => (
              <li key={flow.id}>
                <FlowCard flow={flow} onOpen={() => onOpenFlow(flow.id)} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <footer className="safe-bottom sticky bottom-0 mx-auto w-full max-w-[560px] bg-paper px-5 pt-3">
        <Button className="w-full" onClick={onCreate}>
          {isEmpty ? "Buat alur pertama" : "Buat alur"}
        </Button>
      </footer>
    </div>
  );
}
