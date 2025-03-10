module.exports = {
    webpack: {
      configure: (webpackConfig) => {
        webpackConfig.module.rules.push({
          test: /\.m?js$/,
          include: /node_modules\/chart\.js/, // Path to Chart.js
          use: {
            loader: require.resolve("babel-loader"),
            options: {
              presets: [require.resolve("babel-preset-react-app")],
            },
          },
        });
        return webpackConfig;
      },
    },
  };
  