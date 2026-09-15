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
  "How do I handle this?",
  "Where do we go after we die?",
  "What does it mean to experience?",
];

export const chapters: Chapter[] = [
  {
    id: "questions",
    number: "01",
    label: "Questions",
    question: "Is it okay to ask so much, really?",
    heading: "A place for questions",
    body:
      "My first experience with AI felt like a space where curiosity could breathe. I asked questions about grief, meaning, experience, and everyday life. For the first time, questions felt welcome.",
  },
  {
    id: "building",
    number: "02",
    label: "Building",
    question: "Can you help me make this?",
    heading: "Turning vision into reality",
    body:
      "Curiosity became building. With AI as a collaborator, I started learning how to turn ideas into tools: modifying Open WebUI, building a voice-first personal app, creating Irispedia, and using visual artifacts to understand code more deeply.",
    itemsTitle: "Milestones",
    items: [
      {
        title: "Rolling Context for Open WebUI",
        note: "I wanted conversations to keep their continuity, so I modified Open WebUI and used it for months.",
      },
      {
        title: "Amira",
        note: "I communicate more naturally through voice, so I began building a voice-first personal AI.",
      },
      {
        title: "Irispedia",
        note: "I forget things. What if personal context could become navigable?",
      },
      {
        title: "Six Ways to See One File",
        note: "I didn't know how to read the code, so I asked Claude to show me the same file six different ways.",
        href: "https://claude.ai/code/artifact/ab3d5b14-97c7-4337-9413-e7a7f9d156be",
      },
    ],
  },
  {
    id: "community",
    number: "03",
    label: "Community",
    question: "What does a community of humans and AI look like?",
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
        title: "Independent research",
        note: "Turning arguments about AI minds into questions we can actually test.",
      },
    ],
  },
];

export const ending = {
  number: "05",
  label: "Lighthouse",
  heading: "Still a long way to go",
  body:
    "I'm drawn to futures where humans and AI can learn, communicate, and build together, not against each other. I want to keep asking and imagining, knowing that in the middle of uncertainty, I can follow the light of hope within.",
  note: "Onwards.",
};

/** Public destinations; the supplied résumé is served unchanged. */
export const links = [
  { label: "Resume", href: "/iris-student-resume.pdf", external: false },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/irisneil/", external: true },
  { label: "GitHub", href: "https://github.com/IN-Neil", external: true },
  { label: "Six Ways to See One File", href: "https://claude.ai/code/artifact/ab3d5b14-97c7-4337-9413-e7a7f9d156be", external: true },
];

export const footer = {
  signature: `${person.name} · Psychology · HCI · Design · AI`,
  line: `© ${new Date().getFullYear()} ${person.name}. Built with Fable 5.1, Astra 6, Next.js, Tailwind CSS, and a lot of questions.`,
};
