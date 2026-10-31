// Multi-step flows on desktop: steps on the left, the form in a card. On mobile the steps collapse into a bar.
import type { ReactNode } from 'react';
import { Link } from '../lib/links';
import { Btn, Card, Icon, Logo } from '../ui/kit';

export function Stepper({ steps, cur }: { steps: string[]; cur: number }) {
  return (
    <Card pad={16} className="stepper desk-only" style={{ gap: 10 }}>
      <div className="small strong muted" style={{ padding: '0 12px' }}>
        Step {cur + 1} of {steps.length}
      </div>
      <ol className="col" style={{ gap: 2, listStyle: 'none', margin: 0, padding: 0 }}>
        {steps.map((s, i) => (
          <li key={s} className={`step${i === cur ? ' on' : i < cur ? ' done' : ''}`} aria-current={i === cur ? 'step' : undefined}>
            <span className="num">{i < cur ? <Icon name="check" size={14} /> : i + 1}</span>
            {s}
          </li>
        ))}
      </ol>
    </Card>
  );
}

export function Wizard({
  steps,
  cur,
  children,
  onNext,
  nextLabel,
  nextDisabled,
  backTo,
  aside,
  exitTo = '/',
  exitLabel = 'Save and exit',
  footNote,
}: {
  steps: string[];
  cur: number;
  children: ReactNode;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  backTo?: string;
  aside?: ReactNode;
  exitTo?: string;
  exitLabel?: string;
  footNote?: ReactNode;
}) {
  return (
    <>
      <header className="topnav">
        <div className="topnav-in">
          <Link to="/" aria-label="919 home">
            <Logo h={26} />
          </Link>
          <span className="grow" />
          <span className="s14 muted desk-only">Draft saved</span>
          <Btn kind="secondary" h={44} to={exitTo}>
            {exitLabel}
          </Btn>
        </div>
      </header>
      <main className="page">
        <div className="layout-l" style={{ marginTop: 8 }}>
          <aside className="stack desk-only">
            <Stepper steps={steps} cur={cur} />
            {aside}
          </aside>
          <Card pad={36} style={{ gap: 28 }}>
            <div className="mob-only">
              <div className="small strong muted">
                Step {cur + 1} of {steps.length} · {steps[cur]}
              </div>
              <div className="row g6" style={{ marginTop: 8 }}>
                {steps.map((s, i) => (
                  <span key={s} className="grow" style={{ height: 6, borderRadius: 999, background: i <= cur ? 'var(--primary)' : 'var(--back-darker)' }} />
                ))}
              </div>
            </div>
            {children}
            <div className="row between g16 wrap">
              <span className="s14 muted">{footNote}</span>
              <div className="row g10">
                {backTo ? (
                  <Btn kind="secondary" h={52} to={backTo}>
                    Back
                  </Btn>
                ) : null}
                <Btn h={52} style={{ minWidth: 200 }} onClick={onNext} disabled={nextDisabled}>
                  {nextLabel ?? (cur === steps.length - 1 ? 'Finish' : 'Continue')}
                </Btn>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </>
  );
}
