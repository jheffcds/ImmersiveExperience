document.addEventListener('DOMContentLoaded', () => {
  const nameElement = document.getElementById('adminName');
  const avatarElement = document.querySelector('.admin-avatar');
  const cachedName = localStorage.getItem('userName') || 'John Doe';
  const cachedPicture = localStorage.getItem('userPicture') || 'uploads/profile/default.png';

  nameElement.textContent = cachedName || 'Admin';
  avatarElement.src = cachedPicture;

  showSection('addScene');

  const editForm = document.getElementById('editSceneForm');
  if (editForm) {
    editForm.addEventListener('submit', submitEditScene);
  }
});

function showSection(section) {
  const content = document.getElementById('adminContent');
  content.innerHTML = '';

  switch (section) {
    case 'addScene':
      content.innerHTML = `
        <h2>Add New Scene</h2>
        <form id="addSceneForm" enctype="multipart/form-data">
          <input type="text" id="title" placeholder="Title" required />
          <textarea id="story" placeholder="Story"></textarea>
          <textarea id="description" placeholder="Description"></textarea>
          <input type="text" id="link" placeholder="Scene URL" />
          <input type="number" id="price" placeholder="Price" step="0.01" min="0" />

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
  formData.append('story', document.getElementById('story').value);
  formData.append('link', document.getElementById('link').value);
  formData.append('price', document.getElementById('price').value);
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
      list.classList.add('scene-card-container');

      data.forEach(scene => {
        const imagePath = scene.images?.[0] ? `/${scene.images[0]}` : 'assets/images/placeholder.png';

        // Truncate description if too long
        const description = scene.description || '';
        const shortDescription = description.length > 100
          ? description.substring(0, 100) + '...'
          : description;

        const card = document.createElement('div');
        card.classList.add('scene-card');

        card.innerHTML = `
          <img src="${imagePath}" alt="${scene.title}" class="scene-card-image" />
          <div class="scene-card-body">
            <h3 class="scene-card-title">${scene.title}</h3>
            <p class="scene-card-description">${shortDescription}</p>
          </div>
        `;
        list.appendChild(card);
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
      list.classList.add('scene-card-container');

      data.forEach(scene => {
        const imagePath = scene.images?.[0] ? `/${scene.images[0]}` : 'assets/images/placeholder.png';

        // Truncate description if too long
        const description = scene.description || '';
        const shortDescription = description.length > 100
          ? description.substring(0, 100) + '...'
          : description;

        const card = document.createElement('div');
        card.classList.add('scene-card');

        card.innerHTML = `
          <img src="${imagePath}" alt="${scene.title}" class="scene-card-image" />
          <div class="scene-card-body">
            <h3 class="scene-card-title">${scene.title}</h3>
            <p class="scene-card-description">${shortDescription}</p>
            <button onclick="editScene('${scene._id}')">Edit</button>
            <button onclick="deleteScene('${scene._id}')">Delete</button>
          </div>
        `;

        list.appendChild(card);
      });
    })
    .catch(err => console.error('Error loading editable scenes:', err));
}


function editScene(id) {
  fetch(`/api/admin/scenes/${id}`, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  })
    .then(res => res.json())
    .then(scene => {
      document.getElementById('editSceneId').value = scene._id;
      document.getElementById('editTitle').value = scene.title;
      document.getElementById('editDescription').value = scene.description || '';
      document.getElementById('editStory').value = scene.story || '';
      document.getElementById('editLink').value = scene.link || '';
      document.getElementById('editPrice').value = scene.price || '';
      document.getElementById('editAvailable').checked = scene.isAvailable || false;
      document.getElementById('editFeatured').checked = scene.featured || false;

      const gallery = document.getElementById('editGallery');
      gallery.innerHTML = '';
      (scene.images || []).forEach((img, index) => {
        const wrapper = document.createElement('div');
        wrapper.classList.add('image-wrapper');

        const image = document.createElement('img');
        image.src = `/${img}`;
        image.alt = 'Scene Image';

        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&times;';
        delBtn.className = 'delete-btn';
        delBtn.onclick = () => removeImage(scene._id, img);

        wrapper.appendChild(image);
        wrapper.appendChild(delBtn);
        gallery.appendChild(wrapper);
      });

      openEditModal();
    })
    .catch(err => alert('Failed to load scene: ' + err.message));
}
function removeImage(sceneId, imagePath) {
  if (!confirm('Delete this image from the gallery?')) {
    console.log('Image deletion cancelled by user.');
    return; // stop everything if cancelled
  }

  fetch(`/api/admin/scenes/${sceneId}/images`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: JSON.stringify({ image: imagePath })
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }
      return res.json();
    })
    .then(() => {
      alert('Image deleted');
      editScene(sceneId); // reload modal content
    })
    .catch(err => {
      console.error('Delete failed:', err);
      alert('Error deleting image: ' + err.message);
    });
}



function openEditModal() {
  document.getElementById('editModal').classList.add('show');
}

function closeEditModal() {
  document.getElementById('editModal').classList.remove('show');
}

function submitEditScene(e) {
  e.preventDefault();

  const id = document.getElementById('editSceneId').value;
  const formData = new FormData();

  formData.append('title', document.getElementById('editTitle').value);
  formData.append('description', document.getElementById('editDescription').value);
  formData.append('story', document.getElementById('editStory').value);
  formData.append('link', document.getElementById('editLink').value);
  formData.append('price', document.getElementById('editPrice').value);
  formData.append('isAvailable', document.getElementById('editAvailable').checked);
  formData.append('featured', document.getElementById('editFeatured').checked);

  const newFiles = document.getElementById('editImages').files;
  for (let i = 0; i < newFiles.length; i++) {
    formData.append('images', newFiles[i]);
  }

  fetch(`/api/admin/scenes/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    },
    body: formData
  })
    .then(res => res.json())
    .then(() => {
      alert('Scene updated successfully!');
      closeEditModal();
      showSection('editScenes');
    })
    .catch(err => alert('Failed to update scene: ' + err.message));
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
