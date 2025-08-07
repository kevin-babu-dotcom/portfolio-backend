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

// This is the main serverless function
module.exports = async (req, res) => {
    // Vercel's serverless environment handles CORS headers automatically.
    // We just need to respond with a 200 OK for the OPTIONS preflight request.
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only handle POST requests from here on
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    try {
        const newContact = new Contact(req.body);
        await newContact.save();
        res.status(201).json({ message: 'Success! Your message has been received.' });
    } catch (error) {
        console.error("Error saving contact info:", error);
        res.status(500).json({ error: 'Server error. Could not save your message.' });
    }
};