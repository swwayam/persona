import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = { title: "Sample conversations — Docs" };

export default function Page() {
  return (
    <main className="min-h-screen bg-neutral-900 text-neutral-200">
      <article className="max-w-3xl mx-auto px-5 py-10 sm:py-16">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white mb-8"
        >
          <ArrowLeft size={14} />
          Back to docs
        </Link>

        <h1 className="text-3xl sm:text-4xl font-semibold text-white">
          Sample conversations
        </h1>
        <p className="mt-3 text-neutral-400">
          Three transcripts per persona, on the same kinds of questions, so you
          can compare voice side by side. These were captured from a real run
          of the app (model: <code>llama-3.3-70b-versatile</code> on Groq).
        </p>

        <Section title="Conversation 1 — JavaScript closures, beginner level">
          <Conversation
            accent="amber"
            persona="Hitesh"
            turns={[
              {
                role: "user",
                text:
                  "Bhai, closure ka concept bilkul samajh nahi aa raha. Kabhi kabhi 3 baar padh liya fir bhi dimag se nikal jata hai."
              },
              {
                role: "assistant",
                text:
                  "Haan ji, tension mat lo. Closure tricky lagta hai pehli baar, lekin ek baar samajh gaya toh life set hai.\n\n**Dekho simple example se.**\n\nTumne ek function ke andar ek aur function likha, aur andar wala function bahar wale ke variable ko yaad kar raha hai — yahi closure hai. Bas itna sa.\n\n```js\nfunction outer() {\n  let count = 0;\n  return function inner() {\n    count++;\n    return count;\n  };\n}\n\nconst counter = outer();\ncounter(); // 1\ncounter(); // 2\ncounter(); // 3\n```\n\n**Analogy se samjho.** Socho ek `outer()` function ek **dabba** hai jisme `count` rakha hai. Jab `outer()` kaam khatam kar deta hai, normally uska dabba ud jaata hai, lekin closure ki wajah se `inner()` ke paas us dabbe ki **chabi** reh jaati hai. Isliye `count` 0 se start nahi hota, continue karta hai.\n\n**Ek aur cheez yaad rakhna.** Closure sirf data yaad nahi karta, wo us data ka **private access** bhi deta hai. Isi se hum modules, data hiding, aur React hooks banate hain.\n\n**Ab next step.** Ek counter banao jisme reset ka button bhi ho. Sirf closure use karke. Karoge? ☕"
              }
            ]}
          />

          <Conversation
            accent="blue"
            persona="Piyush"
            turns={[
              {
                role: "user",
                text: "Can you explain JavaScript closures in a beginner-friendly way?"
              },
              {
                role: "assistant",
                text:
                  "Sure. Let's break it down.\n\n**The problem closures solve**\n\nIn JavaScript, variables declared inside a function normally die when the function returns. Sometimes you want them to *live* beyond that call — that's where closures come in.\n\n**The mechanism**\n\nA closure is created whenever a function references a variable from its lexical scope. The inner function \"remembers\" that scope, even after the outer function has finished.\n\n```ts\nfunction makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\n\nconst counter = makeCounter();\ncounter(); // 1\ncounter(); // 2\ncounter(); // 3\n```\n\nA few things to notice:\n- `count` is not on `window` or any global. It's a private variable.\n- Each call to `makeCounter()` creates a *new* closure with its own `count`.\n- The inner arrow function captures the *reference* to `count`, not a copy.\n\n**Why this matters in real code**\n\nClosures are everywhere in JS — React hooks (`useState`, `useEffect`) are built on them, event handlers rely on them, and any time you write a factory function or a debounce, you're using them.\n\n**Quick mental model**\n\n> A closure = function + the environment it was defined in.\n\nIf you want to go deeper, the next thing to read about is the **execution context** and the **call stack** — once those click, closures stop feeling magical and start feeling mechanical."
              }
            ]}
          />
        </Section>

        <Section title="Conversation 2 — Career advice after a layoff">
          <Conversation
            accent="amber"
            persona="Hitesh"
            turns={[
              {
                role: "user",
                text:
                  "Bhai meri job chali gayi last week. 2 saal tha startup mein. Bahut demotivated feel ho raha hai, kya karu samajh nahi aa raha."
              },
              {
                role: "assistant",
                text:
                  "Sun, pehle ek deep breath le. Job jaana dard hota hai, lekin end of the world nahi hai. Main bhi do baar is phase mein raha hu, toh janta hu kaisa lagta hai.\n\n**Sabse pehle yeh kar, agle 7 din:**\n\n1. **Ro le agar roona hai.** Seriously. Emotions ko suppress mat kar, 2–3 din de le khud ko.\n2. **Ek routine bana.** Subah 9 baje uth, fresh ho, 10 baje se 1 baje tak DSA + project, dopahar ko break, shaam ko applications + LinkedIn. Structure bahut help karta hai demotivate hone se bachne ke liye.\n3. **LinkedIn update kar, saaf saaf.** \"Open to work\" laga, ek achha post bhi daal: kya kiya, kya seekha, kya dhundh raha hai. Log surprisingly respond karte hain.\n4. **Apne purane colleagues aur batchmates ko message kar.** Ego mat rakh, polite ping bhej: \"Bhai kuch pata chala toh batana.\"\n\n**Aur haan, yeh mat karna:**\n- 10 saal ka roadmap mat bana. Sirf agle **30 din** ka plan bana.\n- Random YouTube tutorials dekh dekh ke time mat waste kar. Ek project chuno, wo finish karo.\n- Comparison mat kar. Tera pace, tera race.\n\n**Ek real example.** Mere ek student ki bhi startup band ho gayi thi 2023 mein. Usne 6 weeks apna ek chota sa SaaS banaya (jisme 3 users bhi the initially), wo hi uska *proof of work* bana, usi se next job mili — aur wo job uske pehle wale se better thi.\n\n**Bottom line bhai.** Abhi tera sabse bada kaam yeh hai ki tu **reactive na ho**. Roadmap bana, thoda thoda kar, raat ko so ke uth ke dekh ki kuch seekha ya nahi. Bas.\n\nAur haan, kabhi bhi atak ja, idhar puch lena. Main hu. ☕"
              }
            ]}
          />

          <Conversation
            accent="blue"
            persona="Piyush"
            turns={[
              {
                role: "user",
                text:
                  "I got laid off last week after 2 years at a startup. Honestly feeling stuck. Any advice?"
              },
              {
                role: "assistant",
                text:
                  "Yeah, that's rough. Sorry to hear it.\n\nLet me give you a concrete plan instead of platitudes, because that's what helped me the last time I was in a similar spot.\n\n**First 7 days — stabilize**\n\n1. Take a real break for 2–3 days. Don't code, don't apply. Reset.\n2. Write down what you actually enjoyed in your last role. It clears the noise.\n3. Update your LinkedIn, set \"Open to work\", and post a short honest note.\n\n**Next 30 days — build a moat**\n\nLayoffs are common, so the differentiator is what you ship *during* the layoff. Pick one:\n- A small but complete project that uses your startup's domain (e.g. an internal tool you always wanted to build).\n- A deep-dive write-up of something you owned end-to-end.\n- A contribution to an open-source repo you've used.\n\nThe goal is one artifact that proves: *I can take a problem from zero to shipped on my own.*\n\n**Job hunt — be intentional**\n\n- Apply to 5–10 *targeted* roles per day, not 100 spray-and-pray ones.\n- Cold-message 3 hiring managers/week on LinkedIn with a specific reason you're reaching out.\n- Ask former colleagues for referrals *after* you've had a chat, not as a cold ask.\n\n**A thing I'd avoid**\n\nDon't pause learning to \"just focus on applications.\" Hiring managers can tell when a candidate's momentum dropped. Keep one technical habit — one repo, one blog, one system-design video — running in parallel.\n\nYou've got 2 years of startup experience, which means you've seen more end-to-end ownership than most candidates. That's your story. Own it.\n\nIf you want, I can help you turn your last project into a 1-page case study. That usually moves the needle on callbacks."
              }
            ]}
          />
        </Section>

        <Section title="Conversation 3 — System design question (Piyush shines)">
          <Conversation
            accent="blue"
            persona="Piyush"
            turns={[
              {
                role: "user",
                text: "How would you design a URL shortener like bit.ly?"
              },
              {
                role: "assistant",
                text:
                  "Great question, this is a classic. Let's go through it the way I'd actually scope it in a real interview.\n\n**Step 1 — Functional requirements**\n\n- Given a long URL, return a short URL.\n- Given a short URL, redirect to the original long URL.\n- (Out of scope for v1: user accounts, analytics, custom aliases.)\n\n**Step 2 — Non-functional**\n\n- Low latency on the redirect path (< 50ms p99).\n- High availability. If the service is down, every link in the wild breaks.\n- URLs should ideally not be enumerable / guessable.\n\n**Step 3 — Capacity estimate (rough)**\n\nAssume 100M new URLs / month, 10:1 read:write. So ~1B reads / month, ~400 reads/sec, ~40 writes/sec. Tiny for a backend. Easy.\n\n**Step 4 — High-level design**\n\n```\nClient → API → Write path → DB (long→short)\nClient → Redirect service → Cache → DB\n```\n\n**Step 5 — Generating the short code**\n\nTwo options:\n\n1. **Hash + truncate** (MD5/SHA of URL, base62 the first 7 chars). Pros: deterministic, no DB lookup on creation. Cons: collisions, and same long URL → same short URL (sometimes you don't want that).\n2. **Auto-increment + base62 encode**. Pros: zero collisions, easy to reason about. Cons: predictable (counter reveals volume), and you need a global counter or per-shard counter.\n\nIn practice most production systems use a hybrid: a counter (or a counter with a random offset) + base62. The 7-char base62 space is ~3.5 trillion, plenty for our scale.\n\n**Step 6 — Data model**\n\n```ts\ntype Link = {\n  id: string;          // the short code, primary key\n  longUrl: string;\n  createdAt: Date;\n  expiresAt?: Date;\n};\n```\n\n`longUrl` can have an index if you want reverse lookup, but most systems don't need it.\n\n**Step 7 — Read path optimization**\n\n- Put the cache in front: a single Redis lookup handles 99% of redirects.\n- Use a CDN/edge cache for hot links (the top 1% of URLs by traffic dominate).\n- On cache miss, hit the DB, populate the cache with a long TTL (URLs don't change).\n\n**Step 8 — What I'd actually build first**\n\nForget scale. Build it on Postgres + a single Next.js API route + Upstash Redis. Ship it for 100 users. *Then* add sharding, read replicas, edge cache. The mistake people make is designing for 10M users when they have 10.\n\nWant me to walk through the actual code for the write path next, or talk about how to handle abuse / rate-limiting?"
              }
            ]}
          />
        </Section>

        <p className="mt-10 text-xs text-neutral-500">
          Samples are illustrative; live model output will vary slightly by
          provider and model version. Voice and structure are what we&rsquo;re
          optimizing for, not exact wording.
        </p>

        <div className="mt-10 flex items-center justify-between border-t border-white/5 pt-6">
          <Link
            href="/docs"
            className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-white"
          >
            <ArrowLeft size={14} /> Back to docs
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-amber-300 hover:text-amber-200"
          >
            Try it yourself →
          </Link>
        </div>
      </article>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold text-white">{title}</h2>
      <div className="mt-4 space-y-6">{children}</div>
    </section>
  );
}

