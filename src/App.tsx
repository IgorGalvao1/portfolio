import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import Aurora from './Aurora'
import TechnologyGlobe from './TechnologyGlobe'
import { projects, type Project } from './projects'

const github = 'https://github.com/igorgalvao1'
const sections = [
  { id: 'inicio', label: 'Início' },
  { id: 'projetos', label: 'Projetos' },
  { id: 'sobre', label: 'Sobre' },
]
const auroraColors = ['#1e3d91', '#2586c7', '#69efbd', '#197685', '#202f76']

function Brand() {
  return (
    <a className="brand" href="#inicio" aria-label="Igor Galvão, início">
      <span className="monogram" aria-hidden="true">
        ig<span>.</span>
      </span>
    </a>
  )
}

function Header() {
  const [active, setActive] = useState('inicio')
  useEffect(() => {
    const sync = () => {
      if (
        window.scrollY + innerHeight >=
        document.documentElement.scrollHeight - 2
      ) {
        setActive('sobre')
        return
      }
      const threshold = Math.min(innerHeight * 0.35, 210)
      const current = sections.filter(
        ({ id }) =>
          (document.getElementById(id)?.getBoundingClientRect().top ??
            Infinity) <= threshold,
      )
      setActive(current.at(-1)?.id ?? 'inicio')
    }
    sync()
    window.addEventListener('scroll', sync, { passive: true })
    window.addEventListener('resize', sync)
    return () => {
      window.removeEventListener('scroll', sync)
      window.removeEventListener('resize', sync)
    }
  }, [])
  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Brand />
        <nav aria-label="Navegação principal">
          {sections.map(({ id, label }) => (
            <a
              key={id}
              href={'#' + id}
              aria-current={active === id ? 'location' : undefined}
            >
              {label}
            </a>
          ))}
        </nav>
        <a
          className="github-button"
          href={github}
          target="_blank"
          rel="noreferrer"
        >
          <img src="/icons/github.svg" alt="" width="16" height="16" />{' '}
          <span>GitHub</span>
        </a>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section
      className="hero"
      id="inicio"
      aria-labelledby="hero-title"
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
            <p className="hero-lead">
              Crio interfaces para a web, da visualização de dados agrícolas a
              experiências interativas em 3D.
            </p>
            <div className="actions">
              <a className="primary-button" href="#projetos">
                Ver projetos
              </a>
              <a className="text-button" href="#sobre">
                Sobre mim
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

const filters = [
  { title: 'Todos', category: null },
  { title: 'Profissionais', category: 'Profissional' },
  { title: 'Pessoais', category: 'Pessoal' },
] as const

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
            sizes="(max-width: 700px) calc(100vw - 40px), (max-width: 900px) calc((100vw - 90px) / 2), (max-width: 1529px) calc(45vw - 13px), 675px"
            alt=""
            loading="lazy"
            width="1152"
            height="720"
          />
          <span className="open-project">
            <ExternalLink size={17} />
          </span>
        </div>
        <div className="project-topline">
          <span>{project.category}</span>
        </div>
        <h3>{project.name}</h3>
      </a>
      <p>{project.description}</p>
      <ul className="tags" aria-label="Tecnologias do projeto">
        {project.tools.map((tool) => (
          <li key={tool}>{tool}</li>
        ))}
      </ul>
    </article>
  )
}

function Projects() {
  const [filter, setFilter] =
    useState<(typeof filters)[number]['category']>(null)
  const visible = projects.filter(
    (project) => !filter || project.category === filter,
  )
  return (
    <section
      id="projetos"
      className="work section"
      aria-labelledby="work-title"
    >
      <div className="wrap">
        <div className="work-heading">
          <h2 id="work-title">
            Projetos selecionados<span className="punctuation">.</span>
          </h2>
          <div className="filters" role="group" aria-label="Filtrar projetos">
            {filters.map((item) => (
              <button
                type="button"
                key={item.title}
                aria-pressed={filter === item.category}
                onClick={() => setFilter(item.category)}
              >
                {item.title}
                <span>
                  {String(
                    projects.filter(
                      (p) => !item.category || p.category === item.category,
                    ).length,
                  ).padStart(2, '0')}
                </span>
              </button>
            ))}
          </div>
        </div>
        <p role="status" className="sr-only">
          {visible.length} projetos exibidos.
        </p>
        <div className="project-grid">
          {visible.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
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
          <a className="primary-button" href="#inicio">Voltar para cima</a>
        </div>
      </div>
    </section>
  )
}

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Projects />
        <About />
      </main>
    </>
  )
}
