import { Link, useNavigate } from "react-router-dom";
import { recommend } from "@glow/shared";
import RoutineView from "../components/RoutineView";
import Shell from "../components/Shell";
import { clearSession, loadSession } from "../lib/session";

export default function Results() {
  const navigate = useNavigate();
  const session = loadSession();

  if (!session) {
    return (
      <Shell>
        <h1 className="quiz-title">No routine yet.</h1>
        <p className="lede">Take the quiz or analyze a photo first — nothing is stored on a server.</p>
        <div className="row">
          <Link className="primary" to="/quiz">
            Take the quiz
          </Link>
          <Link className="secondary" to="/photo">
            Use a photo
          </Link>
        </div>
      </Shell>
    );
  }

  const result = recommend(session.answers);

  return (
    <Shell
      actions={
        <button
          className="ghost"
          type="button"
          onClick={() => {
            clearSession();
            navigate("/");
          }}
        >
          Start over
        </button>
      }
    >
      <div className="results-hero">
        <div className="kicker">
          {session.source === "photo" ? "From your photo" : "From your quiz"} · {session.answers.budget}{" "}
          budget
        </div>
        <h1 className="quiz-title">Your Glow Guide</h1>
        <p className="lede">{result.summary}</p>
      </div>
      <RoutineView result={result} notes={session.notes} />
      <div className="row">
        <Link className="secondary" to="/quiz">
          Retake quiz
        </Link>
        <Link className="secondary" to="/photo">
          Try a photo
        </Link>
      </div>
    </Shell>
  );
}
