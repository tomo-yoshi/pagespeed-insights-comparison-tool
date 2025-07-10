export interface MetricConfig {
  [x: string]:
    | string
    | boolean
    | {
        min: number;
        max: number;
      };
  title: string;
  description: string;
  enabled: boolean;
  category: string;
  unit: string;
  defaultRange: {
    min: number;
    max: number;
  };
  // @ts-ignore
  customRange?:
    | {
        min: number;
        max: number;
      }
    | undefined;
}

export const metricsConfig: Record<string, MetricConfig> = {
  // Core Web Vitals
  'largest-contentful-paint': {
    title: 'Largest Contentful Paint',
    description:
      'Largest Contentful Paint marks the time at which the largest text or image is painted.',
    enabled: true,
    category: 'Core Web Vitals',
    unit: 'ms',
    defaultRange: { min: 0, max: 20000 },
  },
  'first-contentful-paint': {
    title: 'First Contentful Paint',
    description:
      'First Contentful Paint marks the time at which the first text or image is painted.',
    enabled: true,
    category: 'Core Web Vitals',
    unit: 'ms',
    defaultRange: { min: 0, max: 10000 },
  },
  'cumulative-layout-shift': {
    title: 'Cumulative Layout Shift',
    description:
      'Cumulative Layout Shift measures the movement of visible elements within the viewport.',
    enabled: true,
    category: 'Core Web Vitals',
    unit: '',
    defaultRange: { min: 0, max: 2 },
  },

  // Performance Metrics
  'speed-index': {
    title: 'Speed Index',
    description:
      'Speed Index shows how quickly the contents of a page are visibly populated.',
    enabled: true,
    category: 'Performance',
    unit: 'ms',
    defaultRange: { min: 0, max: 10000 },
  },
  'total-blocking-time': {
    title: 'Total Blocking Time',
    description:
      'Sum of all time periods between FCP and Time to Interactive, when task length exceeded 50ms.',
    enabled: true,
    category: 'Performance',
    unit: 'ms',
    defaultRange: { min: 0, max: 20000 },
  },
  interactive: {
    title: 'Time to Interactive',
    description:
      'Time to Interactive is the amount of time it takes for the page to become fully interactive.',
    enabled: true,
    category: 'Performance',
    unit: 'ms',
    defaultRange: { min: 0, max: 20000 },
  },
  'max-potential-fid': {
    title: 'Max Potential First Input Delay',
    description:
      'The maximum potential First Input Delay that your users could experience.',
    enabled: true,
    category: 'Performance',
    unit: 'ms',
    defaultRange: { min: 0, max: 1000 },
  },

  // Resource Metrics
  'bootup-time': {
    title: 'JavaScript Execution Time',
    description:
      'Consider reducing the time spent parsing, compiling, and executing JS.',
    enabled: true,
    category: 'Resource',
    unit: 'ms',
    defaultRange: { min: 0, max: 10000 },
  },
  'mainthread-work-breakdown': {
    title: 'Main Thread Work',
    description:
      'Consider reducing the time spent parsing, compiling and executing JS.',
    enabled: true,
    category: 'Resource',
    unit: 'ms',
    defaultRange: { min: 0, max: 15000 },
  },
  'dom-size': {
    title: 'DOM Size',
    description:
      'A large DOM will increase memory usage and produce costly layout reflows.',
    enabled: true,
    category: 'Resource',
    unit: 'elements',
    defaultRange: { min: 0, max: 2000 },
  },
  'total-byte-weight': {
    title: 'Total Byte Weight',
    description:
      'Large network payloads cost users real money and are highly correlated with long load times.',
    enabled: true,
    category: 'Resource',
    unit: 'KiB',
    defaultRange: { min: 0, max: 2000000 },
  },

  // JavaScript Optimization
  'unused-javascript': {
    title: 'Unused JavaScript',
    description:
      'Reduce unused JavaScript and defer loading scripts until they are required.',
    enabled: true,
    category: 'JavaScript',
    unit: 'KiB',
    defaultRange: { min: 0, max: 5000 },
  },
  'legacy-javascript': {
    title: 'Legacy JavaScript',
    description: 'Avoid serving legacy JavaScript to modern browsers.',
    enabled: true,
    category: 'JavaScript',
    unit: 'KiB',
    defaultRange: { min: 0, max: 400 },
  },
  'duplicated-javascript': {
    title: 'Duplicated JavaScript',
    description: 'Remove large, duplicate JavaScript modules from bundles.',
    enabled: false,
    category: 'JavaScript',
    unit: 'KiB',
    defaultRange: { min: 0, max: 400 },
  },
  'unminified-javascript': {
    title: 'Unminified JavaScript',
    description:
      'Minifying JavaScript files can reduce payload sizes and script parse time.',
    enabled: false,
    category: 'JavaScript',
    unit: 'KiB',
    defaultRange: { min: 0, max: 400 },
  },

  // CSS Optimization
  'unminified-css': {
    title: 'Unminified CSS',
    description: 'Minifying CSS files can reduce network payload sizes.',
    enabled: false,
    category: 'CSS',
    unit: 'KiB',
    defaultRange: { min: 0, max: 400 },
  },
  'unused-css-rules': {
    title: 'Unused CSS Rules',
    description:
      'Reduce unused rules from stylesheets and defer CSS not used for above-the-fold content.',
    enabled: true,
    category: 'CSS',
    unit: 'KiB',
    defaultRange: { min: 0, max: 400 },
  },

  // Network
  'network-rtt': {
    title: 'Network Round Trip Times',
    description:
      'Network round trip times (RTT) have a large impact on performance.',
    enabled: true,
    category: 'Network',
    unit: 'ms',
    defaultRange: { min: 0, max: 500 },
  },
  'network-server-latency': {
    title: 'Server Backend Latencies',
    description: 'Server latencies can impact web performance.',
    enabled: true,
    category: 'Network',
    unit: 'ms',
    defaultRange: { min: 0, max: 500 },
  },
  'server-response-time': {
    title: 'Server Response Time',
    description:
      'Keep the server response time for the main document short because all other requests depend on it.',
    enabled: true,
    category: 'Network',
    unit: 'ms',
    defaultRange: { min: 0, max: 2000 },
  },

  // Image Optimization
  'modern-image-formats': {
    title: 'Modern Image Formats',
    description:
      'Image formats like WebP and AVIF often provide better compression than PNG or JPEG.',
    enabled: false,
    category: 'Images',
    unit: 'KiB',
    defaultRange: { min: 0, max: 400 },
  },
  'uses-optimized-images': {
    title: 'Optimized Images',
    description: 'Optimized images load faster and consume less cellular data.',
    enabled: false,
    category: 'Images',
    unit: 'KiB',
    defaultRange: { min: 0, max: 400 },
  },
  'uses-responsive-images': {
    title: 'Responsive Images',
    description:
      'Serve images that are appropriately-sized to save cellular data and improve load time.',
    enabled: false,
    category: 'Images',
    unit: 'KiB',
    defaultRange: { min: 0, max: 400 },
  },
  'offscreen-images': {
    title: 'Offscreen Images',
    description:
      'Consider lazy-loading offscreen and hidden images after all critical resources have finished loading.',
    enabled: false,
    category: 'Images',
    unit: 'KiB',
    defaultRange: { min: 0, max: 400 },
  },
  'efficient-animated-content': {
    title: 'Efficient Animated Content',
    description: 'Large GIFs are inefficient for delivering animated content.',
    enabled: false,
    category: 'Images',
    unit: 'KiB',
    defaultRange: { min: 0, max: 400 },
  },

  // Other
  redirects: {
    title: 'Redirects',
    description:
      'Redirects introduce additional delays before the page can be loaded.',
    enabled: false,
    category: 'Other',
    unit: 'count',
    defaultRange: { min: 0, max: 4 },
  },
  'render-blocking-resources': {
    title: 'Render-Blocking Resources',
    description: 'Resources are blocking the first paint of your page.',
    enabled: true,
    category: 'Other',
    unit: 'count',
    defaultRange: { min: 0, max: 1000 },
  },
  'prioritize-lcp-image': {
    title: 'Prioritize LCP Image',
    description: 'Preload the LCP image to improve LCP time.',
    enabled: true,
    category: 'Other',
    unit: 'count',
    defaultRange: { min: 0, max: 1000 },
  },
};

// Helper functions remain the same but need to be updated to use the new range format
export function getMetricRange(metricKey: string, value: number): string {
  const metric = metricsConfig[metricKey];
  if (!metric) return '';

  const { min, max } = metric.customRange || metric.defaultRange;
  const step = (max - min) / 10;

  for (let i = 0; i < 10; i++) {
    const rangeStart = min + step * i;
    const rangeEnd = i === 9 ? max : min + step * (i + 1);
    if (value >= rangeStart && value <= rangeEnd) {
      return `${rangeStart}~${rangeEnd}`;
    }
  }
  return '';
}

export function formatMetricValue(metricKey: string, value: number): string {
  const metric = metricsConfig[metricKey];
  if (!metric) return value.toString();

  switch (metric.unit) {
    case 'ms':
      return `${(value / 1000).toFixed(2)}s`;
    case 'KiB':
      return `${(value / 1024).toFixed(2)} KiB`;
    case '':
      return value.toString();
    default:
      return `${value}${metric.unit}`;
  }
}
