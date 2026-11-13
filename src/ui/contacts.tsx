// Vacancy description with the employer's phone numbers, WhatsApp numbers and emails shown as buttons.
// A tap first shows a short "you're leaving 919" note, then opens the call, WhatsApp or the mail app.
import { useState, type CSSProperties } from "react";

import { parseDescription, type Contact } from "../lib/contacts";
import { Btn, Icon, Modal, ModalHead } from "./kit";

const ICON = { phone: "call", whatsapp: "whatsapp", email: "mail" } as const;
const GO = {
  phone: "Call",
  whatsapp: "Open WhatsApp",
  email: "Write an email",
} as const;
const WHERE = {
  phone: "a phone call",
  whatsapp: "WhatsApp",
  email: "your mail app",
} as const;

export function ContactButton({
  c,
  onOpen,
}: {
  c: Contact;
  onOpen: (c: Contact) => void;
}) {
  return (
    <button
      type="button"
      className="contact-btn"
      onClick={() => onOpen(c)}
      aria-label={`${GO[c.kind]} ${c.label}`}
    >
      <Icon name={ICON[c.kind]} size={16} />
      <span>{c.label}</span>
    </button>
  );
}

export function LeaveSheet({
  c,
  onClose,
}: {
  c: Contact;
  onClose: () => void;
}) {
  const go = () => {
    onClose();
    if (c.kind === "whatsapp") window.open(c.href, "_blank", "noopener");
    else window.location.href = c.href;
  };
  return (
    <Modal onClose={onClose} label="You're leaving 919" width={480}>
      <ModalHead
        title="You're leaving 919"
        sub={`This contact was added by the employer. We'll open ${WHERE[c.kind]} — what happens there isn't covered by 919, so keep the talk about the job.`}
        onClose={onClose}
      />
      <div className="leave-contact">
        <Icon name={ICON[c.kind]} size={20} />
        <span className="grow">{c.label}</span>
      </div>
      <div className="leave-tip">
        <Icon name="shield" size={18} />
        <span>
          Never pay for a job offer, training or a uniform, and don't share your
          passport or card details.
        </span>
      </div>
      <div className="col g10">
        <Btn h={52} full icon={ICON[c.kind]} onClick={go}>
          {GO[c.kind]}
        </Btn>
        <Btn h={52} full kind="secondary" onClick={onClose}>
          Stay on 919
        </Btn>
      </div>
    </Modal>
  );
}

/** The description as written, line by line, with contacts as secondary buttons in the text colour. */
export function DescriptionText({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  const [open, setOpen] = useState<Contact | null>(null);
  const lines = parseDescription(text);
  return (
    <>
      <div className={`desc ${className ?? ""}`} style={style}>
        {lines.map((segs, i) =>
          segs.length === 0 ? (
            <span key={i} className="desc-gap" />
          ) : (
            <span key={i} className="desc-line">
              {segs.map((s, j) =>
                "contact" in s ? (
                  <ContactButton key={j} c={s.contact} onOpen={setOpen} />
                ) : (
                  <span key={j}>{s.text}</span>
                ),
              )}
            </span>
          ),
        )}
      </div>
      {open ? <LeaveSheet c={open} onClose={() => setOpen(null)} /> : null}
    </>
  );
}
