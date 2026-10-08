import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { copy } from '@/lib/copy';

export const metadata: Metadata = { title: copy.settings.sections.integrations };

export default function IntegrationsPage() {
  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>Bling</CardTitle>
            <Badge variant="secondary">{copy.common.soon}</Badge>
          </div>
          <CardDescription>{copy.onboarding.bling.text}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button disabled>{copy.cta.connectBling}</Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle>WhatsApp</CardTitle>
            <Badge variant="secondary">{copy.common.soon}</Badge>
          </div>
          <CardDescription>{copy.onboarding.whatsapp.text}</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button disabled>{copy.cta.connectWhatsapp}</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
