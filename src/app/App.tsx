import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { RouterProvider, type RouterProviderProps } from "react-router";
import { theme } from "../theme/theme";

/** The router is passed in: the browser's history in the app, an in-memory one in tests. */
export const App = ({ router }: { router: RouterProviderProps["router"] }) => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
};
