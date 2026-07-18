'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface DocumentField {
  field: string;
  value: string | number | boolean;
  confidence?: number;
  status?: 'valid' | 'invalid' | 'warning';
}

interface DocumentParserData {
  documentType: string;
  documentId: string;
  extractedFields: DocumentField[];
  validationStatus: 'valid' | 'invalid' | 'partial';
  confidence: number;
  warnings: string[];
  errors: string[];
  parsedAt: string;
}

export default function DocumentParserResultWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<DocumentParserData>();

  if (!isReady) return <div style={styles.container}>Initializing…</div>;
  if (!data) return <div style={styles.container}>Loading…</div>;

  const statusColor = {
    valid: '#10b981',
    invalid: '#ef4444',
    partial: '#f59e0b'
  }[data.validationStatus] || '#6b7280';

  const getFieldStatusColor = (status?: string) => {
    switch (status) {
      case 'valid':
        return '#d1fae5';
      case 'invalid':
        return '#fee2e2';
      case 'warning':
        return '#fef3c7';
      default:
        return '#f3f4f6';
    }
  };

  const getFieldStatusIcon = (status?: string) => {
    switch (status) {
      case 'valid':
        return '✓';
      case 'invalid':
        return '✗';
      case 'warning':
        return '⚠';
      default:
        return '•';
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>Document Parser Result</h2>
          <div style={styles.docType}>{data.documentType}</div>
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={{ ...styles.statusBadge, backgroundColor: statusColor }}>
            {data.validationStatus.toUpperCase()}
          </div>
          <div style={styles.confidence}>Confidence: {data.confidence}%</div>
        </div>
      </div>

      <div style={styles.docId}>Document ID: <strong>{data.documentId}</strong></div>

      {/* Extracted Fields */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Extracted Fields</h3>
        <div style={styles.fieldsGrid}>
          {(data.extractedFields ?? []).map((field, idx) => (
            <div
              key={idx}
              style={{
                ...styles.fieldCard,
                backgroundColor: getFieldStatusColor(field.status)
              }}
            >
              <div style={styles.fieldHeader}>
                <span style={styles.fieldIcon}>{getFieldStatusIcon(field.status)}</span>
                <span style={styles.fieldName}>{field.field}</span>
                {field.confidence !== undefined && (
                  <span style={styles.fieldConfidence}>{field.confidence}%</span>
                )}
              </div>
              <div style={styles.fieldValue}>{String(field.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Warnings */}
      {(data.warnings ?? []).length > 0 && (
        <div style={styles.warningsBox}>
          <h3 style={styles.warningsTitle}>⚠ Warnings</h3>
          <ul style={styles.warningsList}>
            {data.warnings.map((warning, idx) => (
              <li key={idx} style={styles.warningItem}>
                {warning}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Errors */}
      {(data.errors ?? []).length > 0 && (
        <div style={styles.errorsBox}>
          <h3 style={styles.errorsTitle}>✗ Errors</h3>
          <ul style={styles.errorsList}>
            {data.errors.map((error, idx) => (
              <li key={idx} style={styles.errorItem}>
                {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div style={styles.footer}>
        Parsed at: <span style={styles.timestamp}>{new Date(data.parsedAt).toLocaleString()}</span>
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
    marginBottom: '16px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e5e7eb'
  } as React.CSSProperties,
  title: {
    margin: '0 0 4px 0',
    fontSize: '20px',
    fontWeight: '600'
  } as React.CSSProperties,
  docType: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500'
  } as React.CSSProperties,
  statusBadge: {
    display: 'inline-block',
    color: '#fff',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    marginBottom: '8px'
  } as React.CSSProperties,
  confidence: {
    fontSize: '12px',
    color: '#6b7280'
  } as React.CSSProperties,
  docId: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '16px',
    fontFamily: 'monospace'
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
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '10px'
  } as React.CSSProperties,
  fieldCard: {
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    padding: '10px',
    fontSize: '13px'
  } as React.CSSProperties,
  fieldHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginBottom: '6px'
  } as React.CSSProperties,
  fieldIcon: {
    fontSize: '14px',
    fontWeight: '600'
  } as React.CSSProperties,
  fieldName: {
    fontWeight: '600',
    color: '#374151',
    flex: 1
  } as React.CSSProperties,
  fieldConfidence: {
    fontSize: '11px',
    color: '#9ca3af',
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: '2px 6px',
    borderRadius: '3px'
  } as React.CSSProperties,
  fieldValue: {
    color: '#1f2937',
    wordBreak: 'break-word' as const,
    fontFamily: 'monospace',
    fontSize: '12px'
  } as React.CSSProperties,
  warningsBox: {
    backgroundColor: '#fffbeb',
    border: '1px solid #fcd34d',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px'
  } as React.CSSProperties,
  warningsTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#92400e'
  } as React.CSSProperties,
  warningsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '12px',
    color: '#78350f'
  } as React.CSSProperties,
  warningItem: {
    marginBottom: '4px'
  } as React.CSSProperties,
  errorsBox: {
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '12px'
  } as React.CSSProperties,
  errorsTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#991b1b'
  } as React.CSSProperties,
  errorsList: {
    margin: 0,
    paddingLeft: '20px',
    fontSize: '12px',
    color: '#7f1d1d'
  } as React.CSSProperties,
  errorItem: {
    marginBottom: '4px'
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
