/* eslint-disable */
import { useState, useEffect } from "react";

let stores = {};
let subscriptions = {};

const defaultReducer = (state, payload) => payload;

/** The public interface of a store */
class StoreInterface {
  constructor(name, store, useReducer) {
    this.name = name;
    useReducer
      ? (this.dispatch = store.setState)
      : (this.setState = store.setState);
    this.getState = () => store.state;
    this.subscribe = this.subscribe.bind(this);
  }

  /**
   * Subscribe to store changes
   * @callback callback - The function to be invoked everytime the store is updated
   * @return {Function} - Call the function returned by the method to cancel the subscription
   */

  /**
   *
   * @param {callback} state, action
   */
  subscribe(callback) {
    if (!callback || typeof callback !== "function") {
      throw new Error(
        `store.subscribe callback argument must be a function. got '${typeof callback}' instead.`
      );
    }
    if (subscriptions[this.name].find(c => c === callback)) {
      console.warn(
        "This callback is already subscribed to this store. skipping subscription"
      );
      return;
    }
    subscriptions[this.name].push(callback);
    return () => {
      subscriptions[this.name] = subscriptions[this.name].filter(
        c => c !== callback
      );
    };
  }

  setState() {
    console.warn(
      `[React Hookstore] Store ${this.name} uses a reducer to handle its state updates. use dispatch instead of setState`
    );
  }

  dispatch() {
    console.warn(
      `[React Hookstore] Store ${this.name} does not use a reducer to handle state updates. use setState instead of dispatch`
    );
  }
}

function getStoreByIdentifier(identifier) {
  const name =
    identifier instanceof StoreInterface ? identifier.name : identifier;
  if (!stores[name]) {
    throw new Error(`Store with name ${name} does not exist`);
  }
  return stores[name];
}

/**
 * Creates a new store
 * @param {String} name - The store namespace.
 * @param {*} state [{}] - The store initial state. It can be of any type.
 * @callback reducer [null]
 * @returns {StoreInterface} The store instance.
 */

/**
 *
 * @param {reducer} prevState, action - The reducer handler. Optional.
 */
export function createStore(name, state = {}, reducer = defaultReducer) {
  if (typeof name !== "string") {
    throw new Error("Store name must be a string");
  }
  if (stores[name]) {
    return;
  }

  const store = {
    state,
    reducer,
    setState(action, callback) {
      this.state = this.reducer(this.state, action);
      this.setters.forEach(setter => setter(this.state));
      if (subscriptions[name].length) {
        subscriptions[name].forEach(c => c(this.state, action));
      }
      if (typeof callback === "function") callback(this.state);
    },
    setters: []
  };
  store.setState = store.setState.bind(store);
  subscriptions[name] = [];
  store.public = new StoreInterface(name, store, reducer !== defaultReducer);

  stores = Object.assign({}, stores, { [name]: store });
  return store.public;
}

/**
 * Returns a store instance based on its name
 * @callback {String} name - The name of the wanted store
 * @returns {StoreInterface} the store instance
 */

export function getStoreByName(name) {
  try {
    return stores[name].public;
  } catch (e) {
    throw new Error(`Store with name ${name} does not exist`);
  }
}

/**
 * Returns a [ state, setState ] pair for the selected store. Can only be called within React Components
 * @param {String|StoreInterface} identifier - The identifier for the wanted store
 * @returns {Array} the [state, setState] pair.
 * @example
 * const [state, dispatch] = useStore('todoList'); | const [state, dispatch] = useStore(referenceStoreObject) | const [{ v1, v2, v3 }, dispatch] = useStore(referenceStoreObject);
 */
export function useStore(identifier) {
  const store = getStoreByIdentifier(identifier);

  const [state, set] = useState(store.state);

  useEffect(() => {
    if (!store.setters.includes(set)) {
      store.setters.push(set);
    }

    return () => {
      store.setters = store.setters.filter(setter => setter !== set);
    };
  }, []);

  return [state, store.setState];
}

/**
 * Call this function outside of components. you can use this in any functions.
 * Get current store value directly without use of Hooks,
 * Note: this function does not subscribe to store. just return current value of store.
 * @param {*} identifier string or object ref
 * @example
 * const u=readOnlyStore(storesName.user);
 */
export function readOnlyStore(identifier) {
  const store = getStoreByIdentifier(identifier);
  return store.public.getState();
}

/**
 * Call this function outside of components. you can use this in any functions.
 * Change value of store directly, but this function call setter and all subscribers will notify and receive this changes.
 * @param {*} identifier string or object ref
 * @param {object} action call an action function that return object with type and payload
 * @example
 * dispatchDirectly(storesName.user,actions.user.change_username());
 */
export function dispatchDirectly(identifier, action) {
  const store = getStoreByIdentifier(identifier);
  store.setState(action);
}
