import { lazy } from 'react';

import Mainlayout from 'layouts/AdminLayout';
import Maintenance from '../views/maintenance';
import SetupAllOptions from '../views/setup/setup_all_options';
import SetupOptionView from '../views/setup/setup_option_view';

//SAMPLE PAGES
const DashboardSales = lazy(() => import('../views/dashboard/DashSales/index'));
const Sample = lazy(() => import('../views/sample'));
const Typography = lazy(() => import('../views/ui-elements/basic/BasicTypography'));
const Color = lazy(() => import('../views/ui-elements/basic/BasicColor'));

const FeatherIcon = lazy(() => import('../views/ui-elements/icons/Feather'));
const FontAwesome = lazy(() => import('../views/ui-elements/icons/FontAwesome'));
const MaterialIcon = lazy(() => import('../views/ui-elements/icons/Material'));

//Authentication
const Login = lazy(() => import('../views/auth/login'));
const Register = lazy(() => import('../views/auth/register'));

const AddAsset = lazy(() => import('../views/assets/add-assets'));
const AllAssets = lazy(() => import('../views/assets/all-assets'));
const ViewAsset = lazy(() => import('../views/assets/view-asset'));

const AllSubmitAssets = lazy(() => import('../views/oil-analysis/all-submit-assets'));
const SubmitAsset = lazy(() => import('../views/oil-analysis/submit-asset'));

const AssetSetup = lazy(() => import('../views/setup/setup_options'))
const TrivectorSetup = lazy(() => import('../views/setup/setup_option_trivector'))


import ViewSubmittedAsset from '../views/oil-analysis/view-submitted-asset';
const Test = lazy(() => import('../views/oil-analysis/test'))

const Access = () => {

  if (localStorage.getItem('user') === null) {
    return window.location.replace(`/`);
  } else {
    return <Mainlayout />
  }
}



const MainRoutes = {
  path: '/',
  element: <Access />,
  children: [
    {
      path: '/dashboard',
      element: <DashboardSales />
    },
    {
      path: '/typography',
      element: <Typography />
    },
    {
      path: '/color',
      element: <Color />
    },
    {
      path: '/icons/Feather',
      element: <FeatherIcon />
    },
    {
      path: '/icons/font-awesome-5',
      element: <FontAwesome />
    },
    {
      path: '/icons/material',
      element: <MaterialIcon />
    },
    {
      path: '/register',
      element: <Register />
    },
    {
      path: '/sample-page',
      element: <Sample />
    },

    ///////////////
    {
      path: '/add-asset',
      element: <AddAsset />
    },
    {
      path: '/all-asset',
      element: <AllAssets />
    },
    {
      path: '/view-asset',
      element: <ViewAsset />
    },
    {
      path: '/add-A-R',
      element: < SubmitAsset />
    },
    {
      path: '/all-submit-asset',
      element: <AllSubmitAssets />
    },
    {
      path: '/view-submitted-asset',
      element: <ViewSubmittedAsset />
    },
    {
      path: '/maintenance',
      element: <Maintenance />
    },


    {
      path: '/add-setup',
      element: <AssetSetup />
    },
    {
      path: '/view-setup-options',
      element: <SetupOptionView />
    },
    {
      path: '/all-option-setup',
      element: <SetupAllOptions />
    },

    {
      path: '/add-trivector-setup',
      element: <TrivectorSetup />
    },

    {
      path: '/test',
      element: <Test />
    },



  ]
}




export default MainRoutes;
