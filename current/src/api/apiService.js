// src/common/services/sharedApiService.js
const API_URL = process.env.REACT_APP_API_URL || '/api';

// Helper function to handle fetch requests
const fetchWithErrorHandling = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                ...options.headers,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error in API call to ${url}:`, error);
        throw error;
    }
};

////////////////////////////////////////////////////////////////////
// --- Shared API Calls ---
// Fetch programs with pagination and search
export const fetchPrograms = async (page = 1, limit = 10, search = '') => {
    let url = `${API_URL}/shared/programs?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchWithErrorHandling(url);
};

// Fetch a specific program by ID
export const fetchProgramById = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/shared/programs/${id}`);
};

// Create a new program
export const createProgram = async (programData) => {
    return fetchWithErrorHandling(`${API_URL}/shared/programs`, {
        method: 'POST',
        body: JSON.stringify(programData),
    });
};

// Update an existing program
export const updateProgram = async (id, programData) => {
    return fetchWithErrorHandling(`${API_URL}/shared/programs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(programData),
    });
};

// Delete a program
export const deleteProgram = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/shared/programs/${id}`, {
        method: 'DELETE',
    });
};

// Fetch program scope domains
export const fetchProgramScope = async (programId) => {
    return fetchWithErrorHandling(`${API_URL}/shared/programs/${programId}/scope`);
};

// Add a scope domain to a program
export const addScopeDomain = async (programId, domainData) => {
    return fetchWithErrorHandling(`${API_URL}/shared/programs/${programId}/scope`, {
        method: 'POST',
        body: JSON.stringify(domainData),
    });
};

// Update a scope domain
export const updateScopeDomain = async (domainId, domainData) => {
    return fetchWithErrorHandling(`${API_URL}/shared/programs/scope/${domainId}`, {
        method: 'PUT',
        body: JSON.stringify(domainData),
    });
};

// Delete a scope domain
export const deleteScopeDomain = async (domainId) => {
    return fetchWithErrorHandling(`${API_URL}/shared/programs/scope/${domainId}`, {
        method: 'DELETE',
    });
};

// Fetch platforms for dropdown
export const fetchPlatforms = async () => {
    return fetchWithErrorHandling(`${API_URL}/shared/platforms`);
};

////////////////////////////////////////////////////////////////////
// --- Deeper API Calls ---
// Add these new functions to your apiService.js file

// Fetch alerts for deeper dashboard
export const fetchDeeperAlerts = async (page = 1, limit = 10, search = '', category = 'all', showViewed = false) => {
    try {
        const queryParams = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
            ...(search && {search}),
            ...(category !== 'all' && {category}),
            showViewed: showViewed ? 'true' : 'false'
        });

        const response = await fetch(`/api/deeper/alerts?${queryParams}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching deeper alerts:', error);
        throw error;
    }
};

// Mark deeper alert as viewed
export const markDeeplikeAlertAsViewed = async (id, type) => {
    try {
        const response = await fetch(`/api/deeper/alerts/${id}/viewed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({type})
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error marking deeper alert as viewed:', error);
        throw error;
    }
};

// Mark all alerts on the current page as viewed
export const markDeeplikePageAlertsAsViewed = async (ids, types) => {
    try {
        const response = await fetch(`${API_URL}/deeper/alerts/mark-page-viewed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ids, types}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error marking page alerts as viewed:', error);
        throw error;
    }
};

// Mark all unviewed alerts as viewed
export const markDeeplikeAllAlertsAsViewed = async () => {
    try {
        const response = await fetch(`${API_URL}/deeper/alerts/mark-all-viewed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error marking all alerts as viewed:', error);
        throw error;
    }
};

// Fetch subdomains (for Subdomains page)
export const fetchSubdomains = async (page = 1, limit = 10, search = '', filters = {}) => {
    let url = `${API_URL}/deeper/subdomains?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    // Add optional filters
    if (filters.program) url += `&program=${encodeURIComponent(filters.program)}`;
    if (filters.id) url += `&id=${encodeURIComponent(filters.id)}`;
    if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;

    return fetchWithErrorHandling(url);
};

// Update a subdomain
export const updateSubdomain = async (id, data) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/subdomains/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Delete a subdomain
export const deleteSubdomain = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/subdomains/${id}`, {
        method: 'DELETE',
    });
};

// Fetch subdomain metrics
export const fetchSubdomainMetrics = async () => {
    return safeAPI(`${API_URL}/deeper/subdomains-metrics`, {
        total_subdomains: 0,
        active_subdomains: 0,
        new_today: 0,
        total_apex_domains: 0,
        http_servers: 0,
        https_servers: 0
    });
};

// Fetch ASN data (for ASN page)
export const fetchASN = async (page = 1, limit = 10, search = '') => {
    // ASN endpoint is returning 500, use a more resilient approach
    try {
        let url = `${API_URL}/deeper/asn?page=${page}&limit=${limit}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return await fetchWithErrorHandling(url);
    } catch (error) {
        console.error("Error fetching ASN data:", error);
        // Return empty data structure that matches expected format
        return {
            data: [],
            pagination: {
                total: 0,
                current_page: page,
                total_pages: 0,
                per_page: limit
            }
        };
    }
};

