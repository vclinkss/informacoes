import { createApp } from "./Main/Libs/Express/app";
import { env } from "./Shared/Env";

const app = createApp();
const port = Number(env.PORT);

app.listen(port, () => {
  console.log(`Server running on port ${port} in ${env.NODE_ENV} mode`);
});
