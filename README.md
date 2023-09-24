### NPM script

- Run `npm i` to install the project dependencies
- Run `npm run deploy` to deploy this stack to AWS

### How to test it Locally

- invoke locally

  - `npm run invoke`

- offline
  - `npm run offline`
  
    copy and paste it to the browser url: 'http://localhost:3000/dev/getAddressInfo?address=346%20PANORAMA%20AVENUE%20BATHURST'.

    or  use `curl`
    ```
    curl http://localhost:3000/dev/getAddressInfo?address=346%20PANORAMA%20AVENUE%20BATHURST
    ```

### Project structure

The project code base is mainly located within the `src` folder. This folder is divided in:

- `functions` - containing code base and configuration for your lambda functions
- `libs` - containing shared code base between your lambdas

```
.
├── src
│   ├── functions                       # Lambda configuration and source code folder
│   │   ├── getAddressInfo
│   │   │   ├── handler.ts              # `getAddressInfo` lambda source code
|   |   |   ├── getAddressInfo.test.ts  # Unit test for the handler
│   │   │   ├── index.ts                # `getAddressInfo` lambda Serverless configuration
│   │   │   ├── mock.json               # `getAddressInfo` lambda input parameter, if any, for local invocation
│   │   │   └── schema.ts               # `getAddressInfo` lambda input event JSON-Schema
│   │   │
│   │   └── index.ts                    # Import/export of all lambda configurations
│   │
│   └── libs                    # Lambda shared code
│       └── apiGateway.ts       # API Gateway specific helpers
│       └── handlerResolver.ts  # Sharable library for resolving lambda handlers
│       └── lambda.ts           # Lambda middleware
│
├── package.json
├── serverless.ts               # Serverless service file
├── tsconfig.json               # Typescript compiler configuration
├── tsconfig.paths.json         # Typescript paths
└── webpack.config.js           # Webpack configuration
```

### 3rd party libraries

- [json-schema-to-ts](https://github.com/ThomasAribart/json-schema-to-ts) - uses JSON-Schema definitions used by API Gateway for HTTP request validation to statically generate TypeScript types in your lambda's handler code base
- [middy](https://github.com/middyjs/middy) - middleware engine for Node.Js lambda. This template uses [http-json-body-parser](https://github.com/middyjs/middy/tree/master/packages/http-json-body-parser) to convert API Gateway `event.body` property, originally passed as a stringified JSON, to its corresponding parsed object
- [@serverless/typescript](https://github.com/serverless/typescript) - provides up-to-date TypeScript definitions for your `serverless.ts` service file

### Advanced usage

Any tsconfig.json can be used, but if you do, set the environment variable `TS_NODE_CONFIG` for building the application, eg `TS_NODE_CONFIG=./tsconfig.app.json npx serverless webpack`
