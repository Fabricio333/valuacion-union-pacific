import React, { useEffect, useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowLeft, ArrowRight, BarChart3, Building2, Gauge, Landmark, ShieldAlert, TrainFront, TrendingUp } from 'lucide-react'
import './styles.css'

type Slide = {
  eyebrow: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  body: React.ReactNode
}

const money = ['US$ 24.1B', 'US$ 12.7B', '52.6%', 'US$ 6.3B']
const ratios = [
  ['EV / EBITDA', '12.4x', 'Peer avg. 11.8x'],
  ['P / E', '20.6x', 'Premium por moat'],
  ['Deuda neta / EBITDA', '2.6x', 'Apalancamiento manejable'],
  ['ROIC', '13.8%', 'Superior al WACC mock'],
]
const sensitivity = [
  ['g / WACC', '8.0%', '8.5%', '9.0%'],
  ['2.0%', '198', '177', '160'],
  ['2.5%', '218', '193', '172'],
  ['3.0%', '247', '214', '187'],
]

function TrainScene() {
  return (
    <div className="train-scene" aria-label="Tren de carga animado">
      <div className="sky-grid" />
      <div className="mountains" />
      <div className="track track-back" />
      <div className="track track-front" />
      <div className="train-wrap">
        {['Grain', 'Chemicals', 'Coal', 'Intermodal'].map((label, i) => (
          <div className={`train car car-${i}`} key={label}>
            <div className="coupler coupler-left" />
            <span>{label}</span>
            <div className="cargo-line" />
            <div className="wheel w1" /><div className="wheel w2" />
          </div>
        ))}
        <div className="train locomotive">
          <div className="coupler coupler-left" />
          <div className="engine-roof" />
          <div className="cab-window" />
          <div className="engine-door" />
          <div className="headlight" />
          <div className="nose" />
          <div className="stripe" />
          <div className="plow" />
          <div className="smoke"><i /><i /><i /></div>
          <div className="wheel w1" /><div className="wheel w2" /><div className="wheel w3" />
        </div>
      </div>
      <div className="speed-lines"><span /><span /><span /></div>
    </div>
  )
}

function BarChart() {
  const bars = [76, 82, 88, 93, 100]
  return (
    <div className="bar-chart">
      {bars.map((h, i) => <div key={i} style={{height: `${h}%`}}><span>{2021 + i}</span></div>)}
    </div>
  )
}

function DcfWaterfall() {
  const items = [
    ['FCF FY26e', '+6.7'], ['Crecimiento', '+1.1'], ['Terminal value', '+82.4'], ['Deuda neta', '-18.0'], ['Equity value', '64.8']
  ]
  return <div className="waterfall">{items.map(([a,b], i)=><div className="wf-card" key={a}><small>{a}</small><strong className={i===3?'negative':''}>{b}</strong></div>)}</div>
}

