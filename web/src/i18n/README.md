**This implementation is heavily inspired by the solid-intl implementation from [@the-cookbook/solid-intl](https://github.com/the-cookbook/solid-intl) and [this FormatJS example](https://github.com/formatjs/formatjs/blob/main/packages/react-intl/examples/StaticTypeSafetyAndCodeSplitting/intlHelpers.tsx).**

## IntlProvider

Fetches the translation file based on the `locale`, creates the Intl shape using [formatjs](https://formatjs.io/) and supplies the context provider with the shape for all the children to use.

**Why `import` in DEV and `fetch` otherwise?**

Formatjs really wants you to compile your translation files if you use `defaultRichTextElements` ([see here](https://formatjs.io/docs/tooling/cli/#compilation)). They even include a warning in the console if they detect you're using a non-compiled translation file. However, the DX of just being able to import the plain JSON file is really nice since Rollup will reload if you change the JSON file.

I tried setting up some watch script to auto-compile the translation files if the original ones changed, but it felt super overcomplicated AND you didn't get HMR. Instead, in favor of DX, the translation scripts are compiled to the `public/` folder on build, so in proudction we'll need to fetch the JSON file from the server. This will cause the warning to still show in development, but we'll be using the compiled versions in production which is really all that matters IMO.
