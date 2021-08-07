import { invokeHandler } from '@test/util/invoke-handler';
import { handler } from '@app/handlers/www-proxy';

describe("www-proxy handler", () => {
  test("Given an extant URL, resolves the correct object", () => {
    // Setup
    const uri = '/about';

    // Test
    const response = invokeHandler(handler, {
      method: 'GET',
      uri,
    });

    // Assert
    expect(response.uri).toBe(uri);
  });
  test("Given a project URL, resolves the project page", () => {
    // Setup
    const uri = '/project/85c6949c-b36f-4d3a-9cde-fb1f919c6236';
    const expectedUri = '/project/[projectId]/index.html';

    // Test
    const response = invokeHandler(handler, {
      method: 'GET',
      uri,
    });

    // Assert
    expect(response.uri).toBe(expectedUri);
  });
  test("Requesting /project/ does not return the project page", () => {
    // Setup
    const uri = '/project/';

    // Test
    const response = invokeHandler(handler, {
      method: 'GET',
      uri,
    });

    // Assert
    expect(response.uri).toBe(uri);
  });
  test("Requesting the project js bundle does not return the project page", () => {
    // Setup
    const uri = '	/_next/static/chunks/pages/project/%5BprojectId%5D-0eedc2a47e59cb0fe224.js';

    // Test
    const response = invokeHandler(handler, {
      method: 'GET',
      uri,
    });

    // Assert
    expect(response.uri).toBe(uri);
  });
});
