/**
 * Analyst Agent — StepFun Step 3.5 Flash
 * 
 * Specializes in:
 * - Lead scoring and prioritization
 * - Proposal generation ($25K-$1M+)
 * - Competitive analysis
 * - ROI calculations
 */

import type { Lead } from './orchestrator';

export interface LeadScore {
  lead: Lead;
  score: number;
  factors: ScoreFactors;
  recommendation: 'immediate' | 'high_priority' | 'follow_up' | 'monitor';
}

export interface ScoreFactors {
  urgency: number;        // 0-30
  dealSize: number;       // 0-25
  regulatoryPressure: number; // 0-20
  techReadiness: number;  // 0-15
  industryFit: number;    // 0-10
}

export interface Proposal {
  lead: Lead;
  title: string;
  executiveSummary: string;
  scope: ProposalScope;
  timeline: TimelinePhase[];
  pricing: PricingTier;
  totalValue: number;
  probability: number;
}

export interface ProposalScope {
  currentAssessment: string;
  migrationPlan: string;
  deliverables: string[];
}

export interface TimelinePhase {
  phase: string;
  duration: string;
  deliverables: string[];
}

export interface PricingTier {
  assessment: number;
  hybridSignature: number;
  keyMigration: number;
  ongoing: number;
}

export class AnalystAgent {
  /**
   * Score and prioritize leads
   */
  async scoreLeads(leads: Lead[]): Promise<Lead[]> {
    // Sort by urgency (critical first)
    const urgencyOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    const sorted = [...leads].sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);
    
