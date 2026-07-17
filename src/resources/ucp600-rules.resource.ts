/**
 * UCP 600 Rules Resource
 * 
 * Uniform Customs and Practice for Documentary Credits (UCP 600)
 * Key articles and requirements for LC compliance validation.
 */

export interface UCP600Rule {
  article: string;
  title: string;
  description: string;
  requirements: string[];
  commonViolations: string[];
}

export const UCP600_RULES: UCP600Rule[] = [
  {
    article: 'Article 2',
    title: 'Scope',
    description: 'UCP 600 applies to all documentary credits when the credit expressly indicates that it is subject to these rules.',
    requirements: [
      'Credit must explicitly reference UCP 600',
      'All parties bound by UCP 600 terms'
    ],
    commonViolations: [
      'Credit does not reference UCP 600',
      'Parties dispute applicability'
    ]
  },
  {
    article: 'Article 5',
    title: 'Documents vs. Goods/Services',
    description: 'Banks deal with documents, not goods or services. A credit is not discharged by the delivery of goods or services.',
    requirements: [
      'Bank examines documents only',
      'Bank not responsible for goods quality',
      'Bank not responsible for services delivery'
    ],
    commonViolations: [
      'Bank held liable for defective goods',
      'Bank held liable for service quality'
    ]
  },
  {
    article: 'Article 6',
    title: 'Availability, Expiry Date and Place for Presentation',
    description: 'A credit must state how it is available and the latest date on which it may be utilized.',
    requirements: [
      'Expiry date clearly stated',
      'Place of presentation specified',
      'Availability terms unambiguous'
    ],
    commonViolations: [
      'No expiry date specified',
      'Ambiguous availability terms',
      'Presentation after expiry'
    ]
  },
  {
    article: 'Article 7',
    title: 'Issuing Bank Undertaking',
    description: 'The issuing bank undertakes to honor a complying presentation.',
    requirements: [
      'Issuing bank identified',
      'Bank undertaking unconditional',
      'Presentation must comply with LC terms'
    ],
    commonViolations: [
      'Issuing bank not clearly identified',
      'Conditional undertaking',
      'Non-complying presentation'
    ]
  },
  {
    article: 'Article 14',
    title: 'Standard for Examination of Documents',
    description: 'Banks must examine documents with reasonable care to determine, on the basis of the documents alone, whether or not they appear on their face to be in compliance with the terms and conditions of the credit.',
    requirements: [
      'Reasonable care standard applied',
      'Examination based on documents alone',
      'Compliance determined from face of documents',
      'Discrepancies identified and reported'
    ],
    commonViolations: [
      'Discrepancies not identified',
      'Examination based on external knowledge',
      'Unreasonable rejection of complying documents'
    ]
  },
  {
    article: 'Article 15',
    title: 'Complying Presentation',
    description: 'A presentation is complying when it conforms to the terms and conditions of the credit, the applicable provisions of these rules and international standard banking practice.',
    requirements: [
      'All required documents presented',
      'Documents conform to LC terms',
      'No discrepancies on face of documents',
      'Presentation within expiry date'
    ],
    commonViolations: [
      'Missing required documents',
      'Documents do not conform to terms',
      'Discrepancies present',
      'Presentation after expiry'
    ]
  },
  {
    article: 'Article 16',
    title: 'Discrepancies',
    description: 'If a presentation does not comply, the issuing bank and confirming bank, if any, shall each have the right to refuse to honor or negotiate.',
    requirements: [
      'Discrepancies must be identified',
      'Discrepancies must be reported to applicant',
      'Applicant may waive discrepancies',
      'Bank may refuse payment if discrepancies exist'
    ],
    commonViolations: [
      'Discrepancies not reported',
      'Bank honors despite discrepancies',
      'Discrepancies waived without applicant consent'
    ]
  },
  {
    article: 'Article 19',
    title: 'Partial Shipments',
    description: 'Partial shipments are allowed unless the credit prohibits them.',
    requirements: [
      'LC terms specify if partial shipments allowed',
      'Each partial shipment within expiry date',
      'Total quantity matches LC amount'
    ],
    commonViolations: [
      'Partial shipment when prohibited',
      'Partial shipment after expiry',
      'Total quantity exceeds LC amount'
    ]
  },
  {
    article: 'Article 20',
    title: 'Transhipment',
    description: 'Transhipment is allowed unless the credit prohibits it.',
    requirements: [
      'LC terms specify if transhipment allowed',
      'Transhipment documented in BoL',
      'Final destination matches LC terms'
    ],
    commonViolations: [
      'Transhipment when prohibited',
      'Transhipment not documented',
      'Final destination differs from LC'
    ]
  },
  {
    article: 'Article 21',
    title: 'Insurance Document',
    description: 'An insurance document must appear to be issued and signed by an insurance company, underwriter or their agent.',
    requirements: [
      'Insurance document issued by authorized party',
      'Coverage amount meets LC requirement',
      'Coverage period includes shipment date',
      'Policy covers specified risks'
    ],
    commonViolations: [
      'Insurance issued by unauthorized party',
      'Coverage amount insufficient',
      'Coverage period does not include shipment',
      'Policy does not cover specified risks'
    ]
  },
  {
    article: 'Article 23',
    title: 'Bill of Lading',
    description: 'A bill of lading must appear to indicate that the goods described therein have been loaded on board, or shipped on, a named vessel.',
    requirements: [
      'BoL indicates goods loaded on board',
      'Vessel name specified',
      'Ports of loading and discharge specified',
      'Date of shipment specified',
      'BoL signed by carrier or agent'
    ],
    commonViolations: [
      'BoL does not indicate on-board loading',
      'Vessel name missing',
      'Ports not specified',
      'Shipment date missing',
      'BoL not signed'
    ]
  },
  {
    article: 'Article 24',
    title: 'Non-Negotiable Sea Waybill',
    description: 'A non-negotiable sea waybill must appear to indicate that the goods described therein have been shipped on a named vessel.',
    requirements: [
      'Waybill indicates goods shipped',
      'Vessel name specified',
      'Ports specified',
      'Shipment date specified'
    ],
    commonViolations: [
      'Waybill does not indicate shipment',
      'Vessel name missing',
      'Ports not specified',
      'Shipment date missing'
    ]
  },
  {
    article: 'Article 25',
    title: 'Air Transport Document',
    description: 'An air transport document must appear to indicate that the goods described therein have been accepted for carriage.',
    requirements: [
      'Document indicates goods accepted for carriage',
      'Airline name specified',
      'Airports of departure and destination specified',
      'Date of shipment specified'
    ],
    commonViolations: [
      'Document does not indicate acceptance',
      'Airline name missing',
      'Airports not specified',
      'Shipment date missing'
    ]
  },
  {
    article: 'Article 26',
    title: 'Road, Rail or Inland Waterway Transport Document',
    description: 'A road, rail or inland waterway transport document must appear to indicate that the goods described therein have been accepted for carriage.',
    requirements: [
      'Document indicates goods accepted',
      'Carrier name specified',
      'Place of acceptance and destination specified',
      'Date of shipment specified'
    ],
    commonViolations: [
      'Document does not indicate acceptance',
      'Carrier name missing',
      'Places not specified',
      'Shipment date missing'
    ]
  },
  {
    article: 'Article 28',
    title: 'Certificate of Origin',
    description: 'A certificate of origin must appear to be issued and signed by the shipper or the issuing body.',
    requirements: [
      'Certificate issued by authorized body',
      'Country of origin specified',
      'Goods description matches invoice',
      'Certificate signed'
    ],
    commonViolations: [
      'Certificate issued by unauthorized body',
      'Country of origin missing',
      'Goods description mismatch',
      'Certificate not signed'
    ]
  },
  {
    article: 'Article 29',
    title: 'Inspection Document',
    description: 'An inspection document must appear to be issued and signed by the inspection body.',
    requirements: [
      'Document issued by authorized inspection body',
      'Inspection date specified',
      'Goods description matches invoice',
      'Inspection results documented'
    ],
    commonViolations: [
      'Document issued by unauthorized body',
      'Inspection date missing',
      'Goods description mismatch',
      'Results not documented'
    ]
  },
  {
    article: 'Article 30',
    title: 'Other Documents',
    description: 'Any other document required by the credit must appear to be issued and signed by the party specified in the credit.',
    requirements: [
      'Document issued by specified party',
      'Document signed',
      'Content matches LC requirements'
    ],
    commonViolations: [
      'Document issued by wrong party',
      'Document not signed',
      'Content does not match requirements'
    ]
  }
];

export function getUCP600Rule(article: string): UCP600Rule | undefined {
  return UCP600_RULES.find(r => r.article.toLowerCase() === article.toLowerCase());
}

export function validateUCP600Compliance(
  lcTerms: Record<string, unknown>,
  documents: Record<string, unknown>
): { compliant: boolean; violations: string[] } {
  const violations: string[] = [];

  // Check expiry date
  if (lcTerms.expiryDate && documents.presentationDate) {
    const expiry = new Date(lcTerms.expiryDate as string);
    const presentation = new Date(documents.presentationDate as string);
    if (presentation > expiry) {
      violations.push('Presentation after LC expiry date (Article 6)');
    }
  }

  // Check required documents
  if (lcTerms.requiredDocuments && Array.isArray(lcTerms.requiredDocuments)) {
    const required = lcTerms.requiredDocuments as string[];
    const provided = Object.keys(documents);
    const missing = required.filter(doc => !provided.includes(doc));
    if (missing.length > 0) {
      violations.push(`Missing required documents: ${missing.join(', ')} (Article 15)`);
    }
  }

  return {
    compliant: violations.length === 0,
    violations
  };
}
