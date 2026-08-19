# redux-graphql

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
npm install redux-graphql @apollo/client graphql graphql-ws rxjs @reduxjs/toolkit react-redux
```

---

## 🛠️ Step-by-Step Integration

### 1. Register the Redux Reducer

Add the library's built-in authentication reducer to your host application's root Redux store.

```typescript
// store.ts (Host App)
import { configureStore } from "@reduxjs/toolkit";
import { reduxGraphqlReducer, ClientCommunicators } from "redux-graphql";

export const store = configureStore({
  reducer: {
    // You can name this key anything, but your class expects to read the token from here
    myLibAuth: reduxGraphqlReducer,
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
import { setReduxGraphqlAuthTokens } from "redux-graphql";

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
} from "redux-graphql";

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

Here is how you can build fully type-controlled asynchronous actions using `redux-graphql` mutation accessor classes inside your host application setup:

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import { GuardedMutationAccessor } from "redux-graphql";
import { INITIATE_LOGOUT_ACTION } from "@/state/thunkTypes";

// Local GraphQL Documents and Types sitting inside the host application
import {
  LogoutMutation,
  LogoutMutationVariables,
} from "@/__generated__/graphql";
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
