import { NavbarShell } from './NavbarShell';
import { NavLinks } from './NavLinks';
import { CartIcon } from './CartIcon';
import { AuthSlot } from './AuthSlot';

export function Navbar() {
  return (
    <NavbarShell
      links={<NavLinks />}
      cart={<CartIcon count={0} />}
      auth={<AuthSlot />}
    />
  );
}
