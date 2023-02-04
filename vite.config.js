import path from 'path'

export default {
  assetsInclude: ['**/*.mid'],
  resolve:{
    alias:{
      '@' : path.resolve(__dirname, './src')
    },
  },
}
