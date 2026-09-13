/**
 * All words and links on the site live here.
 * Edit this file to change copy; the layout and scene do not need to change.
 */

export type ChapterId = "questions" | "building" | "community" | "part";

export type Milestone = {
  title: string;
  note: string;
  href?: string;
};

export type Chapter = {
  id: ChapterId;
  number: string;
  question: string;
  heading: string;
  body: string;
  /** Short label used by the route map at the bottom of the desktop view. */
  label: string;
  /** Optional list rendered under the body (milestones, roles, outcomes). */
  items?: Milestone[];
  itemsTitle?: string;
};

export const person = {
  name: "Iris Matos",
  role: "Psychology student",
  focus: "human–AI interaction",
  interests: [
    "human–AI interaction",
    "HCI",
    "accessibility",
    "AI education",
    "research",
    "design",
  ],
};

export const intro = {
  kicker: `${person.name} · ${person.role}`,
  title: "IRIS",
  subtitle: "IMAGINE → BUILD",
  thesis:
    "I imagine possible futures of human–AI collaboration, and I study, build, and teach in ways that move toward them.",
  scrollHint: "Scroll to set sail",
};

/** Floating fragments that drift through the sky in chapter one. */
export const questionFragments = [
  "What is it like to be you?",
  "Do aliens exist?",
  "Where do we go after we die?",
  "What does it mean to experience?",
  "How do I handle this?",
];

export const chapters: Chapter[] = [
  {
    id: "questions",
    number: "01",
    label: "Questions",
    question: "What happens when questions finally have somewhere to go?",
    heading: "A place for questions",
    body:
      "My first experience with AI felt like a space where curiosity could breathe. I asked questions about grief, meaning, experience, and everyday life. For the first time, questions felt welcome.",
  },
  {
    id: "building",
    number: "02",
    label: "Building",
    question: "How do I turn a vision into something real?",
    heading: "Turning vision into reality",
    body:
      "Curiosity became building. With AI as a collaborator, I started learning how to turn ideas into tools: modifying Open WebUI, building a voice-first personal app, creating Irispedia, and using visual artifacts to understand code more deeply.",
    itemsTitle: "Milestones",
    items: [
      {
        title: "Rolling Context for Open WebUI",
        note: "A modification so long conversations keep their thread.",
      },
      {
        title: "Amira",
        note: "A voice-first personal app.",
      },
      {
        title: "Irispedia",
        note: "A personal encyclopedia of what I'm learning.",
      },
      {
        title: "Six Ways to See One File",
        note: "Visual artifacts for reading one piece of code from six angles.",
        href: "#", // TODO: replace with the real link
      },
    ],
  },
  {
    id: "community",
    number: "03",
    label: "Community",
    question: "What does a community of humans, AI, and technology look like?",
    heading: "Wondering about community",
    body:
      "As I built more, I became more curious about the people around the technology. I sought out cyberpsychology coursework and joined the Social Psychology Club because I wanted to understand the human side of these systems too.",
    itemsTitle: "Along the way",
    items: [
      {
        title: "Cyberpsychology coursework",
        note: "Albizu University",
      },
      {
        title: "Social Psychology Club",
        note: "Vice President",
      },
      {
        title: "HCI",
        note: "The human side of technology.",
      },
    ],
  },
  {
    id: "part",
    number: "04",
    label: "My part",
    question: "What part can I play?",
    heading: "Finding my part",
    body:
      "I started asking how I could contribute. I designed and led a hands-on AI workshop for youth, where two participants built games, and I began shaping research questions into experiments about how humans understand AI minds.",
    itemsTitle: "So far",
    items: [
      {
        title: "AI workshop",
        note: "Designed and led for youth at a Boys & Girls Club.",
      },
      {
        title: "Two participants built games",
        note: "From a blank page to something playable in one session.",
      },
      {
        title: "Early research",
        note: "Experiment design on how humans understand AI minds.",
      },
    ],
  },
];

export const ending = {
  number: "05",
  label: "Lighthouse",
  heading: "Still a long way to go",
  body:
    "I'm drawn to futures where humans and AI can learn, communicate, and build together with more understanding, accessibility, and care. I don't know exactly what that future looks like yet. But I know the direction I want to explore.",
  note: "The lighthouse isn't an arrival. It's a bearing.",
};

/**
 * Placeholder links. Replace the `href` values with real URLs.
 * For the resume, drop a PDF into `public/` (e.g. `public/iris-matos-resume.pdf`)
 * and point `href` at "/iris-matos-resume.pdf".
 */
export const links = [
  { label: "Resume", href: "#", external: false },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/your-handle", external: true },
  { label: "GitHub", href: "https://github.com/your-handle", external: true },
  { label: "Six Ways to See One File", href: "#", external: true },
];

export const footer = {
  line: `© ${new Date().getFullYear()} ${person.name}. Built with Next.js, Tailwind, and a lot of questions.`,
};
