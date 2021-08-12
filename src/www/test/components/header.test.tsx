import { render } from '@testing-library/react';
import Header from '@app/components/header';

describe("Header component", () => {

  // Simple demonstrative test
  test("Renders correctly", () => {
    // Setup
    const headerItems = ['My Project', 'Home', 'About'];

    // Test
    const { container } = render(<Header />);

    // Assert
    container.querySelectorAll('.navbar-item').forEach((link, index) => {
      expect(link).toHaveTextContent(headerItems[index]);
    });
  });
});
