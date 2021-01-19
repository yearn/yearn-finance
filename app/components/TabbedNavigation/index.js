import React, { useState } from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

const PageName = styled.div`
  font-family: gotham;
  font-weight: 500;
  font-size: 14px;
  color: ${(props) => (props.pageSelected ? '#ff5f00' : '#9b9b9b')};
  display: inline-block;
  padding-left: 7px;
  padding-right: 7px;
  text-transform: uppercase;
`;

const PageNames = styled.div`
  padding-bottom: 26px;
  text-align: center;
  width: 100%;
`;

function Component(props) {
  const { pages } = props;
  const [selectedPageNbr, setSelectedPageNbr] = useState(0);
  const currentPage = pages[selectedPageNbr];
  const CurrentPage = currentPage.element;

  const renderPageName = (page, idx) => {
    const { name } = page;
    const pageSelected = selectedPageNbr === idx;
    return (
      <PageName
        onClick={() => setSelectedPageNbr(idx)}
        key={idx}
        pageSelected={pageSelected}
      >
        {name}
      </PageName>
    );
  };
  const pageNames = _.map(pages, renderPageName);
  return (
    <Wrapper>
      <PageNames>{pageNames}</PageNames>
      <CurrentPage {...props} />
    </Wrapper>
  );
}

export default Component;
