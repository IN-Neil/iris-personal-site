# Interim mobile boat motion

The existing stacked mobile layout remains in place. Each illustration's candle boat crosses from outside the left edge to outside the right edge as the reader scrolls through it. Scrolling upward reverses that same path; there is no timer or animation that runs while the reader is still.

One passive scroll listener batches geometry reads and CSS-variable writes into an animation frame. The scene's fixed chapter progress and camera pivot remain unchanged, and scroll updates do not rerender the React scene trees. The override applies only to compact scenes below the existing 768px breakpoint. Reduced-motion users keep the original stationary boats.

This is separate from the full mobile journey experiment in `codex/mobile-journey`. It does not merge or replace that work. The larger experiment should account for this small production patch when it is eventually integrated.

Verification: existing eight timing tests, lint, typecheck, and static production build passed. Mobile browser viewport verification covers forward/backward position changes and stationary scenery. Physical iPhone testing is not claimed.

Rollback: revert the single commit adding this document, the stacked-layout scroll effect, and the compact boat-position CSS override; rebuild and deploy normally. Do not reset branch history.
