const authConfig = {
  providers: [
    {
      domain: `https://${process.env.CLERK_HOSTNAME}`,
      applicationID: "convex",
    },
  ],
};

export default authConfig;
