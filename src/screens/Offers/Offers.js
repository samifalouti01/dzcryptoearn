import React, { useState, useEffect } from 'react';
import './Offers.css';
import { supabase } from '../../supabaseClient'; // Import your Supabase client

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [images, setImages] = useState({}); // To store uploaded images per offer

  // Fetch data from the Supabase 'user_offers' table
  useEffect(() => {
    const fetchOffers = async () => {
      const { data, error } = await supabase
        .from('user_offer') // Change the table name here
        .select('id, title, description, points'); // Fetch id, title, and description from user_offer table
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

  // Handle the submission of the screenshot
  const handleSendScreenshot = async (offerId) => {
    const imageFile = images[offerId];
    if (!imageFile) {
      alert('Please select an image before submitting.');
      return;
    }

    // Upload the image to Supabase storage
    const filePath = `screenshots/${offerId}-${imageFile.name}`;
    const { data, error } = await supabase.storage
      .from('screenshots')
      .upload(filePath, imageFile);

    if (error) {
      console.error('Error uploading screenshot:', error.message);
      alert('Error uploading screenshot. Please try again.');
    } else {
      alert('Screenshot uploaded successfully!');
      console.log('Uploaded image data:', data);
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
            offers.map((offer) => (
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
