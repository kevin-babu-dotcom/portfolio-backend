console.log("--- API file (contact.js) loaded by Vercel ---");


const mongoose = require('mongoose');

// This connects to the database. It's placed outside the handler
// to be reused across function invocations.
console.log("Vercel is using this MONGO_URI:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI);

// This defines the structure of the data you want to save.
// It must match the data your frontend sends.
const contactSchema = new mongoose.Schema({
    email: { type: String, required: true },
    message: { type: String, required: true },
    selectedDate: { type: Date },
    location: {
        lat: { type: Number },
        lng: { type: Number }
    },
}, { timestamps: true }); // Automatically adds createdAt and updatedAt

// This creates a "Model" which is your main tool for interacting with the collection.
// The conditional check prevents re-defining the model in Vercel's environment.
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// This is the main serverless function Vercel will run.
module.exports = async (req, res) => {
    // We only want this endpoint to accept POST requests
        console.log(`--- Request received with method: ${req.method} ---`);

    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Create a new contact document in memory from the request body
        const newContact = new Contact(req.body);

        // Save the document to the database
        await newContact.save();

        // Send a success response
        res.status(201).json({ message: 'Success! Your message has been received.' });
    } catch (error) {
        // If an error occurs, log it and send back an error response
        console.error(error);
        res.status(500).json({ error: 'Server error. Could not save your message.' });
    }
};