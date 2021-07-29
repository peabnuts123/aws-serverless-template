import { Context, createContext, useContext } from 'react';

import TodoStore from './todo';

export const stores = {
  TodoStore: new TodoStore(),
};

const StoresContext: Context<typeof stores> = createContext(stores);

export const useStores = (): typeof stores => useContext(StoresContext);
