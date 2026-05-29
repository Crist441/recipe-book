import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import Layout from "./Layout";
import Home from "./pages/Home";
import AddRecipe from "./pages/AddRecipe";
import RecipeDetail from "./pages/RecipeDetail";
import EditRecipe from "./pages/EditRecipe";
import Dashboard from "./pages/Dashboard";
import ShoppingListPage from "./pages/ShoppingList";

const queryClient = new QueryClient();

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/"          element={<Home />} />
              <Route path="/add"       element={<AddRecipe />} />
              <Route path="/recipe/:id" element={<RecipeDetail />} />
              <Route path="/edit/:id"  element={<EditRecipe />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/shopping"  element={<ShoppingListPage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
