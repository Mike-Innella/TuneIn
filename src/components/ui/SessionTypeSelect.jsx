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
              "px-3 py-1.5 rounded-full border text-sm transition-colors",
              "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800",
              active ? "ring-2 ring-blue-500 dark:ring-blue-400" : "hover:bg-gray-50 dark:hover:bg-gray-700"
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
