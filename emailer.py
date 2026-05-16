"""Email notifications via Resend. Graceful fallback if not configured."""
import os
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger("emailer")

try:
    import resend  # type: ignore
except Exception:  # pragma: no cover
    resend = None


def _enabled() -> bool:
    key = os.environ.get("RESEND_API_KEY", "")
    return bool(resend and key and key.startswith("re_"))


def _to_html(enquiry: dict) -> str:
    rows = []
    fields = [
        ("Name", enquiry.get("full_name")),
        ("Business", enquiry.get("business_name")),
        ("Phone / WhatsApp", enquiry.get("phone")),
        ("Email", enquiry.get("email") or "—"),
        ("City / State", enquiry.get("city_state") or "—"),
        ("Category", enquiry.get("category")),
        ("Quantity", enquiry.get("quantity") or "—"),
        ("Message", (enquiry.get("message") or "—").replace("\n", "<br>")),
    ]
    for k, v in fields:
        rows.append(
            f'<tr><td style="padding:8px 14px;background:#FAF8F5;border:1px solid #E8DDD0;font-family:Jost,Arial,sans-serif;font-size:12px;color:#6B6B6B;text-transform:uppercase;letter-spacing:1px;width:160px;">{k}</td>'
            f'<td style="padding:8px 14px;border:1px solid #E8DDD0;font-family:Jost,Arial,sans-serif;font-size:14px;color:#1C1C1C;">{v}</td></tr>'
        )
    wa = enquiry.get("phone", "").replace(" ", "").replace("-", "")
    wa_link = f"https://wa.me/91{wa[-10:]}" if wa else "#"
    return f"""
<!DOCTYPE html>
<html>
<body style="margin:0;padding:0;background:#FAF8F5;font-family:Jost,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF8F5;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF;border:1px solid #E8DDD0;border-top:4px solid #C8A96E;">
        <tr><td style="padding:32px;">
          <p style="margin:0 0 6px;color:#C8A96E;font-size:11px;letter-spacing:3px;text-transform:uppercase;">New Wholesale Enquiry</p>
          <h1 style="margin:0 0 18px;font-family:Georgia,serif;font-size:26px;color:#1C1C1C;">{enquiry.get('full_name','')} <span style="color:#6B6B6B;font-size:18px;">— {enquiry.get('business_name','')}</span></h1>
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
            {''.join(rows)}
          </table>
          <p style="margin:24px 0 0;">
            <a href="{wa_link}" style="display:inline-block;background:#25D366;color:#fff;padding:12px 22px;text-decoration:none;font-size:13px;letter-spacing:1px;text-transform:uppercase;">Reply on WhatsApp</a>
          </p>
          <p style="margin:24px 0 0;font-size:11px;color:#6B6B6B;">Received {datetime.utcnow().strftime('%d %b %Y, %H:%M UTC')} via dreamslatkans.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
""".strip()


def _to_text(enquiry: dict) -> str:
    lines = [
        f"New Wholesale Enquiry — {enquiry.get('business_name', '')}",
        "",
        f"Name:           {enquiry.get('full_name')}",
        f"Business:       {enquiry.get('business_name')}",
        f"Phone/WhatsApp: {enquiry.get('phone')}",
        f"Email:          {enquiry.get('email') or '-'}",
        f"City/State:     {enquiry.get('city_state') or '-'}",
        f"Category:       {enquiry.get('category')}",
        f"Quantity:       {enquiry.get('quantity') or '-'}",
        f"Message:        {enquiry.get('message') or '-'}",
    ]
    return "\n".join(lines)


async def send_enquiry_notification(enquiry: dict) -> dict:
    """Best-effort send. NEVER raises — returns status dict."""
    if not _enabled():
        logger.info("emailer disabled (no RESEND_API_KEY). enquiry id=%s logged only.", enquiry.get("id"))
        return {"sent": False, "reason": "disabled"}
    try:
        resend.api_key = os.environ["RESEND_API_KEY"]
        sender = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
        recipient = os.environ.get("LEAD_NOTIFY_EMAIL", "")
        if not recipient:
            logger.warning("LEAD_NOTIFY_EMAIL not set; skipping email")
            return {"sent": False, "reason": "no recipient"}
        params = {
            "from": f"Dream's Latkans Website <{sender}>",
            "to": [recipient],
            "subject": f"🔔 New Wholesale Enquiry — {enquiry.get('business_name','')}",
            "html": _to_html(enquiry),
            "text": _to_text(enquiry),
        }
        if enquiry.get("email"):
            params["reply_to"] = enquiry["email"]
        result = await asyncio.to_thread(resend.Emails.send, params)
        email_id = result.get("id") if isinstance(result, dict) else None
        logger.info("enquiry email sent id=%s resend_id=%s", enquiry.get("id"), email_id)
        return {"sent": True, "email_id": email_id}
    except Exception as e:
        logger.error("emailer error: %s", e)
        return {"sent": False, "reason": str(e)[:120]}
