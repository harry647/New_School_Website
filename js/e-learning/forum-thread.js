// JavaScript for forum-thread.html
console.log('Forum thread page loaded');

// Extract thread ID from URL
const urlParams = new URLSearchParams(window.location.search);
const threadId = urlParams.get('id');

// Display thread details
document.addEventListener('DOMContentLoaded', function() {
  const threadDetails = document.getElementById('threadDetails');
  const threadLoading = document.getElementById('threadLoading');
  const threadError = document.getElementById('threadError');
  const replyComposer = document.getElementById('replyComposer');
  const postReplyBtn = document.getElementById('postReplyBtn');
  const loadMoreReplies = document.getElementById('loadMoreReplies');
  const threadSyncStatus = document.getElementById('threadSyncStatus');
  
  // Hide loading state initially
  threadLoading.classList.add('d-none');
  
  if (threadId) {
    // Sample thread data with extended properties
    const thread = {
      id: threadId,
      title: 'Help with Algebra',
      author: 'Student1',
      createdAt: '2025-12-20T10:30:00',
      content: 'I need help understanding quadratic equations. Can someone explain?',
      replies: [
        { author: 'Student2', content: 'Sure, I can help. What specifically are you struggling with?', createdAt: '2025-12-20T11:15:00' },
        { author: 'Teacher1', content: 'Here is a useful resource: [link to resource]', createdAt: '2025-12-20T14:45:00' },
      ],
      isLocked: false,
      isPinned: false
    };

    // Thread Meta Header
    let threadHTML = `
      <!-- Thread header: title, author, date, stats -->
      <article class="mb-4">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h1 class="display-5 fw-bold mb-2">${thread.title}</h1>
            <div class="d-flex align-items-center text-muted">
              <i class="fas fa-user-circle me-2"></i>
              <span>${thread.author}</span>
              <span class="mx-2">•</span>
              <time datetime="${thread.createdAt}">${new Date(thread.createdAt).toLocaleString()}</time>
            </div>
          </div>
          <div class="text-end">
            <span class="badge bg-secondary">${thread.replies.length} Replies</span>
            ${thread.isPinned ? '<span class="badge bg-info ms-1">Pinned</span>' : ''}
            ${thread.isLocked ? '<span class="badge bg-warning ms-1">Locked</span>' : ''}
          </div>
        </div>
        
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <p>${thread.content}</p>
          </div>
        </div>
      </article>
      
      <h3>Replies</h3>
    `;

    thread.replies.forEach(reply => {
      threadHTML += `
        <!-- Replies should use <article> with <time> -->
        <article class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <div>
                <strong>${reply.author}</strong>
                <span class="text-muted ms-2">
                  <time datetime="${reply.createdAt}">${new Date(reply.createdAt).toLocaleString()}</time>
                </span>
              </div>
            </div>
            <p class="mb-0">${reply.content}</p>
          </div>
        </article>
      `;
    });

    // Show reply composer if thread is not locked
    if (!thread.isLocked) {
      replyComposer.classList.remove('d-none');
    }
    
    // Add event listener for posting replies
    postReplyBtn.addEventListener('click', function() {
      const replyContent = document.getElementById('replyContent').value;
      if (replyContent.trim()) {
        threadSyncStatus.classList.remove('d-none');
        
        // Simulate posting reply
        setTimeout(() => {
          thread.replies.push({
            author: 'Current User',
            content: replyContent,
            createdAt: new Date().toISOString()
          });
          
          // Re-render thread with new reply
          renderThread(thread);
          
          // Clear form
          document.getElementById('replyContent').value = '';
          threadSyncStatus.classList.add('d-none');
        }, 1000);
      }
    });
    
    // Show load more button if there are many replies
    if (thread.replies.length > 5) {
      loadMoreReplies.classList.remove('d-none');
    }

    threadDetails.innerHTML = threadHTML;
  } else {
    threadError.classList.remove('d-none');
    threadLoading.classList.add('d-none');
  }
});

// Function to render thread
function renderThread(thread) {
  const threadDetails = document.getElementById('threadDetails');
  
  // Thread Meta Header
  let threadHTML = `
    <!-- Thread header: title, author, date, stats -->
    <article class="mb-4">
      <div class="d-flex justify-content-between align-items-start mb-3">
        <div>
          <h1 class="display-5 fw-bold mb-2">${thread.title}</h1>
          <div class="d-flex align-items-center text-muted">
            <i class="fas fa-user-circle me-2"></i>
            <span>${thread.author}</span>
            <span class="mx-2">•</span>
            <time datetime="${thread.createdAt}">${new Date(thread.createdAt).toLocaleString()}</time>
          </div>
        </div>
        <div class="text-end">
          <span class="badge bg-secondary">${thread.replies.length} Replies</span>
          ${thread.isPinned ? '<span class="badge bg-info ms-1">Pinned</span>' : ''}
          ${thread.isLocked ? '<span class="badge bg-warning ms-1">Locked</span>' : ''}
        </div>
      </div>
      
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <p>${thread.content}</p>
        </div>
      </div>
    </article>
    
    <h3>Replies</h3>
  `;

  // Render replies
  thread.replies.forEach(reply => {
    threadHTML += `
      <!-- Replies should use <article> with <time> -->
      <article class="card border-0 shadow-sm mb-3">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <strong>${reply.author}</strong>
              <span class="text-muted ms-2">
                <time datetime="${reply.createdAt}">${new Date(reply.createdAt).toLocaleString()}</time>
              </span>
            </div>
          </div>
          <p class="mb-0">${reply.content}</p>
        </div>
      </article>
    `;
  });

  threadDetails.innerHTML = threadHTML;
}