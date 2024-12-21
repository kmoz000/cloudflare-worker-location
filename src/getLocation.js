
const corsHeaders = {
    // What headers are allowed. * is wildcard. Instead of using '*', you can specify a list of specific headers that are allowed, such as: Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization.
    'Access-Control-Allow-Headers': '*',
    // Allowed methods. Others could be GET, PUT, DELETE etc.
    'Access-Control-Allow-Methods': '*',
    // This is URLs that are allowed to access the server. * is the wildcard character meaning any URL can.
    'Access-Control-Allow-Origin': '*',
};
function parseVCards(vcards) {
    if (!Array.isArray(vcards)) {
        console.warn("Invalid input: Expected an array of vCards. Returning an empty array.");
        return [];
    }

    return vcards.map((vcard, index) => {
        if (!Array.isArray(vcard) || vcard.length < 2) {
            console.warn(`Invalid vCard format at index ${index}: Expected an array with at least two elements.`);
            return { type: "invalid", details: null };
        }

        const [type, details] = vcard;
        if (type !== "vcard" || !Array.isArray(details)) {
            console.warn(`Invalid vCard structure at index ${index}: Missing or incorrect 'type' or 'details'.`);
            return { type: "invalid", details: null };
        }

        const result = { type };

        details.forEach((detail, detailIndex) => {
            if (!Array.isArray(detail) || detail.length < 4) {
                console.warn(
                    `Invalid detail format at index ${index}, detail ${detailIndex}: Expected an array with four elements.`
                );
                return;
            }

            const [key, params, valueType, value] = detail;
            if (!key || typeof value === "undefined") {
                console.warn(
                    `Missing 'key' or 'value' at index ${index}, detail ${detailIndex}. Skipping this detail.`
                );
                return;
            }

            if (key === "adr") {
                result[key] = {
                    label: params?.label || "Unknown address",
                    details: Array.isArray(value) ? value : []
                };
            } else if (Array.isArray(value)) {
                result[key] = value;
            } else {
                result[key] = value;
            }
        });

        return result;
    });
}
async function getAsnInfo(number) {
    return await fetch("https://rdap-bootstrap.arin.net/bootstrap/autnum/" + number).then(response => response.json())
        .then(data => ({ asn: number, entities: (data?.entities || []).length > 0 ? parseVCards(data.entities.map(s => s?.vcardArray)) : [] })).catch(err => ({ asn: number, entities: [] }));
}
async function getIpInfo(ip) {
    let asn_data = await fetch("https://rdap-bootstrap.arin.net/bootstrap/ip/" + ip).then(response => response.json()).catch(err => {
        return { country: "Unknown", city: "Unknown", asn: "Unknown", entities: [] };
    });
    try {
        return {
            country: asn_data?.country || "Unknown",
            asn: (asn_data?.entities || []).length > 0 ? parseVCards(asn_data.entities.map(s => s?.vcardArray)) :
                []
        };
    } catch (error) {
        return { country: "Unknown", asn: [] };
    }
}
async function getLocation(request) {
    const response = {
        timestamp: new Date().toISOString(), // Add timestamp in ISO format
    };
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get('ip');
    if (ip) {
        response.ip = ip;
        let ipInfo = await getIpInfo(ip);
        response.country = ipInfo.country;
        response.asn = ipInfo.asn;
    } else {
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
            if (cf.asn) response.asn = await getAsnInfo(cf.asn);
            if (cf.botManagement) response.botscore = cf.botManagement.score;
            if (headers.get('user-agent')) response.userAgent = headers.get('user-agent');
            if (headers.get('x-real-ip')) {
                response.realIp = headers.get('x-real-ip')
            } else {
                response.realIp = "Unknown";
            }
            if (headers.get('cf-connecting-ip')) {
                response.forwardedFor = headers.get('cf-connecting-ip');
            } else {
                response.forwardedFor = "Unknown";
            }
            response.realIp = headers.get('x-real-ip')
        }
    }
    return new Response(JSON.stringify(response), {
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}

export default getLocation;