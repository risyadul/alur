import { Fragment } from "react";
import type { Stage } from "@/lib/types";
import { MAP, descKey, itemKey, stageRole, type MapLayout } from "@/lib/map-layout";
import { MapEdges } from "./MapEdges";
import { DescNode, ItemNode, StageNode } from "./MapNodes";

type Props = {
  stages: Stage[];
  layout: MapLayout;
  collapsedIds: ReadonlySet<string>;
  /** Dibiarkan kosong saat dipakai pohon ekspor — di sana peta tidak interaktif. */
  onToggleStage?: (stageId: string) => void;
};

/**
 * Isi peta dalam koordinat peta (skala 1, tanpa kamera).
 * Dipakai dua kali: oleh kanvas hidup di dalam transform kamera, dan oleh pohon
 * ekspor tersembunyi — supaya gambar hasil ekspor tidak mungkin menyimpang dari
 * apa yang tergambar di layar.
 */
export function MapContent({ stages, layout, collapsedIds, onToggleStage }: Props) {
  return (
    <>
      <MapEdges layout={layout} collapsedIds={collapsedIds} />

      {stages.map((stage, i) => {
        const sl = layout.stages[i];
        if (!sl) return null;
        const isCollapsed = collapsedIds.has(stage.id);

        return (
          <Fragment key={stage.id}>
            <div className="absolute" style={{ left: sl.x, top: 0 }}>
              <StageNode
                name={stage.name}
                itemCount={stage.items.length}
                role={stageRole(i, stages.length)}
                isCollapsed={isCollapsed}
                onToggle={() => onToggleStage?.(stage.id)}
              />
            </div>

            {/*
             * Isi + deskripsi satu tahap. Tetap di DOM saat dilipat (hanya memudar)
             * agar tingginya tetap terukur — itu yang menjamin node lain tidak
             * bergeser saat sebuah tahap ditutup (PRD §7.5).
             */}
            <div
              className="absolute top-0 left-0 transition-[opacity,transform] duration-200 ease-out"
              style={{
                opacity: isCollapsed ? 0 : 1,
                transform: isCollapsed ? "scale(0.97)" : "none",
                transformOrigin: `${sl.trunkX}px ${MAP.SH}px`,
                pointerEvents: isCollapsed ? "none" : "auto",
              }}
              aria-hidden={isCollapsed}
            >
              {stage.items.map((item, j) => {
                const row = sl.rows[j];
                if (!row) return null;
                return (
                  <Fragment key={item.id}>
                    <div className="absolute" style={{ left: sl.itemX, top: row.itemY }}>
                      <ItemNode text={item.text} measureKey={itemKey(item.id)} />
                    </div>
                    {row.hasDesc && (
                      <div className="absolute" style={{ left: sl.descX, top: row.descY }}>
                        <DescNode text={item.desc} measureKey={descKey(item.id)} />
                      </div>
                    )}
                  </Fragment>
                );
              })}
            </div>
          </Fragment>
        );
      })}
    </>
  );
}
