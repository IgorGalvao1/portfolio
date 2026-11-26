import { useLayoutEffect, useRef } from 'react'
import { ExternalLink } from 'lucide-react'
import Aurora from './Aurora'
import TechnologyGlobe from './TechnologyGlobe'
import { enablePortfolioScroll, scrollToTop } from './portfolioScroll'
import { projects, type Project } from './projects'

const github = 'https://github.com/igorgalvao1'
const auroraColors = ['#1e3d91', '#2586c7', '#69efbd', '#197685', '#202f76']

function Hero() {
  return (
    <section
      className="hero"
      id="inicio"
      aria-labelledby="hero-title"
      tabIndex={-1}
      data-enter
    >
      <div className="hero-stage">
        <div className="hero-sky">
          <Aurora
            colorStops={auroraColors}
            amplitude={1}
            blend={0.5}
            height={0.45}
            speed={1}
            glow={0.6}
            scale={1}
            brightness={1}
            layers={1}
            direction="top"
            opacity={1}
            mouseInteraction
            intro
            lightMode={false}
          />
        </div>
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <p className="eyebrow hero-role">Desenvolvedor front-end</p>
            <h1 id="hero-title">Igor Galvão</h1>
          </div>
        </div>
      </div>
    </section>
  )
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="project-card">
      <a
        className="project-link"
        href={project.url}
        target="_blank"
        rel="noreferrer"
        aria-label={'Abrir projeto ' + project.name + ' em uma nova aba'}
      >
        <div className="project-image">
          <img
            src={'/projetos/' + project.id + '.webp'}
            srcSet={
              '/projetos/compactas/' +
              project.id +
              '.webp 640w, /projetos/' +
              project.id +
              '.webp 1152w'
            }
            sizes="min(78vw, clamp(460px, 54vw, 760px), max(300px, 80svh))"
            alt=""
            loading="lazy"
            width="1152"
            height="720"
          />
          <span className="open-project">
            <ExternalLink size={17} />
          </span>
        </div>
        <div className="project-details">
          <div className="project-topline">
            <span>{project.category}</span>
          </div>
          <h3>{project.name}</h3>
        </div>
      </a>
      <div className="project-details">
        <p>{project.description}</p>
        <ul className="tags" aria-label="Tecnologias do projeto">
          {project.tools.map((tool) => (
            <li key={tool}>{tool}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}

function Projects() {
  return (
    <section
      id="projetos"
      className="projects"
      aria-labelledby="work-title"
    >
      <div className="projects-stage section">
        <div className="wrap work-heading">
          <h2 id="work-title">
            Projetos selecionados<span className="punctuation">.</span>
          </h2>
        </div>
        <div className="project-viewport">
          <div className="project-track">
            {projects.map((project) => (
              <div className="project-slide" key={project.id}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function About() {
  return (
    <section
      id="sobre"
      className="about section"
      aria-labelledby="about-title"
    >
      <div className="wrap">
        <div className="about-layout">
          <div className="about-intro">
            <h2 id="about-title">
              Sobre mim<span className="punctuation">.</span>
            </h2>
            <p className="about-lead">
              Me formei em Big Data no Agronegócio na Fatec Shunji Nishimura e
              trabalhei com aplicações web para o setor no Grupo Orion.
            </p>
            <p>
              No grupo, comecei como estagiário de TI e depois atuei como
              desenvolvedor front-end júnior. Na CygniAG, plataforma de
              monitoramento agrícola, ajudei a reduzir em cerca de 90% o tempo
              necessário para processar e exibir imagens de satélite no front.
            </p>
            <p>
              Também trabalhei nos sites do grupo, criando experiências
              interativas com Three.js e otimizando modelos 3D para rodar no
              navegador.
            </p>
          </div>
          <TechnologyGlobe />
          <a
            href={github}
            className="profile-link"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="/icons/github.svg"
              alt=""
              width="16"
              height="16"
              loading="lazy"
            />{' '}
            @igorgalvao1 <ExternalLink size={14} aria-hidden="true" />
          </a>
        </div>
        <div className="back-to-top">
          <a className="primary-button" href="#inicio" onClick={scrollToTop}>
            Voltar para cima
          </a>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    if (wrapperRef.current && contentRef.current) {
      return enablePortfolioScroll(wrapperRef.current, contentRef.current)
    }
  }, [])

  return (
    <>
      <a className="skip-link" href="#main" onClick={scrollToTop}>
        Pular para o conteúdo
      </a>
      <div ref={wrapperRef}>
        <main id="main" ref={contentRef} tabIndex={-1}>
          <Hero />
          <Projects />
          <About />
        </main>
      </div>
    </>
  )
}
