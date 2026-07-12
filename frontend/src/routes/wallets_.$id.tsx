import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowLeft, Blocks, FileText, Radar, ShieldAlert, ShieldCheck, Users } from 'lucide-react'
import AppShell from '../components/dashboard/AppShell'
import AlertCard from '../components/dashboard/AlertCard'
import ActivityChart from '../components/dashboard/ActivityChart'
import WalletAssistantChat from '../components/dashboard/WalletAssistantChat'
import Skeleton from '../components/ui/Skeleton'
import Button from '../components/ui/Button'
import { getWallet } from '../lib/api/wallets'
import type { WalletDto } from '../lib/api/wallets'
import { downloadSecurityReport, getMonitoringStatus, getWalletAlerts, getWalletEvents, getWalletSecurity } from '../lib/api/walletDetails'
import { ApiError } from '../lib/api/client'
import { formatRelativeTime } from '../lib/utils'
import type { AlertItem, ChartPoint, MonitoringPhase, MonitoringStatus, WalletEvent, WalletSecurity } from '../lib/dashboard/types'

export const Route = createFileRoute('/wallets_/$id')({ component: WalletDetailsRoute })

const RISK_DISPLAY: Record<string, { label: string; color: string; icon: typeof ShieldCheck }> = {
  safe: { label: 'SAFE', color: 'var(--risk-low)', icon: ShieldCheck },
  low: { label: 'LOW', color: 'var(--risk-low)', icon: ShieldCheck },
  medium: { label: 'MEDIUM', color: 'var(--risk-medium)', icon: ShieldAlert },
  high: { label: 'HIGH', color: 'var(--risk-high)', icon: ShieldAlert },
  critical: { label: 'CRITICAL', color: 'var(--risk-critical)', icon: ShieldAlert },
}

const PHASE_LABEL: Record<MonitoringPhase, string> = {
  idle: 'Idle — waiting for the next scan',
  scanning: 'Scanning latest block...',
  analyzing: 'Analyzing transactions...',
  'ai-analysis': 'Running AI analysis...',
  'threat-score-updated': 'Threat score updated.',
}

function shortenAddress(address: string) {
  return `${address.slice(0, 8)}...${address.slice(-6)}`
}

