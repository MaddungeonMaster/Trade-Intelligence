/**
 * Document Parser Tool
 * 
 * Extracts structured information from uploaded trade documents.
 * Normalizes all 7 document types into unified schema.
 */

import { ToolDecorator as Tool, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';
import {
  LetterOfCredit,
  CommercialInvoice,
  PurchaseOrder,
  PackingList,
  BillOfLading,
  CertificateOfOrigin,
  InsuranceCertificate,
  TradeTransaction
} from '../../../schemas/trade-documents.schema.js';

const DocumentParserInputSchema = z.object({
  documentType: z.enum(['LC', 'Invoice', 'PO', 'PackingList', 'BoL', 'CoO', 'Insurance']),
  documentContent: z.string().describe('Raw document text or JSON content'),
  transactionId: z.string().optional().describe('Transaction ID for grouping documents')
});

@Injectable()
export class DocumentParserTools {
  @Tool({
    name: 'document_parser',
    description: 'Extract structured information from trade documents (LC, Invoice, PO, BoL, CoO, Insurance, Packing List)',
    inputSchema: DocumentParserInputSchema,
    examples: {
      request: { documentType: 'LC', documentContent: 'LC Number: LC123456' },
      response: { success: true, documentType: 'LC', extractedData: {}, confidence: 85, warnings: [], extractedAt: '2024-01-01T00:00:00Z' }
    }
  })
  async parseDocument(
    input: z.infer<typeof DocumentParserInputSchema>,
    ctx: ExecutionContext
  ): Promise<Record<string, unknown>> {
    ctx.logger.info(`Parsing ${input.documentType} document`, { transactionId: input.transactionId });

    try {
      let extractedData: Record<string, unknown> = {};
      let confidence = 85;
      const warnings: string[] = [];

      // Parse based on document type
      switch (input.documentType) {
        case 'LC':
          extractedData = this.parseLetterOfCredit(input.documentContent);
          break;
        case 'Invoice':
          extractedData = this.parseCommercialInvoice(input.documentContent);
          break;
        case 'PO':
          extractedData = this.parsePurchaseOrder(input.documentContent);
          break;
        case 'PackingList':
          extractedData = this.parsePackingList(input.documentContent);
          break;
        case 'BoL':
          extractedData = this.parseBillOfLading(input.documentContent);
          break;
        case 'CoO':
          extractedData = this.parseCertificateOfOrigin(input.documentContent);
          break;
        case 'Insurance':
          extractedData = this.parseInsuranceCertificate(input.documentContent);
          break;
      }

      // Validate extracted data
      if (!extractedData || Object.keys(extractedData).length === 0) {
        confidence = 40;
        warnings.push('Could not extract structured data from document');
      }

      // Check for missing critical fields
      const criticalFields = this.getCriticalFields(input.documentType);
      const missingFields = criticalFields.filter(field => !extractedData[field]);
      if (missingFields.length > 0) {
        confidence -= missingFields.length * 5;
        warnings.push(`Missing critical fields: ${missingFields.join(', ')}`);
      }

      return {
        success: confidence > 50,
        documentType: input.documentType,
        extractedData,
        confidence: Math.max(0, Math.min(100, confidence)),
        warnings,
        extractedAt: new Date().toISOString()
      };
    } catch (error) {
      ctx.logger.error('Document parsing failed', { error: String(error) });
      return {
        success: false,
        documentType: input.documentType,
        extractedData: {},
        confidence: 0,
        warnings: [`Parsing error: ${String(error)}`],
        extractedAt: new Date().toISOString()
      };
    }
  }

  private parseLetterOfCredit(content: string): Record<string, unknown> {
    // Simulate LC parsing (in production, use OCR/NLP)
    const data: Partial<LetterOfCredit> = {};

    // Extract key fields using regex patterns
    const lcNumberMatch = content.match(/LC\s*(?:Number|No\.?)\s*[:=]?\s*([A-Z0-9\-\/]+)/i);
    if (lcNumberMatch) data.lcNumber = lcNumberMatch[1];

    const amountMatch = content.match(/Amount\s*[:=]?\s*([A-Z]{3})\s*([\d,]+\.?\d*)/i);
    if (amountMatch) {
      data.currency = amountMatch[1];
      data.amount = parseFloat(amountMatch[2].replace(/,/g, ''));
    }

    const expiryMatch = content.match(/Expiry\s*(?:Date)?\s*[:=]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
    if (expiryMatch) data.expiryDate = this.normalizeDate(expiryMatch[1]);

    const applicantMatch = content.match(/Applicant\s*[:=]?\s*([^\n]+)/i);
    if (applicantMatch) data.applicant = applicantMatch[1].trim();

    const beneficiaryMatch = content.match(/Beneficiary\s*[:=]?\s*([^\n]+)/i);
    if (beneficiaryMatch) data.beneficiary = beneficiaryMatch[1].trim();

    const incotermsMatch = content.match(/Incoterms?\s*[:=]?\s*(FOB|CIF|CIP|CPT|DAP|DPU|DDP|EXW|FCA)/i);
    if (incotermsMatch) data.incoterms = incotermsMatch[1];

    return data;
  }

  private parseCommercialInvoice(content: string): Record<string, unknown> {
    const data: Partial<CommercialInvoice> = {};

    const invoiceNumberMatch = content.match(/Invoice\s*(?:Number|No\.?)\s*[:=]?\s*([A-Z0-9\-\/]+)/i);
    if (invoiceNumberMatch) data.invoiceNumber = invoiceNumberMatch[1];

    const sellerMatch = content.match(/(?:Seller|Exporter|From)\s*[:=]?\s*([^\n]+)/i);
    if (sellerMatch) data.seller = sellerMatch[1].trim();

    const buyerMatch = content.match(/(?:Buyer|Importer|To|Bill To)\s*[:=]?\s*([^\n]+)/i);
    if (buyerMatch) data.buyer = buyerMatch[1].trim();

    const amountMatch = content.match(/(?:Total|Amount)\s*[:=]?\s*([A-Z]{3})\s*([\d,]+\.?\d*)/i);
    if (amountMatch) {
      data.currency = amountMatch[1];
      data.totalAmount = parseFloat(amountMatch[2].replace(/,/g, ''));
    }

    const dateMatch = content.match(/(?:Invoice\s+)?Date\s*[:=]?\s*(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/i);
    if (dateMatch) data.invoiceDate = this.normalizeDate(dateMatch[1]);

    return data;
  }

  private parsePurchaseOrder(content: string): Record<string, unknown> {
    const data: Partial<PurchaseOrder> = {};

    const poNumberMatch = content.match(/PO\s*(?:Number|No\.?)\s*[:=]?\s*([A-Z0-9\-\/]+)/i);
    if (poNumberMatch) data.poNumber = poNumberMatch[1];

    const buyerMatch = content.match(/(?:Buyer|Purchaser)\s*[:=]?\s*([^\n]+)/i);
    if (buyerMatch) data.buyer = buyerMatch[1].trim();

    const sellerMatch = content.match(/(?:Seller|Supplier|Vendor)\s*[:=]?\s*([^\n]+)/i);
    if (sellerMatch) data.seller = sellerMatch[1].trim();

    const amountMatch = content.match(/(?:Total|Amount)\s*[:=]?\s*([A-Z]{3})\s*([\d,]+\.?\d*)/i);
    if (amountMatch) {
      data.currency = amountMatch[1];
      data.totalAmount = parseFloat(amountMatch[2].replace(/,/g, ''));
    }

    return data;
  }

  private parsePackingList(content: string): Record<string, unknown> {
    const data: Partial<PackingList> = {};

    const plNumberMatch = content.match(/Packing\s*List\s*(?:Number|No\.?)\s*[:=]?\s*([A-Z0-9\-\/]+)/i);
    if (plNumberMatch) data.packingListNumber = plNumberMatch[1];

    const containerMatch = content.match(/Container\s*(?:Number|No\.?)\s*[:=]?\s*([A-Z0-9\-]+)/i);
    if (containerMatch) data.containerNumber = containerMatch[1];

    const weightMatch = content.match(/(?:Total\s+)?Weight\s*[:=]?\s*([\d,]+\.?\d*)\s*(?:kg|KG)/i);
    if (weightMatch) data.totalWeight = parseFloat(weightMatch[1].replace(/,/g, ''));

    return data;
  }

  private parseBillOfLading(content: string): Record<string, unknown> {
    const data: Partial<BillOfLading> = {};

    const bolNumberMatch = content.match(/B\/L\s*(?:Number|No\.?)\s*[:=]?\s*([A-Z0-9\-\/]+)/i);
    if (bolNumberMatch) data.bolNumber = bolNumberMatch[1];

    const containerMatch = content.match(/Container\s*(?:Number|No\.?)\s*[:=]?\s*([A-Z0-9\-]+)/i);
    if (containerMatch) data.containerNumber = containerMatch[1];

    const vesselMatch = content.match(/(?:Vessel|Ship)\s*(?:Name)?\s*[:=]?\s*([^\n]+)/i);
    if (vesselMatch) data.vesselName = vesselMatch[1].trim();

    const shipperMatch = content.match(/Shipper\s*[:=]?\s*([^\n]+)/i);
    if (shipperMatch) data.shipper = shipperMatch[1].trim();

    const consigneeMatch = content.match(/Consignee\s*[:=]?\s*([^\n]+)/i);
    if (consigneeMatch) data.consignee = consigneeMatch[1].trim();

    return data;
  }

  private parseCertificateOfOrigin(content: string): Record<string, unknown> {
    const data: Partial<CertificateOfOrigin> = {};

    const cooNumberMatch = content.match(/(?:Certificate\s+of\s+)?Origin\s*(?:Number|No\.?)\s*[:=]?\s*([A-Z0-9\-\/]+)/i);
    if (cooNumberMatch) data.cooNumber = cooNumberMatch[1];

    const countryMatch = content.match(/Country\s+of\s+Origin\s*[:=]?\s*([A-Z]{2}|[A-Za-z\s]+)/i);
    if (countryMatch) data.countryOfOrigin = countryMatch[1];

    const exporterMatch = content.match(/Exporter\s*[:=]?\s*([^\n]+)/i);
    if (exporterMatch) data.exporter = exporterMatch[1].trim();

    return data;
  }

  private parseInsuranceCertificate(content: string): Record<string, unknown> {
    const data: Partial<InsuranceCertificate> = {};

    const policyMatch = content.match(/Policy\s*(?:Number|No\.?)\s*[:=]?\s*([A-Z0-9\-\/]+)/i);
    if (policyMatch) data.policyNumber = policyMatch[1];

    const insurerMatch = content.match(/Insurer\s*[:=]?\s*([^\n]+)/i);
    if (insurerMatch) data.insurer = insurerMatch[1].trim();

    const coverageMatch = content.match(/Coverage\s*(?:Amount)?\s*[:=]?\s*([A-Z]{3})\s*([\d,]+\.?\d*)/i);
    if (coverageMatch) {
      data.currency = coverageMatch[1];
      data.coverageAmount = parseFloat(coverageMatch[2].replace(/,/g, ''));
    }

    const percentageMatch = content.match(/Coverage\s*(?:Percentage)?\s*[:=]?\s*(\d+)%/i);
    if (percentageMatch) data.coveragePercentage = parseInt(percentageMatch[1]);

    return data;
  }

  private getCriticalFields(documentType: string): string[] {
    const criticalFields: Record<string, string[]> = {
      LC: ['lcNumber', 'amount', 'currency', 'expiryDate', 'applicant', 'beneficiary'],
      Invoice: ['invoiceNumber', 'seller', 'buyer', 'totalAmount', 'currency'],
      PO: ['poNumber', 'buyer', 'seller', 'totalAmount', 'currency'],
      PackingList: ['packingListNumber', 'containerNumber', 'totalWeight'],
      BoL: ['bolNumber', 'containerNumber', 'vesselName', 'shipper', 'consignee'],
      CoO: ['cooNumber', 'countryOfOrigin', 'exporter'],
      Insurance: ['policyNumber', 'insurer', 'coverageAmount', 'currency']
    };
    return criticalFields[documentType] || [];
  }

  private normalizeDate(dateStr: string): string {
    // Convert various date formats to ISO 8601
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0];
  }
}
