# Climate Risk Explorer - U.S. Counties by 2040-2060


## Overview

The Climate Risk Explorer is an interactive web application designed to visualize climate risk data for U.S. counties projected for the years 2040-2060 based on [this paper](https://www.pnas.org/doi/10.1073/pnas.1910114117). The application allows users to explore various climate risk factors and their potential impacts on different regions.

![Demo Page](public/demo_page.png)

## Technologies

The Climate Risk Explorer is built using:

- **React**: The core framework for building the user interface. The main components are [`App.jsx`](src/App.jsx), [`MapChart.jsx`](src/MapChart.jsx), and [`RadarChart.jsx`](src/RadarChart.jsx).
- **Vite**: A fast build tool and development server. Configuration can be found in [`vite.config.js`](vite.config.js).
- **D3.js**: For creating dynamic and interactive data visualizations.
- **CSS**: Styling is managed with CSS, including [`App.css`](src/App.css) and [`index.css`](src/index.css).

## Development Setup

To set up the development environment, follow these steps:

1. Clone the repository:
    ```sh
    git clone <repository-url>
    ```

2. Navigate to the project directory:
    ```sh
    cd climate-risk-explorer
    ```

3. Install dependencies:
    ```sh
    npm install
    ```

4. Start the development server:
    ```sh
    npm run dev
    ```

5. Open your browser and navigate to `http://localhost:3000` to see the application in action.

## License

This project is licensed under the MIT License. See the [LICENSE](http://_vscodecontentref_/2) file for details.

## Acknowledgements

This project is based on research published in the [PNAS paper](https://www.pnas.org/doi/10.1073/pnas.1910114117).

For more information, please refer to the project documentation.