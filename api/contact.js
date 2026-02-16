export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        // 2. Get the Secret Key from Vercel Environment Variables
        // (See instructions below on how to set this)
        const access_key = process.env.WEB3FORMS_ACCESS_KEY;

        if (!access_key) {
            return res.status(500).json({ message: 'Server Configuration Error: Missing API Key' });
        }

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

        // 4. Return success or error to frontend
        if (response.status === 200) {
            return res.status(200).json({ message: 'Email sent successfully!' });
        } else {
            return res.status(500).json({ message: result.message || 'Failed to send email.' });
        }

    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
