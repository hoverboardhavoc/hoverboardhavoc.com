---
title: 'Week 45, 2026: the plan'
description: 'This week: get the firmware to a point where other people can use it, with documentation, a test on an EFeru-style 12-FET board, a stock take of my boards, and a first try of the cheap Razor MM32 splitboards.'
pubDate: 'Nov 02 2026'
heroImage: '../../assets/week45/mm32-board-hero.jpg'
---

## This week

The goal is [the firmware](https://github.com/hoverboardhavoc/hoverboard-firmware) at a point where other people can use it.

- Test the firmware on an EFeru-style 12-FET board.
- Try a pair of Razor MM32 splitboards.
- Take stock of my boards: which MCU each carries, and which work.
- Write documentation.

Stretch goals:

- Tones on the buzzer and the board LEDs. The pins are configured, but nothing drives them.
- A yaw-rate loop for the rover.
- Sensorless control, starting with a flux observer that runs alongside the hall sensors and drives nothing, to compare its angle with theirs.

## A 12-FET board

I am going to test the firmware on an [EFeru](https://github.com/EFeru/hoverboard-firmware-hack-FOC)-style 12-FET board, where one MCU drives both motors. A bench example has spun both wheels on one before, but the firmware itself has never run on it.

## Razor MM32 splitboards

I am going to try a pair of [Razor MM32 splitboards](https://s.click.aliexpress.com/e/_c4biBjCL) from AliExpress (an affiliate link), which are cheap: 10.45 NOK a pair plus 76.77 NOK shipping. RoboDurden calls them [Gen2.4.2](https://github.com/RoboDurden/Hoverboard-Firmware-Hack-Gen2.x/issues/59); they are made by TaoTao Technology and marked Razor Hovertrax 1.0.

They carry a MindMotion MM32SPIN05: a Cortex-M0 with 32 KB of flash and 4 KB of RAM. MM32 support is uncertain at this stage. It depends on a cut-down image that fits in that and copes with the M0, which has no hardware divide and no compare-and-swap atomics, while the FOC maths still finishes inside each 62.5 µs PWM period. A first cut-down image runs on the master, in 16.7 KB of flash with FOC taking 84 % of the period. It has not driven a motor yet.

## One build per chip

The firmware as it stood could not run on these boards. It was a single image of about 58 KB that detected its chip at boot. It carried every chip's register models, the detection code, and a vector table in RAM, because the F103 and F130 put the same interrupt at different places. That cost flash and RAM on every board. It also ruled out the small chips: the MM32 and the GD32F130C6 on the sideboards have 32 KB of flash. A sideboard build for the F130 alone fitted the flash but ran 112 B over the C6's 4 KB of RAM, mostly that vector table.

So over the weekend, the single image and `runtime-hal` under it were replaced by one build per chip, for the GD32F103 and the GD32F130. Built for one chip, an image carries none of that. A release is one download holding every chip's build and the bridge's. `hoverboard-cli` reads what each board is over SWD before anything is flashed, and installs the build for it. One command updates a whole machine, bridges first.

## Documentation

I want to document the tools and the app, and write an onboarding guide that takes a new board from blank to running.

## Yaw

The rover was taken outside on 30 October. When one wheel got stuck in the grass, the balance loop drove the other wheel to keep balance, and the rover turned instead of driving straight. Nothing in the control holds the heading. The IMU's gyro already measures the yaw rate, so a a yaw-rate term on the difference between the two wheels' torque, with the steer stick setting the rate, would hold it straight.
