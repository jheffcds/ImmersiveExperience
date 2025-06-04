<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Settings</title>
  <link rel="stylesheet" href="styles.css" />
  <style>
    .settings-container {
      max-width: 600px;
      margin: 2rem auto;
      padding: 2rem;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    .settings-container h2 {
      margin-bottom: 1rem;
    }

    .settings-container label {
      display: block;
      margin-top: 1rem;
    }

    .settings-container input {
      width: 100%;
      padding: 0.5rem;
      margin-top: 0.25rem;
    }

    .actions {
      margin-top: 2rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .actions button {
      padding: 0.75rem;
    }

    .delete-button {
      background-color: #e53935;
      color: white;
    }
  </style>
</head>
<body>
  <div class="settings-container">
    <h2>Profile Settings</h2>
    <form id="settingsForm">
      <label>
        Name
        <input type="text" id="settingsName" name="name" />
      </label>

      <label>
        Email
        <input type="email" id="settingsEmail" name="email" />
      </label>

      <label>
        Address
        <input type="text" id="settingsAddress" name="address" />
      </label>

      <label>
        Profile Picture
        <input type="file" name="profilePicture" />
      </label>

      <div class="actions">
        <button type="submit">Update Profile</button>
        <button type="button" id="changePasswordBtn">Change Password</button>
        <button type="button" id="deleteAccountBtn" class="delete-button">Delete Profile</button>
      </div>
    </form>
  </div>

  <script src="js/settings.js"></script>
</body>
</html>
