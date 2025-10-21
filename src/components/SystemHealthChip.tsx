import { useEffect, useState } from 'react';
import { checkAllHealth } from '../lib/otp';

export default function SystemHealthChip() {
  const [health, setHealth] = useState<{
    transmodel: 'ok' | 'down';
    gtfs: 'ok' | 'down';
  }>({ transmodel: 'down', gtfs: 'down' });

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    async function checkHealth() {
      const result = await checkAllHealth();
      setHealth(result);
      timeoutId = setTimeout(checkHealth, 10000); // Check every 10 seconds
    }

    checkHealth();

    return () => clearTimeout(timeoutId);
  }, []);

  const allOk = health.transmodel === 'ok' && health.gtfs === 'ok';
  const allDown = health.transmodel === 'down' && health.gtfs === 'down';

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="px-3 py-2 flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${allOk ? 'bg-green-500' : allDown ? 'bg-red-500' : 'bg-yellow-500'} ${allOk ? 'animate-pulse' : ''}`}></div>
        <div className="text-xs font-semibold text-gray-700">
          {allOk ? 'System Online' : allDown ? 'System Offline' : 'Partial'}
        </div>
      </div>
      <div className="bg-gray-50 px-3 py-1.5 border-t border-gray-100 text-[10px] text-gray-600 flex items-center gap-3">
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${health.transmodel === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">TM</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-1.5 h-1.5 rounded-full ${health.gtfs === 'ok' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="font-medium">GTFS</span>
        </div>
      </div>
    </div>
  );
}
