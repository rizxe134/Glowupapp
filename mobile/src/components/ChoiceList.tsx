import { Pressable, Text } from "react-native";
import type { ChoiceOption } from "@glow/shared";
import { styles } from "../theme";

export default function ChoiceList<T extends string>({
  options,
  selected,
  multi,
  onToggle,
}: {
  options: ChoiceOption<T>[];
  selected: T | T[] | "";
  multi: boolean;
  onToggle: (id: T) => void;
}) {
  const isOn = (id: T) => (multi ? Array.isArray(selected) && selected.includes(id) : selected === id);
  return (
    <>
      {options.map((opt) => (
        <Pressable
          key={opt.id}
          onPress={() => onToggle(opt.id)}
          style={[styles.choice, isOn(opt.id) && styles.choiceOn]}
        >
          <Text style={styles.choiceLabel}>{opt.label}</Text>
          <Text style={styles.choiceHint}>{opt.hint}</Text>
        </Pressable>
      ))}
    </>
  );
}
