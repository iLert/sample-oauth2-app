import App from "./src/App.js";
import config from "./config/default.js";

const app = new App(config);
app.run().catch(console.error);