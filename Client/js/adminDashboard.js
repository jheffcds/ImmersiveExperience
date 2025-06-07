document.addEventListener('DOMContentLoaded', () => {
  showSection('addScene');
});

function showSection(section) {
  const content = document.getElementById('adminContent');
  content.innerHTML = ''; // Clear previous content

  switch (section) {
    case 'addScene':
      content.innerHTML = `
        <h2>Add New Scene</h2>
        <form id="addSceneForm" enctype="multipart/form-data">
          <input type="text" id="title" placeholder="Title" required />
          <textarea id="description" placeholder="Description"></textarea>
          <input type="text" id="link" placeholder="Scene URL" />

          <div class="checkbox-group">
            <label><input type="checkbox" id="isAvailable" /> <span>Available</span></label>
            <label><input type="checkbox" id="featured" /> <span>Featured</span></label>
          </div>

          <div class="form-group">
            <label for="images" class="form-label">Upload Images</label>
            <div class="custom-file-upload">
              <label for="images" class="upload-label">Choose Images</label>
              <input type="file" id="images" name="images" accept="image/*" multiple hidden />
              <div id="previewContainer" class="preview-container"></div>
            </div>
          </div>

          <button type="submit">Add Scene</button>
        </form>
      `;

      document.getElementById('addSceneForm').addEventListener('submit', submitScene);
      document.getElementById('images').addEventListener('change', previewImages);
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

function previewImages() {
  const previewContainer = document.getElementById('previewContainer');
  previewContainer.innerHTML = '';

  Array.from(this.files).forEach(file => {
    const reader = new FileReader();
    reader.onload = function (e) {
      const img = document.createElement('img');
      img.src = e.target.result;
      img.classList.add('preview-image');
      previewContainer.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
}

function submitScene(e) {
  e.preventDefault();

  const form = document.getElementById('addSceneForm');
  const formData = new FormData();

  formData.append('title', document.getElementById('title').value);
  formData.append('description', document.getElementById('description').value);
  formData.append('link', document.getElementById('link').value);
  formData.append('isAvailable', document.getElementById('isAvailable').checked);
  formData.append('featured', document.getElementById('featured').checked);

  const files = document.getElementById('images').files;
  for (let i = 0; i < files.length; i++) {
    formData.append('images', files[i]);
  }

  fetch('/api/admin/scenes', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: formData
  })
    .then(res => res.json())
    .then(() => {
      alert('Scene added successfully!');
      form.reset();
      document.getElementById('previewContainer').innerHTML = '';
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
