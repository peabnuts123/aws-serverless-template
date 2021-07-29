import { FunctionComponent } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';

import '@app/styles/index.scss';
import Header from '@app/components/header';
import Config from '@app/config';
import Logger from '@app/util/Logger';

// Static initialisation
Logger.setLogLevel(Config.LogLevel);

const App: FunctionComponent<AppProps> = ({ Component, pageProps }) => {
  return <>
    <Head>
      <title>My Project</title>

      {/* App info */}
      <meta name="app-environment" content={Config.EnvironmentId} />
      <meta name="app-version" content={Config.AppVersion} />

      <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
    </Head>

    <Header />

    <div className="container is-max-desktop">
      <Component {...pageProps} />
    </div>
  </>;
};

export default App;
