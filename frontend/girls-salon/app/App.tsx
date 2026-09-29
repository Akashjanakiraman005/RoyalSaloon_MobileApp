import { RouterProvider } from "react-router";
import { router } from "./routes";
import "../styles/index.css";
import "../default_shadcn_theme.css";

export default function App() {
  return (
    <div className="girls-theme min-h-screen bg-background text-foreground">
      <RouterProvider router={router} />
    </div>
  );
}