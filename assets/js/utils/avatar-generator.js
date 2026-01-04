/**
 * Illustrated Avatar Generator
 * Uses DiceBear API for Notion-like illustrated avatars
 * ES5 Compatible
 */

if (!window.ERM) window.ERM = {};

ERM.avatarGenerator = {

  /**
   * DiceBear avatar styles - Notion-style black/white illustrated faces
   * 6 options: 3 variations of notionists and notionists-neutral
   */
  avatarStyles: [
    'notionists',         // Notion-like illustrated faces
    'notionists-neutral', // Neutral Notion style (simpler faces)
    'notionists',         // Different seed variant
    'notionists-neutral', // Different seed variant
    'notionists',         // Different seed variant
    'notionists-neutral'  // Different seed variant
  ],

  /**
   * Seed modifiers for variety within same style
   */
  seedModifiers: ['', '_m', '_f', '_a', '_b', '_c'],

  /**
   * Default style for new users
   */
  defaultStyle: 'notionists',

  /**
   * Get DiceBear avatar URL - black/white Notion style
   */
  getAvatarUrl: function(seed, style, size) {
    style = style || this.defaultStyle;
    size = size || 128;

    // Use DiceBear API v9 - black/white Notion-style
    var baseUrl = 'https://api.dicebear.com/9.x/' + style + '/svg';
    var params = '?seed=' + encodeURIComponent(seed);
    params += '&size=' + size;
    // White/light gray background for clean Notion-like appearance
    params += '&backgroundColor=ffffff,f3f4f6,e5e7eb';

    return baseUrl + params;
  },

  /**
   * Get initials from name (fallback)
   */
  getInitials: function(name) {
    if (!name) return 'U';

    var parts = name.trim().split(' ').filter(function(part) {
      return part.length > 0;
    });

    if (parts.length === 0) return 'U';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  },

  /**
   * Get consistent style index for user
   */
  getUserStyleIndex: function(identifier) {
    if (!identifier) return 0;

    var hash = 0;
    for (var i = 0; i < identifier.length; i++) {
      var char = identifier.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }

    return Math.abs(hash) % this.avatarStyles.length;
  },

  /**
   * Initialize user avatar on first login
   */
  initializeUserAvatar: function(user) {
    var existingAvatar = ERM.storage.get('userAvatar');

    if (existingAvatar) {
      return existingAvatar;
    }

    // Generate illustrated avatar using DiceBear
    var seed = user.email || user.name || user.id || 'user';
    var styleIndex = this.getUserStyleIndex(seed);
    var style = this.avatarStyles[styleIndex];

    var avatarData = {
      type: 'dicebear',
      seed: seed,
      style: style,
      url: this.getAvatarUrl(seed, style, 128),
      createdAt: new Date().toISOString()
    };

    ERM.storage.set('userAvatar', avatarData);

    return avatarData;
  },

  /**
   * Generate avatar with specific style
   */
  generateWithStyle: function(seed, style) {
    return {
      type: 'dicebear',
      seed: seed,
      style: style,
      url: this.getAvatarUrl(seed, style, 128),
      createdAt: new Date().toISOString()
    };
  },

  /**
   * Get multiple avatar options for user to choose from
   * Returns 6 unique black/white Notion-style faces
   */
  getAvatarOptions: function(seed, count) {
    count = count || 6;
    var options = [];

    for (var i = 0; i < count; i++) {
      var style = this.avatarStyles[i % this.avatarStyles.length];
      var modifier = this.seedModifiers[i] || '';
      var modifiedSeed = seed + modifier;

      options.push({
        style: style,
        url: this.getAvatarUrl(modifiedSeed, style, 128),
        seed: modifiedSeed
      });
    }

    return options;
  },

  /**
   * Upload custom avatar image
   */
  uploadAvatar: function(fileInput, callback) {
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      if (callback) callback(new Error('No file selected'));
      return;
    }

    var file = fileInput.files[0];

    // Validate file type
    if (!file.type.match(/image.*/)) {
      if (callback) callback(new Error('Please select an image file'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      if (callback) callback(new Error('Image must be less than 5MB'));
      return;
    }

    // Read file as data URL
    var reader = new FileReader();

    reader.onload = function(e) {
      var avatarData = {
        type: 'image',
        url: e.target.result,
        uploadedAt: new Date().toISOString()
      };

      if (callback) callback(null, avatarData);
    };

    reader.onerror = function() {
      if (callback) callback(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  },

  /**
   * Randomize avatar (get new random style and seed)
   */
  randomizeAvatar: function(user) {
    var baseSeed = user.email || user.name || user.id || 'user';
    // Add timestamp to seed for randomization
    var seed = baseSeed + '_' + Date.now();

    var randomStyleIndex = Math.floor(Math.random() * this.avatarStyles.length);
    var style = this.avatarStyles[randomStyleIndex];

    var avatarData = {
      type: 'dicebear',
      seed: seed,
      style: style,
      url: this.getAvatarUrl(seed, style, 128),
      createdAt: new Date().toISOString()
    };

    ERM.storage.set('userAvatar', avatarData);

    return avatarData;
  },

  /**
   * Update header avatar (in navigation)
   */
  updateHeaderAvatar: function(avatarData) {
    var headerAvatarEl = document.querySelector('.header-user .user-avatar');
    if (!headerAvatarEl) return;

    if (avatarData && avatarData.type === 'image') {
      // Custom uploaded image
      headerAvatarEl.innerHTML = '<img src="' + avatarData.url + '" alt="Avatar" class="avatar-img" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">';
      headerAvatarEl.classList.add('has-avatar');

    } else if (avatarData && avatarData.type === 'dicebear') {
      // DiceBear illustrated avatar
      headerAvatarEl.innerHTML = '<img src="' + avatarData.url + '" alt="Avatar" class="avatar-img dicebear-avatar" style="width:100%;height:100%;border-radius:50%;">';
      headerAvatarEl.classList.add('has-avatar');

    } else {
      // Fallback to initials - keep existing content
      headerAvatarEl.classList.remove('has-avatar');
    }
  },

  /**
   * Update profile page avatar
   */
  updateProfileAvatar: function(avatarData) {
    var profileAvatarEl = document.getElementById('user-avatar');
    if (!profileAvatarEl) return;

    var initialsEl = document.getElementById('avatar-initials');

    if (avatarData && (avatarData.type === 'image' || avatarData.type === 'dicebear')) {
      // Image or DiceBear avatar
      profileAvatarEl.innerHTML = '<img src="' + avatarData.url + '" alt="Profile" class="avatar-img" style="width:100%;height:100%;border-radius:50%;"/>';
      profileAvatarEl.classList.add('has-avatar');

      if (initialsEl) initialsEl.style.display = 'none';

    } else {
      // Fallback to initials
      profileAvatarEl.classList.remove('has-avatar');

      if (initialsEl) {
        initialsEl.style.display = 'flex';
        var user = ERM.storage.get('user') || {};
        initialsEl.textContent = this.getInitials(user.name);
      }
    }
  }
};

console.log('Avatar Generator loaded - using DiceBear illustrated avatars');
