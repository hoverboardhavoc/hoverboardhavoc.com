---
title: 'Week 41, 2026: the plan'
description: 'This week: design the frame for a self-balancing rover built on one battery module from a Mitsubishi i-MiEV electric car and two hoverboard wheels, try welding with gas, and find a cleaner way to cut steel tube than the angle grinder. Last week, one eight-cell module came out of the pack and the drop cradle was published as an OpenSCAD project.'
pubDate: 'Oct 05 2026'
heroImage: '../../assets/rover/rover.png'
---

## The rover

The rover is two-wheeled and self-balancing, built around a single battery module from a Mitsubishi i-MiEV electric car and two 6.5" hoverboard hub motors. The module lies flat between the wheels in a welded steel tub with plastic walls and a lid. The axle saddles are cut out of a hoverboard's cast frame and bolted under the tub's lip, which keeps the factory clamp plates and the motors' anti-rotation flats. The controller is a [RoboDurden Gen2.1 board](https://github.com/RoboDurden/Hoverboard-Firmware-Hack-Gen2.x/tree/main/target_1%3DGD32F130/v20), and a tall pole carries a phone as a camera.

The OpenSCAD model draws the assembly, lays the steel out flat as a cut list, and computes the balancing numbers from the same placements it draws.

Before any steel is cut, the module and the axle saddle need measuring: the module dimensions in the model come from GS Yuasa's datasheet for the four-cell module, and no drawing of the saddle exists.

## Better tools

The rover frame means more welding and more cut tube. The angle grinder cuts tube, but it makes a lot of mess, so this week I want to find a cleaner way to cut it, and to try welding with gas.

## Last week

[Last week's plan](/blog/week-40-the-plan/) had three jobs:

1. The pack is open and one eight-cell module is out. ✅
2. The wheels have not spun on it yet. ❌
3. The cradle is [published as its own OpenSCAD project](https://github.com/hoverboardhavoc/imiev-drop-dolly). ✅

## This week

Two jobs:

1. Design the rover frame.
2. Upgrade the workshop tools: try welding with shielding gas, and find a better way to cut steel tube than the angle grinder.
