/* eslint-disable max-classes-per-file,@typescript-eslint/explicit-member-accessibility */

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
