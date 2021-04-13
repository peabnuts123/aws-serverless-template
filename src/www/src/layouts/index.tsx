import React, { FunctionComponent } from "react";

import Header from '@app/components/header';

interface Props {
  children?: any;
}

const Index: FunctionComponent = ({ children }: Props) => {
  return (
    <>
      <Header />

      <div className="container is-max-desktop">
        {children}
      </div>
    </>
  );
};

export default Index;
