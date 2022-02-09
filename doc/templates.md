# Template Inventory

This document explains the nature of each Nunjucks template in the [`src`](../src)
or [`src/includes`](../src/includes) directories.


- [`src/includes/workspaces/immersive-layout.njk`](../src/includes/workspaces/immersive-layout.njk)

  This template contains common elements for the immersive experience, regardless of the currently-selected
  workspace or room.  It is the layout wrapper template for the next template, below.
  - Stylesheet and script links
  - Root container for the "immersive experience", with 3 children:
    - Container for common UI elements
      - Site logo
      - Workspace navigation
      - "About this Workspace" CTA
    - Container for the initial view elements
      - Initial-view copy
      - Initial-view "Explore" CTA
      - Container for the current room's rendered background image and hotspots ()
    - Container for all the room view elements
      - "Select a Room" copy
      - "Explore More Rooms" copy
      - "Show workspace room selections" button (down chevron in white circle)


- [`src/workspaces.njk`](../src/workspaces.njk)

  This template contains the specific content for each workspace and room.
  It is the only top-level template, and is processed by Eleventy into
  [`_site/workspaces/index.html`](../_site/workspaces/index.html).
    - Room label
    - Room info CTA
    - Workspace room selector, with:
      - Room tile image
      - Room tile label