function WalletDetailsRoute() {
  const { id } = useParams({ from: '/wallets_/$id' })

  const [wallet, setWallet] = useState<WalletDto | null>(null)
  const [security, setSecurity] = useState<WalletSecurity | null>(null)
  const [events, setEvents] = useState<Array<WalletEvent> | null>(null)
  const [alerts, setAlerts] = useState<Array<AlertItem> | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [monitoringStatus, setMonitoringStatus] = useState<MonitoringStatus | null>(null)
  const [countdown, setCountdown] = useState<number | null>(null)

  const [isDownloading, setIsDownloading] = useState(false)
  const [reportError, setReportError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([getWallet(id), getWalletSecurity(id), getWalletEvents(id), getWalletAlerts(id)])
      .then(([w, s, e, a]) => {
        if (cancelled) return
        setWallet(w)
        setSecurity(s)
        setEvents(e)
        setAlerts(a)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof ApiError ? err.message : 'Could not load wallet details.')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  useEffect(() => {
    let cancelled = false
    const poll = () => {
      getMonitoringStatus(id)
        .then((status) => {
          if (cancelled) return
          setMonitoringStatus(status)
          setCountdown(status.nextScanInSeconds)
        })
        .catch(() => {})
    }
    poll()
    const pollInterval = setInterval(poll, 5000)
    return () => {
      cancelled = true
      clearInterval(pollInterval)
    }
  }, [id])

  useEffect(() => {
    if (countdown == null) return
    const tick = setInterval(() => setCountdown((c) => (c != null && c > 0 ? c - 1 : 0)), 1000)
    return () => clearInterval(tick)
  }, [monitoringStatus])

  const handleDownloadReport = async () => {
    if (!wallet) return
    setIsDownloading(true)
    setReportError(null)
    try {
      await downloadSecurityReport(wallet.id, wallet.walletName)
    } catch (err) {
      setReportError(err instanceof ApiError ? err.message : 'Could not generate the report.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6">
        <Link to="/wallets" className="flex w-fit items-center gap-1.5 text-sm text-[var(--ink-soft)] transition hover:text-[var(--ink)]">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to wallets
        </Link>

        {error ? (
          <div className="panel flex flex-col items-center gap-2 rounded-2xl px-6 py-16 text-center">
            <p className="font-semibold text-[var(--ink)]">Couldn&apos;t load this wallet</p>
            <p className="max-w-sm text-sm text-[var(--ink-soft)]">{error}</p>
          </div>
        ) : !wallet || !security || !events || !alerts ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-24 w-full" />
            <div className="grid gap-6 lg:grid-cols-3">
              <Skeleton className="h-72 w-full" />
              <Skeleton className="h-72 w-full" />
              <Skeleton className="h-72 w-full" />
            </div>
          </div>
        ) : (
          <WalletDetailsContent
            wallet={wallet}
            security={security}
            events={events}
            alerts={alerts}
            monitoringStatus={monitoringStatus}
            countdown={countdown}
            isDownloading={isDownloading}
            reportError={reportError}
            onDownloadReport={handleDownloadReport}
          />
        )}
      </div>
    </AppShell>
  )
}

function WalletDetailsContent({
  wallet,
  security,
  events,
  alerts,
  monitoringStatus,
  countdown,
  isDownloading,
  reportError,
  onDownloadReport,
}: {
  wallet: WalletDto
  security: WalletSecurity
  events: Array<WalletEvent>
  alerts: Array<AlertItem>
  monitoringStatus: MonitoringStatus | null
  countdown: number | null
  isDownloading: boolean
  reportError: string | null
  onDownloadReport: () => void
}) {
  const risk = RISK_DISPLAY[security.riskLevel] ?? RISK_DISPLAY.safe
  const RiskIcon = risk.icon
  const profile = security.securityProfile

  const riskHistoryPoints: Array<ChartPoint> = security.riskHistory.map((h) => ({
    label: new Date(h.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    value: h.threatScore,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="panel flex flex-wrap items-start justify-between gap-4 rounded-2xl p-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="display-title text-2xl font-bold text-[var(--ink)]">{wallet.walletName}</h1>
            <span className="pill">{wallet.network}</span>
            <span className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)]">
              <span className={`h-1.5 w-1.5 rounded-full ${wallet.isMonitoring ? 'bg-[var(--risk-low)]' : 'bg-[var(--ink-faint)]'}`} />
              {wallet.isMonitoring ? 'Monitoring active' : 'Monitoring paused'}
            </span>
          </div>
          <p className="mono mt-1.5 text-sm text-[var(--ink-faint)]">{shortenAddress(wallet.walletAddress)}</p>
          <p className="mt-1 text-xs text-[var(--ink-faint)]">Monitored since {new Date(wallet.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <Button onClick={onDownloadReport} isLoading={isDownloading} className="w-auto px-5">
            {!isDownloading && <FileText className="h-4 w-4" aria-hidden="true" />}
            Generate Security Report
          </Button>
          {reportError && <p className="max-w-xs text-right text-xs text-[var(--risk-high)]">{reportError}</p>}
        </div>
      </div>

      <div className="panel flex flex-wrap items-center gap-x-8 gap-y-3 rounded-2xl px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Radar className="h-4 w-4 text-[var(--cyan)]" aria-hidden="true" />
          <span className="text-sm font-semibold text-[var(--ink)]">
            {monitoringStatus ? PHASE_LABEL[monitoringStatus.phase] : 'Connecting to monitoring engine...'}
          </span>
        </div>
        <span className="hidden h-6 w-px bg-[var(--line)] sm:block" aria-hidden="true" />
        <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
          <Blocks className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
          Last scanned block{' '}
          <span className="font-semibold text-[var(--ink)]">{monitoringStatus?.lastScannedBlock ?? '—'}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-[var(--ink-soft)]">
          Chain tip <span className="font-semibold text-[var(--ink)]">{monitoringStatus?.latestChainBlock ?? '—'}</span>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-[var(--ink-soft)]">
          Next scan in <span className="font-semibold text-[var(--ink)]">{countdown ?? '—'}s</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6">
          <div className="panel rounded-2xl p-6 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative mx-auto flex h-20 w-20 items-center justify-center"
            >
              <span className="absolute inset-0 rounded-full opacity-[0.12] blur-xl" style={{ backgroundColor: risk.color }} />
              <RiskIcon className="relative h-10 w-10" style={{ color: risk.color }} aria-hidden="true" />
            </motion.div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.4)] px-3 py-3">
                <p className="kicker mb-1.5">Threat score</p>
                <p className="text-lg font-bold text-[var(--ink)]">{security.threatScore}/100</p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.4)] px-3 py-3">
                <p className="kicker mb-1.5">Risk level</p>
                <p className="text-lg font-bold" style={{ color: risk.color }}>
                  {risk.label}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.4)] px-3 py-3">
                <p className="kicker mb-1.5">Confidence</p>
                <p className="text-lg font-bold text-[var(--ink)]">{security.confidence}%</p>
              </div>
            </div>
          </div>

          <div className="panel rounded-2xl p-5">
            <p className="kicker mb-1">AI recommendations</p>
            <h2 className="display-title mb-3 text-lg font-bold text-[var(--ink)]">What to do next</h2>
            <ul className="flex flex-col gap-2.5">
              {security.recommendations.map((rec, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-[var(--ink-soft)]">
                  <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] text-[10px] font-semibold text-[var(--cyan)]">
                    {i + 1}
                  </span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <ActivityChart
            data={riskHistoryPoints}
            kicker="Risk history"
            title="Threat score over time"
            subtitle="Recent snapshots"
            unitLabel="score"
            peakLabel="peak threat score recorded"
          />

          <div className="panel rounded-2xl p-5">
            <p className="kicker mb-1">Security profile</p>
            <h2 className="display-title mb-4 text-lg font-bold text-[var(--ink)]">Wallet statistics</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <ProfileStat label="Total transactions" value={profile.totalTransactions} />
              <ProfileStat label="Last 24h transactions" value={profile.recentTransactions} />
              <ProfileStat label="Unique recipients" value={profile.uniqueRecipients} />
              <ProfileStat label="Active contracts" value={profile.activeContracts} />
              <ProfileStat label="Approvals granted" value={profile.approvalCount} />
              <ProfileStat label="Ownership changes" value={profile.ownershipChanges} />
              <ProfileStat label="Large transfers" value={profile.largeTransfers} />
              <ProfileStat label="Monitoring duration" value={`${profile.monitoringDuration}d`} />
              <ProfileStat label="Avg. transaction value" value={`${profile.averageTransactionValue} ETH`} />
              <ProfileStat label="Risk trend" value={profile.riskTrend} />
            </div>
            <p className="mt-4 text-xs text-[var(--ink-faint)]">
              Last activity: {profile.lastActivity ? formatRelativeTime(profile.lastActivity) : 'none recorded'}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[var(--ink-faint)]" aria-hidden="true" />
            <h2 className="display-title text-lg font-bold text-[var(--ink)]">Detected alerts</h2>
          </div>
          {alerts.length === 0 ? (
            <div className="panel flex flex-col items-center gap-2 rounded-2xl px-6 py-12 text-center">
              <p className="text-sm text-[var(--ink-soft)]">No alerts for this wallet.</p>
            </div>
          ) : (
            alerts.slice(0, 6).map((alert, i) => <AlertCard key={alert.id} alert={alert} index={i} />)
          )}
        </div>
      </div>

      <div className="panel rounded-2xl p-5">
        <p className="kicker mb-1">Live activity</p>
        <h2 className="display-title mb-4 text-lg font-bold text-[var(--ink)]">Recent blockchain events</h2>
        {events.length === 0 ? (
          <p className="text-sm text-[var(--ink-soft)]">No events recorded yet for this wallet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wide text-[var(--ink-faint)]">
                  <th className="pb-2 pr-4 font-medium">Type</th>
                  <th className="pb-2 pr-4 font-medium">Tx hash</th>
                  <th className="pb-2 pr-4 font-medium">Block</th>
                  <th className="pb-2 pr-4 font-medium">Value</th>
                  <th className="pb-2 pr-4 font-medium">Status</th>
                  <th className="pb-2 font-medium">When</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 15).map((event) => (
                  <tr key={event.id} className="border-t border-[var(--line)] text-[var(--ink-soft)]">
                    <td className="py-2.5 pr-4 font-medium text-[var(--ink)]">{event.eventType}</td>
                    <td className="mono py-2.5 pr-4 text-xs">{event.transactionHash.slice(0, 12)}...</td>
                    <td className="py-2.5 pr-4">{event.blockNumber}</td>
                    <td className="py-2.5 pr-4">{event.value}</td>
                    <td className="py-2.5 pr-4">{event.status}</td>
                    <td className="py-2.5 text-xs">{formatRelativeTime(event.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WalletAssistantChat walletId={wallet.id} walletName={wallet.walletName} />
    </div>
  )
}

function ProfileStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[rgba(10,14,24,0.4)] px-3.5 py-3">
      <p className="text-[10px] uppercase tracking-wide text-[var(--ink-faint)]">{label}</p>
      <p className="mt-1 font-semibold text-[var(--ink)]">{value}</p>
    </div>
  )
}
