// Employer: company home (header, KPIs, vacancies, plan, recruiters, menu) and the notification centre.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { company, me, useEmployer, type EmpNotif, type EmpNotifKind } from '../../data/employer';
import pattern from '../../assets/img/pattern-3d.jpg';
import { Link } from '../../lib/links';
import { StatusPill } from './Vacancies';
import { NGroup, NIcon, NotifLayout, NotifRow } from '../../ui/notif';
import { Avatar, Btn, Card, Empty, H2, Icon, Pill, Tabs, useToast, type IconName } from '../../ui/kit';

export function CompanyHome() {
  const e = useEmployer();
  const active = e.vacancies.filter((v) => v.status === 'active' || v.status === 'review');
  const totalApps = Object.values(e.applicants).reduce((s, a) => s + a.length, 0);
  const hires = Object.values(e.hireAnswers).reduce((s, x) => s + Object.values(x).filter((a) => a === 'hired').length, 0);
  const menu: [IconName, string, string, string?][] = [
    ['edit', 'Company details', '/company/details'],
    ['verified', 'Verification', '/company/verification', e.verified ? 'Verified' : e.licence.status === 'review' ? 'On review' : 'Not verified'],
    ['users', 'Team and roles', '/company/team', e.joinRequests.length ? `${e.joinRequests.length} request` : undefined],
    ['wallet', 'Subscription', '/company/subscription', e.plan === 'premium' ? 'Premium' : e.plan === 'canceled' ? 'Canceled' : 'Free'],
    ['settings', 'Settings', '/company/settings'],
  ];
  return (
    <main className="page">
      <div className="layout-r w380" style={{ marginTop: 8 }}>
        <div className="stack">
          <section className="hero" style={{ height: 'auto', padding: 32, gap: 20 }}>
            <img className="bg" src={pattern} alt="" aria-hidden="true" />
            {e.info.logo ? <img src={e.info.logo} alt="" className="avatar" style={{ width: 88, height: 88, borderRadius: 26 }} /> : <span className="ini" style={{ width: 88, height: 88, borderRadius: 26, background: '#fff', color: '#18191C', fontSize: 30 }}>{company.initials}</span>}
            <div className="grow" style={{ minWidth: 220 }}>
              <div className="s15" style={{ opacity: 0.9 }}>
                Hello, {me.firstName}
              </div>
              <div className="row g10 display d3" style={{ marginTop: 4, fontSize: 28 }}>
                {e.info.name}
                {e.verified ? <Icon name="verified" size={26} /> : null}
              </div>
              <div className="s14" style={{ marginTop: 6, opacity: 0.9 }}>
                {e.info.industry} · {e.info.city}, UAE · {e.info.website}
              </div>
            </div>
            <Btn kind="secondary" icon="view" to="/company/details">
              Edit company
            </Btn>
          </section>
          <div className="grid3">
            {(
              [
                [active.length, 'Active vacancies', e.plan === 'premium' ? 'no limit on Premium' : '1 on the Free plan'],
                [totalApps, 'Applicants', 'all time'],
                [hires, 'Hires', 'confirmed'],
              ] as const
            ).map(([n, a, b]) => (
              <div key={a} className="stat">
                <div className="n">{n}</div>
                <div className="s14 semi" style={{ marginTop: 4 }}>
                  {a}
                </div>
                <div className="small muted">{b}</div>
              </div>
            ))}
          </div>
          <Card style={{ gap: 6 }}>
            <H2
              right={
                <Btn h={40} icon="add" to="/post">
                  Post a vacancy
                </Btn>
              }
            >
              Vacancies
            </H2>
            <div>
              {e.vacancies.slice(0, 5).map((v) => (
                <Link key={v.id} to={`/my-vacancy/${v.id}`} className="row g14" style={{ padding: '12px 0', borderTop: '1px solid var(--divider)', color: 'var(--text-headline)' }}>
                  <img src={v.cover} alt="" className="ph-cover" style={{ width: 48, height: 48, borderRadius: 14, flex: 'none' }} />
                  <div className="grow">
                    <div className="s15 semi ellipsis">{v.title}</div>
                    <div className="small muted">{v.meta}</div>
                  </div>
                  <StatusPill v={v} />
                  <span className="small muted desk-only" style={{ width: 120, textAlign: 'right' }}>
                    {(e.applicants[v.id] ?? []).length} applicants
                  </span>
                </Link>
              ))}
            </div>
            <Link to="/hire/vacancies" className="link s14" style={{ marginTop: 8 }}>
              All vacancies
            </Link>
          </Card>
        </div>
        <aside className="stack">
          {e.plan === 'premium' ? (
            <section className="card" style={{ background: 'var(--panel-dark)', color: '#fff', gap: 10 }}>
              <div className="row g8">
                <Pill tone="orange" icon="star">
                  Premium
                </Pill>
                <span className="small" style={{ color: 'var(--panel-dark-muted)' }}>
                  renews 9 Nov
                </span>
              </div>
              <div className="s16 strong">Unlimited vacancies and direct messages</div>
              <div className="s14" style={{ color: 'var(--panel-dark-muted)' }}>
                $3.99 / month
              </div>
            </section>
          ) : (
            <section className="card" style={{ background: 'var(--panel-dark)', color: '#fff', gap: 10 }}>
              <Pill tone="orange" icon="star">
                919 Premium
              </Pill>
              <div className="s16 strong">Message any candidate and post more vacancies</div>
              <Btn kind="premium" h={44} to="/company/subscription">
                Get Premium · $3.99 / month
              </Btn>
            </section>
          )}
          <Card pad={20} style={{ gap: 6 }}>
            <H2
              right={
                <Link to="/company/team" className="link s14">
                  Invite
                </Link>
              }
            >
              Recruiters <span className="muted semi">{e.members.length}</span>
            </H2>
            <div>
              {e.members.map((m) => (
                <div key={m.id} className="row g12" style={{ padding: '12px 0', borderTop: '1px solid var(--divider)' }}>
                  <Avatar src={m.photo} size={44} />
                  <div className="grow">
                    <div className="s15 semi">
                      {m.name}
                      {m.you ? <span className="muted"> · you</span> : null}
                    </div>
                    <div className="small muted">{m.title}</div>
                  </div>
                  <Pill tone="gray">{m.role}</Pill>
                </div>
              ))}
            </div>
          </Card>
          <Card style={{ padding: '6px 22px', gap: 0 }}>
            {menu.map(([i, t, to, badge], k) => (
              <Link key={t} to={to} className="row g12" style={{ height: 52, color: 'var(--text-headline)', borderTop: k ? '1px solid var(--divider)' : undefined }}>
                <Icon name={i} />
                <span className="grow s15">{t}</span>
                {badge ? <span className="small muted">{badge}</span> : null}
                <span className="light" style={{ display: 'flex' }}>
                  <Icon name="chevron-right" size={18} />
                </span>
              </Link>
            ))}
          </Card>
        </aside>
      </div>
    </main>
  );
}

