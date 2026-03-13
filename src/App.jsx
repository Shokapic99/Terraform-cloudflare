import { useState, useMemo, useEffect } from "react";

const ETF_META = {
  MWEQ: { name: "MSCI World Equal Weight", target: 35, currency: "USD", defaultPrice: 9.85, countries: { US: 39.52, Japan: 14.70, Canada: 6.38, UK: 5.16, France: 3.91, Germany: 3.78, Australia: 3.50, Switzerland: 3.26, Sweden: 2.95, Others: 16.82 }, sectors: { Industrials: 19.33, "Financial Services": 17.20, Technology: 11.67, "Consumer Cyclical": 9.82, "Communication Services": 9.24, Healthcare: 8.91, "Consumer Defensive": 6.80, "Basic Materials": 6.73, Utilities: 5.30, "Real Estate": 5.35, Energy: 4.18 } },
  "9810": { name: "ASEAN ETF", target: 20, currency: "USD", defaultPrice: 9.625, countries: { Malaysia: 25.50, Indonesia: 24.20, Thailand: 24, Philippines: 14.70, Vietnam: 11 }, sectors: { "Financial Services": 32.17, Industrials: 17.01, "Real Estate": 9.37, "Communication Services": 8.52, "Consumer Defensive": 7.57, "Basic Materials": 6.32, Utilities: 6.21, "Consumer Cyclical": 4.82, Energy: 4.79, Healthcare: 2.39, Technology: 0.81 } },
  "2823": { name: "A50 China", target: 15, currency: "HKD", defaultPrice: 16.12, countries: { China: 100 }, sectors: { "Financial Services": 34.03, Technology: 17.29, "Consumer Defensive": 15.08, Industrials: 13.36, Energy: 4.84, Healthcare: 4.60, "Consumer Cyclical": 4.33, Utilities: 3.48, "Basic Materials": 2.99 } },
  "3448": { name: "China Tech", target: 10, currency: "HKD", defaultPrice: 115.2, countries: { China: 100 }, sectors: { Technology: 47.32, Healthcare: 20.68, Industrials: 19.58, "Consumer Cyclical": 12.42 } },
  "3087": { name: "Vietnam ETF", target: 10, currency: "HKD", defaultPrice: 305.7, countries: { Vietnam: 100 }, sectors: { Technology: 35.90, "Consumer Cyclical": 16.75, "Financial Services": 12.56, "Communication Services": 11.23, Healthcare: 8.36, "Consumer Defensive": 8.09, Industrials: 3.70, Energy: 1.72, "Real Estate": 0.70, Utilities: 0.52, "Basic Materials": 0.47 } },
  EMXC: { name: "EM ex-China", target: 10, currency: "USD", defaultPrice: 38.9, countries: { Taiwan: 29.55, "South Korea": 23.10, India: 17.03, Brazil: 5.26, "South Africa": 5.12, "Saudi Arabia": 3.45, Mexico: 2.59, UAE: 1.91, Malaysia: 1.51, Others: 10.47 }, sectors: { Technology: 38.73, "Financial Services": 22.60, Industrials: 8.07, "Basic Materials": 7.89, "Consumer Cyclical": 5.42, Energy: 4.19, "Communication Services": 3.89, "Consumer Defensive": 3.27, Healthcare: 2.46, Utilities: 2.30, "Real Estate": 1.19 } },
};

const FX = { HKD: 0.12, USD: 1.0, EUR: 1.08, KRW: 0.00069 };
const COUNTRY_COLORS = { China: "#e74c3c", US: "#3498db", Vietnam: "#2ecc71", Indonesia: "#f39c12", Thailand: "#9b59b6", Malaysia: "#1abc9c", Philippines: "#e67e22", Taiwan: "#34495e", Japan: "#e91e63", India: "#ff5722", Singapore: "#00bcd4", "South Korea": "#607d8b", UK: "#795548", France: "#9c27b0", Germany: "#4caf50", Brazil: "#8bc34a", "South Africa": "#ffc107", Canada: "#26c6da", Australia: "#ff8a65", Switzerland: "#ab47bc", Sweden: "#66bb6a", "Saudi Arabia": "#29b6f6", Mexico: "#ffca28", UAE: "#8d6e63", Crypto: "#f7c948", Others: "#bdc3c7" };
const SECTOR_COLORS = { Technology: "#3498db", "Financial Services": "#e74c3c", Industrials: "#f39c12", Healthcare: "#2ecc71", "Consumer Cyclical": "#9b59b6", Energy: "#e67e22", "Basic Materials": "#1abc9c", Utilities: "#34495e", "Consumer Defensive": "#e91e63", "Real Estate": "#795548", "Communication Services": "#607d8b", Crypto: "#f7c948", Others: "#bdc3c7" };
const TICKERS = Object.keys(ETF_META);

