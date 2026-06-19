const empInfo = JSON.parse(localStorage.getItem('user')) || {};
const empRole = empInfo.emp_role;
const empPosition = empInfo.emp_position;
const empDepartment = empInfo.emp_department;

const menuItems = {
  items: [
    {
      id: 'navigation',
      title: 'Navigation',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'home',
          children: [
            {
              id: 'data',
              title: 'Dashboard Analytics',
              type: 'item',
              url: '/dashboard'
            },
            {
              id: 'sales',
              title: 'Asset YTD Dashboard',
              type: 'item',
              url: '/asset-dashboard'
            },
            {
              id: 'new-oil',
              title: 'New Oil Dashboard',
              type: 'item',
              url: '/new-oil-dashboard'
            }
          ]
        }
      ]
    },
    {
      id: 'tools',
      title: 'Tools',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'all-asset',
          title: 'Asset Manager',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'precision_manufacturing',
          url: '/all-asset'
        },
        {
          id: 'all-analysis-report',
          title: 'Oil Analysis Report',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'snippet_folder',
          url: '/all-submit-asset'
        }
      ]
    },
    {
      id: 'admin-tools',
      title: 'Admin Tools',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'all-setup',
          title: 'Asset Option Setup',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'tune',
          url: '/all-option-setup'
        }
        // Only injected for mis_admin — see below
      ]
    },
    // ─── Bottom-pinned section ───────────────────────────────────────────────
    {
      id: 'bottom-section',
      title: 'Account',
      type: 'group',
      isBottom: true,          // custom flag — consumed by NavGroup / NavItem
      children: [
        {
          id: 'profile',
          title: 'Profile',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'person',
          url: '/profile'
        },
        {
          id: 'logout',
          title: 'Log Out',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'exit_to_app',   // corrected icon name
          url: '/logout'
        }
      ]
    }
  ]
};

// Only mis_admin can see the All Users menu item
if (empRole === 'mis_admin') {
  const adminToolsGroup = menuItems.items.find((item) => item.id === 'admin-tools');
  if (adminToolsGroup) {
    adminToolsGroup.children.push({
      id: 'all-users',
      title: 'All Users',
      type: 'item',
      icon: 'material-icons-two-tone',
      iconname: 'supervisor_account',
      url: '/all-users'
    });
  }
}

// If role is 'user', remove the entire admin-tools group
if (empRole === 'user') {
  menuItems.items = menuItems.items.filter((item) => item.id !== 'admin-tools');
}

export default menuItems;