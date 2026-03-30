/**
 * Outreach Automation Script
 * 
 * Automates sending personalized cold outreach for Q-GRID Comply.
 * Processes the top 25 leads from the EU scan.
 */

import fs from 'fs';
import path from 'path';

const LEADS_FILE = './data/leads/eu-scan-leads.csv';
const OUTPUT_DIR = './data/campaigns/outreach-batches';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR);
}

function generateEmail(lead) {
    const { Company, Domain, Urgency, QRSScore, Vulnerability } = lead;
    
    const subject = `[Company]: Your AI compliance and the August 2026 deadline`.replace('[Company]', Company);
    
    const body = `Hi,

I noticed ${Company} is active in the fintech space. With the EU AI Act high-risk provisions enforcing in August 2026, companies like yours will need documented compliance audit trails.

I ran a quick quantum readiness scan on ${Domain} and your QRS score is ${QRSScore}/100. 
Key finding: ${Vulnerability || 'Classical cryptography only (quantum-vulnerable)'}.

We built Q-GRID Comply to automate the generation of your EU AI Act documentation with blockchain-verified audit trails.

I've prepared a brief risk classification assessment for ${Company}. Would you be open to a 15-minute call this Thursday to walk through it?

Best regards,
E.Fdz
TAURUS AI Corp`;

    return { subject, body };
}

async function run() {
    console.log('📨 Starting Outreach Automation...');
    
    const data = fs.readFileSync(LEADS_FILE, 'utf8');
    const lines = data.split('\n');
    const headers = lines[0].split(',');
    
    const leads = lines.slice(1).filter(l => l.trim()).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, h, i) => {
            obj[h.trim().replace(' ', '')] = values[i];
            return obj;
        }, {});
    });

    const topLeads = leads
        .filter(l => l.Urgency === 'critical' || l.Urgency === 'high')
        .slice(0, 25);

    console.log(`🎯 Processing ${topLeads.length} top-tier leads...`);

    const batch = topLeads.map(lead => {
        const email = generateEmail(lead);
        return {
            company: lead.Company,
            email: `contact@${lead.Domain}`, // Fallback
            ...email
        };
    });

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const batchFile = path.join(OUTPUT_DIR, `outreach-batch-${timestamp}.json`);
    
    fs.writeFileSync(batchFile, JSON.stringify(batch, null, 2));
    
    console.log(`✅ Batch created: ${batchFile}`);
    console.log(`📧 Next Step: Import this batch into your email automation tool (Apollo/Instantly).`);
}

run().catch(console.error);
