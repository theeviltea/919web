// Finds phone numbers, WhatsApp numbers and emails that employers leave in a vacancy description,
// so the description can show them as buttons. Same logic as the app (src/lib/contacts.ts there).

export type ContactKind = "phone" | "whatsapp" | "email";
export type Contact = { kind: ContactKind; label: string; href: string };
export type Segment = { text: string } | { contact: Contact };

// email | wa.me link | phone (optional +/00, at least 9 digits with spaces, dots, dashes or brackets between)
const TOKEN =
  /([A-Z0-9._%+-]+@[A-Z0-9-]+(?:\.[A-Z0-9-]+)*\.[A-Z]{2,})|((?:https?:\/\/)?(?:wa\.me|api\.whatsapp\.com\/send\?phone=)\/?\+?\d{9,15})|((?:\+|00)?\d[\d ().-]{7,}\d)/gi;
const WA_WORD = /whats\s?app|\bwa\b|ватс?ап|вацап|вотсап|واتس/i;
const PHONE_WORD =
  /whats\s?app|\bwa\b|phone|tel|call|mob|contact|ватс?ап|вацап|вотсап|номер|тел|звон|связ|контакт/i;

const digitsOf = (s: string) => s.replace(/\D/g, "");

/** One description line → text and contacts. A number on a line that mentions WhatsApp opens WhatsApp; otherwise it's a call. */
export function parseLine(line: string): Segment[] {
  const out: Segment[] = [];
  const wa = WA_WORD.test(line);
  const phoneLine = PHONE_WORD.test(line);
  let at = 0;
  for (const m of line.matchAll(TOKEN)) {
    const [raw, email, waLink, phone] = m;
    let contact: Contact | null = null;
    if (email)
      contact = { kind: "email", label: email, href: `mailto:${email}` };
    else if (waLink) {
      const d = digitsOf(waLink);
      contact = {
        kind: "whatsapp",
        label: `+${d}`,
        href: `https://wa.me/${d}`,
      };
    } else if (phone) {
      let d = digitsOf(phone);
      if (d.length < 9 || d.length > 15) continue;
      if (d.startsWith("00")) d = d.slice(2);
      const intl =
        phone.trim().startsWith("+") || phone.trim().startsWith("00");
      // Plain digit runs like a salary range ("15 000 - 20 000") are not numbers to call.
      if (!intl && !phone.trim().startsWith("0") && !phoneLine) continue;
      const label = phone.trim();
      // WhatsApp needs the full international number; a local 0… number is taken as a UAE one.
      const waDigits = !intl && d.startsWith("0") ? `971${d.slice(1)}` : d;
      contact = wa
        ? { kind: "whatsapp", label, href: `https://wa.me/${waDigits}` }
        : { kind: "phone", label, href: `tel:${intl ? "+" : ""}${d}` };
    }
    if (!contact) continue;
    const i = m.index ?? 0;
    if (i > at) out.push({ text: line.slice(at, i) });
    out.push({ contact });
    at = i + raw.length;
  }
  if (at < line.length) out.push({ text: line.slice(at) });
  return out;
}

/** The description split into lines, each line into segments. */
export function parseDescription(text: string): Segment[][] {
  return text.split(/\r?\n/).map(parseLine);
}

export const hasContacts = (text: string) =>
  parseDescription(text).some((l) => l.some((s) => "contact" in s));
