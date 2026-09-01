import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const toNum = (v) => parseFloat(String(v).replace(",", ".")) || 0;

// ─── Hook de carga inicial ────────────────────────────────────────────────────

function usePreciosAdmin() {
  const [data,    setData]    = useState({ config: {}, textiles: {}, verticales: {} });
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [{ data: cfg, error: eCfg },
               { data: tex, error: eTex },
               { data: ver, error: eVer }] = await Promise.all([
          supabase.from("configuracion").select("clave,valor"),
          supabase.from("precios_textiles").select("material,precio"),
          supabase.from("precios_verticales").select("material,precio"),
        ]);

        if (eCfg || eTex || eVer) throw eCfg || eTex || eVer;

        setData({
          config:     Object.fromEntries((cfg  || []).map(r => [r.clave,    String(r.valor)])),
          textiles:   Object.fromEntries((tex  || []).map(r => [r.material, String(r.precio)])),
          verticales: Object.fromEntries((ver  || []).map(r => [r.material, String(r.precio)])),
        });
      } catch (e) {
        setError("No se pudieron cargar los datos. Verificá la conexión.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  return { data, setData, loading, error };
}

// ─── Sección editable genérica ────────────────────────────────────────────────

function Seccion({ titulo, descripcion, fields, values, onChange, onSave, saving, feedback }) {
  return (
    <section className="seccion">
      <div className="seccion-header">
        <h2 className="seccion-titulo">{titulo}</h2>
        {descripcion && <p className="seccion-desc">{descripcion}</p>}
      </div>

      <div className="seccion-body">
        {fields.map(({ key, label, sufijo, tipo }) => (
          <div className="field-group" key={key}>
            <label htmlFor={key}>{label}</label>
            <div className="input-wrap">
              {tipo === "porcentaje" && <span className="input-prefix">%</span>}
              {tipo === "precio"     && <span className="input-prefix">$</span>}
              <input
                id={key}
                type="number"
                inputMode="decimal"
                value={values[key] ?? ""}
                onChange={e => onChange(key, e.target.value)}
                min="0"
                step={tipo === "porcentaje" ? "0.01" : "1"}
                className={tipo === "porcentaje" ? "input-pct" : ""}
              />
              {sufijo && <span className="input-sufijo">{sufijo}</span>}
            </div>
          </div>
        ))}
      </div>

      {feedback && (
        <div className={`feedback ${feedback.ok ? "feedback-ok" : "feedback-err"}`}>
          {feedback.ok ? "✓ " : "✗ "}{feedback.msg}
        </div>
      )}

      <button className="btn-guardar" disabled={saving} onClick={onSave}>
        {saving ? <span className="spinner" /> : "Guardar cambios"}
      </button>
    </section>
  );
}

// ─── Página Admin ─────────────────────────────────────────────────────────────

export default function Admin({ onVolver }) {
  const { data, setData, loading, error } = usePreciosAdmin();

  // Estado por sección: { saving, feedback }
  const [sectState, setSectState] = useState({
    config:     { saving: false, feedback: null },
    textiles:   { saving: false, feedback: null },
    verticales: { saving: false, feedback: null },
  });

  const setSect = (seccion, patch) =>
    setSectState(s => ({ ...s, [seccion]: { ...s[seccion], ...patch } }));

  const handleChange = (seccion, key, val) =>
    setData(d => ({ ...d, [seccion]: { ...d[seccion], [key]: val } }));

  // ── Guardar configuracion ──────────────────────────────────────────────────
  const guardarConfig = async () => {
    setSect("config", { saving: true, feedback: null });
    try {
      const ops = Object.entries(data.config).map(([clave, valor]) =>
        supabase.from("configuracion").update({ valor: String(toNum(valor)) }).eq("clave", clave)
      );
      const results = await Promise.all(ops);
      const err = results.find(r => r.error);
      if (err) throw err.error;
      setSect("config", { saving: false, feedback: { ok: true, msg: "Configuración guardada correctamente." } });
    } catch (e) {
      setSect("config", { saving: false, feedback: { ok: false, msg: "Error al guardar. Intentá de nuevo." } });
    }
  };

  // ── Guardar textiles ───────────────────────────────────────────────────────
  const guardarTextiles = async () => {
    setSect("textiles", { saving: true, feedback: null });
    try {
      const ops = Object.entries(data.textiles).map(([material, precio]) =>
        supabase.from("precios_textiles").update({ precio: toNum(precio) }).eq("material", material)
      );
      const results = await Promise.all(ops);
      const err = results.find(r => r.error);
      if (err) throw err.error;
      setSect("textiles", { saving: false, feedback: { ok: true, msg: "Precios actualizados correctamente." } });
    } catch (e) {
      setSect("textiles", { saving: false, feedback: { ok: false, msg: "Error al guardar. Intentá de nuevo." } });
    }
  };

  // ── Guardar verticales ─────────────────────────────────────────────────────
  const guardarVerticales = async () => {
    setSect("verticales", { saving: true, feedback: null });
    try {
      const ops = Object.entries(data.verticales).map(([material, precio]) =>
        supabase.from("precios_verticales").update({ precio: toNum(precio) }).eq("material", material)
      );
      const results = await Promise.all(ops);
      const err = results.find(r => r.error);
      if (err) throw err.error;
      setSect("verticales", { saving: false, feedback: { ok: true, msg: "Precios actualizados correctamente." } });
    } catch (e) {
      setSect("verticales", { saving: false, feedback: { ok: false, msg: "Error al guardar. Intentá de nuevo." } });
    }
  };

  const handleSignOut = () => supabase.auth.signOut();

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f4f4f6; }

        .admin-app {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background: #f4f4f6;
          color: #1a1a2e;
          max-width: 480px;
          margin: 0 auto;
        }

        /* ── Header ── */
        .header {
          position: sticky;
          top: 0;
          z-index: 10;
          background: #1a1a2e;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          gap: 8px;
        }
        .header-left { display: flex; align-items: center; gap: 10px; }
        .header-logo {
          width: 32px; height: 32px;
          background: rgba(255,255,255,0.12);
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .header h1 { font-size: 17px; font-weight: 700; letter-spacing: -0.2px; }
        .header-actions { display: flex; gap: 8px; }
        .btn-header {
          height: 34px; padding: 0 12px;
          border-radius: 7px; border: none;
          font-size: 13px; font-weight: 600;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
        }
        .btn-volver { background: rgba(255,255,255,0.12); color: #fff; }
        .btn-salir  { background: rgba(255,80,80,0.25);   color: #ffaaaa; }

        /* ── Contenido ── */
        .content {
          flex: 1;
          padding: 20px 16px 48px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .page-intro {
          font-size: 13.5px;
          color: #888;
          line-height: 1.5;
          padding: 0 2px;
        }

        /* ── Sección ── */
        .seccion {
          background: #fff;
          border-radius: 13px;
          border: 1px solid #e8e8ec;
          overflow: hidden;
        }
        .seccion-header {
          padding: 16px 16px 12px;
          border-bottom: 1px solid #f0f0f4;
        }
        .seccion-titulo {
          font-size: 15px;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.1px;
        }
        .seccion-desc {
          font-size: 12.5px;
          color: #999;
          margin-top: 3px;
          line-height: 1.4;
        }
        .seccion-body {
          padding: 16px 16px 4px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        /* ── Fields ── */
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-group label {
          font-size: 13px;
          font-weight: 600;
          color: #555;
        }
        .input-wrap {
          display: flex;
          align-items: center;
          border: 1.5px solid #e0e0e8;
          border-radius: 9px;
          background: #fafafa;
          overflow: hidden;
          transition: border-color 0.15s;
        }
        .input-wrap:focus-within { border-color: #1a1a2e; background: #fff; }
        .input-prefix {
          padding: 0 10px 0 14px;
          font-size: 15px;
          color: #bbb;
          font-weight: 500;
          flex-shrink: 0;
          user-select: none;
        }
        .input-sufijo {
          padding: 0 14px 0 6px;
          font-size: 13px;
          color: #aaa;
          flex-shrink: 0;
          user-select: none;
        }
        .input-wrap input {
          flex: 1;
          height: 52px;
          border: none;
          outline: none;
          background: transparent;
          font-size: 17px;
          color: #1a1a2e;
          -webkit-appearance: none;
          appearance: none;
          min-width: 0;
          padding: 0 4px 0 0;
        }
        .input-wrap input.input-pct {
          font-size: 17px;
        }

        /* ── Feedback ── */
        .feedback {
          margin: 12px 16px 0;
          padding: 11px 14px;
          border-radius: 8px;
          font-size: 13.5px;
          font-weight: 500;
          line-height: 1.4;
        }
        .feedback-ok {
          background: #f0faf4;
          border: 1px solid #b8e6cc;
          color: #1a7a45;
        }
        .feedback-err {
          background: #fff5f5;
          border: 1px solid #fcd0d0;
          color: #c0392b;
        }

        /* ── Botón guardar ── */
        .btn-guardar {
          display: flex;
          align-items: center;
          justify-content: center;
          width: calc(100% - 32px);
          margin: 14px 16px 16px;
          height: 50px;
          background: #1a5c36;
          color: #fff;
          border: none;
          border-radius: 9px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          -webkit-tap-highlight-color: transparent;
          transition: opacity 0.15s, background 0.15s;
          gap: 8px;
        }
        .btn-guardar:hover:not(:disabled) { background: #145229; }
        .btn-guardar:active:not(:disabled) { opacity: 0.85; }
        .btn-guardar:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ── Loading / Error ── */
        .loading-screen {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          color: #888;
          font-size: 15px;
        }
        .error-page {
          flex: 1;
          padding: 32px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }
        .error-box {
          background: #fff5f5;
          border: 1px solid #fcd0d0;
          border-radius: 9px;
          padding: 14px 16px;
          font-size: 14px;
          color: #c0392b;
          line-height: 1.45;
          width: 100%;
        }
        .spinner {
          width: 20px; height: 20px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
          flex-shrink: 0;
        }
        .spinner-dark {
          border-color: rgba(26,26,46,0.15);
          border-top-color: #1a1a2e;
        }
        .spinner-lg { width: 36px; height: 36px; border-width: 3px; }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Nota roller ── */
        .nota-roller {
          background: #fff;
          border: 1px solid #e8e8ec;
          border-radius: 13px;
          padding: 16px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .nota-roller-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
        .nota-roller-text { font-size: 13.5px; color: #888; line-height: 1.5; }
        .nota-roller-text strong { color: #555; font-weight: 600; }
      `}</style>

      <div className="admin-app">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <div className="header-logo">
              <svg width="18" height="18" viewBox="0 0 28 28" fill="none">
                <rect x="3" y="3" width="22" height="22" rx="2" stroke="#fff" strokeWidth="1.8"/>
                <line x1="14" y1="3" x2="14" y2="25" stroke="#fff" strokeWidth="1.8"/>
                <path d="M3 7 Q8.5 11 14 7" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
                <path d="M14 7 Q19.5 11 25 7" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round"/>
              </svg>
            </div>
            <h1>Administración</h1>
          </div>
          <div className="header-actions">
            <button className="btn-header btn-volver" onClick={onVolver ?? (() => history.back())}>
              ← Cotizador
            </button>
            <button className="btn-header btn-salir" onClick={handleSignOut}>Salir</button>
          </div>
        </header>

        {loading ? (
          <div className="loading-screen">
            <span className="spinner spinner-dark spinner-lg" />
            Cargando precios…
          </div>
        ) : error ? (
          <div className="error-page">
            <div className="error-box">{error}</div>
          </div>
        ) : (
          <main className="content">
            <p className="page-intro">
              Actualizá los precios y márgenes cuando el proveedor los modifique.
              Los cambios se aplican al cotizador de forma inmediata.
            </p>

            {/* ── Configuración general ── */}
            <Seccion
              titulo="Configuración general"
              descripcion="Márgenes y recargos que afectan a todos los tipos de cortinas."
              fields={[
                { key: "margen_default",          label: "Margen de ganancia por defecto", tipo: "porcentaje", sufijo: "%" },
                { key: "recargo_cuotas",           label: "Recargo precio de lista vs. contado", tipo: "porcentaje", sufijo: "%" },
                { key: "descuento_contado_display",label: "Descuento contado mostrado al cliente", tipo: "porcentaje", sufijo: "%" },
                { key: "descuento_contado_real",   label: "Descuento contado real (uso interno)", tipo: "porcentaje", sufijo: "%" },
              ]}
              values={data.config}
              onChange={(k, v) => handleChange("config", k, v)}
              onSave={guardarConfig}
              saving={sectState.config.saving}
              feedback={sectState.config.feedback}
            />

            {/* ── Cortinas Textiles ── */}
            <Seccion
              titulo="Cortinas Textiles"
              descripcion="Precios de materiales por unidad (metro o paño)."
              fields={[
                { key: "tela_gasa",     label: "Tela Gasa (por metro)",    tipo: "precio" },
                { key: "tela_blackout", label: "Tela Blackout (por metro)", tipo: "precio" },
                { key: "pano",          label: "Paño (por unidad)",         tipo: "precio" },
                { key: "riel",          label: "Riel (por metro)",          tipo: "precio" },
              ]}
              values={data.textiles}
              onChange={(k, v) => handleChange("textiles", k, v)}
              onSave={guardarTextiles}
              saving={sectState.textiles.saving}
              feedback={sectState.textiles.feedback}
            />

            {/* ── Cortinas Verticales ── */}
            <Seccion
              titulo="Cortinas Verticales"
              descripcion="Precios de materiales por metro lineal o metro cuadrado."
              fields={[
                { key: "riel_por_metro",      label: "Riel (por metro de ancho)",       tipo: "precio" },
                { key: "blackout_premium_m2", label: "Tela Blackout Premium (por m²)",  tipo: "precio" },
                { key: "screen_m2",           label: "Tela Screen (por m²)",            tipo: "precio" },
              ]}
              values={data.verticales}
              onChange={(k, v) => handleChange("verticales", k, v)}
              onSave={guardarVerticales}
              saving={sectState.verticales.saving}
              feedback={sectState.verticales.feedback}
            />

            {/* ── Nota Roller ── */}
            <div className="nota-roller">
              <span className="nota-roller-icon">🔒</span>
              <p className="nota-roller-text">
                <strong>Cortinas Roller:</strong> los precios se cargan desde una tabla
                fija de 728 registros provista por el proveedor. Para actualizarlos
                hay que reemplazar la tabla <code>precios_roller</code> directamente en Supabase.
              </p>
            </div>
          </main>
        )}
      </div>
    </>
  );
}