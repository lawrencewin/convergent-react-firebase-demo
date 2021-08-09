# Convergent Messenger

This repo contains a barebones Facebook Messenger clone, implemented with a React-Firebase tech stack. The project was built for use by Texas Convergent as a part of our curriculum to show new developers what is possible with React and Firebase. 

## Setup and Installation

Make sure you have the following prerequisites on your computer:

- Git 
- NodeJS installation
- Javascript Package Manager
  - NPM (comes with NodeJS)
  - Yarn

### Download the Code Locally

Using your terminal of choice, navigate to the folder you want to put this project folder in. Then run:

#### `git clone https://github.com/lawrencewin/convergent-react-firebase-demo.git`

In the current working directory, you should see a folder called `convergent-react-firebase-demo` with all of the code files.

### Set Up Your Firebase Project

To set up the Firebase stack in this project, you will need to create a Firebase project in the google console.

1. Navigate to the [firebase console](https://console.firebase.google.com/). Using your google account of choice, click "create project".

![Firebase Initial Screen](docs/main/step1.png?raw=true)

2. Choose an ID for your project. This ID is not front-facing, so it can be anything you want. Then, click "continue". 

![Choose ID For Project](docs/main/step2.png?raw=true)

3. Choose whether you want to enable or disable Google Analytics. Analytics is optional, and this project shouldn't be used in a production setting. I recommend disabling it, but for future production Firebase projects, consider enabling it.

4. On the dashboard homepage, you'll be greeted with buttons to add an app to your project. Click the third button with the **</>** icon to set up a Javascript web app.

![Add Firebase to your App](docs/main/step4.png?raw=true)

5. Enter a nickname for the web app. This nickname isn't front-facing so you can put whatever here.

6. After putting your app name, you'll be greeted with a code example containing your firebase config object. Make note of the JSON - this will be used in the react project. (You can always come back to the config object through the project settings page). After making note, click "continue to console".

![Firebase App Config Object](docs/main/step6.png?raw=true)

7. With you App created, you'll need to enable the Firebase services used by the front-end. In the sidebar of the project dashboard, click **Authentication** under the **Build** section. On the authentication dashboard, click **Get Started**.

![Firebase Authentication Enable](docs/main/step7.png?raw=true)

8. In the sidebar , click **Firestore Database** under the **Build** section. On the firestore dashboard, click **Get Started**.

![Firebase Firestore Enable](docs/main/step8.png?raw=true)

9. In the sidebar , click **Storage** under the **Build** section. On the storage dashboard, click **Get Started**.

![Firebase Firestore Enable](docs/main/step9.png?raw=true)

### Algolia Project Setup

If you want to get the user search functionality working, you will need to create an algolia account. Go to [algolia.com](https://www.algolia.com/), create an account, and follow the instructions to create an index. From there, you will need to make note of your API key, Search Key, and App ID.

### Front-End Setup

To get the rest of the React stack set up, read the [README](client/README.md) in the react folder. 

### Cloud Functions Setup

To set up the project's cloud functions, read the [README](function/README.md) in the functions folder.

## Understanding the Project

To get a better understanding of the project, you can view the slide deck detailing the project's component, and you can study the source typescript files within both `client` and `functions` folders. 

Here are general resources to get you up to speed in terms of Firebase and React.

- [Codecademy's JS Rundown](https://www.codecademy.com/learn/introduction-to-javascript)
- [Codecademy's React Course](https://www.codecademy.com/learn/react-101)
- [Firebase Web Intro Codelab - Implement Chat Client](https://firebase.google.com/codelabs/firebase-web#0)
- [freeCodeCamp - To-Do Application With React/Firebase](https://www.freecodecamp.org/news/how-to-build-a-todo-application-using-reactjs-and-firebase/)
- [freeCodeCamp - Full Stack React / Firebase Social Media App (WARNING: Very long YouTube video)](https://www.youtube.com/watch?v=m_u6P5k0vP0)

Finally, here's a [slide deck](https://docs.google.com/presentation/d/1cDhxr-3JPrPcWiP0-6s9MH31-NGIswFtgy_BCyRUTsc/edit?usp=sharing) that goes over the structure of the app.

## Things to Improve On

- Add support for Group Conversations
- Create front-end notifications on new message send
- Mark unread conversations in the ConversationList component
- Add support for other forms of media for each message
- Add other authentication methods