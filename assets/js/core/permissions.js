/**
 * Dimeri ERM - Permissions & Role-Based Access Control
 * Manages user permissions for workspace owners and members
 */

(function () {
  "use strict";

  // Initialize ERM namespace
  window.ERM = window.ERM || {};

  /**
   * Permission Management System
   * Handles all role-based access control (RBAC) for the application
   */
  ERM.permissions = {
    /**
     * Check if current user is workspace owner
     * @returns {boolean} True if user is owner
     */
    isOwner: function () {
      var user = ERM.state.user;
      return user && user.isOwner === true;
    },

    /**
     * Check if current user is a member (not owner)
     * @returns {boolean} True if user is member
     */
    isMember: function () {
      return !this.isOwner();
    },

    /**
     * Check if user can manage team (invite, remove, change roles)
     * Only workspace owner can manage team
     * @returns {boolean} True if user can manage team
     */
    canManageTeam: function () {
      return this.isOwner();
    },

    /**
     * Check if user can invite members
     * Only workspace owner can invite
     * @returns {boolean} True if user can invite
     */
    canInviteMembers: function () {
      return this.isOwner();
    },

    /**
     * Check if user can remove members
     * Only workspace owner can remove
     * @returns {boolean} True if user can remove members
     */
    canRemoveMembers: function () {
      return this.isOwner();
    },

    /**
     * Check if user can change member roles
     * Only workspace owner can change roles
     * @returns {boolean} True if user can change roles
     */
    canChangeRoles: function () {
      return this.isOwner();
    },

    /**
     * Check if user can edit workspace settings
     * Only workspace owner can edit settings
     * @returns {boolean} True if user can edit settings
     */
    canEditSettings: function () {
      return this.isOwner();
    },

    /**
     * Check if user can transfer ownership
     * Only workspace owner can transfer
     * @returns {boolean} True if user can transfer ownership
     */
    canTransferOwnership: function () {
      return this.isOwner();
    },

    /**
     * Check if user can delete workspace
     * Only workspace owner can delete
     * @returns {boolean} True if user can delete workspace
     */
    canDeleteWorkspace: function () {
      return this.isOwner();
    },

    /**
     * Get role display name
     * @param {boolean} isOwner - Whether user is owner
     * @returns {string} Role display name
     */
    getRoleName: function (isOwner) {
      return isOwner ? "Owner" : "Member";
    },

    /**
     * Get role badge HTML
     * @param {boolean} isOwner - Whether user is owner
     * @returns {string} HTML for role badge
     */
    getRoleBadge: function (isOwner) {
      if (isOwner) {
        return '<span class="role-badge owner">Owner</span>';
      }
      return '<span class="role-badge member">Member</span>';
    },

    /**
     * Show permission denied message
     * @param {string} action - The action that was denied
     */
    showPermissionDenied: function (action) {
      var message = action || "perform this action";
      ERM.toast.error("Only the workspace owner can " + message);
    },

    /**
     * Check permission and show error if denied
     * @param {string} permissionType - Type of permission to check
     * @param {string} actionMessage - Message to show if denied
     * @returns {boolean} True if permission granted
     */
    checkPermission: function (permissionType, actionMessage) {
      var hasPermission = false;

      switch (permissionType) {
        case "manageTeam":
          hasPermission = this.canManageTeam();
          break;
        case "invite":
          hasPermission = this.canInviteMembers();
          break;
        case "remove":
          hasPermission = this.canRemoveMembers();
          break;
        case "changeRoles":
          hasPermission = this.canChangeRoles();
          break;
        case "editSettings":
          hasPermission = this.canEditSettings();
          break;
        case "transfer":
          hasPermission = this.canTransferOwnership();
          break;
        case "delete":
          hasPermission = this.canDeleteWorkspace();
          break;
        default:
          hasPermission = false;
      }

      if (!hasPermission && actionMessage) {
        this.showPermissionDenied(actionMessage);
      }

      return hasPermission;
    },

    /**
     * Get current user's workspace role info
     * @returns {object} Role information
     */
    getCurrentUserRole: function () {
      var user = ERM.state.user;
      if (!user) {
        return {
          isOwner: false,
          roleName: "Guest",
          canManageTeam: false,
          canInvite: false,
          canRemove: false,
          canEdit: false,
        };
      }

      return {
        isOwner: user.isOwner || false,
        roleName: this.getRoleName(user.isOwner),
        canManageTeam: this.canManageTeam(),
        canInvite: this.canInviteMembers(),
        canRemove: this.canRemoveMembers(),
        canEdit: this.canEditSettings(),
      };
    },
  };

  console.log("Permissions module loaded");
})();
