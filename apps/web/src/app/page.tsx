import { LoginAnimation } from "@/components/login-animation";
import { LoginButtons } from "@/components/login-buttons";
import { PixelCubeWrapper } from "@/components/pixel-cube-wrapper";

const features = [
	"save links before they disappear",
	"share folders with anyone",
	"organize everything with labels",
	"find your bookmarks through MCP",
];

export default function Home() {
	return (
		<main className="flex min-h-svh items-center overflow-x-hidden bg-[#050505] text-[#f1f1ef]">
			<div className="w-full max-w-[640px] px-5 py-8 sm:px-8 sm:py-10 md:ms-[clamp(4rem,10.75vw,10rem)] md:px-0">
				<div className="mb-8 size-20 sm:mb-10 sm:size-24">
					<PixelCubeWrapper />
				</div>

				<section aria-labelledby="home-heading" className="font-mono">
					<h1
						id="home-heading"
						className="text-balance font-medium text-2xl text-[#f2f2f0] leading-[1.15] tracking-[-0.025em]"
					>
						Save the web. Remember what matters.
					</h1>

					<p className="mt-8 max-w-[38rem] text-pretty text-[#777775] text-base leading-relaxed">
						Memora keeps your links, ideas and small discoveries in one quiet
						place — ready when you need them.
					</p>

					<LoginAnimation>
						<LoginButtons />
					</LoginAnimation>

					<ul className="mt-14 space-y-2.5 text-[#777775] text-sm leading-relaxed sm:text-base">
						{features.map((feature) => (
							<li key={feature} className="flex items-start gap-4">
								<span
									aria-hidden="true"
									className="mt-[0.7em] size-1 shrink-0 bg-[#666664]"
								/>
								<span>{feature}</span>
							</li>
						))}
						<li className="flex items-start gap-4">
							<span
								aria-hidden="true"
								className="mt-[0.7em] size-1 shrink-0 bg-[#3d3d3b]"
							/>
							<span className="text-[#454543]">integrations — coming soon</span>
						</li>
					</ul>

					<footer className="mt-14 text-xs leading-relaxed sm:text-sm">
						<p className="text-[#3f3f3d]">
							Your corner of the web, without the noise.
						</p>
						<nav
							aria-label="Project links"
							className="mt-3 flex items-center gap-2 text-[#50504d]"
						>
							<a
								href="https://github.com/juliuscaezarff/memora"
								target="_blank"
								rel="noreferrer"
								className="cursor-pointer underline-offset-4 transition-colors duration-150 hover:text-[#777775] hover:underline focus-visible:text-[#777775] focus-visible:underline focus-visible:outline-none"
							>
								source
							</a>
							<span aria-hidden="true">·</span>
							<a
								href="https://x.com/julius___C"
								target="_blank"
								rel="noreferrer"
								className="cursor-pointer underline-offset-4 transition-colors duration-150 hover:text-[#777775] hover:underline focus-visible:text-[#777775] focus-visible:underline focus-visible:outline-none"
							>
								@julius___C
							</a>
							<span aria-hidden="true">·</span>
							<a
								href="https://opensource.org/license/mit"
								target="_blank"
								rel="noreferrer"
								className="cursor-pointer underline-offset-4 transition-colors duration-150 hover:text-[#777775] hover:underline focus-visible:text-[#777775] focus-visible:underline focus-visible:outline-none"
							>
								MIT
							</a>
						</nav>
					</footer>
				</section>
			</div>
		</main>
	);
}
