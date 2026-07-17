/**
 * Trade Finance Document Schemas
 * 
 * Unified TypeScript interfaces for all trade documents.
 * Used by document_parser to normalize extracted data.
 */

export interface LetterOfCredit {
  lcNumber: string;
  issueDate: string; // ISO 8601
  expiryDate: string; // ISO 8601
  issuingBank: string;
  advisingBank?: string;
  applicant: string; // Buyer
  beneficiary: string; // Seller
  amount: number;
  currency: string; // ISO 4217 code
  incoterms: string; // FOB, CIF, DDP, etc.
  requiredDocuments: string[]; // e.g., ["Invoice", "BoL", "CoO"]
  requiredSignatures: string[]; // e.g., ["Beneficiary", "Shipper"]
  insuranceRequired: boolean;
  insurancePercentage?: number; // e.g., 110
  latestShipmentDate: string; // ISO 8601
  goodsDescription: string;
  ports: {
    loading: string;
    discharge: string;
  };
  specialConditions?: string[];
  clauses?: string[]; // e.g., ["Article 14: Discrepancies"]
}

export interface CommercialInvoice {
  invoiceNumber: string;
  invoiceDate: string; // ISO 8601
  seller: string;
  buyer: string;
  currency: string; // ISO 4217 code
  totalAmount: number;
  items: InvoiceLineItem[];
  shipmentDate: string; // ISO 8601
  ports: {
    loading: string;
    discharge: string;
  };
  incoterms: string;
  containerNumber?: string;
  goodsDescription: string;
  paymentTerms?: string;
  sellerSignature?: boolean;
}

export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unit: string; // e.g., "pcs", "kg", "m3"
  unitPrice: number;
  totalPrice: number;
  hsCode?: string; // Harmonized System code
}

export interface PurchaseOrder {
  poNumber: string;
  poDate: string; // ISO 8601
  buyer: string;
  seller: string;
  currency: string; // ISO 4217 code
  totalAmount: number;
  items: POLineItem[];
  deliveryDate: string; // ISO 8601
  incoterms: string;
  ports: {
    loading: string;
    discharge: string;
  };
  goodsDescription: string;
}

export interface POLineItem {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  hsCode?: string;
}

export interface PackingList {
  packingListNumber: string;
  packingListDate: string; // ISO 8601
  seller: string;
  buyer: string;
  containerNumber: string;
  totalPackages: number;
  totalWeight: number; // kg
  totalVolume: number; // m3
  items: PackingListItem[];
  shipmentDate: string; // ISO 8601
  ports: {
    loading: string;
    discharge: string;
  };
}

export interface PackingListItem {
  description: string;
  quantity: number;
  unit: string;
  weight: number; // kg
  volume: number; // m3
  hsCode?: string;
}

export interface BillOfLading {
  bolNumber: string;
  bolDate: string; // ISO 8601
  shipper: string; // Seller
  consignee: string; // Buyer
  notifyParty?: string;
  containerNumber: string;
  vesselName: string;
  voyageNumber: string;
  shippingCompany: string;
  ports: {
    loading: string;
    discharge: string;
  };
  shipmentDate: string; // ISO 8601
  estimatedArrival: string; // ISO 8601
  totalPackages: number;
  totalWeight: number; // kg
  totalVolume: number; // m3
  goodsDescription: string;
  freightCharges?: number;
  currency?: string;
  bolType: 'original' | 'copy' | 'telex'; // BoL type
  shipper_signature?: boolean;
  carrier_signature?: boolean;
}

export interface CertificateOfOrigin {
  cooNumber: string;
  cooDate: string; // ISO 8601
  exporter: string; // Seller
  importer: string; // Buyer
  countryOfOrigin: string; // ISO 3166-1 alpha-2
  items: COOLineItem[];
  totalAmount: number;
  currency: string;
  certifyingBody?: string; // e.g., "Chamber of Commerce"
  certifier_signature?: boolean;
}

export interface COOLineItem {
  description: string;
  quantity: number;
  unit: string;
  hsCode?: string;
  countryOfOrigin: string;
}

export interface InsuranceCertificate {
  policyNumber: string;
  policyDate: string; // ISO 8601
  expiryDate: string; // ISO 8601
  insurer: string;
  insured: string; // Buyer or Seller
  coverageAmount: number;
  currency: string;
  coveragePercentage: number; // e.g., 110
  goodsDescription: string;
  containerNumber?: string;
  ports: {
    loading: string;
    discharge: string;
  };
  shipmentDate: string; // ISO 8601
  estimatedArrival: string; // ISO 8601
  riskType: string; // e.g., "All Risks", "Named Perils"
  issuer_signature?: boolean;
}

/**
 * Unified Transaction Schema
 * Aggregates all documents for multi-document reasoning
 */
export interface TradeTransaction {
  transactionId: string;
  createdAt: string; // ISO 8601
  documents: {
    letterOfCredit?: LetterOfCredit;
    commercialInvoice?: CommercialInvoice;
    purchaseOrder?: PurchaseOrder;
    packingList?: PackingList;
    billOfLading?: BillOfLading;
    certificateOfOrigin?: CertificateOfOrigin;
    insuranceCertificate?: InsuranceCertificate;
  };
  metadata: {
    uploadedBy?: string;
    uploadedAt?: string;
    documentCount: number;
    completeness: number; // 0-100: % of expected documents present
  };
}

/**
 * Discrepancy Record
 * Captures mismatches between documents
 */
export interface Discrepancy {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  field: string;
  documents: string[]; // e.g., ["Invoice", "BoL"]
  values: Record<string, string | number>;
  description: string;
  lcClauseReference?: string;
}

/**
 * Compliance Finding
 * Records violations of LC terms or trade rules
 */
export interface ComplianceFinding {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  rule: string; // e.g., "UCP 600 Article 14"
  violated: boolean;
  description: string;
  evidence: string[];
  recommendedAction?: string;
}

/**
 * Fraud Indicator
 * TBML pattern detection result
 */
export interface FraudIndicator {
  id: string;
  pattern: string; // e.g., "over_invoicing", "phantom_shipment"
  confidence: number; // 0-100
  description: string;
  evidence: string[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * Risk Assessment
 * Multi-dimensional risk scoring
 */
export interface RiskAssessment {
  countryRisk: number; // 0-100
  commodityRisk: number; // 0-100
  complianceRisk: number; // 0-100
  fraudRisk: number; // 0-100
  shipmentRisk: number; // 0-100
  overallRisk: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  breakdown: {
    countryRiskFactors: string[];
    commodityRiskFactors: string[];
    complianceRiskFactors: string[];
    fraudRiskFactors: string[];
    shipmentRiskFactors: string[];
  };
}

/**
 * Decision Report
 * Final recommendation with full audit trail
 */
export interface DecisionReport {
  transactionId: string;
  decision: 'APPROVE' | 'REJECT' | 'MANUAL_REVIEW';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  detectedIssues: string[];
  complianceViolations: ComplianceFinding[];
  fraudIndicators: FraudIndicator[];
  evidence: {
    supportingDocuments: string[];
    rulesCited: string[];
    discrepancies: Discrepancy[];
  };
  recommendedActions: string[];
  confidenceScore: number; // 0-100
  generatedAt: string; // ISO 8601
  generatedBy: string; // Tool name
}
