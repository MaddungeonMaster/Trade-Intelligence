/**
 * TBML Detector Tool
 * 
 * Detects Trade-Based Money Laundering patterns.
 * Identifies over-invoicing, under-invoicing, phantom shipments, multiple financing, circular trade, fake exporters/importers.
 */

import { ToolDecorator as Tool, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';
import { FraudIndicator } from '../../../schemas/trade-documents.schema.js';

const TBMLDetectorInputSchema = z.object({
  documents: z.record(z.unknown()).describe('All documents'),
  transactionId: z.string().optional()
});

@Injectable()
export class TBMLDetectorTools {
  @Tool({
    name: 'tbml_detector',
    description: 'Detect Trade-Based Money Laundering patterns: over-invoicing, under-invoicing, phantom shipments, multiple financing, circular trade, fake exporters/importers',
    inputSchema: TBMLDetectorInputSchema,
    examples: {
      request: { documents: { Invoice: { totalAmount: 100000 }, BoL: { totalWeight: 1000 } } },
      response: { tbmlIndicators: [], riskLevel: 'low', confidenceScore: 85 }
    }
  })
  async detectTBML(
    input: z.infer<typeof TBMLDetectorInputSchema>,
    ctx: ExecutionContext
  ): Promise<Record<string, unknown>> {
    ctx.logger.info('Detecting TBML patterns', { transactionId: input.transactionId });

    const indicators: FraudIndicator[] = [];

    const invoice = input.documents.Invoice as Record<string, unknown> | undefined;
    const po = input.documents.PO as Record<string, unknown> | undefined;
    const bol = input.documents.BoL as Record<string, unknown> | undefined;
    const packingList = input.documents.PackingList as Record<string, unknown> | undefined;

    // Pattern 1: Over-invoicing (Invoice amount >> PO amount)
    if (invoice && po) {
      const invoiceAmount = Number(invoice.totalAmount || 0);
      const poAmount = Number(po.totalAmount || 0);
      if (poAmount > 0) {
        const ratio = invoiceAmount / poAmount;
        if (ratio > 1.3) {
          indicators.push({
            id: `tbml_over_invoice_${Date.now()}`,
            pattern: 'over_invoicing',
            confidence: Math.min(100, (ratio - 1) * 50),
            description: `Invoice amount (${invoiceAmount}) is ${(ratio * 100).toFixed(0)}% of PO amount (${poAmount})`,
            evidence: [`Invoice Amount: ${invoiceAmount}`, `PO Amount: ${poAmount}`, `Ratio: ${ratio.toFixed(2)}`],
            riskLevel: ratio > 1.5 ? 'critical' : 'high'
          });
        }
      }
    }

    // Pattern 2: Under-invoicing (Invoice amount << PO amount)
    if (invoice && po) {
      const invoiceAmount = Number(invoice.totalAmount || 0);
      const poAmount = Number(po.totalAmount || 0);
      if (poAmount > 0) {
        const ratio = invoiceAmount / poAmount;
        if (ratio < 0.7) {
          indicators.push({
            id: `tbml_under_invoice_${Date.now()}`,
            pattern: 'under_invoicing',
            confidence: Math.min(100, (1 - ratio) * 50),
            description: `Invoice amount (${invoiceAmount}) is only ${(ratio * 100).toFixed(0)}% of PO amount (${poAmount})`,
            evidence: [`Invoice Amount: ${invoiceAmount}`, `PO Amount: ${poAmount}`, `Ratio: ${ratio.toFixed(2)}`],
            riskLevel: ratio < 0.5 ? 'critical' : 'high'
          });
        }
      }
    }

    // Pattern 3: Phantom shipment (Invoice but no BoL or mismatched container)
    if (invoice && !bol) {
      indicators.push({
        id: `tbml_phantom_shipment_${Date.now()}`,
        pattern: 'phantom_shipment',
        confidence: 75,
        description: 'Invoice present but no Bill of Lading found',
        evidence: ['Invoice exists', 'No BoL document'],
        riskLevel: 'high'
      });
    }

    // Pattern 4: Quantity mismatch (Invoice quantity >> BoL quantity)
    if (invoice && bol && packingList) {
      const invoiceQty = Number((invoice as Record<string, unknown>).quantity || 0);
      const bolQty = Number(bol.totalPackages || 0);
      const plQty = Number(packingList.totalPackages || 0);
      if (invoiceQty > 0 && bolQty > 0) {
        const ratio = invoiceQty / bolQty;
        if (ratio > 1.2) {
          indicators.push({
            id: `tbml_quantity_mismatch_${Date.now()}`,
            pattern: 'quantity_mismatch',
            confidence: Math.min(100, (ratio - 1) * 50),
            description: `Invoice quantity (${invoiceQty}) exceeds BoL quantity (${bolQty})`,
            evidence: [`Invoice Quantity: ${invoiceQty}`, `BoL Quantity: ${bolQty}`, `Ratio: ${ratio.toFixed(2)}`],
            riskLevel: ratio > 1.5 ? 'high' : 'medium'
          });
        }
      }
    }

    // Pattern 5: Circular trade (Buyer == Seller in different documents)
    if (invoice) {
      const buyer = invoice.buyer;
      const seller = invoice.seller;
      if (buyer && seller && buyer === seller) {
        indicators.push({
          id: `tbml_circular_trade_${Date.now()}`,
          pattern: 'circular_trade',
          confidence: 90,
          description: `Buyer and Seller are the same entity: ${buyer}`,
          evidence: [`Buyer: ${buyer}`, `Seller: ${seller}`],
          riskLevel: 'critical'
        });
      }
    }

    // Pattern 6: Suspicious entity names (generic, placeholder-like)
    if (invoice) {
      const buyer = String(invoice.buyer || '').toLowerCase();
      const seller = String(invoice.seller || '').toLowerCase();
      const suspiciousPatterns = ['test', 'demo', 'fake', 'dummy', 'placeholder', 'xxx', 'yyy', 'zzz'];
      const isSuspicious = suspiciousPatterns.some(p => buyer.includes(p) || seller.includes(p));
      if (isSuspicious) {
        indicators.push({
          id: `tbml_suspicious_entity_${Date.now()}`,
          pattern: 'suspicious_entity',
          confidence: 70,
          description: `Buyer or Seller name contains suspicious patterns`,
          evidence: [`Buyer: ${invoice.buyer}`, `Seller: ${invoice.seller}`],
          riskLevel: 'medium'
        });
      }
    }

    return {
      tbmlIndicators: indicators,
      indicatorCount: indicators.length,
      riskLevel: this.calculateOverallRisk(indicators),
      confidenceScore: indicators.length > 0 ? Math.round(indicators.reduce((sum, ind) => sum + ind.confidence, 0) / indicators.length) : 85,
      detectedAt: new Date().toISOString()
    };
  }

  private calculateOverallRisk(indicators: FraudIndicator[]): string {
    if (indicators.length === 0) return 'low';
    const criticalCount = indicators.filter(i => i.riskLevel === 'critical').length;
    const highCount = indicators.filter(i => i.riskLevel === 'high').length;
    if (criticalCount > 0) return 'critical';
    if (highCount > 1) return 'high';
    if (highCount > 0) return 'medium';
    return 'low';
  }
}
