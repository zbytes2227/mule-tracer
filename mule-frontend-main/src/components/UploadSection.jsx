import { useState, useRef } from 'react'
import axios from 'axios'
import { generateMockData } from '../utils/mockData'
import { transformApiResponse } from '../utils/apiTransformer'
import Button from './ui/Button'
import Card from './ui/Card'
import InputField from './ui/InputField'

const API_URL = 'http://69.62.75.190:6969/analyze'

export default function UploadSection({ onSuccess, onError, setLoading, hasResults, onReset }) {
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [statusMsg, setStatusMsg] = useState('')
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.endsWith('.csv')) {
      onError('Invalid file type. CSV only.')
      return
    }
    setFile(f)
    onError(null)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = () => setDragging(false)

  const handleUpload = async () => {
    if (!file) return

    const csvText = await file.text()

    const formData = new FormData()
    formData.append('file', file)

    setUploading(true)
    setLoading(true)
    setProgress(0)
    setStatusMsg('Uploading CSV to detection engine...')

    try {
      setProgress(20)
      setStatusMsg('Analyzing transaction graph...')

      const res = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const pct = Math.round((e.loaded * 100) / e.total)
          setProgress(Math.min(pct * 0.4, 40))
        },
        timeout: 120000,
      })

      setProgress(70)
      setStatusMsg('Building network graph...')

      await new Promise(r => setTimeout(r, 400))
      const transformed = transformApiResponse(res.data, csvText)

      setProgress(95)
      setStatusMsg('Generating threat report...')
      await new Promise(r => setTimeout(r, 300))

      onSuccess(transformed)
    } catch (err) {
      console.error('API Error:', err)
      if (err.code === 'ECONNABORTED') {
        onError('Request timed out. The server may be processing a large file — try again.')
      } else if (err.response) {
        onError(`Server error ${err.response.status}: ${err.response.data?.message || err.response.data?.error || 'Unknown error'}`)
      } else if (err.request) {
        onError(`Cannot reach API at ${API_URL}. Check that this backend endpoint is running and accessible.`)
      } else {
        onError(err.message || 'Upload failed.')
      }
    } finally {
      setUploading(false)
      setLoading(false)
      setProgress(0)
      setStatusMsg('')
    }
  }

  const handleDemo = () => {
    setLoading(true)
    setTimeout(() => {
      onSuccess(generateMockData())
      setLoading(false)
    }, 2400)
  }

  const handleReset = () => {
    setFile(null)
    setProgress(0)
    setStatusMsg('')
    onReset()
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <section className="anim-in d1">
      <Card
        variant="highlighted"
        className={`upload-zone ${dragging ? 'dragging' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !file && inputRef.current?.click()}
      >
        {dragging && <div className="scan-line" />}

        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />

        {!file ? (
          <div className="upload-empty">
            <div className="upload-glyph-wrap">
              <div className="upload-glyph">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
            </div>

            <div className="text-center">
              <p className="upload-title">Drop Transaction CSV</p>
              <p className="upload-subtitle">
                or <span className="text-[var(--accent)]">browse files</span> to send data to the threat engine
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {['transaction_id', 'sender_id', 'receiver_id', 'amount', 'timestamp'].map(col => (
                <span key={col} className="chip-muted">{col}</span>
              ))}
            </div>

            <div className="w-full max-w-md">
              <InputField
                label="Inference Endpoint"
                value="http://10.193.189.75:3000/analyze"
                readOnly
                onClick={e => e.stopPropagation()}
              />
            </div>

            <button
              onClick={e => {
                e.stopPropagation()
                handleDemo()
              }}
              className="demo-link"
            >
              Run built-in demo data (no API required)
            </button>
          </div>
        ) : (
          <div className="upload-ready" onClick={e => e.stopPropagation()}>
            <div className="file-glyph">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>

            <div className="text-center">
              <p className="upload-file-name">{file.name}</p>
              <p className="upload-file-meta">{(file.size / 1024).toFixed(1)} KB · CSV · Ready</p>
            </div>

            {uploading && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs text-[var(--text-soft)] mb-2">
                  <span>{statusMsg}</span>
                  <span className="text-[var(--danger)]">{progress}%</span>
                </div>
                <progress className="premium-progress critical" value={progress} max="100" />
                <p className="upload-file-meta mt-2 text-center">Sending to 10.193.189.75:3000/analyze...</p>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleReset} disabled={uploading} variant="ghost">Clear</Button>
              <Button onClick={handleUpload} disabled={uploading}>
                {uploading ? (
                  <>
                    <div className="loader-ring w-4 h-4" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.35-4.35" />
                    </svg>
                    Run Detection Engine
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {hasResults && (
        <div className="mt-3 flex justify-end">
          <button onClick={handleReset} className="demo-link">New Analysis</button>
        </div>
      )}
    </section>
  )
}
