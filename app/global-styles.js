import { createGlobalStyle } from 'styled-components';
import Background from 'images/background.jpg';

import OpenSansLight from 'fonts/OpenSans-Light.ttf';
import OpenSansLightItalic from 'fonts/OpenSans-LightItalic.ttf';
import OpenSansRegular from 'fonts/OpenSans-Regular.ttf';
import OpenSansItalic from 'fonts/OpenSans-Italic.ttf';
import OpenSansSemiBold from 'fonts/OpenSans-SemiBold.ttf';
import OpenSansSemiBoldItalic from 'fonts/OpenSans-SemiBoldItalic.ttf';
import OpenSansBold from 'fonts/OpenSans-Bold.ttf';
import OpenSansBoldItalic from 'fonts/OpenSans-BoldItalic.ttf';
import OpenSansExtraBold from 'fonts/OpenSans-ExtraBold.ttf';
import OpenSansExtraBoldItalic from 'fonts/OpenSans-ExtraBoldItalic.ttf';

const GlobalStyle = createGlobalStyle`
// ---------- OPEN SANS ----------
  @font-face {
    font-family: ${(props) => props.theme.fontFamily};
    src: url(${OpenSansLight}) format('truetype');
    font-weight: 300;
    font-style: normal;
  }

  @font-face {
    font-family: ${(props) => props.theme.fontFamily};
    src: url(${OpenSansLightItalic}) format('truetype');
    font-weight: 300;
    font-style: italic;
  }

  @font-face {
    font-family: ${(props) => props.theme.fontFamily};
    src: url(${OpenSansRegular}) format('truetype');
    font-weight: 400;
    font-style: normal;
  }

  @font-face {
    font-family: ${(props) => props.theme.fontFamily};
    src: url(${OpenSansItalic}) format('truetype');
    font-weight: 400;
    font-style: italic;
  }

  @font-face {
    font-family: ${(props) => props.theme.fontFamily};
    src: url(${OpenSansSemiBold}) format('truetype');
    font-weight: 600;
    font-style: normal;
  }

  @font-face {
    font-family: ${(props) => props.theme.fontFamily};
    src: url(${OpenSansSemiBoldItalic}) format('truetype');
    font-weight: 600;
    font-style: italic;
  }

  @font-face {
    font-family: ${(props) => props.theme.fontFamily};
    src: url(${OpenSansBold}) format('truetype');
    font-weight: 700;
    font-style: normal;
  }

  @font-face {
    font-family: ${(props) => props.theme.fontFamily};
    src: url(${OpenSansBoldItalic}) format('truetype');
    font-weight: 700;
    font-style: italic;
  }

  @font-face {
    font-family: ${(props) => props.theme.fontFamily};
    src: url(${OpenSansExtraBold}) format('truetype');
    font-weight: 800;
    font-style: normal;
  }

  @font-face {
    font-family: ${(props) => props.theme.fontFamily};
    src: url(${OpenSansExtraBoldItalic}) format('truetype');
    font-weight: 800;
    font-style: italic;
  }

  // --------------------
  * {
    font-family: ${(props) => props.theme.fontFamily};
  }

  html,
  body {
    height: 100%;
    width: 100%;
    color: ${(props) => props.theme.text};
    margin: 0;
    font-size: 16px;
  }
  a {
    text-decoration: underline;
  }
  input {
    color: initial;
  }
  img {
    max-width: initial;
  }

  #app {
    background-color: ${(props) => props.theme.background};
    background-size: cover;
    background-image: url(${Background});
    background-position: center 80px;
    background-repeat: no-repeat;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    overflow: hidden;
    overflow-y: auto;
  }

  p,
  label {
    line-height: 1.5em;
  }

  aside {
    backdrop-filter: blur(10px) drop-shadow(0px 4px 4px rgba(0,0,0,0.25)) !important;
  }

.card {
  position: relative;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-clip: border-box;
  background-color: ${(props) => props.theme.surface};
  margin: 0px 0px;
  margin-bottom: 7px;
  border-radius: 7px;
  border-color: ${(props) => props.theme.surface};
  color: ${(props) => props.theme.onSurface};
  transition: background-color .1s ease-out, border-color .15s ease-out;

  &.vault {
    border: 0;
    &, &.active {
      background-color: transparent;
    }

    .card-header, .collapse, .card-body {
      background-color: ${(props) => props.theme.surface};
    }

    .collapse {
      margin-top: 2px;
    }

    .action-button {
      display: flex;
      align-items: center;
      justify-content: center;
      padding-top: 0;
      padding-bottom: 0;
      letter-spacing: 0.88px;
      font-weight: 500;

      &.bold {
        font-weight: 700;
      }
      &.dark {
        background-color: ${(props) => props.theme.surface};
        color: ${(props) => props.theme.onSurface};
      }

      &.light {
        background-color: ${(props) => props.theme.white};
        color: ${(props) => props.theme.vaultBackgroundAlt};
      }

      &.outline {
        background-color: transparent;
        color: ${(props) => props.theme.white};
        border: 1px solid ${(props) => props.theme.primary};
        &.bold {
          border-width: 2px;
        }
        &.light {
          border: 1px solid ${(props) => props.theme.white};
        }
      }
    }
  }
  &.amplify-vault {
    .amplify-vault-controls {
      background-color: ${(props) => props.theme.vaultBackgroundAlt};
      border-radius: 8px;

      input:disabled {
        background: ${(props) => props.theme.primary};
        color: ${(props) => props.theme.white};
      }
    }
  }
  &.pickle-vault {
    .card-header, .collapse, .card-body {
      background-color: ${(props) => props.theme.primary};
      border-color: ${(props) => props.theme.primary};
    }
  }
}

a {
  color: #fff;
  outline: none;
}

.card.active {
  border-color: ${(props) => props.theme.surface};
  background-color: ${(props) => props.theme.surface};
  transition: background-color .1s ease-in;
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

.card-body {
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
  min-height: 1px;
  background-color: ${(props) => props.theme.surface};
}

.card-footer {
  background-color: ${(props) => props.theme.surface};
  display: flex;
  justify-content: flex-end;
  opacity: 1;
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
  padding: 0px;
  margin-bottom: 0;
  display: flex;
  align-items: center;
  height: 64px;
  background-color: transparent;
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
  padding-bottom: 80px;
}

.accordion > .card {
  overflow: hidden;
}

.collapse:not(.show) {
  height: 0px;
}

.collapsing {
  position: relative;
  height: 0;
  overflow: hidden;
  transition: height 0.05s ease-out;
}

@media (prefers-reduced-motion: reduce) {
  .collapsing {
    transition: none;
  }
}

#matrix {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 1;
}

canvas {
  display: block;
  pointer-events: none;
}

.MuiButton-label {
  text-overflow: ellipsis;
  overflow: hidden;
  display: block !important;
  white-space: nowrap;
}

.modal-open {
  overflow: hidden;
}

.modal-open .modal {
  overflow-x: hidden;
  overflow-y: auto;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  display: none;
  width: 100%;
  height: 100%;
  overflow: hidden;
  outline: 0;
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 0.5rem;
  pointer-events: none;
}

.modal.fade .modal-dialog {
  transition: -webkit-transform 0.3s ease-out;
  transition: transform 0.3s ease-out;
  transition: transform 0.3s ease-out, -webkit-transform 0.3s ease-out;
  -webkit-transform: translate(0, -50px);
  transform: translate(0, -50px);
}

@media (prefers-reduced-motion: reduce) {
  .modal.fade .modal-dialog {
    transition: none;
  }
}

.modal.show .modal-dialog {
  -webkit-transform: none;
  transform: none;
}

.modal.modal-static .modal-dialog {
  -webkit-transform: scale(1.02);
  transform: scale(1.02);
}

.modal-dialog-scrollable {
  display: -ms-flexbox;
  display: flex;
  max-height: calc(100% - 1rem);
}

.modal-dialog-scrollable .modal-content {
  max-height: calc(100vh - 1rem);
  overflow: hidden;
}

.modal-dialog-scrollable .modal-header,
.modal-dialog-scrollable .modal-footer {
  -ms-flex-negative: 0;
  flex-shrink: 0;
}

.modal-dialog-scrollable .modal-body {
  overflow-y: auto;
}

.modal-dialog-centered {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  min-height: calc(100% - 1rem);
}

.modal-dialog-centered::before {
  display: block;
  height: calc(100vh - 1rem);
  height: -webkit-min-content;
  height: -moz-min-content;
  height: min-content;
  content: "";
}

.modal-dialog-centered.modal-dialog-scrollable {
  -ms-flex-direction: column;
  flex-direction: column;
  -ms-flex-pack: center;
  justify-content: center;
  height: 100%;
}

.modal-dialog-centered.modal-dialog-scrollable .modal-content {
  max-height: none;
}

.modal-dialog-centered.modal-dialog-scrollable::before {
  content: none;
}

.modal-content {
  position: relative;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-direction: column;
  flex-direction: column;
  width: 100%;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  outline: 0;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1040;
  width: 100vw;
  height: 100vh;
  background-color: #000;
}

.modal-backdrop.fade {
  opacity: 0;
}

.modal-backdrop.show {
  opacity: 0.5;
}

.modal-header {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: start;
  align-items: flex-start;
  -ms-flex-pack: justify;
  justify-content: space-between;
  padding: 1rem 1rem;
  border-bottom: 1px solid #dee2e6;
  border-top-left-radius: calc(0.3rem - 1px);
  border-top-right-radius: calc(0.3rem - 1px);
}

.modal-header .close {
  padding: 1rem 1rem;
  margin: -1rem -1rem -1rem auto;
}

.modal-title {
  margin-bottom: 0;
  line-height: 1.5;
}

.modal-body {
  position: relative;
  -ms-flex: 1 1 auto;
  flex: 1 1 auto;
}

.modal-footer {
  display: -ms-flexbox;
  display: flex;
  -ms-flex-wrap: wrap;
  flex-wrap: wrap;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: end;
  justify-content: flex-end;
  padding: 0.75rem;
  border-top: 1px solid #dee2e6;
  border-bottom-right-radius: calc(0.3rem - 1px);
  border-bottom-left-radius: calc(0.3rem - 1px);
}

.modal-footer > * {
  margin: 0.25rem;
}

.modal-scrollbar-measure {
  position: absolute;
  top: -9999px;
  width: 50px;
  height: 50px;
  overflow: scroll;
}

@media (min-width: 576px) {
  .modal-dialog {
    max-width: 900px;
    margin: 1.75rem auto;
  }
  .modal-dialog-scrollable {
    max-height: calc(100% - 3.5rem);
  }
  .modal-dialog-scrollable .modal-content {
    max-height: calc(100vh - 3.5rem);
  }
  .modal-dialog-centered {
    min-height: calc(100% - 3.5rem);
  }
  .modal-dialog-centered::before {
    height: calc(100vh - 3.5rem);
    height: -webkit-min-content;
    height: -moz-min-content;
    height: min-content;
  }
  .modal-sm {
    max-width: 300px;
  }
}

@media (min-width: 992px) {
  .modal-lg,
  .modal-xl {
    max-width: 800px;
  }
}

@media (min-width: 1200px) {
  .modal-xl {
    max-width: 1140px;
  }
}

#editor {
  border-radius: 10px 0px 0px 10px;
}

.modal-dialog.transactionModal {
  max-width: 551px;
  min-height: 500px;
  height: 80vh;
}

.modal-dialog.contractStatisticsModal {
  max-width: 80vw;
  min-height: 80vh;
}

.modal-dialog.transactionModal.devMode {
  max-width: 80vw;
  max-height: 80vh;
  min-width: 700px;
  min-height: 500px;
  height: 80vh;
}

.modal-content {
  background-color: ${(props) => props.theme.modalBackground};
  height: 100%;
}
`;

export default GlobalStyle;
