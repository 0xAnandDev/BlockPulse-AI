import { Injectable } from '@nestjs/common'
import PDFDocument from 'pdfkit'
import type { SecurityReport } from './dto/security-report.dto'

/** Pure rendering concern: turns an already-built SecurityReport into PDF bytes. No business logic here. */
@Injectable()
export class ReportPdfService {
  render(report: SecurityReport): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50 })
      const chunks: Array<Buffer> = []
      doc.on('data', (chunk) => chunks.push(chunk))
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)

      doc.fontSize(20).text('BlockPulse AI — Security Report', { align: 'left' })
      doc.fontSize(10).fillColor('#666').text(`Generated ${new Date(report.generatedAt).toLocaleString()}`)
      doc.moveDown(1.5)

      this.sectionHeading(doc, 'Wallet Overview')
      doc.fontSize(11).fillColor('#000')
      doc.text(`Name: ${report.wallet.walletName}`)
      doc.text(`Address: ${report.wallet.walletAddress}`)
      doc.text(`Network: ${report.wallet.network}`)
      doc.text(`Monitoring: ${report.wallet.isMonitoring ? 'Active' : 'Paused'}`)
      doc.text(`Monitored since: ${new Date(report.wallet.createdAt).toLocaleDateString()}`)
      doc.moveDown(1)

      this.sectionHeading(doc, 'Threat Assessment')
      doc.fontSize(11).fillColor('#000')
      doc.text(`Threat score: ${report.threatScore}/100`)
      doc.text(`Risk level: ${report.riskLevel.toUpperCase()}`)
      doc.text(`Confidence: ${report.confidence}%`)
      doc.moveDown(1)

      this.sectionHeading(doc, 'Security Profile')
      doc.fontSize(11).fillColor('#000')
      const p = report.securityProfile
      doc.text(`Total transactions: ${p.totalTransactions} (${p.recentTransactions} in the last 24h)`)
      doc.text(`Unique recipients: ${p.uniqueRecipients}  |  Active contracts: ${p.activeContracts}`)
      doc.text(`Approvals granted: ${p.approvalCount}  |  Ownership changes seen: ${p.ownershipChanges}`)
      doc.text(`Large transfers flagged: ${p.largeTransfers}`)
      doc.text(`Average transaction value: ${p.averageTransactionValue} ETH`)
      doc.text(`Risk trend: ${p.riskTrend}  |  Monitoring duration: ${p.monitoringDuration} day(s)`)
      doc.text(`Last activity: ${p.lastActivity ? new Date(p.lastActivity).toLocaleString() : 'none recorded'}`)
      doc.moveDown(1)

      this.sectionHeading(doc, 'Alert Summary')
      doc.fontSize(11).fillColor('#000')
      doc.text(`Total alerts: ${report.alertSummary.total}  |  Open: ${report.alertSummary.open}`)
      for (const [severity, count] of Object.entries(report.alertSummary.bySeverity)) {
        doc.text(`  ${severity}: ${count}`)
      }
      doc.moveDown(1)

      this.sectionHeading(doc, 'Recent Alerts')
      doc.fontSize(10).fillColor('#000')
      if (report.recentAlerts.length === 0) {
        doc.text('No alerts recorded.')
      }
      for (const alert of report.recentAlerts.slice(0, 15)) {
        doc.font('Helvetica-Bold').text(`[${alert.severity}] ${alert.title}`, { continued: false })
        doc.font('Helvetica').fillColor('#444').text(alert.description)
        doc.fillColor('#888').text(`${new Date(alert.createdAt).toLocaleString()} — ${alert.status}`)
        doc.fillColor('#000').moveDown(0.5)
      }
      doc.moveDown(0.5)

      this.sectionHeading(doc, 'AI Recommendations')
      doc.fontSize(11).fillColor('#000')
      for (const [i, rec] of report.recommendations.entries()) {
        doc.text(`${i + 1}. ${rec}`)
      }
      doc.moveDown(1)

      this.sectionHeading(doc, 'Monitoring Statistics')
      doc.fontSize(11).fillColor('#000')
      doc.text(`Total events tracked: ${report.monitoringStats.totalEventsTracked}`)
      doc.text(`Last scanned block: ${report.monitoringStats.lastScannedBlock ?? 'not yet scanned'}`)
      doc.text(`Monitoring duration: ${report.monitoringStats.monitoringDurationDays} day(s)`)

      doc.end()
    })
  }

  private sectionHeading(doc: PDFKit.PDFDocument, title: string): void {
    doc.fontSize(14).fillColor('#1a1a2e').font('Helvetica-Bold').text(title)
    doc.font('Helvetica').fillColor('#000')
    doc.moveDown(0.3)
  }
}
