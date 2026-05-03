#!/usr/bin/env python3
"""
Case Study PDF Generator for MSY Protocol Consultancy
Creates professional, downloadable case study PDFs for prospect outreach
"""

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib.colors import HexColor
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, Image
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
import datetime

def generate_case_study_pdf(filename, case_data):
    """
    Generate a professional case study PDF.
    
    Args:
        filename: Output PDF filename
        case_data: Dictionary with case study information
            {
                'title': 'Case Study Title',
                'industry': 'Industry Name',
                'client_description': 'Client description (anonymized ok)',
                'challenge': 'The problem they faced',
                'solution': 'How we solved it with MSY Protocol',
                'implementation_timeline': ['Phase 1...', 'Phase 2...'],
                'results': ['Result 1', 'Result 2'],
                'metrics': [
                    {'label': 'Metric Name', 'before': '45 min', 'after': '12 min', 'improvement': '73%'},
                ],
                'msy_layers': ['Kernel', 'Envelope'],  # Which layers were implemented
                'client_name': 'Company Name (optional)',
            }
    """
    
    # Custom colors (MSY brand)
    KERNEL_BLACK = HexColor('#0A0A0A')
    ARTIFACT_WHITE = HexColor('#F9F9F9')
    ACCENT_BLUE = HexColor('#1e3a8a')
    ACCENT_CYAN = HexColor('#0f8a8a')
    TEXT_DARK = HexColor('#1f2937')
    TEXT_LIGHT = HexColor('#6b7280')
    BORDER_COLOR = HexColor('#e5e7eb')
    
    # Create PDF
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        rightMargin=0.75*inch,
        leftMargin=0.75*inch,
        topMargin=0.75*inch,
        bottomMargin=0.75*inch,
    )
    
    # Create styles
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=KERNEL_BLACK,
        spaceAfter=6,
        fontName='Helvetica-Bold',
        leading=32,
    )
    
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=ACCENT_BLUE,
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold',
        borderColor=ACCENT_BLUE,
        borderPadding=0,
    )
    
    subheading_style = ParagraphStyle(
        'CustomSubheading',
        parent=styles['Normal'],
        fontSize=11,
        textColor=TEXT_LIGHT,
        spaceAfter=4,
        fontName='Helvetica-Oblique',
    )
    
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['Normal'],
        fontSize=10,
        textColor=TEXT_DARK,
        spaceAfter=10,
        leading=14,
        alignment=TA_JUSTIFY,
    )
    
    # Build story
    story = []
    
    # Header with logo/branding
    header_data = [
        [
            Paragraph('<b>MSY PROTOCOL</b><br/><font size="8">Deterministic Systems</font>', 
                     ParagraphStyle('header', parent=styles['Normal'], fontSize=12, 
                                  textColor=ACCENT_BLUE, fontName='Helvetica-Bold')),
            Paragraph(f'<font size="9" color="#6b7280">Case Study<br/>{datetime.date.today().strftime("%B %Y")}</font>',
                     ParagraphStyle('date', parent=styles['Normal'], fontSize=9, 
                                  textColor=TEXT_LIGHT, alignment=TA_RIGHT))
        ]
    ]
    header_table = Table(header_data, colWidths=[3.5*inch, 2*inch])
    header_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('LINEBELOW', (0, 0), (-1, 0), 2, ACCENT_BLUE),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 0.3*inch))
    
    # Title
    story.append(Paragraph(case_data['title'], title_style))
    story.append(Paragraph(f"<i>{case_data['industry']}</i>", subheading_style))
    story.append(Spacer(1, 0.15*inch))
    
    # Executive Summary Box
    summary_style = ParagraphStyle(
        'Summary',
        parent=body_style,
        fontSize=10,
        textColor=ACCENT_BLUE,
        fontName='Helvetica-Bold',
    )
    summary_data = [[
        Paragraph(
            f"<b>{case_data['client_description']}</b> faced {case_data['challenge'].lower()} "
            f"We implemented MSY Protocol to solve it.",
            summary_style
        )
    ]]
    summary_table = Table(summary_data, colWidths=[5.5*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), HexColor('#f0f9ff')),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 12),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BORDER', (0, 0), (-1, -1), 1, BORDER_COLOR),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 0.2*inch))
    
    # The Challenge
    story.append(Paragraph('The Challenge', heading_style))
    story.append(Paragraph(case_data['challenge'], body_style))
    story.append(Spacer(1, 0.1*inch))
    
    # The Solution
    story.append(Paragraph('The Solution', heading_style))
    story.append(Paragraph(case_data['solution'], body_style))
    
    # MSY Layers Applied
    if case_data.get('msy_layers'):
        story.append(Spacer(1, 0.05*inch))
        layers_text = f"<b>MSY Layers Implemented:</b> {', '.join(case_data['msy_layers'])}"
        story.append(Paragraph(layers_text, body_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Implementation Timeline
    if case_data.get('implementation_timeline'):
        story.append(Paragraph('Implementation Timeline', heading_style))
        for i, phase in enumerate(case_data['implementation_timeline'], 1):
            story.append(Paragraph(f"<b>Phase {i}:</b> {phase}", body_style))
        story.append(Spacer(1, 0.1*inch))
    
    # Results
    story.append(Paragraph('Results', heading_style))
    for result in case_data.get('results', []):
        story.append(Paragraph(f"<bullet>•</bullet> {result}", body_style))
    story.append(Spacer(1, 0.15*inch))
    
    # Metrics Table
    if case_data.get('metrics'):
        story.append(Paragraph('Key Metrics', heading_style))
        metrics_data = [['Metric', 'Before', 'After', 'Improvement']]
        for metric in case_data['metrics']:
            metrics_data.append([
                metric['label'],
                metric['before'],
                metric['after'],
                metric['improvement']
            ])
        
        metrics_table = Table(metrics_data, colWidths=[2*inch, 1.2*inch, 1.2*inch, 1.1*inch])
        metrics_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), ACCENT_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), HexColor('#ffffff')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), HexColor('#f9fafb')),
            ('GRID', (0, 0), (-1, -1), 1, BORDER_COLOR),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 9),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor('#ffffff'), HexColor('#f9fafb')]),
            ('TOPPADDING', (0, 1), (-1, -1), 8),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
        ]))
        story.append(metrics_table)
        story.append(Spacer(1, 0.2*inch))
    
    # Testimonial (if available)
    if case_data.get('testimonial'):
        story.append(PageBreak())
        story.append(Paragraph('Client Feedback', heading_style))
        testimonial_data = [[
            Paragraph(f'<i>"{case_data["testimonial"]["quote"]}"</i>', 
                     ParagraphStyle('testimonial', parent=body_style, 
                                  textColor=ACCENT_BLUE, fontName='Helvetica-Oblique'))
        ]]
        testimonial_table = Table(testimonial_data, colWidths=[5.5*inch])
        testimonial_table.setStyle(TableStyle([
            ('LEFTPADDING', (0, 0), (-1, -1), 12),
            ('RIGHTPADDING', (0, 0), (-1, -1), 12),
            ('TOPPADDING', (0, 0), (-1, -1), 12),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('LINEABOVE', (0, 0), (-1, -1), 2, ACCENT_BLUE),
            ('LINEBELOW', (0, 0), (-1, -1), 2, ACCENT_BLUE),
        ]))
        story.append(testimonial_table)
        
        attribution = f"— {case_data['testimonial']['attribution']}"
        story.append(Spacer(1, 0.1*inch))
        story.append(Paragraph(attribution, 
                              ParagraphStyle('attribution', parent=body_style, 
                                           alignment=TA_RIGHT, fontName='Helvetica-Oblique')))
        story.append(Spacer(1, 0.2*inch))
    
    # CTA
    story.append(Spacer(1, 0.2*inch))
    cta_style = ParagraphStyle(
        'CTA',
        parent=styles['Normal'],
        fontSize=10,
        textColor=ACCENT_BLUE,
        fontName='Helvetica-Bold',
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    story.append(Paragraph('Ready to Build Deterministic Systems?', cta_style))
    story.append(Paragraph('Schedule your 30-minute diagnostic: <u>hello@deterministic.systems</u>', 
                          ParagraphStyle('cta_contact', parent=styles['Normal'], 
                                       fontSize=9, alignment=TA_CENTER,
                                       textColor=TEXT_LIGHT)))
    
    # Footer
    story.append(Spacer(1, 0.15*inch))
    footer_style = ParagraphStyle(
        'Footer',
        parent=styles['Normal'],
        fontSize=8,
        textColor=TEXT_LIGHT,
        alignment=TA_CENTER,
    )
    story.append(Paragraph('© 2024 MSY Protocol • Deterministic Systems Architecture', footer_style))
    
    # Build PDF
    doc.build(story)
    print(f"✓ Generated: {filename}")


# Example case studies
if __name__ == '__main__':
    
    # Case Study 1: Fintech
    fintech_case = {
        'title': 'High-Availability Event Store',
        'industry': 'Fintech',
        'client_description': 'A Series B payment platform processing $500M+ annually',
        'challenge': 'Replication lag caused stale reads in 15% of transactions. State divergence between ledger and checkout services led to $2M in failed reconciliations and 4-hour outages.',
        'solution': 'Implemented MSY Protocol Kernel Layer: immutable event log with cryptographic sealing. All transaction writes append to sealed log. State derives exclusively from log. Quorum-based consistency for replication. CRDT-based merge resolution for partition tolerance.',
        'msy_layers': ['Kernel', 'Governance'],
        'implementation_timeline': [
            'Week 1-2: Event log infrastructure + sealing mechanism',
            'Week 3-4: State registry implementation + read validation',
            'Week 5-6: Migration of existing transactions + verification',
            'Week 7-8: Performance tuning + audit trail integration',
        ],
        'results': [
            '100% transaction consistency within 15ms',
            'Zero corruption incidents over 18 months',
            'Reduced reconciliation from 1-week manual process to automated daily validation',
            'Full audit trail enabled SOC2 Type II compliance',
            '$2M annual savings from eliminated failed reconciliations',
        ],
        'metrics': [
            {'label': 'State Divergence', 'before': '15% of transactions', 'after': '0%', 'improvement': '100%'},
            {'label': 'MTTR (Reconciliation)', 'before': '1 week', 'after': '< 1 hour', 'improvement': '99%'},
            {'label': 'Monthly Incidents', 'before': '3-4', 'after': '0', 'improvement': '100%'},
            {'label': 'Compliance Score', 'before': 'Failed audit', 'after': 'Certified', 'improvement': 'Pass'},
        ],
        'testimonial': {
            'quote': 'MSY Protocol turned our state management from "hopefully consistent" to provably correct. We moved from incident recovery to zero incidents.',
            'attribution': 'VP Engineering, Payment Platform'
        }
    }
    
    # Case Study 2: Healthcare
    healthcare_case = {
        'title': 'HIPAA-Compliant Configuration Governance',
        'industry': 'Healthcare',
        'client_description': 'A health tech platform processing 10M+ patient records',
        'challenge': 'HIPAA audit revealed 200+ undocumented production changes across 50 services. No change approval workflow. No audit trail. Compliance team couldn\'t prove who changed what, when, or why.',
        'solution': 'Implemented MSY Protocol Governance + Lattice Layers: Git-based SSOT for all configuration. Every change requires peer review and approval. Changes sealed with digital signatures. Continuous drift monitoring validates production against Git. Real-time alerts on unauthorized changes.',
        'msy_layers': ['Governance', 'Lattice'],
        'implementation_timeline': [
            'Week 1-2: Git infrastructure + change approval workflow',
            'Week 3-4: Drift detection + monitoring integration',
            'Week 5-6: Audit trail + signature verification',
            'Week 7-8: Team training + compliance documentation',
        ],
        'results': [
            '100% documented and approved changes going forward',
            'Full audit trail of all modifications with immutable signatures',
            'HIPAA certification achieved in 90 days',
            'Incident investigation time reduced by 60%',
            'Compliance team freed from manual change tracking',
        ],
        'metrics': [
            {'label': 'Documented Changes', 'before': '0%', 'after': '100%', 'improvement': '100%'},
            {'label': 'Audit Trail', 'before': 'None', 'after': 'Complete', 'improvement': 'Pass'},
            {'label': 'Compliance Status', 'before': 'Failed', 'after': 'Certified', 'improvement': 'Pass'},
            {'label': 'Investigation Time', 'before': '3-5 days', 'after': '1-2 hours', 'improvement': '95%'},
        ],
    }
    
    # Case Study 3: E-Commerce
    ecommerce_case = {
        'title': 'Service Isolation & Failure Containment',
        'industry': 'E-Commerce',
        'client_description': 'A $1B GMV marketplace with 50M+ monthly users',
        'challenge': 'Single payment service outage cascaded to checkout, recommendations, and analytics. 40-minute downtime. $200K in lost revenue. Post-mortem revealed zero isolation between services.',
        'solution': 'Implemented MSY Protocol Envelope Layer: explicit service boundaries with fail-closed defaults. Each service declares dependencies and resource limits. Circuit breakers prevent cascade. Automatic retry with exponential backoff. Service mesh enforces mutual TLS.',
        'msy_layers': ['Envelope'],
        'implementation_timeline': [
            'Week 1-2: Service mesh deployment (Istio)',
            'Week 3-4: Circuit breakers + bulkheads',
            'Week 5-6: Dependency mapping + contract definition',
            'Week 7-8: Load testing + failure scenario validation',
        ],
        'results': [
            'Payment service outages no longer affect checkout',
            '8x reduction in cascade blast radius',
            'MTTR reduced from 45 minutes to 12 minutes',
            'Incident frequency down 70% due to better isolation',
            'Team confidence in deployments increased (more frequent, safer)',
        ],
        'metrics': [
            {'label': 'Blast Radius', 'before': '5+ services', 'after': '1 service', 'improvement': '80%'},
            {'label': 'MTTR', 'before': '45 min', 'after': '12 min', 'improvement': '73%'},
            {'label': 'Cascading Incidents', 'before': '12/year', 'after': '2/year', 'improvement': '83%'},
            {'label': 'Revenue Impact', 'before': '$200K/outage', 'after': '$10K/outage', 'improvement': '95%'},
        ],
    }
    
    # Generate PDFs
    generate_case_study_pdf('Case_Study_1_Fintech.pdf', fintech_case)
    generate_case_study_pdf('Case_Study_2_Healthcare.pdf', healthcare_case)
    generate_case_study_pdf('Case_Study_3_Ecommerce.pdf', ecommerce_case)
    
    print("\n✓ All case studies generated successfully!")
    print("\nUse these PDFs for:")
    print("  - Sending to prospects after initial conversation")
    print("  - Sharing in sales emails")
    print("  - Including in RFP responses")
    print("  - Marketing materials on your website")
    print("\nRemember: Anonymize client names in public versions.")
