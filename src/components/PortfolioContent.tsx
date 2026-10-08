import { motion } from 'framer-motion';
import {
  FaAward,
  FaBug,
  FaBriefcase,
  FaCode,
  FaCodeBranch,
  FaDownload,
  FaEnvelope,
  FaGithub,
  FaGraduationCap,
  FaInstagram,
  FaLaptopCode,
  FaLightbulb,
  FaLinkedin,
  FaMicrochip,
  FaMapMarkerAlt,
  FaPalette,
  FaPhone,
  FaRocket,
  FaShieldAlt,
  FaTools,
} from 'react-icons/fa';
import profile from '../assets/profile.jpg.jpeg';

const skills = [
  { name: 'Python', icon: <FaCode /> },
  { name: 'HTML', icon: <FaCode /> },
  { name: 'CSS', icon: <FaPalette /> },
  { name: 'JavaScript', icon: <FaCode /> },
  { name: 'React', icon: <FaRocket /> },
  { name: 'Figma', icon: <FaPalette /> },
  { name: 'Canva', icon: <FaPalette /> },
  { name: 'Git', icon: <FaCodeBranch /> },
  { name: 'GitHub', icon: <FaGithub /> },
  { name: 'VS Code', icon: <FaLaptopCode /> },
  { name: 'Bug Bounty', icon: <FaBug /> },
  { name: 'Basic IoT', icon: <FaMicrochip /> },
];

const featuredProducts = [
  {
    title: 'Emergency SOS Band',
    subtitle: 'Smart Emergency Safety Prototype',
    description:
      'Developed under BELIEF & OpenOrbit 100 Days Challenge and presented at IKMC 2025, this prototype focuses on rapid emergency response and personal safety.',
    icon: <FaShieldAlt />,
  },
  {
    title: 'Automatic Disc Lock System',
    subtitle: 'Smart Motorcycle Security Prototype',
    description:
      'An ignition-based secure locking concept designed to strengthen motorcycle protection and provide an intelligent anti-theft mechanism.',
    icon: <FaTools />,
  },
];

const projects = [
  {
    title: 'Money Laundering Pattern Detection',
    description:
      'An analytical project focused on identifying suspicious financial behaviors through intelligent pattern recognition and risk-based insights.',
  },
  {
    title: 'Gamified Learning Platform',
    description:
      'A student-focused learning experience designed to make education interactive, engaging, and motivating through playful progression.',
  },
  {
    title: 'Aqua Meta',
    description:
      'A forward-looking sustainability solution that blends emerging tech with practical environmental awareness and digital innovation.',
  },
];

const experiences = [
  {
    role: 'Help Desk Intern',
    company: 'AdroIT Technologies',
    period: 'Internship Experience',
    details: 'Worked in an IT support environment, strengthening troubleshooting, communication, and practical problem-solving abilities.',
  },
  {
    role: 'R&D Product Development Team',
    company: 'Innovation Focus',
    period: 'Project-Based Experience',
    details: 'Contributed to brainstorming, prototyping, and building concepts that connect engineering with real-world usability.',
  },
];

const certificates = [
  'Oracle AI Foundations Associate',
  'NPTEL IoT Elite',
  'NPTEL Industry 4.0 Elite',
  'Help Desk Internship',
];

const achievements = ['NCC A Certificate', 'NSS Volunteer', 'IIC Member'];

const heroLine = 'UI/UX Designer • Frontend Developer • Python Developer';

