# Trade Intelligence MCP

Trade Intelligence MCP is a NitroStack-based MCP server for trade finance workflows. It helps trade finance officers and compliance teams review documents, detect discrepancies, screen for sanctions and risk, and support fraud and AML investigations.

## What it does

- Parses and normalizes trade documents
- Compares multiple documents to find mismatches and omissions
- Checks letters of credit, shipments, and insurance against compliance rules
- Screens counterparties and transactions for sanctions and country-risk exposure
- Detects duplicate financing and TBML patterns
- Produces decision-support outputs for review and escalation

## Main parts of the project

- `src/index.ts` boots the application
- `src/app.module.ts` wires the root NitroStack module
- `src/modules/trade-finance/` contains the trade finance tools and orchestration
- `src/resources/` holds reference data for sanctions, Incoterms, and UCP 600 rules
- `src/schemas/` defines shared trade document schemas
- `src/widgets/` contains optional UI widgets for richer report views

## Common commands

```bash
npm install
npm run dev
npm run build
npm start
```

## Notes

The project is designed to be extended with additional trade controls, reporting widgets, and integration points as compliance requirements evolve.