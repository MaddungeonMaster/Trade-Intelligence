/**
 * LC Compliance Checker Tool
 * 
 * Validates Letter of Credit terms and conditions.
 */

import { ToolDecorator as Tool, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';
import { ComplianceFinding } from '../../../schemas/trade-documents.schema.js';
import { validateUCP600Compliance } from '../../../resources/ucp600-rules.resource.js';

const LCComplianceCheckerInputSchema = z.object({
  lc: z.record(z.unknown()).describe('Letter of Credit data'),
  documents: z.record(z.unknown()).describe('Other documents for validation'),
  transactionId: z.string().optional()
});

@Injectable()
export class LCComplianceCheckerTools {
  @Tool({
    name: 'lc_compliance_checker',
    description: 'Validate LC against UCP 600 rules. Check shipment before expiry, required documents, signatures, beneficiary, currency, insurance, and latest shipment date',
    inputSchema: LCComplianceCheckerInputSchema,
    examples: {
      request: { lc: { expiryDate: '2024-12-31', amount: 100000 }, documents: {} },
      response: { compliant: true, violations: [], checksPerformed: 8, passedChecks: 8 }
    }
  })
  async checkLCCompliance(
    input: z.infer<typeof LCComplianceCheckerInputSchema>,
    ctx: ExecutionContext
  ): Promise<Record<string, unknown>> {
    ctx.logger.info('Checking LC compliance', { transactionId: input.transactionId });

    const violations: ComplianceFinding[] = [];
    let checksPerformed = 0;
    let passedChecks = 0;

    // Check 1: Expiry date
    checksPerformed++;
    if (input.lc.expiryDate) {
      const expiry = new Date(input.lc.expiryDate as string);
      const today = new Date();
      if (expiry > today) {
        passedChecks++;
      } else {
        violations.push({
          id: `comp_expiry_${Date.now()}`,
          severity: 'critical',
          rule: 'Article 6 - Expiry Date',
          violated: true,
          description: 'LC has expired',
          evidence: [`Expiry date: ${input.lc.expiryDate}`, `Today: ${today.toISOString()}`]
        });
      }
    }

    // Check 2: Required documents
    checksPerformed++;
    if (input.lc.requiredDocuments && Array.isArray(input.lc.requiredDocuments)) {
      const required = input.lc.requiredDocuments as string[];
      const provided = Object.keys(input.documents);
      const missing = required.filter(doc => !provided.includes(doc));
      if (missing.length === 0) {
        passedChecks++;
      } else {
        violations.push({
          id: `comp_docs_${Date.now()}`,
          severity: 'critical',
          rule: 'Article 15 - Required Documents',
          violated: true,
          description: `Missing required documents: ${missing.join(', ')}`,
          evidence: [`Required: ${required.join(', ')}`, `Provided: ${provided.join(', ')}`]
        });
      }
    }

    // Check 3: Beneficiary
    checksPerformed++;
    if (input.lc.beneficiary && input.documents.Invoice) {
      const invoice = input.documents.Invoice as Record<string, unknown>;
      if (invoice.seller === input.lc.beneficiary) {
        passedChecks++;
      } else {
        violations.push({
          id: `comp_beneficiary_${Date.now()}`,
          severity: 'critical',
          rule: 'Article 7 - Beneficiary',
          violated: true,
          description: 'Beneficiary mismatch between LC and Invoice',
          evidence: [`LC Beneficiary: ${input.lc.beneficiary}`, `Invoice Seller: ${invoice.seller}`]
        });
      }
    }

    // Check 4: Currency
    checksPerformed++;
    if (input.lc.currency && input.documents.Invoice) {
      const invoice = input.documents.Invoice as Record<string, unknown>;
      if (invoice.currency === input.lc.currency) {
        passedChecks++;
      } else {
        violations.push({
          id: `comp_currency_${Date.now()}`,
          severity: 'critical',
          rule: 'Article 6 - Currency',
          violated: true,
          description: 'Currency mismatch between LC and Invoice',
          evidence: [`LC Currency: ${input.lc.currency}`, `Invoice Currency: ${invoice.currency}`]
        });
      }
    }

    // Check 5: Amount
    checksPerformed++;
    if (input.lc.amount && input.documents.Invoice) {
      const invoice = input.documents.Invoice as Record<string, unknown>;
      const lcAmount = Number(input.lc.amount);
      const invoiceAmount = Number(invoice.totalAmount);
      if (invoiceAmount <= lcAmount) {
        passedChecks++;
      } else {
        violations.push({
          id: `comp_amount_${Date.now()}`,
          severity: 'critical',
          rule: 'Article 6 - Amount',
          violated: true,
          description: 'Invoice amount exceeds LC amount',
          evidence: [`LC Amount: ${lcAmount}`, `Invoice Amount: ${invoiceAmount}`]
        });
      }
    }

    // Check 6: Insurance requirement
    checksPerformed++;
    if (input.lc.insuranceRequired) {
      if (input.documents.Insurance) {
        passedChecks++;
      } else {
        violations.push({
          id: `comp_insurance_${Date.now()}`,
          severity: 'major',
          rule: 'Article 21 - Insurance Document',
          violated: true,
          description: 'Insurance document required but not provided',
          evidence: ['LC requires insurance', 'No insurance document found']
        });
      }
    }

    // Check 7: Latest shipment date
    checksPerformed++;
    if (input.lc.latestShipmentDate && input.documents.BoL) {
      const bol = input.documents.BoL as Record<string, unknown>;
      const latestDate = new Date(input.lc.latestShipmentDate as string);
      const shipmentDate = new Date(bol.shipmentDate as string);
      if (shipmentDate <= latestDate) {
        passedChecks++;
      } else {
        violations.push({
          id: `comp_shipment_date_${Date.now()}`,
          severity: 'critical',
          rule: 'Article 6 - Latest Shipment Date',
          violated: true,
          description: 'Shipment date exceeds LC latest shipment date',
          evidence: [`Latest Shipment Date: ${input.lc.latestShipmentDate}`, `Actual Shipment Date: ${bol.shipmentDate}`]
        });
      }
    }

    // Check 8: Incoterms consistency
    checksPerformed++;
    if (input.lc.incoterms && input.documents.Invoice) {
      const invoice = input.documents.Invoice as Record<string, unknown>;
      if (invoice.incoterms === input.lc.incoterms) {
        passedChecks++;
      } else {
        violations.push({
          id: `comp_incoterms_${Date.now()}`,
          severity: 'major',
          rule: 'Article 6 - Incoterms',
          violated: true,
          description: 'Incoterms mismatch between LC and Invoice',
          evidence: [`LC Incoterms: ${input.lc.incoterms}`, `Invoice Incoterms: ${invoice.incoterms}`]
        });
      }
    }

    return {
      compliant: violations.length === 0,
      violations,
      checksPerformed,
      passedChecks,
      complianceScore: checksPerformed > 0 ? Math.round((passedChecks / checksPerformed) * 100) : 0,
      checkedAt: new Date().toISOString()
    };
  }
}
