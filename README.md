# Vespa-Watch

This repository contains the source files for the [Vespa-Watch](https://www.vespawatch.be/) website. Vespa-Watch is the Flemish hotline for nests of Asian hornets, an invasive species in Belgium.

## Usage

The website makes use of the static website generator [Jekyll](https://jekyllrb.com/) and the [Petridish](https://github.com/peterdesmet/petridish) theme. **Each commit to `gh-pages` will automatically trigger a new build on GitHub Pages.** There is no need to build the site locally, but you can do so by installing Jekyll and running `bundle exec jekyll serve`.

## Repo structure

The repository structure follows that of Jekyll websites.

- General site settings: [_config.yml](_config.yml)
- Images & static files: [assets/](assets/)
- Pages: [pages/](pages/)
- Top navigation and footer: [_data/](_data/)

## Multilingual suppport

Content is available in Dutch and English (French content is [archived](https://github.com/inbo/vespa-watch/commit/e7e27ce00d4b51367d68787686df0052f1b2f625)).

- Content is organized as:
  - Dutch: `pages/nl/` and `data/nl/`
  - English: `pages/en/` and `data/en/`
- Permalinks are defined in [_config.yml](_config.yml)
  - Dutch content is served from <https://www.vespawatch.be/>
  - English content is served from <https://www.vespawatch.be/en/>
- Corresponding files have the same name and will have similar URLs:
  - `pages/nl/privacy-policy.md`: <https://www.vespawatch.be/privacy-policy/>
  - `pages/en/privacy-policy.md`: <https://www.vespawatch.be/en/privacy-policy/>
- An adapted [_includes/navbar.html](_includes/navbar.html) loads the navigation for the desired language and shows a language switcher.
- An adapted [_includes/footer.html](_includes/navbar.html) loads the footer for the desired language.

## License

This work is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).
