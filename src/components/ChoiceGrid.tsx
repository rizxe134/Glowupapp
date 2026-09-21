import type { ChoiceOption } from "@glow/shared";

export default function ChoiceGrid<T extends string>({
  options,
  selected,
  onToggle,
  multi,
}: {
  options: ChoiceOption<T>[];
  selected: T | T[] | "";
  onToggle: (id: T) => void;
  multi: boolean;
}) {
  const isOn = (id: T) =>
    multi ? Array.isArray(selected) && selected.includes(id) : selected === id;

  return (
    <div className="choice-grid" role={multi ? "group" : "radiogroup"}>
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          className={`choice${isOn(opt.id) ? " is-on" : ""}`}
          onClick={() => onToggle(opt.id)}
          aria-pressed={isOn(opt.id)}
        >
          <b>{opt.label}</b>
          <small>{opt.hint}</small>
        </button>
      ))}
    </div>
  );
}
