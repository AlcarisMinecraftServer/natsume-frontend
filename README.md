# Natsume Frontend

**Vite-powered React + TypeScript frontend for Natsume, a service within the Alcaris Network.**

Natsume Frontend provides a fast, modern UI for managing item definitions, player data, and economy settings exposed by the Natsume Backend API.

## Features

- **Instant Dev HMR** — powered by [Vite](https://vitejs.dev/)
- **Modern React 18** with hooks and Suspense
- **TypeScript-first** codebase for type-safe development
- **ESLint + Prettier** pre-configured for consistent style
- **Docker-friendly** build for container or Kubernetes deployments

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Start dev server with HMR
pnpm dev

# 3. Build for production
pnpm build

# 4. Preview the built app locally
pnpm preview
```

### Environment Variables

| Variable          | Example value                | Description                                  |
| ----------------- | ---------------------------- | -------------------------------------------- |
| `VITE_API_URL`    | `https://api.natsume.local`  | Base URL for Natsume Backend REST endpoints. |
| `VITE_API_KEY`    | `Backend API Key`            | API Key for Natsume Backend.                 |

Create a `.env` file in the project root:

```bash
VITE_API_URL=https://api.natsume.local
VITE_API_KEY=APIKeyHere
```

## Project Scripts

| Command          | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `pnpm dev`       | Start dev server with Hot Module Reload   |
| `pnpm build`     | Generate production build in `/dist`      |
| `pnpm preview`   | Serve the production bundle locally       |
| `pnpm lint`      | Run ESLint                                |

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
