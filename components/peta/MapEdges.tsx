import { MAP, type MapLayout } from "@/lib/map-layout";
import { readMapEdgeColors } from "@/lib/map-colors";

type Props = {
  layout: MapLayout;
  collapsedIds: ReadonlySet<string>;
};

/**
 * Seluruh penghubung peta dalam satu lapisan SVG — PRD §7.3.
 * Batang, cabang, dan tautan milik tahap yang dilipat ikut memudar bersama isinya.
 *
 * Warna diberikan sebagai presentation attribute, bukan kelas Tailwind — lihat
 * alasannya di `lib/map-colors.ts` (kelas CSS tidak selamat sampai gambar ekspor).
 */
export function MapEdges({ layout, collapsedIds }: Props) {
  const color = readMapEdgeColors();

  return (
    <svg
      width={layout.width}
      height={layout.height}
      className="pointer-events-none absolute top-0 left-0 overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <marker
          id="alur-panah"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path
            d="M1 1.5 L8.5 5 L1 8.5"
            fill="none"
            stroke={color.flow}
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      {/* Antar-tahap: garis horizontal berpanah, hijau. */}
      {layout.stages.slice(0, -1).map((stage, i) => (
        <line
          key={`flow-${stage.stageId}`}
          x1={stage.x + MAP.SW}
          y1={MAP.SH / 2}
          x2={layout.stages[i + 1].x - 7}
          y2={MAP.SH / 2}
          stroke={color.flow}
          strokeWidth={1.5}
          strokeLinecap="round"
          markerEnd="url(#alur-panah)"
        />
      ))}

      {layout.stages.map((stage) => (
        <g
          key={`edges-${stage.stageId}`}
          className="transition-opacity duration-200"
          style={{ opacity: collapsedIds.has(stage.stageId) ? 0 : 1 }}
        >
          {/* Batang: bawah tahap → pusat baris isi terakhir. */}
          {stage.rows.length > 0 && (
            <line
              x1={stage.trunkX}
              y1={stage.trunkTop}
              x2={stage.trunkX}
              y2={stage.trunkBottom}
              stroke={color.branch}
              strokeWidth={1.5}
              strokeLinecap="round"
            />
          )}

          {stage.rows.map((row) => (
            <g key={row.itemId}>
              {/* Cabang isi: batang → tepi kiri isi. */}
              <line
                x1={stage.trunkX}
                y1={row.centerY}
                x2={stage.itemX}
                y2={row.centerY}
                stroke={color.branch}
                strokeWidth={1.5}
                strokeLinecap="round"
              />
              {/* Tautan deskripsi: tepi kanan isi → tepi kiri deskripsi. */}
              {row.hasDesc && (
                <line
                  x1={stage.itemX + MAP.ITW}
                  y1={row.centerY}
                  x2={stage.descX}
                  y2={row.centerY}
                  stroke={color.link}
                  strokeWidth={1}
                  strokeLinecap="round"
                />
              )}
            </g>
          ))}
        </g>
      ))}
    </svg>
  );
}