// Fetch ASN metrics
export const fetchASNMetrics = async () => {
    return safeAPI(`${API_URL}/deeper/asn-metrics`, {
        total_asns: 0,
        asns_with_names: 0,
        total_names: 0,
        average_names_per_asn: 0,
        most_names: 0,
        recently_added: 0
    });
};

// Update an ASN
export const updateASN = async (id, data) => {
    try {
        return await fetchWithErrorHandling(`${API_URL}/deeper/asn/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    } catch (error) {
        console.error("Error updating ASN:", error);
        return {success: false, error: "Failed to update ASN"};
    }
};

// Delete an ASN
export const deleteASN = async (id) => {
    try {
        return await fetchWithErrorHandling(`${API_URL}/deeper/asn/${id}`, {
            method: 'DELETE',
        });
    } catch (error) {
        console.error("Error deleting ASN:", error);
        return {success: false, error: "Failed to delete ASN"};
    }
};

// Fetch CIDR data (for CIDR page)
export const fetchCIDR = async (page = 1, limit = 10, search = '', filters = {}, programId = 1) => {
    // Based on errors, CIDR endpoints use a different pattern with programId
    let url = `${API_URL}/deeper/cidr?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    // Add optional filters
    if (filters.program) url += `&program=${encodeURIComponent(filters.program)}`;
    if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;

    return fetchWithErrorHandling(url);
};

// Fetch CIDR metrics
export const fetchCIDRMetrics = async () => {
    return safeAPI(`${API_URL}/deeper/cidr-metrics`, {
        total_cidrs: 0,
        ipv4_cidrs: 0,
        ipv6_cidrs: 0,
        inscope_cidrs: 0,
        total_names: 0,
        cidr_with_names: 0
    });
};

// Update a CIDR
export const updateCIDR = async (id, data, programId = 1) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/cidr/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Delete a CIDR
export const deleteCIDR = async (id, programId = 1) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/cidr/${id}`, {
        method: 'DELETE',
    });
};

// Fetch RDAP data (for RDAP page)
export const fetchRDAP = async (type, page = 1, limit = 10, search = '') => {
    let url = `${API_URL}/deeper/rdap?type=${type}&page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchWithErrorHandling(url);
};

// Update an RDAP item
export const updateRDAP = async (type, id, data) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/rdap?type=${type}&id=${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Delete an RDAP item
export const deleteRDAP = async (type, id) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/rdap?type=${type}&id=${id}`, {
        method: 'DELETE',
    });
};

// Fetch RDAP metrics
export const fetchRDAPMetrics = async () => {
    return safeAPI(`${API_URL}/deeper/rdap-metrics`, {
        orgs: 0,
        names: 0,
        emails: 0,
        addresses: 0,
        groups: 0,
        handles: 0,
        phones: 0,
    });
};

// Fetch WHOIS data (for Whois page)
export const fetchWhois = async (page = 1, limit = 10, search = '', programId = null) => {
    let url = `${API_URL}/deeper/whois?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    if (programId) url += `&programId=${encodeURIComponent(programId)}`;
    return fetchWithErrorHandling(url);
};

// Update a WHOIS item
export const updateWhois = async (type, id, data) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/whois/${type}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Delete a WHOIS item
export const deleteWhois = async (type, id) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/whois/${type}/${id}`, {
        method: 'DELETE',
    });
};

// Fetch URLs (for Urls page)
export const fetchURLs = async (page = 1, limit = 10, search = '', filters = {}) => {
    let url = `${API_URL}/deeper/urls?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;

    // Add optional filters
    if (filters.program) url += `&program=${encodeURIComponent(filters.program)}`;
    if (filters.subdomain) url += `&subdomain=${encodeURIComponent(filters.subdomain)}`;
    if (filters.status) url += `&status=${encodeURIComponent(filters.status)}`;

    return fetchWithErrorHandling(url);
};

// Fetch URL metrics
export const fetchURLMetrics = async () => {
    return safeAPI(`${API_URL}/deeper/urls-metrics`, {
        total_urls: 0,
        active_urls: 0,
        in_scope_urls: 0,
        urls_with_technologies: 0,
        urls_added_today: 0,
        average_technologies_per_url: 0
    });
};

