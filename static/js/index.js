window.HELP_IMPROVE_VIDEOJS = false;

var INTERP_BASE = "./static/interpolation/stacked";
var NUM_INTERP_FRAMES = 240;

var interp_images = [];
function preloadInterpolationImages() {
  for (var i = 0; i < NUM_INTERP_FRAMES; i++) {
    var path = INTERP_BASE + '/' + String(i).padStart(6, '0') + '.jpg';
    interp_images[i] = new Image();
    interp_images[i].src = path;
  }
}

function setInterpolationImage(i) {
  var image = interp_images[i];
  image.ondragstart = function() { return false; };
  image.oncontextmenu = function() { return false; };
  $('#interpolation-image-wrapper').empty().append(image);
}


$(document).ready(function() {
    // Check for click events on the navbar burger icon
    $(".navbar-burger").click(function() {
      // Toggle the "is-active" class on both the "navbar-burger" and the "navbar-menu"
      $(".navbar-burger").toggleClass("is-active");
      $(".navbar-menu").toggleClass("is-active");
    });

    // Video carousel configuration - optimized for embedding
    var videoCarouselOptions = {
      slidesToScroll: 1,
      slidesToShow: 1,  // Show only one video at a time for better embedding
      loop: true,
      infinite: true,
      autoplay: false,
      autoplaySpeed: 5000,
      pagination: true,
      navPosition: 'bottom',
      navigationKeys: true,
      center: true
    };

    // Initialize video showcase carousel specifically
    var videoShowcaseCarousel = bulmaCarousel.attach('#video-showcase-carousel', videoCarouselOptions);
    
    // For other carousels in the page (if any)
    var defaultCarouselOptions = {
      slidesToScroll: 1,
      slidesToShow: 3,
      loop: true,
      infinite: true,
      autoplay: false,
      autoplaySpeed: 3000,
    };
    
    // Initialize all other div with carousel class (excluding our video showcase)
    var otherCarousels = document.querySelectorAll('.carousel:not(#video-showcase-carousel)');
    if (otherCarousels.length > 0) {
      bulmaCarousel.attach(otherCarousels, defaultCarouselOptions);
    }

    // Make videos pause when not in view
    document.addEventListener('visibilitychange', function() {
      var videos = document.querySelectorAll('.carousel-item video');
      if (document.hidden) {
        videos.forEach(function(video) {
          if (!video.paused) {
            video.pause();
          }
        });
      } else {
        videos.forEach(function(video) {
          // Only autoplay videos in active carousel items
          if (video.closest('.carousel-item.is-active')) {
            video.play();
          }
        });
      }
    });

    // Handle carousel slide change to play/pause videos
    if (videoShowcaseCarousel && videoShowcaseCarousel.length > 0) {
      videoShowcaseCarousel[0].on('before:show', state => {
        // Pause all videos
        var videos = document.querySelectorAll('.carousel-item video');
        videos.forEach(function(video) {
          video.pause();
        });
        
        // Play the video in the current slide
        setTimeout(() => {
          var currentVideo = state.nextSlide.querySelector('video');
          if (currentVideo) {
            currentVideo.play();
          }
        }, 100);
      });
    }

    // Horizontal scrolling carousel functionality
    const scrollContainer = document.querySelector('.horizontal-scroll-container');
    const scrollLeftBtn = document.querySelector('.scroll-left-btn');
    const scrollRightBtn = document.querySelector('.scroll-right-btn');
    
    if (scrollContainer) {
      // Calculate item width for single item scrolling
      const calculateScrollDistance = function() {
        const item = scrollContainer.querySelector('.horizontal-scroll-item');
        if (item) {
          // Return the full width of a single item including margins
          return item.offsetWidth + 
                 parseInt(window.getComputedStyle(item).marginLeft) + 
                 parseInt(window.getComputedStyle(item).marginRight);
        }
        return 300; // Default fallback
      };
      
      // Initialize videos in the carousel
      const videos = scrollContainer.querySelectorAll('video');
      videos.forEach(function(video) {
        // Set video properties for better performance
        video.preload = 'metadata';
        video.muted = true;
        video.loop = true;
        video.setAttribute('playsinline', '');
        
        // Only autoplay the first 3 videos (visible ones)
        const itemIndex = Array.from(scrollContainer.querySelectorAll('.horizontal-scroll-item'))
                             .findIndex(item => item.contains(video));
        if (itemIndex < 3) {
          video.play().catch(e => {
            console.log("Auto-play prevented:", e);
          });
        } else {
          video.pause();
        }
      });
      
      // Center the first 3 items initially
      scrollContainer.scrollLeft = 0;
      
      // Function to check if we're at the end or beginning of the scroll container
      const isAtEnd = () => {
        const maxScrollLeft = scrollContainer.scrollWidth - scrollContainer.clientWidth;
        // Consider "at end" if within 5 pixels of the end
        return Math.abs(scrollContainer.scrollLeft - maxScrollLeft) < 5;
      };
      
      const isAtStart = () => {
        // Consider "at start" if within 5 pixels of the start
        return scrollContainer.scrollLeft < 5;
      };
      
      // Handle scroll buttons for one-item-at-a-time navigation with looping
      if (scrollLeftBtn && scrollRightBtn) {
        scrollLeftBtn.addEventListener('click', () => {
          const scrollDistance = calculateScrollDistance();
          
          if (isAtStart()) {
            // If at the beginning, jump to the end
            scrollContainer.scrollLeft = scrollContainer.scrollWidth;
            // Then scroll one item to the left for smooth transition
            setTimeout(() => {
              scrollContainer.scrollBy({
                left: -scrollDistance, 
                behavior: 'smooth'
              });
            }, 50);
          } else {
            // Normal scroll to the left
            scrollContainer.scrollBy({
              left: -scrollDistance, 
              behavior: 'smooth'
            });
          }
          
          // Update video playback after scrolling
          setTimeout(() => {
            updateVisibleVideos();
          }, 300);
        });
        
        scrollRightBtn.addEventListener('click', () => {
          const scrollDistance = calculateScrollDistance();
          
          if (isAtEnd()) {
            // If at the end, jump to the beginning
            scrollContainer.scrollLeft = 0;
          } else {
            // Normal scroll to the right
            scrollContainer.scrollBy({
              left: scrollDistance, 
              behavior: 'smooth'
            });
          }
          
          // Update video playback after scrolling
          setTimeout(() => {
            updateVisibleVideos();
          }, 300);
        });
      }
      
      // Function to update which videos are playing based on visibility
      const updateVisibleVideos = () => {
        const items = Array.from(scrollContainer.querySelectorAll('.horizontal-scroll-item'));
        const containerLeft = scrollContainer.getBoundingClientRect().left;
        const containerRight = scrollContainer.getBoundingClientRect().right;
        
        items.forEach((item, index) => {
          const video = item.querySelector('video');
          if (!video) return;
          
          const rect = item.getBoundingClientRect();
          const isFullyVisible = 
            rect.left >= containerLeft - 20 && 
            rect.right <= containerRight + 20 &&
            rect.width > 0;
            
          if (isFullyVisible) {
            video.play().catch(e => console.log("Auto-play prevented:", e));
          } else {
            video.pause();
          }
        });
      };
      
      // Handle scroll events for video playback
      scrollContainer.addEventListener('scroll', function() {
        updateVisibleVideos();
      });
      
      // Add touch and mouse drag scrolling for better mobile experience
      let isDragging = false;
      let startX;
      let scrollLeft;
      
      scrollContainer.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
        scrollContainer.style.cursor = 'grabbing';
      });
      
      scrollContainer.addEventListener('touchstart', (e) => {
        isDragging = true;
        startX = e.touches[0].pageX - scrollContainer.offsetLeft;
        scrollLeft = scrollContainer.scrollLeft;
      });
      
      scrollContainer.addEventListener('mouseleave', () => {
        isDragging = false;
        scrollContainer.style.cursor = 'grab';
      });
      
      scrollContainer.addEventListener('mouseup', () => {
        isDragging = false;
        scrollContainer.style.cursor = 'grab';
        updateVisibleVideos();
      });
      
      scrollContainer.addEventListener('touchend', () => {
        isDragging = false;
        updateVisibleVideos();
      });
      
      scrollContainer.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 1.5; // Scroll speed
        scrollContainer.scrollLeft = scrollLeft - walk;
      });
      
      scrollContainer.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        const x = e.touches[0].pageX - scrollContainer.offsetLeft;
        const walk = (x - startX) * 1.5;
        scrollContainer.scrollLeft = scrollLeft - walk;
      });
      
      // Initial update of visible videos
      updateVisibleVideos();
      
      // Update on window resize
      window.addEventListener('resize', updateVisibleVideos);
    }

    preloadInterpolationImages();

    $('#interpolation-slider').on('input', function(event) {
      setInterpolationImage(this.value);
    });
    setInterpolationImage(0);
    $('#interpolation-slider').prop('max', NUM_INTERP_FRAMES - 1);

    bulmaSlider.attach();
});
