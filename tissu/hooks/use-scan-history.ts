import { useState, useEffect, useCallback } from 'react';
import { supabase, ScanRecord } from '@/lib/supabase';

export function useScanHistory() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    setLoading(true);
    const { data } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (data) setHistory(data as ScanRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function saveScan(scan: Omit<ScanRecord, 'id' | 'created_at'>) {
    await supabase.from('scans').insert([scan]);
    fetchHistory();
  }

  return { history, loading, saveScan, fetchHistory };
}
