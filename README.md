# Nicholas Sticky Notes

## Overview
Nicholas Sticky Notes is a modern, interactive sticky notes application built with React, TypeScript and Tailwind. The app provides a workspace that users can create, organize, and manage virtual sticky notes just like physical ones on a desk.

The application features drag-and-drop functionality, allowing users to position notes anywhere on the canvas. Each note can be resized to accommodate different amounts of content and comes in multiple color options (yellow, pink, blue, green, purple) for visual organization. Notes automatically save their content, position, and appearance to localStorage, that ensures your notes are persisted between sessions.

## Features
- **Smooth Drag & Drop**: Click and drag notes to reposition them anywhere on the workspace
- **Resizable Notes**: Adjust note dimensions using the resize handle in the bottom-right corner
- **Color Coding**: Choose from 5 different note colors for visual organization
- **Persistent Storage**: Notes automatically save to localStorage with simulated backend delays
- **Trash Zone**: Drag notes to the bottom trash zone to delete them
- **Z-Index Management**: Click any note and move or resizing will bring it to the front of the stack

## Build
To build the app you can run `npm run build` the assets will be in the `/dist` directory

## Serve
To serve the app you can run `npm run start` this will spin up a local dev server using vite at http://localhost:4200 

_Note_ this may change if that port (4200) is already in use so check your console for the exact URL.

## Test
To run the tests you can run `npm run test` all tests should be passing!