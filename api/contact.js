export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }
    try {
        const { name, email, subject, message } = req.body;
        const form_id = process.env.FORMSPREE_FORM_ID;
        if (!form_id) {
            return res.status(500).json({ message: 'Server Config Error: Form ID missing.' });
        }
        const response = await fetch(`https://formspree.io/f/${form_id}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ name, email, subject, message })
        });
        const data = await response.json();
        if (response.ok) {
            return res.status(200).json({ message: 'Message sent successfully!' });
        } else {
            const errorMessage = data.error || (data.errors ? data.errors.map(e => e.message).join(', ') : 'Failed to send message.');
            return res.status(500).json({ message: errorMessage });
        }
    } catch (error) {
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
