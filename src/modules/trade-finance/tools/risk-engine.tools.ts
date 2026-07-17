/**
 * Risk Engine Tool
 * 
 * Calculates multi-dimensional risk scores: country, commodity, compliance, fraud, shipment.
 */

import { ToolDecorator as Tool, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';
import { RiskAssessment } from '../../../schemas/trade-documents.schema.js';
import { getCountryRisk, getCommodityRisk } from '../../../resources/sanctions-and-risk.resource.js';

const RiskEngineInputSchema = z.object({
  documents: z.record(z.unknown()).describe('All documents'),
  complianceViolations: z.array(z.unknown()).optional().describe('Compliance violations'),
  fraudIndicators: z.array(z.unknown()).optional().describe('Fraud indicators'),
  transactionId: z.string().optional()
});

@Injectable()
export class RiskEngineTools {
  @Tool({
    name: 'risk_engine',
    description: 'Calculate country risk, commodity risk, compliance risk, fraud risk, and shipment risk. Return overall risk score (0-100) and breakdown',
    inputSchema: RiskEngineInputSchema,
    examples: {
      request: { documents: { Invoice: { seller: 'ABC Corp' } } },
      response: { countryRisk: 20, commodityRisk: 30, complianceRisk: 10, fraudRisk: 15, shipmentRisk: 25, overallRisk: 20, riskLevel: 'low' }
    }
  })
  async calculateRisk(
    input: z.infer<typeof RiskEngineInputSchema>,
    ctx: ExecutionContext
  ): Promise<Record<string, unknown>> {
    ctx.logger.info('Calculating transaction risk', { transactionId: input.transactionId });

    let countryRisk = 0;
    let commodityRisk = 0;
    let complianceRisk = 0;
    let fraudRisk = 0;
    let shipmentRisk = 0;

    const countryRiskFactors: string[] = [];
    const commodityRiskFactors: string[] = [];
    const complianceRiskFactors: string[] = [];
    const fraudRiskFactors: string[] = [];
    const shipmentRiskFactors: string[] = [];

    const invoice = input.documents.Invoice as Record<string, unknown> | undefined;
    const bol = input.documents.BoL as Record<string, unknown> | undefined;

    // Country Risk
    if (invoice?.sellerCountry) {
      const countryProfile = getCountryRisk(String(invoice.sellerCountry));
      if (countryProfile) {
        countryRisk = countryProfile.riskScore;
        countryRiskFactors.push(...countryProfile.factors);
      }
    }

    // Commodity Risk
    if (invoice?.hsCode) {
      const commodityProfile = getCommodityRisk(String(invoice.hsCode));
      if (commodityProfile) {
        commodityRisk = commodityProfile.riskScore;
        commodityRiskFactors.push(...commodityProfile.factors);
      }
    }

    // Compliance Risk (based on violations)
    if (input.complianceViolations && Array.isArray(input.complianceViolations)) {
      const violations = input.complianceViolations as Array<Record<string, unknown>>;
      const criticalViolations = violations.filter(v => v.severity === 'critical').length;
      const majorViolations = violations.filter(v => v.severity === 'major').length;
      complianceRisk = Math.min(100, criticalViolations * 30 + majorViolations * 15);
      if (criticalViolations > 0) {
        complianceRiskFactors.push(`${criticalViolations} critical compliance violation(s)`);
      }
      if (majorViolations > 0) {
        complianceRiskFactors.push(`${majorViolations} major compliance violation(s)`);
      }
    }

    // Fraud Risk (based on TBML indicators)
    if (input.fraudIndicators && Array.isArray(input.fraudIndicators)) {
      const indicators = input.fraudIndicators as Array<Record<string, unknown>>;
      const criticalIndicators = indicators.filter(i => i.riskLevel === 'critical').length;
      const highIndicators = indicators.filter(i => i.riskLevel === 'high').length;
      fraudRisk = Math.min(100, criticalIndicators * 40 + highIndicators * 20);
      if (criticalIndicators > 0) {
        fraudRiskFactors.push(`${criticalIndicators} critical fraud indicator(s)`);
      }
      if (highIndicators > 0) {
        fraudRiskFactors.push(`${highIndicators} high-risk fraud indicator(s)`);
      }
    }

    // Shipment Risk (based on document consistency)
    if (bol) {
      // Check for missing critical shipment info
      const missingFields = [];
      if (!bol.vesselName) missingFields.push('vessel name');
      if (!bol.shippingCompany) missingFields.push('shipping company');
      if (!bol.containerNumber) missingFields.push('container number');
      if (missingFields.length > 0) {
        shipmentRisk += missingFields.length * 15;
        shipmentRiskFactors.push(`Missing shipment fields: ${missingFields.join(', ')}`);
      }
    } else {
      shipmentRisk = 30;
      shipmentRiskFactors.push('No Bill of Lading provided');
    }

    // Calculate overall risk (weighted average)
    const overallRisk = Math.round(
      (countryRisk * 0.2 + commodityRisk * 0.15 + complianceRisk * 0.3 + fraudRisk * 0.25 + shipmentRisk * 0.1)
    );

    const riskLevel = this.getRiskLevel(overallRisk);

    return {
      countryRisk: Math.min(100, countryRisk),
      commodityRisk: Math.min(100, commodityRisk),
      complianceRisk: Math.min(100, complianceRisk),
      fraudRisk: Math.min(100, fraudRisk),
      shipmentRisk: Math.min(100, shipmentRisk),
      overallRisk: Math.min(100, overallRisk),
      riskLevel,
      breakdown: {
        countryRiskFactors,
        commodityRiskFactors,
        complianceRiskFactors,
        fraudRiskFactors,
        shipmentRiskFactors
      },
      calculatedAt: new Date().toISOString()
    };
  }

  private getRiskLevel(score: number): string {
    if (score >= 75) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  }
}
