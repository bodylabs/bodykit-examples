# Simple Node App which host a BodyKit measurement demo and demonstrate ACL authentication for webapp

Notes
----------

This is a server-side rendering node app which talks to the BodyKit API. The main purpose is to demonstate a full stack app to do the ACL management for web app. 

Configuration
----------

1. Please follow the steps of the `README` in root directory and get the other demo running first :)

2. Setup your Develper accesskey and API secret in `config.js`. 

Build
----------

Run `grunt build` in the project root directory (which you should already finished)

Start Server
----------

1. Switch current working directory to where this demo is located.

2. Run `node app.js` to start the express server

3. Open `http://localhost:3000`

4. Start exploiting :)

Credit
----------

The boilerplate comes from example of [express-react-views](https://github.com/reactjs/express-react-views). Feel free to skim the repository if you have any questions with server-side rendering and reactjs.