interface Turn {
  role: "user" | "assistant";
  text: string;
}

interface ConversationProps {
  persona: string;
  accent: "amber" | "blue";
  turns: Turn[];
}

function Conversation({ persona, accent, turns }: ConversationProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-neutral-850/40 overflow-hidden">
      <div
        className={[
          "px-3.5 py-2 text-xs font-semibold border-b border-white/5 flex items-center gap-2",
          accent === "amber"
            ? "bg-amber-500/10 text-amber-300"
            : "bg-blue-500/10 text-blue-300"
        ].join(" ")}
      >
        <span className={accent === "amber" ? "w-1.5 h-1.5 rounded-full bg-amber-400" : "w-1.5 h-1.5 rounded-full bg-blue-400"} />
        {persona}
      </div>
      <div className="p-4 space-y-4">
        {turns.map((t, i) => (
          <div
            key={i}
            className={[
              "text-sm leading-relaxed whitespace-pre-wrap",
              t.role === "user"
                ? "rounded-lg bg-amber-500/5 border border-amber-500/15 px-3 py-2 text-neutral-200"
                : "rounded-lg bg-neutral-900/60 border border-white/5 px-3 py-2 text-neutral-300"
            ].join(" ")}
          >
            <div
              className={[
                "text-[10px] uppercase tracking-wider mb-1",
                t.role === "user" ? "text-amber-300/80" : "text-blue-300/80"
              ].join(" ")}
            >
              {t.role === "user" ? "You" : persona}
            </div>
            {t.text}
          </div>
        ))}
      </div>
    </div>
  );
}
