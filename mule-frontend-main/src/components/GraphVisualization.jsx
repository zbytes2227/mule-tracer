import { useEffect, useRef, useState, useCallback } from 'react'
import cytoscape from 'cytoscape'
import Card from './ui/Card'
import Badge from './ui/Badge'
import Button from './ui/Button'
import Dropdown from './ui/Dropdown'
import Modal from './ui/Modal'

const VIEW_OPTIONS = [
  { label: 'Full Graph', value: 'full' },
  { label: 'Rings Only', value: 'rings-only' },
]

const LAYOUT_OPTIONS = [
  { label: 'Cose', value: 'cose' },
  { label: 'Circle', value: 'circle' },
  { label: 'Tree', value: 'breadthfirst' },
]

export default function GraphVisualization({ graph, highlightedAccounts = [] }) {
  const cyRef = useRef(null)
  const cyInst = useRef(null)
  const tooltipRef = useRef(null)
  const [layout, setLayout] = useState('cose')
  const [stats, setStats] = useState({ nodes: 0, edges: 0, suspicious: 0 })
  const [viewMode, setViewMode] = useState('full')
  const [guideOpen, setGuideOpen] = useState(false)

  const buildGraph = useCallback((graphData, mode) => {
    if (!graphData || !cyRef.current) return

    if (cyInst.current) {
      cyInst.current.destroy()
      cyInst.current = null
    }

    const allNodes = graphData.filter(el => !el.data?.source)
    const allEdges = graphData.filter(el => el.data?.source)
    const suspNodes = allNodes.filter(n => n.data?.suspicious || n.data?.suspicion_score > 0)
    const suspIds = new Set(suspNodes.map(n => n.data.id))

    let nodes
    let edges
    if (mode === 'rings-only') {
      nodes = suspNodes
      edges = allEdges.filter(e => suspIds.has(e.data.source) && suspIds.has(e.data.target))
    } else {
      nodes = allNodes
      const suspEdges = allEdges.filter(e => suspIds.has(e.data.source) || suspIds.has(e.data.target))
      const normalEdges = allEdges.filter(e => !suspIds.has(e.data.source) && !suspIds.has(e.data.target))
      const maxNormal = Math.max(0, 1500 - suspEdges.length)
      edges = [...suspEdges, ...normalEdges.slice(0, maxNormal)]
    }

    setStats({
      nodes: allNodes.length,
      edges: allEdges.length,
      suspicious: suspNodes.length,
      showing: nodes.length,
      showingEdges: edges.length,
    })

    const totalNodes = nodes.length
    const nodeSize = totalNodes > 300 ? 14 : totalNodes > 100 ? 20 : totalNodes > 50 ? 28 : 36
    const suspSize = totalNodes > 300 ? 22 : totalNodes > 100 ? 30 : totalNodes > 50 ? 40 : 52
    const fontSize = totalNodes > 300 ? '0px' : totalNodes > 100 ? '7px' : '9px'
    const edgeWidth = totalNodes > 300 ? 0.5 : 1.2

    const cy = cytoscape({
      container: cyRef.current,
      elements: [...nodes, ...edges],
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#13253d',
            'border-color': '#2f5f96',
            'border-width': 1.5,
            width: nodeSize,
            height: nodeSize,
            label: fontSize === '0px' ? '' : 'data(id)',
            'font-size': fontSize,
            'font-family': 'IBM Plex Mono, monospace',
            color: 'rgba(201, 218, 243, 0.85)',
            'text-valign': 'bottom',
            'text-halign': 'center',
            'text-margin-y': 5,
            'text-outline-color': '#060913',
            'text-outline-width': 2,
            'overlay-opacity': 0,
            'transition-property': 'background-color,border-color,width,height,opacity,border-width',
            'transition-duration': '320ms',
          },
        },
        {
          selector: 'node[?suspicious], node[suspicion_score > 0]',
          style: {
            'background-color': '#43202a',
            'border-color': '#f29670',
            'border-width': 2.5,
            width: suspSize,
            height: suspSize,
            label: 'data(id)',
            'font-size': '8px',
            color: 'rgba(255, 228, 208, 0.92)',
            'z-index': 10,
          },
        },
        {
          selector: 'node.hovered',
          style: {
            'border-color': '#eaf0ff',
            'border-width': 3,
            'z-index': 999,
            label: 'data(id)',
            'font-size': '9px',
          },
        },
        {
          selector: 'node.ring-highlight',
          style: {
            'background-color': '#5b2437',
            'border-color': '#f5ca82',
            'border-width': 4,
            width: mode === 'rings-only' ? suspSize * 1.4 : suspSize * 1.3,
            height: mode === 'rings-only' ? suspSize * 1.4 : suspSize * 1.3,
            label: 'data(id)',
            'font-size': '10px',
            color: '#f5ca82',
            'text-outline-color': '#060913',
            'text-outline-width': 2,
            'z-index': 999,
          },
        },
        { selector: 'node.ring-dimmed', style: { opacity: 0.08 } },
        {
          selector: 'edge',
          style: {
            width: edgeWidth,
            'line-color': 'rgba(65, 112, 167, 0.26)',
            'target-arrow-color': 'rgba(65, 112, 167, 0.34)',
            'target-arrow-shape': 'triangle',
            'arrow-scale': 0.8,
            'curve-style': 'bezier',
            'overlay-opacity': 0,
            'transition-property': 'line-color,width,opacity',
            'transition-duration': '280ms',
          },
        },
        {
          selector: 'edge[?suspicious_edge]',
          style: {
            width: edgeWidth * 2,
            'line-color': 'rgba(242, 150, 112, 0.42)',
            'target-arrow-color': 'rgba(242, 150, 112, 0.52)',
          },
        },
        {
          selector: 'edge.hovered',
          style: {
            width: 2.5,
            'line-color': 'rgba(255, 99, 132, 0.62)',
            'target-arrow-color': 'rgba(255, 99, 132, 0.72)',
          },
        },
        {
          selector: 'edge.ring-highlight',
          style: {
            width: 3,
            'line-color': 'rgba(245, 202, 130, 0.85)',
            'target-arrow-color': 'rgba(245, 202, 130, 0.95)',
            'z-index': 999,
          },
        },
        { selector: 'edge.ring-dimmed', style: { opacity: 0.03 } },
      ],
      layout: getLayout(layout, nodes.length, mode),
      wheelSensitivity: 0.2,
      minZoom: 0.05,
      maxZoom: 8,
      boxSelectionEnabled: false,
    })

    cyInst.current = cy
    attachEvents(cy)
    return cy
  }, [layout])

  const attachEvents = (cy) => {
    const tooltip = tooltipRef.current
    if (!tooltip) return

    cy.on('mouseover', 'node', e => {
      const node = e.target
      node.addClass('hovered')
      node.connectedEdges().addClass('hovered')
      showTooltip(node, tooltip)
    })

    cy.on('mouseout', 'node', e => {
      e.target.removeClass('hovered')
      e.target.connectedEdges().removeClass('hovered')
      tooltip.style.display = 'none'
    })

    cy.on('tap', e => {
      if (e.target === cy) tooltip.style.display = 'none'
    })
  }

  const showTooltip = (node, tooltip) => {
    const d = node.data()
    const score = d.suspicion_score ?? 0
    const patterns = Array.isArray(d.detected_patterns) && d.detected_patterns.length
      ? d.detected_patterns.join(', ')
      : 'None'
    const isSusp = d.suspicious || score > 0
    const scoreClass = score > 80 ? 'critical' : score > 50 ? 'warn' : score > 0 ? 'medium' : 'info'

    tooltip.innerHTML = `
      <div class="tip-title ${isSusp ? 'danger' : 'info'}">
        ${isSusp ? 'SUSPICIOUS' : 'ACCOUNT'} · ${d.account_id || d.id}
      </div>
      ${d.ring_id ? `<div class="tip-row"><span>Ring</span><span class="tip-accent">${d.ring_id}</span></div>` : ''}
      <div class="tip-row"><span>Score</span><span class="tip-score ${scoreClass}">${score}%</span></div>
      <div class="tip-row"><span>Pattern</span><span class="tip-pattern">${patterns}</span></div>
    `

    const pos = node.renderedPosition()
    const rect = cyRef.current.getBoundingClientRect()
    let left = rect.left + pos.x + 18
    const top = rect.top + pos.y - 8 + window.scrollY
    if (left + 240 > window.innerWidth) left -= 255
    tooltip.style.left = `${left}px`
    tooltip.style.top = `${top}px`
    tooltip.style.display = 'block'
  }

  useEffect(() => {
    buildGraph(graph, viewMode)
    return () => {
      if (cyInst.current) {
        cyInst.current.destroy()
        cyInst.current = null
      }
      if (tooltipRef.current) tooltipRef.current.style.display = 'none'
    }
  }, [graph, layout, viewMode, buildGraph])

  useEffect(() => {
    const cy = cyInst.current
    if (!cy) return

    cy.elements().removeClass('ring-highlight ring-dimmed')
    if (highlightedAccounts.length === 0) return

    highlightedAccounts.forEach(id => cy.getElementById(id).addClass('ring-highlight'))

    cy.edges().forEach(edge => {
      const src = edge.data('source')
      const tgt = edge.data('target')
      if (highlightedAccounts.includes(src) && highlightedAccounts.includes(tgt)) {
        edge.addClass('ring-highlight')
      } else {
        edge.addClass('ring-dimmed')
      }
    })

    cy.nodes().forEach(node => {
      if (!highlightedAccounts.includes(node.id())) node.addClass('ring-dimmed')
    })

    const ringNodes = cy.nodes().filter(n => highlightedAccounts.includes(n.id()))
    if (ringNodes.length > 0) {
      cy.animate({ fit: { eles: ringNodes, padding: 100 }, duration: 700, easing: 'ease-in-out-cubic' })
    }
  }, [highlightedAccounts])

  const handleClear = () => {
    const cy = cyInst.current
    if (!cy) return
    cy.elements().removeClass('ring-highlight ring-dimmed')
    cy.fit(undefined, 40)
  }

  const handleFit = () => {
    cyInst.current?.fit(undefined, 40)
  }

  return (
    <>
      <Card variant="danger" className="graph-card h-[620px] flex flex-col overflow-hidden">
        <div className="graph-head">
          <div>
            <h3 className="panel-title">Transaction Network Graph</h3>
            <p className="panel-subtitle">
              {stats.nodes?.toLocaleString()} accounts · {stats.edges?.toLocaleString()} transfers · {stats.suspicious} flagged
              {stats.showing && stats.showing < stats.nodes ? ` · showing ${stats.showing}` : ''}
            </p>
          </div>

          <div className="graph-controls">
            <Dropdown label="Mode" value={viewMode} options={VIEW_OPTIONS} onChange={setViewMode} />
            <Dropdown label="Layout" value={layout} options={LAYOUT_OPTIONS} onChange={setLayout} />

            {highlightedAccounts.length > 0 && (
              <Button variant="secondary" size="sm" onClick={handleClear}>Clear Ring</Button>
            )}

            <Button variant="ghost" size="sm" onClick={() => setGuideOpen(true)}>Guide</Button>

            <button onClick={handleFit} className="icon-btn" aria-label="Fit graph">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
          </div>
        </div>

        {highlightedAccounts.length > 0 && (
          <div className="ring-banner">
            <Badge tone="warning">{highlightedAccounts.length} ring nodes highlighted</Badge>
            <span className="ring-banner-text">
              {highlightedAccounts.slice(0, 4).join(' · ')}{highlightedAccounts.length > 4 ? ` +${highlightedAccounts.length - 4} more` : ''}
            </span>
          </div>
        )}

        <div className="graph-legend">
          <div className="legend-item"><span className="dot normal" />Normal</div>
          <div className="legend-item"><span className="dot suspicious" />Suspicious</div>
          <div className="legend-item"><span className="dot selected" />Ring Selected</div>
          <div className="ml-auto">
            <Badge tone={viewMode === 'rings-only' ? 'danger' : 'info'}>
              {viewMode === 'rings-only' ? `Showing ${stats.suspicious} suspicious nodes only` : 'Scroll to zoom · drag to pan'}
            </Badge>
          </div>
        </div>

        <div ref={cyRef} className="graph-stage flex-1" />
        <div ref={tooltipRef} className="cy-tooltip" />
      </Card>

      <Modal open={guideOpen} onClose={() => setGuideOpen(false)} title="Graph Interaction Guide">
        <div className="space-y-2 text-sm text-[var(--text-soft)]">
          <p>Hover nodes to inspect risk and pattern metadata.</p>
          <p>Use <strong>Mode</strong> to switch between full graph and suspicious rings only.</p>
          <p>Click a ring row in the table to isolate that cluster inside the network view.</p>
          <p>Use <strong>Fit</strong> to recenter and normalize the viewport after manual navigation.</p>
        </div>
      </Modal>
    </>
  )
}

function getLayout(name, nodeCount, mode) {
  const base = {
    animate: true,
    animationDuration: nodeCount > 200 ? 600 : 900,
    fit: true,
    padding: mode === 'rings-only' ? 60 : 30,
  }

  if (name === 'cose') {
    return {
      ...base,
      name: 'cose',
      nodeRepulsion: nodeCount > 300 ? 800000 : nodeCount > 100 ? 400000 : 200000,
      idealEdgeLength: nodeCount > 300 ? 30 : nodeCount > 100 ? 50 : 80,
      edgeElasticity: 100,
      gravity: nodeCount > 300 ? 80 : 50,
      numIter: nodeCount > 300 ? 500 : 1000,
      initialTemp: 200,
      coolingFactor: 0.95,
      minTemp: 1.0,
      randomize: false,
    }
  }

  if (name === 'circle') {
    return { ...base, name: 'circle', spacingFactor: nodeCount > 100 ? 0.6 : 1.2 }
  }

  if (name === 'breadthfirst') {
    return { ...base, name: 'breadthfirst', directed: true, spacingFactor: nodeCount > 100 ? 0.7 : 1.2, maximalAdjacency: true }
  }

  return { ...base, name }
}
