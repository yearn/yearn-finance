import React from 'react';

class VaultDev extends React.PureComponent {
  render() {
    console.log('cccc', this.props.vault);
    return <h1>Hello</h1>;
  }
}

VaultDev.whyDidYouRender = true;
export default VaultDev;
