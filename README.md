# :taco: :taco: HeyTaco :taco: :taco:

[![Build Status](https://travis-ci.com/stevenspiel/heyTaco.svg?branch=master)](https://travis-ci.com/stevenspiel/heyTaco)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/d0d9b6c1d1c4430e9fad61bb60b5dc4e)](https://www.codacy.com/project/stevenspiel/heyTaco/dashboard)
[![Codacy Badge](https://api.codacy.com/project/badge/Coverage/d0d9b6c1d1c4430e9fad61bb60b5dc4e)](https://www.codacy.com/app/stevenspiel/heyTaco/files)

:taco::taco: Contributor recognition on Slack :taco::taco:

> Recognize all the good your friends say and do on Slack.

It's as simple as writing in Slack:

`@steven 🌮`

**HeyTaco** will keep track of everyone.

## Installation

1. **Create a new app in your Slack team.**

   You can do this from the [Slack API Apps page](https://api.slack.com/apps). You'll need permission to add new apps, which depending on your team settings might require an admin to do it for you.

1. **Add a bot user for your app.**

   This can be done under _Bot Users_ in the menu on the left. You can name it whatever you like, and for best results, select it to always show as online.

1. **Add chat permissions, and install the app.**

   Under _OAuth & Permissions_, scroll down to _Scopes_ and add the `chat:write:bot` permission. Click _Save Changes_.

   You can now install the app. Scroll back up, click _Install App to Workspace_, and follow the prompts.

1. **Copy your tokens.**

   From the same _OAuth & Permissions_ page, copy the **\*Bot** User OAuth Access Token\* (_not_ the non-bot token!) and store it somewhere.

   Go back to the _Basic Information_ page, scroll down, and copy the _Verification Token_ too.

1. **Deploy the app somewhere.**

   Heroku is recommended because it's simple and easy, and on most Slack teams this should not cost you a cent.

   [![Deploy to Heroku](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)

   If you need to sign up first, do so, then come back here and click the Deploy button again.

   Find out more about Heroku [here](https://www.heroku.com/about) or [here](https://devcenter.heroku.com/), and Heroku Postgres [here](https://www.heroku.com/postgres) or [here](https://elements.heroku.com/addons/heroku-postgresql).

   Hosting somewhere other than Heroku is fine too. See _Detailed Instructions_ below.

1. **Back at Slack apps, switch on _Event Subscriptions_ for your app.**

   Via _Event Subscriptions_ in the left menu. After switching on, enter your new Heroku app address - eg. `https://my-hey-taco.herokuapp.com` - as the request URL.

   Scroll down and, under _Subscribe to Bot Events_, select the relevant events for the features you want the app to support:

   - Select `message.channels` to support all general features in _public_ channels it is invited to
   - Select `message.groups` to support all general features in _private_ channels it is invited to
   - Select `app_mention` to support extended features such as leaderboards

   Finally, click _Save Changes_. If you wish, you can come back to this screen later and add or change the events the app handles.

1. **Invite your new bot to any channel in your Slack team.**

### More Information

Further instructions, such as hosting elsewhere, upgrading, etc. are coming soon.

## Usage

**HeyTaco** will listen out for messages, in channels it has been invited to, for valid commands. Commands are accepted anywhere in a message - at the beginning, middle, or end - and are currently limited to one command per message (if multiple commands are sent, only the first one found will be handled).

Currently supported general commands are:

- `@Someone 🌮🌮`: Adds tacos to a user

Currently supported extended commands are:

- `@HeyTaco leaderboard`: Displays the leaderboard for your Slack workspace
- `@HeyTaco help`: Displays a help message showing these commands

If you set a different name for your bot when adding the app to your Slack workspace, use that name instead.

ℹ️ _Extended commands are supported if you've subscribed to the `app_mentions` event in your Slack app settings. See **Step 6** in the installation instructions above for further details._

## Contributing

Your contributions are welcome! [Create an issue](https://github.com/stevenspiel/heyTaco/issues/new) if there's something you'd like to see or [send a pull request](https://github.com/stevenspiel/heyTaco/compare) if you can implement it yourself.

For full details on contributing, including getting a local environment set up, see [CONTRIBUTING.md](CONTRIBUTING.md).

## TODO

Although it works, it's very basic. Potential enhancements include:

- A way to retrieve the current version/git hash from Slack, for sanity-checking of deployments
- The ability to customise the messages the bot sends back at runtime (eg. via environment variables)
- Move to the newer, more secure method of calculating signatures for incoming Slack hooks
- A way to look up someone's karma without necessarily 🌮🌮`'ing or `--`'ing them (eg. `@username==`)
- Support for detecting multiple commands within one message
- Natural language processing to figure out positive and negative sentiment automatically
- Option to deduct karma instead of adding karma when someone tries to give themselves karma
- Option to deduct karma automatically for swearing (with customisable word list?)
- Record and make accessible how many karma points someone has _given_
- Set up a Dockerfile to make local development easier (i.e. to not require Node, Yarn or Postgres)
- Improve error handling
- The ability to customise some of the leaderboard web functionality, such as colours and perhaps imagery as well
- Additional linting tools for CSS and HTML

## License

[MIT](LICENSE).
