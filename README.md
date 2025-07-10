# PageSpeed Insights Comparison Tool

A Next.js application for comparing Core Web Vitals metrics between two URLs using Google PageSpeed Insights API. Run multiple tests with histogram visualization and statistical analysis.

## Features

- **URL Comparison**: Compare PageSpeed metrics between two different URLs
- **Multiple Test Runs**: Configure 1-20 tests per URL for statistical accuracy
- **Rate Limiting**: Automatic 60-second intervals between tests to respect API limits
- **Histogram Visualization**: Interactive charts showing metric distribution
- **Statistical Analysis**: View average, median, and range for each metric
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
