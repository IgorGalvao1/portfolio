export type Project = {
  id: string
  name: string
  category: 'Profissional' | 'Pessoal'
  description: string
  tools: string[]
  url: string
}

export const projects: Project[] = [
  {
    id: 'rs3000',
    name: 'Orion RS3000',
    category: 'Profissional',
    description:
      'Desenhei e programei a página do RS3000. Otimizei o modelo 3D do equipamento para que o visitante pudesse explorá-lo direto no navegador.',
    tools: ['Vue.js', 'Three.js', 'GSAP', 'Tailwind CSS'],
    url: 'https://orion.ind.br/products/rs3000',
  },
  {
    id: 'senna',
    name: 'Ayrton Senna',
    category: 'Pessoal',
    description:
      'Reuni a história, as conquistas e os momentos marcantes de Senna em uma homenagem que combina animação e cenas em 3D.',
    tools: ['React', 'Three.js', 'GSAP', 'Tailwind CSS'],
    url: 'https://ayrtonsenna.vercel.app/',
  },
  {
    id: 'extremejet',
    name: 'ExtremeJet',
    category: 'Profissional',
    description:
      'Criei o design e as interações que colocam dois bicos de aplicação lado a lado. Os vídeos mostram como o jato do ExtremeJet se comporta em relação ao convencional.',
    tools: ['Vue.js', 'GSAP', 'Tailwind CSS'],
    url: 'https://orion.ind.br/extremejet-a-nova-tecnologia-de-bicos-de-aplicacao',
  },
  {
    id: 'ipod',
    name: 'iPod Classic',
    category: 'Pessoal',
    description:
      'Um iPod repousa sobre a mesa de uma sala em 3D. Ao entrar, ele se levanta e liga. Programei a interface da tela para navegar pela seleção de músicas e dar o play.',
    tools: ['React', 'Three.js', 'React Three Fiber'],
    url: 'https://ipod-classic-omega.vercel.app/',
  },
  {
    id: 'seed-saving',
    name: 'Seed Saving',
    category: 'Profissional',
    description:
      'Do design ao código, construí a apresentação do sistema de eletrificação de plantadeiras da Orion. Usei animações para explicar os benefícios do equipamento.',
    tools: ['Vue.js', 'GSAP', 'Tailwind CSS'],
    url: 'https://orion.ind.br/products/seed-saving',
  },
  {
    id: 'iphone',
    name: 'iPhone 17 Pro Max',
    category: 'Pessoal',
    description:
      'Vinculei a posição e a rotação de um iPhone em 3D à rolagem da página. O movimento aproxima, afasta e vira o aparelho para mostrar seus detalhes.',
    tools: ['React', 'Three.js', 'GSAP'],
    url: 'https://iphone-demonstration.vercel.app/',
  },
]
