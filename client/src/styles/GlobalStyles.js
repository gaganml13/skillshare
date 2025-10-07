import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Import Poppins font from Google Fonts */
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap');

  /* CSS Reset */
  *, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :root {
    --primary-purple: #6C63FF;
    --primary-blue: #2196F3;
    --text-dark: #22223B;
    --text-light: #9A9A9A;
    --background-light: #F7F7FA;
  }

  body {
    font-family: 'Poppins', Arial, Helvetica, sans-serif;
    background: var(--background-light);
    color: var(--text-dark);
  }
`;

export default GlobalStyles;
