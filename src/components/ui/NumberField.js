"use client";

import { useState } from "react";

// A plain controlled `<input type="number" value={n} onChange={(e) =>
// set(parseFloat(e.target.value) || 0)}>` is impossible to clear and
// retype into: the instant the field is emptied, parseFloat("") is NaN,
// `NaN || 0` immediately re-commits 0, and the controlled value snaps the
// field back to "0" before the next keystroke lands. This keeps its own
// draft string while the field is focused (so it can sit empty mid-edit)
// and only re-syncs from the external value when the field isn't focused —
// so a value changing elsewhere (e.g. a reload) doesn't clobber an
// in-progress edit, but a genuinely external change still shows up.
export default function NumberField({ value, onChange, min = 0, className, ...rest }) {
  const [draft, setDraft] = useState(String(value));
  const [prevValue, setPrevValue] = useState(value);
  const [focused, setFocused] = useState(false);

  // Resync the draft from the external value during render (the pattern
  // React docs recommend for "adjust state when a prop changes") rather
  // than in an effect — an effect here would cause an extra render pass
  // for every keystroke, since `value` changes on every valid keystroke,
  // not just on external resets. Skipped while focused so an in-progress
  // edit (including a deliberately empty field) never gets clobbered.
  if (!focused && value !== prevValue) {
    setPrevValue(value);
    setDraft(String(value));
  }

  function commit(raw) {
    const n = parseFloat(raw);
    onChange(Number.isNaN(n) ? 0 : Math.max(min, n));
  }

  return (
    <input
      type="number"
      min={min}
      value={draft}
      onFocus={() => setFocused(true)}
      onChange={(e) => {
        setDraft(e.target.value);
        if (e.target.value !== "" && !Number.isNaN(parseFloat(e.target.value))) commit(e.target.value);
      }}
      onBlur={(e) => {
        setFocused(false);
        commit(e.target.value);
      }}
      className={className}
      {...rest}
    />
  );
}
