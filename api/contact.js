export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        // 1. Get the Key
        let access_key = process.env.WEB3FORMS_ACCESS_KEY;

        if (!access_key) {
            console.error("CRITICAL: API Key is undefined in Vercel.");
            return res.status(500).json({ message: 'Server Config Error: API Key missing.' });
        }

        // 2. THE FIX: Aggressively remove ALL newlines/spaces (Start, Middle, End)
        access_key = access_key.replace(/[\r\n\s]+/g, '');

        // Log this to confirm you are running the NEW code
        console.log(`[NEW CODE RUNNING] Key cleaned. Ends in: ...${access_key.slice(-4)}`);

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

        // 4. Handle Response Safely (Handle HTML Errors)
        const text = await response.text(); // Get raw text first
        let result;

        try {
            result = JSON.parse(text); // Try to parse as JSON
        } catch (e) {
            console.error("Web3Forms returned HTML Error:", text);
            throw new Error("Web3Forms Service Error (Check logs)");
        }

        if (response.status === 200) {
            return res.status(200).json({ message: 'Email sent successfully!' });
        } else {
            console.error("Web3Forms API Error:", result);
            return res.status(500).json({ 
                message: result.message || 'Error sending email.' 
            });
        }

    } catch (error) {
        console.error("Server Crash:", error);
        return res.status(500).json({ message: error.message });
    }
}
