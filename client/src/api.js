const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5001/api";
    
async function request(endpoint, options = {}) {
    const token = localStorage.getItem("ecoloop_token");

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token
                ? {
                    Authorization: `Bearer ${token}`
                }
                : {}),
            ...(options.headers || {})
        }
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message || "Something went wrong"
        );
    }

    return data;
}

export const api = {
    register: (data) =>
        request("/auth/register", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    login: (data) =>
        request("/auth/login", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    listings: () =>
        request("/listings"),

    myListings: () =>
        request("/listings/mine"),

    createListing: (data) =>
        request("/listings", {
            method: "POST",
            body: JSON.stringify(data)
        }),

    requests: () =>
        request("/requests"),

    createRequest: (listingId) =>
        request("/requests", {
            method: "POST",
            body: JSON.stringify({
                listingId
            })
        }),

    respondRequest: (requestId, action) =>
        request(`/requests/${requestId}`, {
            method: "PATCH",
            body: JSON.stringify({
                action
            })
        }),

        impact: () =>
    request("/impact"),

leaderboard: () =>
    request("/leaderboard"),

    // CHAT
    conversations: () =>
        request("/messages/conversations"),

    messages: (listingId, userId) =>
        request(`/messages/${listingId}/${userId}`),

    sendMessage: (data) =>
        request("/messages", {
            method: "POST",
            body: JSON.stringify(data)
        })
};