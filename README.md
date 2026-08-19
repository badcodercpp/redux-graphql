# redux-graphql-native

A light, fast JavaScript library built for React Native. It handles private Apollo Client channels, WebSockets, streaming via RxJS, and native authentication states.

## 🚀 Key Features

- **Internal Client Architecture:** Keeps Apollo Client completely isolated inside the package.
- **Redux-Powered Auth:** Includes a pre-built authentication slice to manage security profiles.
- **Persistent Singletons:** Uses single-instance WebSocket pipelines to stop memory leaks.
- **RxJS Pipeline Support:** Seamlessly wraps subscriptions and mutations into reactive streams.

---

## 📦 Installation

Install the package and its required peer dependencies inside your host React Native project:

```bash
npm install redux-graphql-native @apollo/client graphql graphql-ws rxjs @reduxjs/toolkit react-redux
```

---

## 🛠️ Step-by-Step Integration

### 0. Environment Configuration

Because environment variables can be handled differently across React Native and Expo setups, you must initialize the library endpoints at your application's early startup entry point (such as your index file or root `App.tsx`).

```typescript
import { initializeReduxGraphqlConfig } from "redux-graphql-native";

// Configure your endpoints using your application environment variables
initializeReduxGraphqlConfig({
  ENDPOINT: process.env.EXPO_PUBLIC_API_URL || "http://192.168.31.125:3000",
  WS_ENDPOINT: process.env.EXPO_PUBLIC_WS_URL || "ws://192.168.31.125:3000",
  API_PREFIX: "graphql",
});
```

### 1. Register the Redux Reducer

Add the library's built-in authentication reducer to your host application's root Redux store.

```typescript
// store.ts (Host App)
import { configureStore } from "@reduxjs/toolkit";
import { reduxGraphqlReducer, ClientCommunicators } from "redux-graphql-native";

export const store = configureStore({
  reducer: {
    // You can name this key anything, but your class expects to read the token from here
    // keep same name as given in example
    reduxGraphqlAuth: reduxGraphqlReducer,
    // ... your other app reducers
  },
});

// 2. Link the store directly to the library singleton
ClientCommunicators.instance.initialize(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### 2. Wrap Your App Component

Make sure your Redux state manager is running right at the entry point of your application.

```typescript
// App.tsx (Host App)
import React from 'react';
import { Provider } from 'react-redux';
import { store } from './store';
import MainScreen from './MainScreen';

export default function App() {
  return (
    <Provider store={store}>
      <MainScreen />
    </Provider>
  );
}
```

---

## 🔐 How Authentication Works

You do not need to push tokens manually into the network layer. Dispatching the login action updates the state tree, and the network channels read it instantly.

### Log In / Inject Token

```typescript
import { useDispatch } from "react-redux";
import { setReduxGraphqlAuthTokens } from "redux-graphql-native";

const dispatch = useDispatch();

const handleLogin = (userToken: string) => {
  // Apollo HTTP requests and WebSockets will now automatically use this token
  dispatch(setReduxGraphqlAuthTokens(userToken));
};
```

### Log Out / Wipe States

```typescript
import { useDispatch } from "react-redux";
import {
  resetReduxGraphqlAuthTokens,
  ClientCommunicators,
} from "redux-graphql-native";

const dispatch = useDispatch();

const handleLogout = async () => {
  // 1. Wipe credentials from the Redux tree using the reset action
  dispatch(resetReduxGraphqlAuthTokens());

  // 2. Erase the protected Apollo cache storage safely
  await ClientCommunicators.instance.clearCache();
};
```

---

## 🚀 Creating Async Thunk Action Creators

Here is how you can build fully type-controlled asynchronous actions using `redux-graphql-native` mutation accessor classes inside your host application setup:

```typescript
// for mutation
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GuardedMutationAccessor } from "redux-graphql-native";
import { INITIATE_LOGOUT_ACTION } from "@/state/thunkTypes";

// Local GraphQL Documents and Types sitting inside the host application
import {
  LogoutMutation,
  LogoutMutationVariables,
} from "@/__generated__/graphql";

// this is your action type and this is from your host app
import { INITIATE_LOGOUT } from "@/graphql-communicator";

export const initiateLogout = createAsyncThunk(
  INITIATE_LOGOUT_ACTION,
  async () => {
    // 1. Instantiating a fully typed mutation channel mapping from the library
    const logoutAccessor = new GuardedMutationAccessor<
      LogoutMutationVariables,
      LogoutMutation
    >();

    // 2. Run the secure channel execution pipeline using the host app's mutation string/node
    const initiateLogoutOutput = await logoutAccessor.execute(
      {},

      // this is your mutation or query and this also sits in your app
      INITIATE_LOGOUT,
    );

    // 3. Gracefully manage runtime errors
    if (initiateLogoutOutput.error) {
      throw new Error(
        initiateLogoutOutput.error?.message ?? "Something went wrong",
      );
    }

    return initiateLogoutOutput.data?.logout;
  },
);

// for query

import { createAsyncThunk } from "@reduxjs/toolkit";
import { GuardedOrOpenQueryAccessor } from "redux-graphql-native";
import { INITIATE_LOGOUT_ACTION } from "@/state/thunkTypes";

// Local GraphQL Documents and Types sitting inside the host application
import { LogoutQuery, LogoutQueryVariables } from "@/__generated__/graphql";

// this is your action type and this is from your host app
import { INITIATE_LOGOUT } from "@/graphql-communicator";

export const initiateLogout = createAsyncThunk(
  INITIATE_LOGOUT_ACTION,
  async () => {
    // 1. Instantiating a fully typed query channel mapping from the library
    const logoutAccessor = new GuardedOrOpenQueryAccessor<
      LogoutQueryVariables,
      LogoutQuery
    >();

    // 2. Run the secure channel execution pipeline using the host app's query string/node
    const initiateLogoutOutput = await logoutAccessor.execute(
      {},

      // this is your query or query and this also sits in your app
      INITIATE_LOGOUT,
    );

    // 3. Gracefully manage runtime errors
    if (initiateLogoutOutput.error) {
      throw new Error(
        initiateLogoutOutput.error?.message ?? "Something went wrong",
      );
    }

    return initiateLogoutOutput.data?.logout;
  },
);
```

---

## 🛠️ Metro Bundler Troubleshooting

React Native's bundle builder (Metro) can sometimes run into resolution issues when packages use modern exports fields (`.mjs` or `.cjs`).

If you see resolution warnings during your application boot process, update your `metro.config.js` to look for standard source modules explicitly:

```javascript
// metro.config.js (Host App)
const { getDefaultConfig } = require("expo/metro-config"); // Use @react-native/metro-config if not using Expo

const config = getDefaultConfig(__dirname);

// Force metro to look for standard web/js extension fields in order
config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

module.exports = config;
```

---

## 📄 Licence

MIT
