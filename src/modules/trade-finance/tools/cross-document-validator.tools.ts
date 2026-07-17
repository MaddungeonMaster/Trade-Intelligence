/**
 * Cross-Document Validator Tool
 * 
 * Compares all uploaded documents and detects mismatches.
 */

import { ToolDecorator as Tool, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';
import { Discrepancy } from '../../../schemas/trade-documents.schema.js';

const CrossDocumentValidatorInputSchema = z.object({
  documents: z.record(z.unknown()).describe('Map of document type to extracted data'),
  transactionId: z.string().optional().describe('Transaction ID')
});

@Injectable()
export class CrossDocumentValidatorTools {
  @Tool({
    name: 'cross_document_validator',
    description: 'Compare all uploaded documents and detect mismatches in buyer, seller, quantity, currency, amount, shipment date, container, port, and goods description',
    inputSchema: CrossDocumentValidatorInputSchema,
    examples: {
      request: { documents: { LC: { buyer: 'ABC Corp' }, Invoice: { buyer: 'ABC Corp' } } },
      response: { discrepancies: [], totalChecks: 42, matchedFields: 40, mismatchedFields: 2 }
    }
  })
  async validateDocuments(
    input: z.infer<typeof CrossDocumentValidatorInputSchema>,
    ctx: ExecutionContext
  ): Promise<Record<string, unknown>> {
    ctx.logger.info('Validating cross-document consistency', { transactionId: input.transactionId });

    const discrepancies: Discrepancy[] = [];
    let totalChecks = 0;
    let matchedFields = 0;
    let mismatchedFields = 0;

    // Define fields to compare across documents
    const fieldsToCompare = [
      { field: 'buyer', docs: ['LC', 'Invoice', 'PO', 'BoL'] },
      { field: 'seller', docs: ['LC', 'Invoice', 'PO', 'BoL'] },
      { field: 'currency', docs: ['LC', 'Invoice', 'PO'] },
      { field: 'amount', docs: ['LC', 'Invoice', 'PO'] },
      { field: 'quantity', docs: ['Invoice', 'PO', 'PackingList'] },
      { field: 'shipmentDate', docs: ['Invoice', 'BoL', 'PackingList'] },
      { field: 'containerNumber', docs: ['BoL', 'PackingList'] },
      { field: 'ports', docs: ['LC', 'Invoice', 'BoL'] },
      { field: 'goodsDescription', docs: ['LC', 'Invoice', 'BoL'] }
    ];

    // Compare each field across documents
    for (const { field, docs } of fieldsToCompare) {
      const values: Record<string, unknown> = {};
      let foundCount = 0;

      for (const docType of docs) {
        const doc = input.documents[docType] as Record<string, unknown> | undefined;
        if (doc && doc[field] !== undefined) {
          values[docType] = doc[field];
          foundCount++;
        }
      }

      if (foundCount > 1) {
        totalChecks++;
        // Check if all values match
        const uniqueValues = new Set(Object.values(values).map(v => JSON.stringify(v)));
        if (uniqueValues.size === 1) {
          matchedFields++;
        } else {
          mismatchedFields++;
          const discrepancy: Discrepancy = {
            id: `disc_${field}_${Date.now()}`,
            severity: this.getSeverity(field),
            field,
            documents: Object.keys(values),
            values: values as Record<string, string | number>,
            description: `Mismatch in ${field}: ${Object.entries(values).map(([doc, val]) => `${doc}=${val}`).join(', ')}`,
            lcClauseReference: this.getLCClauseReference(field)
          };
          discrepancies.push(discrepancy);
        }
      }
    }

    return {
      discrepancies,
      totalChecks,
      matchedFields,
      mismatchedFields,
      complianceScore: totalChecks > 0 ? Math.round((matchedFields / totalChecks) * 100) : 100,
      validatedAt: new Date().toISOString()
    };
  }

  private getSeverity(field: string): 'critical' | 'major' | 'minor' {
    const criticalFields = ['buyer', 'seller', 'amount', 'currency'];
    const majorFields = ['shipmentDate', 'containerNumber', 'ports'];
    if (criticalFields.includes(field)) return 'critical';
    if (majorFields.includes(field)) return 'major';
    return 'minor';
  }

  private getLCClauseReference(field: string): string | undefined {
    const references: Record<string, string> = {
      buyer: 'Article 7 - Applicant',
      seller: 'Article 7 - Beneficiary',
      amount: 'Article 6 - Amount',
      currency: 'Article 6 - Currency',
      shipmentDate: 'Article 6 - Latest Shipment Date',
      ports: 'Article 23 - Ports of Loading/Discharge',
      goodsDescription: 'Article 23 - Goods Description'
    };
    return references[field];
  }
}
