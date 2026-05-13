# Release Cleanup Checklist

This file tracks development-only tools, QA helpers, and temporary implementation details that should be reviewed before public release.

## Remove Or Hide Before Release

- Remove or hide the `Developer Testing Tools` section from the mobile reminders screen:
  - `Queue Today's Reminder`
  - `Run Reminder Dispatch`
  - dispatch queue visibility
  - raw notification activity visibility

- Remove or hide the equivalent developer reminder QA section from the web reminders screen.

- Review any development-only alerts, debug copy, or operational wording that is useful for internal testing but too technical for end users.

- Reconfirm that reminder dispatch can run automatically from the backend without relying on any manual in-app trigger.

- Recheck premium/testing surfaces and remove any temporary QA affordances that were added only for RevenueCat Test Store validation.

## Notes

- These tools are useful during development because they make queueing, dispatch, and delivery verification much easier.
- They should not be treated as part of the final user-facing devotional experience.
