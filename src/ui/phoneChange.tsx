// Change the sign-in phone (app: profile/phone → auth/code?flow=phone). Number → 6-digit code → saved.
// Prototype: numbers starting with 52 444 belong to another 919 account; code 000000 is wrong.
import { useState } from 'react';
import { formatPhone } from '../data/dictionaries';
import { PhoneField } from '../pages/auth/Auth';
import { Btn, Card, Field, Icon } from './kit';

const TAKEN = /^52444/;

export function PhoneChange({ current, onSaved, onCancel, note }: { current?: string; onSaved: (phone: string) => void; onCancel: () => void; note: string }) {
  const [digits, setDigits] = useState('');
  const [step, setStep] = useState<'number' | 'code'>('number');
  const [code, setCode] = useState('');
  const [codeErr, setCodeErr] = useState<string>();
  const full = `+971 ${formatPhone(digits, '+971')}`;
  const error = TAKEN.test(digits) ? 'This number is linked to another 919 account. Sign in with it, or delete that account first.' : digits.length === 9 && full === current ? 'This is your current number.' : undefined;
  const ok = digits.length === 9 && !error;
  const onCode = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 6);
    setCode(d);
    setCodeErr(undefined);
    if (d.length === 6) {
      if (d === '000000') setCodeErr('Incorrect code. 2 attempts left');
      else onSaved(full);
    }
  };
  return (
    <Card style={{ gap: 18, maxWidth: 560 }}>
      <div>
        <h2 className="display d4">{step === 'code' ? 'Enter the code' : current ? 'Change phone number' : 'Add phone number'}</h2>
        <p className="s15 muted lh" style={{ marginTop: 6 }}>
          {step === 'code' ? `We sent a 6-digit code to ${full}.` : current ? 'Enter your new number. We’ll text a code to confirm it.' : 'We’ll text you a code to confirm it’s yours. You’ll also be able to sign in with this number.'}
        </p>
      </div>
      {step === 'number' ? (
        <>
          {current ? (
            <div className="row g12 inset" style={{ padding: '12px 14px', borderRadius: 16 }}>
              <span className="tile" style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--surface)' }}>
                <Icon name="phone" />
              </span>
              <div>
                <div className="small muted">Current number</div>
                <div className="s15 strong">{current}</div>
              </div>
            </div>
          ) : null}
          <PhoneField digits={digits} onChange={setDigits} autoFocus label={current ? 'New phone number' : 'Phone number'} error={error} />
          {!error ? (
            <div className="row g6 small muted">
              <Icon name="lock" size={14} />
              {note}
            </div>
          ) : null}
          <div className="row g10 cta-bar">
            <Btn kind="secondary" h={52} onClick={onCancel}>
              Cancel
            </Btn>
            <Btn h={52} style={{ minWidth: 180 }} disabled={!ok} onClick={() => setStep('code')}>
              Get code
            </Btn>
          </div>
        </>
      ) : (
        <>
          <Field label="Code" value={code} onChange={onCode} inputMode="numeric" autoFocus error={codeErr} hint="Any 6 digits work in the demo" />
          <div className="row g14 wrap">
            <button className="link s14" onClick={() => (setStep('number'), setCode(''))}>
              Change number
            </button>
            <span className="s14 muted">Resend code in 0:59</span>
          </div>
        </>
      )}
    </Card>
  );
}
