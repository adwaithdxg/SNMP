import { useState, useEffect, useCallback } from 'react'
import './App.css'

interface SnmpData {
  status: string;
  timestamp: string;
  data: Record<string, any> | null;
  error?: string;
}

const OIDS = {
  sysDescr: "1.3.6.1.2.1.1.1.0",
  batteryCharge: "1.3.6.1.2.1.33.1.2.4.0",
  outputVoltage: "1.3.6.1.2.1.33.1.4.4.1.4",
}

function App() {
  const [snmpData, setSnmpData] = useState<SnmpData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      // Assuming the backend is running on port 8000 as per .env.local
      const response = await fetch('http://localhost:8000/api/snmp')
      if (!response.ok) {
        throw new Error('Failed to fetch SNMP data')
      }
      const data: SnmpData = await response.json()
      setSnmpData(data)
      setError(null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [fetchData])

  const getBatteryColor = (charge: number) => {
    if (charge > 70) return '#4caf50'
    if (charge > 30) return '#ff9800'
    return '#f44336'
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>SNMP UPS Monitor</h1>
          <div className={`status-badge ${snmpData?.status || 'offline'}`}>
            {snmpData?.status === 'success' ? '● Live' : '○ Offline'}
          </div>
        </div>
        <div className="last-updated">
          {snmpData?.timestamp ? `Last Updated: ${new Date(snmpData.timestamp).toLocaleTimeString()}` : 'Initializing...'}
        </div>
      </header>

      <main className="dashboard-grid">
        {loading && !snmpData ? (
          <div className="loader">Searching for SNMP Gateway...</div>
        ) : error ? (
          <div className="error-card">
            <h3>Connection Error</h3>
            <p>{error}</p>
            <button onClick={fetchData}>Retry Connection</button>
          </div>
        ) : (
          <>
            <section className="card system-info">
              <div className="card-header">
                <span className="icon">ℹ</span>
                <h2>System Description</h2>
              </div>
              <div className="card-content">
                <p>{snmpData?.data?.[OIDS.sysDescr] || 'No description available'}</p>
              </div>
            </section>

            <section className="card battery-status">
              <div className="card-header">
                <span className="icon">🔋</span>
                <h2>Battery Charge</h2>
              </div>
              <div className="card-content">
                <div className="gauge-container">
                  <div
                    className="gauge-fill"
                    style={{
                      width: `${snmpData?.data?.[OIDS.batteryCharge] || 0}%`,
                      backgroundColor: getBatteryColor(snmpData?.data?.[OIDS.batteryCharge] || 0)
                    }}
                  />
                  <span className="gauge-text">{snmpData?.data?.[OIDS.batteryCharge] || '0'}%</span>
                </div>
              </div>
            </section>

            <section className="card output-voltage">
              <div className="card-header">
                <span className="icon">⚡</span>
                <h2>Output Voltage</h2>
              </div>
              <div className="card-content">
                <div className="voltage-display">
                  <span className="value">{(snmpData?.data?.[OIDS.outputVoltage] || 0) / 10}</span>
                  <span className="unit">V</span>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      <footer className="dashboard-footer">
        <button className="refresh-btn" onClick={fetchData}>
          Refresh Now
        </button>
      </footer>
    </div>
  )
}

export default App
