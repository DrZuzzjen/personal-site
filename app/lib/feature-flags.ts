export interface FeatureFlags {
  /**
   * Master switch for the agent-based sales experience.
   */
  useAgentBasedSales: boolean;

  /**
   * Percentage rollout for the agent-based flow (0-100).
   */
  agentRolloutPercentage: number;
}

const DEFAULT_FLAGS: FeatureFlags = {
  useAgentBasedSales: false,
  agentRolloutPercentage: 0,
};

let flags: FeatureFlags = { ...DEFAULT_FLAGS };

type RandomFn = () => number;

let randomFn: RandomFn = Math.random;

function clampPercentage(value: number): number {
  if (Number.isNaN(value) || !Number.isFinite(value)) {
    return 0;
  }

  if (value < 0) return 0;
  if (value > 100) return 100;
  return Math.round(value);
}

export function getFeatureFlags(): FeatureFlags {
  return { ...flags };
}

export function setFeatureFlags(nextFlags: Partial<FeatureFlags>): FeatureFlags {
  flags = {
    ...flags,
    ...nextFlags,
  };

  flags.agentRolloutPercentage = clampPercentage(flags.agentRolloutPercentage);

  return getFeatureFlags();
}

export function resetFeatureFlags(): FeatureFlags {
  flags = { ...DEFAULT_FLAGS };
  randomFn = Math.random;
  return getFeatureFlags();
}

export function setRolloutRandomizer(fn: RandomFn) {
  randomFn = fn;
}

export function shouldUseAgentBasedSales(): boolean {
  const { useAgentBasedSales, agentRolloutPercentage } = flags;

  if (!useAgentBasedSales) {
    return false;
  }

  if (agentRolloutPercentage >= 100) {
    return true;
  }

  if (agentRolloutPercentage <= 0) {
    return false;
  }

  return randomFn() * 100 < agentRolloutPercentage;
}

