'use client';

import { useWidgetSDK, useTheme } from '@nitrostack/widgets';

export const dynamic = 'force-dynamic';

interface RiskBreakdownData {
  countryRisk: number;
  commodityRisk: number;
  complianceRisk: number;
  fraudRisk: number;
  shipmentRisk: number;
  overallRisk: number;
  riskLevel: string;
  breakdown: {
    countryRiskFactors: string[];
    commodityRiskFactors: string[];
    complianceRiskFactors: string[];
    fraudRiskFactors: string[];
    shipmentRiskFactors: string[];
  };
  calculatedAt: string;
}

export default function RiskBreakdownWidget() {
  const theme = useTheme();
  const { isReady, getToolOutput } = useWidgetSDK();
  const data = getToolOutput<RiskBreakdownData>();

  if (!isReady) return <div style={styles.container}>Initializing…</div>;
  if (!data) return <div style={styles.container}>Loading…</div>;

  const getRiskColor = (score: number) => {
    if (score >= 75) return '#dc2626';
    if (score >= 50) return '#ea580c';
    if (score >= 25) return '#f59e0b';
    return '#10b981';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 75) return 'CRITICAL';
    if (score >= 50) return 'HIGH';
    if (score >= 25) return 'MEDIUM';
    return 'LOW';
  };

  const riskCategories = [
    { name: 'Country Risk', score: data.countryRisk, factors: data.breakdown.countryRiskFactors },
    { name: 'Commodity Risk', score: data.commodityRisk, factors: data.breakdown.commodityRiskFactors },
    { name: 'Compliance Risk', score: data.complianceRisk, factors: data.breakdown.complianceRiskFactors },
    { name: 'Fraud Risk', score: data.fraudRisk, factors: data.breakdown.fraudRiskFactors },
    { name: 'Shipment Risk', score: data.shipmentRisk, factors: data.breakdown.shipmentRiskFactors }
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Risk Breakdown Analysis</h2>
        <div style={{ ...styles.overallRiskBadge, backgroundColor: getRiskColor(data.overallRisk) }}>
          <div style={styles.overallScore}>{data.overallRisk}</div>
          <div style={styles.overallLabel}>{getRiskLabel(data.overallRisk)}</div>
        </div>
      </div>

      {/* Risk Categories */}
      <div style={styles.categoriesGrid}>
        {riskCategories.map((category, idx) => (
          <div key={idx} style={styles.categoryCard}>
            <div style={styles.categoryHeader}>
              <span style={styles.categoryName}>{category.name}</span>
              <span style={{ ...styles.categoryScore, color: getRiskColor(category.score) }}>
                {category.score}
              </span>
            </div>
            <div style={styles.barContainer}>
              <div
                style={{
                  ...styles.barFill,
                  width: `${category.score}%`,
                  backgroundColor: getRiskColor(category.score)
                }}
              />
            </div>
            <div style={styles.categoryLabel}>{getRiskLabel(category.score)}</div>

            {(category.factors ?? []).length > 0 && (
              <div style={styles.factorsList}>
                {category.factors.map((factor, i) => (
                  <div key={i} style={styles.factorItem}>
                    • {factor}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Overall Risk Gauge */}
      <div style={styles.gaugeSection}>
        <h3 style={styles.gaugeTitle}>Overall Risk Score</h3>
        <div style={styles.gaugeContainer}>
          <div style={styles.gaugeTrack}>
            <div
              style={{
                ...styles.gaugeFill,
                width: `${data.overallRisk}%`,
                backgroundColor: getRiskColor(data.overallRisk)
              }}
            />
          </div>
          <div style={styles.gaugeLabels}>
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
        <div style={styles.gaugeValue}>
          {data.overallRisk} / 100 — <strong>{getRiskLabel(data.overallRisk)}</strong>
        </div>
      </div>

      {/* Risk Interpretation */}
      <div style={styles.interpretationBox}>
        <h3 style={styles.interpretationTitle}>Risk Interpretation</h3>
        <div style={styles.interpretationContent}>
          {data.overallRisk >= 75 && (
            <p>
              <strong>Critical Risk:</strong> This transaction exhibits critical risk factors and should be rejected or escalated for immediate investigation.
            </p>
          )}
          {data.overallRisk >= 50 && data.overallRisk < 75 && (
            <p>
              <strong>High Risk:</strong> This transaction requires manual review and enhanced due diligence before approval.
            </p>
          )}
          {data.overallRisk >= 25 && data.overallRisk < 50 && (
            <p>
              <strong>Medium Risk:</strong> This transaction can proceed with standard monitoring and controls in place.
            </p>
          )}
          {data.overallRisk < 25 && (
            <p>
              <strong>Low Risk:</strong> This transaction meets all compliance requirements with minimal risk exposure.
            </p>
          )}
        </div>
      </div>

      <div style={styles.footer}>
        Calculated at: <span style={styles.timestamp}>{new Date(data.calculatedAt).toLocaleString()}</span>
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
    maxWidth: '1000px'
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
  overallRiskBadge: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    color: '#fff'
  } as React.CSSProperties,
  overallScore: {
    fontSize: '28px',
    fontWeight: '700'
  } as React.CSSProperties,
  overallLabel: {
    fontSize: '11px',
    fontWeight: '600',
    marginTop: '2px'
  } as React.CSSProperties,
  categoriesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '12px',
    marginBottom: '20px'
  } as React.CSSProperties,
  categoryCard: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '12px'
  } as React.CSSProperties,
  categoryHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px'
  } as React.CSSProperties,
  categoryName: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151'
  } as React.CSSProperties,
  categoryScore: {
    fontSize: '16px',
    fontWeight: '700'
  } as React.CSSProperties,
  barContainer: {
    width: '100%',
    height: '8px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '6px'
  } as React.CSSProperties,
  barFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  } as React.CSSProperties,
  categoryLabel: {
    fontSize: '11px',
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: '8px'
  } as React.CSSProperties,
  factorsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '4px'
  } as React.CSSProperties,
  factorItem: {
    fontSize: '11px',
    color: '#6b7280',
    lineHeight: '1.3'
  } as React.CSSProperties,
  gaugeSection: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '16px',
    marginBottom: '16px'
  } as React.CSSProperties,
  gaugeTitle: {
    margin: '0 0 12px 0',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  } as React.CSSProperties,
  gaugeContainer: {
    marginBottom: '12px'
  } as React.CSSProperties,
  gaugeTrack: {
    width: '100%',
    height: '24px',
    backgroundColor: '#e5e7eb',
    borderRadius: '12px',
    overflow: 'hidden',
    marginBottom: '8px'
  } as React.CSSProperties,
  gaugeFill: {
    height: '100%',
    transition: 'width 0.3s ease'
  } as React.CSSProperties,
  gaugeLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '11px',
    color: '#9ca3af'
  } as React.CSSProperties,
  gaugeValue: {
    fontSize: '13px',
    color: '#374151',
    textAlign: 'center' as const
  } as React.CSSProperties,
  interpretationBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bfdbfe',
    borderRadius: '6px',
    padding: '12px',
    marginBottom: '16px'
  } as React.CSSProperties,
  interpretationTitle: {
    margin: '0 0 8px 0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1e40af'
  } as React.CSSProperties,
  interpretationContent: {
    fontSize: '13px',
    color: '#1e3a8a',
    lineHeight: '1.5'
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
