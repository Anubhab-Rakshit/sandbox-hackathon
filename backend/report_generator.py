import io
import json
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors

# Dark Theme Palette
BG_COLOR = colors.HexColor("#050505")
TEXT_PRIMARY = colors.white
TEXT_SECONDARY = colors.HexColor("#888888")
ACCENT_GREEN = colors.HexColor("#00FF41")
ACCENT_CYAN = colors.HexColor("#00FFD1")
ACCENT_VIOLET = colors.HexColor("#8A2BE2")

def draw_watermark(c: canvas.Canvas, width: float, height: float):
    c.saveState()
    c.setFont("Courier-Bold", 80)
    c.setFillColor(colors.HexColor("#111111"))
    
    # Translate to center and rotate
    c.translate(width/2, height/2)
    c.rotate(45)
    c.drawCentredString(0, 0, "BHOOL BHULAIYAA")
    c.setFont("Courier-Bold", 40)
    c.drawCentredString(0, -60, "CONFIDENTIAL THREAT INTEL")
    
    c.restoreState()

def draw_header_footer(c: canvas.Canvas, width: float, height: float, threat_id: str):
    # Header
    c.setFillColor(BG_COLOR)
    c.rect(0, height-60, width, 60, fill=1, stroke=0)
    c.setFillColor(ACCENT_GREEN)
    c.setFont("Courier-Bold", 14)
    c.drawString(40, height - 35, "BHOOL BHULAIYAA //")
    c.setFillColor(TEXT_PRIMARY)
    c.drawString(210, height - 35, "THREAT INTELLIGENCE REPORT")
    
    c.setStrokeColor(colors.HexColor("#222222"))
    c.line(0, height-60, width, height-60)
    
    # Footer
    c.setFillColor(BG_COLOR)
    c.rect(0, 0, width, 40, fill=1, stroke=0)
    c.line(0, 40, width, 40)
    
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Courier", 8)
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    c.drawString(40, 15, f"ID: {threat_id} | GENERATED: {now}")
    c.drawRightString(width - 40, 15, "CONFIDENTIAL & PROPRIETARY")

def generate_threat_pdf(threat_record: dict, exec_summary: str, recommendations: list[str]) -> io.BytesIO:
    """Takes a raw SQLite dictionary and LLM strings, and paints the PDF."""
    
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    
    # Fill solid black background for the entire page
    c.setFillColor(BG_COLOR)
    c.rect(0, 0, width, height, fill=1, stroke=0)
    
    draw_watermark(c, width, height)
    draw_header_footer(c, width, height, threat_record.get('id', 'UNKNOWN'))
    
    # Initial Text Setup
    c.setFillColor(TEXT_PRIMARY)
    y_pos = height - 100
    
    # --- EXECUTIVE SUMMARY ---
    c.setFont("Courier-Bold", 16)
    c.setFillColor(ACCENT_CYAN)
    c.drawString(40, y_pos, "[ EXECUTIVE SUMMARY ]")
    y_pos -= 30
    
    c.setFont("Courier", 10)
    c.setFillColor(TEXT_PRIMARY)
    
    # Simple word wrap logic
    import textwrap
    wrapped_lines = textwrap.wrap(exec_summary, width=80)
    for line in wrapped_lines:
        c.drawString(40, y_pos, line)
        y_pos -= 15
        
    y_pos -= 20
        
    # --- TECHNICAL DETAILS ---
    c.setFont("Courier-Bold", 16)
    c.setFillColor(ACCENT_VIOLET)
    c.drawString(40, y_pos, "[ TECHNICAL DOSSIER ]")
    y_pos -= 30
    
    classification = threat_record.get("classification", {})
    network = threat_record.get("network", {})
    
    c.setFont("Courier-Bold", 10)
    c.setFillColor(TEXT_SECONDARY)
    
    tech_details = [
        f"INFERRED TOOLCHAIN: {classification.get('inferred_toolchain', 'Unknown')}",
        f"ATTACK CLASSIFICATION: {classification.get('attack_type', 'Unknown')} (CONF: {classification.get('confidence', 0)})",
        f"SOPHISTICATION TIER: {classification.get('sophistication', 'Unknown').upper()}",
        f"ENTRY IP ADDRESS: {network.get('entry_ip', '0.0.0.0')}",
        f"USER AGENT STRING: {network.get('user_agent', 'None')}[:60]..."
    ]
    
    for detail in tech_details:
        c.drawString(40, y_pos, detail)
        y_pos -= 15
        
    y_pos -= 20
    
    # --- HONEYPOT EFFECTIVENESS ---
    c.setFont("Courier-Bold", 16)
    c.setFillColor(ACCENT_GREEN)
    c.drawString(40, y_pos, "[ STRATEGIC CONTAINMENT ]")
    y_pos -= 30
    
    c.setFont("Courier", 10)
    c.setFillColor(TEXT_PRIMARY)
    
    timeline = threat_record.get("timeline", {})
    eff = threat_record.get("honeypot_effectiveness", {})
    
    c.drawString(40, y_pos, f"TIME WASTED IN SANDBOX:  {timeline.get('time_wasted_seconds', 0)} seconds")
    y_pos -= 15
    c.drawString(40, y_pos, f"TOTAL EXPLOITS TRAPPED:  {timeline.get('total_requests', 0)} payloads")
    y_pos -= 15
    c.drawString(40, y_pos, f"DEEPEST ESCALATION TIER: Phase {timeline.get('escalation_reached', 1)}")
    y_pos -= 15
    c.drawString(40, y_pos, f"FAKE WALLETS DISCOVERED: {eff.get('bait_wallets_discovered', 0)}")
    y_pos -= 15
    c.drawString(40, y_pos, f"FAKE KEYS EXPOSED:       {eff.get('fake_keys_exposed', 0)}")
    y_pos -= 30
    
    # --- LLM RECOMMENDATIONS ---
    c.setFont("Courier-Bold", 16)
    c.setFillColor(ACCENT_CYAN)
    c.drawString(40, y_pos, "[ AI SECURITY RECOMMENDATIONS ]")
    y_pos -= 30
    
    c.setFont("Courier", 10)
    c.setFillColor(TEXT_PRIMARY)
    
    for rec in recommendations:
        wrapped_rec = textwrap.wrap("- " + rec, width=78)
        for i, rline in enumerate(wrapped_rec):
            if i > 0:
                c.drawString(55, y_pos, rline) # Indent wrapped lines
            else:
                c.drawString(40, y_pos, rline)
            y_pos -= 15
        y_pos -= 5
        
    c.save()
    buffer.seek(0)
    return buffer
