// =======================================================
// support.js – Support & Utilities Page (Ultra-Premium 2026+)
// Enhanced interactivity, stunning animations, professional UX
// =======================================================

document.addEventListener("DOMContentLoaded", function () {
  "use strict";

  // ========================================
  // 1. ENHANCED DONATION FORM – Professional UX
  // ========================================
  const donationForm = document.getElementById("donationForm");
  const fileInput = document.getElementById("pledgeDoc");
  const filePreview = document.getElementById("filePreview");

  if (donationForm) {
    // Enhanced file preview with drag & drop
    setupFileUpload();

    // Professional form validation
    setupFormValidation();

    // Enhanced submission with better UX
    donationForm.addEventListener("submit", handleDonationSubmission);

    // Auto-format phone number
    setupPhoneFormatting();

    // Amount suggestions
    setupAmountSuggestions();
  }

  function setupFileUpload() {
    if (!fileInput) return;

    // Create drag & drop area
    const dropZone = document.createElement('div');
    dropZone.className = 'file-drop-zone';
    dropZone.innerHTML = `
      <i class="fas fa-cloud-upload-alt"></i>
      <p>Drag & drop your document here or click to browse</p>
      <small>Accepted: PDF, JPG, PNG (Max: 10MB)</small>
    `;
    
    fileInput.parentNode.insertBefore(dropZone, fileInput);
    dropZone.appendChild(fileInput);

    // Drag & drop handlers
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);
    dropZone.addEventListener('click', () => fileInput.click());
    
    fileInput.addEventListener('change', handleFileSelect);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }

  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }

  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      fileInput.files = files;
      handleFileSelect();
    }
  }

  function handleFileSelect() {
    filePreview.innerHTML = "";
    const file = fileInput.files[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification("File too large! Maximum 10MB allowed.", "error");
      fileInput.value = "";
      return;
    }

    const fileItem = createFilePreview(file);
    filePreview.appendChild(fileItem);
    filePreview.style.display = 'block';
    
    // Animate in
    fileItem.style.opacity = '0';
    fileItem.style.transform = 'translateY(-10px)';
    setTimeout(() => {
      fileItem.style.transition = 'all 0.3s ease';
      fileItem.style.opacity = '1';
      fileItem.style.transform = 'translateY(0)';
    }, 50);
  }

  function createFilePreview(file) {
    const item = document.createElement('div');
    item.className = 'file-item';
    item.innerHTML = `
      <i class="fas ${getFileIcon(file.type)}"></i>
      <div class="file-info">
        <div class="file-name">${file.name}</div>
        <div class="file-size">${formatFileSize(file.size)}</div>
      </div>
      <button type="button" class="remove-file" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;
    return item;
  }

  function getFileIcon(type) {
    if (type.includes('pdf')) return 'fa-file-pdf';
    if (type.includes('image')) return 'fa-file-image';
    return 'fa-file';
  }

  function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function setupFormValidation() {
    const inputs = donationForm.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      input.addEventListener('blur', validateField);
      input.addEventListener('input', clearFieldError);
    });
  }

  function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    const fieldName = field.name;
    
    clearFieldError(e);
    
    if (field.hasAttribute('required') && !value) {
      showFieldError(field, 'This field is required');
      return false;
    }
    
    if (fieldName === 'donor_email' && value && !isValidEmail(value)) {
      showFieldError(field, 'Please enter a valid email address');
      return false;
    }
    
    if (fieldName === 'amount' && value && (isNaN(value) || parseFloat(value) < 50)) {
      showFieldError(field, 'Minimum donation amount is Ksh 50');
      return false;
    }
    
    return true;
  }

  function showFieldError(field, message) {
    field.style.borderColor = 'var(--danger)';
    const error = document.createElement('div');
    error.className = 'field-error';
    error.textContent = message;
    error.style.color = 'var(--danger)';
    error.style.fontSize = '0.875rem';
    error.style.marginTop = '0.5rem';
    field.parentNode.appendChild(error);
  }

  function clearFieldError(e) {
    const field = e.target;
    field.style.borderColor = '';
    const error = field.parentNode.querySelector('.field-error');
    if (error) error.remove();
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleDonationSubmission(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalHTML = submitBtn.innerHTML;
    
    // Validate all fields
    let isValid = true;
    const inputs = e.target.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
      if (!validateField({ target: input })) {
        isValid = false;
      }
    });
    
    if (!isValid) {
      showNotification('Please correct the errors above', 'error');
      return;
    }
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing Donation...';
    submitBtn.classList.add('loading');
    
    try {
      const formData = new FormData(donationForm);
      
      const response = await fetch("/api/donate", {
        method: "POST",
        body: formData
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        // SUCCESS – Enhanced thank you screen
        showSuccessMessage(formData, result);
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (err) {
      console.error("Donation error:", err);
      showNotification("Unable to process donation. Please try again or call +254 700 735 472", "error");
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalHTML;
      submitBtn.classList.remove('loading');
    }
  }

  function showSuccessMessage(formData, result) {
    const donorName = formData.get("donor_name") || "Generous Donor";
    const amount = formData.get("amount");
    const purpose = formData.get("purpose");
    
    const successHTML = `
      <div class="success-message" style="
        text-align: center; 
        padding: 4rem 2rem; 
        background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); 
        border-radius: 20px; 
        color: #155724; 
        line-height: 1.8;
        border: 2px solid #28a745;
        position: relative;
        overflow: hidden;
      ">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #28a745, #20c997);"></div>
        <i class="fas fa-heart fa-5x mb-4" style="color: #e91e63; animation: pulse 2s infinite;"></i>
        <h2 style="color: #155724; margin: 1rem 0; font-size: 2.5rem;">Thank You for Your Kindness!</h2>
        <p style="font-size: 1.3rem; margin-bottom: 2rem;">
          Dear <strong style="color: #0d4f3c;">${donorName}</strong>,
        </p>
        <div style="background: rgba(255,255,255,0.7); padding: 2rem; border-radius: 15px; margin: 2rem 0;">
          <p style="font-size: 1.2rem; margin-bottom: 1rem;">
            Your donation of <strong style="color: #155724;">Ksh ${amount}</strong> for 
            <br><strong style="color: #0d4f3c;">"${purpose}"</strong> has been recorded.
          </p>
        </div>
        <div style="background: rgba(13, 79, 60, 0.1); padding: 1.5rem; border-radius: 10px; margin: 2rem 0;">
          <p style="margin: 0; font-weight: 600;">
            📱 M-Pesa/Bank details will be sent to your phone and email within minutes.
          </p>
        </div>
        <p style="margin-top: 2rem; font-weight: 600; color: #c2185b; font-size: 1.1rem;">
          💝 Your support transforms lives at Bar Union Mixed Secondary School
        </p>
        <p class="mt-4 text-sm" style="opacity: 0.8;">📧 A receipt will be emailed to you once payment is confirmed.</p>
      </div>
    `;
    
    donationForm.innerHTML = successHTML;
    
    // Add pulse animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
    `;
    document.head.appendChild(style);
    
    // Scroll to top of form
    donationForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function setupPhoneFormatting() {
    const phoneInput = document.getElementById('donorPhone');
    if (!phoneInput) return;
    
    phoneInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      if (value.startsWith('254')) {
        value = value.substring(3);
      }
      if (value.startsWith('0')) {
        value = value.substring(1);
      }
      
      if (value.length >= 9) {
        value = value.substring(0, 9);
        e.target.value = `+254 ${value.substring(0, 3)} ${value.substring(3, 6)} ${value.substring(6)}`;
      } else {
        e.target.value = value;
      }
    });
  }

  function setupAmountSuggestions() {
    const amountInput = document.getElementById('donationAmount');
    if (!amountInput) return;
    
    const suggestions = [500, 1000, 2500, 5000, 10000];
    const suggestionContainer = document.createElement('div');
    suggestionContainer.className = 'amount-suggestions';
    suggestionContainer.innerHTML = `
      <small>Quick amounts: ${suggestions.map(amount => 
        `<button type="button" class="amount-btn" data-amount="${amount}">Ksh ${amount.toLocaleString()}</button>`
      ).join('')}</small>
    `;
    
    amountInput.parentNode.appendChild(suggestionContainer);
    
    suggestionContainer.addEventListener('click', function(e) {
      if (e.target.classList.contains('amount-btn')) {
        amountInput.value = e.target.dataset.amount;
        amountInput.focus();
      }
    });
  }

  // ========================================
  // 2. ENHANCED INTERSECTION OBSERVER
  // ========================================
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all cards and sections
  document.querySelectorAll('.utility-card, .impact-card, .download-item, .support-item, .quick-card').forEach((el, index) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = `all 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${index * 0.1}s`;
    observer.observe(el);
  });

  // ========================================
  // 3. ENHANCED RESPONSIVE GRIDS
  // ========================================
  const utilitiesGrid = document.querySelector(".utilities-grid");
  const quickGrid = document.querySelector(".quick-access-grid");
  const downloadsGrid = document.querySelector(".downloads-grid");
  const supportGrid = document.querySelector(".support-contact");

  function optimizeGrids() {
    const width = window.innerWidth;
    
    if (width <= 480) {
      setGridColumns(utilitiesGrid, '1fr');
      setGridColumns(quickGrid, '1fr');
      setGridColumns(downloadsGrid, '1fr');
      setGridColumns(supportGrid, '1fr');
    } else if (width <= 768) {
      setGridColumns(utilitiesGrid, '1fr');
      setGridColumns(quickGrid, '1fr');
      setGridColumns(downloadsGrid, 'repeat(2, 1fr)');
      setGridColumns(supportGrid, 'repeat(2, 1fr)');
    } else if (width <= 992) {
      setGridColumns(utilitiesGrid, 'repeat(2, 1fr)');
      setGridColumns(quickGrid, 'repeat(2, 1fr)');
      setGridColumns(downloadsGrid, 'repeat(2, 1fr)');
      setGridColumns(supportGrid, 'repeat(2, 1fr)');
    } else {
      setGridColumns(utilitiesGrid, 'repeat(auto-fit, minmax(350px, 1fr))');
      setGridColumns(quickGrid, 'repeat(auto-fit, minmax(300px, 1fr))');
      setGridColumns(downloadsGrid, 'repeat(auto-fit, minmax(350px, 1fr))');
      setGridColumns(supportGrid, 'repeat(auto-fit, minmax(350px, 1fr))');
    }
  }

  function setGridColumns(grid, columns) {
    if (grid) {
      grid.style.gridTemplateColumns = columns;
    }
  }

  optimizeGrids();
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(optimizeGrids, 150);
  });

  // ========================================
  // 4. ENHANCED DOWNLOADS INTERACTIONS
  // ========================================
  document.querySelectorAll(".download-item").forEach(item => {
    // Add ripple effect on click
    item.addEventListener("click", function(e) {
      createRippleEffect(e, this);
      trackDownload(this);
    });

    // Enhanced touch feedback
    item.addEventListener("touchstart", function() {
      this.style.transform = "scale(0.98)";
      this.style.transition = "transform 0.1s ease";
    });
    
    item.addEventListener("touchend", function() {
      this.style.transform = "";
      setTimeout(() => {
        this.style.transition = "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
      }, 100);
    });
  });

  function createRippleEffect(e, element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      left: ${x}px;
      top: ${y}px;
      background: rgba(1, 117, 194, 0.3);
      border-radius: 50%;
      transform: scale(0);
      animation: ripple 0.6s linear;
      pointer-events: none;
      z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(ripple);
    
    setTimeout(() => {
      ripple.remove();
    }, 600);
  }

  function trackDownload(item) {
    const fileName = item.querySelector('strong').textContent;
    console.log(`Downloaded: ${fileName}`);
    // Here you could send analytics to your backend
  }

  // ========================================
  // 5. ENHANCED SUPPORT CONTACT CARDS
  // ========================================
  if (window.innerWidth <= 768) {
    document.querySelectorAll(".support-item").forEach(card => {
      const content = card.querySelector('.support-desc');
      const header = card.querySelector('div');
      
      if (content && header) {
        // Create accordion-style mobile layout
        card.style.cursor = 'pointer';
        content.style.maxHeight = '0';
        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 0.3s ease';
        
        header.addEventListener('click', () => {
          const isOpen = content.style.maxHeight !== '0px';
          
          // Close all other cards
          document.querySelectorAll('.support-item .support-desc').forEach(otherContent => {
            if (otherContent !== content) {
              otherContent.style.maxHeight = '0';
            }
          });
          
          // Toggle current card
          content.style.maxHeight = isOpen ? '0' : content.scrollHeight + 'px';
          card.classList.toggle('open', !isOpen);
        });
      }
    });
  }

  // ========================================
  // 6. SMOOTH SCROLL WITH OFFSET
  // ========================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href === "#" || !document.querySelector(href)) return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      const headerOffset = 100;
      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      
      history.pushState(null, null, href);
    });
  });

  // ========================================
  // 7. ENHANCED NOTIFICATION SYSTEM
  // ========================================
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
      </div>
      <button class="notification-close">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? '#fee2e2' : type === 'success' ? '#d1fae5' : '#dbeafe'};
      color: ${type === 'error' ? '#991b1b' : type === 'success' ? '#065f46' : '#1e40af'};
      padding: 1rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.1);
      z-index: 10000;
      transform: translateX(400px);
      transition: transform 0.3s ease;
      max-width: 400px;
      border-left: 4px solid ${type === 'error' ? '#dc2626' : type === 'success' ? '#10b981' : '#3b82f6'};
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, 5000);
    
    // Manual close
    notification.querySelector('.notification-close').addEventListener('click', () => {
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        notification.remove();
      }, 300);
    });
  }

  function getNotificationIcon(type) {
    switch (type) {
      case 'error': return 'fa-exclamation-circle';
      case 'success': return 'fa-check-circle';
      default: return 'fa-info-circle';
    }
  }

  // ========================================
  // 8. PERFORMANCE OPTIMIZATIONS
  // ========================================
  
  // Lazy load images
  const images = document.querySelectorAll('img[data-src]');
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove('lazy');
        imageObserver.unobserve(img);
      }
    });
  });
  
  images.forEach(img => imageObserver.observe(img));

  // Preload critical resources
  const criticalResources = [
    '/assets/images/common/hero-bg.jpg'
  ];
  
  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = 'image';
    document.head.appendChild(link);
  });

  // ========================================
  // 9. ACCESSIBILITY ENHANCEMENTS
  // ========================================
  
  // Skip to main content link
  const skipLink = document.createElement('a');
  skipLink.href = '#main-content';
  skipLink.textContent = 'Skip to main content';
  skipLink.className = 'skip-link';
  skipLink.style.cssText = `
    position: absolute;
    top: -40px;
    left: 6px;
    background: var(--primary);
    color: white;
    padding: 8px;
    text-decoration: none;
    border-radius: 4px;
    z-index: 10000;
    transition: top 0.3s;
  `;
  
  skipLink.addEventListener('focus', () => {
    skipLink.style.top = '6px';
  });
  
  skipLink.addEventListener('blur', () => {
    skipLink.style.top = '-40px';
  });
  
  document.body.insertBefore(skipLink, document.body.firstChild);

  // Add main content ID
  const mainContent = document.querySelector('.page-hero');
  if (mainContent) {
    mainContent.id = 'main-content';
  }

  // ========================================
  // 10. ENHANCED SCROLL EFFECTS
  // ========================================
  
  let ticking = false;
  
  function updateScrollEffects() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.page-hero.support-hero');
    
    if (hero) {
      // Parallax effect for hero background
      hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
    
    // Update navigation background - preserve header styling with minimal intervention
    const header = document.querySelector('header.site-header');
    if (header) {
      if (scrolled > 100) {
        header.classList.add('scrolled');
        // Only add minimal background transparency without overriding original styling
        header.style.backgroundColor = 'rgba(11, 45, 94, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
        header.style.webkitBackdropFilter = 'blur(10px)';
      } else {
        header.classList.remove('scrolled');
        // Restore original styling more conservatively
        header.style.backgroundColor = '';
        header.style.backdropFilter = '';
        header.style.webkitBackdropFilter = '';
      }
    }
    
    ticking = false;
  }
  
  function requestScrollUpdate() {
    if (!ticking) {
      requestAnimationFrame(updateScrollEffects);
      ticking = true;
    }
  }
  
  window.addEventListener('scroll', requestScrollUpdate);

  // ========================================
  // 11. BACK TO TOP BUTTON
  // ========================================
  
  const backToTopBtn = document.createElement('button');
  backToTopBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopBtn.className = 'back-to-top';
  backToTopBtn.setAttribute('aria-label', 'Back to top');
  backToTopBtn.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    transform: translateY(100px);
    opacity: 0;
    transition: all 0.3s ease;
    z-index: 1000;
    font-size: 1.2rem;
  `;
  
  document.body.appendChild(backToTopBtn);
  
  // Show/hide based on scroll position
  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 600) {
      backToTopBtn.style.transform = 'translateY(0)';
      backToTopBtn.style.opacity = '1';
    } else {
      backToTopBtn.style.transform = 'translateY(100px)';
      backToTopBtn.style.opacity = '0';
    }
  });
  
  // Smooth scroll to top
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // ========================================
  // 12. INITIALIZATION COMPLETE
  // ========================================
  
  console.log('🎉 Support & Utilities page loaded successfully!');
  
  // Trigger any custom events for analytics
  window.dispatchEvent(new CustomEvent('supportPageLoaded', {
    detail: {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  }));
});

// ========================================
// GLOBAL CSS ANIMATIONS (Added via JS)
// ========================================

// Add ripple animation keyframes
const rippleStyles = document.createElement('style');
rippleStyles.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  .notification-content {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  
  .notification-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    padding: 0.25rem;
    margin-left: 1rem;
    opacity: 0.7;
    transition: opacity 0.2s;
  }
  
  .notification-close:hover {
    opacity: 1;
  }
  
  .amount-suggestions {
    margin-top: 0.75rem;
  }
  
  .amount-btn {
    background: var(--gray-100);
    border: 1px solid var(--gray-300);
    padding: 0.5rem 1rem;
    margin: 0.25rem;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: all 0.2s;
  }
  
  .amount-btn:hover {
    background: var(--secondary);
    color: white;
    border-color: var(--secondary);
  }
  
  .file-drop-zone {
    border: 2px dashed var(--gray-300);
    border-radius: var(--radius);
    padding: 2rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-bottom: 1rem;
  }
  
  .file-drop-zone:hover,
  .file-drop-zone.drag-over {
    border-color: var(--secondary);
    background: rgba(1, 117, 194, 0.05);
  }
  
  .file-drop-zone i {
    font-size: 2rem;
    color: var(--secondary);
    margin-bottom: 1rem;
  }
  
  .file-drop-zone p {
    margin: 0.5rem 0;
    color: var(--gray-600);
  }
  
  .file-drop-zone small {
    color: var(--gray-500);
  }
  
  .remove-file {
    background: none;
    border: none;
    color: var(--gray-400);
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: color 0.2s;
  }
  
  .remove-file:hover {
    color: var(--danger);
  }
`;
document.head.appendChild(rippleStyles);