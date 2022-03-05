# Template Inventory

This document explains the nature of each Nunjucks template in the [`src`](../src)
or [`src/includes`](../src/includes) directories.

## Page templates

###[`src/workspaces.njk`](../src/workspaces.njk)

  This is the only top-level template. It contains page-wrapping around the content that will not be copied
  by Webex at deployment time.

  It is a minimal wrapper around included macro content that serves to load both CSS and JavaScript.


## Partial templates

Each partial template _must_ have a single macro named `render` to be used by external callers.  A template file
_may_ have additional macros used only from within the same template file.

### [`src/includes/partials/immersive/index.njk`](../src/includes/partials/immersive/index.njk)

Renders the root container and calls the 3 following partials to populate its children:

### [`src/includes/partials/common/commonUi.njk`](../src/includes/partials/common/commonUi.njk)

Renders:
- Container for common UI elements
  - Site logo
  - Workspace navigation
  - "About this Workspace" CTA

### [`src/includes/partials/immersive/initialView.njk`](../src/includes/partials/immersive/initialView.njk)

Renders:
- Container for the initial view elements
- Initial-view copy
- Initial-view "Explore" CTA
- Container for the current room's rendered background image (and hotspots?)

### [`src/includes/partials/immersive/roomView.njk`](../src/includes/partials/immersive/roomView.njk)

Renders common room content, and all the room-specific content:
- The "Explore More Rooms" and "Select a Room" copy
- The currently-selected room's background image
- All the room selection UI, using the previous macro.
- A device modal for each room, using the [`device-modal.njk`](../src/includes/partials/device-modal/index.njk) partial.

#### `roomSelections` macro

Renders only the room-selections UI: the room image tiles and names

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

###  [`src/includes/partials/device-modal/features.njk`](../src/includes/partials/device-modal/features.njk)

Renders a container and a list of features, supplied as an array of strings. 

###  [`src/includes/partials/device-modal/media-carousel.njk`](../src/includes/partials/device-modal/media-carousel.njk)

Renders a container for the carousel.  Expects an array of image or video filenames.

###  [`src/includes/partials/device-modal/specs.njk`](../src/includes/partials/device-modal/specs.njk)

Renders a container and a list of specification, supplied as an array of specification objects.
Each one should supply text and an optional icon ID. 


###  [`src/includes/partials/room-info-modal/index.njk`](../src/includes/partials/room-info-modal/index.njk)

Renders:
- Root container for the modal
- "Close" button
- Room name and intro text
- "Product List" heading
- Headings for each device vendor
- List of devices for each device vendor
