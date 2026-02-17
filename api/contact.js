export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { name, email, subject, message } = req.body;

        // 2. Get the Form ID from Vercel Environment Variables
        const form_id = process.env.FORMSPREE_FORM_ID;

        if (!form_id) {
            console.error("CRITICAL: FORMSPREE_FORM_ID is missing.");
            return res.status(500).json({ message: 'Server Config Error: Form ID missing.' });
        }

        // 3. Send to Formspree
        // We construct the URL dynamically using the hidden ID
        const response = await fetch(`https://formspree.io/f/${form_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json' // Important: Asks Formspree for JSON response
            },
            body: JSON.stringify({
                name,
                email,
                subject,
                message
            })
        });

        const data = await response.json();

        // 4. Handle Success/Error
        if (response.ok) {
            return res.status(200).json({ message: 'Message sent successfully!' });
        } else {
            console.error("Formspree Error:", data);
            // Formspree usually returns { error: "..." } or { errors: [] }
            const errorMessage = data.error || (data.errors ? data.errors.map(e => e.message).join(', ') : 'Failed to send message.');
            return res.status(500).json({ message: errorMessage });
        }

    } catch (error) {
        console.error("Server Error:", error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
