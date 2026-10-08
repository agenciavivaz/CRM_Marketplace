import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { copy } from '@/lib/copy';

export function ComingSoon({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{copy.settings.comingSoon}</CardDescription>
      </CardHeader>
    </Card>
  );
}
