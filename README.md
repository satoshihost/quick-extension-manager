# Quick Extension Manager

A Chrome/Brave extension that provides quick access to enable/disable individual browser extensions from a convenient popup interface.

## Features

- **Individual Extension Control**: Enable/disable any extension with one click
- **Search Functionality**: Quickly find extensions by name or description
- **Clean Interface**: Modern, easy-to-use popup design
- **Extension Status**: Shows enabled/disabled count and visual indicators
- **Safe Operation**: Prevents accidentally disabling itself

## Installation

1. **Download/Clone** this extension to your computer
2. **Open Brave/Chrome** and navigate to the extensions page:
   - Brave: `brave://extensions/`
   - Chrome: `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the `extension-manager` folder
5. **Pin the extension** to your toolbar for easy access

## Usage

1. **Click the extension icon** in your browser toolbar
2. **Browse your extensions** - they're sorted with enabled ones first
3. **Use the search box** to quickly find specific extensions
4. **Toggle extensions** using the switches on the right
5. **View stats** at the bottom showing how many extensions are enabled

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

### Stats
The bottom shows "X/Y extensions enabled" where X is enabled count and Y is total count.

## Permissions

This extension requires the `management` permission to:
- List all installed extensions
- Enable/disable extensions
- Read extension metadata (name, description, icons)

## Compatibility

Works with:
- Chrome-based browsers (Chrome, Brave, Edge, etc.)
- Manifest V3 standard
- All types of extensions and packaged apps

## Troubleshooting

- **Extension not appearing**: Check that you loaded the unpacked extension correctly
- **Cannot toggle extension**: Some system extensions cannot be disabled
- **Missing icons**: Extensions may not provide icons; a default placeholder is shown
- **Permission errors**: Make sure the extension has the management permission

## Development

The extension consists of:
- `manifest.json` - Extension configuration and permissions
- `popup.html` - Main interface structure
- `popup.css` - Styling and layout
- `popup.js` - Functionality and Chrome API interactions
- Icon files - Extension branding

Feel free to modify the code to suit your needs!