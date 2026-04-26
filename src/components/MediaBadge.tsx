'use client';

import { MediaFormat } from '@/types';

interface MediaBadgeProps {
  format: MediaFormat;
  size?: 'sm' | 'md';
}

const formatConfig: Record<MediaFormat, { label: string; className: string }> = {
  '4K UHD': { label: '4K', className: 'badge-4k' },
  'Blu-ray': { label: 'BD', className: 'badge-bluray' },
  'DVD': { label: 'DVD', className: 'badge-dvd' },
  'VHS': { label: 'VHS', className: 'badge-vhs' },
  'Steelbook': { label: 'STEEL', className: 'badge-steelbook' },
  'LaserDisc': { label: 'LD', className: 'badge-dvd' },
  'HD DVD': { label: 'HD', className: 'badge-bluray' },
};

export default function MediaBadge({ format, size = 'sm' }: MediaBadgeProps) {
  const config = formatConfig[format] || { label: format, className: 'badge-dvd' };
  const sizeClasses = size === 'sm' ? 'text-[10px] px-1.5 py-0.5' : 'text-xs px-2 py-1';

  return (
    <span
      className={`inline-block rounded font-bold uppercase tracking-wider ${config.className} ${sizeClasses}`}
    >
      {config.label}
    </span>
  );
}
