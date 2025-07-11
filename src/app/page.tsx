'use client';

import { useState, useEffect } from 'react';
import { usePageSpeedTest, Strategy } from '@/hooks/usePageSpeed';
import { metricsConfig } from '@/config/metrics';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Button from '@/components/atoms/buttons/Button';
import Input from '@/components/atoms/inputs/Input';
import Select from '@/components/atoms/selects/Select';
import { Play, RotateCcw, ExternalLink } from 'lucide-react';

interface TestResult {
  url: string;
  timestamp: string;
  metrics: { [key: string]: any };
  strategy: Strategy;
}

interface MultipleTestResults {
  url: string;
  strategy: Strategy;
  results: TestResult[];
  completedTests: number;
  totalTests: number;
}

export default function HomePage() {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');
  const [strategy, setStrategy] = useState<Strategy>('mobile');
  const [selectedMetric, setSelectedMetric] = useState(
    'largest-contentful-paint'
  );
  const [numberOfTests, setNumberOfTests] = useState(3);
  const [results, setResults] = useState<{
    url1?: MultipleTestResults;
    url2?: MultipleTestResults;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState({ url1: 0, url2: 0 });
  const [countdown, setCountdown] = useState({ url1: 0, url2: 0 });
  const [histogramRange, setHistogramRange] = useState<{
    min: number;
    max: number;
  } | null>(null);

  const { runTests } = usePageSpeedTest();

  // Debug URL changes
  useEffect(() => {
    console.log('URL1 changed:', url1);
  }, [url1]);

  useEffect(() => {
    console.log('URL2 changed:', url2);
  }, [url2]);

  const strategyOptions = [
    { value: 'mobile', label: 'Mobile' },
    { value: 'desktop', label: 'Desktop' },
  ];

  const numberOfTestsOptions = [
    { value: '1', label: '1 test' },
    { value: '2', label: '2 tests' },
    { value: '3', label: '3 tests' },
    { value: '5', label: '5 tests' },
    { value: '10', label: '10 tests' },
    { value: '15', label: '15 tests' },
    { value: '20', label: '20 tests' },
  ];

  const metricOptions = Object.entries(metricsConfig)
    .filter(([_, config]) => config.enabled)
    .map(([key, config]) => ({
      value: key,
      label: config.title,
      category: config.category,
    }))
    .sort((a, b) => {
      if (a.category !== b.category) {
        return a.category.localeCompare(b.category);
      }
      return a.label.localeCompare(b.label);
    });

  const handleTestBoth = async () => {
    console.log('handleTestBoth called', { url1, url2 });
    const trimmedUrl1 = url1.trim();
    const trimmedUrl2 = url2.trim();
    console.log('trimmed URLs', { trimmedUrl1, trimmedUrl2 });

    // Validate both URLs
    if (!trimmedUrl1 && !trimmedUrl2) {
      alert('Please enter at least one URL to test');
      return;
    }

    const urlsToTest: Array<{ url: string; key: 'url1' | 'url2' }> = [];

    if (trimmedUrl1) {
      try {
        new URL(trimmedUrl1);
        urlsToTest.push({ url: trimmedUrl1, key: 'url1' });
      } catch (error) {
        alert(
          'URL 1 is not valid. Please enter a valid URL (e.g., https://example.com)'
        );
        return;
      }
    }

    if (trimmedUrl2) {
      try {
        new URL(trimmedUrl2);
        urlsToTest.push({ url: trimmedUrl2, key: 'url2' });
      } catch (error) {
        alert(
          'URL 2 is not valid. Please enter a valid URL (e.g., https://example.com)'
        );
        return;
      }
    }

    setIsLoading(true);
    setProgress({ url1: 0, url2: 0 });

    // Initialize results
    setResults((prev) => {
      const newResults = { ...prev };
      urlsToTest.forEach(({ url, key }) => {
        newResults[key] = {
          url,
          strategy,
          results: [],
          completedTests: 0,
          totalTests: numberOfTests,
        };
      });
      return newResults;
    });

    try {
      // Run tests for all valid URLs
      const testPromises = urlsToTest.map(async ({ url, key }) => {
        const allResults: TestResult[] = [];

        let lastTestStartTime = 0;

        for (let i = 0; i < numberOfTests; i++) {
          try {
            const currentTime = Date.now();

            // Wait for 60 seconds from the last test start (except for the first test)
            if (i > 0) {
              const timeSinceLastTest = currentTime - lastTestStartTime;
              const remainingWaitTime = 60000 - timeSinceLastTest; // 60 seconds in milliseconds

              if (remainingWaitTime > 0) {
                console.log(
                  `Waiting ${Math.ceil(
                    remainingWaitTime / 1000
                  )} more seconds before test ${i + 1} for ${url}...`
                );

                // Countdown from remaining time
                const startSeconds = Math.ceil(remainingWaitTime / 1000);
                for (let seconds = startSeconds; seconds > 0; seconds--) {
                  setCountdown((prev) => ({
                    ...prev,
                    [key]: seconds,
                  }));
                  await new Promise((resolve) => setTimeout(resolve, 1000));
                }

                setCountdown((prev) => ({
                  ...prev,
                  [key]: 0,
                }));
              }
            }

            // Record when this test starts
            lastTestStartTime = Date.now();
            console.log(
              `Starting test ${i + 1} for ${url} at ${new Date(
                lastTestStartTime
              ).toISOString()}`
            );

            // Execute the API call
            const result = await runTests(url, 1, strategy);
            const testResults = result.results[strategy];

            if (testResults.length > 0) {
              allResults.push({
                ...testResults[0],
                url,
              });

              // Update progress and partial results
              setResults((prev) => {
                if (prev[key]) {
                  return {
                    ...prev,
                    [key]: {
                      ...prev[key]!,
                      results: [...allResults],
                      completedTests: i + 1,
                    },
                  };
                }
                return prev;
              });

              setProgress((prev) => ({
                ...prev,
                [key]: ((i + 1) / numberOfTests) * 100,
              }));
            }
          } catch (error) {
            console.error(`Test ${i + 1} failed for ${url}:`, error);
          }
        }

        return { key, results: allResults };
      });

      await Promise.all(testPromises);
    } catch (error) {
      console.error('Tests failed:', error);
      alert('Tests failed. Please check the URLs and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResults({});
    setProgress({ url1: 0, url2: 0 });
    setCountdown({ url1: 0, url2: 0 });
    setHistogramRange(null);
  };

  const getCurrentDataRange = () => {
    if (!selectedMetric) return null;

    const url1Results = results.url1?.results || [];
    const url2Results = results.url2?.results || [];

    if (url1Results.length === 0 && url2Results.length === 0) return null;

    const url1Values = url1Results
      .map((r) => r.metrics[selectedMetric]?.numericValue)
      .filter((v) => v !== undefined);

    const url2Values = url2Results
      .map((r) => r.metrics[selectedMetric]?.numericValue)
      .filter((v) => v !== undefined);

    if (url1Values.length === 0 && url2Values.length === 0) return null;

    const allValues = [...url1Values, ...url2Values];
    return {
      min: Math.min(...allValues),
      max: Math.max(...allValues),
    };
  };

  const getHistogramData = () => {
    if (!selectedMetric) return null;

    const url1Results = results.url1?.results || [];
    const url2Results = results.url2?.results || [];

    if (url1Results.length === 0 && url2Results.length === 0) return null;

    // Get all values for the selected metric
    const url1Values = url1Results
      .map((r) => r.metrics[selectedMetric]?.numericValue)
      .filter((v) => v !== undefined);

    const url2Values = url2Results
      .map((r) => r.metrics[selectedMetric]?.numericValue)
      .filter((v) => v !== undefined);

    if (url1Values.length === 0 && url2Values.length === 0) return null;

    // Create histogram bins
    const allValues = [...url1Values, ...url2Values];
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);

    // Use custom range if set, otherwise use data range
    const min = histogramRange?.min ?? dataMin;
    const max = histogramRange?.max ?? dataMax;
    const binCount = 5;
    const binSize = (max - min) / binCount;
    const unit = metricsConfig[selectedMetric]?.unit || '';

    const bins = [];
    for (let i = 0; i < binCount; i++) {
      const binStart = min + binSize * i;
      const binEnd = i === binCount - 1 ? max + 0.001 : min + binSize * (i + 1);

      const url1Count = url1Values.filter(
        (v) => v >= binStart && v < binEnd
      ).length;
      const url2Count = url2Values.filter(
        (v) => v >= binStart && v < binEnd
      ).length;

      // Format range with units for histogram (fewer decimals)
      const formattedStart = formatValueForHistogram(binStart, unit);
      const formattedEnd = formatValueForHistogram(binEnd, unit);
      const rangeLabel = `${formattedStart}-${formattedEnd}`;

      bins.push({
        range: rangeLabel,
        'URL 1': url1Count,
        'URL 2': url2Count,
      });
    }

    return bins;
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'ms':
        return `${(value / 1000).toFixed(2)}s`;
      case 'KiB':
        return `${(value / 1024).toFixed(2)} KiB`;
      case '':
        return value.toFixed(2);
      default:
        return `${value}${unit}`;
    }
  };

  const formatValueForHistogram = (value: number, unit: string) => {
    switch (unit) {
      case 'ms':
        // eslint-disable-next-line no-case-declarations
        const seconds = value / 1000;
        return seconds >= 1 ? `${seconds.toFixed(1)}s` : `${seconds.toFixed(2)}s`;
      case 'KiB':
        // eslint-disable-next-line no-case-declarations
        const kib = value / 1024;
        return kib >= 10 ? `${kib.toFixed(0)} KiB` : `${kib.toFixed(1)} KiB`;
      case '':
        return value >= 1 ? value.toFixed(1) : value.toFixed(2);
      default:
        return value >= 1 ? `${value.toFixed(1)}${unit}` : `${value.toFixed(2)}${unit}`;
    }
  };

  // Statistical significance calculation
  const calculateTTest = (sample1: number[], sample2: number[]) => {
    if (sample1.length < 2 || sample2.length < 2) {
      return { pValue: null, significant: false, description: 'Insufficient data for statistical analysis (need at least 2 samples each)' };
    }

    // Calculate means
    const mean1 = sample1.reduce((a, b) => a + b, 0) / sample1.length;
    const mean2 = sample2.reduce((a, b) => a + b, 0) / sample2.length;

    // Calculate variances
    const variance1 = sample1.reduce((sum, val) => sum + Math.pow(val - mean1, 2), 0) / (sample1.length - 1);
    const variance2 = sample2.reduce((sum, val) => sum + Math.pow(val - mean2, 2), 0) / (sample2.length - 1);

    // Welch's t-test (doesn't assume equal variances)
    const pooledSE = Math.sqrt(variance1 / sample1.length + variance2 / sample2.length);
    
    if (pooledSE === 0) {
      return { pValue: null, significant: false, description: 'No variance in the data' };
    }

    const tStatistic = Math.abs(mean1 - mean2) / pooledSE;

    // Degrees of freedom for Welch's t-test
    const df = Math.pow(variance1 / sample1.length + variance2 / sample2.length, 2) /
      (Math.pow(variance1 / sample1.length, 2) / (sample1.length - 1) +
       Math.pow(variance2 / sample2.length, 2) / (sample2.length - 1));

    // Approximate p-value using simplified approach for demonstration
    // For more accuracy, you'd use a proper t-distribution CDF
    const pValue = 2 * (1 - approximateTCDF(tStatistic, df));

    const significant = pValue < 0.05;
    let description = '';
    
    if (pValue < 0.001) {
      description = 'Highly significant difference (p < 0.001)';
    } else if (pValue < 0.01) {
      description = 'Very significant difference (p < 0.01)';
    } else if (pValue < 0.05) {
      description = 'Significant difference (p < 0.05)';
    } else if (pValue < 0.1) {
      description = 'Marginally significant difference (p < 0.1)';
    } else {
      description = 'No significant difference (p ≥ 0.1)';
    }

    return { pValue, significant, description, tStatistic, df };
  };

  // Approximate t-distribution CDF (simplified)
  const approximateTCDF = (t: number, df: number) => {
    if (df > 30) {
      // Use normal approximation for large df
      return normalCDF(t);
    }
    
    // Simplified approximation for smaller df
    const x = t / Math.sqrt(df);
    const a = 0.5 + x * (0.398942 + x * x * (-0.120782 + x * x * 0.068208)) / Math.sqrt(1 + x * x);
    return Math.min(0.999, Math.max(0.001, a));
  };

  // Normal CDF approximation
  const normalCDF = (x: number) => {
    return 0.5 * (1 + erf(x / Math.sqrt(2)));
  };

  // Error function approximation
  const erf = (x: number) => {
    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const sign = x < 0 ? -1 : 1;
    x = Math.abs(x);

    const t = 1.0 / (1.0 + p * x);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  const getStatisticalSignificance = () => {
    if (!selectedMetric || !results.url1 || !results.url2) return null;

    const url1Values = results.url1.results
      .map(r => r.metrics[selectedMetric]?.numericValue)
      .filter(v => v !== undefined);

    const url2Values = results.url2.results
      .map(r => r.metrics[selectedMetric]?.numericValue)
      .filter(v => v !== undefined);

    if (url1Values.length === 0 || url2Values.length === 0) return null;

    return calculateTTest(url1Values, url2Values);
  };

  return (
    <div className='min-h-screen bg-gray-50 p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            PageSpeed Insights Comparison Tool
          </h1>
          <p className='text-xl text-gray-600'>
            Compare Core Web Vitals metrics between two URLs
          </p>
        </div>

        <div className='bg-white rounded-lg shadow-lg p-6 mb-8'>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-6'>
            <div className='md:col-span-2'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-4'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    URL 1
                  </label>
                  <Input
                    placeholder='https://example1.com'
                    value={url1}
                    onChange={(e) => setUrl1(e.target.value)}
                    className='w-full'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    URL 2
                  </label>
                  <Input
                    placeholder='https://example2.com'
                    value={url2}
                    onChange={(e) => setUrl2(e.target.value)}
                    className='w-full'
                  />
                </div>
              </div>

              <div className='flex justify-center'>
                <Button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Button clicked, current URLs:', {
                      url1,
                      url2,
                    });
                    handleTestBoth();
                  }}
                  disabled={isLoading || (!url1.trim() && !url2.trim())}
                  className='flex items-center justify-center gap-2 px-8 py-3 w-full text-lg'
                  size='base'
                >
                  {isLoading ? (
                    <>
                      <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white'></div>
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <Play className='h-5 w-5 ' />
                      Run Comparison Test
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className='space-y-4'>
              <Select
                label='Strategy'
                value={strategy}
                onChange={(value) => setStrategy(value as Strategy)}
                options={strategyOptions}
              />

              <Select
                label='Number of Tests'
                value={numberOfTests.toString()}
                onChange={(value) => setNumberOfTests(parseInt(value))}
                options={numberOfTestsOptions}
              />

              <Button
                onClick={handleReset}
                variant='outline'
                className='w-full flex items-center gap-2'
                disabled={isLoading}
              >
                <RotateCcw className='h-4 w-4' />
                Reset
              </Button>
            </div>
          </div>

          {/* Progress Indicators */}
          {isLoading && (
            <div className='border-t pt-6'>
              <h3 className='text-lg font-medium text-gray-900 mb-4'>
                Test Progress
              </h3>
              <div className='space-y-4'>
                {results.url1 && (
                  <div>
                    <div className='flex justify-between text-sm text-gray-600 mb-1'>
                      <span>URL 1: {results.url1.url}</span>
                      <span>
                        {results.url1.completedTests} /{' '}
                        {results.url1.totalTests} tests
                        {countdown.url1 > 0 && (
                          <span className='ml-2 text-orange-600 font-medium'>
                            Next test in {countdown.url1}s
                          </span>
                        )}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-blue-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${progress.url1}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {results.url2 && (
                  <div>
                    <div className='flex justify-between text-sm text-gray-600 mb-1'>
                      <span>URL 2: {results.url2.url}</span>
                      <span>
                        {results.url2.completedTests} /{' '}
                        {results.url2.totalTests} tests
                        {countdown.url2 > 0 && (
                          <span className='ml-2 text-orange-600 font-medium'>
                            Next test in {countdown.url2}s
                          </span>
                        )}
                      </span>
                    </div>
                    <div className='w-full bg-gray-200 rounded-full h-2'>
                      <div
                        className='bg-red-600 h-2 rounded-full transition-all duration-300'
                        style={{ width: `${progress.url2}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {(results.url1 || results.url2) && (
            <div className='border-t pt-6'>
              <div className='mb-6 space-y-4'>
                <Select
                  label='Metric to Compare'
                  value={selectedMetric}
                  onChange={(value) => {
                    setSelectedMetric(value);
                    setHistogramRange(null); // Reset range when metric changes
                  }}
                  options={metricOptions}
                />

                {/* Histogram Range Controls */}
                {(() => {
                  const dataRange = getCurrentDataRange();
                  if (!dataRange) return null;

                  const currentMin = histogramRange?.min ?? dataRange.min;
                  const currentMax = histogramRange?.max ?? dataRange.max;
                  const unit = metricsConfig[selectedMetric]?.unit || '';

                  return (
                    <div className='bg-gray-50 p-4 rounded-lg'>
                      <h4 className='text-sm font-medium text-gray-700 mb-3'>
                        Histogram Range
                      </h4>
                      <div className='grid grid-cols-1 md:grid-cols-3 gap-3 items-end'>
                        <div>
                          <label className='block text-xs text-gray-600 mb-1'>
                            Min Value
                          </label>
                          <Input
                            type='number'
                            step='0.01'
                            value={currentMin.toFixed(2)}
                            onChange={(e) => {
                              const newMin = parseFloat(e.target.value);
                              if (!isNaN(newMin)) {
                                setHistogramRange((prev) => ({
                                  min: newMin,
                                  max: prev?.max ?? dataRange.max,
                                }));
                              }
                            }}
                            className='text-sm'
                          />
                        </div>
                        <div>
                          <label className='block text-xs text-gray-600 mb-1'>
                            Max Value
                          </label>
                          <Input
                            type='number'
                            step='0.01'
                            value={currentMax.toFixed(2)}
                            onChange={(e) => {
                              const newMax = parseFloat(e.target.value);
                              if (!isNaN(newMax)) {
                                setHistogramRange((prev) => ({
                                  min: prev?.min ?? dataRange.min,
                                  max: newMax,
                                }));
                              }
                            }}
                            className='text-sm'
                          />
                        </div>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => setHistogramRange(null)}
                            className='px-3 py-2 text-xs bg-gray-200 hover:bg-gray-300 rounded text-gray-700 transition-colors'
                          >
                            Auto Range
                          </button>
                        </div>
                      </div>
                      <p className='text-xs text-gray-500 mt-2'>
                        Data range: {formatValue(dataRange.min, unit)} -{' '}
                        {formatValue(dataRange.max, unit)}
                        {unit && ` (${unit})`}
                      </p>
                    </div>
                  );
                })()}
              </div>

              {results.url1 &&
                results.url2 &&
                results.url1.results.length > 0 &&
                results.url2.results.length > 0 && (
                  <div className='space-y-6'>
                    {/* Summary Statistics */}
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-6'>
                      <div className='bg-gray-50 p-4 rounded-lg'>
                        <h3 className='font-medium text-gray-900 mb-2 flex items-center gap-2'>
                          URL 1
                          <a
                            href={results.url1.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-500 hover:text-blue-700'
                          >
                            <ExternalLink className='h-4 w-4' />
                          </a>
                        </h3>
                        <p className='text-sm text-gray-600 break-all mb-3'>
                          {results.url1.url}
                        </p>
                        <div className='text-sm space-y-1'>
                          <p>
                            Tests completed:{' '}
                            <span className='font-medium'>
                              {results.url1.completedTests}/
                              {results.url1.totalTests}
                            </span>
                          </p>
                          {(() => {
                            const values = results.url1.results
                              .map(
                                (r) => r.metrics[selectedMetric]?.numericValue
                              )
                              .filter((v) => v !== undefined);
                            if (values.length === 0)
                              return <p>No data for selected metric</p>;

                            const avg =
                              values.reduce((a, b) => a + b, 0) / values.length;
                            const sortedValues = [...values].sort(
                              (a, b) => a - b
                            );
                            const median =
                              sortedValues.length % 2 === 0
                                ? (sortedValues[sortedValues.length / 2 - 1] +
                                    sortedValues[sortedValues.length / 2]) /
                                  2
                                : sortedValues[
                                    Math.floor(sortedValues.length / 2)
                                  ];
                            const min = Math.min(...values);
                            const max = Math.max(...values);

                            return (
                              <>
                                <p>
                                  Average:{' '}
                                  <span className='font-medium text-blue-600'>
                                    {formatValue(
                                      avg,
                                      metricsConfig[selectedMetric]?.unit || ''
                                    )}
                                  </span>
                                </p>
                                <p>
                                  Median:{' '}
                                  <span className='font-medium text-blue-600'>
                                    {formatValue(
                                      median,
                                      metricsConfig[selectedMetric]?.unit || ''
                                    )}
                                  </span>
                                </p>
                                <p>
                                  Range:{' '}
                                  <span className='font-medium'>
                                    {formatValue(
                                      min,
                                      metricsConfig[selectedMetric]?.unit || ''
                                    )}{' '}
                                    -{' '}
                                    {formatValue(
                                      max,
                                      metricsConfig[selectedMetric]?.unit || ''
                                    )}
                                  </span>
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      </div>

                      <div className='bg-gray-50 p-4 rounded-lg'>
                        <h3 className='font-medium text-gray-900 mb-2 flex items-center gap-2'>
                          URL 2
                          <a
                            href={results.url2.url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-blue-500 hover:text-blue-700'
                          >
                            <ExternalLink className='h-4 w-4' />
                          </a>
                        </h3>
                        <p className='text-sm text-gray-600 break-all mb-3'>
                          {results.url2.url}
                        </p>
                        <div className='text-sm space-y-1'>
                          <p>
                            Tests completed:{' '}
                            <span className='font-medium'>
                              {results.url2.completedTests}/
                              {results.url2.totalTests}
                            </span>
                          </p>
                          {(() => {
                            const values = results.url2.results
                              .map(
                                (r) => r.metrics[selectedMetric]?.numericValue
                              )
                              .filter((v) => v !== undefined);
                            if (values.length === 0)
                              return <p>No data for selected metric</p>;

                            const avg =
                              values.reduce((a, b) => a + b, 0) / values.length;
                            const sortedValues = [...values].sort(
                              (a, b) => a - b
                            );
                            const median =
                              sortedValues.length % 2 === 0
                                ? (sortedValues[sortedValues.length / 2 - 1] +
                                    sortedValues[sortedValues.length / 2]) /
                                  2
                                : sortedValues[
                                    Math.floor(sortedValues.length / 2)
                                  ];
                            const min = Math.min(...values);
                            const max = Math.max(...values);

                            return (
                              <>
                                <p>
                                  Average:{' '}
                                  <span className='font-medium text-red-600'>
                                    {formatValue(
                                      avg,
                                      metricsConfig[selectedMetric]?.unit || ''
                                    )}
                                  </span>
                                </p>
                                <p>
                                  Median:{' '}
                                  <span className='font-medium text-red-600'>
                                    {formatValue(
                                      median,
                                      metricsConfig[selectedMetric]?.unit || ''
                                    )}
                                  </span>
                                </p>
                                <p>
                                  Range:{' '}
                                  <span className='font-medium'>
                                    {formatValue(
                                      min,
                                      metricsConfig[selectedMetric]?.unit || ''
                                    )}{' '}
                                    -{' '}
                                    {formatValue(
                                      max,
                                      metricsConfig[selectedMetric]?.unit || ''
                                    )}
                                  </span>
                                </p>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                                        {/* Statistical Significance */}
                                        {(() => {
                      const significance = getStatisticalSignificance();
                      if (!significance) return null;

                      return (
                        <div className='mt-6 bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500'>
                          <h4 className='text-lg font-medium text-gray-900 mb-2'>
                            Statistical Significance
                          </h4>
                          <div className='space-y-2'>
                            <p className='text-sm text-gray-700'>
                              <span className='font-medium'>P-value:</span>{' '}
                              {significance.pValue !== null 
                                ? significance.pValue < 0.001 
                                  ? '< 0.001' 
                                  : significance.pValue.toFixed(4)
                                : 'N/A'
                              }
                            </p>
                            <p className={`text-sm font-medium ${
                              significance.significant 
                                ? 'text-green-700' 
                                : 'text-yellow-700'
                            }`}>
                              {significance.description}
                            </p>
                            <p className='text-xs text-gray-600 mt-2'>
                              {significance.significant 
                                ? 'The performance difference between the two URLs is statistically significant.' 
                                : 'The performance difference between the two URLs is not statistically significant.'}
                              {' '}Statistical test: Welch's t-test (two-tailed).
                            </p>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Histogram */}
                    {(() => {
                      const data = getHistogramData();
                      return (
                        data && (
                          <div>
                            <h3 className='text-lg font-medium text-gray-900 mb-4'>
                              {metricsConfig[selectedMetric]?.title}{' '}
                              Distribution Histogram
                            </h3>
                            <ResponsiveContainer width='100%' height={600}>
                              <BarChart
                                data={data}
                                margin={{
                                  top: 20,
                                  right: 30,
                                  left: 20,
                                  bottom: 100,
                                }}
                              >
                                <CartesianGrid strokeDasharray='3 3' />
                                <XAxis
                                  dataKey='range'
                                  angle={-45}
                                  textAnchor='end'
                                  height={120}
                                  interval={0}
                                  tick={{ fontSize: 12 }}
                                  label={{
                                    value: `${
                                      metricsConfig[selectedMetric]?.title
                                    } ${
                                      metricsConfig[selectedMetric]?.unit
                                        ? `(${metricsConfig[selectedMetric]?.unit})`
                                        : ''
                                    }`,
                                    position: 'insideBottom',
                                    offset: -5,
                                  }}
                                />
                                <YAxis
                                  label={{
                                    value: 'Number of Tests',
                                    angle: -90,
                                    position: 'insideLeft',
                                  }}
                                  allowDecimals={false}
                                />
                                <Tooltip />
                                <Bar
                                  dataKey='URL 1'
                                  fill='#3B82F6'
                                  name='URL 1'
                                />
                                <Bar
                                  dataKey='URL 2'
                                  fill='#EF4444'
                                  name='URL 2'
                                />
                              </BarChart>
                            </ResponsiveContainer>
                            <p className='text-sm text-gray-600 mt-2'>
                              {metricsConfig[selectedMetric]?.description}
                            </p>
                          </div>
                        )
                      );
                    })()}
                  </div>
                )}

              {results.url1 && !results.url2 && (
                <div className='text-center py-8'>
                  <p className='text-gray-500'>
                    Test the second URL to see comparison
                  </p>
                </div>
              )}

              {!results.url1 && results.url2 && (
                <div className='text-center py-8'>
                  <p className='text-gray-500'>
                    Test the first URL to see comparison
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className='text-center text-sm text-gray-500'>
          <p>Powered by Google PageSpeed Insights API</p>
          <p className='mt-1'>
            Please note: Each test takes ~10 seconds, with 60-second intervals
            between tests for the same URL to avoid rate limits
          </p>
          <p className='mt-1'>
            Expected total time:{' '}
            {numberOfTests === 1
              ? '~10 seconds'
              : `~${
                  (numberOfTests - 1) * 60 + numberOfTests * 10
                } seconds per URL`}
          </p>
        </div>
      </div>
    </div>
  );
}
