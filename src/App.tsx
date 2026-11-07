import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import Hero from "./components/Hero";
import ClosingCards from "./components/ClosingCards";
import Runway from "./components/Runway";
import { Signature, Ingredients } from "./components/Editorial";
import { Bag, Contact, Dialog } from "./components/Dialogs";
import { products, money } from "./lib/products";
const Studio = lazy(() => import("./Studio"));
function read<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
}
export default function App() {
  const [bag, setBag] = useState<number[]>(() => {
    const v = read<unknown>("aurelle-bag", []);
    return Array.from({ length: 6 }, (_, i) =>
      Array.isArray(v) && Number.isInteger(v[i]) && v[i] >= 0 ? v[i] : 0,
    );
  });
  const [favorites, setFavorites] = useState<number[]>(() => {
    const v = read<unknown>("aurelle-favorites", []);
    return Array.isArray(v)
      ? v.filter((n) => Number.isInteger(n) && n >= 0 && n < 6)
      : [];
  });
  const [dialog, setDialog] = useState<"bag" | "contact" | "saved" | null>(
      null,
    ),
    [menu, setMenu] = useState(false),
    [toast, setToast] = useState(""),
    [newsletter, setNewsletter] = useState(false);
  const close = useCallback(() => setDialog(null), []);
  const add = useCallback((i: number) => {
    setBag((b) => b.map((n, j) => (j === i ? Math.min(n + 1, 99) : n)));
    setToast(`${products[i].name} added to your ritual.`);
  }, []);
  const change = useCallback(
    (i: number, delta: number) =>
      setBag((b) =>
        b.map((n, j) => (j === i ? Math.max(0, Math.min(99, n + delta)) : n)),
      ),
    [],
  );
  const toggleFavorite = useCallback(
    (i: number) =>
      setFavorites((f) =>
        f.includes(i) ? f.filter((x) => x !== i) : [...f, i],
      ),
    [],
  );
  useEffect(() => {
    try {
      localStorage.setItem("aurelle-bag", JSON.stringify(bag));
      localStorage.setItem("aurelle-favorites", JSON.stringify(favorites));
    } catch {}
  }, [bag, favorites]);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 3200);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    const scroll = () => {
      document.documentElement.dataset.scrolled = String(
        scrollY > innerHeight * 0.8,
      );
    };
    scroll();
    addEventListener("scroll", scroll, { passive: true });
    return () => removeEventListener("scroll", scroll);
  }, []);
  const nav = [
    ["Collection", "collection"],
    ["The ritual", "ritual"],
    ["The studio", "ingredients"],
    ["Contact", "footer"],
  ];
  if (location.search.includes("studio") && import.meta.env.DEV)
    return (
      <Suspense fallback={null}>
        <Studio />
      </Suspense>
    );
  return (
    <>
      <a className="skip-link" href="#collection">
        Skip to collection
      </a>
      <header className="site-header">
        <a href="#top" className="brand" aria-label="AURELLE home">
          AURELLE<span>®</span>
        </a>
        <nav aria-label="Main navigation">
          {nav.map(([label, id]) => (
            <a href={`#${id}`} key={id}>
              {label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <button
            className="saved-link"
            aria-label={`Saved products (${favorites.length})`}
            onClick={() => setDialog("saved")}
          >
            ♡ <span>{favorites.length > 0 ? favorites.length : ""}</span>
          </button>
          <button onClick={() => setDialog("bag")} className="bag-button">
            Bag <span>({bag.reduce((s, n) => s + n, 0)})</span>
            <svg viewBox="0 0 20 22" aria-hidden="true">
              <path d="M3 7h14l1 13H2L3 7ZM7 8V5a3 3 0 0 1 6 0v3" />
            </svg>
          </button>
          <button
            className={`menu-toggle ${menu ? "open" : ""}`}
            aria-label={menu ? "Close menu" : "Open menu"}
            aria-expanded={menu}
            onClick={() => setMenu((m) => !m)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
      {menu && (
        <Dialog title="Explore AURELLE." onClose={() => setMenu(false)}>
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {nav.map(([label, id], i) => (
              <a href={`#${id}`} onClick={() => setMenu(false)} key={id}>
                <small>0{i + 1}</small>
                {label}
                <span>↗</span>
              </a>
            ))}
          </nav>
        </Dialog>
      )}
      <main>
        <Hero />
        <Signature add={add} />
        <Runway
          add={add}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
        <Ingredients />
        <ClosingCards add={add} />
      </main>
      <footer id="footer">
        <div className="footer-top">
          <div>
            <span className="eyebrow">A note from our world</span>
            <h2>
              Stay in <em>the moment.</em>
            </h2>
            <form
              className="newsletter"
              onSubmit={(e) => {
                e.preventDefault();
                const email = new FormData(e.currentTarget).get("email");
                try {
                  localStorage.setItem(
                    "aurelle-interest",
                    JSON.stringify({
                      email,
                      created: new Date().toISOString(),
                    }),
                  );
                } catch {}
                setNewsletter(true);
              }}
            >
              <label className="sr-only" htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="Your email address"
              />
              <button aria-label="Save interest">↗</button>
            </form>
            <p className="newsletter-note" role="status">
              {newsletter
                ? "Interest saved on this device. No email was sent."
                : "A concept newsletter. Your interest is saved locally only."}
            </p>
          </div>
          <div className="footer-links">
            <div>
              <span className="eyebrow">Explore</span>
              <a href="#collection">The collection</a>
              <a href="#ritual">Your ritual</a>
              <a href="#ingredients">The studio</a>
            </div>
            <div>
              <span className="eyebrow">Connect</span>
              <button onClick={() => setDialog("contact")}>
                Get in touch ↗
              </button>
              <button onClick={() => setDialog("saved")}>
                Your saved essentials
              </button>
              <button onClick={() => setDialog("bag")}>Your bag</button>
            </div>
          </div>
        </div>
        <div className="footer-wordmark" aria-hidden="true">
          AURELLE
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} AURELLE. A skincare concept.</span>
          <span>Considered, always.</span>
          <a href="#top">Back to the beginning ↑</a>
        </div>
      </footer>
      <div className={`toast ${toast ? "visible" : ""}`} role="status">
        {toast}
        <button onClick={() => setDialog("bag")}>View bag ↗</button>
      </div>
      {dialog === "bag" && <Bag items={bag} change={change} onClose={close} />}
      {dialog === "contact" && <Contact onClose={close} />}
      {dialog === "saved" && (
        <Dialog title="The ones you love." onClose={close}>
          {favorites.length ? (
            <div className="saved-products">
              {favorites.map((i) => (
                <article key={i}>
                  <img src={`/media/product-${i}.png`} alt="" />
                  <h3>{products[i].name}</h3>
                  <span>{money(products[i].price)}</span>
                  <button className="dark-button" onClick={() => add(i)}>
                    Add to bag +
                  </button>
                  <button
                    className="text-link"
                    onClick={() => toggleFavorite(i)}
                  >
                    Remove from saved
                  </button>
                </article>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Your favorites will find a home here.</p>
              <button
                className="text-link"
                onClick={() => {
                  close();
                  document.getElementById("collection")?.scrollIntoView();
                }}
              >
                Discover the collection ↗
              </button>
            </div>
          )}
        </Dialog>
      )}
    </>
  );
}
