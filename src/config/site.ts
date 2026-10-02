/** Edite este arquivo ao criar uma versão para outro consultório. */
import ogImageSettings from "./og-image.json";
export type SectionKey =
  | "approach" | "services" | "space" | "about" | "professional"
  | "gallery" | "testimonials" | "faq" | "location" | "contact";

export interface Link {
  label: string;
  href: string;
  /** Oculta o link quando a seção correspondente estiver desativada. */
  section?: SectionKey;
}

export interface Action {
  label: string;
  href: string;
}

export interface ImageAsset {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface SiteConfig {
  seo: {
    title: string; description: string; themeColor: string; favicon: string;
    /** URL pública da página inicial. Preencha antes de publicar para ativar URLs absolutas nos metadados sociais. */
    siteUrl: string;
    openGraph: {
      image: string; imageAlt: string; title?: string; description?: string;
      imageWidth?: number; imageHeight?: number; imageType?: string;
    };
  };
  theme: {
    blue: string; blueDeep: string; navy: string; dark: string; muted: string;
    paper: string; line: string; ctaAccent: string; pageBackground: string;
    deepSection: string; heroBase: string; footerGradient: string;
    displayFont: string; bodyFont: string; googleFontsUrl: string;
  };
  brand: {
    name: string; logoText: string; logoImage?: ImageAsset;
    footerWords: string[]; footerWordmarkFontSize?: string; profession: string;
  };
  sections: Record<SectionKey, boolean>;
  navigation: {
    menuLabel: string; menuGreeting: string[]; feature: Action;
    booking: Action; links: Link[];
  };
  hero: { title: string; intro: string; backgroundImage: string; cta: Action };
  approach: {
    firstLine: string; secondLine: string; inlineImage: ImageAsset;
    items: { number: string; title: string; description: string }[];
  };
  services: {
    titleLines: string[]; intro: string;
    items: {
      title: string; description: string; href: string; linkLabel: string;
      iconPaths: string[]; background: string; iconColor: string;
    }[];
  };
  space: {
    title: string; intro: string; highlights: string[];
    image: ImageAsset; imageCaption: string;
  };
  about: { title: string; paragraphs: string[]; image: ImageAsset; cta: Action };
  professional: {
    title: string; intro: string;
    items: {
      image: ImageAsset; index: string; nameLines: string[];
      role: string; bio: string; cta: Action;
    }[];
  };
  gallery: {
    title: string; intro: string; trackLabel: string;
    /** Velocidade constante do movimento automático, em pixels por segundo. */
    pixelsPerSecond: number;
    items: { image: ImageAsset; caption?: string; objectPosition?: string }[];
  };
  testimonials: {
    title: string; intro: string; trackLabel: string;
    items: {
      name: string; rating: string; stars: string; avatar: {
        src: string; position: string; size: string;
      }; paragraphs: string[]; signature: string;
    }[];
  };
  faq: { title: string; intro: string; items: { question: string; answer: string }[] };
  location: {
    title: string; intro: string; cta: Action;
    mapQuery: string; mapZoom: number; mapTitle: string;
  };
  contact: {
    title: string; intro: string;
    fields: {
      name: { label: string; placeholder: string };
      email: { label: string; placeholder: string };
      phone: { label: string; placeholder: string };
      subject: { label: string; options: string[] };
      message: { label: string; placeholder: string };
    };
    submitLabel: string; note: string; resultTitle: string;
    copyLabel: string; copiedLabel: string; copyFailureLabel: string;
    messageTemplate: string; phoneSuffix: string;
    delivery: { mode: "copy" | "whatsapp"; whatsappNumber?: string; whatsappLabel: string };
  };
  footer: {
    message: string; cta: Action; navigationHeading: string;
    servicesHeading: string; copyright: string; disclaimer: string;
    backToTop: string;
  };
}

export const site: SiteConfig = {
  seo: {
    title: "Marina Costa | Odontologia individual",
    description: "Conheça a odontologia individual de Marina Costa: tratamentos, abordagem e um espaço para conversar sobre seu sorriso.",
    themeColor: "#169af3",
    siteUrl: "",
    openGraph: {
      image: `/${ogImageSettings.fileName}`,
      imageAlt: ogImageSettings.imageAlt,
      imageWidth: 1200,
      imageHeight: 630,
      imageType: "image/png",
    },
    favicon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' rx='17' fill='%23169af3'/%3E%3Cpath d='M20 16c-8 2-8 12-5 21 3 8 5 12 9 12 4 0 3-13 8-13s4 13 8 13c4 0 6-4 9-12 3-9 3-19-5-21-5-2-8 2-12 2s-7-4-12-2Z' fill='none' stroke='white' stroke-width='4' stroke-linejoin='round'/%3E%3C/svg%3E",
  },
  theme: {
    blue: "#1599f4", blueDeep: "#087fdc", navy: "#073f4b",
    dark: "#142b32", muted: "#60727a", paper: "#f5f7f5",
    line: "#e1e8e8", ctaAccent: "#871320", pageBackground: "#e6f5fb",
    deepSection: "#07424c", heroBase: "#1d3d48",
    footerGradient: "linear-gradient(180deg,#010609 0%,#001522 38%,#003e69 100%)",
    displayFont: "Manrope, Arial, sans-serif",
    bodyFont: '"DM Sans", Arial, sans-serif',
    googleFontsUrl: "https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap",
  },
  brand: {
    name: "Marina Costa", logoText: "marina costa", footerWords: ["marina", "costa"],
    profession: "Odontologia individual",
  },
  sections: {
    approach: true, services: true, space: true, about: true,
    professional: true, gallery: true, testimonials: true, faq: true,
    location: true, contact: true,
  },
  navigation: {
    menuLabel: "Menu", menuGreeting: ["Olá, eu sou", "Marina Costa."],
    feature: { label: "Conheça os serviços", href: "#servicos" },
    booking: { label: "Vamos conversar", href: "#contato" },
    links: [
      { label: "Início", href: "#inicio" },
      { label: "Serviços", href: "#servicos", section: "services" },
      { label: "Sobre", href: "#sobre", section: "about" },
      { label: "Profissional", href: "#profissional", section: "professional" },
      { label: "Dúvidas", href: "#duvidas", section: "faq" },
      { label: "Localização", href: "#localizacao", section: "location" },
      { label: "Contato", href: "#contato", section: "contact" },
    ],
  },
  hero: {
    title: "Seu sorriso merece um novo olhar.",
    intro: "Odontologia individual, gentil e pensada para ajudar você a entender cada passo do cuidado.",
    backgroundImage: "/assets/hero-clinic-appointment.webp",
    cta: { label: "Explorar serviços", href: "#servicos" },
  },
  approach: {
    firstLine: "Cuidado de verdade começa com escuta",
    secondLine: "e segue com clareza em cada escolha.",
    inlineImage: { src: "/assets/marina-portrait.webp", alt: "", width: 96, height: 45 },
    items: [
      { number: "01", title: "Primeiro, ouvir você.", description: "Um espaço para contar o que sente, tirar dúvidas e compartilhar o que espera do seu sorriso." },
      { number: "02", title: "Entender as possibilidades.", description: "Cada caminho de cuidado é explicado com calma para que você participe das decisões." },
      { number: "03", title: "Seguir no seu ritmo.", description: "Um plano pensado para suas necessidades, respeitando seu tempo e suas prioridades." },
    ],
  },
  services: {
    titleLines: ["Serviços para cada fase", "do seu sorriso."],
    intro: "Conheça as frentes de atendimento. A melhor opção depende de uma avaliação individual.",
    items: [
      { title: "Prevenção", description: "Consultas, limpeza e orientações para o cuidado diário.", href: "#contato", linkLabel: "Conversar sobre prevenção", background: "#edf9fd", iconColor: "#238acb", iconPaths: ["M15 8c-7 2-8 9-5 18 2 6 4 14 8 14 4 0 2-13 6-13s2 13 6 13c4 0 6-8 8-14 3-9 2-16-5-18-4-1-6 2-9 2s-5-3-9-2Z"] },
      { title: "Estética dental", description: "Possibilidades para harmonizar forma e cor com naturalidade.", href: "#contato", linkLabel: "Conversar sobre estética dental", background: "#fff0f1", iconColor: "#ee7890", iconPaths: ["M7 30c8-4 13-5 17-5s9 1 17 5M11 29c3 8 8 12 13 12s10-4 13-12M13 15c3-5 6-8 11-8s8 3 11 8M12 19h24", "M24 6v7"] },
      { title: "Alinhamento", description: "Avaliação de caminhos para melhorar a posição dos dentes.", href: "#contato", linkLabel: "Conversar sobre alinhamento", background: "#effbf0", iconColor: "#66b77b", iconPaths: ["M9 22c4-3 10-5 15-5s11 2 15 5M10 28c5 3 9 5 14 5s9-2 14-5M9 22v6m30-6v6", "M16 18v13m8-14v16m8-15v13"] },
      { title: "Restaurações", description: "Cuidado para recuperar a estrutura e a função dos dentes.", href: "#contato", linkLabel: "Conversar sobre restaurações", background: "#f8effb", iconColor: "#cb68cb", iconPaths: ["M16 9c-6 1-7 7-5 15 1 4 3 13 7 14 4 1 3-11 6-11s2 12 6 11c4-1 6-10 7-14 2-8 1-14-5-15-3-1-5 2-8 2s-5-3-8-2Z", "M17 20h14m-7-7v14"] },
    ],
  },
  space: {
    title: "Um espaço para se sentir à vontade.",
    intro: "Um ambiente claro e acolhedor ajuda a transformar a experiência de cuidar do sorriso em algo mais tranquilo.",
    highlights: ["Tempo para conversar", "Explicações sem complicar", "Atenção aos detalhes"],
    image: { src: "/assets/clinic.webp", alt: "Interior claro de um consultório odontológico", width: 1536, height: 1024 },
    imageCaption: "Conheça o espaço ↗",
  },
  about: {
    title: "Uma conversa antes de qualquer tratamento.",
    paragraphs: [
      "Você chega com uma história, expectativas e perguntas. O cuidado começa por entender tudo isso antes de definir os próximos passos.",
      "O objetivo é que você conheça as possibilidades e participe das decisões com tranquilidade.",
    ],
    image: { src: "/assets/hero-dentist.png", alt: "Retrato ilustrativo da profissional", width: 1024, height: 1536 },
    cta: { label: "Perguntas frequentes", href: "#duvidas" },
  },
  professional: {
    title: "Conheça quem cuida do seu sorriso.",
    intro: "Uma presença próxima em cada etapa do seu cuidado.",
    items: [{
      image: { src: "/assets/marina-portrait.webp", alt: "Retrato ilustrativo de Marina Costa em um consultório odontológico", width: 1160, height: 1363 },
      index: "01 / 01", nameLines: ["Marina", "Costa"], role: "Odontologia individual",
      bio: "Marina acredita que conhecer a pessoa vem antes de planejar qualquer tratamento. Sua proposta une atenção aos detalhes, explicações claras e espaço para uma conversa sem pressa.",
      cta: { label: "Vamos conversar", href: "#contato" },
    }],
  },
  gallery: {
    title: "O cuidado também se vê de perto.",
    intro: "Um espaço para mostrar as pessoas, os encontros e os detalhes que fazem parte da clínica.",
    trackLabel: "Galeria de fotos demonstrativas da clínica",
    pixelsPerSecond: 42,
    items: [
      { image: { src: "/assets/gallery-smile.webp", alt: "Imagem ilustrativa de pessoa sorrindo em uma clínica odontológica", width: 760, height: 1140 }, caption: "Sorrisos que inspiram" },
      { image: { src: "/assets/gallery-conversation.webp", alt: "Imagem ilustrativa de dentista e paciente conversando no consultório", width: 760, height: 1140 }, caption: "Tempo para conversar" },
      { image: { src: "/assets/clinic.webp", alt: "Interior claro do consultório odontológico", width: 1774, height: 887 }, objectPosition: "55% center" },
      { image: { src: "/assets/gallery-team.webp", alt: "Imagem ilustrativa de equipe odontológica conversando com paciente", width: 760, height: 1140 }, caption: "Cuidado em equipe" },
      { image: { src: "/assets/gallery-patient.webp", alt: "Imagem ilustrativa de paciente sorrindo durante conversa com dentista", width: 760, height: 1140 } },
      { image: { src: "/assets/hero-clinic-appointment.webp", alt: "Atendimento odontológico em consultório", width: 1774, height: 887 }, caption: "De perto, em cada etapa", objectPosition: "72% center" },
    ],
  },
  testimonials: {
    title: "Cada experiência tem uma história.",
    intro: "Uma prévia de como os relatos podem aparecer neste espaço.",
    trackLabel: "Exemplos de avaliações",
    items: [
      { name: "Rafael Lima", rating: "5.0", stars: "★★★★★", avatar: { src: "/assets/patient-triptych.webp", position: "0 0", size: "300% 100%" }, paragraphs: ["Eu sempre ficava ansioso antes de uma consulta, mas me senti à vontade desde a primeira conversa.", "As explicações foram claras e pude entender cada etapa com tranquilidade."], signature: "Marina Costa" },
      { name: "Camila Rocha", rating: "5.0", stars: "★★★★★", avatar: { src: "/assets/patient-triptych.webp", position: "50% 0", size: "300% 100%" }, paragraphs: ["Gostei de ter tempo para fazer perguntas e conversar sobre as possibilidades para o meu sorriso.", "O cuidado foi atencioso em todos os detalhes."], signature: "Marina Costa" },
      { name: "Luiza Martins", rating: "5.0", stars: "★★★★★", avatar: { src: "/assets/patient-triptych.webp", position: "100% 0", size: "300% 100%" }, paragraphs: ["Encontrei um ambiente acolhedor e uma conversa sem pressa para entender o que eu precisava.", "Saí com mais segurança para decidir os próximos passos."], signature: "Marina Costa" },
    ],
  },
  faq: {
    title: "É bom perguntar.",
    intro: "Respostas gerais para você entender o cuidado. Orientações específicas dependem de avaliação.",
    items: [
      { question: "Como saber qual tratamento é indicado?", answer: "A indicação depende da avaliação clínica e dos seus objetivos. Na consulta, converse sobre opções, etapas e cuidados necessários." },
      { question: "Com que frequência devo fazer uma consulta?", answer: "O intervalo varia conforme suas necessidades de saúde bucal. Um profissional pode orientar a frequência adequada para você." },
      { question: "Tratamentos estéticos são iguais para todos?", answer: "Não. Forma, cor e técnicas precisam considerar a saúde dos dentes, as características do sorriso e suas expectativas." },
    ],
  },
  location: {
    title: "Um lugar para se sentir à vontade.",
    intro: "Veja uma localização de exemplo em São Paulo. O endereço real do consultório ainda será definido; para saber mais sobre o atendimento, entre em contato.",
    cta: { label: "Pedir informações", href: "#contato" },
    mapQuery: "Parque Ibirapuera, São Paulo", mapZoom: 14,
    mapTitle: "Google Maps: Parque Ibirapuera, São Paulo — localização de exemplo",
  },
  contact: {
    title: "Conte o que você procura para o seu sorriso.",
    intro: "Deixe sua mensagem pronta para compartilhar pelo canal de atendimento quando ele for configurado.",
    fields: {
      name: { label: "Seu nome", placeholder: "Como podemos chamar você?" },
      email: { label: "E-mail", placeholder: "voce@exemplo.com" },
      phone: { label: "Telefone (opcional)", placeholder: "(11) 99999-9999" },
      subject: { label: "Assunto", options: ["Primeira consulta", "Prevenção", "Estética dental", "Alinhamento", "Restaurações"] },
      message: { label: "Sua mensagem", placeholder: "O que você gostaria de conversar?" },
    },
    submitLabel: "Preparar mensagem",
    note: "Demonstração: nenhum dado é enviado pelo site. A mensagem fica pronta para copiar.",
    resultTitle: "Mensagem pronta.", copyLabel: "Copiar mensagem",
    copiedLabel: "Copiado!", copyFailureLabel: "Selecione e copie o texto acima",
    messageTemplate: "Olá! Meu nome é {name}. Gostaria de conversar sobre {subject}. {message} Meu e-mail é {email}.{phoneSuffix}",
    phoneSuffix: " Meu telefone é {phone}.",
    delivery: { mode: "copy", whatsappLabel: "Abrir WhatsApp" },
  },
  footer: {
    message: "Um sorriso começa com uma conversa.",
    cta: { label: "Vamos conversar", href: "#contato" },
    navigationHeading: "Explore", servicesHeading: "Cuidados",
    copyright: "Marina Costa Odontologia",
    disclaimer: "Nome, imagens e conteúdo demonstrativos.",
    backToTop: "Voltar ao início ↑",
  },
};

const sectionByAnchor: Record<string, SectionKey> = {
  "#servicos": "services", "#espaco": "space", "#sobre": "about",
  "#profissional": "professional", "#galeria": "gallery", "#duvidas": "faq",
  "#localizacao": "location", "#contato": "contact",
};

/** Evita âncoras sem destino quando uma seção opcional é desativada. */
export function resolveHref(href: string): string {
  const section = sectionByAnchor[href];
  if (!section || site.sections[section]) return href;
  return site.sections.contact ? "#contato" : "#inicio";
}
