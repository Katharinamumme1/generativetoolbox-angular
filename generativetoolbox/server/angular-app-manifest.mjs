
export default {
  bootstrap: () => import('./main.server.mjs').then(m => m.default),
  inlineCriticalCss: true,
  baseHref: '/',
  locale: undefined,
  routes: undefined,
  entryPointToBrowserMapping: {},
  assets: {
    'index.csr.html': {size: 849, hash: '78a6f0e059dd40f940804271c48a26b71ded550209d57afaf261251fe40872f6', text: () => import('./assets-chunks/index_csr_html.mjs').then(m => m.default)},
    'index.server.html': {size: 1014, hash: 'e9e480a418ea8181b965cff9548210a928c2d95e725c6c07da0d571b97dc2a59', text: () => import('./assets-chunks/index_server_html.mjs').then(m => m.default)},
    'styles-OMJYZN57.css': {size: 242, hash: 'zoPrSobBxDQ', text: () => import('./assets-chunks/styles-OMJYZN57_css.mjs').then(m => m.default)}
  },
};
