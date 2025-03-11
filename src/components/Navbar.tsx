import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Menu } from "lucide-react";
import { Card } from "./ui/card";
import ModeToggle from "./ModeToggle";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import sportboxdLogo from "../assets/sportboxd.svg";

const Navbar = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <Card className="w-full bg-card py-3 px-6 border-0 rounded-none grid grid-cols-3 items-center shadow-lg">
      {/* Logo - Left */}
      <div className="flex items-center gap-2 justify-start">
        <img
          src={sportboxdLogo}
          alt="Sportboxd Logo"
          className="h-6 w-6 text-primary cursor-pointer"
        />
        <span className="font-bold text-lg text-primary">Sportboxd</span>
      </div>

      {/* Navigation - Center */}
      <ul className="hidden md:flex items-center justify-center gap-10 text-card-foreground">
        <li
          className={`font-medium transition-colors px-2 py-1 rounded ${
            currentPath === "/"
              ? "dark:bg-white dark:text-black bg-[#191970] text-white"
              : "hover:bg-[#191970] hover:text-white dark:hover:bg-white dark:hover:text-black"
          }`}
        >
          <Link to="/">Home</Link>
        </li>
        <li
          className={`font-medium transition-colors px-2 py-1 rounded ${
            currentPath === "/rating"
              ? "dark:bg-white dark:text-black bg-[#191970] text-white"
              : "hover:bg-[#191970] hover:text-white dark:hover:bg-white dark:hover:text-black"
          }`}
        >
          <Link to="/rating">Rating</Link>
        </li>
      </ul>

      {/* Controls - Right 
        Changed, last minute, will fix
      
      */}
      <div className="flex items-center justify-end">
        <div className="md:hidden flex mr-2 items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5 rotate-0 scale-100" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className={
                  currentPath === "/"
                    ? "dark:bg-white dark:text-black bg-[#191970] text-white"
                    : "hover:bg-[#191970] hover:text-white dark:hover:bg-white dark:hover:text-black"
                }
              >
                <Link to="/" className="w-full">
                  Home
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className={
                  currentPath === "/rating"
                    ? "dark:bg-white dark:text-black bg-[#191970] text-white"
                    : "hover:bg-[#191970] hover:text-white dark:hover:bg-white dark:hover:text-black"
                }
              >
                <Link to="/rating" className="w-full">
                  Rating
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <ModeToggle />
      </div>
    </Card>
  );
};

export default Navbar;
