export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        // 2. Get and Clean the Key
        let access_key = process.env.WEB3FORMS_ACCESS_KEY;

        if (!access_key) {
            console.error("CRITICAL: API Key is missing in Vercel.");
            return res.status(500).json({ message: 'Server Config Error: API Key missing.' });
        }

        // Remove any accidental newlines or spaces
        access_key = access_key.replace(/[\r\n\s]+/g, '');

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

        // 4. CRITICAL FIX: Read raw text first (Prevents crashing on HTML errors)
        const text = await response.text();

        // 5. Try to parse as JSON
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Web3Forms returned NON-JSON response:", text);
            // Return the raw error text so we can see what's wrong
            return res.status(500).json({ 
                message: `Gateway Error: ${text.substring(0, 100)}...` 
            });
        }

        // 6. Handle JSON Response
        if (response.ok && data.success) {
            return res.status(200).json({ message: 'Email sent successfully!' });
        } else {
            console.error("Web3Forms API Error:", data);
            return res.status(400).json({ 
                message: data.message || 'Failed to send email.' 
            });
        }

    } catch (error) {
        console.error("Server Internal Error:", error);
        return res.status(500).json({ message: error.message });
    }
}
