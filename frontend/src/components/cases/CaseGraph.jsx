import { RELATIONSHIP_TYPES } from "../../utils/constants";

const EDGE_COLOR = {
  [RELATIONSHIP_TYPES.CITES]: "#8991a0",
  [RELATIONSHIP_TYPES.FOLLOWS]: "#2f6f4f",
  [RELATIONSHIP_TYPES.SUPPORTS]: "#2f6f4f",
  [RELATIONSHIP_TYPES.SIMILAR]: "#8991a0",
  [RELATIONSHIP_TYPES.DISTINGUISHES]: "#8a6a1f",
  [RELATIONSHIP_TYPES.CONFLICT]: "#a5432c",
};

const WIDTH = 760;
const HEIGHT = 300;
const ROOT = { x: WIDTH / 2, y: 46 };

export default function CaseGraph({ currentCase, relatedCases, relationships, selectedId, onSelect }) {
  const n = relatedCases.length;
  const spacing = WIDTH / (n + 1);

  const nodes = relatedCases.map((c, i) => {
    const rel = relationships.find((r) => r.target === c.id);
    return {
      ...c,
      x: spacing * (i + 1),
      y: 230,
      relationship: rel?.type,
    };
  });

  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-paper-2 p-2">
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full min-w-[640px]" role="img" aria-label="Case relationship graph">
        {nodes.map((node) => (
          <line
            key={`edge-${node.id}`}
            x1={ROOT.x}
            y1={ROOT.y + 20}
            x2={node.x}
            y2={node.y - 26}
            stroke={EDGE_COLOR[node.relationship] ?? "#8991a0"}
            strokeWidth={selectedId === node.id ? 2.5 : 1.5}
            strokeDasharray={node.relationship === RELATIONSHIP_TYPES.CONFLICT ? "5 4" : undefined}
            opacity={0.85}
          />
        ))}

        {/* Current case (root) */}
        <g>
          <rect x={ROOT.x - 110} y={ROOT.y - 22} width="220" height="42" rx="8" fill="#0b1220" />
          <text x={ROOT.x} y={ROOT.y + 4} textAnchor="middle" fontSize="12.5" fontWeight="600" fill="#e7eaf1">
            {currentCase.name.length > 30 ? `${currentCase.name.slice(0, 30)}…` : currentCase.name}
          </text>
        </g>

        {nodes.map((node) => {
          const isSelected = selectedId === node.id;
          return (
            <g
              key={node.id}
              className="cursor-pointer"
              onClick={() => onSelect(node.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && onSelect(node.id)}
              aria-label={`View details for ${node.name}`}
            >
              <rect
                x={node.x - 82}
                y={node.y - 26}
                width="164"
                height="52"
                rx="8"
                fill={isSelected ? "#eceff4" : "#ffffff"}
                stroke={isSelected ? "#b08d57" : "#d7dbe3"}
                strokeWidth={isSelected ? 2 : 1}
              />
              <text x={node.x} y={node.y - 6} textAnchor="middle" fontSize="11" fontWeight="600" fill="#0e1420">
                {node.name.length > 22 ? `${node.name.slice(0, 22)}…` : node.name}
              </text>
              <text
                x={node.x}
                y={node.y + 12}
                textAnchor="middle"
                fontSize="10"
                fill={EDGE_COLOR[node.relationship] ?? "#5b6472"}
                fontWeight="600"
              >
                {node.relationship}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
