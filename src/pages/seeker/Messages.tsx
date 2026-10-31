// Job seeker messages: thread list (Active / Archive) and the chat with an employer. Contact requests, report, archive, delete.
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSeeker, type Msg, type Thread } from '../../data/seeker';
import { findVacancy } from '../../data/mock';
import { contractTypes } from '../../data/dictionaries';
import { Link } from '../../lib/links';
import { Bubble, ChatMenu, clock, Composer, PhotoBubble, REPORT_REASONS, ThreadRow, useStickBottom, useChatPattern } from '../../ui/chat';
import { money } from '../../ui/domain';
import { Btn, Empty, Icon, Initials, Modal, ModalHead, SearchBox, Tabs, useToast } from '../../ui/kit';

const lastText = (t: Thread) => {
  if (t.state === 'request') return t.requestText ?? 'Contact request';
  const m = [...t.messages].reverse().find((x) => x.kind !== 'date');
  if (!m) return '';
  if (m.kind === 'text') return `${m.mine ? 'You: ' : ''}${m.text}`;
  if (m.kind === 'photos') return 'Photo';
  if (m.kind === 'video') return 'Video';
  if (m.kind === 'contact') return 'Contact';
  if (m.kind === 'system') return m.text;
  return '';
};

function MsgView({ m }: { m: Msg }) {
  if (m.kind === 'date') return <span className="daylab">{m.label}</span>;
  if (m.kind === 'system') return <span className={`sysmsg${m.tone === 'danger' ? ' danger' : ''}`}>{m.text}</span>;
  if (m.kind === 'text')
    return (
      <Bubble mine={m.mine} time={m.time} quote={m.quote}>
        {m.text}
      </Bubble>
    );
  if (m.kind === 'photos') return <PhotoBubble mine={m.mine} photos={m.photos} time={m.time} text={m.text} />;
  if (m.kind === 'video')
    return (
      <div className={`bubble${m.mine ? ' mine' : ''}`} style={{ padding: 4 }}>
        <div className="rel ovh" style={{ width: 220, height: 280, borderRadius: 14 }}>
          <img src={m.poster} alt="" className="ph-cover" style={{ height: '100%' }} />
          <span className="play">
            <span>
              <Icon name="play-filled" size={20} />
            </span>
          </span>
          <span className="dur">{m.duration}</span>
        </div>
        {m.text ? <div style={{ padding: '6px 10px 0' }}>{m.text}</div> : null}
        <div className="tm" style={{ padding: '0 10px 4px' }}>
          {m.time}
        </div>
      </div>
    );
  return (
    <Bubble mine={m.mine} time={m.time}>
      <div className="row g10">
        <Icon name="user" />
        <div>
          <div className="strong">{m.name}</div>
          <div className="small">{m.phone ?? m.email}</div>
        </div>
      </div>
    </Bubble>
  );
}

function ReportModal({ t, onClose }: { t: Thread; onClose: () => void }) {
  const toast = useToast();
  const s = useSeeker();
  const [r, setR] = useState<string | null>(null);
  const [d, setD] = useState('');
  return (
    <Modal onClose={onClose} label="Report" width={520}>
      <ModalHead title="Report" onClose={onClose} />
      <div className="row g12">
        <Initials text={t.company.initials} size={44} />
        <div>
          <div className="strong">{t.company.name}</div>
          <div className="small muted">
            {t.person.name}
            {t.vacancyId ? ` · ${findVacancy(t.vacancyId)?.title}` : ''}
          </div>
        </div>
      </div>
      <div className="col g8" role="radiogroup" aria-label="What happened?">
        <span className="small strong muted">What happened? *</span>
        {REPORT_REASONS.map((x) => (
          <button key={x} role="radio" aria-checked={r === x} onClick={() => setR(x)} className={`row g12${r === x ? ' selbox' : ''}`} style={{ height: 48, padding: '0 14px', borderRadius: 14, border: '1px solid var(--stroke)', fontWeight: 600, textAlign: 'left' }}>
            <span className={`radio${r === x ? ' on' : ''}`} />
            {x}
          </button>
        ))}
      </div>
      <label className="field area">
        <textarea value={d} onChange={(e) => setD(e.target.value.slice(0, 500))} rows={3} placeholder="Describe what happened" aria-label="Details" />
      </label>
      <p className="small muted lh">The employer won't know who reported them. Our team reviews every report within 24 hours.</p>
      <Btn
        h={52}
        full
        disabled={!r}
        onClick={() => {
          s.send(t.id, { kind: 'system', tone: 'danger', text: 'You reported this employer. Our team will review it within 24 hours.', time: clock() });
          onClose();
          toast('Report sent');
        }}
      >
        Send report
      </Btn>
    </Modal>
  );
}

