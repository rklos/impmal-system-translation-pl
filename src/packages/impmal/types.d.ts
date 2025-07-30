/* eslint-disable max-classes-per-file,@typescript-eslint/explicit-member-accessibility */
interface ScriptData {
  trigger: string;
  label: string;
  script: string;
  options?: Record<string, unknown>;
}

interface EffectSystem {
  system?: {
    transferData: Record<string, string>;
    scriptData?: ScriptData[];
  };
  effect?: {
    name?: string;
    label?: string;
    system: {
      transferData: Record<string, string>;
      scriptData?: ScriptData[];
    };
  };
  execute?: () => void;
}

declare global {
  class SkillsModel {
    static defineSchema: () => Record<string, unknown>;
  }

  class AgentSkillsModel {
    static defineSchema: () => Record<string, unknown>;
  }

  const IMPMAL: {
    vehicleCategory: {
      wheeled: string;
      tracked: string;
      flyer: string;
      walker: string;
    };

    meleeTypes: {
      power: string;
    };

    scriptTriggers: Record<string, string>;

    vehicleActions: Record<string, CONFIG.StatusEffect & EffectSystem>;

    actions: {
      aim: unknown;
      charge: unknown;
      defend: unknown;
      disengage: unknown;
      dodge: unknown;
      flee: unknown;
      grapple: unknown;
      help: unknown;
      hide: unknown;
      run: unknown;
      search: unknown;
      seize: unknown;
      shove: unknown;
      cover: unknown;
    };
  };
}

export {};
