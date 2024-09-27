import React, { useState, useEffect } from 'react';
import './Offers.css';
import { supabase } from '../../supabaseClient'; // Import your Supabase client

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [images, setImages] = useState({}); // To store uploaded images per offer
  const [userId, setUserId] = useState(null); // State to hold the current user ID

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user:', error);
        return;
      }
      setUserId(user?.id || null);
    };

    fetchUser();
  }, []);

  // Fetch data from the Supabase 'user_offer' table
  useEffect(() => {
    const fetchOffers = async () => {
      const { data, error } = await supabase
        .from('user_offer') // Change the table name here
        .select('id, title, description, points, link'); // Fetch id, title, and description from user_offer table
      if (error) {
        console.error('Error fetching offers:', error);
      } else {
        setOffers(data || []); // Set offers if data exists
      }
    };

    fetchOffers();
  }, []);

  // Handle image upload for each offer
  const handleImageChange = (offerId, e) => {
    const file = e.target.files[0];
    if (file) {
      setImages((prevImages) => ({
        ...prevImages,
        [offerId]: file, // Store the file based on the offer's ID
      }));
    }
  };

  // Handle the submission of the image and offer details
  const handleSendScreenshot = async (offerId) => {
    const imageFile = images[offerId];
    if (!imageFile) {
        alert('Please select an image before submitting.');
        return;
    }

    // Check file type and size
    const validTypes = ['image/png', 'image/jpeg', 'image/gif'];
    if (!validTypes.includes(imageFile.type)) {
        alert('Invalid file type. Please upload a PNG, JPEG, or GIF.');
        return;
    }

    const maxSize = 2 * 1024 * 1024; // 2 MB
    if (imageFile.size > maxSize) {
        alert('File size exceeds the maximum limit of 2 MB.');
        return;
    }

    // Define the file path for the uploaded image
    const filePath = `screenshots/${offerId}-${imageFile.name}`;

    // Upload the image to Supabase storage in the 'screenshots' bucket
    const { error: uploadError } = await supabase.storage
        .from('screenshots') // Ensure this is the correct bucket name
        .upload(filePath, imageFile);

    if (uploadError) {
        console.error('Error uploading screenshot:', uploadError.message);
        alert('Error uploading screenshot. Please try again.');
        return;
    }

    // Get the public URL of the uploaded image
    const { publicURL, error: urlError } = supabase.storage
        .from('screenshots')
        .getPublicUrl(filePath);

    if (urlError) {
        console.error('Error getting public URL:', urlError.message);
        return;
    }

    // Insert the new offer details into the 'offers' table
    const { error: insertError } = await supabase
        .from('offers') // Ensure this is the correct table name
        .insert([
            {
                user_id: userId, // The current user's ID
                image: publicURL, // The public URL of the uploaded image
                title: offers.find(offer => offer.id === offerId)?.title,
                description: offers.find(offer => offer.id === offerId)?.description,
                points: offers.find(offer => offer.id === offerId)?.points,
                link: offers.find(offer => offer.id === offerId)?.link,
            }
        ]);

    if (insertError) {
        console.error('Error inserting offer:', insertError.message);
        alert('Error submitting offer. Please try again.');
    } else {
        alert('Offer submitted successfully!');
    }
};


  return (
    <div>
      <div className="banner">
        <div className="banner-content">
          <p>
            📢 If you encounter any inappropriate advertisements, please report them immediately. 📢 Review our Terms of Use for more information. 📢 We strictly prohibit erotic and gambling advertisements.
          </p>
        </div>
      </div>
      <div className="banner">
        <div className="banner-arabic">
          <p style={{ fontSize: '1em' }}>
            📢 إذا صادفت أي إعلانات غير لائقة، يرجى الإبلاغ عنها فورًا. 📢 راجع شروط الاستخدام الخاصة بنا لمزيد من المعلومات. 📢 نحن نحظر بشدة الإعلانات الإباحية وإعلانات المقامرة.
          </p>
        </div>
      </div>
      <br />
      <br />
      <div className="container-offers">
        <div className="offers-container">
          <h1>
            Available Offers ({offers.length}) {/* Display the counter here */}
          </h1>
          {/* Ad banner container */}
          <div className="card-container">
            {offers.length > 0 ? (
              offers
                .sort((a, b) => b.points - a.points)
                .map((offer) => (
                  <div key={offer.id} className="card">
                    <h2>{offer.title}</h2>
                    <h3>Points: {offer.points}</h3>
                    <ul className="offer-description">
                      {offer.description.split('\n').map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(offer.id, e)}
                    />
                    <a href={offer.link}>
                      <button>
                        Go to Profile
                      </button>
                    </a>
                    <button onClick={() => handleSendScreenshot(offer.id)}>
                      Submit Screenshot
                    </button>
                  </div>
                ))
            ) : (
              <p>No offers available at the moment.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Offers;
