# Quick Extension Manager

A Chrome/Brave extension that provides quick access to enable/disable individual browser extensions from a convenient popup interface. The goal is to stay lightweight, transparent, and distraction-free.

One click opens the popup, another toggles any extension. You can also pause the entire currently-active set and bring those same extensions back later—ideal when you need a temporary clean slate without losing your usual setup.

## Features

- **Individual Extension Control**: Enable/disable any extension with one click.
- **Dark Mode Support**: Automatically follows your browser/system theme.
- **Active Group Switch**: Pause every currently enabled extension (except protected ones) and restore the same set later. The paused group persists between popup openings.
- **Search Functionality**: Quickly find extensions by name or description.
- **Clean Interface**: Modern, easy-to-use popup design optimized for speed.
- **Extension Status**: Shows enabled/disabled count and visual indicators.
- **Sorted List Display**: Enabled extensions appear first (alphabetically), followed by disabled ones.
- **Safe Operation**: Prevents accidentally disabling itself or other non-toggleable entries.

## Installation

1. **Download/Clone** this extension to your computer
2. **Open Brave/Chrome** and navigate to the extensions page:
   - Brave: `brave://extensions/`
   - Chrome: `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the `src/` folder inside the `extension-manager` project
5. **Pin the extension** to your toolbar for easy access

## Usage

1. **Click the extension icon** in your browser toolbar.
2. **Browse your extensions** — enabled ones are listed first.
3. **Use the search box** to quickly find specific extensions.
4. **Toggle extensions** using the switches on the right.
5. **Pause/Resume active group** via the “Active Group Switch” card above the list.
6. **View stats** at the bottom showing how many extensions are enabled.

## Features Explained

### Search
Type in the search box to filter extensions by name or description.

### Toggle Switches
- **Blue switch** = Extension is enabled
- **Gray switch** = Extension is disabled
- **Disabled switch** = Extension cannot be disabled (system extensions)

### Visual Indicators
- **Normal appearance** = Extension is enabled
- **Faded appearance** = Extension is disabled
- **Yellow highlight** = This extension (cannot be disabled)

### Active Group Switch
- “Pause active set” disables every currently enabled extension that Chrome allows us to toggle (this extension stays on).
- “Re-enable batch” restores only the extensions you paused previously, even if you closed the popup or restarted the browser.
- The paused list is stored locally using Chrome’s storage API; toggling any extension manually removes it from the batch automatically.

### Dark Mode
The extension supports automatic dark mode. It detects your browser or system-level appearance preferences and adapts its theme instantly.

### Stats
The bottom shows “X/Y extensions enabled” where X is enabled count and Y is total count. This updates immediately when the group switch or individual toggles change.

## Permissions

This extension requires:

- `management`: list installed extensions, read metadata, enable/disable them.
- `storage`: remember which extensions were paused by the Active Group Switch so they can be restored later.

## Compatibility

Works with:
- Chrome-based browsers (Chrome, Brave, Edge, etc.)
- Manifest V3 standard
- All types of extensions and packaged apps

## Troubleshooting

- **Extension not appearing**: Check that you loaded the unpacked extension correctly
- **Dark mode not working**: Ensure your browser or system has dark mode enabled. Some browsers require a restart to pick up system-level changes.
- **Cannot toggle extension**: Some system extensions cannot be disabled
- **Missing icons**: Extensions may not provide icons; a default placeholder is shown
- **Permission errors**: Make sure the extension has the management permission

## Development

The extension code is located in the `src/` directory:
- `src/manifest.json` - Extension configuration and permissions
- `src/popup.html` - Main interface structure
- `src/popup.css` - Styling and layout
- `src/popup.js` - Functionality and Chrome API interactions
- `src/icons/` - Extension branding icons

Feel free to modify the code to suit your needs!