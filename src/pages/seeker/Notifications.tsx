// Job seeker notification centre: All / Applications / Requests / Vacancies, New · Today · Earlier.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSeeker, type Notif, type NotifKind } from '../../data/seeker';
import { NGroup, NIcon, NotifRow } from '../../ui/notif';
import { Btn, Empty, Tabs, useToast, type IconName } from '../../ui/kit';

type Tab = 'all' | 'applications' | 'requests' | 'vacancies';
const ICON: Record<NotifKind, [IconName, string, string]> = {
  request: ['message', 'var(--inverse)', 'var(--on-inverse)'],
  accepted: ['check', 'var(--success-back)', 'var(--success-text)'],
  declined: ['cancel', 'var(--back)', 'var(--text-body)'],
  vacancies: ['briefcase', 'var(--primary-secondary)', 'var(--link)'],
  urgent: ['fire', 'var(--urgent)', '#18191C'],
  viewed: ['view', 'var(--back)', 'var(--text-primary)'],
  saved: ['bookmark', 'var(--back)', 'var(--text-primary)'],
  views: ['user', 'var(--back)', 'var(--text-primary)'],
  video: ['video', 'var(--category-music-back)', 'var(--category-music-text)'],
  hireAsk: ['briefcase', 'var(--attention-back)', 'var(--attention-text)'],
  availSoon: ['flash', 'var(--urgent)', '#18191C'],
  availEnded: ['flash', 'var(--back)', 'var(--text-primary)'],
};

export function SeekerNotifications() {
  const s = useSeeker();
  const nav = useNavigate();
  const toast = useToast();
  const [tab, setTab] = useState<Tab>('all');
  const list = s.notifs.filter((n) => tab === 'all' || n.group === tab);
  const n = (g: Notif['group']) => s.notifs.filter((x) => x.group === g && x.unread).length || undefined;
  const open = (x: Notif) => {
    s.readNotif(x.id);
    if (x.threadId) nav(`/seeker/messages/${x.threadId}`);
    else if (x.kind === 'hireAsk' || x.kind === 'declined') nav('/seeker/applications');
    else if (x.vacancyId) nav(`/vacancy/${x.vacancyId}`);
    else if (x.kind === 'video' || x.kind === 'views') nav('/profile/general');
    else if (x.kind === 'vacancies') nav('/seeker');
    else if (x.kind === 'availSoon' || x.kind === 'availEnded') nav('/seeker/profile');
  };
  const actions = (x: Notif) => {
    switch (x.kind) {
      case 'request':
        return x.threadId && s.thread(x.threadId)?.state === 'request' ? (
          <>
            <Btn h={40} onClick={() => (s.acceptRequest(x.threadId!), s.readNotif(x.id), nav(`/seeker/messages/${x.threadId}`))}>
              Accept
            </Btn>
            <Btn kind="secondary" h={40} onClick={() => (s.declineRequest(x.threadId!), s.removeNotif(x.id), toast('Request declined', 'cancel'))}>
              Decline
            </Btn>
          </>
        ) : null;
      case 'accepted':
        return (
          <Btn kind="tonal" h={40} icon="message" onClick={() => open(x)}>
            Open chat
          </Btn>
        );
      case 'vacancies':
        return (
          <Btn kind="secondary" h={40} onClick={() => open(x)}>
            Show vacancies
          </Btn>
        );
      case 'declined':
        return (
          <Btn kind="secondary" h={40} onClick={() => (s.readNotif(x.id), nav('/seeker'))}>
            See similar
          </Btn>
        );
      case 'urgent':
        return (
          <Btn kind="secondary" h={40} onClick={() => open(x)}>
            View vacancy
          </Btn>
        );
      case 'hireAsk':
        return (
          <Btn kind="secondary" h={40} onClick={() => open(x)}>
            Answer
          </Btn>
        );
      case 'availSoon':
        return (
          <Btn kind="urgent" h={40} icon="flash" onClick={() => (s.extendAvail(), s.readNotif(x.id), toast('Extended for 24 hours', 'flash'))}>
            Extend for 24 hours
          </Btn>
        );
      default:
        return null;
    }
  };
  const groups: [string, Notif[]][] = [
    [`New · ${list.filter((x) => x.unread).length}`, list.filter((x) => x.unread)],
    ['Today', list.filter((x) => !x.unread && x.day === 'today')],
    ['Earlier', list.filter((x) => !x.unread && x.day === 'earlier')],
  ];
  return (
    <main className="page narrow">
      <div className="row between wrap g16" style={{ marginTop: 8 }}>
        <h1 className="display d2">Notifications</h1>
        <Tabs<Tab>
          items={[
            { key: 'all', label: 'All' },
            { key: 'applications', label: 'Applications', n: n('applications') },
            { key: 'requests', label: 'Requests', n: n('requests') },
            { key: 'vacancies', label: 'Vacancies', n: n('vacancies') },
          ]}
          value={tab}
          onChange={setTab}
        />
      </div>
      <div className="mt24">
        {list.length ? (
          <section className="card flat" style={{ padding: '0 0 6px', overflow: 'hidden' }}>
            {groups.map(([g, items], gi) =>
              items.length ? (
                <div key={g}>
                  <NGroup
                    right={
                      gi === 0 ? (
                        <button className="link s14" onClick={() => s.readAllNotifs()}>
                          Mark all as read
                        </button>
                      ) : undefined
                    }
                  >
                    {g}
                  </NGroup>
                  {items.map((x) => {
                    const [ic, bg, fg] = ICON[x.kind];
                    return <NotifRow key={x.id} lead={<NIcon icon={ic} bg={bg} fg={fg} />} title={x.title} time={x.time} text={x.text} quote={x.quote} actions={actions(x)} unread={x.unread} onOpen={() => open(x)} />;
                  })}
                </div>
              ) : null,
            )}
          </section>
        ) : (
          <Empty icon="notification" title="No notifications" text="Replies from employers, new vacancies in your field and reminders show up here." />
        )}
      </div>
    </main>
  );
}
