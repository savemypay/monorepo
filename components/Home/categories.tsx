"use client";

import {CategoryCard} from "./CategoryCard"

export default function Categories() {
  return (
    <section id="categories" className="pb-12 md:pb-24 bg-white">
      <div className="max-w-[1200px] mx-auto px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold text-[var(--primary)]">
            Featured Categories
          </h2>
          <p className="mt-4 text-[var(--gray)] max-w-xl mx-auto">
            Starting with high-value purchases where bulk buying makes the biggest impact
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-3 gap-10">
          <CategoryCard
            icon="🛡️"
            title="Insurance Plans"
            desc="Access group rates on insurance products with massive savings."
          />
          <CategoryCard
            icon="🏠"
            title="Property Deals"
            desc="Unlock exclusive bulk property offers and negotiated pricing."
          />
          <CategoryCard
            icon="🚗"
            title="Automotive"
            desc="Get fleet pricing on new and pre-owned vehicles."
          />
        </div>
      </div>
    </section>
  );
}