type Tab = 'all' | EmpNotif['group'];
const ICON: Partial<Record<EmpNotifKind, [IconName, string, string]>> = {
  applicants: ['users', 'var(--primary-secondary)', 'var(--link)'],
  applicant: ['user', 'var(--back)', 'var(--text-primary)'],
  accepted: ['check', 'var(--success-back)', 'var(--success-text)'],
  changes: ['edit', 'var(--attention-back)', 'var(--attention-text)'],
  urgent: ['fire', 'var(--urgent)', '#18191C'],
  approved: ['check', 'var(--success-back)', 'var(--success-text)'],
  rejected: ['cancel', 'var(--danger-back)', 'var(--danger-text)'],
  expires: ['clock', 'var(--back)', 'var(--text-primary)'],
  declined: ['cancel', 'var(--back)', 'var(--text-body)'],
  premiumSoon: ['star', 'var(--premium-back)', 'var(--premium-strong)'],
  premiumOver: ['star', 'var(--premium-back)', 'var(--premium-strong)'],
  archived: ['briefcase', 'var(--back)', 'var(--text-primary)'],
  licenceOk: ['verified', 'var(--primary-secondary)', 'var(--link)'],
  licenceRejected: ['shield', 'var(--danger-back)', 'var(--danger-text)'],
  hireAsk: ['briefcase', 'var(--attention-back)', 'var(--attention-text)'],
  availToday: ['flash', 'var(--urgent)', '#18191C'],
};

