import { useEffect, useRef, useState, useCallback } from "react";

// Physics constants - tuned for TikTok-like feel
const DRAG_THRESHOLD = 0.15; // 15% of screen height to trigger snap
const VELOCITY_THRESHOLD = 0.3; // px/ms for flick detection
const RUBBER_BAND_FACTOR = 0.4; // How much resistance at boundaries (lower = more resistance)
const RUBBER_BAND_MAX = 120; // Max px of overscroll

// Spring physics constants
const SPRING_TENSION = 300; // Higher = snappier
const SPRING_FRICTION = 26; // Higher = less bouncy
const SPRING_PRECISION = 0.01; // When to consider animation complete

interface DragOptions {
  onNext?: () => void;
  onPrevious?: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  preventDefaultTouchMove?: boolean;
}

export interface DragState {
  isDragging: boolean;
  dragOffset: number;
  velocity: number;
  isAnimating: boolean;
}

// Spring physics solver
function springStep(
  current: number,
  velocity: number,
  target: number,
  tension: number,
  friction: number,
  dt: number
): { position: number; velocity: number } {
  const displacement = current - target;
  const springForce = -tension * displacement;
  const dampingForce = -friction * velocity;
  const acceleration = springForce + dampingForce;
  
  const newVelocity = velocity + acceleration * dt;
  const newPosition = current + newVelocity * dt;
  
  return { position: newPosition, velocity: newVelocity };
}

// Helper function to detect if we're on mobile (tablet/phone)
function isMobile(): boolean {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768; // Tailwind md breakpoint
}

