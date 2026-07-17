/**
 * Duplicate Financing Detector Tool
 * 
 * Detects duplicate invoices, BoLs, containers, and shipments.
 */

import { ToolDecorator as Tool, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';
import crypto from 'crypto';

const DuplicateFinancingDetectorInputSchema = z.object({
  documents: z.record(z.unknown()).describe('All documents'),
  historicalTransactions: z.array(z.record(z.unknown())).optional().describe('Historical transactions for comparison'),
  transactionId: z.string().optional()
});

@Injectable()
export class DuplicateFinancingDetectorTools {
  @Tool({
    name: 'duplicate_financing_detector',
    description: 'Detect duplicate invoices, Bills of Lading, containers, and shipments',
    inputSchema: DuplicateFinancingDetectorInputSchema,
    examples: {
      request: { documents: { Invoice: { invoiceNumber: 'INV001' }, BoL: { bolNumber: 'BOL001' } } },
      response: { duplicatesFound: false, duplicates: [], checksPerformed: 4 }
    }
  })
  async detectDuplicates(
    input: z.infer<typeof DuplicateFinancingDetectorInputSchema>,
    ctx: ExecutionContext
  ): Promise<Record<string, unknown>> {
    ctx.logger.info('Detecting duplicate financing', { transactionId: input.transactionId });

    const duplicates: Array<{ type: string; evidence: string[] }> = [];
    let checksPerformed = 0;

    const invoice = input.documents.Invoice as Record<string, unknown> | undefined;
    const bol = input.documents.BoL as Record<string, unknown> | undefined;
    const packingList = input.documents.PackingList as Record<string, unknown> | undefined;

    // Check 1: Duplicate invoices
    checksPerformed++;
    if (invoice?.invoiceNumber && input.historicalTransactions) {
      const invoiceHash = this.hashObject(invoice);
      const duplicateInvoices = input.historicalTransactions.filter(tx => {
        const txInvoice = tx.Invoice as Record<string, unknown> | undefined;
        return txInvoice && this.hashObject(txInvoice) === invoiceHash;
      });
      if (duplicateInvoices.length > 0) {
        duplicates.push({
          type: 'duplicate_invoice',
          evidence: [`Invoice ${invoice.invoiceNumber} matches ${duplicateInvoices.length} historical transaction(s)`]
        });
      }
    }

    // Check 2: Duplicate BoLs
    checksPerformed++;
    if (bol?.bolNumber && input.historicalTransactions) {
      const bolHash = this.hashObject(bol);
      const duplicateBols = input.historicalTransactions.filter(tx => {
        const txBol = tx.BoL as Record<string, unknown> | undefined;
        return txBol && this.hashObject(txBol) === bolHash;
      });
      if (duplicateBols.length > 0) {
        duplicates.push({
          type: 'duplicate_bol',
          evidence: [`BoL ${bol.bolNumber} matches ${duplicateBols.length} historical transaction(s)`]
        });
      }
    }

    // Check 3: Duplicate containers
    checksPerformed++;
    if (bol?.containerNumber && input.historicalTransactions) {
      const containerMatches = input.historicalTransactions.filter(tx => {
        const txBol = tx.BoL as Record<string, unknown> | undefined;
        return txBol?.containerNumber === bol.containerNumber;
      });
      if (containerMatches.length > 0) {
        duplicates.push({
          type: 'duplicate_container',
          evidence: [`Container ${bol.containerNumber} used in ${containerMatches.length} historical transaction(s)`]
        });
      }
    }

    // Check 4: Duplicate shipments (same buyer, seller, amount, date)
    checksPerformed++;
    if (invoice && input.historicalTransactions) {
      const shipmentHash = this.hashObject({
        buyer: invoice.buyer,
        seller: invoice.seller,
        amount: invoice.totalAmount,
        date: invoice.invoiceDate
      });
      const duplicateShipments = input.historicalTransactions.filter(tx => {
        const txInvoice = tx.Invoice as Record<string, unknown> | undefined;
        if (!txInvoice) return false;
        const txHash = this.hashObject({
          buyer: txInvoice.buyer,
          seller: txInvoice.seller,
          amount: txInvoice.totalAmount,
          date: txInvoice.invoiceDate
        });
        return txHash === shipmentHash;
      });
      if (duplicateShipments.length > 0) {
        duplicates.push({
          type: 'duplicate_shipment',
          evidence: [`Shipment matches ${duplicateShipments.length} historical transaction(s) with same buyer, seller, amount, and date`]
        });
      }
    }

    return {
      duplicatesFound: duplicates.length > 0,
      duplicates,
      checksPerformed,
      riskLevel: duplicates.length > 0 ? 'high' : 'low',
      detectedAt: new Date().toISOString()
    };
  }

  private hashObject(obj: unknown): string {
    const json = JSON.stringify(obj);
    return crypto.createHash('sha256').update(json).digest('hex');
  }
}