function App() {
  const [index, setIndex] = useState(0)
  const slides: Slide[] = useMemo(() => [
    {
      eyebrow: 'Trabajo Práctico de Valuación · mock-up académico',
      title: 'Valuación de Empresa: Union Pacific Corporation',
      subtitle: 'Análisis del negocio ferroviario, ratios, DCF y sensibilidad. Datos ilustrativos para armar la narrativa del TP.',
      icon: <TrainFront />,
      body: <><TrainScene /><div className="hero-metrics">{['Ticker UNP', 'Railroad freight', 'Moat operacional', 'DCF mock'].map(x=><span key={x}>{x}</span>)}</div></>
    },
    {
      eyebrow: '01 · Negocio', title: 'Red ferroviaria crítica para la economía real', icon: <Building2 />,
      body: <div className="two-col"><div><p>Union Pacific opera una red ferroviaria de carga con exposición a intermodal, agricultura, energía, químicos e industriales. La tesis base: activos difíciles de replicar, escala, pricing power moderado y eficiencia operativa.</p><ul><li>Ingresos diversificados por carga y geografía.</li><li>Costos intensivos en capital: vías, locomotoras, mantenimiento.</li><li>Ventaja competitiva por red y permisos/regulación.</li></ul></div><div className="segment-card"><h3>Mix de ingresos mock</h3>{['Intermodal 29%','Industrial 22%','Agriculture 18%','Energy 16%','Premium/Auto 15%'].map((x,i)=><div className="segment" key={x}><span>{x}</span><b style={{width:`${70-i*8}%`}} /></div>)}</div></div>
    },
    {
      eyebrow: '02 · Drivers', title: 'La valuación depende de volumen, pricing y eficiencia', icon: <TrendingUp />,
      body: <div className="cards"><div><h3>Pricing</h3><p>Capacidad de trasladar inflación/costos vía contratos y tarifas.</p></div><div><h3>Volumen</h3><p>Intermodal y commodities condicionados por ciclo económico.</p></div><div><h3>Operating ratio</h3><p>Productividad, combustible y utilización de red como palancas.</p></div><div><h3>Capex</h3><p>El FCF mejora si capex se mantiene disciplinado sin romper servicio.</p></div></div>
    },
    {
      eyebrow: '03 · Finanzas mock', title: 'Crecimiento estable, márgenes altos, FCF robusto', icon: <BarChart3 />,
      body: <div className="dashboard"><BarChart /><div className="metric-grid">{['Ingresos','EBITDA','Margen EBITDA','FCF'].map((m,i)=><div className="metric" key={m}><small>{m}</small><strong>{money[i]}</strong><span>FY25e mock</span></div>)}</div></div>
    },
    {
      eyebrow: '04 · Ratios', title: 'Múltiplos con prima razonable por calidad del activo', icon: <Gauge />,
      body: <div className="ratio-grid">{ratios.map(([a,b,c])=><div className="ratio" key={a}><small>{a}</small><strong>{b}</strong><span>{c}</span></div>)}</div>
    },
    {
      eyebrow: '05 · DCF', title: 'DCF mock: rango de valor, no número mágico', icon: <Landmark />,
      body: <div className="two-col"><div><p>Supuestos ilustrativos: WACC 8.5%, crecimiento perpetuo 2.5%, FCF creciendo 3–5% anual, capex estable y recompras moderadas.</p><div className="assumption-list"><span>EV mock: US$ 118B</span><span>Deuda neta: US$ 18B</span><span>Equity value: US$ 100B</span><span>Precio implícito: US$ 193</span></div></div><DcfWaterfall /></div>
    },
    {
      eyebrow: '06 · Sensibilidad', title: 'WACC y crecimiento cambian fuerte el precio implícito', icon: <BarChart3 />,
      body: <table className="sens"><tbody>{sensitivity.map((row,i)=><tr key={i}>{row.map((c,j)=><td key={j} className={i===0||j===0?'head':''}>{c}</td>)}</tr>)}</tbody></table>
    },
    {
      eyebrow: '07 · Riesgos', title: 'Un moat real no elimina riesgo operativo', icon: <ShieldAlert />,
      body: <div className="cards risk"><div><h3>Ciclo</h3><p>Menor actividad reduce volumen transportado.</p></div><div><h3>Combustible</h3><p>Volatilidad puede presionar margen si no se traslada.</p></div><div><h3>Regulación</h3><p>Tarifas, seguridad y condiciones laborales.</p></div><div><h3>Capex</h3><p>Subinversión mejora FCF hoy y destruye servicio mañana.</p></div></div>
    },
    {
      eyebrow: '08 · Conclusión', title: 'Rango mock: calidad alta, upside acotado si el mercado ya paga el moat', icon: <TrendingUp />,
      body: <div className="conclusion"><p>Conclusión preliminar: Union Pacific sería una empresa de calidad, con activos estratégicos y generación consistente de caja. En el escenario mock, el valor razonable queda cerca de <strong>US$ 185–215 por acción</strong>. La recomendación académica sería <strong>mantener / compra selectiva</strong> según margen de seguridad.</p><span>Próximo paso: reemplazar todos los mocks por 10-K, investor presentation y comparables reales.</span></div>
    },
  ], [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex(i => Math.min(slides.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIndex(i => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [slides.length])

  const slide = slides[index]
  return (
    <main>
      <nav className="topbar"><div className="brand"><span>UNP</span> Valuación</div><div className="mock">Datos mock-up · no inversión</div></nav>
      <div className="progress"><i style={{width:`${((index+1)/slides.length)*100}%`}} /></div>
      <section className="slide" key={index}>
        <div className="slide-copy"><div className="eyebrow">{slide.icon}{slide.eyebrow}</div><h1>{slide.title}</h1>{slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}</div>
        <div className="slide-body">{slide.body}</div>
      </section>
      <aside className="dots">{slides.map((s,i)=><button key={s.title} className={i===index?'active':''} onClick={()=>setIndex(i)} aria-label={`Ir a slide ${i+1}`} />)}</aside>
      <footer className="controls"><button onClick={()=>setIndex(i=>Math.max(0,i-1))} disabled={index===0}><ArrowLeft />Anterior</button><span>{String(index+1).padStart(2,'0')} / {slides.length}</span><button onClick={()=>setIndex(i=>Math.min(slides.length-1,i+1))} disabled={index===slides.length-1}>Siguiente<ArrowRight /></button></footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
