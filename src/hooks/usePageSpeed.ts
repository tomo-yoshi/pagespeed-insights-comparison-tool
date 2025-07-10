'use client';

import { useState } from 'react';

interface PageSpeedMetric {
  title: string;
  description: string;
  score: number;
  numericValue: number;
  displayValue: string;
}

export type Strategy = 'mobile' | 'desktop';

interface PageSpeedResult {
  timestamp: string;
  metrics: {
    [key: string]: PageSpeedMetric;
  };
  strategy: Strategy;
}

interface TestResults {
  mobile: PageSpeedResult[];
  desktop: PageSpeedResult[];
  isLoading: boolean;
  error: string | null;
}

export function usePageSpeedTest() {
  const [results, setResults] = useState<TestResults>({
    mobile: [],
    desktop: [],
    isLoading: false,
    error: null,
  });

  const runStrategy = async (
    strategy: Strategy,
    url: string,
    numberOfTests: number,
    onProgress: (completed: number, currentResults: PageSpeedResult[]) => void,
    signal?: AbortSignal
  ) => {
    const results: PageSpeedResult[] = [];

    let i = 0;
    let errorTest = true;
    while (i < numberOfTests) {
      // Changed from for loop to while loop
      if (signal?.aborted) {
        throw new Error('Test cancelled');
      }

      try {
        // Added try-catch block
        const queryParams = new URLSearchParams({
          url: url,
          category: 'performance',
          strategy: strategy,
          ...(process.env.NEXT_PUBLIC_PAGESPEED_API_KEY && {
            key: process.env.NEXT_PUBLIC_PAGESPEED_API_KEY,
          }),
        });

        const response = await fetch(
          `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${queryParams}`,
          { signal }
        );

        if (!response.ok || (i === 1 && errorTest)) {
          errorTest = false;
          console.warn(
            `PageSpeed API error on attempt ${i + 1}: ${
              response.statusText
            }. Retrying...`
          );
          await new Promise((resolve) => setTimeout(resolve, 63000));
          continue;
        }

        const data = await response.json();

        const metrics = Object.entries(data.lighthouseResult.audits).reduce(
          (acc, [key, value]: [string, any]) => {
            if (value.numericValue !== undefined) {
              acc[key] = {
                title: value.title,
                description: value.description,
                score: value.score,
                numericValue: value.numericValue,
                displayValue: value.displayValue,
              };
            }
            return acc;
          },
          {} as { [key: string]: PageSpeedMetric }
        );

        const result: PageSpeedResult = {
          timestamp: data.analysisUTCTimestamp,
          metrics,
          strategy,
        };

        results.push(result);
        onProgress(i + 1, results); // Pass current results array

        if (i < numberOfTests - 1) {
          await new Promise((resolve) => setTimeout(resolve, 63000));
        }

        i++;
      } catch (error) {
        console.warn(`Error on attempt ${i + 1}: ${error}. Retrying...`);
        await new Promise((resolve) => setTimeout(resolve, 63000));
        continue; // Skip to next iteration without incrementing i
      }
    }

    return results;
  };

  const validateUrl = async (url: string): Promise<boolean> => {
    try {
      // Simple URL validation
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  };

  const runTests = async (
    url: string,
    numberOfRecords = 1,
    strategy: Strategy,
    onProgress?: (
      completedTests: number,
      currentResults: { mobile: PageSpeedResult[]; desktop: PageSpeedResult[] }
    ) => void,
    signal?: AbortSignal
  ) => {
    setResults((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const isValidUrl = await validateUrl(url);
      if (!isValidUrl) {
        throw new Error(
          'The provided URL is not accessible. Please check the URL and try again.'
        );
      }

      const finalResults = await runStrategy(
        strategy,
        url,
        numberOfRecords,
        (completed, currentResults) => {
          // Update progress with current results
          onProgress?.(completed, {
            mobile: strategy === 'mobile' ? currentResults : [],
            desktop: strategy === 'desktop' ? currentResults : [],
          });
        },
        signal
      );

      setResults((prev) => ({ ...prev, isLoading: false }));

      return {
        results: {
          mobile: strategy === 'mobile' ? finalResults : [],
          desktop: strategy === 'desktop' ? finalResults : [],
        },
        cleanup: () => {
          setResults((prev) => ({ ...prev, isLoading: false }));
        },
      };
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : 'An unknown error occurred',
      }));
      throw error;
    }
  };

  return {
    runTests,
    results: results.mobile,
    mobileResults: results.mobile,
    desktopResults: results.desktop,
    isLoading: results.isLoading,
    error: results.error,
  };
}
