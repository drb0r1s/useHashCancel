# useHashCancel

A React hook that syncs modal and popup state with the URL hash, so the browser's back button (or a mobile back gesture) closes the modal instead of navigating away from the page.

## Why useHashCancel?

Modals and popups that don't affect the URL create a common UX problem: a user opens a modal, hits back (or swipes back on mobile), and instead of the modal closing, the whole page navigates away. `useHashCancel` fixes this by pushing a hash onto the URL whenever a modal opens, and closing the modal automatically when that hash is popped off the history stack via a back navigation.

Built while developing the frontend for a large student platform, where this pattern needed to work reliably across many independent modals and popups at once.

## Installation

```bash
npm i @drb0r1s/use-hash-cancel
```

`react` and `react-router` are required as peer dependencies (`react-router` v6+).

## Usage

### Single modal

For a single modal controlled by one boolean state, pass a fixed `hash`.

```javascript
import { useState } from "react";
import { useHashCancel } from "use-hash-cancel";

const App = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    useHashCancel({
        hash: "modal",
        state: isModalOpen,
        setState: setIsModalOpen
    });

    return (
        <>
            <button onClick={() => setIsModalOpen(true)}>Open modal</button>
            {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} />}
        </>
    );
};
```

Opening the modal pushes `#modal` onto the URL. Hitting back removes it and automatically closes the modal via `setIsModalOpen(false)`.

### Multiple modals (object state)

For several independent modals, pass an object state instead. Each key becomes its own hash, and no `hash` prop is needed since the key is tracked from the object itself.

```javascript
import { useState } from "react";
import { useHashCancel } from "use-hash-cancel";

const App = () => {
    const [modals, setModals] = useState({
        settings: false,
        share: false
    });

    useHashCancel({
        state: modals,
        setState: setModals
    });

    return (
        <>
            <button onClick={() => setModals(prev => ({...prev, settings: true}))}>Open settings</button>
            <button onClick={() => setModals(prev => ({...prev, share: true}))}>Open share</button>

            {modals.settings && <SettingsModal onClose={() => setModals(prev => ({...prev, settings: false}))} />}
            {modals.share && <ShareModal onClose={() => setModals(prev => ({...prev, share: false}))} />}
        </>
    );
};
```

Opening `settings` pushes `#settings`; opening `share` pushes `#share`. Hitting back closes whichever one is currently open by setting its key back to `false`.

## How it works

1. On mount, any existing hash in the URL is stripped, so reloading a page with a stale `#modal` in the URL doesn't force a modal open on load.
2. When state changes to an "open" value, the hook pushes the corresponding hash onto the URL via `navigate`.
3. When the URL hash changes (most notably when the browser's back action pops it off the history stack), the hook detects that the hash no longer matches the open modal and calls `setState` to close it, using the same state update the modal would use to close itself normally.
4. For object state, an internal ref tracks which key currently owns the active hash, so only the correct modal is closed when the hash is removed.

This means back-button and back-gesture navigation cancels the modal instead of leaving the page, without requiring any changes to how the modal itself is closed.

## API

### `useHashCancel({ hash, state, setState })`

| Param | Type | Required | Description |
|---|---|---|---|
| `hash` | `string` | Only for boolean `state` | The hash to sync with, without the `#`. |
| `state` | `boolean` \| `object` | Yes | Either a single boolean flag, or an object of named boolean flags for multiple modals. |
| `setState` | function | Yes | The corresponding state setter (`useState`'s setter). |

## Requirements

- React 17+
- React Router v6+ (`react-router`)

## License

MIT