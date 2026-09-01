"use client";

import { Check } from "lucide-react";
import { AGE_OPTIONS, PRICE_RANGES, type ApiCategory } from "./types";

export type FilterState = {
  categorySlug: string | null;
  ageKey: string | null;
  priceKey: string;
};

export default function FilterPanel({
  categories,
  filters,
  onChange,
  onReset,
}: {
  categories: ApiCategory[];
  filters: FilterState;
  onChange: (next: FilterState) => void;
  onReset: () => void;
}) {
  const hasActiveFilters =
    filters.categorySlug !== null || filters.ageKey !== null || filters.priceKey !== "all";

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-marica-ink">Filter Produk</h2>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="font-body text-xs font-semibold text-marica-amber-text underline-offset-2 hover:underline"
          >
            Reset
          </button>
        )}
      </div>

      {/* Kategori */}
      <div className="flex flex-col gap-3">
        <h3 className="font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft">
          Kategori
        </h3>
        <div className="flex flex-col gap-1">
          <CategoryOption
            label="Semua Kategori"
            active={filters.categorySlug === null}
            onClick={() => onChange({ ...filters, categorySlug: null })}
          />
          {categories.map((cat) => (
            <CategoryOption
              key={cat.id}
              label={cat.name}
              active={filters.categorySlug === cat.slug}
              onClick={() =>
                onChange({
                  ...filters,
                  categorySlug: filters.categorySlug === cat.slug ? null : cat.slug,
                })
              }
            />
          ))}
        </div>
      </div>

      {/* Usia */}
      <div className="flex flex-col gap-3">
        <h3 className="font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft">
          Usia
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {AGE_OPTIONS.map((age) => {
            const active = filters.ageKey === age.key;
            return (
              <button
                key={age.key}
                type="button"
                onClick={() => onChange({ ...filters, ageKey: active ? null : age.key })}
                className={`rounded-xl border px-3 py-2 text-center font-body text-sm font-medium transition ${
                  active
                    ? "border-marica-amber-dark bg-marica-amber/15 text-marica-amber-text"
                    : "border-marica-ink/10 text-marica-ink-soft hover:border-marica-amber-dark/40 hover:text-marica-ink"
                }`}
              >
                {age.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Harga */}
      <div className="flex flex-col gap-3">
        <h3 className="font-body text-xs font-semibold uppercase tracking-wide text-marica-ink-soft">
          Harga
        </h3>
        <div className="flex flex-col gap-1">
          {PRICE_RANGES.map((range) => {
            const active = filters.priceKey === range.key;
            return (
              <button
                key={range.key}
                type="button"
                onClick={() => onChange({ ...filters, priceKey: range.key })}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-marica-cream"
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${
                    active
                      ? "border-marica-amber-dark bg-marica-amber-dark"
                      : "border-marica-ink/25 bg-white"
                  }`}
                >
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                </span>
                <span className="font-body text-sm text-marica-ink-soft">{range.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CategoryOption({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition hover:bg-marica-cream"
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
          active ? "border-marica-amber-dark bg-marica-amber-dark" : "border-marica-ink/25 bg-white"
        }`}
      >
        {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
      </span>
      <span
        className={`font-body text-sm ${active ? "font-semibold text-marica-ink" : "text-marica-ink-soft"}`}
      >
        {label}
      </span>
    </button>
  );
}
