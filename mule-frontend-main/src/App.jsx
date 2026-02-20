import { useState } from 'react'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import SummaryCards from './components/SummaryCards'
import GraphVisualization from './components/GraphVisualization'
import FraudRingTable from './components/FraudRingTable'
import SuspiciousAccountsPanel from './components/SuspiciousAccountsPanel'
import LoadingOverlay from './components/LoadingOverlay'
import ErrorAlert from './components/ErrorAlert'
import DownloadButton from './components/DownloadButton'
import ThreatTicker from './components/ThreatTicker'
import Section from './components/ui/Section'
// Note: This is a simplified examp gle and does not include actual data fetching or model inference logic.

export default function App() {
  const [analysisData, setAnalysisData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [highlightedAccounts, setHighlightedAccounts] = useState([])

  const handleUploadSuccess = (data) => {
    setAnalysisData(data)
    setError(null)
    setHighlightedAccounts([])
    setTimeout(() => document.getElementById('results')?.scrollIntoView({ behavior: 'smooth' }), 120)
  }

  const handleReset = () => {
    setAnalysisData(null)
    setError(null)
    setHighlightedAccounts([])
  }

  const handleRingSelect = (memberAccounts) => {
    setHighlightedAccounts(prev => {
      const same = prev.length === memberAccounts.length &&
        memberAccounts.every(a => prev.includes(a))
      return same ? [] : memberAccounts
    })
    document.getElementById('graph-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div className="app-shell">
      <div className="app-ambient" aria-hidden="true">
        <div className="ambient-orb ambient-orb-one" />
        <div className="ambient-orb ambient-orb-two" />
        <div className="ambient-orb ambient-orb-three" />
      </div>

      <div className="app-content">
        <ThreatTicker />
        <main className="max-w-[1500px] mx-auto px-5 md:px-8 pb-24">
          <Header />

          <UploadSection
            onSuccess={handleUploadSuccess}
            onError={setError}
            setLoading={setLoading}
            hasResults={!!analysisData}
            onReset={handleReset}
          />

          {error && (
            <div className="mt-7 anim-in">
              <ErrorAlert message={error} onDismiss={() => setError(null)} />
            </div>
          )}

          {analysisData && (
            <div id="results" className="mt-16 space-y-9">
              <Section
                title="Threat Analysis"
                subtitle="Model output across graph topology, account risk posture, and fraud rings"
                right={<DownloadButton data={analysisData} />}
                className="anim-in"
              />

              <SummaryCards summary={analysisData.summary} />

              <div className="grid grid-cols-1 xl:grid-cols-[1.8fr_1fr] gap-7">
                <div id="graph-section" className="anim-in d3">
                  <GraphVisualization
                    graph={analysisData.graph}
                    highlightedAccounts={highlightedAccounts}
                  />
                </div>
                <div className="anim-in d4">
                  <SuspiciousAccountsPanel accounts={analysisData.suspicious_accounts} />
                </div>
              </div>

              <div className="anim-in d5">
                <FraudRingTable
                  rings={analysisData.fraud_rings}
                  onRingSelect={handleRingSelect}
                  highlightedAccounts={highlightedAccounts}
                />
              </div>
            </div>
          )}
        </main>
      </div>

      {loading && <LoadingOverlay />}
    </div>
  )
}
