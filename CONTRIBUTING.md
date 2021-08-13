# Contributing

Welcome, and thanks for considering contributing to `next-firebase-auth`! We really appreciate your support.

Here are some quick guidelines on how to contribute productively.

### Open issues before working

Before working on a new feature or bug fix, please open a detailed issue for discussion. This helps prevent wasted time (for example, if the feature is out of scope of this package) and gives other community members a chance for input.

If you'll start work on an existing issue, please comment that you're working on it so other contributors don't duplicate efforts.

### Use issue templates

Please use the issue templates. Issues outside of the template guidelines may be closed.

Use discussions for Q&A and for help on your app's specific implementation.

If reporting a bug, especially a full-stack one (such as problems with cookies), please provide a full example or clear way to reproduce it.

### Security disclosures

If you find a security vulnerability, do **not** open an issue. Please email the maintainers at [contact@gladly.io](mailto:contact@gladly.io).

### Making code contributions

1. Before coding, please open a related issue (or comment on an existing issue to let us know you're working on it)
2. Fork this repository
3. Make code changes in your fork
    * Add comments where it's potentially unclear what your code is doing
    * Commit with descriptive messages
    * Ensure complete code coverage for your changes
    * Make sure all linting and tests succeed (`yarn run test`)
4. Open a pull request pointing to the `main` branch in this repository
    * Add a clear title
    * In the description, link to the related issue, such as: `Closes #123.`

### Developing with a local version of the package

While developing, it can be helpful to use a local version of `next-firebase-auth` in another app. To do so:

1. Install [yalc](https://www.npmjs.com/package/yalc): `yarn global add yalc`
2. In `next-firebase-auth`, publish a local version: `yarn run dev:publish` -- this builds your local package code, then publishes it with Yalc
3. In another local Next.js app, such as the example app in this repository: `yalc add next-firebase-auth`
4. After you make changes to your local `next-firebase-auth`, use `yarn run dev:publish` again to use the latest local code in your app

### We may be slow to respond

At the moment, this repository is maintained by ~1 person in their spare time. We will be as responsive as possible, but we may be slow to respond to issues and PRs. Thanks for your patience!

### Be a good community member

Please respect our [Code of Conduct](./CODE_OF_CONDUCT.md) and contribute to a positive, constructive open source environment.

We strive to support first-time contributors and beginners through guidance and constructive feedback.
