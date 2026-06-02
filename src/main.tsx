import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  Gauge,
  Landmark,
  ShieldAlert,
  TrainFront,
  TrendingUp,
} from 'lucide-react'
import './styles.css'

type Slide = {
  eyebrow: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  body: React.ReactNode
  cargo: string
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

const TRAIN = {
  startX: 220,
  top: 250,
  engineWidth: 430,
  wagonWidth: 470,
  wagonHeight: 320,
  gap: 42,
}

function BarChart() {
  const bars = [76, 82, 88, 93, 100]
  return (
    <div className="bar-chart">
      {bars.map((height, i) => (
        <div key={i} style={{ height: `${height}%` }}>
          <span>{2021 + i}</span>
        </div>
      ))}
    </div>
  )
}

function DcfWaterfall() {
  const items = [
    ['FCF FY26e', '+6.7'],
    ['Crecimiento', '+1.1'],
    ['Terminal value', '+82.4'],
    ['Deuda neta', '-18.0'],
    ['Equity value', '64.8'],
  ]

  return (
    <div className="waterfall">
      {items.map(([label, value], i) => (
        <div className="wf-card" key={label}>
          <small>{label}</small>
          <strong className={i === 3 ? 'negative' : ''}>{value}</strong>
        </div>
      ))}
    </div>
  )
}

function RailBackdrop() {
  return (
    <>
      <div className="world-sky" />
      <div className="sunset-band" />
      <div className="range range-back" />
      <div className="range range-front" />
      <div className="rail-bed" />
      <div className="rail rail-top" />
      <div className="rail rail-bottom" />
      <div className="ties" />
      <div className="speed-lines" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </>
  )
}

function Locomotive() {
  return (
    <div className="locomotive" aria-hidden="true">
      <div className="engine-roof" />
      <div className="cab-window" />
      <div className="engine-door" />
      <div className="headlight" />
      <div className="nose" />
      <div className="stripe" />
      <div className="plow" />
      <div className="engine-mark">UNION PACIFIC</div>
      <div className="smoke">
        <i />
        <i />
        <i />
      </div>
      <div className="wheel w1" />
      <div className="wheel w2" />
      <div className="wheel w3" />
    </div>
  )
}

type TrainWorldProps = {
  selectedIndex: number
  viewIndex: number
  slides: Slide[]
  onSelect: (index: number) => void
}

function TrainWorld({ selectedIndex, viewIndex, slides, onSelect }: TrainWorldProps) {
  const wagonStart = TRAIN.startX + TRAIN.engineWidth + TRAIN.gap
  const activeX =
    viewIndex === -1
      ? wagonStart + (slides.length * (TRAIN.wagonWidth + TRAIN.gap)) / 2
      : wagonStart + viewIndex * (TRAIN.wagonWidth + TRAIN.gap) + TRAIN.wagonWidth / 2
  const activeY = viewIndex === -1 ? 385 : TRAIN.top + TRAIN.wagonHeight / 2

  return (
    <div className={`rail-camera ${viewIndex === -1 ? 'landing-mode' : 'slide-mode'}`}>
      <div
        className="rail-world"
        style={
          {
            '--focus-x': `${activeX}px`,
            '--focus-y': `${activeY}px`,
            '--offset-x': `${-activeX}px`,
            '--offset-y': `${-activeY}px`,
            '--target-zoom': viewIndex === -1 ? '.38' : '1.34',
          } as React.CSSProperties
        }
      >
        <RailBackdrop />
        <div className="train-consist" style={{ left: TRAIN.startX, top: TRAIN.top }}>
          <Locomotive />
          {slides.map((slide, i) => (
            <button
              className={`wagon wagon-${i % 5} ${i === selectedIndex ? 'active' : ''}`}
              key={slide.title}
              onClick={() => onSelect(i)}
              type="button"
              aria-label={`Abrir vagón ${i + 1}: ${slide.title}`}
            >
              <div className="coupler coupler-left" />
              <div className="wagon-ribs" />
              <div className="wagon-label">
                <span>{String(i + 1).padStart(2, '0')}</span>
                {slide.cargo}
              </div>
              <div className="wagon-content">
                <div className="wagon-eyebrow">
                  {slide.icon}
                  {slide.eyebrow}
                </div>
                <h2>{slide.title}</h2>
                {slide.subtitle && <p className="wagon-subtitle">{slide.subtitle}</p>}
                <div className="wagon-body">{slide.body}</div>
              </div>
              <div className="cargo-line" />
              <div className="wheel w1" />
              <div className="wheel w2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  const [index, setIndex] = useState(-1)
  const [isTraveling, setIsTraveling] = useState(false)
  const travelTimer = useRef<number | undefined>(undefined)
  const slides: Slide[] = useMemo(
    () => [
      {
        eyebrow: '01 · Negocio',
        title: 'Red ferroviaria crítica para la economía real',
        icon: <Building2 />,
        cargo: 'Negocio',
        body: (
          <div className="two-col">
            <div>
              <p>
                Union Pacific opera una red ferroviaria de carga con exposición a intermodal, agricultura, energía,
                químicos e industriales. La tesis base: activos difíciles de replicar, escala, pricing power moderado
                y eficiencia operativa.
              </p>
              <ul>
                <li>Ingresos diversificados por carga y geografía.</li>
                <li>Costos intensivos en capital: vías, locomotoras, mantenimiento.</li>
                <li>Ventaja competitiva por red y permisos/regulación.</li>
              </ul>
            </div>
            <div className="segment-card">
              <h3>Mix de ingresos mock</h3>
              {['Intermodal 29%', 'Industrial 22%', 'Agriculture 18%', 'Energy 16%', 'Premium/Auto 15%'].map((x, i) => (
                <div className="segment" key={x}>
                  <span>{x}</span>
                  <b style={{ width: `${70 - i * 8}%` }} />
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        eyebrow: '02 · Drivers',
        title: 'La valuación depende de volumen, pricing y eficiencia',
        icon: <TrendingUp />,
        cargo: 'Drivers',
        body: (
          <div className="cards">
            <div>
              <h3>Pricing</h3>
              <p>Capacidad de trasladar inflación/costos vía contratos y tarifas.</p>
            </div>
            <div>
              <h3>Volumen</h3>
              <p>Intermodal y commodities condicionados por ciclo económico.</p>
            </div>
            <div>
              <h3>Operating ratio</h3>
              <p>Productividad, combustible y utilización de red como palancas.</p>
            </div>
            <div>
              <h3>Capex</h3>
              <p>El FCF mejora si capex se mantiene disciplinado sin romper servicio.</p>
            </div>
          </div>
        ),
      },
      {
        eyebrow: '03 · Finanzas mock',
        title: 'Crecimiento estable, márgenes altos, FCF robusto',
        icon: <BarChart3 />,
        cargo: 'Finanzas',
        body: (
          <div className="dashboard">
            <BarChart />
            <div className="metric-grid">
              {['Ingresos', 'EBITDA', 'Margen EBITDA', 'FCF'].map((metric, i) => (
                <div className="metric" key={metric}>
                  <small>{metric}</small>
                  <strong>{money[i]}</strong>
                  <span>FY25e mock</span>
                </div>
              ))}
            </div>
          </div>
        ),
      },
      {
        eyebrow: '04 · Ratios',
        title: 'Múltiplos con prima razonable por calidad del activo',
        icon: <Gauge />,
        cargo: 'Ratios',
        body: (
          <div className="ratio-grid">
            {ratios.map(([label, value, note]) => (
              <div className="ratio" key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
                <span>{note}</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        eyebrow: '05 · DCF',
        title: 'DCF mock: rango de valor, no número mágico',
        icon: <Landmark />,
        cargo: 'DCF',
        body: (
          <div className="two-col">
            <div>
              <p>
                Supuestos ilustrativos: WACC 8.5%, crecimiento perpetuo 2.5%, FCF creciendo 3-5% anual, capex estable
                y recompras moderadas.
              </p>
              <div className="assumption-list">
                <span>EV mock: US$ 118B</span>
                <span>Deuda neta: US$ 18B</span>
                <span>Equity value: US$ 100B</span>
                <span>Precio implícito: US$ 193</span>
              </div>
            </div>
            <DcfWaterfall />
          </div>
        ),
      },
      {
        eyebrow: '06 · Sensibilidad',
        title: 'WACC y crecimiento cambian fuerte el precio implícito',
        icon: <BarChart3 />,
        cargo: 'Sensibilidad',
        body: (
          <table className="sens">
            <tbody>
              {sensitivity.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={cell} className={i === 0 || j === 0 ? 'head' : ''}>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ),
      },
      {
        eyebrow: '07 · Riesgos',
        title: 'Un moat real no elimina riesgo operativo',
        icon: <ShieldAlert />,
        cargo: 'Riesgos',
        body: (
          <div className="cards risk">
            <div>
              <h3>Ciclo</h3>
              <p>Menor actividad reduce volumen transportado.</p>
            </div>
            <div>
              <h3>Combustible</h3>
              <p>Volatilidad puede presionar margen si no se traslada.</p>
            </div>
            <div>
              <h3>Regulación</h3>
              <p>Tarifas, seguridad y condiciones laborales.</p>
            </div>
            <div>
              <h3>Capex</h3>
              <p>Subinversión mejora FCF hoy y destruye servicio mañana.</p>
            </div>
          </div>
        ),
      },
      {
        eyebrow: '08 · Conclusión',
        title: 'Rango mock: calidad alta, upside acotado si el mercado ya paga el moat',
        icon: <TrendingUp />,
        cargo: 'Conclusión',
        body: (
          <div className="conclusion">
            <p>
              Conclusión preliminar: Union Pacific sería una empresa de calidad, con activos estratégicos y generación
              consistente de caja. En el escenario mock, el valor razonable queda cerca de{' '}
              <strong>US$ 185-215 por acción</strong>. La recomendación académica sería{' '}
              <strong>mantener / compra selectiva</strong> según margen de seguridad.
            </p>
            <span>Próximo paso: reemplazar todos los mocks por 10-K, investor presentation y comparables reales.</span>
          </div>
        ),
      },
    ],
    [],
  )

  const navigateTo = useCallback(
    (target: number) => {
      const next = Math.max(-1, Math.min(slides.length - 1, target))
      if (next === index) return

      if (travelTimer.current) window.clearTimeout(travelTimer.current)

      if (index >= 0 && next >= 0) {
        setIsTraveling(true)
        travelTimer.current = window.setTimeout(() => {
          setIndex(next)
          setIsTraveling(false)
        }, 420)
        return
      }

      setIsTraveling(false)
      setIndex(next)
    },
    [index, slides.length],
  )

  useEffect(() => {
    return () => {
      if (travelTimer.current) window.clearTimeout(travelTimer.current)
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') navigateTo(index + 1)
      if (event.key === 'ArrowLeft') navigateTo(index - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, navigateTo])

  const goNext = () => navigateTo(index + 1)
  const goPrev = () => navigateTo(index - 1)
  const progress = index === -1 ? 0 : ((index + 1) / slides.length) * 100
  const viewIndex = isTraveling ? -1 : index

  return (
    <main className={index === -1 ? 'is-landing' : 'is-slide'}>
      <nav className="topbar">
        <div className="brand">
          <img src="/union-pacific-logo.svg" alt="Union Pacific logo" />
          <span>UNP</span>
          Valuación
        </div>
        <div className="mock">Datos mock-up · no inversión</div>
      </nav>

      <div className="progress" aria-hidden="true">
        <i style={{ width: `${progress}%` }} />
      </div>

      <section className="deck-shell" aria-label="Presentación de valuación Union Pacific">
        <div className={`landing-panel ${index === -1 ? 'visible' : ''}`}>
          <div className="landing-title-row">
            <img className="landing-company-logo" src="/union-pacific-logo.svg" alt="Union Pacific logo" />
            <div>
              <p>Trabajo Práctico de Valuación · mock-up académico</p>
              <h1>Valuación de Empresa: Union Pacific Corporation</h1>
            </div>
          </div>
          <div className="hero-metrics">
            {['Ticker UNP', 'Railroad freight', 'Moat operacional', 'DCF mock'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>

        <TrainWorld selectedIndex={index} viewIndex={viewIndex} slides={slides} onSelect={navigateTo} />
      </section>

      <aside className="dots" aria-label="Navegación por vagones">
        <button className={index === -1 ? 'active' : ''} onClick={() => navigateTo(-1)} aria-label="Ir al inicio" />
        {slides.map((slide, i) => (
          <button
            key={slide.title}
            className={i === index ? 'active' : ''}
            onClick={() => navigateTo(i)}
            aria-label={`Ir al vagón ${i + 1}`}
          />
        ))}
      </aside>

      <footer className="controls">
        <button onClick={goPrev} disabled={index === -1}>
          <ArrowLeft />
          Anterior
        </button>
        <span>{index === -1 ? 'Inicio' : `${String(index + 1).padStart(2, '0')} / ${slides.length}`}</span>
        <button onClick={goNext} disabled={index === slides.length - 1}>
          Siguiente
          <ArrowRight />
        </button>
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
