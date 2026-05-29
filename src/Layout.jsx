import { Link, useLocation } from "react-router-dom";
import { BookOpen, Moon, Sun, ShoppingCart, LayoutDashboard } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import { ShoppingList } from "@/api/recipeStore";

export default function Layout({ children }) {
  const location = useLocation();
  const { dark, toggle } = useTheme();
  const cartCount = ShoppingList.load().filter((i) => !i.checked).length;

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-body transition-colors ${
        location.pathname === to
          ? "text-accent font-semibold"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );

  return (
    <div className="min-h-screen bg-background transition-colors duration-200">
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-heading font-bold text-foreground text-lg flex-shrink-0">
            <BookOpen className="w-5 h-5 text-accent" />
            Recipe Book
          </Link>

          {/* Nav links */}
          <nav className="hidden sm:flex items-center gap-6">
            {navLink("/", "Recipes")}
            {navLink("/dashboard", "Dashboard")}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Shopping cart */}
            <Link
              to="/shopping"
              className="relative p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Shopping List"
            >
              <ShoppingCart className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent text-accent-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Dark mode toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title={dark ? "Light mode" : "Dark mode"}
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <div>{children}</div>
    </div>
  );
}
