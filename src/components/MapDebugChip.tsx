import { Badge } from "@/components/ui/badge";

export type MapClickDebugInfo = {
  at: string;
  targetTag?: string;
  targetId?: string | null;
  closestId?: string | null;
  labelText?: string | null;
  resolvedSectionId?: string | null;
  resolutionPath?: "mapping" | "proximity" | "none";
  candidateCount?: number;
};

export function MapDebugChip({
  selectedSectionId,
  lastClick,
}: {
  selectedSectionId: string | null;
  lastClick: MapClickDebugInfo | null;
}) {
  return (
    <div className="absolute bottom-2 left-2 z-30 rounded-lg border border-border bg-card/90 backdrop-blur px-3 py-2 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <Badge variant="secondary">Map debug</Badge>
        <span className="text-muted-foreground">selectedSectionId:</span>
        <span className="font-medium text-foreground">{selectedSectionId ?? "∅"}</span>
      </div>

      <div className="mt-1 grid grid-cols-1 gap-1 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">lastLabel:</span>
          <span className="font-medium text-foreground">{lastClick?.labelText ?? "∅"}</span>
          <span className="text-muted-foreground">targetId:</span>
          <span className="font-medium text-foreground">{lastClick?.targetId ?? "∅"}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground">closestId:</span>
          <span className="font-medium text-foreground">{lastClick?.closestId ?? "∅"}</span>
          <span className="text-muted-foreground">resolved:</span>
          <span className="font-medium text-foreground">{lastClick?.resolvedSectionId ?? "∅"}</span>
          <span className="text-muted-foreground">via:</span>
          <span className="font-medium text-foreground">{lastClick?.resolutionPath ?? "none"}</span>
        </div>
      </div>
    </div>
  );
}
