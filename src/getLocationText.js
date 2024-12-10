
const corsHeaders = {
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Origin': '*',
};

async function getLocationText(request) {
    const response = {
        timestamp: Math.floor(Date.now() / 1000), // Add timestamp in seconds
    };

    if (request.cf) {
        const cf = request.cf;
        if (cf.continent) response.continent = cf.continent;
        if (cf.longitude) response.longitude = cf.longitude;
        if (cf.latitude) response.latitude = cf.latitude;
        if (cf.country) response.country = cf.country;
        if (cf.isEUCountry) response.isEUCountry = cf.isEUCountry;
        if (cf.city) response.city = cf.city;
        if (cf.postalCode) response.postalCode = cf.postalCode;
        if (cf.metroCode) response.metroCode = cf.metroCode;
        if (cf.region) response.region = cf.region;
        if (cf.regionCode) response.regionCode = cf.regionCode;
        if (cf.timezone) response.timezone = cf.timezone;
    }

    var textResponse = 'do={:return {' + Object.entries(response)
        .map(([key, value]) => `"${key}"="${value}"`)
        .join(';');
    textResponse += '}}';
    return new Response(textResponse, {
        headers: {
            'Content-Type': 'text/plain',
            ...corsHeaders,
        },
    });
}

export default getLocationText;