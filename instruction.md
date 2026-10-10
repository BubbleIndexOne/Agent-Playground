# Agent Playground - UI Architecture & Modularity Guidelines

This codebase follows strict modularity and separation of concerns principles to ensure maintainability and agentic-development compatibility. When adding new features or modifying existing code, adhere to the following rules:

## 1. Pure Presentational `.tsx` Components
- **No Business Logic**: `*.tsx` files must strictly return HTML (React JSX). They should not contain function definitions, conditional state logic, API calls, or side effects (`useEffect`).
- **Hooks for Logic**: All state management, effects, computed values (useMemo), and event handlers must be extracted into a dedicated custom hook (`useComponentName.ts`) in the same directory.
- **Example**:
  - `PlaygroundScreen.tsx` (Pure UI, receives props from hook)
  - `usePlayground.ts` (Contains all `useState`, `useEffect`, and handler functions)

## 2. File Length Constraints
- **Maximum Line Count**: No file should exceed 200-250 lines of code.
- If a component grows beyond this limit, it indicates that it is taking on too many responsibilities. You must:
  1. Extract complex logic into custom hooks (`useFeature.ts`).
  2. Extract sub-components into their own `.tsx` files (e.g., `PlaygroundSidebar.tsx`, `PlaygroundToolbar.tsx`).
  3. Move constants, interfaces, and types into `types.ts` or `constants.ts`.

## 3. Strong Typing & Constants Separation
- **Types**: Define all interfaces, types, and generic data structures in a `types.ts` file within the feature's directory.
- **Constants**: Store all static configurations, hardcoded lists (e.g., dropdown options), and storage keys in a `constants.ts` file.

## 4. Component Folder Structure
Group components by their feature domain. A complete feature module should look like this:

```
components/feature-name/
├── FeatureScreen.tsx      # Main presentational view
├── useFeatureScreen.ts    # Custom hook containing all business logic
├── FeatureSubComponent.tsx# Smaller extracted UI piece
├── types.ts               # Types and Interfaces
├── constants.ts           # Static configurations
└── utils.ts               # Pure helper functions (if needed)
```

## 5. UI/UX Aesthetics
- Prioritize a sleek, dark-mode focused design.
- Use `lucide-react` for iconography.
- Maintain consistent padding, transitions (`transition-all duration-150`), and hover states (`hover:bg-accent`, `hover:border-primary/50`).

Adhering to these principles ensures that the codebase remains scalable, easy to read, and simple to reason about for both human developers and autonomous AI coding assistants.
