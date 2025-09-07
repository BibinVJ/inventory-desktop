# Fix for Trace/Breakpoint Trap Error

## Problem
The Inventory Manager Electron application was crashing with a "Trace/breakpoint trap (core dumped)" error when launched on Linux. This was caused by Electron's sandboxing mechanism failing, specifically the Zygote process failing to start properly.

## Root Cause
The error was related to:
- Electron's Zygote process (used for process forking) failing
- Sandboxing restrictions that prevented proper execution
- The specific error: `Check failed: . : Invalid argument (22)` in `zygote_host_impl_linux.cc`

## Solution Implemented

### 1. System-wide Wrapper Script
Created `/usr/local/bin/inventory-manager` with the following content:

```bash
#!/bin/bash
# Wrapper script for Inventory Manager
# Fixes the trace/breakpoint trap error by disabling problematic sandboxing features

exec "/opt/Inventory Manager/inventory-manager" --no-sandbox --disable-seccomp-filter-sandbox "$@"
```

This script:
- Disables Electron's sandbox (`--no-sandbox`)
- Disables seccomp filter sandbox (`--disable-seccomp-filter-sandbox`)
- Passes through any additional arguments

### 2. Desktop Entry Update
Updated `/usr/share/applications/inventory-manager.desktop` to use the wrapper script:
- Changed: `Exec="/opt/Inventory Manager/inventory-manager" %U`
- To: `Exec="inventory-manager" %U`

### 3. Development Environment Fix
Modified `main.js` to automatically add the necessary flags when running on Linux:

```javascript
// Fix for trace/breakpoint trap on Linux
if (process.platform === 'linux') {
  app.commandLine.appendSwitch('--no-sandbox');
  app.commandLine.appendSwitch('--disable-seccomp-filter-sandbox');
}
```

## Security Considerations
- The `--no-sandbox` flag reduces security isolation but is necessary for the application to run
- This is a common workaround for Electron applications on Linux when sandboxing fails
- The application still has other security measures in place (contextIsolation, nodeIntegration disabled)

## Testing
The fix has been tested and confirmed to work:
1. Application starts without crashing
2. GUI loads properly
3. Application processes are running correctly
4. No more "Trace/breakpoint trap" errors

## Future Considerations
- Monitor Electron updates for better sandboxing support
- Consider alternative sandboxing mechanisms if they become available
- This fix should be included in future builds/releases
