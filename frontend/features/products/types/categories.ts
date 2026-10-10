import {
  Watch,
  Sparkles,
  Glasses,
  Briefcase,
  Shirt,
  Cpu,
  Gem,
  Footprints,
  Sofa,
  ShoppingBag,
  BookOpen,
} from "lucide-react";

export const PRODUCT_CATEGORIES = [
  "Electronics",
  "Clothes",
  "Shoes",
  "Furniture",
  "Bags",
  "Books",
  "Accessories",
  "Watches & Accessories",
  "Luxury Fragrances",
  "Eyewear",
  "Leather Goods",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const CATEGORY_ICONS: Record<ProductCategory, React.ElementType> = {
  Electronics: Cpu,
  Clothes: Shirt,
  Shoes: Footprints,
  Furniture: Sofa,
  Bags: ShoppingBag,
  Books: BookOpen,
  Accessories: Gem,
  "Watches & Accessories": Watch,
  "Luxury Fragrances": Sparkles,
  Eyewear: Glasses,
  "Leather Goods": Briefcase,
};