export function PortfolioContent({ displayText }: { displayText: string }) {
  return (
    <main className="main-content">
      <motion.section
        className="hero glass"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div>
          <div className="eyebrow">
            <FaRocket />
            Computer Science and Engineering Student
          </div>
          <h1>Hi, I'm Iyappan N</h1>
          <motion.h2 className="typing-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35 }}>
            {displayText || heroLine}
          </motion.h2>
          <p>
            I am passionate about UI/UX Design, Frontend Development, Python, Cybersecurity, and Product Development. I enjoy building practical engineering solutions that solve real-world problems while creating modern digital experiences.
          </p>
          <div className="hero-actions">
            <motion.a className="btn btn-primary" href="/resume.pdf" download whileHover={{ scale: 1.04, y: -2, rotate: -0.3 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 260, damping: 18 }}>
              <FaDownload /> Download Resume
            </motion.a>
            <motion.a className="btn btn-secondary" href="#contact" whileHover={{ scale: 1.03, y: -2 }} whileTap={{ scale: 0.97 }} transition={{ type: 'spring', stiffness: 220, damping: 16 }}>
              <FaEnvelope /> Contact Me
            </motion.a>
          </div>
        </div>

        <div className="hero-right">
          <motion.div className="profile-frame" animate={{ y: [0, -10, 0],}} transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }} whileHover={{ scale: 1.03, y: -6 }}>
            <img src={profile} alt="Iyappan N profile" />
          </motion.div>
          <div className="hero-panel">
            <div className="eyebrow">
              <FaLightbulb />
              Current Focus
            </div>
            <h3 style={{ margin: '0 0 8px' }}>UI/UX • Frontend • Cybersecurity • Product Thinking</h3>
            <p className="muted">
              Combining creativity and engineering to turn ideas into trustworthy, user-friendly products.
            </p>
            <div className="stat-grid">
              <div className="stat">
                <strong>4+</strong>
                <div className="muted">Domains</div>
              </div>
              <div className="stat">
                <strong>3+</strong>
                <div className="muted">Projects</div>
              </div>
              <div className="stat">
                <strong>100%</strong>
                <div className="muted">Driven</div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section id="about" className="section-card glass" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
        <div className="section-heading">
          <h2>About</h2>
          <span className="muted">Passion • Purpose • Progress</span>
        </div>
        <p className="muted" style={{ margin: 0 }}>
          I am a Computer Science and Engineering student passionate about creating beautiful interfaces, building practical products, and exploring technology that makes a difference. My interests span UI/UX Design, Frontend Development, Python, Cybersecurity, and Product Development.
        </p>
      </motion.section>


      <motion.section id="skills" className="section-card glass" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
        <div className="section-heading">
          <h2>Skills</h2>
          <span className="muted">Technical & creative toolkit</span>
        </div>
        <div className="card-grid grid-3">
          {skills.map((skill, index) => (
            <motion.div key={skill.name} className="skill-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.04 }} whileHover={{ y: -6, scale: 1.01 }}>
              <div className="icon-pill">{skill.icon}</div>
              <div>{skill.name}</div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section id="products" className="section-card glass" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
        <div className="section-heading">
          <h2>Featured Products</h2>
          <span className="muted">Prototype innovation</span>
        </div>
        <div className="card-grid grid-2">
          {featuredProducts.map((item, index) => (
            <motion.div key={item.title} className="product-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.05 }} whileHover={{ y: -6, scale: 1.01 }}>
              <div className="icon-pill" style={{ fontSize: '1.3rem', marginBottom: 8 }}>{item.icon}</div>
              <h3 style={{ margin: '0 0 6px' }}>{item.title}</h3>
              <p style={{ margin: '0 0 8px', color: '#8fdfff', fontWeight: 600 }}>{item.subtitle}</p>
              <p className="muted" style={{ margin: 0 }}>{item.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section id="projects" className="section-card glass" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
        <div className="section-heading">
          <h2>Projects</h2>
          <span className="muted">Selected work</span>
        </div>
        <div className="card-grid grid-3">
          {projects.map((project, index) => (
            <motion.div key={project.title} className="project-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.05 }} whileHover={{ y: -6, scale: 1.01 }}>
              <h3 style={{ margin: '0 0 8px' }}>{project.title}</h3>
              <p className="muted" style={{ margin: 0 }}>{project.description}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section id="experience" className="section-card glass" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
        <div className="section-heading">
          <h2>Experience</h2>
          <span className="muted">Professional exposure</span>
        </div>
        <div className="card-grid grid-2">
          {experiences.map((item, index) => (
            <motion.div key={item.role} className="experience-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.05 }} whileHover={{ y: -6, scale: 1.01 }}>
              <div className="eyebrow" style={{ marginBottom: 10 }}>
                <FaBriefcase />
                {item.period}
              </div>
              <h3 style={{ margin: '0 0 8px' }}>{item.role}</h3>
              <p style={{ margin: '0 0 6px', color: '#8fdfff' }}>{item.company}</p>
              <p className="muted" style={{ margin: 0 }}>{item.details}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section id="certificates" className="section-card glass" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
        <div className="section-heading">
          <h2>Certificates</h2>
          <span className="muted">Recognitions</span>
        </div>
        <div className="card-grid grid-3">
          {certificates.map((cert, index) => (
            <motion.div key={cert} className="cert-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.05 }} whileHover={{ y: -6, scale: 1.01 }}>
              <div className="icon-pill" style={{ marginBottom: 6 }}><FaGraduationCap /></div>
              <h3 style={{ margin: '0 0 6px' }}>{cert}</h3>
              <p className="muted" style={{ margin: 0 }}>Certified achievement</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section id="achievements" className="section-card glass" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
        <div className="section-heading">
          <h2>Achievements</h2>
          <span className="muted">Leadership & service</span>
        </div>
        <div className="card-grid grid-3">
          {achievements.map((achievement, index) => (
            <motion.div key={achievement} className="achievement-card" initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.45, delay: index * 0.05 }} whileHover={{ y: -6, scale: 1.01 }}>
              <div className="icon-pill" style={{ marginBottom: 6 }}><FaAward /></div>
              <h3 style={{ margin: '0 0 6px' }}>{achievement}</h3>
            </motion.div>
          ))}
        </div>
      </motion.section>

      <motion.section id="contact" className="section-card glass" initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5 }}>
        <div className="contact-card">
          <div>
            <div className="eyebrow">
              <FaEnvelope />
              Let’s connect
            </div>
            <h2 style={{ margin: '0 0 8px' }}>Open to collaboration, innovation, and meaningful work.</h2>
            <p className="muted" style={{ margin: 0 }}>I’m always excited to connect with people building thoughtful products and impactful technology.</p>
            <div className="contact-list">
              <a className="contact-item" href="mailto:iyappan3170@gmail.com" aria-label="Email">
                <FaEnvelope />
                <span>Email:</span>
                iyappan3170@gmail.com
              </a>
              <a className="contact-item" href="tel:+916384918900" aria-label="Phone 1">
                <FaPhone />
                <span>Phone 1:</span>
                +91 6384918900
              </a>
              <a className="contact-item" href="tel:+918072568913" aria-label="Phone 2">
                <FaPhone />
                <span>Phone 2:</span>
                +91 8072568913
              </a>
              <div className="contact-item">
                <FaMapMarkerAlt />
                <span>Location:</span>
                Chennai, Tamil Nadu, India
              </div>
              <a className="contact-item" href="https://github.com/iyappan-n" target="_blank" rel="noreferrer" aria-label="GitHub">
                <FaGithub />
                <span>GitHub:</span>
                https://github.com/iyappan-n
              </a>
              <a className="contact-item" href="https://linkedin.com/in/iyappan-n" target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <FaLinkedin />
                <span>LinkedIn:</span>
                linkedin.com/in/iyappan-n
              </a>
              <a className="contact-item" href="https://instagram.com/iyappan__1703" target="_blank" rel="noreferrer" aria-label="Instagram">
                <FaInstagram />
                <span>Instagram:</span>
                instagram.com/iyappan__1703
              </a>
            </div>
          </div>
          <div className="socials">
            <a href="https://github.com/iyappan-n" target="_blank" rel="noopener noreferrer" aria-label="GitHub"><FaGithub /></a>
            <a href="https://linkedin.com/in/iyappan-n" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
            <a href="https://instagram.com/iyappan__1703" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
            <a href="mailto:iyappan3170@gmail.com" aria-label="Email"><FaEnvelope /></a>
          </div>
        </div>
      </motion.section>
    </main>
  );
}
