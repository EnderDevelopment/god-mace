# Minecraft Bedrock Weapon Add-On

God Mace is a Minecraft Bedrock Edition weapon add-on that adds a custom mace with 30 base damage and a scripted launch-and-smash ability. When you damage an entity while holding it, the add-on launches you upward, cancels fall damage during the launch window, pulls you toward the nearest nearby entity while descending, and attempts to deal 50 damage to the tracked target when you land.

## Install

1. Copy the `behavior_pack` and `resource_pack` folders into your Minecraft Bedrock development behavior packs and resource packs folders, or package each folder as a `.mcpack`.
2. Enable both packs for your world.
3. Enable Beta APIs or Creator experiments if required by your Bedrock version for script modules.
4. Use Bedrock 1.21.80 or later. The behavior pack requires the `@minecraft/server` 1.15.0 module.

## Use

1. In a world with cheats enabled, run `/give @s godmace:god_mace`.
2. Hold the God Mace in your main hand and damage an entity to trigger the launch.
3. While descending, the script searches within 10 blocks for the nearest entity and pulls you toward it. When you land, it attempts to apply 50 damage to the tracked target.

---

More Minecraft mod projects by EnderDevelopment: https://github.com/EnderDevelopment

Project page: https://dash.enderdevelopment.com/community/f1e1a8c1-9809-42e2-9111-99ad08245799?utm_source=github&utm_medium=readme&utm_campaign=auto_publish&utm_content=f1e1a8c1-9809-42e2-9111-99ad08245799
