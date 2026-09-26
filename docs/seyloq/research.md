# SEY-001 Research Notes

Official sources consulted on September 26, 2026:

- Tauri 2 project structure: `src-tauri`, `tauri.conf.json`, `capabilities`, and `src/lib.rs` as the mobile entry point.
- Tauri 2 capabilities and permissions: capabilities attach permissions to windows/webviews; broad plugin permissions are avoided for this milestone.
- Tauri 2 mobile/plugin guidance: Kotlin/Swift plugins are appropriate later when mobile OS behavior requires native code.
- React TypeScript docs: JSX files use `.tsx`; React types come from `@types/react` and `@types/react-dom`.
- Vite documentation for React build tooling.
- Vitest documentation for React/component testing with Testing Library-style rendering.
- W3C ARIA Authoring Practices were used as guidance to prefer semantic controls and avoid roles whose keyboard behavior is not implemented.

## CI/CD Recommendation

Use a non-GitHub-Actions pipeline based on either GitLab CI/CD or self-hosted Woodpecker CI.

Recommended initial choice: GitLab CI/CD free tier if the repository can mirror to GitLab, because it provides hosted runners for common Linux checks with a straightforward YAML pipeline. Add a self-hosted macOS runner later for Apple builds because macOS/iOS signing and build infrastructure require Apple hardware or an approved macOS runner provider.

Do not introduce a complicated pipeline in SEY-001. The first pipeline should run formatting, lint, TypeScript checks, frontend tests, Rust formatting/checks/tests, and production frontend build.
