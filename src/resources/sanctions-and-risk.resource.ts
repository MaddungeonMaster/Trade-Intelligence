/**
 * Sanctions Lists and Risk Matrices Resource
 * 
 * OFAC, UN, EU sanctions entities and country/commodity risk scoring.
 */

export interface SanctionedEntity {
  name: string;
  type: 'individual' | 'company' | 'country';
  sanctionProgram: string; // e.g., "OFAC SDN", "UN", "EU"
  country?: string;
  aliases?: string[];
  dateAdded: string;
}

export interface CountryRiskProfile {
  countryCode: string; // ISO 3166-1 alpha-2
  countryName: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  sanctions: boolean;
  aml_cft_risk: boolean; // Anti-Money Laundering / Counter-Terrorist Financing
  politically_exposed: boolean;
}

export interface CommodityRiskProfile {
  hsCode: string; // Harmonized System code
  description: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
  requiresLicense: boolean;
  restrictedCountries?: string[];
}

// Simplified OFAC SDN-like list (sample data)
export const SANCTIONED_ENTITIES: SanctionedEntity[] = [
  {
    name: 'North Korea',
    type: 'country',
    sanctionProgram: 'OFAC DPRK',
    country: 'KP',
    dateAdded: '2006-01-01'
  },
  {
    name: 'Iran',
    type: 'country',
    sanctionProgram: 'OFAC Iran',
    country: 'IR',
    dateAdded: '1995-01-01'
  },
  {
    name: 'Syria',
    type: 'country',
    sanctionProgram: 'OFAC Syria',
    country: 'SY',
    dateAdded: '2011-01-01'
  },
  {
    name: 'Cuba',
    type: 'country',
    sanctionProgram: 'OFAC Cuba',
    country: 'CU',
    dateAdded: '1962-01-01'
  },
  {
    name: 'Crimea',
    type: 'country',
    sanctionProgram: 'OFAC Crimea',
    country: 'UA',
    dateAdded: '2014-01-01'
  },
  {
    name: 'Russian Federation',
    type: 'country',
    sanctionProgram: 'OFAC Russia',
    country: 'RU',
    dateAdded: '2022-02-01'
  }
];

// Country Risk Profiles (sample data)
export const COUNTRY_RISK_PROFILES: CountryRiskProfile[] = [
  {
    countryCode: 'US',
    countryName: 'United States',
    riskScore: 10,
    riskLevel: 'low',
    factors: ['Stable regulatory environment', 'Strong AML/CFT framework'],
    sanctions: false,
    aml_cft_risk: false,
    politically_exposed: false
  },
  {
    countryCode: 'GB',
    countryName: 'United Kingdom',
    riskScore: 15,
    riskLevel: 'low',
    factors: ['Stable regulatory environment', 'Strong AML/CFT framework'],
    sanctions: false,
    aml_cft_risk: false,
    politically_exposed: false
  },
  {
    countryCode: 'DE',
    countryName: 'Germany',
    riskScore: 12,
    riskLevel: 'low',
    factors: ['Stable regulatory environment', 'Strong AML/CFT framework'],
    sanctions: false,
    aml_cft_risk: false,
    politically_exposed: false
  },
  {
    countryCode: 'CN',
    countryName: 'China',
    riskScore: 45,
    riskLevel: 'medium',
    factors: ['Emerging market volatility', 'Moderate AML/CFT framework', 'Trade friction'],
    sanctions: false,
    aml_cft_risk: true,
    politically_exposed: false
  },
  {
    countryCode: 'IN',
    countryName: 'India',
    riskScore: 50,
    riskLevel: 'medium',
    factors: ['Emerging market volatility', 'Moderate AML/CFT framework'],
    sanctions: false,
    aml_cft_risk: true,
    politically_exposed: false
  },
  {
    countryCode: 'RU',
    countryName: 'Russian Federation',
    riskScore: 85,
    riskLevel: 'critical',
    factors: ['Sanctions regime', 'Geopolitical tensions', 'Weak AML/CFT framework'],
    sanctions: true,
    aml_cft_risk: true,
    politically_exposed: true
  },
  {
    countryCode: 'IR',
    countryName: 'Iran',
    riskScore: 95,
    riskLevel: 'critical',
    factors: ['Comprehensive sanctions', 'Terrorism financing risk', 'Weak AML/CFT framework'],
    sanctions: true,
    aml_cft_risk: true,
    politically_exposed: true
  },
  {
    countryCode: 'KP',
    countryName: 'North Korea',
    riskScore: 100,
    riskLevel: 'critical',
    factors: ['Comprehensive sanctions', 'Terrorism financing risk', 'Weak AML/CFT framework'],
    sanctions: true,
    aml_cft_risk: true,
    politically_exposed: true
  },
  {
    countryCode: 'SY',
    countryName: 'Syria',
    riskScore: 90,
    riskLevel: 'critical',
    factors: ['Sanctions regime', 'Terrorism financing risk', 'Weak AML/CFT framework'],
    sanctions: true,
    aml_cft_risk: true,
    politically_exposed: true
  },
  {
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    riskScore: 35,
    riskLevel: 'medium',
    factors: ['Re-export hub', 'Moderate AML/CFT framework', 'Trade finance hub'],
    sanctions: false,
    aml_cft_risk: true,
    politically_exposed: false
  },
  {
    countryCode: 'SG',
    countryName: 'Singapore',
    riskScore: 20,
    riskLevel: 'low',
    factors: ['Strong regulatory environment', 'Strong AML/CFT framework'],
    sanctions: false,
    aml_cft_risk: false,
    politically_exposed: false
  },
  {
    countryCode: 'HK',
    countryName: 'Hong Kong',
    riskScore: 40,
    riskLevel: 'medium',
    factors: ['Trade finance hub', 'Moderate AML/CFT framework', 'Geopolitical tensions'],
    sanctions: false,
    aml_cft_risk: true,
    politically_exposed: false
  }
];

