import { motion } from 'framer-motion';
import Lenis from 'lenis';
import { useEffect, useState, type CSSProperties } from 'react';
import { FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';
import './App.css';
import { AuroraBackground } from './components/AuroraBackground';
import { BinaryRain } from './components/BinaryRain';
import { CodeBackground } from './components/CodeBackground';
import { CursorGlow } from './components/CursorGlow';
import { LoadingScreen } from './components/LoadingScreen';
import { ParticleBackground } from './components/ParticleBackground';
import { PortfolioContent } from './components/PortfolioContent';
import PortfolioChatbot from './PortfolioChatbot';

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const timer = window.setTimeout(() => setIsLoading(false), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const heroLine = 'UI/UX Designer • Frontend Developer • Python Developer';
    let index = 0;
    const interval = window.setInterval(() => {
      setDisplayText(heroLine.slice(0, index + 1));
      index += 1;
      if (index >= heroLine.length) {
        window.clearInterval(interval);
      }
    }, 45);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateScroll = () => {
      const scrollTop = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
      setScrollProgress(progress);
      setShowBackToTop(scrollTop > 520);
    };

    window.addEventListener('scroll', updateScroll, { passive: true });
    updateScroll();
    return () => window.removeEventListener('scroll', updateScroll);
  }, []);

  useEffect(() => {
    const onPointerMove = (event: MouseEvent) => {
      setMousePos({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', onPointerMove);
    return () => window.removeEventListener('mousemove', onPointerMove);
  }, []);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = window.requestAnimationFrame(raf);
    };

    frame = window.requestAnimationFrame(raf);
    return () => {
      window.cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  const spotlightStyle = {
    '--spotlight-x': `${mousePos.x}px`,
    '--spotlight-y': `${mousePos.y}px`,
  } as CSSProperties;

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <PortfolioChatbot />
      <div className="app-shell">
      <AuroraBackground />
      <BinaryRain />
      <CodeBackground />
      <div className="spotlight-layer" style={spotlightStyle} aria-hidden="true" />
      <div className="particle-field">
        <ParticleBackground mouse={mousePos} />
      </div>
      <div className="progress-bar" aria-hidden="true"><div style={{ width: `${scrollProgress}%` }} /></div>
      <CursorGlow cursorPos={mousePos} />

      <motion.header className="nav glass" initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
        <div style={{ fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Iyappan N</div>
        <nav className="nav-links">
          <a href="#about">About</a>
          <a href="#skills">Skills</a>
          <a href="#products">Products</a>
          <a href="#projects">Projects</a>
          <a href="#contact">Contact</a>
          <a href="/resume.pdf" download>Resume</a>
        </nav>
      </motion.header>

      <PortfolioContent displayText={displayText} />

      {showBackToTop ? (
        <button className="back-to-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Back to top">
          ↑
        </button>
      ) : null}
      <footer>
        <div className="footer-links">
          <a href="https://github.com/Iyappan1703" aria-label="GitHub"><FaGithub /></a>
          <a href="https://linkedin.com/in/iyappan-n-a720b2315" aria-label="LinkedIn"><FaLinkedin /></a>
          <a href="mailto:iyappan3170@gmail.com" aria-label="Email"><FaEnvelope /></a>
        </div>
        © 2026 Iyappan N. Crafted with modern design and engineering curiosity.
      </footer>
      </div>
    </>
  );
}

export default App;
