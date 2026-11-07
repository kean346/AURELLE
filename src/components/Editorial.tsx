import { lazy, Suspense } from "react";
import { money, products } from "../lib/products";
const ProductWorld = lazy(() => import("./ProductWorld"));
export function Signature({ add }: { add: (i: number) => void }) {
  return (
    <section className="signature" id="signature">
      <div className="signature-view">
        <Suspense
          fallback={<img src="/media/product-0.png" alt="Renewal Serum" />}
        >
          <ProductWorld interactive />
        </Suspense>
        <span className="signature-index eyebrow">A / 01</span>
      </div>
      <div className="signature-copy">
        <span className="eyebrow">Nº 01 / Renewal Serum</span>
        <h2>
          Renewal,
          <br />
          <em>in every dimension.</em>
        </h2>
        <p>
          Smoked glass. Brushed metal. Golden serum. Turn the bottle, follow the
          light, and explore the details up close.
        </p>
        <div className="signature-details">
          <span>Renewal Serum</span>
          <span>30 ml / 1.0 fl oz</span>
        </div>
        <button className="dark-button" onClick={() => add(0)}>
          Add to your ritual <span>{money(products[0].price)} &nbsp; +</span>
        </button>
        <span className="product-note">
          A concept collection. Demo bag; no payment is taken.
        </span>
      </div>
    </section>
  );
}
export function Ingredients() {
  return (
    <section className="ingredients" id="ingredients">
      <div className="ingredients-art">
        <img
          className="serum-macro"
          src="/media/serum-macro.webp"
          alt="Golden serum suspended from a glass pipette above sculpted olive glass"
          loading="lazy"
        />
        <span className="macro-caption eyebrow">
          A STUDY IN GLASS & GOLDEN LIGHT
        </span>
      </div>
      <div className="ingredients-copy">
        <span className="eyebrow">03 — A study in texture</span>
        <h2>
          Liquid gold.
          <br />
          <em>Nothing ordinary.</em>
        </h2>
        <p>
          A suspended drop. A sculpted glass vessel.
          <br />
          Skincare, seen from a different perspective.
        </p>
        <div className="texture-notes">
          <span>
            01 <b>Fluid</b>
            <small>Lightness in every layer</small>
          </span>
          <span>
            02 <b>Comfort</b>
            <small>A softer daily rhythm</small>
          </span>
          <span>
            03 <b>Balance</b>
            <small>Just enough, beautifully</small>
          </span>
        </div>
        <span className="product-note">
          A sensory concept. Ingredient specifications forthcoming.
        </span>
      </div>
    </section>
  );
}
