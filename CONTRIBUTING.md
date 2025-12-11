# Contributing to Downtime Configuration

Thanks for your interest in contributing! Below are guidelines and a small checklist to make contributions smooth.

## How to contribute

1. Fork the repository and create a feature branch from `main`:

```bash
git checkout -b feat/your-feature
```

2. Implement your changes. Keep them focused and well-tested.
3. Run linting and tests locally (if configured).
4. Open a Pull Request (PR) against `main` with a clear title and description.

## Coding standards

- Keep code simple and readable.
- Follow existing naming conventions in controllers and views.
- Avoid breaking changes in the public controller API without thorough justification.

## Testing

- Add unit tests for any logic-heavy functions where feasible.
- For UI changes, include screenshots in the PR description.

## Commit messages

Use clear, present-tense messages, e.g. `Add CSV filename formatting`, `Fix delete-row state`.

## Issues

If you find a bug, please open an issue describing the steps to reproduce, expected vs actual behaviour, and any console logs or screenshots that help reproduce the problem.

---

If you'd like, I can also add a GitHub Actions workflow to run tests and lint on every PR.