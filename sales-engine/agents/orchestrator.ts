/**
 * Q-GRID Sales Engine — Orchestrator
 * 
 * Nemotron 3 Super coordinates all sales agents:
 * - Scanner: Domain scanning & QRS scoring
 * - Content: Outreach & LinkedIn generation
 * - Analyst: Lead scoring & proposal generation
 * 
 * Flow: Scan → Score → Outreach → Follow-up → Proposal
 */

import { EventEmitter } from 'events';
import { ScannerAgent } from './scanner-agent';
import { ContentAgent } from './content-agent';
import { AnalystAgent } from './analyst-agent';

export interface Lead {
  id: string;
  company: string;
  domain: string;
  geo: string;
  industry: string;
  qrsScore: number;
  topVulnerability: string;
  urgency: 'critical' | 'high' | 'medium' | 'low';
  estimatedDealValue: number;
  status: 'scanned' | 'scored' | 'contacted' | 'engaged' | 'proposal_sent' | 'won' | 'lost';
  createdAt: Date;
  lastContactAt?: Date;
  outreachSequence?: OutreachStep[];
}

export interface OutreachStep {
  type: 'email' | 'linkedin' | 'call';
  templateId: string;
  personalized: Record<string, string>;
  sentAt?: Date;
  openedAt?: Date;
  repliedAt?: Date;
}

export interface Campaign {
  id: string;
  name: string;
  targetCompanies: number;
  leads: Lead[];
  startedAt: Date;
  completedAt?: Date;
  metrics: CampaignMetrics;
}

export interface CampaignMetrics {
  domainsScanned: number;
  leadsGenerated: number;
  emailsSent: number;
  emailsOpened: number;
  repliesReceived: number;
  meetingsBooked: number;
  proposalsSent: number;
  revenueClosed: number;
}

export class SalesOrchestrator extends EventEmitter {
  private scanner: ScannerAgent;
  private content: ContentAgent;
  private analyst: AnalystAgent;
  private campaign: Campaign | null = null;
  private leads: Map<string, Lead> = new Map();

  constructor() {
    super();
    this.scanner = new ScannerAgent();
    this.content = new ContentAgent();
    this.analyst = new AnalystAgent();
  }

  /**
   * Start a new sales campaign
   */
  async startCampaign(config: {
    name: string;
    targetCompanies: number;
    industries: string[];
    geos: string[];
  }): Promise<Campaign> {
    console.log(`\n🚀 Starting campaign: ${config.name}`);
    console.log(`   Target: ${config.targetCompanies} companies`);
    console.log(`   Industries: ${config.industries.join(', ')}`);
    console.log(`   Geos: ${config.geos.join(', ')}\n`);

    this.campaign = {
      id: `campaign-${Date.now()}`,
      name: config.name,
      targetCompanies: config.targetCompanies,
      leads: [],
      startedAt: new Date(),
      metrics: {
        domainsScanned: 0,
        leadsGenerated: 0,
        emailsSent: 0,
        emailsOpened: 0,
        repliesReceived: 0,
        meetingsBooked: 0,
        proposalsSent: 0,
        revenueClosed: 0,
      },
    };

    this.emit('campaign:started', this.campaign);
    return this.campaign;
  }

