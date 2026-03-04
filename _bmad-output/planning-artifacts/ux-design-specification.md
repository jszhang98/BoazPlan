---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - docs/PRD_church_mutual_aid.md
  - _bmad-output/planning-artifacts/product-brief-BoazPlan-2026-02-12.md
  - docs/project_brief_church_mutual_aid.md
  - _bmad-output/project-context.md
  - docs/aa.md
---

# UX Design Specification BoazPlan

**Author:** Jansen
**Date:** 2026-03-01

---

<!-- UX design content will be appended sequentially through collaborative workflow steps -->

## Core User Experience

### Defining Experience

The heart of BoazPlan is a simple loop: view the church feed and post a new request/prayer post.
Members should be able to submit a need with two taps/keystrokes, see it appear nearly
instantly, and then browse other needs without thinking about roles or scopes.
For pastors/admins the experience extends to creating groups and scoping requests, but
the core loop remains the same.

### Platform Strategy

BoazPlan is built as a PWA targeting mobile browsers first (phones/tablets), with
responsive support for desktop. Interaction is touch‑centric with large buttons and
minimal typing. Offline caching of the feed and request drafts is required; all API
calls carry auth/tenant headers so the same backend serves every device.

### Effortless Interactions

- Autocomplete church and group selectors to reduce typing.
- Instant return to feed after posting; newly created items appear without reload.
- One‑tap filtering of the request list by type, urgency, or group.
- Inline member‑management controls so admins don’t leave the group page.

### Critical Success Moments

- First‑time posting flow completes and the request is visible.
- Pastor/Admin creates a group and immediately sees it in the list.
- Volunteer accepts an assignment and the status updates in real time.

Failure in any of these moments breaks trust and must be avoided.

### Experience Principles

- **Fast & predictable:** responses in <1 s, visible feedback every step.
- **Minimal cognitive load:** expose only what each role needs.
- **Mobile‑first, offline‑aware:** assume users on unreliable networks.
- **Empower pastors/admins:** give clear, unobtrusive tools for governance.

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

1. **WhatsApp / Messenger**
   - Core: instant, conversational posting.
   - Strengths: one‑tap composer, real‑time updates, obvious status feedback.
   - Delight: message “sent” ticks, inline typing indicators.

2. **Trello**
   - Core: lightweight task/board creation.
   - Strengths: drag‑drop cards, easy filtering, minimal modal forms.
   - Delight: card creation via quick‑add, immediate visual feedback.

3. **Google Maps**
   - Core: location feed/filtering.
   - Strengths: fast search, contextual filters, offline caching.
   - Delight: smooth pan/zoom, clear hierarchy of information.

Users love these because they remove friction, show immediate results, and feel responsive. The mobile‑first, touch‑optimized interactions are compelling, and the apps are reliable offline.

### Transferable UX Patterns

- **Quick‑add composer** (WhatsApp) → use for “new request” form.
- **Inline filters** (Maps) → integrate group/urgency type selectors at top of feed.
- **Drag‑and‑drop** or swipe actions (Trello) → could work for volunteer assignment or deleting items.
- **Status indicators** (WhatsApp ticks) → show “posted”, “approved”, “assigned” states clearly.

### Anti-Patterns to Avoid

- **Deep modal stacks** like old Facebook – avoid burying the new‑request form under multiple screens.
- **Clunky onboarding forms** – we need a single screen post‑login, not 5‑step wizards.
- **Hidden functionality** behind obscure icons.

### Design Inspiration Strategy

- **Adopt** WhatsApp’s one‑tap composer and instant feedback for posting.
- **Adapt** Maps‑style filters into our feed header, but simplify to two or three options.
- **Avoid** Trello’s overly generic board metaphor; keep our layout feed‑centric and linear.

## Desired Emotional Response

### Primary Emotional Goals

Users should feel **empowered and in control** when managing requests or groups, **confident** that their posts will be seen, and **connected** to their church community. Pastors and admins need a sense of **authority and reassurance** that the platform helps them lead effectively.

### Emotional Journey Mapping

- **Discovery:** curiosity and optimism when first seeing the feed or settings.
- **Core action:** satisfaction and ease when submitting a request or creating a group.
- **Completion:** relief and accomplishment after posting or assigning a volunteer.
- **Error:** mild frustration if submission fails, but quick recovery should restore trust.
- **Return visits:** comfort and familiarity, reinforcing community connection.

### Micro-Emotions

- **Confidence vs. Confusion:** clear labels and feedback avoid confusion.
- **Trust vs. Skepticism:** consistent performance builds trust.
- **Delight vs. Satisfaction:** small touches (animations, instant updates) provide delight.
- **Belonging vs. Isolation:** seeing group‑specific posts fosters belonging.

### Design Implications

- Provide immediate feedback on posts/edits to reinforce confidence.
- Use calm, friendly colors and micro‑animations to create delight.
- Show clear status messages for errors and auto‑retry to reduce frustration.
- Highlight community signals (member counts, group names) to promote belonging.

### Emotional Design Principles

1. **Make users feel effective** – every action should succeed or clearly explain failure.
2. **Build trust through transparency** – show loading states, delimits roles visibly.
3. **Add moments of delight** with subtle animations and instant updates.
4. **Foster connection** by surfacing community and group context.

