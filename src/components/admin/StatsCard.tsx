import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ title, value, icon, description, trend, className }: StatsCardProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            <div className="flex items-baseline gap-1.5">
              <h3 className="text-lg sm:text-xl font-bold leading-tight">{value}</h3>
              {trend && (
                <span
                  className={cn(
                    'text-[10px] font-medium',
                    trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                  )}
                >
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
              )}
            </div>
            {description && (
              <p className="text-[10px] text-muted-foreground leading-tight">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
