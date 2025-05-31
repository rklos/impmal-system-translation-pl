export function reorderActions() {
  const {
    actions: {
      aim,
      charge,
      defend,
      disengage,
      dodge,
      flee,
      grapple,
      help,
      hide,
      run,
      search,
      seize,
      shove,
      cover,
    }
  } = IMPMAL;

  IMPMAL.actions = {
    run,
    aim,
    flee,
    cover,
    shove,
    disengage,
    grapple,
    help,
    defend,
    seize,
    search,
    charge,
    hide,
    dodge,
  }
}