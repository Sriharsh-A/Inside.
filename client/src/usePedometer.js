// client/src/usePedometer.js
import { useState, useEffect } from 'react';

export function usePedometer() {
  const [steps, setSteps] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = async () => {
    // iOS 13+ requires explicit permission
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        }
      } catch (e) {
        console.error(e);
      }
    } else {
      // Android / Non-iOS 13+ devices don't need permission
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;

    let lastMagnitude = 0;
    let limit = 15; // Sensitivity threshold (Lower = more sensitive)

    const handleMotion = (event) => {
      const x = event.accelerationIncludingGravity.x;
      const y = event.accelerationIncludingGravity.y;
      const z = event.accelerationIncludingGravity.z;

      // Calculate total magnitude of movement
      const magnitude = Math.sqrt(x * x + y * y + z * z);
      const delta = Math.abs(magnitude - lastMagnitude);

      // If movement is sharp enough, count as a step
      if (delta > limit) {
        setSteps(prev => prev + 1);
      }

      lastMagnitude = magnitude;
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [permissionGranted]);

  return { liveSteps: steps, requestPermission, permissionGranted };
}