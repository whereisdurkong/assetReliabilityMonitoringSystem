import { lazy } from 'react';

import Mainlayout from 'layouts/AdminLayout';
import Maintenance from '../views/maintenance';
import SetupAllOptions from '../views/setup/setup_all_options';
import SetupOptionView from '../views/setup/setup_option_view';

//SAMPLE PAGES
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
const AssetDashboard = lazy(() => import('../views/dashboard/assetdashboard'))

const AssetMonitoring = lazy(() => import('../views/assets/assetMonitoring'));
const AddMonitoringLog = lazy(() => import('../views/assets/add-assetMonitoring'))

const AllSubmitAssets = lazy(() => import('../views/oil-analysis/all-submit-assets'));
const SubmitAsset = lazy(() => import('../views/oil-analysis/submit-asset'));

const AssetSetup = lazy(() => import('../views/setup/setup_options'))
const TrivectorSetup = lazy(() => import('../views/setup/setup_option_trivector'))

const AllUsers = lazy(() => import('../views/auth/allusers'))
const ViewUser = lazy(() => import('../views/auth/view-user'))

const Logout = lazy(() => import('../views/auth/logout'))

// import ViewSubmittedAsset from '../views/oil-analysis/view-submitted-asset';

const ViewSubmittedAsset = lazy(() => import('../views/oil-analysis/view-submitted-asset'))

const NewOilDashboard = lazy(() => import('../views/dashboard/newoil'))
const Profile = lazy(() => import('../views/auth/profile'))

const ViewSubmittedNoAsset = lazy(() => import('../views/oil-analysis/view-submitted-no-asset'))
const SubmitAssetNewOil = lazy(() => import('../views/oil-analysis/submit-asset-new-oil'))


const DataAnalytic = lazy(() => import('../views/dashboard/dashboard'))
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
      path: '/all-users',
      element: <AllUsers />
    },
    {
      path: '/view-user',
      element: <ViewUser />
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
      path: '/asset-dashboard',
      element: <AssetDashboard />
    },

    {
      path: '/dashboard',
      element: <DataAnalytic />
    },

    {
      path: '/asset-monitoring',
      element: <AssetMonitoring />
    },
    {
      path: '/add-monitoring-log',
      element: <AddMonitoringLog />
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
      path: '/submit-new-oil-analysis',
      element: <SubmitAssetNewOil />
    },
    {
      path: '/view-submitted-asset-no-asset',
      element: <ViewSubmittedNoAsset />
    },
    {
      path: '/new-oil-dashboard',
      element: <NewOilDashboard />
    },
    {
      path: '/test',
      element: <Test />
    },

    {
      path: '/logout',
      element: <Logout />
    },
    {
      path: '/profile',
      element: <Profile />
    }



  ]
}




export default MainRoutes;
