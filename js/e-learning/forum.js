// JavaScript for forum.html
console.log('Forum page loaded');

// Forum state and configuration
const forumState = {
  discussions: [],
  filteredDiscussions: [],
  currentPage: 1,
  pageSize: 6,
  isLoading: false,
  error: null,
  userCanPost: true, // This would be determined by actual user permissions
  readOnlyMode: false,
  dailyPostLimit: 5,
  userPostsToday: 0
};

// DOM elements
const elements = {
  discussionsGrid: document.getElementById('discussionsGrid'),
  forumLoading: document.getElementById('forumLoading'),
  forumEmpty: document.getElementById('forumEmpty'),
  forumError: document.getElementById('forumError'),
  forumPagination: document.getElementById('forumPagination'),
  forumCategoryFilter: document.getElementById('forumCategoryFilter'),
  forumSearch: document.getElementById('forumSearch'),
  newDiscussionBtn: document.getElementById('newDiscussionBtn'),
  loadMoreBtn: document.querySelector('#forumPagination button')
};

// Initialize forum
function initForum() {
  setupEventListeners();
  checkPostingPermissions();
  loadDiscussions();
}

// Setup event listeners
function setupEventListeners() {
  // Category filter
  elements.forumCategoryFilter.addEventListener('change', filterDiscussions);
  
  // Search input
  elements.forumSearch.addEventListener('input', debounce(filterDiscussions, 300));
  
  // Load more button
  if (elements.loadMoreBtn) {
    elements.loadMoreBtn.addEventListener('click', loadMoreDiscussions);
  }
  
  // New discussion button
  elements.newDiscussionBtn.addEventListener('click', function(e) {
    if (!forumState.userCanPost) {
      e.preventDefault();
      alert('You do not have permission to post new discussions.');
    } else if (forumState.readOnlyMode) {
      e.preventDefault();
      alert('The forum is currently in read-only mode.');
    } else if (forumState.userPostsToday >= forumState.dailyPostLimit) {
      e.preventDefault();
      alert(`You have reached your daily post limit of ${forumState.dailyPostLimit} posts.`);
    }
  });
}

// Check posting permissions
function checkPostingPermissions() {
  // In a real implementation, this would check:
  // - User account status (active/suspended)
  // - Forum read-only mode
  // - Daily post limits
  // - Any other business rules
  
  // For demo purposes, we'll simulate some conditions
  const now = new Date();
  if (now.getHours() < 6 || now.getHours() > 22) {
    forumState.readOnlyMode = true;
    forumState.userCanPost = false;
  }
  
  // Update UI based on permissions
  updatePostButtonState();
}

// Update post button state based on permissions
function updatePostButtonState() {
  if (!forumState.userCanPost || forumState.readOnlyMode || 
      forumState.userPostsToday >= forumState.dailyPostLimit) {
    elements.newDiscussionBtn.disabled = true;
    elements.newDiscussionBtn.title = getPostingRestrictionReason();
  } else {
    elements.newDiscussionBtn.disabled = false;
    elements.newDiscussionBtn.title = '';
  }
}

// Get reason for posting restriction
function getPostingRestrictionReason() {
  if (forumState.readOnlyMode) {
    return 'Forum is in read-only mode';
  } else if (forumState.userPostsToday >= forumState.dailyPostLimit) {
    return `Daily post limit reached (${forumState.dailyPostLimit})`;
  } else {
    return 'You do not have permission to post';
  }
}

// Load discussions from API
async function loadDiscussions() {
  try {
    forumState.isLoading = true;
    updateLoadingState();
    
    // Simulate API call
    const response = await simulateApiCall();
    
    forumState.discussions = response;
    forumState.filteredDiscussions = [...response];
    
    // Sort discussions: pinned first, then by last reply date
    sortDiscussions();
    
    renderDiscussions();
    updatePagination();
    
  } catch (error) {
    console.error('Error loading discussions:', error);
    forumState.error = error;
    showErrorState();
  } finally {
    forumState.isLoading = false;
    updateLoadingState();
  }
}

