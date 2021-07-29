import React, { FunctionComponent } from "react";

const About: FunctionComponent = () => {
  return (
    <section className="section">
      <h1 className="is-size-2">About</h1>

      <h2 className="is-size-4">What is &quot;My Project&quot;?</h2>
      <p>
        This is a classic todo-style app to demonstrate the <a href="https://github.com/peabnuts123/aws-serverless-template">aws-serverless-template</a> project. It showcases enough functionality as to not be contrived, but is not such a sophisticated example that it is difficult to understand.
      </p>
      <p>
        The API showcases several simple CRUD actions for multiple related resources, persisted into a database. The frontend showcases classic API interactions and architectural approaches. The site itself is configured to return pre-rendered HTML and proper HTTP response codes (even though it is a single-page-app) which improves SEO and performance of loading the site.
      </p>
    </section>
  );
};

export default About;
