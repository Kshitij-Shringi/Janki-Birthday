// Placeholder for map initialization and data

let currentJourneyTimeoutId = null;
let nextJourneyStepFunction = null;

// Global gallery variables
let galleryImages = [];
let currentImageIndex = 0;
let galleryImagesContainer = null;
let galleryLocationName = null;

// Ensure specialButton is globally accessible
let specialButton = null;
let videoModal = null;
let videoElement = null;

// Add GSAP import at the top of the file
document.addEventListener('DOMContentLoaded', function() {
    console.log("Janki's World website script loaded.");

    // Trigger confetti on page load!
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 150,
            spread: 100,
            origin: { y: 0.6 }
        });
    }

    // Initialize the map and set its view to a good overview of India
    const map = L.map('map').setView([22.5937, 78.9629], 5);

    // Add a tile layer to the map (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Define a custom icon for Vadodara (Crocodile)
    const crocodileIcon = L.icon({
        iconUrl: 'images/crocodile-marker.png', // Make sure you have this image in your /images folder
        iconSize: [38, 38], // Size of the icon (adjust as needed)
        iconAnchor: [19, 38], // Point of the icon which will correspond to marker's location
        popupAnchor: [0, -38] // Point from which the popup should open relative to the iconAnchor
    });

    const locations = [
        {
            name: "Himmatnagar, Gujarat (Utsav Prime Complex, Mahaveer Nagar)",
            coords: [23.5960, 72.9783],
            message: "Himmatnagar - Where the wonderful story of Janki began! So much growth and learning happened here.",
            image_gallery: ['images/himmatnagar1.jpg', 'images/himmatnagar2.jpg', 'images/himmatnagar3.jpg', 'images/himmatnagar4.jpg'] // Placeholder for images
        },
        {
            name: "Ahmedabad, Gujarat (H.L. College of Commerce)",
            coords: [23.0380, 72.5556],
            message: "Ahmedabad - Stepping out for new horizons and laying the foundation for a bright future. Go Janki!",
            image_gallery: []
        },
        {
            name: "Vadodara, Gujarat (Alembic City Area)",
            coords: [22.3245, 73.1689],
            message: "Vadodara - A chapter of exploration, experiences, and tasty Mahakali Sev Usal!",
            customIcon: crocodileIcon,
            image_gallery: []
        },
        {
            name: "Ahmedabad, Gujarat (SG Highway/Sindhu Bhavan Rd Area)",
            coords: [23.0500, 72.5000],
            message: "Ahmedabad (Round 2!) - Where dedication met destiny (and me!). So proud of your hard work and the start of your career journey.",
            image_gallery: []
        },
        {
            name: "Chandigarh (Sector 11A)",
            coords: [30.7420, 76.7700],
            message: "Chandigarh - Making new memories with family. Thinking of you always!",
            image_gallery: []
        },
        {
            name: "Mumbai, Maharashtra (Secret Trip!)",
            coords: [19.0760, 72.8777], // Approximate coordinates for Mumbai
            message: "Mumbai - Our unforgettable secret adventure! Shhh... 😉",
            isSecret: true,
            image_gallery: []
        }
    ];

    // Modal elements
    const galleryModal = document.getElementById('imageGalleryModal');
    const closeButton = document.querySelector('.modal .close-button');
    const galleryImagesContainer = document.getElementById('galleryImagesContainer');
    const galleryLocationName = document.getElementById('galleryLocationName');

    // Check all required DOM elements
    if (!galleryModal || !closeButton || !galleryImagesContainer || !galleryLocationName) {
        console.error('One or more required DOM elements for the gallery are missing.');
        return;
    }

    // Video modal open/close functions
    function openVideoModal() {
        if (videoModal) {
            videoModal.style.display = 'flex';
            // Use GSAP to animate the modal opening
            gsap.fromTo(videoModal, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(videoModal.querySelector('.modal-content'), { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" });
            gsap.fromTo(videoElement, { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, delay: 0.2 });
        }
    }
    function closeVideoModal() {
        if (videoModal) {
            // Use GSAP to animate the modal closing
            gsap.to(videoModal.querySelector('.modal-content'), { scale: 0.8, opacity: 0, duration: 0.3, ease: "back.in(1.7)" });
            gsap.to(videoModal, { opacity: 0, duration: 0.3, onComplete: () => {
                videoModal.style.display = 'none';
                if (videoElement) videoElement.pause();
            }});
        }
    }

    // Enhanced Gallery functionality
    function openImageGallery(locationName, images) {
        document.body.classList.add('modal-open');
        
        if (currentJourneyTimeoutId) {
            clearTimeout(currentJourneyTimeoutId);
            currentJourneyTimeoutId = null;
        }

        if (!galleryModal || !galleryImagesContainer || !galleryLocationName) {
            console.error('Modal elements not found!');
            return;
        }

        galleryLocationName.textContent = `Photos from: ${locationName}`;
        galleryImagesContainer.innerHTML = '';
        galleryImages = images || [];
        currentImageIndex = 0;

        // Animate gallery modal opening
        gsap.fromTo(galleryModal, 
            { opacity: 0 },
            { opacity: 1, duration: 0.3 }
        );

        gsap.fromTo(galleryModal.querySelector('.modal-content'),
            { scale: 0.9, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.7)" }
        );

        if (galleryImages.length > 0) {
            // Create thumbnails
            const thumbnailsContainer = document.getElementById('galleryThumbnails');
            thumbnailsContainer.innerHTML = '';
            galleryImages.forEach((imgPath, index) => {
                const thumbnail = document.createElement('img');
                thumbnail.src = imgPath;
                thumbnail.className = 'thumbnail' + (index === 0 ? ' active' : '');
                thumbnail.alt = `Thumbnail ${index + 1}`;
                
                // Add both click and touch events for thumbnails
                const showImageHandler = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    showImage(index);
                };
                
                thumbnail.addEventListener('click', showImageHandler);
                thumbnail.addEventListener('touchend', showImageHandler);
                
                thumbnailsContainer.appendChild(thumbnail);
            });

            // Show first image
            showImage(0);
        } else {
            galleryImagesContainer.innerHTML = '<p>No images available for this location yet.</p>';
            document.getElementById('galleryThumbnails').innerHTML = '';
        }

        galleryModal.style.display = 'flex';
        setTimeout(() => {
            galleryModal.classList.add('show');
        }, 10);
    }

    function closeImageGallery() {
        // Animate gallery modal closing
        gsap.to(galleryModal.querySelector('.modal-content'), {
            scale: 0.9,
            opacity: 0,
            duration: 0.3,
            ease: "back.in(1.7)"
        });

        gsap.to(galleryModal, {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                document.body.classList.remove('modal-open');
                galleryModal.style.display = 'none';
                if (typeof nextJourneyStepFunction === 'function') {
                    console.log("Journey resumed.");
                    nextJourneyStepFunction();
                    nextJourneyStepFunction = null;
                } else {
                    console.log("No pending journey step to resume or journey completed.");
                }
            }
        });
    }

    if (closeButton) {
        closeButton.addEventListener('click', closeImageGallery);
    }
    // Also close modal if user clicks outside the modal content
    window.addEventListener('click', function(event) {
        if (event.target === galleryModal) {
            closeImageGallery();
        }
    });

    function handleViewPhotosClick(locationName, locIndex) {
        console.log(`DEBUG: handleViewPhotosClick called for ${locationName}, index: ${locIndex}`);
        const locationData = locations[locIndex];
        if (locationData && locationData.image_gallery) {
            openImageGallery(locationData.name, locationData.image_gallery);
        } else {
            console.log(`No image gallery data found for: ${locationData ? locationData.name : 'unknown location'}`);
        }
    }

    // Video Modal functionality
    specialButton = document.getElementById('specialButton');
    videoModal = document.getElementById('videoModal');
    videoElement = document.getElementById('birthdayVideo');

    // Attach event listener to special button
    if (specialButton) {
        const btn = specialButton.querySelector('button');
        if (btn) {
            btn.addEventListener('click', openVideoModal);
            btn.addEventListener('touchend', openVideoModal);
        }
    }

    // Video modal close logic
    if (videoModal) {
        const closeBtn = videoModal.querySelector('.close-button');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeVideoModal);
            closeBtn.addEventListener('touchend', closeVideoModal);
        }
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) closeVideoModal();
        });
    }

    // Function to add markers sequentially for the journey animation
    function showJourney(locationsToShow, index = 0) {
        if (index >= locationsToShow.length) {
            console.log("Journey complete!");
            nextJourneyStepFunction = null;
            currentJourneyTimeoutId = null;
            setTimeout(showSpecialButton, 1000);
            return;
        }
        const location = locationsToShow[index];
        const originalLocationIndex = locations.findIndex(loc => loc.name === location.name);

        map.flyTo(location.coords, 7, { animate: true, duration: 2 });
        setTimeout(() => {
            let markerOptions = {};
            if (location.customIcon) {
                markerOptions.icon = location.customIcon;
            }
            const marker = L.marker(location.coords, markerOptions).addTo(map);
            let popupContent = `<b>${location.name}</b><br>${location.message}`;
            
            if (location.image_gallery && location.image_gallery.length > 0) {
                const buttonId = `viewPhotosBtn_${originalLocationIndex}`;
                popupContent += `<br><button id="${buttonId}" class="view-photos-button">View Photos</button>`;
            }
            
            bindPopup(marker, popupContent);
            marker.openPopup();

            // Enhanced button handling for mobile
            if (location.image_gallery && location.image_gallery.length > 0) {
                const buttonId = `viewPhotosBtn_${originalLocationIndex}`;
                setTimeout(() => {
                    const btn = document.getElementById(buttonId);
                    if (btn) {
                        // Remove any existing event listeners
                        const newBtn = btn.cloneNode(true);
                        btn.parentNode.replaceChild(newBtn, btn);
                        
                        // Add both click and touch events
                        newBtn.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleViewPhotosClick(location.name, originalLocationIndex);
                        });
                        
                        newBtn.addEventListener('touchend', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleViewPhotosClick(location.name, originalLocationIndex);
                        });
                    }
                }, 100);
            }

            // Prepare the next step
            nextJourneyStepFunction = () => showJourney(locationsToShow, index + 1);
            currentJourneyTimeoutId = setTimeout(nextJourneyStepFunction, 3000);
        }, 2000);
    }

    // Filter out secret locations for the initial journey
    const visibleLocations = locations.filter(loc => !loc.isSecret);
    
    // Start the journey animation
    if (visibleLocations.length > 0) {
        // Add a little delay before starting the journey to ensure map is fully ready
        setTimeout(() => {
            showJourney(visibleLocations);
        }, 1000);
    } else {
        console.log("No visible locations to display for the journey.");
    }

    console.log("Leaflet map initialized. Journey animation will start shortly. Confetti launched.");

    // Set up gallery navigation event listeners after DOM is ready
    const prevBtn = document.getElementById('prevImageButton');
    const nextBtn = document.getElementById('nextImageButton');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => showImage(currentImageIndex - 1));
        prevBtn.addEventListener('touchend', () => showImage(currentImageIndex - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => showImage(currentImageIndex + 1));
        nextBtn.addEventListener('touchend', () => showImage(currentImageIndex + 1));
    }

    // Enhanced marker animation
    function createMarker(lat, lng, title, description, images) {
        const marker = L.marker([lat, lng]).addTo(map);
        
        marker.on('click', () => {
            // Animate marker on click
            gsap.to(marker.getElement(), {
                scale: 1.2,
                duration: 0.2,
                yoyo: true,
                repeat: 1
            });
        });

        return marker;
    }

    // Enhanced popup animation
    function bindPopup(marker, content) {
        marker.bindPopup(content);
        // Remove GSAP animation for popups to avoid visibility issues
        // marker.on('popupopen', () => {
        //     const popup = marker.getPopup();
        //     gsap.from(popup.getElement(), {
        //         scale: 0.8,
        //         opacity: 0,
        //         duration: 0.3,
        //         ease: "back.out(1.7)"
        //     });
        // });
    }

    // Enhanced special button animation
    function showSpecialButton() {
        if (specialButton) {
            specialButton.style.display = 'block';
            gsap.fromTo(specialButton,
                { y: 50, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.7)" }
            );
        }
    }

    // Enhanced image transitions
    function showImage(index) {
        if (!galleryImages || galleryImages.length === 0) return;
        if (index < 0) index = galleryImages.length - 1;
        if (index >= galleryImages.length) index = 0;
        currentImageIndex = index;

        const mainImage = document.createElement('img');
        mainImage.src = galleryImages[index];
        mainImage.alt = `Photo ${index + 1}`;
        
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'image-loading';
        galleryImagesContainer.innerHTML = '';
        galleryImagesContainer.appendChild(loadingDiv);

        mainImage.onload = () => {
            galleryImagesContainer.innerHTML = '';
            galleryImagesContainer.appendChild(mainImage);
            
            // Animate new image
            gsap.fromTo(mainImage,
                { scale: 0.95, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" }
            );
        };

        // Animate thumbnails
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, i) => {
            gsap.to(thumb, {
                scale: i === index ? 1.1 : 1,
                duration: 0.3,
                ease: "power2.out"
            });
            thumb.classList.toggle('active', i === index);
        });

        // Animate caption
        const caption = document.getElementById('galleryCaption');
        if (caption) {
            gsap.fromTo(caption,
                { y: 10, opacity: 0 },
                { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
            );
            caption.textContent = `Photo ${index + 1} of ${galleryImages.length}`;
        }
    }
}); 