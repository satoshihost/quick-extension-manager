# Chrome Web Store Listing Assets

_Last updated: 2026-01-12_

## Required Preview Image
- **Size**: Minimum 1280×800 (16:10). 1280×720 (16:9) is also accepted, but avoid going smaller.
- **Content**: Show the Quick Extension Manager popup in context—browser window, toolbar icon, and title/description visible.
- **Tips**:
  - Use a clean desktop background and hide other tabs/extensions to avoid clutter.
  - Capture at native resolution, then crop down to the required aspect ratio.
  - Export as PNG for crisp text.

## Additional Screenshot/GIF Gallery
- Up to **5 assets**. Each can be a static PNG/JPG or an animated GIF.
- Use the same ≥1280×800 sizing to keep Chrome happy.
- Suggested set:
  1. Search/filter view.
  2. Active Group Switch paused state.
  3. Active Group Switch resume state.
  4. Stats panel close-up.
  5. Animated GIF demonstrating a full flow (search → pause → resume).

## Creating an Animated GIF
1. **Record**
   - Use OBS, SimpleScreenRecorder, Peek, or the OS screen recorder.
   - Keep the popup centered and interactions deliberate (5–10 seconds).
2. **Trim**
   - Optionally cut the clip with `ffmpeg`, VLC, or a simple online editor.
3. **Convert** (example using `ffmpeg` from the project root):
   ```bash
   ffmpeg -i clip.mp4 -vf "fps=10,scale=1280:-1:flags=lanczos" -loop 0 quick-extension-manager.gif
   ```
   - `fps=10` keeps file size reasonable; adjust if needed.
   - `scale=1280:-1` preserves aspect ratio while matching width.
4. **Optimize**
   - If the GIF is over ~3 MB, run it through a tool like `gifsicle --optimize=3`.

## General Advice
- Maintain visual consistency: same theme colors, pinned extension icon visible.
- Add subtle annotations (arrows/text) only if they improve clarity; keep typography readable.
- Store final PNG/GIF assets under a `assets/` folder (ignored by manifest) for future updates.
