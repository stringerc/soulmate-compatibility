/**
 * Community Events System
 * Manages virtual events, speed dating, workshops, and event matching
 * Foundation for Community Events feature
 */

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'speed_dating' | 'workshop' | 'mixer' | 'compatibility_workshop';
  startTime: number; // Unix timestamp
  endTime: number;
  maxAttendees: number;
  currentAttendees: number;
  organizerId: string;
  videoLink?: string; // Zoom/Google Meet link
  matchingEnabled: boolean;
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  metadata?: {
    theme?: string;
    ageRange?: string;
    location?: string; // Virtual or physical
  };
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  registeredAt: number;
  status: 'registered' | 'attended' | 'cancelled';
  matches?: string[]; // User IDs of matched attendees
}

/**
 * Store event
 */
export function storeEvent(event: Omit<Event, 'id' | 'currentAttendees' | 'status'>): Event {
  if (typeof window === 'undefined') {
    throw new Error('Cannot store event on server');
  }

  const fullEvent: Event = {
    ...event,
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    currentAttendees: 0,
    status: 'upcoming',
  };

  try {
    const existing = JSON.parse(localStorage.getItem('soulmates_events') || '[]');
    existing.push(fullEvent);
    localStorage.setItem('soulmates_events', JSON.stringify(existing));
  } catch (e) {
    console.error('Failed to store event:', e);
  }

  return fullEvent;
}

/**
 * Get upcoming events
 */
export function getUpcomingEvents(limit: number = 10): Event[] {
  if (typeof window === 'undefined') return [];

  try {
    const all = JSON.parse(localStorage.getItem('soulmates_events') || '[]');
    const now = Date.now();
    
    return all
      .filter((e: Event) => e.startTime > now && e.status === 'upcoming')
      .sort((a: Event, b: Event) => a.startTime - b.startTime)
      .slice(0, limit);
  } catch (e) {
    console.error('Failed to get events:', e);
    return [];
  }
}

/**
 * Register for event
 */
export function registerForEvent(
  eventId: string,
  userId: string
): EventRegistration {
  if (typeof window === 'undefined') {
    throw new Error('Cannot register on server');
  }

  const registration: EventRegistration = {
    id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    eventId,
    userId,
    registeredAt: Date.now(),
    status: 'registered',
  };

  try {
    const existing = JSON.parse(localStorage.getItem('soulmates_event_registrations') || '[]');
    existing.push(registration);
    localStorage.setItem('soulmates_event_registrations', JSON.stringify(existing));

    // Update event attendee count
    const events = JSON.parse(localStorage.getItem('soulmates_events') || '[]');
    const eventIndex = events.findIndex((e: Event) => e.id === eventId);
    if (eventIndex !== -1) {
      events[eventIndex].currentAttendees++;
      localStorage.setItem('soulmates_events', JSON.stringify(events));
    }
  } catch (e) {
    console.error('Failed to register for event:', e);
  }

  return registration;
}

/**
 * Get user's event registrations
 */
export function getUserEventRegistrations(userId: string): EventRegistration[] {
  if (typeof window === 'undefined') return [];

  try {
    const all = JSON.parse(localStorage.getItem('soulmates_event_registrations') || '[]');
    return all.filter((r: EventRegistration) => r.userId === userId);
  } catch (e) {
    console.error('Failed to get registrations:', e);
    return [];
  }
}

/**
 * Match attendees for event based on compatibility
 * In production, this would use actual compatibility scores
 */
export function matchEventAttendees(
  eventId: string,
  userProfiles: Array<{ userId: string; traits?: number[] }>
): Map<string, string[]> {
  const matches = new Map<string, string[]>();

  // Simple matching: pair users with similar trait vectors
  // In production, use calculateCompatibility from compatibilityEngine
  for (let i = 0; i < userProfiles.length; i++) {
    const user1 = userProfiles[i];
    const userMatches: string[] = [];

    for (let j = i + 1; j < userProfiles.length; j++) {
      const user2 = userProfiles[j];
      
      // Simple similarity check (in production, use full compatibility engine)
      if (user1.traits && user2.traits && user1.traits.length === user2.traits.length) {
        const similarity = calculateSimpleSimilarity(user1.traits, user2.traits);
        if (similarity > 0.7) { // 70% similarity threshold
          userMatches.push(user2.userId);
        }
      }
    }

    if (userMatches.length > 0) {
      matches.set(user1.userId, userMatches.slice(0, 5)); // Limit to 5 matches
    }
  }

  return matches;
}

/**
 * Simple similarity calculation (for development)
 * In production, use calculateCompatibility from compatibilityEngine
 */
function calculateSimpleSimilarity(traits1: number[], traits2: number[]): number {
  if (traits1.length !== traits2.length) return 0;

  let sum = 0;
  for (let i = 0; i < traits1.length; i++) {
    sum += 1 - Math.abs(traits1[i] - traits2[i]);
  }

  return sum / traits1.length;
}

/**
 * Create mock events for development
 */
export function createMockEvents(): Event[] {
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const twoWeeks = 14 * 24 * 60 * 60 * 1000;

  return [
    {
      id: 'mock_event_1',
      title: 'Virtual Speed Dating - January Edition',
      description: 'Meet compatible people in a fun, low-pressure virtual speed dating event. Pre-matched based on compatibility scores.',
      type: 'speed_dating',
      startTime: now + oneWeek,
      endTime: now + oneWeek + (2 * 60 * 60 * 1000), // 2 hours
      maxAttendees: 20,
      currentAttendees: 8,
      organizerId: 'system',
      matchingEnabled: true,
      status: 'upcoming',
      metadata: {
        theme: 'Compatibility Focused',
        ageRange: '25-35',
        location: 'Virtual',
      },
    },
    {
      id: 'mock_event_2',
      title: 'Compatibility Workshop: Understanding Your Attachment Style',
      description: 'Learn about attachment styles and how they affect your relationships. Interactive workshop with Q&A.',
      type: 'workshop',
      startTime: now + twoWeeks,
      endTime: now + twoWeeks + (90 * 60 * 1000), // 90 minutes
      maxAttendees: 50,
      currentAttendees: 15,
      organizerId: 'system',
      matchingEnabled: false,
      status: 'upcoming',
      metadata: {
        theme: 'Educational',
        location: 'Virtual',
      },
    },
  ];
}

