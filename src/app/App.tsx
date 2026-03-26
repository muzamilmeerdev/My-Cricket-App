import { RouterProvider } from 'react-router';
import { router } from './routes';
import { PinProtection } from './components/PinProtection';

export default function App() {
  return (
    <PinProtection>
      <RouterProvider router={router} />
    </PinProtection>
  );
}