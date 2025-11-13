import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* CSS Reset */
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    /* Color palette */
    --primary-purple: #6C63FF;
    --primary-blue: #2196F3;
    --text-dark: #22223B;
    --text-light: #9A9A9A;
    --background-light: #F7F7FA;

    /* Font sizes for scalable typography */
    --font-size-xl: 2rem;
    --font-size-lg: 1.5rem;
    --font-size-base: 1rem;
    --font-size-sm: 0.875rem;

    /* Font weights for emphasis */
    --font-weight-bold: 700;
    --font-weight-medium: 500;
    --font-weight-regular: 400;

    /* Spacing units for consistent layout */
    --space-sm: 0.5rem;
    --space-md: 1rem;
    --space-lg: 2rem;

    /* Subtle box shadow for card and modal UI */
    --box-shadow-sm: 0 2px 8px rgba(44, 62, 80, 0.08);

    /* Border radius for rounded corners */
    --border-radius-md: 0.75rem;
  }

  body {
    font-family: 'Poppins', Arial, Helvetica, sans-serif;
    background: var(--background-light);
    color: var(--text-dark);
  }
`;

export default GlobalStyles;
