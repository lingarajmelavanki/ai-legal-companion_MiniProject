import os
from pathlib import Path
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from app.core.config import settings

class ReportGenerator:
    @staticmethod
    def generate_pdf_report(
        document_id: int,
        title: str,
        category: str,
        overall_risk: str,
        summary_en: str,
        obligations: list,
        risks: list,
        missing_clauses: list,
        output_path: str = None
    ) -> str:
        if not output_path:
            filename = f"LEXORA_Report_Doc_{document_id}_{int(datetime.now().timestamp())}.pdf"
            output_path = str(settings.REPORTS_DIR / filename)

        doc = SimpleDocTemplate(
            output_path,
            pagesize=letter,
            rightMargin=40,
            leftMargin=40,
            topMargin=40,
            bottomMargin=40
        )

        styles = getSampleStyleSheet()

        # Custom Editorial Palette
        c_green = colors.HexColor("#173D32")
        c_copper = colors.HexColor("#B77B50")
        c_charcoal = colors.HexColor("#252B29")
        c_bg_card = colors.HexColor("#FAF6F0")
        c_red = colors.HexColor("#A82D2D")
        c_yellow = colors.HexColor("#C4820A")

        title_style = ParagraphStyle(
            'EditorialTitle',
            parent=styles['Heading1'],
            fontName='Helvetica-Bold',
            fontSize=22,
            leading=26,
            textColor=c_green
        )

        subtitle_style = ParagraphStyle(
            'EditorialSubtitle',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=10,
            leading=14,
            textColor=c_copper
        )

        heading2_style = ParagraphStyle(
            'SectionHeading',
            parent=styles['Heading2'],
            fontName='Helvetica-Bold',
            fontSize=13,
            leading=17,
            textColor=c_green,
            spaceBefore=12,
            spaceAfter=6
        )

        body_style = ParagraphStyle(
            'Body',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=9,
            leading=13,
            textColor=c_charcoal
        )

        risk_style = ParagraphStyle(
            'RiskText',
            parent=styles['Normal'],
            fontName='Helvetica',
            fontSize=8,
            leading=11,
            textColor=c_charcoal
        )

        elements = []

        # Header Title
        elements.append(Paragraph("LEXORA — CITIZEN LEGAL INTELLIGENCE", subtitle_style))
        elements.append(Spacer(1, 4))
        elements.append(Paragraph(f"Executive Legal Analysis: {title}", title_style))
        elements.append(Spacer(1, 6))

        # Metadata Table
        meta_data = [
            [
                Paragraph(f"<b>Category:</b> {category}", body_style),
                Paragraph(f"<b>Overall Risk Profile:</b> <b>{overall_risk.upper()}</b>", body_style),
                Paragraph(f"<b>Date:</b> {datetime.now().strftime('%d %B %Y')}", body_style)
            ]
        ]
        meta_table = Table(meta_data, colWidths=[200, 180, 150])
        meta_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, -1), c_bg_card),
            ('BOX', (0, 0), (-1, -1), 0.5, c_copper),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('LEFTPADDING', (0, 0), (-1, -1), 8),
            ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ]))
        elements.append(meta_table)
        elements.append(Spacer(1, 12))

        # Plain-Language Executive Summary
        elements.append(Paragraph("1. Executive Plain-Language Summary", heading2_style))
        elements.append(HRFlowable(width="100%", thickness=0.5, color=c_green, spaceAfter=8))
        elements.append(Paragraph(summary_en, body_style))
        elements.append(Spacer(1, 12))

        # Key Obligations
        if obligations:
            elements.append(Paragraph("2. Critical Obligations & Deadlines", heading2_style))
            elements.append(HRFlowable(width="100%", thickness=0.5, color=c_green, spaceAfter=8))
            ob_data = [["Party", "Core Obligation", "Deadline", "Consequence of Default"]]
            for ob in obligations:
                ob_data.append([
                    Paragraph(f"<b>{ob.get('party', '')}</b>", risk_style),
                    Paragraph(ob.get('obligation', ''), risk_style),
                    Paragraph(ob.get('deadline', 'N/A'), risk_style),
                    Paragraph(ob.get('consequence', 'N/A'), risk_style),
                ])
            ob_table = Table(ob_data, colWidths=[100, 200, 110, 120])
            ob_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), c_green),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D8D0C5")),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(ob_table)
            elements.append(Spacer(1, 12))

        # Potential Risk Findings
        if risks:
            elements.append(Paragraph("3. Potential Risk Findings & Legal Evidence", heading2_style))
            elements.append(HRFlowable(width="100%", thickness=0.5, color=c_green, spaceAfter=8))
            risk_data = [["Severity", "Clause Reference", "Citizen Impact & Explanation", "Questions to Ask Lawyer"]]
            for r in risks:
                sev = r.get("severity", "Low")
                sev_color = c_red if sev == "High" else (c_yellow if sev == "Medium" else c_green)
                q_text = "<br/>• ".join(r.get("questions_to_ask", []))
                if q_text:
                    q_text = "• " + q_text

                risk_data.append([
                    Paragraph(f"<b>{sev}</b>", risk_style),
                    Paragraph(f"<b>{r.get('clause_reference', '')}</b>", risk_style),
                    Paragraph(f"{r.get('explanation_en', '')}<br/><br/><i>Rationale:</i> {r.get('legal_rationale', '')}", risk_style),
                    Paragraph(q_text, risk_style)
                ])
            risk_table = Table(risk_data, colWidths=[60, 130, 200, 140])
            risk_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), c_charcoal),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D8D0C5")),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(risk_table)
            elements.append(Spacer(1, 12))

        # Missing Clause Findings
        if missing_clauses:
            elements.append(Paragraph("4. Missing or Incomplete Protective Clauses", heading2_style))
            elements.append(HRFlowable(width="100%", thickness=0.5, color=c_green, spaceAfter=8))
            mc_data = [["Clause Name", "Type & Importance", "Why This Protection Matters", "Recommended Standard Language"]]
            for mc in missing_clauses:
                mc_data.append([
                    Paragraph(f"<b>{mc.get('clause_name', '')}</b>", risk_style),
                    Paragraph(f"{mc.get('clause_type', '')}<br/><b>[{mc.get('importance_level', '')}]</b>", risk_style),
                    Paragraph(mc.get('why_it_matters_en', ''), risk_style),
                    Paragraph(f"<i>{mc.get('recommended_standard_language', 'N/A')}</i>", risk_style)
                ])
            mc_table = Table(mc_data, colWidths=[120, 100, 160, 150])
            mc_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), c_green),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('VALIGN', (0, 0), (-1, -1), 'TOP'),
                ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#D8D0C5")),
                ('TOPPADDING', (0, 0), (-1, -1), 5),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
            ]))
            elements.append(mc_table)
            elements.append(Spacer(1, 14))

        # Legal Disclaimer
        disclaimer = (
            "<b>LEGAL SAFETY NOTICE & DISCLAIMER:</b> This document analysis report is generated by LEXORA "
            "as an educational legal information tool. It does not establish legal validity or invalidity, "
            "nor does it constitute formal legal advice or create an attorney-client relationship. Citizens "
            "are advised to consult a qualified legal practitioner for binding counsel before executing contracts."
        )
        elements.append(Paragraph(disclaimer, ParagraphStyle('Disc', parent=styles['Normal'], fontSize=7.5, leading=10, textColor=colors.HexColor("#77766E"))))

        doc.build(elements)
        return output_path
