import type {
  HabitatGraph,
  SequenceStepId,
  SequencerEvent,
  SequencerMode,
  SequencerPolicy,
  SequencerState,
  StepStatus,
} from './types.ts';
import { SIM_PARAMS } from './sim_params.ts';

const STEP_ORDER: SequenceStepId[] = [
  'ALARM',
  'REMOVE_POWER',
  'ISOLATE_VENTILATION',
  'INHIBIT_MAKEUP',
  'SUPPRESSION',
  'POST_FIRE_RECOVERY',
];

export const DEFAULT_SEQUENCER_POLICY: SequencerPolicy = {
  powerRemovalAutomatic: true,
  powerRemovalNote: 'sources disagree; verify in NASA-STD-3001 brief',
  uncrewedSuppressionTimeout_s: SIM_PARAMS.uncrewed_suppression_timeout_s.value,
};

/**
 * Spacecraft Fire Emergency Response Sequencer
 *
 * Implements emergency containment and suppression sequencing:
 * ALARM -> REMOVE_POWER -> ISOLATE_VENTILATION -> INHIBIT_MAKEUP -> SUPPRESSION -> POST_FIRE_RECOVERY
 *
 * Grounded in NASA operational principles (NTRS-20030053429, NTRS-20130011664):
 * - CREWED mode: Ventilation isolation and power removal occur rapidly; suppression
 *   requires explicit human confirmation to safeguard astronaut breathing volumes.
 * - UNCREWED mode: Fully autonomous after timeout; discharges inert gas flooding.
 * - Manual override available at all steps; comprehensive event audit trail maintained.
 */
export class ResponseSequencer {
  private state: SequencerState;
  private habitat: HabitatGraph;
  private alarmTriggeredTimestamp_s?: number;
  private isolationCompletedTimestamp_s?: number;

  constructor(habitat: HabitatGraph, mode?: SequencerMode, policyOverrides?: Partial<SequencerPolicy>) {
    this.habitat = habitat;
    const initialMode: SequencerMode = mode || (habitat.isCrewed ? 'CREWED' : 'UNCREWED');
    const policy: SequencerPolicy = {
      ...DEFAULT_SEQUENCER_POLICY,
      ...policyOverrides,
    };

    const stepsRecord = {} as Record<SequenceStepId, { status: StepStatus; timestamp_s?: number; actor: string }>;
    for (const step of STEP_ORDER) {
      stepsRecord[step] = {
        status: 'PENDING',
        actor: 'SYSTEM',
      };
    }

    this.state = {
      mode: initialMode,
      policy,
      currentStep: 'ALARM',
      steps: stepsRecord,
      eventLog: [],
      crewSafetyAlerts: [],
    };

    this.configureSuppressionRecommendation();
  }

  private configureSuppressionRecommendation(): void {
    if (this.state.mode === 'CREWED') {
      this.state.suppressionAgentRecommendation = 'WATER_MIST';
      this.state.crewSafetyAlerts = [
        'CO2 flooding poses asphyxiation and hypercapnia hazards in habitable volumes; requires Portable Breathing Apparatus (PBA) donning prior to discharge (literature:NTRS-20130011664).',
        'Fine water mist recommended for crewed compartments: absorbs thermal energy without suffocating cabin atmosphere.',
      ];
    } else {
      this.state.suppressionAgentRecommendation = 'INERT_GAS_FLOOD';
      this.state.crewSafetyAlerts = [
        'Uncrewed autonomous mode: Inert gas flood authorized following ventilation isolation timeout.',
      ];
    }
  }

  getState(): SequencerState {
    return {
      ...this.state,
      steps: { ...this.state.steps },
      eventLog: [...this.state.eventLog],
      crewSafetyAlerts: [...this.state.crewSafetyAlerts],
    };
  }

  getHabitat(): HabitatGraph {
    return this.habitat;
  }

  getAlarmTime(): number | undefined {
    return this.alarmTriggeredTimestamp_s;
  }

  private logEvent(
    timestamp_s: number,
    stepId: SequenceStepId,
    action: string,
    actor: 'SYSTEM' | 'CREW' | 'GROUND',
    automated: boolean,
    overrideActive: boolean,
    details: string
  ): void {
    const event: SequencerEvent = {
      timestamp_s,
      stepId,
      action,
      actor,
      automated,
      overrideActive,
      details,
    };
    this.state.eventLog.push(event);
  }

