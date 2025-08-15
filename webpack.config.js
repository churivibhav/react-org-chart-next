const { resolve } = require('path')

module.exports = {
  name: '@churivibhav/react-org-chart-next',
  entry: './src/index.js',
  output: {
    filename: 'index.js',
    path: resolve(__dirname, 'dist'),
    library: {
      name: '@churivibhav/react-org-chart-next',
      type: 'commonjs2'
    }
  },
  module: {
    rules: [
      {
        test: /\.js?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-class-properties']
          }
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx']
  },
  externals: {
    d3: {
      commonjs: 'd3',
      commonjs2: 'd3',
      amd: 'd3',
      root: '_'
    },
    react: {
      commonjs: 'react',
      commonjs2: 'react',
      amd: 'react',
      root: '_'
    }
  }
}