    return sorted;
  }

  /**
   * Generate a proposal for an engaged lead
   */
  async generateProposal(lead: Lead): Promise<Proposal> {
    const pricing = this.calculatePricing(lead);
    
    return {
      lead,
      title: `Q-GRID PQC Assessment Proposal for ${lead.company}`,
      executiveSummary: this.generateExecutiveSummary(lead),
      scope: this.generateScope(lead),
      timeline: this.generateTimeline(lead),
      pricing,
      totalValue: Object.values(pricing).reduce((a, b) => a + b, 0),
      probability: this.estimateWinProbability(lead),
    };
  }

  /**
   * Generate competitive analysis
   */
  async analyzeCompetitors(): Promise<{
    competitors: CompetitorAnalysis[];
    differentiation: string[];
  }> {
    return {
      competitors: [
        {
          name: 'Vanta',
          strengths: ['400+ integrations', 'SOC 2 focus', '$220M ARR'],
          weaknesses: ['No PQC', 'No blockchain audit', 'US-centric'],
          pricing: '$10K-$80K/yr',
        },
        {
          name: 'Comp AI',
          strengths: ['Open source', 'MCP integration'],
          weaknesses: ['No EU AI Act depth', 'No Hedera anchoring'],
          pricing: 'Free / $2K/yr',
        },
        {
          name: 'Securiti',
          strengths: ['Shadow AI detection', 'Enterprise scale'],
          weaknesses: ['No sovereign AI option', 'Expensive'],
          pricing: '$50K-$500K/yr',
        },
      ],
      differentiation: [
        'Only platform with ML-DSA-65 signed reports',
        'Blockchain-anchored audit trail via Hedera',
        'Multi-jurisdiction from same codebase',
        'Sovereign AI option (self-hosted LLM)',
        'Free scanner as lead magnet (QR score in 30s)',
      ],
    };
  }

  // Private helpers

  private scoreLead(lead: Lead): Lead {
    // Score factors
    const urgencyScore = this.calculateUrgencyScore(lead);
    const dealScore = this.calculateDealScore(lead);
    const regulatoryScore = this.calculateRegulatoryScore(lead);
    const techScore = this.calculateTechScore(lead);
    const industryScore = this.calculateIndustryScore(lead);
    
    const totalScore = urgencyScore + dealScore + regulatoryScore + techScore + industryScore;
    
    // Update lead with score embedded in urgency field for sorting
    return {
      ...lead,
      qrsScore: Math.min(100, totalScore),
    };
  }

  private calculateUrgencyScore(lead: Lead): number {
    // QRS score inversely correlates with urgency (lower QRS = more urgent)
    if (lead.qrsScore < 30) return 30;
    if (lead.qrsScore < 50) return 25;
    if (lead.qrsScore < 70) return 15;
    return 5;
  }

  private calculateDealScore(lead: Lead): number {
    if (lead.estimatedDealValue >= 250000) return 25;
    if (lead.estimatedDealValue >= 100000) return 20;
    if (lead.estimatedDealValue >= 50000) return 15;
    return 10;
  }

  private calculateRegulatoryScore(lead: Lead): number {
    // EU companies have regulatory urgency
    const euGeos = ['DE', 'FR', 'NL', 'SE', 'ES', 'IT', 'BE', 'AT'];
    if (euGeos.includes(lead.geo)) return 20;
    return 10;
  }

  private calculateTechScore(lead: Lead): number {
    // Fintech/banking have more crypto exposure
    const highTechIndustries = ['fintech', 'banking', 'insurance', 'crypto'];
    if (highTechIndustries.includes(lead.industry)) return 15;
    return 8;
  }

  private calculateIndustryScore(lead: Lead): number {
    // Industries with known PQC deadlines
    const regulatedIndustries = ['banking', 'insurance', 'healthcare', 'defense'];
    if (regulatedIndustries.includes(lead.industry)) return 10;
    return 5;
  }

  private calculateTotalScore(lead: Lead): number {
    return lead.qrsScore;
  }

  private calculatePricing(lead: Lead): PricingTier {
    const baseMultiplier = lead.estimatedDealValue / 100000;
    
    return {
      assessment: Math.round(25000 * Math.max(1, baseMultiplier)),
      hybridSignature: Math.round(75000 * Math.max(1, baseMultiplier * 0.5)),
      keyMigration: Math.round(250000 * Math.max(1, baseMultiplier * 0.3)),
      ongoing: Math.round(2000 * Math.max(1, baseMultiplier * 0.1)),
    };
  }

  private generateExecutiveSummary(lead: Lead): string {
    return `${lead.company} faces significant quantum computing risk with a Quantum Readiness Score of ${lead.qrsScore}/100.

Key findings from our preliminary scan:
- ${lead.topVulnerability}
- Located in ${lead.geo} with ${lead.industry}-specific regulatory requirements
- Estimated migration timeline: 18-24 months
- August 2026 EU AI Act deadline approaching

Q-GRID Comply provides the only platform that combines post-quantum cryptography assessment, AI system inventory, and blockchain-anchored audit trails.

This proposal outlines a comprehensive migration path that positions ${lead.company} ahead of regulatory deadlines while minimizing operational disruption.`;
  }

  private generateScope(lead: Lead): ProposalScope {
    return {
      currentAssessment: 'Complete cryptographic inventory and risk assessment',
      migrationPlan: 'Phased migration to post-quantum algorithms with testing gates',
      deliverables: [
        'Cryptographic Bill of Materials (CBOM)',
        'AI System Inventory (EU AI Act Article 11)',
        'Risk Assessment Report (ML-DSA-65 signed)',
        'Migration Timeline and Budget',
        'Hedera-anchored Audit Trail',
        'Quarterly Compliance Reports',
      ],
    };
  }

  private generateTimeline(lead: Lead): TimelinePhase[] {
    return [
      {
        phase: 'Discovery & Assessment',
        duration: '4-6 weeks',
        deliverables: ['CBOM', 'AI System Inventory', 'Risk Assessment'],
      },
      {
        phase: 'Migration Planning',
        duration: '2-4 weeks',
        deliverables: ['Migration Roadmap', 'Budget Estimate', 'Resource Plan'],
      },
      {
        phase: 'Implementation Support',
        duration: '12-16 weeks',
        deliverables: ['Hybrid PQC Deployment', 'Testing', 'Validation'],
      },
      {
        phase: 'Ongoing Compliance',
        duration: 'Quarterly',
        deliverables: ['Compliance Reports', 'Audit Trail Updates', 'Monitoring'],
      },
    ];
  }

  private estimateWinProbability(lead: Lead): number {
    // Higher urgency and deal size = higher probability
    const urgencyMap: Record<string, number> = { critical: 30, high: 25, medium: 15, low: 5 };
    const urgencyScore = urgencyMap[lead.urgency] || 0;
    
    const dealScore = lead.estimatedDealValue >= 250000 ? 25 :
                      lead.estimatedDealValue >= 100000 ? 20 :
                      lead.estimatedDealValue >= 50000 ? 15 : 10;
                      
    const regulatoryScore = ['DE', 'FR', 'NL', 'SE', 'ES', 'IT', 'BE', 'AT'].includes(lead.geo) ? 20 : 10;
    
    const techScore = ['fintech', 'banking', 'insurance', 'crypto'].includes(lead.industry) ? 15 : 8;
    
    const total = urgencyScore + dealScore + regulatoryScore + techScore;
    return Math.min(95, Math.round(total * 0.9)); // Scale to 0-95 range
  }
}

interface CompetitorAnalysis {
  name: string;
  strengths: string[];
  weaknesses: string[];
  pricing: string;
}
