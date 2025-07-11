# PageSpeed Insights Comparison Tool

A Next.js application for comparing Core Web Vitals metrics between two URLs using Google PageSpeed Insights API. Run multiple tests with histogram visualization and statistical analysis.

## Features

- **URL Comparison**: Compare PageSpeed metrics between two different URLs
- **Multiple Test Runs**: Configure 1-20 tests per URL for statistical accuracy
- **Rate Limiting**: Automatic 60-second intervals between tests to respect API limits
- **Histogram Visualization**: Interactive charts showing metric distribution
- **Statistical Analysis**: View average, median, range, and statistical significance testing
- **Customizable Range**: Adjust histogram X-axis ranges
- **Mobile & Desktop**: Test both mobile and desktop strategies
- **Real-time Progress**: Live countdown and progress tracking

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- pnpm package manager
- Google PageSpeed Insights API key

### Installation

1. **Clone the repository** (if applicable) or navigate to the project directory:

   ```bash
   cd cwv-analyzer
   ```

2. **Install dependencies**:

   ```bash
   pnpm install
   ```

3. **Set up environment variables**:
   Create a `.env.local` file in the root directory:

   ```bash
   touch .env.local
   ```

4. **Configure API Key**:
   Add your Google PageSpeed Insights API key to `.env.local`:
   ```
   NEXT_PUBLIC_PAGESPEED_API_KEY=your_api_key_here
   ```

### Getting a Google PageSpeed Insights API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the PageSpeed Insights API:
   - Navigate to "APIs & Services" > "Library"
   - Search for "PageSpeed Insights API"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key
5. (Optional) Restrict the API key:
   - Click on the API key to edit it
   - Under "API restrictions", select "Restrict key"
   - Choose "PageSpeed Insights API" from the list

### Running the Application

Start the development server:

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage

1. **Enter URLs**: Input two URLs you want to compare (at least one is required)
2. **Select Strategy**: Choose between Mobile or Desktop testing
3. **Configure Tests**: Select the number of tests to run (1-20)
4. **Run Tests**: Click "Run Comparison Test" to start
5. **View Results**: Analyze the histogram and statistical data
6. **Customize View**:
   - Select different metrics from the dropdown
   - Adjust histogram range using the min/max inputs
   - Use "Auto Range" to reset to data-driven range
7. **Statistical Significance**: Review p-values and significance testing when comparing two URLs

## Statistical Significance Testing

When comparing performance metrics between two URLs, the application performs statistical significance testing to determine if observed differences are meaningful or could be due to random variation.

### How It Works

- **Statistical Test**: Uses Welch's t-test (two-tailed) to compare metric values between URLs
- **Requirements**: Minimum 2 test samples per URL for valid statistical analysis
- **Calculation**: Compares means while accounting for different variances and sample sizes

### Understanding P-Values

The p-value indicates the probability that the observed difference occurred by chance:

- **p < 0.001**: Highly significant difference (very strong evidence)
- **p < 0.01**: Very significant difference (strong evidence)
- **p < 0.05**: Significant difference (moderate evidence) - commonly used threshold
- **p < 0.1**: Marginally significant difference (weak evidence)
- **p ≥ 0.1**: No significant difference (insufficient evidence)

### Interpretation

**Significant Results (p < 0.05):**
- The performance difference is likely real and not due to random variation
- You can be confident that one URL genuinely performs better/worse than the other
- Useful for making data-driven decisions about website optimizations

**Non-Significant Results (p ≥ 0.05):**
- The observed difference could be due to random variation
- Cannot confidently conclude that one URL is better than the other
- Consider running more tests or investigating other factors

### Recommended Number of Tests

For accurate statistical significance testing, the number of tests affects the reliability of your results:

- **Minimum**: 3 tests per URL (basic comparison, limited reliability)
- **Good**: 5-10 tests per URL (moderate reliability, suitable for most comparisons)
- **Better**: 10-15 tests per URL (good reliability, recommended for important decisions)
- **Best**: 15-20 tests per URL (high reliability, ideal for critical performance analysis)

**Why More Tests Matter:**
- Reduces impact of random variation and outliers
- Increases statistical power to detect real differences
- Provides more stable p-value calculations
- Gives confidence in your optimization decisions

**Practical Recommendation**: Start with 10 tests per URL as a good balance between accuracy and testing time (approximately 10-15 minutes per URL).

### Best Practices

1. **Sufficient Sample Size**: Use 10+ tests per URL for reliable statistical analysis
2. **Consistent Conditions**: Test both URLs under similar network/server conditions
3. **Multiple Metrics**: Check significance across different Core Web Vitals metrics
4. **Context Matters**: Consider practical significance alongside statistical significance

### Example Scenarios

- **Highly Significant (p < 0.001)**: Clear performance winner for optimization decisions
- **Not Significant (p > 0.1)**: URLs perform similarly; focus on other factors
- **Marginal (0.05 < p < 0.1)**: Borderline case; consider additional testing

## Technical Details

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts library
- **API**: Google PageSpeed Insights API v5
- **Rate Limiting**: 60-second intervals between same-URL tests
- **Icons**: Lucide React

## Expected Test Duration

- **Single test**: ~10 seconds per URL
- **Multiple tests**: `(numberOfTests - 1) � 60 + numberOfTests � 10` seconds per URL
- **Example**: 5 tests = ~290 seconds (4m 50s) per URL

## Troubleshooting

### API Key Issues

- Ensure your API key is correctly set in `.env.local`
- Verify the PageSpeed Insights API is enabled in Google Cloud Console
- Check for any usage quotas or billing issues

### URL Validation Errors

- URLs must include the protocol (http:// or https://)
- Ensure the website is publicly accessible
- Some websites may block automated testing

### Rate Limiting

- The app automatically handles rate limiting with 60-second delays
- If you encounter 429 errors, the app will retry automatically
- For development, consider using fewer test runs

### Performance

- Large numbers of tests will take significant time
- The browser tab must remain active for tests to complete
- Consider running tests during off-peak hours for better API response times

## Development

To modify the application:

1. **Add new metrics**: Update `src/config/metrics.ts`
2. **Modify UI**: Edit components in `src/components/`
3. **Change API logic**: Modify `src/hooks/usePageSpeed.ts`
4. **Styling**: Update Tailwind classes or `src/app/globals.css`

## License

This project is for development and testing purposes. Please respect Google's PageSpeed Insights API terms of service and usage limits.
