'use client';

import { FC, useMemo } from 'react';
import clsx from 'clsx';
import { useCalendar } from '@gitroom/frontend/components/launches/calendar.context';
import { useT } from '@gitroom/react/translation/get.transation.service.client';
import { NewPost } from '@gitroom/frontend/components/launches/new.post';

// Phase 3 — compact "command center" header rendered above the calendar filters.
// Operational, not marketing. Every number is derived from data already loaded by
// CalendarWeekProvider (integrations + the posts in the current view) — no new backend calls.
export const CommandCenterHeader: FC = () => {
  const t = useT();
  const calendar = useCalendar() as any;

  const stats = useMemo(() => {
    const ints: any[] = calendar?.integrations || [];
    const ps: any[] = calendar?.posts || [];
    return {
      activeAccounts: ints.filter((i) => !i?.disabled).length,
      totalAccounts: ints.length,
      scheduled: ps.filter((p) => p?.state === 'QUEUE').length,
      drafts: ps.filter((p) => p?.state === 'DRAFT').length,
      attention:
        ints.filter((i) => i?.refreshNeeded || i?.inBetweenSteps).length +
        ps.filter((p) => p?.state === 'ERROR').length,
    };
  }, [calendar?.integrations, calendar?.posts]);

  const hasAccounts = (calendar?.integrations || []).length > 0;

  const cards: Array<{
    label: string;
    value: number;
    sub?: number;
    color?: string;
    attention?: boolean;
  }> = [
    {
      label: t('cc_active', 'Active accounts'),
      value: stats.activeAccounts,
      sub: stats.totalAccounts,
      color: 'text-[#00D2C8]',
    },
    {
      label: t('cc_scheduled', 'Scheduled'),
      value: stats.scheduled,
      color: 'text-[#FF2364]',
    },
    {
      label: t('cc_drafts', 'Drafts'),
      value: stats.drafts,
      color: 'text-newTextColor',
    },
    {
      label: t('cc_attention', 'Needs attention'),
      value: stats.attention,
      attention: stats.attention > 0,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-[12px]">
      <div className="flex flex-col flex-1 min-w-[180px]">
        <div className="text-[11px] tracking-[0.18em] uppercase text-[#FF2364] font-[600]">
          Woodstock &amp; Wifi
        </div>
        <div className="text-[18px] font-[600] text-newTextColor leading-[1.2]">
          {t('command_center_subtitle', 'Social Content Command Center')}
        </div>
      </div>
      <div className="flex items-stretch gap-[8px] flex-wrap">
        {cards.map((c, i) => (
          <div
            key={i}
            className={clsx(
              'flex flex-col justify-center px-[14px] py-[8px] rounded-[10px] min-w-[100px] border bg-newBgColor',
              c.attention ? 'border-[#FF2364]' : 'border-newColColor'
            )}
          >
            <div className="flex items-baseline gap-[4px]">
              <span
                className={clsx(
                  'text-[20px] font-[700] leading-none',
                  c.attention ? 'text-[#FF2364]' : c.color
                )}
              >
                {c.value}
              </span>
              {typeof c.sub === 'number' && (
                <span className="text-[12px] text-textItemBlur">/{c.sub}</span>
              )}
            </div>
            <div className="text-[11px] text-textItemBlur whitespace-nowrap mt-[2px]">
              {c.label}
            </div>
          </div>
        ))}
        {hasAccounts && (
          <div className="flex min-w-[150px]">
            <NewPost />
          </div>
        )}
      </div>
    </div>
  );
};
