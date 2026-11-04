// "About 919" banner for guests: links to the landing. A light card — the logo tile with small 3D shapes orbiting it,
// a headline that glitches now and then, one line of text. Motion stops with prefers-reduced-motion (see .ab-* in app.css).
import { ABOUT_URL } from '../lib/site';
import { Icon, Logo } from './kit';
import star8 from '../assets/shapes/star8.webp';
import ring from '../assets/shapes/ring.webp';
import flower from '../assets/shapes/flower.webp';
import rhombus from '../assets/shapes/rhombus.webp';

const SHAPES = [star8, ring, flower, rhombus];

export function AboutBanner() {
  return (
    <a className="ab" href={ABOUT_URL} aria-label="About 919: how it works for talent and employers">
      <span className="ab-art" aria-hidden="true">
        <span className="ab-orbit">
          {SHAPES.map((s, i) => (
            <img key={i} src={s} alt="" style={{ ['--i' as string]: i }} />
          ))}
        </span>
        <span className="ab-logo">
          <Logo h={26} color="#fff" />
        </span>
      </span>
      <span className="ab-copy">
        <span className="ab-tag">About 919</span>
        <span className="ab-title display" data-text="Not just a job board.">
          Not just a job board.
        </span>
        <span className="ab-text">Video profiles, verified companies, people who can start today.</span>
      </span>
      <span className="ab-cta">
        Discover 919
        <Icon name="arrow-right" size={16} />
      </span>
    </a>
  );
}
