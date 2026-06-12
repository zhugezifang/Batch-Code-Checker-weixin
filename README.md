'use client';

import { getDictionary } from "@/i18n/get-dictionary"
import type { Locale } from "@/i18n/config"
import React, { useState, useRef, useEffect } from 'react';

interface BatchCodeResult {
  batchCode: string;
  manufacturingDate: string;
  manufacturingYear: number;
  productAge: {
    years: number;
    months: number;
    yearsText: string;
    monthsText: string;
  };
  isExpired: boolean;
  isValid: boolean;
}

export default function RednoteVideoDownloader({
  lang,
  dict,
  code
}: {
  lang: Locale,
  dict: any,
  code?: string
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [selectedOption, setSelectedOption] = useState<string>('');
  const [batchNumber, setBatchNumber] = useState<string>('');
  const [batchCodeResult, setBatchCodeResult] = useState<BatchCodeResult | null>(null);
  
  // Searchable dropdown states
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Create a safe reference to batchCodeChecker
  const batchCodeDict = dict.home.batchCodeChecker;

  const options: { value: string, label: string }[] = [
  ];

  if (dict?.home?.supportBrands && Array.isArray(dict.home.supportBrands)) {
    dict.home.supportBrands.forEach((option: { value: string, label: string }) => {
      options.push({ value: option.value, label: option.label });
    });
  }
  
  // Initialize selected option from code prop
  useEffect(() => {
    if (code && code.trim()) {
      const foundOption = options.find(opt => opt.value === code);
      if (foundOption) {
        setSelectedOption(code);
        setSearchQuery(foundOption.label);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);
  
  // Filter options based on search query
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle option selection
  const handleOptionSelect = (value: string, label: string) => {
    setSelectedOption(value);
    setSearchQuery(label);
    setIsDropdownOpen(false);
  };
  
  // Get selected option label
  const selectedOptionLabel = options.find(opt => opt.value === selectedOption)?.label || '';

  // Batch code parsing function
  const parseBatchCode = (n: string): BatchCodeResult | null => {
    const yearMap: { [key: string]: number } = {
      A: 2026,
      B: 2005,
      C: 2006,
      D: 2007,
      E: 2008,
      F: 2009,
      G: 2010,
      H: 2011,
      I: 2012,
      J: 2012,
      K: 2013,
      L: 2014,
      M: 2015,
      N: 2016,
      P: 2017,
      R: 2018,
      S: 2019,
      T: 2020,
      U: 2021,
      V: 2021,
      W: 2022,
      X: 2023,
      Y: 2024,
      Z: 2025
    };

    const monthNameMap: { [key: string]: string } = {
      '1': batchCodeDict.monthNames.january,
      '2': batchCodeDict.monthNames.february,
      '3': batchCodeDict.monthNames.march,
      '4': batchCodeDict.monthNames.april,
      '5': batchCodeDict.monthNames.may,
      '6': batchCodeDict.monthNames.june,
      '7': batchCodeDict.monthNames.july,
      '8': batchCodeDict.monthNames.august,
      '9': batchCodeDict.monthNames.september,
      'O': batchCodeDict.monthNames.october,
      '0': batchCodeDict.monthNames.october,
      'N': batchCodeDict.monthNames.november,
      'D': batchCodeDict.monthNames.december
    };

    const monthNumberMap: { [key: string]: number } = {
      '1': 1,
      '2': 2,
      '3': 3,
      '4': 4,
      '5': 5,
      '6': 6,
      '7': 7,
      '8': 8,
      '9': 9,
      'O': 10,
      '0': 10,
      'N': 11,
      'D': 12
    };

    let manufacturingDate: Date;
    let monthName: string;
    let year: number;

    // Format 1: 5 or 6 digit numeric code (e.g., "12345" or "123456")
    if ((n.length === 5 || n.length === 6) && /^\d+$/.test(n)) {
      const firstDigit = parseInt(n.charAt(0), 10);
      const monthNum = parseInt(n.substring(1, 3), 10);
      
      year = firstDigit > 2 ? firstDigit + 2010 : firstDigit + 2020;
      
      if (monthNum === 0 || monthNum > 12) {
        return null; // Invalid
      }
      
      const monthMap: { [key: string]: string } = {
        "01": batchCodeDict.monthNames.january,
        "02": batchCodeDict.monthNames.february,
        "03": batchCodeDict.monthNames.march,
        "04": batchCodeDict.monthNames.april,
        "05": batchCodeDict.monthNames.may,
        "06": batchCodeDict.monthNames.june,
        "07": batchCodeDict.monthNames.july,
        "08": batchCodeDict.monthNames.august,
        "09": batchCodeDict.monthNames.september,
        "10": batchCodeDict.monthNames.october,
        "11": batchCodeDict.monthNames.november,
        "12": batchCodeDict.monthNames.december
      };
      
      monthName = monthMap[monthNum.toString().padStart(2, "0")];
      manufacturingDate = new Date(year, monthNum - 1);
    }
    // Format 2: Two letters followed by 3 digits (e.g., "AB123")
    else if (/^[A-Z][A-Z]/i.test(n.substring(0, 2)) && /^\d{3}$/.test(n.substring(2, 5))) {
      year = yearMap[n.charAt(1).toUpperCase()];
      const dayOfYear = parseInt(n.substring(2, 5), 10);
      
      if (!year || dayOfYear === 0 || dayOfYear > 365) {
        return null; // Invalid
      }
      
      manufacturingDate = new Date(year, 0);
      manufacturingDate.setDate(dayOfYear);
      // Get month index (0-11) and map to translated month name
      const monthIndex = manufacturingDate.getMonth();
      const monthNames = [
        batchCodeDict.monthNames.january,
        batchCodeDict.monthNames.february,
        batchCodeDict.monthNames.march,
        batchCodeDict.monthNames.april,
        batchCodeDict.monthNames.may,
        batchCodeDict.monthNames.june,
        batchCodeDict.monthNames.july,
        batchCodeDict.monthNames.august,
        batchCodeDict.monthNames.september,
        batchCodeDict.monthNames.october,
        batchCodeDict.monthNames.november,
        batchCodeDict.monthNames.december
      ];
      monthName = monthNames[monthIndex];
    }
    // Format 3: Invalid length
    else if (n.length < 5 || n.length > 10) {
      return null; // Invalid
    }
    // Format 4: Standard format (e.g., "XXYMM...")
    else {
      year = yearMap[n.charAt(2).toUpperCase()];
      const monthNum = monthNumberMap[n.charAt(3).toUpperCase()];
      
      if (!year || !monthNum) {
        return null; // Invalid
      }
      
      manufacturingDate = new Date(year, monthNum - 1);
      monthName = monthNameMap[n.charAt(3).toUpperCase()];
    }

    const now = new Date();
    const monthsDiff = (now.getFullYear() - year) * 12 + now.getMonth() - manufacturingDate.getMonth();
    
    // Check if manufacturing date is in the future
    if (manufacturingDate > now || monthsDiff < 0) {
      return null; // Invalid
    }

    const years = Math.floor(monthsDiff / 12);
    const months = monthsDiff % 12;
    const yearsText = years === 1 ? batchCodeDict.year : batchCodeDict.years;
    const monthsText = months === 1 ? batchCodeDict.month : batchCodeDict.months;

    // Check if expired (3 years from manufacturing date)
    const expiryDate = new Date(manufacturingDate);
    expiryDate.setFullYear(manufacturingDate.getFullYear() + 3);
    const isExpired = now > expiryDate;

    return {
      batchCode: n.toUpperCase(),
      manufacturingDate: monthName,
      manufacturingYear: year,
      productAge: {
        years,
        months,
        yearsText,
        monthsText
      },
      isExpired,
      isValid: true
    };
  };

  const handleDownload = async () => {
    if (!batchNumber.trim()) {
      setError(batchCodeDict.batchCodeRequired);
      return;
    }

    setLoading(true);
    setError('');
    setBatchCodeResult(null);
    //暂停2s
    await new Promise(resolve => setTimeout(resolve, 10000)); // 2 seconds

    try {
      // Parse batch code
      const parsedResult = parseBatchCode(batchNumber.trim());
      
      if (!parsedResult) {
        setError(batchCodeDict.invalidBatchCode);
        setLoading(false);
        return;
      }

      setBatchCodeResult(parsedResult);

      // If you need to make an API call, uncomment and modify below:
      // const response = await fetch('/api/your-endpoint', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ batchCode: batchNumber })
      // });
      // 
      // if (!response.ok) {
      //   throw new Error('API request failed');
      // }
      // 
      // const data = await response.json();
      // setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.result.errorUnknown);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 max-w-5xl mx-auto">

        {/* Input Section */}
        <div className="mb-6 space-y-4">
          {/* Searchable Dropdown Select */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label className="text-sm font-semibold text-gray-800 sm:whitespace-nowrap sm:min-w-[120px]">
              {batchCodeDict.selectBrand}
            </label>
            <div className="relative flex-1" ref={dropdownRef}>
              <div className="relative">
                <input
                  type="text"
                  id="select-option"
                  value={isDropdownOpen ? searchQuery : selectedOptionLabel}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => {
                    setIsDropdownOpen(true);
                    // Clear search query when focusing to allow new search
                    setSearchQuery('');
                  }}
                  placeholder={batchCodeDict.searchOrSelectOption}
                  className="w-full px-4 py-3.5 sm:py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-base sm:text-lg bg-white"
                  disabled={loading}
                  aria-label="Select option"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!isDropdownOpen) {
                      setIsDropdownOpen(true);
                      setSearchQuery('');
                    } else {
                      setIsDropdownOpen(false);
                      setSearchQuery('');
                    }
                  }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                  disabled={loading}
                  aria-label="Toggle dropdown"
                >
                  <span className={`transform transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}>▼</span>
                </button>
              </div>
              
              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {filteredOptions.length > 0 ? (
                    <ul className="py-2">
                      {filteredOptions.map((option) => (
                        <li
                          key={option.value}
                          onClick={() => handleOptionSelect(option.value, option.label)}
                          className={`px-4 py-3 cursor-pointer hover:bg-red-50 transition-colors duration-150 ${
                            selectedOption === option.value ? 'bg-red-100 font-semibold' : ''
                          }`}
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-center">
                      {batchCodeDict.noOptionsFound}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Batch Number Input */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label className="text-sm font-semibold text-gray-800 sm:whitespace-nowrap sm:min-w-[120px]">
              {batchCodeDict.batchCode}
            </label>
            <div className="relative flex-1">
              <input 
                type="text" 
                id="batch-number-input" 
                placeholder={batchCodeDict.enterBatchCode}
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                className="w-full px-4 py-3.5 sm:py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-base sm:text-lg"
                disabled={loading}
                aria-label="Batch number input"
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-400">#</span>
              </div>
            </div>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700 rounded-lg flex items-center">
            <span className="text-red-500 mr-2">⚠️</span>
            {error}
          </div>
        )}
        
        {/*
        <a href="https://live.bagelpay.io/product/prod_1997584236308172801" target="_blank" rel="noopener noreferrer" className="mb-4 group relative flex items-center justify-between bg-gradient-to-r from-amber-50 via-orange-50 to-pink-50 border-2 border-amber-200/60 hover:border-amber-300 text-gray-700 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.01] overflow-hidden w-full">
          <span className="relative z-10 flex items-center gap-2.5 flex-1">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path>
              </svg>
            </div>
            <span className="text-red-700 text-bold leading-snug flex-1 text-center">Buy Me A Coffee</span></span>
          <svg className="w-4 h-4 text-amber-600 flex-shrink-0 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
          </svg>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-100/50 via-orange-100/50 to-pink-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </a>
        */}

        <button 
          onClick={handleDownload}
          disabled={loading || !batchNumber}
          className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3.5 sm:py-4 px-6 sm:px-8 rounded-xl font-bold text-base sm:text-lg hover:from-red-700 hover:to-pink-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          aria-label="Download RedNote video"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              {batchCodeDict.checking}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">🔍</span>
              {batchCodeDict.checkBatchCode}
            </div>
          )}
        </button>

        {/* Batch Code Result */}
        {batchCodeResult && (
          <div className="mt-6 sm:mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-br from-white via-gray-50 to-white rounded-2xl sm:rounded-3xl shadow-2xl border-2 border-gray-300 overflow-hidden">
              {/* Header Section - Enhanced */}
              <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 px-4 sm:px-8 py-5 sm:py-7 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3 sm:items-center sm:space-x-4">
                    <div className="bg-white/30 backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-xl border border-white/20 shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white sm:w-8 sm:h-8">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">{batchCodeDict.batchCodeResult}</h2>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:space-x-2">
                        <span className="text-blue-100 text-sm sm:text-base font-medium">{batchCodeDict.code}</span>
                        <span className="font-mono text-lg sm:text-2xl font-black text-white bg-white/20 px-3 py-1 rounded-lg border border-white/30 tracking-[0.15em] break-all">
                          {batchCodeResult.batchCode}
                        </span>
                      </div>
                    </div>
                  </div>
                  {batchCodeResult.isExpired ? (
                    <div className="w-full sm:w-auto bg-red-600/90 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-2xl border-2 border-red-400 shadow-xl animate-pulse">
                      <span className="text-white text-base sm:text-lg font-black flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-2 sm:w-5 sm:h-5">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                        {batchCodeDict.expired}
                      </span>
                    </div>
                  ) : (
                    <div className="w-full sm:w-auto bg-green-600/90 backdrop-blur-sm px-4 sm:px-6 py-3 rounded-2xl border-2 border-green-400 shadow-xl">
                      <span className="text-white text-base sm:text-lg font-black flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="mr-2 sm:w-5 sm:h-5">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                        {batchCodeDict.valid}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Content Section - Enhanced */}
              <div className="p-4 sm:p-8 space-y-4 sm:space-y-8 bg-gradient-to-b from-gray-50 to-white">
                {/* Manufacturing Date Card - Enhanced */}
                <div className="bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 rounded-2xl p-4 sm:p-7 border-2 sm:border-4 border-purple-300 shadow-xl hover:shadow-2xl transition-all duration-300 sm:transform sm:hover:scale-[1.02]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-6">
                    <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-white w-fit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-9 sm:h-9">
                        <circle cx="12" cy="12" r="10"></circle>
                        <polyline points="12 6 12 12 16 14"></polyline>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-bold text-purple-700 mb-2 sm:mb-3 uppercase tracking-wide">{batchCodeDict.manufacturingDate}</p>
                      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
                        <span className="text-3xl sm:text-5xl font-black text-gray-900 leading-none">
                          {batchCodeResult.manufacturingDate}
                        </span>
                        <span className="text-2xl sm:text-4xl font-extrabold text-purple-600 leading-none">
                          {batchCodeResult.manufacturingYear}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Age Card - Enhanced */}
                <div className="bg-gradient-to-br from-blue-100 via-cyan-100 to-blue-100 rounded-2xl p-4 sm:p-7 border-2 sm:border-4 border-blue-300 shadow-xl hover:shadow-2xl transition-all duration-300 sm:transform sm:hover:scale-[1.02]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-6">
                    <div className="bg-gradient-to-br from-blue-600 to-cyan-600 p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-white w-fit">
                      <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="sm:w-9 sm:h-9">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm sm:text-base font-bold text-blue-700 mb-2 sm:mb-3 uppercase tracking-wide">{batchCodeDict.productAge}</p>
                      <div className="flex items-baseline flex-wrap gap-x-3 gap-y-2">
                        {batchCodeResult.productAge.years > 0 && (
                          <div className="flex items-baseline space-x-2">
                            <span className="text-3xl sm:text-5xl font-black text-gray-900 leading-none">
                              {batchCodeResult.productAge.years}
                            </span>
                            <span className="text-xl sm:text-3xl font-bold text-blue-600 leading-none">
                              {batchCodeResult.productAge.yearsText}
                            </span>
                          </div>
                        )}
                        {batchCodeResult.productAge.months > 0 && (
                          <>
                            {batchCodeResult.productAge.years > 0 && (
                              <span className="text-xl sm:text-3xl font-bold text-gray-400">•</span>
                            )}
                            <div className="flex items-baseline space-x-2">
                              <span className="text-3xl sm:text-5xl font-black text-gray-900 leading-none">
                                {batchCodeResult.productAge.months}
                              </span>
                              <span className="text-xl sm:text-3xl font-bold text-blue-600 leading-none">
                                {batchCodeResult.productAge.monthsText}
                              </span>
                            </div>
                          </>
                        )}
                        {batchCodeResult.productAge.years === 0 && batchCodeResult.productAge.months === 0 && (
                          <span className="text-2xl sm:text-5xl font-black text-gray-900 leading-none">{batchCodeDict.lessThanOneMonth}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendation Section - Enhanced */}
                {batchCodeResult.isExpired ? (
                  <div className="bg-gradient-to-br from-red-100 via-amber-100 to-orange-100 rounded-2xl p-4 sm:p-8 border-2 sm:border-4 border-red-400 shadow-2xl animate-pulse">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:space-x-6">
                      <div className="bg-gradient-to-br from-red-600 to-orange-600 p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-white flex-shrink-0 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-10 sm:h-10">
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="16" x2="12" y2="12"></line>
                          <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl sm:text-3xl font-black text-red-900 mb-3 flex items-center">
                          <span className="mr-3 text-3xl sm:text-4xl">⚠️</span>
                          {batchCodeDict.cautionProductExpired}
                        </h4>
                        <p className="text-base sm:text-lg text-red-800 leading-relaxed mb-5 sm:mb-6 font-semibold">
                          {batchCodeDict.expiredWarning}
                        </p>
                      </div>
                      
                    </div>
                    <div className="flex items-center justify-center">
                      <button 
                          onClick={(e) => {
                            e.preventDefault();
                            // Handle report functionality
                          }}
                          className="inline-flex w-full sm:w-auto items-center justify-center px-5 sm:px-6 py-3 bg-red-600 hover:bg-red-700 text-white text-sm sm:text-base font-bold rounded-xl transition-all duration-200 shadow-xl hover:shadow-2xl sm:transform sm:hover:scale-105 border-2 border-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4-1-4-1z"></path>
                            <line x1="4" y1="22" x2="4" y2="15"></line>
                          </svg>
                          {batchCodeDict.reportIncorrectCode}
                        </button>
                      </div>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-emerald-100 via-green-100 to-teal-100 rounded-2xl p-4 sm:p-8 border-2 sm:border-4 border-emerald-400 shadow-2xl">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:space-x-6">
                      <div className="bg-gradient-to-br from-emerald-600 to-teal-600 p-4 sm:p-5 rounded-2xl shadow-2xl border-2 border-white flex-shrink-0 w-fit">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="sm:w-10 sm:h-10">
                          <path d="M20 6L9 17l-5-5"></path>
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-2xl sm:text-3xl font-black text-emerald-900 mb-3 flex items-center">
                          <span className="mr-3 text-3xl sm:text-4xl">✅</span>
                          {batchCodeDict.usageRecommendation}
                        </h4>
                        <p className="text-base sm:text-lg text-emerald-800 leading-relaxed font-semibold">
                          {batchCodeDict.validRecommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
