'use client';

import React, { useMemo, useLayoutEffect, useRef, useState } from 'react';
import type { CalendarEvent } from '@/app/features/temporal/types/temporal.types';

interface EventTimelineProps {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
}

interface PositionedEvent extends CalendarEvent {
  left: number;
  lane: number; // positive = above, negative = below, magnitude = tier
  isAbove: boolean;
}

interface DurationSpan {
  id: string;
  label: string;
  startLeft: number;
  width: number;
  startDate: string;
  endDate: string;
}

export default function EventTimeline({ events, onEventClick }: EventTimelineProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [halfWidthPct, setHalfWidthPct] = useState(12);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) {
      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/ca08aa06-cfed-43a9-8dcb-574a800939e7', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'EventTimeline.tsx:23', message: 'measure skipped - no track', data: { hasTrack: false }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'D' }) }).catch(() => { });
      // #endregion
      return;
    }

    requestAnimationFrame(() => {
      const { width } = track.getBoundingClientRect();
      const cardEl = track.querySelector('.event-card') as HTMLElement | null;
      const cardRect = cardEl?.getBoundingClientRect();
      const cardWidth = cardRect?.width ?? 240;
      const cardHeight = cardRect?.height ?? 96;
      if (width > 0) {
        const gapPx = 24;
        const pct = ((cardWidth + gapPx) / width) * 50;
        const next = Math.min(20, Math.max(10, pct));
        setHalfWidthPct(next);

        // #region agent log
        fetch('http://127.0.0.1:7243/ingest/ca08aa06-cfed-43a9-8dcb-574a800939e7', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'EventTimeline.tsx:35', message: 'measured track', data: { width, cardWidth, cardHeight, halfWidthPct: next }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'D' }) }).catch(() => { });
        // #endregion
      }
    });
  }, [events.length]);

  // Manual positioning overrides from browser preview adjustments
  type ManualPositionOverride = {
    card?: { left?: string; top?: string };
    anchor?: { left?: string; top?: string };
    hinge?: { left?: string; top?: string };
    stem?: { left?: string; top?: string };
  };

  const manualPositionOverrides: Record<string, ManualPositionOverride> = {
    'year-end': { // Natal + Ano Novo (card-below[4])
      card: { left: '-104px', top: '339px' },
      anchor: { left: '214px', top: '-7px' }
    },
    'summer-peak': { // Pico de Verão (card-above[0])
      card: { left: '61px', top: '-170px' },
      anchor: { left: '40px', top: '68px' },
      hinge: { left: '62px', top: '-94px' },
      stem: { left: '-2px', top: '-169px' }
    },
    'maintenance-cycle': { // Janela de Manutenção (card-above[1])
      anchor: { left: '83px', top: '69px' }
    },
    'currency-shock': { // Choque Cambial (card-above[2])
      card: { left: '38px', top: '-356px' },
      anchor: { left: '69px', top: '68px' }
    }
  };

  const { positionedEvents, durationSpans } = useMemo(() => {
    if (events.length === 0) return { positionedEvents: [], durationSpans: [] };

    const sorted = [...events].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const dates = sorted.map(e => new Date(e.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const dateRange = maxDate - minDate || 1;

    // multi-lane placement to avoid collisions
    const laneOrder: number[] = [1, -1, 2, -2, 3, -3, 4, -4];
    const laneEnds = new Map<number, number>(); // lane -> last end (percentage)
    const minGapPct = Math.max(3, halfWidthPct * 0.35); // buffer to avoid touch
    const positioned = sorted.map((event) => {
      const left = ((new Date(event.date).getTime() - minDate) / dateRange) * 100;
      const spanStart = left - halfWidthPct;
      const spanEnd = left + halfWidthPct + minGapPct;

      let lane = 1;
      for (let i = 0; i < laneOrder.length; i++) {
        const candidate = laneOrder[i];
        const lastEnd = laneEnds.get(candidate) ?? -Infinity;
        if (spanStart >= lastEnd) {
          lane = candidate;
          laneEnds.set(candidate, spanEnd);
          break;
        }
      }
      if (!laneEnds.has(lane)) {
        // exhausted known lanes, create next alternating lane
        const nextDepth = Math.floor(laneOrder.length / 2) + 1;
        lane = laneOrder.length % 2 === 0 ? nextDepth : -nextDepth;
        laneOrder.push(lane);
        laneEnds.set(lane, spanEnd);
      }

      const positionedEvent: PositionedEvent = {
        ...event,
        left,
        lane,
        isAbove: lane > 0
      };

      // #region agent log
      fetch('http://127.0.0.1:7243/ingest/ca08aa06-cfed-43a9-8dcb-574a800939e7', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'EventTimeline.tsx:40', message: 'lane assignment', data: { id: event.id, left, lane, spanStart, spanEnd, lastEnd: laneEnds.get(lane) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion

      return positionedEvent;
    });

    const durationSpans: DurationSpan[] = sorted
      .filter(e => e.duration && e.duration.start !== e.duration.end)
      .map(e => {
        const startTs = new Date(e.duration.start).getTime();
        const endTs = new Date(e.duration.end).getTime();
        const clampedStart = Math.max(minDate, Math.min(maxDate, startTs));
        const clampedEnd = Math.max(clampedStart, Math.min(maxDate, endTs));
        const startLeft = ((clampedStart - minDate) / dateRange) * 100;
        const endLeft = ((clampedEnd - minDate) / dateRange) * 100;
        return {
          id: `${e.id}-span`,
          label: e.name,
          startLeft,
          width: Math.max(1, endLeft - startLeft),
          startDate: e.duration.start,
          endDate: e.duration.end
        };
      });

    // #region agent log
    fetch('http://127.0.0.1:7243/ingest/ca08aa06-cfed-43a9-8dcb-574a800939e7', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'EventTimeline.tsx:26', message: 'positioned events computed', data: { count: positioned.length, positions: positioned.slice(0, 6) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion

    return { positionedEvents: positioned, durationSpans };
  }, [events]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="event-timeline no-scrollbar">
      <div className="timeline-track" ref={trackRef}>
        <div className="timeline-axis" />
        <div className="duration-layer">
          {durationSpans.map((span) => (
            <div
              key={span.id}
              className="duration-span"
              style={{ left: `${span.startLeft}%`, width: `${span.width}%` }}
            >
              <span className="duration-label">{span.label}</span>
            </div>
          ))}
        </div>
        {positionedEvents.map((event, idx) => {
          const isPositive = event.demandImpact > 0;
          const laneDepth = Math.abs(event.lane) - 1;
          const baseCardOffset = event.isAbove ? -170 : 200;
          const laneSpacing = 140;
          let cardOffset = event.isAbove
            ? baseCardOffset - laneDepth * laneSpacing
            : baseCardOffset + laneDepth * laneSpacing;

          // Check for manual positioning overrides
          const manualOverride = manualPositionOverrides[event.id];
          const hasManualOverride = !!manualOverride;

          const stemBase = Math.abs(cardOffset);
          const stemLength = stemBase;
          const cardClass = event.isAbove ? 'card-above' : 'card-below';
          const arrowColor = isPositive ? 'var(--color-success)' : 'var(--color-error)';
          const stemOpacity =
            laneDepth === 0 ? 0.95 : laneDepth === 1 ? 0.6 : 0.35;
          const stemDash = laneDepth >= 2;
          const stemColor = `rgba(136, 160, 180, ${stemOpacity})`;

          // #region agent log
          fetch('http://127.0.0.1:7243/ingest/ca08aa06-cfed-43a9-8dcb-574a800939e7', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'EventTimeline.tsx:48', message: 'render marker layout', data: { id: event.id, left: event.left, isAbove: event.isAbove, lane: event.lane, stemLength, cardOffset }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run4', hypothesisId: 'B' }) }).catch(() => { });
          // #endregion

          // Build style objects with manual overrides
          const cardStyle: React.CSSProperties = hasManualOverride && manualOverride.card
            ? {
              top: manualOverride.card.top,
              left: manualOverride.card.left,
              transform: 'none'
            }
            : {
              top: `${cardOffset}px`
            };

          const stemStyle: React.CSSProperties = {
            height: `${stemLength}px`,
            top: event.isAbove ? `${-stemLength}px` : '0',
            opacity: stemOpacity,
            background: 'transparent',
            borderLeft: `2px ${stemDash ? 'dashed' : 'solid'} ${stemColor}`,
            ...(hasManualOverride && manualOverride.stem ? {
              left: manualOverride.stem.left,
              top: manualOverride.stem.top,
              transform: 'none'
            } : {})
          };

          const hingeStyle: React.CSSProperties = {
            top: event.isAbove ? `${-stemLength}px` : `${stemLength}px`,
            borderColor: stemColor,
            opacity: stemOpacity,
            ...(hasManualOverride && manualOverride.hinge ? {
              left: manualOverride.hinge.left,
              top: manualOverride.hinge.top,
              transform: 'none'
            } : {})
          };

          const anchorStyle: React.CSSProperties | undefined = hasManualOverride && manualOverride.anchor
            ? {
              left: manualOverride.anchor.left,
              top: manualOverride.anchor.top,
              transform: 'none'
            }
            : undefined;

          return (
            <div
              key={event.id}
              className={`timeline-marker ${cardClass}`}
              style={{ left: `${event.left}%` }}
              onClick={() => onEventClick?.(event)}
            >
              <div className="stem" style={stemStyle} />
              <div className="hinge" style={hingeStyle} />
              <div
                className={`event-card ${event.isAbove ? 'up' : 'down'}`}
                style={cardStyle}
              >
                <div className="card-row">
                  <div className={`icon-arrow ${isPositive ? 'pos' : 'neg'}`} style={{ color: arrowColor }}>
                    {isPositive ? '↑' : '↓'}
                  </div>
                  <div className="card-title" title={event.name}>{event.name}</div>
                  <div className={`pill impact ${isPositive ? 'pos' : 'neg'}`}>
                    {isPositive ? '+' : ''}{event.demandImpact}%
                  </div>
                </div>
                <div className="card-sub">
                  {formatDate(event.date)} · {event.type === 'season' ? 'Período' : 'Evento'}
                </div>
                <div
                  className={`card-anchor ${event.isAbove ? 'anchor-top' : 'anchor-bottom'}`}
                  style={anchorStyle}
                />
              </div>

              <div className="marker-dot" />

              <div className="marker-tooltip">
                <div className="tooltip-title">{event.name}</div>
                <div className="tooltip-date">{formatDate(event.date)}</div>
                <div className="tooltip-narrative">{event.narrative}</div>
                <div className="tooltip-actions">
                  <strong>⚡ Ações:</strong>
                  <ul>
                    {event.recommendedActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <style jsx>{`
        .event-timeline {
          background: var(--color-surface);
          border-radius: 12px;
          padding: 20px 28px 24px;
          border: 1px solid var(--color-border);
          width: 100%;
          overflow-x: auto;
          overflow-y: visible;
          position: relative;
          scroll-snap-type: x mandatory;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }

        .timeline-track {
          position: relative;
          height: 780px;
          min-width: calc(100% - 24px);
          margin: 0 12px;
        }
        .timeline-axis {
          position: absolute;
          top: 390px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--color-border);
        }
        .duration-layer {
          position: absolute;
          top: 384px;
          left: 0;
          right: 0;
          height: 16px;
          pointer-events: none;
        }
        .duration-span {
          position: absolute;
          top: 2px;
          height: 12px;
          background: linear-gradient(90deg, rgba(32, 160, 132, 0.25), rgba(108, 243, 255, 0.25));
          border: 1px solid rgba(32, 160, 132, 0.55);
          border-radius: 999px;
          box-shadow: 0 0 10px rgba(32,160,132,0.25);
        }
        .duration-label {
          position: absolute;
          top: -18px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 11px;
          color: var(--color-text-secondary);
          white-space: nowrap;
        }
        .timeline-marker {
          position: absolute;
          top: 390px;
          transform: translateX(-50%);
          cursor: pointer;
          text-align: center;
          z-index: 1;
          scroll-snap-align: center;
        }
        .marker-dot {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: #6cf3ff;
          box-shadow: 0 0 16px rgba(108, 243, 255, 0.6);
          border: 2px solid rgba(255,255,255,0.2);
          z-index: 2;
        }
        .stem {
          position: absolute;
          left: 50%;
          width: 0;
          transform: translateX(-50%);
          z-index: 1;
        }
        .hinge {
          position: absolute;
          left: 50%;
          width: 10px;
          height: 10px;
          border: 2px solid var(--color-border);
          border-radius: 50%;
          background: var(--color-surface);
          transform: translate(-50%, -50%);
          box-shadow: 0 0 6px rgba(0,0,0,0.35);
          z-index: 2;
        }
        .event-card {
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          min-width: 180px;
          max-width: 240px;
          background: rgba(15, 36, 56, 0.85);
          border: 1px solid var(--color-border);
          border-radius: 10px;
          padding: 10px 12px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.35);
          backdrop-filter: blur(6px);
          transition: box-shadow 0.2s, transform 0.2s;
          z-index: 2;
        }
        .event-card:hover {
          transform: translateX(-50%) scale(1.02);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
          z-index: 3;
        }
        .card-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .icon-arrow {
          font-size: 16px;
          font-weight: 800;
        }
        .pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 8px;
          border-radius: 999px;
          border: 1px solid transparent;
          font-size: 13px;
          font-weight: 800;
          white-space: nowrap;
        }
        .pill.impact.pos {
          background: rgba(16, 185, 129, 0.15);
          color: var(--color-success);
          border-color: rgba(16,185,129,0.35);
        }
        .pill.impact.neg {
          background: rgba(239, 68, 68, 0.15);
          color: var(--color-error);
          border-color: rgba(239,68,68,0.35);
        }
        .card-title {
          flex: 1;
          font-size: 14px;
          font-weight: 800;
          color: var(--color-text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .card-sub {
          font-size: 11px;
          color: var(--color-text-secondary);
          opacity: 0.55;
          text-align: left;
        }
        .card-anchor {
          position: absolute;
          left: 50%;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.25);
          transform: translateX(-50%);
          box-shadow: 0 0 8px rgba(0,0,0,0.35);
        }
        .anchor-top { bottom: -6px; }
        .anchor-bottom { top: -6px; }

        .marker-tooltip {
          position: absolute;
          bottom: calc(100% + 12px);
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-surface-alt);
          border: 2px solid var(--color-primary);
          border-radius: 8px;
          padding: 14px;
          min-width: 260px;
          max-width: 320px;
          z-index: 1000;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.2s ease;
          word-wrap: break-word;
          white-space: normal;
        }
        .timeline-marker:hover .marker-tooltip {
          opacity: 1;
          transform: translateX(-50%) translateY(-6px);
          pointer-events: auto;
        }
        .timeline-marker:hover .marker-dot {
          width: 18px;
          height: 18px;
          box-shadow: 0 0 24px rgba(108, 243, 255, 0.95);
        }
        .timeline-marker:hover .stem {
          background: rgba(108,243,255,0.8);
          box-shadow: 0 0 16px rgba(108,243,255,0.45);
        }
        .timeline-marker:hover .event-card {
          transform: translateX(-50%) scale(1.05);
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.55);
        }
        .card-below:hover .marker-tooltip {
          bottom: auto;
          top: calc(100% + 12px);
          transform: translateX(-50%) translateY(6px) !important;
        }
        .tooltip-title {
          font-weight: 600;
          color: var(--color-primary);
          margin-bottom: 6px;
          font-size: 14px;
          word-wrap: break-word;
        }
        .tooltip-date {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 10px;
        }
        .tooltip-narrative {
          font-size: 12px;
          color: var(--color-text-secondary);
          margin-bottom: 10px;
          line-height: 1.5;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 8px;
          word-wrap: break-word;
        }
        .tooltip-actions {
          font-size: 12px;
          color: var(--color-text);
        }
        .tooltip-actions strong {
          color: var(--color-warning);
          display: block;
          margin-bottom: 8px;
        }
        .tooltip-actions ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .tooltip-actions li {
          padding-left: 16px;
          position: relative;
          margin-bottom: 6px;
          color: var(--color-text-secondary);
          word-wrap: break-word;
          line-height: 1.5;
        }
        .tooltip-actions li:before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--color-success);
          font-weight: bold;
        }
        @media (max-width: 768px) {
          .event-timeline { padding: 12px; }
          .timeline-track { height: 220px; }
          .event-card { min-width: 150px; max-width: 200px; }
          .card-title { font-size: 11px; }
          .card-sub { font-size: 10px; }
        }
      `}</style>
    </div>
  );
}

