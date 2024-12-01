import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router";
import App, { clientAction } from "./App.tsx";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route index element={<App />} action={clientAction}></Route>
  )
);

const Routes = () => {
  return <RouterProvider router={router}></RouterProvider>;
};

export default Routes;
