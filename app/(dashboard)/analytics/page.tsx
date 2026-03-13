import { PageHeader } from "@/components/admin/PageHeader";
import { SimpleBarChart } from "@/components/admin/SimpleBarChart";
import { categoryPerformance, funnelPoints } from "@/lib/admin/mock-data";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Business Intelligence"
        title="Analytics"
        description="Measure the full marketplace funnel from interest to payment and compare category-level commercial performance."
      />

      <div className="grid gap-6 xl:grid-cols-2">
        <SimpleBarChart
          title="Deal funnel"
          description="Current snapshot of marketplace movement from visibility to paid conversion."
          points={funnelPoints}
        />
        <SimpleBarChart
          title="Category performance"
          description="Relative category strength based on active commercial contribution."
          points={categoryPerformance}
          suffix="%"
        />
      </div>
    </div>
  );
}
