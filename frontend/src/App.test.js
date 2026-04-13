import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";

test("renders auth page content", () => {
  render(
    <MemoryRouter initialEntries={["/auth"]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>
  );

  expect(screen.getByText(/smart file sharing and collaboration platform/i)).toBeInTheDocument();
});
