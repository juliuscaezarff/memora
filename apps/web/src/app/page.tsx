import { LoginButtons } from "@/components/login-buttons";
import { LoginAnimation } from "@/components/login-animation";
import { PixelCDWrapper } from "@/components/pixel-cd-wrapper";

async function getLastCommitDate(): Promise<string> {
  try {
    const res = await fetch(
      "https://api.github.com/repos/juliuscaezarff/memora/commits?per_page=1",
      { next: { revalidate: 3600 } }, // revalidate every hour
    );

    if (!res.ok) return "Recently";

    const commits = await res.json();
    if (commits.length > 0) {
      const date = new Date(commits[0].commit.author.date);
      return date
        .toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, ".");
    }
  } catch {
    return "Recently";
  }

  return "Recently";
}

export default async function Home() {
  const lastUpdated = await getLastCommitDate();

  return (
    <div className="min-h-screen bg-black flex flex-col">
      {/* Main content - white card with rounded bottom corners */}
      <main className="flex-1 bg-white rounded-b-[24px] md:rounded-b-[40px] flex items-center justify-center px-4 sm:px-6 py-12 sm:py-0">
        <div className="max-w-xl w-full">
          <PixelCDWrapper />
          <h1 className="text-lg sm:text-xl font-medium text-black">Memora</h1>
          <p className="text-gray-500 text-sm mb-4 sm:mb-6">
            Somewhere on the web
          </p>

          {/* Bio paragraphs */}
          <p className="text-stone-700 text-sm sm:text-base leading-relaxed mb-4">
            I've always enjoyed saving things from the web links, articles,
            small discoveries I didn't want to lose. Over time, that habit
            quietly became a way to remember what matters.
          </p>

          <p className="text-stone-700 text-sm sm:text-base leading-relaxed">
            Memora is a place to organize and share your bookmarks, without the
            usual noise.
          </p>

          <LoginAnimation>
            <LoginButtons />
          </LoginAnimation>
        </div>
      </main>
      <footer className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 text-xs sm:text-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
              />
            </svg>
            <span className="text-stone-500">
              <span className="text-stone-300">2,847</span> bookmarks saved
            </span>
          </div>
        </div>

        <div className="text-stone-500 sm:text-right">
          Last updated <span className="text-stone-300">{lastUpdated}</span>
        </div>
      </footer>
    </div>
  );
}