const INIT_SHARES = { MWEQ: 0, "9810": 50, "2823": 200, "3448": 27, "3087": 10, EMXC: 15 };
const INIT_PRICES = { MWEQ: 9.85, "9810": 9.625, "2823": 16.12, "3448": 115.2, "3087": 305.7, EMXC: 38.9 };
const INIT_ACHATS = [
  { id: 1, ticker: "3087", month: "2026-02", parts: 10, prixUnit: 305.7, frais: 18 },
  { id: 2, ticker: "2823", month: "2026-02", parts: 200, prixUnit: 16.12, frais: 18 },
  { id: 3, ticker: "9810", month: "2026-01", parts: 50, prixUnit: 9.625, frais: 2.25 },
  { id: 4, ticker: "3448", month: "2026-01", parts: 27, prixUnit: 115.2, frais: 18 },
  { id: 5, ticker: "EMXC", month: "2026-03", parts: 15, prixUnit: 38.9, frais: 4 },
];
const INIT_TRANSFERTS = [
  { id: 1, month: "2024-12", devise: "EUR", montantEnvoye: 50, montantArrive: 57 },
  { id: 2, month: "2024-12", devise: "EUR", montantEnvoye: 950, montantArrive: 1117.74 },
  { id: 3, month: "2025-01", devise: "EUR", montantEnvoye: 1003.6, montantArrive: 1000 },
  { id: 4, month: "2026-03", devise: "EUR", montantEnvoye: 500, montantArrive: 500 },
];

const s = { bg: "#0f0f23", card: "#1a1a2e", card2: "#12122a", border: "#2a2a3e", text: "#fff", muted: "#888", accent: "#7c9cfc", yellow: "#f7c948" };

// localStorage adapter (replaces window.storage from Claude Artifacts)
const storage = {
  get: (key) => Promise.resolve({ value: localStorage.getItem(key) }),
  set: (key, value) => Promise.resolve(localStorage.setItem(key, value)),
};

function useStoredState(key, init) {
  const [val, setVal] = useState(init);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      try {
        const r = await storage.get(key);
        if (r?.value) setVal(JSON.parse(r.value));
      } catch (_) {}
      setLoaded(true);
    })();
  }, [key]);
  const setter = (v) => {
    const next = typeof v === "function" ? v(val) : v;
    setVal(next);
    storage.set(key, JSON.stringify(next)).catch(() => {});
  };
  return [val, setter, loaded];
}

const Inp = ({ val, onChange, w = 60, step = 1 }) => (
  <input type="number" value={val} step={step} onChange={e => onChange(parseFloat(e.target.value) || 0)}
    style={{ width: w, textAlign: "center", background: s.card, border: `1px solid ${s.border}`, color: s.text, borderRadius: 4, padding: "3px 4px", fontSize: 12 }} />
);

function PieChart({ data, colors, size = 150 }) {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  if (total === 0) return null;
  let cum = 0;
  const slices = Object.entries(data).map(([k, v]) => { const pct = v / total, start = cum; cum += pct; return { key: k, pct, start }; });
  const r = size / 2 - 4, cx = size / 2, cy = size / 2;
  const arc = (a, b) => { const a1 = a * 2 * Math.PI - Math.PI / 2, a2 = b * 2 * Math.PI - Math.PI / 2; return `M ${cx} ${cy} L ${cx + r * Math.cos(a1)} ${cy + r * Math.sin(a1)} A ${r} ${r} 0 ${b - a > 0.5 ? 1 : 0} 1 ${cx + r * Math.cos(a2)} ${cy + r * Math.sin(a2)} Z`; };
  return <svg width={size} height={size}>{slices.map(sl => <path key={sl.key} d={arc(sl.start, sl.start + sl.pct)} fill={colors[sl.key] || "#bdc3c7"} stroke="#1a1a2e" strokeWidth={1} opacity={0.9} />)}</svg>;
}

