import type { ReactNode } from "react";
import { Link } from "react-router-dom";

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
          <img className="brand-mark" src="/logo.svg" alt="" width={36} height={36} />
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
