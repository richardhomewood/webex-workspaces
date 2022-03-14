const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const NavigationPlugin = require('@11ty/eleventy-navigation');
const directoryOutputPlugin = require("@11ty/eleventy-plugin-directory-output");

const filters = require('./utils/filters');
const markdown = require('./utils/markdown');
const shortcodes = require('./utils/shortcodes');
const transforms = require('./utils/transforms');

module.exports = (config) => {
  const manifestPath = path.resolve(__dirname, '_site/content/dam/wbx/us/images/workspace/manifest.json');

  // Allow for customizing the built in markdown parser.
  config.setLibrary('md', markdown);

  // Allow eleventy to understand yaml files
  config.addDataExtension('yml', (contents) => yaml.load(contents));

  // Plugins
  config.addPlugin(NavigationPlugin);

  // Filters
  Object.keys(filters).forEach((key) => {
    config.addFilter(key, filters[key]);
  });

  // Transforms
  Object.keys(transforms).forEach((key) => {
    config.addTransform(key, transforms[key]);
  });

  // Shortcodes
  config.addShortcode('icon', shortcodes.icon);
  config.addPairedShortcode('markdown', shortcodes.markdown);
  config.addNunjucksAsyncShortcode('image', shortcodes.image);
  config.addShortcode('imagesync', shortcodes.imagesync);
  config.addNunjucksAsyncShortcode('webpack', shortcodes.webpack);
  config.addShortcode('assetPath', shortcodes.assetPath);
  config.addShortcode('video', shortcodes.video);

  // Pass-through files
  config.addPassthroughCopy('src/favicon.ico');
  // Everything inside static is copied verbatim to `_site`
  config.addPassthroughCopy('src/content/dam/wbx/us/images/workspace/static');
  // Same with 'videos' directory.
  config.addPassthroughCopy('src/content/dam/wbx/us/images/workspace/videos');

  // Ignore placeholder files for otherwise-empty directories.
  config.ignores.add('**/delete-me.md');
  config.ignores.add('**/.gitkeep');

  // BrowserSync Overrides
  config.setBrowserSyncConfig({
    ...config.browserSyncConfig,
    // Reload when manifest file changes
    files: [manifestPath],
    // Show 404 page on invalid urls
    callbacks: {
      ready: (err, browserSync) => {
        browserSync.addMiddleware('*', (req, res) => {
          const fourOFour = fs.readFileSync('_site/404.html');
          res.writeHead(404, {"Content-Type": "text/html; charset=UTF-8"});
          res.write(fourOFour);
          res.end();
        });
      }
    },
    // Speed/clean up build time
    ui: false,
    ghostMode: false
  });

    config.setQuietMode(true);
    config.addPlugin(directoryOutputPlugin, {
        // Customize columns
        columns: {
            filesize: true, // Use `false` to disable
            benchmark: true, // Use `false` to disable
        },

        // Will show in yellow if greater than this number of bytes
        warningFileSize: 400 * 1000,
    });

  return {
    dir: { input: 'src', output: '_site', includes: 'includes', data: 'data' },
    // Allow nunjucks, markdown and 11ty files to be processed
    templateFormats: ['njk', 'md', '11ty.js'],
    htmlTemplateEngine: 'njk',
    // Allow pre-processing `.md` files with nunjucks
    // thus transforming the shortcodes
    markdownTemplateEngine: 'njk'
  };
};
