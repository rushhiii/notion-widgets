# Security Policy

## Supported Versions

This project is actively supported on the latest production branch.

| Version | Supported |
| --- | --- |
| Latest (`main`) | Yes |
| Older commits/releases | Best effort |

## Reporting a Vulnerability

If you find a security issue, please report it responsibly.

Preferred process:

1. Open a private vulnerability report through GitHub Security Advisories (if enabled for the repository).
2. If private reporting is not available, open an issue with minimal details and request a secure contact channel.
3. Do not publish exploit details, tokens, secrets, or reproduction payloads publicly before a fix is available.

Please include:

- Affected route/file and environment (local, preview, or production)
- Impact summary (what can be exposed or abused)
- Steps to reproduce (safe, minimal)
- Proof of concept (redacted where possible)
- Suggested mitigation (if known)

## Response Timeline

- Initial acknowledgement target: within 3 business days
- Triage target: within 7 business days
- Fix timeline: depends on severity and complexity

## Security Best Practices for This Repo

- Keep secrets only in environment variables, never committed files
- Use `CRON_SECRET` to protect cron-triggered endpoints
- Rotate tokens immediately if accidental exposure is suspected
- Keep dependencies updated and review logs after deployments