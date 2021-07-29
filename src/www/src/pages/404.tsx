import Link from "next/link";
import React, { FunctionComponent } from "react";

const NotFound: FunctionComponent = () => {
  return (
    <section className="section">
      <h1 className="is-size-2">Not found</h1>
      <p>The page you are looking for was not found. Sorry &apos;bout it. Insert funny 404 gag here.</p>
      <p>Click <Link href="/">here</Link> to return to the home page.</p>
    </section>
  );
};

export default NotFound;