  /**
   * Triggers initial fire alarm on the sequencer.
   * Begins emergency sequence progression.
   */
  triggerAlarm(sourceZoneId: string, timestamp_s: number): void {
    this.alarmTriggeredTimestamp_s = timestamp_s;
    this.state.steps.ALARM = {
      status: 'COMPLETED',
      timestamp_s,
      actor: 'SYSTEM',
    };
    this.logEvent(
      timestamp_s,
      'ALARM',
      'FIRE_ALARM_DECLARED',
      'SYSTEM',
      true,
      false,
      `Fire alarm confirmed in source zone "${sourceZoneId}". Emergency response sequence initiated.`
    );

    // Advance to REMOVE_POWER
    this.state.currentStep = 'REMOVE_POWER';
    if (this.state.policy.powerRemovalAutomatic) {
      this.executeRemovePower(sourceZoneId, timestamp_s, 'SYSTEM', true);
    } else {
      this.state.steps.REMOVE_POWER = {
        status: 'ARMED',
        timestamp_s,
        actor: 'SYSTEM',
      };
      this.logEvent(
        timestamp_s,
        'REMOVE_POWER',
        'POWER_REMOVAL_ARMED',
        'SYSTEM',
        true,
        false,
        `Power removal armed. Waiting manual confirmation (${this.state.policy.powerRemovalNote}).`
      );
    }
  }

  /**
   * Executes power removal for the affected zone.
   */
  executeRemovePower(
    zoneId: string,
    timestamp_s: number,
    actor: 'SYSTEM' | 'CREW' | 'GROUND' = 'SYSTEM',
    automated = false
  ): void {
    this.state.steps.REMOVE_POWER = {
      status: 'COMPLETED',
      timestamp_s,
      actor,
    };
    this.logEvent(
      timestamp_s,
      'REMOVE_POWER',
      'ZONE_POWER_SHED',
      actor,
      automated,
      false,
      `Electrical bus isolated for zone "${zoneId}". Policy note: ${this.state.policy.powerRemovalNote}.`
    );

    // Auto-advance to ISOLATE_VENTILATION
    this.executeIsolateVentilation(zoneId, timestamp_s + 0.5, actor, true);
  }

  /**
   * Closes duct dampers connected to the affected zone to contain smoke advection.
   */
  executeIsolateVentilation(
    zoneId: string,
    timestamp_s: number,
    actor: 'SYSTEM' | 'CREW' | 'GROUND' = 'SYSTEM',
    automated = false
  ): void {
    this.state.currentStep = 'ISOLATE_VENTILATION';
    this.state.steps.ISOLATE_VENTILATION = {
      status: 'COMPLETED',
      timestamp_s,
      actor,
    };
    this.isolationCompletedTimestamp_s = timestamp_s;
    this.logEvent(
      timestamp_s,
      'ISOLATE_VENTILATION',
      'DAMPERS_CLOSED',
      actor,
      automated,
      false,
      `Isolation dampers closed on all ducts serving zone "${zoneId}". Inter-module airflow halted.`
    );

    // Auto-advance to INHIBIT_MAKEUP
    this.executeInhibitMakeup(timestamp_s + 0.5, actor, true);
  }

  /**
   * Inhibits cabin gas replenishment / fresh oxygen injection into isolated volume.
   */
  executeInhibitMakeup(
    timestamp_s: number,
    actor: 'SYSTEM' | 'CREW' | 'GROUND' = 'SYSTEM',
    automated = false
  ): void {
    this.state.currentStep = 'INHIBIT_MAKEUP';
    this.state.steps.INHIBIT_MAKEUP = {
      status: 'COMPLETED',
      timestamp_s,
      actor,
    };
    this.logEvent(
      timestamp_s,
      'INHIBIT_MAKEUP',
      'MAKEUP_GAS_HALTED',
      actor,
      automated,
      false,
      'O2 injection and cabin repressurization loops halted to deprive flame of oxidizer inflow.'
    );

    // Advance to SUPPRESSION
    this.state.currentStep = 'SUPPRESSION';
    if (this.state.mode === 'CREWED') {
      this.state.steps.SUPPRESSION = {
        status: 'ARMED',
        timestamp_s,
        actor: 'SYSTEM',
      };
      this.logEvent(
        timestamp_s,
        'SUPPRESSION',
        'SUPPRESSION_ARMED_AWAITING_CREW',
        'SYSTEM',
        true,
        false,
        `Suppression agent (${this.state.suppressionAgentRecommendation}) armed. Crew confirmation required before discharge.`
      );
    } else {
      this.state.steps.SUPPRESSION = {
        status: 'ARMED',
        timestamp_s,
        actor: 'SYSTEM',
      };
      this.logEvent(
        timestamp_s,
        'SUPPRESSION',
        'AUTONOMOUS_TIMEOUT_ACTIVE',
        'SYSTEM',
        true,
        false,
        `Suppression armed in uncrewed autonomous mode. Discharge will occur after ${this.state.policy.uncrewedSuppressionTimeout_s}s timeout if alarm persists.`
      );
    }
  }

