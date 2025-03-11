import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import RatingPage from "./pages/RatingPage";
import { RatingsProvider } from "./context/RatingsContext";
import { ThemeProvider } from "./components/ThemeProvider";

const router = createBrowserRouter(
  // creates a route with the path "/" and the element <h1>My app</h1>
  // pages are still components, but they are wrapped in a Route component
  createRoutesFromElements(
    // any routes put inside the MainLayout will be rendered inside the MainLayout and use the MainLayout component
    <Route path="/" element={<MainLayout />}>
      <Route index element={<HomePage />} />
      <Route path="rating" element={<RatingPage />} />
    </Route>
  )
);

const App = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="sportboxd-theme">
      <RatingsProvider>
        <RouterProvider router={router} />
      </RatingsProvider>
    </ThemeProvider>
  );
};

export default App;
