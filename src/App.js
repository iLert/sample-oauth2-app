import express from "express";
import axios from "axios";
import Debug from "debug";
const debug = Debug("oauth2sample:app");

class App {

    constructor(config = {}) {
        this.config = config;
    }

    async run() {

        const app = express();

        app.use((req, _res, next) => {
            debug(req.url);
            next();
        });

        app.get("/", (req, res) => {
            res.json([
                "/authorize"
            ]);
        });

        // STEP 1: build our authorize request and redirect the user's browser to it
        app.get("/authorize", (req, res) => {

            let url = this.config.ilert.host + this.config.ilert.authorizeUrl;
            url = url.replace("{clientId}", this.config.ilert.clientId);
            url = url.replace("{redirectUri}", this.config.ilert.redirectUri);
            url = url.replace("{scope}", this.config.ilert.scope);
            url = url.replace("{state}", encodeURIComponent("some other data"));

            res.redirect(url);
        });

        // STEP 2: iLert redirect's back with a code (or error)
        app.get("/authorize-result", async (req, res) => {

            const error = req.query.error;
            if(error) {
                return res.end("Failed to authorize: " + error + ", please try again");
            }

            const code = req.query.code;
            if(!code) {
                return res.end("Failed to retrieve 'code', please try again");
            }

            const state = req.query.state;
            debug(state); // our state has been proxied back :)

            const params = new URLSearchParams()
            params.append("clientId", this.config.ilert.clientId);
            params.append("clientSecret", this.config.ilert.clientSecret); // clientSecret is only send to iLert using our backend, it is never exposed to users
            params.append("code", code);

            const url = this.config.ilert.host + this.config.ilert.tokenUrl;
            
            let result = null;
            try {
                result = await axios.post(url, params, {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Accept": "application/json"
                });
            } catch(error) {
                debug(error);
                return res.end("Failed to retrieve token: " + error.message);
            }

            debug(result);
            res.end();
        });

        return new Promise((resolve, reject) => {
            this.server = app.listen(this.config.port, (error) => {

                if(error) {
                    reject(error);
                } else {
                    debug("app listening on port", this.config.port);
                    resolve(this);
                }
            });
        });
    }
}

export default App;