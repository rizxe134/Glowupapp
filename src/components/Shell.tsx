import type { ReactNode } from "react";
import { Link } from "react-router-dom";

function Mark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none">
        <path
          d="M12 3c5 5 8 8.2 8 12.2A8 8 0 1 1 4 15.2C4 11.2 7 8 12 3Z"
          fill="#FFF8F1"
        />
      </svg>
    </span>
  );
}

export default function Shell({
  children,
  actions,
}: {
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="shell">
      <header className="nav">
        <Link to="/" className="brand">
          <Mark />
          <span>
            <span className="brand-name">Glow Guide</span>
            <span className="brand-sub">Glowup</span>
          </span>
        </Link>
        <nav className="nav-links">
          {actions ?? (
            <>
              <Link className="ghost" to="/quiz">
                Quiz
              </Link>
              <Link className="ghost" to="/photo">
                Photo
              </Link>
            </>
          )}
        </nav>
      </header>
      {children}
    </div>
  );
}
