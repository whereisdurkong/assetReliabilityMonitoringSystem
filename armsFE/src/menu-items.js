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
              id: 'data',
              title: 'Data Analytic',
              type: 'item',
              url: '/dashboard'
            },
            {
              id: 'sales',
              title: 'Asset YTD Dashboard',
              type: 'item',
              url: '/asset-dashboard'
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
        // {
        //   id: 'register',
        //   title: 'Registration',
        //   type: 'item',
        //   icon: 'material-icons-two-tone',
        //   iconname: 'supervisor_account',
        //   url: '/register'

        // },
        {
          id: 'all-users',
          title: 'All Users',
          type: 'item',
          icon: 'material-icons-two-tone',
          iconname: 'supervisor_account',
          url: '/all-users'

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
