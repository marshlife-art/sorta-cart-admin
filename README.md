# sorta-cart-admin

## quickstart

```sh
npm install
npm start
```

shout-out to [material-ui dashboard example](https://github.com/mui-org/material-ui/blob/master/docs/src/pages/getting-started/templates/dashboard)

### misc.

SecurityError: Failed to construct 'WebSocket': An insecure WebSocket connection may not be initiated from a page loaded over HTTPS.

edit `node_modules/react-dev-utils/webpackHotDevClient.js`

change ln 62 to: `protocol: window.location.protocol === 'https:' ? 'wss' : 'ws',`
