document.addEventListener('DOMContentLoaded', () => {
  showSection('addScene');
});

function showSection(section) {
  const content = document.getElementById('adminContent');
  content.innerHTML = ''; // Clear previous

  switch (section) {
    case 'addScene':
      content.innerHTML = `
        <h2>Add New Scene</h2>
        <form id="addSceneForm">
          <input type="text" id="title" placeholder="Title" required />
          <textarea id="description" placeholder="Description"></textarea>
          <input type="text" id="link" placeholder="Scene URL" />
          <input type="checkbox" id="isAvailable" /> Available
          <input type="checkbox" id="featured" /> Featured
          <input type="text" id="images" placeholder="Image URLs, comma separated" />
          <button type="submit">Add Scene</button>
        </form>
      `;
      document.getElementById('addSceneForm').addEventListener('submit', submitScene);
      break;

    case 'viewScenes':
      content.innerHTML = `<h2>All Scenes</h2><ul id="sceneList">Loading scenes...</ul>`;
      loadScenes();
      break;

    case 'editScenes':
      content.innerHTML = `<h2>Edit Scenes</h2><ul id="editSceneList">Loading scenes for editing...</ul>`;
      loadEditableScenes();
      break;
  }
}

function submitScene(e) {
  e.preventDefault();
  const scene = {
    title: document.getElementById('title').value,
    description: document.getElementById('description').value,
    link: document.getElementById('link').value,
    isAvailable: document.getElementById('isAvailable').checked,
    featured: document.getElementById('featured').checked,
    images: document.getElementById('images').value.split(',').map(img => img.trim())
  };

  fetch('/api/admin/scenes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify(scene)
  })
  .then(res => res.json())
  .then(data => {
    alert('Scene added successfully!');
    document.getElementById('addSceneForm').reset();
  })
  .catch(err => alert('Error adding scene: ' + err.message));
}

function loadScenes() {
  fetch('/api/admin/scenes', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('sceneList');
    list.innerHTML = '';
    data.forEach(scene => {
      const li = document.createElement('li');
      li.textContent = `${scene.title} - ${scene.description}`;
      list.appendChild(li);
    });
  })
  .catch(err => console.error('Error loading scenes:', err));
}

function loadEditableScenes() {
  fetch('/api/admin/scenes', {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('editSceneList');
    list.innerHTML = '';
    data.forEach(scene => {
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${scene.title}</strong>
        <button onclick="editScene('${scene._id}')">Edit</button>
        <button onclick="deleteScene('${scene._id}')">Delete</button>
      `;
      list.appendChild(li);
    });
  })
  .catch(err => console.error('Error loading scenes for editing:', err));
}

function deleteScene(id) {
  if (!confirm('Are you sure you want to delete this scene?')) return;

  fetch(`/api/admin/scenes/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
  .then(res => res.json())
  .then(() => {
    alert('Scene deleted.');
    showSection('editScenes');
  })
  .catch(err => console.error('Error deleting scene:', err));
}

function editScene(id) {
  alert(`Edit functionality for scene ID ${id} coming soon.`);
}
