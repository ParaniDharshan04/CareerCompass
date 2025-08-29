import { Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Compass className="h-6 w-6 text-primary" />
      <span className="text-lg font-semibold text-foreground">
        CareerCompass
      </span>
    </div>
  );
}
