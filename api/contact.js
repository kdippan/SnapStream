export default async function handler(req, res) {
    // 1. Allow CORS (Optional but good for debugging)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST');

    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        // 2. Load and CLEAN the key (Remove accidental spaces/newlines)
        let access_key = process.env.WEB3FORMS_ACCESS_KEY;

        if (!access_key) {
            console.error("CRITICAL: API Key is undefined in Vercel.");
            return res.status(500).json({ message: 'Server Config Error: API Key missing.' });
        }

        // SANITIZATION: Remove whitespace/newlines
        access_key = access_key.trim();

        console.log(`Attempting to send email with Key ending in: ...${access_key.slice(-4)}`);

        // 3. Send to Web3Forms
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                access_key: access_key,
                name,
                email,
                subject,
                message,
                from_name: "SnapStream Contact Form"
            })
        });

        const result = await response.json();

        // 4. Handle Response
        if (response.status === 200) {
            console.log("Success: Email sent.");
            return res.status(200).json({ message: 'Email sent successfully!' });
        } else {
            console.error("Web3Forms API Error:", result);
            return res.status(500).json({ 
                message: result.message || 'Error sending email via Web3Forms.' 
            });
        }

    } catch (error) {
        console.error("Server Crash:", error);
        return res.status(500).json({ message: 'Internal Server Error: ' + error.message });
    }
}
