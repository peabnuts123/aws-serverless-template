import { Context, createContext, useContext } from 'react';

import TodoStore from './todo';
import RouteStore from './route';

export const stores = {
  TodoStore: new TodoStore(),
  RouteStore: new RouteStore(),
};

const StoresContext: Context<typeof stores> = createContext(stores);

export const useStores = (): typeof stores => useContext(StoresContext);
