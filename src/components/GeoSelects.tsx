import { AFRICAN_COUNTRIES, NIGERIAN_STATES, DEFAULT_COUNTRY } from "@contracts/geo";

const baseClass =
  "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8956c]/40 focus:border-[#c8956c]";

/**
 * Country selector — Nigeria preselected by default, all other African
 * countries selectable. Matches the styling of the surrounding form inputs.
 */
export function CountrySelect({
  id,
  value,
  onChange,
  className,
  required,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}) {
  return (
    <select
      id={id}
      required={required}
      value={value || DEFAULT_COUNTRY}
      onChange={(e) => onChange(e.target.value)}
      className={className ?? baseClass}
    >
      {AFRICAN_COUNTRIES.map((c) => (
        <option key={c} value={c}>
          {c}
        </option>
      ))}
    </select>
  );
}

/** Selector for all 36 Nigerian states + the FCT. */
export function NigerianStateSelect({
  id,
  value,
  onChange,
  className,
  required,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  required?: boolean;
}) {
  return (
    <select
      id={id}
      required={required}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className ?? baseClass}
    >
      <option value="">Select state…</option>
      {NIGERIAN_STATES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