export function SeekerMessages() {
  const { id } = useParams();
  const nav = useNavigate();
  const s = useSeeker();
  const toast = useToast();
  const [tab, setTab] = useState<'active' | 'archive'>('active');
  const [q, setQ] = useState('');
  const pattern = useChatPattern();
  const [report, setReport] = useState(false);
  const [del, setDel] = useState(false);
  const t = id ? s.thread(id) : undefined;
  const msgsRef = useStickBottom(t?.messages.length);
  const list = s.threads.filter((x) => (tab === 'archive' ? x.archived : !x.archived) && (!q.trim() || `${x.company.name} ${x.person.name}`.toLowerCase().includes(q.trim().toLowerCase())));
  const v = t?.vacancyId ? findVacancy(t.vacancyId) : undefined;
  const blocked = t && ['withdrawn', 'blocked', 'declined'].includes(t.state);
  return (
    <main className="page" style={{ paddingBottom: 24 }}>
      <div className={`messenger${t ? ' open' : ''}`}>
        <section className="threads" aria-label="Chats">
          <div className="col g12" style={{ padding: '20px 20px 12px' }}>
            <h1 className="display d3">Messages</h1>
            <SearchBox value={q} onChange={setQ} placeholder="Search chats" inset />
            <Tabs
              full
              items={[
                { key: 'active', label: 'Active', n: s.threads.filter((x) => !x.archived).length },
                { key: 'archive', label: 'Archive', n: s.threads.filter((x) => x.archived).length },
              ]}
              value={tab}
              onChange={setTab}
            />
          </div>
          <div className="list">
            {list.map((x) => (
              <ThreadRow
                key={x.id}
                to={`/seeker/messages/${x.id}`}
                on={x.id === id}
                avatar={
                  <span className="rel" style={{ flex: 'none' }}>
                    <Initials text={x.company.initials} size={48} radius={14} />
                    {x.person.photo ? <img src={x.person.photo} alt="" className="avatar" style={{ position: 'absolute', right: -4, bottom: -4, width: 22, height: 22, border: '2px solid var(--surface)' }} /> : null}
                  </span>
                }
                title={x.company.name}
                sub={x.state === 'request' ? 'Contact request' : x.vacancyId ? findVacancy(x.vacancyId)?.title : 'Direct'}
                last={lastText(x)}
                time={x.time}
                unread={x.unread}
                muted={x.state !== 'active' && x.state !== 'request'}
              />
            ))}
            {!list.length ? <p className="muted s14" style={{ padding: 20 }}>{tab === 'archive' ? 'Archived chats show here.' : 'No chats yet. Employers write after you apply or when they invite you.'}</p> : null}
          </div>
        </section>
        <section className="chat" aria-label="Chat">
          {t ? (
            <>
              <div className="head">
                <button className="iconbtn soft mob-only" aria-label="Back to chats" onClick={() => nav('/seeker/messages')}>
                  <Icon name="chevron-left" />
                </button>
                <Initials text={t.company.initials} size={44} radius={14} />
                <div className="grow">
                  <div className="row g6 s16 strong">
                    {t.company.name}
                    {t.company.verified ? (
                      <span style={{ color: 'var(--primary)', display: 'flex' }}>
                        <Icon name="verified" size={16} />
                      </span>
                    ) : null}
                  </div>
                  <div className="small muted">
                    {t.person.name} · {t.person.role}
                    {t.person.online ? <span style={{ color: 'var(--success-text)' }}> · online</span> : null}
                  </div>
                </div>
                <ChatMenu
                  items={[
                    ...(t.vacancyId ? [{ label: 'Open vacancy', icon: 'briefcase' as const, onClick: () => nav(`/vacancy/${t.vacancyId}`) }] : []),
                    { label: t.archived ? 'Restore from archive' : 'Archive', icon: 'clock', onClick: () => (s.archiveThread(t.id, !t.archived), toast(t.archived ? 'Chat restored' : 'Chat archived', 'clock')) },
                    { label: 'Report', icon: 'alert-circle', onClick: () => setReport(true) },
                    { label: 'Delete chat', icon: 'trash', danger: true, onClick: () => setDel(true) },
                  ]}
                />
              </div>
              {v ? (
                <Link to={`/vacancy/${v.id}`} className="row g12" style={{ padding: '10px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--divider)', color: 'var(--text-headline)' }}>
                  <img src={v.cover} alt="" className="ph-cover" style={{ width: 36, height: 36, borderRadius: 10 }} />
                  <span className="grow s14">
                    <b>{v.title}</b> <span className="muted">· {money(v.pay.amount)} {contractTypes[v.pay.contract].suffix}</span>
                  </span>
                  <Icon name="chevron-right" size={18} />
                </Link>
              ) : null}
              <div className="msgs" ref={msgsRef} style={pattern}>
                {t.messages.map((m) => (
                  <MsgView key={m.id} m={m} />
                ))}
                {t.state === 'request' ? (
                  <div className="card" style={{ alignSelf: 'center', maxWidth: 480, gap: 12, marginTop: 8 }}>
                    <div className="s16 strong">{t.company.name} wants to chat with you</div>
                    <p className="primary-text lh">“{t.requestText}”</p>
                    <div className="row g8">
                      <Btn kind="secondary" h={44} style={{ flex: 1 }} onClick={() => (s.declineRequest(t.id), toast('Request declined', 'cancel'), nav('/seeker/messages'))}>
                        Decline
                      </Btn>
                      <Btn h={44} style={{ flex: 1 }} onClick={() => (s.acceptRequest(t.id), toast('Chat opened'))}>
                        Accept
                      </Btn>
                    </div>
                  </div>
                ) : null}
              </div>
              <Composer
                disabled={t.state === 'request' || !!blocked}
                note={t.state === 'request' ? 'Accept the request to reply' : t.state === 'withdrawn' ? 'You withdrew this application' : t.state === 'blocked' ? 'The employer blocked this chat' : 'The employer declined your application'}
                onSend={(text) => s.send(t.id, { kind: 'text', mine: true, text, time: clock() })}
              />
            </>
          ) : (
            <div style={{ margin: 'auto', padding: 24 }}>
              <Empty icon="message" title="Pick a chat" text="Chats with employers open here. You can send photos, video and your contacts." />
            </div>
          )}
        </section>
      </div>
      {report && t ? <ReportModal t={t} onClose={() => setReport(false)} /> : null}
      {del && t ? (
        <Modal onClose={() => setDel(false)} label="Delete chat" width={440}>
          <h2 className="display d4">Delete this chat?</h2>
          <p className="muted lh">The chat disappears for you. The employer keeps their copy.</p>
          <div className="row g8">
            <Btn kind="secondary" style={{ flex: 1 }} onClick={() => setDel(false)}>
              Cancel
            </Btn>
            <Btn
              kind="danger"
              style={{ flex: 1 }}
              onClick={() => {
                s.deleteThread(t.id);
                setDel(false);
                nav('/seeker/messages');
                toast('Chat deleted', 'trash');
              }}
            >
              Delete
            </Btn>
          </div>
        </Modal>
      ) : null}
    </main>
  );
}