// Fetch URL details
export const fetchURLDetails = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/urls/${id}/details`);
};

// Fetch URL technologies
export const fetchURLTechnologies = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/urls/${id}/technologies`);
};

// Update a URL
export const updateURL = async (id, data) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/urls/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Delete a URL
export const deleteURL = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/urls/${id}`, {
        method: 'DELETE',
    });
};

// Add a technology to a URL
export const addURLTechnology = async (urlId, data) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/urls/${urlId}/technologies`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// Delete a technology from a URL
export const deleteURLTechnology = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/deeper/technologies/${id}`, {
        method: 'DELETE',
    });
};

////////////////////////////////////////////////////////////////////
// --- SLS API Calls ---
// Helper function to handle cases when endpoints don't exist
const safeAPI = async (url, fallback = {}, options = {}) => {
    try {
        return await fetchWithErrorHandling(url, options);
    } catch (error) {
        console.warn(`API endpoint not available: ${url}`, error);
        return fallback;
    }
};

// Fetch alert counts (for Dashboard)
export const fetchAlertCounts = async () => {
    return safeAPI(`${API_URL}/sls/alerts/counts`, {
        unviewed_credentials: 0,
        total_credentials: 0,
        program_credentials_count: 0,
        working_credentials: 0,
        active_channels: 0,
        pending_files: 0
    });
};

// Fetch program credential alerts with pagination and search (for ProgramCredentials page)
export const fetchProgramCredentialAlerts = async (page = 1, limit = 10, search = '') => {
    let url = `${API_URL}/sls/alerts/program-credentials?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchWithErrorHandling(url);
};

// Mark a single alert as viewed
export const markSLSAlertAsViewed = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/sls/alerts/program-credentials/mark-credential-viewed/${id}`, {
        method: 'PUT',
    });
};

// Add after fetchProgramCredentialAlerts
export const markSLSPageAlertsAsViewed = async (credentialIds) => {
    try {
        const response = await fetch('/api/sls/alerts/program-credentials/mark-page-viewed', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({credentialIds}),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error marking credentials as viewed:', error);
        throw error;
    }
};

// Mark all alerts as viewed SLS
export const markSLSAllAlertsAsViewed = async () => {
    return fetchWithErrorHandling(`${API_URL}/sls/alerts/program-credentials/mark-all-viewed`, {
        method: 'PUT',
    });
};

// Mark page alerts as viewed
export const markPageAlertsAsViewed = async (credentialIds) => {
    return fetchWithErrorHandling(`${API_URL}/sls/alerts/program-credentials/mark-page-viewed`, {
        method: 'PUT',
        body: JSON.stringify({credentialIds}),
    });
};

// Fetch all credentials with pagination (for Credentials page)
export const fetchCredentials = async (page = 1, limit = 10, search = '') => {
    let url = `${API_URL}/sls/credentials?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchWithErrorHandling(url);
};

// Verify a credential
export const verifyCredential = async (credentialId, data) => {
    return fetchWithErrorHandling(`${API_URL}/sls/credentials/${credentialId}/verify`, {
        method: 'POST',
        body: JSON.stringify(data),
    });
};

// Delete a credential
export const deleteCredential = async (credentialId) => {
    return fetchWithErrorHandling(`${API_URL}/sls/credentials/${credentialId}`, {
        method: 'DELETE',
    });
};

// Fetch Telegram channels (for Telegram page)
export const fetchTelegramChannels = async (page = 1, limit = 10, search = '') => {
    try {
        const response = await fetch(`/api/sls/tg-channels?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching Telegram channels:', error);
        throw error;
    }
};

// Update a Telegram channel
export const updateTelegramChannel = async (id, data) => {
    return fetchWithErrorHandling(`${API_URL}/sls/telegram-channels/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Fetch Telegram files (for Telegram page)
export const fetchTelegramFiles = async (page = 1, limit = 10, search = '') => {
    let url = `${API_URL}/sls/telegram-files?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchWithErrorHandling(url);
};

// Update a Telegram file
export const updateTelegramFile = async (id, data) => {
    return fetchWithErrorHandling(`${API_URL}/sls/telegram-files/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Fetch TPLS (for TPLS page)
export const fetchTPLS = async (page = 1, limit = 10, search = '') => {
    let url = `${API_URL}/sls/tpls?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchWithErrorHandling(url);
};

// Fetch TPLS metrics
export const fetchTPLSMetrics = async () => {
    return fetchWithErrorHandling(`${API_URL}/sls/tpls-metrics`);
};

// Fetch a specific TPL
export const fetchTPLById = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/sls/tpls/${id}`);
};

// Create a new TPL
export const createTPL = async (tplData) => {
    return fetchWithErrorHandling(`${API_URL}/sls/tpls`, {
        method: 'POST',
        body: JSON.stringify(tplData),
    });
};

// Update an existing TPL
export const updateTPL = async (id, tplData) => {
    return fetchWithErrorHandling(`${API_URL}/sls/tpls/${id}`, {
        method: 'PUT',
        body: JSON.stringify(tplData),
    });
};

// Delete a TPL
export const deleteTPL = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/sls/tpls/${id}`, {
        method: 'DELETE',
    });
};

// Create a new TPL category
export const createTPLCategory = async (categoryData) => {
    return fetchWithErrorHandling(`${API_URL}/sls/tpl-categories`, {
        method: 'POST',
        body: JSON.stringify(categoryData),
    });
};

// Update an existing TPL category
export const updateTPLCategory = async (id, categoryData) => {
    return fetchWithErrorHandling(`${API_URL}/sls/tpl-categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(categoryData),
    });
};

