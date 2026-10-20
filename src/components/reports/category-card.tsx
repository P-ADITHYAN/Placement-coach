import { getRubricCategory } from "@/lib/scoring/rubric";
import type { CategoryScore } from "@/lib/types";

function barColor(score: number) {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 65) return "bg-amber-500";
  return "bg-rose-500";
}

export function CategoryCard({ category }: { category: CategoryScore }) {
  const rubric = getRubricCategory(category.categoryId);

  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="font-semibold">{rubric?.name}</h3>
          <p className="text-xs text-muted">
            Weight {Math.round((rubric?.weight ?? 0) * 100)}% · {rubric?.evaluates}
          </p>
        </div>
        <p className="text-xl font-semibold tabular-nums">{category.score}</p>
      </div>
      <div className="mt-3 h-2 rounded-full bg-line" aria-hidden>
        <div className={`h-2 rounded-full ${barColor(category.score)}`} style={{ width: `${category.score}%` }} />
      </div>

      {category.evidence.map((e) => (
        <figure key={e.quote} className="mt-4">
          <blockquote className="border-l-2 border-accent pl-3 text-sm italic">“{e.quote}”</blockquote>
          <figcaption className="mt-1 pl-3 text-sm text-muted">{e.observation}</figcaption>
        </figure>
      ))}

      <ul className="mt-4 space-y-1 text-sm">
        {category.recommendations.map((r) => (
          <li key={r} className="flex gap-2">
            <span className="text-accent">→</span>
            {r}
          </li>
        ))}
      </ul>
    </div>
  );
}
