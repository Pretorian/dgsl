import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
  });

  it('should initialize with default value when localStorage is empty', () => {
    localStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
    expect(localStorage.getItem).toHaveBeenCalledWith('test-key');
  });

  it('should initialize with value from localStorage', () => {
    localStorage.getItem.mockReturnValue('stored-value');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('stored-value');
  });

  it('should save value to localStorage when updated', () => {
    localStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', 'new-value');
    expect(result.current[0]).toBe('new-value');
  });

  it('should handle JSON values when isJSON is true', () => {
    const jsonValue = { name: 'test', count: 42 };
    localStorage.getItem.mockReturnValue(JSON.stringify(jsonValue));

    const { result } = renderHook(() => useLocalStorage('test-key', {}, true));

    expect(result.current[0]).toEqual(jsonValue);
  });

  it('should save JSON values when isJSON is true', () => {
    localStorage.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useLocalStorage('test-key', {}, true));
    const newValue = { name: 'test', count: 42 };

    act(() => {
      result.current[1](newValue);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', JSON.stringify(newValue));
  });

  it('should remove item from localStorage when value is null', () => {
    localStorage.getItem.mockReturnValue('some-value');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1](null);
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('should remove item from localStorage when value is undefined', () => {
    localStorage.getItem.mockReturnValue('some-value');

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1](undefined);
    });

    expect(localStorage.removeItem).toHaveBeenCalledWith('test-key');
  });

  it('should handle function updater', () => {
    localStorage.getItem.mockReturnValue('5');

    const { result } = renderHook(() => useLocalStorage('test-key', '0'));

    act(() => {
      result.current[1](prev => String(Number(prev) + 1));
    });

    expect(result.current[0]).toBe('6');
    expect(localStorage.setItem).toHaveBeenCalledWith('test-key', '6');
  });

  it('should handle errors when getting from localStorage', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    localStorage.getItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    expect(result.current[0]).toBe('default');
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('should handle errors when setting to localStorage', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    localStorage.getItem.mockReturnValue(null);
    localStorage.setItem.mockImplementation(() => {
      throw new Error('Storage error');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'default'));

    act(() => {
      result.current[1]('new-value');
    });

    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });

  it('should handle invalid JSON gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    localStorage.getItem.mockReturnValue('invalid json {');

    const { result } = renderHook(() => useLocalStorage('test-key', {}, true));

    expect(result.current[0]).toEqual({});
    expect(consoleError).toHaveBeenCalled();

    consoleError.mockRestore();
  });
});
