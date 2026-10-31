// Vertical video presentations: the grid on profiles and the full-screen player (from the app's VideoPlayer).
// Prototype: there is no media file yet, so playback is simulated on the poster — play / pause, scrubbing,
// mute and the timer behave like the real player will.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { lockScroll } from '../lib/scrollLock';
import { Icon, TierBadge } from './kit';
import type { Tier } from '../data/tiers';

export type PlayerVideo = { poster: string; duration: string; views?: string };
export type PlayerOwner = { name: string; subtitle: string; avatar?: string; tier?: Tier; own?: boolean; onReplace?: () => void };

const toSec = (d: string) => d.split(':').reduce((s, p) => s * 60 + Number(p || 0), 0) || 42;
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

/**
 * Videos are vertical (9:16). 1–3 sit centred on a blurred stage so the card never looks half empty;
 * 4–5 fill the row edge to edge. On phones 1 is centred, 2 split the width, 3+ scroll sideways.
 */
export function VideoGrid({ videos, onOpen, main = 'Main' }: { videos: PlayerVideo[]; onOpen: (i: number) => void; main?: string }) {
  const n = videos.length;
  if (!n) return null;
  const tiles = videos.map((v, i) => (
    <button key={i} className="vtile" onClick={() => onOpen(i)} aria-label={`Play video ${i + 1}, ${v.duration}`}>
      <img src={v.poster} alt="" />
      <span className="vgrad" />
      {n > 1 && i === 0 ? <span className="pill white vmain">{main}</span> : null}
      <span className="play">
        <span>
          <Icon name="play-filled" size={18} />
        </span>
      </span>
      <span className="vmeta">
        <span className="strong">{v.duration}</span>
        {v.views ? <span style={{ opacity: 0.85 }}>{v.views} views</span> : null}
      </span>
    </button>
  ));
  return (
    <div className={`vgrid n${Math.min(n, 5)}${n <= 3 ? ' staged' : ''}`}>
      {n <= 3 ? <img className="vstage-bg" src={videos[0].poster} alt="" aria-hidden="true" /> : null}
      <div className="vlist">{tiles}</div>
    </div>
  );
}

