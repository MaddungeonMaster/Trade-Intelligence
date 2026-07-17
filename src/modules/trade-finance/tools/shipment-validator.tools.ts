/**
 * Shipment Validator Tool
 * 
 * Verifies shipment timeline, port consistency, and container information.
 */

import { ToolDecorator as Tool, ExecutionContext, Injectable } from '@nitrostack/core';
import { z } from 'zod';

const ShipmentValidatorInputSchema = z.object({
  documents: z.record(z.unknown()).describe('Shipment documents'),
  transactionId: z.string().optional()
});

@Injectable()
export class ShipmentValidatorTools {
  @Tool({
    name: 'shipment_validator',
    description: 'Verify shipment timeline, port consistency, shipping company, and container information',
    inputSchema: ShipmentValidatorInputSchema,
    examples: {
      request: { documents: { BoL: { shipmentDate: '2024-01-15', ports: { loading: 'Shanghai', discharge: 'Rotterdam' } } } },
      response: { valid: true, issues: [], checksPerformed: 5, passedChecks: 5 }
    }
  })
  async validateShipment(
    input: z.infer<typeof ShipmentValidatorInputSchema>,
    ctx: ExecutionContext
  ): Promise<Record<string, unknown>> {
    ctx.logger.info('Validating shipment', { transactionId: input.transactionId });

    const issues: string[] = [];
    let checksPerformed = 0;
    let passedChecks = 0;

    const bol = input.documents.BoL as Record<string, unknown> | undefined;
    const invoice = input.documents.Invoice as Record<string, unknown> | undefined;
    const packingList = input.documents.PackingList as Record<string, unknown> | undefined;

    // Check 1: Shipment date consistency
    checksPerformed++;
    if (bol?.shipmentDate && invoice?.shipmentDate) {
      if (bol.shipmentDate === invoice.shipmentDate) {
        passedChecks++;
      } else {
        issues.push(`Shipment date mismatch: BoL=${bol.shipmentDate}, Invoice=${invoice.shipmentDate}`);
      }
    } else if (bol?.shipmentDate || invoice?.shipmentDate) {
      passedChecks++;
    }

    // Check 2: Port consistency
    checksPerformed++;
    if (bol?.ports && invoice?.ports) {
      const bolPorts = bol.ports as Record<string, unknown>;
      const invoicePorts = invoice.ports as Record<string, unknown>;
      if (bolPorts.loading === invoicePorts.loading && bolPorts.discharge === invoicePorts.discharge) {
        passedChecks++;
      } else {
        issues.push(`Port mismatch: BoL ports=${JSON.stringify(bolPorts)}, Invoice ports=${JSON.stringify(invoicePorts)}`);
      }
    } else if (bol?.ports || invoice?.ports) {
      passedChecks++;
    }

    // Check 3: Container number consistency
    checksPerformed++;
    if (bol?.containerNumber && packingList?.containerNumber) {
      if (bol.containerNumber === packingList.containerNumber) {
        passedChecks++;
      } else {
        issues.push(`Container number mismatch: BoL=${bol.containerNumber}, PackingList=${packingList.containerNumber}`);
      }
    } else if (bol?.containerNumber || packingList?.containerNumber) {
      passedChecks++;
    }

    // Check 4: Vessel information
    checksPerformed++;
    if (bol?.vesselName && typeof bol.vesselName === 'string' && bol.vesselName.length > 0) {
      passedChecks++;
    } else {
      issues.push('Vessel name missing or invalid in BoL');
    }

    // Check 5: Shipping company
    checksPerformed++;
    if (bol?.shippingCompany && typeof bol.shippingCompany === 'string' && bol.shippingCompany.length > 0) {
      passedChecks++;
    } else {
      issues.push('Shipping company missing or invalid in BoL');
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