function Legend({ data, colors, total }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 10px", marginTop: 8 }}>{Object.entries(data).sort((a, b) => b[1] - a[1]).map(([k, v]) => <div key={k} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10 }}><div style={{ width: 9, height: 9, borderRadius: 2, background: colors[k] || "#bdc3c7", flexShrink: 0 }} /><span style={{ color: "#aaa" }}>{k}</span><span style={{ color: "#fff", fontWeight: 600 }}>{((v / total) * 100).toFixed(1)}%</span></div>)}</div>;
}

const pctOf = (v, t) => t > 0 ? (v / t * 100).toFixed(1) : "0.0";
const diffColor = d => Math.abs(d) < 2 ? "#2ecc71" : d < 0 ? "#e74c3c" : "#f39c12";
const cell = (content, extra = {}) => <td style={{ textAlign: "center", padding: "6px 6px", color: "#ccc", fontSize: 12, ...extra }}>{content}</td>;

function TabPortfolio({ shares, setShares, prices, setPrices, ibkrCash, setIbkrCash, reserveFR, setReserveFR, reserveKR, setReserveKR, crypto, setCrypto }) {
  const etfValues = useMemo(() => Object.fromEntries(TICKERS.map(k => [k, shares[k] * prices[k] * FX[ETF_META[k].currency]])), [shares, prices]);
  const totalETF = useMemo(() => Object.values(etfValues).reduce((a, b) => a + b, 0), [etfValues]);
  const totalIBKR = totalETF + ibkrCash;
  const reserveFRusd = reserveFR * FX.EUR, reserveKRusd = reserveKR * FX.KRW;
  const totalReserve = reserveFRusd + reserveKRusd;
  const cryptoUSD = crypto * FX.EUR;
  const totalGlobal = totalIBKR + totalReserve + cryptoUSD;

  const aggCountries = useMemo(() => { const agg = {}; TICKERS.forEach(k => { Object.entries(ETF_META[k].countries).forEach(([c, w]) => { agg[c] = (agg[c] || 0) + etfValues[k] * w / 100; }); }); agg["Crypto"] = (agg["Crypto"] || 0) + cryptoUSD; return agg; }, [etfValues, cryptoUSD]);
  const aggSectors = useMemo(() => { const agg = {}; TICKERS.forEach(k => { Object.entries(ETF_META[k].sectors).forEach(([sec, w]) => { agg[sec] = (agg[sec] || 0) + etfValues[k] * w / 100; }); }); agg["Crypto"] = (agg["Crypto"] || 0) + cryptoUSD; return agg; }, [etfValues, cryptoUSD]);
  const countryTotal = Object.values(aggCountries).reduce((a, b) => a + b, 0);
  const sectorTotal = Object.values(aggSectors).reduce((a, b) => a + b, 0);

  return (
    <div>
      <div style={{ background: s.card, borderRadius: 10, padding: "10px 14px", marginBottom: 14, fontSize: 13 }}>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", alignItems: "center" }}>
          <span>💼 <strong style={{ color: s.accent }}>IBKR</strong> : ${totalIBKR.toFixed(0)}</span>
          <span>📈 ETFs : ${totalETF.toFixed(0)}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            💵 Cash dispo : <Inp val={ibkrCash} onChange={setIbkrCash} w={70} />$
            <span style={{ color: "#a0b4d0", fontSize: 11 }}>{pctOf(ibkrCash, totalIBKR)}%</span>
            <span style={{ color: "#c8d8f0", fontSize: 11 }}>{pctOf(ibkrCash, totalGlobal)}%</span>
          </span>
        </div>
      </div>
      <div style={{ overflowX: "auto", marginBottom: 16 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ color: "#666", borderBottom: `1px solid ${s.border}` }}>
              <th style={{ textAlign: "left", padding: "5px 8px" }}>ETF</th>
              <th style={{ textAlign: "center", padding: "5px 8px" }}>Parts</th>
              <th style={{ textAlign: "center", padding: "5px 8px" }}>Prix</th>
              <th style={{ textAlign: "center", padding: "5px 8px" }}>Valeur $</th>
              <th style={{ textAlign: "center", padding: "5px 8px" }}><div>ETFs only</div><div style={{ fontSize: 9, color: "#a0b4d0" }}>+ cash IBKR</div><div style={{ fontSize: 9, color: "#c8d8f0" }}>% global</div></th>
              <th style={{ textAlign: "center", padding: "5px 8px" }}>Cible</th>
              <th style={{ textAlign: "center", padding: "5px 8px" }}>Écart<div style={{ fontSize: 9, color: "#a0b4d0" }}>avec cash</div></th>
            </tr>
          </thead>
          <tbody>
            {TICKERS.map(ticker => {
              const val = etfValues[ticker];
              const etfOnly = totalETF > 0 ? val / totalETF * 100 : 0;
              const diff = etfOnly - ETF_META[ticker].target;
              const diffWithCash = totalIBKR > 0 ? val / totalIBKR * 100 - ETF_META[ticker].target : -ETF_META[ticker].target;
              return (
                <tr key={ticker} style={{ borderBottom: "1px solid #1e1e30" }}>
                  <td style={{ padding: "7px 8px" }}><div style={{ fontWeight: 700, color: s.accent, fontSize: 13 }}>{ticker}</div><div style={{ fontSize: 10, color: "#555" }}>{ETF_META[ticker].name}</div></td>
                  <td style={{ textAlign: "center", padding: "7px 6px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                      <button onClick={() => setShares(p => ({ ...p, [ticker]: Math.max(0, p[ticker] - 1) }))} style={{ background: "#2a2a3e", border: "none", color: "#fff", borderRadius: 4, width: 20, height: 20, cursor: "pointer" }}>−</button>
                      <input type="number" value={shares[ticker]} min={0} onChange={e => setShares(p => ({ ...p, [ticker]: Math.max(0, parseInt(e.target.value) || 0) }))} style={{ width: 46, textAlign: "center", background: s.card, border: `1px solid ${s.border}`, color: s.text, borderRadius: 4, padding: "2px 3px", fontSize: 12 }} />
                      <button onClick={() => setShares(p => ({ ...p, [ticker]: p[ticker] + 1 }))} style={{ background: "#2a2a3e", border: "none", color: "#fff", borderRadius: 4, width: 20, height: 20, cursor: "pointer" }}>+</button>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", padding: "7px 4px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 3 }}>
                      <input type="number" value={prices[ticker]} step="0.01" onChange={e => setPrices(p => ({ ...p, [ticker]: parseFloat(e.target.value) || 0 }))} style={{ width: 60, textAlign: "center", background: s.card, border: `1px solid ${s.border}`, color: s.text, borderRadius: 4, padding: "2px 3px", fontSize: 11 }} />
                      <span style={{ fontSize: 9, color: "#555" }}>{ETF_META[ticker].currency}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: "center", color: "#ccc" }}>${val.toFixed(0)}</td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ color: diffColor(diff), fontWeight: 700, fontSize: 12 }}>{etfOnly.toFixed(1)}%</div>
                    <div style={{ color: "#a0b4d0", fontSize: 12 }}>{pctOf(val, totalIBKR)}%</div>
                    <div style={{ color: "#c8d8f0", fontSize: 12 }}>{pctOf(val, totalGlobal)}%</div>
                  </td>
                  <td style={{ textAlign: "center", color: "#666" }}>{ETF_META[ticker].target}%</td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ color: diffColor(diff), fontWeight: 600, fontSize: 12 }}>{diff > 0 ? "+" : ""}{diff.toFixed(1)}%</div>
                    <div style={{ color: diffColor(diffWithCash), fontSize: 11 }}>{diffWithCash > 0 ? "+" : ""}{diffWithCash.toFixed(1)}%</div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ background: s.card, borderRadius: 10, padding: "12px 14px", marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: s.yellow, marginBottom: 10 }}>₿ Crypto</div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr style={{ color: "#666", borderBottom: `1px solid ${s.border}` }}><th style={{ textAlign: "left", padding: "5px 8px" }}>Asset</th><th style={{ textAlign: "center" }}>Valeur (EUR)</th><th style={{ textAlign: "center" }}>Valeur $</th><th style={{ textAlign: "center" }}>% global</th></tr></thead>
          <tbody><tr><td style={{ padding: "7px 8px", fontWeight: 700, color: s.yellow }}>Crypto</td><td style={{ textAlign: "center" }}><Inp val={crypto} onChange={setCrypto} w={80} /> EUR</td><td style={{ textAlign: "center", color: "#ccc" }}>${cryptoUSD.toFixed(0)}</td><td style={{ textAlign: "center", color: "#c8d8f0", fontWeight: 700 }}>{pctOf(cryptoUSD, totalGlobal)}%</td></tr></tbody>
        </table>
      </div>
      <div style={{ background: s.card2, border: `1px solid ${s.border}`, borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
        <div style={{ fontSize: 12, color: s.muted, marginBottom: 8, fontWeight: 600 }}>🏦 Cash réserve (hors IBKR)</div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", fontSize: 12, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>🇫🇷 FR : <Inp val={reserveFR} onChange={setReserveFR} w={80} /> <span style={{ color: "#555" }}>EUR</span> <span style={{ color: "#666" }}>(≈${reserveFRusd.toFixed(0)})</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>🇰🇷 KR : <Inp val={reserveKR} onChange={setReserveKR} w={90} /> <span style={{ color: "#555" }}>KRW</span> <span style={{ color: "#666" }}>(≈${reserveKRusd.toFixed(0)})</span></div>
          <div style={{ color: s.accent, fontWeight: 700 }}>Total ≈ ${totalReserve.toFixed(0)} <span style={{ color: "#c8d8f0", fontSize: 11 }}>({pctOf(totalReserve, totalGlobal)}% patrimoine)</span></div>
        </div>
      </div>
      {totalETF > 0 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: s.card, borderRadius: 12, padding: 14 }}><h3 style={{ fontSize: 13, marginBottom: 10, color: s.accent }}>🌍 Pays</h3><div style={{ display: "flex", justifyContent: "center" }}><PieChart data={aggCountries} colors={COUNTRY_COLORS} size={140} /></div><Legend data={aggCountries} colors={COUNTRY_COLORS} total={countryTotal} /></div>
        <div style={{ background: s.card, borderRadius: 12, padding: 14 }}><h3 style={{ fontSize: 13, marginBottom: 10, color: s.accent }}>🏭 Secteurs</h3><div style={{ display: "flex", justifyContent: "center" }}><PieChart data={aggSectors} colors={SECTOR_COLORS} size={140} /></div><Legend data={aggSectors} colors={SECTOR_COLORS} total={sectorTotal} /></div>
      </div>}
    </div>
  );
}

