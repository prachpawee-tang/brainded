# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Delivered as one Expo universal app (iOS, Android, web) with a single custom design language on every platform (no per-OS styling). Mobile is the primary device; web is secondary. Native affordances still apply on phones: safe areas, back gestures, one-handed reach, system keyboard behavior.

## Users

- **Now:** the owner, using it as a personal second brain across many parts of life.
- **Later (confirmed intent):** open sign-up for other people with the same need. Every feature must work for a stranger who has never seen the owner's setup: no hard-coded personal data, clear first-run and empty states.

Usage happens all day, not in one session type:
- quick one-handed capture in the middle of other things ("the cat just took her pill");
- lookup at the moment of need (e.g. at the vet: vaccine history, allergies, past medication);
- sit-down review and organizing;
- acting on reminders and notifications, then recording that it's done.

## Product Purpose

A "second brain" that holds the structured facts of a person's life, so they don't have to remember them. It grows by **modules**, one per life domain. **Pets** is the first module. Each module starts small and deepens over time. For pets: profile and history first, then medication, appointments, to-dos, and AI analysis of body photos.

Success: the user trusts it enough to stop keeping these facts in their head, notes app, or chat history, and can find any fact in seconds when it matters.

## Positioning

Neither a blank-page note tool nor a single-purpose tracker. Each life domain gets a structured module with purpose-built screens. All modules share one core: reminders, tasks, attachments, timeline, tags, and cross-module links. That shared core lets one place answer questions across the user's whole life.

## Operating Context

- Phone in hand, often interrupted or distracted; capture must take seconds.
- High-stakes lookups happen in public or time-pressured places (clinic counter, pharmacy).
- Notifications are a primary entry point, not an afterthought.
- Thai is the primary language and English is fully supported. Dates and numbers follow the user's locale.

## Capabilities and Constraints

- Shipped: sign-up/sign-in (username or email + password, Google). Account linking and unlinking (the last sign-in method can't be removed). Per-user language (th/en) and theme (system/light/dark) stored on the server. Per-user module on/off. Home shows a tile for each enabled module.
- Planned: Facebook and Apple sign-in, email verification, password reset, push notifications, global search, quick capture, cross-module links.
- Instagram login is impossible (Meta removed consumer IG login). Don't design for it.
- Every module must be designed to grow: features arrive later behind flags, so screens must accept new sections without redesign.
- Terminology: "module" is a life domain (pets, …). A "feature" lives inside a module (profile, medication, …).

## Brand Commitments

- Brand name: **undecided**. The codename `brain` is used in code. Candidates discussed (Krapook, Hippokam, Stashy, Mochi Mind, Nook) are not chosen. Don't present any as final.
- Personality the owner asked for: **minimal, but fun**. Calm by default, playful in the details.
- Voice: casual and warm, like a friend helping, in both Thai and English. Never stiff or corporate.

## Evidence on Hand

- No users, testimonials, metrics, or press exist yet. Don't fabricate any.
- No logo, mascot, or illustration assets exist yet.

## Product Principles

1. **Seconds to capture, seconds to find.** Optimize the interrupted, one-handed moment first.
2. **Structure without bureaucracy.** Modules give shape, but no screen demands more input than the moment allows.
3. **One core, many modules.** Reuse shared primitives (reminders, timeline, attachments) rather than per-module one-offs.
4. **Grow without breaking.** Every surface leaves room for the next feature of its module.
5. **Trustworthy with personal data.** Users' data is private by default and isolated per user.

## Accessibility & Inclusion

- WCAG AA contrast for text, enforced by tests on design tokens in light and dark themes.
- Thai script needs generous line height and must never be clipped.
- Respect reduce-motion. Playful motion stays optional and never blocks a task.
- Every interactive element has an accessible role and name; touch targets are sized for one-handed use.
