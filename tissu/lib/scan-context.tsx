import { createContext, useContext, useState, ReactNode } from 'react';
import { AnalysisResult } from './supabase';

interface ScanContextValue {
  currentResult: AnalysisResult | null;
  currentType: 'label' | 'url' | null;
  setCurrentResult: (result: AnalysisResult, type: 'label' | 'url') => void;
  clearResult: () => void;
}

const ScanContext = createContext<ScanContextValue>({
  currentResult: null,
  currentType: null,
  setCurrentResult: () => {},
  clearResult: () => {},
});

export function ScanProvider({ children }: { children: ReactNode }) {
  const [currentResult, setResult] = useState<AnalysisResult | null>(null);
  const [currentType, setType] = useState<'label' | 'url' | null>(null);

  function setCurrentResult(result: AnalysisResult, type: 'label' | 'url') {
    setResult(result);
    setType(type);
  }

  function clearResult() {
    setResult(null);
    setType(null);
  }

  return (
    <ScanContext.Provider value={{ currentResult, currentType, setCurrentResult, clearResult }}>
      {children}
    </ScanContext.Provider>
  );
}

export function useScan() {
  return useContext(ScanContext);
}
