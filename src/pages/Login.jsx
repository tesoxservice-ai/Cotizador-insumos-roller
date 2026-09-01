import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    }

    setLoading(false);
  };

  return (
    <>
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .login-page {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #f5f5f5;
          padding: 24px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .login-card {
          width: 100%;
          max-width: 400px;
          background: #ffffff;
          border-radius: 12px;
          padding: 40px 28px 36px;
          box-shadow: 0 1px 4px rgba(0,0,0,0.08), 0 4px 20px rgba(0,0,0,0.06);
        }

        .login-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .login-logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 52px;
          height: 52px;
          background: #1a1a2e;
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .login-logo svg {
          display: block;
        }

        .login-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.3px;
          line-height: 1.2;
        }

        .login-subtitle {
          font-size: 14px;
          color: #888;
          margin-top: 6px;
          font-weight: 400;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .field label {
          font-size: 13px;
          font-weight: 600;
          color: #444;
          letter-spacing: 0.01em;
        }

        .field input {
          height: 52px;
          padding: 0 16px;
          border: 1.5px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          color: #1a1a1a;
          background: #fafafa;
          outline: none;
          transition: border-color 0.15s ease, background 0.15s ease;
          -webkit-appearance: none;
          appearance: none;
        }

        .field input::placeholder {
          color: #bbb;
        }

        .field input:focus {
          border-color: #1a1a2e;
          background: #fff;
        }

        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #fff5f5;
          border: 1px solid #fcd0d0;
          border-radius: 8px;
          padding: 12px 14px;
          margin-top: 4px;
        }

        .error-icon {
          flex-shrink: 0;
          margin-top: 1px;
          color: #d93025;
        }

        .error-text {
          font-size: 13.5px;
          color: #c0392b;
          line-height: 1.45;
        }

        .submit-btn {
          height: 52px;
          width: 100%;
          background: #1a1a2e;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          letter-spacing: 0.01em;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: background 0.15s ease, opacity 0.15s ease;
          -webkit-tap-highlight-color: transparent;
        }

        .submit-btn:hover:not(:disabled) {
          background: #2d2d4e;
        }

        .submit-btn:active:not(:disabled) {
          background: #111126;
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          flex-shrink: 0;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .login-footer {
          text-align: center;
          margin-top: 28px;
          font-size: 12px;
          color: #bbb;
        }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-header">
            <div className="login-logo">
              {/* Curtain / window icon */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="22" height="22" rx="2" stroke="#fff" strokeWidth="1.8"/>
                <line x1="14" y1="3" x2="14" y2="25" stroke="#fff" strokeWidth="1.8"/>
                <path d="M3 7 Q8.5 11 14 7" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
                <path d="M14 7 Q19.5 11 25 7" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="login-title">Cotizador Cortinas</h1>
            <p className="login-subtitle">Ingresá a tu cuenta para continuar</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="usuario@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                inputMode="email"
                required
                disabled={loading}
              />
            </div>

            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-box" role="alert">
                <svg className="error-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="#d93025" strokeWidth="1.5"/>
                  <line x1="8" y1="5" x2="8" y2="8.5" stroke="#d93025" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="8" cy="11" r="0.75" fill="#d93025"/>
                </svg>
                <span className="error-text">{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !email || !password}
            >
              {loading ? (
                <>
                  <span className="spinner" aria-hidden="true" />
                  Ingresando…
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        </div>

        <p className="login-footer">Cotizador Cortinas © {new Date().getFullYear()}</p>
      </div>
    </>
  );
}
