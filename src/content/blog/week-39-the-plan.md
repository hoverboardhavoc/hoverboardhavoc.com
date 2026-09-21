---
title: 'Week 39, 2026: the plan'
description: 'One goal this week: get the 230 kg traction battery out of a Mitsubishi i-MiEV, on a driveway, with no lift, from one side of the car. The under cover is already off. A welded cradle around two cheap scissor jacks is designed and has to be built, and the whole thing hinges on about 8 mm of height that nobody has measured yet.'
pubDate: 'Sep 21 2026'
heroImage: '../../assets/imiev/pack-underside.jpg'
---

That is the underside of an i-MiEV with the front under cover off, and the grey slab is the traction battery. The goal for the week is to get it out of the car and onto the floor.

## Why it is not a solved problem

The published way to do this is to replace the pack's mounting bolts with long threaded rods, wind it down onto furniture dollies, and roll it out. It works. It also needs the car higher than this site allows, and it is slow.

The site is the problem. The car is in a garage that can only be worked from the driver's side, so the pack has to come out to the left, every jack crank has to point left, and the five mounting bolts on the far side get reached by crawling about 1.2 m under a car sitting 470 mm off the floor. The rear is already on ramps at 470 mm and stays there. The front gets raised to match and set on stands in the sill notches.

## The cradle

Instead of rods and dollies, the pack comes down on a welded cradle built around two 1500 kg scissor jacks. Two bearer bars sit under the pack's belly spars, one on each jack, and a ladder frame of 30 mm square tube ties the jacks together and carries four swivel castors on mitred arms at the corners. Wind both jacks down together, pin the way down, roll left.

![OpenSCAD render of the cradle: a blue ladder frame of 30 mm box section with a swivel castor on an arm at each corner, two scissor jacks on angle shelves inside it, and a red bearer bar on each jack's saddle](../../assets/imiev/cradle-v2.png)

The design is parametric in OpenSCAD and echoes its own checks on every render: deck height against the sill, bending stress in every member, castor sweep against the crank, and the cut list. This is the second revision. The first was a bigger frame with portal arches over 125 mm wheels; this one is a narrow spine that keeps every part of the frame below the castor arms, with the jacks in the valley between them.

## The height fight

The pack leaves sideways, so its whole length passes under the sill at once, and the rule is simple: sill height must exceed cradle deck height plus pack height plus a roll-out gap. Those last two terms are taken together as 340 mm, a figure inferred from the one published setup known to have cleared, not measured. Nobody publishes the pack's height, and it cannot be measured while it is bolted in.

Against a 470 mm sill that leaves 130 mm for the entire cradle, floor to the surface the pack rests on. The current model stacks up to 138 mm: 15 mm of ground clearance, a 3 mm angle shelf, the jack at 95 mm collapsed, and a 25 mm bearer bar. On paper the design is 8 mm short.

That number is not the end of the story, because the 340 mm it is measured against is a guess. The procedure has a clearance test built in: with the cradle bearing and all ten bolts out, wind down until the pack's top clears a straightedge across the sills, then measure floor to pack underside. That is the real deck budget, and it is reversible, wind back up and re-bolt. So the frame, shelves and jacks get built first, and the bearer bars stay bolted on shims until that measurement exists.

The model flags the castors too: four at 60 kg is 240 kg of rating under roughly 260 kg loaded.

## The bar for the week

Three measurements come first, none of which need anything dismantled: the clear width between the rockers, the underbody clearance fore and aft of the pack, and the height of the front jacking point. Any one of them can force a rethink. Then steel gets cut.

The bar is the pack out of the car. Not rolled to the other end of the garage, not on a bench, just down, clear of the sills, and on its own wheels.
