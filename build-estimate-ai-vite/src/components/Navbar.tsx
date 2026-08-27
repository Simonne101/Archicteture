import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowRight, ChevronDown, LogOut, Moon, Sun } from "lucide-react";
import { navLinks } from "../data/content";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { scrollToSection } from "../utils/scroll";
import { buttonClasses } from "../utils/buttonStyles";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import Button from "./Button";

const resourceLinks = [
  { label: "Documentation", href: "#" },
  { label: "Centre d'aide", href: "#" },
  { label: "Blog", href: "#" },
];

export default function Navbar() {
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [resourcesPos, setResourcesPos] = useState({ top: 0, left: 0 });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const resourcesButtonRef = useRef<HTMLButtonElement>(null);
  const resourcesPanelRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isHome = location.pathname === "/";
  const activeId = useScrollSpy(navLinks.map((l) => l.href.replace("#", "")));

  function updateScrollFades() {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

  useEffect(() => {
    updateScrollFades();
    window.addEventListener("resize", updateScrollFades);
    return () => window.removeEventListener("resize", updateScrollFades);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  function openResources() {
    const rect = resourcesButtonRef.current?.getBoundingClientRect();
    if (rect) {
      setResourcesPos({ top: rect.bottom + 10, left: rect.left + rect.width / 2 });
    }
    setResourcesOpen((v) => !v);
  }

  // The panel is rendered in a portal (see below) so it escapes the
  // horizontally-scrolling nav row's clipping — without this it was
  // invisible, silently clipped by that row's overflow-x-auto (setting
  // overflow-x forces overflow-y to clip too, per the CSS spec).
  useEffect(() => {
    if (!resourcesOpen) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (resourcesPanelRef.current?.contains(target) || resourcesButtonRef.current?.contains(target)) return;
      setResourcesOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setResourcesOpen(false);
    }

    function close() {
      setResourcesOpen(false);
    }

    const scrollEl = scrollRef.current;
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", close);
    scrollEl?.addEventListener("scroll", close);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", close);
      scrollEl?.removeEventListener("scroll", close);
    };
  }, [resourcesOpen]);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  function handleNavClick(event: React.MouseEvent, href: string) {
    if (isHome) {
      event.preventDefault();
      scrollToSection(href.replace("#", ""));
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-[70px] items-center gap-4 bg-bg-dark px-5 text-white lg:h-[82px] lg:gap-6 lg:px-10 xl:px-16">
      <Link
        to="/"
        aria-label="Build Estimate AI - Accueil"
        className="flex shrink-0 items-center gap-3 lg:min-w-[275px] xl:min-w-[320px]"
      >
        <span aria-hidden="true" className="flex h-11 w-9 skew-y-[-28deg] items-end gap-[3px]">
          <i className="block h-[30px] w-[10px] rounded-sm bg-gradient-to-b from-primary to-primary-dark" />
          <i className="block h-[40px] w-[10px] rounded-sm bg-gradient-to-b from-primary to-primary-dark" />
          <i className="block h-[34px] w-[10px] rounded-sm bg-gradient-to-b from-primary to-primary-dark" />
        </span>
        <span>
          <strong className="block text-sm tracking-tight whitespace-nowrap lg:text-lg xl:text-xl">
            BUILD ESTIMATE <em className="text-primary not-italic">AI</em>
          </strong>
          <small className="hidden text-[10px] tracking-[0.6px] whitespace-nowrap text-primary/80 sm:block">
            ESTIMEZ. PLANIFIEZ. CONSTRUISEZ.
          </small>
        </span>
      </Link>

      <div className="relative flex min-w-0 flex-1 items-center">
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute left-0 top-0 z-10 h-full w-8 bg-gradient-to-r from-bg-dark to-transparent transition-opacity duration-200 ${
            canScrollLeft ? "opacity-100" : "opacity-0"
          }`}
        />

        <div
          ref={scrollRef}
          onScroll={updateScrollFades}
          className="no-scrollbar flex w-full items-center gap-5 overflow-x-auto xl:gap-9"
        >
          <nav aria-label="Navigation principale" className="flex shrink-0 items-center gap-5 xl:gap-9">
            {navLinks.map((link) => {
              const id = link.href.replace("#", "");
              const active = isHome && activeId === id;
              return (
                <Link
                  key={link.href}
                  to={`/${link.href}`}
                  onClick={(e) => handleNavClick(e, link.href)}
                  className={`relative flex h-full items-center text-sm font-semibold whitespace-nowrap ${
                    active ? "text-primary" : "text-white"
                  } after:absolute after:bottom-5 after:left-0 after:right-0 after:h-[2px] after:bg-primary ${
                    active ? "after:content-['']" : "after:content-none"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}

            <Link
              to="/pricing"
              className={`relative flex h-full items-center text-sm font-semibold whitespace-nowrap ${
                location.pathname === "/pricing" ? "text-primary" : "text-white"
              }`}
            >
              Tarifs
            </Link>

            <div className="relative">
              <button
                ref={resourcesButtonRef}
                type="button"
                onClick={openResources}
                aria-expanded={resourcesOpen}
                className="relative flex h-full items-center gap-1.5 text-sm font-semibold whitespace-nowrap text-white"
              >
                Ressources
                <ChevronDown
                  size={14}
                  strokeWidth={2.4}
                  aria-hidden="true"
                  className={`transition-transform ${resourcesOpen ? "rotate-180" : ""}`}
                />
              </button>
            </div>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
              className="flex h-8 w-8 shrink-0 items-center justify-center text-white/90 transition hover:text-white"
            >
              {theme === "dark" ? (
                <Sun size={22} strokeWidth={1.8} aria-hidden="true" />
              ) : (
                <Moon size={22} strokeWidth={1.8} aria-hidden="true" />
              )}
            </button>
            {user ? (
              <>
                <Link to="/projects" className={buttonClasses("outline", "h-11 px-4 whitespace-nowrap xl:px-5")}>
                  Mes projets
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Se déconnecter"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white/80 transition hover:bg-white/5 hover:text-white"
                >
                  <LogOut size={18} strokeWidth={2} aria-hidden="true" />
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className={buttonClasses("outline", "h-11 px-4 whitespace-nowrap xl:px-5")}>
                  Connexion
                </Link>
                <Button as={Link} to="/register" className="h-11 px-4 whitespace-nowrap xl:px-5">
                  <span className="hidden xl:inline">Commencer gratuitement</span>
                  <span className="xl:hidden">Essai gratuit</span>
                  <ArrowRight size={16} strokeWidth={2.2} aria-hidden="true" />
                </Button>
              </>
            )}
          </div>
        </div>

        <div
          aria-hidden="true"
          className={`pointer-events-none absolute right-0 top-0 z-10 h-full w-10 bg-gradient-to-l from-bg-dark to-transparent transition-opacity duration-200 ${
            canScrollRight ? "opacity-100" : "opacity-0"
          }`}
        />
      </div>

      {resourcesOpen &&
        createPortal(
          <div
            ref={resourcesPanelRef}
            style={{ top: resourcesPos.top, left: resourcesPos.left }}
            className="fixed z-50 flex w-48 -translate-x-1/2 flex-col gap-1 rounded-xl border border-white/10 bg-bg-dark-2 p-2 shadow-xl"
          >
            {resourceLinks.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setResourcesOpen(false)}
                className="rounded-lg px-3 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </div>,
          document.body,
        )}
    </header>
  );
}
