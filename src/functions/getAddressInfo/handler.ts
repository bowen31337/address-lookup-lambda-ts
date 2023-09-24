import { ValidatedEventAPIGatewayProxyEvent } from '@libs/api-gateway';
import { formatJSONResponse } from '@libs/api-gateway';
import { middyfy } from '@libs/lambda';
import schema from './schema';
import axios from 'axios';

/**
 * This method is used to format the address string to support space delimited and comma delimited
 * @param address | string with spaces or commas as the delimiters
 * @returns a new address string delimited by +
 */
const formatAddress = (address = '') => address.replace(/\s+/g, '+').replace(/\,+/g, '+');

export const getAddressInfo: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (event) => {
  try {
    // 1. Get the address from the query parameter.
    const address = event.queryStringParameters?.address;

    // 2. Make an HTTP request to the first API (NSW_Geocoded_Addressing_Theme) to retrieve location information.
    const geocodingApiUrl = `https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Geocoded_Addressing_Theme/FeatureServer/1/query?where=address+%3D+%27${formatAddress(address)}%27&outFields=*&f=geojson`;

    const geocodingResponse = await axios.get(
      geocodingApiUrl
    );


    // Check if the address was not found.
    if (geocodingResponse.data?.error || geocodingResponse.data?.features?.length === 0) {
      return formatJSONResponse({
        message: 'Address not found',
      }, 404);
    }

    // Extract latitude and longitude coordinates from the response.
    const coordinates = geocodingResponse.data.features[0].geometry.coordinates;
    const latitude = coordinates[1];
    const longitude = coordinates[0];

    // 3. Make an HTTP request to the NSW_Administrative_Boundaries_Theme API.
    const boundariesApiUrl = `https://portal.spatial.nsw.gov.au/server/rest/services/NSW_Administrative_Boundaries_Theme/FeatureServer/4/query?geometry=${longitude}%2C+${latitude}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelIntersects&outFields=*&returnGeometry=false&f=geoJSON`;

    const boundariesResponse = await axios.get(boundariesApiUrl);

    // Handle any errors or check if the response contains the required data.
    if (boundariesResponse.data?.error || boundariesResponse.data?.features?.length === 0) {
      return formatJSONResponse({
        message: 'Boundary not found',
      }, 404);
    }

    // Extract suburb name and state electoral district from the response.
    const suburbName = boundariesResponse.data.features[0].properties?.suburbname;
    const electoralDistrict = boundariesResponse.data.features[0].properties?.districtname;


    // 4. Create a JSON response object.
    const response = {
      location: { latitude, longitude },
      suburbName,
      stateElectoralDistrict: electoralDistrict,
    };

    // 5. Return the JSON response.
    return formatJSONResponse(response);
  } catch (error) {
    // 6. Proper error handling.
    console.error('Error:', error);
    return formatJSONResponse({
      message: 'Internal Server Error',
    }, 500);
  }
};

export const main = middyfy(getAddressInfo);
