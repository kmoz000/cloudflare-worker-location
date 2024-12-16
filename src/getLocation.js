
const corsHeaders = {
    // What headers are allowed. * is wildcard. Instead of using '*', you can specify a list of specific headers that are allowed, such as: Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization.
    'Access-Control-Allow-Headers': '*',
    // Allowed methods. Others could be GET, PUT, DELETE etc.
    'Access-Control-Allow-Methods': '*',
    // This is URLs that are allowed to access the server. * is the wildcard character meaning any URL can.
    'Access-Control-Allow-Origin': '*',
};

async function getLocation(request) {
    const response = {
        timestamp: new Date().toISOString(), // Add timestamp in ISO format
    };

    if (request.cf) {
        const cf = request.cf;
        const headers = request.headers;
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
        if (cf.asn) response.asn = cf.asn;
        if (cf.botManagement) response.botscore = cf.botManagement.score;
        if (headers.get('user-agent')) response.userAgent = headers.get('user-agent');
        if (headers.get('x-real-ip')) response.realIp = headers.get('x-real-ip');
        if (headers.get('cf-connecting-ip')) response.ip = headers.get('cf-connecting-ip');
    }

    return new Response(JSON.stringify(response), {
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}

export default getLocation;