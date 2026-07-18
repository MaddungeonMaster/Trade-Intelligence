# Trade Intelligence MCP

Trade Intelligence MCP is a NitroStack-based server for trade finance officers who need to review trade documents, detect discrepancies, check compliance rules, screen for sanctions and exposure, and support fraud investigations.

## What the project includes

- Document parsing and normalization for trade documents
- Cross-document discrepancy analysis
- Letter of credit and shipment compliance checks
- Sanctions and country-risk screening
- Duplicate financing and TBML detection heuristics
- Decision-support reporting for risk and compliance review

## Project structure

- src/index.ts: application bootstrap entrypoint
- src/app.module.ts: root NitroStack application module
- src/modules/trade-finance/: tools and orchestration for trade-finance workflows
- src/resources/: compliance, sanctions, and Incoterms reference data
- src/schemas/: shared trade-document schemas

## Run locally

```bash
npm install
npm run build
npm start
```

## Common commands

```bash
npm run dev
npm run build
npm start
npm run widget <command>
```

## Widget support

The workspace also includes a small widget scaffold under src/widgets for optional UI integrations.

## Links

- NitroStack docs: <https://docs.nitrostack.ai>
- NitroStack Studio: <https://nitrostack.ai/studio>
- NitroStack GitHub: <https://github.com/nitrocloudofficial/nitrostack>
