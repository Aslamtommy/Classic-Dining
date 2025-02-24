const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: 'rzp_test_ihsNz6lracNIu3',
  key_secret: 'f2SAIeZnMz9gBmhNUtCDSLwy',
});

async function testOrder() {
  try {
    console.log('Creating order...');
    const order = await razorpay.orders.create({
      amount: 50000,
      currency: 'INR',
      receipt: 'test_order',
    });
    console.log('Order created:', order);
  } catch (error) {
    console.error('Test error:', error);
  }
}

testOrder();