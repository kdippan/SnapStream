export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;
        let access_key = process.env.WEB3FORMS_ACCESS_KEY;

        if (!access_key) {
            return res.status(500).json({ message: 'Server Config Error: API Key missing.' });
        }

        // Clean the key
        access_key = access_key.replace(/[\r\n\s]+/g, '');

        // THE FIX: Add "Human" Headers to bypass Cloudflare
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Fake a browser User-Agent to bypass bot protection
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Origin': 'https://snapstream.dippanbhusal.tech',
                'Referer': 'https://snapstream.dippanbhusal.tech/contact'
            },
            body: JSON.stringify({
                access_key: access_key,
                name,
                email,
                subject,
                message,
                from_name: "SnapStream Contact Form",
                botcheck: false // Explicitly disable botcheck field
            })
        });

        const text = await response.text();
        
        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("Web3Forms Challenge Error:", text);
            // If it's still blocking, we tell the user
            if (text.includes("Just a moment") || text.includes("Cloudflare")) {
                return res.status(403).json({ message: "Security Block: Cloudflare rejected the request. Please try again later." });
            }
            return res.status(500).json({ message: `Gateway Error: ${text.substring(0, 50)}...` });
        }

        if (response.ok && data.success) {
            return res.status(200).json({ message: 'Email sent successfully!' });
        } else {
            return res.status(400).json({ message: data.message || 'Failed to send email.' });
        }

    } catch (error) {
        console.error("Internal Error:", error);
        return res.status(500).json({ message: error.message });
    }
}
