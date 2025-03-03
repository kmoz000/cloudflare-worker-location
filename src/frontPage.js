import { getIpInfo } from "./getLocation";

const corsHeaders = {
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Origin': '*',
};

function generateHTML(initialData = {}) {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>IP Location Information</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="" />
    <style>
        body {
            padding-top: 20px;
            background-color: #f8f9fa;
        }
        .json-viewer {
            background-color: #f5f5f5;
            border-radius: 4px;
            padding: 15px;
            max-height: 400px;
            overflow-y: auto;
            font-family: monospace;
        }
        pre {
            margin: 0;
            white-space: pre-wrap;
        }
        #map {
            height: 400px;
            border-radius: 4px;
            margin-bottom: 20px;
        }
        .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 2s linear infinite;
            margin: 20px auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .card {
            box-shadow: 0 4px 6px rgba(0,0,0,.1);
            margin-bottom: 20px;
        }
        .card-header {
            font-weight: bold;
            background-color: #f8f9fa;
        }
        .info-pill {
            display: inline-flex;
            align-items: center;
            padding: 0.25em 0.6em;
            font-size: 75%;
            font-weight: 700;
            line-height: 1.2;
            text-align: left;
            white-space: normal;
            vertical-align: baseline;
            border-radius: 0.25rem;
            background-color: #e9ecef;
            color: #212529;
            margin-right: 0.5rem;
            margin-bottom: 0.5rem;
            max-width: 100%;
            overflow-wrap: break-word;
            word-wrap: break-word;
        }
        .info-pill .copy-btn {
            margin-left: 4px;
            cursor: pointer;
            opacity: 0.6;
            font-size: 10px;
            transition: opacity 0.2s;
        }
        .info-pill .copy-btn:hover {
            opacity: 1;
        }
        .info-pill .value {
            margin-left: 0.3rem;
            overflow-wrap: break-word;
            word-break: break-all;
        }
        .network-info {
            margin-top: 10px;
        }
        .info-group {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
            margin-bottom: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="row">
            <div class="col-12">
                <h1 class="mb-4 text-center">IP Location Information</h1>
                <div class="mb-4 card">
                    <div class="card-body">
                        <div id="loading" class="text-center">
                            <div class="loader"></div>
                            <p>Loading your location information...</p>
                        </div>
                        <div id="error-message" class="alert alert-danger d-none"></div>
                        <div id="content" class="d-none">
                            <div class="mb-3 row">
                                <div class="col-md-6">
                                    <div class="h-100 card">
                                        <div class="card-header">Location Information</div>
                                        <div class="card-body">
                                            <div id="location-info"></div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="h-100 card">
                                        <div class="card-header">Connection Details</div>
                                        <div class="card-body">
                                            <div id="connection-info"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3 card">
                                <div class="card-header">Map Location</div>
                                <div class="card-body">
                                    <div id="map"></div>
                                </div>
                            </div>
                            
                            <div class="card">
                                <div class="d-flex justify-content-between align-items-center card-header">
                                    <span>Raw JSON Data</span>
                                    <button class="btn btn-outline-secondary btn-sm" id="copy-json">Copy JSON</button>
                                </div>
                                <div class="card-body">
                                    <div id="json-viewer" class="json-viewer">
                                        <pre id="json-content"></pre>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script>
        // Store the data globally for use in the copy function
        let locationData = ${JSON.stringify(initialData)};
        
        document.addEventListener('DOMContentLoaded', function() {
            // If we already have initial data, display it
            if (Object.keys(locationData).length > 0) {
                displayData(locationData);
            }
            // Fetch the latest data anyway
            fetchLocationData();
            
            document.getElementById('copy-json').addEventListener('click', function() {
                const jsonStr = JSON.stringify(locationData, null, 2);
                copyToClipboard(jsonStr, this, 'Copied!');
            });
        });

        async function fetchLocationData() {
            try {
                const response = await fetch('/json');
                if (!response.ok) {
                    throw new Error('Network response was not ok: ' + response.statusText);
                }
                
                locationData = await response.json();
                displayData(locationData);
            } catch (error) {
                console.error('Error fetching location data:', error);
                document.getElementById('loading').classList.add('d-none');
                const errorEl = document.getElementById('error-message');
                errorEl.classList.remove('d-none');
                errorEl.textContent = 'Failed to load location data: ' + error.message;
                
                // If we have initial data, still display it
                if (Object.keys(locationData).length > 0) {
                    displayData(locationData);
                }
            }
        }

        function copyToClipboard(text, element, successMessage = 'Copied!') {
            navigator.clipboard.writeText(text)
                .then(() => {
                    const originalText = element.textContent;
                    const originalClass = element.className;
                    
                    element.textContent = successMessage;
                    if (element.classList.contains('btn')) {
                        element.classList.remove('btn-outline-secondary');
                        element.classList.add('btn-success');
                    } else {
                        element.style.backgroundColor = '#28a745';
                        element.style.color = 'white';
                    }
                    
                    setTimeout(() => {
                        element.textContent = originalText;
                        if (element.classList.contains('btn')) {
                            element.classList.remove('btn-success');
                            element.classList.add('btn-outline-secondary');
                        } else {
                            element.style.backgroundColor = '';
                            element.style.color = '';
                        }
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                });
        }

        function displayData(data) {
            document.getElementById('loading').classList.add('d-none');
            document.getElementById('content').classList.remove('d-none');
            
            // Display formatted JSON
            document.getElementById('json-content').textContent = JSON.stringify(data, null, 2);
            
            // Display location information
            const locationInfoEl = document.getElementById('location-info');
            let locationHtml = '<div class="info-group">';
            
            // IP information
            if (data.ip || data.forwardedFor || data.realIp) {
                if (data.forwardedFor && data.forwardedFor !== "Unknown") {
                    locationHtml += createInfoPill('IP', data.forwardedFor);
                }
                if (data.ip && (!data.forwardedFor || data.ip !== data.forwardedFor)) {
                    locationHtml += createInfoPill('IP', data.ip);
                }
                if (data.realIp && data.realIp !== "Unknown" && data.realIp !== data.ip && data.realIp !== data.forwardedFor) {
                    locationHtml += createInfoPill('Real IP', data.realIp);
                }
            }
            locationHtml += '</div><div class="info-group">';
            
            // Geographic information
            if (data.continent) {
                locationHtml += createInfoPill('Continent', data.continent);
            }
            
            if (data.country) {
                locationHtml += createInfoPill('Country', data.country);
            }
            
            if (data.isEUCountry) {
                locationHtml += createInfoPill('EU Country', data.isEUCountry ? 'Yes' : 'No');
            }
            
            if (data.region) {
                locationHtml += createInfoPill('Region', data.region);
            }
            
            if (data.regionCode) {
                locationHtml += createInfoPill('Region Code', data.regionCode);
            }
            
            if (data.city) {
                locationHtml += createInfoPill('City', data.city);
            }
            
            if (data.postalCode) {
                locationHtml += createInfoPill('Postal Code', data.postalCode);
            }
            
            if (data.metroCode) {
                locationHtml += createInfoPill('Metro Code', data.metroCode);
            }
            locationHtml += '</div><div class="info-group">';
            
            // Time and coordinates
            if (data.timezone) {
                locationHtml += createInfoPill('Timezone', data.timezone);
            }
            
            if (data.timestamp) {
                locationHtml += createInfoPill('Timestamp', data.timestamp);
            }
            
            if (data.latitude && data.longitude) {
                locationHtml += createInfoPill('Coordinates', \`\${data.latitude}, \${data.longitude}\`);
            }
            locationHtml += '</div>';
            
            locationInfoEl.innerHTML = locationHtml || 'No location information available';
            
            // Display connection information
            const connectionInfoEl = document.getElementById('connection-info');
            let connectionHtml = '<div class="info-group">';
            
            if (data.asn) {
                if (typeof data.asn === 'object' && data.asn.asn) {
                    connectionHtml += createInfoPill('ASN', data.asn.asn);
                    
                    if (data.asn.entities && data.asn.entities.length > 0) {
                        const entity = data.asn.entities[0];
                        if (entity.fn) {
                            connectionHtml += createInfoPill('Provider', entity.fn);
                        }
                    }
                } else {
                    connectionHtml += createInfoPill('ASN', data.asn);
                }
            }
            connectionHtml += '</div><div class="info-group">';
            
            if (data.userAgent) {
                connectionHtml += createInfoPill('User Agent', data.userAgent);
            }
            
            if (data.botscore !== undefined) {
                connectionHtml += createInfoPill('Bot Score', data.botscore);
            }
            connectionHtml += '</div>';
            
            connectionInfoEl.innerHTML = connectionHtml || 'No connection information available';
            
            // Create map if coordinates are available
            if (data.latitude && data.longitude) {
                // First invalidate the map container size
                const mapContainer = document.getElementById('map');
                mapContainer.innerHTML = '<div style="height: 100%; width: 100%;" id="map-inner"></div>';
                
                // Use a small delay to ensure the container is visible and sized properly
                setTimeout(() => {
                    try {
                        // Initialize the map with valid coordinates
                        const lat = parseFloat(data.latitude);
                        const lng = parseFloat(data.longitude);
                        
                        if (isNaN(lat) || isNaN(lng)) {
                            document.getElementById('map').innerHTML = '<div class="alert alert-info">Invalid location coordinates</div>';
                            return;
                        }
                        
                        const mapEl = document.getElementById('map-inner');
                        const map = L.map(mapEl, {
                            attributionControl: true,
                            zoomControl: true
                        }).setView([lat, lng], 10);
                        
                        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                            maxZoom: 19
                        }).addTo(map);
                        
                        L.marker([lat, lng])
                            .addTo(map)
                            .bindPopup(\`<b>\${data.city || 'Unknown'}, \${data.country || ''}</b><br>Coordinates: \${lat}, \${lng}\`)
                            .openPopup();
                        
                        // Fix any sizing issues
                        map.invalidateSize();
                    } catch (error) {
                        console.error('Error creating map:', error);
                        document.getElementById('map').innerHTML = 
                            \`<div class="alert alert-danger">Error creating map: \${error.message}</div>\`;
                    }
                }, 300); // Increased timeout to ensure DOM is ready
            } else {
                document.getElementById('map').innerHTML = '<div class="alert alert-info">Location coordinates not available</div>';
            }
            
            // Add event listeners for copy buttons
            document.querySelectorAll('.copy-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const value = this.getAttribute('data-value');
                    copyToClipboard(value, this, '✓');
                });
            });
        }
        
        function createInfoPill(label, value) {
            if (value === undefined || value === null) return '';
            const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);
            return \`<div class="info-pill">
                <strong>\${label}:</strong>
                <span class="value">\${valueStr}</span>
                <span class="copy-btn" data-value="\${valueStr}" title="Copy to clipboard">📋</span>
            </div>\`;
        }
    </script>
</body>
</html>`;
}

async function frontPageHandler(request) {
    // We'll pre-fetch some initial data if possible
    let initialData = {
        timestamp: new Date().toISOString() // Add timestamp in ISO format
    };
    try {
        const { searchParams } = new URL(request.url);
        const ip = searchParams.get('ip');
        if (ip) {
            initialData.realIp = ip;
            initialData.ip = ip;
            let ipInfo = await getIpInfo(ip);
            if (ipInfo) {
                initialData = { ...initialData, ...ipInfo };
            }
        } else {
            if (request.cf) {
                const cf = request.cf;
                const headers = request.headers;
                if (cf.continent) initialData.continent = cf.continent;
                if (cf.longitude) initialData.longitude = cf.longitude;
                if (cf.latitude) initialData.latitude = cf.latitude;
                if (cf.country) initialData.country = cf.country;
                if (cf.isEUCountry) initialData.isEUCountry = cf.isEUCountry;
                if (cf.city) initialData.city = cf.city;
                if (cf.postalCode) initialData.postalCode = cf.postalCode;
                if (cf.metroCode) initialData.metroCode = cf.metroCode;
                if (cf.region) initialData.region = cf.region;
                if (cf.regionCode) initialData.regionCode = cf.regionCode;
                if (cf.timezone) initialData.timezone = cf.timezone;
                if (cf.asn) initialData.asn = cf.asn;
                if (cf.botManagement) initialData.botscore = cf.botManagement.score;
                if (headers.get('user-agent')) initialData.userAgent = headers.get('user-agent');
                if (headers.get('x-real-ip')) {
                    initialData.realIp = headers.get('x-real-ip');
                    initialData.ip = headers.get('x-real-ip');
                } else {
                    initialData.realIp = "Unknown";
                }
                if (headers.get('cf-connecting-ip')) {
                    initialData.forwardedFor = headers.get('cf-connecting-ip');
                } else {
                    initialData.forwardedFor = "Unknown";
                }
            }
        }
    } catch (error) {
        console.error("Error preparing initial data:", error);
    }

    return new Response(generateHTML(initialData), {
        headers: {
            'Content-Type': 'text/html',
            ...corsHeaders,
        },
    });
}

export default frontPageHandler;
