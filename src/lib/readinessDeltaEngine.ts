/**
 * @file readinessDeltaEngine.ts
 * @description Pure, synchronous mathematical state comparison engine for Catalyst OS.
 * Evaluates exact score deltas, affected dimensions, and Next Best Action transitions
 * before and after domain actions.
 */

import {
  calculateCareerReadiness,
  generateNextBestAction,
  CalculateReadinessParams,
  CareerRole,
} from './careerGraph';

export interface ReadinessDimensionDelta {
  name: string;
  previousScore: number;
  newScore: number;
  delta: number;
}

export interface ReadinessStateDelta {
  id: string;
  timestamp: number;
  actionType: string;
  entityName: string;
  previousOverallScore: number;
  newOverallScore: number;
  overallDelta: number;
  affectedDimension: string;
  previousSubscore: number;
  newSubscore: number;
  subscoreDelta: number;
  reason: string;
  nextBestActionChanged: boolean;
  previousNextActionTitle?: string;
  newNextActionTitle?: string;
  newNextActionUrl?: string;
  isSignificant: boolean;
}

export interface ActionMeta {
  actionType: string;
  entityName: string;
  customReason?: string;
}

/**
 * Synchronously compares two career state snapshots and derives the exact mathematical delta.
 */
export function evaluateStateDelta(
  prevState: CalculateReadinessParams,
  nextState: CalculateReadinessParams,
  actionMeta: ActionMeta
): ReadinessStateDelta {
  const prevReadiness = calculateCareerReadiness(prevState);
  const nextReadiness = calculateCareerReadiness(nextState);

  const prevAction = generateNextBestAction({
    targetRole: prevState.targetRole,
    skills: prevState.skills,
    projects: prevState.projects,
    jobs: prevState.jobs,
    readiness: prevReadiness,
    solvedProblems: prevState.assessments,
  });

  const nextAction = generateNextBestAction({
    targetRole: nextState.targetRole,
    skills: nextState.skills,
    projects: nextState.projects,
    jobs: nextState.jobs,
    readiness: nextReadiness,
    solvedProblems: nextState.assessments,
  });

  const overallDelta = nextReadiness.overallScore - prevReadiness.overallScore;

  // Identify which specific dimension shifted
  let affectedDimension = 'Core Competency Match';
  let prevSub = prevReadiness.breakdown.skills.score;
  let nextSub = nextReadiness.breakdown.skills.score;

  if (nextReadiness.breakdown.applications.score !== prevReadiness.breakdown.applications.score) {
    affectedDimension = 'Pipeline & Interview Readiness';
    prevSub = prevReadiness.breakdown.applications.score;
    nextSub = nextReadiness.breakdown.applications.score;
  } else if (nextReadiness.breakdown.portfolio.score !== prevReadiness.breakdown.portfolio.score) {
    affectedDimension = 'Portfolio Evidence Coverage';
    prevSub = prevReadiness.breakdown.portfolio.score;
    nextSub = nextReadiness.breakdown.portfolio.score;
  } else if (nextReadiness.breakdown.resume.score !== prevReadiness.breakdown.resume.score) {
    affectedDimension = 'ATS & Resume Alignment';
    prevSub = prevReadiness.breakdown.resume.score;
    nextSub = nextReadiness.breakdown.resume.score;
  } else if (nextReadiness.breakdown.skills.score !== prevReadiness.breakdown.skills.score) {
    affectedDimension = 'Core Competency Match';
    prevSub = prevReadiness.breakdown.skills.score;
    nextSub = nextReadiness.breakdown.skills.score;
  }

  const subscoreDelta = nextSub - prevSub;
  const nextBestActionChanged = prevAction?.title !== nextAction?.title;

  // Priority threshold rules
  const isSignificant =
    overallDelta !== 0 ||
    subscoreDelta !== 0 ||
    nextBestActionChanged;

  return {
    id: `delta_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    timestamp: Date.now(),
    actionType: actionMeta.actionType,
    entityName: actionMeta.entityName,
    previousOverallScore: prevReadiness.overallScore,
    newOverallScore: nextReadiness.overallScore,
    overallDelta,
    affectedDimension,
    previousSubscore: prevSub,
    newSubscore: nextSub,
    subscoreDelta,
    reason:
      actionMeta.customReason ||
      `Verified ${actionMeta.entityName} evidence successfully credited to ${affectedDimension}.`,
    nextBestActionChanged,
    previousNextActionTitle: prevAction?.title,
    newNextActionTitle: nextAction?.title,
    newNextActionUrl: nextAction?.actionUrl,
    isSignificant,
  };
}
