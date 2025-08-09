import { Resend } from 'resend';
import mongoose from 'mongoose';

// Initialize Resend with your API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

// Connect to the database
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

export default async (req, res) => {
    // Set CORS Headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', 'https://kevinbabudotcom.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }
  
    const { email, message, selectedDate, location } = req.body;
    if (!email || !message) {
        return res.status(400).json({ error: 'Email and message are required fields.' });
    }

    try {
        // First, save the data to the database
        const newContact = new Contact({ email, message, selectedDate, location });
        await newContact.save();
        
        // --- THIS IS THE NEW PART ---
        // Second, send the email notification
        await resend.emails.send({
            from: 'onboarding@resend.dev', // This is a special address for testing
            to: 'kevinbabu9@gmail.com', // Your email address where you'll get notifications
            subject: 'New Contact Form Submission from Your Portfolio!',
            html: `
                <h1>New Message Received</h1>
                <p><strong>From:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message}</p>
                <p><strong>Selected Date:</strong> ${selectedDate || 'Not provided'}</p>
                <p><strong>Location:</strong> ${location ? `${location.lat}, ${location.lng}` : 'Not provided'}</p>
            `
        });
        // --- END OF NEW PART ---

        return res.status(201).json({ message: 'Success! Your message has been received.' });

    } catch (error) {
        console.error("--- ERROR ---", error);
        return res.status(500).json({
            error: 'Server error.',
            details: error.message 
        });
    }
};