import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useListenerCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const uniqueKey = typeof crypto !== 'undefined' && crypto.randomUUID 
      ? crypto.randomUUID() 
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const channel = supabase.channel('listeners', {
      config: { presence: { key: uniqueKey } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        setCount(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ online_at: new Date().toISOString() });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  return count;
}
