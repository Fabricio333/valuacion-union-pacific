import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Building2,
  Gauge,
  Landmark,
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

type Phase = 'overview' | 'starting' | 'zooming-out' | 'moving' | 'zooming-in' | 'fullscreen'

const landingBackgrounds = [
  '/backgrounds/landing-rail.webp',
  '/backgrounds/freight-yard.webp',
  '/backgrounds/mountain-rail.webp',
  '/backgrounds/desert-rail.webp',
  '/backgrounds/horizon-rail.webp',
  '/backgrounds/network-rail.webp',
]

// Slide color contract:
// Each fullscreen slide must inherit the color family of its matching train wagon.
// If slides are added/reordered, update this array and the .wagon-N CSS palette together.
// Do not use random slide background colors: the wagon is the navigation object, the slide is its fullscreen state.
const wagonPalettes = [
  { base: '#283850', deep: '#121d2d', glow: '#6f8fb8' },
  { base: '#1f4f45', deep: '#0f221f', glow: '#5eb19e' },
  { base: '#5b412a', deep: '#21140d', glow: '#d39a57' },
  { base: '#4f38a7', deep: '#17122f', glow: '#9675ff' },
  { base: '#65303a', deep: '#241016', glow: '#d46a79' },
  { base: '#39445c', deep: '#111722', glow: '#8ca0c6' },
]

const TRAIN = {
  startX: 220,
  top: 300,
  engineWidth: 700,
  wagonWidth: 470,
  wagonHeight: 260,
  gap: 42,
}

const TRAIN_ZOOM = {
  overview: 0.56,
  focused: 1.82,
}

const TRANSITION_MS = {
  zoomOut: 1150,
  move: 1550,
  zoomIn: 1650,
}

const INTERRUPT_TRANSITION_MS = {
  zoomOut: 240,
  move: 520,
  zoomIn: 620,
}

const companyFacts = [
  { value: '32.889', label: 'Route miles de red', tone: 'blue' },
  { value: '23', label: 'Estados cubiertos', tone: 'teal' },
  { value: '7.300', label: 'Comunidades', tone: 'amber' },
  { value: '26%', label: 'Stake en Ferromex', tone: 'purple' },
]

const businessSegments = [
  { pct: '33%', name: 'Bulk', detail: 'Agro · Carbón · Fertilizantes', revenue: 'USD 7.586M', tone: 'blue' },
  { pct: '37%', name: 'Industrial', detail: 'Químicos · Metales · Madera', revenue: 'USD 8.604M', tone: 'teal' },
  { pct: '30%', name: 'Premium', detail: 'Intermodal · Automotive', revenue: 'USD 7.030M', tone: 'amber' },
]

const industryFacts = [
  { value: '28%', label: 'de la carga total de EE.UU. va por tren' },
  { value: '7', label: 'empresas Class I controlan todo el mercado' },
  { value: 'Duopolio', label: 'UNP + BNSF dominan el Oeste (100%)' },
  { value: '3-4x', label: 'más eficiente en combustible que el camión' },
]

const fodaCards = [
  {
    title: 'Fortalezas',
    tone: 'blue',
    points: ['Moat: red irreplicable', 'FCF USD 5.499M', 'Dividend Aristocrat +20 años'],
  },
  {
    title: 'Oportunidades',
    tone: 'teal',
    points: ['Reshoring industrial', 'Intermodal e-commerce', 'Fusión NSC (+USD 3.000M sinergias)'],
  },
  {
    title: 'Debilidades',
    tone: 'amber',
    points: ['CAPEX 14,5% ingresos', 'D/E 1,72x (alto vs pares)', 'Dependencia carbón en caída'],
  },
  {
    title: 'Amenazas',
    tone: 'red',
    points: ['Riesgo arancelario México 11%', 'Ciclo económico', 'STB regulatorio'],
  },
]

const operatingRatio = [
  { year: 'FY2021', value: '57,1%', height: 82, tone: 'blue' },
  { year: 'FY2023', value: '60,9%', height: 95, tone: 'blue' },
  { year: 'FY2025', value: '59,8%', height: 90, tone: 'amber' },
]

const ratiosData = [
  { value: '40,2%', label: 'Margen Operativo (CSX: 32,1%)', tone: 'blue' },
  { value: '29,1%', label: 'Margen Neto', tone: 'teal' },
  { value: '40,4%', label: 'ROE', tone: 'amber' },
  { value: '20,0%', label: 'Retorno sobre Capital Total', tone: 'purple' },
  { value: '7,52x', label: 'Interest Coverage (CSX: 5,36x)', tone: 'teal' },
  { value: '1,72x', label: 'Deuda / Equity (D/E)', tone: 'red' },
  { value: '0,91x', label: 'Current Ratio (Normal sector)', tone: 'slate' },
  { value: '4,1%', label: 'FCF Yield', tone: 'blue' },
]

