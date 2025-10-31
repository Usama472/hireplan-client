// Unregister any old service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister().then(function(success) {
        if (success) {
          console.log('✅ Service worker unregistered successfully');
        }
      });
    }
  }).catch(function(err) {
    console.log('Service worker unregistration failed: ', err);
  });
}