export function useDrag({
  onNext,
  onPrevious,
  canGoNext,
  canGoPrevious,
  preventDefaultTouchMove = true,
}: DragOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Touch tracking
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const lastTouchY = useRef<number>(0);
  const lastTouchTime = useRef<number>(0);

  // Mouse tracking
  const mouseStartY = useRef<number>(0);
  const mouseStartTime = useRef<number>(0);
  const isMouseDown = useRef<boolean>(false);
  const lastMouseY = useRef<number>(0);
  const lastMouseTime = useRef<number>(0);

  // Animation state
  const animationRef = useRef<number | null>(null);
  const currentVelocity = useRef<number>(0);
  const currentOffset = useRef<number>(0);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Apply rubber band resistance at boundaries
  const applyRubberBand = useCallback((offset: number, canMove: boolean): number => {
    if (canMove) return offset;

    // Apply logarithmic resistance for natural iOS-like feel
    const absOffset = Math.abs(offset);
    const sign = offset > 0 ? 1 : -1;
    
    // Rubber band formula: offset * factor / (1 + offset / max)
    const resistedOffset = (absOffset * RUBBER_BAND_FACTOR) / (1 + absOffset / RUBBER_BAND_MAX);
    
    return sign * Math.min(resistedOffset, RUBBER_BAND_MAX * RUBBER_BAND_FACTOR);
  }, []);

  // Animate with spring physics
  const animateSpring = useCallback((
    startOffset: number,
    startVelocity: number,
    targetOffset: number,
    onComplete?: () => void
  ) => {
    setIsAnimating(true);
    
    let position = startOffset;
    let velocity = startVelocity * 1000; // Convert to px/s for physics
    let lastTime = performance.now();

    const animate = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.064); // Cap at ~16fps minimum
      lastTime = time;

      const result = springStep(position, velocity, targetOffset, SPRING_TENSION, SPRING_FRICTION, dt);
      position = result.position;
      velocity = result.velocity;

      currentOffset.current = position;
      setDragOffset(position);

      // Check if animation is complete (position and velocity near zero/target)
      const isComplete = 
        Math.abs(position - targetOffset) < SPRING_PRECISION &&
        Math.abs(velocity) < SPRING_PRECISION * 100;

      if (isComplete) {
        setDragOffset(targetOffset);
        currentOffset.current = targetOffset;
        setIsAnimating(false);
        onComplete?.();
      } else {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, []);

  // Calculate velocity from recent movement
  const calculateVelocity = useCallback((currentY: number, currentTime: number, lastY: number, lastTime: number): number => {
    const deltaY = currentY - lastY;
    const deltaTime = currentTime - lastTime;
    return deltaTime > 0 ? deltaY / deltaTime : 0;
  }, []);

  // Calculate if we should snap to next/previous based on offset and velocity
  const shouldSnap = useCallback((offset: number, velocity: number, screenHeight: number): 'next' | 'previous' | 'current' => {
    const offsetPercent = Math.abs(offset) / screenHeight;

    // High velocity flick detection (prioritize over threshold)
    if (Math.abs(velocity) > VELOCITY_THRESHOLD) {
      if (velocity < 0 && canGoNext) return 'next'; // Dragging up fast
      if (velocity > 0 && canGoPrevious) return 'previous'; // Dragging down fast
    }

    // Threshold detection: dragged far enough
    if (offsetPercent > DRAG_THRESHOLD) {
      if (offset < 0 && canGoNext) return 'next';
      if (offset > 0 && canGoPrevious) return 'previous';
    }

    return 'current';
  }, [canGoNext, canGoPrevious]);

  // Handle drag end logic
  const handleDragEnd = useCallback((velocity: number) => {
    setIsDragging(false);
    
    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const screenHeight = window.innerHeight;
    const offset = currentOffset.current;
    const snapDirection = shouldSnap(offset, velocity, screenHeight);

    if (snapDirection === 'next') {
      // Animate to full screen height up, then trigger callback
      animateSpring(offset, velocity, -screenHeight, () => {
        setDragOffset(0);
        currentOffset.current = 0;
        onNext?.();
      });
    } else if (snapDirection === 'previous') {
      // Animate to full screen height down, then trigger callback
      animateSpring(offset, velocity, screenHeight, () => {
        setDragOffset(0);
        currentOffset.current = 0;
        onPrevious?.();
      });
    } else {
      // Bounce back to center with spring
      animateSpring(offset, velocity, 0);
    }
  }, [shouldSnap, animateSpring, onNext, onPrevious]);

  useEffect(() => {
    // Check if target should be ignored (buttons, interactive elements)
    const shouldIgnoreTarget = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof HTMLElement)) return false;
      
      // Only check the target and a few levels up (not the whole tree)
      // because body/html have touch-action: none globally
      let el: HTMLElement | null = target;
      let depth = 0;
      const maxDepth = 5; // Only check 5 levels up
      
      while (el && depth < maxDepth) {
        if (
          el.tagName === 'BUTTON' ||
          el.tagName === 'A' ||
          el.getAttribute('role') === 'button' ||
          el.dataset.ignoreDrag === 'true'
        ) {
          return true;
        }
        el = el.parentElement;
        depth++;
      }
      return false;
    };

    // Touch event handlers
    const handleTouchStart = (e: TouchEvent) => {
      // Disable drag on mobile devices
      if (isMobile()) return;

      // Ignore if starting on an interactive element
      if (shouldIgnoreTarget(e.target)) return;

      // Cancel any running animation
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        setIsAnimating(false);
      }
      
      setIsDragging(true);
      const touch = e.touches[0];
      const now = performance.now();
      
      touchStartY.current = touch.clientY;
      lastTouchY.current = touch.clientY;
      touchStartTime.current = now;
      lastTouchTime.current = now;
      currentOffset.current = 0;
      currentVelocity.current = 0;
      setDragOffset(0);
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Only process if we started a drag
      if (touchStartY.current === 0) return;

      if (preventDefaultTouchMove) {
        e.preventDefault();
      }

      const touch = e.touches[0];
      const now = performance.now();
      const rawOffset = touch.clientY - touchStartY.current;

      // Calculate instantaneous velocity for smoother feel
      currentVelocity.current = calculateVelocity(
        touch.clientY, now, lastTouchY.current, lastTouchTime.current
      );

      // Apply rubber band at boundaries
      let offset = rawOffset;
      if (rawOffset > 0) {
        offset = applyRubberBand(rawOffset, canGoPrevious);
      } else {
        offset = applyRubberBand(rawOffset, canGoNext);
      }

      currentOffset.current = offset;
      setDragOffset(offset);
      lastTouchY.current = touch.clientY;
      lastTouchTime.current = now;
    };

    const handleTouchEnd = () => {
      // Only process if we started a drag
      if (touchStartY.current === 0) return;

      handleDragEnd(currentVelocity.current);
      
      // Reset refs
      touchStartY.current = 0;
      lastTouchY.current = 0;
      touchStartTime.current = 0;
      lastTouchTime.current = 0;
    };

    // Mouse event handlers
    const handleMouseDown = (e: MouseEvent) => {
      // Disable drag on mobile devices
      if (isMobile()) return;

      // Ignore if starting on an interactive element
      if (shouldIgnoreTarget(e.target)) return;

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        setIsAnimating(false);
      }
      
      isMouseDown.current = true;
      setIsDragging(true);
      const now = performance.now();
      
      mouseStartY.current = e.clientY;
      lastMouseY.current = e.clientY;
      mouseStartTime.current = now;
      lastMouseTime.current = now;
      currentOffset.current = 0;
      currentVelocity.current = 0;
      setDragOffset(0);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown.current) return;

      const now = performance.now();
      const rawOffset = e.clientY - mouseStartY.current;

      currentVelocity.current = calculateVelocity(
        e.clientY, now, lastMouseY.current, lastMouseTime.current
      );

      let offset = rawOffset;
      if (rawOffset > 0) {
        offset = applyRubberBand(rawOffset, canGoPrevious);
      } else {
        offset = applyRubberBand(rawOffset, canGoNext);
      }

      currentOffset.current = offset;
      setDragOffset(offset);
      lastMouseY.current = e.clientY;
      lastMouseTime.current = now;
    };

    const handleMouseUp = () => {
      if (!isMouseDown.current) return;

      handleDragEnd(currentVelocity.current);

      // Reset refs
      isMouseDown.current = false;
      mouseStartY.current = 0;
      lastMouseY.current = 0;
      mouseStartTime.current = 0;
      lastMouseTime.current = 0;
    };

    // Add event listeners
    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchmove", handleTouchMove, { passive: !preventDefaultTouchMove });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    document.addEventListener("touchcancel", handleTouchEnd, { passive: true });
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mouseleave", handleMouseUp);

    // Cleanup
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("touchcancel", handleTouchEnd);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mouseleave", handleMouseUp);
    };
  }, [onNext, onPrevious, canGoNext, canGoPrevious, preventDefaultTouchMove, applyRubberBand, handleDragEnd, calculateVelocity]);

  return {
    isDragging,
    dragOffset,
    velocity: currentVelocity.current,
    isAnimating,
  };
}
