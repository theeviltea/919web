// "About 919" banner for guests: links to the landing. Glitching headline, a ticker band, the logo with 3D shapes orbiting it.
// Motion stops with prefers-reduced-motion (see .ab-* in app.css).
import { ABOUT_URL } from '../lib/site';
import { Icon, Logo } from './kit';
import star8 from '../assets/shapes/star8.webp';
import ring from '../assets/shapes/ring.webp';
import flower from '../assets/shapes/flower.webp';
import rhombus from '../assets/shapes/rhombus.webp';
import star5 from '../assets/shapes/star5.webp';
import triangle from '../assets/shapes/triangle.webp';

const SHAPES = [star8, ring, flower, rhombus, star5, triangle];
const TICKER = ['Find work', 'Find people', 'Hospitality', 'Events', 'F&B', 'Modeling', 'Music', 'Dubai', 'Abu Dhabi'];

export function AboutBanner() {
  const line = TICKER.map((w) => (
    <span key={w}>
      {w}
      <i aria-hidden="true">✦</i>
    </span>
  ));
  return (
    <a className="ab" href={ABOUT_URL} aria-label="About 919: how it works for talent and employers">
      <span className="ab-bg" aria-hidden="true" />
      <div className="ab-copy">
        <span className="ab-tag">About 919</span>
        <span className="ab-title display" data-text="Not just a job board.">
          Not just a job board.
        </span>
        <span className="ab-text">Profiles with video, verified companies, people who can start today. See how 919 works for talent and employers.</span>
        <span className="ab-cta">
          Discover 919
          <Icon name="arrow-right" size={18} />
        </span>
      </div>
      <div className="ab-art" aria-hidden="true">
        <span className="ab-orbit">
          {SHAPES.map((s, i) => (
            <img key={i} src={s} alt="" style={{ ['--i' as string]: i }} />
          ))}
        </span>
        <span className="ab-logo">
          <Logo h={92} color="#fff" />
        </span>
      </div>
      <div className="ab-ticker" aria-hidden="true">
        <div className="ab-track">
          {line}
          {line}
        </div>
      </div>
    </a>
  );
}