// Commodity Risk Profiles (sample data)
export const COMMODITY_RISK_PROFILES: CommodityRiskProfile[] = [
  {
    hsCode: '7108',
    description: 'Gold (including gold plated with platinum)',
    riskScore: 70,
    riskLevel: 'high',
    factors: ['High value', 'Money laundering risk', 'Conflict minerals risk'],
    requiresLicense: true,
    restrictedCountries: ['IR', 'KP', 'SY']
  },
  {
    hsCode: '2701',
    description: 'Coal',
    riskScore: 60,
    riskLevel: 'high',
    factors: ['Sanctions evasion risk', 'Environmental concerns'],
    requiresLicense: true,
    restrictedCountries: ['RU']
  },
  {
    hsCode: '2709',
    description: 'Petroleum oils',
    riskScore: 65,
    riskLevel: 'high',
    factors: ['Sanctions evasion risk', 'High value', 'Geopolitical risk'],
    requiresLicense: true,
    restrictedCountries: ['IR', 'SY', 'RU']
  },
  {
    hsCode: '7102',
    description: 'Diamonds',
    riskScore: 75,
    riskLevel: 'high',
    factors: ['Conflict diamonds risk', 'Money laundering risk', 'High value'],
    requiresLicense: true,
    restrictedCountries: []
  },
  {
    hsCode: '8407',
    description: 'Piston engines',
    riskScore: 55,
    riskLevel: 'medium',
    factors: ['Dual-use technology', 'Export control risk'],
    requiresLicense: true,
    restrictedCountries: ['IR', 'KP', 'SY']
  },
  {
    hsCode: '3002',
    description: 'Human blood; animal blood',
    riskScore: 40,
    riskLevel: 'medium',
    factors: ['Regulatory compliance', 'Health & safety'],
    requiresLicense: true,
    restrictedCountries: []
  },
  {
    hsCode: '6204',
    description: 'Women\'s or girls\' suits, jackets, dresses',
    riskScore: 15,
    riskLevel: 'low',
    factors: ['Standard commodity'],
    requiresLicense: false,
    restrictedCountries: []
  },
  {
    hsCode: '0201',
    description: 'Beef',
    riskScore: 20,
    riskLevel: 'low',
    factors: ['Agricultural commodity', 'Food safety'],
    requiresLicense: false,
    restrictedCountries: []
  },
  {
    hsCode: '8471',
    description: 'Automatic data processing machines',
    riskScore: 50,
    riskLevel: 'medium',
    factors: ['Dual-use technology', 'Export control risk'],
    requiresLicense: true,
    restrictedCountries: ['IR', 'KP', 'SY']
  }
];

export function isSanctioned(entityName: string, entityType: 'individual' | 'company' | 'country'): SanctionedEntity | undefined {
  const normalized = entityName.toUpperCase().trim();
  return SANCTIONED_ENTITIES.find(entity => {
    if (entity.type !== entityType) return false;
    if (entity.name.toUpperCase() === normalized) return true;
    if (entity.aliases?.some(alias => alias.toUpperCase() === normalized)) return true;
    return false;
  });
}

export function getCountryRisk(countryCode: string): CountryRiskProfile | undefined {
  return COUNTRY_RISK_PROFILES.find(c => c.countryCode.toUpperCase() === countryCode.toUpperCase());
}

export function getCommodityRisk(hsCode: string): CommodityRiskProfile | undefined {
  return COMMODITY_RISK_PROFILES.find(c => c.hsCode === hsCode);
}

export function checkSanctionsCompliance(
  buyer: string,
  seller: string,
  buyerCountry: string,
  sellerCountry: string,
  shippingCompany: string
): { compliant: boolean; violations: string[] } {
  const violations: string[] = [];

  // Check buyer
  if (isSanctioned(buyer, 'company')) {
    violations.push(`Buyer "${buyer}" is on sanctions list`);
  }

  // Check seller
  if (isSanctioned(seller, 'company')) {
    violations.push(`Seller "${seller}" is on sanctions list`);
  }

  // Check countries
  if (isSanctioned(buyerCountry, 'country')) {
    violations.push(`Buyer country "${buyerCountry}" is sanctioned`);
  }

  if (isSanctioned(sellerCountry, 'country')) {
    violations.push(`Seller country "${sellerCountry}" is sanctioned`);
  }

  // Check shipping company
  if (isSanctioned(shippingCompany, 'company')) {
    violations.push(`Shipping company "${shippingCompany}" is on sanctions list`);
  }

  return {
    compliant: violations.length === 0,
    violations
  };
}
