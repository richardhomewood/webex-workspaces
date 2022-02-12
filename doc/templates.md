# Template Inventory

This document explains the nature of each Nunjucks template in the [`src`](../src)
or [`src/includes`](../src/includes) directories.

## Page templates

###[`src/workspaces.njk`](../src/workspaces.njk)

  This is the only top-level template. It contains page-wrapping around the content that will not be copied
  by Webex at deployment time.

  A root element contains links to bundled CSS and JS, and calls macros from
  [`src/includes/partials/immersive.njk`](../src/includes/partials/immersive.njk) to render content:

  - Common UI elements used for all workspaces and rooms
  - Elements for the initial "onboarding" view
  - Elements for all the individual room views.

## Partial templates

Each partial template renders a section of the page.  Data for a given partial must be passed in by its caller.

### [`src/includes/partials/immersive.njk`](../src/includes/partials/immersive.njk)
  
This partial template contains the following macros, all called directory or indirectly by the sole page template.

#### `commonUI`

Renders:
- Container for common UI elements
  - Site logo
  - Workspace navigation
  - "About this Workspace" CTA
  
#### `initialView`

Renders:
- Container for the initial view elements
- Initial-view copy
- Initial-view "Explore" CTA
- Container for the current room's rendered background image (and hotspots?)

#### `roomSelections`

Renders only the room-selections UI: the room image tiles and names

#### `roomView`

Renders common room content, and all the room-specific content:
- The "Explore More Rooms" and "Select a Room" copy
- The currently-selected room's background image
- All the room selection UI, using the previous macro.
- A device modal for each room, using the [`device-modal.njk`](../src/includes/partials/device-modal/index.njk) partial.

###  [`src/includes/partials/common/download-pdf.njk`](../src/includes/partials/common/download-pdf.njk)

Renders "Download PDF Version" links.

###  [`src/includes/partials/device-modal/index.njk`](../src/includes/partials/device-modal/index.njk)

Renders:
- Root container for the modal
- "Close" button
- All the devices for the specified room, with:
  - Device name
  - Intro copy
  - Image carousel
  - Features section
  - Tech Specs section
  - Configuration Guide section
  - "Download PDF Version" link

###  [`src/includes/partials/device-modal/config-guide.njk`](../src/includes/partials/device-modal/config-guide.njk)

Renders the Configuration Guide section of the device modal

###  [`src/includes/partials/device-modal/features.njk`](../src/includes/partials/device-modal/features.njk)

Renders a container and a list of features, supplied as an array of strings. 

###  [`src/includes/partials/device-modal/image-carousel.njk`](../src/includes/partials/device-modal/image-carousel.njk)

Renders a container for the carousel.  Expects an array of images.

The skeleton for this partial is still in progress.  For now, it displays the count of images passed in via the array.

###  [`src/includes/partials/device-modal/specs.njk`](../src/includes/partials/device-modal/specs.njk)

Renders a container and a list of specification, supplied as an array of specification objects.
Each one should supply text and an optional icon ID. 
