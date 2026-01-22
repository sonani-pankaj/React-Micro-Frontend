const fs = require('fs');
const path = require('path');
const ModuleFederationPlugin = require('webpack').container.ModuleFederationPlugin;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.js',
  mode: isProduction ? 'production' : 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: isProduction ? '/' : 'http://localhost:3000/',
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
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    static: {
      directory: path.join(__dirname, 'public'),
      serveIndex: false,
    },
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    watchFiles: {
      paths: ['src/**/*', 'public/**/*'],
      options: {
        usePolling: true,
      },
    },
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'homeApp',
      filename: 'remoteEntry.js',      
      remotes: {
        'car-app': `promise new Promise(resolve => {
          const remoteUrl = 'http://localhost:3001/remoteEntry.js';
          const script = document.createElement('script');
          script.src = remoteUrl;
          script.onload = () => {
            resolve({
              get: (request) => window.carApp.get(request),
              init: (arg) => { try { return window.carApp.init(arg); } catch(e) { console.log('car-app already initialized'); } }
            });
          };
          script.onerror = () => {
            resolve({
              get: () => Promise.resolve(() => ({ default: () => null })),
              init: () => {}
            });
          };
          document.head.appendChild(script);
        })`,
        'cruise-app': `promise new Promise(resolve => {
          const remoteUrl = 'http://localhost:3002/remoteEntry.js';
          const script = document.createElement('script');
          script.src = remoteUrl;
          script.onload = () => {
            resolve({
              get: (request) => window.cruiseApp.get(request),
              init: (arg) => { try { return window.cruiseApp.init(arg); } catch(e) { console.log('cruise-app already initialized'); } }
            });
          };
          script.onerror = () => {
            resolve({
              get: () => Promise.resolve(() => ({ default: () => null })),
              init: () => {}
            });
          };
          document.head.appendChild(script);
        })`,
        'hotel-app': `promise new Promise(resolve => {
          const remoteUrl = 'http://localhost:3003/remoteEntry.js';
          const script = document.createElement('script');
          script.src = remoteUrl;
          script.onload = () => {
            resolve({
              get: (request) => window.hotelApp.get(request),
              init: (arg) => { try { return window.hotelApp.init(arg); } catch(e) { console.log('hotel-app already initialized'); } }
            });
          };
          script.onerror = () => {
            resolve({
              get: () => Promise.resolve(() => ({ default: () => null })),
              init: () => {}
            });
          };
          document.head.appendChild(script);
        })`
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