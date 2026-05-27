interface NumberInputProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}

export default function NumberInput({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "s",
  onChange,
}: NumberInputProps) {
  function decrement() {
    onChange(Math.max(min, value - step));
  }
  function increment() {
    onChange(Math.min(max, value + step));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-sm font-medium"
        style={{ color: "var(--muted)" }}
      >
        {label}
      </label>
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2"
        style={{ background: "var(--panel)", border: "1px solid var(--line)" }}
      >
        <button
          type="button"
          onClick={decrement}
          disabled={value <= min}
          className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-bold transition-colors disabled:opacity-30"
          style={{ background: "var(--line)", color: "var(--ink)" }}
        >
          -
        </button>
        <div className="flex-1 text-center">
          <span className="text-xl font-bold tabular-nums" style={{ color: "var(--ink)" }}>
            {value}
          </span>
          <span className="ml-0.5 text-sm" style={{ color: "var(--muted)" }}>
            {suffix}
          </span>
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="flex h-8 w-8 items-center justify-center rounded-md text-lg font-bold transition-colors disabled:opacity-30"
          style={{ background: "var(--line)", color: "var(--ink)" }}
        >
          +
        </button>
      </div>
    </div>
  );
}
