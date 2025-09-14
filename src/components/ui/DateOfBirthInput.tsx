import React, { useState, useEffect, useRef } from 'react';
import { format, parse, isValid } from 'date-fns';
import { cn } from '@/lib/utils';
import DatePicker, { registerLocale, setDefaultLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Label } from '@/components/ui/label';

type PopperModifier = {
  name: string;
  enabled: boolean;
  phase: 'main';
  fn: (data: any) => any;
  options?: any;
};

// Fix for react-datepicker z-index issue
const injectDatePickerStyles = () => {
  if (typeof document === 'undefined') return;
  
  const styleId = 'react-datepicker-zindex-fix';
  if (document.getElementById(styleId)) return;
  
  const style = document.createElement('style');
  style.id = styleId;
  style.textContent = `
    .react-datepicker-popper {
      z-index: 100 !important;
    }
    .react-datepicker {
      font-family: inherit;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    }
    .react-datepicker__header {
      background-color: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      border-top-left-radius: 0.5rem;
    }
    .react-datepicker__current-month,
    .react-datepicker-time__header,
    .react-datepicker-year-header {
      color: #1e293b;
      font-weight: 500;
    }
    .react-datepicker__day--selected,
    .react-datepicker__day--keyboard-selected,
    .react-datepicker__month-text--selected,
    .react-datepicker__month-text--keyboard-selected,
    .react-datepicker__quarter-text--selected,
    .react-datepicker__quarter-text--keyboard-selected,
    .react-datepicker__year-text--selected,
    .react-datepicker__year-text--keyboard-selected {
      background-color: #3b82f6;
    }
  `;
  
  document.head.appendChild(style);
};

interface DateOfBirthInputProps {
  value: Date | string | null;
  onChange: (date: Date | null) => void;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export function DateOfBirthInput({
  value,
  onChange,
  error,
  required = true,
  className = '',
  label,
}: DateOfBirthInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  const preventOverflowModifier: PopperModifier = {
    name: 'preventOverflow',
    enabled: true,
    phase: 'main',
    fn: ({ state, options }) => {
      const { x, y } = state.modifiersData.preventOverflow || { x: 0, y: 0 };
      state.modifiersData.preventOverflow = {
        x,
        y,
        ...options
      };
      return state;
    },
    options: {
      rootBoundary: 'viewport',
      tether: false,
      altAxis: true,
    },
  };

  const flipModifier: PopperModifier = {
    name: 'flip',
    enabled: true,
    phase: 'main',
    fn: ({ state, options }) => {
      state.modifiersData.flip = {
        ...state.modifiersData.flip,
        ...options
      };
      return state;
    },
    options: {
      fallbackPlacements: ['top', 'right'],
    },
  };
  
  useEffect(() => {
    injectDatePickerStyles();
    
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  const handleDateChange = (date: Date | null) => {
    if (date && isValid(date)) {
      onChange(date);
      const input = document.querySelector('input[placeholder="DD/MM/YYYY"]') as HTMLInputElement;
      if (input) {
        input.value = format(date, 'dd/MM/yyyy');
      }
    } else {
      onChange(null);
    }
  };

  const handleManualDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      onChange(null);
      return;
    }
    
    // Basic format validation before parsing
    if (!/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(value)) {
      // @ts-ignore - We're handling string state for partial inputs
      onChange(value);
      return;
    }
    
    const parsedDate = parse(value, 'dd/MM/yyyy', new Date());
    if (isValid(parsedDate)) {
      onChange(parsedDate);
    } else {
      // @ts-ignore - We're handling string state for validation
      onChange(value);
    }
  };

  const getDisplayValue = () => {
    if (!value) return '';
    
    if (typeof value === 'string') {
      return value;
    }
    
    try {
      return isValid(value) ? format(value, 'dd/MM/yyyy') : '';
    } catch (e) {
      return '';
    }
  };
  
  const displayValue = getDisplayValue();

  return (
    <div className={cn('space-y-2', className)} ref={wrapperRef}>
      {label && (
        <Label className="text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      <div className="relative">
        <div className="flex items-center">
          <input
            type="text"
            placeholder="DD/MM/YYYY"
            value={displayValue}
            onChange={handleManualDateChange}
            onFocus={() => setIsOpen(true)}
            className={cn(
              'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
              error ? 'border-red-500' : ''
            )}
          />
          <button
            type="button"
            className="absolute right-2 p-1 hover:bg-accent rounded-md text-gray-500 hover:text-gray-700"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            aria-label="Open date picker"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        </div>
        
        {isOpen && (
          <div className="absolute z-[100] mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
            <DatePicker
              selected={value && isValid(new Date(value)) ? new Date(value) : null}
              onChange={(date: Date | null) => {
                handleDateChange(date);
                // Don't close on month/year change, only on day selection
                if (date) {
                  setIsOpen(false);
                }
              }}
              inline
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              dateFormat="dd/MM/yyyy"
              onClickOutside={() => setIsOpen(false)}
              onSelect={() => setIsOpen(false)}
              className="border-0"
              renderCustomHeader={({
                date,
                changeYear,
                changeMonth,
                decreaseMonth,
                increaseMonth,
                prevMonthButtonDisabled,
                nextMonthButtonDisabled,
              }) => {
                const years = [];
                const currentYear = new Date().getFullYear();
                for (let i = currentYear - 100; i <= currentYear + 10; i++) {
                  years.push(i);
                }
                
                const months = [
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ];
                
                return (
                  <div className="px-2 py-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex space-x-2">
                        <select
                          value={date.getFullYear()}
                          onChange={({ target: { value }}) => changeYear(Number(value))}
                          className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {years.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        
                        <select
                          value={date.getMonth()}
                          onChange={({ target: { value }}) => changeMonth(Number(value))}
                          className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {months.map((month, i) => (
                            <option key={month} value={i}>
                              {month}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            decreaseMonth();
                          }}
                          disabled={prevMonthButtonDisabled}
                          type="button"
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            increaseMonth();
                          }}
                          disabled={nextMonthButtonDisabled}
                          type="button"
                          className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        )}
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
}
