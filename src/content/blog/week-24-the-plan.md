---
title: 'Week 24, 2026: the plan'
description: 'Programming two moving boards without tethers: wireless SWD adapters on each board, driving the hoverboard from a phone app over its own Bluetooth, and proving balance under control.'
pubDate: 'Jun 08 2026'
heroImage: '../../assets/week24/hero.jpg'
---

Last week ended with remote drive working over the board's own Bluetooth, no added microcontroller. This week is about being able to iterate on the balancing firmware safely, and then proving the thing balances while I drive it from a phone. Local first.

## Wireless SWD: flashing two moving boards without tethers

Tuning a self-balancer is a tight loop: change a gain, flash, watch it fall over, repeat, dozens of times. The board I'm working on is a Gen2 ClassyWalk: two twinned motor-controller boards, one per hub motor, each flashed and debugged over its own SWD pads. And SWD is four fragile jumper wires to a moving target. The moment the platform lurches, those jumpers pop off the pads mid-test, or drag a clip-lead ST-Link off the bench. You cannot tune balance with wires hanging off both boards.

So the workaround for this week: a small wireless adapter on each board. One ESP32-class **supermini per board**, acting as a wireless SWD probe (CMSIS-DAP over Wi-Fi, or BLE), soldered to the SWD pads and powered from the board, so I can reflash and debug both boards with nothing tethered to the bench. Two boards, two superminis. Note this is not the control path. Driving still goes phone to board over the board's own Bluetooth, and the superminis are purely the programmer, off to the side.

The catch is power. The supermini still has to run off the board, and the 5V regulators on these motor controllers have already given me trouble, so finding a rail that can feed the adapter without browning it out or cooking the regulator is the real challenge this week.

If it works, the dev loop becomes: edit, flash both boards over the air, let it try to balance, read the fault telemetry back, all while the thing is free to thrash around on the floor.

## Driving from the phone, in the same room

The drive-over-Bluetooth firmware already exists. This week it gets a front end: a mobile app that sends drive and steer straight to the board over its own BLE module, with me standing next to it. Proximity control, not yet remote. The 5G link, NAT and all, is next week's problem.

## Balance under control

The actual milestone: the board holds its own balance while taking drive commands from the app. Balancing and being driven are easy to demo separately and annoying to demo together. That's the bar. Balance plus control, at once, on video.

## Side quests

- A pull request to [RoboDurden](https://github.com/RoboDurden/Hoverboard-Firmware-Hack-Gen2.x) removing the dead sine/dead-time branch I found last week, the one gated on a misspelled `#ifdef` that can never be true.
