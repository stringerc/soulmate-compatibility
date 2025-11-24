/**
 * Analytics Tracking Utilities
 * Tracks user behavior and events for data-driven improvements
 * 
 * Research-based implementation following:
 * - Google Analytics 4 best practices
 * - Privacy-first approach (no PII)
 * - GDPR-compliant tracking
 */

export interface AnalyticsEvent {
  name: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  properties?: Record<string, any>;
}

class Analytics {
  private enabled: boolean = false;
  private events: AnalyticsEvent[] = [];

  constructor() {
    // Check if analytics should be enabled (respect user privacy)
    if (typeof window !== 'undefined') {
      // Check for opt-out cookie/localStorage
      const optOut = localStorage.getItem('analytics-opt-out') === 'true';
      this.enabled = !optOut && this.isAnalyticsAvailable();
    }
  }

  private isAnalyticsAvailable(): boolean {
    // Check if Google Analytics or other analytics tools are available
    return typeof window !== 'undefined' && (
      typeof (window as any).gtag !== 'undefined' ||
      typeof (window as any).dataLayer !== 'undefined'
    );
  }

  /**
   * Track an event
   */
  track(event: AnalyticsEvent): void {
    if (!this.enabled) {
      // Store events locally for potential later sync
      this.events.push(event);
      return;
    }

    // Google Analytics 4
    if (typeof (window as any).gtag !== 'undefined') {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
        ...event.properties,
      });
    }

    // Google Analytics Universal (legacy)
    if (typeof (window as any).dataLayer !== 'undefined') {
      (window as any).dataLayer.push({
        event: event.name,
        category: event.category,
        action: event.action,
        label: event.label,
        value: event.value,
        ...event.properties,
      });
    }

    // Console logging for development
    if (process.env.NODE_ENV === 'development') {
      console.log('[Analytics]', event);
    }
  }

  /**
   * Track page view
   */
  pageView(path: string, title?: string): void {
    this.track({
      name: 'page_view',
      category: 'navigation',
      action: 'page_view',
      label: path,
      properties: {
        page_path: path,
        page_title: title || document.title,
      },
    });
  }

  /**
   * Track scenario completion
   */
  trackScenarioCompletion(scenarioIndex: number, chapterIndex: number, timeSpent: number): void {
    this.track({
      name: 'scenario_completed',
      category: 'scenario',
      action: 'completed',
      label: `scenario_${scenarioIndex}_chapter_${chapterIndex}`,
      value: timeSpent,
      properties: {
        scenario_index: scenarioIndex,
        chapter_index: chapterIndex,
        time_spent_ms: timeSpent,
      },
    });
  }

  /**
   * Track completion rate
   */
  trackCompletion(personNumber: number, completed: boolean, totalScenarios: number, completedScenarios: number): void {
    this.track({
      name: 'completion',
      category: 'user_flow',
      action: completed ? 'completed' : 'abandoned',
      label: `person_${personNumber}`,
      value: completedScenarios,
      properties: {
        person_number: personNumber,
        completed,
        total_scenarios: totalScenarios,
        completed_scenarios: completedScenarios,
        completion_rate: completedScenarios / totalScenarios,
      },
    });
  }

  /**
   * Track drop-off point
   */
  trackDropOff(personNumber: number, chapterIndex: number, scenarioIndex: number, reason?: string): void {
    this.track({
      name: 'drop_off',
      category: 'user_flow',
      action: 'dropped_off',
      label: `person_${personNumber}_chapter_${chapterIndex}_scenario_${scenarioIndex}`,
      properties: {
        person_number: personNumber,
        chapter_index: chapterIndex,
        scenario_index: scenarioIndex,
        reason,
      },
    });
  }

  /**
   * Track error
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.track({
      name: 'error',
      category: 'error',
      action: 'error_occurred',
      label: error.message,
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        ...context,
      },
    });
  }

  /**
   * Track button click
   */
  trackButtonClick(buttonName: string, location: string): void {
    this.track({
      name: 'button_click',
      category: 'interaction',
      action: 'click',
      label: buttonName,
      properties: {
        button_name: buttonName,
        location,
      },
    });
  }

  /**
   * Track time spent
   */
  trackTimeSpent(section: string, timeMs: number): void {
    this.track({
      name: 'time_spent',
      category: 'engagement',
      action: 'time_spent',
      label: section,
      value: timeMs,
      properties: {
        section,
        time_ms: timeMs,
        time_seconds: Math.round(timeMs / 1000),
      },
    });
  }
}

// Export singleton instance
export const analytics = new Analytics();

// Helper functions for common tracking
export const trackScenarioStart = (scenarioIndex: number, chapterIndex: number) => {
  analytics.track({
    name: 'scenario_start',
    category: 'scenario',
    action: 'started',
    label: `scenario_${scenarioIndex}`,
    properties: {
      scenario_index: scenarioIndex,
      chapter_index: chapterIndex,
    },
  });
};

export const trackScenarioComplete = (scenarioIndex: number, chapterIndex: number, timeSpent: number) => {
  analytics.trackScenarioCompletion(scenarioIndex, chapterIndex, timeSpent);
};

export const trackCompletion = (personNumber: number, completed: boolean, totalScenarios: number, completedScenarios: number) => {
  analytics.trackCompletion(personNumber, completed, totalScenarios, completedScenarios);
};

export const trackDropOff = (personNumber: number, chapterIndex: number, scenarioIndex: number, reason?: string) => {
  analytics.trackDropOff(personNumber, chapterIndex, scenarioIndex, reason);
};

export const trackError = (error: Error, context?: Record<string, any>) => {
  analytics.trackError(error, context);
};

export const trackButtonClick = (buttonName: string, location: string) => {
  analytics.trackButtonClick(buttonName, location);
};

