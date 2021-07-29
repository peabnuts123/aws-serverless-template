import classNames, { Argument as ClassNamesArgument } from "classnames";
import React, { FunctionComponent, useState } from "react";
import {
  Menu as MenuIcon,
} from 'react-feather';
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Index: FunctionComponent = () => {
  const router = useRouter();

  useEffect(() => {
    // Close menus on route change (i.e. when you navigate using on the of the menus)
    router.events.on('routeChangeComplete', () => {
      setIsMobileNavOpen(false);
    });
  }, []);

  // State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);

  // Functions
  const isCurrentRoute = (route: string): boolean => router.route === route;
  const hasActiveClassName = (route: string): ClassNamesArgument  => ({ 'is-active': isCurrentRoute(route) });

  return (
    <>
      {/* Mobile nav overlay */}
      {(isMobileNavOpen) && (
        <div className="navbar__mobile-background" onClick={() => setIsMobileNavOpen(false)} />
      )}

      <nav className="navbar mb-3" role="navigation" aria-label="main navigation">
        <div className="container is-max-desktop">
          <div className="navbar-brand">
            <Link href="/">
              <a className="navbar-item is-size-4 has-text-weight-bold is-family-primary has-text-primary">My Project</a>
            </Link>

            <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}>
              <MenuIcon size={20} />
            </a>
          </div>

          <div className={classNames("navbar-menu", { 'is-active': isMobileNavOpen })}>
            <div className="navbar-start">
              <Link href="/">
                <a className={classNames("navbar-item", hasActiveClassName('/'))}> Home</a>
              </Link>
              <Link href="/about">
                <a className={classNames("navbar-item", hasActiveClassName('/test'))}>About</a>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Index;
