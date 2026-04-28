// Menu configuration for default layout
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
              id: 'sales',
              title: 'Sales',
              type: 'item',
              url: '/dashboard'
            }
          ]
        }
      ]
    },
    // {
    //   id: 'Authenticaiton',
    //   title: 'Sample Pages',
    //   type: 'group',
    //   icon: 'icon-navigation',
    //   children: [
    //     {
    //       id: 'register',
    //       title: 'Register',
    //       type: 'item',
    //       icon: 'material-icons-two-tone',
    //       iconname: 'home',
    //       url: '/register'

    //     }
    //   ]
    // },
    {
      id: 'assets',
      title: 'asset manager',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'add-asset',
          title: 'Add New Asset',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'add_box',
          url: '/add-asset'

        },
        {
          id: 'all-asset',
          title: 'All Asset',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'precision_manufacturing',
          url: '/all-asset'

        },

      ]
    },
    {
      id: 'analysis-reports',
      title: 'Analysis Reports',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        {
          id: 'Create Analysis Report',
          title: 'Create Analysis Report',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'note_add',
          url: '/add-A-R'

        },
        {
          id: 'all-analysis-report',
          title: 'All Oil Analysis Report',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'snippet_folder',
          url: '/all-submit-asset'
        },

      ]
    },

    {
      id: 'admin-tools',
      title: 'Admin Tools',
      type: 'group',
      icon: 'icon-navigation',
      children: [
        // {
        //   id: 'add-setup',
        //   title: 'Add Setup',
        //   type: 'item',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'home',
        //   url: '/add-setup'
        // },
        {
          id: 'all-setup',
          title: 'Asset Option Setup',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'tune',
          url: '/all-option-setup'
        },
        {
          id: 'register',
          title: 'Registration',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'supervisor_account',
          url: '/register'

        }
        // {
        //   id: 'add-trivector-setup',
        //   title: 'Add Trivector Setup',
        //   type: 'item',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'home',
        //   url: '/add-trivector-setup'

        // }
      ]
    },
    {
      id: 'ui-element',
      title: 'ELEMENTS',
      subtitle: 'UI Components',
      type: 'group',
      icon: 'icon-ui',
      children: [
        {
          id: 'typography',
          title: 'Typography',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'text_fields',
          url: '/typography'
        },
        {
          id: 'color',
          title: 'Color',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'color_lens',
          url: '/color'
        },
        {
          id: 'icons',
          title: 'Icons',
          type: 'collapse',
          icon: 'material-icons-two-tone',
          iconname: 'history_edu',
          children: [
            {
              id: 'feather',
              title: 'Feather',
              type: 'item',
              url: '/icons/Feather'
            },
            {
              id: 'font-awesome-5',
              title: 'Font Awesome',
              type: 'item',
              url: '/icons/font-awesome-5'
            },
            {
              id: 'material',
              title: 'Material',
              type: 'item',
              url: '/icons/material'
            }
          ]
        }
      ]
    }
  ]
};

export default menuItems;
