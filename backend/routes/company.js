const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const axios = require('axios');

router.get('/search', auth, async (req, res) => {
  try {
    const { name } = req.query;
    
    if (!name || name.length < 3) {
      return res.status(400).json({ message: 'Company name must be at least 3 characters long' });
    }

    // First try to get company information using Clearbit's Autocomplete API
    const autocompleteResponse = await axios.get(
      `https://autocomplete.clearbit.com/v1/companies/suggest?query=${encodeURIComponent(name)}`,
      { timeout: 5000 }
    );

    if (autocompleteResponse.data && autocompleteResponse.data.length > 0) {
      const company = autocompleteResponse.data[0];
      
      // Get a higher resolution logo using Clearbit's Logo API
      const logoUrl = `https://logo.clearbit.com/${company.domain}`;
      
      return res.json({
        name: company.name,
        logo: logoUrl,
        domain: company.domain,
        found: true
      });
    }

    // Return a specific status for when company isn't found
    return res.json({
      name: name,
      found: false,
      message: "We're having a hard time finding your company's social presence - you can still conduct the test but it may fail."
    });

  } catch (error) {
    console.error('Company search error:', error);
    // Return the same format for errors
    return res.json({
      name: name,
      found: false,
      message: "We're having a hard time finding your company's social presence - you can still conduct the test but it may fail."
    });
  }
});

// Person search endpoint
router.get('/person', auth, async (req, res) => {
  try {
    const { email, name } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Try to get person's avatar using Clearbit's Person API
    const avatarUrl = `https://person.clearbit.com/v2/combined/find?email=${encodeURIComponent(email)}`;
    
    try {
      const personResponse = await axios.get(avatarUrl, {
        timeout: 5000,
        headers: {
          'Authorization': `Bearer ${process.env.CLEARBIT_KEY}`
        }
      });

      if (personResponse.data && personResponse.data.person) {
        const person = personResponse.data.person;
        // If name was provided, check if it matches (case-insensitive)
        const nameMatches = !name || 
          person.name.fullName.toLowerCase().includes(name.toLowerCase());

        return res.json({
          found: true,
          nameMatches,
          name: person.name.fullName,
          avatar: person.avatar,
          bio: person.bio,
          location: person.location,
          employment: person.employment
        });
      }
    } catch (error) {
      // If Clearbit fails, fallback to Gravatar
      const hash = require('crypto')
        .createHash('md5')
        .update(email.toLowerCase().trim())
        .digest('hex');
      const gravatarUrl = `https://www.gravatar.com/avatar/${hash}?d=404&s=200`;

      return res.json({
        found: true,
        name: null,
        avatar: gravatarUrl
      });
    }

    return res.json({
      found: false,
      message: "Couldn't find additional information for this person"
    });

  } catch (error) {
    console.error('Person search error:', error);
    return res.json({
      found: false,
      message: "Couldn't find additional information for this person"
    });
  }
});

module.exports = router; 