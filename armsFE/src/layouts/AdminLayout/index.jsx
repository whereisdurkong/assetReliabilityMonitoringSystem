import { useContext, useEffect, Suspense } from 'react';
import { Outlet } from 'react-router-dom';

// project imports
import MobileHeader from './MobileHeader';
import Navigation from './Navigation';
import NavBar from './NavBar';
import Breadcrumb from './Breadcrumb';
import useWindowSize from 'hooks/useWindowSize';
import { ConfigContext } from 'contexts/ConfigContext';
import * as actionType from 'store/actions';
import Loader from 'components/Loader/Loader';

// -----------------------|| MAIN LAYOUT ||-----------------------//

export default function MainLayout() {
  const windowSize = useWindowSize();
  const configContext = useContext(ConfigContext);
  const bodyElement = document.body;
  const { collapseLayout } = configContext.state;
  const { dispatch } = configContext;
  useEffect(() => {
    if (windowSize.width > 992 && windowSize.width <= 1024) {
      dispatch({ type: actionType.COLLAPSE_MENU });
    }
  }, [dispatch, windowSize]);

  // if (windowSize.width <= 992) {
  //   bodyElement.classList.add('minimenu'); // Force minimenu on mobile
  // }

  if (windowSize.width > 992 && collapseLayout) {
    bodyElement.classList.add('minimenu');
  } else {
    bodyElement.classList.remove('minimenu');
  }

  let containerClass = ['pc-container'];

  let mainlayout = (
    <>
      <MobileHeader />

      <Navigation />
      <div className={containerClass.join(' ')}>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </div>
    </>
  );
  return <>{mainlayout}</>;
}
