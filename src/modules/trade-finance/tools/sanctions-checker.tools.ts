/**
 * Sanctions Checker Tool
 * 
 * Checks buyer, seller, bank, shipping company, and country against sanctions lists.
 */

import { ToolDecorator as Tool, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';
import { checkSanctionsCompliance, isSanctioned } from '../../../resources/sanctions-and-risk.resource.js';

const SanctionsCheckerInputSchema = z.object({
  buyer: z.string().optional(),
  seller: z.string().optional(),
  buyerCountry: z.string().optional(),
  sellerCountry: z.string().optional(),
  shippingCompany: z.string().optional(),
  bank: z.string().optional(),
  transactionId: z.string().optional()
});

@Injectable()
export class SanctionsCheckerTools {
  @Tool({
    name: 'sanctions_checker',
    description: 'Check buyer, seller, bank, shipping company, and country against OFAC, UN, and EU sanctions lists',
    inputSchema: SanctionsCheckerInputSchema,
    examples: {
      request: { buyer: 'ABC Corp', seller: 'XYZ Ltd', buyerCountry: 'US', sellerCountry: 'DE' },
      response: { sanctioned: false, violations: [], entitiesChecked: 5 }
    }
  })
  async checkSanctions(
    input: z.infer<typeof SanctionsCheckerInputSchema>,
    ctx: ExecutionContext
  ): Promise<Record<string, unknown>> {
    ctx.logger.info('Checking sanctions compliance', { transactionId: input.transactionId });

    const violations: string[] = [];
    let entitiesChecked = 0;

    // Check buyer
    if (input.buyer) {
      entitiesChecked++;
      if (isSanctioned(input.buyer, 'company')) {
        violations.push(`Buyer "${input.buyer}" is on sanctions list`);
      }
    }

    // Check seller
    if (input.seller) {
      entitiesChecked++;
      if (isSanctioned(input.seller, 'company')) {
        violations.push(`Seller "${input.seller}" is on sanctions list`);
      }
    }

    // Check buyer country
    if (input.buyerCountry) {
      entitiesChecked++;
      if (isSanctioned(input.buyerCountry, 'country')) {
        violations.push(`Buyer country "${input.buyerCountry}" is sanctioned`);
      }
    }

    // Check seller country
    if (input.sellerCountry) {
      entitiesChecked++;
      if (isSanctioned(input.sellerCountry, 'country')) {
        violations.push(`Seller country "${input.sellerCountry}" is sanctioned`);
      }
    }

    // Check shipping company
    if (input.shippingCompany) {
      entitiesChecked++;
      if (isSanctioned(input.shippingCompany, 'company')) {
        violations.push(`Shipping company "${input.shippingCompany}" is on sanctions list`);
      }
    }

    // Check bank
    if (input.bank) {
      entitiesChecked++;
      if (isSanctioned(input.bank, 'company')) {
        violations.push(`Bank "${input.bank}" is on sanctions list`);
      }
    }

    return {
      sanctioned: violations.length > 0,
      violations,
      entitiesChecked,
      checkedAt: new Date().toISOString()
    };
  }
}
