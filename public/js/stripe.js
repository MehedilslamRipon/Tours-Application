import axios from 'axios';
import { showAlert } from './alerts';
const stripe = Stripe('pk_test_51ImxR8SE7SzMFgj1GZwZ33stT6wkMVPNnJQpyd5xXHRys5OBUs5IuncsplrIbVPjgosPoDN1uekoYxh5lbhszFxB00aOac3EAi');

// pk_test_51ImxR8SE7SzMFgj1GZwZ33stT6wkMVPNnJQpyd5xXHRys5OBUs5IuncsplrIbVPjgosPoDN1uekoYxh5lbhszFxB00aOac3EAi

export const bookTour = async (tourId) => {
   try {
      // get the checkout session from API
      const session = await axios(
         `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
      );

      // create checkout form + charge credit card
      await stripe.redirectToCheckout({
         sessionId: session.data.session.id,
      });
   } catch (err) {
      console.log(err);
      showAlert('error', err);
   }
};
