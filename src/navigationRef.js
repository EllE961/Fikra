import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef();

// Helper function to navigate from anywhere in the app
export function navigate(name, params) {
  if (navigationRef.isReady()) {
    console.log(`Navigating to ${name} via global navigationRef`);
    navigationRef.navigate(name, params);
  } else {
    console.warn('Navigation attempted before navigationRef was ready');
  }
}

// Helper function to reset the navigation state
export function resetRoot(state = { index: 0, routes: [{ name: 'Auth' }] }) {
  if (navigationRef.isReady()) {
    console.log(`Resetting navigation to ${state.routes[0].name} via global navigationRef`);
    navigationRef.dispatch(
      CommonActions.reset(state)
    );
  } else {
    console.warn('Navigation reset attempted before navigationRef was ready');
  }
}

// Helper function to trigger a fresh auth check
export function refreshRootNavigation() {
  if (navigationRef.isReady()) {
    console.log('Refreshing root navigation via global navigationRef');
    navigationRef.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'RefreshAuth' }],
      })
    );
  } else {
    console.warn('Navigation refresh attempted before navigationRef was ready');
  }
}

// Simplified helper for safely navigating to MainTabs
export function navigateToMainTabs() {
  console.log("Attempting to navigate to MainTabs");
  
  if (navigationRef.isReady()) {
    // The safest way is to go via RefreshAuth
    console.log("Navigating via RefreshAuth");
    refreshRootNavigation();
  } else {
    console.warn("NavigationRef not ready, cannot navigate to MainTabs");
  }
}
