import { getAddressInfo } from './handler';
import axios from 'axios';
import {  formatJSONResponse } from '@libs/api-gateway';
import { APIGatewayProxyResult } from 'aws-lambda';



jest.mock('axios');
jest.mock('@libs/api-gateway');


const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFormatJSONResponse = formatJSONResponse as jest.MockedFunction<typeof formatJSONResponse>;

describe('getAddressInfo', () => {
  const address = '123 Main St';
  const event = { queryStringParameters: { address } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return location, suburb name, and state electoral district', async () => {
   

    const geoResponse = {
      data: {
        features: [
          {
            geometry: {
              coordinates: [123, 456],
            },
          },
        ],
      },
    };

    const boundariesResponse = {
      data: {
        features: [
          {
            properties: {
              suburbname: 'Suburb',
              districtname: 'District',
            },
          },
        ],
      },
    };

    mockedAxios.get.mockResolvedValueOnce(geoResponse).mockResolvedValueOnce(boundariesResponse);
    mockedFormatJSONResponse.mockImplementation((response) => response as any);

    const result = await getAddressInfo(event as any,null, null);

    expect(result).toEqual({
      location: { latitude: 456, longitude: 123 },
      suburbName: 'Suburb',
      stateElectoralDistrict: 'District',
    });
  });

  
  it('should return a "Address not found" message when the address is not found in the first API', async () => {
    // Mock the Axios response for geocoding API to simulate address not found
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        error: 'Address not found',
      },
    });

    const result = await getAddressInfo(event as any, null, null) as APIGatewayProxyResult;


    expect(result).toEqual({ message: 'Address not found' });
  });

  it('should return a "Boundary not found" message when the address is not found in the second API', async () => {
    // Mock the Axios responses for geocoding and boundaries APIs
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        features: [{
          geometry: {
            coordinates: [122,122],
          },
        }],
      },
    });

    // Mock the Axios response for boundaries API to simulate boundary not found
    mockedAxios.get.mockResolvedValueOnce({
      data: {
        error: 'Boundary not found',
      },
    });

    const result = await getAddressInfo(event as any,null, null);

    // Verify the error message in the response
    const expectedResponse = {
      message: 'Boundary not found',
    };

    expect(result).toEqual(expectedResponse);
  });

  it('should return a "server error" message for internal server errors', async () => {
    // Mock Axios to simulate an error during the request
    mockedAxios.get.mockRejectedValueOnce(new Error('Internal Server Error'));

    const result = await getAddressInfo(event as any,null, null);

    // Verify the error message in the response
    const expectedResponse = {
      message: 'Internal Server Error',
    };

    expect(result).toEqual(expectedResponse);
  });
});
