import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { products, money } from "../lib/products";
export function Dialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement,
      overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    ref.current?.querySelector<HTMLElement>("button,input,a")?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const items = Array.from(
          ref.current!.querySelectorAll<HTMLElement>(
            'button:not(:disabled),a[href],input,textarea,[tabindex="0"]',
          ),
        );
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="dialog-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="dialog-heading">
          <h2>{title}</h2>
          <button onClick={onClose} aria-label="Close dialog">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Bag({
  items,
  change,
  onClose,
}: {
  items: number[];
  change: (i: number, delta: number) => void;
  onClose: () => void;
}) {
  const [summary, setSummary] = useState(false);
  const total = items.reduce((s, n, i) => s + n * products[i].price, 0);
  return (
    <Dialog title="Your daily ritual." onClose={onClose}>
      <p className="dialog-note">
        Your concept collection. Saved on this device.
      </p>
      {items.every((n) => !n) ? (
        <div className="empty-state">
          <span>Good things take a little intention.</span>
          <p>Your bag is waiting for its first essential.</p>
          <button
            className="dark-button"
            onClick={() => {
              onClose();
              document
                .getElementById("collection")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Explore the collection ↗
          </button>
        </div>
      ) : (
        <>
          <div className="bag-items">
            {items.map(
              (n, i) =>
                n > 0 && (
                  <article className="bag-item" key={i}>
                    <img src={`/media/product-${i}.png`} alt="" />
                    <div>
                      <h3>{products[i].name}</h3>
                      <span>
                        {products[i].size} · {money(products[i].price)}
                      </span>
                      <div className="quantity">
                        <button
                          aria-label={`Remove one ${products[i].name}`}
                          onClick={() => change(i, -1)}
                        >
                          −
                        </button>
                        <span>{n}</span>
                        <button
                          aria-label={`Add one ${products[i].name}`}
                          onClick={() => change(i, 1)}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <b>{money(n * products[i].price)}</b>
                  </article>
                ),
            )}
          </div>
          <div className="bag-total">
            <span>Collection total</span>
            <span>{money(total)}</span>
          </div>
          <button className="dark-button" onClick={() => setSummary(true)}>
            Review your ritual <span>↗</span>
          </button>
          {summary && (
            <p className="order-note" role="status">
              Your ritual includes {items.reduce((s, n) => s + n, 0)}{" "}
              essentials, totalling {money(total)}. This is a demonstration
              store. Checkout and payment are not connected.
            </p>
          )}
          <p className="product-note">
            Demo prices in South African Rand. No payment is taken.
          </p>
        </>
      )}
    </Dialog>
  );
}
export function Contact({ onClose }: { onClose: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <Dialog title="A little conversation." onClose={onClose}>
      <p className="dialog-note">
        Prepare a note for the AURELLE team. This concept site does not send
        messages.
      </p>
      <form
        className="contact-form"
        onSubmit={(e) => {
          e.preventDefault();
          const data = new FormData(e.currentTarget);
          const text = `AURELLE enquiry\nFrom: ${data.get("name")}\nEmail: ${data.get("email")}\n\n${data.get("message")}`;
          const url = URL.createObjectURL(
            new Blob([text], { type: "text/plain" }),
          );
          const a = document.createElement("a");
          a.href = url;
          a.download = "aurelle-enquiry.txt";
          a.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          setDone(true);
        }}
      >
        <label>
          Your name
          <input name="name" required autoComplete="name" maxLength={100} />
        </label>
        <label>
          Email address
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
          />
        </label>
        <label>
          Your note
          <textarea name="message" required rows={4} maxLength={2000} />
        </label>
        <button className="dark-button">
          Download enquiry draft <span>↗</span>
        </button>
        {done && (
          <p role="status">
            Your enquiry draft is ready. Nothing has been sent.
          </p>
        )}
      </form>
    </Dialog>
  );
}