export function VideoPlayer({ videos, index, owner, onClose }: { videos: PlayerVideo[]; index: number; owner: PlayerOwner; onClose: () => void }) {
  const [i, setI] = useState(index);
  const v = videos[i];
  const total = toSec(v.duration);
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const bar = useRef<HTMLDivElement>(null);
  const go = (d: number) => {
    setI((x) => (x + d + videos.length) % videos.length);
    setT(0);
    setPlaying(true);
  };
  const toggle = () => {
    if (!playing && t >= total) setT(0);
    setPlaying(!playing);
  };

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setT((x) => {
        if (x + 0.25 >= total) {
          setPlaying(false);
          return total;
        }
        return x + 0.25;
      });
    }, 250);
    return () => window.clearInterval(id);
  }, [playing, total]);

  const keys = useRef<(e: KeyboardEvent) => void>(() => undefined);
  keys.current = (e) => {
    if (e.key === 'Escape') onClose();
    else if (e.key === 'ArrowRight' && videos.length > 1) go(1);
    else if (e.key === 'ArrowLeft' && videos.length > 1) go(-1);
    else if (e.key === ' ') {
      e.preventDefault();
      toggle();
    }
  };
  useEffect(() => {
    const unlock = lockScroll();
    const h = (e: KeyboardEvent) => keys.current(e);
    window.addEventListener('keydown', h);
    return () => {
      unlock();
      window.removeEventListener('keydown', h);
    };
  }, []);

  const seek = (x: number) => {
    const r = bar.current?.getBoundingClientRect();
    if (!r) return;
    setT(Math.min(1, Math.max(0, (x - r.left) / r.width)) * total);
  };
  const pct = (t / total) * 100;
  const iconBtn = (icon: Parameters<typeof Icon>[0]['name'], label: string, onClick: () => void, extra?: ReactNode) => (
    <button className="vp-btn" aria-label={label} onClick={onClick}>
      <Icon name={icon} size={22} />
      {extra}
    </button>
  );

  return (
    <div className="vp" role="dialog" aria-modal="true" aria-label={`${owner.name}, video ${i + 1} of ${videos.length}`}>
      <img className="vp-bg" src={v.poster} alt="" aria-hidden="true" />
      <div className="vp-scrim" onClick={onClose} />
      {videos.length > 1 ? (
        <>
          <button className="vp-nav prev" aria-label="Previous video" onClick={() => go(-1)}>
            <Icon name="chevron-left" size={28} />
          </button>
          <button className="vp-nav next" aria-label="Next video" onClick={() => go(1)}>
            <Icon name="chevron-right" size={28} />
          </button>
        </>
      ) : null}
      <div className="vp-stage">
        <button className="vp-poster" onClick={toggle} aria-label={playing ? 'Pause' : 'Play'}>
          <img key={i} src={v.poster} alt="" />
          {!playing ? (
            <span className="vp-play">
              <Icon name="play-filled" size={30} />
            </span>
          ) : null}
        </button>
        <div className="vp-top">
          {iconBtn('arrow-left', 'Close', onClose)}
          <span className="vp-label">
            <span className="vp-chip">{videos.length > 1 ? `Video ${i + 1} of ${videos.length}` : 'Video presentation'}</span>
          </span>
          {iconBtn(muted ? 'volume-off' : 'volume', muted ? 'Unmute' : 'Mute', () => setMuted(!muted))}
        </div>
        {videos.length > 1 ? (
          <div className="vp-dots" aria-hidden="true">
            {videos.map((_, k) => (
              <span key={k} className={k === i ? 'on' : k < i ? 'done' : ''}>
                {k === i ? <span style={{ width: `${pct}%` }} /> : null}
              </span>
            ))}
          </div>
        ) : null}
        <div className="vp-panel">
          <div className="vp-side">
            <button
              className="vp-share"
              onClick={() => navigator.clipboard?.writeText(`${owner.name} · video presentation on 919`).catch(() => undefined)}
              aria-label="Share"
            >
              <span>
                <Icon name="share" size={22} />
              </span>
              Share
            </button>
          </div>
          <div className="row g12">
            {owner.avatar ? <img src={owner.avatar} alt="" className="avatar" style={{ width: 44, height: 44 }} /> : null}
            <div className="grow" style={{ minWidth: 0 }}>
              <div className="row g6 s16 strong">
                <span className="ellipsis">{owner.name}</span>
                <TierBadge tier={owner.tier} size={18} />
              </div>
              <div className="s14 ellipsis" style={{ marginTop: 2, color: 'rgba(255,255,255,.8)' }}>
                {owner.subtitle}
              </div>
            </div>
          </div>
          <div className="row g10">
            <span className="small tnum" style={{ color: 'rgba(255,255,255,.8)' }}>
              {fmt(t)}
            </span>
            <div
              ref={bar}
              className="vp-bar"
              role="slider"
              tabIndex={0}
              aria-label="Video progress"
              aria-valuemin={0}
              aria-valuemax={Math.round(total)}
              aria-valuenow={Math.round(t)}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                seek(e.clientX);
              }}
              onPointerMove={(e) => e.buttons && seek(e.clientX)}
              onKeyDown={(e) => (e.key === 'ArrowRight' ? (e.stopPropagation(), setT(Math.min(total, t + 5))) : e.key === 'ArrowLeft' ? (e.stopPropagation(), setT(Math.max(0, t - 5))) : undefined)}
            >
              <span className="track">
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="knob" style={{ left: `${pct}%` }} />
            </div>
            <span className="small tnum" style={{ color: 'rgba(255,255,255,.8)' }}>
              {v.duration}
            </span>
          </div>
          {owner.own ? (
            <div className="row g10">
              <button className="vp-ghost" onClick={owner.onReplace}>
                Replace video
              </button>
              <button className="btn primary h52" style={{ flex: 1 }} onClick={toggle}>
                <Icon name={playing ? 'pause' : 'play-filled'} size={16} />
                {playing ? 'Pause' : t >= total ? 'Replay' : 'Play'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
