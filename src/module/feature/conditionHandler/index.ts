import { CombatantPF2e } from "@module/encounter";
import { shouldIHandleThis } from "../../utils";
import { MODULENAME } from "../../xdy-pf2e-workbench";
import { ActorPF2e } from "@actor";

export async function reduceFrightened(combatant: CombatantPF2e) {
    if (combatant && combatant.actor && shouldIHandleThis(combatant.isOwner ? game.user?.id : null)) {
        if (combatant.actor.hasCondition("frightened")) {
            const minimumFrightened = <number>combatant.actor?.getFlag(MODULENAME, "condition.frightened.min") ?? 0;
            const currentFrightened = combatant.actor?.getCondition("frightened")?.value ?? 0;
            if (currentFrightened - 1 >= minimumFrightened) {
                await combatant.actor.decreaseCondition("frightened");
            }
        }
    }
}

export async function increaseDyingOnZeroHP(actor: ActorPF2e, update: Record<string, string>, hp: number) {
    if (
        shouldIHandleThis(actor.isOwner ? game.user?.id : null) &&
        // @ts-ignore
        hp > 0 &&
        getProperty(update, "data.attributes.hp.value") <= 0
    ) {
        let value = 1;
        const option = <string>game.settings.get(MODULENAME, "autoGainDyingAtZeroHP");
        if (option.endsWith("ForCharacters") ? actor.data.type === "character" : true) {
            if (option?.startsWith("addWoundedLevel")) {
                value = (actor.getCondition("wounded")?.value ?? 0) + 1;
            }
            for (let i = 0; i < Math.max(1, value); i++) {
                await actor.increaseCondition("dying");
            }
        }
    }
}
