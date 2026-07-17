/**
 * Insurance Validator Tool
 * 
 * Verifies insurance coverage, policy validity, and issuer.
 */

import { ToolDecorator as Tool, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';

const InsuranceValidatorInputSchema = z.object({
  insurance: z.record(z.unknown()).describe('Insurance certificate data'),
  lc: z.record(z.unknown()).optional().describe('LC data for comparison'),
  transactionId: z.string().optional()
});

@Injectable()
export class InsuranceValidatorTools {
  @Tool({
    name: 'insurance_validator',
    description: 'Verify insurance coverage percentage, policy validity, insurance company, and expiry date',
    inputSchema: InsuranceValidatorInputSchema,
    examples: {
      request: { insurance: { coveragePercentage: 110, policyDate: '2024-01-01', expiryDate: '2024-12-31' } },
      response: { valid: true, issues: [], checksPerformed: 5, passedChecks: 5 }
    }
  })
  async validateInsurance(
    input: z.infer<typeof InsuranceValidatorInputSchema>,
    ctx: ExecutionContext
  ): Promise<Record<string, unknown>> {
    ctx.logger.info('Validating insurance', { transactionId: input.transactionId });

    const issues: string[] = [];
    let checksPerformed = 0;
    let passedChecks = 0;

    const insurance = input.insurance;
    const lc = input.lc;

    // Check 1: Coverage percentage
    checksPerformed++;
    const coveragePercentage = Number(insurance.coveragePercentage || 0);
    if (coveragePercentage >= 100) {
      passedChecks++;
    } else {
      issues.push(`Coverage percentage insufficient: ${coveragePercentage}% (minimum 100% required)`);
    }

    // Check 2: LC requirement match
    checksPerformed++;
    if (lc?.insuranceRequired) {
      if (insurance.coveragePercentage) {
        passedChecks++;
      } else {
        issues.push('LC requires insurance but coverage percentage not specified');
      }
    } else {
      passedChecks++;
    }

    // Check 3: Policy validity (not expired)
    checksPerformed++;
    if (insurance.expiryDate) {
      const expiry = new Date(insurance.expiryDate as string);
      const today = new Date();
      if (expiry > today) {
        passedChecks++;
      } else {
        issues.push(`Insurance policy expired: ${insurance.expiryDate}`);
      }
    } else {
      issues.push('Insurance expiry date not specified');
    }

    // Check 4: Insurer name
    checksPerformed++;
    if (insurance.insurer && typeof insurance.insurer === 'string' && insurance.insurer.length > 0) {
      passedChecks++;
    } else {
      issues.push('Insurance company name missing or invalid');
    }

    // Check 5: Coverage amount
    checksPerformed++;
    if (insurance.coverageAmount && Number(insurance.coverageAmount) > 0) {
      passedChecks++;
    } else {
      issues.push('Insurance coverage amount missing or invalid');
    }

    return {
      valid: issues.length === 0,
      issues,
      checksPerformed,
      passedChecks,
      validationScore: checksPerformed > 0 ? Math.round((passedChecks / checksPerformed) * 100) : 0,
      validatedAt: new Date().toISOString()
    };
  }
}