const financialYears = [
  { year: '2021', revenue: 21804, income: 6523 },
  { year: '2022', revenue: 24875, income: 6998 },
  { year: '2023', revenue: 24119, income: 6379 },
  { year: '2024', revenue: 24250, income: 6747 },
  { year: '2025', revenue: 24510, income: 7138 },
]

const dividends = [
  { year: '2021', dpa: '4,29', payout: '43,1%' },
  { year: '2022', dpa: '5,08', payout: '45,3%' },
  { year: '2023', dpa: '5,20', payout: '49,8%' },
  { year: '2024', dpa: '5,28', payout: '47,6%' },
  { year: '2025', dpa: '5,44', payout: '45,4%', highlight: true },
]

const shareholders = [
  { name: 'Vanguard', value: '9,89%', tone: 'blue' },
  { name: 'BlackRock', value: '8,19%', tone: 'royal' },
  { name: 'State Street', value: '4,26%', tone: 'sky' },
  { name: 'Capital World', value: '3,39%', tone: 'amber' },
  { name: 'Otros inst.', value: '57,8%', tone: 'slate' },
  { name: 'Retail', value: '15,2%', tone: 'light' },
  { name: 'Insiders', value: '1,35%', tone: 'teal' },
]

const porterForces = [
  { force: 'Rivalidad entre pares', level: 'Moderada', tone: 'amber' },
  { force: 'Amenaza nuevos entrantes', level: 'Muy baja', tone: 'teal' },
  { force: 'Poder proveedores', level: 'Moderado', tone: 'amber' },
  { force: 'Poder clientes (Bulk/Ind.)', level: 'Moderado', tone: 'amber' },
  { force: 'Amenaza sustitutos (Premium)', level: 'Alta', tone: 'red' },
]

const waccItems = [
  ['rf', '4,46%'],
  ['β', '0,986'],
  ['ERP', '2,82%'],
  ['Ke', '7,24%'],
  ['Kd', '5,85%'],
  ['We', '83,1%'],
  ['t', '22,1%'],
]

const scenarios = [
  { name: 'Base', prob: '50%', growth: '3,5% - 4,5%', value: 'USD 229,52', tone: 'blue' },
  { name: 'Positivo', prob: '30%', growth: '5% - 6,5%', value: 'USD 261,47', tone: 'teal' },
  { name: 'Negativo', prob: '20%', growth: '1% - 2%', value: 'USD 196,01', tone: 'red' },
  { name: 'Pond.', prob: '', growth: '', value: 'USD 232,41', tone: 'dark' },
]

const multiples = [
  ['PER', 'USD 260,02'],
  ['P/BV', 'USD 172,73'],
  ['P/Sales', 'USD 215,29'],
  ['EV/Sales', 'USD 217,29'],
  ['PROM.', 'USD 216,33'],
]

const conclusionSummary = [
  { value: '6,78%', label: 'WACC' },
  { value: 'USD 232', label: 'Precio DCF' },
  { value: 'USD 216', label: 'Precio Mult.' },
  { value: 'USD 210', label: 'Precio Final' },
  { value: '~USD 264', label: 'Mercado' },
  { value: 'MANTENER', label: 'Recom.' },
]

const projectionSeries = [
  { year: '2021', revenue: 21804, ebit: 9300 },
  { year: '2022', revenue: 24875, ebit: 9900 },
  { year: '2023', revenue: 24119, ebit: 9200 },
  { year: '2024', revenue: 24250, ebit: 9800 },
  { year: '2025', revenue: 24510, ebit: 9900 },
  { year: '2026E', revenue: 25350, ebit: 10220 },
  { year: '2027E', revenue: 26360, ebit: 10660 },
  { year: '2028E', revenue: 27530, ebit: 11205 },
  { year: '2029E', revenue: 28560, ebit: 11620 },
  { year: '2030E', revenue: 29480, ebit: 12000 },
]

const fcffBase = [
  ['2026E', '6.538'],
  ['2027E', '6.899'],
  ['2028E', '7.314'],
  ['2029E', '7.677'],
  ['2030E', '8.019'],
]

const valuationBars = [
  { name: 'DDM', weight: 'Pond. 10%', value: 'USD 75,98', width: 12, tone: 'slate' },
  { name: 'DCF pond.', weight: 'Pond. 50%', value: 'USD 232,41', width: 100, tone: 'blue' },
  { name: 'Múltiplos', weight: 'Pond. 40%', value: 'USD 216,33', width: 93, tone: 'purple' },
]

const stagger = (index: number): React.CSSProperties => ({ '--i': index } as React.CSSProperties)

const formatNumber = (value: number) => value.toLocaleString('en-US')

