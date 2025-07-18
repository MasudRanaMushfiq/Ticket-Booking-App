import * as functions from 'firebase-functions';
import axios from 'axios';

export const initiateSSLPayment = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed');
    return;
  }

  try {
    const {
      total_amount,
      tran_id,
      success_url,
      fail_url,
      cancel_url,
      cus_name,
      cus_email,
      cus_add1,
      cus_city,
      cus_postcode,
      cus_country,
      cus_phone,
    } = req.body;

    if (!total_amount || !tran_id || !success_url || !fail_url || !cancel_url) {
      res.status(400).send('Missing required parameters');
      return;
    }

    const store_id = 'your_store_id';
    const store_passwd = 'your_store_password';

    const postData = {
      store_id,
      store_passwd,
      total_amount,
      currency: 'BDT',
      tran_id,
      success_url,
      fail_url,
      cancel_url,
      shipping_method: 'NO',
      product_name: 'Ticket Booking',
      product_category: 'General',
      product_profile: 'general',
      cus_name: cus_name || '',
      cus_email: cus_email || '',
      cus_add1: cus_add1 || '',
      cus_city: cus_city || '',
      cus_postcode: cus_postcode || '',
      cus_country: cus_country || '',
      cus_phone: cus_phone || '',
    };

    const response = await axios.post(
      'https://sandbox.sslcommerz.com/gwprocess/v4/api.php',
      postData
    );

    if (response.data && response.data.GatewayPageURL) {
      res.status(200).json({ payment_url: response.data.GatewayPageURL });
    } else {
      res.status(500).json({ error: 'Failed to get payment URL', data: response.data });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});
