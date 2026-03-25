import { useState, useEffect, useCallback } from 'react';
import { supabase, ScanRecord } from '@/lib/supabase';

export function useScanHistory() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      console.log('[scan-history] No authenticated user, skipping fetch');
      return;
    }

    setLoading(true);
    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('[scan-history] Failed to fetch history:', error.message);
    }
    if (data) setHistory(data as ScanRecord[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function saveScan(scan: Omit<ScanRecord, 'id' | 'created_at'>): Promise<boolean> {
    console.log('[scan-history] Saving scan, user_id:', scan.user_id, 'type:', scan.type);

    const { error } = await supabase.from('scans').insert([scan]);
    if (error) {
      console.error('[scan-history] Failed to save scan:', error.message, error.details);
      return false;
    }

    console.log('[scan-history] Scan saved successfully');
    await fetchHistory();
    return true;
  }

  return { history, loading, saveScan, fetchHistory };
}
