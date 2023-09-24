import { handlerPath } from '@libs/handler-resolver';

export default {
  handler: `${handlerPath(__dirname)}/handler.main`,
  events: [
    {
      http: {
        method: 'get',
        path: 'getAddressInfo',
        request: {
          parameters: {
            querystrings: {
              address: true // This means the address query parameter is required
            }
          }
        },
      },
    },
  ],
};
