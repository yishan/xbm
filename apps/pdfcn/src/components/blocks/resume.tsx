// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn

type Role = {
  company: string
  title: string
  dates: string
  location: string
  bullets: string[]
}

type EducationEntry = {
  school: string
  degree: string
  dates: string
}

const CONTACT: string[] = [
  "avery.chen@example.com",
  "San Francisco",
  "linkedin.com/in/averychen",
]

const SUMMARY =
  "Product designer with seven years shaping data-heavy tools from first sketch to shipped release. I pair rigorous research with systems thinking to make complex workflows feel calm and obvious."

const EXPERIENCE: Role[] = [
  {
    company: "Northwind Studio",
    title: "Senior Product Designer",
    dates: "2022 — Present",
    location: "San Francisco, CA",
    bullets: [
      "Led end-to-end design for the flagship analytics suite, shipping 40+ features across web and mobile.",
      "Built a token-driven design system now used by six product teams, cutting UI build time by roughly a third.",
      "Ran quarterly research sprints with 20+ customers and turned the findings into a shared product roadmap.",
    ],
  },
  {
    company: "Halcyon Labs",
    title: "Product Designer",
    dates: "2019 — 2022",
    location: "Oakland, CA",
    bullets: [
      "Redesigned onboarding around a single guided setup flow, lifting week-one activation by 18%.",
      "Partnered with three engineers to define an accessibility baseline that met WCAG 2.1 AA.",
      "Introduced lightweight usability testing, growing it into a weekly ritual across the org.",
    ],
  },
  {
    company: "Fieldnote",
    title: "UX Designer",
    dates: "2017 — 2019",
    location: "Portland, OR",
    bullets: [
      "Shaped the mobile capture experience used by 50k researchers in the field each month.",
      "Documented interaction patterns and specs that halved design QA churn with engineering.",
    ],
  },
]

const SKILLS: string[] = [
  "Design Systems",
  "Prototyping",
  "User Research",
  "Interaction Design",
  "Accessibility",
  "Design Tokens",
  "Figma",
  "Motion",
]

const EDUCATION: EducationEntry = {
  school: "Rhode Island School of Design",
  degree: "BFA, Graphic Design",
  dates: "2013 — 2017",
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h2
      className="text-[11px] font-semibold uppercase tracking-[0.14em]"
      style={{ color: "var(--pdf-heading)" }}
    >
      {children}
    </h2>
  )
}

export function ResumeBlock() {
  return (
    <article
      data-testid="doc-resume"
      className="flex w-full flex-col gap-6 text-[13px] leading-relaxed"
      style={{
        backgroundColor: "var(--pdf-bg)",
        color: "var(--pdf-fg)",
        borderColor: "var(--pdf-border)",
      }}
    >
      <header
        className="flex flex-col gap-3 border-b pb-5"
        style={{ borderColor: "var(--pdf-border)" }}
      >
        <div className="flex flex-col gap-1">
          <h1
            className="text-3xl font-semibold tracking-tight tabular-nums"
            style={{ color: "var(--pdf-heading)" }}
          >
            Avery Chen
          </h1>
          <p className="text-base font-medium" style={{ color: "var(--pdf-accent)" }}>
            Product Designer
          </p>
        </div>
        <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
          {CONTACT.map((item, index) => (
            <li key={item} className="flex items-center gap-2">
              {index > 0 ? (
                <span aria-hidden="true" style={{ color: "var(--pdf-muted)" }}>
                  ·
                </span>
              ) : null}
              <span style={{ color: "var(--pdf-muted)" }}>{item}</span>
            </li>
          ))}
        </ul>
      </header>

      <section className="flex flex-col gap-2">
        <SectionTitle>Summary</SectionTitle>
        <p style={{ color: "var(--pdf-fg)" }}>{SUMMARY}</p>
      </section>

      <section className="flex flex-col gap-3">
        <SectionTitle>Experience</SectionTitle>
        <ol className="flex flex-col gap-4">
          {EXPERIENCE.map((role) => (
            <li key={`${role.company}-${role.title}`} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-semibold" style={{ color: "var(--pdf-heading)" }}>
                    {role.title}
                  </span>
                  <span style={{ color: "var(--pdf-muted)" }}>· {role.company}</span>
                </div>
                <span
                  className="text-xs tabular-nums"
                  style={{ color: "var(--pdf-muted)" }}
                >
                  {role.dates} · {role.location}
                </span>
              </div>
              <ul className="flex flex-col gap-1.5">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-[7px] size-1 shrink-0 rounded-full"
                      style={{ backgroundColor: "var(--pdf-accent)" }}
                    />
                    <span style={{ color: "var(--pdf-fg)" }}>{bullet}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className="flex flex-col gap-2">
        <SectionTitle>Skills</SectionTitle>
        <ul className="flex flex-wrap gap-2">
          {SKILLS.map((skill, index) => {
            const featured = index === 0
            return (
              <li
                key={skill}
                className="rounded-full border px-2.5 py-1 text-xs font-medium"
                style={
                  featured
                    ? {
                        backgroundColor: "var(--pdf-accent)",
                        borderColor: "var(--pdf-accent)",
                        color: "var(--pdf-accent-fg)",
                      }
                    : {
                        backgroundColor: "var(--pdf-subtle)",
                        borderColor: "var(--pdf-border)",
                        color: "var(--pdf-fg)",
                      }
                }
              >
                {skill}
              </li>
            )
          })}
        </ul>
      </section>

      <section
        className="mt-auto flex flex-col gap-2 border-t pt-5"
        style={{ borderColor: "var(--pdf-border)" }}
      >
        <SectionTitle>Education</SectionTitle>
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-semibold" style={{ color: "var(--pdf-heading)" }}>
              {EDUCATION.degree}
            </span>
            <span style={{ color: "var(--pdf-muted)" }}>· {EDUCATION.school}</span>
          </div>
          <span className="text-xs tabular-nums" style={{ color: "var(--pdf-muted)" }}>
            {EDUCATION.dates}
          </span>
        </div>
      </section>
    </article>
  )
}
