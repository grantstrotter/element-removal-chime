# Element Removal Chime (Chrome/Chromium Extension)

Receive an audible alert when a DOM element is removed or when the page unloads.

## Overview

This Chromium extension allows you to monitor any element on a page and hear a chime when it disappears from the DOM.

It’s useful for:
- Getting notified than a process has completed while multi-tasking
- Monitoring DOM changes in real time

## Install

This should be avilable in the Chrome Web Store soon. A link will be included here when it's available.

This extension currently supports Chromium-based browsers (Chrome, Brave, Edge). Firefox and Safari are not supported.

## How It Works

1. Right-click on an element you want to watch
2. Select **“Element Removal Chime**
3. A menu will appear showing:
   - the clicked element
   - several of its ancestor elements
4. Choose the element you want to watch

Once selected:
- A watcher is attached to that element
- A chime will play when:
  - the element is removed from the DOM, or
  - the page unloads (refresh, navigation, close)