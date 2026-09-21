import type { RoutineResult, RoutineStepResult } from "@glow/shared";
import { MEDICAL_DISCLAIMER } from "@glow/shared";

function Step({ step }: { step: RoutineStepResult }) {
  return (
    <article className="step-card">
      <div className="step-top">
        <div className="num">{step.order}</div>
        <div>
          <h3>{step.name}</h3>
          <small className="note">
            {step.when} · {step.category}
          </small>
        </div>
      </div>
      <p>{step.why}</p>
      <div className="look">
        {step.lookFor.map((cue) => (
          <span key={cue}>Look for: {cue}</span>
        ))}
      </div>
      <div className="products">
        {step.products.map((product) => (
          <div className="product" key={product.id}>
            <div>
              <b>
                {product.brand} {product.name}
              </b>
              <br />
              <small>{product.why}</small>
            </div>
            <span className="budget-tag">{product.budget}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function RoutineView({
  result,
  notes,
}: {
  result: RoutineResult;
  notes?: string;
}) {
  const blocks: Array<{ key: keyof Pick<RoutineResult, "skin" | "hair" | "body">; title: string }> =
    [
      { key: "skin", title: "Skin" },
      { key: "hair", title: "Hair" },
      { key: "body", title: "Body" },
    ];

  return (
    <div>
      {notes ? <p className="note">{notes}</p> : null}
      {blocks.map((block) => (
        <section key={block.key}>
          <div className="section-head">
            <h2>{block.title}</h2>
            <span className="note">{result[block.key].length} steps</span>
          </div>
          {result[block.key].map((step) => (
            <Step key={step.id} step={step} />
          ))}
        </section>
      ))}
      <p className="fineprint">{MEDICAL_DISCLAIMER}</p>
    </div>
  );
}
