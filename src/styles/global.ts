import { createGlobalStyle } from 'styled-components';

export default createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    outline: 0;
  }

  body {
    -webkit-font-smoothing: antialiased;
  }

  body, input, button {
    font-family: 'Roboto', sans-serif;
    font-size: 1rem;
  }

  h1, h2, h3, h4, h5, h6, strong, b {
    font-weight: bold;
  }

  button {
    cursor: pointer;
  }

  // Scrollbar customization
  ::-webkit-scrollbar {
    width: 16px;
  }
  ::-webkit-scrollbar-thumb {
    background: #555;
    border: 3px solid #fff;
    border-radius: 8px;
  }
  ::-webkit-scrollbar-track {
    border: 7.5px solid white;
    background-color: #ccc;
  }
  ::-webkit-scrollbar-thumb:hover {
    background: #222;
  }
`;
