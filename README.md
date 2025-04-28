# Natsume Frontend

**Vite-powered React + TypeScript frontend for Natsume, a service within the Alcaris Network.**

Natsume Frontend provides a fast, modern UI for managing item definitions, player data, and economy settings exposed by the Natsume Backend API.

## Features

- ⚡ **Instant Dev HMR** — powered by [Vite](https://vitejs.dev/)
- ⚛️ **Modern React 18** with hooks and Suspense
- 🛠 **TypeScript-first** codebase for type-safe development
- 🔌 **REST / OpenAPI-ready** API layer for seamless Natsume Backend integration
- ♻️ **ESLint + Prettier** pre-configured for consistent style
- 🧪 **Vitest** & React Testing Library for unit/DOM tests
- 📦 **Docker-friendly** build for container or Kubernetes deployments

## Technologies

| Purpose            | Stack                         |
| ------------------ | ----------------------------- |
| Language           | TypeScript 5.x                |
| UI Library         | React 18                      |
| Build / Dev Server | Vite 5                        |
| Linting            | ESLint (typescript-eslint, React rules) |
| Formatting         | Prettier                      |
| Testing            | Vitest, React Testing Library |
| HTTP Client        | Axios / Fetch API             |
| State / Caching    | React Query (@tanstack/query) |
| Styling (optional) | Tailwind CSS / MUI / Chakra UI |

## Getting Started

```bash
# 1. Install dependencies
pnpm install          # or yarn / npm

# 2. Start dev server with HMR
pnpm dev              # http://localhost:5173

# 3. Build for production
pnpm build            # outputs `/dist`

# 4. Preview the built app locally
pnpm preview
```

### Environment Variables

| Variable          | Example value                | Description                                  |
| ----------------- | ---------------------------- | -------------------------------------------- |
| `VITE_API_URL`    | `https://api.natsume.local`  | Base URL for Natsume Backend REST endpoints. |

Create a `.env` file in the project root:

```bash
VITE_API_URL=https://api.natsume.local
```

## Project Scripts

| Command          | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start dev server with Hot Module Reload   |
| `pnpm build`     | Generate production build in `/dist`      |
| `pnpm preview`   | Serve the production bundle locally       |
| `pnpm lint`      | Run ESLint                                |
| `pnpm typecheck` | Run TypeScript compiler for type checks   |
| `pnpm test`      | Execute unit tests with Vitest            |
| `pnpm format`    | Format all files with Prettier            |

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
