import { useEffect, useState } from 'react';
import { checkGtfsHealth } from '../lib/otp';

export default function SystemHealthChip() {
  const [health, setHealth] = useState<'ok' | 'down'>('down');

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    async function checkHealth() {
      const result = await checkGtfsHealth();
      setHealth(result);
      timeoutId = setTimeout(checkHealth, 10000); // Check every 10 seconds
    }

    checkHealth();

    return () => clearTimeout(timeoutId);
  }, []);

  const isOnline = health === 'ok';

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
        <div className="text-xs font-semibold text-gray-700">
          {isOnline ? 'GTFS Online' : 'GTFS Offline'}
        </div>
      </div>
    </div>
  );
}
