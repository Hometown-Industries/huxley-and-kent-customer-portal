const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { faunaFetch } = require('./utils/fauna');

exports.handler = async (_event, context) => {
  const { user } = context.clientContext;

  const result = await faunaFetch({
    query: `
      query ($netlifyID: ID!) {
        getUserByNetlifyID(netlifyID: $netlifyID) {
          stripeID
        }
      }
    `,
    variables: {
      netlifyID: user.sub,
    },
  });

  const { stripeID } = result.data.getUserByNetlifyID;

  const link = await stripe.billingPortal.sessions.create({
    customer: stripeID,
    return_url: process.env.URL,
  });

  // const session = await stripe.billingPortal.sessions.create({
  //   customer: '{{ CUSTOMER_ID }}',
  //   return_url: 'https://example.com/account',
  // });

  return {
    statusCode: 200,
    body: JSON.stringify(link.return_url),
  };
};