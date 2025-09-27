"use client";

import { useState, useEffect, useCallback } from "react";
import { EYISegment } from "@/components/eyi/eyi-ring";

type SegmentType = "ens" | "spark" | "build" | "voice" | "web";
type SegmentStatus = "idle" | "verifying" | "verified" | "expired";

interface EYISegmentState {
  type: SegmentType;
  status: SegmentStatus;
  expiry?: string;
  verifiedAt?: number;
  userId?: string;
}

const STORAGE_KEY = "eyiSegments";

export function useEYISegments() {
  const [segments, setSegments] = useState<EYISegmentState[]>([]);

  // Load segments from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSegments(parsed);
      } else {
        // Initialize with default segments
        const defaultSegments: EYISegmentState[] = [
          { type: "ens", status: "idle" },
          { type: "spark", status: "idle" },
          { type: "build", status: "idle" },
          { type: "voice", status: "idle" },
          { type: "web", status: "idle" },
        ];
        setSegments(defaultSegments);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultSegments));
      }
    } catch (error) {
      console.error("Failed to load EYI segments:", error);
    }
  }, []);

  // Save segments to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(segments));
    } catch (error) {
      console.error("Failed to save EYI segments:", error);
    }
  }, [segments]);

  const updateSegment = useCallback((type: SegmentType, updates: Partial<EYISegmentState>) => {
    setSegments(prev => 
      prev.map(segment => 
        segment.type === type 
          ? { ...segment, ...updates }
          : segment
      )
    );
  }, []);

  const verifySegment = useCallback((type: SegmentType, userId?: string) => {
    updateSegment(type, {
      status: "verified",
      verifiedAt: Date.now(),
      userId,
    });
  }, [updateSegment]);

  const startVerification = useCallback((type: SegmentType) => {
    updateSegment(type, {
      status: "verifying",
    });
  }, [updateSegment]);

  const expireSegment = useCallback((type: SegmentType) => {
    updateSegment(type, {
      status: "expired",
    });
  }, [updateSegment]);

  const resetSegment = useCallback((type: SegmentType) => {
    updateSegment(type, {
      status: "idle",
      verifiedAt: undefined,
      userId: undefined,
      expiry: undefined,
    });
  }, [updateSegment]);

  // Convert to EYIRing format
  const ringSegments: EYISegment[] = segments.map(segment => ({
    type: segment.type,
    status: segment.status,
    expiry: segment.expiry,
  }));

  const verifiedCount = segments.filter(s => s.status === "verified").length;
  const totalCount = segments.length;
  const progressPercentage = (verifiedCount / totalCount) * 100;

  return {
    segments,
    ringSegments,
    updateSegment,
    verifySegment,
    startVerification,
    expireSegment,
    resetSegment,
    verifiedCount,
    totalCount,
    progressPercentage,
  };
}
