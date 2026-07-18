'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface TransactionSummaryData {
  transactionId: string;
  decision: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW';
  riskLevel: string;
  summary: string;
  confidenceScore: number;
  detectedIssues: string[];
  complianceViolations: number;
  fraudIndicators: number;
  discrepancies: number;
  sanctionsViolations: number;
  recommendedActions: string[];
}

export default function TransactionSummaryWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<TransactionSummaryData>();

  if (!isReady) return <div style={styles.container}>Initializing…</div>;
  if (!data) return <div style={styles.container}>Loading…</div>;

  const decisionColor = {
    APPROVE: '#10b981',
    REJECT: '#ef4444',
    MANUAL_REVIEW: '#f59e0b'
  }[data.decision] || '#6b7280';

  const riskColor = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#f59e0b',
    low: '#10b981'
  }[data.riskLevel] || '#6b7280';

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Transaction Summary</h2>
        <span style={styles.txnId}>{data.transactionId}</span>
      </div>

      <div style={styles.grid}>
        {/* Decision Card */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>Decision</div>
          <div style={{ ...styles.decisionBadge, backgroundColor: decisionColor }}>
            {data.decision.replace(/_/g, ' ')}
          </div>
          <div style={styles.confidence}>
            Confidence: <strong>{data.confidenceScore}%</strong>
          </div>
        </div>

        {/* Risk Level Card */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>Risk Level</div>
          <div style={{ ...styles.riskBadge, backgroundColor: riskColor }}>
            {data.riskLevel.toUpperCase()}
          </div>
        </div>

        {/* Issues Summary */}
        <div style={styles.card}>
          <div style={styles.cardLabel}>Issues Detected</div>
          <div style={styles.issueGrid}>
            <div style={styles.issueItem}>
              <span style={styles.issueCount}>{data.complianceViolations}</span>
              <span style={styles.issueLabel}>Compliance</span>
            </div>
            <div style={styles.issueItem}>
              <span style={styles.issueCount}>{data.fraudIndicators}</span>
              <span style={styles.issueLabel}>Fraud</span>
            </div>
            <div style={styles.issueItem}>
              <span style={styles.issueCount}>{data.discrepancies}</span>
              <span style={styles.issueLabel}>Discrepancies</span>
            </div>
            <div style={styles.issueItem}>
              <span style={styles.issueCount}>{data.sanctionsViolations}</span>
              <span style={styles.issueLabel}>Sanctions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={styles.summaryBox}>
        <div style={styles.summaryLabel}>Summary</div>
        <p style={styles.summaryText}>{data.summary}</p>
      </div>

      {/* Detected Issues */}
      {data.detectedIssues.length > 0 && (
        <div style={styles.issuesBox}>
          <div style={styles.issuesLabel}>Detected Issues</div>
          <ul style={styles.issuesList}>
            {data.detectedIssues.map((issue, idx) => (
              <li key={idx} style={styles.issueListItem}>
                {issue}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommended Actions */}
      {data.recommendedActions.length > 0 && (
        <div style={styles.actionsBox}>
          <div style={styles.actionsLabel}>Recommended Actions</div>
          <ol style={styles.actionsList}>
            {data.recommendedActions.map((action, idx) => (
              <li key={idx} style={styles.actionListItem}>
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}
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
    maxWidth: '800px'
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb'
  } as React.CSSProperties,
  title: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600'
  } as React.CSSProperties,
  txnId: {
    fontSize: '12px',
    color: '#6b7280',
    fontFamily: 'monospace'
  } as React.CSSProperties,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  } as React.CSSProperties,
  card: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px',
    textAlign: 'center' as const
  } as React.CSSProperties,
  cardLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: '8px'
  } as React.CSSProperties,
  decisionBadge: {
    display: 'inline-block',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px'
  } as React.CSSProperties,
  riskBadge: {
    display: 'inline-block',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: '600'
  } as React.CSSProperties,
  confidence: {
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '8px'
  } as React.CSSProperties,
  issueGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '8px'
  } as React.CSSProperties,
  issueItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px'
  } as React.CSSProperties,
  issueCount: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1f2937'
  } as React.CSSProperties,
  issueLabel: {
    fontSize: '11px',
    color: '#6b7280',
    marginTop: '2px'
  } as React.CSSProperties,
  summaryBox: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px'
  } as React.CSSProperties,
  summaryLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: '8px'
  } as React.CSSProperties,
  summaryText: {
    margin: 0,
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#374151'
  } as React.CSSProperties,
  issuesBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px'
  } as React.CSSProperties,
  issuesLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#991b1b',
    textTransform: 'uppercase',
    marginBottom: '8px'
  } as React.CSSProperties,
  issuesList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#7f1d1d'
  } as React.CSSProperties,
  issueListItem: {
    marginBottom: '6px'
  } as React.CSSProperties,
  actionsBox: {
    backgroundColor: '#eff6ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '12px'
  } as React.CSSProperties,
  actionsLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#1e40af',
    textTransform: 'uppercase',
    marginBottom: '8px'
  } as React.CSSProperties,
  actionsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '13px',
    color: '#1e3a8a'
  } as React.CSSProperties,
  actionListItem: {
    marginBottom: '6px'
  } as React.CSSProperties
};
