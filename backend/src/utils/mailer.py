"""
Async email mailer utility for SellMyNotes.
Uses aiosmtplib (async SMTP) to send transactional emails.
Falls back gracefully if MAILER_* env vars are not configured.
"""

import os
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

logger = logging.getLogger(__name__)

MAILER_HOST = os.environ.get("MAILER_HOST", "smtp.gmail.com")
MAILER_PORT = int(os.environ.get("MAILER_PORT", "587"))
MAILER_USER = os.environ.get("MAILER_USER", "")
MAILER_PASS = os.environ.get("MAILER_PASS", "")
MAILER_FROM = os.environ.get("MAILER_FROM", "noreply@sellmynotes.co.za")
MAILER_FROM_NAME = os.environ.get("MAILER_FROM_NAME", "sellmynotes")


def _build_receipt_html(
    buyer_email: str,
    note_title: str,
    amount_zar: float,
    purchase_id: str,
    download_url: str,
) -> str:
    """Render a professional HTML receipt email."""
    return f"""
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Your Purchase — {note_title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px 40px;text-align:center;">
              <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0;letter-spacing:-0.5px;">
                sellmynotes
              </h1>
              <p style="color:#bfdbfe;font-size:13px;margin:6px 0 0;">Your digital receipt</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <p style="color:#374151;font-size:15px;margin:0 0 24px;">
                Hi <strong>{buyer_email}</strong>,<br><br>
                Thank you for your purchase! Your watermarked PDF is ready for download.
                This link expires in <strong>24 hours</strong> — download it now.
              </p>

              <!-- Note Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="color:#6b7280;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin:0 0 6px;">Note Purchased</p>
                    <p style="color:#111827;font-size:18px;font-weight:800;margin:0 0 16px;">{note_title}</p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color:#6b7280;font-size:13px;">Amount Paid</td>
                        <td align="right" style="color:#111827;font-size:16px;font-weight:700;">R{amount_zar:.2f}</td>
                      </tr>
                      <tr>
                        <td style="color:#6b7280;font-size:13px;padding-top:6px;">Reference</td>
                        <td align="right" style="color:#6b7280;font-size:12px;font-family:monospace;padding-top:6px;">{purchase_id[:8].upper()}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="{download_url}"
                       style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;font-size:15px;font-weight:700;padding:14px 36px;border-radius:10px;letter-spacing:.02em;">
                      ⬇ Download Your PDF
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#9ca3af;font-size:12px;text-align:center;margin:24px 0 0;">
                Link expires in 24 hours. Visit your
                <a href="https://sellmynotes.co.za/library" style="color:#2563eb;text-decoration:none;">Library</a>
                to re-download at any time.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center;">
              <p style="color:#9ca3af;font-size:11px;margin:0;">
                © 2025 sellmynotes · Johannesburg, South Africa<br>
                This email was sent to {buyer_email} because you made a purchase on sellmynotes.co.za.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
""".strip()


async def send_receipt_email(
    to_email: str,
    note_title: str,
    amount_zar: float,
    purchase_id: str,
    download_url: str,
) -> bool:
    """
    Send a digital receipt email with a signed download URL.
    Returns True on success, False if mailer is not configured or sending fails.
    """
    if not MAILER_USER or not MAILER_PASS:
        logger.warning("Mailer not configured (MAILER_USER/MAILER_PASS missing). Skipping email.")
        return False

    try:
        import aiosmtplib  # imported here so missing package doesn't crash startup

        html_body = _build_receipt_html(
            buyer_email=to_email,
            note_title=note_title,
            amount_zar=amount_zar,
            purchase_id=purchase_id,
            download_url=download_url,
        )

        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your receipt — {note_title}"
        msg["From"] = f"{MAILER_FROM_NAME} <{MAILER_FROM}>"
        msg["To"] = to_email

        # Plain-text fallback
        plain = (
            f"Hi {to_email},\n\n"
            f"Thank you for purchasing \"{note_title}\".\n"
            f"Amount paid: R{amount_zar:.2f}\n"
            f"Reference: {purchase_id[:8].upper()}\n\n"
            f"Download your watermarked PDF here (expires in 24 hours):\n{download_url}\n\n"
            f"– sellmynotes"
        )
        msg.attach(MIMEText(plain, "plain"))
        msg.attach(MIMEText(html_body, "html"))

        await aiosmtplib.send(
            msg,
            hostname=MAILER_HOST,
            port=MAILER_PORT,
            username=MAILER_USER,
            password=MAILER_PASS,
            start_tls=True,
        )

        logger.info(f"Receipt email sent to {to_email} for purchase {purchase_id}.")
        return True

    except ImportError:
        logger.error("aiosmtplib not installed. Add 'aiosmtplib>=3.0' to requirements.txt.")
        return False
    except Exception as e:
        logger.error(f"Failed to send receipt email to {to_email}: {e}")
        return False
