'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface TemporalAnimationOptions {
  startDate: string;
  endDate: string;
  speed: 1 | 2 | 5 | 10; // Animation speed multiplier
  onDateChange?: (date: string) => void;
  onComplete?: () => void;
}

export function useTemporalAnimation({
  startDate,
  endDate,
  speed,
  onDateChange,
  onComplete,
}: TemporalAnimationOptions) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentDate, setCurrentDate] = useState(startDate);
  const [progress, setProgress] = useState(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const durationRef = useRef<number>(0);

  // Calculate duration based on date range
  useEffect(() => {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    durationRef.current = end - start;
  }, [startDate, endDate]);

  const play = useCallback(() => {
    if (isPlaying) return;

    setIsPlaying(true);
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const duration = end - start;
    const startTime = Date.now() - (progress / 100) * duration;

    const animate = () => {
      const now = Date.now();
      const elapsed = (now - startTime) * speed;
      const newProgress = Math.min(100, (elapsed / duration) * 100);
      const newDate = new Date(start + elapsed);

      setProgress(newProgress);
      setCurrentDate(newDate.toISOString().split('T')[0]);
      onDateChange?.(newDate.toISOString().split('T')[0]);

      if (newProgress >= 100) {
        setIsPlaying(false);
        onComplete?.();
        return;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    startTimeRef.current = startTime;
    animationRef.current = requestAnimationFrame(animate);
  }, [isPlaying, startDate, endDate, speed, progress, onDateChange, onComplete]);

  const pause = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    pause();
    setCurrentDate(startDate);
    setProgress(0);
  }, [startDate, pause]);

  const step = useCallback(
    (direction: 'forward' | 'backward') => {
      const current = new Date(currentDate).getTime();
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const stepSize = (end - start) / 100; // 1% step

      const newTime = direction === 'forward' ? current + stepSize : current - stepSize;
      const clampedTime = Math.max(start, Math.min(end, newTime));
      const newDate = new Date(clampedTime);

      setCurrentDate(newDate.toISOString().split('T')[0]);
      setProgress(((clampedTime - start) / (end - start)) * 100);
      onDateChange?.(newDate.toISOString().split('T')[0]);
    },
    [currentDate, startDate, endDate, onDateChange]
  );

  const seek = useCallback(
    (percentage: number) => {
      const start = new Date(startDate).getTime();
      const end = new Date(endDate).getTime();
      const newTime = start + (end - start) * (percentage / 100);
      const newDate = new Date(newTime);

      setCurrentDate(newDate.toISOString().split('T')[0]);
      setProgress(percentage);
      onDateChange?.(newDate.toISOString().split('T')[0]);
    },
    [startDate, endDate, onDateChange]
  );

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    currentDate,
    progress,
    play,
    pause,
    reset,
    step,
    seek,
  };
}

