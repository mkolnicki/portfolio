# Frontend Guidelines

## Stack
- **SvelteKit 5** with Svelte 5 runes (`$state`, `$derived`, `$props`, `$effect`)
- **mdsvex** for blog/project content (`.svx` files with frontmatter)
- **Open Props** for design tokens
- **CSS** — scoped component styles, no CSS-in-JS

## Design
- Dark theme only — tokens in `src/lib/styles/tokens.css`
- Fonts: Inter (body), JetBrains Mono (code) via Google Fonts
- Mobile-first with `min-width` breakpoints: 640 / 768 / 1024 / 1280px

## Conventions
- Component styles use BEM-like naming: `.component__element`
- Use `$props()` with `interface Props` for component APIs
- Content loaded via `import.meta.glob` in `src/lib/utils/content.ts`
- Images go in `static/images/{blog,projects}/`
- All content is local `.svx` files — no CMS

## Content Authoring
- Blog posts: `src/content/blog/*.svx` with frontmatter (title, slug, date, excerpt, featured, readingMinutes, image, tags)
- Projects: `src/content/projects/*.svx` with frontmatter (title, slug, date, excerpt, image, tags, url)
- Svelte components can be imported and used directly in `.svx` files

## Animations & Interactivity
- Use `use:reveal` for scroll animations, preferring staggered reveals on list items over generic wrapper reveals.
- Enhance cards with mouse-tracking hover spotlight effects using CSS variables and interactive event listeners.
- Use interactive backgrounds (like particle networks) subtly to add depth without distracting from main content.
