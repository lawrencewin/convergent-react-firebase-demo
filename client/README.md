# Convergent Messenger

This is the front-end for the Convergent Messenger demo app. It is built on React and connects to your Firebase project.

## Setting Up

First, you'll need to install the project dependencies. Open your terminal and navigate to this `client` folder. Afterwards, run the following command based on your JavaScript package manager of choice:

### `npm install` for NPM users
### `yarn install` for Yarn users

If you don't know what package manger you have, run `npm -v` or `yarn -v`. If you have either of the package managers installed, you'll see the installed version number in your terminal. Otherwise, the command will fail.

Afterwards, you'll need to create an `env` file, managing global variables this project uses. This `env` file will store your firebase and algolia credentials used by the app. Without this, the app won't be able to use either of the services.

To get started, create a new file in your project folder, and name it `.env`. In `.env`, you'll then want to define the following variables. Substitute everything to the right of the equals sign with the actual string values, no quotes.

```
REACT_APP_ALGOLIA_APP_ID=<your algolia app id here>
REACT_APP_ALGOLIA_SEARCH_KEY=<your algolia search key here>

REACT_FIREBASE_API_KEY=<your firebase api key here>
REACT_FIREBASE_AUTH_DOMAIN=<your firebase auth domain here>
REACT_FIREBASE_PROJECT_ID=<your firebase project id here>
REACT_FIREBASE_STORAGE_BUCKET=<your firebase storage bucket url here>
REACT_FIREBASE_MESSAGING_SENDING_ID=<your firebase messaging sending id here>
REACT_FIREBASE_APP_ID=<your firebase app id here>
```

You can find these values through looking at your project configs within each service's dashboard.

For Algolia Search, log into your developer account and navigate to your developer dashboard. Go to the **API Keys** page, and copy your keys to the `.env` file.

![Algolia API Keys Page](../docs/client/algolia.png?raw=true)

For Firebase, navigate to your project dashboard and go to the project settings page, marked by the settings icon on the top left corner of the page, in the nav bar. In the **General** Tab, scroll down to **Your Apps** and retrieve your app configuration.

![Firebase App Config Page](../docs/client/firebase.png?raw=true)

If you don't see **Your Apps**, you may need to create a new App. Click on the **Add App** button. You'll be greeted with a list of platforms. Choose Web, register your app name (this is a developer name, won't affect anything front-facing), and you should see your Firebase Config on the last step. 

![Firebase App Platform Modal](../docs/client/create_app_firebase_modal.png?raw=true)

## Starting the Project

In the project directory, you can start the app via the following commands:

### `npm start` for NPM users
### `yarn start` for Yarn users

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Now What?

This is a very comprehensive project, and it can be intimidating for a new developer to read over. To help, I've commented the project, created a slide deck going over the app itself, and have compiled a list of resources to get up to speed. The slide deck and resources can be found on the [main doc](../README.md).

### Code Examples

If you want to look at important examples of code within the project, here are some good places to start:

- [src/App.tsx](src/App.tsx)
- [src/components/ConversationChatbox.tsx](src/components/ConversationChatbox.tsx)
- [src/components/Navbar.tsx](src/components/Navbar.tsx)
- [src/components/SearchInput.tsx](src/components/SearchInput.tsx)
- [src/firebase/database.ts](src/firebase/database.ts)
- [src/models (look at everything)](src/models)
- [src/views/authed/AuthedScreens.tsx](src/views/authed/AuthedScreens.tsx)
- [src/views/authed/ConversationWindow.tsx](src/views/authed/ConversationWindow.tsx)
- [src/views/nonauthed/LoginScreen.tsx](src/views/nonauthed/LoginScreen.tsx)
- [src/views/nonauthed/NonAuthedScreens.tsx](src/views/nonauthed/NonAuthedScreens.tsx)