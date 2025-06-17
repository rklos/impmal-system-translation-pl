export function reorderSkills() {
  const originalDefineSchema = SkillsModel.defineSchema;
  SkillsModel.defineSchema = () => {
    const {
      athletics,
      awareness,
      dexterity,
      discipline,
      fortitude,
      intuition,
      linguistics,
      logic,
      lore,
      medicae,
      melee,
      navigation,
      presence,
      piloting,
      psychic,
      ranged,
      rapport,
      reflexes,
      stealth,
      tech,
      willpower,
      // In case of additional skills
      ...rest
    } = originalDefineSchema();
    return {
      athletics,
      presence,
      dexterity,
      fortitude,
      intuition,
      linguistics,
      tech,
      stealth,
      logic,
      medicae,
      psychic,
      navigation,
      discipline,
      rapport,
      piloting,
      reflexes,
      awareness,
      melee,
      ranged,
      lore,
      ...rest,
    };
  };
}
