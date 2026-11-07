export const products = [
  {
    name: "Renewal Serum",
    category: "The daily essential",
    price: 1250,
    size: "30 ml",
    color: "#6d3b1f",
    shape: "dropper",
    ratio: 0.38,
  },
  {
    name: "Essential Cleanser",
    category: "A fresh beginning",
    price: 680,
    size: "150 ml",
    color: "#cdc4aa",
    shape: "pump",
    ratio: 0.34,
  },
  {
    name: "Restorative Cream",
    category: "A moment of comfort",
    price: 980,
    size: "50 ml",
    color: "#d5cbb4",
    shape: "jar",
    ratio: 1.0,
  },
  {
    name: "Radiance Mist",
    category: "Your midday pause",
    price: 720,
    size: "100 ml",
    color: "#958570",
    shape: "mist",
    ratio: 0.34,
  },
  {
    name: "Barrier Oil",
    category: "The finishing touch",
    price: 1100,
    size: "30 ml",
    color: "#593d27",
    shape: "dropper",
    ratio: 0.38,
  },
  {
    name: "Recovery Mask",
    category: "An evening to yourself",
    price: 890,
    size: "75 ml",
    color: "#6f7065",
    shape: "jar",
    ratio: 1.0,
  },
] as const;
export const money = (n: number) => `R ${n.toLocaleString("en-ZA")}`;
export const wrap = (x: number, n: number) => ((x % n) + n) % n;
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