  /**
   * Crew confirmation to discharge suppression agent (mandatory in CREWED mode).
   */
  confirmSuppression(timestamp_s: number, actor: 'CREW' | 'GROUND' = 'CREW'): void {
    if (this.state.steps.SUPPRESSION.status === 'COMPLETED') return;

    this.state.steps.SUPPRESSION = {
      status: 'COMPLETED',
      timestamp_s,
      actor,
    };
    const agent = this.state.suppressionAgentRecommendation || 'WATER_MIST';
    this.logEvent(
      timestamp_s,
      'SUPPRESSION',
      'SUPPRESSION_DISCHARGED',
      actor,
      false,
      false,
      `Suppression discharged with ${agent} following human verification.`
    );

    this.advanceToRecovery(timestamp_s + 1.0);
  }

  /**
   * Manual override of any sequence step.
   */
  overrideStep(
    stepId: SequenceStepId,
    timestamp_s: number,
    reason: string,
    actor: 'CREW' | 'GROUND' = 'CREW'
  ): void {
    this.state.steps[stepId] = {
      status: 'OVERRIDDEN',
      timestamp_s,
      actor,
    };
    this.logEvent(
      timestamp_s,
      stepId,
      'STEP_OVERRIDDEN',
      actor,
      false,
      true,
      `Step ${stepId} overridden by ${actor}: ${reason}`
    );
  }

  /**
   * Updates sequencer state based on elapsed time (e.g. uncrewed suppression timeout).
   */
  update(timestamp_s: number): void {
    if (
      this.state.mode === 'UNCREWED' &&
      this.state.currentStep === 'SUPPRESSION' &&
      this.state.steps.SUPPRESSION.status === 'ARMED' &&
      this.isolationCompletedTimestamp_s !== undefined
    ) {
      const elapsedSinceIsolation = timestamp_s - this.isolationCompletedTimestamp_s;
      if (elapsedSinceIsolation >= this.state.policy.uncrewedSuppressionTimeout_s) {
        this.state.steps.SUPPRESSION = {
          status: 'COMPLETED',
          timestamp_s,
          actor: 'SYSTEM',
        };
        const agent = this.state.suppressionAgentRecommendation || 'INERT_GAS_FLOOD';
        this.logEvent(
          timestamp_s,
          'SUPPRESSION',
          'AUTONOMOUS_SUPPRESSION_DISCHARGED',
          'SYSTEM',
          true,
          false,
          `Autonomous suppression timeout expired (${elapsedSinceIsolation.toFixed(1)}s >= ${this.state.policy.uncrewedSuppressionTimeout_s}s). Discharged ${agent}.`
        );
        this.advanceToRecovery(timestamp_s + 1.0);
      }
    }
  }

  private advanceToRecovery(timestamp_s: number): void {
    this.state.currentStep = 'POST_FIRE_RECOVERY';
    this.state.steps.POST_FIRE_RECOVERY = {
      status: 'PENDING',
      timestamp_s,
      actor: 'SYSTEM',
    };
    this.logEvent(
      timestamp_s,
      'POST_FIRE_RECOVERY',
      'RECOVERY_PROTOCOL_READY',
      'SYSTEM',
      true,
      false,
      'Suppression completed. Awaiting atmosphere scrubbing, toxic gas monitoring, and post-fire inspection.'
    );
  }
}