function TabAchats({ achats, setAchats }) {
  const update = (id, field, val) => setAchats(a => a.map(r => r.id === id ? { ...r, [field]: val } : r));
  const addRow = () => setAchats(a => [...a, { id: Date.now(), ticker: "MWEQ", month: "2026-04", parts: 0, prixUnit: 0, frais: 4 }]);
  const delRow = id => setAchats(a => a.filter(r => r.id !== id));
  const rows = useMemo(() => achats.map(r => { const mb = r.parts * r.prixUnit, mt = mb + r.frais, pf = mt > 0 ? r.frais / mt * 100 : 0, pr = r.parts > 0 ? mt / r.parts : 0; return { ...r, mb, mt, pf, pr }; }), [achats]);
  const th = { textAlign: "center", padding: "5px 6px", color: "#666", fontSize: 11, borderBottom: `1px solid ${s.border}` };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 15, color: s.accent }}>📋 Historique des achats</h2>
        <button onClick={addRow} style={{ background: s.accent, border: "none", color: "#fff", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>+ Ajouter</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr><th style={{ ...th, textAlign: "left" }}>ETF</th><th style={th}>Mois</th><th style={th}>Parts</th><th style={th}>Prix unit.</th><th style={th}>Montant brut</th><th style={th}>Frais</th><th style={th}>Montant total</th><th style={th}>% frais</th><th style={th}>Prix revient</th><th style={th}></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid #1e1e30" }}>
                <td style={{ padding: "6px 8px" }}>
                  <select value={r.ticker} onChange={e => update(r.id, "ticker", e.target.value)} style={{ background: s.card, border: `1px solid ${s.border}`, color: s.accent, borderRadius: 4, padding: "3px 4px", fontSize: 12, fontWeight: 700 }}>
                    {TICKERS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </td>
                {cell(<input type="month" value={r.month} onChange={e => update(r.id, "month", e.target.value)} style={{ background: s.card, border: `1px solid ${s.border}`, color: "#ccc", borderRadius: 4, padding: "2px 4px", fontSize: 11 }} />)}
                {cell(<Inp val={r.parts} onChange={v => update(r.id, "parts", v)} w={55} />)}
                {cell(<Inp val={r.prixUnit} onChange={v => update(r.id, "prixUnit", v)} w={60} step={0.01} />)}
                {cell(`${r.mb.toFixed(2)}`)}
                {cell(<Inp val={r.frais} onChange={v => update(r.id, "frais", v)} w={50} step={0.01} />)}
                {cell(`${r.mt.toFixed(2)}`, { color: "#fff", fontWeight: 600 })}
                {cell(<span style={{ color: r.pf > 1 ? "#e74c3c" : "#2ecc71" }}>{r.pf.toFixed(2)}%</span>)}
                {cell(`${r.pr.toFixed(3)}`, { color: s.yellow })}
                <td style={{ textAlign: "center", padding: "6px" }}><button onClick={() => delRow(r.id)} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 14 }}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {rows.length === 0 && <div style={{ textAlign: "center", color: s.muted, padding: 30 }}>Aucun achat enregistré</div>}
    </div>
  );
}

