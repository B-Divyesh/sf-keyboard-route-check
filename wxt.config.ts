import { defineConfig } from 'wxt';

export default defineConfig({
  manifest: {
    name: 'Keyboard Route Check',
    description: 'Record a keyboard route and export possible focus problems.',
    permissions: ['storage', 'tabs', 'downloads'],
    host_permissions: ['<all_urls>'],
    action: { default_title: 'Keyboard Route Check' },
    icons: { '16': '/icon/16.png', '48': '/icon/48.png', '128': '/icon/128.png' }
  }
});
