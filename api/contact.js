export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        // 2. Get the Key securely from Vercel
        let access_key = process.env.WEB3FORMS_ACCESS_KEY;

        if (!access_key) {
            console.error("CRITICAL: API Key is missing in Vercel Settings.");
            return res.status(500).json({ message: 'Server Config Error: API Key missing.' });
        }

        // 3. SANITIZE THE KEY (Fixes the newline/space issue)
        // This removes ALL spaces, newlines, and tabs from the key
        access_key = access_key.replace(/[\r\n\s]+/g, '');

        // 4. Send Data to Web3Forms
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

        // 5. CRITICAL FIX: Read raw text first (Prevents crashing on HTML errors)
        const text = await response.text();

        // 6. Parse JSON Safely
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Web3Forms returned HTML Error:", text);
            // If Web3Forms returns HTML (like a 404 page), show the first 100 chars
            // This helps you see if the key is invalid or the service is down
            return res.status(500).json({ 
                message: `Gateway Error: ${text.substring(0, 100)}...` 
            });
        }

        // 7. Handle Success/Error from Web3Forms
        if (response.ok && data.success) {
            return res.status(200).json({ message: 'Email sent successfully!' });
        } else {
            console.error("Web3Forms API Error:", data);
            return res.status(400).json({ 
                message: data.message || 'Failed to send email. Check your inputs.' 
            });
        }

    } catch (error) {
        console.error("Internal Server Error:", error);
        return res.status(500).json({ message: error.message });
    }
}
