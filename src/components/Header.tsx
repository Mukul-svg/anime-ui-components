interface HeaderProps {
  onOpenInstall: () => void;
}

export function Header({ onOpenInstall }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[#dcdaf0] bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-8 px-6 py-4">
        <a
          href="#top"
          className="font-display text-xl font-extrabold italic tracking-tight text-[#1d1a4a] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ff5fa8]"
        >
          Anime VFX
        </a>

        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#595488]"
        >
          <a
            href="#gallery"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#1d1a4a] hover:underline underline-offset-4"
          >
            Gallery
          </a>
          <a
            href="#vfx-lab"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#1d1a4a] hover:underline underline-offset-4"
          >
            VFX Lab
          </a>
          <a
            href="#form-playground"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#1d1a4a] hover:underline underline-offset-4"
          >
            Live Form
          </a>
          <a
            href="#themes"
            className="whitespace-nowrap shrink-0 transition-colors duration-150 hover:text-[#1d1a4a] hover:underline underline-offset-4"
          >
            Themes
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenInstall}
            className="rounded-lg bg-[#1d1a4a] px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-[#312c70] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-[#ff5fa8]"
          >
            Quick Install
          </button>
        </div>
      </div>
    </header>
  );
}
