const fs = require('fs');
const path = require('path');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

//Function to automatically generate the exposes
const getExposes = () => {
  const componentsDir = path.resolve(__dirname, 'src/components');  
  const exposes = {
    './store': './src/state/flightStore.js',
  };
  
  if (fs.existsSync(componentsDir)) {
    fs.readdirSync(componentsDir).forEach(file => {
      const componentsName = `./${path.basename(file, '.js')}`;
      exposes[componentsName] = `./src/components/${file}`;
    });
  }
  
  return exposes;
};

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.js',
  mode: isProduction ? 'production' : 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: isProduction ? '/' : 'http://localhost:3004/',
    filename: isProduction ? '[name].[contenthash].js' : '[name].js',
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react']
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  devServer: {
    port: 3004,
    host: '0.0.0.0',
    allowedHosts: 'all',
    historyApiFallback: true,
    hot: false,
    liveReload: true,
    client: {
      overlay: false,
      logging: 'warn',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
      options: {
        usePolling: true,
        interval: 300,
      },
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'flightApp',
      filename: 'remoteEntry.js',
      exposes: getExposes(),
      remotes: {
        homeApp: 'homeApp@http://localhost:3000/remoteEntry.js'
      },
      shared: { 
        react: { 
            singleton: true,
            eager: true,
            requiredVersion: '^19.0.0',
        }, 
        'react-dom': { 
            singleton: true,
            eager: true,
            requiredVersion: '^19.0.0',
        } 
    },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
