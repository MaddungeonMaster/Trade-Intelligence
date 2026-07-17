/**
 * Decision Engine Tool
 * 
 * Generates final recommendation: APPROVE, REJECT, or MANUAL_REVIEW.
 * Provides explainable decision with supporting evidence.
 */

import { ToolDecorator as Tool, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';
import { DecisionReport } from '../../../schemas/trade-documents.schema.js';

const DecisionEngineInputSchema = z.object({
  transactionId: z.string(),
  riskAssessment: z.record(z.unknown()).describe('Risk assessment results'),
  complianceViolations: z.array(z.unknown()).optional().describe('Compliance violations'),
  fraudIndicators: z.array(z.unknown()).optional().describe('Fraud indicators'),
  discrepancies: z.array(z.unknown()).optional().describe('Document discrepancies'),
  sanctionsViolations: z.array(z.string()).optional().describe('Sanctions violations')
});

@Injectable()
export class DecisionEngineTools {
  @Tool({
    name: 'decision_engine',
    description: 'Generate final decision (APPROVE, REJECT, MANUAL_REVIEW) with explainable reasoning and supporting evidence',
    inputSchema: DecisionEngineInputSchema,
    examples: {
      request: {
        transactionId: 'TXN001',
        riskAssessment: { overallRisk: 30, riskLevel: 'low' },
        complianceViolations: [],
        fraudIndicators: [],
        discrepancies: [],
        sanctionsViolations: []
      },
      response: {
        decision: 'APPROVE',
        riskLevel: 'low',
        summary: 'Transaction meets all compliance requirements with low risk profile',
        confidenceScore: 95
      }
    }
  })
  async generateDecision(
    input: z.infer<typeof DecisionEngineInputSchema>,
    ctx: ExecutionContext
  ): Promise<Record<string, unknown>> {
    ctx.logger.info('Generating decision', { transactionId: input.transactionId });

    const riskAssessment = input.riskAssessment as Record<string, unknown>;
    const overallRisk = Number(riskAssessment.overallRisk || 0);
    const riskLevel = String(riskAssessment.riskLevel || 'medium');

    const complianceViolations = input.complianceViolations || [];
    const fraudIndicators = input.fraudIndicators || [];
    const discrepancies = input.discrepancies || [];
    const sanctionsViolations = input.sanctionsViolations || [];

    let decision: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW' = 'APPROVE';
    let confidenceScore = 95;
    const detectedIssues: string[] = [];
    const recommendedActions: string[] = [];

    // Rule 1: Reject if sanctions violations
    if (sanctionsViolations.length > 0) {
      decision = 'REJECT';
      confidenceScore = 99;
      detectedIssues.push(`Sanctions violations detected: ${sanctionsViolations.join(', ')}`);
      recommendedActions.push('Escalate to sanctions compliance team immediately');
      recommendedActions.push('Block transaction and report to relevant authorities');
    }

    // Rule 2: Reject if critical compliance violations
    const criticalComplianceViolations = (complianceViolations as Array<Record<string, unknown>>).filter(
      v => v.severity === 'critical'
    );
    if (criticalComplianceViolations.length > 0 && decision !== 'REJECT') {
      decision = 'REJECT';
      confidenceScore = 98;
      detectedIssues.push(`${criticalComplianceViolations.length} critical compliance violation(s)`);
      recommendedActions.push('Request corrected documents from beneficiary');
      recommendedActions.push('Verify LC terms compliance');
    }

    // Rule 3: Reject if critical fraud indicators
    const criticalFraudIndicators = (fraudIndicators as Array<Record<string, unknown>>).filter(
      i => i.riskLevel === 'critical'
    );
    if (criticalFraudIndicators.length > 0 && decision !== 'REJECT') {
      decision = 'REJECT';
      confidenceScore = 97;
      detectedIssues.push(`${criticalFraudIndicators.length} critical fraud indicator(s) detected`);
      recommendedActions.push('Escalate to fraud investigation team');
      recommendedActions.push('Request additional documentation and verification');
    }

    // Rule 4: Manual review if high risk or major violations
    if (decision === 'APPROVE') {
      const majorComplianceViolations = (complianceViolations as Array<Record<string, unknown>>).filter(
        v => v.severity === 'major'
      );
      const highFraudIndicators = (fraudIndicators as Array<Record<string, unknown>>).filter(
        i => i.riskLevel === 'high'
      );
      const criticalDiscrepancies = (discrepancies as Array<Record<string, unknown>>).filter(
        d => d.severity === 'critical'
      );

      if (overallRisk >= 50 || majorComplianceViolations.length > 0 || highFraudIndicators.length > 0 || criticalDiscrepancies.length > 0) {
        decision = 'MANUAL_REVIEW';
        confidenceScore = 75;
        if (overallRisk >= 50) {
          detectedIssues.push(`High overall risk score: ${overallRisk}/100`);
        }
        if (majorComplianceViolations.length > 0) {
          detectedIssues.push(`${majorComplianceViolations.length} major compliance violation(s)`);
        }
        if (highFraudIndicators.length > 0) {
          detectedIssues.push(`${highFraudIndicators.length} high-risk fraud indicator(s)`);
        }
        if (criticalDiscrepancies.length > 0) {
          detectedIssues.push(`${criticalDiscrepancies.length} critical discrepancy(ies)`);
        }
        recommendedActions.push('Route to senior trade finance officer for manual review');
        recommendedActions.push('Request additional documentation if needed');
        recommendedActions.push('Conduct enhanced due diligence');
      }
    }

    // Rule 5: Approve if low risk and no violations
    if (decision === 'APPROVE') {
      if (overallRisk < 25 && complianceViolations.length === 0 && fraudIndicators.length === 0) {
        confidenceScore = 98;
        recommendedActions.push('Proceed with payment under LC');
      } else if (overallRisk < 50) {
        confidenceScore = 85;
        recommendedActions.push('Proceed with payment under LC with standard monitoring');
      }
    }

    const summary = this.generateSummary(decision, detectedIssues, overallRisk);

    return {
      transactionId: input.transactionId,
      decision,
      riskLevel,
      summary,
      detectedIssues,
      complianceViolations: complianceViolations.length,
      fraudIndicators: fraudIndicators.length,
      discrepancies: discrepancies.length,
      sanctionsViolations: sanctionsViolations.length,
      evidence: {
        supportingDocuments: ['LC', 'Invoice', 'BoL', 'CoO', 'Insurance'],
        rulesCited: this.getCitedRules(decision, complianceViolations, fraudIndicators),
        discrepancies: discrepancies.length
      },
      recommendedActions,
      confidenceScore,
      generatedAt: new Date().toISOString(),
      generatedBy: 'decision_engine'
    };
  }

  private generateSummary(decision: string, issues: string[], riskScore: number): string {
    if (decision === 'REJECT') {
      return `Transaction REJECTED due to critical compliance or fraud concerns. Issues: ${issues.slice(0, 2).join('; ')}`;
    } else if (decision === 'MANUAL_REVIEW') {
      return `Transaction requires MANUAL REVIEW. Risk score: ${riskScore}/100. Issues: ${issues.slice(0, 2).join('; ')}`;
    } else {
      return `Transaction APPROVED. Risk score: ${riskScore}/100. All compliance requirements met.`;
    }
  }

  private getCitedRules(decision: string, complianceViolations: unknown[], fraudIndicators: unknown[]): string[] {
    const rules: string[] = [];
    if (decision === 'REJECT' || decision === 'MANUAL_REVIEW') {
      rules.push('UCP 600 Article 14 - Standard for Examination');
      rules.push('UCP 600 Article 15 - Complying Presentation');
      if ((complianceViolations as Array<Record<string, unknown>>).length > 0) {
        rules.push('UCP 600 Article 16 - Discrepancies');
      }
      if ((fraudIndicators as Array<Record<string, unknown>>).length > 0) {
        rules.push('FATF Recommendations - Trade Finance');
      }
    }
    return rules;
  }
}