function CompanyOverview() {
  return (
    <div className="company-layout">
      <div className="fact-grid">
        {companyFacts.map((fact, i) => (
          <div className={`fact-card tone-${fact.tone}`} style={stagger(i)} key={fact.label}>
            <strong>{fact.value}</strong>
            <span>{fact.label}</span>
          </div>
        ))}
      </div>

      <section className="panel-card segments-panel" style={stagger(4)}>
        <h3>3 segmentos de negocio</h3>
        <div className="segment-stack">
          {businessSegments.map((segment, i) => (
            <div className="business-segment" style={stagger(i)} key={segment.name}>
              <div className={`segment-percent tone-${segment.tone}`}>{segment.pct}</div>
              <div>
                <strong>{segment.name}</strong>
                <span>{segment.detail}</span>
              </div>
              <b className={`tone-text-${segment.tone}`}>{segment.revenue}</b>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function IndustryStrategy() {
  return (
    <div className="strategy-layout">
      <div className="strategy-left">
        <section className="panel-card industry-panel" style={stagger(0)}>
          <h3>Industria Class I</h3>
          <div className="industry-facts">
            {industryFacts.map((fact, i) => (
              <div className="industry-fact" style={stagger(i)} key={fact.value}>
                <strong>{fact.value}</strong>
                <span>{fact.label}</span>
              </div>
            ))}
          </div>
        </section>

        <div className="foda-grid">
          {fodaCards.map((card, i) => (
            <section className={`foda-card tone-${card.tone}`} style={stagger(i + 2)} key={card.title}>
              <h4>{card.title}</h4>
              <ul>
                {card.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>

      <section className="panel-card psr-panel" style={stagger(1)}>
        <h3>Estrategia: PSR</h3>
        <p>Operating Ratio (menor = mejor)</p>
        <div className="or-chart">
          {operatingRatio.map((bar, i) => (
            <div className="or-column" style={stagger(i)} key={bar.year}>
              <strong>{bar.value}</strong>
              <div className={`or-bar tone-${bar.tone}`} style={{ height: `${bar.height}%` }} />
              <span>{bar.year}</span>
            </div>
          ))}
        </div>
        <div className="strategy-notes">
          <p>
            <strong>USD 245M:</strong>
            <span>ahorro por cada -1pp de OR</span>
          </p>
          <p>
            <strong>Fusión NSC:</strong>
            <span>50K miles · 43 estados</span>
          </p>
          <p>
            <strong>26% Ferromex:</strong>
            <span>puente USMCA México-EE.UU.</span>
          </p>
        </div>
      </section>
    </div>
  )
}

function RatioDashboard() {
  return (
    <div className="ratios-layout">
      <div className="ratios-grid">
        {ratiosData.map((ratio, i) => (
          <div className={`ratio-tile tone-${ratio.tone}`} style={stagger(i)} key={ratio.label}>
            <strong>{ratio.value}</strong>
            <span>{ratio.label}</span>
          </div>
        ))}
      </div>
      <div className="dupont-strip" style={stagger(8)}>
        <strong>DUPONT:</strong> ROE 40,4% = Margen Neto 29,1% × Rotación Activos 0,36x × Leverage 3,89x
      </div>
    </div>
  )
}

function MarketPriceDashboard() {
  return (
    <div className="market-price-layout">
      <figure className="market-chart-panel" style={stagger(0)}>
        <img src="/unp-price-chart.png" alt="Evolución histórica de precio de Union Pacific Corporation" />
      </figure>
    </div>
  )
}

function FinancialEvolution() {
  const maxValue = 30000

  return (
    <div className="financial-layout">
      <section className="panel-card finance-chart-panel" style={stagger(0)}>
        <div className="finance-chart">
          {financialYears.map((item, i) => (
            <div className="finance-year" style={stagger(i)} key={item.year}>
              <div className="finance-pair">
                <div className="finance-bar revenue" style={{ height: `${(item.revenue / maxValue) * 100}%` }}>
                  <span>{formatNumber(item.revenue)}</span>
                </div>
                <div className="finance-bar income" style={{ height: `${(item.income / maxValue) * 100}%` }}>
                  <span>{formatNumber(item.income)}</span>
                </div>
              </div>
              <strong>{item.year}</strong>
            </div>
          ))}
        </div>
        <div className="chart-legend">
          <span>
            <i className="revenue" /> Ingresos (USD M)
          </span>
          <span>
            <i className="income" /> Net Income (USD M)
          </span>
        </div>
        <div className="classification-strip">
          CLASIFICACION: VALUE con componentes de crecimiento moderado · P/E ~19x · Beta 0,99 · FCF Yield 4,1%
        </div>
      </section>

      <section className="panel-card dividend-panel" style={stagger(1)}>
        <h3>Dividendos (DPA USD)</h3>
        <div className="dividend-table">
          <div className="dividend-row head">
            <span>Año</span>
            <span>DPA</span>
            <span>Payout</span>
          </div>
          {dividends.map((item, i) => (
            <div className={`dividend-row ${item.highlight ? 'highlight' : ''}`} style={stagger(i)} key={item.year}>
              <span>{item.year}</span>
              <strong>{item.dpa}</strong>
              <span>{item.payout}</span>
            </div>
          ))}
        </div>
        <div className="dividend-footer">+20 años consecutivos de aumentos · Dividend Aristocrat</div>
      </section>
    </div>
  )
}

function ManagementStrategy() {
  return (
    <div className="management-layout">
      <div className="management-left">
        <section className="panel-card ceo-panel" style={stagger(0)}>
          <h3>Jim Vena — CEO</h3>
          <p>40+ años en ferrocarriles · Ex COO Canadian National</p>
          <p>PSR como eje central de gestión</p>
          <p>Comprometido 5+ años adicionales (fusión NSC)</p>
        </section>

        <section className="panel-card holders-panel" style={stagger(1)}>
          <h3>Estructura accionaria</h3>
          <div className="holder-list">
            {shareholders.map((holder, i) => (
              <div className="holder-row" style={stagger(i)} key={holder.name}>
                <i className={`tone-${holder.tone}`} />
                <span>{holder.name}</span>
                <strong>{holder.value}</strong>
              </div>
            ))}
          </div>
          <p>83,5% institucional · Sin accionista de control</p>
        </section>
      </div>

      <section className="panel-card porter-panel" style={stagger(2)}>
        <h3>Las 5 fuerzas de Porter</h3>
        <div className="porter-stack">
          {porterForces.map((item, i) => (
            <div className="porter-row" style={stagger(i)} key={item.force}>
              <span>{item.force}</span>
              <strong className={`tone-${item.tone}`}>{item.level}</strong>
            </div>
          ))}
        </div>
        <div className="pestel-strip">
          <b>PESTEL highlights</b>
          <span>STB regulatorio</span>
          <span>USMCA / México</span>
          <span>Combustible</span>
          <span>Laboral</span>
        </div>
      </section>
    </div>
  )
}

function ValuationDashboard() {
  return (
    <div className="valuation-layout">
      <section className="wacc-panel" style={stagger(0)}>
        <div>
          <strong>WACC = 6,78%</strong>
          <p>rm = 7,28% (SPY 25 años) · Kd = YTM ponderado bonos UNP en circulación</p>
        </div>
        <div className="wacc-items">
          {waccItems.map(([label, value], i) => (
            <span style={stagger(i)} key={label}>
              {label}: <b>{value}</b>
            </span>
          ))}
        </div>
      </section>

      <div className="valuation-main">
        <section className="dcf-panel" style={stagger(1)}>
          <h3>DCF — FCFF (WACC 6,78% · g 2,5%)</h3>
          <div className="scenario-grid">
            {scenarios.map((scenario, i) => (
              <div className={`scenario-card tone-${scenario.tone}`} style={stagger(i)} key={scenario.name}>
                <h4>{scenario.name}</h4>
                {scenario.prob && <p>Prob: {scenario.prob}</p>}
                {scenario.growth && <p>Crec.: {scenario.growth}</p>}
                <strong>{scenario.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="multiples-panel" style={stagger(2)}>
          <h3>Múltiples</h3>
          {multiples.map(([label, value], i) => (
            <p className={label === 'PROM.' ? 'prom' : ''} style={stagger(i)} key={label}>
              <span>{label}:</span>
              <strong>{value}</strong>
            </p>
          ))}
        </section>
      </div>

      <div className="final-price-strip" style={stagger(3)}>
        <span>DDM: USD 7,60</span>
        <span>DCF pond.: USD 116,21</span>
        <span>Múltiplos: USD 86,53</span>
        <strong>PRECIO FINAL: USD 210,34</strong>
      </div>
    </div>
  )
}

function ProjectionDashboard() {
  const width = 900
  const height = 360
  const padding = { top: 24, right: 24, bottom: 56, left: 70 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom
  const maxValue = 35000
  const yTicks = [35000, 30000, 25000, 20000, 15000, 10000, 5000, 0]

  const pointFor = (item: (typeof projectionSeries)[number], key: 'revenue' | 'ebit', index: number) => {
    const x = padding.left + (chartWidth / (projectionSeries.length - 1)) * index
    const y = padding.top + (1 - item[key] / maxValue) * chartHeight

    return { x, y }
  }
  const pointsFor = (key: 'revenue' | 'ebit') =>
    projectionSeries.map((item, i) => {
      const point = pointFor(item, key, i)
      return `${point.x},${point.y}`
    }).join(' ')

  return (
    <div className="projection-layout">
      <section className="panel-card projection-chart-panel" style={stagger(0)}>
        <svg className="projection-chart" viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Revenue y EBIT 2021 a 2030E">
          {yTicks.map((tick) => {
            const y = padding.top + (1 - tick / maxValue) * chartHeight
            return (
              <g className="projection-grid-line" key={tick}>
                <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} />
                <text x={padding.left - 12} y={y + 5}>
                  {formatNumber(tick)}
                </text>
              </g>
            )
          })}
          <line className="projection-axis" x1={padding.left} x2={padding.left} y1={padding.top} y2={height - padding.bottom} />
          <line className="projection-axis" x1={padding.left} x2={width - padding.right} y1={height - padding.bottom} y2={height - padding.bottom} />
          <polyline className="projection-line revenue" points={pointsFor('revenue')} />
          <polyline className="projection-line ebit" points={pointsFor('ebit')} />
          {projectionSeries.map((item, i) => {
            const revenue = pointFor(item, 'revenue', i)
            const ebit = pointFor(item, 'ebit', i)
            return (
              <g className="projection-point-pair" style={stagger(i)} key={item.year}>
                <circle className="revenue" cx={revenue.x} cy={revenue.y} r="6" />
                <circle className="ebit" cx={ebit.x} cy={ebit.y} r="6" />
                <text x={revenue.x} y={height - 18}>
                  {item.year}
                </text>
              </g>
            )
          })}
        </svg>
        <div className="chart-legend projection-legend">
          <span>
            <i className="revenue" /> Revenue (USD M)
          </span>
          <span>
            <i className="income" /> EBIT (USD M)
          </span>
        </div>
      </section>

      <section className="panel-card fcff-panel" style={stagger(1)}>
        <h3>FCFF base (USD M)</h3>
        <div className="fcff-table">
          <div className="fcff-row head">
            <span>Año</span>
            <span>FCFF</span>
          </div>
          {fcffBase.map(([year, value], i) => (
            <div className="fcff-row" style={stagger(i)} key={year}>
              <span>{year}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
        <div className="projection-assumptions">
          OR: 59,7% → 59,3% · CAPEX: 14,5%-15,2%
          <br />
          Margen EBIT: 40,3% → 40,7% · g term: 2,5%
        </div>
      </section>
    </div>
  )
}

function RecommendationDashboard() {
  return (
    <div className="recommendation-layout">
      <section className="panel-card valuation-summary-panel" style={stagger(0)}>
        <h3>Resumen de valuación</h3>
        <div className="valuation-bars">
          {valuationBars.map((bar, i) => (
            <div className="valuation-bar-row" style={stagger(i)} key={bar.name}>
              <div>
                <strong>{bar.name}</strong>
                <span>{bar.weight}</span>
              </div>
              <div className="valuation-bar-track">
                <i className={`tone-${bar.tone}`} style={{ width: `${bar.width}%` }} />
                <b>{bar.value}</b>
              </div>
            </div>
          ))}
        </div>
        <div className="weighted-final">
          <span>Precio ponderado final:</span>
          <strong>USD 210,34</strong>
        </div>
      </section>

      <section className="panel-card recommendation-panel" style={stagger(1)}>
        <div className="market-compare">
          <p>
            <span>Precio mercado:</span>
            <strong>~USD 264</strong>
          </p>
          <p>
            <span>Precio objetivo:</span>
            <strong className="target">USD 210</strong>
          </p>
        </div>
        <div className="downside-box">DOWNSIDE: -20,3%</div>
        <div className="hold-box">
          <strong>MANTENER</strong>
          <span>/ NEUTRAL</span>
        </div>
        <div className="buy-conditions">
          <strong>Para comprar necesitamos:</strong>
          <span>Aprobación fusión NSC (STB)</span>
          <span>Precio baja a zona USD 220-230</span>
          <span>Reshoring &gt; proyectado</span>
        </div>
      </section>
    </div>
  )
}

function FinalSummaryDashboard() {
  return (
    <div className="final-summary-layout">
      {conclusionSummary.map((metric, i) => (
        <div className={`summary-metric ${metric.value === 'MANTENER' ? 'recommend' : ''}`} style={stagger(i)} key={metric.label}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
        </div>
      ))}
    </div>
  )
}

function LandingPhotoBackdrop() {
  const [backgroundIndex, setBackgroundIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setBackgroundIndex((current) => (current + 1) % landingBackgrounds.length)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="landing-photo-backdrop" aria-hidden="true">
      {landingBackgrounds.map((background, i) => (
        <div
          className={`landing-photo ${i === backgroundIndex ? 'active' : ''}`}
          key={background}
          style={{ backgroundImage: `url(${background})` }}
        />
      ))}
    </div>
  )
}

function RailBackdrop() {
  return (
    <>
      <div className="world-sky" />
      <div className="cloud-layer cloud-layer-back" />
      <div className="cloud-layer cloud-layer-front" />
      <div className="sunset-band" />
      <div className="mesa-layer mesa-layer-far" />
      <div className="mesa-layer mesa-layer-mid" />
      <div className="mesa-layer mesa-layer-near" />
      <div className="desert-floor" />
      <div className="ties" />
      <div className="rail rail-top" />
      <div className="rail rail-bottom" />
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
      <div className="roof-horn" />
      <div className="engine-long-hood">
        <div className="hood-vents hood-vents-left" />
        <div className="hood-vents hood-vents-right" />
        <div className="flag-decal" />
      </div>
      <div className="engine-cab">
        <div className="cab-window cab-window-side" />
        <div className="cab-window cab-window-front" />
      </div>
      <div className="headlight" />
      <div className="nose" />
      <div className="building-america">Building America</div>
      <div className="union-badge">UP</div>
      <div className="engine-number">7941</div>
      <div className="side-stripe" />
      <div className="lower-stripe" />
      <div className="running-board" />
      <div className="handrail handrail-long" />
      <div className="handrail handrail-front" />
      <div className="handrail handrail-rear" />
      <div className="center-tank" />
      <div className="plow" />
      <div className="wheel w1" />
      <div className="wheel w2" />
      <div className="wheel w3" />
    </div>
  )
}

type TrainWorldProps = {
  selectedIndex: number
  viewIndex: number
  phase: Phase
  slides: Slide[]
  trainOffsetX: number
  onSelect: (index: number) => void
}

function TrainWorld({ selectedIndex, viewIndex, phase, slides, trainOffsetX, onSelect }: TrainWorldProps) {
  const wagonStart = TRAIN.startX + TRAIN.engineWidth + TRAIN.gap
  const firstSlideX = wagonStart + TRAIN.wagonWidth / 2
  const frozenTrainOffset = phase === 'overview' ? 0 : trainOffsetX
  const focusXForView = (targetIndex: number, extraOffsetX = 0) => {
    if (targetIndex === -1) return firstSlideX + extraOffsetX

    return wagonStart + targetIndex * (TRAIN.wagonWidth + TRAIN.gap) + TRAIN.wagonWidth / 2 + extraOffsetX
  }
  const trainFocusX = focusXForView(viewIndex, frozenTrainOffset)
  const trackFocusX = firstSlideX
  const wagonCenterY = TRAIN.top + TRAIN.wagonHeight / 2
  const trainBottomY = TRAIN.top + TRAIN.wagonHeight + 26
  const trackBottomY = TRAIN.top + TRAIN.wagonHeight + 20
  const lockedTrainBottomY = (trainBottomY - wagonCenterY) * TRAIN_ZOOM.overview
  const lockedTrackBottomY = (trackBottomY - wagonCenterY) * TRAIN_ZOOM.overview
  const isLandingOverview = phase === 'overview' && viewIndex === -1
  const isFocused = phase === 'zooming-in' || phase === 'fullscreen'
  const isHidden = phase === 'fullscreen'

  return (
    <div
      className={`rail-camera ${isLandingOverview ? 'landing-mode' : 'slide-mode'} ${
        isHidden ? 'train-hidden' : 'train-visible'
      } ${phase}`}
    >
      <div
        className="rail-world"
        style={
          {
            '--train-offset-x': `${-trainFocusX}px`,
            '--track-offset-x': `${-trackFocusX}px`,
            '--train-origin-y': `${lockedTrainBottomY}px`,
            '--track-origin-y': `${lockedTrackBottomY}px`,
            '--train-offset-y': `${-trainBottomY}px`,
            '--track-offset-y': `${-trackBottomY}px`,
            '--target-zoom': `${isFocused ? TRAIN_ZOOM.focused : TRAIN_ZOOM.overview}`,
          } as React.CSSProperties
        }
      >
        <div className="rail-world-layer rail-track-world">
          <RailBackdrop />
        </div>
        <div className="rail-world-layer rail-train-world">
          <div
            className="train-consist"
            style={{
              left: TRAIN.startX,
              top: TRAIN.top,
              transform: frozenTrainOffset ? `translate3d(${frozenTrainOffset}px, 0, 0)` : undefined,
            }}
          >
            <Locomotive />
            {slides.map((slide, i) => {
              return (
                <button
                  className={`wagon wagon-${i % wagonPalettes.length} ${i === selectedIndex ? 'active' : ''}`}
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
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function SlideFullscreen({ index, phase, slide, total }: { index: number; phase: Phase; slide?: Slide; total: number }) {
  if (!slide || index < 0) return null

  const isVisible = phase === 'fullscreen' || phase === 'zooming-in' || phase === 'zooming-out'
  const palette = wagonPalettes[index % wagonPalettes.length]

  return (
    <article
      className={`fullscreen-slide wagon-theme-${index % wagonPalettes.length} ${isVisible ? 'visible' : ''} ${phase}`}
      style={
        {
          '--wagon-base': palette.base,
          '--wagon-deep': palette.deep,
          '--wagon-glow': palette.glow,
        } as React.CSSProperties
      }
      aria-live="polite"
    >
      <div className="fullscreen-slide-inner">
        <div className="slide-header">
          <div className="slide-kicker">
            {slide.icon}
            <span>{slide.eyebrow}</span>
          </div>
          <span className="slide-count">
            {String(index + 1).padStart(2, '0')} / {total}
          </span>
        </div>
        <div className="slide-main">
          <div className="slide-title-block">
            <h2>{slide.title}</h2>
            {slide.subtitle && <p className="slide-subtitle">{slide.subtitle}</p>}
          </div>
          <div className="slide-body">{slide.body}</div>
        </div>
      </div>
    </article>
  )
}

function App() {
  const [index, setIndex] = useState(-1)
  const [phase, setPhase] = useState<Phase>('overview')
  const [viewIndex, setViewIndex] = useState(-1)
  const [trainOffsetX, setTrainOffsetX] = useState(0)
  const transitionTimers = useRef<number[]>([])
  const navigationTarget = useRef(-1)
  const slides: Slide[] = useMemo(
    () => [
      {
        eyebrow: '01 · La empresa',
        title: 'Union Pacific: La Empresa',
        subtitle: '160 años de historia · Infraestructura logística crítica de EE.UU.',
        icon: <Building2 />,
        cargo: 'Empresa',
        body: <CompanyOverview />,
      },
      {
        eyebrow: '02 · Industria',
        title: 'Industria · FODA · Estrategia',
        subtitle: 'Class I Railroad en duopolio occidental · PSR como ventaja competitiva clave',
        icon: <Gauge />,
        cargo: 'Industria',
        body: <IndustryStrategy />,
      },
      {
        eyebrow: '03 · Ratios',
        title: 'Análisis Financiero: Ratios',
        subtitle: 'Rentabilidad · Solvencia · Liquidez · DuPont',
        icon: <BarChart3 />,
        cargo: 'Ratios',
        body: <RatioDashboard />,
      },
      {
        eyebrow: '04 · Mercado',
        title: 'Evolución del Precio de Mercado',
        subtitle: 'UNP · Cotización histórica · Valor de mercado incorporado en la tesis',
        icon: <TrendingUp />,
        cargo: 'Mercado',
        body: <MarketPriceDashboard />,
      },
      {
        eyebrow: '05 · Finanzas',
        title: 'Evolución Financiera & Dividendos',
        subtitle: 'FY2021-FY2025 · Value vs Growth · Dividend Aristocrat',
        icon: <TrendingUp />,
        cargo: 'Finanzas',
        body: <FinancialEvolution />,
      },
      {
        eyebrow: '06 · Management',
        title: 'Management, Accionistas & Análisis Estratégico',
        subtitle: 'Porter · PESTEL · Gobierno corporativo',
        icon: <Building2 />,
        cargo: 'Management',
        body: <ManagementStrategy />,
      },
      {
        eyebrow: '07 · Valuación',
        title: 'WACC · Proyecciones · Valuación',
        subtitle: 'DDM · DCF (3 escenarios) · Múltiples',
        icon: <Landmark />,
        cargo: 'WACC',
        body: <ValuationDashboard />,
      },
      {
        eyebrow: '08 · Proyecciones',
        title: 'Proyecciones 2026-2030: Escenario Base',
        subtitle: 'FCFF = NOPAT + D&A - CAPEX - DeltaWC · WACC 6,78% · g 2,5%',
        icon: <BarChart3 />,
        cargo: 'Proyección',
        body: <ProjectionDashboard />,
      },
      {
        eyebrow: '09 · Recomendación',
        title: 'Conclusión & Recomendación Final',
        subtitle: 'Precio objetivo ponderado · Upside / Downside · Recomendación',
        icon: <TrendingUp />,
        cargo: 'Conclusión',
        body: <RecommendationDashboard />,
      },
      {
        eyebrow: '10 · Resumen',
        title: 'Union Pacific Corporation',
        subtitle: 'NYSE: UNP · Análisis & Valuación',
        icon: <Landmark />,
        cargo: 'Resumen',
        body: <FinalSummaryDashboard />,
      },
    ],
    [],
  )

  const navigateTo = useCallback(
    (target: number) => {
      const next = Math.max(-1, Math.min(slides.length - 1, target))
      if (next === index && phase === 'fullscreen') return
      if (next === index && phase === 'overview') return

      navigationTarget.current = next

      transitionTimers.current.forEach((timer) => window.clearTimeout(timer))
      transitionTimers.current = []
      const isInterrupting = phase === 'starting' || phase === 'zooming-out' || phase === 'moving' || phase === 'zooming-in'
      const transitionMs = isInterrupting ? INTERRUPT_TRANSITION_MS : TRANSITION_MS

      const queue = (callback: () => void, delay: number) => {
        const timer = window.setTimeout(callback, delay)
        transitionTimers.current.push(timer)
      }

      const readIdleTrainOffset = () => {
        const train = document.querySelector('.train-consist')
        if (!train) return 0
        const transform = window.getComputedStyle(train).transform
        if (!transform || transform === 'none') return 0
        return new DOMMatrixReadOnly(transform).m41
      }

      if (next === -1) {
        setTrainOffsetX(0)
        if (index < 0) {
          setPhase('overview')
          setViewIndex(-1)
          return
        }

        setPhase('zooming-out')
        setViewIndex(index)
        queue(() => {
          setPhase('moving')
          setViewIndex(-1)
        }, transitionMs.zoomOut)
        queue(() => {
          setIndex(-1)
          setPhase('overview')
        }, transitionMs.zoomOut + transitionMs.move)
        return
      }

      if (phase === 'moving') {
        setTrainOffsetX(0)
        setPhase('moving')
        setViewIndex(next)
        queue(() => {
          setIndex(next)
          setPhase('zooming-in')
          setViewIndex(next)
        }, transitionMs.move)
        queue(() => {
          setPhase('fullscreen')
        }, transitionMs.move + transitionMs.zoomIn)
        return
      }

      if (index >= 0) {
        setTrainOffsetX(0)
        setPhase('zooming-out')
        setViewIndex(index)
        queue(() => {
          setPhase('moving')
          setViewIndex(next)
        }, transitionMs.zoomOut)
        queue(() => {
          setIndex(next)
          setPhase('zooming-in')
          setViewIndex(next)
        }, transitionMs.zoomOut + transitionMs.move)
        queue(() => {
          setPhase('fullscreen')
        }, transitionMs.zoomOut + transitionMs.move + transitionMs.zoomIn)
        return
      }

      const currentTrainOffset = readIdleTrainOffset()
      setTrainOffsetX(currentTrainOffset)

      setPhase('moving')
      setViewIndex(next)
      queue(() => {
        setIndex(next)
        setPhase('zooming-in')
        setViewIndex(next)
      }, transitionMs.move)
      queue(() => {
        setPhase('fullscreen')
      }, transitionMs.move + transitionMs.zoomIn)
    },
    [index, phase, slides.length],
  )

  useEffect(() => {
    return () => {
      transitionTimers.current.forEach((timer) => window.clearTimeout(timer))
    }
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable
      if (isTyping) return

      const navigationBase = navigationTarget.current
      if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault()
        navigateTo(navigationBase + 1)
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        navigateTo(navigationBase - 1)
      }
      if (event.key === 'Home' || event.key === 'Enter') {
        event.preventDefault()
        navigateTo(-1)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [index, navigateTo])

  const goNext = () => navigateTo(navigationTarget.current + 1)
  const goPrev = () => navigateTo(navigationTarget.current - 1)
  const progress = index === -1 ? 0 : ((index + 1) / slides.length) * 100
  const activeSlide = index >= 0 ? slides[index] : undefined
  const isTransitioning = phase === 'starting' || phase === 'zooming-out' || phase === 'moving' || phase === 'zooming-in'
  const motionPhaseClass = isTransitioning ? 'is-transitioning' : ''

  return (
    <main className={`${index === -1 ? 'is-landing' : 'is-slide'} phase-${phase} ${motionPhaseClass}`}>
      <div className="progress" aria-hidden="true">
        <i style={{ width: `${progress}%` }} />
      </div>

      <section className="deck-shell" aria-label="Presentación de valuación Union Pacific">
        <LandingPhotoBackdrop />
        <div className={`landing-panel ${index === -1 && phase === 'overview' ? 'visible' : ''}`}>
          <div className="landing-title-row">
            <img className="landing-company-logo" src="/union-pacific-logo.svg" alt="Union Pacific logo" />
            <div>
              <p>NYSE: UNP · Análisis & Valuación</p>
              <h1>Union Pacific Corporation</h1>
            </div>
          </div>
        </div>

        <TrainWorld
          selectedIndex={viewIndex >= 0 ? viewIndex : index}
          viewIndex={viewIndex}
          phase={phase}
          slides={slides}
          trainOffsetX={trainOffsetX}
          onSelect={navigateTo}
        />
        <SlideFullscreen index={index} phase={phase} slide={activeSlide} total={slides.length} />
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

      <footer className={`controls ${index === -1 ? 'start-controls' : ''}`}>
        {index === -1 ? (
          <button className="start-button" onClick={() => navigateTo(0)}>
            <TrainFront />
            Comenzar
            <ArrowRight />
          </button>
        ) : (
          <>
            <button onClick={goPrev}>
              <ArrowLeft />
              Anterior
            </button>
            <button className="restart-button" onClick={() => navigateTo(-1)}>
              Inicio
            </button>
            <span>{`${String(index + 1).padStart(2, '0')} / ${slides.length}`}</span>
            <button onClick={goNext} disabled={index === slides.length - 1 && phase === 'fullscreen'}>
              Siguiente
              <ArrowRight />
            </button>
          </>
        )}
      </footer>
    </main>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
