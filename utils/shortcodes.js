const fs = require('fs');
const path = require('path');
const {outdent} = require('outdent');
const Image = require('@11ty/eleventy-img');
const markdown = require('./markdown');

const iconDefaultSize = 24;
const defaultSizes = '90vw';
const defaultImagesSizes = [1920, 768];
const assetsDir = 'content/dam/wbx/us/images/workspace';

const isFullUrl = (url) => {
  try {
    return !!new URL(url);
  } catch {
    return false;
  }
};

const manifestPath = path.resolve(__dirname, `../_site/${assetsDir}/manifest.json`);

module.exports = {
  // Allow embedding markdown in `.njk` files
  // {% markdown %}
  // # Heading
  // {% endmarkdown %}
  markdown: (content) => markdown.render(outdent.string(content)),

  // Allow embedding webpack assets pulled out from `manifest.json`
  // {% webpack "main.css" %}
  webpack: async (name) =>
    new Promise((resolve) => {
      fs.readFile(manifestPath, {encoding: 'utf8'}, (err, data) =>
        resolve(err ? `/${assetsDir}/${name}` : JSON.parse(data)[name])
      );
    }),

  // Allow embedding svg icon
  // {% icon "github.svg", "my-class", [24, 24] %}
  icon: (name, className, size = iconDefaultSize) => {
    if (!Array.isArray(size)) size = [size];
    return outdent({newline: ''})`
    <svg class="ws-icon ws-icon--${name} ${
      className || ''
    }" role="img" aria-hidden="true" width="${size[0]}" height="${
      size[1] || size[0]
    }">
      <use xlink:href="/${assetsDir}/images/sprite.svg#${name}"></use>
    </svg>`;
  },

  // Allow embedding responsive images
  // {% image "image.jpeg", "Image alt", "Image title", "my-class" %}
  // {% image [100,100], "image.jpeg", "Image alt", "Image title", "my-class" %}
  image: async (...args) => {
    let fallbackWidth, fallbackHeight;

    if (Array.isArray(args[0])) {
      [fallbackWidth, fallbackHeight] = args.shift();
    }

    const src = args[0];
    const alt = args[1];
    const title = args[2];
    const className = args[3];
    const lazy = args[4] ?? true;
    const sizes = args[5] ?? defaultSizes;

    const extension = path.extname(src).slice(1).toLowerCase();
    const fullSrc = isFullUrl(src) ? src : `./src/${assetsDir}/images/${src}`;

    let stats;
    try {
      stats = await Image(fullSrc, {
        widths: defaultImagesSizes,
        formats: extension === 'webp' ? ['webp', 'jpeg'] : ['webp', extension],
        urlPath: `/${assetsDir}/images/`,
        outputDir: `_site/${assetsDir}/images/`
      });
    } catch (e) {
      console.log('\n\x1b[31mERROR\x1b[0m creating image:');
      console.log(`> (${fullSrc})`);
      console.log(`  ${e}\n`);
      return '';
    }

    const fallback = stats[extension].reverse()[0];
    const picture = outdent({newline: ''})`
    <picture>
      ${Object.values(stats)
      .map(
        (image) =>
          `<source type="image/${image[0].format}" srcset="${image
            .map((entry) => `${entry.url} ${entry.width}w`)
            .join(', ')}" sizes="${sizes}">`
      )
      .join('')}
      <img
        class="${className ? `img-${className}` : ''}"
        loading="${lazy ? 'lazy' : 'eager'}"
        src="${fallback.url}"
        width="${fallbackWidth ?? fallback.width}"
        height="${fallbackHeight ?? fallback.height}" alt="${alt}">
    </picture>`;
    return title
      ? outdent({newline: ''})`
      <figure class="${className ? `fig-${className}` : ''}">
        ${picture}
        <figcaption>${markdown.renderInline(title)}</figcaption>
      </figure>`
      : picture;
  },

  // Allow embedding responsive images
  // {% image "image.jpeg", "Image alt", "Image title", "my-class" %}
  // {% image [100,100], "image.jpeg", "Image alt", "Image title", "my-class" %}
  imagesync: (...args) => {

    let fallbackWidth, fallbackHeight;

    if (Array.isArray(args[0])) {
      [fallbackWidth, fallbackHeight] = args.shift();
    }

    const src = args[0];
    const alt = args[1];
    const title = args[2];
    const className = args[3];
    const lazy = args[4] ?? true;
    const sizes = args[5] ?? defaultSizes;

    let extension = path.extname(src).slice(1).toLowerCase();
    if (extension === 'jpg') {
      extension = 'jpeg';
    }

    const fullSrc = isFullUrl(src) ? src : `./src/${assetsDir}/images/${src}`;

    let stats;
    try {
      Image(fullSrc, {
        widths: defaultImagesSizes,
        formats: extension === 'webp' ? ['webp', 'jpeg'] : ['webp', extension],
        urlPath: `/${assetsDir}/images/`,
        outputDir: `_site/${assetsDir}/images/`
      });
      stats = Image.statsSync(fullSrc, {
        widths: defaultImagesSizes,
        formats: extension === 'webp' ? ['webp', 'jpeg'] : ['webp', extension],
        urlPath: `/${assetsDir}/images/`,
        outputDir: `_site/${assetsDir}/images/`
      });
    } catch (e) {
      console.log('\n\x1b[31mERROR\x1b[0m creating image:');
      console.log(`> (${fullSrc})`);
      console.log(`  ${e}\n`);
      return '';
    }

    const fallback = stats[extension].reverse()[0];
    const picture = outdent({newline: ''})`
    <picture>
      ${Object.values(stats)
      .map(
        (image) =>
          `<source type="image/${image[0].format}" srcset="${image
            .map((entry) => `${entry.url} ${entry.width}w`)
            .join(', ')}" sizes="${sizes}">`
      )
      .join('')}
      <img
        class="${className ? `img-${className}` : ''}"
        loading="${lazy ? 'lazy' : 'eager'}"
        src="${fallback.url}"
        width="${fallbackWidth ?? fallback.width}"
        height="${fallbackHeight ?? fallback.height}" alt="${alt}">
    </picture>`;
    return title
      ? outdent({newline: ''})`
      <figure class="${className ? `fig-${className}` : ''}">
        ${picture}
        <figcaption>${markdown.renderInline(title)}</figcaption>
      </figure>`
      : picture;
  },
  assetPath: (name) => `/${assetsDir}/${name}`,
  video: (filename) => {
    return outdent({newline: ''})`
    <video autoplay loop playsinline muted>
        <source src="/${assetsDir}/videos/${filename}">
        <p>Your browser doesn't support HTML5 video. Here is a <a href="/${assetsDir}/videos/${filename}">link to the video</a> instead.</p>
    </video>
    `;
  }
};
