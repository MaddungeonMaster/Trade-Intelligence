/**
 * Trade Finance Module
 * 
 * Orchestrates all trade compliance and fraud detection tools.
 */

import { Module } from '@nitrostack/core';
import { DocumentParserTools } from './tools/document-parser.tools.js';
import { CrossDocumentValidatorTools } from './tools/cross-document-validator.tools.js';
import { LCComplianceCheckerTools } from './tools/lc-compliance-checker.tools.js';
import { ShipmentValidatorTools } from './tools/shipment-validator.tools.js';
import { InsuranceValidatorTools } from './tools/insurance-validator.tools.js';
import { SanctionsCheckerTools } from './tools/sanctions-checker.tools.js';
import { DuplicateFinancingDetectorTools } from './tools/duplicate-financing-detector.tools.js';
import { TBMLDetectorTools } from './tools/tbml-detector.tools.js';
import { RiskEngineTools } from './tools/risk-engine.tools.js';
import { DecisionEngineTools } from './tools/decision-engine.tools.js';

@Module({
  name: 'trade-finance',
  description: 'Trade Finance Compliance and Fraud Investigation',
  controllers: [
    DocumentParserTools,
    CrossDocumentValidatorTools,
    LCComplianceCheckerTools,
    ShipmentValidatorTools,
    InsuranceValidatorTools,
    SanctionsCheckerTools,
    DuplicateFinancingDetectorTools,
    TBMLDetectorTools,
    RiskEngineTools,
    DecisionEngineTools
  ]
})
export class TradeFinanceModule { }
