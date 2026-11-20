// Employer paywall: Premium from Free (first month free), Super Premium once Premium's limits are used.
import { EMP_PLANS, type PaidPlan } from "../../data/employer";
import { Btn, Icon, Modal, Pill } from "../../ui/kit";

export function PlanPaywall({
  plan,
  title,
  text,
  onSubscribe,
  onClose,
}: {
  plan: PaidPlan;
  title: string;
  text: string;
  onSubscribe: () => void;
  onClose: () => void;
}) {
  const p = EMP_PLANS[plan];
  return (
    <Modal onClose={onClose} label={`919 ${p.name}`} width={520}>
      <div className="row between">
        <Pill tone="orange" icon="star" h={28}>
          919 {p.name}
        </Pill>
        <button className="iconbtn soft" aria-label="Close" onClick={onClose}>
          <Icon name="cancel" />
        </button>
      </div>
      <div>
        <h2 className="display d3">{title}</h2>
        <p className="muted lh" style={{ marginTop: 8 }}>
          {text}
        </p>
      </div>
      {p.perks.map(([t, x]) => (
        <div key={t} className="row top g14">
          <span
            className="tile"
            style={{
              width: 44,
              height: 44,
              background: "var(--premium-back)",
              color: "var(--premium-strong)",
              borderRadius: 14,
            }}
          >
            <Icon name="check" />
          </span>
          <div>
            <div className="s16 strong">{t}</div>
            <div className="s14 muted" style={{ marginTop: 2 }}>
              {x}
            </div>
          </div>
        </div>
      ))}
      <div
        className="row between"
        style={{
          padding: 18,
          borderRadius: 18,
          border: "2px solid var(--premium)",
        }}
      >
        <div>
          <div className="s16 strong">
            {plan === "premium" ? "First month free" : "Monthly"}
          </div>
          <div className="small muted">
            {plan === "premium"
              ? "Then monthly · cancel any time"
              : `${p.note} · cancel any time`}
          </div>
        </div>
        <div className="s20 strong">
          {p.price} <span className="s14 muted semi">/ month</span>
        </div>
      </div>
      <Btn kind="premium" h={56} full onClick={onSubscribe}>
        {plan === "premium"
          ? "Start free month"
          : `Subscribe for ${p.price} / month`}
      </Btn>
      <button className="link s14" onClick={onClose}>
        Not now
      </button>
      <p className="small muted" style={{ textAlign: "center", marginTop: -8 }}>
        Billed monthly to your card. Terms · Privacy
      </p>
    </Modal>
  );
}
