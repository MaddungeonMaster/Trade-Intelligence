/**
 * Incoterms 2020 Resource
 * 
 * International Commercial Terms defining buyer/seller obligations,
 * risk transfer, and cost allocation.
 */

export interface IncotermsRule {
  code: string;
  name: string;
  description: string;
  buyerObligations: string[];
  sellerObligations: string[];
  riskTransferPoint: string;
  costAllocation: string;
  transportMode: string[];
}

export const INCOTERMS_2020: IncotermsRule[] = [
  {
    code: 'EXW',
    name: 'Ex Works',
    description: 'Seller makes goods available at their premises. Buyer bears all costs and risks.',
    buyerObligations: [
      'Arrange and pay for transport',
      'Arrange and pay for insurance',
      'Clear goods for export',
      'Clear goods for import',
      'Bear all costs and risks'
    ],
    sellerObligations: [
      'Make goods available at premises',
      'Provide commercial invoice',
      'Provide packing as agreed'
    ],
    riskTransferPoint: 'At seller\'s premises',
    costAllocation: 'Buyer pays all costs from seller\'s premises',
    transportMode: ['All modes']
  },
  {
    code: 'FCA',
    name: 'Free Carrier',
    description: 'Seller delivers goods to carrier at named place. Buyer arranges main transport.',
    buyerObligations: [
      'Arrange and pay for main transport',
      'Arrange and pay for insurance',
      'Clear goods for import',
      'Bear costs and risks after delivery to carrier'
    ],
    sellerObligations: [
      'Deliver goods to named carrier',
      'Clear goods for export',
      'Provide commercial invoice',
      'Provide packing'
    ],
    riskTransferPoint: 'When delivered to carrier',
    costAllocation: 'Seller pays to delivery point; buyer pays main transport',
    transportMode: ['All modes']
  },
  {
    code: 'CPT',
    name: 'Carriage Paid To',
    description: 'Seller pays for carriage to named destination. Buyer bears risk after delivery to carrier.',
    buyerObligations: [
      'Arrange and pay for insurance',
      'Clear goods for import',
      'Bear costs and risks after delivery to carrier'
    ],
    sellerObligations: [
      'Arrange and pay for carriage',
      'Clear goods for export',
      'Deliver goods to carrier',
      'Provide commercial invoice'
    ],
    riskTransferPoint: 'When delivered to carrier',
    costAllocation: 'Seller pays carriage; buyer pays insurance and import costs',
    transportMode: ['All modes']
  },
  {
    code: 'CIP',
    name: 'Carriage and Insurance Paid To',
    description: 'Seller pays for carriage and insurance to named destination.',
    buyerObligations: [
      'Clear goods for import',
      'Bear costs and risks after delivery to carrier'
    ],
    sellerObligations: [
      'Arrange and pay for carriage',
      'Arrange and pay for insurance',
      'Clear goods for export',
      'Deliver goods to carrier',
      'Provide commercial invoice'
    ],
    riskTransferPoint: 'When delivered to carrier',
    costAllocation: 'Seller pays carriage and insurance',
    transportMode: ['All modes']
  },
  {
    code: 'DAP',
    name: 'Delivered At Place',
    description: 'Seller delivers goods at named place. Buyer clears for import.',
    buyerObligations: [
      'Clear goods for import',
      'Unload goods',
      'Bear costs and risks after delivery'
    ],
    sellerObligations: [
      'Arrange and pay for transport',
      'Arrange and pay for insurance',
      'Clear goods for export',
      'Deliver goods at named place',
      'Provide commercial invoice'
    ],
    riskTransferPoint: 'When delivered at named place',
    costAllocation: 'Seller pays all costs to delivery point',
    transportMode: ['All modes']
  },
  {
    code: 'DPU',
    name: 'Delivered at Place Unloaded',
    description: 'Seller delivers and unloads goods at named place.',
    buyerObligations: [
      'Clear goods for import',
      'Bear costs and risks after unloading'
    ],
    sellerObligations: [
      'Arrange and pay for transport',
      'Arrange and pay for insurance',
      'Clear goods for export',
      'Deliver and unload goods',
      'Provide commercial invoice'
    ],
    riskTransferPoint: 'When unloaded at named place',
    costAllocation: 'Seller pays all costs including unloading',
    transportMode: ['All modes']
  },
  {
    code: 'DDP',
    name: 'Delivered Duty Paid',
    description: 'Seller delivers goods at named place, cleared for import, duties paid.',
    buyerObligations: [
      'Unload goods',
      'Bear costs and risks after delivery'
    ],
    sellerObligations: [
      'Arrange and pay for transport',
      'Arrange and pay for insurance',
      'Clear goods for export and import',
      'Pay import duties and taxes',
      'Deliver goods at named place',
      'Provide commercial invoice'
    ],
    riskTransferPoint: 'When delivered at named place',
    costAllocation: 'Seller pays all costs including import duties',
    transportMode: ['All modes']
  },
  {
    code: 'FOB',
    name: 'Free On Board',
    description: 'Seller delivers goods on board vessel. Buyer arranges main transport.',
    buyerObligations: [
      'Arrange and pay for main transport',
      'Arrange and pay for insurance',
      'Clear goods for import',
      'Bear costs and risks after goods on board'
    ],
    sellerObligations: [
      'Clear goods for export',
      'Deliver goods on board vessel',
      'Provide commercial invoice',
      'Provide packing'
    ],
    riskTransferPoint: 'When goods on board vessel',
    costAllocation: 'Seller pays to on-board; buyer pays main transport',
    transportMode: ['Sea transport']
  },
  {
    code: 'CFR',
    name: 'Cost and Freight',
    description: 'Seller pays for freight to named port. Buyer arranges insurance.',
    buyerObligations: [
      'Arrange and pay for insurance',
      'Clear goods for import',
      'Bear costs and risks after goods on board'
    ],
    sellerObligations: [
      'Clear goods for export',
      'Arrange and pay for freight',
      'Deliver goods on board vessel',
      'Provide commercial invoice'
    ],
    riskTransferPoint: 'When goods on board vessel',
    costAllocation: 'Seller pays freight; buyer pays insurance',
    transportMode: ['Sea transport']
  },
  {
    code: 'CIF',
    name: 'Cost, Insurance and Freight',
    description: 'Seller pays for freight and insurance to named port.',
    buyerObligations: [
      'Clear goods for import',
      'Bear costs and risks after goods on board'
    ],
    sellerObligations: [
      'Clear goods for export',
      'Arrange and pay for freight',
      'Arrange and pay for insurance',
      'Deliver goods on board vessel',
      'Provide commercial invoice'
    ],
    riskTransferPoint: 'When goods on board vessel',
    costAllocation: 'Seller pays freight and insurance',
    transportMode: ['Sea transport']
  }
];

export function getIncoterm(code: string): IncotermsRule | undefined {
  return INCOTERMS_2020.find(i => i.code.toUpperCase() === code.toUpperCase());
}

export function validateIncotermsConsistency(
  lcIncoterm: string,
  invoiceIncoterm: string,
  bolIncoterm?: string
): { consistent: boolean; issues: string[] } {
  const issues: string[] = [];

  if (lcIncoterm.toUpperCase() !== invoiceIncoterm.toUpperCase()) {
    issues.push(`Incoterm mismatch: LC specifies ${lcIncoterm}, Invoice specifies ${invoiceIncoterm}`);
  }

  if (bolIncoterm && lcIncoterm.toUpperCase() !== bolIncoterm.toUpperCase()) {
    issues.push(`Incoterm mismatch: LC specifies ${lcIncoterm}, BoL specifies ${bolIncoterm}`);
  }

  return {
    consistent: issues.length === 0,
    issues
  };
}
