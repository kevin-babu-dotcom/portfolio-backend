const mongoose = require('mongoose');

// This connects to the database.
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI);
}

const contactSchema = new mongoose.Schema({
    email: { type: String, required: true },
    message: { type: String, required: true },
    selectedDate: { type: Date },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
}, { timestamps: true });

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

module.exports = async (req, res) => {
    // --- THIS IS THE FIX ---
    // Manually set the CORS headers to grant permission
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://kevinbabudotcom.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');
    // --- END OF FIX ---

    // The browser sends an OPTIONS request first, we just need to send back a 200 OK
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    const { email, message } = req.body;
    if (!email || !message) {
        return res.status(400).json({ error: 'Email and message are required fields.' });
    }

    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        return res.status(201).json({ message: 'Success! Your message has been received.' });

    } catch (error) {
        console.error("--- ERROR SAVING TO DATABASE ---", error);
        return res.status(500).json({
            error: 'Server error while saving data.',
            details: error.message 
        });
    }
};