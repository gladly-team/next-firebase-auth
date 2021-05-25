module.exports = {
  future: {
    webpack5: true,
  },
  async redirects() {
    return [
      {
        // Redirect to another app's home page
        source: '/',
        destination: '/some-other-app',
        permanent: false,
        basePath: false,
      },
    ]
  },
}
