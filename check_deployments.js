async function checkDeployments() {
    try {
        console.log("Checking /api/deployments...");
        const res = await fetch('http://localhost:5000/api/deployments');

        console.log('Status:', res.status);
        if (!res.ok) {
            const txt = await res.text();
            console.log('Error Body:', txt);
            return;
        }

        const data = await res.json();
        console.log('Success:', data.success);
        console.log('Data Length:', data.data ? data.data.length : 'N/A');

        if (data.data && data.data.length > 0) {
            const first = data.data[0];
            console.log("First Deployment keys:", Object.keys(first));
            console.log("Ticket ID present?", first.ticket_id !== undefined);
            console.log("Technician present?", first.technician !== undefined);
        } else {
            console.log("No deployments found, but API call succeeded.");
        }

    } catch (error) {
        console.error('API Error:', error.message);
    }
}

checkDeployments();
