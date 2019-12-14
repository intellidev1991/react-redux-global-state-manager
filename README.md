# react-redux-global-state-manager  

![logo](assets/Logo.jpg)

## Work on both `React` and `React-Native`

Fully native `global state manager` using react `Hooks` (React > 16.8). You can use this library instead of Redux or MobX. also you can access state from all of your components and behavior with them using hooks. 

A nice state management lib for React that uses the React's useState hook. Which basically means no magic behind the curtains, only pure react APIs being used to share state across components.

# Installation

### yarn

 > yarn add react-redux-global-state-manager

### npm

> npm i react-redux-global-state-manager

# My recommended Pattern

We use `Redux` with `Reducer` and `Actions` pattern with object reference access to whole actions and stores using single import object (`IntelliSense` work perfectly with it in VSCode) 

## Recommended Directory Structure:
Create these directories structure in your app for state management:

```css
store/actions/
store/stores/
store/index.js
store/storeActions.js
store/storeNames.js
```

## Step 1: Create new store (Redux like)

Create each store separately in `store/stores/` directory according meaningful name.

 e.g: Create file for store token information in it > `store/stores/token.store.js `

>Then add exported name inside `storeNames.js` for use Intellisense friendly accessible. I will explain this way in step 3.


e.g: `store/stores/token.store.js`

```js
import { createStore } from "react-redux-global-state-manager";

// List of Constant Types
const types = {
  SET_TOKEN_INFO: "SET_TOKEN_INFO",
};
// define store with name,initialState and reducer
const token = createStore(
  "token", // unique name for this token store
  {        // initialize state object
    token: null,
    public_key: "",
    expire_in: "",
    login_time: ""
  }, 
  (state, action) => { // define reducer
    // when a reducer is being used, you must return a new state value
    switch (action.type) {
      case types.SET_TOKEN_INFO:
        return {
          ...state,
          ...action.payload
        };
      default:
        return state;
    }
  }
);

export { token, types }; //export token reference and types

```

## Step 2: Create action file

Create separate action file for each store in `store/stores/` directory according to your store with meaningful name.

 e.g: Create file for store token actions in it > `store/actions/token.action.js `

>Then add exported name inside `storeActions.js` for use Intellisense friendly accessible. I will explain this way in step 3.

e.g: store/actions/token.actions.js

```js
import { types } from "../stores/token.store.js";

const token = {
  setTokenInfo: data => {
    return {
      type: types.SET_TOKEN_INFO,
      payload: data
    };
  }
};

export { token };

```

> Note: follow the files format similar to others files inside `actions` and `stores` directories.

## Step 3: Add exported `stores` and `actions` respectively to `storeNames.js` and `storeActions.js` 


e.g: add `store/stores/token.store.js` into `store/storeNames.js`*

```js
import { token } from "./stores/token.store.js";
import { profileInfo } from "./stores/profileInfo.store.js";
// ------ use this object as store identifier invoker in whole app
const storeNames = {
  token,
  profileInfo,
};
// ------
export { storeNames }; // export this object as container for all of our stores.

```

e.g: add `store/actions/token.action.js` into `store/storeActions.js`

```js
import { token } from "./actions/token.action.js";
import { profileInfo } from "./actions/profileInfo.action.js";
// ------ use this object as action function invoker in whole app
const storeActions = {
  token,
  profileInfo,
};

// ------
export { storeActions }; // export this object as container for all of our Actions.
```

## Step 4: Create one EntryPoint for your store

Create `store/index.js` and add these code into it.

```js

import { useStore, readOnlyStore, dispatchDirectly } from "react-redux-global-state-manager";
import { storeNames } from "./storeNames.js"; // All stores references
import { storeActions } from "./storeActions.js"; // All actions references

// ------
export { storeNames, storeActions, useStore, readOnlyStore, dispatchDirectly };

```

# Using store in our components

## Import required functions from entry point at `/store/index.js`

```js
import {
  storeNames, // access all stores reference
  storeActions, // access all actions functions
  useStore, // hook - use this in functional component and return [state,dispatch]
  readOnlyStore, // just return current store value in non-component functions
  dispatchDirectly // To access dispatch in non-component functions
} from "../shared/globalStore/index";
```

## For use in `functional Components`:

```js
  const [state,dispatch] = useStore(storeNames.token);
  const [profileInfo, dispatch_pi] = useStore(storeNames.profileInfo);

  // To call dispatch: dispatch() just take one object. best-practice is to call action function
  const data={
    token: "402790c1-ec61-4b10-9613-6b926529d0f2",
    public_key: "24d6e775def2404fb21a34fdd8a4e4b0",
    expire_in: "2019-12-14T22:39:10.222Z",
    login_time: "2019-12-13T10:20:15.222Z"
  }
  dispatch(storeActions.token.setTokenInfo(data))
```

> Or use `destructuring` properties:

```js
  const [{token,public_key,expire_in},dispatch] = useStore(storeNames.token);
```

## For use in regular functions (`None-Component functions`):
If in a situation you (had to) `forced` to `read data from store` or `dispatch` some data in it, you can use this approach.

### Read:

```js
//read whole token object out of component function, using store name reference
const token=readOnlyStore(storeNames.token);  
```

### Write:

```js
//call dispatch function directly out of component functions. this function take 2 params.
//arg1= store reference,
//arg2= action function that return object.

dispatchDirectly(storeNames.token, storeActions.token.setTokenInfo(tokenData));
```

# Functions


|Function                                    |Description                                                                                                                        |Return value                     |
|--------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|---------------------------------|
|useStore(storeReference)                    | This function take your `store reference` to access the `current state` and `dispatch` function. Each time the state of the current store going to change, every component that used `useStore()` will be `re-render`.                               | `[stateObject,dispatchFunction]`|
|createStore(storeName,initState,reducer)    | This function create a new store and return the reference obj to this store. we use this reference to access this store in future | Reference to this store         |
|readOnlyStore(storeReference)               | Just return current store value in non-component functions                                                                        | Current state of specific store |
|dispatchDirectly(storeReference,action)     | To access dispatch in non-component functions                                                                                     | null                            |


## Please subscribe and contribute with me to develop this lib

---

## Notice:

This library inspired by [https://github.com/jhonnymichel/react-hookstore](https://github.com/jhonnymichel/react-hookstore)
