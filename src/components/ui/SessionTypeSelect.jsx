import { SESSION_PRESETS } from "../../types/session";
import { cn } from "../../utils/cn";

export function SessionTypeSelect({
  value, onChange
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {SESSION_PRESETS.map((p) => {
        const active = p.kind === value;
        return (
          <button
            key={p.kind}
            onClick={() => onChange(p.kind)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm btn-ghost",
              active && "active"
            )}
            data-active={active}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}
