const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

    try {
        const { type, name, business, phone, email, interest, notes, cart } = req.body;

        // Basic Validation
        if (!name || !phone || !email) {
            return res.status(400).json({ success: false, error: 'Name, Phone, and Email are required.' });
        }

        // Initialize Supabase Client using environment variables
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Missing Supabase configurations in environment variables.');
            return res.status(500).json({ success: false, error: 'Database configuration missing.' });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Map data to database schema
        const insertData = {
            type: type || 'contact',
            name: name,
            business_name: business || null,
            phone: phone,
            email: email,
            product_interest: interest || null,
            notes: notes || null,
            cart_items: cart || null // Supabase client handles JSONB objects/arrays directly!
        };

        // Insert into table
        const { data, error } = await supabase
            .from('submissions')
            .insert([insertData])
            .select();

        if (error) {
            throw error;
        }

        return res.status(200).json({ success: true, data });
    } catch (error) {
        console.error('Lead Submission Error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
    }
};
