import { useEffect, useState, useRef } from 'react';
import screenfull from 'screenfull';

export default function useFullScreen() {
  const [isFullScreen, setIsFullScreen] = useState(false);

  const ref = useRef(null);

  useEffect(() => {
    const handler = () => screenfull.isEnabled && !screenfull.isFullscreen && setIsFullScreen(false);

    if (screenfull.isEnabled) {
      screenfull.on('change', handler);
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off('change', handler);
      }
    };
  }, []);

  useEffect(() => {
    if (screenfull.isEnabled) {
      isFullScreen ? !screenfull.isFullscreen && screenfull.request(ref.current || undefined) : screenfull.isFullscreen && screenfull.exit();
    }

    return () => {
      if (screenfull.isEnabled && screenfull.isFullscreen) screenfull.exit();
    };
  }, [isFullScreen]);

  return { isFullScreen, setIsFullScreen, ref };
}
