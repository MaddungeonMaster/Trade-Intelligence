import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { TradeFinanceModule } from './modules/trade-finance/trade-finance.module.js';

/**
 * Root Application Module
 * 
 * Trade Finance Compliance and Fraud Investigation MCP
 * Analyzes trade documents, detects discrepancies, checks compliance, and identifies fraud.
 */
@McpApp({
    module: AppModule,
    server: {
        name: 'trade-intelligence-mcp',
        version: '1.0.0'
    },
    logging: {
        level: 'info'
    }
})
@Module({
    name: 'trade-intelligence',
    description: 'Trade Finance Compliance and Fraud Investigation',
    imports: [
        ConfigModule.forRoot(),
        TradeFinanceModule
    ],
})
export class AppModule { }
