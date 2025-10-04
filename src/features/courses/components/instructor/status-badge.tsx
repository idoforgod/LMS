'use client';

import { Badge } from '@/components/ui/badge';

export const StatusBadge = ({ status }: { status: 'draft' | 'published' | 'archived' }) => {
  if (status === 'published') return <Badge>published</Badge>;
  if (status === 'archived') return <Badge variant="outline">archived</Badge>;
  return <Badge variant="secondary">draft</Badge>;
};