// Simulate API call
function simulateApiCall() {
  return new Promise((resolve) => {
    setTimeout(() => {
      const sampleDiscussions = [
        {
          id: 1,
          title: 'Help with Algebra',
          author: 'Student1',
          repliesCount: 5,
          lastReplyAt: new Date(Date.now() - 86400000), // Yesterday
          isPinned: false,
          isLocked: false,
          category: 'math'
        },
        {
          id: 2,
          title: 'Biology Study Group',
          author: 'Student2',
          repliesCount: 12,
          lastReplyAt: new Date(Date.now() - 3600000), // 1 hour ago
          isPinned: true,
          isLocked: false,
          category: 'science'
        },
        {
          id: 3,
          title: 'English Essay Tips',
          author: 'Student3',
          repliesCount: 8,
          lastReplyAt: new Date(Date.now() - 172800000), // 2 days ago
          isPinned: false,
          isLocked: true,
          category: 'general'
        },
        {
          id: 4,
          title: 'Advanced Calculus Problems',
          author: 'MathTeacher',
          repliesCount: 15,
          lastReplyAt: new Date(Date.now() - 43200000), // 12 hours ago
          isPinned: true,
          isLocked: false,
          category: 'math'
        },
        {
          id: 5,
          title: 'Chemistry Lab Safety',
          author: 'ScienceDept',
          repliesCount: 3,
          lastReplyAt: new Date(Date.now() - 259200000), // 3 days ago
          isPinned: false,
          isLocked: false,
          category: 'science'
        },
        {
          id: 6,
          title: 'General Discussion about School Life',
          author: 'Student4',
          repliesCount: 20,
          lastReplyAt: new Date(Date.now() - 86400000), // Yesterday
          isPinned: false,
          isLocked: false,
          category: 'general'
        }
      ];
      resolve(sampleDiscussions);
    }, 800); // Simulate network delay
  });
}

// Sort discussions: pinned first, then by last reply date
function sortDiscussions() {
  forumState.filteredDiscussions.sort((a, b) => {
    // Pinned discussions come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Then sort by last reply date (newest first)
    return b.lastReplyAt - a.lastReplyAt;
  });
}

// Filter discussions based on category and search
function filterDiscussions() {
  const category = elements.forumCategoryFilter.value;
  const searchTerm = elements.forumSearch.value.toLowerCase();
  
  forumState.filteredDiscussions = forumState.discussions.filter(discussion => {
    // Filter by category
    const categoryMatch = !category || discussion.category === category;
    
    // Filter by search term
    const searchMatch = !searchTerm || 
      discussion.title.toLowerCase().includes(searchTerm) ||
      discussion.author.toLowerCase().includes(searchTerm);
    
    return categoryMatch && searchMatch;
  });
  
  // Re-sort after filtering
  sortDiscussions();
  
  // Reset to first page when filtering
  forumState.currentPage = 1;
  renderDiscussions();
  updatePagination();
}

// Debounce function for search input
function debounce(func, delay) {
  let timeoutId;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(context, args);
    }, delay);
  };
}

// Render discussions to the grid
function renderDiscussions() {
  const startIndex = (forumState.currentPage - 1) * forumState.pageSize;
  const endIndex = startIndex + forumState.pageSize;
  const discussionsToShow = forumState.filteredDiscussions.slice(startIndex, endIndex);
  
  if (discussionsToShow.length === 0) {
    showEmptyState();
    return;
  }
  
  elements.discussionsGrid.innerHTML = '';
  
  discussionsToShow.forEach(discussion => {
    const discussionCard = createDiscussionCard(discussion);
    elements.discussionsGrid.appendChild(discussionCard);
  });
  
  // Hide empty/error states if we have discussions
  hideAllStates();
}