  /**
   * Phase 1: Scan target companies
   */
  async scanTargets(domains: string[]): Promise<Lead[]> {
    console.log(`\n📡 Phase 1: Scanning ${domains.length} domains...\n`);
    
    const leads: Lead[] = [];
    
    for (const domain of domains) {
      try {
        const scanResult = await this.scanner.scanDomain(domain);
        
        const lead: Lead = {
          id: `lead-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          company: scanResult.companyName || domain,
          domain,
          geo: scanResult.geo || 'unknown',
          industry: scanResult.industry || 'unknown',
          qrsScore: scanResult.qrsScore,
          topVulnerability: scanResult.topVulnerability,
          urgency: this.calculateUrgency(scanResult.qrsScore),
          estimatedDealValue: this.estimateDealValue(scanResult.qrsScore, scanResult.geo),
          status: 'scanned',
          createdAt: new Date(),
        };
        
        this.leads.set(lead.id, lead);
        leads.push(lead);
        
        console.log(`  ✅ ${domain} — QRS: ${lead.qrsScore} (${lead.urgency})`);
        
        if (this.campaign) {
          this.campaign.metrics.domainsScanned++;
          this.campaign.metrics.leadsGenerated++;
        }
        
      } catch (error) {
        console.error(`  ❌ ${domain} — Scan failed: ${error}`);
      }
    }
    
    if (this.campaign) {
      this.campaign.leads = leads;
    }
    
    this.emit('phase:scan:complete', { leads, count: leads.length });
    return leads;
  }

  /**
   * Phase 2: Score and prioritize leads
   */
  async scoreLeads(leads: Lead[]): Promise<Lead[]> {
    console.log(`\n📊 Phase 2: Scoring ${leads.length} leads...\n`);
    
    const scoredLeads = await this.analyst.scoreLeads(leads);
    
    for (const lead of scoredLeads) {
      this.leads.set(lead.id, lead);
      console.log(`  📈 ${lead.company} — Score: ${lead.qrsScore}, Deal: $${lead.estimatedDealValue.toLocaleString()}`);
    }
    
    this.emit('phase:score:complete', { leads: scoredLeads });
    return scoredLeads;
  }

  /**
   * Phase 3: Generate personalized outreach
   */
  async generateOutreach(leads: Lead[], options: { maxEmails?: number } = {}): Promise<void> {
    const maxEmails = options.maxEmails || 25;
    const topLeads = leads
      .filter(l => l.urgency === 'critical' || l.urgency === 'high')
      .slice(0, maxEmails);
    
    console.log(`\n📧 Phase 3: Generating outreach for ${topLeads.length} leads...\n`);
    
    for (const lead of topLeads) {
      const email = await this.content.generateOutreachEmail(lead);
      
      lead.outreachSequence = [{
        type: 'email',
        templateId: 'initial',
        personalized: {
          subject: email.subject,
          body: email.body,
          cta: email.cta,
        },
        sentAt: new Date(),
      }];
      lead.status = 'contacted';
      lead.lastContactAt = new Date();
      
      if (this.campaign) {
        this.campaign.metrics.emailsSent++;
      }
      
      console.log(`  📨 ${lead.company} — ${email.subject}`);
    }
    
    this.emit('phase:outreach:complete', { sent: topLeads.length });
  }

  /**
   * Phase 4: Generate proposals for engaged leads
   */
  async generateProposals(leads: Lead[]): Promise<void> {
    const engagedLeads = leads.filter(l => l.status === 'engaged');
    
    console.log(`\n📄 Phase 4: Generating ${engagedLeads.length} proposals...\n`);
    
    for (const lead of engagedLeads) {
      const proposal = await this.analyst.generateProposal(lead);
      
      lead.status = 'proposal_sent';
      
      if (this.campaign) {
        this.campaign.metrics.proposalsSent++;
      }
      
      console.log(`  📋 ${lead.company} — $${proposal.totalValue.toLocaleString()}`);
    }
    
    this.emit('phase:proposal:complete', { sent: engagedLeads.length });
  }

  /**
   * Get campaign status
   */
  getStatus(): { campaign: Campaign | null; leadCount: number; metrics: CampaignMetrics | null } {
    return {
      campaign: this.campaign,
      leadCount: this.leads.size,
      metrics: this.campaign?.metrics || null,
    };
  }

  /**
   * Export leads to CSV
   */
  exportLeads(): string {
    const headers = ['Company', 'Domain', 'QRS Score', 'Urgency', 'Deal Value', 'Status', 'Industry', 'Geo'];
    const rows = Array.from(this.leads.values()).map(l => [
      l.company,
      l.domain,
      l.qrsScore.toString(),
      l.urgency,
      `$${l.estimatedDealValue.toLocaleString()}`,
      l.status,
      l.industry,
      l.geo,
    ]);
    
    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  // Private helpers

  private calculateUrgency(qrsScore: number): Lead['urgency'] {
    if (qrsScore < 30) return 'critical';
    if (qrsScore < 50) return 'high';
    if (qrsScore < 70) return 'medium';
    return 'low';
  }

  private estimateDealValue(qrsScore: number, geo: string): number {
    // Base value by urgency
    let base = qrsScore < 30 ? 250000 : qrsScore < 50 ? 100000 : qrsScore < 70 ? 50000 : 25000;
    
    // Geo multiplier (EU has regulatory urgency)
    const geoMultiplier: Record<string, number> = {
      'DE': 1.2, 'FR': 1.2, 'NL': 1.1, 'SE': 1.0, 'ES': 1.0, 'IT': 1.0,
      'US': 1.0, 'CA': 0.9, 'UK': 1.1,
    };
    
    return Math.round(base * (geoMultiplier[geo] || 1.0));
  }
}

// CLI entry point
if (import.meta.url.endsWith(process.argv[1])) {
  const orchestrator = new SalesOrchestrator();
  
  // Top EU fintech domains to scan
  const targetDomains = [
    'n26.com', 'revolut.com', 'monzo.com', 'transferwise.com',
    'klarna.com', 'adyen.com', 'mollie.com', 'pay.nl',
    'santander.com', 'bbva.com', 'ing.com', 'abnamro.com',
    'nordea.com', 'seb.se', 'handelsbanken.com', 'danskebank.dk',
    'commerzbank.de', 'deutsche-bank.de', 'bnp-paribas.com', 'societegenerale.com',
    'unicredit.eu', 'intesasanpaolo.com', 'bankia.es', 'sabadell.com',
    'caixabank.com', 'kbc.com', 'dbs.com', 'ocbc.com',
    'uobgroup.com', 'grab.com', 'gojek.com', 'flipkart.com',
    'zalando.com', 'spotify.com', 'nokia.com', 'ericsson.com',
    'volvocars.com', 'volvo.com', 'ikea.com', 'h-m.com',
    'allianz.com', 'axa.com', 'zurich.com', 'generali.com',
    'munichre.com', 'swissre.com', 'hartford.com', 'loews.com',
    'baxter.com', 'philips.com', 'siemens.com', 'bosch.com',
  ];
  
  (async () => {
    await orchestrator.startCampaign({
      name: 'EU AI Act Q-Grid Launch',
      targetCompanies: 50,
      industries: ['fintech', 'banking', 'insurance'],
      geos: ['DE', 'FR', 'NL', 'SE', 'ES', 'IT'],
    });
    
    const leads = await orchestrator.scanTargets(targetDomains);
    await orchestrator.scoreLeads(leads);
    await orchestrator.generateOutreach(leads, { maxEmails: 25 });
    
    // Export results
    const csv = orchestrator.exportLeads();
    const status = orchestrator.getStatus();
    
    // Ensure directories exist
    import fs from 'fs';
    if (!fs.existsSync('./data/leads')) fs.mkdirSync('./data/leads', { recursive: true });
    if (!fs.existsSync('./data/campaigns')) fs.mkdirSync('./data/campaigns', { recursive: true });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.writeFileSync(`./data/leads/eu-scan-leads-${timestamp}.csv`, csv);
    fs.writeFileSync(`./data/campaigns/campaign-status-${timestamp}.json`, JSON.stringify(status, null, 2));
    
    console.log(`\n📊 Results saved to data/leads/ and data/campaigns/`);
    console.log(`\n${csv}\n`);
    
    console.log('\n✅ Campaign complete!');
    console.log(JSON.stringify(status, null, 2));
  })();
}
