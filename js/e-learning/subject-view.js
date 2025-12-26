// JavaScript for subject-view.html

// Extract subject from URL
const urlParams = new URLSearchParams(window.location.search);
const subjectSlug = urlParams.get('subject');

// Display subject details
async function loadSubjectDetails() {
  const subjectDetails = document.getElementById('subjectDetails');
  
  if (!subjectSlug) {
    subjectDetails.innerHTML = '<p>No subject specified.</p>';
    return;
  }

  subjectDetails.innerHTML = `<div class="text-center my-5"><div class="spinner-border text-primary"></div><p>Loading subject details...</p></div>`;

  try {
    const res = await fetch(`/data/portal/subjects/${subjectSlug}.json`);
    if (!res.ok) throw new Error('Failed to load subject details.');
    const subject = await res.json();

    subjectDetails.innerHTML = `
      <h1 class="display-5 fw-bold mb-4">${subject.name}</h1>
      <div class="row">
        <div class="col-md-8">
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-body">
              <h3>Overview</h3>
              <p>${subject.description}</p>
              <div class="row mt-4">
                <div class="col-md-4">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <h5 class="card-title">Topics</h5>
                      <p class="card-text display-6 fw-bold">${subject.topics}</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <h5 class="card-title">Resources</h5>
                      <p class="card-text display-6 fw-bold">${subject.resources}</p>
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card border-0 shadow-sm">
                    <div class="card-body text-center">
                      <h5 class="card-title">Duration</h5>
                      <p class="card-text display-6 fw-bold">${subject.duration}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="mt-4">
                <h4>Progress</h4>
                <div class="progress">
                  <div class="progress-bar" role="progressbar" style="width: ${subject.progress}%;" aria-valuenow="${subject.progress}" aria-valuemin="0" aria-valuemax="100">${subject.progress}%</div>
                </div>
              </div>
              
              ${subject.keyTopics ? `
              <div class="mt-4">
                <h4>Key Topics</h4>
                <ul class="list-group">
                  ${subject.keyTopics.map(topic => `<li class="list-group-item">${topic}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${subject.learningOutcomes ? `
              <div class="mt-4">
                <h4>Learning Outcomes</h4>
                <ul class="list-group">
                  ${subject.learningOutcomes.map(outcome => `<li class="list-group-item">${outcome}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${subject.assessmentMethods ? `
              <div class="mt-4">
                <h4>Assessment Methods</h4>
                <ul class="list-group">
                  ${subject.assessmentMethods.map(method => `<li class="list-group-item">${method}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${subject.skillsGained ? `
              <div class="mt-4">
                <h4>Skills Gained</h4>
                <ul class="list-group">
                  ${subject.skillsGained.map(skill => `<li class="list-group-item">${skill}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${subject.recommendedFor ? `
              <div class="mt-4">
                <h4>Recommended For</h4>
                <ul class="list-group">
                  ${subject.recommendedFor.map(recommendation => `<li class="list-group-item">${recommendation}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${subject.prerequisites ? `
              <div class="mt-4">
                <h4>Prerequisites</h4>
                <ul class="list-group">
                  ${subject.prerequisites.map(prerequisite => `<li class="list-group-item">${prerequisite}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
              
              ${subject.certification ? `
              <div class="mt-4">
                <h4>Certification</h4>
                <p>This subject offers a certification upon completion.</p>
              </div>
              ` : ''}
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card border-0 shadow-sm">
            <div class="card-body">
              <h5 class="card-title">Quick Links</h5>
              <ul class="list-group list-group-flush">
                <li class="list-group-item"><a href="/e-learning/resources.html?subject=${subject.slug}">Resources</a></li>
                <li class="list-group-item"><a href="/e-learning/assignments.html?subject=${subject.slug}">Assignments</a></li>
                <li class="list-group-item"><a href="/e-learning/quizzes.html?subject=${subject.slug}">Quizzes</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    subjectDetails.innerHTML = `<p class="text-danger text-center my-5">${err.message}</p>`;
  }
}

document.addEventListener('DOMContentLoaded', loadSubjectDetails);