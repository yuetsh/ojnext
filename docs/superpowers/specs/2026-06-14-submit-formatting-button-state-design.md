# Submit Formatting Button State

## Goal

Make the code submission button reflect the automatic formatting request that runs before submission.

## Behavior

- For Python3, C, and C++, the button displays `格式化中` while the formatting API request is pending.
- During formatting, the button uses the existing loading icon and is disabled to prevent duplicate submissions.
- After formatting succeeds, the existing submission flow continues and the button can display `正在提交`.
- A formatting error stops submission and clears the formatting state before showing the existing warning.
- A formatter server or network failure keeps the existing fallback behavior: clear the formatting state and submit the original code.
- Languages without automatic formatting skip this state and submit directly.
- Existing button labels and judging/cooldown behavior remain unchanged.

## Implementation

Add a component-local `isFormatting` ref in `SubmitCode.vue`.

- Include it in `submitDisabled`.
- Give it priority in `submitLabel`, using `格式化中`.
- Include it in the loading-icon condition.
- Set it immediately before `formatCode`.
- Clear it in a `finally` block so every formatter outcome restores the button state.

The state remains local because it is transient UI state owned only by the submission button.

## Verification

The frontend currently has no automated test suite. Verify with:

- TypeScript production build.
- Manual inspection of the state transitions for successful formatting, formatting errors, formatter infrastructure failures, and languages that do not format.
