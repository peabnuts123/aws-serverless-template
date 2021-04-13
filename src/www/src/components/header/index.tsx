import classNames from "classnames";
import { Link } from "gatsby";
import React, { FunctionComponent, useState } from "react";
import {
  Menu as MenuIcon,
} from 'react-feather';

import useRouteChange from "@app/hooks/use-route-change";

const Index: FunctionComponent = () => {
  // State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Close menus on route change (i.e. when you navigate using on the of the menus)
  useRouteChange((_args) => {
    setIsMobileNavOpen(false);
  });

  return (
    <>
      {/* Mobile nav overlay */}
      {(isMobileNavOpen) && (
        <div className="navbar__mobile-background" onClick={() => setIsMobileNavOpen(false)} />
      )}

      <nav className="navbar mb-3" role="navigation" aria-label="main navigation">
        <div className="container is-max-desktop">
          <div className="navbar-brand">
            <Link to="/" className="navbar-item is-size-4 has-text-weight-bold is-family-primary has-text-primary">
              My Project
            </Link>

            <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
                <MenuIcon size={20} />
            </a>
          </div>

          <div className={classNames("navbar-menu", { 'is-active': isMobileNavOpen })}>
            <div className="navbar-start">
              <Link className="navbar-item" activeClassName="is-active" to="/">Home</Link>
              <Link className="navbar-item" activeClassName="is-active" to="/about">About</Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Index;