// Create a discussion card element
function createDiscussionCard(discussion) {
  const card = document.createElement('div');
  card.className = 'col-md-4';
  
  const cardContent = document.createElement('div');
  cardContent.className = 'card h-100 border-0 shadow-sm';
  
  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';
  
  // Card title with icons
  const titleContainer = document.createElement('div');
  titleContainer.className = 'd-flex align-items-center mb-2';
  
  const title = document.createElement('h5');
  title.className = 'card-title mb-0 me-2';
  title.textContent = discussion.title;
  
  // Add pinned icon if needed
  if (discussion.isPinned) {
    const pinnedIcon = document.createElement('i');
    pinnedIcon.className = 'fas fa-thumbtack text-primary me-2';
    pinnedIcon.title = 'Pinned discussion';
    titleContainer.prepend(pinnedIcon);
  }
  
  // Add locked icon if needed
  if (discussion.isLocked) {
    const lockedIcon = document.createElement('i');
    lockedIcon.className = 'fas fa-lock text-secondary ms-2';
    lockedIcon.title = 'Locked discussion - no new replies';
    titleContainer.append(lockedIcon);
  }
  
  titleContainer.appendChild(title);
  cardBody.appendChild(titleContainer);
  
  // Category badge
  const categoryBadge = document.createElement('span');
  categoryBadge.className = 'badge bg-info text-white mb-2';
  categoryBadge.textContent = getCategoryName(discussion.category);
  cardBody.appendChild(categoryBadge);
  
  // Author info
  const authorInfo = document.createElement('p');
  authorInfo.className = 'card-text';
  authorInfo.innerHTML = `<strong>Author:</strong> ${discussion.author}`;
  cardBody.appendChild(authorInfo);
  
  // Replies info
  const repliesInfo = document.createElement('p');
  repliesInfo.className = 'card-text';
  repliesInfo.innerHTML = `<strong>Replies:</strong> ${discussion.repliesCount}`;
  cardBody.appendChild(repliesInfo);
  
  // Last reply info
  const lastReplyInfo = document.createElement('p');
  lastReplyInfo.className = 'card-text';
  lastReplyInfo.innerHTML = `<strong>Last reply:</strong> ${formatDate(discussion.lastReplyAt)}`;
  cardBody.appendChild(lastReplyInfo);
  
  // View button
  const viewButton = document.createElement('a');
  viewButton.href = `/e-learning/forum-thread.html?id=${discussion.id}`;
  viewButton.className = 'btn btn-primary';
  viewButton.textContent = 'View Discussion';
  
  // Disable button if discussion is locked
  if (discussion.isLocked) {
    viewButton.disabled = true;
    viewButton.title = 'This discussion is locked';
  }
  
  cardBody.appendChild(viewButton);
  cardContent.appendChild(cardBody);
  card.appendChild(cardContent);
  
  return card;
}

// Get category display name
function getCategoryName(category) {
  const categoryNames = {
    'math': 'Mathematics',
    'science': 'Science',
    'general': 'General Discussion'
  };
  return categoryNames[category] || category;
}

// Format date for display
function formatDate(date) {
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  return new Date(date).toLocaleDateString('en-US', options);
}

// Load more discussions
function loadMoreDiscussions() {
  forumState.currentPage++;
  renderDiscussions();
  updatePagination();
}

// Update pagination visibility
function updatePagination() {
  const totalPages = Math.ceil(forumState.filteredDiscussions.length / forumState.pageSize);
  
  if (forumState.currentPage >= totalPages) {
    elements.forumPagination.classList.add('d-none');
  } else {
    elements.forumPagination.classList.remove('d-none');
  }
}

// Show loading state
function updateLoadingState() {
  if (forumState.isLoading) {
    elements.forumLoading.classList.remove('d-none');
    elements.forumEmpty.classList.add('d-none');
    elements.forumError.classList.add('d-none');
  } else {
    elements.forumLoading.classList.add('d-none');
  }
}

// Show empty state
function showEmptyState() {
  elements.discussionsGrid.innerHTML = '';
  elements.forumEmpty.classList.remove('d-none');
  elements.forumError.classList.add('d-none');
  elements.forumPagination.classList.add('d-none');
}

// Show error state
function showErrorState() {
  elements.discussionsGrid.innerHTML = '';
  elements.forumError.classList.remove('d-none');
  elements.forumEmpty.classList.add('d-none');
  elements.forumPagination.classList.add('d-none');
}

// Hide all state messages
function hideAllStates() {
  elements.forumLoading.classList.add('d-none');
  elements.forumEmpty.classList.add('d-none');
  elements.forumError.classList.add('d-none');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initForum);