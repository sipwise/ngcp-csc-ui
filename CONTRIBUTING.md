# Contributing Guide

### Welcome

First off, thank you for considering contributing to [Sipwise](https://www.sipwise.com/)'s Customer Self-Care Web UI.

### Purpose Of Guidelines

Following these guidelines helps to communicate that you respect the time of the developers managing and developing this open source project. In return, they should reciprocate that respect in addressing your issue, assessing changes, and helping you finalize your pull requests.

### Ways To Contribute

The Customer Self-Care Web UI is built using open source tools and software, and is thus an open source project. We love to receive contributions from our community! There are many ways to contribute, from writing tutorials or blog posts, improving the documentation, submitting bug reports and feature requests or writing code which can be incorporated into the Customer Self-Care Web UI itself.

### Support

Please, don't use the issue tracker for support questions. Check with your Sipwise representative, or [contact us](https://www.sipwise.com/company/contact/) if you aren't already an existing customer.

# Ground Rules

Here are some ground rules to follow:

* Create issues for any major changes and enhancements that you wish to make. Discuss things transparently and get community feedback.
* Follow best-practices for the tools and frameworks used. If in doubt, check our codebase for conventions used.
* Be welcoming to newcomers and encourage diverse new contributors from all backgrounds.
* Harassment or any discriminatory behavior is not accepted.

### Definition Of Done

To consider a change to be done (internal procedure) or pull request to be ready for submission, these criteria need to be met:

* All existing and new tests must pass. See our section on ["how to run tests"](#how-to-run-test) for details.
* At least one test for each type of change implemented needs to be written and added. If the change does not include any new functionality (such as minor changes, grammar, formatting, clean up, etc) test are not needed. Examples: If you create a change that involves change of state in the store, you need to include a test that covers that change. If your change on the other hand both involves changes to the store, api and mutations, then several tests would be required to test the affected parts.
* Test that the app is able to be installed locally, run in browser without errors, and that the implemented functionality (if any) works as expected.

# Your First Contribution

Working on your first Pull Request? You can learn how from this *free* series, [How to Contribute to an Open Source Project on GitHub](https://egghead.io/series/how-to-contribute-to-an-open-source-project-on-github).

At this point, you're ready to make your changes! Feel free to ask for help.

If a maintainer asks you to "rebase" your PR, they're saying that a lot of code has changed, and that you need to update your branch so it's easier to merge.

# How To Contribute

Contributions are welcome in the form of a pull request.

1. Create your own fork of the code.
2. Do the changes in your fork.
3. If you like the change and think the project could use it:
    * Be sure you have followed the code style for the project.
    * Make sure existing (and any new ones you have added) pass.
    * Send a pull request see our section on ["your first contribution"](#your-first-contribution) for help with this.

### How To Run Tests

Test can easily be run for our project. To run them, first make sure you have installed the project locally by following the steps in [our README file](./README.md).

Then execute the following command:

`npm run test`

# How To Report A Bug

When filing an issue, make sure to answer these five questions:

1. What version of Vue.js are you using?
1. What operating system and browser are you using?
1. What did you do?
1. What did you expect to see?
1. What did you see instead?

# How To Suggest A Feature Or Enhancement

If you find yourself wishing for a feature that doesn't exist in Customer Self-Care Web UI, please check with your Sipwise representative or [contact us](https://www.sipwise.com/company/contact/) if you aren't already an existing customer.

If you're using the Community Edition of our products, feel free open an issue on our issues list on GitHub which describes the feature you would like to see, why you need it, and how it should work.
