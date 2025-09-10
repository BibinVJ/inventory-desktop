#!/bin/bash

# Post-removal script for Inventory Manager

# Update desktop database
if which update-desktop-database > /dev/null 2>&1; then
    update-desktop-database /usr/share/applications || true
fi

# Update icon cache
if which gtk-update-icon-cache > /dev/null 2>&1; then
    gtk-update-icon-cache /usr/share/icons/hicolor || true
fi

exit 0
