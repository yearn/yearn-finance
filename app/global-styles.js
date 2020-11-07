import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  html,
  body {
    height: 100%;
    width: 100%;
    color: ${props => props.theme.text};
    margin: 0;
  }

  body {
    font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  body.fontLoaded {
    font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  }

  #app {
    background-color: ${props => props.theme.background};
    min-height: 100%;
    min-width: 100%;
  }

  p,
  label {
    font-family: Georgia, Times, 'Times New Roman', serif;
    line-height: 1.5em;
  }

.card {
  position: relative;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: ${props => props.theme.vaultBackground};
  background-clip: border-box;
  border: 1px solid ${props => props.theme.vaultBorder};
  margin: 20px 0px;
  border-radius: 15px;
}

.card > hr {
  margin-right: 0;
  margin-left: 0;
}

.card > .list-group {
  border-top: inherit;
  border-bottom: inherit;
}

.card > .list-group:first-child {
  border-top-width: 0;
}

.card > .list-group:last-child {
  border-bottom-width: 0;
}

.card > .card-header + .list-group,
.card > .list-group + .card-footer {
  border-top: 0;
}

.card-body {
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  min-height: 1px;
  padding: 1.25rem;
}

.card-title {
  margin-bottom: 0.75rem;
}

.card-subtitle {
  margin-top: -0.375rem;
  margin-bottom: 0;
}

.card-text:last-child {
  margin-bottom: 0;
}

.card-link:hover {
  text-decoration: none;
}

.card-link + .card-link {
  margin-left: 1.25rem;
}

.card-header {
  padding: 0.75rem 1.25rem;
  margin-bottom: 0;
  background-color: ${props => props.theme.vaultBackground};
}

.card-header-tabs {
  margin-right: -0.625rem;
  margin-bottom: -0.75rem;
  margin-left: -0.625rem;
  border-bottom: 0;
}

.card-header-pills {
  margin-right: -0.625rem;
  margin-left: -0.625rem;
}

.card-deck .card {
  margin-bottom: 15px;
}

@media (min-width: 576px) {
  .card-deck {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-flow: row wrap;
    flex-flow: row wrap;
    margin-right: -15px;
    margin-left: -15px;
  }
  .card-deck .card {
    -ms-flex: 1 0 0%;
    flex: 1 0 0%;
    margin-right: 15px;
    margin-bottom: 0;
    margin-left: 15px;
  }
}

.card-group > .card {
  margin-bottom: 15px;
}

@media (min-width: 576px) {
  .card-group {
    display: -ms-flexbox;
    display: flex;
    -ms-flex-flow: row wrap;
    flex-flow: row wrap;
  }
  .card-group > .card {
    -ms-flex: 1 0 0%;
    flex: 1 0 0%;
    margin-bottom: 0;
  }
  .card-group > .card + .card {
    margin-left: 0;
    border-left: 0;
  }
}

.card-columns .card {
  margin-bottom: 0.75rem;
}

@media (min-width: 576px) {
  .card-columns {
    -webkit-column-count: 3;
    -moz-column-count: 3;
    column-count: 3;
    -webkit-column-gap: 1.25rem;
    -moz-column-gap: 1.25rem;
    column-gap: 1.25rem;
    orphans: 1;
    widows: 1;
  }
  .card-columns .card {
    display: inline-block;
    width: 100%;
  }
}

.accordion {
  overflow-anchor: none;
}

.accordion > .card {
  overflow: hidden;
}

.collapse:not(.show) {
  display: none;
}

.collapsing {
  position: relative;
  height: 0;
  overflow: hidden;
  transition: height 0.15s ease;
}

@media (prefers-reduced-motion: reduce) {
  .collapsing {
    transition: none;
  }
}

`;

export default GlobalStyle;
