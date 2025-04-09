# Sanskrit Manuscript Scraper

A specialized web scraping tool designed to download and archive Sanskrit manuscripts from the French Institute of Pondicherry's digital collections. This tool systematically retrieves manuscript images along with their associated metadata including script type and language information.

## Features

- Efficiently downloads manuscript images from the IFP digital collections
- Organizes files with script and language information in filenames
- Handles pagination to process hundreds of collection pages
- Implements concurrency for faster downloading while respecting server limits
- Ensures unique filenames to prevent overwriting
- Provides detailed logging of the download process

## Installation

1. Clone this repository:

   ```
   git clone https://github.com/yourusername/sanskrit-manuscript-scraper.git
   cd sanskrit-manuscript-scraper
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Requirements

- Node.js (v14 or higher recommended)
- NPM
- The following Node packages (installed via npm):
  - puppeteer
  - axios
  - fs (built-in)
  - path (built-in)

## Usage

Run the script with:

```
node scraper.js
```

By default, the script will:

1. Start scraping from page 1 to page 501 of the IFP manuscript collection
2. Download images to an "images" folder in the project directory
3. Process 5 pages concurrently (configurable)

### Configuration

You can modify the following parameters in the script:

- `startPage` and `endPage`: Define the range of pages to scrape
- `concurrency`: Number of pages to process simultaneously
- `downloadDir`: Where to save the downloaded images

## File Naming

Downloaded files follow this pattern:

```
script_language_pageX.jpg
```

Where:

- `script`: The script used in the manuscript (e.g., "Grantha", "Telugu")
- `language`: The language of the manuscript (e.g., "Sanskrit")
- `X`: The page number where the manuscript was found
- File extension: Preserved from the source image

## Ethical Use

This tool is intended for research, education, and preservation purposes only. Please respect:

1. The terms of service of the target website
2. Rate limits and server load considerations
3. Copyright and intellectual property rights
4. Cultural sensitivities around historical manuscripts

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- French Institute of Pondicherry for digitizing and making these valuable manuscripts accessible
- Contributors to the Puppeteer and Axios libraries

## Disclaimer

This script is provided for educational purposes. Users are responsible for ensuring their use complies with applicable laws and website terms of service.
