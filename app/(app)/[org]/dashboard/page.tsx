import type { Metadata } from 'next';
import { UsersIcon } from 'lucide-react';
import { EmptyState, PageHeader } from '@/components/empty-state';
import { Card, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { requireOrg } from '@/lib/auth';
import { copy } from '@/lib/copy';
import { formatMoney, formatNumber } from '@/lib/format';

export const metadata: Metadata = { title: copy.dashboard.title };

export default async function DashboardPage({ params }: { params: Promise<{ org: string }> }) {
  const { org: slug } = await params;
  const { org } = await requireOrg(slug);
  const kpis = [
    { label: copy.dashboard.kpis.customers, value: formatNumber(0) },
    { label: copy.dashboard.kpis.orders, value: formatNumber(0) },
    { label: copy.dashboard.kpis.revenue, value: formatMoney(0) },
    { label: copy.dashboard.kpis.avgTicket, value: formatMoney(0) },
  ];
  return (
    <>
      <PageHeader title={`${copy.dashboard.greeting}, ${org.name}`} />
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="p-4">
              <CardDescription>{k.label}</CardDescription>
              <CardTitle className="text-2xl tabular-nums">{k.value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>
      <EmptyState
        icon={UsersIcon}
        title={copy.empty.dashboardNoCustomers.title}
        text={copy.empty.dashboardNoCustomers.text}
        cta={{ label: copy.empty.dashboardNoCustomers.cta, href: `/${slug}/settings/integrations` }}
      />
    </>
  );
}
