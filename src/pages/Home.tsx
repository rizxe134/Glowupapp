import { Link } from "react-router-dom";
import { MEDICAL_DISCLAIMER } from "@glow/shared";
import Shell from "../components/Shell";

export default function Home() {
  return (
    <Shell>
      <section className="hero">
        <div>
          <div className="kicker">Local ritual · No cloud AI</div>
          <h1>A quieter way to shop skin, hair, and body.</h1>
          <p className="lede">
            Take a short quiz, or let a photo on your machine (via Ollama) suggest concerns.
            Glow Guide then builds an ordered routine from a curated catalog — drugstore to
            splurge — without sending your face to the internet.
          </p>
          <div className="path-grid">
            <Link className="path-card" to="/quiz">
              <strong>Take the quiz</strong>
              <span>
                Skin type, concerns, hair, scalp, body, and budget. Works fully offline.
              </span>
              <em>Start →</em>
            </Link>
            <Link className="path-card" to="/photo">
              <strong>Analyze a photo</strong>
              <span>
                Camera or drop zone. Vision runs on local Ollama, then you edit the chips.
              </span>
              <em>Open camera →</em>
            </Link>
          </div>
        </div>
        <div className="orb" aria-hidden="true">
          <div className="orb-caption">skin · hair · body</div>
        </div>
      </section>
      <p className="fineprint">{MEDICAL_DISCLAIMER}</p>
    </Shell>
  );
}