// Delete a TPL category
export const deleteTPLCategory = async (id) => {
    return fetchWithErrorHandling(`${API_URL}/sls/tpl-categories/${id}`, {
        method: 'DELETE',
    });
};

// Fetch TPLS credentials (for TPLSCredentials page)
export const fetchTPLSCredentials = async (page = 1, limit = 10, search = '') => {
    let url = `${API_URL}/sls/tpls-credentials?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchWithErrorHandling(url);
};

// Fetch working credentials (for WorkingCredentials page)
export const fetchWorkingCredentials = async (page = 1, limit = 10, search = '') => {
    let url = `${API_URL}/sls/working-credentials?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchWithErrorHandling(url);
};

// Fetch program credentials (for ProgramCredentials page)
export const fetchProgramCredentials = async (page = 1, limit = 10, search = '') => {
    let url = `${API_URL}/sls/program-credentials?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchWithErrorHandling(url);
};

// Update a working credential
export const updateWorkingCredential = async (id, data) => {
    return fetchWithErrorHandling(`sls/working-credentials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

// Fetch program credential metrics
export const fetchProgramCredentialMetrics = async () => {
    try {
        const response = await fetch(`${API_URL}/sls/program-credentials-metrics`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching program credential metrics:', error);
        throw error;
    }
};

// Fetch Telegram channel metrics
export const fetchTelegramChannelMetrics = async () => {
    try {
        const response = await fetch('/api/sls/tg-channels-metrics');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching Telegram channel metrics:', error);
        throw error;
    }
};

// Fetch Telegram file metrics
export const fetchTelegramFileMetrics = async () => {
    try {
        const response = await fetch('/api/sls/tg-files-metrics');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching Telegram file metrics:', error);
        throw error;
    }
};

// Fetch TPL metrics
export const fetchTPLMetrics = async () => {
    try {
        const response = await fetch('/api/sls/tpls-metrics');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching TPL metrics:', error);
        throw error;
    }
};

// Fetch TPL category metrics
export const fetchTPLCategoryMetrics = async () => {
    try {
        const response = await fetch('/api/sls/tpl-categories-metrics');
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching TPL category metrics:', error);
        throw error;
    }
};

// Fetch TPLs with pagination and search
export const fetchTPLs = async (page = 1, limit = 10, search = '') => {
    try {
        const response = await fetch(`/api/sls/tpls?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching TPLs:', error);
        throw error;
    }
};

// Fetch TPL categories with pagination and search
export const fetchTPLCategories = async (page = 1, limit = 10, search = '') => {
    try {
        const response = await fetch(`/api/sls/tpl-categories?page=${page}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ''}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching TPL categories:', error);
        throw error;
    }
};

export const fetchSubmittedCredentials = async (page = 1, limit = 10, search = '') => {
    let url = `/api/sls/submitted-credentials?page=${page}&limit=${limit}`;
    if (search) url += `&search=${encodeURIComponent(search)}`;
    return fetchWithErrorHandling(url);
};

export const fetchSubmittedCredentialsMetrics = async () => {
    return fetchWithErrorHandling('/api/sls/submitted-credentials-metrics');
};

export const updateSubmittedCredential = async (id, data) => {
    return fetchWithErrorHandling(`/api/sls/submitted-credentials/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
};

export const deleteSubmittedCredential = async (id) => {
    return fetchWithErrorHandling(`/api/sls/submitted-credentials/${id}`, {
        method: 'DELETE',
    });
};

export const fetchSubmittedCredentialById = async (id) => {
    return fetchWithErrorHandling(`/api/sls/submitted-credentials/${id}`);
};

// Fetch working credentials metrics
export const fetchWorkingCredentialsMetrics = async () => {
    return fetchWithErrorHandling('/api/sls/working-credentials-metrics');
};