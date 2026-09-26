"use client";
 
import { useEffect, useMemo, useState } from "react";
 
type Tipo = "ingreso" | "egreso";
type Mov = { id: string; tipo: Tipo; fecha: string; descripcion: string; categoria: string; monto: number };
 
const ars = (n: number) =>
  new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n);
const hoy = () => new Date().toISOString().slice(0, 10);
 
// Carga una librería desde CDN solo cuando se necesita (sin tocar package.json)
function cargarScript(src: string) {
  return new Promise<void>((ok, mal) => {
    if (document.querySelector(`script[src="${src}"]`)) return ok();
    const s = document.createElement("script");
    s.src = src;
    s.onload = () => ok();
    s.onerror = () => mal(new Error("No se pudo cargar " + src));
    document.head.appendChild(s);
  });
}
 
export default function Finanzas() {
  const [movs, setMovs] = useState<Mov[]>([]);
  const [tipo, setTipo] = useState<Tipo>("ingreso");
  const [fecha, setFecha] = useState(hoy());
  const [descripcion, setDescripcion] = useState("");
  const [categoria, setCategoria] = useState("");
  const [monto, setMonto] = useState("");
  const [aviso, setAviso] = useState("");
 
  // Persistencia en el navegador
  useEffect(() => {
    try {
      const g = localStorage.getItem("finanzas-movs");
      if (g) setMovs(JSON.parse(g));
    } catch {}
  }, []);
  useEffect(() => {
    try { localStorage.setItem("finanzas-movs", JSON.stringify(movs)); } catch {}
  }, [movs]);
 
  const totales = useMemo(() => {
    const ingresos = movs.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + m.monto, 0);
    const egresos = movs.filter((m) => m.tipo === "egreso").reduce((s, m) => s + m.monto, 0);
    return { ingresos, egresos, balance: ingresos - egresos };
  }, [movs]);
 
  const porCategoria = useMemo(() => {
    const mapa: Record<string, { ingreso: number; egreso: number }> = {};
    for (const m of movs) {
      mapa[m.categoria] ??= { ingreso: 0, egreso: 0 };
      mapa[m.categoria][m.tipo] += m.monto;
    }
    return Object.entries(mapa)
      .map(([cat, v]) => ({ cat, ...v }))
      .sort((a, b) => b.ingreso + b.egreso - (a.ingreso + a.egreso));
  }, [movs]);
  const maxCat = Math.max(1, ...porCategoria.map((c) => Math.max(c.ingreso, c.egreso)));
 
  function agregar() {
    const n = parseFloat(monto.replace(",", "."));
    if (!descripcion.trim() || !(n > 0)) {
      setAviso("Completá la descripción y un monto mayor a cero.");
      return;
    }
    setMovs((prev) => [
      { id: crypto.randomUUID(), tipo, fecha, descripcion: descripcion.trim(), categoria: categoria.trim() || "General", monto: n },
      ...prev,
    ]);
    setDescripcion(""); setMonto(""); setAviso("");
  }
 
  const borrar = (id: string) => setMovs((p) => p.filter((m) => m.id !== id));
 
  const ordenados = [...movs].sort((a, b) => b.fecha.localeCompare(a.fecha));
 
  async function exportarXlsx() {
    try {
      await cargarScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js");
      const XLSX = (window as any).XLSX;
      const wb = XLSX.utils.book_new();
      const filas = ordenados.map((m) => ({
        Fecha: m.fecha, Tipo: m.tipo === "ingreso" ? "Ingreso" : "Egreso",
        Descripción: m.descripcion, Categoría: m.categoria,
        Monto: m.tipo === "ingreso" ? m.monto : -m.monto,
      }));
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(filas), "Movimientos");
      const resumen = [
        { Concepto: "Ingresos", Monto: totales.ingresos },
        { Concepto: "Egresos", Monto: totales.egresos },
        { Concepto: "Balance", Monto: totales.balance },
        {},
        ...porCategoria.map((c) => ({ Concepto: c.cat, Ingresos: c.ingreso, Egresos: c.egreso, Neto: c.ingreso - c.egreso })),
      ];
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resumen), "Resumen");
      XLSX.writeFile(wb, `finanzas-${hoy()}.xlsx`);
    } catch {
      setAviso("No se pudo generar el Excel. Revisá tu conexión y probá de nuevo.");
    }
  }
 
  async function exportarPdf() {
    try {
      await cargarScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js");
      await cargarScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js");
      const { jsPDF } = (window as any).jspdf;
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Reporte de ingresos y egresos", 14, 18);
      doc.setFontSize(11);
      doc.text(`Generado el ${new Date().toLocaleDateString("es-AR")}`, 14, 26);
      doc.text(`Ingresos: ${ars(totales.ingresos)}`, 14, 36);
      doc.text(`Egresos: ${ars(totales.egresos)}`, 14, 43);
      doc.text(`Balance: ${ars(totales.balance)}`, 14, 50);
      (doc as any).autoTable({
        startY: 58,
        head: [["Fecha", "Tipo", "Descripción", "Categoría", "Monto"]],
        body: ordenados.map((m) => [
          m.fecha, m.tipo === "ingreso" ? "Ingreso" : "Egreso", m.descripcion, m.categoria,
          (m.tipo === "egreso" ? "-" : "") + ars(m.monto),
        ]),
        headStyles: { fillColor: [31, 58, 75] },
        styles: { fontSize: 9 },
      });
      doc.save(`finanzas-${hoy()}.pdf`);
    } catch {
      setAviso("No se pudo generar el PDF. Revisá tu conexión y probá de nuevo.");
    }
  }
 
  return (
    <main className="fz">
      <style>{css}</style>
      <header className="fz-head">
        <h1>Mis finanzas</h1>
        <p>Anotá lo que entra y lo que sale. El balance se calcula solo.</p>
      </header>
 
      <section className="fz-totales" aria-label="Totales">
        <div className="t in"><span>Ingresos</span><strong>{ars(totales.ingresos)}</strong></div>
        <div className="t out"><span>Egresos</span><strong>{ars(totales.egresos)}</strong></div>
        <div className={"t bal " + (totales.balance < 0 ? "neg" : "")}>
          <span>Balance</span><strong>{ars(totales.balance)}</strong>
        </div>
      </section>
 
      <section className="fz-form" aria-label="Nuevo movimiento">
        <div className="seg" role="radiogroup" aria-label="Tipo">
          <button role="radio" aria-checked={tipo === "ingreso"} className={tipo === "ingreso" ? "on in" : ""} onClick={() => setTipo("ingreso")}>Ingreso</button>
          <button role="radio" aria-checked={tipo === "egreso"} className={tipo === "egreso" ? "on out" : ""} onClick={() => setTipo("egreso")}>Egreso</button>
        </div>
        <label>Fecha<input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></label>
        <label>Descripción<input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Sueldo, alquiler, súper…" /></label>
        <label>Categoría<input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Trabajo, casa, comida…" list="cats" /></label>
        <datalist id="cats">{porCategoria.map((c) => <option key={c.cat} value={c.cat} />)}</datalist>
        <label>Monto<input inputMode="decimal" value={monto} onChange={(e) => setMonto(e.target.value)} onKeyDown={(e) => e.key === "Enter" && agregar()} placeholder="0,00" /></label>
        <button className="add" onClick={agregar}>Agregar {tipo}</button>
        {aviso && <p className="aviso" role="alert">{aviso}</p>}
      </section>
 
      <section className="fz-grafico" aria-label="Gráfico por categoría">
        <h2>Por categoría</h2>
        {porCategoria.length === 0 ? (
          <p className="vacio">Cuando agregues movimientos, acá vas a ver en qué se va y de dónde viene la plata.</p>
        ) : (
          porCategoria.map((c) => (
            <div className="fila" key={c.cat}>
              <span className="cat">{c.cat}</span>
              <div className="barras">
                {c.ingreso > 0 && <div className="barra in" style={{ width: `${(c.ingreso / maxCat) * 100}%` }} title={ars(c.ingreso)}><em>{ars(c.ingreso)}</em></div>}
                {c.egreso > 0 && <div className="barra out" style={{ width: `${(c.egreso / maxCat) * 100}%` }} title={ars(c.egreso)}><em>{ars(c.egreso)}</em></div>}
              </div>
            </div>
          ))
        )}
      </section>
 
      <section className="fz-lista" aria-label="Movimientos">
        <div className="lista-head">
          <h2>Movimientos</h2>
          <div className="export">
            <button onClick={exportarXlsx} disabled={!movs.length}>Descargar .xlsx</button>
            <button onClick={exportarPdf} disabled={!movs.length}>Descargar .pdf</button>
          </div>
        </div>
        {ordenados.length === 0 ? (
          <p className="vacio">Todavía no hay movimientos. Empezá cargando tu primer ingreso.</p>
        ) : (
          <div className="tabla-wrap">
            <table>
              <thead><tr><th>Fecha</th><th>Descripción</th><th>Categoría</th><th className="r">Monto</th><th></th></tr></thead>
              <tbody>
                {ordenados.map((m) => (
                  <tr key={m.id}>
                    <td>{m.fecha.split("-").reverse().join("/")}</td>
                    <td>{m.descripcion}</td>
                    <td>{m.categoria}</td>
                    <td className={"r " + (m.tipo === "ingreso" ? "vin" : "vout")}>{m.tipo === "egreso" ? "−" : "+"}{ars(m.monto)}</td>
                    <td><button className="del" onClick={() => borrar(m.id)} aria-label={`Borrar ${m.descripcion}`}>✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
 
const css = `
.fz {
  --papel:#f4f6f3; --tinta:#1f3a4b; --suave:#5d7280; --linea:#d5ddd8;
  --in:#2f7d5b; --out:#b4533a; --panel:#ffffff;
  min-height:100vh; margin:0; padding:40px 20px 80px; background:var(--papel); color:var(--tinta);
  font-family:"Segoe UI", system-ui, -apple-system, sans-serif;
  display:grid; gap:22px; grid-template-columns:minmax(0,1fr); max-width:980px; margin-inline:auto;
}
.fz * { box-sizing:border-box; }
.fz h1 { font-family:Georgia, "Times New Roman", serif; font-size:clamp(2.2rem,6vw,3.4rem); margin:0 0 6px; letter-spacing:-.02em; }
.fz h2 { font-size:1.1rem; margin:0 0 14px; }
.fz-head p { margin:0; color:var(--suave); font-size:1.05rem; }
.fz-totales { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
.t { background:var(--panel); border-left:5px solid var(--linea); padding:16px 18px; border-radius:4px; }
.t span { display:block; color:var(--suave); font-size:.9rem; margin-bottom:4px; }
.t strong { font-size:clamp(1.1rem,3vw,1.6rem); font-variant-numeric:tabular-nums; }
.t.in { border-color:var(--in); } .t.out { border-color:var(--out); }
.t.bal { background:var(--tinta); color:#fff; border-color:var(--tinta); }
.t.bal span { color:#c9d6de; } .t.bal.neg { background:var(--out); border-color:var(--out); }
.fz-form, .fz-grafico, .fz-lista { background:var(--panel); padding:20px; border-radius:6px; border:1px solid var(--linea); }
.fz-form { display:grid; grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); gap:12px; align-items:end; }
.fz label { display:grid; gap:5px; font-size:.85rem; color:var(--suave); }
.fz input { font:inherit; color:var(--tinta); padding:10px; border:1px solid var(--linea); border-radius:4px; background:#fbfcfb; width:100%; }
.fz button { font:inherit; cursor:pointer; border-radius:4px; }
.fz :focus-visible { outline:3px solid #7fb3d0; outline-offset:2px; }
.seg { display:flex; border:1px solid var(--linea); border-radius:4px; overflow:hidden; }
.seg button { flex:1; padding:10px; border:none; background:#fbfcfb; color:var(--suave); }
.seg button.on.in { background:var(--in); color:#fff; } .seg button.on.out { background:var(--out); color:#fff; }
.add { padding:11px; border:none; background:var(--tinta); color:#fff; font-weight:600; }
.add:hover { background:#2b5068; }
.aviso { grid-column:1/-1; margin:0; color:var(--out); }
.fila { display:grid; grid-template-columns:130px minmax(0,1fr); gap:12px; align-items:center; margin-bottom:10px; }
.cat { font-size:.9rem; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.barras { display:grid; gap:3px; }
.barra { height:22px; border-radius:2px; min-width:4px; position:relative; transition:width .3s ease; }
.barra.in { background:var(--in); } .barra.out { background:var(--out); }
.barra em { position:absolute; left:calc(100% + 6px); top:2px; font-style:normal; font-size:.8rem; color:var(--suave); white-space:nowrap; font-variant-numeric:tabular-nums; }
.vacio { color:var(--suave); margin:0; }
.lista-head { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:6px; }
.lista-head h2 { margin:0; }
.export { display:flex; gap:8px; }
.export button { padding:9px 14px; border:1px solid var(--tinta); background:#fff; color:var(--tinta); font-weight:600; }
.export button:hover:not(:disabled) { background:var(--tinta); color:#fff; }
.export button:disabled { opacity:.4; cursor:not-allowed; }
.tabla-wrap { overflow-x:auto; }
.fz table { width:100%; border-collapse:collapse; font-size:.95rem; }
.fz th { text-align:left; color:var(--suave); font-weight:500; font-size:.82rem; padding:8px 6px; border-bottom:2px solid var(--linea); }
.fz td { padding:9px 6px; border-bottom:1px solid var(--linea); }
.r { text-align:right; font-variant-numeric:tabular-nums; white-space:nowrap; }
.vin { color:var(--in); font-weight:600; } .vout { color:var(--out); font-weight:600; }
.del { border:none; background:none; color:var(--suave); padding:4px 8px; }
.del:hover { color:var(--out); }
@media (max-width:600px) {
  .fz-totales { grid-template-columns:1fr; }
  .fila { grid-template-columns:90px minmax(0,1fr); }
}
@media (prefers-reduced-motion:reduce) { .barra { transition:none; } }
`;
