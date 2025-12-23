// JavaScript for forum-thread.html
console.log('Forum thread page loaded');

// Extract thread ID from URL
const urlParams = new URLSearchParams(window.location.search);
const threadId = urlParams.get('id');

// Display thread details
document.addEventListener('DOMContentLoaded', function() {
  const threadDetails = document.getElementById('threadDetails');
  
  if (threadId) {
    // Sample thread data
    const thread = {
      id: threadId,
      title: 'Help with Algebra',
      author: 'Student1',
      content: 'I need help understanding quadratic equations. Can someone explain?',
      replies: [
        { author: 'Student2', content: 'Sure, I can help. What specifically are you struggling with?' },
        { author: 'Teacher1', content: 'Here is a useful resource: [link to resource]' },
      ]
    };

    let threadHTML = `
      <h1 class="display-5 fw-bold mb-4">${thread.title}</h1>
      <div class="card border-0 shadow-sm mb-4">
        <div class="card-body">
          <p><strong>Author:</strong> ${thread.author}</p>
          <p>${thread.content}</p>
        </div>
      </div>
      <h3>Replies</h3>
    `;

    thread.replies.forEach(reply => {
      threadHTML += `
        <div class="card border-0 shadow-sm mb-3">
          <div class="card-body">
            <p><strong>${reply.author}</strong></p>
            <p>${reply.content}</p>
          </div>
        </div>
      `;
    });

    threadHTML += `
      <div class="mt-4">
        <h4>Add a Reply</h4>
        <form>
          <div class="mb-3">
            <textarea class="form-control" rows="3" placeholder="Your reply..." required></textarea>
          </div>
          <button type="submit" class="btn btn-primary">Post Reply</button>
        </form>
      </div>
    `;

    threadDetails.innerHTML = threadHTML;
  } else {
    threadDetails.innerHTML = '<p>No thread specified.</p>';
  }
});