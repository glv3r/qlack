Qlack is a browser game for private, live typing races between friends. No accounts: pick a name and a keycap avatar, create a room, share a four-character code (`playqlack.com/r/Q7KX`), race, see who won, rematch. Rooms hold up to 8 racers. Two modes, Passage and Timer, both ranked by net WPM, with mistakes left behind instead of corrected.

One surface: the desktop web game, designed at 1440 × 900 (`frame-w`, `frame-h`).

## The idea: loud, quiet, loud

Landing, setup, lobby, countdown and results are **loud**: neo-brutalist, warm paper, thick ink outlines, hard offset shadows, saturated player colours, slight tilts. The race itself is **quiet**: a dark surface with a calm mono word field and colour only at the edges. Results start dark and get louder with each card flip.

Build every screen in one of the two registers. Never mix them on one surface.

| Register | Surface | Text | Outlines | Shadows |
|---|---|---|---|---|
| Loud | `q-paper`, cards `q-card` | `q-ink` | `q-ink`, 2–5px | `shadow-*` in ink, the CTA in lime |
| Quiet (race) | `q-night`, cards `q-night-card` | `q-night-fg` family | `q-night-fg`, 3px | `shadow-night` |

## Content fundamentals

The voice is a friend running the group chat: short, cheeky, plain. Trash talk is allowed in marketing ("Type fast. Talk trash. Race friends."); system copy stays factual and reassuring.

- **Person.** Second person, imperative: "Pick a name, share a code, go." "Fingers on home row." The game calls the player by name: "Pick a face, sam."
- **The result headline** changes by viewer: the winner's screen says "You take it."; everyone else sees "priya takes it."
- **Casing.** Sentence case for headings and buttons ("Create room", "Start race", "Leave room"). Player names always lowercase as typed. Mono labels are UPPERCASE with 0.1em tracking (the `label` style): "YOUR NAME", "ROOM CODE". Avatar moods are lowercase except the shouty one: "LOUD caps", "smug enter", "tired bksp".
- **Punctuation.** Headings end with a period ("Set up the race."). Ellipsis only for in-progress states ("Reconnecting…"). A middle dot separates meta ("Passage · medium", "Q7KX · race over"). Arrows are button glyphs: `→` forward, `↻` rematch, `←` back.
- **Rules copy** is one concrete line: "Everyone types the same text. Best net WPM wins." "Type until the clock runs out. Best net WPM wins."
- **System copy** says what happened and what was kept: "Lost the room for a second. Typing is paused and your progress is kept."
- **Playful micro-copy** lives on stickers only, one per screen: "drop it in the group chat", "fastest fingers", "you", "You won".
- **Units** are lowercase: "124 wpm", "net wpm", "98% acc".
- **No emoji.** Personality comes from avatars, stickers and tilt.

## Colour

- **Paper and ink.** Loud screens sit on `q-paper` with `q-card` panels; everything is drawn in `q-ink`. Muted text steps down `q-ink-2` → `q-ink-4`; check each token's usage note before putting grey text on a player colour.
- **Player palette.** Eight colours, one per racer: `q-lime`, `q-pink`, `q-sky`, `q-lilac`, `q-orange`, `q-mint`, `q-sun`, `q-magenta`. A racer's colour follows them from lobby row to rail avatar and caret to result card. Text on any player colour is `q-ink`.
- **Lime is also the brand accent** (`accent`): the wordmark bar, the primary button's shadow, your caret, your counter. Spend it only on "this is yours" and "this is the main action".
- **Night.** The race uses `q-night` and `q-night-card`. Typed text `q-night-fg`, untyped words `q-night-fg-4`, small labels `q-night-fg-3`, body copy on night cards `q-night-fg-2`.
- **Mistakes** are `q-error`, a muted red. Never a bright red, and only on the night surface.
- **The standings card stays colourless and nameless.** Identities appear only at the results.
- **Flat colour only.** No gradients, photos or textures. The only patterns are functional: 10% ticks and a checkered finish on the progress rail.

## Type

- **Familjen Grotesk** (`font-sans`) for display and body. Display is 700 with tight tracking (−0.02 to −0.045em) and 0.92–0.95 leading: `hero`, `h1`, `result`, `h2`, `h3`, `name`. Body is 400: `lead`, `body`.
- **DM Mono** (`font-mono`) for labels, links, numbers, codes and stats: `label`, `mono`, `mono-sm`, `code`, and the giant room codes `roomcode` (132px) and `roomcode-hero` (260px).
- **Roboto Mono** (`font-race`) for the race word field only: the `passage` style, 32px on a 52px pitch. It is the Monkeytype face, so typists feel at home. Nothing else uses it.
- All three are Google Fonts; `components/bundle.css` imports them.

## The race word field

The race is the product, so its centre is set with care. Use the `Passage` component.

