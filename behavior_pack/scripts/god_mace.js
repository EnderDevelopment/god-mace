import { system, world } from "@minecraft/server";

const ITEM_ID = "godmace:god_mace";
const LAUNCH_IMPULSE = 2.4;
const FALL_IMMUNITY_TICKS = 100;
const TARGET_RANGE = 10;
const SMASH_DAMAGE = 50;
const activeLaunches = new Map();

function isEnemy(player, entity) {
  return entity.id !== player.id && entity.typeId !== "minecraft:item" && entity.typeId !== "minecraft:xp_orb";
}

function nearestEnemy(player) {
  const candidates = player.dimension.getEntities({ location: player.location, maxDistance: TARGET_RANGE });
  let nearest;
  let nearestDistance = TARGET_RANGE;

  for (const entity of candidates) {
    if (!isEnemy(player, entity)) continue;
    const dx = entity.location.x - player.location.x;
    const dy = entity.location.y - player.location.y;
    const dz = entity.location.z - player.location.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance < nearestDistance) {
      nearest = entity;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function launchAttacker(player) {
  try {
    player.clearVelocity();
    player.applyImpulse({ x: 0, y: LAUNCH_IMPULSE, z: 0 });
    activeLaunches.set(player.id, {
      player,
      startedAt: system.currentTick,
      wasFalling: false,
      target: undefined
    });
  } catch {
    activeLaunches.delete(player.id);
  }
}

world.afterEvents.entityHurt.subscribe((event) => {
  const attacker = event.damageSource.damagingEntity;
  if (!attacker || attacker.typeId !== "minecraft:player") return;

  try {
    const held = attacker.getComponent("minecraft:equippable")?.getEquipment("Mainhand");
    if (held?.typeId === ITEM_ID) launchAttacker(attacker);
  } catch {
    return;
  }
});

world.beforeEvents.entityHurt.subscribe((event) => {
  if (event.damageSource.cause === "fall" && activeLaunches.has(event.hurtEntity.id)) {
    event.cancel = true;
  }
});

system.runInterval(() => {
  for (const [id, state] of activeLaunches) {
    const player = state.player;
    try {
      if (!player.isValid()) {
        activeLaunches.delete(id);
        continue;
      }

      const age = system.currentTick - state.startedAt;
      const velocity = player.getVelocity();
      const grounded = player.isOnGround;
      if (age > FALL_IMMUNITY_TICKS && grounded) {
        activeLaunches.delete(id);
        continue;
      }

      if (velocity.y < -0.05) {
        state.wasFalling = true;
        const target = nearestEnemy(player);
        if (target) {
          state.target = target;
          const dx = target.location.x - player.location.x;
          const dz = target.location.z - player.location.z;
          const horizontal = Math.sqrt(dx * dx + dz * dz) || 1;
          player.applyImpulse({
            x: (dx / horizontal) * 0.22,
            y: Math.max(0, Math.min(0.12, (target.location.y - player.location.y) * 0.025)),
            z: (dz / horizontal) * 0.22
          });
        }
      }

      if (state.wasFalling && grounded) {
        if (state.target?.isValid()) {
          try {
            state.target.applyDamage(SMASH_DAMAGE, {
              cause: "entityAttack",
              damagingEntity: player
            });
          } catch {
            try {
              state.target.applyDamage(SMASH_DAMAGE);
            } catch {
              // The target may have been removed or become invulnerable.
            }
          }
        }
        activeLaunches.delete(id);
      }
    } catch {
      activeLaunches.delete(id);
    }
  }
}, 1);
