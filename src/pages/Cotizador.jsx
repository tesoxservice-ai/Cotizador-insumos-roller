import { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

const fmt = (n) =>
  Math.round(n).toLocaleString("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 0, maximumFractionDigits: 0 });

export default function Cotizador() {
  const [tab, setTab] = useState("textiles");
  const [config, setConfig] = useState(null);
  const [preciosTextiles, setPreciosTextiles] = useState(null);
  const [preciosVerticales, setPreciosVerticales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargar = async () => {
      try {
        const [{ data: cfg }, { data: pt }, { data: pv }] = await Promise.all([
          supabase.from("configuracion").select("*"),
          supabase.from("precios_textiles").select("*"),
          supabase.from("precios_verticales").select("*"),
        ]);
        const c = Object.fromEntries((cfg || []).map(r => [r.clave, parseFloat(r.valor)]));
        const t = Object.fromEntries((pt || []).map(r => [r.material, parseFloat(r.precio)]));
        const v = Object.fromEntries((pv || []).map(r => [r.material, parseFloat(r.precio)]));
        setConfig(c);
        setPreciosTextiles(t);
        setPreciosVerticales(v);
      } catch (e) {
        setError("Error al cargar precios.");
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, []);

  const handleSignOut = () => supabase.auth.signOut();

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f4f4f6; }
        .app { min-height: 100dvh; display: flex; flex-direction: column; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f4f4f6; color: #1a1a2e; max-width: 480px; margin: 0 auto; }
        .header { position: sticky; top: 0; z-index: 10; background: #1a1a2e; color: #fff; display: flex; align-items: center; justify-content: space-between; padding: 14px 16px; }
        .header-left { display: flex; align-items: center; gap: 10px; }
        .header h1 { font-size: 17px; font-weight: 700; }
        .btn-header { height: 34px; padding: 0 12px; border-radius: 7px; border: none; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-salir { background: rgba(255,80,80,0.25); color: #ffaaaa; }
        .tabs { display: flex; background: #fff; border-bottom: 1px solid #e8e8ec; }
        .tab-btn { flex: 1; padding: 14px 4px; border: none; background: transparent; font-size: 14px; font-weight: 600; color: #999; cursor: pointer; border-bottom: 3px solid transparent; }
        .tab-btn.active { color: #1a1a2e; border-bottom-color: #1a1a2e; }
        .content { flex: 1; padding: 20px 16px 40px; }
        .modulo { display: flex; flex-direction: column; gap: 16px; }
        .field-group { display: flex; flex-direction: column; gap: 6px; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        label { font-size: 13px; font-weight: 600; color: #555; }
        input[type="number"] { height: 52px; padding: 0 14px; border: 1.5px solid #e0e0e8; border-radius: 9px; font-size: 17px; color: #1a1a2e; background: #fff; outline: none; width: 100%; -webkit-appearance: none; }
        input:focus { border-color: #1a1a2e; }
        .radio-group { display: flex; gap: 8px; }
        .radio-btn { flex: 1; height: 48px; border: 1.5px solid #e0e0e8; border-radius: 9px; background: #fff; font-size: 14px; font-weight: 600; color: #888; cursor: pointer; }
        .radio-btn.active { border-color: #1a1a2e; background: #1a1a2e; color: #fff; }
        .btn-calcular { height: 54px; width: 100%; background: #1a1a2e; color: #fff; border: none; border-radius: 10px; font-size: 17px; font-weight: 700; cursor: pointer; margin-top: 4px; }
        .desglose { background: #fff; border: 1px solid #e8e8ec; border-radius: 10px; padding: 14px 16px; }
        .desglose-titulo { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 10px; }
        .detalle-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f0f0f4; font-size: 14px; }
        .detalle-row:last-child { border-bottom: none; }
        .detalle-label { color: #666; }
        .detalle-value { font-weight: 600; }
        .resultado { background: #fff; border: 1px solid #e8e8ec; border-radius: 12px; overflow: hidden; }
        .resultado-titulo { font-size: 11px; font-weight: 700; color: #aaa; text-transform: uppercase; letter-spacing: 0.06em; padding: 14px 16px 10px; border-bottom: 1px solid #f0f0f4; }
        .precio-row { display: flex; align-items: center; justify-content: space-between; padding: 13px 16px; border-bottom: 1px solid #f0f0f4; font-size: 15px; }
        .precio-row span { color: #555; }
        .precio-row strong { font-size: 17px; font-weight: 700; color: #1a1a2e; }
        .precio-row.contado { background: #f0faf4; }
        .precio-row.contado strong { color: #1a7a45; }
        .precio-row.costo strong { color: #888; font-size: 15px; }
        .precio-row.cuota strong { font-size: 15px; }
        .precio-row small { font-size: 12px; color: #999; margin-left: 2px; }
        .btn-copiar { display: block; width: calc(100% - 32px); margin: 14px 16px; height: 48px; border: 1.5px solid #1a1a2e; border-radius: 9px; background: transparent; color: #1a1a2e; font-size: 15px; font-weight: 600; cursor: pointer; }
        .btn-copiar.copiado { background: #1a1a2e; color: #fff; }
        .error-box { background: #fff5f5; border: 1px solid #fcd0d0; border-radius: 9px; padding: 13px 16px; font-size: 14px; color: #c0392b; }
        .loading-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; color: #888; font-size: 15px; }
        .spinner { width: 36px; height: 36px; border: 3px solid rgba(26,26,46,0.2); border-top-color: #1a1a2e; border-radius: 50%; animation: spin 0.7s linear infinite; display: inline-block; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="app">
        <header className="header">
          <div className="header-left">
            <h1>Cotizador Cortinas</h1>
          </div>
          <button className="btn-header btn-salir" onClick={handleSignOut}>Salir</button>
        </header>

        {loading ? (
          <div className="loading-screen"><span className="spinner" />Cargando precios…</div>
        ) : error ? (
          <div className="content"><div className="error-box">{error}</div></div>
        ) : (
          <>
            <nav className="tabs">
              {["textiles", "verticales", "roller"].map(t => (
                <button key={t} className={`tab-btn ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </nav>
            <main className="content">
              {tab === "textiles" && <ModuloTextiles precios={preciosTextiles} config={config} />}
              {tab === "verticales" && <ModuloVerticales precios={preciosVerticales} config={config} />}
              {tab === "roller" && <ModuloRoller config={config} />}
            </main>
          </>
        )}
      </div>
    </>
  );
}

function calcPrecios(costo, margen, config) {
  const recargo = config?.recargo_cuotas ?? 50;
  const contado = costo * (1 + margen / 100);
  const lista = contado * (1 + recargo / 100);
  return { costo, contado, lista, cuota3: lista / 3, cuota6: lista / 6 };
}

function Resultado({ result, config, tipo, medidas }) {
  const [copiado, setCopiado] = useState(false);
  const desc = config?.descuento_contado_display ?? 30;

  const copiar = () => {
    const texto = `🏠 Cotización Cortinas\nTipo: ${tipo}\n${medidas}\n\n💰 Precio contado/transferencia: ${fmt(result.contado)} (${desc}% OFF)\n📋 Precio de lista: ${fmt(result.lista)}\n💳 3 cuotas sin interés: ${fmt(result.cuota3)}/cuota\n💳 6 cuotas sin interés: ${fmt(result.cuota6)}/cuota\n\n✅ Consultas sin compromiso`;
    navigator.clipboard.writeText(texto).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 2500); });
  };

  return (
    <div className="resultado">
      <p className="resultado-titulo">Resultado</p>
      <div className="precio-row costo"><span>💰 Costo de materiales</span><strong>{fmt(result.costo)}</strong></div>
      <div className="precio-row contado"><span>💵 Precio contado</span><strong>{fmt(result.contado)}</strong></div>
      <div className="precio-row lista"><span>📋 Precio de lista</span><strong>{fmt(result.lista)}</strong></div>
      <div className="precio-row cuota"><span>3️⃣ 3 cuotas sin interés</span><strong>{fmt(result.cuota3)}<small>/cuota</small></strong></div>
      <div className="precio-row cuota"><span>6️⃣ 6 cuotas sin interés</span><strong>{fmt(result.cuota6)}<small>/cuota</small></strong></div>
      <button className={`btn-copiar ${copiado ? "copiado" : ""}`} onClick={copiar}>
        {copiado ? "✓ ¡Copiado!" : "📋 Copiar cotización"}
      </button>
    </div>
  );
}

function ModuloTextiles({ precios, config }) {
  const [ancho, setAncho] = useState("");
  const [tela, setTela] = useState("gasa");
  const [margen, setMargen] = useState(80);
  const [result, setResult] = useState(null);

  const calcular = () => {
    const a = parseFloat(ancho);
    if (!a || a <= 0 || !precios) return;
    const precioTela = tela === "gasa" ? precios.tela_gasa : precios.tela_blackout;
    const factor = tela === "gasa" ? 2.5 : 2;
    const metrosTela = a * factor;
    const panos = Math.ceil(metrosTela / 1.5);
    const costo = metrosTela * precioTela + panos * precios.paño + a * precios.riel;
    setResult({ ...calcPrecios(costo, margen, config), metrosTela, panos, metrosRiel: a, tipo: `Textiles - ${tela === "gasa" ? "Gasa" : "Blackout"}`, medidas: `Ancho: ${a.toFixed(2)}m` });
  };

  return (
    <div className="modulo">
      <div className="field-group">
        <label>Ancho (metros)</label>
        <input type="number" inputMode="decimal" placeholder="Ej: 2.00" value={ancho} onChange={e => setAncho(e.target.value)} min="0" step="0.01" />
      </div>
      <div className="field-group">
        <label>Tipo de tela</label>
        <div className="radio-group">
          {[["gasa", "Gasa"], ["blackout", "Blackout"]].map(([v, l]) => (
            <button key={v} type="button" className={`radio-btn ${tela === v ? "active" : ""}`} onClick={() => setTela(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="field-group">
        <label>Margen de ganancia (%)</label>
        <input type="number" value={margen} onChange={e => setMargen(parseFloat(e.target.value) || 0)} min="0" />
      </div>
      <button className="btn-calcular" onClick={calcular}>Calcular</button>
      {result && (
        <>
          <div className="desglose">
            <p className="desglose-titulo">Desglose</p>
            <div className="detalle-row"><span className="detalle-label">Metros de tela</span><span className="detalle-value">{result.metrosTela.toFixed(2)} m</span></div>
            <div className="detalle-row"><span className="detalle-label">Paños</span><span className="detalle-value">{result.panos}</span></div>
            <div className="detalle-row"><span className="detalle-label">Metros de riel</span><span className="detalle-value">{result.metrosRiel.toFixed(2)} m</span></div>
          </div>
          <Resultado result={result} config={config} tipo={result.tipo} medidas={result.medidas} />
        </>
      )}
    </div>
  );
}

function ModuloVerticales({ precios, config }) {
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");
  const [tela, setTela] = useState("blackout_premium");
  const [margen, setMargen] = useState(80);
  const [result, setResult] = useState(null);

  const calcular = () => {
    const a = parseFloat(ancho), h = parseFloat(alto);
    if (!a || !h || !precios) return;
    const m2 = a * h;
    const precioTela = tela === "blackout_premium" ? precios.blackout_premium_m2 : precios.screen_m2;
    const costo = a * precios.riel_por_metro + m2 * precioTela;
    setResult({ ...calcPrecios(costo, margen, config), m2, tipo: `Verticales - ${tela === "blackout_premium" ? "Blackout Premium" : "Screen"}`, medidas: `Ancho: ${a.toFixed(2)}m | Alto: ${h.toFixed(2)}m` });
  };

  return (
    <div className="modulo">
      <div className="field-row">
        <div className="field-group"><label>Ancho (m)</label><input type="number" inputMode="decimal" placeholder="2.00" value={ancho} onChange={e => setAncho(e.target.value)} min="0" step="0.01" /></div>
        <div className="field-group"><label>Alto (m)</label><input type="number" inputMode="decimal" placeholder="2.00" value={alto} onChange={e => setAlto(e.target.value)} min="0" step="0.01" /></div>
      </div>
      <div className="field-group">
        <label>Tipo de tela</label>
        <div className="radio-group">
          {[["blackout_premium", "Blackout Premium"], ["screen", "Screen"]].map(([v, l]) => (
            <button key={v} type="button" className={`radio-btn ${tela === v ? "active" : ""}`} onClick={() => setTela(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="field-group">
        <label>Margen de ganancia (%)</label>
        <input type="number" value={margen} onChange={e => setMargen(parseFloat(e.target.value) || 0)} min="0" />
      </div>
      <button className="btn-calcular" onClick={calcular}>Calcular</button>
      {result && (
        <>
          <div className="desglose">
            <p className="desglose-titulo">Desglose</p>
            <div className="detalle-row"><span className="detalle-label">Metros cuadrados</span><span className="detalle-value">{result.m2.toFixed(2)} m²</span></div>
          </div>
          <Resultado result={result} config={config} tipo={result.tipo} medidas={result.medidas} />
        </>
      )}
    </div>
  );
}

function ModuloRoller({ config }) {
  const [ancho, setAncho] = useState("");
  const [alto, setAlto] = useState("");
  const [tipo, setTipo] = useState("blackout");
  const [margen, setMargen] = useState(80);
  const [result, setResult] = useState(null);
  const [loadingCalc, setLoadingCalc] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const calcular = async () => {
    const a = parseInt(ancho), h = parseInt(alto);
    if (!a || !h) return;
    const anchoBuscar = Math.ceil(a / 10) * 10;
    const altoBuscar = Math.ceil(h / 10) * 10;
    setLoadingCalc(true);
    setErrorMsg(null);
    const { data, error } = await supabase.from("precios_roller").select("precio").eq("alto_cm", altoBuscar).eq("ancho_cm", anchoBuscar).single();
    setLoadingCalc(false);
    if (error || !data) { setErrorMsg(`No se encontró precio para ${anchoBuscar}×${altoBuscar} cm.`); return; }
    setResult({ ...calcPrecios(data.precio, margen, config), anchoBuscar, altoBuscar, tipo: `Roller - ${tipo === "blackout" ? "Blackout" : "Screen"}`, medidas: `Ancho: ${a} cm | Alto: ${h} cm` });
  };

  return (
    <div className="modulo">
      <div className="field-row">
        <div className="field-group"><label>Ancho (cm)</label><input type="number" inputMode="numeric" placeholder="120" value={ancho} onChange={e => setAncho(e.target.value)} min="0" /></div>
        <div className="field-group"><label>Alto (cm)</label><input type="number" inputMode="numeric" placeholder="160" value={alto} onChange={e => setAlto(e.target.value)} min="0" /></div>
      </div>
      <div className="field-group">
        <label>Tipo</label>
        <div className="radio-group">
          {[["blackout", "Blackout"], ["screen", "Screen"]].map(([v, l]) => (
            <button key={v} type="button" className={`radio-btn ${tipo === v ? "active" : ""}`} onClick={() => setTipo(v)}>{l}</button>
          ))}
        </div>
      </div>
      <div className="field-group">
        <label>Margen de ganancia (%)</label>
        <input type="number" value={margen} onChange={e => setMargen(parseFloat(e.target.value) || 0)} min="0" />
      </div>
      <button className="btn-calcular" disabled={loadingCalc} onClick={calcular}>{loadingCalc ? "Calculando..." : "Calcular"}</button>
      {errorMsg && <div className="error-box">{errorMsg}</div>}
      {result && (
        <>
          <div className="desglose">
            <p className="desglose-titulo">Desglose</p>
            <div className="detalle-row"><span className="detalle-label">Tabla consultada</span><span className="detalle-value">{result.anchoBuscar}×{result.altoBuscar} cm</span></div>
          </div>
          <Resultado result={result} config={config} tipo={result.tipo} medidas={result.medidas} />
        </>
      )}
    </div>
  );
}