- Words come from a generator: lowercase, no punctuation.
- Each word is its own wrapping box with a one-character gap. Three lines show; the rest is clipped. The field is 60 characters wide (`passage-w`), left-aligned, ragged right.
- Typed letters go from `q-night-fg-4` to `q-night-fg`. A wrong letter turns `q-error` and its word keeps a 2px `q-error` underline.
- Your caret is a 3px `q-lime` bar. Opponents are 2px bars in their colour with a 16px avatar; their names live on the rail.
- Everything else sits at the edges: `WordCounter` top-left, `Standings` top-right, `ProgressRail` along the bottom inside `race-gutter`.

## Shape

- **Borders.** Everything on a loud screen has an ink outline: `border-hair` (2px) for dividers and tags, `border-chip` (2.5px) for pills, `border-base` (3px) by default, `border-hero` (4px) for hero cards, `border-stamp` (5px) for the stamp. Empty seats and taken avatars use a 3px dashed `q-line-dashed`.
- **Shadows.** Hard, unblurred, offset down-right, sized to the element: `shadow-xs` 4 → `shadow-hero` 14. The primary button has the signature `shadow-cta`, a lime offset ringed in ink. Keycaps get the straight-down `shadow-keycap`. Night cards use `shadow-night`. No blur, no glow, no inner shadows.
- **Radii** grow with the element: `radius-tag` 6, `radius-rail` 8, `radius-input` 10, `radius-button` 12, `radius-row` 14, `radius-card` 16, `radius-hero` 20, `radius-pill`.
- **Selected state** is `q-lime` fill, lifted 4px up-left, with `shadow-selected`.
- **Tilt**, sparingly: `tilt-sticker` 5–9°, `tilt-word` −2° for the one highlighted headline word, `tilt-winner` −1.5°, `tilt-countdown` −4°, `tilt-stamp` −12°.

## Layout

- 1440 × 900 frames with `page-gutter` (72px) on loud screens and `race-gutter` (64px) on the race.
- Header: `Wordmark` left; status pills, avatar chip and "Leave room" right.
- Asymmetric two-column grids: form left, card right; hero card left, list right.
- The avatar picker is six 168px columns with a 24px gap.

## Motion and states

- **Countdown:** one beat per second, each digit slams in on a new colour (3 `q-lilac`, 2 `q-pink`, 1 `q-sky`), then cuts to the dark race with the caret already on the first letter.
- **Results:** cards flip bottom-to-top about 0.8s apart, with a pause before 1st. Keycap confetti fires on the winner's screen only, the instant the 1st card lands.
- **Landing:** racing ribbons that finish at the Create room card.
- **Hover and press:** lift 2px with a slightly bigger shadow; press pushes into the shadow (80ms).
- **Disconnected:** the word field fades to 22% with a 1.5px blur, every avatar and caret turns `q-night-fg-3`, and a night `StatusPanel` explains what was kept.
- Every animation has a reduced-motion still.

## Iconography

Qlack uses no icon set. Meaning is carried by:

- **Unicode glyphs** in Familjen Grotesk: `→`, `↻`, `←`, `·`.
- **Keycap avatars** (`Avatar`): twelve CSS-drawn keys with faces (esc, enter, bksp, tab, shift, caps, space, ctrl, alt, del, fn, ?). They are the only illustrations; the faces are placeholders pending an illustrator.
- **The three-square loader** in `StatusPanel`: squares at 100%, 45% and 20% opacity.
- **The radio dot** in `ModeCard`, built from bordered circles.

There is no logo file. The brand mark is the word "Qlack" followed by a lime caret bar: use the `Wordmark` component.

## Accessibility notes

- Body text pairs pass 4.5:1: `q-ink` on every loud surface and player colour, `q-night-fg` and `q-night-fg-2` on night surfaces.
- Untyped passage words (`q-night-fg-4`, 3.4:1) pass only because they are 32px. Never use it below 24px.
- Flagged from the source and kept as designed: `q-ink-5` (empty-seat label, 4.0:1) and `q-ink-6` (placeholder, 3.0:1).
- Focus rings are a solid 3px `q-ink` outline with a 3px offset (`components/bundle.css`).

## Open question: the race surface

The race may move off near-black. Four backgrounds are being compared; the words, carets and player colours stay the same on all of them. Until one is chosen, build on `q-night`.

| Option | Surface | Card | Rules | Untyped words | Small labels |
|---|---|---|---|---|---|
| Night (current) | `#151410` | `#1D1B16` | `#3A372F` | `#6E6A60` | `#8C877C` |
| Slate | `#222733` | `#2A303E` | `#434B5E` | `#6F7890` | `#9AA1B4` |
| Pine | `#14231D` | `#1B2D26` | `#35493F` | `#64786D` | `#8FA096` |
| Plum | `#221A2C` | `#2B2237` | `#473B58` | `#786C8A` | `#A197B1` |
