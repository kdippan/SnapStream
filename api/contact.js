export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        // 1. Clean the Key
        let access_key = process.env.WEB3FORMS_ACCESS_KEY;
        if (!access_key) return res.status(500).json({ message: 'API Key missing.' });
        access_key = access_key.replace(/[\r\n\s]+/g, '');

        console.log("Sending to Web3Forms...");

        // 2. Send Request
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
                from_name: "SnapStream Contact"
            })
        });

        // 3. Get the Raw Text (Do not parse as JSON yet)
        const text = await response.text();

        // 4. Check if it failed
        if (!response.ok) {
            console.error("Web3Forms API Error:", text);
            // Return the HTML error text to the frontend so you can see it
            return res.status(response.status).json({ 
                message: `Web3Forms Error: ${text.substring(0, 150)}...` 
            });
        }

        // 5. If success, try to parse
        try {
            const data = JSON.parse(text);
            return res.status(200).json({ message: 'Email sent successfully!' });
        } catch (e) {
            return res.status(500).json({ message: 'Received invalid JSON from Web3Forms.' });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: error.message });
    }
}
