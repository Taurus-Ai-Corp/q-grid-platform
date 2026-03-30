#!/usr/bin/env node

/**
 * Sales Engine Test Script
 * 
 * Demonstrates the multi-agent sales engine in action
 * using the Q-GRID Comply platform.
 */

import { SalesOrchestrator } from './agents/orchestrator.js';

async function runDemo() {
  console.log('🚀 Q-GRID SALES ENGINE DEMO');
  console.log('='.repeat(50));
  
  const orchestrator = new SalesOrchestrator();
  
  // Event listeners
  orchestrator.on('campaign:started', (campaign) => {
    console.log(`\n🎯 Campaign started: ${campaign.name}`);
  });
  
  orchestrator.on('phase:scan:complete', ({ leads, count }) => {
    console.log(`\n📊 Scanning complete: ${count} leads generated`);
  });
  
  orchestrator.on('phase:outreach:complete', ({ sent }) => {
    console.log(`\n📧 Outreach complete: ${sent} emails sent`);
  });
  
  // Run a mini campaign
  try {
    await orchestrator.startCampaign({
      name: 'Q-GRID Launch Test',
      targetCompanies: 5,
      industries: ['fintech', 'banking'],
      geos: ['DE', 'FR', 'NL'],
    });
    
    // Simulate scanning
    const mockDomains = [
      'n26.com',
      'revolut.com', 
      'klarna.com',
      'adyen.com',
      'mollie.com'
    ];
    
    const leads = await orchestrator.scanTargets(mockDomains);
    
    // Generate outreach for critical/high urgency leads
    await orchestrator.generateOutreach(leads, { maxEmails: 3 });
    
    // Show results
    const status = orchestrator.getStatus();
    console.log('\n📈 CAMPAIGN STATUS:');
    console.log(JSON.stringify(status, null, 2));
    
    // Export leads as CSV
    console.log('\n📋 LEADS CSV:');
    console.log(orchestrator.exportLeads());
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  runDemo().catch(console.error);
}

export { SalesOrchestrator };