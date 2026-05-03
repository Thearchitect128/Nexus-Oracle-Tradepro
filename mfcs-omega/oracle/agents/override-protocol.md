# Override Protocol

Overrides are exceptional and must remain visible to both the current operator
and any later reviewer.

## Flow

1. Capture the current envelope report.
2. Record the reason for override.
3. Require an explicit operator approval event.
4. Persist the override in the audit log.
5. Reflect the override state in the console and Digital Mirror.

## Rules

- No silent overrides.
- No override without a matching audit event.
- No override that erases the original kernel report.