export function EmployerNotifications({ dropdown, onClose }: { dropdown?: boolean; onClose?: () => void } = {}) {
  const e = useEmployer();
  const nav = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('all');
  const list = e.notifs.filter((n) => tab === 'all' || n.group === tab);
  const n = (g: EmpNotif['group']) => e.notifs.filter((x) => x.group === g).length || undefined;
  const go = (x: EmpNotif) => {
    e.readNotif(x.id);
    onClose?.();
    const k = x.kind;
    if (k === 'availToday') nav('/hire?tab=today');
    else if (k === 'accepted') nav('/hire/messages');
    else if (k === 'applicants' || k === 'applicant') nav('/hire/vacancies');
    else if (k === 'premiumSoon' || k === 'premiumOver') nav('/company/subscription');
    else if (k === 'licenceOk' || k === 'licenceRejected') nav('/company/verification');
    else nav('/hire/vacancies');
  };
  const groups: [string, EmpNotif[]][] = [
    [`New · ${list.filter((x) => x.unread).length}`, list.filter((x) => x.unread)],
    ['Today', list.filter((x) => !x.unread && x.day === 'today')],
    ['Earlier', list.filter((x) => !x.unread && x.day === 'earlier')],
  ];
  const tabs = (
        <Tabs<Tab>
          items={[
            { key: 'all', label: 'All' },
            { key: 'applicants', label: 'Applicants', n: n('applicants') },
            { key: 'vacancies', label: 'Vacancies', n: n('vacancies') },
            { key: 'messages', label: 'Messages', n: n('messages') },
            { key: 'subscription', label: 'Subscription', n: n('subscription') },
          ]}
          value={tab}
          onChange={setTab}
        />
  );
  return (
    <NotifLayout dropdown={dropdown} tabs={tabs} hasUnread={e.unreadNotifs > 0} onReadAll={() => e.readAllNotifs()} allTo="/hire/notifications" onClose={onClose}>
        {list.length ? (
          <section className={dropdown ? '' : 'card flat'} style={{ padding: '0 0 6px', overflow: 'hidden' }}>
            {groups.map(([g, items]) =>
              items.length ? (
                <div key={g}>
                  <NGroup>{g}</NGroup>
                  {items.map((x) => {
                    const [ic, bg, fg] = ICON[x.kind] ?? (['notification', 'var(--back)', 'var(--text-primary)'] as [IconName, string, string]);
                    const lead = x.photo ? <Avatar src={x.photo} size={44} radius={14} /> : x.cover ? <img src={x.cover} alt="" className="ph-cover" style={{ width: 44, height: 44, borderRadius: 14, flex: 'none' }} /> : <NIcon icon={ic} bg={bg} fg={fg} />;
                    return (
                      <NotifRow
                        key={x.id}
                        lead={lead}
                        title={x.title}
                        time={x.time}
                        text={x.text}
                        unread={x.unread}
                        onOpen={() => go(x)}
                        actions={
                          x.action ? (
                            <Btn kind={x.kind.startsWith('premium') ? 'premium-soft' : x.kind === 'applicants' ? 'primary' : 'secondary'} h={40} onClick={() => (x.action === 'Renew' || x.action === 'Get Premium' ? (e.setPlan('premium'), e.readNotif(x.id), toast('You’re on Premium', 'star')) : go(x))}>
                              {x.action}
                            </Btn>
                          ) : undefined
                        }
                      />
                    );
                  })}
                </div>
              ) : null,
            )}
          </section>
        ) : (
          <Empty icon="notification" title="No notifications" text="New applicants, moderation results and messages show up here." />
        )}
    </NotifLayout>
  );
}
