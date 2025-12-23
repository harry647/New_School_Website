// JavaScript for subjects.html

const subjectsGrid = document.querySelector('.row.g-4');

async function loadSubjects() {
  subjectsGrid.innerHTML = `<div class="text-center my-5"><div class="spinner-border text-primary"></div><p>Loading subjects...</p></div>`;
  try {
    const res = await fetch('/api/subjects');
    if (!res.ok) throw new Error('Failed to load subjects.');
    const subjects = await res.json();

    if(subjects.length === 0){
      subjectsGrid.innerHTML = `<p class="text-center text-muted my-5">No subjects available.</p>`;
      return;
    }

    subjectsGrid.innerHTML = '';
    subjects.forEach(sub => {
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.innerHTML = `
        <div class="card h-100 border-0 shadow-sm">
          <img src="${sub.image}" class="card-img-top" alt="${sub.name}">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">${sub.name}</h5>
            <p class="card-text">${sub.description}</p>
            <p class="card-text"><small class="text-muted">${sub.topics} topics • ${sub.resources} resources • ${sub.duration}</small></p>
            <div class="progress mt-2">
              <div class="progress-bar" role="progressbar" style="width: ${sub.progress}%;" aria-valuenow="${sub.progress}" aria-valuemin="0" aria-valuemax="100">${sub.progress}%</div>
            </div>
            <a href="/e-learning/subject-view.html?subject=${sub.slug}" class="btn btn-primary mt-auto">View Subject</a>
          </div>
        </div>`;
      subjectsGrid.appendChild(col);
    });
  } catch (err) {
    subjectsGrid.innerHTML = `<p class="text-danger text-center my-5">${err.message}</p>`;
  }
}

document.getElementById('subjectSearch').addEventListener('input', e => {
  const term = e.target.value.toLowerCase();
  document.querySelectorAll('.card-title').forEach(title => {
    title.closest('.col-md-4').style.display = title.textContent.toLowerCase().includes(term) ? '' : 'none';
  });
});

document.addEventListener('DOMContentLoaded', loadSubjects);