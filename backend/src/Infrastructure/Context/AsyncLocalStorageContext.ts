import { AsyncLocalStorage } from "async_hooks";
import { IRequestContext } from "../../Application/Contracts/Context/IRequestContext";

const storage = new AsyncLocalStorage<IRequestContext>();

export const RequestContext = {
  run<T>(context: IRequestContext, fn: () => T): T {
    return storage.run(context, fn);
  },

  get(): IRequestContext | undefined {
    return storage.getStore();
  },
};