function TabTransferts({ transferts, setTransferts }) {
  const update = (id, field, val) => setTransferts(t => t.map(r => r.id === id ? { ...r, [field]: val } : r));
  const addRow = () => setTransferts(t => [...t, { id: Date.now(), month: "2026-04", devise: "EUR", montantEnvoye: 0, montantArrive: 0 }]);
  const delRow = id => setTransferts(t => t.filter(r => r.id !== id));
  const resetData = () => setTransferts(INIT_TRANSFERTS);
  const rows = useMemo(() => transferts.map(r => { const eu = r.montantEnvoye * FX[r.devise], au = r.montantArrive, fr = eu - au, pf = eu > 0 ? fr / eu * 100 : 0; return { ...r, eu, au, fr, pf }; }), [transferts]);
  const totE = rows.reduce((a, r) => a + r.eu, 0), totA = rows.reduce((a, r) => a + r.au, 0), totF = totE - totA, totP = totE > 0 ? totF / totE * 100 : 0;
  const th = { textAlign: "center", padding: "5px 6px", color: "#666", fontSize: 11, borderBottom: `1px solid ${s.border}` };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <h2 style={{ fontSize: 15, color: s.accent }}>💸 Transferts vers IBKR</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={addRow} style={{ background: s.accent, border: "none", color: "#fff", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>+ Ajouter</button>
          <button onClick={resetData} style={{ background: "#e74c3c", border: "none", color: "#fff", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12 }}>↺ Reset</button>
        </div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead><tr><th style={th}>Mois</th><th style={th}>Devise</th><th style={th}>Montant envoyé</th><th style={th}>≈ USD</th><th style={th}>Arrivé ($)</th><th style={th}>Frais ($)</th><th style={th}>% frais</th><th style={th}></th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} style={{ borderBottom: "1px solid #1e1e30" }}>
                {cell(<input type="month" value={r.month} onChange={e => update(r.id, "month", e.target.value)} style={{ background: s.card, border: `1px solid ${s.border}`, color: "#ccc", borderRadius: 4, padding: "2px 4px", fontSize: 11 }} />)}
                <td style={{ textAlign: "center", padding: "6px" }}>
                  <select value={r.devise} onChange={e => update(r.id, "devise", e.target.value)} style={{ background: s.card, border: `1px solid ${s.border}`, color: "#ccc", borderRadius: 4, padding: "3px 4px", fontSize: 12 }}>
                    <option>EUR</option><option>USD</option><option>KRW</option>
                  </select>
                </td>
                {cell(<Inp val={r.montantEnvoye} onChange={v => update(r.id, "montantEnvoye", v)} w={80} step={0.01} />)}
                {cell(`$${r.eu.toFixed(2)}`, { color: "#aaa" })}
                {cell(<Inp val={r.montantArrive} onChange={v => update(r.id, "montantArrive", v)} w={80} step={0.01} />)}
                {cell(`$${r.fr.toFixed(2)}`, { color: r.fr > 0 ? "#e74c3c" : "#2ecc71" })}
                {cell(<span style={{ color: r.pf > 1 ? "#e74c3c" : "#2ecc71" }}>{r.pf.toFixed(2)}%</span>)}
                <td style={{ textAlign: "center", padding: "6px" }}><button onClick={() => delRow(r.id)} style={{ background: "none", border: "none", color: "#e74c3c", cursor: "pointer", fontSize: 14 }}>✕</button></td>
              </tr>
            ))}
          </tbody>
          {rows.length > 1 && <tfoot><tr style={{ borderTop: `1px solid ${s.border}`, color: s.accent, fontWeight: 700 }}>
            <td colSpan={2} style={{ padding: "7px 8px", fontSize: 12 }}>Total</td>
            {cell(`$${totE.toFixed(2)}`)}
            <td />
            {cell(`$${totA.toFixed(2)}`)}
            {cell(`$${totF.toFixed(2)}`, { color: "#e74c3c" })}
            {cell(`${totP.toFixed(2)}%`, { color: "#e74c3c" })}
            <td />
          </tr></tfoot>}
        </table>
      </div>
      {rows.length === 0 && <div style={{ textAlign: "center", color: s.muted, padding: 30 }}>Aucun transfert enregistré</div>}
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState(0);
  const [shares, setShares, sharesLoaded] = useStoredState("ptf:shares", INIT_SHARES);
  const [prices, setPrices] = useStoredState("ptf:prices", INIT_PRICES);
  const [ibkrCash, setIbkrCash] = useStoredState("ptf:ibkrCash", 660);
  const [reserveFR, setReserveFR] = useStoredState("ptf:reserveFR", 20600);
  const [reserveKR, setReserveKR] = useStoredState("ptf:reserveKR", 2000000);
  const [crypto, setCrypto] = useStoredState("ptf:crypto", 1950);
  const [achats, setAchats] = useStoredState("ptf:achats", INIT_ACHATS);
  const [transferts, setTransferts] = useStoredState("ptf:transferts", INIT_TRANSFERTS);

  if (!sharesLoaded) return <div style={{ background: s.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: s.muted }}>Chargement…</div>;

  const tabs = ["📊 Portfolio", "📋 Achats", "💸 Transferts"];
  return (
    <div style={{ background: s.bg, minHeight: "100vh", color: s.text, fontFamily: "'Segoe UI', sans-serif", padding: "16px" }}>
      <h1 style={{ fontSize: 18, fontWeight: 700, marginBottom: 14, color: s.accent }}>📊 Portfolio Tracker</h1>
      <div style={{ display: "flex", gap: 4, marginBottom: 16, borderBottom: `1px solid ${s.border}` }}>
        {tabs.map((t, i) => <button key={i} onClick={() => setTab(i)} style={{ background: tab === i ? s.accent : "transparent", border: "none", color: tab === i ? "#fff" : s.muted, borderRadius: "6px 6px 0 0", padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: tab === i ? 700 : 400 }}>{t}</button>)}
      </div>
      {tab === 0 && <TabPortfolio shares={shares} setShares={setShares} prices={prices} setPrices={setPrices} ibkrCash={ibkrCash} setIbkrCash={setIbkrCash} reserveFR={reserveFR} setReserveFR={setReserveFR} reserveKR={reserveKR} setReserveKR={setReserveKR} crypto={crypto} setCrypto={setCrypto} />}
      {tab === 1 && <TabAchats achats={achats} setAchats={setAchats} />}
      {tab === 2 && <TabTransferts transferts={transferts} setTransferts={setTransferts} />}
      <p style={{ fontSize: 10, color: "#333", marginTop: 20, textAlign: "center" }}>FX approx · données secteurs/pays réelles</p>
    </div>
  );
}
