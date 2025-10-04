'use client';

import { Badge } from '@/components/ui/badge';

export const AssignmentStatusBadge = ({ status }: { status: 'draft' | 'published' | 'closed' }) => {
  if (status === 'published') return <Badge>published</Badge>;
  if (status === 'closed') return <Badge variant="outline">closed</Badge>;
  return <Badge variant="secondary">draft</Badge>;
};

