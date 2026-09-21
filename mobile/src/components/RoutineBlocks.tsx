import { Text, View } from "react-native";
import type { RoutineResult } from "@glow/shared";
import { MEDICAL_DISCLAIMER } from "@glow/shared";
import { styles } from "../theme";

export default function RoutineBlocks({ result, notes }: { result: RoutineResult; notes?: string }) {
  const sections: Array<{ title: string; key: "skin" | "hair" | "body" }> = [
    { title: "Skin", key: "skin" },
    { title: "Hair", key: "hair" },
    { title: "Body", key: "body" },
  ];
  return (
    <View>
      {notes ? <Text style={styles.lede}>{notes}</Text> : null}
      {sections.map((section) => (
        <View key={section.key}>
          <Text style={styles.title}>{section.title}</Text>
          {result[section.key].map((step) => (
            <View key={step.id} style={styles.card}>
              <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                <Text style={styles.num}>{step.order}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{step.name}</Text>
                  <Text style={styles.choiceHint}>
                    {step.when} · {step.category}
                  </Text>
                </View>
              </View>
              <Text style={[styles.cardBody, { marginTop: 10 }]}>{step.why}</Text>
              <View style={[styles.chipWrap, { marginTop: 10 }]}>
                {step.lookFor.map((cue) => (
                  <Text key={cue} style={styles.look}>
                    Look for: {cue}
                  </Text>
                ))}
              </View>
              {step.products.map((product) => (
                <View key={product.id} style={styles.product}>
                  <Text style={{ fontWeight: "700", color: "#2A1C16" }}>
                    {product.brand} {product.name}
                  </Text>
                  <Text style={styles.choiceHint}>{product.why}</Text>
                  <Text style={{ color: "#9E3F34", marginTop: 4, fontSize: 12 }}>
                    {product.budget.toUpperCase()}
                  </Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      ))}
      <Text style={styles.lede}>{MEDICAL_DISCLAIMER}</Text>
    </View>
  );
}
