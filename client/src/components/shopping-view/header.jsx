import { HousePlug, LogOut, Menu, ShoppingCart, UserCog, User } from "lucide-react";
import { Globe } from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { useDispatch, useSelector } from "react-redux";
import { shoppingViewHeaderMenuItems } from "@/config";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { logoutUser } from "@/store/auth-slice";
import UserCartWrapper from "./cart-wrapper";
import { useEffect, useState } from "react";
import { fetchCartItems } from "@/store/shop/cart-slice";
import { Label } from "../ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/utils/translations";

function MenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { language } = useLanguage();

  function handleNavigate(getCurrentMenuItem) {
    sessionStorage.removeItem("filters");
    const currentFilter =
      getCurrentMenuItem.id !== "home" &&
      getCurrentMenuItem.id !== "products" &&
      getCurrentMenuItem.id !== "search"
        ? {
            category: [getCurrentMenuItem.id],
          }
        : null;

    sessionStorage.setItem("filters", JSON.stringify(currentFilter));

    location.pathname.includes("listing") && currentFilter !== null
      ? setSearchParams(
          new URLSearchParams(`?category=${getCurrentMenuItem.id}`)
        )
      : navigate(getCurrentMenuItem.path);
  }

  return (
    <nav className="flex flex-col mb-3 lg:mb-0 lg:items-center gap-6 lg:flex-row">
      {shoppingViewHeaderMenuItems.map((menuItem) => (
        <Label
          onClick={() => handleNavigate(menuItem)}
          className="text-sm font-medium cursor-pointer"
          key={menuItem.id}
        >
          {t(menuItem.id, language)}
        </Label>
      ))}
    </nav>
  );
}

function HeaderRightContent() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.shopCart);
  const [openCartSheet, setOpenCartSheet] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { language } = useLanguage();

  function handleLogout() {
    dispatch(logoutUser());
  }

  function handleCartClick() {
    if (!isAuthenticated) {
      // Store current page for redirect after login
      sessionStorage.setItem("redirectAfterLogin", "/shop/checkout");
      navigate("/auth/login");
      return;
    }
    setOpenCartSheet(true);
  }

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      dispatch(fetchCartItems(user.id));
    }
  }, [dispatch, isAuthenticated, user?.id]);

  console.log(cartItems, "sangam");

  return (
    <div className="flex lg:items-center lg:flex-row flex-col gap-4">
      <Sheet open={openCartSheet} onOpenChange={() => setOpenCartSheet(false)}>
        <Button
          onClick={handleCartClick}
          variant="outline"
          size="icon"
          className="relative"
        >
          <ShoppingCart className="w-6 h-6" />
          <span className="absolute top-[-5px] right-[2px] font-bold text-sm">
            {isAuthenticated ? (cartItems?.items?.length || 0) : 0}
          </span>
          <span className="sr-only">User cart</span>
        </Button>
        {isAuthenticated && (
          <UserCartWrapper
            setOpenCartSheet={setOpenCartSheet}
            cartItems={
              cartItems && cartItems.items && cartItems.items.length > 0
                ? cartItems.items
                : []
            }
          />
        )}
      </Sheet>

      {isAuthenticated ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="bg-black cursor-pointer">
              <AvatarFallback className="bg-black text-white font-extrabold">
                {user?.userName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" className="w-56">
            <DropdownMenuLabel>{t('loggedInAs', language)} {user?.userName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/shop/account")}>
              <UserCog className="mr-2 h-4 w-4" />
              {t('account', language)}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              {t('logout', language)}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : (
        <Button
          onClick={() => navigate("/auth/login")}
          variant="default"
          className="flex items-center gap-2"
        >
          <User className="w-4 h-4" />
          {t('login', language)}
        </Button>
      )}
    </div>
  );
}

function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Globe className="w-4 h-4" />
          <span className="sr-only">Change language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" className="w-32">
        <DropdownMenuItem 
          onClick={() => changeLanguage('en')}
          className={language === 'en' ? 'bg-accent' : ''}
        >
          🇺🇸 English
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => changeLanguage('lt')}
          className={language === 'lt' ? 'bg-accent' : ''}
        >
          🇱🇹 Lietuvių
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ShoppingHeader() {
  const { language } = useLanguage();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        <Link to="/shop/home" className="flex items-center gap-2">
          <HousePlug className="h-6 w-6" />
          <span className="font-bold">{t('ecommerce', language)}</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle header menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-xs">
            <MenuItems />
            <div className="mt-4">
              <LanguageSwitcher />
            </div>
            <HeaderRightContent />
          </SheetContent>
        </Sheet>
        <div className="hidden lg:block">
          <MenuItems />
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-4">
          <LanguageSwitcher />
          <HeaderRightContent />
        </div>
      </div>
    </header>
  );
}

export default ShoppingHeader;