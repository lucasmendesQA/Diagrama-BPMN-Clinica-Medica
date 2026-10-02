# Tokko Broker Design System

A design system for **Tokko Broker's mobile app** — the real-estate broker CRM used by agents to manage properties, contacts, opportunities and client chat on the go. Tokko Broker is part of QuintoAndar Group's portfolio of real-estate products (the source file's shared token library also carries values for sibling brands — QuintoAndar, QuintoCred, Nok Nox, Univen, Inmuebles24 — see "Two token layers" below for how this system stays scoped to Tokko Broker only).

This system was built from two sources, both focused on the **App** (mobile) product, explicitly still in a foundations-and-tokens phase per the codebase's own working notes:

- **Figma** — `TokkoBroker DesignSyatem[App].fig` (mounted read-only). Pages: Fundations, Color, Spacings, Border-radius, Elevation, Typography, Grid, Icons, Illustration, Components, Input, Banner, Bottomsheet, Button. 92 component sets + 262 standalone symbols (≈230 of them icon glyphs), 494 Figma Variables.
- **Codebase** — `TokkoBroker-DesignSystem [App]/` (mounted read-only), a static-HTML reference the team hands off to mobile devs. Its `tokens/{colors,spacing,typography}.css` are hand-authored and — per its own `CLAUDE.md` — carry **exactly** the same values as the Figma web design system, so they were used as the readable, documented base for `tokens/`. Its `icons/` folder is the exported IcoMoon icon font (TTF/WOFF + `style.css`), which matches the Figma "Icons Library" glyph-for-glyph and was copied in directly rather than re-extracted as SVGs.
- **Fonts** — Nunito Sans variable font files (regular + italic), supplied directly, covering every weight the kit uses.

No logo file lived inside the component library itself, but the Figma file's own documentation frames do embed the real Tokko Broker wordmark — that exact SVG was copied into `assets/logo/`; nothing was redrawn.

## ⚠️ Regla obligatoria para componentes nuevos

**Todo componente que se sume a este sistema debe usar exclusivamente los tokens de `tokens/colors.css`, `tokens/typography.css` y `tokens/spacing.css`** (color, tipografía, spacing, radios) — nunca valores hardcodeados. Si hace falta un valor que no existe como token, no inventarlo: avisar antes de crear uno nuevo.

## Two token layers

You'll find tokens in two places, and that's intentional:

- **`tokens/*.css`** — the curated, documented layer. Spanish inline comments explain what each token is for, semantic aliases sit next to their base values, and this is what the foundation specimen cards read from. Hand-derived from the codebase's own token files (themselves stated to be numerically identical to Figma).
- **`components/fig-tokens.css`** — the literal Figma Variables export, machine-generated, which the materialized `/components` reference directly (`var(--colors-surface-primary-high)`, `calc(var(--button-compact-padding-inline) * 1px)`, etc). Figma's variable collection is **shared across the whole QuintoAndar Group portfolio** — it stores per-brand "modes" (Tokko, Tokko Broker, Univen, QuintoAndar, QuintoCred, Nok Nox, Inmuebles24Full…). The generator always writes the **first mode as the `:root` default**, which for this collection resolves to the Tokko Broker brand (confirmed: `--colors-brand-primary-500: rgb(223,21,23)` = the same `#df1517` red as `tokens/colors.css`). The other brands' modes are exported as inert, unused theme scopes (`[data-mode="univen"]`, etc.) that this system never activates. Nothing from another brand renders unless you deliberately opt into one of those scopes — which this design system does not.

Both layers agree on every value that overlaps; they're just two different audiences (human-editing vs. component-consuming).

## Content fundamentals

Product copy is in **Spanish (Argentina)**, direct and functional — no marketing voice inside the app chrome. Patterns observed across the kit:

- **Imperative/infinitive verbs for actions**: "Buscar", "Guardar", "Compartir", "Reasignar", "Exportar" — not "Buscar propiedades ahora!" or first-person ("Mi búsqueda").
- **Sentence case, not Title Case**: "Nueva propiedad", "Respuestas rápidas", "Sin resultados" — only proper nouns and the first word are capitalized.
- **Short labels, no punctuation on buttons/tabs**: "Detalle", "Fotos", "Ubicación", "Más".
- **Neutral, informational tone in system messages**: "La propiedad debe tener precio para ser enviada a revisión." — states the condition plainly, no apology, no exclamation points.
- **No emoji anywhere** in the kit's copy or components.
- Placeholder/demo copy in the source uses realistic domain terms throughout — "543876 resultados", "Depto 2 amb.", "Interesado en depto 2 amb." — always property/CRM vocabulary, never lorem ipsum.
- A few internal Figma layer names remain in Portuguese/English mixed with Spanish (`_DEPRECADO`, "Property 1=") — those are authoring artifacts, not product copy; ignore them as a voice reference.

## Visual foundations

- **Color**: Tokko red (`#df1517`) is the only saturated, high-emphasis color — reserved for primary actions, active states and the brand mark. Teal (`#427f94`) is the secondary/alternate-action color. Green/blue/yellow are strictly feedback (success/info/warning); orange and purple are "extended" — used only for tag categorization, never for actions. Neutrals do almost all of the work: body text, borders, and backgrounds are gray-scale, not tinted.
- **Type**: one family, Nunito Sans, at three weights (Regular 400, SemiBold 600, Bold 700). No display/serif pairing. Bold carries all headings; SemiBold carries labels, buttons and emphasis; Regular carries body and placeholder text. Headings use a small negative tracking (-0.4px); body text uses none.
- **Spacing**: a strict 4px base grid (4/8/12/16/20/24/32/40/48/64/80). Component padding and inter-element gaps are drawn from the same scale via semantic aliases (`--space-component-*`, `--space-gap-*`) rather than ad hoc values.
- **Radius**: a small, named scale (0 / 4 / 6 / 8 / 12 / 16 / 24 / pill) tied to component size, not a generic "rounded corners everywhere" look — buttons are 6px, cards/fields are 8px, sheets/modals are 16px, avatars/icon-buttons/chips are fully pill.
- **Elevation**: the system strongly prefers a **1px inset hairline border** (`rgb(214,222,226)`) over drop shadows for resting surfaces — cards, inputs, list rows. True box-shadows are reserved for floating/overlay content (bottom sheets, menus) and are very soft and diffused (`0 0 10px rgba(95,99,120,0.1)`), never a hard drop shadow.
- **Borders vs. shadows**: as above — border-first, shadow-only-when-floating. There is no "glow" or colored shadow anywhere in the kit.
- **Backgrounds**: flat fills only. No gradients, no photography-as-background, no textures or patterns, no blur/glassmorphism. The one gradient found in the whole file is a shimmer effect used strictly for **Skeleton/loading states** (`linear-gradient(257deg, rgb(234,238,241) 65%, rgb(255,255,255) 129%)`) — never decorative.
- **Imagery**: the kit ships no photography; property/media photos are always represented as gray placeholder blocks with a generic icon in real screens (see the UI kit) — no full-bleed imagery, no hand-drawn or textured art. (The source Figma file also defines 18 flat, single-color "empty state" illustrations; they were removed from this system as unneeded for now — see "Intentionally not built".)
- **Animation**: not specified anywhere in the static Figma/HTML kit (both are non-interactive references). The only motion cue present is the 4-frame rotation states baked into `CircularLoading`/`_Circular-loading` (a spinner). Treat easing/duration as undefined — ask before inventing transition specs.
- **Hover / press states**: components define explicit `hovered`/`pressed` variants rather than relying on generic opacity or brightness filters — e.g. `ButtonCompact` primary hover overlays a translucent tint (`rgba(250,206,207,0.15)`) rather than darkening, and focus uses a dedicated 1.5px focus-ring color, not an outline. Disabled state always swaps to a fixed neutral gray token, never just reduced opacity.
- **Transparency / blur**: transparency appears only in a few deliberate spots — the modal/sheet scrim (`rgba(0,0,0,0.48)`), a soft inverse overlay (`rgba(0,0,0,0.04)`), and the Tokki-AI surface tint (`rgba(104,194,171,0.25)`). No backdrop-blur is used anywhere.
- **Cards**: white fill, 8–16px radius depending on size, 1px neutral hairline border, no shadow at rest. Content padding follows the 4px scale (commonly 12–16px).
- **Layout**: mobile-only, single-column, header-content-bottom-nav shell (`HeaderMobile` / scroll area / `BottomBar`). No responsive breakpoints are defined for the app itself (the Grid page's breakpoints belong to the web CRM, not this mobile kit).

## Iconography

- The product's icon system is a **single self-hosted icon font** (IcoMoon), not inline SVG and not an off-the-shelf set (Lucide/Heroicons/etc). ~230 glyphs cover navigation, CRM actions, property attributes (dormitorios, baños, superficie…), file types, and social/brand marks (WhatsApp, Instagram, Facebook, Google, Apple).
- Usage is class-based: `<i class="icon-agenda"></i>` — the codebase's own rules explicitly forbid inline SVG or `<img>` for icons ("Nunca usar SVG inline ni `<img>` para íconos. Siempre que un componente use iconos, usar los de la librería."). This system follows the same rule: `tokens/icons.css` + `assets/icons/icomoon.*`.
- A handful of per-instance icons that ride along inside specific Figma components (e.g. the calendar glyph swapped into a date field) were pulled in as individual small components during materialization (`IconsLibraryCalendario.jsx`, etc.) — those are implementation details of the component that uses them, not part of the general icon system; reach for the icon font for anything new.
- No emoji and no Unicode symbol characters are used as icons anywhere in the kit.

## Components

105 of the Figma file's 124 countable component families are implemented (see the completeness note at the end for how family-counting works and exactly what was intentionally left out — 18 illustrations + 1 component were removed by request; the rest is genuine coverage). Grouped for orientation — browse live, categorized examples in the **Components** section of the Design System tab (`components/*.card.html`):

**Buttons** — ButtonCompact, ButtonDefault, ButtonGroups, SegmentedButtons (nuevo — ver "Intentional additions"), IconbuttonCompact, IconbuttonDefault, LinkButtonSubtle, ActionButton (OS share-sheet action, not an app button)
**Typography** — Titles (Figma node 20603-32813 — section title: 5 sizes, subtitle, info icon, required asterisk, link button)
**Forms** — TextFieldDefault, TextareaCompact, SearchInputCompact, Search (basado en TextFieldDefault, lupa fija · 3 estados), Checkbox (portado del sistema web hermano — checked/unchecked/indeterminate · 4 estados), CheckboxM, BaseCheckbox, CheckboxSelected
**Feedback** — Snackbar, BannerMobile, BannerCompact, BannerInformativo, BannerIconstyle, BottomSheet, BottomSheetHeader, FeedbackIcon, FeedbackTextFields
**Data display** — BadgeM, BadgeS, BadgeXs, TagDefault, CustomTagS, StatusTagS, PillCompStatus, PillToken, Divider, UserProfilePicture, IndicatorVariation, OrigenIndicator, IconIndicator, Pointer, CircularGrey, CircularWhite, CircularLoading, CircularLoading2, IconSkeleton
**Navigation** — Tabs, SubtleTabItem, MainTabItem, BottomBar, LayoutNavbar, HeaderMobile, NavbarButton, ActionBarMobile, ContextualToolbarMobile, Kebab
**Chat** — ChatAreaMobile, ChatContactName
**Cards & media** — PropertyCard (compuesta: PropertyImage + Tag + StatusTag — card de listado de propiedades), PropertyImage (thumbnail de propiedad, 2 tamaños · 8 variantes), Tag (etiqueta de categorización, 4 colores), Card (contenedor dinámico de card — genérico, con variant="slot"), ContactCard (card de contacto/agente + acciones — 2 variantes × 6 estados)
**Device chrome** (for building phone-frame mockups — not app UI) — SystemStatusBarIPhone, SystemStatusBarAndroid, HomeIndicator, StatusBar, AndroidKeyboard, AndroidKeyboard2, KeysIPhone, KeysIPhone2, KeysIPhoneSpace, Background
**Misc / less common** — Agregar, Flags (8 country flags), ReplaceMe, DEPRECADOGalleryTabItem (kept for reference, marked deprecated at the source), PremiumSolid and the individual `IconsLibrary*` glyph components pulled in as instance overrides of the components above

### Intentional additions
**`SegmentedButtons`** is a new, hand-authored component built at the user's explicit request — a row of xs (24px-tall) buttons for exclusive selection between short options, 2 states (default/active). It has no counterpart in this system's own Figma file/source codebase; colors came from a user-supplied token screenshot (`Colors/Surface/Secondary/Low` + `Colors/Text_icon/Secondary/onMedium` for default, `Colors/Surface/Secondary/High` + `Colors/Text_icon/Neutral/onHigh` for active) and every one already exists in `/tokens` here (typography uses the existing 12/16 caption size), so no new tokens were introduced.

None new in function otherwise, but one renamed on purpose: **`Titles`** materializes Figma node 20603-32813 ("Tokko Design System | Components") — its on-canvas Figma layer name is documentation scaffolding, not a clean component name, so it was given the descriptive name `Titles` (section title: 5 sizes, subtitle, info icon, required asterisk, link button) rather than carried over verbatim. Confirmed intentional — not a stray addition. Every other component above has a direct counterpart in the Figma file by name (see each `.prompt.md` for the exact source node). No component from a "typical" design system (Toast, Avatar-as-a-family, Tooltip, Tabs-panel, Dialog, etc.) was added beyond what the source defines.

**`PropertyCard`, `PropertyImage` and `Tag`** were ported verbatim (markup, styles, props) from the companion Tokko Broker web design system's `PropertyCard` component, at the user's explicit request to duplicate it into this kit unchanged. They have no counterpart in this system's own Figma file/source codebase, but every token they reference (`--space-*`, `--color-surface-neutral-*`, `--color-tag-*`, `--font-*`) already exists in `/tokens` here, so no new tokens were introduced. `StatusTag` was also copied as `PropertyCard`'s dependency — this kit already had an equivalent, `StatusTagS`; `StatusTag` is kept as a separate export solely to match the source component's import 1:1, not as a recommended alternative to `StatusTagS` for new work.

**`Card`** is a new, hand-authored (not Figma-materialized) generic card container, built at the user's explicit request as a dynamic shell different projects can extend. `variant="default"` composes existing system pieces (`Titles` size `xs`, `StatusTagS`) with three explicitly-flagged mocks — an image container, a header toggle, and the footer's toggle buttons — none of which exist as system components yet; they're marked "MOCK" in `Card.jsx`/`card.css` to be swapped out once those components are built. `variant="slot"` returns just the bare container (border, radius, background, padding) for building any other card layout on the same shell.

**`Search`** is a new, hand-authored field built at the user's explicit request, based on `TextFieldDefault`'s outlined style/tokens (`--input-default-*`, same radius/typography) but without label or support text and with a fixed leading search icon. 3 states: default, active (border color only), filled (adds a clear icon that resets the search).

**`Checkbox`** (in `components/forms/`) was ported verbatim from the companion Tokko Broker web design system's `Checkbox` component, at the user's explicit request to duplicate it into this kit unchanged — same as `PropertyCard`. It has no counterpart in this system's own Figma file (which already has `BaseCheckbox`/`CheckboxM`/`CheckboxSelected` for the Figma-materialized checkbox family); `Checkbox` is kept as a separate export to match the source component 1:1, not as a replacement for those. Every token it references already exists in `/tokens` here.

**`ContactCard`** is a new, hand-authored composition built at the user's explicit request for showing a contact/agent with actions (2 variants × 6 states — default/selection/selected/remove/skeleton/readonly). Every piece it uses is a real, existing system component — nothing mocked: `UserProfilePicture` for the avatar (its "image" type already ships a placeholder photo asset), `Checkbox` for the selection states, `IconbuttonCompact` (`style2="subtle"`) for the action/remove icons, and `StatusTagS` for the contact-variant tag. Actions are individually toggleable (`show` per action) since a contact may not have every channel's data loaded; the remove action is the one exception that's always shown in `state="remove"`.

### Intentionally not built
**18 empty-state illustrations + `EmptyStatesL`** (the layout that consumed them) were materialized from the Figma file's Illustration page but then removed at the user's request — not needed for the current scope. They can be re-materialized from the Figma file later if a need for empty states comes up.

A cluster of **iOS/Android OS-chrome mockup pieces** — `_Accessory Bar - Autocorrection`, `_Accessory Bar - iPhone - Find/Next/Previous/Replace`, `_Keyboard - iPhone Layouts`, `Keyboard - iPhone`, the full per-key `_Keys - iPhone*` variants, and `Measure` (a designer's on-canvas ruler utility) — were left unbuilt. These recreate the **operating system's own keyboard chrome** pixel-for-pixel for staging realistic screenshots inside Figma; they are not Tokko Broker product UI, and reproducing every individual key/accessory-bar state adds size without adding anything a consumer would style or reuse. `_DEPRECADOApp shell layout` and `_Doc titles` were also skipped — the former is explicitly marked deprecated at the source, the latter is Figma-file-internal documentation scaffolding (page headers inside the .fig itself), not product UI.

### Full component identifier list
Exact export names (file basenames), for reference/search:

`ActionBarMobile`, `ActionButton`, `Agregar`, `AndroidKeyboard`, `Titles`, `AndroidKeyboard2`, `Background`, `BadgeM`, `BadgeS`, `BadgeXs`, `BannerCompact`, `SegmentedButtons`, `PropertyCard`, `PropertyImage`, `Tag`, `Card`, `Search`, `Checkbox`, `ContactCard`, `BannerIconstyle`, `BannerInformativo`, `BannerMobile`, `BaseCheckbox`, `BottomBar`, `BottomSheet`, `BottomSheetHeader`, `ButtonCompact`, `ButtonDefault`, `ButtonGroups`, `ChatAreaMobile`, `ChatContactName`, `CheckboxM`, `CheckboxSelected`, `CircularGrey`, `CircularLoading`, `CircularLoading2`, `CircularWhite`, `ContextualToolbarMobile`, `CustomTagS`, `DEPRECADOGalleryTabItem`, `Divider`, `FeedbackIcon`, `FeedbackTextFields`, `Flags`, `HeaderMobile`, `HomeIndicator`, `IconIndicator`, `IconSkeleton`, `IconbuttonCompact`, `IconbuttonDefault`, `IconsLibraryAcciones`, `IconsLibraryAcciones2`, `IconsLibraryAceptar`, `IconsLibraryAgregar`, `IconsLibraryAlertaRound`, `IconsLibraryAtras`, `IconsLibraryAtras2`, `IconsLibraryBandejadeentrada`, `IconsLibraryBuscar2`, `IconsLibraryCalendario`, `IconsLibraryCalendario2`, `IconsLibraryCerrar`, `IconsLibraryCheck`, `IconsLibraryConsultas2`, `IconsLibraryContactos`, `IconsLibraryCropimage`, `IconsLibraryEditar`, `IconsLibraryEliminar`, `IconsLibraryEnviar`, `IconsLibraryError`, `IconsLibraryFacebook`, `IconsLibraryFlechaabajo`, `IconsLibraryInstagram`, `IconsLibraryIr`, `IconsLibraryKebah`, `IconsLibraryKebah2`, `IconsLibraryNuevomensaje`, `IconsLibraryNuevomensaje2`, `IconsLibraryPremium`, `IconsLibraryPremium2`, `IconsLibraryReasignar`, `IconsLibraryReloj2`, `IconsLibrarySiguiente`, `IconsLibrarySiguiente2`, `IconsLibraryTokkochat`, `IconsLibraryUniven`, `IconsLibraryWhatsapp`, `IndicatorVariation`, `Kebab`, `KeysIPhone`, `KeysIPhone2`, `KeysIPhoneSpace`, `LayoutNavbar`, `LinkButtonSubtle`, `MainTabItem`, `NavbarButton`, `OrigenIndicator`, `PillCompStatus`, `PillToken`, `Pointer`, `PremiumSolid`, `ReplaceMe`, `SearchInputCompact`, `Snackbar`, `StatusBar`, `StatusTagS`, `SubtleTabItem`, `SystemStatusBarAndroid`, `SystemStatusBarIPhone`, `Tabs`, `TagDefault`, `TextFieldDefault`, `TextareaCompact`, `UserProfilePicture`

## UI kit — Mobile app (`ui_kits/mobile-app/`)

An interactive click-through of the Tokko Broker mobile app: a phone frame (built only from the Figma-defined `SystemStatusBarIPhone` + `LayoutNavbar` + `HomeIndicator` — no invented shell pattern) containing:
- **Propiedades** — searchable property list (cards use `StatusTagS`, icon-font property attributes)
- **Property detail** — tabs, tags, `ActionBarMobile` contact actions
- **Chat** — contact list using `ChatContactName`
- **Conversation** — message thread + `ChatAreaMobile` composer

The source project's own working notes state the mobile app shell was still undefined at the time of writing ("no hay todavía un template de 'App Shell' para mobile") — this kit only assembles shell elements the Figma file explicitly defines (status bar, bottom nav, home indicator); it does not invent a navigation pattern. Any app section without a defined screen (e.g. "Oportunidades", "Más" tabs) shows an explicit placeholder note rather than invented content. Message bubbles in the conversation screen are a plain composition of existing color/radius/spacing tokens — the source kit defines the chat header and composer but not a standalone bubble component.

## Index

- `styles.css` — the single global stylesheet entry point (imports only)
- `tokens/` — `colors.css`, `spacing.css`, `typography.css`, `elevation.css`, `fonts.css`, `icons.css`
- `assets/logo/` — Tokko Broker wordmark (SVG, as found in the source — horizontal lockup + lettermark)
- `assets/fonts/` — Nunito Sans variable font files (regular + italic)
- `assets/icons/` — IcoMoon icon font (ttf/woff/svg)
- `components/` — 105 component files (`<Name>.jsx` + `.d.ts` + `.prompt.md`) plus grouped `*.card.html` browsing pages and the Figma-exported `fig-tokens.css` / `fig-assets.css`
- `guidelines/` — 14 foundation specimen cards (Colors, Type, Spacing, Brand)
- `ui_kits/mobile-app/` — the interactive mobile app click-through
- `SKILL.md` — portable skill definition for using this system elsewhere

## Caveats

- **Coverage counting**: the Figma file's own inventory groups some identically-named families that appear on multiple frames (e.g. "ActionBar Mobile" appears 3×, "button_default" 3×) as separate entries, totalling 92 sets in `/METADATA.md`; the design-system compiler here counts distinct component identities and reports 124. Both numbers describe full coverage of the same source — see "Intentionally not built" above for the handful of families genuinely omitted (OS keyboard chrome + 2 Figma-internal utility frames).
- Several component names carry the source's own typos/quirks verbatim (`iconbutton_compact`, `Chat-contact name ` with a trailing space, `Kebah`) — kept as-is rather than "corrected", since the values/behavior, not the labels, are the source of truth.
- `components/fig-tokens.css` is large (~1000 lines) because it's a straight export of the shared, multi-brand Figma Variables collection — see "Two token layers" above for why this is safe to ship as-is.
- 20 of the exported Figma tokens (sizing primitives like `--sizing-1-5`) couldn't be auto-classified as color/spacing/radius/shadow/font by name; they're still valid and in use, just uncategorized in the compiler's token index.
- **Icon font rendering**: this preview environment fails to paint `::before`-generated icon-font glyphs when the `@font-face` is only reachable through an `@import` chain (as `styles.css` requires) — the glyph data loads correctly but doesn't paint. Any page that uses `<i class="icon-*">` needs an *additional* direct `<link rel="stylesheet" href=".../tokens/icons.css">` alongside the `styles.css` link (already done in `guidelines/iconography.card.html` and `ui_kits/mobile-app/index.html`) as a workaround. This is very likely specific to this preview's renderer, not a real-world browser issue, but keep the extra link when adding new pages that use the icon font.

## Ask

This was built end-to-end from the attached Figma file, the attached mobile-reference codebase, and the uploaded font files — please **spot-check the token values and the mobile UI kit against the live Figma file** (colors, exact paddings, the chat/property screens) and flag anything that drifted. In particular: confirm the "Oportunidades" and "Más" tabs are genuinely out of scope for now (no screens existed for them in the source), and let me know if you'd like the OS-keyboard-chrome families built out after all despite the low reuse value.
