const localtunnel = require('localtunnel');

async function startTunnel(port, name) {
    let tunnel;
    while (true) {
        try {
            console.log(`Starting tunnel for ${name} on port ${port}...`);
            tunnel = await localtunnel({ port });
            console.log(`${name} URL: ${tunnel.url}`);
            
            tunnel.on('close', () => {
                console.log(`${name} tunnel closed. Reconnecting...`);
            });
            
            tunnel.on('error', (err) => {
                console.error(`${name} tunnel error:`, err);
            });
            
            // Wait for it to close or error before retrying
            await new Promise((resolve) => {
                tunnel.on('close', resolve);
                tunnel.on('error', resolve);
            });
        } catch (error) {
            console.error(`Error starting tunnel for ${name}:`, error.message);
        }
        // Wait 5 seconds before retrying
        await new Promise((resolve) => setTimeout(resolve, 5000));
    }
}

(async () => {
    // Start backend tunnel
    startTunnel(5000, "Backend API");
    // Start frontend tunnel
    startTunnel(3000, "Frontend UI");
})();
