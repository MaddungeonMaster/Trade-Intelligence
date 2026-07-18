'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface ComplianceViolation {
  rule: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  evidence?: string;
}

interface Discrepancy {
  field: string;
  expected: string;
  actual: string;
  severity: 'critical' | 'major' | 'minor';
  documents: string[];
}

interface ComplianceReportData {
  transactionId: string;
  complianceViolations: ComplianceViolation[];
  discrepancies: Discrepancy[];
  overallStatus: 'compliant' | 'non-compliant' | 'partial';
  violationCount: number;
  discrepancyCount: number;
  reportedAt: string;
}

export default function ComplianceReportWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<ComplianceReportData>();

  if (!isReady) return <div style={styles.container}>Initializing…</div>;
  if (!data) return <div style={styles.container}>Loading…</div>;

  const statusColor = {
    compliant: '#10b981',
    'non-compliant': '#ef4444',
    partial: '#f59e0b'
  }[data.overallStatus] || '#6b7280';

  const severityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#dc2626';
      case 'major':
        return '#ea580c';
      case 'minor':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const severityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#fee2e2';
      case 'major':
        return '#fed7aa';
      case 'minor':
        return '#fef3c7';
      default:
        return '#f3f4f6';
    }
  };

  const violations = data.complianceViolations ?? [];
  const discrepancies = data.discrepancies ?? [];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Compliance Report</h2>
          <div style={styles.txnId}>{data.transactionId}</div>
        </div>
        <div style={{ ...styles.statusBadge, backgroundColor: statusColor }}>
          {data.overallStatus.replace(/-/g, ' ').toUpperCase()}
        </div>
      </div>

      {/* Summary Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.violationCount}</div>
          <div style={styles.statLabel}>Violations</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statValue}>{data.discrepancyCount}</div>
          <div style={styles.statLabel}>Discrepancies</div>
        </div>
      </div>

      {/* Compliance Violations */}
      {violations.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>UCP 600 Violations</h3>
          <div style={styles.violationsList}>
            {violations.map((violation, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.violationCard,
                  borderLeftColor: severityColor(violation.severity)
                }}
              >
                <div style={styles.violationHeader}>
                  <span
                    style={{
                      ...styles.severityBadge,
                      backgroundColor: severityBgColor(violation.severity),
                      color: severityColor(violation.severity)
                    }}
                  >
                    {violation.severity.toUpperCase()}
                  </span>
                  <span style={styles.ruleName}>{violation.rule}</span>
                </div>
                <p style={styles.violationDesc}>{violation.description}</p>
                {violation.evidence && (
                  <div style={styles.evidence}>
                    <strong>Evidence:</strong> {violation.evidence}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Discrepancies */}
      {discrepancies.length > 0 && (
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Document Discrepancies</h3>
          <div style={styles.discrepanciesList}>
            {discrepancies.map((disc, idx) => (
              <div
                key={idx}
                style={{
                  ...styles.discrepancyCard,
                  borderLeftColor: severityColor(disc.severity)
                }}
              >
                <div style={styles.discrepancyHeader}>
                  <span
                    style={{
                      ...styles.severityBadge,
                      backgroundColor: severityBgColor(disc.severity),
                      color: severityColor(disc.severity)
                    }}
                  >
                    {disc.severity.toUpperCase()}
                  </span>
                  <span style={styles.fieldName}>{disc.field}</span>
                </div>
                <div style={styles.discrepancyContent}>
                  <div style={styles.discrepancyRow}>
                    <span style={styles.label}>Expected:</span>
                    <span style={styles.value}>{disc.expected}</span>
                  </div>
                  <div style={styles.discrepancyRow}>
                    <span style={styles.label}>Actual:</span>
                    <span style={styles.value}>{disc.actual}</span>
                  </div>
                  <div style={styles.discrepancyRow}>
                    <span style={styles.label}>Documents:</span>
                    <span style={styles.docTags}>
                      {(disc.documents ?? []).map((doc, i) => (
                        <span key={i} style={styles.docTag}>
                          {doc}
                        </span>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {violations.length === 0 && discrepancies.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>✓</div>
          <div style={styles.emptyText}>No compliance violations or discrepancies detected</div>
        </div>
      )}

      <div style={styles.footer}>
        Report generated: <span style={styles.timestamp}>{new Date(data.reportedAt).toLocaleString()}</span>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    maxWidth: '900px'
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb'
  } as React.CSSProperties,
  title: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: '600'
  } as React.CSSProperties,
  txnId: {
    fontSize: '12px',
    color: '#6b7280',
    fontFamily: 'monospace'
  } as React.CSSProperties,
  statusBadge: {
    color: '#fff',
    padding: '8px 16px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600'
  } as React.CSSProperties,
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    marginBottom: '20px'
  } as React.CSSProperties,
  statCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px',
    textAlign: 'center' as const
  } as React.CSSProperties,
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1f2937'
  } as React.CSSProperties,
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '4px'
  } as React.CSSProperties,
  section: {
    marginBottom: '20px'
  } as React.CSSProperties,
  sectionTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase'
  } as React.CSSProperties,
  violationsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  } as React.CSSProperties,
  violationCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderLeft: '4px solid',
    borderRadius: '6px',
    padding: '12px'
  } as React.CSSProperties,
  violationHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '8px'
  } as React.CSSProperties,
  severityBadge: {
    padding: '4px 8px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: '600'
  } as React.CSSProperties,
  ruleName: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '13px'
  } as React.CSSProperties,
  violationDesc: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    color: '#374151',
    lineHeight: '1.4'
  } as React.CSSProperties,
  evidence: {
    fontSize: '12px',
    color: '#6b7280',
    backgroundColor: '#f3f4f6',
    padding: '8px',
    borderRadius: '4px',
    fontFamily: 'monospace'
  } as React.CSSProperties,
  discrepanciesList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  } as React.CSSProperties,
  discrepancyCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderLeft: '4px solid',
    borderRadius: '6px',
    padding: '12px'
  } as React.CSSProperties,
  discrepancyHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px'
  } as React.CSSProperties,
  fieldName: {
    fontWeight: '600',
    color: '#1f2937',
    fontSize: '13px'
  } as React.CSSProperties,
  discrepancyContent: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px'
  } as React.CSSProperties,
  discrepancyRow: {
    display: 'flex',
    gap: '12px',
    fontSize: '12px'
  } as React.CSSProperties,
  label: {
    fontWeight: '600',
    color: '#6b7280',
    minWidth: '80px'
  } as React.CSSProperties,
  value: {
    color: '#1f2937',
    fontFamily: 'monospace',
    flex: 1,
    wordBreak: 'break-word' as const
  } as React.CSSProperties,
  docTags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap' as const
  } as React.CSSProperties,
  docTag: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '2px 8px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: '500'
  } as React.CSSProperties,
  emptyState: {
    textAlign: 'center' as const,
    padding: '40px 20px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    borderRadius: '6px',
    marginBottom: '20px'
  } as React.CSSProperties,
  emptyIcon: {
    fontSize: '32px',
    color: '#10b981',
    marginBottom: '8px'
  } as React.CSSProperties,
  emptyText: {
    color: '#047857',
    fontSize: '14px',
    fontWeight: '500'
  } as React.CSSProperties,
  footer: {
    fontSize: '11px',
    color: '#9ca3af',
    marginTop: '16px',
    paddingTop: '12px',
    borderTop: '1px solid #e5e7eb'
  } as React.CSSProperties,
  timestamp: {
    fontFamily: 'monospace',
    color: '#6b7280'
  } as React.CSSProperties
};
