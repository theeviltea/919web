// Employer messages: Active / Inactive / Archive, one chat per candidate split into contexts (Direct and vacancies).
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmployer, type EmpThread } from '../../data/employer';
import { fallbackChat, type EmpMsg } from '../../data/empChat';
import { Bubble, ChatMenu, clock, Composer, PhotoBubble, REPORT_REASONS, ThreadRow, useStickBottom } from '../../ui/chat';
import { Avatar, Btn, Empty, Icon, Modal, ModalHead, SearchBox, Tabs, TierBadge, useToast } from '../../ui/kit';
import { findCandidate } from '../../data/talentPool';

type Box = EmpThread['box'];

function EMsg({ m, onCtx }: { m: EmpMsg; onCtx: (c: string) => void }) {
  const e = useEmployer();
  if (m.kind === 'date') return <span className="daylab">{m.label}</span>;
  if (m.kind === 'event')
    return (
      <span className={`sysmsg${m.tone === 'danger' ? ' danger' : ''}`} style={m.tone === 'info' ? { background: 'var(--primary-secondary)', color: 'var(--link)' } : undefined}>
        {m.text}
      </span>
    );
  if (m.kind === 'link')
    return (
      <button className="sysmsg" style={{ background: 'var(--primary-secondary)', color: 'var(--link)', fontWeight: 700 }} onClick={() => onCtx(m.ctx)}>
        {m.text} →
      </button>
    );
  if (m.kind === 'text')
    return (
      <Bubble mine={m.mine} time={m.time} quote={m.quote}>
        {m.text}
      </Bubble>
    );
  if (m.kind === 'photos') return <PhotoBubble mine={m.mine} photos={m.photos} time={m.time} text={m.text} />;
  if (m.kind === 'vacancy') {
    const v = e.vacancies.find((x) => x.id === m.vacancyId);
    return (
      <Bubble mine={m.mine} time={m.time}>
        <div className="row g10">
          {v ? <img src={v.cover} alt="" className="ph-cover" style={{ width: 40, height: 40, borderRadius: 10 }} /> : null}
          <div>
            <div className="strong">{v?.title ?? 'Vacancy'}</div>
            <div className="small">{v?.meta}</div>
          </div>
        </div>
      </Bubble>
    );
  }
  if (m.kind === 'location')
    return (
      <Bubble mine={m.mine} time={m.time}>
        <div className="row g10">
          <Icon name="location" />
          <div>
            <div className="strong">{m.title}</div>
            <div className="small">{m.address}</div>
          </div>
        </div>
      </Bubble>
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

export function EmployerMessages() {
  const { id } = useParams();
  const nav = useNavigate();
  const e = useEmployer();
  const toast = useToast();
  const [box, setBox] = useState<Box>('active');
  const [q, setQ] = useState('');
  const [ctx, setCtx] = useState<string | null>(null);
  const [modal, setModal] = useState<'report' | 'block' | 'delete' | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const t = id ? e.threads.find((x) => x.id === id) : undefined;
  const contexts = t ? [...(t.direct ? ['direct'] : []), ...(t.vacancies ?? [])] : [];
  const cur = t ? (ctx && contexts.includes(ctx) ? ctx : contexts[0] ?? 'direct') : 'direct';
  const msgs: EmpMsg[] = t ? (t.chats?.[cur] ?? fallbackChat(t.name, t.last, t.mine, t.time, cur === 'direct')) : [];
  const ref = useStickBottom(`${id}-${cur}-${msgs.length}`);
  const list = e.threads.filter((x) => x.box === box && x.state !== 'deleted' && (!q.trim() || x.name.toLowerCase().includes(q.trim().toLowerCase())));
  const ctxLabel = (c: string) => (c === 'direct' ? 'Direct' : (e.vacancies.find((v) => v.id === c)?.title ?? c));
  const cand = t?.candidateId ? findCandidate(t.candidateId) : undefined;
  const closed = t && (t.state === 'blocked' || t.state === 'deleted' || t.request === 'pending' || t.box === 'inactive');
  return (
    <main className="page" style={{ paddingBottom: 24 }}>
      <div className={`messenger${t ? ' open' : ''}`}>
        <section className="threads" aria-label="Chats">
          <div className="col g12" style={{ padding: '20px 20px 12px' }}>
            <h1 className="display d3">Messages</h1>
            <SearchBox value={q} onChange={setQ} placeholder="Search by name" inset />
            <Tabs<Box>
              full
              items={[
                { key: 'active', label: 'Active', n: e.threads.filter((x) => x.box === 'active').length },
                { key: 'inactive', label: 'Inactive' },
                { key: 'archive', label: 'Archive' },
              ]}
              value={box}
              onChange={setBox}
            />
          </div>
          <div className="list">
            {list.map((x) => (
              <ThreadRow
                key={x.id}
                to={`/hire/messages/${x.id}`}
                on={x.id === id}
                avatar={<Avatar src={x.photo} size={48} />}
                title={x.name}
                sub={x.request === 'pending' ? 'Contact request · waiting' : x.subtitle ?? [x.direct ? 'Direct' : null, ...(x.vacancies ?? []).map((v) => e.vacancies.find((y) => y.id === v)?.title)].filter(Boolean).slice(0, 2).join(' · ')}
                last={`${x.mine ? 'You: ' : ''}${x.last}`}
                time={x.time}
                unread={x.unread}
                muted={x.box !== 'active'}
              />
            ))}
            {!list.length ? <p className="muted s14" style={{ padding: 20 }}>No chats here.</p> : null}
          </div>
        </section>
        <section className="chat" aria-label="Chat">
          {t ? (
            <>
              <div className="head">
                <button className="iconbtn soft mob-only" aria-label="Back to chats" onClick={() => nav('/hire/messages')}>
                  <Icon name="chevron-left" />
                </button>
                <Avatar src={t.photo} size={44} />
                <div className="grow">
                  <div className="row g6 s16 strong">
                    {t.name}
                    {cand ? <TierBadge tier={cand.tier} size={18} /> : null}
                  </div>
                  <div className="small muted">
                    {cand ? `${cand.role} · ${cand.city}` : t.subtitle}
                    {t.online ? <span style={{ color: 'var(--success-text)' }}> · online</span> : null}
                  </div>
                </div>
                {cand ? (
                  <Btn kind="secondary" h={40} to={`/talent/${cand.id}`}>
                    Profile
                  </Btn>
                ) : null}
                <ChatMenu
                  items={[
                    t.box === 'archive'
                      ? { label: 'Restore', icon: 'arrow-left', onClick: () => (e.moveThread(t.id, 'active'), toast('Chat restored', 'clock')) }
                      : { label: 'Archive', icon: 'clock', onClick: () => (e.moveThread(t.id, 'archive'), toast('Chat archived', 'clock')) },
                    { label: 'Block', icon: 'cancel', onClick: () => setModal('block') },
                    { label: 'Report', icon: 'alert-circle', onClick: () => setModal('report') },
                    { label: 'Delete chat', icon: 'trash', danger: true, onClick: () => setModal('delete') },
                  ]}
                />
              </div>
              {contexts.length > 1 ? (
                <div className="chips scroll" style={{ padding: '10px 24px', background: 'var(--surface)', borderBottom: '1px solid var(--divider)' }}>
                  {contexts.map((c) => (
                    <button key={c} className={`chip${c === cur ? ' on' : ''}`} style={{ height: 34, fontSize: 13 }} onClick={() => setCtx(c)}>
                      {c === 'direct' ? <Icon name="message" size={14} /> : <Icon name="briefcase" size={14} />}
                      {ctxLabel(c)}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="msgs" ref={ref}>
                {msgs.map((m) => (
                  <EMsg key={m.id} m={m} onCtx={setCtx} />
                ))}
                {t.request === 'pending' ? <span className="sysmsg" style={{ background: 'var(--primary-secondary)', color: 'var(--link)' }}>Contact request sent. You can chat once {t.name.split(' ')[0]} accepts it.</span> : null}
              </div>
              <Composer
                disabled={!!closed}
                note={t.state === 'blocked' ? 'You blocked this candidate' : t.request === 'pending' ? 'Waiting for the candidate to accept your request' : t.reason ? `${t.reason} · the chat is read-only` : 'The chat is read-only'}
                onSend={(text) => e.sendChat(t.id, cur, { kind: 'text', mine: true, text, time: clock() })}
              />
            </>
          ) : (
            <div style={{ margin: 'auto', padding: 24 }}>
              <Empty icon="message" title="Pick a chat" text="Chats with candidates open here: the direct chat and one per vacancy." />
            </div>
          )}
        </section>
      </div>
      {modal === 'report' && t ? (
        <Modal onClose={() => setModal(null)} label="Report" width={520}>
          <ModalHead title={`Report ${t.name}`} onClose={() => setModal(null)} />
          <div className="col g8" role="radiogroup">
            {REPORT_REASONS.slice(1).map((x) => (
              <button key={x} role="radio" aria-checked={reason === x} onClick={() => setReason(x)} className={`row g12${reason === x ? ' selbox' : ''}`} style={{ height: 48, padding: '0 14px', borderRadius: 14, border: '1px solid var(--stroke)', fontWeight: 600, textAlign: 'left' }}>
                <span className={`radio${reason === x ? ' on' : ''}`} />
                {x}
              </button>
            ))}
          </div>
          <Btn h={52} full disabled={!reason} onClick={() => (setModal(null), toast('Report sent'))}>
            Send report
          </Btn>
        </Modal>
      ) : null}
      {modal === 'block' && t ? (
        <Modal onClose={() => setModal(null)} label="Block" width={440}>
          <ModalHead title={`Block ${t.name}?`} sub="They can't write to you or apply to your vacancies. You can unblock them later." onClose={() => setModal(null)} />
          <Btn kind="danger" h={52} full onClick={() => (e.updateThread(t.id, () => ({ state: 'blocked', box: 'inactive', reason: 'Blocked' })), setModal(null), toast('Candidate blocked', 'cancel'))}>
            Block
          </Btn>
        </Modal>
      ) : null}
      {modal === 'delete' && t ? (
        <Modal onClose={() => setModal(null)} label="Delete chat" width={440}>
          <ModalHead title="Delete this chat?" sub="The chat disappears for you. The candidate keeps their copy." onClose={() => setModal(null)} />
          <Btn kind="danger" h={52} full onClick={() => (e.deleteThread(t.id), setModal(null), nav('/hire/messages'), toast('Chat deleted', 'trash'))}>
            Delete
          </Btn>
        </Modal>
      ) : null}
    </main>
  );
}
